import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Play, UserCheck, UserPlus, ExternalLink } from 'lucide-react';
import { artistsApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import SongRow from '../components/common/SongRow';
import { toast } from 'react-toastify';

export default function ArtistPage() {
  const { slug } = useParams<{ slug: string }>();
  const { play } = usePlayerStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', slug],
    queryFn: () => artistsApi.get(slug!),
    enabled: !!slug,
  });

  const { data: songsData } = useQuery({
    queryKey: ['artist-songs', artist?.id],
    queryFn: () => artistsApi.songs(artist!.id),
    enabled: !!artist?.id,
  });

  const followMutation = useMutation({
    mutationFn: () => artistsApi.follow(artist!.id),
    onSuccess: (data) => {
      toast(data.following ? `Following ${artist!.name}` : `Unfollowed ${artist!.name}`);
      queryClient.invalidateQueries({ queryKey: ['artist', slug] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return <div className="p-8 text-white/50">Artist not found.</div>;
  }

  const songs = songsData?.songs || [];

  function formatListeners(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return n.toString();
  }

  return (
    <div className="pb-8">
      {/* Banner / Hero */}
      <div className="relative h-56 md:h-80 overflow-hidden">
        {artist.bannerUrl ? (
          <img src={artist.bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F97316]/40 via-[#EF4444]/20 to-[#0a0a14]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/40 to-transparent" />
      </div>

      {/* Artist info */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full border-4 border-[#0a0a14] overflow-hidden flex-shrink-0 shadow-2xl">
            {artist.photoUrl ? (
              <img src={artist.photoUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center text-4xl font-bold">
                {artist.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {artist.isVerified && (
                <span className="text-xs text-[#F97316] border border-[#F97316]/30 px-2 py-0.5 rounded-full">
                  ✓ Verified Artist
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{artist.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
              {artist.monthlyListeners > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {formatListeners(artist.monthlyListeners)} monthly listeners
                </span>
              )}
              <span>{artist.country || 'Zambia'}</span>
            </div>
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
              Play
            </button>
          )}

          {user && (
            <button
              onClick={() => followMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 hover:border-white/50 text-sm transition"
            >
              {artist.isFollowing ? (
                <><UserCheck size={16} className="text-[#F97316]" /> Following</>
              ) : (
                <><UserPlus size={16} /> Follow</>
              )}
            </button>
          )}

          {artist.socialLinks?.instagram && (
            <a
              href={artist.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-white/20 hover:border-white/50 transition"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Bio */}
        {artist.bio && (
          <div className="mb-8 max-w-2xl">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">About</h2>
            <p className="text-white/70 text-sm leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {/* Genres */}
        {artist.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {artist.genres.map((g: string) => (
              <span key={g} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Songs */}
        {songs.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-3">Popular Songs</h2>
            <div className="space-y-1">
              {songs.map((song: any, i: number) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i + 1}
                  queue={songs}
                  onPlay={() => play(song, songs)}
                  showStreams
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
