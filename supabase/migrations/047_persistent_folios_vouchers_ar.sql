-- ============================================================
-- P4: Extend existing folios + create vouchers & AR ledger
-- folios/folio_lines/folio_payments already exist with
-- different column names — we ALTER to add missing B2B columns
-- then CREATE vouchers and ar_ledger from scratch.
-- ============================================================

-- 1. Extend folios: add owner/operator columns for master folio support
ALTER TABLE folios
  ADD COLUMN IF NOT EXISTS owner_type   text,
  ADD COLUMN IF NOT EXISTS owner_id     text,
  ADD COLUMN IF NOT EXISTS operator_id  uuid REFERENCES tour_operators(id),
  ADD COLUMN IF NOT EXISTS group_id     text,
  ADD COLUMN IF NOT EXISTS credit_limit numeric(14,2) DEFAULT 0;

-- Back-fill existing rows: reservation-level folios are guest-owned
UPDATE folios
SET owner_type = 'guest',
    owner_id   = reservation_id
WHERE owner_type IS NULL;

-- 2. Extend folio_lines: add reservation link
ALTER TABLE folio_lines
  ADD COLUMN IF NOT EXISTS reservation_id text;

-- 3. Extend folio_payments: add reservation link + notes
ALTER TABLE folio_payments
  ADD COLUMN IF NOT EXISTS reservation_id text,
  ADD COLUMN IF NOT EXISTS notes          text;

-- 4. Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no     text NOT NULL UNIQUE,
  operator_id    uuid NOT NULL REFERENCES tour_operators(id),
  group_id       text,
  reservation_id text,
  issued_at      timestamptz DEFAULT now(),
  valid_from     date NOT NULL,
  valid_to       date NOT NULL,
  room_type_id   text REFERENCES room_types(id),
  nights         integer,
  board_basis    text DEFAULT 'RO',
  pax_count      integer DEFAULT 1,
  net_value      numeric(12,2),
  status         text NOT NULL DEFAULT 'issued'
                 CHECK (status IN ('issued','redeemed','void','expired')),
  redeemed_at    timestamptz,
  redeemed_by    text,
  void_reason    text,
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vouchers_operator_status_idx ON vouchers (operator_id, status);

-- 5. Redeem voucher atomically (prevents double-redemption)
CREATE OR REPLACE FUNCTION redeem_voucher(
  p_voucher_no     text,
  p_reservation_id text,
  p_redeemed_by    text
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
BEGIN
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE voucher_no = p_voucher_no
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VOUCHER_NOT_FOUND: %', p_voucher_no;
  END IF;
  IF v_voucher.status != 'issued' THEN
    RAISE EXCEPTION 'VOUCHER_INVALID_STATUS: voucher % is already %',
      p_voucher_no, v_voucher.status;
  END IF;
  IF v_voucher.valid_to < CURRENT_DATE THEN
    UPDATE vouchers SET status = 'expired', updated_at = now()
    WHERE id = v_voucher.id;
    RAISE EXCEPTION 'VOUCHER_EXPIRED: voucher % expired on %',
      p_voucher_no, v_voucher.valid_to;
  END IF;

  UPDATE vouchers
  SET status         = 'redeemed',
      redeemed_at    = now(),
      redeemed_by    = p_redeemed_by,
      reservation_id = p_reservation_id,
      updated_at     = now()
  WHERE id = v_voucher.id;

  RETURN jsonb_build_object(
    'success',     TRUE,
    'voucher_id',  v_voucher.id,
    'voucher_no',  v_voucher.voucher_no,
    'net_value',   v_voucher.net_value,
    'board_basis', v_voucher.board_basis,
    'operator_id', v_voucher.operator_id
  );
END;
$$;

-- 6. Accounts Receivable Ledger
CREATE TABLE IF NOT EXISTS ar_ledger (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id    uuid NOT NULL REFERENCES tour_operators(id),
  folio_id       text REFERENCES folios(id),
  voucher_id     uuid REFERENCES vouchers(id),
  entry_type     text NOT NULL
                 CHECK (entry_type IN ('invoice','payment','credit_note','adjustment')),
  description    text NOT NULL,
  debit_amount   numeric(14,2) DEFAULT 0,
  credit_amount  numeric(14,2) DEFAULT 0,
  balance_after  numeric(14,2),
  due_date       date,
  is_reconciled  boolean DEFAULT FALSE,
  reconciled_at  timestamptz,
  reference_no   text,
  posting_date   date NOT NULL DEFAULT CURRENT_DATE,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ar_ledger_operator_idx  ON ar_ledger (operator_id, is_reconciled);
CREATE INDEX IF NOT EXISTS ar_ledger_due_date_idx  ON ar_ledger (due_date) WHERE NOT is_reconciled;

-- 7. Post master folio balance to A/R on group checkout
CREATE OR REPLACE FUNCTION post_folio_to_ar(
  p_folio_id text,
  p_due_date date
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_folio     folios%ROWTYPE;
  v_charges   numeric;
  v_payments  numeric;
  v_balance   numeric;
  v_ar_id     uuid;
BEGIN
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Folio % not found', p_folio_id;
  END IF;
  IF v_folio.operator_id IS NULL THEN
    RAISE EXCEPTION 'Folio % has no operator — cannot post to A/R', p_folio_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_charges
  FROM folio_lines WHERE folio_id = p_folio_id AND NOT is_voided;

  SELECT COALESCE(SUM(amount), 0) INTO v_payments
  FROM folio_payments WHERE folio_id = p_folio_id AND NOT is_voided;

  v_balance := v_charges - v_payments;

  INSERT INTO ar_ledger (
    operator_id, folio_id, entry_type, description,
    debit_amount, credit_amount, balance_after, due_date,
    reference_no, posting_date
  ) VALUES (
    v_folio.operator_id,
    p_folio_id,
    'invoice',
    'Group checkout — master folio balance due',
    v_balance, 0, v_balance, p_due_date,
    'FOLIO-' || p_folio_id,
    CURRENT_DATE
  ) RETURNING id INTO v_ar_id;

  UPDATE folios
  SET status = 'closed', closed_at = now(), updated_at = now()
  WHERE id = p_folio_id;

  RETURN v_ar_id;
END;
$$;

-- 8. RLS
ALTER TABLE vouchers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_vouchers" ON vouchers;
DROP POLICY IF EXISTS "staff_ar_ledger" ON ar_ledger;

CREATE POLICY "staff_vouchers"
  ON vouchers  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "staff_ar_ledger"
  ON ar_ledger FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

GRANT EXECUTE ON FUNCTION redeem_voucher   TO authenticated;
GRANT EXECUTE ON FUNCTION post_folio_to_ar TO authenticated;
