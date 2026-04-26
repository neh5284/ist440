import { Star, User, ThumbsUp, MoreVertical, Trash2, Edit } from "lucide-react";
import { Review } from "../lib/reviews";
import { useState } from "react";

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
}

export function ReviewCard({ review, currentUserId, onDelete, onEdit }: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOwnReview = currentUserId === review.userId;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return hours === 0 ? "Just now" : `${hours}h ago`;
      } else if (diffInHours < 168) {
        const days = Math.floor(diffInHours / 24);
        return `${days}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>

          {/* User info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{review.username}</h4>
              {review.isGuest && (
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">
                  Guest
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Actions menu */}
        {isOwnReview && (onDelete || onEdit) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10 min-w-[150px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(review.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-neutral-700 rounded-t-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit review
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(review.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 rounded-b-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete review
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= review.rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-neutral-700"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-white">
          {review.rating}.0
        </span>
      </div>

      {/* Review text */}
      <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
        {review.text}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4">
        <button className="flex items-center gap-2 text-neutral-400 hover:text-violet-400 transition-colors text-sm">
          <ThumbsUp className="w-4 h-4" />
          <span>{review.likes > 0 ? review.likes : "Like"}</span>
        </button>
      </div>
    </div>
  );
}
