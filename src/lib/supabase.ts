/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access public variables safely via import.meta.env
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Automatically sanitize URL to strip trailing rest/v1 or trailing slashes
let cleanUrl = rawUrl.trim();
if (cleanUrl.endsWith('/rest/v1/')) {
  cleanUrl = cleanUrl.slice(0, -9);
} else if (cleanUrl.endsWith('/rest/v1')) {
  cleanUrl = cleanUrl.slice(0, -8);
}
if (cleanUrl.endsWith('/')) {
  cleanUrl = cleanUrl.slice(0, -1);
}

const supabaseUrl = cleanUrl;
const isKeyConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isKeyConfigured) {
  console.warn(
    '⚠️ Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables to connect to a live backend.'
  );
}

// Set up the Supabase Client. If config is missing, create a mock client structure to avoid crashing.
export const supabase = isKeyConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy(
      {},
      {
        get: (target, prop) => {
          return () => {
            console.error(
              `❌ Supabase call [${String(prop)}] failed because credentials are not configured in your .env variables yet.`
            );
            return Promise.resolve({
              data: null,
              error: {
                message: 'Supabase credentials missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
              },
            });
          };
        },
      }
    ) as ReturnType<typeof createClient>);

export const hasSupabaseConfig = isKeyConfigured;
export const hasUserCustomKeys = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export { supabaseUrl, supabaseAnonKey };
