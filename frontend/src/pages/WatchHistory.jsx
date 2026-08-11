import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Play, Trash2, Clock, Calendar } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const WatchHistory = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/history');
      setHistoryItems(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRemoveItem = async (movieId) => {
    try {
      await api.delete(`/api/history/${movieId}`);
      setHistoryItems((prev) => prev.filter((item) => item.movie_id !== movieId));
      addToast('Removed from watch history', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to remove item', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history?')) return;
    try {
      await api.delete('/api/history');
      setHistoryItems([]);
      addToast('Watch history cleared', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to clear history', 'error');
    }
  };

  const formatProgress = (seconds, totalDuration) => {
    const mins = Math.floor(seconds / 60);
    const totalMins = Math.floor(totalDuration / 60);
    const percent = totalDuration > 0 ? Math.round((seconds / totalDuration) * 100) : 0;
    return {
      text: `${mins}m of ${totalMins}m`,
      percent: Math.min(100, Math.max(2, percent)),
    };
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
            <History className="w-4 h-4" />
            <span>Playback Log</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Watch History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resume watching from where you left off or clear past records.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : historyItems.length > 0 ? (
        <div className="space-y-4">
          {historyItems.map((item) => {
            const { text, percent } = formatProgress(item.progress, item.duration);
            return (
              <div
                key={item.id}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-4 hover:border-purple-500/40 transition-all duration-300 group"
              >
                {/* Poster / Thumbnail */}
                <div className="relative w-full sm:w-40 aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={item.movie.backdrop_url || item.movie.poster_url}
                    alt={item.movie.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1 w-full">
                  <h3 className="text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {item.movie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      {text} ({percent}%)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.last_watched).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={`/watch/${item.movie.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Resume
                  </Link>

                  <button
                    onClick={() => handleRemoveItem(item.movie_id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <History className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Watch History Yet</h3>
          <p className="text-sm text-slate-400">
            Start streaming any movie or show and your progress will automatically appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
