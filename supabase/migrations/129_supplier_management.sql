-- Migration: Supplier Management & Procurement System
-- This migration adds tables and functions for supplier management and purchase orders
-- Phase 2.1: Supplier Management & Procurement

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers table: Master database for all suppliers
CREATE TABLE IF NOT EXISTS fb_suppliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  supplier_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Ethiopia',
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30, -- days
  rating NUMERIC(2, 1) DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT TRUE,
  edi_enabled BOOLEAN DEFAULT FALSE,
  edi_endpoint TEXT,
  edi_api_key TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Supplier contacts table: Multiple contacts per supplier
CREATE TABLE IF NOT EXISTS fb_supplier_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier categories table: For grouping suppliers
CREATE TABLE IF NOT EXISTS fb_supplier_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier category assignments
CREATE TABLE IF NOT EXISTS fb_supplier_category_assignments (
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES fb_supplier_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (supplier_id, category_id)
);

-- Purchase Orders table: Main PO management
CREATE TABLE IF NOT EXISTS fb_purchase_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  po_number TEXT NOT NULL UNIQUE,
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE RESTRICT,
  outlet_id TEXT, -- Reference to outlets table
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'partial', 'received', 'closed', 'cancelled')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  shipping_cost NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'ETB',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  internal_notes TEXT,
  submitted_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Lines table: Individual items in PO
CREATE TABLE IF NOT EXISTS fb_purchase_order_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  po_id TEXT NOT NULL REFERENCES fb_purchase_orders(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL, -- Reference to ingredients table
  description TEXT,
  quantity_ordered NUMERIC(10, 3) NOT NULL,
  quantity_received NUMERIC(10, 3) DEFAULT 0,
  unit_of_measure TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  line_total NUMERIC(12, 2) NOT NULL,
  expected_date TIMESTAMP WITH TIME ZONE,
  received_date TIMESTAMP WITH TIME ZONE,
  quality_status TEXT DEFAULT 'pending' CHECK (quality_status IN ('pending', 'approved', 'rejected', 'partial')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods Receipt table: Recording of received goods
CREATE TABLE IF NOT EXISTS fb_goods_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  receipt_number TEXT NOT NULL UNIQUE,
  po_id TEXT NOT NULL REFERENCES fb_purchase_orders(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE RESTRICT,
  outlet_id TEXT,
  received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_by TEXT NOT NULL,
  delivery_note_number TEXT,
  delivery_note_date DATE,
  total_items_received INTEGER DEFAULT 0,
  total_quantity_received NUMERIC(10, 3) DEFAULT 0,
  total_quantity_rejected NUMERIC(10, 3) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods Receipt Lines table: Line items for each receipt
CREATE TABLE IF NOT EXISTS fb_goods_receipt_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  receipt_id TEXT NOT NULL REFERENCES fb_goods_receipts(id) ON DELETE CASCADE,
  po_line_id TEXT NOT NULL REFERENCES fb_purchase_order_lines(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  quantity_received NUMERIC(10, 3) NOT NULL,
  quantity_rejected NUMERIC(10, 3) DEFAULT 0,
  unit_of_measure TEXT NOT NULL,
  batch_number TEXT,
  expiry_date DATE,
  unit_cost NUMERIC(10, 2),
  quality_status TEXT DEFAULT 'approved' CHECK (quality_status IN ('approved', 'rejected', 'partial')),
  rejection_reason TEXT,
  storage_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Invoices table: For three-way matching
CREATE TABLE IF NOT EXISTS fb_supplier_invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  invoice_number TEXT NOT NULL,
  po_id TEXT REFERENCES fb_purchase_orders(id) ON DELETE SET NULL,
  receipt_id TEXT REFERENCES fb_goods_receipts(id) ON DELETE SET NULL,
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  invoice_amount NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'disputed', 'partial', 'paid')),
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Performance table: Tracking supplier metrics
CREATE TABLE IF NOT EXISTS fb_supplier_performance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  supplier_id TEXT NOT NULL REFERENCES fb_suppliers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  on_time_deliveries INTEGER DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  on_time_delivery_rate NUMERIC(5, 2) DEFAULT 0,
  quality_score NUMERIC(5, 2) DEFAULT 0,
  order_accuracy_score NUMERIC(5, 2) DEFAULT 0,
  average_lead_time INTEGER, -- in days
  total_spend NUMERIC(12, 2) DEFAULT 0,
  returns_count INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(supplier_id, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX idx_fb_suppliers_code ON fb_suppliers(supplier_code);
CREATE INDEX idx_fb_suppliers_active ON fb_suppliers(is_active);
CREATE INDEX idx_fb_suppliers_rating ON fb_suppliers(rating);

CREATE INDEX idx_fb_purchase_orders_supplier ON fb_purchase_orders(supplier_id);
CREATE INDEX idx_fb_purchase_orders_status ON fb_purchase_orders(status);
CREATE INDEX idx_fb_purchase_orders_date ON fb_purchase_orders(order_date);
CREATE INDEX idx_fb_purchase_orders_delivery ON fb_purchase_orders(expected_delivery_date);

CREATE INDEX idx_fb_purchase_order_lines_po ON fb_purchase_order_lines(po_id);
CREATE INDEX idx_fb_purchase_order_lines_ingredient ON fb_purchase_order_lines(ingredient_id);

CREATE INDEX idx_fb_goods_receipts_po ON fb_goods_receipts(po_id);
CREATE INDEX idx_fb_goods_receipts_supplier ON fb_goods_receipts(supplier_id);
CREATE INDEX idx_fb_goods_receipts_date ON fb_goods_receipts(received_date);

CREATE INDEX idx_fb_supplier_invoices_po ON fb_supplier_invoices(po_id);
CREATE INDEX idx_fb_supplier_invoices_supplier ON fb_supplier_invoices(supplier_id);
CREATE INDEX idx_fb_supplier_invoices_status ON fb_supplier_invoices(status);
CREATE INDEX idx_fb_supplier_invoices_due ON fb_supplier_invoices(due_date);

CREATE INDEX idx_fb_supplier_performance_supplier ON fb_supplier_performance(supplier_id);
CREATE INDEX idx_fb_supplier_performance_period ON fb_supplier_performance(period_start, period_end);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_supplier_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_fb_suppliers_updated_at
  BEFORE UPDATE ON fb_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_timestamp();

CREATE TRIGGER trigger_fb_purchase_orders_updated_at
  BEFORE UPDATE ON fb_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_timestamp();

CREATE TRIGGER trigger_fb_supplier_invoices_updated_at
  BEFORE UPDATE ON fb_supplier_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_timestamp();

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  v_date_prefix TEXT;
  v_sequence INTEGER;
  v_po_number TEXT;
BEGIN
  v_date_prefix := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 8) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM fb_purchase_orders
  WHERE po_number LIKE 'PO-' || v_date_prefix || '%';
  
  v_po_number := 'PO-' || v_date_prefix || LPAD(v_sequence::TEXT, 4, '0');
  RETURN v_po_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  v_date_prefix TEXT;
  v_sequence INTEGER;
  v_receipt_number TEXT;
BEGIN
  v_date_prefix := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 9) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM fb_goods_receipts
  WHERE receipt_number LIKE 'GR-' || v_date_prefix || '%';
  
  v_receipt_number := 'GR-' || v_date_prefix || LPAD(v_sequence::TEXT, 4, '0');
  RETURN v_receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate PO total
CREATE OR REPLACE FUNCTION calculate_po_total(p_po_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(line_total), 0)
  INTO v_total
  FROM fb_purchase_order_lines
  WHERE po_id = p_po_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Function to update PO status based on receipts
CREATE OR REPLACE FUNCTION update_po_status_from_receipt(p_po_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_total_ordered NUMERIC;
  v_total_received NUMERIC;
  v_status TEXT;
BEGIN
  SELECT COALESCE(SUM(quantity_ordered), 0), COALESCE(SUM(quantity_received), 0)
  INTO v_total_ordered, v_total_received
  FROM fb_purchase_order_lines
  WHERE po_id = p_po_id;
  
  IF v_total_ordered = 0 THEN
    v_status := 'draft';
  ELSIF v_total_received = 0 THEN
    v_status := 'submitted';
  ELSIF v_total_received >= v_total_ordered THEN
    v_status := 'received';
  ELSE
    v_status := 'partial';
  END IF;
  
  UPDATE fb_purchase_orders
  SET status = v_status
  WHERE id = p_po_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate supplier performance
CREATE OR REPLACE FUNCTION calculate_supplier_performance(p_supplier_id TEXT, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
  v_total_orders INTEGER;
  v_on_time INTEGER;
  v_late INTEGER;
  v_on_time_rate NUMERIC;
  v_quality_score NUMERIC;
  v_order_accuracy NUMERIC;
  v_avg_lead_time INTEGER;
  v_total_spend NUMERIC;
  v_returns INTEGER;
  v_complaints INTEGER;
BEGIN
  -- Get order statistics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE actual_delivery_date <= expected_delivery_date),
    COUNT(*) FILTER (WHERE actual_delivery_date > expected_delivery_date),
    COALESCE(AVG(actual_delivery_date - order_date), 0),
    COALESCE(SUM(total_amount), 0)
  INTO v_total_orders, v_on_time, v_late, v_avg_lead_time, v_total_spend
  FROM fb_purchase_orders
  WHERE supplier_id = p_supplier_id
    AND order_date >= p_period_start
    AND order_date <= p_period_end
    AND status IN ('received', 'closed');
  
  -- Calculate on-time delivery rate
  IF v_total_orders > 0 THEN
    v_on_time_rate := (v_on_time::NUMERIC / v_total_orders::NUMERIC) * 100;
  ELSE
    v_on_time_rate := 0;
  END IF;
  
  -- Get quality score from receipts
  SELECT 
    COALESCE(AVG(CASE WHEN quality_status = 'approved' THEN 100 
                      WHEN quality_status = 'partial' THEN 50 
                      ELSE 0 END), 0)
  INTO v_quality_score
  FROM fb_goods_receipts
  WHERE supplier_id = p_supplier_id
    AND received_date >= p_period_start
    AND received_date <= p_period_end;
  
  -- Calculate order accuracy (assuming 100% for now)
  v_order_accuracy := 95.0;
  
  -- Get returns and complaints
  SELECT 
    COUNT(*) FILTER (WHERE quantity_rejected > 0),
    COUNT(*)
  INTO v_returns, v_complaints
  FROM fb_goods_receipt_lines
  WHERE receipt_id IN (
    SELECT id FROM fb_goods_receipts 
    WHERE supplier_id = p_supplier_id
      AND received_date >= p_period_start
      AND received_date <= p_period_end
  );
  
  -- Insert or update performance record
  INSERT INTO fb_supplier_performance (
    supplier_id,
    period_start,
    period_end,
    total_orders,
    on_time_deliveries,
    late_deliveries,
    on_time_delivery_rate,
    quality_score,
    order_accuracy_score,
    average_lead_time,
    total_spend,
    returns_count,
    complaints_count
  ) VALUES (
    p_supplier_id,
    p_period_start,
    p_period_end,
    v_total_orders,
    v_on_time,
    v_late,
    v_on_time_rate,
    v_quality_score,
    v_order_accuracy,
    v_avg_lead_time,
    v_total_spend,
    v_returns,
    v_complaints
  )
  ON CONFLICT (supplier_id, period_start, period_end)
  DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    on_time_deliveries = EXCLUDED.on_time_deliveries,
    late_deliveries = EXCLUDED.late_deliveries,
    on_time_delivery_rate = EXCLUDED.on_time_delivery_rate,
    quality_score = EXCLUDED.quality_score,
    order_accuracy_score = EXCLUDED.order_accuracy_score,
    average_lead_time = EXCLUDED.average_lead_time,
    total_spend = EXCLUDED.total_spend,
    returns_count = EXCLUDED.returns_count,
    complaints_count = EXCLUDED.complaints_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_supplier_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_supplier_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_supplier_category_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_purchase_order_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_goods_receipts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_goods_receipt_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_supplier_invoices TO authenticated;
GRANT SELECT, INSERT ON fb_supplier_performance TO authenticated;

GRANT EXECUTE ON FUNCTION generate_po_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_receipt_number() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_po_total(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_po_status_from_receipt(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_supplier_performance(TEXT, DATE, DATE) TO authenticated;
