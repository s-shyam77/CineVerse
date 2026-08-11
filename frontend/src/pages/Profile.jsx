import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Key, Bookmark, History, Check, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AVATAR_PRESETS = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5', 'avatar_6'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar_1');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        avatar: selectedAvatar,
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
      }

      const res = await api.put('/api/users/me', payload);
      updateUser(res.data);
      addToast('Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
          Account Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal account settings and playback preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[3px] shadow-xl">
              <div className="w-full h-full bg-[#080a14] rounded-full flex items-center justify-center text-3xl font-black text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
              <Shield className="w-3.5 h-3.5" />
              {user?.role === 'admin' ? 'Administrator' : 'Free Member'}
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/my-list"
                className="flex items-center justify-between p-3 rounded-xl glass-panel text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-pink-400" />
                  My Watchlist
                </span>
                <span>→</span>
              </Link>

              <Link
                to="/history"
                className="flex items-center justify-between p-3 rounded-xl glass-panel text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Watch History
                </span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white">Personal Information</h3>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address (Registered)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Change Password (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
