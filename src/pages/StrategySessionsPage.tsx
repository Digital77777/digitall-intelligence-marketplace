import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Target, Calendar as CalendarIcon, Clock, Video, CheckCircle2, Crown, User, Loader2, X } from 'lucide-react';
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
}

export default function StrategySessionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<StrategySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

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

  const handleBookSession = async (slot: string) => {
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

    // Check if date is in the past
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

    setBooking(true);
    
    try {
      // Assign a random consultant
      const consultant = consultants[Math.floor(Math.random() * consultants.length)];
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const displayDate = format(selectedDate, 'MMMM d, yyyy');
      
      const { error } = await supabase
        .from('strategy_sessions')
        .insert({
          user_id: user.id,
          session_date: formattedDate,
          session_time: slot,
          consultant,
          status: 'scheduled',
        });

      if (error) throw error;

      // Send email notifications
      try {
        await supabase.functions.invoke('send-session-notification', {
          body: {
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0],
            sessionDate: displayDate,
            sessionTime: slot,
            consultant,
          },
        });
        console.log('Session notification emails sent');
      } catch (emailError) {
        console.error('Failed to send notification emails:', emailError);
        // Don't fail the booking if email fails
      }

      toast({
        title: "Session Booked!",
        description: `Your strategy session is scheduled for ${displayDate} at ${slot} with ${consultant}`,
      });

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
                      onClick={() => handleBookSession(slot)}
                      className="w-full"
                      disabled={booking}
                    >
                      {booking ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
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
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    </div>
                  </div>
                  <div className="flex gap-2">
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
    </div>
  );
}
