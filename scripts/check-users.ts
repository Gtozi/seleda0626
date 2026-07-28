import { createClient } from '@supabase/supabase-js';

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
  const { count, error } = await supabaseAdmin
    .from('system_users')
    .select('*', { count: 'exact', head: true });

  console.log('System users count:', count);
  console.log('Error:', error?.message);

  if (count && count > 0) {
    const { data, error: err } = await supabaseAdmin
      .from('system_users')
      .select('id, email, password_hash')
      .limit(3);
    
    console.log('\nSample users:');
    console.log(data);
    console.log('Error:', err?.message);
  }
}

main().catch(console.error);
