/**
 * Supabase Albums API
 * Fetches real album data from the Supabase database
 */

import { supabase } from './supabase';

export interface SupabaseAlbum {
  id: string;
  artist_id: string;
  title: string;
  release_year: number;
  created_at: string;
  is_featured: boolean;
  popularity_score: number;
  cover_url: string;
}

export interface SupabaseArtist {
  id: string;
  name: string;
  genre: string;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  year: number;
  genre: string;
  trackCount: number;
  itunesUrl: string;
  popularityScore?: number;
}

/**
 * Fetch featured albums from Supabase
 */
export async function getFeaturedAlbums(limit: number = 20): Promise<Album[]> {
  console.log('Fetching featured albums from Supabase...');

  try {
    const { data: albumsData, error } = await supabase
      .from('albums')
      .select('id, title, artist_id, release_year, popularity_score, cover_url, is_featured')
      .eq('is_featured', true)
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error fetching featured albums:', error);
      throw new Error(`Failed to fetch featured albums: ${error.message}`);
    }

    if (!albumsData || albumsData.length === 0) {
      console.warn('No featured albums found in database');
      return [];
    }

    console.log(`Fetched ${albumsData.length} featured albums from Supabase`);

    // Fetch artist data for all albums
    const artistIds = [...new Set(albumsData.map(a => a.artist_id))];
    const { data: artistsData, error: artistError } = await supabase
      .from('artists')
      .select('id, name, genre')
      .in('id', artistIds);

    if (artistError) {
      console.error('Error fetching artists:', artistError);
      // Continue without artist data rather than failing completely
    }

    // Create a map of artist data
    const artistMap = new Map<string, SupabaseArtist>();
    if (artistsData) {
      artistsData.forEach(artist => {
        artistMap.set(artist.id, artist);
      });
    }

    // Map to Album format
    return albumsData.map(album => ({
      id: album.id,
      title: album.title,
      artist: artistMap.get(album.artist_id)?.name || 'Unknown Artist',
      artistId: album.artist_id,
      coverUrl: album.cover_url,
      year: album.release_year,
      genre: artistMap.get(album.artist_id)?.genre || 'Unknown',
      trackCount: 0, // Not available in current schema
      itunesUrl: '', // Not available in current schema
      popularityScore: album.popularity_score,
    }));
  } catch (error) {
    console.error('Error in getFeaturedAlbums:', error);
    throw error;
  }
}

/**
 * Fetch popular albums from Supabase (sorted by popularity)
 */
export async function getPopularAlbums(limit: number = 20): Promise<Album[]> {
  console.log('Fetching popular albums from Supabase...');

  try {
    const { data: albumsData, error } = await supabase
      .from('albums')
      .select('id, title, artist_id, release_year, popularity_score, cover_url')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error fetching popular albums:', error);
      throw new Error(`Failed to fetch popular albums: ${error.message}`);
    }

    if (!albumsData || albumsData.length === 0) {
      console.warn('No albums found in database');
      return [];
    }

    console.log(`Fetched ${albumsData.length} popular albums from Supabase`);

    // Fetch artist data
    const artistIds = [...new Set(albumsData.map(a => a.artist_id))];
    const { data: artistsData, error: artistError } = await supabase
      .from('artists')
      .select('id, name, genre')
      .in('id', artistIds);

    if (artistError) {
      console.error('Error fetching artists:', artistError);
    }

    const artistMap = new Map<string, SupabaseArtist>();
    if (artistsData) {
      artistsData.forEach(artist => {
        artistMap.set(artist.id, artist);
      });
    }

    return albumsData.map(album => ({
      id: album.id,
      title: album.title,
      artist: artistMap.get(album.artist_id)?.name || 'Unknown Artist',
      artistId: album.artist_id,
      coverUrl: album.cover_url,
      year: album.release_year,
      genre: artistMap.get(album.artist_id)?.genre || 'Unknown',
      trackCount: 0,
      itunesUrl: '',
      popularityScore: album.popularity_score,
    }));
  } catch (error) {
    console.error('Error in getPopularAlbums:', error);
    throw error;
  }
}

/**
 * Search albums in Supabase database
 */
export async function searchAlbumsInDb(query: string, limit: number = 20): Promise<Album[]> {
  if (!query.trim()) {
    return [];
  }

  console.log('Searching albums in Supabase:', query);

  try {
    // Search albums by title
    const { data: albumsData, error } = await supabase
      .from('albums')
      .select('id, title, artist_id, release_year, popularity_score, cover_url')
      .ilike('title', `%${query}%`)
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error searching albums:', error);
      throw new Error(`Failed to search albums: ${error.message}`);
    }

    if (!albumsData || albumsData.length === 0) {
      // Also search by artist name
      const { data: artistsData, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .ilike('name', `%${query}%`);

      if (artistError) {
        console.error('Error searching artists:', artistError);
        return [];
      }

      if (!artistsData || artistsData.length === 0) {
        return [];
      }

      const artistIds = artistsData.map(a => a.id);
      const { data: albumsByArtist, error: albumsByArtistError } = await supabase
        .from('albums')
        .select('id, title, artist_id, release_year, popularity_score, cover_url')
        .in('artist_id', artistIds)
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (albumsByArtistError) {
        console.error('Error fetching albums by artist:', albumsByArtistError);
        return [];
      }

      albumsData.push(...(albumsByArtist || []));
    }

    console.log(`Found ${albumsData.length} albums matching "${query}"`);

    // Fetch artist data
    const artistIds = [...new Set(albumsData.map(a => a.artist_id))];
    const { data: artistsData, error: artistError } = await supabase
      .from('artists')
      .select('id, name, genre')
      .in('id', artistIds);

    if (artistError) {
      console.error('Error fetching artists for search results:', artistError);
    }

    const artistMap = new Map<string, SupabaseArtist>();
    if (artistsData) {
      artistsData.forEach(artist => {
        artistMap.set(artist.id, artist);
      });
    }

    return albumsData.map(album => ({
      id: album.id,
      title: album.title,
      artist: artistMap.get(album.artist_id)?.name || 'Unknown Artist',
      artistId: album.artist_id,
      coverUrl: album.cover_url,
      year: album.release_year,
      genre: artistMap.get(album.artist_id)?.genre || 'Unknown',
      trackCount: 0,
      itunesUrl: '',
      popularityScore: album.popularity_score,
    }));
  } catch (error) {
    console.error('Error in searchAlbumsInDb:', error);
    throw error;
  }
}

/**
 * Get album by ID from Supabase
 */
export async function getAlbumById(albumId: string): Promise<Album | null> {
  console.log('Fetching album by ID from Supabase:', albumId);

  try {
    const { data: albumData, error } = await supabase
      .from('albums')
      .select('id, title, artist_id, release_year, popularity_score, cover_url')
      .eq('id', albumId)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching album:', error);
      throw new Error(`Failed to fetch album: ${error.message}`);
    }

    if (!albumData) {
      console.warn('Album not found:', albumId);
      return null;
    }

    // Fetch artist data
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id, name, genre')
      .eq('id', albumData.artist_id)
      .maybeSingle();

    if (artistError) {
      console.error('Error fetching artist:', artistError);
    }

    return {
      id: albumData.id,
      title: albumData.title,
      artist: artistData?.name || 'Unknown Artist',
      artistId: albumData.artist_id,
      coverUrl: albumData.cover_url,
      year: albumData.release_year,
      genre: artistData?.genre || 'Unknown',
      trackCount: 0,
      itunesUrl: '',
      popularityScore: albumData.popularity_score,
    };
  } catch (error) {
    console.error('Error in getAlbumById:', error);
    throw error;
  }
}
