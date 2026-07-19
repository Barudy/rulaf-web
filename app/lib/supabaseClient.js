import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Anon Key dari fail environment (.env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Membina dan mengeksport klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);