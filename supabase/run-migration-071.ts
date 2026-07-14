/**
 * Apply migration 071: ID Card Storage for Check-In
 * Run: npx tsx supabase/run-migration-071.ts
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

const sql = readFileSync(join(__dirname, 'migrations/071_id_card_storage.sql'), 'utf8');

async function applyMigration() {
  try {
    console.log('Applying migration 071 (ID card storage) - fixed version...');
    
    // First, drop the existing function if it exists (to fix the updated_at error)
    const dropFunctionSql = 'drop function if exists update_guest_id_card cascade;';
    
    console.log('Dropping existing function (if any)...');
    const dropResponse = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: dropFunctionSql })
    });
    
    if (dropResponse.ok) {
      console.log('✓ Existing function dropped');
    } else {
      console.log('No existing function to drop (this is fine)');
    }
    
    // Now apply the full migration
    console.log('Applying full migration...');
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error applying migration:', error);
      console.log('\nPlease run the migration manually in Supabase SQL Editor:');
      console.log('1. Go to your Supabase dashboard SQL editor');
      console.log('2. Copy and paste the contents of: supabase/migrations/071_id_card_storage.sql');
      console.log('3. Click "Run" to execute');
      return;
    }
    
    console.log('✓ Migration 071 applied successfully');
    console.log('This adds:');
    console.log('  - id-cards storage bucket for ID card images');
    console.log('  - update_guest_id_card function for storing ID card info');
    console.log('  - Index on guests.identification_doc for faster queries');
  } catch (err) {
    console.error('Error applying migration:', err);
    console.log('\nPlease run the migration manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard SQL editor');
    console.log('2. Copy and paste the contents of: supabase/migrations/071_id_card_storage.sql');
    console.log('3. Click "Run" to execute');
  }
}

applyMigration();
