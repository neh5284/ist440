import { supabase } from "./supabase";

export interface AlbumRatingStats {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

export async function getUserRating(albumId: string): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("Error getting rating:", error);
    return null;
  }

  return data?.rating ?? null;
}

export async function saveRating(albumId: string, rating: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to rate albums.");
  }

  const { error } = await supabase
    .from("ratings")
    .upsert(
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        album_id: albumId,
        rating,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,album_id",
      }
    );

  if (error) {
    console.error("Error saving rating:", error);
    throw error;
  }
}

export async function getAlbumRatingStats(albumId: string): Promise<AlbumRatingStats> {
  const { data: ratings, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("album_id", albumId);

  const userRating = await getUserRating(albumId);

  if (error || !ratings || ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      userRating: userRating || undefined,
    };
  }

  const sum = ratings.reduce((total, item) => total + Number(item.rating), 0);
  const average = sum / ratings.length;

  return {
    averageRating: Math.round(average * 10) / 10,
    totalRatings: ratings.length,
    userRating: userRating || undefined,
  };
}

export async function deleteRating(albumId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("album_id", albumId);

  if (error) {
    console.error("Error deleting rating:", error);
    throw error;
  }
}