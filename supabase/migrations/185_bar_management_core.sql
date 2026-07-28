-- Migration 185: Bar Management Module — Core Schema
-- Comprehensive bar management: drink recipes (cocktails, mocktails, spirits),
-- batch prep, bar inventory (bottles, mixers, garnishes), storage locations,
-- transfers, spillage/waste, expiry tracking, audit trail, role-based permissions.
--
-- Design principles (mirrors kitchen management with bar-specific adaptations):
--   * Bar inventory is separate from general/kitchen inventory
--   * Drink recipes support sub-recipes (syrups, infusions, pre-batched mixes)
--   * Every inventory movement is auditable
--   * Pour cost % tracking (bar equivalent of food cost %)
--   * FEFO by default, FIFO configurable
--   * Multi-property support
--   * Soft-delete pattern

-- ── 1. Bar Storage Locations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'back_bar'
    CHECK (type IN ('main_store','back_bar','walk_in_refrigerator','walk_in_freezer','liquor_room','wine_cellar','beer_cold_room','dry_store','other')),
  temperature_min NUMERIC(5,2),
  temperature_max NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, name)
);

CREATE INDEX IF NOT EXISTS idx_bar_storage_locations_property ON public.bar_storage_locations(property_id);

ALTER TABLE public.bar_storage_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_storage_locations" ON public.bar_storage_locations;
CREATE POLICY "service_role all bar_storage_locations" ON public.bar_storage_locations FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_storage_locations" ON public.bar_storage_locations;
CREATE POLICY "authenticated read bar_storage_locations" ON public.bar_storage_locations FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_storage_locations_updated_at ON public.bar_storage_locations;
CREATE TRIGGER update_bar_storage_locations_updated_at BEFORE UPDATE ON public.bar_storage_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_storage_locations IS 'Physical storage locations within the bar (back bar, liquor room, walk-in fridge, wine cellar, etc.)';

-- ── 2. Bar Recipes (drink recipes with sub-recipe support) ──────────────
CREATE TABLE IF NOT EXISTS public.bar_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  recipe_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cocktail'
    CHECK (category IN ('cocktail','mocktail','spirit','beer','wine','coffee_tea','soft_drink','syrup','infusion','prep_mix','other')),
  recipe_type TEXT NOT NULL DEFAULT 'drink_item'
    CHECK (recipe_type IN ('drink_item','sub_recipe','finished_product')),
  parent_recipe_id UUID,
  yield_qty NUMERIC(12,3) NOT NULL DEFAULT 1,
  yield_unit TEXT NOT NULL DEFAULT 'ml',
  portion_size NUMERIC(12,3),
  portion_unit TEXT,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  abv NUMERIC(5,2),                         -- alcohol by volume %
  serving_glass TEXT,                        -- e.g. 'highball', 'martini', 'rocks'
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  cost_per_portion NUMERIC(12,4) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2),
  pour_cost_percent NUMERIC(5,2) NOT NULL DEFAULT 0,   -- bar equivalent of food_cost_percent
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','archived')),
  version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, recipe_code)
);

CREATE INDEX IF NOT EXISTS idx_bar_recipes_property ON public.bar_recipes(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_recipes_type ON public.bar_recipes(recipe_type);
CREATE INDEX IF NOT EXISTS idx_bar_recipes_status ON public.bar_recipes(status);
CREATE INDEX IF NOT EXISTS idx_bar_recipes_parent ON public.bar_recipes(parent_recipe_id);

ALTER TABLE public.bar_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_recipes" ON public.bar_recipes;
CREATE POLICY "service_role all bar_recipes" ON public.bar_recipes FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_recipes" ON public.bar_recipes;
CREATE POLICY "authenticated read bar_recipes" ON public.bar_recipes FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_recipes_updated_at ON public.bar_recipes;
CREATE TRIGGER update_bar_recipes_updated_at BEFORE UPDATE ON public.bar_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_recipes IS 'Bar drink recipes — supports cocktails, mocktails, spirits, sub-recipes (syrups, infusions), with pour cost tracking';

-- ── 3. Bar Recipe Ingredients ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.bar_recipes(id) ON DELETE CASCADE,
  ingredient_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (ingredient_type IN ('raw_material','sub_recipe','finished_product')),
  ingredient_id UUID,                   -- FK to bar_recipes when type=sub_recipe/finished_product
  raw_ingredient_id UUID,               -- FK to ingredients table when type=raw_material
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  waste_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  cost_at_time_of_costing NUMERIC(12,4) NOT NULL DEFAULT 0,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_recipe_ingredients_recipe ON public.bar_recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_bar_recipe_ingredients_type ON public.bar_recipe_ingredients(ingredient_type);

ALTER TABLE public.bar_recipe_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_recipe_ingredients" ON public.bar_recipe_ingredients;
CREATE POLICY "service_role all bar_recipe_ingredients" ON public.bar_recipe_ingredients FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_recipe_ingredients" ON public.bar_recipe_ingredients;
CREATE POLICY "authenticated read bar_recipe_ingredients" ON public.bar_recipe_ingredients FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.bar_recipe_ingredients IS 'Drink recipe ingredient lines — supports raw materials, sub-recipes (syrups, infusions), and finished products';

-- ── 4. Bar Production Orders (batch prep) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_production_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  production_number TEXT NOT NULL,
  bar_id UUID,
  recipe_id UUID NOT NULL REFERENCES public.bar_recipes(id),
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  batch_number TEXT NOT NULL,
  planned_qty NUMERIC(12,3) NOT NULL,
  actual_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  yield_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  bartender_id TEXT,
  shift TEXT,
  storage_location_id UUID REFERENCES public.bar_storage_locations(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','approved','in_production','completed','stored','consumed','closed','cancelled')),
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC(12,4) NOT NULL DEFAULT 0,
  labor_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  variance_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  variance_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, production_number)
);

CREATE INDEX IF NOT EXISTS idx_bar_production_orders_property ON public.bar_production_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_production_orders_status ON public.bar_production_orders(status);
CREATE INDEX IF NOT EXISTS idx_bar_production_orders_recipe ON public.bar_production_orders(recipe_id);
CREATE INDEX IF NOT EXISTS idx_bar_production_orders_date ON public.bar_production_orders(production_date);

ALTER TABLE public.bar_production_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_production_orders" ON public.bar_production_orders;
CREATE POLICY "service_role all bar_production_orders" ON public.bar_production_orders FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_production_orders" ON public.bar_production_orders;
CREATE POLICY "authenticated read bar_production_orders" ON public.bar_production_orders FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_production_orders_updated_at ON public.bar_production_orders;
CREATE TRIGGER update_bar_production_orders_updated_at BEFORE UPDATE ON public.bar_production_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_production_orders IS 'Bar batch prep orders with full lifecycle: draft → approved → in_production → completed → stored → consumed → closed';

-- ── 5. Bar Production Lines ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_production_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_order_id UUID NOT NULL REFERENCES public.bar_production_orders(id) ON DELETE CASCADE,
  ingredient_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (ingredient_type IN ('raw_material','sub_recipe','finished_product')),
  ingredient_id UUID,
  raw_ingredient_id UUID,
  planned_qty NUMERIC(12,3) NOT NULL,
  actual_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_at_time NUMERIC(12,4) NOT NULL DEFAULT 0,
  batch_consumed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_production_lines_order ON public.bar_production_lines(production_order_id);

ALTER TABLE public.bar_production_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_production_lines" ON public.bar_production_lines;
CREATE POLICY "service_role all bar_production_lines" ON public.bar_production_lines FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_production_lines" ON public.bar_production_lines;
CREATE POLICY "authenticated read bar_production_lines" ON public.bar_production_lines FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.bar_production_lines IS 'Ingredient consumption lines per bar production order — planned vs actual';

-- ── 6. Bar Inventory Items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (item_type IN ('raw_material','semi_finished','finished_good')),
  category TEXT NOT NULL DEFAULT 'spirits'
    CHECK (category IN ('spirits','liqueur','wine','beer','mixer','juice','syrup','garnish','dry_goods','ice','other')),
  unit TEXT NOT NULL DEFAULT 'ml',
  on_hand_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  reserved_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  available_qty NUMERIC(12,3) GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
  reorder_level NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(12,3) NOT NULL DEFAULT 0,
  last_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  bottle_size_ml INTEGER,                  -- standard bottle size for spirits
  recipe_id UUID,
  raw_ingredient_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_inventory_items_property ON public.bar_inventory_items(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_items_type ON public.bar_inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_items_active ON public.bar_inventory_items(is_active);

ALTER TABLE public.bar_inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_inventory_items" ON public.bar_inventory_items;
CREATE POLICY "service_role all bar_inventory_items" ON public.bar_inventory_items FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_inventory_items" ON public.bar_inventory_items;
CREATE POLICY "authenticated read bar_inventory_items" ON public.bar_inventory_items FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_inventory_items_updated_at ON public.bar_inventory_items;
CREATE TRIGGER update_bar_inventory_items_updated_at BEFORE UPDATE ON public.bar_inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_inventory_items IS 'Bar inventory items — separate from kitchen/general inventory, tracks spirits, mixers, garnishes, etc.';

-- ── 7. Bar Inventory Batches ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_inventory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.bar_inventory_items(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  recipe_id UUID,
  production_order_id UUID,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  best_before_date DATE,
  shelf_life_days INTEGER,
  quantity_produced NUMERIC(12,3) NOT NULL DEFAULT 0,
  remaining_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  bartender_id TEXT,
  storage_location_id UUID REFERENCES public.bar_storage_locations(id),
  temperature_required TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','reserved','expired','consumed','wasted','transferred')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_inventory_batches_item ON public.bar_inventory_batches(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_batches_expiry ON public.bar_inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_batches_status ON public.bar_inventory_batches(status);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_batches_fefo ON public.bar_inventory_batches(expiry_date, remaining_qty);

ALTER TABLE public.bar_inventory_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_inventory_batches" ON public.bar_inventory_batches;
CREATE POLICY "service_role all bar_inventory_batches" ON public.bar_inventory_batches FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_inventory_batches" ON public.bar_inventory_batches;
CREATE POLICY "authenticated read bar_inventory_batches" ON public.bar_inventory_batches FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_inventory_batches_updated_at ON public.bar_inventory_batches;
CREATE TRIGGER update_bar_inventory_batches_updated_at BEFORE UPDATE ON public.bar_inventory_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_inventory_batches IS 'Batch tracking with expiry dates — FEFO/FIFO consumption supported';

-- ── 8. Bar Inventory Movements ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.bar_inventory_items(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.bar_inventory_batches(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL
    CHECK (movement_type IN ('purchase','production','consumption','waste','transfer','adjustment','return','pos_sale')),
  direction TEXT NOT NULL DEFAULT 'in'
    CHECK (direction IN ('in','out')),
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  from_location_id UUID REFERENCES public.bar_storage_locations(id),
  to_location_id UUID REFERENCES public.bar_storage_locations(id),
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_inventory_movements_item ON public.bar_inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_movements_type ON public.bar_inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_bar_inventory_movements_date ON public.bar_inventory_movements(created_at);

ALTER TABLE public.bar_inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_inventory_movements" ON public.bar_inventory_movements;
CREATE POLICY "service_role all bar_inventory_movements" ON public.bar_inventory_movements FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_inventory_movements" ON public.bar_inventory_movements;
CREATE POLICY "authenticated read bar_inventory_movements" ON public.bar_inventory_movements FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.bar_inventory_movements IS 'Complete movement ledger — every bar inventory change is auditable';

-- ── 9. Bar Transfers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  transfer_number TEXT NOT NULL,
  transfer_type TEXT NOT NULL DEFAULT 'location'
    CHECK (transfer_type IN ('central_to_bar','bar_to_station','station_to_service','location','adjustment')),
  from_location_id UUID REFERENCES public.bar_storage_locations(id),
  to_location_id UUID REFERENCES public.bar_storage_locations(id),
  inventory_item_id UUID NOT NULL REFERENCES public.bar_inventory_items(id),
  batch_id UUID REFERENCES public.bar_inventory_batches(id),
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','in_transit','completed','cancelled')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  performed_by TEXT,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, transfer_number)
);

CREATE INDEX IF NOT EXISTS idx_bar_transfers_property ON public.bar_transfers(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_transfers_status ON public.bar_transfers(status);
CREATE INDEX IF NOT EXISTS idx_bar_transfers_item ON public.bar_transfers(inventory_item_id);

ALTER TABLE public.bar_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_transfers" ON public.bar_transfers;
CREATE POLICY "service_role all bar_transfers" ON public.bar_transfers FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_transfers" ON public.bar_transfers;
CREATE POLICY "authenticated read bar_transfers" ON public.bar_transfers FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_transfers_updated_at ON public.bar_transfers;
CREATE TRIGGER update_bar_transfers_updated_at BEFORE UPDATE ON public.bar_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_transfers IS 'Inventory transfers between bar storage locations with approval workflow';

-- ── 10. Bar Waste (spillage, breakage, over-pour) ───────────────────────
CREATE TABLE IF NOT EXISTS public.bar_waste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.bar_inventory_items(id),
  batch_id UUID REFERENCES public.bar_inventory_batches(id),
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  cost_value NUMERIC(12,4) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT 'other'
    CHECK (reason IN ('breakage','spillage','over_pour','expired','spoiled','customer_return','quality_issue','theft','other')),
  employee_id TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_waste_property ON public.bar_waste(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_waste_item ON public.bar_waste(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_bar_waste_reason ON public.bar_waste(reason);
CREATE INDEX IF NOT EXISTS idx_bar_waste_date ON public.bar_waste(created_at);

ALTER TABLE public.bar_waste ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_waste" ON public.bar_waste;
CREATE POLICY "service_role all bar_waste" ON public.bar_waste FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_waste" ON public.bar_waste;
CREATE POLICY "authenticated read bar_waste" ON public.bar_waste FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_waste_updated_at ON public.bar_waste;
CREATE TRIGGER update_bar_waste_updated_at BEFORE UPDATE ON public.bar_waste
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_waste IS 'Bar waste records (spillage, breakage, over-pour) with approval workflow — automatically reduces inventory';

-- ── 11. Bar Audit Log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  user_id TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_audit_log_property ON public.bar_audit_log(property_id);
CREATE INDEX IF NOT EXISTS idx_bar_audit_log_module ON public.bar_audit_log(module);
CREATE INDEX IF NOT EXISTS idx_bar_audit_log_date ON public.bar_audit_log(created_at);

ALTER TABLE public.bar_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_audit_log" ON public.bar_audit_log;
CREATE POLICY "service_role all bar_audit_log" ON public.bar_audit_log FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_audit_log" ON public.bar_audit_log;
CREATE POLICY "authenticated read bar_audit_log" ON public.bar_audit_log FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.bar_audit_log IS 'Immutable audit trail for all bar module actions';

-- ── 12. Bar Production Planning ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_production_planning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  recipe_id UUID NOT NULL REFERENCES public.bar_recipes(id),
  planning_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hotel_occupancy_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  reservations_count INTEGER NOT NULL DEFAULT 0,
  historical_avg_sales NUMERIC(12,3) NOT NULL DEFAULT 0,
  forecast_demand NUMERIC(12,3) NOT NULL DEFAULT 0,
  current_stock_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(12,3) NOT NULL DEFAULT 0,
  suggested_production_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested','approved','converted','rejected')),
  converted_to_order_id UUID REFERENCES public.bar_production_orders(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bar_production_planning_date ON public.bar_production_planning(planning_date);
CREATE INDEX IF NOT EXISTS idx_bar_production_planning_recipe ON public.bar_production_planning(recipe_id);

ALTER TABLE public.bar_production_planning ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_production_planning" ON public.bar_production_planning;
CREATE POLICY "service_role all bar_production_planning" ON public.bar_production_planning FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_production_planning" ON public.bar_production_planning;
CREATE POLICY "authenticated read bar_production_planning" ON public.bar_production_planning FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_production_planning_updated_at ON public.bar_production_planning;
CREATE TRIGGER update_bar_production_planning_updated_at BEFORE UPDATE ON public.bar_production_planning
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_production_planning IS 'Bar production planning suggestions based on occupancy, reservations, historical sales, and stock levels';

-- ── 13. Bar Settings ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bar_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property' UNIQUE,
  consumption_method TEXT NOT NULL DEFAULT 'fefo'
    CHECK (consumption_method IN ('fefo','fifo')),
  allow_negative_inventory BOOLEAN NOT NULL DEFAULT false,
  enable_labor_costing BOOLEAN NOT NULL DEFAULT false,
  enable_auto_purchase_requests BOOLEAN NOT NULL DEFAULT true,
  expiry_alert_days INTEGER NOT NULL DEFAULT 3,
  critical_expiry_days INTEGER NOT NULL DEFAULT 1,
  over_pour_tolerance_ml NUMERIC(5,2) NOT NULL DEFAULT 5,
  default_bartender_id TEXT,
  default_shift TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bar_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all bar_settings" ON public.bar_settings;
CREATE POLICY "service_role all bar_settings" ON public.bar_settings FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read bar_settings" ON public.bar_settings;
CREATE POLICY "authenticated read bar_settings" ON public.bar_settings FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_bar_settings_updated_at ON public.bar_settings;
CREATE TRIGGER update_bar_settings_updated_at BEFORE UPDATE ON public.bar_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bar_settings IS 'Bar module configuration — consumption method, negative inventory, labor costing, over-pour tolerance, expiry thresholds';

-- ── 14. Seed default bar settings ───────────────────────────────────────
INSERT INTO public.bar_settings (property_id) VALUES ('single-property')
ON CONFLICT (property_id) DO NOTHING;

-- ── 15. Seed default bar storage locations ──────────────────────────────
INSERT INTO public.bar_storage_locations (property_id, name, type) VALUES
  ('single-property', 'Main Store', 'main_store'),
  ('single-property', 'Back Bar', 'back_bar'),
  ('single-property', 'Liquor Room', 'liquor_room'),
  ('single-property', 'Walk-in Refrigerator', 'walk_in_refrigerator'),
  ('single-property', 'Wine Cellar', 'wine_cellar')
ON CONFLICT (property_id, name) DO NOTHING;
