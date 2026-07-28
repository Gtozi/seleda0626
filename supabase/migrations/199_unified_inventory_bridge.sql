-- Migration 199: Bridge core inventory to canonical pos_outlets registry
-- Phase 2 Item 3: Inventory convergence foundation
-- Adds pos_outlet_id (UUID) to stock_locations and ingredients so they can
-- be scoped to the same canonical outlet registry used by kitchen/bar portals.

-- Add pos_outlet_id to stock_locations (existing outlet_id references legacy outlets table)
ALTER TABLE public.stock_locations
  ADD COLUMN IF NOT EXISTS pos_outlet_id UUID;

ALTER TABLE public.stock_locations
  DROP CONSTRAINT IF EXISTS fk_stock_locations_pos_outlet;

ALTER TABLE public.stock_locations
  ADD CONSTRAINT fk_stock_locations_pos_outlet
    FOREIGN KEY (pos_outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stock_locations_pos_outlet_id
  ON public.stock_locations(pos_outlet_id);

-- Add pos_outlet_id to ingredients (allows outlet-scoped ingredients)
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS pos_outlet_id UUID;

ALTER TABLE public.ingredients
  DROP CONSTRAINT IF EXISTS fk_ingredients_pos_outlet;

ALTER TABLE public.ingredients
  ADD CONSTRAINT fk_ingredients_pos_outlet
    FOREIGN KEY (pos_outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ingredients_pos_outlet_id
  ON public.ingredients(pos_outlet_id);

-- Add pos_outlet_id to stock_transactions for outlet-scoped tracking
ALTER TABLE public.stock_transactions
  ADD COLUMN IF NOT EXISTS pos_outlet_id UUID;

ALTER TABLE public.stock_transactions
  DROP CONSTRAINT IF EXISTS fk_stock_transactions_pos_outlet;

ALTER TABLE public.stock_transactions
  ADD CONSTRAINT fk_stock_transactions_pos_outlet
    FOREIGN KEY (pos_outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stock_transactions_pos_outlet_id
  ON public.stock_transactions(pos_outlet_id);

-- ── Unified Inventory View ──────────────────────────────────────────────
-- A UNION view that combines core ingredients, kitchen inventory items,
-- and bar inventory items into a single virtual table for cross-outlet reporting.
CREATE OR REPLACE VIEW public.unified_inventory_items AS
SELECT
  i.id::text AS item_id,
  i.name,
  i.category,
  i.unit_of_measure AS unit,
  i.current_cost AS avg_cost,
  i.par_level AS reorder_level,
  i.reorder_point AS min_stock_level,
  i.is_active,
  i.pos_outlet_id,
  'core' AS source_table,
  NULL::text AS item_type,
  NULL::numeric AS available_qty,
  NULL::numeric AS reserved_qty,
  i.created_at,
  i.updated_at
FROM public.ingredients i
WHERE i.is_active = true

UNION ALL

SELECT
  k.id::text AS item_id,
  k.name,
  k.category,
  k.unit,
  k.avg_cost,
  k.reorder_level,
  k.min_stock_level,
  k.is_active,
  k.outlet_id AS pos_outlet_id,
  'kitchen' AS source_table,
  k.item_type,
  k.available_qty,
  k.reserved_qty,
  k.created_at,
  k.updated_at
FROM public.kitchen_inventory_items k
WHERE k.is_deleted = false

UNION ALL

SELECT
  b.id::text AS item_id,
  b.name,
  b.category,
  b.unit,
  b.avg_cost,
  b.reorder_level,
  b.min_stock_level,
  b.is_active,
  b.outlet_id AS pos_outlet_id,
  'bar' AS source_table,
  b.item_type,
  b.available_qty,
  b.reserved_qty,
  b.created_at,
  b.updated_at
FROM public.bar_inventory_items b
WHERE b.is_deleted = false;

-- ── Unified Storage Locations View ──────────────────────────────────────
CREATE OR REPLACE VIEW public.unified_storage_locations AS
SELECT
  s.id::text AS location_id,
  s.name,
  s.type,
  NULL::numeric AS temperature_min,
  NULL::numeric AS temperature_max,
  s.is_active,
  s.pos_outlet_id,
  'core' AS source_table,
  s.created_at,
  s.updated_at
FROM public.stock_locations s
WHERE s.is_active = true

UNION ALL

SELECT
  k.id::text AS location_id,
  k.name,
  k.type,
  k.temperature_min,
  k.temperature_max,
  k.is_active,
  k.outlet_id AS pos_outlet_id,
  'kitchen' AS source_table,
  k.created_at,
  k.updated_at
FROM public.kitchen_storage_locations k
WHERE k.is_active = true

UNION ALL

SELECT
  b.id::text AS location_id,
  b.name,
  b.type,
  b.temperature_min,
  b.temperature_max,
  b.is_active,
  b.outlet_id AS pos_outlet_id,
  'bar' AS source_table,
  b.created_at,
  b.updated_at
FROM public.bar_storage_locations b
WHERE b.is_active = true;
