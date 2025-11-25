import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Calendar as CalendarIcon, Clock, Video, CheckCircle2, Crown, User, Loader2, X, FileText, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface StrategySession {
  id: string;
  session_date: string;
  session_time: string;
  topic: string | null;
  consultant: string | null;
  meeting_link: string | null;
  status: string;
  notes: string | null;
}

export default function StrategySessionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<StrategySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<StrategySession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('');
  const [rescheduling, setRescheduling] = useState(false);

  const availableSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const consultants = [
    'Dr. Michael Chen',
    'Emma Rodriguez',
    'James Thompson',
    'Sarah Williams'
  ];

  const sessionTopics = [
    'Revenue optimization and growth strategies',
    'AI tool selection and workflow optimization',
    'Marketplace positioning and scaling',
    'Referral program maximization',
    'Personal brand building in AI space',
    'Career advancement and networking'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSessions();
  }, [user, navigate]);

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load your sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openBookingDialog = (slot: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Select a date",
        description: "Please select a date for your session",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast({
        title: "Invalid date",
        description: "Please select a future date",
        variant: "destructive",
      });
      return;
    }

    setSelectedSlot(slot);
    setSelectedTopic('');
    setSessionNotes('');
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedDate || !selectedSlot) return;

    setBooking(true);
    
    try {
      const consultant = consultants[Math.floor(Math.random() * consultants.length)];
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const displayDate = format(selectedDate, 'MMMM d, yyyy');
      
      const { error } = await supabase
        .from('strategy_sessions')
        .insert({
          user_id: user.id,
          session_date: formattedDate,
          session_time: selectedSlot,
          consultant,
          topic: selectedTopic || null,
          notes: sessionNotes || null,
          status: 'scheduled',
        });

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-session-notification', {
          body: {
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0],
            sessionDate: displayDate,
            sessionTime: selectedSlot,
            consultant,
            topic: selectedTopic || 'General Strategy Consultation',
          },
        });
      } catch (emailError) {
        console.error('Failed to send notification emails:', emailError);
      }

      toast({
        title: "Session Booked!",
        description: `Your strategy session is scheduled for ${displayDate} at ${selectedSlot} with ${consultant}`,
      });

      setBookingDialogOpen(false);
      fetchSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking failed",
        description: "Failed to book your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const openRescheduleDialog = (session: StrategySession) => {
    setRescheduleSession(session);
    setRescheduleDate(new Date(session.session_date));
    setRescheduleSlot(session.session_time);
    setRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!user || !rescheduleSession || !rescheduleDate || !rescheduleSlot) return;

    setRescheduling(true);
    
    try {
      const formattedDate = format(rescheduleDate, 'yyyy-MM-dd');
      const displayDate = format(rescheduleDate, 'MMMM d, yyyy');
      
      const { error } = await supabase
        .from('strategy_sessions')
        .update({
          session_date: formattedDate,
          session_time: rescheduleSlot,
        })
        .eq('id', rescheduleSession.id);

      if (error) throw error;

      toast({
        title: "Session Rescheduled!",
        description: `Your session has been moved to ${displayDate} at ${rescheduleSlot}`,
      });

      setRescheduleDialogOpen(false);
      setRescheduleSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast({
        title: "Reschedule failed",
        description: "Failed to reschedule your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('strategy_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session cancelled",
        description: "Your session has been cancelled",
      });

      fetchSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Target className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Strategy Sessions</h1>
          <p className="text-muted-foreground">Monthly consultations to optimize your AI career</p>
        </div>
        <Badge variant="default" className="ml-auto">Career Tier</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Book Your Next Session</CardTitle>
            <CardDescription>Schedule a 1-on-1 consultation with our expert strategists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>

              <div>
                <h3 className="font-semibold mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant="outline"
                      onClick={() => openBookingDialog(slot)}
                      className="w-full"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Video Consultation</h4>
                  <p className="text-sm text-muted-foreground">
                    All sessions are conducted via secure video call. You'll receive a meeting link 24 hours before your session.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Session Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Monthly 45-min sessions',
                'Expert career strategists',
                'Personalized action plans',
                'Follow-up resources',
                'Priority booking'
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sessionTopics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{topic}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled strategy consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.topic || 'Strategy Consultation'}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(session.session_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.session_time}
                        </span>
                        {session.consultant && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.consultant}
                          </span>
                        )}
                        <Badge variant="outline">Video Call</Badge>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-muted-foreground flex items-start gap-1">
                          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{session.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openRescheduleDialog(session)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelSession(session.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button variant="default" size="sm">
                      Join Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions. Book your first consultation above!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              {selectedDate && selectedSlot && (
                <>Booking for {format(selectedDate, 'MMMM d, yyyy')} at {selectedSlot}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Session Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic for your session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the main focus area for your consultation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Questions (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Share any specific questions or topics you'd like to discuss during the session..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Help your consultant prepare by sharing what you'd like to achieve
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={booking}>
              {booking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              {rescheduleSession && (
                <>Select a new date and time for your session with {rescheduleSession.consultant}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={setRescheduleDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>
              
              <div className="space-y-2">
                <Label>New Time Slot</Label>
                <div className="grid grid-cols-1 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={rescheduleSlot === slot ? "default" : "outline"}
                      onClick={() => setRescheduleSlot(slot)}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {rescheduleDate && rescheduleSlot && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>New Schedule:</strong> {format(rescheduleDate, 'MMMM d, yyyy')} at {rescheduleSlot}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReschedule} 
              disabled={rescheduling || !rescheduleDate || !rescheduleSlot}
            >
              {rescheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                'Confirm Reschedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
