import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MediaUploader } from '@/components/media/MediaUploader';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface RequirementsPortfolioStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const RequirementsPortfolioStep = ({ formData, updateFormData, onNext, onPrevious }: RequirementsPortfolioStepProps) => {
  const handleNext = () => {
    if (!formData.requirements.trim()) {
      toast.error('Please specify what you need from clients to get started');
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements & Portfolio</CardTitle>
        <CardDescription>Specify what you need from clients and showcase your work</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="requirements">Client Requirements *</Label>
          <Textarea
            id="requirements"
            placeholder="What information or materials do you need from clients to deliver this service?&#10;&#10;Example:&#10;• Project brief and goals&#10;• Brand guidelines&#10;• Access to relevant systems&#10;• Existing codebase (if applicable)"
            value={formData.requirements}
            onChange={(e) => updateFormData({ requirements: e.target.value })}
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground">
            Clear requirements help set expectations and speed up project delivery
          </p>
        </div>

        <div className="space-y-2">
          <Label>Portfolio Samples (Optional)</Label>
          <MediaUploader
            images={formData.portfolio.images}
            videos={formData.portfolio.videos}
            onImagesChange={(images) => updateFormData({ portfolio: { ...formData.portfolio, images } })}
            onVideosChange={(videos) => updateFormData({ portfolio: { ...formData.portfolio, videos } })}
            maxImages={5}
            maxVideos={2}
            maxFileSize={10}
          />
          <p className="text-xs text-muted-foreground">
            Showcase your previous work to build trust with potential clients
          </p>
        </div>

        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="font-semibold mb-2">📸 Portfolio Best Practices</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Show your best and most relevant work</li>
            <li>• Include before/after examples if applicable</li>
            <li>• Explain your role and the outcome achieved</li>
            <li>• Ensure you have permission to share client work</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onPrevious} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} size="lg">
            Review Listing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
