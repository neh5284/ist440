/**
 * DATABASE SCHEMA & DATA STRUCTURES
 * 
 * This file defines all database tables, their relationships,
 * and TypeScript interfaces for type safety.
 * 
 * Architecture: Direct Supabase Client Queries
 * Tables: albums, artists, profiles, ratings, reviews, collections
 */

// ========================================
// DATABASE TABLES
// ========================================

/**
 * ALBUMS TABLE
 * 
 * Stores album information with popularity scoring
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY
 * - title: TEXT NOT NULL
 * - artist_id: UUID REFERENCES artists(id)
 * - year: INTEGER NOT NULL
 * - cover_url: TEXT
 * - description: TEXT
 * - tracks: TEXT[] (array of track names)
 * - genre: TEXT
 * - genres: TEXT[] (array of genres)
 * - popularity_score: INTEGER (50-100)
 * - is_featured: BOOLEAN (for trending section)
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 */
export interface Album {
  id: string;
  title: string;
  artist_id: string;
  year: number;
  cover_url: string;
  description: string;
  tracks: string[];
  genre?: string;
  genres?: string[];
  popularity_score?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * ALBUM WITH ARTIST (JOIN)
 * 
 * Album data with related artist information
 * Used in: Home page, Charts, Search, Album listings
 */
export interface AlbumWithArtist extends Album {
  artists?: {
    id: string;
    name: string;
    genre: string;
  };
}

/**
 * ALBUM WITH RATINGS (COMPUTED)
 * 
 * Album data with aggregated rating statistics
 * Used in: All album displays
 */
export interface AlbumWithRatings extends AlbumWithArtist {
  averageRating?: number;
  totalRatings?: number;
}

// ========================================

/**
 * ARTISTS TABLE
 * 
 * Stores artist/band information
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY
 * - name: TEXT NOT NULL UNIQUE
 * - genre: TEXT
 * - bio: TEXT
 * - image_url: TEXT
 * - formed_year: INTEGER
 * - country: TEXT
 * - created_at: TIMESTAMPTZ
 */
export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio?: string;
  image_url?: string;
  formed_year?: number;
  country?: string;
  created_at?: string;
}

/**
 * ARTIST WITH ALBUMS (JOIN)
 * 
 * Artist data with their albums
 * Used in: Artist detail pages
 */
export interface ArtistWithAlbums extends Artist {
  albums?: Album[];
}

// ========================================

/**
 * PROFILES TABLE
 * 
 * User profile information (linked to auth.users)
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY REFERENCES auth.users(id)
 * - username: TEXT UNIQUE
 * - display_name: TEXT
 * - bio: TEXT
 * - avatar_url: TEXT
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 * 
 * Security:
 * - RLS enabled
 * - Everyone can view
 * - Users can only edit their own profile
 * 
 * Auto-Creation:
 * - Trigger: on_auth_user_created
 * - Creates profile automatically when user signs up
 * - Username extracted from email (before @)
 */
export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// ========================================

/**
 * RATINGS TABLE
 * 
 * User album ratings (0-5 stars)
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY
 * - user_id: UUID REFERENCES profiles(id)
 * - album_id: UUID REFERENCES albums(id)
 * - rating: DECIMAL(2,1) (0.0 to 5.0)
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 * - UNIQUE(user_id, album_id)
 * 
 * Security:
 * - RLS enabled
 * - Anyone can view ratings
 * - Authenticated users can insert
 * - Users can only update/delete their own ratings
 */
export interface Rating {
  id: string;
  user_id: string;
  album_id: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
}

// ========================================

/**
 * REVIEWS TABLE
 * 
 * User written reviews for albums
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY
 * - user_id: UUID REFERENCES profiles(id)
 * - album_id: UUID REFERENCES albums(id)
 * - text: TEXT NOT NULL
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 * - UNIQUE(user_id, album_id)
 * 
 * Security:
 * - RLS enabled
 * - Anyone can view reviews
 * - Authenticated users can insert
 * - Users can only update/delete their own reviews
 */
export interface Review {
  id: string;
  user_id: string;
  album_id: string;
  text: string;
  created_at: string;
  updated_at?: string;
}

/**
 * REVIEW WITH PROFILE (JOIN)
 * 
 * Review with author information
 * Used in: Album detail pages
 */
export interface ReviewWithProfile extends Review {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

/**
 * REVIEW WITH RATING (JOIN)
 * 
 * Review with author's rating for the same album
 * Used in: Album detail pages
 */
export interface ReviewWithRating extends ReviewWithProfile {
  ratings?: {
    rating: number;
  };
}

// ========================================

/**
 * COLLECTIONS TABLE
 * 
 * User album collections (wishlist, owned, etc.)
 * 
 * Database Schema:
 * - id: UUID PRIMARY KEY
 * - user_id: UUID REFERENCES profiles(id)
 * - album_id: UUID REFERENCES albums(id)
 * - status: TEXT ('owned', 'wishlist', 'favorite')
 * - added_at: TIMESTAMPTZ
 * - UNIQUE(user_id, album_id)
 * 
 * Security:
 * - RLS enabled
 * - Users can only view their own collections
 * - Users can only insert/delete their own collections
 */
export interface Collection {
  id: string;
  user_id: string;
  album_id: string;
  status: 'owned' | 'wishlist' | 'favorite';
  added_at?: string;
}

/**
 * COLLECTION WITH ALBUM (JOIN)
 * 
 * Collection item with full album details
 * Used in: User profile/collection pages
 */
export interface CollectionWithAlbum extends Collection {
  albums?: AlbumWithArtist;
}

// ========================================
// API RESPONSE TYPES
// ========================================

/**
 * Albums API Response
 */
export interface AlbumsResponse {
  albums: AlbumWithRatings[];
}

/**
 * Artists API Response
 */
export interface ArtistsResponse {
  artists: Artist[];
}

/**
 * Search API Response
 */
export interface SearchResponse {
  albums: AlbumWithRatings[];
  artists: Artist[];
}

/**
 * Auth Response
 */
export interface AuthResponse {
  user: any;
  message?: string;
}

// ========================================
// SORTING & FILTERING
// ========================================

/**
 * Top Rated Albums
 * Query: ORDER BY popularity_score DESC
 * Filter: popularity_score >= 95
 */
export type TopRatedAlbums = AlbumWithRatings[];

/**
 * Trending Albums
 * Query: WHERE is_featured = true ORDER BY popularity_score DESC
 * Filter: is_featured = true
 */
export type TrendingAlbums = AlbumWithRatings[];

/**
 * Recently Added Albums
 * Query: ORDER BY year DESC, created_at DESC
 */
export type RecentAlbums = AlbumWithRatings[];

// ========================================
// COMPUTED FIELDS
// ========================================

/**
 * Rating Statistics
 * Computed from ratings table
 */
export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ========================================
// SEARCH FILTERS
// ========================================

/**
 * Advanced Search Filters
 * Used in: Search page advanced filters
 */
export interface SearchFilters {
  genre?: string;
  yearRange?: {
    min: number;
    max: number;
  };
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'year' | 'popularity';
}

// ========================================
// DATABASE RELATIONSHIPS
// ========================================

/**
 * TABLE RELATIONSHIPS:
 * 
 * albums
 *   ├─ artist_id → artists.id (many-to-one)
 *   ├─ ratings (one-to-many)
 *   ├─ reviews (one-to-many)
 *   └─ collections (one-to-many)
 * 
 * artists
 *   └─ albums (one-to-many)
 * 
 * profiles
 *   ├─ id → auth.users.id (one-to-one)
 *   ├─ ratings (one-to-many)
 *   ├─ reviews (one-to-many)
 *   └─ collections (one-to-many)
 * 
 * ratings
 *   ├─ user_id → profiles.id (many-to-one)
 *   └─ album_id → albums.id (many-to-one)
 * 
 * reviews
 *   ├─ user_id → profiles.id (many-to-one)
 *   └─ album_id → albums.id (many-to-one)
 * 
 * collections
 *   ├─ user_id → profiles.id (many-to-one)
 *   └─ album_id → albums.id (many-to-one)
 */

// ========================================
// USAGE EXAMPLES
// ========================================

/**
 * Example: Fetch albums with ratings
 * 
 * const { data } = await supabase
 *   .from('albums')
 *   .select(`
 *     *,
 *     artists (
 *       id,
 *       name,
 *       genre
 *     )
 *   `)
 *   .order('popularity_score', { ascending: false });
 */

/**
 * Example: Fetch reviews with author info
 * 
 * const { data } = await supabase
 *   .from('reviews')
 *   .select(`
 *     *,
 *     profiles (
 *       username,
 *       avatar_url
 *     )
 *   `)
 *   .eq('album_id', albumId)
 *   .order('created_at', { ascending: false });
 */

/**
 * Example: Save user rating
 * 
 * const { data } = await supabase
 *   .from('ratings')
 *   .upsert({
 *     user_id: userId,
 *     album_id: albumId,
 *     rating: 4.5
 *   });
 */

// ========================================
// DATA POPULATION
// ========================================

/**
 * Popularity Score Ranges:
 * - Top Rated: 95-97 (folklore, Blonde, DAMN.)
 * - Trending: 87-89 (Certified Lover Boy, Midnights)
 * - Regular: 60-89
 * 
 * Featured Status:
 * - is_featured = true: Shows in "Trending Now"
 * - is_featured = false: Regular albums
 */

export const POPULARITY_RANGES = {
  TOP_RATED: { min: 95, max: 97 },
  TRENDING: { min: 87, max: 89 },
  REGULAR: { min: 60, max: 89 },
} as const;

export const COLLECTION_STATUSES = ['owned', 'wishlist', 'favorite'] as const;

export const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Electronic',
  'Jazz',
  'Classical',
  'Country',
  'Alternative',
  'Indie',
  'Metal',
  'Folk',
] as const;
