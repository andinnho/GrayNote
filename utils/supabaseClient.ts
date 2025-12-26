import { createClient } from '@supabase/supabase-js';

// Credentials provided for integration
const SUPABASE_URL: string = 'https://beydgaalbtemiqxthvcj.supabase.co';
const SUPABASE_KEY: string = 'sb_publishable_XMR3NYZ01PMN8IjvDirilw_Hf5lZ-96';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0 && SUPABASE_URL !== 'https://placeholder.supabase.co';
};

// Create client with the provided credentials
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_KEY
);