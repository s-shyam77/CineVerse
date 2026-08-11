import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Film } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center text-center">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 space-y-6 shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white font-['Outfit']">404</h1>
          <h2 className="text-xl font-bold text-white">Lost in the Universe?</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The galaxy or title you are looking for does not exist or has been shifted across spacetime.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/movies"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-panel text-slate-200 hover:text-white font-bold text-xs transition-colors border border-white/10"
          >
            <Film className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
