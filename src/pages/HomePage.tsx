import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Music2, Sparkles } from 'lucide-react';
import { chartsApi, recommendApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import SongCard from '../components/common/SongCard';
import ArtistCard from '../components/common/ArtistCard';
import SongRow from '../components/common/SongRow';
import { usePlayerStore } from '../store/playerStore';
import { GENRES } from '../constants/genres';

const GREETINGS = ['Mwabuka buti', 'Welcome back', 'Hello', 'Muli shani'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { play } = usePlayerStore();

  const { data: topWeekly } = useQuery({
    queryKey: ['charts', 'weekly'],
    queryFn: () => chartsApi.top('weekly'),
  });

  const { data: newReleases } = useQuery({
    queryKey: ['charts', 'new-releases'],
    queryFn: chartsApi.newReleases,
  });

  const { data: trendingArtists } = useQuery({
    queryKey: ['charts', 'trending-artists'],
    queryFn: chartsApi.trendingArtists,
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendApi.forMe(),
    enabled: !!user,
  });

  const topSongs = topWeekly?.chart || [];
  const newSongs = newReleases?.songs || [];
  const artists = trendingArtists?.artists || [];
  const recs = recommended?.songs || [];

  return (
    <div className="pb-6">
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/30 via-[#EF4444]/20 to-[#0a0a14]" />
        <div className="absolute inset-0 bg-[url('/zambia-pattern.svg')] opacity-5" />

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#F97316]/10 blur-3xl" />
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[#EF4444]/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/50 text-sm mb-1"
          >
            {getGreeting()}{user ? `, ${user.displayName.split(' ')[0]}` : ''}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Zambia's Sound, <br />
            <span className="bg-gradient-to-r from-[#F97316] to-[#EF4444] bg-clip-text text-transparent">
              All in One Place
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm mt-2"
          >
            Stream Zed Hip-Hop, Afrobeat, Gospel, Kalindula and more
          </motion.p>
        </div>
      </div>

      <div className="px-6 space-y-10 mt-6">
        {/* Genre tiles */}
        <section>
          <h2 className="text-base font-semibold mb-3 text-white/80">Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GENRES.map((g, i) => (
              <motion.a
                key={g.id}
                href={`/browse/genre/${g.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative h-20 rounded-xl overflow-hidden flex items-end p-3 cursor-pointer group"
                style={{ background: `linear-gradient(135deg, ${g.color}40, ${g.color}15)`, border: `1px solid ${g.color}30` }}
              >
                <div className="absolute top-3 right-3 text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                  {g.emoji}
                </div>
                <span className="text-sm font-semibold relative z-10">{g.name}</span>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Recommended — only for logged-in users */}
        {user && recs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-[#F97316]" />
              <h2 className="text-base font-semibold">Made for You</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recs.slice(0, 5).map((song: any) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={() => play(song, recs)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Charts Zambia */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#F97316]" />
              <h2 className="text-base font-semibold">Top Charts Zambia</h2>
            </div>
            <a href="/charts" className="text-sm text-[#F97316] hover:underline">See all</a>
          </div>
          <div className="space-y-1">
            {topSongs.slice(0, 8).map((song: any, i: number) => (
              <SongRow
                key={song.id}
                song={song}
                index={i + 1}
                queue={topSongs}
                onPlay={() => play(song, topSongs)}
              />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#EF4444]" />
              <h2 className="text-base font-semibold">New Releases</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newSongs.slice(0, 10).map((song: any) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => play(song, newSongs)}
              />
            ))}
          </div>
        </section>

        {/* Trending Artists */}
        {artists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music2 size={18} className="text-[#F97316]" />
                <h2 className="text-base font-semibold">Rising Artists in Zambia</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artists.map((artist: any) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
