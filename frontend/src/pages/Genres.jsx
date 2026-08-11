import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/SkeletonLoader';

const Genres = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const [activeGenreSlug, setActiveGenreSlug] = useState(searchParams.get('genre') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/api/genres');
        setGenres(res.data);
        if (!activeGenreSlug && res.data.length > 0) {
          setActiveGenreSlug(res.data[0].slug);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenres();
  }, []);

  // Update active genre when URL query params change
  useEffect(() => {
    const queryGenre = searchParams.get('genre');
    if (queryGenre) {
      setActiveGenreSlug(queryGenre);
    }
  }, [searchParams]);

  // Fetch movies for current genre
  useEffect(() => {
    if (!activeGenreSlug) return;
    const fetchGenreMovies = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/movies?genre=${activeGenreSlug}&limit=50`);
        setMovies(res.data);
      } catch (err) {
        console.error('Error fetching genre movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreMovies();
  }, [activeGenreSlug]);

  const handleSelectGenre = (slug) => {
    setActiveGenreSlug(slug);
    setSearchParams({ genre: slug });
  };

  const activeGenre = genres.find((g) => g.slug === activeGenreSlug);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Compass className="w-4 h-4" />
          <span>Category Explorer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
          Explore Genres
        </h1>
      </div>

      {/* Genre Chips Matrix */}
      <div className="flex flex-wrap gap-2.5 pb-2">
        {genres.map((g) => {
          const isActive = g.slug === activeGenreSlug;
          return (
            <button
              key={g.id}
              onClick={() => handleSelectGenre(g.slug)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-lg shadow-purple-900/50 scale-105'
                  : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10 hover:border-purple-500/40'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Current Category Display */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-['Outfit']">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {activeGenre?.name || 'Selected'} Highlights ({movies.length} titles)
        </h2>

        {loading ? (
          <GridSkeleton count={12} />
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No titles in this genre yet</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Genres;
