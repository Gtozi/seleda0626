-- Migration 072: Auto-generate invoice when folio is closed
-- This ensures that when a folio is closed (during checkout), an invoice is automatically created
-- and all payments are linked to that invoice

-- 1. Create function to close folio and auto-generate invoice
CREATE OR REPLACE FUNCTION close_folio_with_invoice(p_folio_id text, p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio folios%ROWTYPE;
  v_reservation reservations%ROWTYPE;
  v_folio_totals jsonb;
  v_invoice_id text;
  v_invoice_number text;
  v_charges numeric;
  v_payments numeric;
  v_balance numeric;
  v_payments_linked integer;
BEGIN
  -- Get folio details
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio not found');
  END IF;

  -- Check if folio is already closed
  IF v_folio.status = 'Closed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio is already closed');
  END IF;

  -- Get reservation details
  SELECT * INTO v_reservation FROM reservations WHERE id = v_folio.reservation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found for this folio');
  END IF;

  -- Recompute folio totals
  SELECT recompute_folio_totals(p_folio_id) INTO v_folio_totals;
  
  -- Calculate totals
  v_charges := COALESCE(v_folio_totals->>'total_charges', '0')::numeric;
  v_payments := COALESCE(v_folio_totals->>'total_payments', '0')::numeric;
  v_balance := COALESCE(v_folio_totals->>'folio_balance', '0')::numeric;

  -- Generate invoice number
  v_invoice_number := 'INV-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));

  -- Create invoice document
  INSERT INTO invoice_documents (
    id, folio_id, invoice_number, invoice_type, issue_date, due_date,
    subtotal, tax_total, discount_total, total, amount_paid, status,
    customer_name, customer_email, customer_address, customer_tin, customer_vat_no,
    hotel_tin, hotel_vat_no, hotel_vat_date, payment_terms, notes,
    is_voided, created_by
  ) VALUES (
    gen_random_uuid()::text,
    p_folio_id,
    v_invoice_number,
    'Guest',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    v_charges,
    0, -- TODO: Calculate from folio lines
    0, -- TODO: Calculate from folio lines
    v_charges,
    v_payments,
    CASE WHEN v_balance <= 0 THEN 'Paid' ELSE 'Issued' END,
    v_reservation.guest_name,
    v_reservation.guest_email,
    NULL,
    v_reservation.guest_tin,
    v_reservation.guest_vat_no,
    NULL, -- TODO: Get from global settings
    NULL, -- TODO: Get from global settings
    NULL, -- TODO: Get from global settings
    'Net 30',
    'Auto-generated on folio close',
    false,
    p_user_id
  ) RETURNING id INTO v_invoice_id;

  -- Link all non-voided payments to the invoice
  UPDATE folio_payments
  SET invoice_id = v_invoice_id
  WHERE folio_id = p_folio_id
    AND is_voided = false
    AND invoice_id IS NULL;

  GET DIAGNOSTICS v_payments_linked = ROW_COUNT;

  -- Close the folio
  UPDATE folios
  SET status = 'Closed',
      closed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_folio_id;

  -- Sync reservation payment status
  PERFORM sync_reservation_payment_status(p_folio_id);

  RETURN jsonb_build_object(
    'success', true,
    'folio_id', p_folio_id,
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'invoice_status', CASE WHEN v_balance <= 0 THEN 'Paid' ELSE 'Issued' END,
    'payments_linked', v_payments_linked,
    'total_charges', v_charges,
    'total_payments', v_payments,
    'balance', v_balance
  );
END;
$$;

-- 2. Create function to close folio without invoice (for cases where invoice already exists)
CREATE OR REPLACE FUNCTION close_folio_only(p_folio_id text, p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio folios%ROWTYPE;
BEGIN
  -- Get folio details
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio not found');
  END IF;

  -- Check if folio is already closed
  IF v_folio.status = 'Closed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio is already closed');
  END IF;

  -- Close the folio
  UPDATE folios
  SET status = 'Closed',
      closed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_folio_id;

  -- Sync reservation payment status
  PERFORM sync_reservation_payment_status(p_folio_id);

  RETURN jsonb_build_object(
    'success', true,
    'folio_id', p_folio_id,
    'message', 'Folio closed without generating new invoice'
  );
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION close_folio_with_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION close_folio_only TO authenticated;
