import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  reviewText: z.string().trim().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters')
});

interface ReviewFormProps {
  freelancerProfileId: string;
  freelancerUserId: string;
  freelancerName: string;
  proposalId?: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ 
  freelancerProfileId, 
  freelancerUserId, 
  freelancerName,
  proposalId,
  onSuccess 
}: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    reviewText: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!user) {
      toast.error('Please sign in to leave a review');
      navigate('/auth');
      return;
    }

    if (user.id === freelancerUserId) {
      toast.error("You can't review yourself");
      return;
    }

    // Validate form data
    const validation = reviewSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('freelancer_reviews')
        .insert({
          freelancer_profile_id: freelancerProfileId,
          freelancer_user_id: freelancerUserId,
          client_id: user.id,
          proposal_id: proposalId || null,
          rating: formData.rating,
          title: formData.title.trim(),
          review_text: formData.reviewText.trim(),
          is_verified: !!proposalId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this freelancer for this project');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted successfully!');
      setFormData({ rating: 0, title: '', reviewText: '' });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.id === freelancerUserId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {freelancerName}</DialogTitle>
          <DialogDescription>
            Share your experience working with this freelancer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={formData.rating}
                interactive
                size="lg"
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
              {formData.rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {formData.rating === 1 && 'Poor'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 4 && 'Very Good'}
                  {formData.rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="reviewTitle">Review Title *</Label>
            <Input
              id="reviewTitle"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {formData.title.length}/100
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText">Your Review *</Label>
            <Textarea
              id="reviewText"
              placeholder="Tell others about your experience..."
              value={formData.reviewText}
              onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
              rows={4}
              maxLength={1000}
            />
            {errors.reviewText && (
              <p className="text-sm text-destructive">{errors.reviewText}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {formData.reviewText.length}/1000
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
