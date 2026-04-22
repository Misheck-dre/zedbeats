import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, ArrowLeft, Calendar } from 'lucide-react';
import { songsApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/common/SongRow';

async function getAlbum(id: string) {
  const res = await fetch(`/api/albums/${id}`);
  if (!res.ok) throw new Error('Album not found');
  return res.json();
}

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { play } = usePlayerStore();

  const { data, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => getAlbum(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.album) return <div className="p-8 text-white/50">Album not found.</div>;

  const { album } = data;
  const songs = album.songs || [];

  const totalDuration = songs.reduce((acc: number, s: any) => acc + s.duration, 0);
  const totalMin = Math.floor(totalDuration / 60);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative h-56 overflow-hidden">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt="" className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-[#EF4444]/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] to-transparent" />

        <Link to={`/artist/${album.artist?.slug}`} className="absolute top-6 left-6 p-2 rounded-full bg-black/30 hover:bg-black/50 transition z-10">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          {/* Cover */}
          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-[#EF4444]/20 flex items-center justify-center text-4xl">
                💿
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-white/30 uppercase tracking-wider">
              {album.albumType || 'Album'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{album.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {album.artist && (
                <Link to={`/artist/${album.artist.slug}`} className="text-sm font-medium hover:underline">
                  {album.artist.name}
                </Link>
              )}
              {album.releaseDate && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(album.releaseDate).getFullYear()}
                  </span>
                </>
              )}
              <span className="text-white/20">·</span>
              <span className="text-sm text-white/40">{songs.length} songs, {totalMin} min</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {songs.length > 0 && (
          <button
            onClick={() => play(songs[0], songs)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F97316] hover:bg-[#F97316]/90 text-sm font-medium transition mb-6"
          >
            <Play size={16} fill="white" />
            Play Album
          </button>
        )}

        {/* Songs */}
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
      </div>
    </div>
  );
}
