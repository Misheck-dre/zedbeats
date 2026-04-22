/**
 * Audius API — completely free, no key needed
 * Used as supplementary content alongside local Zambian music
 */

import axios from 'axios';

let _host: string | null = null;

async function getHost(): Promise<string> {
  if (_host) return _host;
  try {
    const r = await axios.get('https://api.audius.co', { timeout: 5000 });
    _host = r.data?.data?.[0] || 'https://discoveryprovider.audius.co';
  } catch {
    _host = 'https://discoveryprovider.audius.co';
  }
  return _host!;
}

const APP = 'ZedBeats';

export const audiusApi = {
  trending: async (time = 'week') => {
    const host = await getHost();
    const r = await axios.get(`${host}/v1/tracks/trending`, {
      params: { time, limit: 20, app_name: APP },
    });
    return r.data?.data || [];
  },

  search: async (query: string) => {
    const host = await getHost();
    const r = await axios.get(`${host}/v1/tracks/search`, {
      params: { query, limit: 10, app_name: APP },
    });
    return r.data?.data || [];
  },

  streamUrl: async (trackId: string): Promise<string> => {
    const host = await getHost();
    return `${host}/v1/tracks/${trackId}/stream?app_name=${APP}`;
  },

  // Convert Audius track format to our Track format
  toTrack: (t: any) => ({
    id: `audius_${t.id}`,
    title: t.title,
    audioUrl: '',          // filled by streamUrl() when needed
    audiusId: t.id,        // store so we can get stream URL
    coverUrl: t.artwork?.['480x480'] || t.artwork?.['150x150'] || null,
    duration: t.duration || 0,
    genre: t.genre || 'Audius',
    playCount: t.play_count || 0,
    artist: {
      id: `audius_artist_${t.user?.id}`,
      name: t.user?.name || 'Unknown Artist',
      slug: t.user?.handle || 'unknown',
      photoUrl: t.user?.profile_picture?.['150x150'] || null,
      isVerified: t.user?.is_verified || false,
    },
    source: 'audius' as const,
  }),
};
