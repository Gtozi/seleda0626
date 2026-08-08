-- Migration: 225_expand_rooms_status_check.sql
-- Expands the rooms_status_check constraint to allow additional inventory
-- statuses used by the Front Office Availability & Inventory module:
-- Out of Service, Maintenance, House Use, Blocked.

ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_status_check
  CHECK (status = ANY (ARRAY[
    'Vacant Clean'::text,
    'Vacant Dirty'::text,
    'Occupied Clean'::text,
    'Occupied Dirty'::text,
    'Out of Order'::text,
    'Out of Service'::text,
    'Maintenance'::text,
    'House Use'::text,
    'Blocked'::text
  ]));
