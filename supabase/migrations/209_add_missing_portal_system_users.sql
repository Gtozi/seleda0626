-- Add system users for portals that don't have dedicated system users
-- Password for all new accounts: admin123
-- Portals covered: Banquet & Events, Concierge, Spa & Wellness, Transportation, Revenue Management

INSERT INTO system_users (
  id, name, email, role, role_description, avatar_initials,
  status, password_hash, force_password_change, created_at, updated_at
) VALUES
  ('U-209-1', 'Banquet & Events Manager', 'banquet@erp.com', 'banquet', 'Banquet & Events Manager', 'BE', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-209-2', 'Concierge Manager', 'concierge@erp.com', 'concierge', 'Concierge Manager', 'CC', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-209-3', 'Spa & Wellness Director', 'spa@erp.com', 'spa', 'Spa & Wellness Director', 'SW', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-209-4', 'Transportation Manager', 'transportation@erp.com', 'transportation', 'Transportation Manager', 'TM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-209-5', 'Revenue Manager', 'revenue@erp.com', 'revenue', 'Revenue Manager', 'RM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now())
ON CONFLICT (email) DO NOTHING;
