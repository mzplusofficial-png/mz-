
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to hardcoded values
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = (envUrl && envUrl !== '') ? envUrl : 'https://ydkicdhcylpdffuzgdvm.supabase.co';
const SUPABASE_ANON_KEY = (envKey && envKey !== '') ? envKey : 'sb_publishable_E_rpgEr5_Vf1_1wkLBGKNQ_hxvfdeED';

if (!SUPABASE_URL.startsWith('http')) {
  console.error("MZ+ System: Invalid SUPABASE_URL configured:", SUPABASE_URL);
}

// Create a singleton client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
