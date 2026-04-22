import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { initAuthListener, useAuthStore } from './store/authStore';
import AppLayout from './components/common/AppLayout';
import AuthGuard from './components/common/AuthGuard';
import AdminGuard from './components/common/AdminGuard';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BrowsePage from './pages/BrowsePage';
import GenrePage from './pages/GenrePage';
import ChartPage from './pages/ChartPage';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import PlaylistPage from './pages/PlaylistPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PremiumPage from './pages/PremiumPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const setLoading = useAuthStore(s => s.setLoading);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app with sidebar + player */}
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/genre/:genre" element={<GenrePage />} />
            <Route path="/charts" element={<ChartPage />} />
            <Route path="/artist/:slug" element={<ArtistPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/premium" element={<PremiumPage />} />

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminGuard />}>
              <Route path="/admin/*" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
        hideProgressBar
        toastStyle={{
          background: '#1a1a2e',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </QueryClientProvider>
  );
}
