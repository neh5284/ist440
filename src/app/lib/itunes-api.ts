/**
 * iTunes Search API Integration
 *
 * API Endpoint: https://itunes.apple.com/search
 * Documentation: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
 *
 * Note: Falls back to mock data when API is unavailable due to CORS restrictions
 */

// Track if iTunes API is known to be unavailable
let itunesApiAvailable: boolean | null = null;

export interface ITunesAlbum {
  collectionId: number;
  artistId: number;
  artistName: string;
  collectionName: string;
  collectionCensoredName: string;
  artworkUrl100: string;
  artworkUrl60: string;
  releaseDate: string;
  primaryGenreName: string;
  trackCount: number;
  copyright?: string;
  country: string;
  collectionPrice?: number;
  collectionViewUrl: string;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesAlbum[];
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
}

/**
 * Search albums on iTunes with immediate fallback to mock data
 */
export async function searchAlbums(query: string, limit: number = 20): Promise<Album[]> {
  if (!query.trim()) {
    return [];
  }

  // If we already know iTunes API is unavailable, use mock data immediately
  if (itunesApiAvailable === false) {
    console.log('Using cached mock data for search:', query);
    return getMockAlbumsForSearch(query, limit);
  }

  try {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('term', query);
    url.searchParams.set('entity', 'album');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('media', 'music');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`iTunes API returned ${response.status}`);
    }

    const data: ITunesSearchResponse = await response.json();

    // iTunes API is working
    if (itunesApiAvailable === null) {
      itunesApiAvailable = true;
      console.log('iTunes API is available');
    }

    return data.results.map(album => ({
      id: album.collectionId.toString(),
      title: album.collectionName,
      artist: album.artistName,
      artistId: album.artistId.toString(),
      coverUrl: album.artworkUrl100.replace('100x100', '600x600'),
      year: new Date(album.releaseDate).getFullYear(),
      genre: album.primaryGenreName,
      trackCount: album.trackCount,
      itunesUrl: album.collectionViewUrl,
    }));
  } catch (error) {
    // Mark iTunes API as unavailable for future requests
    if (itunesApiAvailable === null) {
      itunesApiAvailable = false;
      console.warn('iTunes API unavailable - switching to demo mode with mock data');
    }

    console.log('Using mock data for search:', query);
    return getMockAlbumsForSearch(query, limit);
  }
}

/**
 * Get album details by ID with immediate fallback to mock data
 */
export async function getAlbumById(albumId: string): Promise<Album | null> {
  // If we already know iTunes API is unavailable, use mock data immediately
  if (itunesApiAvailable === false) {
    console.log('Using cached mock data for album:', albumId);
    return getMockAlbumById(albumId);
  }

  try {
    const url = new URL('https://itunes.apple.com/lookup');
    url.searchParams.set('id', albumId);
    url.searchParams.set('entity', 'album');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`iTunes API returned ${response.status}`);
    }

    const data: ITunesSearchResponse = await response.json();

    if (data.results.length === 0) {
      console.warn(`No album found with ID: ${albumId}`);
      return getMockAlbumById(albumId);
    }

    // iTunes API is working
    if (itunesApiAvailable === null) {
      itunesApiAvailable = true;
      console.log('iTunes API is available');
    }

    const album = data.results[0];
    return {
      id: album.collectionId.toString(),
      title: album.collectionName,
      artist: album.artistName,
      artistId: album.artistId.toString(),
      coverUrl: album.artworkUrl100.replace('100x100', '600x600'),
      year: new Date(album.releaseDate).getFullYear(),
      genre: album.primaryGenreName,
      trackCount: album.trackCount,
      itunesUrl: album.collectionViewUrl,
    };
  } catch (error) {
    // Mark iTunes API as unavailable for future requests
    if (itunesApiAvailable === null) {
      itunesApiAvailable = false;
      console.warn('iTunes API unavailable - switching to demo mode with mock data');
    }

    console.log('Using mock data for album:', albumId);
    return getMockAlbumById(albumId);
  }
}

/**
 * Get albums by artist
 */
export async function getAlbumsByArtist(artistId: string): Promise<Album[]> {
  try {
    const url = new URL('https://itunes.apple.com/lookup');
    url.searchParams.set('id', artistId);
    url.searchParams.set('entity', 'album');
    url.searchParams.set('limit', '50');

    const apiUrl = getApiUrl(url.toString());

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data: ITunesSearchResponse = await response.json();

    // Filter out the artist entry (first result)
    const albums = data.results.filter((_, index) => index > 0);

    return albums.map(album => ({
      id: album.collectionId.toString(),
      title: album.collectionName,
      artist: album.artistName,
      artistId: album.artistId.toString(),
      coverUrl: album.artworkUrl100.replace('100x100', '600x600'),
      year: new Date(album.releaseDate).getFullYear(),
      genre: album.primaryGenreName,
      trackCount: album.trackCount,
      itunesUrl: album.collectionViewUrl,
    }));
  } catch (error) {
    console.error('Error fetching artist albums from iTunes:', error);
    return [];
  }
}

/**
 * Mock data for when iTunes API is unavailable
 */
const MOCK_ALBUMS: Album[] = [
  {
    id: 'mock-1',
    title: 'Abbey Road',
    artist: 'The Beatles',
    artistId: 'mock-artist-1',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600',
    year: 1969,
    genre: 'Rock',
    trackCount: 17,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-2',
    title: '1989 (Taylor\'s Version)',
    artist: 'Taylor Swift',
    artistId: 'mock-artist-2',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    year: 2023,
    genre: 'Pop',
    trackCount: 21,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-3',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    artistId: 'mock-artist-3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    year: 1973,
    genre: 'Progressive Rock',
    trackCount: 10,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-4',
    title: 'good kid, m.A.A.d city',
    artist: 'Kendrick Lamar',
    artistId: 'mock-artist-4',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    year: 2012,
    genre: 'Hip Hop',
    trackCount: 12,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-5',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    artistId: 'mock-artist-5',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600',
    year: 2013,
    genre: 'Electronic',
    trackCount: 13,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-6',
    title: 'After Hours',
    artist: 'The Weeknd',
    artistId: 'mock-artist-6',
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600',
    year: 2020,
    genre: 'R&B',
    trackCount: 14,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-7',
    title: 'Future Nostalgia',
    artist: 'Dua Lipa',
    artistId: 'mock-artist-7',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600',
    year: 2020,
    genre: 'Pop',
    trackCount: 11,
    itunesUrl: 'https://music.apple.com',
  },
  {
    id: 'mock-8',
    title: 'SOUR',
    artist: 'Olivia Rodrigo',
    artistId: 'mock-artist-8',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600',
    year: 2021,
    genre: 'Pop',
    trackCount: 11,
    itunesUrl: 'https://music.apple.com',
  },
];

function getMockAlbumsForSearch(query: string, limit: number): Album[] {
  const lowerQuery = query.toLowerCase();
  const filtered = MOCK_ALBUMS.filter(
    album =>
      album.title.toLowerCase().includes(lowerQuery) ||
      album.artist.toLowerCase().includes(lowerQuery) ||
      album.genre.toLowerCase().includes(lowerQuery)
  );

  return filtered.slice(0, limit);
}

function getMockAlbumById(albumId: string): Album | null {
  return MOCK_ALBUMS.find(album => album.id === albumId) || MOCK_ALBUMS[0];
}
