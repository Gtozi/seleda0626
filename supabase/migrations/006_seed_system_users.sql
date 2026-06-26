-- Seed preset system users for development / demo access
-- Password for all seeded accounts: admin123
-- Run this in your Supabase SQL Editor if the app is in database auth mode.

INSERT INTO system_users (
  id, name, email, role, role_description, avatar_initials,
  status, password_hash, force_password_change, created_at, updated_at
) VALUES
  ('U-101', 'Front Office Supervisor', 'frontoffice@erp.com', 'frontoffice', 'Night Auditor', 'FO', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-102', 'Housekeeping Manager', 'housekeeping@erp.com', 'housekeeping', 'HK Supervisor', 'HK', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-103', 'F&B Director', 'fb@erp.com', 'f&b', 'Culinary Director', 'FB', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-104', 'Chief Engineer', 'maintenance@erp.com', 'maintenance', 'Chief Engineer', 'CE', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-105', 'General Manager', 'gm@erp.com', 'executive', 'General Manager', 'GM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-106', 'Finance Controller', 'finance@erp.com', 'finance', 'Finance Controller', 'FC', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-107', 'HR Manager', 'hr@erp.com', 'hr', 'HR Manager', 'HR', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-108', 'Inventory Manager', 'inventory@erp.com', 'inventory', 'Stores Manager', 'IM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-109', 'Procurement Lead', 'procurement@erp.com', 'procurement', 'Procurement Lead', 'PL', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-110', 'System Administrator', 'admin@erp.com', 'executive', 'System Administrator', 'SA', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- Restrict System Administrator to Admin portal only
UPDATE system_users
SET allowed_tabs = '{"admin", "settings"}'::text[]
WHERE email = 'admin@erp.com';
