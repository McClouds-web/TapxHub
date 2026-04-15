import { createClient } from '@supabase/supabase-js';

// Support strictly Vite standard variables to prevent ReferenceError in browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Base client for standard queries adhering strictly to RLS
console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'MISSING');
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded' : 'MISSING');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using service role key (Bypasses RLS). 
// Note: This relies on the environment injecting service keys securely, which is meant for server/edge execution.
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;
