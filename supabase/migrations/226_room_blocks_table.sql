-- Migration: 226_room_blocks_table.sql
-- Creates a room_blocks table for date-range room status overrides
-- (Block, Out of Order, Out of Service, House Use) that span multiple days.
-- The rooms.status column remains the point-in-time physical status;
-- room_blocks layered on top represent scheduled unavailability periods.

CREATE TABLE IF NOT EXISTS public.room_blocks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Blocked', 'Out of Order', 'Out of Service', 'Maintenance', 'House Use')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_room_blocks_room_id ON public.room_blocks(room_id);
CREATE INDEX IF NOT EXISTS idx_room_blocks_room_number ON public.room_blocks(room_number);
CREATE INDEX IF NOT EXISTS idx_room_blocks_dates ON public.room_blocks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_room_blocks_status ON public.room_blocks(status);

-- RLS policies
ALTER TABLE public.room_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_blocks_select_authenticated"
  ON public.room_blocks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "room_blocks_all_authenticated"
  ON public.room_blocks FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_blocks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_blocks TO anon;

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_room_blocks_updated_at ON public.room_blocks;
CREATE TRIGGER trg_room_blocks_updated_at
  BEFORE UPDATE ON public.room_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.room_blocks IS 'Date-range room status overrides (blocks, OOO, OOS) that span multiple days.';
