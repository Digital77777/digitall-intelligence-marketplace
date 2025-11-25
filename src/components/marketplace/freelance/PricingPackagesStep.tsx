import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PricingPackagesStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PricingPackagesStep = ({ formData, updateFormData, onNext, onPrevious }: PricingPackagesStepProps) => {
  const handleNext = () => {
    if (!formData.pricing.basic.price || formData.pricing.basic.price <= 0) {
      toast.error('Please set a price for the basic package');
      return;
    }
    if (!formData.pricing.basic.description.trim()) {
      toast.error('Please describe what the basic package includes');
      return;
    }
    if (!formData.pricing.basic.delivery_time || formData.pricing.basic.delivery_time <= 0) {
      toast.error('Please set a delivery time for the basic package');
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Packages</CardTitle>
        <CardDescription>Define your service packages and pricing structure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Package */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Basic Package</h3>
            <Badge>Required</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic-price">Price (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="basic-price"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  className="pl-9"
                  value={formData.pricing.basic.price || ''}
                  onChange={(e) =>
                    updateFormData({
                      pricing: {
                        ...formData.pricing,
                        basic: { ...formData.pricing.basic, price: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basic-delivery">Delivery Time (days) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="basic-delivery"
                  type="number"
                  min="1"
                  placeholder="7"
                  className="pl-9"
                  value={formData.pricing.basic.delivery_time || ''}
                  onChange={(e) =>
                    updateFormData({
                      pricing: {
                        ...formData.pricing,
                        basic: { ...formData.pricing.basic, delivery_time: parseInt(e.target.value) || 1 },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="basic-description">What's Included *</Label>
            <Textarea
              id="basic-description"
              placeholder="• Feature 1&#10;• Feature 2&#10;• Feature 3"
              value={formData.pricing.basic.description}
              onChange={(e) =>
                updateFormData({
                  pricing: {
                    ...formData.pricing,
                    basic: { ...formData.pricing.basic, description: e.target.value },
                  },
                })
              }
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Pricing Tips */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💡 Pricing Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Research competitor pricing in your niche</li>
            <li>• Start competitive and adjust based on demand</li>
            <li>• Consider your experience level and deliverable quality</li>
            <li>• Include revisions and support in your package</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onPrevious} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
