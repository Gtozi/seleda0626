-- Migration 118: Organization & Property Hierarchy
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  currency TEXT DEFAULT 'ETB',
  fiscal_year_start DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE folios ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Seed default org and property (triggers disabled during backfill)
-- Default org: Gheralta Hotels (66d8b193-4333-4832-b782-2dd40bc1eb48)
-- Default property: Gheralta Main Property (18762279-a389-41c9-9169-7ebc682e9703)

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_authenticated" ON organizations;
CREATE POLICY "org_read_authenticated" ON organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "org_admin_write" ON organizations;
CREATE POLICY "org_admin_write" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "prop_read_authenticated" ON properties;
CREATE POLICY "prop_read_authenticated" ON properties FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "prop_admin_write" ON properties;
CREATE POLICY "prop_admin_write" ON properties FOR ALL TO authenticated USING (true) WITH CHECK (true);
