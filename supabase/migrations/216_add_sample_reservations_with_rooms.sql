-- Add sample reservations with room assignments for testing AvailabilityInventory
-- This creates reservations that are currently active to test occupancy calculations

-- Sample 1: Current checked-in guest in room 201
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-CURRENT-001',
  'John Smith',
  'john.smith@example.com',
  '+251911234567',
  'Regular',
  'Double',
  '201',
  '2026-07-28',
  '2026-08-02',
  2,
  0,
  'CheckedIn',
  180.00,
  900.00,
  'Direct Website',
  'Paid',
  'Business trip',
  0.00,
  true
) ON CONFLICT (id) DO NOTHING;

-- Sample 2: Current checked-in guest in room 301
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-CURRENT-002',
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+251922345678',
  'VIP',
  'Double',
  '301',
  '2026-07-30',
  '2026-08-05',
  2,
  1,
  'CheckedIn',
  195.00,
  975.00,
  'Booking.com',
  'Unpaid',
  'Family vacation',
  0.00,
  false
) ON CONFLICT (id) DO NOTHING;

-- Sample 3: Current checked-in guest in suite 305
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-CURRENT-003',
  'Michael Brown',
  'michael.brown@example.com',
  '+251933456789',
  'Regular',
  'Suite',
  '305',
  '2026-07-25',
  '2026-08-10',
  3,
  0,
  'CheckedIn',
  320.00,
  4800.00,
  'Direct Website',
  'Partial',
  'Extended business stay',
  500.00,
  true
) ON CONFLICT (id) DO NOTHING;

-- Update room statuses to reflect occupancy
UPDATE rooms SET status = 'Occupied Clean' WHERE number IN ('201', '301', '305');

-- Mark one room as out of order for testing
UPDATE rooms SET status = 'Out of Order' WHERE number = '103';
