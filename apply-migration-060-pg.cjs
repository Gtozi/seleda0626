const { Client } = require('pg');
require('dotenv').config();

// Parse connection string from SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract connection details from URL
// Format: https://[project-ref].supabase.co
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// The PostgreSQL connection string for Supabase (direct connection)
const connectionString = `postgresql://postgres:${supabaseKey}@db.oicpekbxfufqggkgdgyi.supabase.co:5432/postgres`;

const client = new Client({ connectionString });

const sql = require('fs').readFileSync('supabase/migrations/060_unified_billing_calculation.sql', 'utf8');

client.connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('✓ Migration 060 (unified billing calculation) applied successfully');
    return client.end();
  })
  .catch(err => {
    console.error('Error applying migration:', err.message);
    client.end();
    process.exit(1);
  });
