-- Seed default organization and properties for multi-property support
-- Uses schema from migration 139 (org_name/org_code, property_name/property_code)

INSERT INTO organizations (id, org_name, org_code, description, is_active)
VALUES ('66d8b193-4333-4832-b782-2dd40bc1eb48', 'Gheralta Hotels', 'GH', 'Gheralta Hotels Group', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, organization_id, property_name, property_code, property_type, currency_code, is_active)
VALUES
  ('18762279-a389-41c9-9169-7ebc682e9703', '66d8b193-4333-4832-b782-2dd40bc1eb48', 'Gheralta Main Property', 'GH-MAIN', 'hotel', 'ETB', true),
  (gen_random_uuid(), '66d8b193-4333-4832-b782-2dd40bc1eb48', 'Gheralta Airport Branch', 'GH-AIR', 'hotel', 'ETB', true)
ON CONFLICT (id) DO NOTHING;

-- Backfill existing rooms and reservations to the default property
UPDATE rooms SET property_id = '18762279-a389-41c9-9169-7ebc682e9703' WHERE property_id IS NULL;
UPDATE reservations SET property_id = '18762279-a389-41c9-9169-7ebc682e9703' WHERE property_id IS NULL;
UPDATE folios SET property_id = '18762279-a389-41c9-9169-7ebc682e9703' WHERE property_id IS NULL;
