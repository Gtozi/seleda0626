/**
 * Apply migration 017: pending_admin_changes table
 * Run: npx tsx supabase/run-migration-017.ts
 */
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const sql = `
CREATE TABLE IF NOT EXISTS pending_admin_changes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  change_type TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Pending',
  payload     JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_admin_changes_status ON pending_admin_changes (status);
`;

const { error } = await (supabase as any).rpc('exec_sql', { query: sql }).catch(async () => {
  // Fallback: execute via raw SQL using the REST API
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return res.ok ? { error: null } : { error: await res.text() };
});

if (error) {
  // Try direct table creation via insert/select workaround — print manual instructions
  console.error('Could not auto-apply migration. Please run the following SQL in your Supabase SQL Editor:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✓ Migration 017 applied: pending_admin_changes table created.');
