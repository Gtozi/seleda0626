/**
 * Verify system_users password_hash values
 */
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const testPassword = 'ChangeMe123!';
  const testHash = await bcrypt.hash(testPassword, 10);
  console.log('Test hash for ChangeMe123!:', testHash.substring(0, 20) + '...');

  const { data: users, error } = await supabaseAdmin
    .from('system_users')
    .select('email, password_hash')
    .limit(5);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('\nCurrent password hashes:');
  for (const user of users || []) {
    const hashPreview = user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'NULL';
    const matches = user.password_hash ? await bcrypt.compare(testPassword, user.password_hash) : false;
    console.log(`${user.email}: ${hashPreview} (matches: ${matches})`);
  }
}

main().catch(console.error);
