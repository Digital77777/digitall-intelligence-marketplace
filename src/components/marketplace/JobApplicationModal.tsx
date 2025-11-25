import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobListing: {
    id: string;
    title: string;
    user_id: string;
  };
}

export const JobApplicationModal = ({ isOpen, onClose, jobListing }: JobApplicationModalProps) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to apply');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get applicant profile
      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      // Get employer profile
      const { data: employerProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', jobListing.user_id)
        .single();

      // Insert job application
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_listing_id: jobListing.id,
          applicant_id: user.id,
          cover_letter: coverLetter,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('You have already applied to this job');
        } else {
          throw insertError;
        }
        return;
      }

      // Send email notifications
      const response = await supabase.functions.invoke('send-job-application-notification', {
        body: {
          job_listing_id: jobListing.id,
          applicant_name: applicantProfile?.full_name || user.email?.split('@')[0] || 'Applicant',
          applicant_email: applicantProfile?.email || user.email,
          job_title: jobListing.title,
          employer_email: employerProfile?.email,
          employer_name: employerProfile?.full_name || 'Employer',
          cover_letter: coverLetter
        }
      });

      if (response.error) {
        console.error('Error sending email:', response.error);
        // Still show success since application was saved
        toast.success('Application submitted! (Email notification may be delayed)');
      } else {
        toast.success('Application submitted successfully! Email notifications sent.');
      }

      setCoverLetter('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {jobListing.title}</DialogTitle>
          <DialogDescription>
            Submit your application. The employer will be notified via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit for this position..."
              className="min-h-32"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
