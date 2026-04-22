import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Search, LayoutGrid, BarChart2, Library,
  User, Music2, Crown, ShieldCheck, LogOut, Plus, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Player from '../player/Player';
import CreatePlaylistModal from '../playlist/CreatePlaylistModal';

const navItems = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/browse', label: 'Browse', icon: LayoutGrid },
  { to: '/charts', label: 'Charts', icon: BarChart2 },
  { to: '/library', label: 'Your Library', icon: Library, auth: true },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPlaylist, setCreatePlaylist] = useState(false);

  return (
    <div className="h-screen bg-[#0a0a14] text-white flex flex-col overflow-hidden">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f0f1e] border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-[#F97316] to-[#EF4444] bg-clip-text text-transparent">
            ZedBeats
          </span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/10">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          className={`fixed md:static md:translate-x-0 z-30 w-64 h-full bg-[#0f0f1e] border-r border-white/5 flex flex-col md:block`}
          style={{ transform: sidebarOpen ? 'translateX(0)' : undefined }}
        >
          {/* Logo */}
          <div className="px-6 py-6 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center">
                <Music2 size={18} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#F97316] to-[#EF4444] bg-clip-text text-transparent">
                ZedBeats
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1 ml-12">Zambia's Music Platform</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 mb-2 mt-2">Menu</p>
            {navItems.map((item) => {
              if (item.auth && !user) return null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F97316]/20 to-[#EF4444]/10 text-[#F97316] font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}

            {user && (
              <>
                <div className="border-t border-white/5 my-4" />
                <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 mb-2">Your Space</p>

                <button
                  onClick={() => setCreatePlaylist(true)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Plus size={12} />
                  </div>
                  Create Playlist
                </button>
              </>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
              <>
                <div className="border-t border-white/5 my-4" />
                <NavLink
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-400 font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <ShieldCheck size={18} />
                  Admin Panel
                </NavLink>
              </>
            )}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-white/5 space-y-2">
            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/premium')}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EF4444] text-sm font-medium hover:opacity-90 transition"
                >
                  <Crown size={15} />
                  Go Premium
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition"
                >
                  Log In
                </button>
              </div>
            ) : (
              <>
                {user.tier === 'FREE' && (
                  <button
                    onClick={() => navigate('/premium')}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#F97316]/20 to-[#EF4444]/10 border border-[#F97316]/30 text-sm text-[#F97316] hover:opacity-90 transition"
                  >
                    <Crown size={14} />
                    Upgrade to Premium
                  </button>
                )}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#EF4444] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <p className="text-xs text-white/40 capitalize">{user.tier.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
                    title="Log out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a14] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <Outlet />
        </main>
      </div>

      {/* Music Player — always visible */}
      <Player />

      {createPlaylist && (
        <CreatePlaylistModal onClose={() => setCreatePlaylist(false)} />
      )}
    </div>
  );
}
