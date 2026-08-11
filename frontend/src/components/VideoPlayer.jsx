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
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = ({ movie, initialProgress = 0 }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressSaveTimerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Server sources: 'server1', 'server2', 'server3', 'server4', 'trailer', 'html5'
  const [selectedServer, setSelectedServer] = useState('server1');
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
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const controlsTimeoutRef = useRef(null);
  const isSeries = movie?.type === 'series';

  // Reset iframe loading when server, season, or episode changes
  useEffect(() => {
    if (selectedServer !== 'html5') {
      setIframeLoading(true);
    }
  }, [selectedServer, season, episode]);

  // Sync progress to backend
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

  // Set initial seek position on load for HTML5 video
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

  // Keyboard shortcuts
  useEffect(() => {
    if (selectedServer !== 'html5') return;

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
    if (selectedServer !== 'html5') return;
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
      if (isPlaying && selectedServer === 'html5') setShowControls(false);
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

  // Generate Stream Embed URL based on server and movie/series ID
  const getEmbedUrl = () => {
    const id = movie?.id;
    if (!id) return '';

    if (selectedServer === 'server1') {
      return isSeries 
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`;
    }
    if (selectedServer === 'server2') {
      return isSeries
        ? `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${id}`;
    }
    if (selectedServer === 'server3') {
      return isSeries
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
    }
    if (selectedServer === 'server4') {
      return isSeries
        ? `https://player.smashy.stream/tv/${id}?s=${season}&e=${episode}`
        : `https://player.smashy.stream/movie/${id}`;
    }
    if (selectedServer === 'trailer') {
      return movie?.trailer_key
        ? `https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&rel=0`
        : null;
    }
    return '';
  };

  const embedSrc = getEmbedUrl();

  const handleOpenExternalWindow = () => {
    if (embedSrc) {
      window.open(embedSrc, '_blank', 'noopener,noreferrer');
    }
  };

  const servers = [
    { id: 'server1', name: 'Server 1 (VidSrc HD)' },
    { id: 'server2', name: 'Server 2 (AutoEmbed)' },
    { id: 'server3', name: 'Server 3 (VidSrc Pro)' },
    { id: 'server4', name: 'Server 4 (SmashyStream)' },
    ...(movie?.trailer_key ? [{ id: 'trailer', name: 'Official Trailer (YT)' }] : []),
    { id: 'html5', name: 'Demo Stream (Backup)' },
  ];

  return (
    <div className="space-y-3">
      {/* Streaming Server Controls & Episode Picker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/10">
        {/* Server Selector Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-1.5">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Stream Server:</span>
          </div>
          {servers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServer(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedServer === s.id
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-md shadow-purple-900/40 scale-105'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Series Season & Episode Picker */}
        {isSeries && selectedServer !== 'trailer' && selectedServer !== 'html5' && (
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
        onMouseLeave={() => isPlaying && selectedServer === 'html5' && setShowControls(false)}
        className="relative w-full aspect-video max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none group"
      >
        {/* If Embed Server Selected (Server 1-4 or Trailer) */}
        {selectedServer !== 'html5' && embedSrc ? (
          <div className="relative w-full h-full">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none gap-3">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Connecting to stream server...</p>
              </div>
            )}
            <iframe
              key={`${selectedServer}-${season}-${episode}`}
              src={embedSrc}
              title={movie?.title || 'Video Stream'}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture"
              allowFullScreen={true}
              referrerPolicy="origin"
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <>
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              src={movie?.video_url}
              poster={movie?.backdrop_url}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
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

            {/* Center Big Play/Pause Button on Pause */}
            {!isPlaying && !isBuffering && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-purple-500 transition-all z-20"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}

            {/* Bottom Controls Overlay for HTML5 */}
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
                    className="text-white hover:text-purple-400 transition-colors p-1"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button
                    onClick={() => skipTime(-10)}
                    className="text-slate-300 hover:text-white transition-colors p-1"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="text-slate-300 hover:text-white transition-colors p-1"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-purple-400 transition-colors"
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
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                    >
                      {playbackSpeed}x
                    </button>

                    {speedMenuOpen && (
                      <div className="absolute bottom-9 right-0 glass-panel rounded-xl p-1 shadow-2xl border border-white/10 z-40 flex flex-col gap-1 min-w-[70px]">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-3 py-1 text-xs rounded-lg text-left font-medium transition-colors ${
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
                    className="text-white hover:text-purple-400 transition-colors p-1"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {movie?.title}
            </h2>
            <p className="text-[10px] sm:text-xs text-purple-400 font-medium">
              {isSeries ? `Season ${season}, Episode ${episode}` : 'Full Movie Cinema HD'}
            </p>
          </div>

          <div className="w-12 sm:w-16" />
        </div>
      </div>

      {/* Fallback & External Window Direct Action Bar */}
      {selectedServer !== 'html5' && embedSrc && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              If the stream is stuck or blocked by your browser/adblocker, switch servers above or open the direct stream window.
            </span>
          </div>

          <button
            onClick={handleOpenExternalWindow}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:scale-105 transition-all shadow-md shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Player Window
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
