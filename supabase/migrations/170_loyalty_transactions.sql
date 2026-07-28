-- Loyalty Transactions Ledger
-- Tracks every loyalty point accrual and redemption with full audit trail

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,
  reservation_id TEXT,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('accrual', 'redemption', 'adjustment', 'expiry')),
  points INT NOT NULL,                    -- positive for accrual, negative for redemption/expiry
  balance_after INT NOT NULL DEFAULT 0,   -- running balance snapshot

  description TEXT,
  reference_type TEXT,                    -- 'checkout', 'manual', 'redemption_order', 'expiry_job'
  reference_id TEXT,

  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_guest ON loyalty_transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_reservation ON loyalty_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_created ON loyalty_transactions(created_at DESC);

-- RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_read_authenticated" ON loyalty_transactions;
CREATE POLICY "loyalty_read_authenticated" ON loyalty_transactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "loyalty_admin_write" ON loyalty_transactions;
CREATE POLICY "loyalty_admin_write" ON loyalty_transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_transactions TO authenticated;

-- Function to accrue loyalty points atomically
-- Updates guest.loyalty_points and inserts a ledger row in one transaction
CREATE OR REPLACE FUNCTION accrue_loyalty_points(
  p_guest_id TEXT,
  p_points INT,
  p_reservation_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT 'checkout',
  p_reference_id TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
) RETURNS TABLE (new_balance INT) AS $$
DECLARE
  v_current_balance INT := 0;
  v_new_balance INT := 0;
BEGIN
  -- Get current balance from guests table
  SELECT COALESCE(loyalty_points, 0) INTO v_current_balance
  FROM guests
  WHERE id = p_guest_id;

  v_new_balance := v_current_balance + p_points;

  -- Update guest balance
  UPDATE guests SET loyalty_points = v_new_balance WHERE id = p_guest_id;

  -- Insert ledger entry
  INSERT INTO loyalty_transactions (
    guest_id, reservation_id, transaction_type, points, balance_after,
    description, reference_type, reference_id, created_by
  ) VALUES (
    p_guest_id, p_reservation_id, 'accrual', p_points, v_new_balance,
    p_description, p_reference_type, p_reference_id, p_created_by
  );

  new_balance := v_new_balance;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION accrue_loyalty_points TO authenticated;

-- Function to redeem loyalty points atomically
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_guest_id TEXT,
  p_points INT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
) RETURNS TABLE (new_balance INT, success BOOLEAN) AS $$
DECLARE
  v_current_balance INT := 0;
  v_new_balance INT := 0;
BEGIN
  SELECT COALESCE(loyalty_points, 0) INTO v_current_balance
  FROM guests
  WHERE id = p_guest_id;

  IF v_current_balance < p_points THEN
    success := false;
    new_balance := v_current_balance;
    RETURN NEXT;
    RETURN;
  END IF;

  v_new_balance := v_current_balance - p_points;

  UPDATE guests SET loyalty_points = v_new_balance WHERE id = p_guest_id;

  INSERT INTO loyalty_transactions (
    guest_id, transaction_type, points, balance_after,
    description, reference_type, reference_id, created_by
  ) VALUES (
    p_guest_id, 'redemption', -p_points, v_new_balance,
    p_description, 'redemption_order', p_reference_id, p_created_by
  );

  success := true;
  new_balance := v_new_balance;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION redeem_loyalty_points TO authenticated;
