-- ======================================================================================
-- Migration 003: Gift Shop POS Tables & Invoice Sequence
-- ======================================================================================

-- Add retail_price to inventory items for decoupled retail pricing
alter table inventory_items
  add column if not exists retail_price numeric not null default 0.00;

-- Invoice number sequence for Gift Shop (guarantees uniqueness)
create sequence if not exists gift_shop_invoice_seq
  start with 100001
  increment by 1
  no cycle;

-- Helper to atomically generate the next invoice number
create or replace function next_gift_shop_invoice()
returns text
language plpgsql
security definer
as $$
begin
  return 'INV-GS-' || lpad(nextval('gift_shop_invoice_seq')::text, 6, '0');
end;
$$;

-- Gift Shop Sales (POS transactions)
create table if not exists gift_shop_sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  date timestamp with time zone not null default now(),
  cashier text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0.00,
  tax numeric not null default 0.00,
  total numeric not null default 0.00,
  discount_percent numeric not null default 0,
  discount_amount numeric not null default 0.00,
  payment_method text not null default 'Cash',
  split_payments jsonb default null,
  client_name text,
  client_tin text,
  client_vat_no text,
  client_vat_date text,
  room_charge_details jsonb default null,
  change_given numeric not null default 0.00,
  status text not null default 'Completed' check (status in ('Completed', 'Voided')),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_gift_shop_sales_date on gift_shop_sales(date desc);
create index if not exists idx_gift_shop_sales_status on gift_shop_sales(status);
create index if not exists idx_gift_shop_sales_invoice on gift_shop_sales(invoice_number);

-- Gift Shop Issues (damaged / broken / lost write-offs)
create table if not exists gift_shop_issues (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  type text not null check (type in ('Damaged', 'Broken', 'Lost')),
  item_cost numeric not null default 0.00,
  notes text,
  reporter text not null,
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_gift_shop_issues_date on gift_shop_issues(date desc);
create index if not exists idx_gift_shop_issues_product on gift_shop_issues(product_id);

-- Enable RLS on gift shop tables
alter table gift_shop_sales enable row level security;
alter table gift_shop_issues enable row level security;

drop policy if exists "Allow all public reads" on gift_shop_sales;
create policy "Allow all public reads" on gift_shop_sales for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_sales;
create policy "Allow all public writes" on gift_shop_sales for all using (true) with check (true);

drop policy if exists "Allow all public reads" on gift_shop_issues;
create policy "Allow all public reads" on gift_shop_issues for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_issues;
create policy "Allow all public writes" on gift_shop_issues for all using (true) with check (true);
