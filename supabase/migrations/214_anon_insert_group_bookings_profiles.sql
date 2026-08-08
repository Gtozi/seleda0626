-- Migration 214: Allow anon INSERT into group_bookings and group_profiles
--
-- The FrontOffice client (src/components/FrontOffice/modules/Reservations.tsx)
-- uses a Supabase client with the anon key. When confirming a group booking it
-- needs to create a group_booking record and group_profile alongside the
-- individual guest profiles. Previously only `authenticated` had INSERT
-- policies on these tables, causing RLS 42501 errors for the anon client.
--
-- Pattern matches anon_insert_reservations / anon_insert_guests from
-- migration 100.

DROP POLICY IF EXISTS "anon_insert_group_bookings" ON public.group_bookings;
CREATE POLICY "anon_insert_group_bookings" ON public.group_bookings
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_group_profiles" ON public.group_profiles;
CREATE POLICY "anon_insert_group_profiles" ON public.group_profiles
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to SELECT group_profiles (needed to check for existing profile)
DROP POLICY IF EXISTS "anon_select_group_profiles" ON public.group_profiles;
CREATE POLICY "anon_select_group_profiles" ON public.group_profiles
  FOR SELECT TO anon USING (true);
