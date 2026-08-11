import React, { useState, useEffect } from 'react';
import { Film, Filter, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/SkeletonLoader';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/api/genres');
        setGenres(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let url = `/api/movies?type=movie&limit=50`;
        if (selectedGenre) {
          url += `&genre=${selectedGenre}`;
        }
        const res = await api.get(url);
        let list = res.data;

        if (selectedSort === 'year') {
          list.sort((a, b) => b.release_year - a.release_year);
        } else if (selectedSort === 'title') {
          list.sort((a, b) => a.title.localeCompare(b.title));
        } else {
          list.sort((a, b) => b.rating - a.rating);
        }

        setMovies(list);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenre, selectedSort]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Film className="w-4 h-4" />
            <span>Full Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Featured Movies
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore unlimited feature-length films across every dimension.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 rounded-xl glass-panel text-sm text-slate-200 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="" className="bg-slate-900 text-white">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.slug} className="bg-slate-900 text-white">
                {g.name}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2 rounded-xl glass-panel text-sm text-slate-200 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
            <option value="year" className="bg-slate-900 text-white">Newest Release</option>
            <option value="title" className="bg-slate-900 text-white">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
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
          <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your genre filter to discover more titles.
          </p>
        </div>
      )}
    </div>
  );
};

export default Movies;
