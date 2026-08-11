import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  ArrowLeft, 
  Settings, 
  Sparkles, 
  Loader2, 
  Tv, 
  Film,
  Server,
  ExternalLink,
  Zap,
  ShieldCheck,
  Globe,
  Youtube,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Reliable high-speed direct MP4 fallback video streams
const DIRECT_DEMO_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];

const VideoPlayer = ({ movie, initialProgress = 0 }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressSaveTimerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Mode: 'youtube' (Default), 'direct' (HTML5 MP4), 'vidsrc_cc' (External Cinema)
  const [selectedServer, setSelectedServer] = useState('youtube');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const controlsTimeoutRef = useRef(null);
  const isSeries = movie?.type === 'series';

  // Direct MP4 fallback URL
  const directStreamUrl = movie?.video_url || DIRECT_DEMO_STREAMS[(movie?.id || 1) % DIRECT_DEMO_STREAMS.length];

  // Direct YouTube URL (for opening in new tab or fallback)
  const youtubeDirectUrl = movie?.trailer_key 
    ? `https://www.youtube.com/watch?v=${movie.trailer_key}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent((movie?.title || 'movie') + (isSeries ? ` season ${season} episode ${episode}` : ' full movie trailer'))}`;

  // Reset loading and error states on server/episode change
  useEffect(() => {
    setEmbedError(false);
    if (selectedServer !== 'direct') {
      setIframeLoading(true);
    }
  }, [selectedServer, season, episode]);

  // Sync watch progress to backend
  const syncProgress = useCallback(async (time, totalDuration) => {
    if (!isAuthenticated || !movie?.id || !time) return;
    try {
      await api.post('/api/history', {
        movie_id: movie.id,
        progress: time,
        duration: totalDuration || duration || 0
      });
    } catch (err) {
      console.warn('Failed to sync watch progress:', err);
    }
  }, [isAuthenticated, movie?.id, duration]);

  // HTML5 video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      setDuration(vidDuration);
      if (initialProgress > 0 && initialProgress < vidDuration - 10) {
        videoRef.current.currentTime = initialProgress;
        setCurrentTime(initialProgress);
      }
      setIsBuffering(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      syncProgress(videoRef.current.currentTime, videoRef.current.duration);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedMenuOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Keyboard shortcuts for HTML5 direct stream player
  useEffect(() => {
    if (selectedServer !== 'direct') return;

    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          skipTime(10);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        default:
          break;
      }
      triggerControlsVisibility();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration, selectedServer]);

  // Periodic watch progress auto-saver
  useEffect(() => {
    if (selectedServer !== 'direct') return;
    progressSaveTimerRef.current = setInterval(() => {
      if (videoRef.current && isPlaying) {
        syncProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 10000);

    return () => {
      if (progressSaveTimerRef.current) clearInterval(progressSaveTimerRef.current);
      if (videoRef.current) {
        syncProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
  }, [isPlaying, syncProgress, selectedServer]);

  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && selectedServer === 'direct') setShowControls(false);
    }, 3500);
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec)) return '00:00';
    const hrs = Math.floor(timeInSec / 3600);
    const mins = Math.floor((timeInSec % 3600) / 60);
    const secs = Math.floor(timeInSec % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // YouTube / Embed URL generator
  const getEmbedUrl = () => {
    const id = movie?.id;

    if (selectedServer === 'youtube') {
      if (movie?.trailer_key && movie.trailer_key.length >= 6) {
        return `https://www.youtube-nocookie.com/embed/${movie.trailer_key}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
      }
      return null; // Return null to render the clean direct YouTube fallback card!
    }

    if (selectedServer === 'vidsrc_cc') {
      return isSeries 
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`;
    }

    return '';
  };

  const embedSrc = getEmbedUrl();

  const handleOpenYouTubeDirect = () => {
    window.open(youtubeDirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePlayExternal = () => {
    const externalUrl = isSeries 
      ? `https://vidsrc.cc/v2/embed/tv/${movie?.id}/${season}/${episode}`
      : `https://vidsrc.cc/v2/embed/movie/${movie?.id}`;
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  const servers = [
    { id: 'youtube', name: 'YouTube Stream', badge: 'HD', icon: Youtube },
    { id: 'direct', name: 'Direct MP4 Stream', badge: 'HTML5' },
    { id: 'vidsrc_cc', name: 'Full Cinema Server', badge: 'Mirror' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-purple-950/80 border border-red-500/30 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <span className="font-bold text-white">YouTube HD Stream Engine.</span>
            <span className="text-slate-300 ml-1">
              Watch embedded below or launch directly on YouTube.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenYouTubeDirect}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-900/40 transition-all shrink-0 cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>Watch on YouTube ↗</span>
          </button>

          <button
            onClick={handlePlayExternal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-300 hover:text-white font-bold text-xs border border-white/10 transition-all shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cinema Server ↗</span>
          </button>
        </div>
      </div>

      {/* Stream Server Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/10">
        {/* Server Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-1">
            <Zap className="w-4 h-4 text-red-400 fill-current" />
            <span>Stream Source:</span>
          </div>
          {servers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServer(s.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedServer === s.id
                  ? 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-red-900/50 scale-105'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {s.icon && <s.icon className="w-3.5 h-3.5" />}
              <span>{s.name}</span>
              {s.badge && (
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  {s.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Series Season & Episode Picker */}
        {isSeries && selectedServer === 'vidsrc_cc' && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="text-slate-400 font-medium">Season:</span>
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    Season {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="text-slate-400 font-medium">Episode:</span>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-slate-900 text-white">
                    Ep {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Video Frame Container */}
      <div
        ref={containerRef}
        onMouseMove={triggerControlsVisibility}
        onMouseLeave={() => isPlaying && selectedServer === 'direct' && setShowControls(false)}
        className="relative w-full aspect-video max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none group"
      >
        {/* If YouTube Selected and Embed URL is valid and no error */}
        {selectedServer === 'youtube' && embedSrc && !embedError ? (
          <div className="relative w-full h-full">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-none gap-3">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Loading YouTube Stream...</p>
              </div>
            )}
            <iframe
              key={`${selectedServer}-${movie?.id}`}
              src={embedSrc}
              title={movie?.title || 'Video Stream'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen={true}
              referrerPolicy="no-referrer"
              loading="eager"
              onLoad={() => setIframeLoading(false)}
              onError={() => setEmbedError(true)}
              className="w-full h-full border-0"
            />
          </div>
        ) : selectedServer === 'youtube' ? (
          /* Error 153 / No Embed Key Fallback UI */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={movie?.backdrop_url || movie?.poster_url}
              alt={movie?.title}
              className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

            <div className="relative z-20 flex flex-col items-center text-center p-6 max-w-lg space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-xl shadow-red-950/60">
                <Youtube className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                  {movie?.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Direct YouTube stream ready. Click below to stream in full 4K / 1080p on YouTube without embedding restrictions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
                <button
                  onClick={handleOpenYouTubeDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-900/50 hover:scale-105 transition-all cursor-pointer"
                >
                  <Youtube className="w-5 h-5 fill-current" />
                  <span>Watch Full Video on YouTube ↗</span>
                </button>

                <button
                  onClick={() => setSelectedServer('direct')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-panel text-slate-200 hover:text-white hover:bg-white/15 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Direct MP4</span>
                </button>
              </div>
            </div>
          </div>
        ) : selectedServer === 'vidsrc_cc' ? (
          /* Third-Party Embed Server Frame */
          <div className="relative w-full h-full">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-none gap-3">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Connecting to cinema server...</p>
              </div>
            )}
            <iframe
              key={`${selectedServer}-${season}-${episode}`}
              src={embedSrc}
              title={movie?.title || 'Video Stream'}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture"
              allowFullScreen={true}
              referrerPolicy="no-referrer"
              loading="eager"
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          /* Direct HTML5 MP4 Video Element */
          <>
            <video
              ref={videoRef}
              src={directStreamUrl}
              poster={movie?.backdrop_url}
              preload="auto"
              autoPlay
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <Loader2 className="w-14 h-14 text-purple-500 animate-spin" />
              </div>
            )}

            {/* Center Big Play Button on Pause */}
            {!isPlaying && !isBuffering && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-purple-500 transition-all z-20 cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}

            {/* Bottom Controls Overlay */}
            <div
              className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-30 space-y-3 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Seek Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-300 font-mono">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2.5 transition-all"
                />
                <span className="text-xs font-medium text-slate-400 font-mono">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Action Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-purple-400 transition-colors p-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button
                    onClick={() => skipTime(-10)}
                    className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-purple-400 transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3 relative">
                  <div className="relative">
                    <button
                      onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>

                    {speedMenuOpen && (
                      <div className="absolute bottom-9 right-0 glass-panel rounded-xl p-1 shadow-2xl border border-white/10 z-40 flex flex-col gap-1 min-w-[70px]">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-3 py-1 text-xs rounded-lg text-left font-medium transition-colors cursor-pointer ${
                              playbackSpeed === speed ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-purple-400 transition-colors p-1 cursor-pointer"
                    title="Toggle Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Header Bar Overlay */}
        <div
          className={`absolute top-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {movie?.title}
            </h2>
            <p className="text-[10px] sm:text-xs text-red-400 font-medium">
              {isSeries ? `Season ${season}, Episode ${episode}` : 'Full Movie HD Stream'}
            </p>
          </div>

          <div className="w-12 sm:w-16" />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
