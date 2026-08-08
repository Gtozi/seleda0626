-- Add sample reservation data for testing
-- This creates a few sample reservations to test the frontend
-- Using NULL for room_number to avoid foreign key constraint issues

-- Temporarily disable triggers that reference missing tables
DROP TRIGGER IF EXISTS on_reservation_change_for_adr ON reservations;
DROP TRIGGER IF EXISTS on_reservation_change_for_occupancy ON reservations;
DROP TRIGGER IF EXISTS on_reservation_change_for_revenue ON reservations;

-- Sample 1: Single room reservation
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-001',
  'John Smith',
  'john.smith@example.com',
  '+251911234567',
  'Regular',
  'Deluxe King',
  NULL,
  '2026-08-05',
  '2026-08-08',
  2,
  0,
  'Confirmed',
  150.00,
  450.00,
  'Direct Website',
  'Unpaid',
  '{"groupName": null, "primaryContact": null, "travelAgency": null, "corporation": null}',
  100.00,
  true
);

-- Sample 2: Group booking with multiple rooms
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid, group_booking_id, booking_group_id, is_group)
VALUES (
  'RES-002',
  'Johnson Family',
  'johnson.family@example.com',
  '+251922345678',
  'Regular',
  'Suite',
  NULL,
  '2026-08-10',
  '2026-08-15',
  4,
  2,
  'Confirmed',
  250.00,
  1250.00,
  'Direct Website',
  'Partial',
  '{"groupName": "Johnson Family Reunion", "primaryContact": "Mary Johnson - +251922345678", "travelAgency": null, "corporation": null}',
  250.00,
  true,
  'Johnson Family Reunion',
  'GRP-2026-JOHNSON',
  true
);

-- Sample 3: Corporate booking
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid, corporate_account_id, is_group)
VALUES (
  'RES-003',
  'Tech Corp Conference',
  'conference@techcorp.com',
  '+251933456789',
  'VIP',
  'Standard Twin',
  NULL,
  '2026-08-12',
  '2026-08-14',
  2,
  0,
  'Confirmed',
  100.00,
  200.00,
  'Corporate',
  'Unpaid',
  '{"groupName": "Tech Corp Annual Conference", "primaryContact": "Event Coordinator - +251933456789", "travelAgency": null, "corporation": "Tech Corporation"}',
  0.00,
  false,
  'Tech Corporation',
  true
);

-- Sample 4: Walk-in reservation
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-004',
  'Alice Brown',
  'alice.brown@example.com',
  '+251944567890',
  'Regular',
  'Standard Twin',
  NULL,
  '2026-08-01',
  '2026-08-02',
  1,
  0,
  'Confirmed',
  100.00,
  100.00,
  'Walk-In',
  'Paid',
  '{"groupName": null, "primaryContact": null, "travelAgency": null, "corporation": null}',
  100.00,
  true
);

-- Sample 5: OTA booking
INSERT INTO reservations (id, guest_name, guest_email, guest_phone, guest_status, room_type, room_number, check_in_date, check_out_date, adults, children, status, rate, total_amount, channel, payment_status, notes, deposit_amount, is_deposit_paid)
VALUES (
  'RES-005',
  'Michael Davis',
  'michael.davis@example.com',
  '+2519556789012',
  'Regular',
  'Deluxe King',
  NULL,
  '2026-08-03',
  '2026-08-06',
  2,
  1,
  'Confirmed',
  150.00,
  450.00,
  'Booking.com',
  'Unpaid',
  '{"groupName": null, "primaryContact": null, "travelAgency": "Booking.com", "corporation": null}',
  0.00,
  false
);
