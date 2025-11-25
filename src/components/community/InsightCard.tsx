import React, { memo, useCallback } from "react";
import { Heart, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { CommunityInsight } from "@/types/community";
import { EnhancedImage } from "@/components/media/EnhancedImage";

interface InsightCardProps {
  insight: CommunityInsight;
  onLikeClick: (insightId: string, isLiked: boolean, category?: string) => Promise<void>;
  onViewClick: (insight: CommunityInsight) => void;
  getInitials: (name: string | undefined, email: string | undefined) => string;
}

export const InsightCard = memo(({ insight, onLikeClick, onViewClick, getInitials }: InsightCardProps) => {
  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onLikeClick(insight.id, insight.is_liked || false, insight.category);
  }, [insight.id, insight.is_liked, insight.category, onLikeClick]);

  const handleCardClick = useCallback(() => {
    onViewClick(insight);
  }, [insight, onViewClick]);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden max-w-full"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {insight.cover_image && (
          <div className="w-full relative overflow-hidden">
            <EnhancedImage 
              src={insight.cover_image} 
              alt={insight.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        {!insight.cover_image && insight.videos && insight.videos.length > 0 && (
          <div className="w-full relative overflow-hidden">
            <video 
              src={insight.videos[0]} 
              controls
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {getInitials(insight.profiles?.full_name, insight.profiles?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {insight.profiles?.full_name || insight.profiles?.email || "Anonymous"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {insight.category}
                </Badge>
                {insight.read_time && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {insight.read_time}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2 leading-tight line-clamp-2">
            {insight.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {insight.content.substring(0, 120)}...
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{insight.views_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{insight.likes_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={insight.is_liked ? "default" : "outline"}
                className="h-8 text-sm px-3"
                onClick={handleLikeClick}
              >
                <Heart className={`w-4 h-4 mr-1.5 ${insight.is_liked ? 'fill-current' : ''}`} />
                {insight.is_liked ? 'Liked' : 'Like'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-sm px-3"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Read
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.insight.id === nextProps.insight.id &&
    prevProps.insight.likes_count === nextProps.insight.likes_count &&
    prevProps.insight.views_count === nextProps.insight.views_count &&
    prevProps.insight.is_liked === nextProps.insight.is_liked
  );
});

InsightCard.displayName = "InsightCard";