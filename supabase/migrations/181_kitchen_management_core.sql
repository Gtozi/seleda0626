-- Migration 181: Kitchen Management Module — Core Schema
-- Comprehensive kitchen management: sub-recipes, production orders, batch tracking,
-- kitchen inventory (separate from general inventory), storage locations, transfers,
-- waste, expiry management, audit trail, role-based permissions.
--
-- Design principles:
--   * Kitchen inventory is separate from general inventory but synchronized
--   * Unlimited recipe nesting (Recipe → Sub-recipe → Sub-recipe)
--   * Every inventory movement is auditable
--   * All production is batch-based
--   * Costing is calculated automatically
--   * FEFO by default, FIFO configurable
--   * Multi-property support
--   * Soft-delete pattern (nothing is permanently deleted)

-- ── 1. Kitchen Storage Locations ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dry_store'
    CHECK (type IN ('main_store','walk_in_refrigerator','walk_in_freezer','pastry_refrigerator',
                    'kitchen_line_refrigerator','bar_refrigerator','cold_room','dry_store','other')),
  temperature_min NUMERIC(5,2),          -- °C
  temperature_max NUMERIC(5,2),          -- °C
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, name)
);

CREATE INDEX IF NOT EXISTS idx_kitchen_storage_locations_property ON public.kitchen_storage_locations(property_id);

ALTER TABLE public.kitchen_storage_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_storage_locations" ON public.kitchen_storage_locations;
CREATE POLICY "service_role all kitchen_storage_locations" ON public.kitchen_storage_locations FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_storage_locations" ON public.kitchen_storage_locations;
CREATE POLICY "authenticated read kitchen_storage_locations" ON public.kitchen_storage_locations FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_storage_locations_updated_at ON public.kitchen_storage_locations;
CREATE TRIGGER update_kitchen_storage_locations_updated_at BEFORE UPDATE ON public.kitchen_storage_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_storage_locations IS 'Physical storage locations within the kitchen (walk-in fridge, freezer, dry store, etc.)';

-- ── 2. Kitchen Recipes (enhanced, supports sub-recipes & versioning) ────
CREATE TABLE IF NOT EXISTS public.kitchen_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  recipe_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  recipe_type TEXT NOT NULL DEFAULT 'menu_item'
    CHECK (recipe_type IN ('menu_item','sub_recipe','finished_product')),
  parent_recipe_id UUID,                -- for sub-recipes that belong to a menu item recipe
  yield_qty NUMERIC(12,3) NOT NULL DEFAULT 1,
  yield_unit TEXT NOT NULL DEFAULT 'portion',
  portion_size NUMERIC(12,3),
  portion_unit TEXT,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,       -- auto-calculated
  cost_per_portion NUMERIC(12,4) NOT NULL DEFAULT 0,  -- auto-calculated
  selling_price NUMERIC(10,2),
  food_cost_percent NUMERIC(5,2) NOT NULL DEFAULT 0,  -- auto-calculated
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','archived')),
  version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, recipe_code)
);

CREATE INDEX IF NOT EXISTS idx_kitchen_recipes_property ON public.kitchen_recipes(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_recipes_type ON public.kitchen_recipes(recipe_type);
CREATE INDEX IF NOT EXISTS idx_kitchen_recipes_status ON public.kitchen_recipes(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_recipes_parent ON public.kitchen_recipes(parent_recipe_id);

ALTER TABLE public.kitchen_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_recipes" ON public.kitchen_recipes;
CREATE POLICY "service_role all kitchen_recipes" ON public.kitchen_recipes FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_recipes" ON public.kitchen_recipes;
CREATE POLICY "authenticated read kitchen_recipes" ON public.kitchen_recipes FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_recipes_updated_at ON public.kitchen_recipes;
CREATE TRIGGER update_kitchen_recipes_updated_at BEFORE UPDATE ON public.kitchen_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_recipes IS 'Kitchen recipes — supports menu items, sub-recipes, and finished products with versioning';

-- ── 3. Kitchen Recipe Ingredients (supports unlimited nesting) ──────────
CREATE TABLE IF NOT EXISTS public.kitchen_recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.kitchen_recipes(id) ON DELETE CASCADE,
  ingredient_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (ingredient_type IN ('raw_material','sub_recipe','finished_product')),
  ingredient_id UUID,                   -- FK to kitchen_recipes when type=sub_recipe/finished_product
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

CREATE INDEX IF NOT EXISTS idx_kitchen_recipe_ingredients_recipe ON public.kitchen_recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_recipe_ingredients_type ON public.kitchen_recipe_ingredients(ingredient_type);

ALTER TABLE public.kitchen_recipe_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_recipe_ingredients" ON public.kitchen_recipe_ingredients;
CREATE POLICY "service_role all kitchen_recipe_ingredients" ON public.kitchen_recipe_ingredients FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_recipe_ingredients" ON public.kitchen_recipe_ingredients;
CREATE POLICY "authenticated read kitchen_recipe_ingredients" ON public.kitchen_recipe_ingredients FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.kitchen_recipe_ingredients IS 'Recipe ingredient lines — supports raw materials, sub-recipes (nested), and finished products';

-- ── 4. Kitchen Production Orders ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_production_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  production_number TEXT NOT NULL,
  kitchen_id UUID,                       -- FK to pos_outlets if kitchen is an outlet
  recipe_id UUID NOT NULL REFERENCES public.kitchen_recipes(id),
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  batch_number TEXT NOT NULL,
  planned_qty NUMERIC(12,3) NOT NULL,
  actual_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  yield_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  chef_id TEXT,                          -- FK to system_users
  shift TEXT,
  storage_location_id UUID REFERENCES public.kitchen_storage_locations(id),
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

CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_property ON public.kitchen_production_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_status ON public.kitchen_production_orders(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_recipe ON public.kitchen_production_orders(recipe_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_date ON public.kitchen_production_orders(production_date);

ALTER TABLE public.kitchen_production_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_production_orders" ON public.kitchen_production_orders;
CREATE POLICY "service_role all kitchen_production_orders" ON public.kitchen_production_orders FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_production_orders" ON public.kitchen_production_orders;
CREATE POLICY "authenticated read kitchen_production_orders" ON public.kitchen_production_orders FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_production_orders_updated_at ON public.kitchen_production_orders;
CREATE TRIGGER update_kitchen_production_orders_updated_at BEFORE UPDATE ON public.kitchen_production_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_production_orders IS 'Production order batches with full lifecycle: draft → approved → in_production → completed → stored → consumed → closed';

-- ── 5. Kitchen Production Lines (ingredient consumption per order) ──────
CREATE TABLE IF NOT EXISTS public.kitchen_production_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_order_id UUID NOT NULL REFERENCES public.kitchen_production_orders(id) ON DELETE CASCADE,
  ingredient_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (ingredient_type IN ('raw_material','sub_recipe','finished_product')),
  ingredient_id UUID,                   -- FK to kitchen_recipes when sub_recipe/finished_product
  raw_ingredient_id UUID,               -- FK to ingredients when raw_material
  planned_qty NUMERIC(12,3) NOT NULL,
  actual_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_at_time NUMERIC(12,4) NOT NULL DEFAULT 0,
  batch_consumed TEXT,                  -- batch number consumed from
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_production_lines_order ON public.kitchen_production_lines(production_order_id);

ALTER TABLE public.kitchen_production_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_production_lines" ON public.kitchen_production_lines;
CREATE POLICY "service_role all kitchen_production_lines" ON public.kitchen_production_lines FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_production_lines" ON public.kitchen_production_lines;
CREATE POLICY "authenticated read kitchen_production_lines" ON public.kitchen_production_lines FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.kitchen_production_lines IS 'Ingredient consumption lines per production order — planned vs actual';

-- ── 6. Kitchen Inventory Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'raw_material'
    CHECK (item_type IN ('raw_material','semi_finished','finished_good')),
  category TEXT NOT NULL DEFAULT 'food',
  unit TEXT NOT NULL DEFAULT 'kg',
  on_hand_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  reserved_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  available_qty NUMERIC(12,3) GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
  reorder_level NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(12,3) NOT NULL DEFAULT 0,
  last_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  avg_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  recipe_id UUID,                        -- link to kitchen_recipes for semi-finished/finished
  raw_ingredient_id UUID,               -- link to ingredients for raw materials
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_items_property ON public.kitchen_inventory_items(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_items_type ON public.kitchen_inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_items_active ON public.kitchen_inventory_items(is_active);

ALTER TABLE public.kitchen_inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_inventory_items" ON public.kitchen_inventory_items;
CREATE POLICY "service_role all kitchen_inventory_items" ON public.kitchen_inventory_items FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_inventory_items" ON public.kitchen_inventory_items;
CREATE POLICY "authenticated read kitchen_inventory_items" ON public.kitchen_inventory_items FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_inventory_items_updated_at ON public.kitchen_inventory_items;
CREATE TRIGGER update_kitchen_inventory_items_updated_at BEFORE UPDATE ON public.kitchen_inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_inventory_items IS 'Kitchen inventory items — separate from general inventory, tracks raw materials, semi-finished, and finished goods';

-- ── 7. Kitchen Inventory Batches (batch tracking with expiry) ───────────
CREATE TABLE IF NOT EXISTS public.kitchen_inventory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.kitchen_inventory_items(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  recipe_id UUID,                        -- which recipe produced this batch
  production_order_id UUID,             -- which production order produced this batch
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  best_before_date DATE,
  shelf_life_days INTEGER,
  quantity_produced NUMERIC(12,3) NOT NULL DEFAULT 0,
  remaining_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  chef_id TEXT,
  storage_location_id UUID REFERENCES public.kitchen_storage_locations(id),
  temperature_required TEXT,             -- e.g. "0-4°C"
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','reserved','expired','consumed','wasted','transferred')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_batches_item ON public.kitchen_inventory_batches(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_batches_expiry ON public.kitchen_inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_batches_status ON public.kitchen_inventory_batches(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_batches_fefo ON public.kitchen_inventory_batches(expiry_date, remaining_qty);

ALTER TABLE public.kitchen_inventory_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_inventory_batches" ON public.kitchen_inventory_batches;
CREATE POLICY "service_role all kitchen_inventory_batches" ON public.kitchen_inventory_batches FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_inventory_batches" ON public.kitchen_inventory_batches;
CREATE POLICY "authenticated read kitchen_inventory_batches" ON public.kitchen_inventory_batches FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_inventory_batches_updated_at ON public.kitchen_inventory_batches;
CREATE TRIGGER update_kitchen_inventory_batches_updated_at BEFORE UPDATE ON public.kitchen_inventory_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_inventory_batches IS 'Batch tracking with expiry dates — FEFO/FIFO consumption supported';

-- ── 8. Kitchen Inventory Movements (full audit ledger) ──────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.kitchen_inventory_items(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.kitchen_inventory_batches(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL
    CHECK (movement_type IN ('purchase','production','consumption','waste','transfer','adjustment','return','pos_sale')),
  direction TEXT NOT NULL DEFAULT 'in'
    CHECK (direction IN ('in','out')),
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  reference_type TEXT,                   -- 'production_order', 'pos_transaction', 'transfer', 'waste', etc.
  reference_id TEXT,
  from_location_id UUID REFERENCES public.kitchen_storage_locations(id),
  to_location_id UUID REFERENCES public.kitchen_storage_locations(id),
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_movements_item ON public.kitchen_inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_movements_type ON public.kitchen_inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_movements_date ON public.kitchen_inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_movements_ref ON public.kitchen_inventory_movements(reference_type, reference_id);

ALTER TABLE public.kitchen_inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_inventory_movements" ON public.kitchen_inventory_movements;
CREATE POLICY "service_role all kitchen_inventory_movements" ON public.kitchen_inventory_movements FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_inventory_movements" ON public.kitchen_inventory_movements;
CREATE POLICY "authenticated read kitchen_inventory_movements" ON public.kitchen_inventory_movements FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.kitchen_inventory_movements IS 'Complete movement ledger — every inventory change is auditable';

-- ── 9. Kitchen Transfers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  transfer_number TEXT NOT NULL,
  transfer_type TEXT NOT NULL DEFAULT 'location'
    CHECK (transfer_type IN ('central_to_kitchen','kitchen_to_station','station_to_service','location','adjustment')),
  from_location_id UUID REFERENCES public.kitchen_storage_locations(id),
  to_location_id UUID REFERENCES public.kitchen_storage_locations(id),
  inventory_item_id UUID NOT NULL REFERENCES public.kitchen_inventory_items(id),
  batch_id UUID REFERENCES public.kitchen_inventory_batches(id),
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

CREATE INDEX IF NOT EXISTS idx_kitchen_transfers_property ON public.kitchen_transfers(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_transfers_status ON public.kitchen_transfers(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_transfers_item ON public.kitchen_transfers(inventory_item_id);

ALTER TABLE public.kitchen_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_transfers" ON public.kitchen_transfers;
CREATE POLICY "service_role all kitchen_transfers" ON public.kitchen_transfers FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_transfers" ON public.kitchen_transfers;
CREATE POLICY "authenticated read kitchen_transfers" ON public.kitchen_transfers FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_transfers_updated_at ON public.kitchen_transfers;
CREATE TRIGGER update_kitchen_transfers_updated_at BEFORE UPDATE ON public.kitchen_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_transfers IS 'Inventory transfers between storage locations with approval workflow';

-- ── 10. Kitchen Waste ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_waste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  inventory_item_id UUID NOT NULL REFERENCES public.kitchen_inventory_items(id),
  batch_id UUID REFERENCES public.kitchen_inventory_batches(id),
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  cost_value NUMERIC(12,4) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT 'other'
    CHECK (reason IN ('burned','overcooked','spoiled','expired','dropped','customer_return','quality_issue','other')),
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

CREATE INDEX IF NOT EXISTS idx_kitchen_waste_property ON public.kitchen_waste(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_waste_item ON public.kitchen_waste(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_waste_reason ON public.kitchen_waste(reason);
CREATE INDEX IF NOT EXISTS idx_kitchen_waste_date ON public.kitchen_waste(created_at);

ALTER TABLE public.kitchen_waste ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_waste" ON public.kitchen_waste;
CREATE POLICY "service_role all kitchen_waste" ON public.kitchen_waste FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_waste" ON public.kitchen_waste;
CREATE POLICY "authenticated read kitchen_waste" ON public.kitchen_waste FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_waste_updated_at ON public.kitchen_waste;
CREATE TRIGGER update_kitchen_waste_updated_at BEFORE UPDATE ON public.kitchen_waste
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_waste IS 'Kitchen waste records with approval workflow — automatically reduces inventory';

-- ── 11. Kitchen Audit Log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  user_id TEXT,
  action TEXT NOT NULL,                  -- 'create','update','delete','approve','transfer','waste','produce','adjust'
  module TEXT NOT NULL,                  -- 'recipes','production','inventory','batches','transfers','waste','expiry'
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_property ON public.kitchen_audit_log(property_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_user ON public.kitchen_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_module ON public.kitchen_audit_log(module);
CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_entity ON public.kitchen_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_date ON public.kitchen_audit_log(created_at);

ALTER TABLE public.kitchen_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_audit_log" ON public.kitchen_audit_log;
CREATE POLICY "service_role all kitchen_audit_log" ON public.kitchen_audit_log FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_audit_log" ON public.kitchen_audit_log;
CREATE POLICY "authenticated read kitchen_audit_log" ON public.kitchen_audit_log FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.kitchen_audit_log IS 'Immutable audit trail for all kitchen module actions';

-- ── 12. Kitchen Production Planning ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_production_planning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  recipe_id UUID NOT NULL REFERENCES public.kitchen_recipes(id),
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
  converted_to_order_id UUID REFERENCES public.kitchen_production_orders(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_production_planning_date ON public.kitchen_production_planning(planning_date);
CREATE INDEX IF NOT EXISTS idx_kitchen_production_planning_recipe ON public.kitchen_production_planning(recipe_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_production_planning_status ON public.kitchen_production_planning(status);

ALTER TABLE public.kitchen_production_planning ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_production_planning" ON public.kitchen_production_planning;
CREATE POLICY "service_role all kitchen_production_planning" ON public.kitchen_production_planning FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_production_planning" ON public.kitchen_production_planning;
CREATE POLICY "authenticated read kitchen_production_planning" ON public.kitchen_production_planning FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_production_planning_updated_at ON public.kitchen_production_planning;
CREATE TRIGGER update_kitchen_production_planning_updated_at BEFORE UPDATE ON public.kitchen_production_planning
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_production_planning IS 'Production planning suggestions based on occupancy, reservations, historical sales, and stock levels';

-- ── 13. Kitchen Settings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kitchen_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property' UNIQUE,
  consumption_method TEXT NOT NULL DEFAULT 'fefo'
    CHECK (consumption_method IN ('fefo','fifo')),
  allow_negative_inventory BOOLEAN NOT NULL DEFAULT false,
  enable_labor_costing BOOLEAN NOT NULL DEFAULT false,
  enable_auto_purchase_requests BOOLEAN NOT NULL DEFAULT true,
  expiry_alert_days INTEGER NOT NULL DEFAULT 3,
  critical_expiry_days INTEGER NOT NULL DEFAULT 1,
  default_chef_id TEXT,
  default_shift TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kitchen_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all kitchen_settings" ON public.kitchen_settings;
CREATE POLICY "service_role all kitchen_settings" ON public.kitchen_settings FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read kitchen_settings" ON public.kitchen_settings;
CREATE POLICY "authenticated read kitchen_settings" ON public.kitchen_settings FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kitchen_settings_updated_at ON public.kitchen_settings;
CREATE TRIGGER update_kitchen_settings_updated_at BEFORE UPDATE ON public.kitchen_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kitchen_settings IS 'Kitchen module configuration — consumption method, negative inventory, labor costing, expiry thresholds';

-- ── 14. Seed default kitchen settings ───────────────────────────────────
INSERT INTO public.kitchen_settings (property_id) VALUES ('single-property')
ON CONFLICT (property_id) DO NOTHING;

-- ── 15. Seed default storage locations ──────────────────────────────────
INSERT INTO public.kitchen_storage_locations (property_id, name, type) VALUES
  ('single-property', 'Main Store', 'main_store'),
  ('single-property', 'Walk-in Refrigerator', 'walk_in_refrigerator'),
  ('single-property', 'Walk-in Freezer', 'walk_in_freezer'),
  ('single-property', 'Dry Store', 'dry_store'),
  ('single-property', 'Kitchen Line Refrigerator', 'kitchen_line_refrigerator')
ON CONFLICT (property_id, name) DO NOTHING;
