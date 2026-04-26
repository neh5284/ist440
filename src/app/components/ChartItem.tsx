import { Play, TrendingUp } from "lucide-react";

export interface ChartItemProps {
  rank: number;
  title: string;
  artist: string;
  playCount?: number;
  listeners?: number;
  imageUrl: string;
  url: string;
}

export function ChartItem({
  rank,
  title,
  artist,
  playCount,
  listeners,
  imageUrl,
  url,
}: ChartItemProps) {
  const isTopThree = rank <= 3;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 md:gap-6 p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-violet-500 hover:bg-neutral-800 transition-all group"
    >
      {/* Rank */}
      <div className="w-10 md:w-12 text-center flex-shrink-0">
        <span
          className={`text-xl md:text-2xl font-bold ${
            isTopThree ? "text-violet-400" : "text-neutral-500"
          }`}
        >
          {rank}
        </span>
      </div>

      {/* Album Art */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
        <img
          src={imageUrl}
          alt={`${title} by ${artist}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors truncate">
          {title}
        </h3>
        <p className="text-neutral-400 text-sm mb-1 truncate">{artist}</p>
        {(playCount !== undefined || listeners !== undefined) && (
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {playCount !== undefined && (
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>{playCount.toLocaleString()} plays</span>
              </div>
            )}
            {listeners !== undefined && (
              <>
                {playCount !== undefined && <span>•</span>}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{listeners.toLocaleString()} listeners</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Rank Badge for Top 3 */}
      {isTopThree && (
        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 flex-shrink-0">
          <span className="text-white font-bold text-lg">#{rank}</span>
        </div>
      )}
    </a>
  );
}
