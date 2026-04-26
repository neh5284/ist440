import { Star } from "lucide-react";
import { useState } from "react";

interface RatingWidgetProps {
  initialRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingWidget({ initialRating = 0, onRate, readonly = false, size = "md" }: RatingWidgetProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (readonly) return;
    const newRating = value === rating ? 0 : value;
    setRating(newRating);
    onRate?.(newRating);
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating);
        const isHalf = !isFilled && value - 0.5 === (hoverRating || rating);

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`transition-transform ${!readonly && 'hover:scale-110'} ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`${starSize} transition-colors ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalf
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-neutral-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
