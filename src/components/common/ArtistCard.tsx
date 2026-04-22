import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    slug: string;
    photoUrl?: string;
    genres?: string[];
    monthlyListeners?: number;
    isVerified?: boolean;
    recentPlays?: number;
  };
}

function formatListeners(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }}>
      <Link
        to={`/artist/${artist.slug}`}
        className="group flex flex-col items-center text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all block"
      >
        {/* Avatar */}
        <div className="relative w-20 h-20 mb-3">
          {artist.photoUrl ? (
            <img
              src={artist.photoUrl}
              alt={artist.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center text-2xl font-bold">
              {artist.name.charAt(0)}
            </div>
          )}
          {artist.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F97316] flex items-center justify-center text-xs">
              ✓
            </div>
          )}
        </div>

        <p className="text-sm font-semibold truncate w-full">{artist.name}</p>
        <p className="text-xs text-white/40 mt-0.5">Artist</p>

        {artist.monthlyListeners != null && artist.monthlyListeners > 0 && (
          <div className="flex items-center gap-1 mt-1 text-white/30 text-xs">
            <Users size={11} />
            <span>{formatListeners(artist.monthlyListeners)}</span>
          </div>
        )}

        {artist.recentPlays != null && artist.recentPlays > 0 && (
          <span className="mt-2 px-2 py-0.5 rounded-full bg-[#F97316]/20 text-[#F97316] text-[10px]">
            🔥 Rising
          </span>
        )}

        {artist.genres && artist.genres.length > 0 && (
          <p className="text-[10px] text-white/30 mt-1 truncate w-full">
            {artist.genres.slice(0, 2).join(' · ')}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
