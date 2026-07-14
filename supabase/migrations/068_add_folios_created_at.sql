-- Migration 068: Add missing created_at column to folios and clean up old check_in_reservation overload
-- check_in_reservation and other folio workflows reference folios.created_at,
-- but the column was never added to the live schema.
-- Also removes the old 3-parameter signature left by schema.sql / migration 058
-- so the server no longer gets an "ambiguous function" error.

-- Drop the old 3-parameter overload (reservation_id, room_number, user_id)
drop function if exists check_in_reservation(text, text, text) cascade;

-- Add the missing column
alter table folios
add column if not exists created_at timestamp with time zone not null default now();
