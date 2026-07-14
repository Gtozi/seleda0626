/**
 * Apply migrations 057 (folio duplication/balance fix) and 058 (check-in discount fix)
 * Run: npx tsx supabase/run-migration-057-058.ts
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
  process.exitCode = 1;
  throw new Error('Missing required env vars');
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const files = [
  '057_fix_folio_duplication_and_balance.sql',
  '058_checkin_discount_fix.sql',
];

for (const file of files) {
  const sql = readFileSync(join(__dirname, 'migrations', file), 'utf8');
  let error = null;
  try {
    const result = await (supabase as any).rpc('exec_sql', { query: sql });
    error = result.error;
  } catch (e) {
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
    console.error(`Could not auto-apply ${file}. Please run the following SQL manually in your Supabase SQL Editor:\n`);
    console.log(sql);
    process.exitCode = 1;
    break;
  }

  console.log(`✓ Migration applied: ${file}`);
}

if (process.exitCode !== 1) {
  console.log('\nAll migrations applied successfully.');
}
