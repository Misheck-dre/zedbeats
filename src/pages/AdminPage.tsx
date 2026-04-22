import { useState, useRef } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3, Users, Music, UserCheck,
  Upload, TrendingUp, Star, Loader2, Check,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { toast } from 'react-toastify';

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.analytics,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#F97316]" />
      </div>
    );
  }

  const stats = data?.overview || {};

  const cards = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: Users, color: '#F97316' },
    { label: 'Premium Users', value: stats.premiumUsers?.toLocaleString(), icon: Star, color: '#EF4444' },
    { label: 'Total Songs', value: stats.totalSongs?.toLocaleString(), icon: Music, color: '#10B981' },
    { label: 'Total Artists', value: stats.totalArtists?.toLocaleString(), icon: UserCheck, color: '#8B5CF6' },
    { label: 'Total Plays', value: stats.totalPlays?.toLocaleString(), icon: TrendingUp, color: '#F59E0B' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Platform Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={16} style={{ color: c.color }} />
              <span className="text-xs text-white/50">{c.label}</span>
            </div>
            <p className="text-2xl font-bold">{c.value || '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/50 mb-1">New Users (7 days)</p>
          <p className="text-2xl font-bold">{data?.thisWeek?.newUsers?.toLocaleString() || '—'}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/50 mb-1">New Plays (7 days)</p>
          <p className="text-2xl font-bold">{data?.thisWeek?.newPlays?.toLocaleString() || '—'}</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold mb-3 text-white/70">Top Songs All Time</h3>
      <div className="space-y-2">
        {(data?.topSongs || []).map((s: any, i: number) => (
          <div key={s.id} className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg">
            <span className="text-white/30 text-sm w-5 tabular-nums">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.title}</p>
              <p className="text-xs text-white/40">{s.artist?.name}</p>
            </div>
            <span className="text-xs text-white/30 tabular-nums">{Number(s.playCount).toLocaleString()} plays</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload Song ──────────────────────────────────────────────────────────────
function AdminUpload() {
  const [form, setForm] = useState({
    title: '', artistId: '', albumId: '', genre: '',
    duration: '', isExplicit: false, mood: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: artists } = useQuery({
    queryKey: ['admin-artists-list'],
    queryFn: () => adminApi.analytics().then(() =>
      fetch('/api/artists?limit=200').then(r => r.json())
    ),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!audioFile) throw new Error('Audio file required');
      const fd = new FormData();
      fd.append('audio', audioFile);
      if (coverFile) fd.append('cover', coverFile);
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      return adminApi.uploadSong(fd);
    },
    onSuccess: () => {
      toast.success('Song uploaded successfully!');
      setForm({ title: '', artistId: '', albumId: '', genre: '', duration: '', isExplicit: false, mood: '' });
      setAudioFile(null);
      setCoverFile(null);
    },
    onError: (err: any) => toast.error(err.message || 'Upload failed'),
  });

  const GENRES = ['Zed Hip-Hop', 'Afrobeat', 'Gospel', 'Kalindula', 'R&B', 'Dancehall', 'Jazz', 'Traditional'];

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-6">Upload New Song</h2>

      <div className="space-y-4">
        {/* Audio file */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Audio File *</label>
          <div
            onClick={() => audioRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#F97316]/40 transition"
          >
            {audioFile ? (
              <div className="flex items-center justify-center gap-2 text-[#F97316]">
                <Check size={16} />
                <span className="text-sm">{audioFile.name}</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-white/30 mb-2" />
                <p className="text-sm text-white/40">Click to select audio file (MP3, WAV, FLAC)</p>
              </>
            )}
          </div>
          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Cover art */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Cover Art</label>
          <div
            onClick={() => coverRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#F97316]/40 transition"
          >
            {coverFile ? (
              <span className="text-sm text-[#F97316]">✓ {coverFile.name}</span>
            ) : (
              <p className="text-sm text-white/40">Click to select cover image</p>
            )}
          </div>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Song title */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Song Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Enter song title"
            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/50"
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Genre</label>
          <select
            value={form.genre}
            onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}
            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F97316]/50"
          >
            <option value="">Select genre</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Duration (seconds)</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="e.g. 213"
            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/50"
          />
        </div>

        {/* Artist ID */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Artist ID *</label>
          <input
            value={form.artistId}
            onChange={(e) => setForm(f => ({ ...f, artistId: e.target.value }))}
            placeholder="Artist UUID from database"
            className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/50"
          />
        </div>

        {/* Explicit */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isExplicit}
            onChange={(e) => setForm(f => ({ ...f, isExplicit: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-white/70">Explicit content</span>
        </label>

        <button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending || !audioFile || !form.title || !form.artistId}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EF4444] text-sm font-medium disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          {uploadMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={16} /> Upload Song</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Users Management ─────────────────────────────────────────────────────────
function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.users(),
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">User Management</h2>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#F97316]" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs">
                <th className="text-left pb-3 font-medium">User</th>
                <th className="text-left pb-3 font-medium">Tier</th>
                <th className="text-left pb-3 font-medium">Role</th>
                <th className="text-left pb-3 font-medium">Joined</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data?.users || []).map((u: any) => (
                <tr key={u.id} className="hover:bg-white/3">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{u.displayName}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.tier === 'PREMIUM' ? 'bg-[#F97316]/20 text-[#F97316]' : 'bg-white/5 text-white/40'}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="py-3 text-white/60">{u.role}</td>
                  <td className="py-3 text-white/40 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
    { to: '/admin/upload', label: 'Upload Song', icon: Upload },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex min-h-full">
      <aside className="w-48 bg-white/3 border-r border-white/5 p-4 flex-shrink-0">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Admin</p>
        <nav className="space-y-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-[#F97316]/20 text-[#F97316]' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <link.icon size={15} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
}
