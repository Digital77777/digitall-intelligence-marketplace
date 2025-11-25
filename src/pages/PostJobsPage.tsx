import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Briefcase, Users, TrendingUp, Lock, Crown } from 'lucide-react';
import { useTier } from '@/contexts/TierContext';
import { useAuth } from '@/hooks/useAuth';

const PostJobsPage = () => {
  const navigate = useNavigate();
  const { canAccessFeature, tierName, loading } = useTier();
  const { user } = useAuth();

  const canPostJobs = canAccessFeature('post_jobs');

  // Show sign in prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access job posting features.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if not Creator or Career tier
  if (!loading && !canPostJobs) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Upgrade to Post Jobs</h1>
            <p className="text-lg text-muted-foreground">
              Job posting is available for Creator and Career tier members. Upgrade your subscription to connect with talented AI professionals.
            </p>
          </div>

          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Post Unlimited Jobs</h3>
                  <p className="text-sm text-muted-foreground">Reach thousands of AI professionals</p>
                </div>
                <div className="text-center p-4">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Quality Candidates</h3>
                  <p className="text-sm text-muted-foreground">Access verified talent pool</p>
                </div>
                <div className="text-center p-4">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Hiring Tools</h3>
                  <p className="text-sm text-muted-foreground">Manage applications easily</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/subscription')}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/marketplace')}
            >
              Back to Marketplace
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Current tier: <span className="font-medium capitalize">{tierName || 'Starter'}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Post Job Opportunities</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with talented AI professionals and find the perfect match for your projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Quality Talent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Access a curated pool of AI experts, data scientists, and machine learning engineers
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Easy Hiring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Streamlined posting process with built-in applicant management and communication tools
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Fast Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get qualified applications within 24 hours of posting your job opportunity
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => navigate('/create-job-posting')}
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default PostJobsPage;
