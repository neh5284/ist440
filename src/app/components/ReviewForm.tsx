import { useState } from "react";
import { RatingWidget } from "./RatingWidget";
import { X } from "lucide-react";

interface ReviewFormProps {
  albumTitle: string;
  initialRating?: number;
  initialText?: string;
  onSubmit: (rating: number, text: string) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
}

export function ReviewForm({
  albumTitle,
  initialRating = 0,
  initialText = "",
  onSubmit,
  onCancel,
  submitButtonText = "Submit Review",
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, text);
      // Reset form
      setRating(0);
      setText("");
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Write a Review</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-400 mb-3">
          Rate "{albumTitle}"
        </label>
        <RatingWidget
          initialRating={rating}
          onRate={setRating}
          size="lg"
        />
        {rating === 0 && (
          <p className="text-sm text-neutral-500 mt-2">Please select a rating</p>
        )}
      </div>

      {/* Review text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-400 mb-3">
          Your thoughts (optional)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="What did you think of this album? Share your thoughts with the community..."
          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          maxLength={5000}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-neutral-500">
            {text.length}/5000 characters
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={rating === 0 || submitting}
          className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : submitButtonText}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
