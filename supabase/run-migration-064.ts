/**
 * Apply migration 064: Fix ALL ambiguous id references
 * Run: npx tsx supabase/run-migration-064.ts
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

const sql = readFileSync(join(__dirname, 'migrations/064_fix_all_ambiguous_id_references.sql'), 'utf8');

async function applyMigration() {
  try {
    console.log('Applying migration 064 (fix ALL ambiguous id references)...');
    
    // Use Supabase REST API to execute SQL
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
      
      // Fallback: Try executing via direct SQL endpoint
      console.log('Trying direct SQL execution via pg_catalog...');
      const pgResponse = await fetch(`${url}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!pgResponse.ok) {
        console.error('Direct SQL execution also failed');
        console.log('\nPlease run the migration manually in Supabase SQL Editor:');
        console.log('1. Go to https://supabase.com/dashboard/project/oicpekbxfufqggkgdgyi/sql');
        console.log('2. Copy and paste the contents of: supabase/migrations/064_fix_all_ambiguous_id_references.sql');
        console.log('3. Click "Run" to execute');
        return;
      }
    }
    
    console.log('✓ Migration 064 applied successfully');
    console.log('This fixes the "column reference id is ambiguous" error in:');
    console.log('  - post_folio_charge');
    console.log('  - check_in_reservation');
  } catch (err) {
    console.error('Error applying migration:', err);
    console.log('\nPlease run the migration manually in Supabase SQL Editor:');
    console.log('1. Go to https://supabase.com/dashboard/project/oicpekbxfufqggkgdgyi/sql');
    console.log('2. Copy and paste the contents of: supabase/migrations/064_fix_all_ambiguous_id_references.sql');
    console.log('3. Click "Run" to execute');
  }
}

applyMigration();
