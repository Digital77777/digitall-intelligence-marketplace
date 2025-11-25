import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickStats } from '@/components/tier/shared/QuickStats';
import { Package, DollarSign, MessageSquare, TrendingUp, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  
}

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalEarnings: 0,
    unreadMessages: 0,
    totalViews: 0,
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

      setStats({
        totalListings: listingsData?.length || 0,
        activeListings,
        totalEarnings: 0, // Placeholder for earnings integration
        unreadMessages: unreadCount || 0,
        totalViews: 0, // Placeholder for views tracking
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
      value: `R${stats.totalEarnings.toFixed(2)}`,
      label: 'Total Earnings',
      icon: <DollarSign className="h-8 w-8 text-primary" />,
    },
    {
      value: stats.unreadMessages.toString(),
      label: 'Unread Messages',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
    },
    {
      value: stats.totalViews.toString(),
      label: 'Total Views',
      icon: <Eye className="h-8 w-8 text-primary" />,
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

        <QuickStats stats={quickStats} />

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

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
