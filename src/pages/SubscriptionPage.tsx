import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, tiers, loading, isAdminEmail, changeTier } = useSubscription();

  const handleTierChange = async (tierId: string) => {
    await changeTier(tierId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <SEOHead 
        title="Subscription Plans - Choose Your AI Learning Path"
        description="Select the perfect plan for your AI journey. Starter, Creator, and Career tiers with different access levels. Upgrade or downgrade anytime."
        keywords={["AI subscription", "learning plans", "AI course pricing", "subscription tiers", "AI education"]}
      />
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-ai bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan for your AI journey. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Admin Notice */}
          {isAdminEmail && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Admin Access</AlertTitle>
              <AlertDescription>
                You have admin privileges and can switch between tiers without payment.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Subscription Info */}
          {subscription && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle>Your Current Plan</CardTitle>
                <CardDescription>
                  You're currently on the <strong>{subscription.tier?.display_name}</strong> plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tools Access:</span>{' '}
                    <strong>{subscription.tier?.max_tools_access === 999 ? 'Unlimited' : subscription.tier?.max_tools_access}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Marketplace Listings:</span>{' '}
                    <strong>{subscription.tier?.max_listings === 999 ? 'Unlimited' : subscription.tier?.max_listings}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {tiers.map((tier) => (
              <SubscriptionCard
                key={tier.id}
                tier={tier}
                isCurrentTier={subscription?.tier_id === tier.id}
                isAdminEmail={isAdminEmail}
                onSelect={() => handleTierChange(tier.id)}
                loading={loading}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards and payment methods through our secure payment processor.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! The Starter plan is completely free and gives you access to basic features to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
