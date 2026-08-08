-- Migration: 224_inventory_settings_columns.sql
-- Adds inventory management settings (overbooking limit, sell limit, group block
-- allocation) to global_settings so the Front Office Availability & Inventory
-- module can persist its configuration instead of using volatile local state.

ALTER TABLE global_settings
  ADD COLUMN IF NOT EXISTS overbooking_limit INTEGER NOT NULL DEFAULT 10
    CHECK (overbooking_limit >= 0 AND overbooking_limit <= 100);

ALTER TABLE global_settings
  ADD COLUMN IF NOT EXISTS sell_limit INTEGER NOT NULL DEFAULT 95
    CHECK (sell_limit >= 0 AND sell_limit <= 100);

ALTER TABLE global_settings
  ADD COLUMN IF NOT EXISTS group_block_allocation INTEGER NOT NULL DEFAULT 20
    CHECK (group_block_allocation >= 0 AND group_block_allocation <= 100);

COMMENT ON COLUMN global_settings.overbooking_limit IS 'Maximum overbooking allowed as a percentage (0-100).';
COMMENT ON COLUMN global_settings.sell_limit IS 'Maximum occupancy for selling as a percentage (0-100).';
COMMENT ON COLUMN global_settings.group_block_allocation IS 'Percentage of rooms reserved for group blocks (0-100).';
