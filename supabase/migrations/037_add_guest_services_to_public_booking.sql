-- 037_add_guest_services_to_public_booking.sql
-- Add guest services price and revenue columns to reservations table for public booking tracking

-- Add guest_services_price column to track the total price of guest services for each booking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_services_price NUMERIC NOT NULL DEFAULT 0.00;

-- Add guest_services_revenue column to track the actual revenue from guest services for each booking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_services_revenue NUMERIC NOT NULL DEFAULT 0.00;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN reservations.guest_services_price IS 'Total price of guest services selected for this booking (before discounts/taxes)';
COMMENT ON COLUMN reservations.guest_services_revenue IS 'Actual revenue earned from guest services for this booking (after discounts/taxes)';

-- Create index for querying bookings by guest services revenue
CREATE INDEX IF NOT EXISTS idx_reservations_guest_services_revenue ON reservations(guest_services_revenue);
