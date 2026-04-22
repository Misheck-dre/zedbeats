import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsApi } from '../../services/api';
import { toast } from 'react-toastify';

interface Props {
  onClose: () => void;
}

export default function CreatePlaylistModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => playlistsApi.create({ name, description, isPublic }),
    onSuccess: () => {
      toast.success('Playlist created!');
      queryClient.invalidateQueries({ queryKey: ['my-playlists'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create playlist'),
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ListMusic size={18} className="text-[#F97316]" />
              <h2 className="text-base font-semibold">Create Playlist</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Playlist name *</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Zambian Hits"
                maxLength={100}
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:border-[#F97316]/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your playlist..."
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:border-[#F97316]/50 transition resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsPublic(!isPublic)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-[#F97316]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-white/70">Public playlist</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => name.trim() && createMutation.mutate()}
                disabled={!name.trim() || createMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#F97316] text-sm font-medium disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating...</>
                ) : 'Create Playlist'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
