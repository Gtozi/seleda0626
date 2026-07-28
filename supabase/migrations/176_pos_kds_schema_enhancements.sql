-- ── POS KDS Schema Enhancements per "Pos KDS architecture 2.md" ──
-- §2.1: Add requires_kds + outlet_category to pos_outlets
-- §2.2: Add time_based_pricing_rule_id + recipe_id to pos_menu_items
-- §4.2: Add held status support to kds_orders

-- ── 1. Add requires_kds column to pos_outlets (§2.1) ──
ALTER TABLE public.pos_outlets
  ADD COLUMN IF NOT EXISTS requires_kds BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.pos_outlets.requires_kds IS
  'Auto-derived: true if ≥1 catalog item has prep_required=true. Overridable by admin.';

-- ── 1b. Add outlet_category enum to pos_outlets (§2.1) ──
ALTER TABLE public.pos_outlets
  ADD COLUMN IF NOT EXISTS outlet_category TEXT NOT NULL DEFAULT 'Other'
    CHECK (outlet_category IN ('FoodBeverage', 'Retail', 'Service', 'Wellness', 'Other'));

COMMENT ON COLUMN public.pos_outlets.outlet_category IS
  'Reporting grouping only: FoodBeverage, Retail, Service, Wellness, Other';

-- Backfill outlet_category from existing outlet_type values
UPDATE public.pos_outlets SET outlet_category = 'FoodBeverage'
  WHERE outlet_type IN ('restaurant', 'bar', 'pool_bar', 'room_service') AND outlet_category = 'Other';
UPDATE public.pos_outlets SET outlet_category = 'Retail'
  WHERE outlet_type = 'gift_shop' AND outlet_category = 'Other';
UPDATE public.pos_outlets SET outlet_category = 'Wellness'
  WHERE outlet_type = 'spa' AND outlet_category = 'Other';

-- Auto-derive requires_kds for existing outlets based on catalog items
UPDATE public.pos_outlets o
  SET requires_kds = true
  WHERE EXISTS (
    SELECT 1 FROM public.pos_menu_items m
    WHERE m.outlet_id = o.id AND m.prep_required = true
  );

-- ── 2. Add time_based_pricing_rule_id, recipe_id, and item_type to pos_menu_items (§2.2) ──
ALTER TABLE public.pos_menu_items
  ADD COLUMN IF NOT EXISTS time_based_pricing_rule_id UUID;

ALTER TABLE public.pos_menu_items
  ADD COLUMN IF NOT EXISTS recipe_id TEXT;

ALTER TABLE public.pos_menu_items
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'Retail'
    CHECK (item_type IN ('Prepared', 'Retail', 'Service'));

COMMENT ON COLUMN public.pos_menu_items.time_based_pricing_rule_id IS
  'Optional reference to a time-based pricing rule (happy hour, lunch special, etc.)';

COMMENT ON COLUMN public.pos_menu_items.recipe_id IS
  'FK to recipes.id — used when outlet inventory_mode=recipe for BOM deduction';

COMMENT ON COLUMN public.pos_menu_items.item_type IS
  'Prepared (needs KDS routing), Retail (no prep), Service (e.g. spa treatment)';

-- Backfill item_type from prep_required: if prep_required=true, set to 'Prepared'
UPDATE public.pos_menu_items SET item_type = 'Prepared' WHERE prep_required = true AND item_type = 'Retail';

-- ── 3. Add transaction_id column to kds_orders if missing (§4.4 feedback loop) ──
-- This links KDS tickets back to their parent pos_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN transaction_id UUID;
    COMMENT ON COLUMN public.kds_orders.transaction_id IS
      'FK to pos_transactions.id — set when KDS ticket is auto-routed from a POS sale';
  END IF;
END $$;

-- ── 4. Add index on kds_orders.order_id for expo grouping (§4.3) ──
CREATE INDEX IF NOT EXISTS idx_kds_orders_order_id ON public.kds_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_kds_orders_station_id ON public.kds_orders(station_id);
CREATE INDEX IF NOT EXISTS idx_kds_orders_status ON public.kds_orders(status);
CREATE INDEX IF NOT EXISTS idx_kds_orders_course_group ON public.kds_orders(course_group);
CREATE INDEX IF NOT EXISTS idx_kds_orders_transaction_id ON public.kds_orders(transaction_id);

-- ── 5. Add index on pos_menu_items.prep_station_id for KDS routing ──
CREATE INDEX IF NOT EXISTS idx_pos_menu_items_prep_station ON public.pos_menu_items(prep_station_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_items_prep_required ON public.pos_menu_items(prep_required);

-- ── 6. Auto-derive function for requires_kds when menu items change ──
CREATE OR REPLACE FUNCTION public.auto_derive_outlet_kds()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.pos_outlets o
      SET requires_kds = EXISTS (
        SELECT 1 FROM public.pos_menu_items m
        WHERE m.outlet_id = NEW.outlet_id
          AND m.prep_required = true
      )
      WHERE o.id = NEW.outlet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pos_outlets o
      SET requires_kds = EXISTS (
        SELECT 1 FROM public.pos_menu_items m
        WHERE m.outlet_id = OLD.outlet_id
          AND m.prep_required = true
      )
      WHERE o.id = OLD.outlet_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_derive_kds ON public.pos_menu_items;
CREATE TRIGGER trigger_auto_derive_kds
  AFTER INSERT OR UPDATE OF prep_required, outlet_id OR DELETE ON public.pos_menu_items
  FOR EACH ROW EXECUTE FUNCTION public.auto_derive_outlet_kds();
