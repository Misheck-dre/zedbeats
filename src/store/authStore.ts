import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../config/supabase';
import { authApi } from '../services/api';

interface AppUser {
  id: string;
  supabaseUid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  tier: 'FREE' | 'PREMIUM';
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: AppUser | null) => void;
  setLoading: (v: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new Error(error.message);
          const resp = await authApi.syncUser();
          set({ user: resp.user, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
          });
          if (error) throw new Error(error.message);
          // Page will redirect — user sync happens in callback
          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      register: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: displayName } },
          });
          if (error) throw new Error(error.message);
          const resp = await authApi.syncUser();
          set({ user: resp.user, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'zedbeats-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);

// Listen to Supabase auth state changes
export function initAuthListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState();
    if (session?.user) {
      try {
        const resp = await authApi.syncUser();
        store.setUser(resp.user);
      } catch {
        store.setUser(null);
      }
    } else {
      store.setUser(null);
    }
    store.setLoading(false);
  });
  return () => subscription.unsubscribe();
}
