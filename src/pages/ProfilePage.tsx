import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Crown, Calendar, Edit2, Check, X } from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: usersApi.me,
  });

  const profile = data?.user;

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update({ displayName, bio }),
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditing(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  function startEdit() {
    setDisplayName(profile?.displayName || '');
    setBio(profile?.bio || '');
    setEditing(true);
  }

  return (
    <div className="px-6 py-6 pb-8 max-w-xl">
      <h1 className="text-xl font-bold mb-6">Your Profile</h1>

      {/* Avatar + info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile?.displayName?.charAt(0).toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full h-9 px-3 bg-white/5 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-[#F97316]/50 mb-2"
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-lg font-bold truncate">{profile?.displayName}</h2>
            )}
            <p className="text-sm text-white/40">{profile?.email}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.tier === 'PREMIUM'
                  ? 'bg-[#F97316]/20 text-[#F97316]'
                  : 'bg-white/5 text-white/40'
              }`}>
                {user?.tier === 'PREMIUM' ? '👑 Premium' : 'Free'}
              </span>
              <span className="text-xs text-white/30 capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="text-xs text-white/40 block mb-1">Bio</label>
          {editing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm resize-none focus:outline-none focus:border-[#F97316]/50"
            />
          ) : (
            <p className="text-sm text-white/60">{profile?.bio || 'No bio yet.'}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30">
          <Calendar size={12} />
          Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-ZM', { year: 'numeric', month: 'long' }) : '—'}
        </div>

        {/* Edit / Save buttons */}
        <div className="flex gap-2 mt-4">
          {editing ? (
            <>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-sm font-medium disabled:opacity-50"
              >
                <Check size={14} /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
              >
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Subscription */}
      {user?.tier === 'FREE' && (
        <div className="bg-gradient-to-r from-[#F97316]/10 to-[#EF4444]/5 border border-[#F97316]/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-[#F97316]" />
            <h3 className="font-semibold">Upgrade to Premium</h3>
          </div>
          <p className="text-sm text-white/50 mb-4">
            No ads, offline downloads, high quality audio, and more.
          </p>
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EF4444] text-sm font-medium hover:opacity-90 transition"
          >
            <Crown size={14} />
            Go Premium — K49/mo
          </Link>
        </div>
      )}
    </div>
  );
}
