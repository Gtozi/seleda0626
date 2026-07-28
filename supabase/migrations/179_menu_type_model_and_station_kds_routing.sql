-- Migration 179: Menu Type Model + Station-Level KDS Routing
-- Implements the F&B Portal architecture from "FB improvment.md":
--   §2.2: pos_menus, pos_menu_courses, pos_menu_course_items, pos_menu_outlet_assignments
--   §2.3: kds_pos_connections.prep_station_id (station-scoped routing)
--   §2.4: menu_id, course_id additive fields on kds_orders
--   §8:   RLS enabled from day one on all new tables
--   §9.2: Backfill every outlet with one a_la_carte menu wrapping current items

-- ── 1. pos_menus ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  menu_type TEXT NOT NULL DEFAULT 'a_la_carte'
    CHECK (menu_type IN ('a_la_carte', 'table_dhote', 'fixed_course')),
  base_price NUMERIC(10,2),                 -- used for table_dhote / fixed_course
  day_part TEXT,                             -- e.g. 'Breakfast', 'Lunch', 'Dinner', null = all day
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_menus_type ON public.pos_menus(menu_type);
CREATE INDEX IF NOT EXISTS idx_pos_menus_status ON public.pos_menus(status);

ALTER TABLE public.pos_menus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all pos_menus" ON public.pos_menus;
CREATE POLICY "service_role all pos_menus" ON public.pos_menus FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read pos_menus" ON public.pos_menus;
CREATE POLICY "authenticated read pos_menus" ON public.pos_menus FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_pos_menus_updated_at ON public.pos_menus;
CREATE TRIGGER update_pos_menus_updated_at BEFORE UPDATE ON public.pos_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.pos_menus IS
  'Menu master — supports a_la_carte, table_dhote, and fixed_course menu types';

-- ── 2. pos_menu_courses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menu_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.pos_menus(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,                        -- e.g. "Appetizer", "Main Course", "Dessert"
  choice_count INTEGER NOT NULL DEFAULT 1,   -- 1 = fixed (no choice), >1 = guest picks N items
  fire_mode TEXT NOT NULL DEFAULT 'immediate'
    CHECK (fire_mode IN ('immediate', 'hold_until_prior_served')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_pos_menu_courses_menu ON public.pos_menu_courses(menu_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_courses_seq ON public.pos_menu_courses(menu_id, sequence_number);

ALTER TABLE public.pos_menu_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all pos_menu_courses" ON public.pos_menu_courses;
CREATE POLICY "service_role all pos_menu_courses" ON public.pos_menu_courses FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read pos_menu_courses" ON public.pos_menu_courses;
CREATE POLICY "authenticated read pos_menu_courses" ON public.pos_menu_courses FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_pos_menu_courses_updated_at ON public.pos_menu_courses;
CREATE TRIGGER update_pos_menu_courses_updated_at BEFORE UPDATE ON public.pos_menu_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.pos_menu_courses IS
  'Courses within a table_dhote or fixed_course menu — sequence, choice count, fire mode';

-- ── 3. pos_menu_course_items ────────────────────────────────────────────
-- Links menu items to menus (and optionally to a specific course within the menu)
CREATE TABLE IF NOT EXISTS public.pos_menu_course_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.pos_menus(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.pos_menu_courses(id) ON DELETE CASCADE,  -- null = a_la_carte / direct menu item
  item_id UUID NOT NULL REFERENCES public.pos_menu_items(id) ON DELETE CASCADE,
  price_override NUMERIC(10,2),              -- null = use pos_menu_items.selling_price
  is_supplement BOOLEAN NOT NULL DEFAULT false,  -- true = add-on supplement on top of base_price
  supplement_price NUMERIC(10,2),            -- price for supplements
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_id, course_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_pos_menu_course_items_menu ON public.pos_menu_course_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_course_items_course ON public.pos_menu_course_items(course_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_course_items_item ON public.pos_menu_course_items(item_id);

ALTER TABLE public.pos_menu_course_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all pos_menu_course_items" ON public.pos_menu_course_items;
CREATE POLICY "service_role all pos_menu_course_items" ON public.pos_menu_course_items FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read pos_menu_course_items" ON public.pos_menu_course_items;
CREATE POLICY "authenticated read pos_menu_course_items" ON public.pos_menu_course_items FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.pos_menu_course_items IS
  'Items assigned to menus and courses — supports price overrides and supplements';

-- ── 4. pos_menu_outlet_assignments ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_menu_outlet_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.pos_menus(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  active_from DATE,
  active_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_id, outlet_id)
);

CREATE INDEX IF NOT EXISTS idx_pos_menu_outlet_assign_menu ON public.pos_menu_outlet_assignments(menu_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_outlet_assign_outlet ON public.pos_menu_outlet_assignments(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_outlet_assign_primary ON public.pos_menu_outlet_assignments(outlet_id, is_primary);

ALTER TABLE public.pos_menu_outlet_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all pos_menu_outlet_assignments" ON public.pos_menu_outlet_assignments;
CREATE POLICY "service_role all pos_menu_outlet_assignments" ON public.pos_menu_outlet_assignments FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read pos_menu_outlet_assignments" ON public.pos_menu_outlet_assignments;
CREATE POLICY "authenticated read pos_menu_outlet_assignments" ON public.pos_menu_outlet_assignments FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.pos_menu_outlet_assignments IS
  'Many-to-many: which menus are active in which outlets, with primary flag and date scoping';

-- ── 5. Add prep_station_id to kds_pos_connections (§2.3) ────────────────
-- NULL = outlet-wide catch-all (existing behavior)
-- NOT NULL = routes only that station's tickets to that KDS instance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_pos_connections' AND column_name = 'prep_station_id'
  ) THEN
    ALTER TABLE public.kds_pos_connections ADD COLUMN prep_station_id UUID;
    COMMENT ON COLUMN public.kds_pos_connections.prep_station_id IS
      'Station-scoped routing: NULL = outlet catch-all, NOT NULL = only this station routes here';
  END IF;
END $$;

-- The unique constraint on (kds_instance_id, outlet_id) needs to allow
-- multiple connections per outlet when station-scoped. Replace with a
-- constraint that includes prep_station_id.
ALTER TABLE public.kds_pos_connections DROP CONSTRAINT IF EXISTS kds_pos_connections_kds_instance_id_outlet_id_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'kds_pos_connections_inst_outlet_station_key'
  ) THEN
    ALTER TABLE public.kds_pos_connections
      ADD CONSTRAINT kds_pos_connections_inst_outlet_station_key
      UNIQUE (kds_instance_id, outlet_id, prep_station_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kds_pos_connections_station ON public.kds_pos_connections(prep_station_id);

-- ── 6. Add menu_id, course_id to kds_orders (§2.4) ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'menu_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN menu_id UUID;
    COMMENT ON COLUMN public.kds_orders.menu_id IS
      'FK to pos_menus — which menu this order was placed from (nullable, for reporting)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN course_id UUID;
    COMMENT ON COLUMN public.kds_orders.course_id IS
      'FK to pos_menu_courses — which course this ticket belongs to (for course-fire logic)';
  END IF;
END $$;

-- ── 7. Backfill: one a_la_carte menu per existing outlet (§9.2) ─────────
-- Zero re-entry, zero downtime: every outlet gets a default a_la_carte menu
-- wrapping all its current pos_menu_items
DO $$
DECLARE
  r RECORD;
  v_menu_id UUID;
BEGIN
  FOR r IN SELECT id, name FROM public.pos_outlets WHERE is_active = true LOOP
    -- Skip if this outlet already has a menu assignment
    IF EXISTS (
      SELECT 1 FROM public.pos_menu_outlet_assignments a
      JOIN public.pos_menus m ON m.id = a.menu_id
      WHERE a.outlet_id = r.id AND m.menu_type = 'a_la_carte'
    ) THEN
      CONTINUE;
    END IF;

    -- Create the a_la_carte menu
    INSERT INTO public.pos_menus (name, description, menu_type, base_price, status)
    VALUES (r.name || ' — À la carte', 'Auto-created default à la carte menu', 'a_la_carte', NULL, 'active')
    RETURNING id INTO v_menu_id;

    -- Assign it to the outlet as primary
    INSERT INTO public.pos_menu_outlet_assignments (menu_id, outlet_id, is_primary)
    VALUES (v_menu_id, r.id, true);

    -- Wrap all existing items for this outlet as direct menu items (no course)
    INSERT INTO public.pos_menu_course_items (menu_id, course_id, item_id, price_override, is_supplement, sort_order)
    SELECT v_menu_id, NULL, pmi.id, NULL, false, 0
    FROM public.pos_menu_items pmi
    WHERE pmi.outlet_id = r.id AND pmi.is_active = true;
  END LOOP;
END $$;

-- ── 8. Function: resolve_kds_instance (station-level routing, §2.3) ─────
-- Resolution order: match (outlet_id, prep_station_id) first,
-- fall back to (outlet_id, station_id IS NULL)
CREATE OR REPLACE FUNCTION public.resolve_kds_instance(
  p_outlet_id UUID,
  p_prep_station_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_instance_id UUID;
BEGIN
  -- Try station-specific connection first
  IF p_prep_station_id IS NOT NULL THEN
    SELECT kpc.kds_instance_id INTO v_instance_id
    FROM public.kds_pos_connections kpc
    WHERE kpc.outlet_id = p_outlet_id
      AND kpc.prep_station_id = p_prep_station_id
      AND kpc.is_active = true
    ORDER BY kpc.priority_weight DESC
    LIMIT 1;
  END IF;

  -- Fall back to outlet-wide catch-all
  IF v_instance_id IS NULL THEN
    SELECT kpc.kds_instance_id INTO v_instance_id
    FROM public.kds_pos_connections kpc
    WHERE kpc.outlet_id = p_outlet_id
      AND kpc.prep_station_id IS NULL
      AND kpc.is_active = true
    ORDER BY kpc.priority_weight DESC
    LIMIT 1;
  END IF;

  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.resolve_kds_instance(UUID, UUID) IS
  'Resolves the correct KDS instance for a given outlet and optional prep station — station-specific first, outlet catch-all fallback';

-- ── 9. Function: get_outlet_active_menus ────────────────────────────────
-- Returns active menus for an outlet with their courses and items
CREATE OR REPLACE FUNCTION public.get_outlet_active_menus(
  p_outlet_id UUID
) RETURNS TABLE (
  menu_id UUID,
  menu_name TEXT,
  menu_type TEXT,
  base_price NUMERIC(10,2),
  day_part TEXT,
  is_primary BOOLEAN
) AS $$
SELECT m.id, m.name, m.menu_type, m.base_price, m.day_part,
       coalesce(a.is_primary, false)
FROM public.pos_menus m
JOIN public.pos_menu_outlet_assignments a ON a.menu_id = m.id
WHERE a.outlet_id = p_outlet_id
  AND m.status = 'active'
  AND (a.active_from IS NULL OR a.active_from <= CURRENT_DATE)
  AND (a.active_to IS NULL OR a.active_to >= CURRENT_DATE)
ORDER BY a.is_primary DESC, m.name;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.get_outlet_active_menus(UUID) IS
  'Returns all active menus assigned to an outlet, primary first';
