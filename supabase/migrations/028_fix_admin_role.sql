-- Fix admin user role from 'executive' to 'admin' and restrict access
UPDATE system_users 
SET role = 'admin', allowed_tabs = '{"admin", "settings"}'::text[]
WHERE email = 'admin@erp.com';
