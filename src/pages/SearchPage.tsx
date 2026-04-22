import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Music, Mic2, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '../services/api';
import SongRow from '../components/common/SongRow';
import ArtistCard from '../components/common/ArtistCard';
import { usePlayerStore } from '../store/playerStore';
import { GENRES } from '../constants/genres';

type SearchType = 'all' | 'songs' | 'artists' | 'albums';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<SearchType>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = usePlayerStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: () => searchApi.search(debouncedQuery, type),
    enabled: debouncedQuery.length >= 2,
  });

  const TABS: { key: SearchType; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'songs', label: 'Songs', icon: Music },
    { key: 'artists', label: 'Artists', icon: Mic2 },
    { key: 'albums', label: 'Albums', icon: Disc },
  ];

  return (
    <div className="px-6 py-6 pb-8">
      {/* Search bar */}
      <div className="relative mb-6 max-w-2xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full h-12 pl-11 pr-10 bg-white/8 border border-white/10 rounded-2xl text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/50 focus:bg-white/10 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      {debouncedQuery.length >= 2 && (
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all ${
                type === tab.key
                  ? 'bg-[#F97316] text-white font-medium'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* No query — show genres */}
      {!debouncedQuery && (
        <div>
          <h2 className="text-base font-semibold mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((g, i) => (
              <motion.a
                key={g.id}
                href={`/browse/genre/${g.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative h-24 rounded-xl overflow-hidden flex flex-col justify-end p-4 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${g.color}60, ${g.color}20)`,
                  border: `1px solid ${g.color}30`,
                }}
              >
                <span className="absolute top-4 right-4 text-3xl">{g.emoji}</span>
                <span className="text-sm font-semibold">{g.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {data && !isLoading && (
          <motion.div
            key={debouncedQuery + type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Songs */}
            {(type === 'all' || type === 'songs') && data.songs?.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Songs</h2>
                <div className="space-y-1">
                  {data.songs.map((song: any, i: number) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i + 1}
                      queue={data.songs}
                      onPlay={() => play(song, data.songs)}
                      showPosition={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(type === 'all' || type === 'artists') && data.artists?.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {data.artists.map((artist: any) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {(type === 'all' || type === 'albums') && data.albums?.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.albums.map((album: any) => (
                    <a
                      key={album.id}
                      href={`/album/${album.id}`}
                      className="group bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all block"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3">
                        {album.coverUrl ? (
                          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#F97316]/30 to-[#EF4444]/30 flex items-center justify-center">
                            <Disc size={32} className="text-white/30" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{album.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{album.artist?.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{album.songCount} songs</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {!data.songs?.length && !data.artists?.length && !data.albums?.length && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🎵</p>
                <p className="text-white/50">No results for "{debouncedQuery}"</p>
                <p className="text-white/30 text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
