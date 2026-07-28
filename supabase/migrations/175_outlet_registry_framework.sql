-- Migration 175: Outlet Registry Framework
-- Transforms POS from hardcoded per-department modules into a configurable Outlet Registry.
-- Adding a new POS (spa retail, bike-rental kiosk, etc.) becomes a config row, not new code.
--
-- Core concepts:
--   * pos_outlets enhanced with inventory_mode, charge_modes, tax_profile_id, gl_mapping_id, etc.
--   * pos_tax_profiles — reusable tax rule sets (VAT, service charge, exemptions)
--   * pos_gl_mappings — revenue/COGS GL account links per outlet
--   * pos_terminals — device registration many-to-one with outlet
--   * pos_transactions — canonical unified transaction shape for ALL outlets
--   * pos_shifts — till/cash-drawer reconciliation
--   * pos_menu_versions — seasonal/promotional menu versioning per outlet

-- ── 1. Drop the hardcoded CHECK on outlet_type to allow free-form labels ──
ALTER TABLE public.pos_outlets DROP CONSTRAINT IF EXISTS pos_outlets_outlet_type_check;

-- ── 2. Add framework columns to pos_outlets ──
ALTER TABLE public.pos_outlets
  ADD COLUMN IF NOT EXISTS inventory_mode TEXT NOT NULL DEFAULT 'sku'
    CHECK (inventory_mode IN ('recipe', 'sku')),
  ADD COLUMN IF NOT EXISTS charge_modes JSONB NOT NULL DEFAULT '["cash","card","room_folio","mobile_money"]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_profile_id UUID,
  ADD COLUMN IF NOT EXISTS gl_mapping_id UUID,
  ADD COLUMN IF NOT EXISTS requires_guest_link BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shift_reconciliation_required BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS outlet_status TEXT NOT NULL DEFAULT 'active'
    CHECK (outlet_status IN ('active', 'inactive', 'suspended'));

-- ── 3. POS Tax Profiles ──
CREATE TABLE IF NOT EXISTS public.pos_tax_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  service_charge_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  is_vat_exempt BOOLEAN NOT NULL DEFAULT false,
  is_service_charge_exempt BOOLEAN NOT NULL DEFAULT false,
  additional_tax_rules JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name":"Tourism Levy","rate":2,"applies_to":"subtotal"}]
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. POS GL Mappings ──
CREATE TABLE IF NOT EXISTS public.pos_gl_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  revenue_account_code TEXT NOT NULL,   -- e.g. '6100' for Restaurant Revenue
  cogs_account_code TEXT,                -- e.g. '3110' for F&B COGS
  vat_account_code TEXT DEFAULT '2020',
  service_charge_account_code TEXT,
  cash_account_code TEXT DEFAULT '1010',
  ar_account_code TEXT DEFAULT '1100',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Link outlets to tax profiles and GL mappings ──
ALTER TABLE public.pos_outlets
  ADD CONSTRAINT pos_outlets_tax_profile_fk
    FOREIGN KEY (tax_profile_id) REFERENCES public.pos_tax_profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT pos_outlets_gl_mapping_fk
    FOREIGN KEY (gl_mapping_id) REFERENCES public.pos_gl_mappings(id) ON DELETE SET NULL;

-- ── 6. POS Terminals (device registration, many-to-one with outlet) ──
CREATE TABLE IF NOT EXISTS public.pos_terminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,       -- hardware serial or system-assigned
  terminal_name TEXT NOT NULL,           -- e.g. "Bar Terminal 1"
  terminal_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (terminal_type IN ('standard', 'kitchen_display', 'mobile', 'kiosk', 'self_service')),
  hardware_model TEXT,
  ip_address TEXT,
  printer_station TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_terminals_outlet ON public.pos_terminals(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_active ON public.pos_terminals(is_active);

-- ── 7. POS Unified Transactions (canonical shape for ALL outlets) ──
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE RESTRICT,
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  business_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  customer_type TEXT NOT NULL DEFAULT 'walk_in'
    CHECK (customer_type IN ('walk_in', 'in_house_guest', 'corporate', 'member', 'staff')),
  -- Guest linkage (required when outlet.requires_guest_link = true)
  reservation_id TEXT,
  room_number TEXT,
  guest_name TEXT,
  -- Line items (canonical shape)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Monetary breakdown
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  service_charge_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  additional_tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Payment
  payment_method TEXT NOT NULL DEFAULT 'cash'
    CHECK (payment_method IN ('cash', 'card', 'room_folio', 'mobile_money', 'split', 'complimentary', 'staff_meal')),
  split_payments JSONB DEFAULT NULL,
  room_charge_details JSONB DEFAULT NULL,
  -- Tax & GL references
  tax_profile_id UUID REFERENCES public.pos_tax_profiles(id) ON DELETE SET NULL,
  gl_mapping_id UUID REFERENCES public.pos_gl_mappings(id) ON DELETE SET NULL,
  -- Folio & journal links
  folio_charge_id TEXT,
  journal_entry_id TEXT,
  -- Inventory
  inventory_mode TEXT NOT NULL DEFAULT 'sku'
    CHECK (inventory_mode IN ('recipe', 'sku')),
  inventory_deducted BOOLEAN NOT NULL DEFAULT false,
  -- Client billing (for VAT receipt)
  client_name TEXT,
  client_tin TEXT,
  client_vat_no TEXT,
  client_vat_date TEXT,
  -- Shift linkage
  shift_id UUID,
  -- Status & audit
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'voided', 'refunded', 'comped')),
  void_reason TEXT,
  voided_by TEXT,
  voided_at TIMESTAMPTZ,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_outlet ON public.pos_transactions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON public.pos_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_business_date ON public.pos_transactions(business_date);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_status ON public.pos_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_invoice ON public.pos_transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_shift ON public.pos_transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_cashier ON public.pos_transactions(cashier_id);

-- ── 8. POS Shifts (till/cash-drawer reconciliation) ──
CREATE TABLE IF NOT EXISTS public.pos_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  shift_number INTEGER NOT NULL DEFAULT 1,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_float NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  counted_cash NUMERIC(12,2),
  cash_variance NUMERIC(12,2),
  total_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cash_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_card_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_mobile_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_room_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_complimentary NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_refunds NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_voids NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'reconciled', 'discrepancy')),
  reconciliation_notes TEXT,
  reconciled_by TEXT,
  reconciled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_shifts_outlet ON public.pos_shifts(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_shifts_status ON public.pos_shifts(status);
CREATE INDEX IF NOT EXISTS idx_pos_shifts_cashier ON public.pos_shifts(cashier_id);
CREATE INDEX IF NOT EXISTS idx_pos_shifts_opened ON public.pos_shifts(opened_at DESC);

-- ── 9. POS Menu Versions (seasonal/promotional versioning per outlet) ──
CREATE TABLE IF NOT EXISTS public.pos_menu_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,          -- e.g. "Summer 2025", "Holiday Promo"
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  effective_from DATE,
  effective_until DATE,
  menu_snapshot JSONB DEFAULT '{}'::jsonb, -- snapshot of menu items at version creation
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(outlet_id, version_label)
);

CREATE INDEX IF NOT EXISTS idx_pos_menu_versions_outlet ON public.pos_menu_versions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_versions_active ON public.pos_menu_versions(is_active);

-- ── 10. Updated_at triggers for new tables ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pos_tax_profiles_updated_at ON public.pos_tax_profiles;
CREATE TRIGGER update_pos_tax_profiles_updated_at BEFORE UPDATE ON public.pos_tax_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pos_gl_mappings_updated_at ON public.pos_gl_mappings;
CREATE TRIGGER update_pos_gl_mappings_updated_at BEFORE UPDATE ON public.pos_gl_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pos_terminals_updated_at ON public.pos_terminals;
CREATE TRIGGER update_pos_terminals_updated_at BEFORE UPDATE ON public.pos_terminals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pos_transactions_updated_at ON public.pos_transactions;
CREATE TRIGGER update_pos_transactions_updated_at BEFORE UPDATE ON public.pos_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pos_shifts_updated_at ON public.pos_shifts;
CREATE TRIGGER update_pos_shifts_updated_at BEFORE UPDATE ON public.pos_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pos_menu_versions_updated_at ON public.pos_menu_versions;
CREATE TRIGGER update_pos_menu_versions_updated_at BEFORE UPDATE ON public.pos_menu_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 11. RLS for new tables ──
ALTER TABLE public.pos_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_gl_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_menu_versions ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_role all pos_tax_profiles" ON public.pos_tax_profiles FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role all pos_gl_mappings" ON public.pos_gl_mappings FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role all pos_terminals" ON public.pos_terminals FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role all pos_transactions" ON public.pos_transactions FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role all pos_shifts" ON public.pos_shifts FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role all pos_menu_versions" ON public.pos_menu_versions FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Authenticated read access
CREATE POLICY "authenticated read pos_tax_profiles" ON public.pos_tax_profiles FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read pos_gl_mappings" ON public.pos_gl_mappings FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read pos_terminals" ON public.pos_terminals FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read pos_transactions" ON public.pos_transactions FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read pos_shifts" ON public.pos_shifts FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read pos_menu_versions" ON public.pos_menu_versions FOR SELECT
    USING (auth.role() = 'authenticated');

-- ── 12. Invoice sequence for unified POS transactions ──
CREATE SEQUENCE IF NOT EXISTS pos_invoice_seq
  START WITH 200001
  INCREMENT BY 1
  NO CYCLE;

CREATE OR REPLACE FUNCTION next_pos_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'INV-POS-' || LPAD(nextval('pos_invoice_seq')::text, 7, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION next_pos_invoice_number() TO authenticated;

-- ── 13. Generic inventory deduction function (strategy pattern) ──
-- If inventory_mode = 'recipe': deducts BOM component ingredients
-- If inventory_mode = 'sku': deducts direct stock quantity
CREATE OR REPLACE FUNCTION deduct_outlet_inventory(
  p_outlet_id UUID,
  p_line_items JSONB,        -- [{"item_id":"...","quantity":2,"menu_item_id":"..."}]
  p_inventory_mode TEXT,
  p_reference_doc TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT 'pos_sale'
)
RETURNS TABLE (
  ingredient_id TEXT,
  ingredient_name TEXT,
  quantity_deducted NUMERIC,
  unit TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_line JSONB;
  v_item_id TEXT;
  v_qty NUMERIC;
  v_menu_item_id TEXT;
  v_recipe RECORD;
  v_recipe_line RECORD;
  v_stock_location RECORD;
  v_remaining NUMERIC;
BEGIN
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    v_item_id := v_line->>'item_id';
    v_qty := (v_line->>'quantity')::numeric;
    v_menu_item_id := v_line->>'menu_item_id';

    IF p_inventory_mode = 'recipe' THEN
      -- Recipe mode: deduct BOM components via recipe_lines
      FOR v_recipe IN
        SELECT r.id FROM public.fn_recipes r
        WHERE r.menu_item_id = v_menu_item_id
        LIMIT 1
      LOOP
        FOR v_recipe_line IN
          SELECT rl.ingredient_id, rl.quantity, rl.unit, i.name
          FROM fn_recipe_lines rl
          JOIN fn_ingredients i ON i.id = rl.ingredient_id
          WHERE rl.recipe_id = v_recipe.id
        LOOP
          -- Find the outlet's stock location
          SELECT sl.id INTO v_stock_location
          FROM fn_stock_locations sl
          WHERE sl.outlet_id = p_outlet_id AND sl.is_active = true
          LIMIT 1;

          IF v_stock_location IS NOT NULL THEN
            -- Record the depletion
            INSERT INTO fn_stock_transactions (
              ingredient_id, location_id, transaction_type,
              quantity, unit, cost_per_unit, total_value,
              date, reference_doc, reference_type, notes
            )
            SELECT
              v_recipe_line.ingredient_id, v_stock_location.id, 'POSDepletion',
              v_recipe_line.quantity * v_qty, v_recipe_line.unit,
              i.current_cost, i.current_cost * v_recipe_line.quantity * v_qty,
              NOW(), p_reference_doc, p_reference_type,
              'Auto-deducted from POS sale'
            FROM fn_ingredients i
            WHERE i.id = v_recipe_line.ingredient_id;

            RETURN QUERY
            SELECT
              v_recipe_line.ingredient_id::text,
              v_recipe_line.name,
              v_recipe_line.quantity * v_qty,
              v_recipe_line.unit,
              'deducted';
          END IF;
        END LOOP;
      END LOOP;
    ELSE
      -- SKU mode: deduct direct stock from inventory_items
      UPDATE inventory_items
      SET current_stock = GREATEST(0, current_stock - v_qty)
      WHERE id = v_item_id OR code = v_item_id;

      RETURN QUERY
      SELECT
        v_item_id,
        COALESCE((SELECT name FROM inventory_items WHERE id = v_item_id OR code = v_item_id LIMIT 1), v_item_id),
        v_qty,
        'units',
        'deducted';
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_outlet_inventory TO authenticated;

-- ── 14. Seed default tax profiles ──
INSERT INTO public.pos_tax_profiles (name, description, vat_rate, service_charge_rate, is_active)
VALUES
  ('Standard F&B', 'Standard VAT and service charge for food & beverage outlets', 15.00, 10.00, true),
  ('Retail (No Service Charge)', 'VAT only, no service charge for retail outlets', 15.00, 0.00, true),
  ('Spa & Wellness', 'VAT with reduced service charge for spa services', 15.00, 5.00, true),
  ('Tax Exempt', 'No VAT or service charge (e.g. staff meals)', 0.00, 0.00, true),
  ('Export / Duty Free', 'Zero-rated for export/duty-free sales', 0.00, 0.00, true)
ON CONFLICT (name) DO NOTHING;

-- ── 15. Seed default GL mappings (USALI codes) ──
INSERT INTO public.pos_gl_mappings (name, description, revenue_account_code, cogs_account_code, vat_account_code, service_charge_account_code, cash_account_code, ar_account_code, is_active)
VALUES
  ('Restaurant Revenue', 'USALI 6100 Restaurant / 3110 F&B COGS', '6100', '3110', '2020', '6190', '1010', '1100', true),
  ('Bar Revenue', 'USALI 7100 Bar / 3210 Beverage COGS', '7100', '3210', '2020', '7190', '1010', '1100', true),
  ('Gift Shop Revenue', 'USALI 6700 Gift Shop / 6700 COGS', '6700', '6700', '2020', NULL, '1010', '1100', true),
  ('Spa Revenue', 'USALI 8500 Spa / 8510 Spa COGS', '8500', '8510', '2020', '8590', '1010', '1100', true),
  ('Room Service Revenue', 'USALI 6400 Room Service / 3110 F&B COGS', '6400', '3110', '2020', '6490', '1010', '1100', true),
  ('Minibar Revenue', 'USALI 6500 Minibar / 3210 Beverage COGS', '6500', '3210', '2020', NULL, '1010', '1100', true),
  ('Generic POS Revenue', 'Fallback GL mapping for new outlet types', '6900', '3900', '2020', '6990', '1010', '1100', true)
ON CONFLICT (name) DO NOTHING;

-- ── 16. Update existing outlets with tax profile and GL mapping links ──
UPDATE public.pos_outlets SET
  tax_profile_id = (SELECT id FROM public.pos_tax_profiles WHERE name = 'Standard F&B' LIMIT 1),
  gl_mapping_id = (SELECT id FROM public.pos_gl_mappings WHERE name = 'Restaurant Revenue' LIMIT 1),
  inventory_mode = 'recipe'
WHERE outlet_type = 'restaurant' AND tax_profile_id IS NULL;

UPDATE public.pos_outlets SET
  tax_profile_id = (SELECT id FROM public.pos_tax_profiles WHERE name = 'Standard F&B' LIMIT 1),
  gl_mapping_id = (SELECT id FROM public.pos_gl_mappings WHERE name = 'Bar Revenue' LIMIT 1),
  inventory_mode = 'recipe'
WHERE outlet_type IN ('bar', 'pool_bar') AND tax_profile_id IS NULL;

UPDATE public.pos_outlets SET
  tax_profile_id = (SELECT id FROM public.pos_tax_profiles WHERE name = 'Retail (No Service Charge)' LIMIT 1),
  gl_mapping_id = (SELECT id FROM public.pos_gl_mappings WHERE name = 'Gift Shop Revenue' LIMIT 1),
  inventory_mode = 'sku'
WHERE outlet_type = 'gift_shop' AND tax_profile_id IS NULL;

UPDATE public.pos_outlets SET
  tax_profile_id = (SELECT id FROM public.pos_tax_profiles WHERE name = 'Spa & Wellness' LIMIT 1),
  gl_mapping_id = (SELECT id FROM public.pos_gl_mappings WHERE name = 'Spa Revenue' LIMIT 1),
  inventory_mode = 'sku'
WHERE outlet_type = 'spa' AND tax_profile_id IS NULL;

UPDATE public.pos_outlets SET
  tax_profile_id = (SELECT id FROM public.pos_tax_profiles WHERE name = 'Standard F&B' LIMIT 1),
  gl_mapping_id = (SELECT id FROM public.pos_gl_mappings WHERE name = 'Room Service Revenue' LIMIT 1),
  inventory_mode = 'recipe',
  requires_guest_link = true
WHERE outlet_type = 'room_service' AND tax_profile_id IS NULL;

-- ── 17. Comments ──
COMMENT ON TABLE public.pos_tax_profiles IS 'Reusable tax rule sets (VAT rate, service charge, exemptions) that any POS outlet can reference';
COMMENT ON TABLE public.pos_gl_mappings IS 'Revenue/COGS GL account mappings per outlet type, linking to USALI chart of accounts';
COMMENT ON TABLE public.pos_terminals IS 'Physical device registration, many-to-one with pos_outlets';
COMMENT ON TABLE public.pos_transactions IS 'Canonical unified transaction shape for ALL POS outlets — the single ingestion point';
COMMENT ON TABLE public.pos_shifts IS 'Till/cash-drawer shift reconciliation per outlet per terminal';
COMMENT ON TABLE public.pos_menu_versions IS 'Seasonal/promotional menu versioning per outlet';
COMMENT ON COLUMN public.pos_outlets.inventory_mode IS 'Strategy: recipe = deduct BOM components, sku = deduct direct stock';
COMMENT ON COLUMN public.pos_outlets.charge_modes IS 'JSONB array of allowed payment paths: cash, card, room_folio, mobile_money';
COMMENT ON COLUMN public.pos_outlets.requires_guest_link IS 'If true, walk-ins cannot purchase — must link to a reservation/guest';
COMMENT ON COLUMN public.pos_outlets.shift_reconciliation_required IS 'If true, cashier must close-out till at shift end';
