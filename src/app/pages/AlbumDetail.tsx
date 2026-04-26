import { useParams, Link } from "react-router";
import { ExternalLink, Music, Calendar, Tags, ArrowLeft, Star, Users, MessageSquare, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { getAlbumById } from "../lib/supabase-albums";
import { RatingWidget } from "../components/RatingWidget";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewForm } from "../components/ReviewForm";
import { saveRating, getUserRating, getAlbumRatingStats, AlbumRatingStats } from "../lib/ratings";
import { submitReview, getAlbumReviews, getUserReview, deleteReview } from "../lib/reviews";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  year: number;
  genre: string;
  trackCount: number;
  itunesUrl: string;
}

type Review = any;

export function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingStats, setRatingStats] = useState<AlbumRatingStats>({
    averageRating: 0,
    totalRatings: 0,
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const userId = user?.id || localStorage.getItem("music_app_guest_id") || null;
        setCurrentUserId(userId);

        const albumData = await getAlbumById(id);

        if (albumData) {
          setAlbum(albumData);
          setError(null);

          const [userRat, stats, albumReviews, userRev] = await Promise.all([
            getUserRating(id),
            getAlbumRatingStats(id),
            getAlbumReviews(id),
            getUserReview(id),
          ]);

          setUserRating(userRat || 0);
          setRatingStats(stats);
          setReviews(albumReviews);
          setUserReview(userRev);
        } else {
          setError("Album not found");
        }
      } catch (error) {
        console.error("Error fetching album data:", error);
        setError(error instanceof Error ? error.message : "Failed to load album");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRatingChange = async (rating: number) => {
    if (!id || !album) return;

    try {
      await saveRating(id, rating);
      setUserRating(rating);

      const stats = await getAlbumRatingStats(id);
      setRatingStats(stats);

      toast.success(`Rated ${rating} stars!`);

      if (!userReview) {
        setShowReviewForm(true);
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save rating. Please try again.");
    }
  };

  const handleSubmitReview = async (rating: number, text: string) => {
    if (!id || !album) return;

    try {
      await submitReview(id, rating, text);

      setUserRating(rating);

      const [albumReviews, stats, userRev] = await Promise.all([
        getAlbumReviews(id),
        getAlbumRatingStats(id),
        getUserReview(id),
      ]);

      setReviews(albumReviews);
      setRatingStats(stats);
      setUserReview(userRev);
      setShowReviewForm(false);

      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const handleDeleteReview = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview(id);

      const [albumReviews, stats] = await Promise.all([
        getAlbumReviews(id),
        getAlbumRatingStats(id),
      ]);

      setReviews(albumReviews);
      setRatingStats(stats);
      setUserReview(null);

      toast.success("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading album...</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? "Unable to Load Album" : "Album Not Found"}
          </h2>
          <p className="text-red-400 mb-4">
            {error || "This album doesn't exist or the link may be invalid."}
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Home
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Browse
          </Link>

          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div>
              <div className="aspect-square rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={album.coverUrl}
                  alt={`${album.title} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{album.title}</h1>
              <p className="text-2xl text-violet-400 mb-4">{album.artist}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Calendar className="w-5 h-5 text-neutral-500" />
                  <span>{album.year}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Music className="w-5 h-5 text-neutral-500" />
                  <span>{album.trackCount} tracks</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Tags className="w-5 h-5 text-neutral-500" />
                  <span>{album.genre}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-neutral-800">
                {ratingStats.totalRatings > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xl font-bold text-white">
                      {ratingStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-neutral-400">({ratingStats.totalRatings})</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-neutral-400">
                  <MessageSquare className="w-5 h-5" />
                  <span>
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-2">
                    {userRating > 0 ? "Your rating:" : "Rate this album:"}
                  </p>

                  <RatingWidget
                    initialRating={userRating}
                    onRate={handleRatingChange}
                    size="lg"
                  />
                </div>

                <a
                  href={album.itunesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-medium rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  iTunes
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-violet-500" />
                Community Reviews
              </h2>
            </div>

            {!userReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full mb-6 p-6 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-violet-500 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <p className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                      Share your thoughts
                    </p>
                    <p className="text-sm text-neutral-400">
                      Write a review for "{album.title}"
                    </p>
                  </div>
                </div>
              </button>
            )}

            {showReviewForm && !userReview && (
              <div className="mb-6">
                <ReviewForm
                  albumTitle={album.title}
                  initialRating={userRating}
                  onSubmit={handleSubmitReview}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {userReview && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-violet-400">Your Review</span>
                </div>

                <ReviewCard
                  review={userReview}
                  currentUserId={currentUserId || undefined}
                  onDelete={handleDeleteReview}
                />
              </div>
            )}

            {reviews.length > 0 && (
              <div className="space-y-4">
                {reviews
                  .filter((r) => r.id !== userReview?.id)
                  .map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      currentUserId={currentUserId || undefined}
                      onDelete={handleDeleteReview}
                    />
                  ))}
              </div>
            )}

            {reviews.length === 0 && !userReview && !showReviewForm && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
                <MessageSquare className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                <p className="text-neutral-400 mb-6">
                  Be the first to share your thoughts on this album!
                </p>

                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {ratingStats.totalRatings > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-500" />
                  Community Rating
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">
                      {ratingStats.averageRating.toFixed(1)}
                    </div>

                    <div className="flex items-center gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(ratingStats.averageRating)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-neutral-400">
                      Based on{" "}
                      <span className="text-white font-semibold">
                        {ratingStats.totalRatings}
                      </span>{" "}
                      {ratingStats.totalRatings === 1 ? "rating" : "ratings"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Album Details</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-400">Artist</p>
                  <p className="text-white font-medium">{album.artist}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-400">Release Year</p>
                  <p className="text-white font-medium">{album.year}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-400">Genre</p>
                  <p className="text-white font-medium">{album.genre}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-400">Track Count</p>
                  <p className="text-white font-medium">{album.trackCount} tracks</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Reviews</span>
                  <span className="text-white font-semibold">{reviews.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Ratings</span>
                  <span className="text-white font-semibold">{ratingStats.totalRatings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}