/**
 * Last.fm API Integration
 *
 * API Endpoint: https://ws.audioscrobbler.com/2.0/
 * Documentation: https://www.last.fm/api
 *
 * To use this API, you need a Last.fm API key.
 * Get one at: https://www.last.fm/api/account/create
 */

// Use your own Last.fm API key here
// Get one at: https://www.last.fm/api/account/create
const LASTFM_API_KEY = 'YOUR_LASTFM_API_KEY';
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export interface LastFmTrack {
  name: string;
  playcount: string;
  listeners: string;
  url: string;
  artist: {
    name: string;
    url: string;
  };
  image: Array<{
    '#text': string;
    size: 'small' | 'medium' | 'large' | 'extralarge';
  }>;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmTopTracksResponse {
  tracks: {
    track: LastFmTrack[];
    '@attr': {
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
}

export interface ChartTrack {
  rank: number;
  title: string;
  artist: string;
  playCount: number;
  listeners: number;
  imageUrl: string;
  url: string;
}

/**
 * Get top tracks chart from Last.fm
 */
export async function getTopTracks(limit: number = 50): Promise<ChartTrack[]> {
  // Check if API key is configured
  if (!LASTFM_API_KEY || LASTFM_API_KEY === 'YOUR_LASTFM_API_KEY') {
    // Return mock data if API key is not configured
    console.warn('Last.fm API key not configured. Using mock data.');
    return getMockTopTracks(limit);
  }

  try {
    const url = new URL(LASTFM_BASE_URL);
    url.searchParams.set('method', 'chart.gettoptracks');
    url.searchParams.set('api_key', LASTFM_API_KEY);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmTopTracksResponse = await response.json();

    return data.tracks.track.map((track, index) => ({
      rank: index + 1,
      title: track.name,
      artist: track.artist.name,
      playCount: parseInt(track.playcount, 10),
      listeners: parseInt(track.listeners, 10),
      imageUrl: track.image.find(img => img.size === 'large')?.['#text'] ||
                track.image.find(img => img.size === 'extralarge')?.['#text'] ||
                track.image[track.image.length - 1]?.['#text'] ||
                'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300',
      url: track.url,
    }));
  } catch (error) {
    console.error('Error fetching Last.fm top tracks:', error);
    // Fallback to mock data on error
    return getMockTopTracks(limit);
  }
}

/**
 * Mock data for development/demo purposes
 */
function getMockTopTracks(limit: number): ChartTrack[] {
  const mockTracks: ChartTrack[] = [
    {
      rank: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      playCount: 2847392,
      listeners: 1249483,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
      url: "https://www.last.fm/music/The+Weeknd/_/Blinding+Lights",
    },
    {
      rank: 2,
      title: "Anti-Hero",
      artist: "Taylor Swift",
      playCount: 2634821,
      listeners: 1143829,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      url: "https://www.last.fm/music/Taylor+Swift/_/Anti-Hero",
    },
    {
      rank: 3,
      title: "Flowers",
      artist: "Miley Cyrus",
      playCount: 2483910,
      listeners: 1092847,
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
      url: "https://www.last.fm/music/Miley+Cyrus/_/Flowers",
    },
    {
      rank: 4,
      title: "Starboy",
      artist: "The Weeknd",
      playCount: 2392847,
      listeners: 1048392,
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300",
      url: "https://www.last.fm/music/The+Weeknd/_/Starboy",
    },
    {
      rank: 5,
      title: "As It Was",
      artist: "Harry Styles",
      playCount: 2284729,
      listeners: 994738,
      imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300",
      url: "https://www.last.fm/music/Harry+Styles/_/As+It+Was",
    },
    {
      rank: 6,
      title: "Heat Waves",
      artist: "Glass Animals",
      playCount: 2193847,
      listeners: 948392,
      imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300",
      url: "https://www.last.fm/music/Glass+Animals/_/Heat+Waves",
    },
    {
      rank: 7,
      title: "Levitating",
      artist: "Dua Lipa",
      playCount: 2084729,
      listeners: 901928,
      imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300",
      url: "https://www.last.fm/music/Dua+Lipa/_/Levitating",
    },
    {
      rank: 8,
      title: "good 4 u",
      artist: "Olivia Rodrigo",
      playCount: 1983928,
      listeners: 857392,
      imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300",
      url: "https://www.last.fm/music/Olivia+Rodrigo/_/good+4+u",
    },
    {
      rank: 9,
      title: "HUMBLE.",
      artist: "Kendrick Lamar",
      playCount: 1893847,
      listeners: 819283,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
      url: "https://www.last.fm/music/Kendrick+Lamar/_/HUMBLE.",
    },
    {
      rank: 10,
      title: "Circles",
      artist: "Post Malone",
      playCount: 1794829,
      listeners: 775938,
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300",
      url: "https://www.last.fm/music/Post+Malone/_/Circles",
    },
    {
      rank: 11,
      title: "Somebody That I Used to Know",
      artist: "Gotye",
      playCount: 1684920,
      listeners: 728493,
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
      url: "https://www.last.fm/music/Gotye/_/Somebody+That+I+Used+to+Know",
    },
    {
      rank: 12,
      title: "Shape of You",
      artist: "Ed Sheeran",
      playCount: 1593847,
      listeners: 689274,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      url: "https://www.last.fm/music/Ed+Sheeran/_/Shape+of+You",
    },
    {
      rank: 13,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      playCount: 1498273,
      listeners: 647382,
      imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300",
      url: "https://www.last.fm/music/Harry+Styles/_/Watermelon+Sugar",
    },
    {
      rank: 14,
      title: "drivers license",
      artist: "Olivia Rodrigo",
      playCount: 1402938,
      listeners: 606483,
      imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300",
      url: "https://www.last.fm/music/Olivia+Rodrigo/_/drivers+license",
    },
    {
      rank: 15,
      title: "Peaches",
      artist: "Justin Bieber",
      playCount: 1318492,
      listeners: 570294,
      imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300",
      url: "https://www.last.fm/music/Justin+Bieber/_/Peaches",
    },
    {
      rank: 16,
      title: "Shivers",
      artist: "Ed Sheeran",
      playCount: 1249382,
      listeners: 540192,
      imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300",
      url: "https://www.last.fm/music/Ed+Sheeran/_/Shivers",
    },
    {
      rank: 17,
      title: "Save Your Tears",
      artist: "The Weeknd",
      playCount: 1184920,
      listeners: 512847,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
      url: "https://www.last.fm/music/The+Weeknd/_/Save+Your+Tears",
    },
    {
      rank: 18,
      title: "Intentions",
      artist: "Justin Bieber",
      playCount: 1098374,
      listeners: 475283,
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300",
      url: "https://www.last.fm/music/Justin+Bieber/_/Intentions",
    },
    {
      rank: 19,
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      playCount: 1024839,
      listeners: 443928,
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
      url: "https://www.last.fm/music/The+Kid+LAROI/_/Stay",
    },
    {
      rank: 20,
      title: "Bad Habits",
      artist: "Ed Sheeran",
      playCount: 948273,
      listeners: 410394,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      url: "https://www.last.fm/music/Ed+Sheeran/_/Bad+Habits",
    },
  ];

  return mockTracks.slice(0, limit);
}
