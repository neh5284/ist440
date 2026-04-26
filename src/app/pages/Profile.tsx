import { useEffect, useState } from "react";
import { Music, Heart, Star, List } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { AlbumCard } from "../components/AlbumCard";

type TabType = "rated" | "wishlist" | "collection";

export function Profile() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("rated");
  const [profile, setProfile] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;

      setLoading(true);

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Ratings (FIXED QUERY)
      const { data: ratingData, error: ratingError } = await supabase
        .from("ratings")
        .select(`
          *,
          albums (
            id,
            title,
            release_year,
            cover_url,
            artists (
              name,
              genre
            )
          )
        `)
        .eq("user_id", user.id);

      // Reviews (FIXED QUERY)
      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select(`
          *,
          albums (
            id,
            title,
            release_year,
            cover_url,
            artists (
              name,
              genre
            )
          )
        `)
        .eq("user_id", user.id);

      if (ratingError) {
        console.error("Error loading ratings:", ratingError);
      }

      if (reviewError) {
        console.error("Error loading reviews:", reviewError);
      }

      setProfile(profileData);
      setRatings(ratingData || []);
      setReviews(reviewData || []);
      setLoading(false);
    }

    loadProfileData();
  }, [user]);

  // Map album safely
  const mapAlbum = (album: any) => ({
    id: album.id,
    title: album.title,
    artist: album.artists?.name || "Unknown Artist",
    year: album.release_year,
    genre: album.artists?.genre || "Unknown Genre",
    coverUrl: album.cover_url,
  });

  // Rated albums
  const ratedAlbums = ratings
    .filter((item) => item.albums)
    .map((item) => mapAlbum(item.albums));

  // Average rating
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        ratings.length
      : 0;

  // Favorite genre
  const genreCounts: Record<string, number> = {};

  ratings.forEach((item) => {
    const genre = item.albums?.artists?.genre;
    if (genre) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  });

  const favoriteGenre =
    Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None yet";

  const username = profile?.username || user?.email || "User";
  const displayName = profile?.display_name || username;
  const firstLetter = displayName.charAt(0).toUpperCase();

  const currentAlbums = activeTab === "rated" ? ratedAlbums : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-neutral-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <span className="text-5xl font-bold text-white">
              {firstLetter}
            </span>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {displayName}
            </h1>
            <p className="text-neutral-400 mb-4">@{username}</p>

            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold text-white">
                  {ratings.length}
                </div>
                <div className="text-sm text-neutral-400">Rated</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-neutral-400">Collection</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-neutral-400">Wishlist</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">
                  {reviews.length}
                </div>
                <div className="text-sm text-neutral-400">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Average Rating</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {averageRating.toFixed(1)}
            </p>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Favorite Genre</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {favoriteGenre}
            </p>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <List className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Lists Created</h3>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab("rated")}
          className={`px-6 py-3 font-semibold border-b-2 ${
            activeTab === "rated"
              ? "text-white border-violet-500"
              : "text-neutral-400 border-transparent"
          }`}
        >
          Rated Albums ({ratings.length})
        </button>
      </div>

      {/* Albums */}
      {currentAlbums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {currentAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
          <p className="text-neutral-400">
            No rated albums yet.
          </p>
        </div>
      )}
    </div>
  );
}