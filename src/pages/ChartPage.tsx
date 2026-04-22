import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp } from 'lucide-react';
import { chartsApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/common/SongRow';
import ArtistCard from '../components/common/ArtistCard';

type Period = 'daily' | 'weekly' | 'monthly';

export default function ChartPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { play } = usePlayerStore();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['charts', period],
    queryFn: () => chartsApi.top(period),
  });

  const { data: artistsData } = useQuery({
    queryKey: ['trending-artists'],
    queryFn: chartsApi.trendingArtists,
  });

  const songs = chartData?.chart || [];
  const artists = artistsData?.artists || [];

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
  ];

  return (
    <div className="px-6 py-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center">
          <BarChart2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Top Charts Zambia</h1>
          <p className="text-sm text-white/40">The most played songs in Zambia</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              period === p.key
                ? 'bg-[#F97316] text-white font-medium'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Play all */}
      {songs.length > 0 && (
        <button
          onClick={() => play(songs[0], songs)}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#F97316] hover:bg-[#F97316]/90 text-sm font-medium transition mb-4"
        >
          ▶ Play All
        </button>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-1 mb-10">
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
      )}

      {/* Rising Artists */}
      {artists.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#F97316]" />
            <h2 className="text-base font-semibold">Rising Artists in Zambia</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.map((artist: any) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
