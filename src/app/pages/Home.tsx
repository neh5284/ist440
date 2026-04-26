import { AlbumCard } from "../components/AlbumCard";
import { Search, Loader, TrendingUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { searchAlbumsInDb, getPopularAlbums, Album } from "../lib/supabase-albums";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load popular albums from Supabase on mount
  useEffect(() => {
    const loadPopular = async () => {
      setTrendingLoading(true);
      setTrendingError(null);
      try {
        const albums = await getPopularAlbums(12);

        if (albums.length === 0) {
          setTrendingError("No albums found in database");
        } else {
          setTrendingAlbums(albums);
        }
      } catch (err) {
        console.error("Error loading popular albums from Supabase:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load albums from database";
        setTrendingError(errorMessage);
      } finally {
        setTrendingLoading(false);
      }
    };

    loadPopular();
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If query is empty, reset
    if (!searchQuery.trim()) {
      setAlbums([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Set up new debounced search
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchAlbumsInDb(searchQuery, 20);
        setAlbums(results);
        setHasSearched(true);
      } catch (err) {
        console.error("Error searching albums in Supabase:", err);
        setError(err instanceof Error ? err.message : "Failed to search albums in database");
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section with Search */}
      <div className="mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-12">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Discover Your Next Favorite Album
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Search thousands of albums, rate, and review your favorites.
            </p>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for albums, artists, or songs..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-lg"
                />
                {loading && (
                  <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-600 animate-spin" />
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 bg-red-900/20 border border-red-900 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-400 mb-1">Search Error</h3>
              <p className="text-red-300 text-sm mb-3">{error}</p>
              <div className="bg-neutral-900 border border-neutral-700 rounded p-3 text-sm text-neutral-300">
                <p className="mb-2"><strong>Suggestions:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your internet connection</li>
                  <li>Try searching with different keywords</li>
                  <li>The database may be temporarily unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Section - Show when not searching */}
      {!hasSearched && !searchQuery && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-violet-500" />
            <h2 className="text-3xl font-bold text-white">
              Popular Albums
            </h2>
          </div>

          {trendingLoading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
              <p className="text-neutral-400">Loading popular albums...</p>
            </div>
          ) : trendingError ? (
            <div className="bg-orange-900/20 border border-orange-900/50 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-orange-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-semibold">Unable to Load Albums</h3>
              </div>
              <p className="text-orange-300 text-sm mb-4">{trendingError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : trendingAlbums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {trendingAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
              <p className="text-neutral-400">No albums found in database</p>
              <p className="text-neutral-500 text-sm mt-2">The database may be empty or unavailable</p>
            </div>
          )}
        </section>
      )}

      {/* Quick Search Suggestions - Show when not searching */}
      {!hasSearched && !searchQuery && (
        <section>
          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
            <Search className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start Your Music Journey</h3>
            <p className="text-neutral-400 mb-6">Search our database of thousands of albums</p>

            <div className="max-w-md mx-auto">
              <p className="text-sm text-neutral-500 mb-3">Try searching for an album or artist:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["The Beatles", "Taylor Swift", "Pink Floyd", "Kendrick Lamar", "Daft Punk"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && hasSearched && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Searching albums...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Search Results
              <span className="ml-3 text-neutral-400 text-lg">
                ({albums.length} {albums.length === 1 ? 'album' : 'albums'} found)
              </span>
            </h2>
          </div>

          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
              <Search className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-400">No albums found for "{searchQuery}"</p>
              <p className="text-neutral-500 text-sm mt-2">Try different keywords or check your spelling</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}