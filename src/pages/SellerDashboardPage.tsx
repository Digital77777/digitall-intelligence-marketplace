import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickStats } from '@/components/tier/shared/QuickStats';
import ProposalsList from '@/components/marketplace/ProposalsList';
import { Package, DollarSign, MessageSquare, TrendingUp, Plus, Eye, Edit, User, MapPin, Clock, Briefcase, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
}

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  hourly_rate: number;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  availability: string;
  profile_picture: string;
  is_active: boolean;
}

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalEarnings: 0,
    unreadMessages: 0,
    totalViews: 0,
    pendingProposals: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch freelancer profile
      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }
      
      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      setListings(listingsData || []);

      // Calculate stats
      const activeListings = listingsData?.filter(l => l.status === 'active').length || 0;

      // Fetch unread messages count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);

      // Fetch pending proposals count
      const { count: proposalsCount } = await supabase
        .from('freelancer_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_user_id', user?.id)
        .eq('status', 'pending');

      setStats({
        totalListings: listingsData?.length || 0,
        activeListings,
        totalEarnings: 0, // Placeholder for earnings integration
        unreadMessages: unreadCount || 0,
        totalViews: 0, // Placeholder for views tracking
        pendingProposals: proposalsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'sold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const quickStats = [
    {
      value: stats.activeListings.toString(),
      label: 'Active Listings',
      icon: <Package className="h-8 w-8 text-primary" />,
    },
    {
      value: stats.pendingProposals.toString(),
      label: 'Pending Proposals',
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      value: `R${stats.totalEarnings.toFixed(2)}`,
      label: 'Total Earnings',
      icon: <DollarSign className="h-8 w-8 text-primary" />,
    },
    {
      value: stats.unreadMessages.toString(),
      label: 'Unread Messages',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pb-24 md:pb-12">
      <SEOHead
        title="Seller Dashboard - Track Your Sales"
        description="Manage your marketplace listings, track earnings, and monitor performance analytics"
        keywords={["seller dashboard", "marketplace", "earnings", "analytics"]}
      />
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your listings and performance
            </p>
          </div>
          <Button onClick={() => navigate('/create-listing')}>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>

        {/* Freelancer Profile Card */}
        {profile ? (
          <Card className="mb-8 overflow-hidden border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Freelancer Profile
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/marketplace/create-freelancer-profile')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Badge variant={profile.is_active ? "default" : "secondary"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    <AvatarImage src={profile.profile_picture} alt={profile.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                    <p className="text-lg text-muted-foreground">{profile.title}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">${profile.hourly_rate}/hr</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.availability && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 6 && (
                      <Badge variant="outline">
                        +{profile.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-dashed">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Create Your Freelancer Profile</h3>
              <p className="text-muted-foreground mb-4">
                Set up your profile to start offering freelance services and attract clients
              </p>
              <Button onClick={() => navigate('/marketplace/create-freelancer-profile')}>
                <User className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        <QuickStats stats={quickStats} />

        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proposals">
              Proposals
              {stats.pendingProposals > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {stats.pendingProposals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Proposals
                </CardTitle>
                <CardDescription>
                  Review and respond to project proposals from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProposalsList type="received" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  Manage all your marketplace listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No listings yet</p>
                    <Button onClick={() => navigate('/create-listing')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.title}</TableCell>
                          <TableCell>
                            {listing.currency} {listing.price?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(listing.status)}>
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/edit-listing/${listing.id}`)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Track your listings performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-3xl font-bold">{stats.totalListings}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-3xl font-bold text-green-500">{stats.activeListings}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold">{stats.totalViews}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg. Views per Listing</p>
                    <p className="text-3xl font-bold">
                      {stats.totalListings > 0 ? (stats.totalViews / stats.totalListings).toFixed(1) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Messages
                </CardTitle>
                <CardDescription>
                  {stats.unreadMessages > 0
                    ? `You have ${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? 's' : ''}`
                    : 'All caught up!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/community/inbox')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Inbox
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
