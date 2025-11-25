import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= displayRating;
          const isHalf = !isFilled && starIndex - 0.5 <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "focus:outline-none transition-transform",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled && "fill-yellow-400 text-yellow-400",
                  isHalf && "fill-yellow-400/50 text-yellow-400",
                  !isFilled && !isHalf && "text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && rating > 0 && (
        <span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
