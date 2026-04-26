import { X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface AdvancedSearchFilters {
  genre: string;
  yearFrom: string;
  yearTo: string;
  minRating: string;
  sortBy: string;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedSearchFilters) => void;
  currentFilters: AdvancedSearchFilters;
}

const GENRES = [
  "All Genres",
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Folk",
  "Metal",
  "Indie",
  "Soul",
  "Funk",
  "Blues",
  "Reggae",
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "rating_asc", label: "Lowest Rated" },
  { value: "year_desc", label: "Newest First" },
  { value: "year_asc", label: "Oldest First" },
  { value: "popularity", label: "Most Popular" },
];

export function AdvancedSearchModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      genre: "All Genres",
      yearFrom: "",
      yearTo: "",
      minRating: "",
      sortBy: "relevance",
    };
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg w-full max-w-2xl mx-4 border border-neutral-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-violet-500" />
            <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Year From
              </label>
              <input
                type="number"
                value={filters.yearFrom}
                onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                placeholder="1960"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Year To
              </label>
              <input
                type="number"
                value={filters.yearTo}
                onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                placeholder={new Date().getFullYear().toString()}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Any Rating</option>
              <option value="1">⭐ 1+ Stars</option>
              <option value="2">⭐ 2+ Stars</option>
              <option value="3">⭐ 3+ Stars</option>
              <option value="4">⭐ 4+ Stars</option>
              <option value="4.5">⭐ 4.5+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-800">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-neutral-400 hover:text-white font-semibold transition-colors"
          >
            Reset Filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
