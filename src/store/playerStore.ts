import { create } from 'zustand';
import { Howl } from 'howler';
import { songsApi } from '../services/api';
import { audiusApi } from '../services/audius';

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  audiusId?: string;       // set when track comes from Audius
  coverUrl?: string;
  duration: number;
  artist: { id: string; name: string; slug: string; photoUrl?: string; isVerified?: boolean };
  album?: { id: string; title: string; coverUrl?: string };
  isLiked?: boolean;
  isPremium?: boolean;
  source?: 'local' | 'audius';
}

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;

  play: (track: Track, queue?: Track[]) => Promise<void>;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
}

let howl: Howl | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;

function stopHowl() {
  if (howl) { howl.stop(); howl.unload(); howl = null; }
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function shuffle(len: number): number[] {
  const a = Array.from({ length: len }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'none',

  play: async (track, queue) => {
    stopHowl();
    const newQueue = queue || get().queue;
    const idx = newQueue.findIndex(t => t.id === track.id);
    set({ currentTrack: track, queue: newQueue, queueIndex: Math.max(idx, 0), isLoading: true, progress: 0, currentTime: 0 });

    // Resolve audio URL — handle Audius tracks specially
    let audioUrl = track.audioUrl;
    if (track.source === 'audius' && track.audiusId) {
      try {
        audioUrl = await audiusApi.streamUrl(track.audiusId);
      } catch {
        set({ isLoading: false });
        return;
      }
    }

    // Record play for local tracks
    if (track.source !== 'audius' && !track.id.startsWith('audius_')) {
      songsApi.play(track.id, 'player').catch(() => {});
    }

    howl = new Howl({
      src: [audioUrl],
      html5: true,
      volume: get().isMuted ? 0 : get().volume,
      onload: () => set({ isLoading: false, duration: howl?.duration() || track.duration }),
      onplay: () => {
        set({ isPlaying: true });
        progressTimer = setInterval(() => {
          if (howl?.playing()) {
            const s = howl.seek() as number;
            const d = howl.duration() || 1;
            set({ currentTime: s, progress: s / d });
          }
        }, 500);
      },
      onpause: () => { set({ isPlaying: false }); if (progressTimer) clearInterval(progressTimer); },
      onstop:  () => { set({ isPlaying: false, progress: 0, currentTime: 0 }); if (progressTimer) clearInterval(progressTimer); },
      onend:   () => {
        const { repeat, next } = get();
        if (repeat === 'one') howl?.play();
        else next();
      },
      onloaderror: () => set({ isLoading: false, isPlaying: false }),
    });

    howl.play();
  },

  pause:  () => { howl?.pause(); set({ isPlaying: false }); },
  resume: () => { howl?.play(); set({ isPlaying: true }); },
  toggle: () => { const { isPlaying, pause, resume } = get(); isPlaying ? pause() : resume(); },

  next: () => {
    const { queue, queueIndex, shuffle: sh, repeat, play } = get();
    if (!queue.length) return;
    let next = sh ? Math.floor(Math.random() * queue.length) : queueIndex + 1;
    if (next >= queue.length) { if (repeat === 'all') next = 0; else return; }
    set({ queueIndex: next });
    play(queue[next], queue);
  },

  prev: () => {
    const { currentTime, queue, queueIndex, play } = get();
    if (currentTime > 3) { howl?.seek(0); set({ currentTime: 0, progress: 0 }); return; }
    const prev = Math.max(queueIndex - 1, 0);
    set({ queueIndex: prev });
    play(queue[prev], queue);
  },

  seek: (progress) => {
    const d = howl?.duration() || 0;
    howl?.seek(progress * d);
    set({ progress, currentTime: progress * d });
  },

  setVolume: (volume) => { howl?.volume(volume); set({ volume, isMuted: volume === 0 }); },
  toggleMute: () => {
    const { isMuted, volume } = get();
    howl?.volume(isMuted ? volume : 0);
    set({ isMuted: !isMuted });
  },
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat:   () => set(s => ({ repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none' })),
  addToQueue:    (track) => set(s => ({ queue: [...s.queue, track] })),
}));
