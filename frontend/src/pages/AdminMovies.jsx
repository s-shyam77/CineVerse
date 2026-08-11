import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles, 
  Star, 
  Check, 
  X,
  ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import RatingBadge from '../components/RatingBadge';
import { useToast } from '../context/ToastContext';

const DEFAULT_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const AdminMovies = () => {
  const { addToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster_url: '',
    backdrop_url: '',
    video_url: DEFAULT_VIDEO_URL,
    release_year: new Date().getFullYear(),
    duration: '2h 00m',
    rating: 8.0,
    age_rating: 'PG-13',
    type: 'movie',
    director: '',
    is_featured: false,
    is_trending: false,
    genre_ids: [],
  });

  const fetchMoviesAndGenres = async () => {
    try {
      setLoading(true);
      const [moviesRes, genresRes] = await Promise.all([
        api.get('/api/admin/movies'),
        api.get('/api/genres'),
      ]);
      setMovies(moviesRes.data);
      setGenres(genresRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load movie catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesAndGenres();
  }, []);

  const openCreateModal = () => {
    setEditingMovieId(null);
    setFormData({
      title: '',
      description: '',
      poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      backdrop_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
      video_url: DEFAULT_VIDEO_URL,
      release_year: new Date().getFullYear(),
      duration: '2h 10m',
      rating: 8.5,
      age_rating: 'PG-13',
      type: 'movie',
      director: '',
      is_featured: false,
      is_trending: false,
      genre_ids: genres.length > 0 ? [genres[0].id] : [],
    });
    setModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovieId(movie.id);
    setFormData({
      title: movie.title,
      description: movie.description,
      poster_url: movie.poster_url,
      backdrop_url: movie.backdrop_url,
      video_url: movie.video_url,
      release_year: movie.release_year,
      duration: movie.duration,
      rating: movie.rating,
      age_rating: movie.age_rating,
      type: movie.type,
      director: movie.director || '',
      is_featured: movie.is_featured,
      is_trending: movie.is_trending,
      genre_ids: movie.genres ? movie.genres.map((g) => g.id) : [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMovieId) {
        await api.put(`/api/admin/movies/${editingMovieId}`, formData);
        addToast('Movie updated successfully!', 'success');
      } else {
        await api.post('/api/admin/movies', formData);
        addToast('Movie added to catalog successfully!', 'success');
      }
      setModalOpen(false);
      fetchMoviesAndGenres();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to save movie', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/api/admin/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      addToast('Movie deleted from catalog', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete movie', 'error');
    }
  };

  const toggleGenreSelection = (genreId) => {
    setFormData((prev) => {
      const exists = prev.genre_ids.includes(genreId);
      if (exists) {
        return { ...prev, genre_ids: prev.genre_ids.filter((id) => id !== genreId) };
      } else {
        return { ...prev, genre_ids: [...prev.genre_ids, genreId] };
      }
    });
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.director?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Film className="w-4 h-4" />
            <span>Catalog Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Manage Movies & Series
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Total titles: {movies.length}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-900/40 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add New Title
        </button>
      </div>

      {/* Search and Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search catalog by title or director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase font-semibold text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Year</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Featured/Trending</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading movies catalog...
                  </td>
                </tr>
              ) : filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-9 h-12 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{movie.title}</p>
                        <p className="text-slate-400 truncate">{movie.duration}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize px-2 py-0.5 rounded bg-white/10 font-medium">
                        {movie.type}
                      </span>
                    </td>
                    <td className="p-3.5">{movie.release_year}</td>
                    <td className="p-3.5">
                      <RatingBadge rating={movie.rating} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-1.5">
                        {movie.is_featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300">
                            Featured
                          </span>
                        )}
                        {movie.is_trending && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(movie)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Edit title"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id, movie.title)}
                        className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                        title="Delete title"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No movies found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMovieId ? 'Edit Title Metadata' : 'Add New Movie or Series'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Media Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>

            {/* Poster URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Poster URL</label>
              <input
                type="url"
                required
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Backdrop URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Backdrop Banner URL</label>
              <input
                type="url"
                required
                value={formData.backdrop_url}
                onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Video Stream URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Streaming Video URL (MP4 / WebM / HLS)</label>
              <input
                type="url"
                required
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Duration (e.g. 2h 15m or 3 Seasons)</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Release Year */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Release Year</label>
              <input
                type="number"
                required
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) || 2024 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Rating (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 7.0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Director */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Director</label>
              <input
                type="text"
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Synopsis Description</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Genres selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const selected = formData.genre_ids.includes(g.id);
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggleGenreSelection(g.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-300">Mark as Featured Banner</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_trending}
                onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
              />
              <span className="font-semibold text-slate-300">Mark as Trending Now</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingMovieId ? 'Update Title' : 'Save Title'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMovies;
