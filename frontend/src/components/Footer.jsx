import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Film, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#060810] text-slate-400 pt-14 pb-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-[2px]">
                <div className="w-full h-full bg-[#080a14] rounded-[10px] flex items-center justify-center">
                  <Play className="w-4 h-4 text-purple-400 fill-current ml-0.5" />
                </div>
              </div>
              <span className="text-xl font-black text-white font-['Outfit']">
                CINE<span className="text-gradient">VERSE</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience cinema without borders or subscriptions. CineVerse brings you high-fidelity movies, series, and creative commons showcases — 100% free forever.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-cost local & open source media platform</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/movies" className="hover:text-purple-400 transition-colors">Movies Catalog</Link></li>
              <li><Link to="/series" className="hover:text-purple-400 transition-colors">TV Series & Shows</Link></li>
              <li><Link to="/genres" className="hover:text-purple-400 transition-colors">Explore Genres</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition-colors">Search Universe</Link></li>
            </ul>
          </div>

          {/* Col 3: Account */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/profile" className="hover:text-purple-400 transition-colors">User Profile</Link></li>
              <li><Link to="/my-list" className="hover:text-purple-400 transition-colors">My Watchlist</Link></li>
              <li><Link to="/history" className="hover:text-purple-400 transition-colors">Watch History</Link></li>
              <li><Link to="/login" className="hover:text-purple-400 transition-colors">Sign In / Join</Link></li>
            </ul>
          </div>

          {/* Col 4: Open Source & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Open Media</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All video streams utilize open-source creative demonstration media (Blender Open Projects: Sintel, Big Buck Bunny, Tears of Steel).
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>100% Free & Legal Open Source</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CineVerse Platform. Crafted with original branding.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> using React, Vite, Tailwind CSS & FastAPI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
