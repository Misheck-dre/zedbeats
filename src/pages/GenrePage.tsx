import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { songsApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/common/SongRow';
import { GENRES } from '../constants/genres';

export default function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const { play } = usePlayerStore();

  const genreInfo = GENRES.find(g => g.id === genre);

  const { data, isLoading } = useQuery({
    queryKey: ['songs-genre', genre],
    queryFn: () => songsApi.byGenre(genre!),
    enabled: !!genre,
  });

  const songs = data?.songs || [];

  return (
    <div className="pb-8">
      {/* Header */}
      <div
        className="relative h-48 flex flex-col justify-end px-6 pb-6"
        style={{
          background: genreInfo
            ? `linear-gradient(135deg, ${genreInfo.color}50, ${genreInfo.color}10, #0a0a14)`
            : 'linear-gradient(135deg, #F97316/30, #0a0a14)',
        }}
      >
        <Link to="/browse" className="absolute top-6 left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 transition">
          <ArrowLeft size={18} />
        </Link>

        <div>
          {genreInfo && <span className="text-4xl mb-2 block">{genreInfo.emoji}</span>}
          <h1 className="text-3xl font-bold">{genreInfo?.name || genre}</h1>
          <p className="text-white/50 text-sm mt-1">{songs.length} songs</p>
        </div>
      </div>

      <div className="px-6 mt-6">
        {songs.length > 0 && (
          <button
            onClick={() => play(songs[0], songs)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F97316] text-sm font-medium hover:opacity-90 transition mb-6"
          >
            <Play size={16} fill="white" />
            Play All
          </button>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-white/40">No songs in this genre yet</p>
            <p className="text-white/25 text-sm mt-1">Check back soon!</p>
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
