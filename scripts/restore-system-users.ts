/**
 * Restore system_users from auth.users after accidental deletion
 */
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'auth' },
});

async function main() {
  const tempPassword = 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Get all auth.users
  const { data: authUsers, error: authError } = await supabaseAdmin
    .from('users')
    .select('id, email, raw_user_meta_data, created_at')
    .order('created_at', { ascending: false });

  if (authError) {
    console.error('Failed to fetch auth.users:', authError.message);
    process.exit(1);
  }

  console.log(`Found ${authUsers.length} auth users to restore`);

  let success = 0;
  let failed = 0;

  // Switch back to public schema for system_users
  const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  });

  for (const authUser of authUsers) {
    const name = authUser.raw_user_meta_data?.name || authUser.email?.split('@')[0] || 'User';
    const email = authUser.email;
    const userId = `U-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const { error: insertError } = await supabasePublic
        .from('system_users')
        .insert({
          id: userId,
          name,
          email,
          role: 'member',
          role_description: 'member',
          avatar_initials: name.slice(0, 2).toUpperCase(),
          status: 'Active',
          linked_employee_id: null,
          username: null,
          mobile_number: null,
          department: null,
          custom_role_id: null,
          security_settings: {},
          data_restrictions: {},
          allowed_tabs: [],
          allowed_settings: {},
          permission_matrix: {},
          password_hash: passwordHash,
          force_password_change: true,
          auth_user_id: authUser.id,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Failed to restore ${email}:`, insertError.message);
        failed++;
      } else {
        console.log(`Restored: ${email} (${name})`);
        success++;
      }
    } catch (err: any) {
      console.error(`Error restoring ${email}:`, err.message);
      failed++;
    }
  }

  console.log(`\nDone: ${success} restored, ${failed} failed`);
  console.log('All passwords set to: ChangeMe123!');
  console.log('Users will be prompted to change their password on first login.');
}

main().catch(console.error);
