const { Client } = require('pg');
require('dotenv').config();

// Parse connection string from SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract connection details from URL
// Format: https://[project-ref].supabase.co
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// The PostgreSQL connection string for Supabase
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const client = new Client({ connectionString });

const sql = require('fs').readFileSync('supabase/migrations/056_fix_split_payment_validation.sql', 'utf8');

client.connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('✓ Migration 056 applied successfully');
    return client.end();
  })
  .catch(err => {
    console.error('Error applying migration:', err.message);
    client.end();
    process.exit(1);
  });
