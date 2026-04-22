import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GENRES } from '../constants/genres';

const MOODS = [
  { id: 'happy', label: 'Happy Vibes', color: '#F59E0B', emoji: '😊' },
  { id: 'party', label: 'Party Mode', color: '#EF4444', emoji: '🎉' },
  { id: 'calm', label: 'Chill & Relax', color: '#10B981', emoji: '😌' },
  { id: 'worship', label: 'Worship', color: '#8B5CF6', emoji: '🙏' },
  { id: 'energetic', label: 'Get Moving', color: '#F97316', emoji: '⚡' },
  { id: 'romantic', label: 'Romantic', color: '#EC4899', emoji: '❤️' },
  { id: 'focus', label: 'Focus', color: '#06B6D4', emoji: '🎯' },
  { id: 'sad', label: 'Feeling Blue', color: '#3B82F6', emoji: '💙' },
];

export default function BrowsePage() {
  return (
    <div className="px-6 py-6 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutGrid size={20} className="text-[#F97316]" />
        <h1 className="text-xl font-bold">Browse</h1>
      </div>

      {/* Genres */}
      <section className="mb-10">
        <h2 className="text-base font-semibold mb-4">Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GENRES.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/browse/genre/${encodeURIComponent(genre.id)}`}
                className="relative h-28 rounded-2xl overflow-hidden flex flex-col justify-between p-4 block group"
                style={{
                  background: `linear-gradient(135deg, ${genre.color}50, ${genre.color}15)`,
                  border: `1px solid ${genre.color}30`,
                }}
              >
                <span className="text-3xl">{genre.emoji}</span>
                <div>
                  <p className="text-sm font-bold">{genre.name}</p>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${genre.color}15` }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Moods */}
      <section>
        <h2 className="text-base font-semibold mb-4">Browse by Mood</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOODS.map((mood, i) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
            >
              <Link
                to={`/?mood=${mood.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all block"
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
