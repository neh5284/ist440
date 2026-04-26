import { supabase } from "./supabase";
import { saveRating } from "./ratings";

export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  albumId: string;
  albumTitle?: string;
  albumArtist?: string;
  albumCoverUrl?: string;
  rating: number;
  text: string;
  createdAt: string;
  likes?: number;
}

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function getRatingForReview(userId: string, albumId: string): Promise<number> {
  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", userId)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("Error getting review rating:", error);
    return 0;
  }

  return data?.rating ?? 0;
}

function mapReview(row: any, rating: number): Review {
  return {
    id: row.id,
    userId: row.user_id,
    username:
      row.profiles?.display_name ||
      row.profiles?.username ||
      "User",
    userAvatar: row.profiles?.avatar_url || undefined,
    albumId: row.album_id,
    rating,
    text: row.review_text || "",
    createdAt: row.created_at,
    likes: 0,
  };
}

export async function getUserReview(albumId: string): Promise<Review | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("Error getting user review:", error);
    return null;
  }

  if (!data) return null;

  const rating = await getRatingForReview(user.id, albumId);
  return mapReview(data, rating);
}

export async function saveReview(albumId: string, reviewText: string): Promise<Review> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to review albums.");
  }

  const safeText = reviewText || "";

  const { data: existingReview, error: findError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .maybeSingle();

  if (findError) {
    console.error("Error checking existing review:", findError);
    throw findError;
  }

  let savedReview;

  if (existingReview) {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        review_text: safeText,
      })
      .eq("id", existingReview.id)
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error updating review:", error);
      throw error;
    }

    savedReview = data;
  } else {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        album_id: albumId,
        review_text: safeText,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error inserting review:", error);
      throw error;
    }

    savedReview = data;
  }

  const rating = await getRatingForReview(user.id, albumId);
  return mapReview(savedReview, rating);
}

export async function submitReview(
  albumId: string,
  rating: number,
  reviewText: string
): Promise<Review> {
  await saveRating(albumId, rating);
  return await saveReview(albumId, reviewText);
}

export async function deleteReview(albumId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("album_id", albumId);

  if (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

export async function getAlbumReviews(albumId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting album reviews:", error);
    return [];
  }

  const mappedReviews = await Promise.all(
    (data ?? []).map(async (row) => {
      const rating = await getRatingForReview(row.user_id, row.album_id);
      return mapReview(row, rating);
    })
  );

  return mappedReviews;
}