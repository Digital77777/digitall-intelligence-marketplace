import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import MobileFooter from '@/components/MobileFooter';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Send,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  profile_picture: string | null;
  hourly_rate: number;
}

interface Proposal {
  id: string;
  project_title: string;
  project_description: string;
  budget_type: string;
  budget_amount: number;
  timeline: string;
  deadline: string | null;
  status: string;
  created_at: string;
  freelancer_response: string | null;
  responded_at: string | null;
  freelancer_profile_id: string;
  freelancer_user_id: string;
  freelancer?: FreelancerProfile;
}

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadProposals();
    }
  }, [user, authLoading, navigate]);

  const loadProposals = async () => {
    if (!user) return;
    
    try {
      // Fetch proposals sent by this client
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('freelancer_proposals')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      if (proposalsData && proposalsData.length > 0) {
        // Fetch freelancer profiles for all proposals
        const profileIds = [...new Set(proposalsData.map(p => p.freelancer_profile_id))];
        const { data: profilesData } = await supabase
          .from('freelancer_profiles')
          .select('id, name, title, profile_picture, hourly_rate')
          .in('id', profileIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const proposalsWithFreelancers = proposalsData.map(proposal => ({
          ...proposal,
          freelancer: profilesMap.get(proposal.freelancer_profile_id)
        }));

        setProposals(proposalsWithFreelancers);
      } else {
        setProposals([]);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFilteredProposals = (tab: string) => {
    if (tab === 'all') return proposals;
    if (tab === 'active') return proposals.filter(p => ['pending', 'accepted'].includes(p.status));
    return proposals.filter(p => p.status === tab);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    completed: proposals.filter(p => p.status === 'completed').length
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="Client Dashboard - Track Your Projects"
        description="Track your sent proposals, manage hired freelancers, and monitor project progress."
        keywords={["client dashboard", "freelancer proposals", "project tracking"]}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Track your proposals and manage hired freelancers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Proposals</CardTitle>
            <CardDescription>View and track all proposals you've sent to freelancers</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.pending + stats.accepted})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {getFilteredProposals(activeTab).length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing freelancers to find the perfect match for your project
                    </p>
                    <Button onClick={() => navigate('/marketplace/browse-freelancers')}>
                      <User className="h-4 w-4 mr-2" />
                      Browse Freelancers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredProposals(activeTab).map((proposal) => (
                      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Freelancer Info */}
                            <div className="flex items-start gap-3 md:w-1/4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={proposal.freelancer?.profile_picture || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {proposal.freelancer ? getInitials(proposal.freelancer.name) : 'FL'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {proposal.freelancer?.name || 'Freelancer'}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {proposal.freelancer?.title || 'AI Professional'}
                                </p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => navigate(`/marketplace/freelancer/${proposal.freelancer_profile_id}`)}
                                >
                                  View Profile <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>

                            {/* Project Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold">{proposal.project_title}</h4>
                                {getStatusBadge(proposal.status)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {proposal.project_description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-4 w-4" />
                                  ${proposal.budget_amount} ({proposal.budget_type})
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {proposal.timeline}
                                </span>
                                {proposal.deadline && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Due: {format(new Date(proposal.deadline), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Sent {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 md:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/community/inbox?user=${proposal.freelancer_user_id}`)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>

                          {/* Freelancer Response */}
                          {proposal.freelancer_response && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Freelancer Response:</p>
                              <p className="text-sm text-muted-foreground">{proposal.freelancer_response}</p>
                              {proposal.responded_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Responded {format(new Date(proposal.responded_at), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <MobileFooter />
    </div>
  );
};

export default ClientDashboardPage;