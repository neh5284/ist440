import { Hono } from "npm:hono@4.6.14";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
};

// Get authenticated user from token
const getAuthenticatedUser = async (authHeader: string | null) => {
  if (!authHeader) return null;
  
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
};

// ===== ALBUMS =====

// Get all albums
app.get("/make-server-fe4a6553/albums", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        artists (
          id,
          name,
          genre
        )
      `)
      .order("popularity_score", { ascending: false });

    if (error) throw error;

    return c.json({ albums: data });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return c.json({ error: "Failed to fetch albums" }, 500);
  }
});

// Get single album with average rating
app.get("/make-server-fe4a6553/albums/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const supabase = getSupabaseClient();

    // Get album with artist
    const { data: album, error: albumError } = await supabase
      .from("albums")
      .select(`
        *,
        artists (
          id,
          name,
          genre
        )
      `)
      .eq("id", id)
      .single();

    if (albumError) throw albumError;

    // Get ratings stats
    const { data: ratings, error: ratingsError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("album_id", id);

    if (ratingsError) throw ratingsError;

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return c.json({
      album: {
        ...album,
        averageRating,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error("Error fetching album:", error);
    return c.json({ error: "Failed to fetch album" }, 500);
  }
});

// ===== ARTISTS =====

// Get all artists
app.get("/make-server-fe4a6553/artists", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return c.json({ artists: data });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return c.json({ error: "Failed to fetch artists" }, 500);
  }
});

// Get single artist with their albums
app.get("/make-server-fe4a6553/artists/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const supabase = getSupabaseClient();

    // Get artist
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();

    if (artistError) throw artistError;

    // Get their albums
    const { data: albums, error: albumsError } = await supabase
      .from("albums")
      .select("*")
      .eq("artist_id", id)
      .order("year", { ascending: false });

    if (albumsError) throw albumsError;

    return c.json({
      artist: {
        ...artist,
        albums,
      },
    });
  } catch (error) {
    console.error("Error fetching artist:", error);
    return c.json({ error: "Failed to fetch artist" }, 500);
  }
});

// ===== RATINGS =====

// Get user's rating for an album
app.get("/make-server-fe4a6553/ratings/:albumId", async (c) => {
  try {
    const { albumId } = c.req.param();
    const user = await getAuthenticatedUser(c.req.header("Authorization"));
    
    if (!user) {
      return c.json({ rating: null });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("album_id", albumId)
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"

    return c.json({ rating: data });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return c.json({ error: "Failed to fetch rating" }, 500);
  }
});

// Create or update rating
app.post("/make-server-fe4a6553/ratings", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { albumId, rating } = await c.req.json();

    if (!albumId || rating === undefined || rating < 0 || rating > 5) {
      return c.json({ error: "Invalid request" }, 400);
    }

    const supabase = getSupabaseClient();

    // Check if rating exists
    const { data: existing } = await supabase
      .from("ratings")
      .select("*")
      .eq("album_id", albumId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Update existing rating
      const { data, error } = await supabase
        .from("ratings")
        .update({ rating, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return c.json({ rating: data });
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from("ratings")
        .insert({
          user_id: user.id,
          album_id: albumId,
          rating,
        })
        .select()
        .single();

      if (error) throw error;
      return c.json({ rating: data });
    }
  } catch (error) {
    console.error("Error saving rating:", error);
    return c.json({ error: "Failed to save rating" }, 500);
  }
});

// ===== REVIEWS =====

// Get reviews for an album
app.get("/make-server-fe4a6553/reviews/:albumId", async (c) => {
  try {
    const { albumId } = c.req.param();
    const supabase = getSupabaseClient();

    // First try with joins
    let { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    // If joins fail, get reviews without profile data
    if (error) {
      console.error("Error with joins, fetching reviews without profile data:", error);
      const { data: reviewsOnly, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("album_id", albumId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Add mock profile data
      data = reviewsOnly?.map(review => ({
        ...review,
        profiles: {
          username: 'User',
          avatar_url: null,
        },
        ratings: null,
      })) || [];
    }

    // Get ratings for each review user
    if (data) {
      const enrichedReviews = await Promise.all(
        data.map(async (review) => {
          const { data: ratingData } = await supabase
            .from("ratings")
            .select("rating")
            .eq("user_id", review.user_id)
            .eq("album_id", albumId)
            .single();

          return {
            ...review,
            ratings: ratingData,
          };
        })
      );

      return c.json({ reviews: enrichedReviews });
    }

    return c.json({ reviews: data || [] });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return c.json({ reviews: [] });
  }
});

// Create review
app.post("/make-server-fe4a6553/reviews", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { albumId, text } = await c.req.json();

    if (!albumId || !text || text.trim().length === 0) {
      return c.json({ error: "Invalid request" }, 400);
    }

    const supabase = getSupabaseClient();

    // Check if user already has a review for this album
    const { data: existing } = await supabase
      .from("reviews")
      .select("*")
      .eq("album_id", albumId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Update existing review
      const { data, error } = await supabase
        .from("reviews")
        .update({ text, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return c.json({ review: data });
    } else {
      // Create new review
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          album_id: albumId,
          text,
        })
        .select()
        .single();

      if (error) throw error;
      return c.json({ review: data });
    }
  } catch (error) {
    console.error("Error saving review:", error);
    return c.json({ error: "Failed to save review" }, 500);
  }
});

// ===== AUTH =====

// Sign up
app.post("/make-server-fe4a6553/auth/signup", async (c) => {
  try {
    const { email, password, username } = await c.req.json();

    if (!email || !password || !username) {
      return c.json({ error: "Email, password, and username are required" }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server is not configured
      user_metadata: { username },
    });

    if (authError) {
      console.error("Auth error during signup:", authError);
      if (authError.message.includes("already been registered")) {
        return c.json({ error: "This email is already registered. Please sign in instead." }, 400);
      }
      return c.json({ error: authError.message || "Failed to create account" }, 400);
    }

    // Create profile - try to insert, but don't fail if table structure is different
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          username,
          display_name: username, // Add display_name
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail the signup if profile creation fails - the trigger will handle it
      }
    } catch (profileErr) {
      console.error("Profile creation exception:", profileErr);
      // Continue anyway - the database trigger will create the profile
    }

    return c.json({ user: authData.user, message: "Account created successfully" });
  } catch (error) {
    console.error("Error signing up:", error);
    return c.json({ error: "Failed to sign up. Please try again." }, 500);
  }
});

// Get profile
app.get("/make-server-fe4a6553/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();
    
    // Try to get profile, return user metadata if profile doesn't exist
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    }

    // If no profile found, return basic user info
    if (!data) {
      return c.json({ 
        profile: {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          avatar_url: null,
        }
      });
    }

    return c.json({ profile: data });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// ===== SEARCH =====

app.get("/make-server-fe4a6553/search", async (c) => {
  try {
    const query = c.req.query("q");
    
    if (!query) {
      return c.json({ albums: [], artists: [] });
    }

    const supabase = getSupabaseClient();

    // Search albums
    const { data: albums, error: albumsError } = await supabase
      .from("albums")
      .select("*")
      .or(`title.ilike.%${query}%,genres.cs.{${query}}`);

    if (albumsError) throw albumsError;

    // Search artists
    const { data: artists, error: artistsError } = await supabase
      .from("artists")
      .select("*")
      .ilike("name", `%${query}%`);

    if (artistsError) throw artistsError;

    return c.json({ albums: albums || [], artists: artists || [] });
  } catch (error) {
    console.error("Error searching:", error);
    return c.json({ error: "Failed to search" }, 500);
  }
});

// Health check
app.get("/make-server-fe4a6553/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);