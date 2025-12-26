import { createClient } from '@supabase/supabase-js';

// Leave empty to default to Offline Mode. 
// Enter real credentials here to enable Sync.
const SUPABASE_URL: string = ''; 
const SUPABASE_KEY: string = '';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0 && SUPABASE_URL !== 'https://placeholder.supabase.co';
};

// Create client with fallback values to prevent initialization crash (DNS errors).
// The app will strictly check isSupabaseConfigured() before using it.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_KEY || 'placeholder'
);