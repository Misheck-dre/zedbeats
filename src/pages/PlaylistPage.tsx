import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Share2, Trash2, Globe, Lock, ArrowLeft } from 'lucide-react';
import { playlistsApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import SongRow from '../components/common/SongRow';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { play } = usePlayerStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistsApi.get(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => playlistsApi.delete(id!),
    onSuccess: () => {
      toast.success('Playlist deleted');
      queryClient.invalidateQueries({ queryKey: ['my-playlists'] });
      navigate('/library');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-white/50">Playlist not found.</div>;

  const playlist = data;
  const songs = playlist.songs || [];
  const isOwner = user?.id === playlist.userId;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/30 via-purple-500/10 to-[#0a0a14]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] to-transparent" />

        <Link to="/library" className="absolute top-6 left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 transition z-10">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="px-6 -mt-16 relative z-10">
        {/* Playlist cover & info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          {/* Cover */}
          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl">
            {songs[0]?.coverUrl ? (
              <img src={songs[0].coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-purple-500/20 flex items-center justify-center text-4xl">
                🎵
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              {playlist.isPublic ? (
                <Globe size={12} className="text-white/30" />
              ) : (
                <Lock size={12} className="text-white/30" />
              )}
              <span className="text-xs text-white/30 uppercase tracking-wider">Playlist</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-white/50 text-sm mt-1">{playlist.description}</p>
            )}
            <p className="text-white/30 text-xs mt-1">
              {playlist.user?.displayName} · {songs.length} songs
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-8">
          {songs.length > 0 && (
            <button
              onClick={() => play(songs[0], songs)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F97316] hover:bg-[#F97316]/90 text-sm font-medium transition"
            >
              <Play size={16} fill="white" />
              Play All
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 rounded-full border border-white/20 hover:border-white/40 transition"
          >
            <Share2 size={16} />
          </button>

          {isOwner && (
            <button
              onClick={() => {
                if (confirm('Delete this playlist?')) deleteMutation.mutate();
              }}
              className="p-2.5 rounded-full border border-white/20 hover:border-red-500/50 hover:text-red-400 transition"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Songs */}
        {songs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-white/40">This playlist is empty</p>
            <p className="text-white/25 text-sm mt-1">Search for songs to add them</p>
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song: any, i: number) => (
              <SongRow
                key={song.id}
                song={song}
                index={i + 1}
                queue={songs}
                onPlay={() => play(song, songs)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
