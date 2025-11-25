import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceDetailsStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onNext: () => void;
}

export const ServiceDetailsStep = ({ formData, updateFormData, onNext }: ServiceDetailsStepProps) => {
  const { categories } = useMarketplace();
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  const handleNext = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a service title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a service description');
      return;
    }
    if (formData.description.length < 50) {
      toast.error('Description must be at least 50 characters');
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
        <CardDescription>Tell clients about your service and what makes you unique</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Service Title *</Label>
          <Input
            id="title"
            placeholder="e.g., AI Chatbot Development for Businesses"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground">{formData.title.length}/80 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Service Category</Label>
          <Select value={formData.category_id} onValueChange={(value) => updateFormData({ category_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Service Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your service in detail. What will you deliver? What's your process? What makes your service unique?"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="min-h-[200px]"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">{formData.description.length}/2000 characters (minimum 50)</p>
        </div>

        <div className="space-y-2">
          <Label>Skills & Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a skill or tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Add relevant skills to help clients find your service</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} size="lg">
            Continue to Pricing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
