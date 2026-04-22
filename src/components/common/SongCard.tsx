import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePlayerStore, Track } from '../../store/playerStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';

interface SongCardProps {
  song: Track & { isLiked?: boolean };
  onPlay: () => void;
  showArtist?: boolean;
}

export default function SongCard({ song, onPlay, showArtist = true }: SongCardProps) {
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
      whileHover={{ y: -2 }}
      className="group relative bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all cursor-pointer"
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-[#EF4444]/30 flex items-center justify-center">
            <span className="text-3xl">🎵</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); isActive && isPlaying ? pause() : isActive ? resume() : onPlay(); }}
            className="w-11 h-11 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isActive && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
        </div>

        {isActive && (
          <div className="absolute bottom-2 left-2 flex gap-0.5 items-end">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                className="w-1 bg-[#F97316] rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p
            onClick={onPlay}
            className={`text-sm font-medium truncate hover:underline cursor-pointer ${isActive ? 'text-[#F97316]' : ''}`}
          >
            {song.title}
          </p>
          {showArtist && song.artist && (
            <Link
              to={`/artist/${song.artist.slug}`}
              className="text-xs text-white/50 hover:text-white truncate block"
            >
              {song.artist.name}
            </Link>
          )}
        </div>

        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
            className={`flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-all ${song.isLiked ? 'opacity-100 text-[#F97316]' : 'text-white/40 hover:text-white'}`}
          >
            <Heart size={14} fill={song.isLiked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
