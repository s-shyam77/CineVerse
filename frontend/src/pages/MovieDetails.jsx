import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Check, 
  Star, 
  Calendar, 
  Clock, 
  Shield, 
  User, 
  Sparkles,
  Share2,
  Film
} from 'lucide-react';
import api from '../services/api';
import RatingBadge from '../components/RatingBadge';
import GenrePill from '../components/GenrePill';
import MovieRow from '../components/MovieRow';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [detailRes, similarRes] = await Promise.all([
          api.get(`/api/movies/${id}`),
          api.get(`/api/movies/${id}/similar`),
        ]);
        setMovie(detailRes.data);
        setInWatchlist(detailRes.data.is_in_watchlist || false);
        setSimilarMovies(similarRes.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        addToast('Failed to load movie information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, addToast]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await api.delete(`/api/watchlist/${movie.id}`);
        setInWatchlist(false);
        addToast('Removed from Watchlist', 'info');
      } else {
        await api.post(`/api/watchlist/${movie.id}`);
        setInWatchlist(true);
        addToast('Saved to your Watchlist!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update watchlist', 'error');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Watch ${movie?.title} for free on CineVerse!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Movie link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center max-w-md mx-auto">
        <Film className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <Link to="/movies" className="inline-block mt-4 px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 space-y-12">
      {/* Hero Backdrop Cover */}
      <div className="relative w-full h-[65vh] min-h-[480px] max-h-[700px] overflow-hidden">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-cine-bg/50 to-transparent" />
      </div>

      {/* Main Details Card Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Movie Poster */}
          <div className="w-48 sm:w-64 md:w-72 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 glow-purple">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Metadata & Synopsis */}
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <RatingBadge rating={movie.rating} size="lg" />
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                  {movie.release_year}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                  {movie.age_rating || 'PG-13'}
                </span>
                <span className="text-sm font-medium text-slate-300">
                  {movie.duration}
                </span>
                <span className="text-xs uppercase font-bold text-purple-400 px-2.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60">
                  {movie.type}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit']">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres?.map((g) => (
                  <GenrePill key={g.id || g.name} genre={g} />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 flex-wrap pt-2">
              <Link
                to={`/watch/${movie.id}`}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-base hover:scale-105 transition-all shadow-xl shadow-purple-900/40"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Full Movie
              </Link>

              <button
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-slate-200 hover:text-white font-semibold text-sm hover:bg-white/15 transition-all border border-white/10"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    In My List
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-slate-300" />
                    Add to My List
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/15 transition-colors border border-white/10"
                title="Share Movie"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Official Trailer Video Section if trailer available */}
            {movie.trailer_key && (
              <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 font-['Outfit']">
                  <Play className="w-4 h-4 text-pink-400 fill-current" />
                  Official HD Trailer
                </h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailer_key}?rel=0`}
                    title={movie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Synopsis */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-white tracking-wide">Overview</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {movie.description}
              </p>
              {movie.director && (
                <div className="pt-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Director:</span> {movie.director}
                </div>
              )}
            </div>

            {/* Cast Carousel / Grid */}
            {movie.cast_members && movie.cast_members.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 font-['Outfit']">
                  <User className="w-4 h-4 text-purple-400" />
                  Top Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.cast_members.map((actor) => (
                    <div
                      key={actor.id}
                      className="glass-panel p-3 rounded-2xl border border-white/5 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-purple-500/30">
                        {actor.image_url ? (
                          <img
                            src={actor.image_url}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-purple-300 text-xs">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                        {actor.character && (
                          <p className="text-[11px] text-slate-400 truncate">{actor.character}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Similar Titles */}
      {similarMovies.length > 0 && (
        <div className="pt-6">
          <MovieRow
            title="More Like This"
            icon={Sparkles}
            movies={similarMovies}
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
