import { useSearchParams, Link } from "react-router";
import { AlbumCard } from "../components/AlbumCard";
import { Search as SearchIcon, Music, User, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { search as searchAPI } from "../lib/api";
import { AdvancedSearchModal } from "../components/AdvancedSearchModal";

interface Album {
  id: string;
  title: string;
  artist_id: string;
  artists?: {
    id: string;
    name: string;
    genre: string;
  };
  year: number;
  cover_url: string;
  genre?: string;
  genres?: string[];
  averageRating?: number;
  totalRatings?: number;
}

interface Artist {
  id: string;
  name: string;
  image_url: string;
  genres: string[];
}

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<"albums" | "artists">("albums");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    genre: "All Genres",
    yearFrom: "",
    yearTo: "",
    minRating: "",
    sortBy: "relevance",
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setAlbums([]);
        setFilteredAlbums([]);
        setArtists([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchAPI(query);
        setAlbums(results.albums || []);
        setFilteredAlbums(results.albums || []);
        setArtists(results.artists || []);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Apply filters whenever albums or filters change
  useEffect(() => {
    let result = [...albums];

    // Filter by genre
    if (filters.genre !== "All Genres") {
      result = result.filter((album) => {
        const albumGenres = album.genres || [];
        const artistGenre = album.artists?.genre || "";
        return (
          albumGenres.some((g) => g.toLowerCase() === filters.genre.toLowerCase()) ||
          artistGenre.toLowerCase() === filters.genre.toLowerCase()
        );
      });
    }

    // Filter by year range
    if (filters.yearFrom) {
      result = result.filter((album) => album.year >= parseInt(filters.yearFrom));
    }
    if (filters.yearTo) {
      result = result.filter((album) => album.year <= parseInt(filters.yearTo));
    }

    // Filter by minimum rating
    if (filters.minRating) {
      result = result.filter((album) => (album.averageRating || 0) >= parseFloat(filters.minRating));
    }

    // Sort results
    switch (filters.sortBy) {
      case "rating_desc":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "rating_asc":
        result.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
        break;
      case "year_desc":
        result.sort((a, b) => b.year - a.year);
        break;
      case "year_asc":
        result.sort((a, b) => a.year - b.year);
        break;
      case "popularity":
        result.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
        break;
      // "relevance" - keep original order
    }

    setFilteredAlbums(result);
  }, [albums, filters]);

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = 
    filters.genre !== "All Genres" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.minRating !== "" ||
    filters.sortBy !== "relevance";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AdvancedSearchModal
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-8 h-8 text-violet-500" />
            <h1 className="text-4xl font-bold text-white">Search Results</h1>
          </div>
          {query && activeTab === "albums" && (
            <button
              onClick={() => setAdvancedSearchOpen(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors ${
                hasActiveFilters
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Advanced Search</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>
          )}
        </div>
        {query && (
          <p className="text-neutral-400">
            {loading ? "Searching..." : `Found ${filteredAlbums.length + artists.length} results for "${query}"`}
          </p>
        )}
      </div>

      {query ? (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-neutral-800">
            <button
              onClick={() => setActiveTab("albums")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "albums"
                  ? "text-white border-violet-500"
                  : "text-neutral-400 border-transparent hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>Albums ({albums.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "artists"
                  ? "text-white border-violet-500"
                  : "text-neutral-400 border-transparent hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Artists ({artists.length})</span>
              </div>
            </button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <>
              {activeTab === "albums" && (
                <>
                  {filteredAlbums.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {filteredAlbums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
                      <p className="text-neutral-400">No albums found for "{query}"</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "artists" && (
                <>
                  {artists.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {artists.map((artist) => (
                        <Link
                          key={artist.id}
                          to={`/artist/${artist.id}`}
                          className="group block"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900 mb-3">
                            <img
                              src={artist.image_url}
                              alt={artist.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                            {artist.name}
                          </h3>
                          <p className="text-sm text-neutral-400">
                            {artist.genres && artist.genres.length > 0 ? artist.genres[0] : 'Unknown'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
                      <p className="text-neutral-400">No artists found for "{query}"</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
          <SearchIcon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400">Enter a search query to find albums and artists</p>
        </div>
      )}
    </div>
  );
}