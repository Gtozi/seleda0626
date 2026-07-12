-- 041_add_quantity_to_airport_shuttle_requests.sql
-- Adds quantity support for pickup and drop-off shuttle requests

ALTER TABLE airport_shuttle_requests
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN airport_shuttle_requests.quantity IS 'Number of shuttle vehicles requested for this direction (Pickup or Drop-off).';
