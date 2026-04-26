import { Link } from "react-router";
import { Star } from "lucide-react";

interface Album {
  id: string;
  title: string;
  artist_id?: string;
  artist?: string;
  artists?: {
    id: string;
    name: string;
    genre: string;
  };
  year: number;
  cover_url?: string;
  coverUrl?: string;
  genre?: string;
  genres?: string[];
  averageRating?: number;
  totalRatings?: number;
}

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const coverImage = album.cover_url || album.coverUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400';
  const artistName = album.artists?.name || album.artist || '';
  const genre = album.artists?.genre || album.genre || (album.genres && album.genres.length > 0 ? album.genres[0] : '');

  return (
    <Link to={`/album/${album.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900 mb-3">
        <img
          src={coverImage}
          alt={`${album.title} cover`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(album.averageRating !== undefined || album.totalRatings !== undefined) && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              {album.averageRating !== undefined && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold text-lg">{album.averageRating.toFixed(1)}</span>
                </div>
              )}
              {album.totalRatings !== undefined && (
                <p className="text-neutral-300 text-sm">{album.totalRatings.toLocaleString()} ratings</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors line-clamp-1">
          {album.title}
        </h3>
        <p className="text-sm text-neutral-400 mb-1">{artistName}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{album.year}</span>
          {genre && (
            <>
              <span>•</span>
              <span className="line-clamp-1">{genre}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}