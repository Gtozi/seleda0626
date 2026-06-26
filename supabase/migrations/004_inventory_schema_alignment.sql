-- ======================================================================================
-- INVENTORY PORTAL SCHEMA ALIGNMENT
-- Adds columns missing from inventory_items to match the frontend InventoryItem interface
-- ======================================================================================

alter table inventory_items
  add column if not exists sale_price numeric not null default 0.00,
  add column if not exists guest_portal_active boolean not null default false,
  add column if not exists image_url text,
  add column if not exists dietary_tags text[] default '{}';
