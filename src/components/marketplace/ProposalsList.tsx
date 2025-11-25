import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  User,
  Inbox
} from 'lucide-react';

interface Proposal {
  id: string;
  freelancer_profile_id: string;
  freelancer_user_id: string;
  client_id: string;
  project_title: string;
  project_description: string;
  budget_type: string;
  budget_amount: number;
  estimated_hours: number | null;
  timeline: string;
  deadline: string | null;
  status: string;
  client_message: string | null;
  freelancer_response: string | null;
  responded_at: string | null;
  created_at: string;
}

interface ProposalsListProps {
  type: 'received' | 'sent';
}

const ProposalsList = ({ type }: ProposalsListProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [responseAction, setResponseAction] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    if (user) {
      loadProposals();
    }
  }, [user, type]);

  const loadProposals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const query = supabase
        .from('freelancer_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (type === 'received') {
        query.eq('freelancer_user_id', user.id);
      } else {
        query.eq('client_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status: 'accepted' | 'rejected') => {
    if (!selectedProposal || !user) return;

    setIsResponding(true);
    try {
      const { error } = await supabase
        .from('freelancer_proposals')
        .update({
          status,
          freelancer_response: responseText.trim() || null,
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedProposal.id);

      if (error) throw error;

      toast.success(`Proposal ${status}`);
      setSelectedProposal(null);
      setResponseText('');
      setResponseAction(null);
      loadProposals();
    } catch (error) {
      console.error('Error responding to proposal:', error);
      toast.error('Failed to respond to proposal');
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      accepted: { variant: 'default', label: 'Accepted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' }
    };

    const { variant, label } = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {type === 'received' ? 'No proposals received yet' : 'No proposals sent yet'}
          </h3>
          <p className="text-muted-foreground">
            {type === 'received' 
              ? 'When clients send you project proposals, they will appear here'
              : 'When you send proposals to freelancers, they will appear here'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{proposal.project_title}</CardTitle>
                  <CardDescription className="mt-1">
                    {format(new Date(proposal.created_at), 'PPP')}
                  </CardDescription>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {proposal.project_description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    ${proposal.budget_amount}
                  </span>
                  <span>({proposal.budget_type})</span>
                </div>

                {proposal.estimated_hours && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{proposal.estimated_hours} hours</span>
                  </div>
                )}

                {proposal.deadline && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(proposal.deadline), 'PP')}</span>
                  </div>
                )}
              </div>

              {proposal.client_message && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </div>
                  <p className="text-sm text-muted-foreground">{proposal.client_message}</p>
                </div>
              )}

              {proposal.freelancer_response && (
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <User className="h-4 w-4" />
                    Response
                  </div>
                  <p className="text-sm text-muted-foreground">{proposal.freelancer_response}</p>
                </div>
              )}

              {type === 'received' && proposal.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setResponseAction('accept');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setResponseAction('reject');
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Dialog */}
      <Dialog open={!!selectedProposal && !!responseAction} onOpenChange={() => {
        setSelectedProposal(null);
        setResponseAction(null);
        setResponseText('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'accept' ? 'Accept Proposal' : 'Decline Proposal'}
            </DialogTitle>
            <DialogDescription>
              {responseAction === 'accept' 
                ? 'Accept this project proposal and start working with the client'
                : 'Decline this proposal. You can provide a reason to the client.'}
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedProposal.project_title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  ${selectedProposal.budget_amount} ({selectedProposal.budget_type})
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Response Message (Optional)
                </label>
                <Textarea
                  placeholder={responseAction === 'accept' 
                    ? "Thanks for your proposal! I'm excited to work on this project..."
                    : "Thank you for considering me, but I'm unable to take on this project at the moment..."}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedProposal(null);
                setResponseAction(null);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={responseAction === 'accept' ? 'default' : 'destructive'}
              onClick={() => handleResponse(responseAction === 'accept' ? 'accepted' : 'rejected')}
              disabled={isResponding}
            >
              {isResponding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                  Processing...
                </>
              ) : responseAction === 'accept' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Proposal
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Proposal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProposalsList;
