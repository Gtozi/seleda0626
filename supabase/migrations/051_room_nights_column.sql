-- Migration: Add per-night room assignments column to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS room_nights jsonb DEFAULT NULL;

COMMENT ON COLUMN public.reservations.room_nights IS
  'Per-night room selection: array of nights, each an array of selected room numbers (supports room moves and multi-room bookings).';
