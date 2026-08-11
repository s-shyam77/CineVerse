import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Trash2, Play } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

const Watchlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/watchlist');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleWatchlistChange = (movieId, isSaved) => {
    if (!isSaved) {
      setItems((prev) => prev.filter((item) => item.movie.id !== movieId));
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Personal Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
          My Watchlist
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your curated list of movies and series to stream later.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              movie={{ ...item.movie, is_in_watchlist: true }}
              onWatchlistChange={handleWatchlistChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-md mx-auto space-y-4">
          <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-sm text-slate-400">
            Explore our universe of movies and series, and click the "+" button to save them here.
          </p>
          <Link
            to="/movies"
            className="inline-block px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
          >
            Browse Movies Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
