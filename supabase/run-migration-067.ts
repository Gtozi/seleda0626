/**
 * Apply migration 067: Fix check_in_reservation non-existent reservations.updated_at
 * Run: npx tsx supabase/run-migration-067.ts
 */
import dotenv from 'dotenv';
dotenv.config();
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

const sql = readFileSync(join(__dirname, 'migrations/067_fix_check_in_reservation_updated_at.sql'), 'utf8');

async function applyMigration() {
  try {
    console.log('Applying migration 067 (fix check_in_reservation updated_at reference)...');

    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error applying migration via exec_sql:', error);
      return;
    }

    console.log('✓ Migration 067 applied successfully');
  } catch (err) {
    console.error('Error applying migration:', err);
    console.log('\nPlease run the migration manually in Supabase SQL Editor:');
    console.log('1. Open your Supabase project SQL Editor');
    console.log('2. Copy and paste the contents of: supabase/migrations/067_fix_check_in_reservation_updated_at.sql');
    console.log('3. Click "Run" to execute');
  }
}

applyMigration();
