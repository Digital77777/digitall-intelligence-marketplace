import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { format } from 'date-fns';
import { CheckCircle, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified: boolean;
  created_at: string;
  client_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  freelancerProfileId: string;
  onReviewsLoaded?: (stats: { averageRating: number; totalReviews: number }) => void;
}

const ReviewsList = ({ freelancerProfileId, onReviewsLoaded }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    loadReviews();
  }, [freelancerProfileId]);

  const loadReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('freelancer_reviews')
        .select('*')
        .eq('freelancer_profile_id', freelancerProfileId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch client profiles for reviews
      if (reviewsData && reviewsData.length > 0) {
        const clientIds = [...new Set(reviewsData.map(r => r.client_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', clientIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, p]) || []
        );

        const reviewsWithProfiles = reviewsData.map(review => ({
          ...review,
          profiles: profilesMap.get(review.client_id) || null
        }));

        setReviews(reviewsWithProfiles);

        // Calculate stats
        const totalReviews = reviewsData.length;
        const averageRating = totalReviews > 0
          ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

        setStats({ averageRating: Math.round(averageRating * 10) / 10, totalReviews });
        onReviewsLoaded?.({ averageRating, totalReviews });
      } else {
        setReviews([]);
        setStats({ averageRating: 0, totalReviews: 0 });
        onReviewsLoaded?.({ averageRating: 0, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      distribution[r.rating - 1]++;
    });
    return distribution.reverse();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>No reviews yet</p>
        <p className="text-sm mt-1">Be the first to leave a review!</p>
      </div>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
          <StarRating rating={stats.averageRating} size="md" />
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star, index) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs w-3">{star}</span>
              <StarRating rating={1} maxRating={1} size="sm" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{
                    width: stats.totalReviews > 0
                      ? `${(distribution[index] / stats.totalReviews) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {distribution[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(review.profiles?.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {review.profiles?.full_name || 'Anonymous'}
                    </span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h4 className="font-medium mt-3 text-foreground">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {review.review_text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
