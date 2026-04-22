import axios from 'axios';
import { supabase } from '../config/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
});

// Attach Supabase JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message))
);

export const songsApi = {
  list:    (params?: any)    => api.get('/api/songs', { params }).then(r => r.data),
  get:     (id: string)      => api.get(`/api/songs/${id}`).then(r => r.data),
  play:    (id: string, src?: string) => api.post(`/api/songs/${id}/play`, { source: src }),
  like:    (id: string)      => api.post(`/api/songs/${id}/like`).then(r => r.data),
  byGenre: (genre: string)   => api.get(`/api/songs/genre/${genre}`).then(r => r.data),
};

export const artistsApi = {
  list:    (params?: any)    => api.get('/api/artists', { params }).then(r => r.data),
  get:     (slug: string)    => api.get(`/api/artists/${slug}`).then(r => r.data),
  songs:   (id: string)      => api.get(`/api/artists/${id}/songs`).then(r => r.data),
  follow:  (id: string)      => api.post(`/api/artists/${id}/follow`).then(r => r.data),
  enrich:  (slug: string)    => api.get(`/api/artists/${slug}/enrich`).then(r => r.data),
};

export const chartsApi = {
  top:             (period = 'weekly') => api.get('/api/charts/top', { params: { period } }).then(r => r.data),
  genre:           (genre: string)     => api.get(`/api/charts/genre/${genre}`).then(r => r.data),
  newReleases:     ()                  => api.get('/api/charts/new-releases').then(r => r.data),
  trendingArtists: ()                  => api.get('/api/charts/trending-artists').then(r => r.data),
};

export const searchApi = {
  search:      (q: string, type = 'all') => api.get('/api/search', { params: { q, type } }).then(r => r.data),
  suggestions: (q: string)               => api.get('/api/search/suggestions', { params: { q } }).then(r => r.data),
};

export const playlistsApi = {
  list:       ()                          => api.get('/api/playlists').then(r => r.data),
  get:        (id: string)                => api.get(`/api/playlists/${id}`).then(r => r.data),
  create:     (data: any)                 => api.post('/api/playlists', data).then(r => r.data),
  update:     (id: string, data: any)     => api.patch(`/api/playlists/${id}`, data).then(r => r.data),
  delete:     (id: string)                => api.delete(`/api/playlists/${id}`),
  addSong:    (pid: string, sid: string)  => api.post(`/api/playlists/${pid}/songs`, { songId: sid }).then(r => r.data),
  removeSong: (pid: string, sid: string)  => api.delete(`/api/playlists/${pid}/songs/${sid}`),
};

export const usersApi = {
  me:             () => api.get('/api/users/me').then(r => r.data),
  update:         (d: any) => api.patch('/api/users/me', d).then(r => r.data),
  likedSongs:     () => api.get('/api/users/me/liked').then(r => r.data),
  history:        () => api.get('/api/users/me/history').then(r => r.data),
  followedArtists:() => api.get('/api/users/me/following').then(r => r.data),
};

export const recommendApi = {
  forMe:          (mood?: string) => api.get('/api/recommendations', { params: { mood } }).then(r => r.data),
  risingArtists:  ()              => api.get('/api/recommendations/rising').then(r => r.data),
};

export const authApi = {
  syncUser: () => api.post('/api/auth/sync').then(r => r.data),
};

export const adminApi = {
  analytics:    ()                   => api.get('/api/admin/analytics').then(r => r.data),
  users:        (params?: any)       => api.get('/api/admin/users', { params }).then(r => r.data),
  songs:        ()                   => api.get('/api/admin/songs').then(r => r.data),
  createArtist: (data: any)          => api.post('/api/admin/artists', data).then(r => r.data),
  updateArtist: (id: string, d: any) => api.patch(`/api/admin/artists/${id}`, d).then(r => r.data),
  featureSong:  (songId: string, featured: boolean) =>
                  api.post('/api/admin/charts/feature-song', { songId, featured }),
  uploadSong:   (fd: FormData) =>
                  api.post('/api/upload/song', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
};

export const lyricsApi = {
  get: (songId: string) => api.get(`/api/lyrics/${songId}`).then(r => r.data),
};

export const audiusApi = {
  trending: (time = 'week') => api.get('/api/audius/trending', { params: { time } }).then(r => r.data),
  search:   (q: string)     => api.get('/api/audius/search', { params: { q } }).then(r => r.data),
};

export default api;
