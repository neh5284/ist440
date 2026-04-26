/**
 * KEY-VALUE STORAGE API
 *
 * This API uses the kv_store_fe4a6553 table in Supabase for all data operations.
 * Data is stored as JSONB with structured keys.
 *
 * Key Patterns:
 * - album:{id}
 * - artist:{id}
 * - profile:{id}
 * - rating:{user_id}:{album_id}
 * - review:{user_id}:{album_id}
 * - collection:{user_id}:{album_id}
 * - index:albums
 * - index:albums:featured
 * - index:albums:top_rated
 * - index:artists
 * - index:album_ratings:{album_id}
 * - index:album_reviews:{album_id}
 */

import { supabase } from './supabase';

// ===== HELPER FUNCTIONS =====

/**
 * Get a single value from KV store
 */
async function kvGet(key: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('kv_store_fe4a6553')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`KV Get Error [${key}]:`, error);
    return null;
  }

  return data?.value || null;
}

/**
 * Get multiple values from KV store
 */
async function kvGetMany(keys: string[]): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('kv_store_fe4a6553')
    .select('key, value')
    .in('key', keys);

  if (error) {
    console.error('KV GetMany Error:', error);
    return {};
  }

  const result: Record<string, any> = {};
  data?.forEach((item) => {
    result[item.key] = item.value;
  });

  return result;
}

/**
 * Set a value in KV store
 */
async function kvSet(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('kv_store_fe4a6553')
    .upsert({
      key,
      value,
    });

  if (error) {
    console.error(`KV Set Error [${key}]:`, error);
    throw new Error(`Failed to set ${key}: ${error.message}`);
  }
}

/**
 * Delete a value from KV store
 */
async function kvDelete(key: string): Promise<void> {
  const { error } = await supabase
    .from('kv_store_fe4a6553')
    .delete()
    .eq('key', key);

  if (error) {
    console.error(`KV Delete Error [${key}]:`, error);
    throw new Error(`Failed to delete ${key}: ${error.message}`);
  }
}

/**
 * Query KV store by key pattern
 */
async function kvQuery(pattern: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('kv_store_fe4a6553')
    .select('value')
    .like('key', pattern);

  if (error) {
    console.error(`KV Query Error [${pattern}]:`, error);
    return [];
  }

  return data?.map((item) => item.value) || [];
}

// ===== ALBUMS =====

export const getAlbums = async () => {
  try {
    // Get index of all album IDs
    const index = await kvGet('index:albums');
    if (!index || !index.ids) {
      return { albums: [] };
    }

    // Get all albums
    const albumKeys = index.ids.map((id: string) => `album:${id}`);
    const albumsData = await kvGetMany(albumKeys);

    // Get ratings for each album
    const ratingKeys = index.ids.map((id: string) => `index:album_ratings:${id}`);
    const ratingsData = await kvGetMany(ratingKeys);

    // Combine albums with ratings
    const albums = index.ids.map((id: string) => {
      const album = albumsData[`album:${id}`];
      const ratings = ratingsData[`index:album_ratings:${id}`];

      return {
        ...album,
        averageRating: ratings?.average_rating || 0,
        totalRatings: ratings?.total_ratings || 0,
      };
    });

    return { albums };
  } catch (error) {
    console.error('Failed to fetch albums:', error);
    throw new Error('Failed to fetch albums');
  }
};

export const getAlbum = async (id: string) => {
  try {
    // Get album data
    const album = await kvGet(`album:${id}`);
    if (!album) {
      throw new Error('Album not found');
    }

    // Get artist data
    const artist = await kvGet(`artist:${album.artist_id}`);

    // Get ratings
    const ratingsIndex = await kvGet(`index:album_ratings:${id}`);

    return {
      ...album,
      artists: artist ? {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
      } : null,
      averageRating: ratingsIndex?.average_rating || 0,
      totalRatings: ratingsIndex?.total_ratings || 0,
    };
  } catch (error) {
    console.error('Failed to fetch album:', error);
    throw error;
  }
};

// ===== ARTISTS =====

export const getArtists = async () => {
  try {
    const index = await kvGet('index:artists');
    if (!index || !index.ids) {
      return { artists: [] };
    }

    const artistKeys = index.ids.map((id: string) => `artist:${id}`);
    const artistsData = await kvGetMany(artistKeys);

    const artists = index.ids.map((id: string) => artistsData[`artist:${id}`]);

    return { artists };
  } catch (error) {
    console.error('Failed to fetch artists:', error);
    throw new Error('Failed to fetch artists');
  }
};

export const getArtist = async (id: string) => {
  try {
    // Get artist data
    const artist = await kvGet(`artist:${id}`);
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Get artist's albums
    const albumsIndex = await kvGet(`index:artist_albums:${id}`);
    let albums = [];

    if (albumsIndex && albumsIndex.album_ids) {
      const albumKeys = albumsIndex.album_ids.map((albumId: string) => `album:${albumId}`);
      const albumsData = await kvGetMany(albumKeys);
      albums = albumsIndex.album_ids.map((albumId: string) => albumsData[`album:${albumId}`]);
    }

    return {
      ...artist,
      albums,
    };
  } catch (error) {
    console.error('Failed to fetch artist:', error);
    throw error;
  }
};

// ===== RATINGS =====

export const getUserRating = async (albumId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const rating = await kvGet(`rating:${user.id}:${albumId}`);
    return rating;
  } catch (error) {
    console.error('Error fetching rating:', error);
    return null;
  }
};

export const saveRating = async (albumId: string, rating: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Must be logged in to rate');
    }

    // Save rating
    const ratingData = {
      id: `${user.id}-${albumId}`,
      user_id: user.id,
      album_id: albumId,
      rating,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kvSet(`rating:${user.id}:${albumId}`, ratingData);

    // Update ratings index
    await updateAlbumRatingsIndex(albumId);

    return ratingData;
  } catch (error) {
    console.error('Error saving rating:', error);
    throw new Error('Failed to save rating');
  }
};

/**
 * Rebuild the ratings index for an album
 */
async function updateAlbumRatingsIndex(albumId: string) {
  try {
    // Get all ratings for this album
    const ratings = await kvQuery(`rating:%:${albumId}`);

    if (ratings.length === 0) {
      await kvSet(`index:album_ratings:${albumId}`, {
        album_id: albumId,
        ratings: [],
        average_rating: 0,
        total_ratings: 0,
      });
      return;
    }

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    await kvSet(`index:album_ratings:${albumId}`, {
      album_id: albumId,
      ratings: ratings.map(r => ({
        user_id: r.user_id,
        rating: r.rating,
        created_at: r.created_at,
      })),
      average_rating: averageRating,
      total_ratings: ratings.length,
    });
  } catch (error) {
    console.error('Error updating ratings index:', error);
  }
}

// ===== REVIEWS =====

export const getReviews = async (albumId: string) => {
  try {
    const reviewsIndex = await kvGet(`index:album_reviews:${albumId}`);
    if (!reviewsIndex || !reviewsIndex.reviews) {
      return [];
    }

    // Add rating to each review
    const reviewsWithRatings = await Promise.all(
      reviewsIndex.reviews.map(async (review: any) => {
        const rating = await kvGet(`rating:${review.user_id}:${albumId}`);
        return {
          ...review,
          profiles: review.profile,
          ratings: rating ? { rating: rating.rating } : null,
        };
      })
    );

    return reviewsWithRatings;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const saveReview = async (albumId: string, text: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Must be logged in to review');
    }

    // Get username from auth user metadata
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

    const reviewData = {
      id: `${user.id}-${albumId}`,
      user_id: user.id,
      album_id: albumId,
      text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        username: username,
        avatar_url: null,
      },
    };

    await kvSet(`review:${user.id}:${albumId}`, reviewData);

    // Update reviews index
    await updateAlbumReviewsIndex(albumId);

    return reviewData;
  } catch (error) {
    console.error('Error saving review:', error);
    throw new Error('Failed to save review');
  }
};

/**
 * Rebuild the reviews index for an album
 */
async function updateAlbumReviewsIndex(albumId: string) {
  try {
    const reviews = await kvQuery(`review:%:${albumId}`);

    await kvSet(`index:album_reviews:${albumId}`, {
      album_id: albumId,
      reviews: reviews.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      total_reviews: reviews.length,
    });
  } catch (error) {
    console.error('Error updating reviews index:', error);
  }
}

// ===== AUTH =====

export const signUp = async (email: string, password: string, username: string) => {
  console.log('🔐 [AUTH] Starting signup process for:', email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    console.error('❌ [AUTH] Signup failed:', error);
    // Provide more helpful error messages
    if (error.message.includes("rate limit")) {
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    throw new Error(error.message);
  }

  console.log('✅ [AUTH] Signup successful:', {
    userId: data.user?.id,
    email: data.user?.email,
    hasSession: !!data.session,
    emailConfirmed: data.user?.email_confirmed_at !== null,
  });

  // Create profile row in public.profiles table
  if (data.user) {
    try {
      console.log('📝 [AUTH] Creating profile for user:', data.user.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: username,
          avatar_url: null,
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('❌ [AUTH] Profile creation failed:', profileError);
        // Don't throw - profile can be created later
        console.warn('⚠️ [AUTH] Continuing without profile - user can still authenticate');
      } else {
        console.log('✅ [AUTH] Profile created successfully');
      }
    } catch (profileError) {
      console.error('❌ [AUTH] Profile creation exception:', profileError);
      // Don't throw - allow signup to succeed even if profile creation fails
    }
  }

  return data;
};

export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Return profile from auth user metadata
  return {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    display_name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    email: user.email,
    bio: null,
    avatar_url: null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

// ===== SEARCH =====

export const search = async (query: string) => {
  try {
    // Search albums by title
    const { data: albumResults } = await supabase
      .from('kv_store_fe4a6553')
      .select('value')
      .like('key', 'album:%')
      .ilike('value->title', `%${query}%`)
      .limit(10);

    // Search artists by name
    const { data: artistResults } = await supabase
      .from('kv_store_fe4a6553')
      .select('value')
      .like('key', 'artist:%')
      .ilike('value->name', `%${query}%`)
      .limit(10);

    const albums = albumResults?.map(r => r.value) || [];
    const artists = artistResults?.map(r => r.value) || [];

    // Add ratings to albums
    const albumsWithRatings = await Promise.all(
      albums.map(async (album) => {
        const ratingsIndex = await kvGet(`index:album_ratings:${album.id}`);
        return {
          ...album,
          averageRating: ratingsIndex?.average_rating || 0,
          totalRatings: ratingsIndex?.total_ratings || 0,
        };
      })
    );

    // Add artist info to albums
    const albumsWithArtists = await Promise.all(
      albumsWithRatings.map(async (album) => {
        const artist = await kvGet(`artist:${album.artist_id}`);
        return {
          ...album,
          artists: artist ? {
            id: artist.id,
            name: artist.name,
            genre: artist.genre,
          } : null,
        };
      })
    );

    return {
      albums: albumsWithArtists,
      artists,
    };
  } catch (error) {
    console.error('Error searching:', error);
    return {
      albums: [],
      artists: [],
    };
  }
};
