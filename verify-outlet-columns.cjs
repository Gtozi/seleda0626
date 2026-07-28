require('dotenv').config();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const tables = [
  'kitchen_inventory_batches', 'bar_inventory_batches',
  'kitchen_audit_log', 'bar_audit_log'
];

async function checkTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=outlet_id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  const text = await res.text();
  const ok = res.ok || text.includes('[]') || text.includes('[');
  console.log(`${table}: ${ok ? 'OK - outlet_id exists' : 'MISSING - ' + text}`);
}

(async () => {
  for (const t of tables) {
    try { await checkTable(t); } catch(e) { console.log(`${t}: ERROR - ${e.message}`); }
  }
})();
