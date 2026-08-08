-- Drop KPI triggers that fire on INSERT and may cause the created_at error

-- Drop the ADR trigger
DROP TRIGGER IF EXISTS trigger_adr ON reservations;

-- Drop the RevPAR trigger
DROP TRIGGER IF EXISTS trigger_revpar ON reservations;

-- Drop the analytics trigger
DROP TRIGGER IF EXISTS trg_update_analytics ON reservations;

-- Drop the group analytics trigger
DROP TRIGGER IF EXISTS trigger_update_group_analytics ON reservations;

-- Now test a simple INSERT
DO $$
DECLARE
  v_test_id TEXT := 'TEST-' || extract(epoch from now())::text;
BEGIN
  INSERT INTO reservations (
    id, guest_name, guest_email, guest_phone, guest_status,
    room_type, check_in_date, check_out_date, adults, children,
    status, rate, total_amount, channel, payment_status,
    notes, charges, payments, is_group, deposit_amount, is_deposit_paid
  ) VALUES (
    v_test_id, 'Test Guest', 'test@example.com', '', 'Regular',
    'Standard', CURRENT_DATE + 1, CURRENT_DATE + 3, 1, 0,
    'Confirmed', 100.00, 200.00, 'Direct Website', 'Unpaid',
    '{}', '[]'::jsonb, '[]'::jsonb, false, 0, false
  );
  
  RAISE NOTICE '✅ Test INSERT successful! ID: %', v_test_id;
  
  DELETE FROM reservations WHERE id = v_test_id;
  RAISE NOTICE '✅ Test cleanup complete';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test INSERT failed: %', SQLERRM;
END $$;

-- Show remaining triggers
SELECT tgname as trigger_name
FROM pg_trigger
WHERE tgrelid = 'reservations'::regclass
  AND NOT tgisinternal
ORDER BY tgname;