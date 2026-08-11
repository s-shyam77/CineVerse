import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Check, 
  X, 
  Star, 
  Clock, 
  Film, 
  Tv, 
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import RatingBadge from './RatingBadge';
import GenrePill from './GenrePill';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const MovieModal = ({ movie, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [details, setDetails] = useState(movie || null);
  const [inWatchlist, setInWatchlist] = useState(movie?.is_in_watchlist || false);
  const [loading, setLoading] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !movie?.id) return;
    setDetails(movie);
    setInWatchlist(movie.is_in_watchlist || false);

    const fetchFullDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/movies/${movie.id}`);
        setDetails(res.data);
        if (res.data.is_in_watchlist !== undefined) {
          setInWatchlist(res.data.is_in_watchlist);
        }
      } catch (err) {
        console.warn('Error fetching modal details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [isOpen, movie]);

  if (!isOpen || !details) return null;

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to save titles to your watchlist', 'info');
      return;
    }
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await api.delete(`/api/watchlist/${details.id}`);
        setInWatchlist(false);
        addToast('Removed from Watchlist', 'info');
      } else {
        await api.post(`/api/watchlist/${details.id}`);
        setInWatchlist(true);
        addToast('Added to Watchlist!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update watchlist', 'error');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const trailerKey = details.trailer_key;
  const embedUrl = trailerKey 
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card - Full screen on mobile, elegant card on tablet/desktop */}
      <div className="relative w-full sm:max-w-4xl h-full sm:h-auto max-h-screen sm:max-h-[92vh] bg-[#0c1020] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-white/15 z-10 animate-fade-in my-auto flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/80 hover:bg-black text-white transition-all duration-200 border border-white/20 shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player / Backdrop Header Area */}
        <div className="relative w-full aspect-video sm:max-h-[380px] md:max-h-[420px] bg-black shrink-0 overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={details.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={details.backdrop_url || details.poster_url}
                alt={details.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1020] via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  to={`/watch/${details.id}`}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-purple-500 transition-all"
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body Details */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6 flex-1 pb-12 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <RatingBadge rating={details.rating} size="sm" />
                <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-slate-300">
                  {details.release_year}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-slate-300">
                  {details.age_rating || 'PG-13'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {details.duration}
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60">
                  {details.type}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white font-['Outfit']">
                {details.title}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/watch/${details.id}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-purple-900/40"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Full
              </Link>

              <button
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
                className="p-3 rounded-2xl glass-panel text-white hover:bg-white/15 transition-colors border border-white/10"
                title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {inWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5 text-slate-300" />}
              </button>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {details.genres?.map((g) => (
              <GenrePill key={g.id || g.name || g} genre={g} />
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
            {details.description}
          </p>

          {/* Cast */}
          {details.cast_members && details.cast_members.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Starring Cast
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {details.cast_members.slice(0, 4).map((actor) => (
                  <div key={actor.id || actor.name} className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0">
                      {actor.image_url ? (
                        <img src={actor.image_url} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-purple-300 text-xs">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      {actor.character && <p className="text-[10px] text-slate-400 truncate">{actor.character}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieModal;
