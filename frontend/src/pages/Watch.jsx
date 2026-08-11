import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Film, Info, Sparkles, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import RatingBadge from '../components/RatingBadge';
import GenrePill from '../components/GenrePill';

const Watch = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [initialProgress, setInitialProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieToWatch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/movies/${id}`);
        setMovie(res.data);
        if (res.data.watch_progress) {
          setInitialProgress(res.data.watch_progress);
        }
      } catch (err) {
        console.error('Error loading video stream:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieToWatch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black pt-32 px-4 text-center">
        <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Video Stream Unavailable</h2>
        <Link to="/movies" className="inline-block mt-4 px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold">
          Browse Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-2 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Custom Video Player Component */}
        <VideoPlayer movie={movie} initialProgress={initialProgress} />

        {/* Video Info Header Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <RatingBadge rating={movie.rating} size="sm" />
                <span className="text-xs text-slate-300 px-2 py-0.5 rounded bg-white/10">
                  {movie.release_year}
                </span>
                <span className="text-xs text-slate-300 px-2 py-0.5 rounded bg-white/10">
                  {movie.age_rating || 'PG-13'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {movie.duration}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                {movie.title}
              </h1>
            </div>

            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold hover:bg-white/15 transition-all self-start sm:self-center"
            >
              <Info className="w-4 h-4 text-purple-400" />
              Movie Details
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 pt-3">
            {movie.genres?.map((g) => (
              <GenrePill key={g.id || g.name} genre={g} />
            ))}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {movie.description}
          </p>

          {/* Keyboard Shortcuts Hint Bar */}
          <div className="pt-2 flex items-center gap-4 flex-wrap text-[11px] text-slate-400 border-t border-white/5">
            <span className="font-semibold text-slate-300">Player Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">← / →</kbd> Seek 10s</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">M</kbd> Mute</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">F</kbd> Fullscreen</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Watch;
