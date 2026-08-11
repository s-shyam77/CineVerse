import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { MovieCardSkeleton } from './SkeletonLoader';

const MovieRow = ({ title, icon: Icon, movies = [], loading = false, exploreLink, onWatchlistChange }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-3 sm:py-4 group">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />}
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide font-['Outfit'] truncate">
            {title}
          </h2>
        </div>
        {exploreLink && (
          <Link
            to={exploreLink}
            className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-pink-400 transition-colors flex items-center gap-0.5 shrink-0 ml-2"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Row Carousel Area */}
      <div className="relative">
        {/* Left Scroll Button (Desktop/Tablet) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-purple-600/80 shadow-2xl"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Scroll Button (Desktop/Tablet) */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-purple-600/80 shadow-2xl"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Movies List Horizontal Scroll - Touch Friendly */}
        <div
          ref={rowRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth touch-pan-x"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
          ) : (
            movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlistChange={onWatchlistChange}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
