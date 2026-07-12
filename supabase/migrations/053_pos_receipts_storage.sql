/*
  Add receipt_url column to all POS sales tables for storing payment receipt screenshots
  Uses the same payment-receipts storage bucket created in migration 052
*/

-- Gift Shop POS
alter table gift_shop_sales
add column if not exists receipt_url text;

-- Bar POS
alter table bar_sales
add column if not exists receipt_url text;

-- Restaurant POS
alter table restaurant_sales
add column if not exists receipt_url text;

-- Room Service
alter table room_service_orders
add column if not exists receipt_url text;
