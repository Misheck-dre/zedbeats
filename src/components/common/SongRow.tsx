import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore, Track } from '../../store/playerStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCount(n: number | bigint) {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}

interface SongRowProps {
  song: Track & { isLiked?: boolean; position?: number; streams?: number };
  index?: number;
  queue: Track[];
  onPlay: () => void;
  showPosition?: boolean;
  showStreams?: boolean;
}

export default function SongRow({ song, index, queue, onPlay, showPosition = true, showStreams = false }: SongRowProps) {
  const { currentTrack, isPlaying, pause, resume } = usePlayerStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isActive = currentTrack?.id === song.id;

  const likeMutation = useMutation({
    mutationFn: () => songsApi.like(song.id),
    onSuccess: (data) => {
      toast(data.liked ? '❤️ Added to Liked Songs' : 'Removed from Liked Songs');
      queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
    },
  });

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="flex items-center gap-3 px-3 py-2 rounded-lg group cursor-pointer transition-colors"
    >
      {/* Index / play button */}
      <div className="w-7 flex-shrink-0 text-center">
        <span className={`text-sm tabular-nums group-hover:hidden ${isActive ? 'text-[#F97316]' : 'text-white/40'}`}>
          {showPosition ? (index ?? song.position ?? '') : ''}
        </span>
        <button
          onClick={isActive && isPlaying ? pause : isActive ? resume : onPlay}
          className="hidden group-hover:flex items-center justify-center w-7 h-7"
        >
          {isActive && isPlaying
            ? <Pause size={16} className="text-white" />
            : <Play size={16} className="text-white" />
          }
        </button>
      </div>

      {/* Cover */}
      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-[#EF4444]/30 flex items-center justify-center">
            <span className="text-sm">🎵</span>
          </div>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p
          onClick={onPlay}
          className={`text-sm font-medium truncate ${isActive ? 'text-[#F97316]' : 'hover:underline'}`}
        >
          {song.title}
        </p>
        {song.artist && (
          <Link
            to={`/artist/${song.artist.slug}`}
            className="text-xs text-white/50 hover:text-white truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {song.artist.name}
            {song.artist.isVerified && <span className="ml-1 text-[#F97316]">✓</span>}
          </Link>
        )}
      </div>

      {/* Streams */}
      {showStreams && song.streams != null && (
        <span className="text-xs text-white/30 tabular-nums hidden sm:block w-16 text-right">
          {formatCount(song.streams)}
        </span>
      )}

      {/* Duration */}
      <span className="text-xs text-white/30 tabular-nums w-10 text-right hidden md:block">
        {formatDuration(song.duration)}
      </span>

      {/* Like button */}
      {user && (
        <button
          onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
          className={`p-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${
            song.isLiked ? 'opacity-100 text-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Heart size={14} fill={song.isLiked ? 'currentColor' : 'none'} />
        </button>
      )}
    </motion.div>
  );
}
