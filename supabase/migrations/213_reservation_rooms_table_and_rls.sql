-- Migration 213: Fix reservation_rooms RLS policies for anon role
--
-- Background: The reservation_rooms table was created manually (no migration)
-- and has RLS enabled with policies only for the `authenticated` role.
-- However, the FrontOffice client (src/components/FrontOffice/modules/
-- Reservations.tsx) creates a Supabase client using only the anon key
-- (VITE_SUPABASE_ANON_KEY) without a user session, so all its requests
-- run as the `anon` role.
--
-- Symptom: Client-side Supabase inserts failed with:
--   42501: new row violates row-level security policy for table "reservation_rooms"
--   HTTP 401 (Unauthorized)
--
-- The `reservations` table works because migration 100 created
-- `anon_insert_reservations`. This migration applies the same pattern to
-- `reservation_rooms`: anon can INSERT (public booking flow) and SELECT
-- (reading back room assignments), but cannot UPDATE or DELETE.
--
-- The Express server uses the service_role key which bypasses RLS entirely.

-- =============================================================
-- 1. Ensure table exists (idempotent — for environments where it
--    was never created manually)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.reservation_rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  TEXT NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  room_type       TEXT,
  room_number     TEXT,
  adults          INTEGER DEFAULT 1,
  children        INTEGER DEFAULT 0,
  amount          NUMERIC DEFAULT 0,
  check_in_date   DATE,
  check_out_date  DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservation_rooms_reservation_id
  ON public.reservation_rooms (reservation_id);

-- =============================================================
-- 2. Enable RLS (safe to re-run)
-- =============================================================
ALTER TABLE public.reservation_rooms ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 3. anon INSERT policy (matches anon_insert_reservations pattern)
--    Public booking flow needs to insert room rows alongside reservations.
-- =============================================================
DROP POLICY IF EXISTS "anon_insert_reservation_rooms" ON public.reservation_rooms;
CREATE POLICY "anon_insert_reservation_rooms" ON public.reservation_rooms
  FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- 4. anon SELECT policy (client reads back room assignments after
--    creating a booking and when loading the reservations list)
-- =============================================================
DROP POLICY IF EXISTS "anon_select_reservation_rooms" ON public.reservation_rooms;
CREATE POLICY "anon_select_reservation_rooms" ON public.reservation_rooms
  FOR SELECT TO anon USING (true);

-- =============================================================
-- 5. Authenticated role gets full CRUD (staff users via Supabase Auth)
--    Recreate to ensure it exists consistently.
-- =============================================================
DROP POLICY IF EXISTS "authenticated_all_reservation_rooms" ON public.reservation_rooms;
CREATE POLICY "authenticated_all_reservation_rooms" ON public.reservation_rooms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- 6. Grant DML privileges (anon needs INSERT + SELECT only;
--    authenticated gets full CRUD)
-- =============================================================
GRANT SELECT, INSERT ON public.reservation_rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservation_rooms TO authenticated;
