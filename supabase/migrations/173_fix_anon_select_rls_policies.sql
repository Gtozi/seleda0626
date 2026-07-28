-- Fix: Add missing anon SELECT RLS policies so the frontend Supabase client
-- (which uses the anon key) can read reservations, group_bookings, and
-- corporate_accounts tables. Without these policies, RLS silently filters
-- out all rows for the anon role, causing the frontend to fall back to
-- mock/initial data instead of showing real DB data.

-- reservations: anon can SELECT (read) rows
DROP POLICY IF EXISTS anon_select_reservations ON public.reservations;
CREATE POLICY anon_select_reservations
  ON public.reservations
  FOR SELECT
  TO anon
  USING (true);

-- group_bookings: anon can SELECT (read) rows
DROP POLICY IF EXISTS anon_select_group_bookings ON public.group_bookings;
CREATE POLICY anon_select_group_bookings
  ON public.group_bookings
  FOR SELECT
  TO anon
  USING (true);

-- corporate_accounts: anon can SELECT (read) rows
DROP POLICY IF EXISTS anon_select_corporate_accounts ON public.corporate_accounts;
CREATE POLICY anon_select_corporate_accounts
  ON public.corporate_accounts
  FOR SELECT
  TO anon
  USING (true);
