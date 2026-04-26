import { TrendingUp, Music, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { getTopTracks, ChartTrack } from "../lib/lastfm-api";
import { ChartItem } from "../components/ChartItem";

export function Charts() {
  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoading(true);
      setError(null);

      try {
        const topTracks = await getTopTracks(50);
        setTracks(topTracks);
      } catch (err) {
        console.error("Error fetching top tracks:", err);
        setError(err instanceof Error ? err.message : "Failed to load charts");
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-10 h-10 text-violet-500" />
          <h1 className="text-4xl font-bold text-white">Global Top Tracks</h1>
        </div>
        <p className="text-neutral-400">
          Discover the most popular tracks worldwide powered by Last.fm
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <Loader className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading top tracks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Charts</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Chart List */}
      {!loading && !error && (
        <>
          {tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map((track) => (
                <ChartItem
                  key={`${track.rank}-${track.title}-${track.artist}`}
                  rank={track.rank}
                  title={track.title}
                  artist={track.artist}
                  playCount={track.playCount}
                  listeners={track.listeners}
                  imageUrl={track.imageUrl}
                  url={track.url}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
              <Music className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Chart Data Available</h3>
              <p className="text-neutral-400">
                Unable to load chart data at this time. Please try again later.
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer Info */}
      {!loading && !error && tracks.length > 0 && (
        <div className="mt-8 p-6 bg-neutral-900 rounded-lg border border-neutral-800">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">About This Chart</h3>
              <p className="text-sm text-neutral-400">
                This chart displays the top {tracks.length} most-played tracks globally, updated
                regularly from Last.fm's extensive music database. Play counts and listener
                statistics are updated in real-time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}