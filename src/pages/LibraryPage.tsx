import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Clock, ListMusic, Music2 } from 'lucide-react';
import { usersApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/common/SongRow';
import ArtistCard from '../components/common/ArtistCard';

type Tab = 'liked' | 'playlists' | 'history' | 'following';

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('liked');
  const { play } = usePlayerStore();

  const { data: likedData } = useQuery({
    queryKey: ['liked-songs'],
    queryFn: usersApi.likedSongs,
    enabled: tab === 'liked',
  });

  const { data: historyData } = useQuery({
    queryKey: ['history'],
    queryFn: usersApi.history,
    enabled: tab === 'history',
  });

  const { data: followingData } = useQuery({
    queryKey: ['following'],
    queryFn: usersApi.followedArtists,
    enabled: tab === 'following',
  });

  const { data: playlistsData } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: usersApi.me,
    enabled: tab === 'playlists',
  });

  const TABS = [
    { key: 'liked' as Tab, label: 'Liked Songs', icon: Heart },
    { key: 'playlists' as Tab, label: 'Playlists', icon: ListMusic },
    { key: 'history' as Tab, label: 'History', icon: Clock },
    { key: 'following' as Tab, label: 'Following', icon: Music2 },
  ];

  const likedSongs = likedData?.songs || [];
  const history = historyData?.history || [];
  const following = followingData?.artists || [];

  return (
    <div className="px-6 py-6 pb-8">
      <h1 className="text-xl font-bold mb-6">Your Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all ${
              tab === t.key
                ? 'bg-[#F97316] text-white font-medium'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Liked Songs */}
      {tab === 'liked' && (
        <div>
          {likedSongs.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={40} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40">No liked songs yet</p>
              <p className="text-white/25 text-sm mt-1">Heart songs as you listen to save them here</p>
            </div>
          ) : (
            <>
              {likedSongs.length > 0 && (
                <button
                  onClick={() => play(likedSongs[0], likedSongs)}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#F97316] text-sm font-medium mb-4 hover:opacity-90 transition"
                >
                  ▶ Play All ({likedSongs.length})
                </button>
              )}
              <div className="space-y-1">
                {likedSongs.map((song: any, i: number) => (
                  <SongRow
                    key={song.id}
                    song={{ ...song, isLiked: true }}
                    index={i + 1}
                    queue={likedSongs}
                    onPlay={() => play(song, likedSongs)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="text-center py-16">
              <Clock size={40} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40">No listening history yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((entry: any, i: number) => (
                <SongRow
                  key={`${entry.songId}-${i}`}
                  song={entry.song}
                  index={i + 1}
                  queue={history.map((h: any) => h.song)}
                  onPlay={() => play(entry.song, history.map((h: any) => h.song))}
                  showPosition={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Following */}
      {tab === 'following' && (
        <div>
          {following.length === 0 ? (
            <div className="text-center py-16">
              <Music2 size={40} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40">Not following any artists yet</p>
              <p className="text-white/25 text-sm mt-1">Follow artists to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {following.map((artist: any) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && (
        <div className="text-center py-16">
          <ListMusic size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40">Your playlists will appear here</p>
          <p className="text-white/25 text-sm mt-1">Create a playlist from the sidebar</p>
        </div>
      )}
    </div>
  );
}
