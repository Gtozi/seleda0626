/**
 * Apply migration 223 via PostgREST (no exec_sql RPC available):
 * Insert the folio:invoice:create permission and grant it to the folio-owning
 * roles using the Supabase REST API directly.
 *
 * Run: npx tsx supabase/run-migration-223.ts
 */
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  apikey: key,
  Authorization: `Bearer ${key}`,
  Prefer: 'resolution=merge-duplicates,return=representation',
};

async function upsertPermission() {
  const res = await fetch(`${url}/rest/v1/permissions?id=eq.perm_folio_invoice_create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: 'perm_folio_invoice_create',
      code: 'folio:invoice:create',
      module: 'frontoffice',
      description: 'Generate folio invoice',
    }),
  });
  if (!res.ok) {
    throw new Error(`permissions upsert failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (Array.isArray(data) ? data[0] : data)?.id;
}

async function grantRole(roleId: string, permissionId: string) {
  // Check existing first to avoid duplicate-key errors on role_permissions PK.
  const checkRes = await fetch(
    `${url}/rest/v1/role_permissions?role_id=eq.${roleId}&permission_id=eq.${permissionId}&select=role_id`,
    { headers }
  );
  if (!checkRes.ok) {
    throw new Error(`role_permissions check failed: ${checkRes.status} ${await checkRes.text()}`);
  }
  const existing = await checkRes.json();
  if (Array.isArray(existing) && existing.length > 0) {
    console.log(`  · ${roleId} already has permission ${permissionId}`);
    return;
  }
  const res = await fetch(`${url}/rest/v1/role_permissions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`role_permissions insert for ${roleId} failed: ${res.status} ${await res.text()}`);
  }
  console.log(`  ✓ Granted folio:invoice:create to ${roleId}`);
}

async function main() {
  console.log('Applying migration 223: Seed folio:invoice:create permission');
  const permissionId = await upsertPermission();
  console.log(`  ✓ Permission inserted: ${permissionId}`);

  for (const roleId of ['role_frontoffice', 'role_finance', 'role_fb']) {
    await grantRole(roleId, permissionId);
  }

  console.log('\n✓ Migration 223 applied. Generate-invoice endpoint should now accept frontoffice/finance/fb users.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
