import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Heart, ListMusic, Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../../services/api';
import { toast } from 'react-toastify';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentTrack, isPlaying, isLoading,
    progress, currentTime, duration,
    volume, isMuted, shuffle, repeat,
    toggle, next, prev, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
  } = usePlayerStore();

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => songsApi.like(currentTrack!.id),
    onSuccess: (data) => {
      toast(data.liked ? '❤️ Added to Liked Songs' : 'Removed from Liked Songs');
      queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
    },
  });

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seek(x / rect.width);
  }, [seek]);

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  if (!currentTrack) {
    return (
      <div className="h-20 bg-[#0f0f1e] border-t border-white/5 flex items-center justify-center">
        <p className="text-white/20 text-sm">Choose a song to start listening 🎵</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="h-20 bg-[#0f0f1e] border-t border-white/5 flex items-center px-4 gap-4 z-50"
    >
      {/* Track info */}
      <div className="flex items-center gap-3 w-64 min-w-0">
        <div className="relative flex-shrink-0">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center">
              <span className="text-lg">🎵</span>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <Link
            to={`/artist/${currentTrack.artist.slug}`}
            className="block text-sm font-medium truncate hover:underline"
          >
            {currentTrack.title}
          </Link>
          <p className="text-xs text-white/50 truncate">{currentTrack.artist.name}</p>
        </div>

        <button
          onClick={() => currentTrack && likeMutation.mutate()}
          className={`flex-shrink-0 p-1.5 rounded-full transition-all ${
            currentTrack.isLiked ? 'text-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Heart size={16} fill={currentTrack.isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Center controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-[#F97316]' : 'text-white/40 hover:text-white'}`}
          >
            <Shuffle size={16} />
          </button>

          <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
          </button>

          <button onClick={next} className="text-white/70 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>

          <button
            onClick={cycleRepeat}
            className={`transition-colors ${repeat !== 'none' ? 'text-[#F97316]' : 'text-white/40 hover:text-white'}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-white/40 w-8 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-[#F97316] transition-colors relative"
              style={{ width: `${progress * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[10px] text-white/40 w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume + extras */}
      <div className="flex items-center gap-3 w-48 justify-end">
        <button className="text-white/40 hover:text-white transition-colors hidden md:block">
          <ListMusic size={16} />
        </button>

        <button
          onClick={toggleMute}
          className="text-white/40 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div
          className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group relative hidden md:block"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setVolume((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="h-full bg-white rounded-full group-hover:bg-[#F97316] transition-colors"
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
