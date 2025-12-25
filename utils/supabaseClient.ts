import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eyvheugoqixvbciuadqq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6wJ8Mwgt4bfbogHH1N1_bw_mN46idPD';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);