import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client for browser use
// Uses VITE_ prefixed environment variables which are exposed to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with elevated privileges
// Use this only in server-side code (server.ts, API routes, etc.)
// Never expose the service role key to the browser
export const createServerClient = () => {
  const serverUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return createClient(serverUrl, serviceRoleKey);
};
