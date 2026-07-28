/**
 * Updates system_users.password_hash to Node's bcrypt hash of ChangeMe123!
 * This fixes ERP login which uses bcrypt.compare() on system_users.password_hash
 * 
 * Run: npx tsx scripts/update-system-passwords.ts
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
  const tempPassword = 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const { error } = await supabaseAdmin
    .from('system_users')
    .update({ 
      password_hash: passwordHash,
      force_password_change: true,
    })
    .not('auth_user_id', 'is', null);

  if (error) {
    console.error('Failed to update passwords:', error.message);
    process.exit(1);
  }

  console.log(`Updated all system_users passwords to: ${tempPassword}`);
  console.log('Users will be prompted to change their password on next login.');
}

main().catch(console.error);
