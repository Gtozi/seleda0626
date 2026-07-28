/**
 * Recreates auth users via Supabase Auth Admin API to fix missing auth.identities
 * This fixes POS login which uses supabase.auth.signInWithPassword().
 * Also syncs system_users.password_hash for ERP login compatibility.
 * 
 * Run: npx tsx scripts/sync-auth-passwords.ts
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
  // Get all system_users with auth_user_id
  const { data: users, error } = await supabaseAdmin
    .from('system_users')
    .select('id, email, auth_user_id, name, password_hash')
    .not('auth_user_id', 'is', null);

  if (error) {
    console.error('Failed to fetch users:', error.message);
    process.exit(1);
  }

  console.log(`Found ${users.length} users to fix`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    const tempPassword = 'ChangeMe123!';
    
    try {
      // Step 1: Delete the broken auth record directly from SQL
      const { error: deleteError } = await supabaseAdmin.rpc('delete_auth_user_by_id', {
        p_user_id: user.auth_user_id,
      });
      
      if (deleteError && !deleteError.message.includes('not found')) {
        console.error(`Failed to delete auth for ${user.email}:`, deleteError.message);
        failed++;
        continue;
      }
      
      // Step 2: Create new auth user via Admin API (this properly creates identities)
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: user.name },
      });

      if (createError) {
        console.error(`Failed to create auth for ${user.email}:`, createError.message);
        failed++;
        continue;
      }
      
      // Step 3: Update system_users with new auth_user_id and password hash
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      await supabaseAdmin
        .from('system_users')
        .update({ 
          auth_user_id: authData.user.id,
          password_hash: passwordHash,
          force_password_change: true,
        })
        .eq('id', user.id);
      
      console.log(`Recreated auth user for ${user.email} -> ${tempPassword}`);
      success++;
    } catch (err: any) {
      console.error(`Error processing ${user.email}:`, err.message);
      failed++;
    }
  }

  // Mark all users for forced password change
  await supabaseAdmin
    .from('system_users')
    .update({ force_password_change: true })
    .not('auth_user_id', 'is', null);

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
  console.log('All passwords have been reset to: ChangeMe123!');
  console.log('Users will be prompted to change their password on next login.');
}

main().catch(console.error);
