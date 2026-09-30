import { createClient } from '@supabase/supabase-js';

// Using NEXT_PUBLIC_ prefix for Next.js environment variables to be exposed to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
