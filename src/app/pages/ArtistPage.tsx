import { useParams, Link } from "react-router";
import { AlbumCard } from "../components/AlbumCard";
import { ChevronRight, Music, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { getArtist } from "../lib/api";

interface Album {
  id: string;
  title: string;
  artist_id: string;
  year: number;
  cover_url: string;
  genres: string[];
  averageRating?: number;
  totalRatings?: number;
}

interface Artist {
  id: string;
  name: string;
  image_url: string;
  bio: string;
  genres: string[];
  albums: Album[];
}

export function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;

      try {
        const data = await getArtist(id);
        setArtist(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching artist:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load artist";
        
        // Check if it's a UUID validation error
        if (errorMessage.includes("uuid") || errorMessage.includes("UUID")) {
          setError("Invalid artist ID. This artist may not exist.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? "Error Loading Artist" : "Artist Not Found"}
          </h2>
          <p className="text-red-400 mb-6">
            {error || "This artist doesn't exist or the link may be invalid."}
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const artistAlbums = artist.albums || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
        <Link to="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{artist.name}</span>
      </div>

      {/* Artist Header */}
      <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
        <img
          src={artist.image_url}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-5xl font-bold text-white mb-2">{artist.name}</h1>
          <div className="flex items-center gap-2 text-neutral-300">
            <Tag className="w-4 h-4" />
            <span>{artist.genres.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Artist Bio */}
      <section className="mb-12">
        <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-4">About</h2>
          <p className="text-neutral-300 leading-relaxed">{artist.bio}</p>
        </div>
      </section>

      {/* Discography */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-violet-500" />
          <h2 className="text-2xl font-bold text-white">Discography</h2>
        </div>
        {artistAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {artistAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
            <p className="text-neutral-400">No albums found for this artist.</p>
          </div>
        )}
      </section>
    </div>
  );
}