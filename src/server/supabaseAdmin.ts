import { createClient } from '@supabase/supabase-js';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get environment variables based on environment
const supabaseUrl = isBrowser
  ? (import.meta.env?.VITE_SUPABASE_URL || '')
  : (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');

const serviceRoleKey = isBrowser
  ? (import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || '')
  : (process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export const hasSupabaseAdminConfig = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseAdmin = hasSupabaseAdminConfig
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
