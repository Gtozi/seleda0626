-- ============================================================
-- Food & Beverage - Core Data Model
-- ============================================================

-- Drop existing tables for clean schema (development)
DROP TABLE IF EXISTS stock_counts CASCADE;
DROP TABLE IF EXISTS stock_count_lines CASCADE;
DROP TABLE IF EXISTS wastage_logs CASCADE;
DROP TABLE IF EXISTS banquet_events CASCADE;
DROP TABLE IF EXISTS order_lines CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS requisitions CASCADE;
DROP TABLE IF EXISTS requisition_lines CASCADE;
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS stock_locations CASCADE;
DROP TABLE IF EXISTS recipe_lines CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-- Outlets (Restaurant, Bar, Room Service, Banquet, Minibar)
CREATE TABLE outlets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Restaurant', 'Bar', 'RoomService', 'Banquet', 'Minibar')),
  operating_hours jsonb, -- Store opening/closing times per day
  revenue_center_code text, -- GL link to Finance module
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_outlets_type ON outlets(type);
CREATE INDEX idx_outlets_active ON outlets(is_active);

-- Ingredients (Inventory Items) - Create this first since other tables reference it
CREATE TABLE ingredients (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Food', 'Beverage', 'Spice', 'Cleaning', 'Disposable', 'Equipment', 'Tableware')),
  unit_of_measure text NOT NULL,
  par_level numeric(10,3) NOT NULL DEFAULT 0,
  reorder_point numeric(10,3) NOT NULL DEFAULT 0,
  current_cost numeric(18,2) NOT NULL DEFAULT 0, -- Weighted average cost
  suppliers text[], -- Array of supplier names
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_active ON ingredients(is_active);

-- Menu Items
CREATE TABLE menu_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  selling_price numeric(18,2) NOT NULL DEFAULT 0,
  tax_code text,
  is_active boolean NOT NULL DEFAULT true,
  pos_button_group text, -- For POS UI organization
  meal_periods text[] CHECK (array_length(meal_periods, 1) > 0), -- Breakfast, Lunch, Dinner, etc.
  is_fixed_menu boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_menu_items_outlet ON menu_items(outlet_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- Recipes (for menu items)
CREATE TABLE recipes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  menu_item_id text NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  yield numeric(5,2) NOT NULL DEFAULT 1.00, -- Yield percentage (e.g., 0.95 for 5% loss)
  portions int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (menu_item_id)
);

CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);

-- Recipe Lines (ingredients for recipes) - Now ingredients table exists
CREATE TABLE recipe_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  cost_at_time_of_costing numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_recipe_lines_recipe ON recipe_lines(recipe_id);
CREATE INDEX idx_recipe_lines_ingredient ON recipe_lines(ingredient_id);

-- Stock Locations (Stores, Cellars, Outlets)
CREATE TABLE stock_locations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('MainStore', 'OutletStore', 'Cellar', 'Minibar')),
  outlet_id text REFERENCES outlets(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_locations_type ON stock_locations(type);
CREATE INDEX idx_stock_locations_outlet ON stock_locations(outlet_id);
CREATE INDEX idx_stock_locations_active ON stock_locations(is_active);

-- Stock Transactions (Receipt, Requisition, Transfer, Wastage, Stock Count)
CREATE TABLE stock_transactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('Receipt', 'Requisition', 'Transfer', 'WastageWriteoff', 'StockCount', 'POSDepletion')),
  quantity numeric(10,3) NOT NULL, -- Positive for receipts, negative for depletion
  unit text NOT NULL,
  cost_per_unit numeric(18,2) NOT NULL DEFAULT 0,
  total_value numeric(18,2) NOT NULL DEFAULT 0,
  date timestamptz NOT NULL DEFAULT now(),
  reference_doc text, -- Order ID, Requisition ID, etc.
  reference_type text, -- 'order', 'requisition', 'wastage_log', etc.
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_transactions_ingredient ON stock_transactions(ingredient_id);
CREATE INDEX idx_stock_transactions_location ON stock_transactions(location_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX idx_stock_transactions_date ON stock_transactions(date);

-- Requisitions
CREATE TABLE requisitions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  to_outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Fulfilled', 'Rejected')),
  requested_by text NOT NULL,
  approved_by text,
  fulfilled_by text,
  approved_at timestamptz,
  fulfilled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_requisitions_status ON requisitions(status);
CREATE INDEX idx_requisitions_from_location ON requisitions(from_location_id);
CREATE INDEX idx_requisitions_to_outlet ON requisitions(to_outlet_id);

-- Requisition Lines
CREATE TABLE requisition_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requisition_id text NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_requested numeric(10,3) NOT NULL,
  quantity_fulfilled numeric(10,3) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_requisition_lines_requisition ON requisition_lines(requisition_id);
CREATE INDEX idx_requisition_lines_ingredient ON requisition_lines(ingredient_id);

-- Orders (POS tickets / BEO)
CREATE TABLE orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  table_or_room_or_event_id text, -- Table number, room number, or event ID
  customer_type text NOT NULL CHECK (customer_type IN ('In-House Guest', 'Walk-In Guest', 'Corporate Client', 'Conference Group', 'Tour Group')),
  server_id text,
  guest_folio_id text, -- For room charge routing to PMS
  reservation_id text, -- For guest meal plans
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Sent', 'Served', 'Paid', 'Void', 'Cancelled')),
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  discount_amount numeric(18,2) NOT NULL DEFAULT 0,
  service_charge numeric(18,2) NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  payment_method text CHECK (payment_method IN ('Cash', 'Card', 'RoomCharge', 'CorporateAccount', 'Complimentary')),
  is_complimentary boolean NOT NULL DEFAULT false,
  comp_reason text,
  void_reason text,
  voided_by text,
  voided_at timestamptz,
  meal_period text CHECK (meal_period IN ('Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Tea Time', 'Morning Snack', 'Afternoon Snack')),
  guest_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_outlet ON orders(outlet_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_guest_folio ON orders(guest_folio_id);
CREATE INDEX idx_orders_date ON orders(created_at);

-- Order Lines
CREATE TABLE order_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(18,2) NOT NULL,
  discount_amount numeric(18,2) NOT NULL DEFAULT 0,
  line_total numeric(18,2) NOT NULL,
  void_reason text,
  comp_reason text,
  is_voided boolean NOT NULL DEFAULT false,
  is_comped boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_lines_order ON order_lines(order_id);
CREATE INDEX idx_order_lines_menu_item ON order_lines(menu_item_id);

-- Banquet Events (BEO)
CREATE TABLE banquet_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_name text NOT NULL,
  event_date date NOT NULL,
  client_name text NOT NULL,
  guest_count int NOT NULL,
  menu_package text,
  room_setup text,
  payment_terms text,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'InProgress', 'Completed', 'Cancelled')),
  estimated_revenue numeric(18,2) NOT NULL DEFAULT 0,
  actual_revenue numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_banquet_events_date ON banquet_events(event_date);
CREATE INDEX idx_banquet_events_status ON banquet_events(status);

-- Wastage Logs
CREATE TABLE wastage_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('Spoilage', 'Breakage', 'Overproduction', 'QualityReject', 'Theft', 'Other')),
  cost_value numeric(18,2) NOT NULL DEFAULT 0,
  logged_by text NOT NULL,
  approved_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wastage_logs_ingredient ON wastage_logs(ingredient_id);
CREATE INDEX idx_wastage_logs_location ON wastage_logs(location_id);
CREATE INDEX idx_wastage_logs_date ON wastage_logs(created_at);

-- Stock Counts (Physical Inventory)
CREATE TABLE stock_counts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  count_date date NOT NULL,
  counted_by text NOT NULL,
  approved_by text,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_counts_location ON stock_counts(location_id);
CREATE INDEX idx_stock_counts_date ON stock_counts(count_date);
CREATE INDEX idx_stock_counts_status ON stock_counts(status);

-- Stock Count Lines
CREATE TABLE stock_count_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stock_count_id text NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  expected_quantity numeric(10,3) NOT NULL,
  counted_quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  variance_quantity numeric(10,3) NOT NULL,
  variance_value numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_count_lines_count ON stock_count_lines(stock_count_id);
CREATE INDEX idx_stock_count_lines_ingredient ON stock_count_lines(ingredient_id);
