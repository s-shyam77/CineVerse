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
  Sparkles,
  Server,
  Loader2,
  ShieldAlert,
  Zap,
  Globe
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
  const [selectedServer, setSelectedServer] = useState('vidsrc_cc');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !movie?.id) return;
    setDetails(movie);
    setInWatchlist(movie.is_in_watchlist || false);
    setSelectedServer('vidsrc_cc');
    setIframeLoading(true);

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

  useEffect(() => {
    setIframeLoading(true);
  }, [selectedServer, season, episode]);

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

  const isSeries = details.type === 'series';
  const id = details.id;

  // Stream embed URL generator
  const getEmbedUrl = () => {
    if (!id) return '';
    if (selectedServer === 'vidsrc_cc') {
      return isSeries 
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`;
    }
    if (selectedServer === 'embed_su') {
      return isSeries 
        ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
        : `https://embed.su/embed/movie/${id}`;
    }
    if (selectedServer === 'autoembed') {
      return isSeries 
        ? `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${id}`;
    }
    if (selectedServer === 'trailer' && details.trailer_key) {
      return `https://www.youtube.com/embed/${details.trailer_key}?autoplay=1&rel=0`;
    }
    return `https://vidsrc.cc/v2/embed/movie/${id}`;
  };

  const embedUrl = getEmbedUrl();

  const handleOpenExternalWindow = () => {
    if (embedUrl) {
      window.open(embedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full sm:max-w-4xl h-full sm:h-auto max-h-screen sm:max-h-[92vh] bg-[#0c1020] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-white/15 z-10 animate-fade-in my-auto flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/80 hover:bg-black text-white transition-all duration-200 border border-white/20 shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Header Area */}
        <div className="relative w-full aspect-video sm:max-h-[380px] md:max-h-[420px] bg-black shrink-0 overflow-hidden">
          {embedUrl ? (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-none gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">Connecting to stream server...</p>
                </div>
              )}
              <iframe
                key={`${selectedServer}-${season}-${episode}`}
                src={embedUrl}
                title={details.title}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture"
                allowFullScreen={true}
                referrerPolicy="no-referrer"
                loading="eager"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-0"
              />
            </>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={details.backdrop_url || details.poster_url}
                alt={details.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1020] via-black/40 to-transparent" />
            </div>
          )}
        </div>

        {/* Notice & Server Selector Bar in Modal */}
        <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-amber-950/40 to-purple-950/30 border-b border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>If stream fails to load on Jio/Airtel, switch servers or click <strong>Player Window</strong>.</span>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-black/40 border-b border-white/5 flex-wrap">
          {/* Server Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400 fill-current" /> Stream:
            </span>
            <button
              onClick={() => setSelectedServer('vidsrc_cc')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedServer === 'vidsrc_cc'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Server 1 (VidSrc CC - Primary)
            </button>
            <button
              onClick={() => setSelectedServer('embed_su')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedServer === 'embed_su'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Server 2 (Embed.su)
            </button>
            <button
              onClick={() => setSelectedServer('autoembed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedServer === 'autoembed'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Server 3 (AutoEmbed)
            </button>
            {details.trailer_key && (
              <button
                onClick={() => setSelectedServer('trailer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedServer === 'trailer'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Trailer
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Series Episode Selector */}
            {isSeries && selectedServer !== 'trailer' && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <select
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-white/10 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={s}>S{s}</option>
                  ))}
                </select>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-white/10 text-xs"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Ep {i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Direct Window Fallback Button */}
            <button
              onClick={handleOpenExternalWindow}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-300 hover:text-white text-xs font-semibold transition-colors"
              title="Open stream in a clean external player window"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Player Window</span>
            </button>
          </div>
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
                Full Cinema Page
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
