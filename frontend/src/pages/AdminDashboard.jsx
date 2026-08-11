import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Film, 
  Tv, 
  Play, 
  Bookmark, 
  Plus, 
  Settings, 
  Sparkles, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_movies: 0,
    total_series: 0,
    total_watchlist_items: 0,
    total_plays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Registered Users', value: stats.total_users, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Feature Movies', value: stats.total_movies, icon: Film, color: 'from-purple-500 to-indigo-500' },
    { title: 'TV Series & Shows', value: stats.total_series, icon: Tv, color: 'from-pink-500 to-rose-500' },
    { title: 'Active Stream Sessions', value: stats.total_plays, icon: Play, color: 'from-emerald-500 to-teal-500' },
    { title: 'Total Watchlist Saves', value: stats.total_watchlist_items, icon: Bookmark, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Management Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor platform metrics, manage movie catalog, and oversee user access.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/40"
          >
            <Film className="w-4 h-4" />
            Manage Movies
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-white/10"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 shadow-xl"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
              <p className="text-3xl font-black text-white mt-1 font-['Outfit']">
                {loading ? '...' : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link
          to="/admin/movies"
          className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Film className="w-6 h-6" />
            </div>
            <span className="text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
              Go to Movie Manager →
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
            Movie & Series Catalog
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Create new titles, edit descriptions, adjust streaming URLs, modify release dates, and maintain movie metadata.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-amber-500/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
              Go to User Directory →
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
            User Accounts & Roles
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Inspect all registered accounts, grant administrator privileges, and monitor registration timestamps.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
