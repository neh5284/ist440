/**
 * TYPES INDEX
 * 
 * Central export for all TypeScript types and interfaces
 * Import from this file throughout the app for consistency
 */

export * from './database';

// Re-export commonly used types for convenience
export type {
  Album,
  AlbumWithArtist,
  AlbumWithRatings,
  Artist,
  ArtistWithAlbums,
  Profile,
  Rating,
  Review,
  ReviewWithProfile,
  ReviewWithRating,
  Collection,
  CollectionWithAlbum,
  AlbumsResponse,
  ArtistsResponse,
  SearchResponse,
  AuthResponse,
  TopRatedAlbums,
  TrendingAlbums,
  RecentAlbums,
  RatingStats,
  SearchFilters,
} from './database';
