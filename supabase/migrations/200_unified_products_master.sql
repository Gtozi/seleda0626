-- Migration 200: Unified Products Master View
-- Phase 2 Item 2: Menu/product master unification
-- Creates a UNION view across pos_menu_items, menu_items (legacy),
-- kitchen_recipes, and bar_recipes for cross-source product queries.

CREATE OR REPLACE VIEW public.unified_products AS
SELECT
  pmi.id::text AS product_id,
  pmi.name,
  pmi.description,
  pmi.selling_price,
  pmi.cost_price,
  pmi.outlet_id::text AS pos_outlet_id,
  'pos_menu' AS source_table,
  pmi.item_type,
  pmi.is_active,
  pmi.is_available,
  pmi.prep_required,
  pmi.prep_station_id::text AS prep_station_id,
  pmi.recipe_id::text AS recipe_id,
  pmi.sku,
  pmi.barcode,
  pmi.category_id::text AS category_id,
  NULL::text AS category_name,
  NULL::text AS recipe_code,
  NULL::numeric AS yield_qty,
  NULL::text AS yield_unit,
  NULL::numeric AS cost_per_portion,
  NULL::numeric AS food_cost_percent,
  NULL::integer AS prep_time_minutes,
  pmi.created_at,
  pmi.updated_at
FROM public.pos_menu_items pmi

UNION ALL

SELECT
  mi.id::text AS product_id,
  mi.name,
  NULL::text AS description,
  mi.selling_price,
  NULL::numeric AS cost_price,
  NULL::text AS pos_outlet_id,
  'legacy_menu' AS source_table,
  NULL::text AS item_type,
  mi.is_active,
  mi.is_active AS is_available,
  false AS prep_required,
  NULL::text AS prep_station_id,
  NULL::text AS recipe_id,
  NULL::text AS sku,
  NULL::text AS barcode,
  NULL::text AS category_id,
  mi.category AS category_name,
  NULL::text AS recipe_code,
  NULL::numeric AS yield_qty,
  NULL::text AS yield_unit,
  NULL::numeric AS cost_per_portion,
  NULL::numeric AS food_cost_percent,
  NULL::integer AS prep_time_minutes,
  mi.created_at,
  mi.updated_at
FROM public.menu_items mi

UNION ALL

SELECT
  kr.id::text AS product_id,
  kr.name,
  kr.notes AS description,
  kr.selling_price,
  kr.total_cost AS cost_price,
  kr.outlet_id::text AS pos_outlet_id,
  'kitchen_recipe' AS source_table,
  kr.recipe_type AS item_type,
  (kr.status = 'active') AS is_active,
  (kr.status = 'active') AS is_available,
  false AS prep_required,
  NULL::text AS prep_station_id,
  NULL::text AS recipe_id,
  kr.recipe_code AS sku,
  NULL::text AS barcode,
  NULL::text AS category_id,
  kr.category AS category_name,
  kr.recipe_code,
  kr.yield_qty,
  kr.yield_unit,
  kr.cost_per_portion,
  kr.food_cost_percent,
  kr.prep_time_minutes,
  kr.created_at,
  kr.updated_at
FROM public.kitchen_recipes kr
WHERE kr.is_deleted = false

UNION ALL

SELECT
  br.id::text AS product_id,
  br.name,
  br.notes AS description,
  br.selling_price,
  br.total_cost AS cost_price,
  br.outlet_id::text AS pos_outlet_id,
  'bar_recipe' AS source_table,
  br.recipe_type AS item_type,
  (br.status = 'active') AS is_active,
  (br.status = 'active') AS is_available,
  false AS prep_required,
  NULL::text AS prep_station_id,
  NULL::text AS recipe_id,
  br.recipe_code AS sku,
  NULL::text AS barcode,
  NULL::text AS category_id,
  br.category AS category_name,
  br.recipe_code,
  br.yield_qty,
  br.yield_unit,
  br.cost_per_portion,
  br.pour_cost_percent AS food_cost_percent,
  br.prep_time_minutes,
  br.created_at,
  br.updated_at
FROM public.bar_recipes br
WHERE br.is_deleted = false;

-- ── Unified Product Summary by Outlet ───────────────────────────────────
CREATE OR REPLACE VIEW public.unified_product_summary AS
SELECT
  pos_outlet_id,
  source_table,
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE is_active = true) AS active_products,
  AVG(selling_price) AS avg_selling_price,
  AVG(cost_price) AS avg_cost_price,
  COUNT(*) FILTER (WHERE prep_required = true) AS prep_required_count,
  COUNT(*) FILTER (WHERE prep_station_id IS NOT NULL) AS station_linked_count
FROM public.unified_products
GROUP BY pos_outlet_id, source_table;
