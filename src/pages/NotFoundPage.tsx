import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Music2 } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-7xl mb-6">🎵</div>
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-xl font-semibold mb-2">Page not found</p>
        <p className="text-white/40 text-sm mb-8 max-w-xs">
          Looks like this track doesn't exist. Maybe it was removed or the URL is wrong.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-sm font-medium hover:opacity-90 transition"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            to="/browse"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-sm hover:bg-white/15 transition"
          >
            <Music2 size={16} />
            Browse Music
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
