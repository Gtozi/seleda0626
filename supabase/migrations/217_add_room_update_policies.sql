-- Migration 217: Add UPDATE policies for rooms table
-- This allows the Front Office Room Assignment module to update room status
-- and features via the anon role (public booking flow)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon_update_rooms" ON public.rooms;
DROP POLICY IF EXISTS "authenticated_update_rooms" ON public.rooms;

-- Create UPDATE policy for anon role (for public room assignment flow)
CREATE POLICY "anon_update_rooms" ON public.rooms
  FOR UPDATE TO anon WITH CHECK (true);

-- Create UPDATE policy for authenticated role (for staff users)
CREATE POLICY "authenticated_update_rooms" ON public.rooms
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Grant UPDATE privileges
GRANT UPDATE ON public.rooms TO anon;
GRANT UPDATE ON public.rooms TO authenticated;