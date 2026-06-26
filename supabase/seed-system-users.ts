/**
 * Seed preset system_users into Supabase.
 * Run: npx tsx supabase/seed-system-users.ts
 */
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const users = [
  { id: 'U-101', name: 'Front Office Supervisor', email: 'frontoffice@erp.com', role: 'frontoffice', role_description: 'Night Auditor', avatar_initials: 'FO', status: 'Active', allowed_tabs: ['frontoffice', 'settings'], allowed_settings: { viewRatePlans: true, viewRoomOutlook: true, viewSalesCampaigns: true } },
  { id: 'U-102', name: 'Housekeeping Manager', email: 'housekeeping@erp.com', role: 'housekeeping', role_description: 'HK Supervisor', avatar_initials: 'HK', status: 'Active', allowed_tabs: ['housekeeping', 'settings'], allowed_settings: { viewRoomOutlook: true } },
  { id: 'U-103', name: 'F&B Director', email: 'fb@erp.com', role: 'f&b', role_description: 'Culinary Director', avatar_initials: 'FB', status: 'Active', allowed_tabs: ['f&b', 'settings'], allowed_settings: { viewRoomOutlook: true } },
  { id: 'U-104', name: 'Chief Engineer', email: 'maintenance@erp.com', role: 'maintenance', role_description: 'Chief Engineer', avatar_initials: 'CE', status: 'Active', allowed_tabs: ['maintenance', 'settings'], allowed_settings: { viewRoomOutlook: true } },
  { id: 'U-105', name: 'General Manager', email: 'gm@erp.com', role: 'executive', role_description: 'General Manager', avatar_initials: 'GM', status: 'Active', allowed_tabs: ['frontoffice', 'housekeeping', 'f&b', 'maintenance', 'inventory', 'finance', 'hr', 'executive', 'admin', 'procurement', 'settings'], allowed_settings: { editGlobalSettings: true, adjustHotelTaxes: true, bypassHousekeepingLock: true, manageUserAccounts: true, viewRatePlans: true, editRatePlans: true, viewRoomOutlook: true, viewSalesCampaigns: true, manageSalesCampaigns: true } },
  { id: 'U-106', name: 'Finance Controller', email: 'finance@erp.com', role: 'finance', role_description: 'Finance Controller', avatar_initials: 'FC', status: 'Active', allowed_tabs: ['finance', 'settings'], allowed_settings: { viewRatePlans: true, editRatePlans: true, adjustHotelTaxes: true } },
  { id: 'U-107', name: 'HR Manager', email: 'hr@erp.com', role: 'hr', role_description: 'HR Manager', avatar_initials: 'HR', status: 'Active', allowed_tabs: ['hr', 'settings'], allowed_settings: { manageUserAccounts: true } },
  { id: 'U-108', name: 'Inventory Manager', email: 'inventory@erp.com', role: 'inventory', role_description: 'Stores Manager', avatar_initials: 'IM', status: 'Active', allowed_tabs: ['inventory', 'settings'], allowed_settings: {} },
  { id: 'U-109', name: 'Procurement Lead', email: 'procurement@erp.com', role: 'procurement', role_description: 'Procurement Lead', avatar_initials: 'PL', status: 'Active', allowed_tabs: ['procurement', 'settings'], allowed_settings: { viewRoomOutlook: true } },
  { id: 'U-110', name: 'System Administrator', email: 'admin@erp.com', role: 'system_admin', role_description: 'System Administrator', avatar_initials: 'SA', status: 'Active', allowed_tabs: ['admin', 'settings'], allowed_settings: {} },
];

// bcrypt hash for 'admin123' (10 rounds)
const passwordHash = '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.';

async function seed() {
  for (const u of users) {
    const { error } = await supabase.from('system_users').upsert({
      ...u,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (error) {
      console.error(`Failed to seed ${u.email}:`, error.message);
    } else {
      console.log(`Seeded: ${u.name} (${u.email}) — role: ${u.role}`);
    }
  }
  console.log('\nDone. Password for all accounts: admin123');
}

seed();
