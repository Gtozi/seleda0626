-- Migration 207: Modifier Groups, Allergens, Nutrition, Time-Based Pricing
-- Phase 4 Item 3: Implement modifier groups, allergens, nutrition, time-based pricing

-- ── 1. Modifier Groups ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  selection_type TEXT NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single', 'multi', 'quantity')),
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_outlet ON public.pos_modifier_groups(outlet_id);
ALTER TABLE public.pos_modifier_groups ENABLE ROW LEVEL SECURITY;

-- ── 2. Modifier Options ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_group_id UUID NOT NULL REFERENCES public.pos_modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON public.pos_modifier_options(modifier_group_id);
ALTER TABLE public.pos_modifier_options ENABLE ROW LEVEL SECURITY;

-- ── 3. Menu Item ↔ Modifier Group link ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menu_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES public.pos_menu_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES public.pos_modifier_groups(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_item ON public.pos_menu_item_modifiers(menu_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_item_modifiers_unique ON public.pos_menu_item_modifiers(menu_item_id, modifier_group_id);
ALTER TABLE public.pos_menu_item_modifiers ENABLE ROW LEVEL SECURITY;

-- ── 4. Allergens master ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pos_allergens ENABLE ROW LEVEL SECURITY;

INSERT INTO public.pos_allergens (name, icon, color) VALUES
  ('Gluten', 'wheat', '#D4A017'), ('Dairy', 'milk', '#4A90D9'),
  ('Eggs', 'egg', '#F5A623'), ('Peanuts', 'peanut', '#8B4513'),
  ('Tree Nuts', 'nut', '#A0522D'), ('Soy', 'soy', '#6B8E23'),
  ('Fish', 'fish', '#20B2AA'), ('Shellfish', 'shellfish', '#FF6347'),
  ('Sesame', 'sesame', '#D2B48C'), ('Mustard', 'mustard', '#FFD700'),
  ('Celery', 'celery', '#90EE90'), ('Sulfites', 'sulfite', '#DDA0DD')
ON CONFLICT (name) DO NOTHING;

-- ── 5. Menu Item ↔ Allergen link ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menu_item_allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES public.pos_menu_items(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES public.pos_allergens(id) ON DELETE CASCADE,
  contains BOOLEAN NOT NULL DEFAULT true,
  may_contain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_item_allergens_item ON public.pos_menu_item_allergens(menu_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_item_allergens_unique ON public.pos_menu_item_allergens(menu_item_id, allergen_id);
ALTER TABLE public.pos_menu_item_allergens ENABLE ROW LEVEL SECURITY;

-- ── 6. Nutrition info ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menu_item_nutrition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES public.pos_menu_items(id) ON DELETE CASCADE,
  serving_size TEXT,
  calories NUMERIC(8,2), protein_g NUMERIC(8,2), carbs_g NUMERIC(8,2),
  fat_g NUMERIC(8,2), fiber_g NUMERIC(8,2), sugar_g NUMERIC(8,2),
  sodium_mg NUMERIC(8,2), cholesterol_mg NUMERIC(8,2),
  saturated_fat_g NUMERIC(8,2), trans_fat_g NUMERIC(8,2),
  vitamins JSONB DEFAULT '{}', minerals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_menu_item_unique ON public.pos_menu_item_nutrition(menu_item_id);
ALTER TABLE public.pos_menu_item_nutrition ENABLE ROW LEVEL SECURITY;

-- ── 7. Time-Based Pricing Rules ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_time_based_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('happy_hour', 'lunch_special', 'dinner_premium', 'late_night', 'breakfast', 'custom')),
  start_time TIME NOT NULL, end_time TIME NOT NULL,
  applicable_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('percentage_off', 'fixed_price', 'percentage_premium', 'fixed_off')),
  pricing_value NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE, end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_pricing_outlet ON public.pos_time_based_pricing_rules(outlet_id);
CREATE INDEX IF NOT EXISTS idx_time_pricing_active ON public.pos_time_based_pricing_rules(is_active);
ALTER TABLE public.pos_time_based_pricing_rules ENABLE ROW LEVEL SECURITY;

-- ── 8. Time-Based Pricing ↔ Menu Item link ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_time_pricing_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_rule_id UUID NOT NULL REFERENCES public.pos_time_based_pricing_rules(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.pos_menu_items(id) ON DELETE CASCADE,
  override_price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_pricing_items_rule ON public.pos_time_pricing_menu_items(pricing_rule_id);
CREATE INDEX IF NOT EXISTS idx_time_pricing_items_item ON public.pos_time_pricing_menu_items(menu_item_id);
ALTER TABLE public.pos_time_pricing_menu_items ENABLE ROW LEVEL SECURITY;

-- ── 9. RLS Policies ─────────────────────────────────────────────────────
DO $$
DECLARE t TEXT; tables TEXT[] := ARRAY[
  'pos_modifier_groups','pos_modifier_options','pos_menu_item_modifiers',
  'pos_allergens','pos_menu_item_allergens','pos_menu_item_nutrition',
  'pos_time_based_pricing_rules','pos_time_pricing_menu_items'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "service_role all %s" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE format('CREATE POLICY "authenticated read %s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$;

-- ── 10. resolve_time_based_price function ───────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_time_based_price(
  p_menu_item_id UUID, p_outlet_id UUID, p_check_time TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
DECLARE
  v_day INTEGER; v_time TIME; v_rule RECORD; v_base_price NUMERIC; v_final_price NUMERIC;
BEGIN
  v_day := EXTRACT(DOW FROM p_check_time)::INTEGER;
  v_time := p_check_time::TIME;
  SELECT selling_price INTO v_base_price FROM public.pos_menu_items WHERE id = p_menu_item_id;
  IF v_base_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Menu item not found'); END IF;

  SELECT r.* INTO v_rule
  FROM public.pos_time_based_pricing_rules r
  JOIN public.pos_time_pricing_menu_items ti ON ti.pricing_rule_id = r.id
  WHERE ti.menu_item_id = p_menu_item_id AND r.is_active = true
  AND (r.outlet_id = p_outlet_id OR r.outlet_id IS NULL)
  AND v_time BETWEEN r.start_time AND r.end_time
  AND v_day = ANY(r.applicable_days)
  AND (r.start_date IS NULL OR p_check_time::DATE >= r.start_date)
  AND (r.end_date IS NULL OR p_check_time::DATE <= r.end_date)
  ORDER BY r.created_at DESC LIMIT 1;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', true, 'price', v_base_price, 'original_price', v_base_price, 'rule_applied', null);
  END IF;

  SELECT ti.override_price INTO v_final_price
  FROM public.pos_time_pricing_menu_items ti
  WHERE ti.pricing_rule_id = v_rule.id AND ti.menu_item_id = p_menu_item_id;

  IF v_final_price IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'price', v_final_price, 'original_price', v_base_price, 'rule_applied', v_rule.name, 'rule_type', v_rule.rule_type);
  END IF;

  v_final_price := CASE
    WHEN v_rule.pricing_type = 'percentage_off' THEN v_base_price * (1 - v_rule.pricing_value / 100)
    WHEN v_rule.pricing_type = 'fixed_price' THEN v_rule.pricing_value
    WHEN v_rule.pricing_type = 'percentage_premium' THEN v_base_price * (1 + v_rule.pricing_value / 100)
    WHEN v_rule.pricing_type = 'fixed_off' THEN GREATEST(0, v_base_price - v_rule.pricing_value)
    ELSE v_base_price
  END;

  RETURN jsonb_build_object('success', true, 'price', v_final_price, 'original_price', v_base_price, 'rule_applied', v_rule.name, 'rule_type', v_rule.rule_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
