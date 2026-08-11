import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Film, 
  Tv, 
  Compass, 
  Bookmark, 
  History, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X, 
  Play,
  Home as HomeIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Genres', path: '/genres' },
    ...(isAuthenticated ? [{ name: 'My List', path: '/my-list' }] : []),
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-2.5 sm:py-3 shadow-2xl backdrop-blur-xl'
            : 'bg-gradient-to-b from-black/95 via-black/50 to-transparent py-3.5 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[2px] shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                <div className="w-full h-full bg-[#080a14] rounded-[10px] flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 fill-current ml-0.5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-['Outfit'] flex items-center">
                  CINE<span className="text-gradient">VERSE</span>
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-purple-400 -mt-1 hidden sm:inline">
                  100% Free Streaming
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/10 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Input Bar (Tablet & Desktop) */}
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Search movies, anime, series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 md:w-56 lg:w-64 bg-slate-900/80 border border-slate-700/60 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:w-72 focus:border-purple-500 transition-all duration-300 backdrop-blur-md"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Mobile Search Icon */}
              <Link
                to="/search"
                className="sm:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-purple-400" />
              </Link>

              {/* User Profile / Auth State */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none border border-purple-500/40"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-white/10 animate-fade-in z-50">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-purple-400" />
                        Account Profile
                      </Link>

                      <Link
                        to="/my-list"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-pink-400" />
                        My Watchlist
                      </Link>

                      <Link
                        to="/history"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <History className="w-4 h-4 text-cyan-400" />
                        Watch History
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-md"
                  >
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Top Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-nav border-t border-white/10 px-4 pt-3 pb-6 space-y-2 mt-3 animate-fade-in shadow-2xl">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block px-4 py-2.5 rounded-xl text-base font-medium text-amber-300 hover:bg-amber-500/10"
              >
                Admin Dashboard
              </NavLink>
            )}
          </div>
        )}
      </header>

      {/* Netflix-Style Mobile Bottom Navigation Bar (Visible only on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070913]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/movies"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <Film className="w-5 h-5" />
          <span>Movies</span>
        </NavLink>

        <NavLink
          to="/series"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <Tv className="w-5 h-5" />
          <span>Series</span>
        </NavLink>

        <NavLink
          to="/genres"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Genres</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;
