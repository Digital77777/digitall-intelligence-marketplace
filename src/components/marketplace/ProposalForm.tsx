import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Send, DollarSign, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalFormProps {
  freelancerProfileId: string;
  freelancerUserId: string;
  freelancerName: string;
  hourlyRate: number;
  onSuccess?: () => void;
}

const ProposalForm = ({ 
  freelancerProfileId, 
  freelancerUserId, 
  freelancerName,
  hourlyRate,
  onSuccess 
}: ProposalFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    budgetType: 'fixed' as 'fixed' | 'hourly',
    budgetAmount: '',
    estimatedHours: '',
    timeline: '',
    deadline: undefined as Date | undefined,
    clientMessage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to send a proposal');
      navigate('/auth');
      return;
    }

    if (user.id === freelancerUserId) {
      toast.error("You can't send a proposal to yourself");
      return;
    }

    if (!formData.projectTitle.trim() || !formData.projectDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budgetAmount = parseFloat(formData.budgetAmount);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('freelancer_proposals')
        .insert({
          freelancer_profile_id: freelancerProfileId,
          freelancer_user_id: freelancerUserId,
          client_id: user.id,
          project_title: formData.projectTitle.trim(),
          project_description: formData.projectDescription.trim(),
          budget_type: formData.budgetType,
          budget_amount: budgetAmount,
          estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          timeline: formData.timeline.trim() || 'To be discussed',
          deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : null,
          client_message: formData.clientMessage.trim() || null
        });

      if (error) throw error;

      toast.success('Proposal sent successfully!');
      setFormData({
        projectTitle: '',
        projectDescription: '',
        budgetType: 'fixed',
        budgetAmount: '',
        estimatedHours: '',
        timeline: '',
        deadline: undefined,
        clientMessage: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast.error('Failed to send proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Sign in to send a project proposal</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (user.id === freelancerUserId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Send Project Proposal
        </CardTitle>
        <CardDescription>
          Describe your project to {freelancerName.split(' ')[0]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title *</Label>
            <Input
              id="projectTitle"
              placeholder="e.g., AI Chatbot for Customer Support"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your project requirements, goals, and any specific features you need..."
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Budget Type */}
          <div className="space-y-3">
            <Label>Budget Type *</Label>
            <RadioGroup
              value={formData.budgetType}
              onValueChange={(value: 'fixed' | 'hourly') => 
                setFormData({ ...formData, budgetType: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="hourly" />
                <Label htmlFor="hourly" className="cursor-pointer">Hourly Rate</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Budget Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">
                {formData.budgetType === 'fixed' ? 'Total Budget ($) *' : 'Hourly Rate ($) *'}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder={formData.budgetType === 'hourly' ? String(hourlyRate) : '1000'}
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  className="pl-9"
                  min="1"
                  required
                />
              </div>
              {formData.budgetType === 'hourly' && (
                <p className="text-xs text-muted-foreground">
                  Freelancer's rate: ${hourlyRate}/hr
                </p>
              )}
            </div>

            {formData.budgetType === 'hourly' && (
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="40"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    className="pl-9"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Project Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g., 2-3 weeks"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Deadline (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData({ ...formData, deadline: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Additional Message */}
          <div className="space-y-2">
            <Label htmlFor="clientMessage">Additional Message (Optional)</Label>
            <Textarea
              id="clientMessage"
              placeholder="Any additional information or questions for the freelancer..."
              value={formData.clientMessage}
              onChange={(e) => setFormData({ ...formData, clientMessage: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                Sending Proposal...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProposalForm;
