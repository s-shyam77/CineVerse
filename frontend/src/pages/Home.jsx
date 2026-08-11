import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Sparkles, Film, Tv, Clock, Compass, Zap } from 'lucide-react';
import api from '../services/api';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import { HeroSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [animeSeries, setAnimeSeries] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [
        featuredRes,
        trendingRes,
        moviesRes,
        seriesRes,
        animeRes,
        scifiRes,
        actionRes,
      ] = await Promise.all([
        api.get('/api/movies/featured').catch(() => ({ data: [] })),
        api.get('/api/movies/trending').catch(() => ({ data: [] })),
        api.get('/api/movies?type=movie&limit=15').catch(() => ({ data: [] })),
        api.get('/api/movies?type=series&limit=15').catch(() => ({ data: [] })),
        api.get('/api/movies/anime').catch(() => ({ data: [] })),
        api.get('/api/movies?genre=sci-fi&limit=15').catch(() => ({ data: [] })),
        api.get('/api/movies?genre=action&limit=15').catch(() => ({ data: [] })),
      ]);

      setFeaturedMovies(featuredRes.data);
      setTrendingMovies(trendingRes.data);
      setPopularMovies(moviesRes.data);
      setPopularSeries(seriesRes.data);
      setAnimeSeries(animeRes.data);
      setSciFiMovies(scifiRes.data);
      setActionMovies(actionRes.data);

      // If logged in, fetch continue watching
      if (isAuthenticated) {
        try {
          const historyRes = await api.get('/api/history?limit=10');
          const historyList = historyRes.data
            .filter((h) => h.progress > 5 && h.duration > 0 && h.progress < h.duration - 30)
            .map((h) => ({
              ...h.movie,
              progressPercent: (h.progress / h.duration) * 100,
            }));
          setContinueWatching(historyList);
        } catch (e) {
          console.warn('History fetch error:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching home feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [isAuthenticated]);

  const randomHeroMovie = featuredMovies.length > 0 ? featuredMovies[0] : (trendingMovies[0] || null);

  return (
    <div className="min-h-screen pb-16 space-y-6">
      {/* Hero Banner */}
      {loading ? <HeroSkeleton /> : <HeroBanner movie={randomHeroMovie} />}

      {/* Main Content Rows */}
      <div className="space-y-6 -mt-10 relative z-20">
        
        {/* Continue Watching (Only for logged in with progress) */}
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            icon={Clock}
            movies={continueWatching}
            loading={loading}
          />
        )}

        {/* Trending Now */}
        <MovieRow
          title="Trending Now"
          icon={Flame}
          movies={trendingMovies}
          loading={loading}
        />

        {/* Dedicated Anime Universe */}
        <MovieRow
          title="Anime & Manga Universe (Solo Leveling, Attack on Titan & More)"
          icon={Zap}
          movies={animeSeries}
          loading={loading}
          exploreLink="/genres?genre=anime"
        />

        {/* Blockbuster Movies */}
        <MovieRow
          title="Popular Blockbuster Movies"
          icon={Film}
          movies={popularMovies}
          loading={loading}
          exploreLink="/movies"
        />

        {/* Binge-Worthy Series */}
        <MovieRow
          title="Top Rated TV Series"
          icon={Tv}
          movies={popularSeries}
          loading={loading}
          exploreLink="/series"
        />

        {/* Sci-Fi Universe */}
        <MovieRow
          title="Mind-Bending Sci-Fi"
          icon={Sparkles}
          movies={sciFiMovies}
          loading={loading}
          exploreLink="/genres?genre=sci-fi"
        />

        {/* Action & Adventure */}
        <MovieRow
          title="High-Octane Action"
          icon={TrendingUp}
          movies={actionMovies}
          loading={loading}
          exploreLink="/genres?genre=action"
        />
      </div>
    </div>
  );
};

export default Home;
