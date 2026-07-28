-- Migration 180: Rotational Menu Support
-- Adds 'rotational' menu type and day_of_week column to pos_menu_courses
-- Rotational menus have different courses/items per day of the week (Mon–Sun)

-- ── 1. Add 'rotational' to pos_menus.menu_type CHECK ───────────────────
ALTER TABLE public.pos_menus
  DROP CONSTRAINT IF EXISTS pos_menus_menu_type_check;

ALTER TABLE public.pos_menus
  ADD CONSTRAINT pos_menus_menu_type_check
    CHECK (menu_type IN ('a_la_carte', 'table_dhote', 'fixed_course', 'rotational'));

-- ── 2. Add day_of_week to pos_menu_courses ──────────────────────────────
-- NULL for non-rotational menus; for rotational menus, each course belongs to a specific day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pos_menu_courses' AND column_name = 'day_of_week'
  ) THEN
    ALTER TABLE public.pos_menu_courses
      ADD COLUMN day_of_week TEXT
      CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pos_menu_courses_day
  ON public.pos_menu_courses(menu_id, day_of_week);

COMMENT ON COLUMN public.pos_menu_courses.day_of_week IS
  'For rotational menus: which day of the week this course applies to. NULL for non-rotational menus.';
