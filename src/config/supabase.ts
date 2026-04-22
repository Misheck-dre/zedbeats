import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || SUPABASE_URL.includes('PASTE_')) {
  console.warn('⚠️  VITE_SUPABASE_URL not set in frontend-web/.env');
}

// Works with both legacy eyJ... keys AND new sb_publishable_... keys
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,   // handles Google OAuth redirect
  },
});
