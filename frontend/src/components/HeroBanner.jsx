import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, Volume2, VolumeX, Sparkles, Film } from 'lucide-react';
import RatingBadge from './RatingBadge';
import GenrePill from './GenrePill';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DEFAULT_BANNER_BACKDROP = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1920&auto=format&fit=crop";

const HeroBanner = ({ movie }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [inWatchlist, setInWatchlist] = useState(movie?.is_in_watchlist || false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // If no movie passed, render a stunning default CineVerse Welcome Hero
  if (!movie) {
    return (
      <div className="relative w-full h-[70vh] min-h-[480px] max-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={DEFAULT_BANNER_BACKDROP}
            alt="CineVerse Cinema"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-cine-bg/70 to-transparent w-full md:w-3/4" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              100% FREE STREAMING
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg font-['Outfit']">
              Welcome to <span className="text-gradient">CineVerse</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
              Stream unlimited movies, blockbuster cinema, anime universes, and top-rated TV series with zero subscriptions and zero fees.
            </p>
            <div className="flex items-center gap-3.5 pt-2 flex-wrap">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-sm sm:text-base hover:scale-105 transition-all shadow-xl shadow-purple-900/40"
              >
                <Play className="w-5 h-5 fill-current" />
                Browse Catalog
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-slate-200 hover:text-white font-semibold text-sm hover:bg-white/15 transition-all border border-white/10"
              >
                <Film className="w-4 h-4 text-purple-400" />
                Search Titles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingWatchlist(true);
    try {
      if (inWatchlist) {
        await api.delete(`/api/watchlist/${movie.id}`);
        setInWatchlist(false);
        addToast('Removed from Watchlist', 'info');
      } else {
        await api.post(`/api/watchlist/${movie.id}`);
        setInWatchlist(true);
        addToast('Added to Watchlist!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update watchlist', 'error');
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const backdropSrc = movie.backdrop_url || movie.poster_url || DEFAULT_BANNER_BACKDROP;

  return (
    <div className="relative w-full h-[75vh] min-h-[520px] max-h-[750px] overflow-hidden">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={backdropSrc}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradient overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-cine-bg/70 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">
        <div className="max-w-2xl space-y-4 animate-fade-in">
          
          {/* Tag / Quality badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              {movie.type === 'series' ? 'FEATURED SERIES' : 'FEATURED PREMIERE'}
            </span>
            <RatingBadge rating={movie.rating} size="sm" />
            <span className="text-xs font-medium text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/10">
              {movie.release_year}
            </span>
            <span className="text-xs font-medium text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/10">
              {movie.age_rating || 'PG-13'}
            </span>
            <span className="text-xs text-slate-400 font-medium">{movie.duration}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg font-['Outfit']">
            {movie.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {movie.genres?.map((g) => (
              <GenrePill key={g.id || g.name || g} genre={g} />
            ))}
          </div>

          {/* Synopsis Description */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5 pt-2 flex-wrap">
            <Link
              to={`/watch/${movie.id}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-900/40 hover:shadow-pink-600/40"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </Link>

            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-slate-200 hover:text-white font-semibold text-sm hover:bg-white/15 transition-all border border-white/10"
            >
              <Info className="w-4 h-4 text-purple-400" />
              More Info
            </Link>

            <button
              onClick={handleToggleWatchlist}
              disabled={loadingWatchlist}
              title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
              className="p-3.5 rounded-2xl glass-panel text-slate-200 hover:text-white hover:bg-white/15 transition-all border border-white/10"
            >
              {inWatchlist ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Plus className="w-5 h-5 text-slate-300" />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
