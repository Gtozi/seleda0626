-- 039_add_guest_service_ids_to_reservations.sql
-- Track which guest services were selected for each reservation

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS guest_service_ids TEXT[] DEFAULT '{}';

COMMENT ON COLUMN reservations.guest_service_ids IS 'Array of guest service IDs selected for this reservation (public booking add-ons)';

CREATE INDEX IF NOT EXISTS idx_reservations_guest_service_ids ON reservations USING GIN (guest_service_ids);
