-- Migration: F&B Offline-First POS Sync Architecture
-- This migration adds tables and modifications to support offline-first POS operations
-- across all F&B outlets (Restaurant, Bar, Room Service, Banquet)
-- Phase 1.1: Offline-First POS Architecture

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sync Queue Table: Stores offline operations that need to be synced to server
CREATE TABLE IF NOT EXISTS fb_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL, -- Device/client identifier
  operation_type TEXT NOT NULL CHECK (operation_type IN ('order_create', 'order_update', 'order_void', 'payment', 'stock_transaction', 'wastage_log')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('order', 'payment', 'stock_transaction', 'wastage_log')),
  entity_id TEXT NOT NULL, -- Local entity ID
  payload JSONB NOT NULL, -- Full entity data for reconstruction
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'conflict', 'failed')),
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE,
  server_entity_id UUID, -- ID of entity created on server after sync
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync queue performance
CREATE INDEX idx_fb_sync_queue_client_status ON fb_sync_queue(client_id, sync_status);
CREATE INDEX idx_fb_sync_queue_operation_type ON fb_sync_queue(operation_type);
CREATE INDEX idx_fb_sync_queue_created_at ON fb_sync_queue(created_at DESC);
CREATE INDEX idx_fb_sync_queue_entity_id ON fb_sync_queue(entity_id);

-- Sync Conflicts Table: Stores conflicts that need manual resolution
CREATE TABLE IF NOT EXISTS fb_sync_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('duplicate_order', 'inventory_mismatch', 'payment_mismatch', 'entity_version_conflict')),
  local_operation_id UUID NOT NULL REFERENCES fb_sync_queue(id),
  local_payload JSONB NOT NULL,
  server_entity_id UUID,
  server_payload JSONB,
  resolution_strategy TEXT CHECK (resolution_strategy IN ('local_wins', 'server_wins', 'manual_merge', 'ignore')),
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conflict resolution
CREATE INDEX idx_fb_sync_conflicts_client_resolved ON fb_sync_conflicts(client_id, resolved_at);
CREATE INDEX idx_fb_sync_conflicts_type ON fb_sync_conflicts(conflict_type);
CREATE INDEX idx_fb_sync_conflicts_created_at ON fb_sync_conflicts(created_at DESC);

-- Offline Inventory Cache Table: Stores cached inventory for offline validation
CREATE TABLE IF NOT EXISTS fb_offline_inventory_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL, -- Changed to TEXT to match ingredients table
  cached_quantity NUMERIC(10, 3) NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_dirty BOOLEAN DEFAULT FALSE, -- Flag if local changes need sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, ingredient_id)
);

-- Indexes for inventory cache
CREATE INDEX idx_fb_offline_cache_client ON fb_offline_inventory_cache(client_id);
CREATE INDEX idx_fb_offline_cache_ingredient ON fb_offline_inventory_cache(ingredient_id);
CREATE INDEX idx_fb_offline_cache_dirty ON fb_offline_inventory_cache(is_dirty) WHERE is_dirty = TRUE;

-- Extend orders table with sync support
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'online' CHECK (sync_status IN ('online', 'offline_created', 'synced', 'conflict')),
ADD COLUMN IF NOT EXISTS offline_created_by TEXT, -- Client/device ID that created order offline
ADD COLUMN IF NOT EXISTS offline_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_queue_id UUID REFERENCES fb_sync_queue(id);

-- Extend stock_transactions table with sync support
ALTER TABLE stock_transactions
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'online' CHECK (sync_status IN ('online', 'offline_created', 'synced', 'conflict')),
ADD COLUMN IF NOT EXISTS offline_created_by TEXT,
ADD COLUMN IF NOT EXISTS offline_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_queue_id UUID REFERENCES fb_sync_queue(id);

-- Extend wastage_logs table with sync support
ALTER TABLE wastage_logs
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'online' CHECK (sync_status IN ('online', 'offline_created', 'synced', 'conflict')),
ADD COLUMN IF NOT EXISTS offline_created_by TEXT,
ADD COLUMN IF NOT EXISTS offline_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_queue_id UUID REFERENCES fb_sync_queue(id);

-- Create indexes for sync status lookups
CREATE INDEX IF NOT EXISTS idx_orders_sync_status ON orders(sync_status);
CREATE INDEX IF NOT EXISTS idx_orders_offline_created ON orders(offline_created_at DESC) WHERE sync_status IN ('offline_created', 'conflict');
CREATE INDEX IF NOT EXISTS idx_stock_transactions_sync_status ON stock_transactions(sync_status);
CREATE INDEX IF NOT EXISTS idx_wastage_logs_sync_status ON wastage_logs(sync_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fb_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_fb_sync_queue_updated_at
  BEFORE UPDATE ON fb_sync_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_sync_updated_at();

CREATE TRIGGER trigger_fb_sync_conflicts_updated_at
  BEFORE UPDATE ON fb_sync_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_sync_updated_at();

CREATE TRIGGER trigger_fb_offline_inventory_cache_updated_at
  BEFORE UPDATE ON fb_offline_inventory_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_sync_updated_at();

-- Function to sync offline order to server
CREATE OR REPLACE FUNCTION sync_offline_order(
  p_sync_queue_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  server_order_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_queue_record RECORD;
  v_order_data JSONB;
  v_new_order_id UUID;
  v_conflict_id UUID;
BEGIN
  -- Get sync queue record
  SELECT * INTO v_queue_record
  FROM fb_sync_queue
  WHERE id = p_sync_queue_id AND sync_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Sync queue record not found or not pending'::TEXT;
    RETURN;
  END IF;
  
  -- Update status to syncing
  UPDATE fb_sync_queue
  SET sync_status = 'syncing',
      sync_attempts = sync_attempts + 1,
      last_sync_attempt_at = NOW()
  WHERE id = p_sync_queue_id;
  
  -- Check for duplicate orders (same order ID from different clients)
  IF EXISTS (
    SELECT 1 FROM orders 
    WHERE id::TEXT = v_queue_record.entity_id 
    AND sync_status IN ('online', 'synced')
  ) THEN
    -- Create conflict record
    INSERT INTO fb_sync_conflicts (
      client_id,
      conflict_type,
      local_operation_id,
      local_payload,
      resolution_strategy
    ) VALUES (
      v_queue_record.client_id,
      'duplicate_order',
      v_queue_record.id,
      v_queue_record.payload,
      'manual_merge'
    ) RETURNING id INTO v_conflict_id;
    
    UPDATE fb_sync_queue
    SET sync_status = 'conflict',
        error_message = 'Duplicate order detected'
    WHERE id = p_sync_queue_id;
    
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Duplicate order conflict created'::TEXT;
    RETURN;
  END IF;
  
  -- Parse order data and create order
  v_order_data := v_queue_record.payload;
  
  BEGIN
    -- Insert order (simplified - actual implementation would handle all order lines)
    INSERT INTO orders (
      outlet_id,
      table_or_room_or_event_id,
      customer_type,
      server_id,
      status,
      subtotal,
      tax_amount,
      discount_amount,
      service_charge,
      total_amount,
      payment_method,
      meal_period,
      guest_name,
      sync_status,
      offline_created_by,
      offline_created_at
    )
    SELECT
      (v_order_data->>'outlet_id')::UUID,
      v_order_data->>'table_or_room_or_event_id',
      v_order_data->>'customer_type',
      v_order_data->>'server_id',
      v_order_data->>'status',
      (v_order_data->>'subtotal')::NUMERIC,
      (v_order_data->>'tax_amount')::NUMERIC,
      (v_order_data->>'discount_amount')::NUMERIC,
      (v_order_data->>'service_charge')::NUMERIC,
      (v_order_data->>'total_amount')::NUMERIC,
      v_order_data->>'payment_method',
      v_order_data->>'meal_period',
      v_order_data->>'guest_name',
      'synced',
      v_queue_record.client_id,
      v_queue_record.created_at
    RETURNING id INTO v_new_order_id;
    
    -- Update sync queue as successful
    UPDATE fb_sync_queue
    SET sync_status = 'synced',
        synced_at = NOW(),
        server_entity_id = v_new_order_id
    WHERE id = p_sync_queue_id;
    
    RETURN QUERY SELECT TRUE, v_new_order_id, NULL::TEXT;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error and mark as failed
    UPDATE fb_sync_queue
    SET sync_status = 'failed',
        error_message = SQLERRM
    WHERE id = p_sync_queue_id;
    
    RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM::TEXT;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending sync operations for a client
CREATE OR REPLACE FUNCTION get_pending_sync_operations(
  p_client_id TEXT
)
RETURNS TABLE(
  id UUID,
  operation_type TEXT,
  entity_type TEXT,
  entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    sq.operation_type,
    sq.entity_type,
    sq.entity_id,
    sq.payload,
    sq.created_at
  FROM fb_sync_queue sq
  WHERE sq.client_id = p_client_id
    AND sq.sync_status = 'pending'
  ORDER BY sq.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to cache inventory for offline use
CREATE OR REPLACE FUNCTION cache_inventory_for_client(
  p_client_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_cached_count INTEGER;
BEGIN
  -- Insert or update inventory cache for client
  INSERT INTO fb_offline_inventory_cache (client_id, ingredient_id, cached_quantity, last_sync_at)
  SELECT 
    p_client_id,
    i.id,
    COALESCE(
      -- Calculate current stock from transactions
      (
        SELECT COALESCE(SUM(
          CASE 
            WHEN st.transaction_type IN ('Receipt', 'StockCount') THEN st.quantity
            WHEN st.transaction_type IN ('Requisition', 'Transfer', 'WastageWriteoff', 'POSDepletion') THEN -st.quantity
            ELSE 0
          END
        ), 0)
        FROM stock_transactions st
        WHERE st.ingredient_id = i.id
      ),
      0
    ),
    NOW()
  FROM ingredients i
  WHERE i.is_active = TRUE
  ON CONFLICT (client_id, ingredient_id)
  DO UPDATE SET
    cached_quantity = EXCLUDED.cached_quantity,
    last_sync_at = NOW(),
    is_dirty = FALSE;
  
  GET DIAGNOSTICS v_cached_count = ROW_COUNT;
  RETURN v_cached_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark inventory cache as dirty after offline transaction
CREATE OR REPLACE FUNCTION mark_inventory_dirty(
  p_client_id TEXT,
  p_ingredient_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE fb_offline_inventory_cache
  SET is_dirty = TRUE,
      version = version + 1
  WHERE client_id = p_client_id
    AND ingredient_id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your RBAC system)
GRANT SELECT, INSERT, UPDATE ON fb_sync_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON fb_sync_conflicts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON fb_offline_inventory_cache TO authenticated;
GRANT EXECUTE ON FUNCTION sync_offline_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_sync_operations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cache_inventory_for_client(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_inventory_dirty(TEXT, UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE fb_sync_queue IS 'Queue for offline POS operations awaiting sync to server';
COMMENT ON TABLE fb_sync_conflicts IS 'Conflicts detected during sync that require manual resolution';
COMMENT ON TABLE fb_offline_inventory_cache IS 'Cached inventory levels for offline validation';
COMMENT ON FUNCTION sync_offline_order(UUID) IS 'Syncs a single offline order to the server';
COMMENT ON FUNCTION get_pending_sync_operations(TEXT) IS 'Retrieves all pending sync operations for a client';
COMMENT ON FUNCTION cache_inventory_for_client(TEXT) IS 'Caches current inventory levels for offline use';
COMMENT ON FUNCTION mark_inventory_dirty(TEXT, UUID) IS 'Marks inventory cache as dirty after offline modification';
