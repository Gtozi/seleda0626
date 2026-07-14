/**
 * Apply migration 056: fix split payment validation
 * Run: npx tsx supabase/run-migration-056.ts
 */
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const sql = readFileSync(join(__dirname, 'migrations/056_fix_split_payment_validation.sql'), 'utf8');

let error = null;
try {
  const result = await (supabase as any).rpc('exec_sql', { query: sql });
  error = result.error;
} catch (e) {
  // Fallback: execute via raw SQL using the REST API
  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) {
      error = await res.text();
    }
  } catch (fetchError) {
    error = fetchError;
  }
}

if (error) {
  // Print manual instructions
  console.error('Could not auto-apply migration. Please run the following SQL in your Supabase SQL Editor:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✓ Migration 056 applied: fixed post_folio_payment function payment_id variable issue.');
