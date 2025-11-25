import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, DollarSign, Clock, FileText, Image as ImageIcon } from 'lucide-react';

interface ReviewPublishStepProps {
  formData: any;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const ReviewPublishStep = ({ formData, onSubmit, onPrevious, isSubmitting }: ReviewPublishStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Publish</CardTitle>
        <CardDescription>Review your service listing before publishing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Overview */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{formData.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </h4>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Basic Package</span>
              <span className="text-lg font-bold">${formData.pricing.basic.price}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Clock className="h-3 w-3" />
              {formData.pricing.basic.delivery_time} day{formData.pricing.basic.delivery_time !== 1 ? 's' : ''} delivery
            </div>
            <p className="text-sm whitespace-pre-wrap">{formData.pricing.basic.description}</p>
          </div>
        </div>

        <Separator />

        {/* Requirements */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Client Requirements
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.requirements}</p>
        </div>

        {/* Portfolio */}
        {(formData.portfolio.images.length > 0 || formData.portfolio.videos.length > 0) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Portfolio
              </h4>
              <div className="text-sm text-muted-foreground">
                {formData.portfolio.images.length} image{formData.portfolio.images.length !== 1 ? 's' : ''}
                {formData.portfolio.videos.length > 0 &&
                  `, ${formData.portfolio.videos.length} video${formData.portfolio.videos.length !== 1 ? 's' : ''}`}
              </div>
            </div>
          </>
        )}

        {/* Success Message */}
        <div className="bg-success/10 rounded-lg p-4">
          <h4 className="font-semibold text-success mb-2">🎉 Ready to Publish!</h4>
          <p className="text-sm text-muted-foreground">
            Your service will be visible to thousands of potential clients. You can edit or pause your listing at any time.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onPrevious} variant="outline" size="lg" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onSubmit} size="lg" disabled={isSubmitting} className="bg-gradient-earn hover:opacity-90">
            {isSubmitting ? 'Publishing...' : 'Publish Service'}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
