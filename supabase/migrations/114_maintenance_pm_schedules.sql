-- Migration 114: Maintenance & Engineering — PM Schedules, Work Orders, Spare Parts
-- Step 5.5 — Maintenance & Engineering Completion

-- =============================================================
-- 1. PM Schedules table
--    Recurring preventive maintenance schedules per asset
-- =============================================================

CREATE TABLE IF NOT EXISTS public.pm_schedules (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  schedule_name text NOT NULL,
  asset_id text REFERENCES public.fixed_assets(id) ON DELETE SET NULL,
  frequency text NOT NULL DEFAULT 'Monthly',
  interval_days integer DEFAULT 30,
  next_due_date date NOT NULL,
  last_completed_date date,
  checklist_template jsonb DEFAULT '[]'::jsonb,
  assigned_technician text,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 2. Work Orders table
--    Auto-generated from PM schedules or manually created
-- =============================================================

CREATE TABLE IF NOT EXISTS public.work_orders (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  wo_number text,
  pm_schedule_id text REFERENCES public.pm_schedules(id) ON DELETE SET NULL,
  asset_id text REFERENCES public.fixed_assets(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text DEFAULT 'Preventive',
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Open',
  assigned_to text,
  room_number text,
  checklist jsonb DEFAULT '[]'::jsonb,
  completed_checklist jsonb DEFAULT '[]'::jsonb,
  spare_parts_used jsonb DEFAULT '[]'::jsonb,
  labor_hours numeric DEFAULT 0,
  cost_estimate numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  scheduled_date date,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_by text
);

-- =============================================================
-- 3. Spare Parts table
--    Inventory of spare parts with min/max reorder levels
-- =============================================================

CREATE TABLE IF NOT EXISTS public.spare_parts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  part_number text,
  part_name text NOT NULL,
  category text,
  manufacturer text,
  compatible_assets jsonb DEFAULT '[]'::jsonb,
  unit text DEFAULT 'pcs',
  min_stock integer DEFAULT 5,
  max_stock integer DEFAULT 50,
  current_stock integer DEFAULT 0,
  unit_cost numeric DEFAULT 0,
  location text,
  reorder_qty integer DEFAULT 10,
  last_reorder_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 4. Auto-generate PM work orders function
--    Scans all active PM schedules due on or before p_date
--    and creates work orders for each
-- =============================================================

CREATE OR REPLACE FUNCTION public.generate_pm_work_orders(p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(wo_id text, wo_number text, schedule_name text) AS $$
DECLARE
  v_schedule record;
  v_wo_id text;
  v_wo_number text;
BEGIN
  FOR v_schedule IN
    SELECT * FROM pm_schedules
    WHERE status = 'Active' AND next_due_date <= p_date
  LOOP
    v_wo_id := gen_random_uuid()::text;
    v_wo_number := 'WO-PM-' || to_char(p_date, 'YYYYMMDD') || '-' || SUBSTRING(v_schedule.id FROM 1 FOR 4);

    INSERT INTO work_orders (id, wo_number, pm_schedule_id, asset_id, title, description, type, priority, status, assigned_to, scheduled_date, checklist, created_by, created_date)
    VALUES (
      v_wo_id, v_wo_number, v_schedule.id, v_schedule.asset_id,
      'PM: ' || v_schedule.schedule_name,
      'Preventive maintenance auto-generated from schedule',
      'Preventive', v_schedule.priority, 'Open', v_schedule.assigned_technician,
      p_date, v_schedule.checklist_template, 'system', now()
    );

    UPDATE pm_schedules
      SET next_due_date = p_date + (v_schedule.interval_days || ' days')::interval,
          last_completed_date = p_date
      WHERE id = v_schedule.id;

    RETURN QUERY SELECT v_wo_id, v_wo_number, v_schedule.schedule_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 5. updated_at triggers
-- =============================================================

DROP TRIGGER IF EXISTS trg_pm_schedules_updated_at ON public.pm_schedules;
CREATE TRIGGER trg_pm_schedules_updated_at
  BEFORE UPDATE ON public.pm_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_spare_parts_updated_at ON public.spare_parts;
CREATE TRIGGER trg_spare_parts_updated_at
  BEFORE UPDATE ON public.spare_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 6. Performance indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_pm_schedules_asset_id ON public.pm_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_status ON public.pm_schedules(status);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_next_due ON public.pm_schedules(next_due_date);

CREATE INDEX IF NOT EXISTS idx_work_orders_pm_schedule_id ON public.work_orders(pm_schedule_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id ON public.work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_spare_parts_part_number ON public.spare_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON public.spare_parts(category);
