import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info, Film, Tv, Sparkles } from 'lucide-react';
import RatingBadge from './RatingBadge';
import MovieModal from './MovieModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DEFAULT_FALLBACK_POSTER = "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop";

const MovieCard = ({ movie, progressPercent, onWatchlistChange }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(movie.is_in_watchlist || false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/api/watchlist/${movie.id}`);
        setIsSaved(false);
        addToast('Removed from Watchlist', 'info');
        if (onWatchlistChange) onWatchlistChange(movie.id, false);
      } else {
        await api.post(`/api/watchlist/${movie.id}`);
        setIsSaved(true);
        addToast('Added to Watchlist!', 'success');
        if (onWatchlistChange) onWatchlistChange(movie.id, true);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update watchlist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const posterSrc = (!imgError && movie.poster_url) ? movie.poster_url : DEFAULT_FALLBACK_POSTER;

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group relative shrink-0 w-[160px] sm:w-[200px] md:w-[220px] transition-all duration-300 transform hover:-translate-y-2 select-none cursor-pointer"
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 group-hover:border-purple-500/60 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-900/30">
          <img
            src={posterSrc}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Type Badge (Movie/Series) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-purple-300 border border-purple-500/30 backdrop-blur-md">
              {movie.type === 'series' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
              {movie.type}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <RatingBadge rating={movie.rating} size="sm" />
          </div>

          {/* Hover Overlay with Quick Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 gap-2">
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/watch/${movie.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:from-purple-500 hover:to-pink-500 shadow-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Play
              </Link>

              <button
                onClick={handleWatchlistClick}
                disabled={saving}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-colors"
                title={isSaved ? 'Remove from My List' : 'Add to My List'}
              >
                {isSaved ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-200" />
                )}
              </button>
            </div>
          </div>

          {/* Continue Watching Progress Bar */}
          {progressPercent !== undefined && progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
              />
            </div>
          )}
        </div>

        {/* Title and Metadata info */}
        <div className="mt-2.5 space-y-1">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{movie.release_year}</span>
            <span>•</span>
            <span className="truncate">{movie.duration}</span>
          </div>
        </div>
      </div>

      {/* Video / Details Modal */}
      <MovieModal
        movie={movie}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default MovieCard;
