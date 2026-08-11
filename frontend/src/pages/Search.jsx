import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Film, Tv, Sparkles, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/SkeletonLoader';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchTerm, type) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = `/api/search?q=${encodeURIComponent(searchTerm.trim())}&limit=40`;
      if (type) {
        url += `&type=${type}`;
      }
      const res = await api.get(url);
      setResults(res.data);
    } catch (err) {
      console.error('Search query error:', err);
      setError('Unable to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setSearchParams({ q: query.trim() });
        performSearch(query, typeFilter);
      } else {
        setSearchParams({});
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, typeFilter, performSearch, setSearchParams]);

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
    setResults([]);
  };

  const sampleKeywords = ['Spiderman', 'Batman', 'Avengers', 'Inception', 'Solo Leveling', 'Naruto', 'Interstellar', 'Anime', 'Dune'];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Input Field */}
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit']">
          Search the <span className="text-gradient">CineVerse</span>
        </h1>
        <p className="text-sm text-slate-400">
          Find your next favorite film, series, genre, or director instantly.
        </p>

        {/* Large Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Type titles, actors, directors, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-13 pr-12 py-4 rounded-2xl bg-slate-900/90 border-2 border-purple-500/30 text-white placeholder-slate-400 text-base sm:text-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 shadow-2xl transition-all backdrop-blur-xl"
          />
          <SearchIcon className="w-6 h-6 text-purple-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={clearSearch}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 pt-2">
            <span className="font-semibold text-slate-300">Popular Searches:</span>
            {sampleKeywords.map((k) => (
              <button
                key={k}
                onClick={() => setQuery(k)}
                className="px-3 py-1 rounded-full glass-panel hover:border-purple-500/60 hover:text-purple-300 transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {query && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                typeFilter === '' ? 'bg-purple-600 text-white' : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('movie')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                typeFilter === 'movie' ? 'bg-purple-600 text-white' : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" /> Movies
            </button>
            <button
              onClick={() => setTypeFilter('series')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                typeFilter === 'series' ? 'bg-purple-600 text-white' : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> Series
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="pt-4">
        {loading ? (
          <GridSkeleton count={12} />
        ) : error ? (
          <div className="text-center py-16 glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Search Error</h3>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
        ) : query && results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Found {results.length} results for "{query}"
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        ) : query && results.length === 0 && !loading ? (
          <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <SearchIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Results Found</h3>
            <p className="text-sm text-slate-400 mt-2">
              We couldn't find matches for "{query}". Try checking your spelling or search for broader terms like "Action" or "Sci-Fi".
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
