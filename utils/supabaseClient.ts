import { createClient } from '@supabase/supabase-js';

// Leave empty to default to Offline Mode. 
// Enter real credentials here to enable Sync.
const SUPABASE_URL = ''; 
const SUPABASE_KEY = '';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
};

// Create client with fallback values to prevent initialization crash.
// The app will check isSupabaseConfigured() before using it.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_KEY || 'placeholder'
);