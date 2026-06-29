-- Hotel Management ERP Supabase Database Schema
-- Run this script in your Supabase SQL Editor to provision the tables.

-- ======================================================================================
-- ⚠️ TROUBLESHOOTING / OWNERSHIP ERROR (ERROR: 42501)
-- ======================================================================================
-- If you get: "ERROR: 42501: must be owner of table rooms" (or any other table name), 
-- it means a table with that name already exists in your Supabase project (probably from 
-- a pre-made Supabase template like quickstart/rooms/todos) under a different database owner.
--
-- TO RESOLVE THIS, copy and execute this block FIRST to clear conflicting tables:
--
-- DROP TABLE IF EXISTS reservations CASCADE;
-- DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS guests CASCADE;
-- DROP TABLE IF EXISTS rate_plans CASCADE;
-- DROP TABLE IF EXISTS seasons CASCADE;
-- DROP TABLE IF EXISTS packages CASCADE;
-- DROP TABLE IF EXISTS inventory_stores CASCADE;
-- DROP TABLE IF EXISTS inventory_items CASCADE;
-- DROP TABLE IF EXISTS system_users CASCADE;
-- DROP TABLE IF EXISTS custom_roles CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS audit_events CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS dispatched_emails CASCADE;
-- DROP TABLE IF EXISTS guest_feedbacks CASCADE;
-- DROP TABLE IF EXISTS inventory_requisitions CASCADE;
-- DROP TABLE IF EXISTS inventory_suppliers CASCADE;
-- DROP TABLE IF EXISTS inventory_stock_movements CASCADE;
-- DROP TABLE IF EXISTS inventory_grns CASCADE;
-- DROP TABLE IF EXISTS chart_of_accounts CASCADE;
-- DROP TABLE IF EXISTS journal_entries CASCADE;
-- DROP TABLE IF EXISTS sales_transactions CASCADE;
-- DROP TABLE IF EXISTS expense_requests CASCADE;
-- DROP TABLE IF EXISTS global_settings CASCADE;
--
-- Once conflicting tables are dropped, re-run this entire schema.sql file.
-- ======================================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. ROOMS TABLE
create table if not exists rooms (
  id text primary key,
  number text unique not null,
  type text not null check (type in ('Single', 'Double', 'Suite', 'Deluxe', 'Penthouse')),
  floor integer not null,
  status text not null check (status in ('Vacant Clean', 'Vacant Dirty', 'Occupied Clean', 'Occupied Dirty', 'Out of Order')),
  rate numeric not null,
  features text[] not null default '{}'::text[]
);

-- 2. GUESTS TABLE
create table if not exists guests (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  status text check (status in ('VIP', 'Regular', 'Loyalty Member')),
  loyalty_points integer not null default 0,
  special_requests text default '',
  notes text default '',
  total_spend numeric not null default 0.00,
  nationality text,
  tin text,
  vat_no text,
  vat_date text,
  preferences jsonb not null default '{}'::jsonb,
  identification_doc jsonb not null default '{}'::jsonb
);

-- 3. RESERVATIONS TABLE
create table if not exists reservations (
  id text primary key,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  guest_status text,
  room_type text not null,
  room_number text references rooms(number) on delete set null,
  check_in_date date not null,
  check_out_date date not null,
  adults integer not null default 1,
  children integer not null default 0,
  status text not null check (status in ('Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'Waitlisted')),
  rate numeric not null,
  total_amount numeric not null,
  channel text check (channel in ('Booking.com', 'Expedia', 'Walk-In', 'Direct Website', 'Corporate')),
  payment_status text check (payment_status in ('Unpaid', 'Paid', 'Partial')),
  notes text default '',
  charges jsonb not null default '[]'::jsonb,
  payments jsonb not null default '[]'::jsonb,
  early_check_out_requested boolean not null default false,
  late_check_out_requested boolean not null default false,
  group_booking_id text,
  is_group boolean not null default false,
  deposit_amount numeric not null default 0.00,
  is_deposit_paid boolean not null default false,
  rate_plan_id text,
  package_ids text[] not null default '{}'::text[],
  additional_guest_ids text[] not null default '{}'::text[],
  discount_percent numeric not null default 0.00,
  tax_percent numeric not null default 0.00,
  service_charge_percent numeric not null default 0.00,
  custom_hotel_name text,
  custom_hotel_address text,
  hotel_tin text,
  hotel_vat_no text,
  hotel_vat_date text,
  guest_tin text,
  guest_vat_no text,
  guest_vat_date text,
  routing_profile_id text,
  corporate_account_id text,
  booking_group_id text,
  guest_id text references guests(id) on delete set null
);

alter table reservations add column if not exists booking_group_id text;
alter table reservations add column if not exists guest_id text references guests(id) on delete set null;
create index if not exists idx_reservations_booking_group_id on reservations(booking_group_id);
create index if not exists idx_reservations_guest_id on reservations(guest_id);

-- 4. GROUP BOOKINGS TABLE
create table if not exists group_bookings (
  id text primary key,
  group_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  room_type_needed text not null,
  room_count integer not null,
  check_in_date date not null,
  check_out_date date not null,
  discount_percent numeric not null default 0.00,
  status text check (status in ('Pending', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled'))
);

-- 5. CORPORATE ACCOUNTS TABLE
create table if not exists corporate_accounts (
  id text primary key,
  company_name text not null,
  contact_person text not null,
  contact_email text not null,
  contact_phone text,
  discount_percent numeric not null default 0.00,
  active_bookings integer not null default 0,
  unpaid_balance numeric not null default 0.00
);

-- 6. RATE PLANS TABLE
create table if not exists rate_plans (
  id text primary key,
  name text not null,
  description text,
  base_modifier numeric not null default 1.0,
  active boolean not null default true
);

-- 7. SEASONS TABLE
create table if not exists seasons (
  id text primary key,
  name text not null,
  start_month integer not null,
  start_day integer not null,
  end_month integer not null,
  end_day integer not null,
  multiplier numeric not null default 1.0
);

-- 8. PACKAGES TABLE
create table if not exists packages (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  charge_frequency text check (charge_frequency in ('once', 'daily'))
);

-- 9. INVENTORY STORES TABLE
create table if not exists inventory_stores (
  id text primary key,
  name text not null,
  type text,
  manager text
);

-- 10. INVENTORY ITEMS TABLE
create table if not exists inventory_items (
  id text primary key,
  code text,
  name text not null,
  category text,
  subcategory text,
  unit text,
  brand text,
  supplier_id text,
  max_stock integer not null default 0,
  reorder_level integer not null default 0,
  last_cost numeric not null default 0.00,
  avg_cost numeric not null default 0.00,
  current_stock integer not null default 0,
  location text,
  barcode text,
  stock integer not null default 0,
  price numeric not null default 0.00,
  min_stock integer not null default 5,
  store_id text references inventory_stores(id) on delete set null,
  retail_price numeric not null default 0.00,
  sale_price numeric not null default 0.00,
  guest_portal_active boolean not null default false,
  image_url text,
  dietary_tags text[] default '{}'
);

-- 11. SYSTEM USERS TABLE
create table if not exists system_users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null,
  role_description text,
  avatar_initials text,
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'Pending', 'Suspended', 'Locked')),
  last_login timestamp with time zone,
  employee_id text,
  username text,
  mobile_number text,
  department text,
  custom_role_id text,
  security_settings jsonb not null default '{}'::jsonb,
  data_restrictions jsonb not null default '{}'::jsonb,
  allowed_tabs text[] not null default '{}'::text[],
  allowed_settings jsonb not null default '{}'::jsonb
);

alter table system_users
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists role_description text,
  add column if not exists avatar_initials text,
  add column if not exists status text not null default 'Active',
  add column if not exists last_login timestamp with time zone,
  add column if not exists employee_id text,
  add column if not exists username text,
  add column if not exists mobile_number text,
  add column if not exists department text,
  add column if not exists custom_role_id text,
  add column if not exists security_settings jsonb not null default '{}'::jsonb,
  add column if not exists data_restrictions jsonb not null default '{}'::jsonb,
  add column if not exists allowed_tabs text[] not null default '{}'::text[],
  add column if not exists allowed_settings jsonb not null default '{}'::jsonb,
  add column if not exists password_hash text,
  add column if not exists password_updated_at timestamp with time zone,
  add column if not exists failed_login_count integer not null default 0,
  add column if not exists locked_until timestamp with time zone,
  add column if not exists mfa_enabled boolean not null default false,
  add column if not exists mfa_secret text,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now(),
  add column if not exists permission_matrix jsonb not null default '{}'::jsonb,
  add column if not exists force_password_change boolean not null default false,
  add column if not exists password_reset_token text,
  add column if not exists password_reset_expires timestamp with time zone;

create table if not exists custom_roles (
  id text primary key,
  name text not null,
  description text,
  department text,
  module_permissions jsonb not null default '{}'::jsonb,
  tab_permissions jsonb not null default '{}'::jsonb,
  button_permissions jsonb not null default '{}'::jsonb,
  field_permissions jsonb not null default '{}'::jsonb,
  is_system boolean not null default false
);

create table if not exists roles (
  id text primary key,
  name text not null unique,
  description text,
  is_system boolean not null default false,
  is_superuser boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 20B. NIGHT AUDIT EXCEPTIONS LOG
create table if not exists audit_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_date date not null,
  reservation_id text,
  room_number text,
  description text not null,
  owner text not null default 'Front Office',
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamp with time zone not null default now(),
  resolved_at timestamp with time zone,
  resolved_by text references system_users(id) on delete set null
);

create index if not exists idx_audit_exceptions_business_date on audit_exceptions(business_date desc);
create index if not exists idx_audit_exceptions_status on audit_exceptions(status);

-- 20C. REPORT SCHEDULES
create table if not exists report_schedules (
  id uuid primary key default gen_random_uuid(),
  report_name text not null,
  frequency text not null check (frequency in ('Daily','Weekly','Monthly','Quarterly')),
  recipients text[] not null default '{}'::text[],
  status text not null default 'Active' check (status in ('Active','Paused')),
  next_run text,
  created_by text references system_users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 20D. REPORT VERSION HISTORY (PUBLISHED/APPROVED DOCS)
create table if not exists report_versions (
  id uuid primary key default gen_random_uuid(),
  report_name text not null,
  generated_by text,
  created_at timestamp with time zone not null default now(),
  file_size text,
  status text not null default 'Draft' check (status in ('Draft','Approved','Sent'))
);

create index if not exists idx_report_versions_name on report_versions(report_name);

-- 20E. HISTORICAL OPERATING STATS (for charts)
create table if not exists historical_stats (
  id uuid primary key default gen_random_uuid(),
  business_date date not null,
  occupancy numeric,
  room_revenue numeric,
  ancillary_revenue numeric,
  adr numeric,
  revpar numeric,
  guest_satisfaction numeric,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_historical_stats_date on historical_stats(business_date desc);

create table if not exists permissions (
  id text primary key,
  code text not null unique,
  module text not null,
  description text,
  created_at timestamp with time zone not null default now()
);

create table if not exists user_roles (
  user_id text not null references system_users(id) on delete cascade,
  role_id text not null references roles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (user_id, role_id)
);

create table if not exists role_permissions (
  role_id text not null references roles(id) on delete cascade,
  permission_id text not null references permissions(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists user_sessions (
  id text primary key,
  user_id text not null references system_users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null,
  revoked_at timestamp with time zone,
  user_agent text,
  ip_address text
);

create index if not exists idx_user_sessions_user_id on user_sessions(user_id);
create index if not exists idx_user_sessions_token_hash on user_sessions(token_hash);
create index if not exists idx_user_sessions_expires_at on user_sessions(expires_at);

create table if not exists audit_events (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  user_id text references system_users(id) on delete set null,
  user_name text,
  action text not null,
  entity_type text,
  entity_id text,
  module text,
  ip_address text,
  user_agent text,
  outcome text not null default 'success' check (outcome in ('success', 'failure', 'denied')),
  details jsonb not null default '{}'::jsonb
);

create index if not exists idx_audit_events_timestamp on audit_events(created_at desc);
create index if not exists idx_audit_events_user_id on audit_events(user_id);
create index if not exists idx_audit_events_action on audit_events(action);
create index if not exists idx_audit_events_entity on audit_events(entity_type, entity_id);

-- ======================================================================================
-- PHASE 2: FOLIO SUBLEDGER + GL CORE SCHEMA
-- ======================================================================================

-- 12. FOLIOS TABLE (replaces embedded charges/payments JSON in reservations)
create table if not exists folios (
  id text primary key,
  reservation_id text not null references reservations(id) on delete cascade,
  folio_type text not null default 'Guest' check (folio_type in ('Guest', 'Group', 'Master', 'House')),
  target_folio text check (target_folio in ('A', 'B', null)),
  status text not null default 'Open' check (status in ('Open', 'Closed', 'Transferred', 'Voided')),
  balance numeric not null default 0.00,
  total_charges numeric not null default 0.00,
  total_payments numeric not null default 0.00,
  tax_total numeric not null default 0.00,
  service_charge_total numeric not null default 0.00,
  currency text not null default 'USD',
  opened_at timestamp with time zone not null default now(),
  closed_at timestamp with time zone,
  created_by text references system_users(id) on delete set null,
  updated_at timestamp with time zone not null default now(),
  notes text default ''
);

alter table folios add column if not exists updated_at timestamp with time zone not null default now();
alter table folios add column if not exists target_folio text check (target_folio in ('A', 'B', null));
alter table folios add column if not exists service_charge_total numeric not null default 0.00;

create index if not exists idx_folios_reservation_id on folios(reservation_id);
create index if not exists idx_folios_reservation_target on folios(reservation_id, target_folio);
create index if not exists idx_folios_status on folios(status);

-- 13. FOLIO LINES (individual charges: room, F&B, extra, tax, discount, etc.)
create table if not exists chart_of_accounts (
  id text primary key,
  code text unique not null,
  name text not null,
  category text not null check (category in ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  sub_category text,
  balance numeric not null default 0.00,
  currency text not null default 'USD',
  is_active boolean not null default true
);

create table if not exists folio_lines (
  id text primary key,
  folio_id text not null references folios(id) on delete cascade,
  line_number integer not null,
  transaction_date date not null default current_date,
  posting_date timestamp with time zone not null default now(),
  description text not null,
  amount numeric not null,
  quantity numeric not null default 1,
  unit_price numeric,
  line_type text not null check (line_type in ('Room', 'F&B', 'Minibar', 'Laundry', 'Spa', 'Extra', 'Tax', 'ServiceCharge', 'Discount', 'Package', 'Transfer', 'Adjustment', 'Other')),
  target_folio text check (target_folio in ('A', 'B', null)),
  revenue_account_code text references chart_of_accounts(code) on delete set null,
  tax_code text,
  tax_amount numeric not null default 0.00,
  is_voided boolean not null default false,
  voided_at timestamp with time zone,
  voided_by text references system_users(id) on delete set null,
  void_reason text,
  source_module text not null default 'frontoffice',
  source_reference text,
  posted_to_gl boolean not null default false,
  gl_batch_id text,
  created_by text references system_users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table folio_lines add column if not exists target_folio text check (target_folio in ('A', 'B', null));
alter table folio_lines add column if not exists updated_at timestamp with time zone not null default now();

create index if not exists idx_folio_lines_folio_id on folio_lines(folio_id);
create index if not exists idx_folio_lines_target_folio on folio_lines(target_folio);
create index if not exists idx_folio_lines_posted_to_gl on folio_lines(posted_to_gl);
create index if not exists idx_folio_lines_transaction_date on folio_lines(transaction_date);
create index if not exists idx_folio_lines_is_voided on folio_lines(is_voided);

-- 14. FOLIO PAYMENTS (replaces embedded payments JSON)
create table if not exists folio_payments (
  id text primary key,
  folio_id text not null references folios(id) on delete cascade,
  payment_date timestamp with time zone not null default now(),
  amount numeric not null,
  payment_method text not null check (payment_method in ('Cash', 'Credit Card', 'Debit Card', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Voucher', 'Corporate Bill', 'Company Ledger', 'Room Charge', 'Complimentary', 'Other')),
  payment_sub_type text,
  reference_number text,
  card_last_four text,
  card_expiry text,
  authorization_code text,
  is_voided boolean not null default false,
  voided_at timestamp with time zone,
  voided_by text references system_users(id) on delete set null,
  void_reason text,
  is_refund boolean not null default false,
  posted_to_gl boolean not null default false,
  gl_batch_id text,
  cashier_id text references system_users(id) on delete set null,
  shift_id text,
  created_by text references system_users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_folio_payments_folio_id on folio_payments(folio_id);
create index if not exists idx_folio_payments_posted_to_gl on folio_payments(posted_to_gl);
create index if not exists idx_folio_payments_is_voided on folio_payments(is_voided);

-- 15. INVOICE DOCUMENTS (generated folio invoices)
create table if not exists invoice_documents (
  id text primary key,
  folio_id text not null references folios(id) on delete cascade,
  invoice_number text unique not null,
  invoice_type text not null default 'Guest' check (invoice_type in ('Guest', 'Proforma', 'Tax', 'Credit Note', 'Group Master')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric not null default 0.00,
  tax_total numeric not null default 0.00,
  discount_total numeric not null default 0.00,
  total numeric not null default 0.00,
  amount_paid numeric not null default 0.00,
  status text not null default 'Draft' check (status in ('Draft', 'Issued', 'Paid', 'Partial', 'Overdue', 'Voided', 'WrittenOff')),
  customer_name text not null,
  customer_email text,
  customer_address text,
  customer_tin text,
  customer_vat_no text,
  hotel_tin text,
  hotel_vat_no text,
  hotel_vat_date text,
  payment_terms text,
  notes text,
  is_voided boolean not null default false,
  voided_at timestamp with time zone,
  voided_by text references system_users(id) on delete set null,
  void_reason text,
  created_by text references system_users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_invoice_documents_folio_id on invoice_documents(folio_id);
create index if not exists idx_invoice_documents_number on invoice_documents(invoice_number);

-- 16. FISCAL PERIODS (accounting period control)
create table if not exists fiscal_periods (
  id text primary key,
  fiscal_year integer not null,
  period_number integer not null check (period_number between 1 and 12),
  period_name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'Open' check (status in ('Open', 'Closing', 'Closed', 'Reopened')),
  is_locked boolean not null default false,
  locked_by text references system_users(id) on delete set null,
  locked_at timestamp with time zone,
  closed_by text references system_users(id) on delete set null,
  closed_at timestamp with time zone,
  reopened_by text references system_users(id) on delete set null,
  reopened_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone not null default now(),
  unique(fiscal_year, period_number)
);

create index if not exists idx_fiscal_periods_dates on fiscal_periods(start_date, end_date);
create index if not exists idx_fiscal_periods_status on fiscal_periods(status);

-- 17. JOURNAL BATCHES (posting control)
create table if not exists journal_batches (
  id text primary key,
  batch_name text not null,
  batch_type text not null check (batch_type in ('Manual', 'Auto', 'NightAudit', 'PeriodClose', 'Reversal', 'Import')),
  fiscal_period_id text references fiscal_periods(id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft', 'Posted', 'Reversed', 'Cancelled')),
  total_debit numeric not null default 0.00,
  total_credit numeric not null default 0.00,
  source_module text,
  description text,
  posted_by text references system_users(id) on delete set null,
  posted_at timestamp with time zone,
  created_by text references system_users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_journal_batches_period on journal_batches(fiscal_period_id);
create index if not exists idx_journal_batches_status on journal_batches(status);

-- 18. JOURNAL LINES (double-entry lines)
create table if not exists journal_lines (
  id text primary key,
  journal_entry_id text not null,
  batch_id text references journal_batches(id) on delete set null,
  line_number integer not null,
  account_code text not null references chart_of_accounts(code),
  debit numeric not null default 0.00,
  credit numeric not null default 0.00,
  description text,
  reference text,
  entity_type text,
  entity_id text,
  cost_center text,
  department text,
  is_reversing boolean not null default false,
  reversed_line_id text references journal_lines(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_journal_lines_entry on journal_lines(journal_entry_id);
create index if not exists idx_journal_lines_account on journal_lines(account_code);
create index if not exists idx_journal_lines_batch on journal_lines(batch_id);

-- 19. POSTING RULES (auto-mapping PMS/F&B transactions to GL accounts)
create table if not exists posting_rules (
  id text primary key,
  name text not null,
  description text,
  source_module text not null check (source_module in ('frontoffice', 'f&b', 'giftshop', 'spa', 'housekeeping', 'inventory', 'procurement', 'finance', 'payroll')),
  transaction_type text not null check (transaction_type in ('RoomRevenue', 'FBRevenue', 'BarRevenue', 'MinibarRevenue', 'LaundryRevenue', 'SpaRevenue', 'GiftShopRevenue', 'Tax', 'ServiceCharge', 'Discount', 'Payment', 'Refund', 'Expense', 'CostOfGoods', 'Asset', 'Adjustment', 'Other')),
  debit_account_code text references chart_of_accounts(code) on delete set null,
  credit_account_code text references chart_of_accounts(code) on delete set null,
  tax_account_code text references chart_of_accounts(code) on delete set null,
  is_active boolean not null default true,
  priority integer not null default 100,
  valid_from date,
  valid_to date,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_posting_rules_active on posting_rules(is_active);

-- 20. BUSINESS DATES (night audit / business day tracking)
create table if not exists business_dates (
  id text primary key default 'current',
  business_date date not null,
  previous_business_date date,
  is_night_audit_complete boolean not null default false,
  night_audit_started_at timestamp with time zone,
  night_audit_completed_at timestamp with time zone,
  night_audit_by text references system_users(id) on delete set null,
  revenue_posted numeric not null default 0.00,
  rooms_sold integer not null default 0,
  arrivals integer not null default 0,
  departures integer not null default 0,
  no_shows integer not null default 0,
  exceptions_count integer not null default 0,
  exceptions jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamp with time zone not null default now()
);

-- Seed initial business date
insert into business_dates (business_date, previous_business_date) values
(current_date, current_date - interval '1 day')
on conflict (id) do nothing;

-- 21. VOID AUDIT LOG (immutable void trail for folio lines and payments)
create table if not exists void_audit_log (
  id text primary key,
  voided_at timestamp with time zone not null default now(),
  voided_by text not null references system_users(id),
  original_table text not null,
  original_id text not null,
  original_amount numeric not null,
  original_description text,
  void_reason text not null,
  folio_id text references folios(id) on delete set null,
  reservation_id text references reservations(id) on delete set null,
  approved_by text references system_users(id) on delete set null,
  details jsonb not null default '{}'::jsonb
);

create index if not exists idx_void_audit_folio on void_audit_log(folio_id);
create index if not exists idx_void_audit_original on void_audit_log(original_table, original_id);

-- ======================================================================================
-- PHASE 2: ATOMIC POSTGRES RPC FUNCTIONS
-- ======================================================================================

-- Function: Check-in with folio creation
create or replace function check_in_reservation(
  p_reservation_id text,
  p_room_number text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_room rooms%rowtype;
  v_folio_id text;
  v_business_date date;
  v_now timestamp with time zone := now();
begin
  -- Get current business date
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock and validate reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status not in ('Confirmed', 'Waitlisted') then
    return jsonb_build_object('success', false, 'error', 'Reservation is not eligible for check-in (status: ' || v_reservation.status || ')');
  end if;

  -- Lock and validate room
  select * into v_room
  from rooms
  where number = p_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Room not found');
  end if;

  if v_room.status = 'Out of Order' then
    return jsonb_build_object('success', false, 'error', 'Room is Out of Order');
  end if;

  -- Check room is not occupied
  if exists (
    select 1 from reservations
    where room_number = p_room_number
    and status = 'CheckedIn'
    and id != p_reservation_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Room is already occupied');
  end if;

  -- Create folio(s) for this stay
  -- Corporate/group bookings get split folios: Master (A) + Guest (B)
  -- Individual bookings get a single Guest folio
  declare
    v_is_corporate boolean := v_reservation.channel = 'Corporate' or v_reservation.group_booking_id is not null;
    v_folio_a_id text;
    v_folio_b_id text;
    v_primary_folio_id text;
  begin
    if v_is_corporate then
      v_folio_a_id := gen_random_uuid()::text;
      v_folio_b_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_a_id, p_reservation_id, 'Master', 'A', 'Open', 0.00, 'USD', v_now, p_user_id);
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_b_id, p_reservation_id, 'Guest', 'B', 'Open', 0.00, 'USD', v_now, p_user_id);
      v_primary_folio_id := v_folio_a_id;
    else
      v_primary_folio_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_primary_folio_id, p_reservation_id, 'Guest', null, 'Open', 0.00, 'USD', v_now, p_user_id);
    end if;

    -- Post initial room charge with fee component breakdown
    declare
      v_base_amount numeric := v_reservation.total_amount;
      v_line_num integer := 1;
      v_fee record;
      v_fee_amount numeric;
      v_non_vat_fees numeric := 0.00;
      v_vat_amount numeric := 0.00;
      v_vat_name text := '';
      v_vat_rate numeric := 0;
      v_vat_account text := '';
      v_sc_total numeric := 0.00;
    begin
      -- Base room charge (goes to corporate folio A if split, else primary)
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
        'Room charge - ' || v_reservation.room_type || ' (' || v_reservation.check_in_date || ' to ' || v_reservation.check_out_date || ')',
        v_base_amount, 1, v_base_amount, 'Room',
        case when v_is_corporate then 'A' else null end,
        (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
        'frontoffice', p_user_id
      );

      -- Phase 1: Calculate non-VAT fees on base amount, insert lines
      for v_fee in
        select
          (elem->>'name')::text as name,
          (elem->>'feeType')::text as fee_type,
          (elem->>'value')::numeric as value,
          (elem->>'accountCode')::text as account_code
        from global_settings, jsonb_array_elements(fee_components) as elem
        where id = 'main'
        and (elem->>'isEnabled')::boolean = true
        and lower((elem->>'name')::text) not like '%vat%'
        and lower((elem->>'name')::text) not like '%tax%'
        order by (elem->>'displayOrder')::int asc
      loop
        v_line_num := v_line_num + 1;
        if v_fee.fee_type = 'percentage' then
          v_fee_amount := round(v_base_amount * v_fee.value / 100, 2);
        else
          v_fee_amount := v_fee.value;
        end if;
        v_non_vat_fees := v_non_vat_fees + v_fee_amount;

        if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
          v_sc_total := v_sc_total + v_fee_amount;
        end if;

        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '%' else ' (Fixed)' end,
          v_fee_amount, 1, v_fee_amount,
          case
            when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
            else 'Extra'
          end,
          case when v_is_corporate then 'A' else null end,
          coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
          'frontoffice', p_user_id
        );
      end loop;

      -- Phase 2: Calculate VAT on (base + non-VAT fees)
      select
        (elem->>'name')::text,
        (elem->>'value')::numeric,
        (elem->>'accountCode')::text
      into v_vat_name, v_vat_rate, v_vat_account
      from global_settings, jsonb_array_elements(fee_components) as elem
      where id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
      limit 1;

      if v_vat_name is not null and v_vat_rate > 0 then
        v_vat_amount := round((v_base_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
        v_line_num := v_line_num + 1;
        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_vat_name || ' @ ' || v_vat_rate || '%',
          v_vat_amount, 1, v_vat_amount, 'Tax',
          case when v_is_corporate then 'A' else null end,
          coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
          'frontoffice', p_user_id
        );
      end if;

      -- Update primary folio balance
      update folios
      set balance = v_base_amount + v_non_vat_fees + v_vat_amount,
          total_charges = v_base_amount + v_non_vat_fees + v_vat_amount,
          tax_total = v_vat_amount,
          service_charge_total = v_sc_total,
          updated_at = v_now
      where id = v_primary_folio_id;

      -- If corporate, also update the B folio with 0 totals (ready for incidentals)
      if v_is_corporate then
        update folios
        set balance = 0.00,
            total_charges = 0.00,
            tax_total = 0.00,
            service_charge_total = 0.00,
            updated_at = v_now
        where id = v_folio_b_id;
      end if;
    end;
  end;

  -- Update reservation
  update reservations
  set status = 'CheckedIn',
      room_number = p_room_number,
      payment_status = case when v_reservation.is_deposit_paid then 'Partial' else 'Unpaid' end
  where id = p_reservation_id;

  -- Update room status
  update rooms
  set status = 'Occupied Clean'
  where number = p_room_number;

  -- Audit log
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text,
    p_user_id,
    'reservation.check_in',
    'reservation',
    p_reservation_id,
    'frontoffice',
    jsonb_build_object('roomNumber', p_room_number, 'previousStatus', v_reservation.status, 'folioId', v_folio_id)
  );

  return jsonb_build_object('success', true, 'folioId', v_folio_id, 'roomNumber', p_room_number);
end;
$$;

-- Function: Post folio charge with fee component breakdown
-- p_amount is the BASE amount (same as frontend); fee components are added on top
create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Insert base charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Phase 1: Calculate non-VAT fees on base amount, insert lines
  declare
    v_non_vat_fees numeric := 0.00;
    v_vat_amount numeric := 0.00;
    v_vat_name text := '';
    v_vat_rate numeric := 0;
    v_vat_account text := '';
    v_sc_total numeric := 0.00;
  begin
    for v_fee in
      select
        (elem->>'name')::text as name,
        (elem->>'feeType')::text as fee_type,
        (elem->>'value')::numeric as value,
        (elem->>'accountCode')::text as account_code
      from global_settings, jsonb_array_elements(fee_components) as elem
      where id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and lower((elem->>'name')::text) not like '%vat%'
      and lower((elem->>'name')::text) not like '%tax%'
      order by (elem->>'displayOrder')::int asc
    loop
      v_next_line := v_next_line + 1;
      if v_fee.fee_type = 'percentage' then
        v_fee_amount := round(v_base_amount * v_fee.value / 100, 2);
      else
        v_fee_amount := v_fee.value;
      end if;
      v_non_vat_fees := v_non_vat_fees + v_fee_amount;

      if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
        v_sc_total := v_sc_total + v_fee_amount;
      end if;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
        v_fee_amount, 1, v_fee_amount,
        case
          when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
          else 'Extra'
        end,
        v_folio.target_folio,
        coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
        'frontoffice', p_user_id
      );
    end loop;

    -- Phase 2: Calculate VAT on (base + non-VAT fees), insert last
    select
      (elem->>'name')::text,
      (elem->>'value')::numeric,
      (elem->>'accountCode')::text
    into v_vat_name, v_vat_rate, v_vat_account
    from global_settings, jsonb_array_elements(fee_components) as elem
    where id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
    limit 1;

    if v_vat_name is not null and v_vat_rate > 0 then
      v_vat_amount := round((v_base_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
      v_next_line := v_next_line + 1;
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
        v_vat_amount, 1, v_vat_amount, 'Tax',
        v_folio.target_folio,
        coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
        'frontoffice', p_user_id
      );
    end if;

    v_total_fees := v_non_vat_fees + v_vat_amount;

    -- Update folio balance with separate service charge and tax tracking
    update folios
    set balance = balance + v_base_amount + v_total_fees,
        total_charges = total_charges + v_base_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;

    -- Audit
    insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
    values (
      gen_random_uuid()::text, p_user_id, 'folio.charge.add', 'folio', p_folio_id, 'frontoffice',
      jsonb_build_object(
        'baseAmount', v_base_amount, 'nonVatFees', v_non_vat_fees, 'vatAmount', v_vat_amount,
        'scTotal', v_sc_total, 'totalAmount', v_base_amount + v_total_fees,
        'description', p_description, 'lineType', p_line_type
      )
    );

    return jsonb_build_object(
      'success', true, 'folioId', p_folio_id, 'lineId', v_base_line_id, 'lineNumber', v_next_line,
      'newBalance', v_folio.balance + v_base_amount + v_total_fees,
      'baseAmount', v_base_amount, 'nonVatFees', v_non_vat_fees, 'vatAmount', v_vat_amount,
      'scTotal', v_sc_total, 'totalAmount', v_base_amount + v_total_fees
    );
  end;
end;
$$;

-- Function: Post folio payment
create or replace function post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
begin
  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Insert payment
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id
  );

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update reservation payment status if folio balance is cleared
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object('amount', p_amount, 'method', p_payment_method)
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- Function: Move folio line between folios (for split folio support)
create or replace function move_folio_line(
  p_line_id text,
  p_target_folio_id text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_line folio_lines%rowtype;
  v_source_folio folios%rowtype;
  v_target_folio folios%rowtype;
  v_now timestamp with time zone := now();
  v_new_line_num integer;
begin
  -- Lock and get the line
  select * into v_line
  from folio_lines
  where id = p_line_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Line not found');
  end if;

  -- Lock source and target folios
  select * into v_source_folio
  from folios
  where id = v_line.folio_id
  for update;

  select * into v_target_folio
  from folios
  where id = p_target_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Target folio not found');
  end if;

  if v_source_folio.id = v_target_folio.id then
    return jsonb_build_object('success', false, 'error', 'Source and target folio are the same');
  end if;

  -- Get next line number in target folio
  select coalesce(max(line_number), 0) + 1 into v_new_line_num
  from folio_lines
  where folio_id = p_target_folio_id;

  -- Move the line
  update folio_lines
  set folio_id = p_target_folio_id,
      line_number = v_new_line_num,
      target_folio = v_target_folio.target_folio,
      updated_at = v_now
  where id = p_line_id;

  -- Recalculate source folio totals
  update folios
  set balance = coalesce((select sum(amount) from folio_lines where folio_id = v_source_folio.id and is_voided = false), 0)
      - coalesce((select sum(amount) from folio_payments where folio_id = v_source_folio.id and is_voided = false), 0),
      total_charges = coalesce((select sum(amount) from folio_lines where folio_id = v_source_folio.id and is_voided = false), 0),
      tax_total = coalesce((select sum(amount) from folio_lines where folio_id = v_source_folio.id and is_voided = false and line_type = 'Tax'), 0),
      service_charge_total = coalesce((select sum(amount) from folio_lines where folio_id = v_source_folio.id and is_voided = false and line_type = 'ServiceCharge'), 0),
      updated_at = v_now
  where id = v_source_folio.id;

  -- Recalculate target folio totals
  update folios
  set balance = coalesce((select sum(amount) from folio_lines where folio_id = v_target_folio.id and is_voided = false), 0)
      - coalesce((select sum(amount) from folio_payments where folio_id = v_target_folio.id and is_voided = false), 0),
      total_charges = coalesce((select sum(amount) from folio_lines where folio_id = v_target_folio.id and is_voided = false), 0),
      tax_total = coalesce((select sum(amount) from folio_lines where folio_id = v_target_folio.id and is_voided = false and line_type = 'Tax'), 0),
      service_charge_total = coalesce((select sum(amount) from folio_lines where folio_id = v_target_folio.id and is_voided = false and line_type = 'ServiceCharge'), 0),
      updated_at = v_now
  where id = v_target_folio.id;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.line.move', 'folio', p_target_folio_id, 'frontoffice',
    jsonb_build_object('lineId', p_line_id, 'fromFolio', v_source_folio.id, 'toFolio', p_target_folio_id, 'amount', v_line.amount)
  );

  return jsonb_build_object('success', true, 'lineId', p_line_id, 'fromFolio', v_source_folio.id, 'toFolio', p_target_folio_id);
end;
$$;

-- Function: Change room for a reservation (works before or after check-in)
create or replace function change_room(
  p_reservation_id text,
  p_new_room_number text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_new_room rooms%rowtype;
  v_old_room_number text;
  v_now timestamp with time zone := now();
  v_business_date date;
  v_folio_id text;
  v_next_line integer;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  v_old_room_number := v_reservation.room_number;

  if v_old_room_number = p_new_room_number then
    return jsonb_build_object('success', false, 'error', 'New room is the same as the current room');
  end if;

  -- Lock and validate new room
  select * into v_new_room
  from rooms
  where number = p_new_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'New room not found');
  end if;

  if v_new_room.status = 'Out of Order' then
    return jsonb_build_object('success', false, 'error', 'New room is Out of Order');
  end if;

  -- Check new room is not occupied by a different checked-in reservation
  if exists (
    select 1 from reservations
    where room_number = p_new_room_number
    and status = 'CheckedIn'
    and id != p_reservation_id
  ) then
    return jsonb_build_object('success', false, 'error', 'New room is already occupied');
  end if;

  -- Update reservation room number
  update reservations
  set room_number = p_new_room_number
  where id = p_reservation_id;

  -- Update room statuses only when reservation is checked in
  if v_reservation.status = 'CheckedIn' then
    if v_old_room_number is not null then
      update rooms set status = 'Vacant Dirty' where number = v_old_room_number;
    end if;
    update rooms set status = 'Occupied Clean' where number = p_new_room_number;

    -- Post an informational Transfer line to the open folio (zero amount)
    select id into v_folio_id
    from folios
    where reservation_id = p_reservation_id and status = 'Open'
    order by case folio_type when 'Master' then 0 when 'Guest' then 1 else 2 end
    limit 1;

    if v_folio_id is not null then
      select coalesce(max(line_number), 0) + 1 into v_next_line
      from folio_lines where folio_id = v_folio_id;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, source_module, created_by
      ) values (
        gen_random_uuid()::text, v_folio_id, v_next_line, v_business_date,
        'Room transfer: ' || coalesce(v_old_room_number, 'unassigned') || ' -> ' || p_new_room_number,
        0.00, 1, 0.00, 'Transfer', 'frontoffice', p_user_id
      );
    end if;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'reservation.room.change', 'reservation', p_reservation_id, 'frontoffice',
    jsonb_build_object('fromRoom', v_old_room_number, 'toRoom', p_new_room_number, 'status', v_reservation.status)
  );

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'fromRoom', v_old_room_number,
    'toRoom', p_new_room_number
  );
end;
$$;

-- Function: Create group booking with individual reservations
create or replace function create_group_booking(
  p_group_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_room_type_needed text,
  p_room_count integer,
  p_check_in_date date,
  p_check_out_date date,
  p_discount_percent numeric,
  p_status text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_group_id text := 'GHLGB-' || (floor(random() * 9000) + 1000)::int::text;
  v_group_code text := v_group_id;
  v_now timestamp with time zone := now();
  v_i integer;
  v_guest_id text;
  v_relationship_id text;
begin
  -- Create group profile record (new system)
  insert into group_profiles (
    id, code, name, type, status,
    contact_name, contact_email, contact_phone,
    organization_name, billing_address,
    preferences, notes,
    commission_percent,
    created_at, updated_at
  ) values (
    v_group_id, v_group_code, p_group_name, 'GroupReservation',
    case when p_status = 'Confirmed' then 'Active' else 'Active' end,
    p_contact_name, p_contact_email, p_contact_phone,
    p_group_name, '{}'::jsonb,
    jsonb_build_object('preferredRoomType', p_room_type_needed),
    'Group booking: ' || p_group_name,
    0.00,
    v_now, v_now
  );

  -- Create group booking record (legacy system for compatibility)
  insert into group_bookings (
    id, group_name, contact_name, contact_email, contact_phone,
    room_type_needed, room_count, check_in_date, check_out_date,
    discount_percent, status
  ) values (
    v_group_id, p_group_name, p_contact_name, p_contact_email, p_contact_phone,
    p_room_type_needed, p_room_count, p_check_in_date, p_check_out_date,
    p_discount_percent, p_status
  );

  -- Create guest profiles and guest-group relationships for each room
  for v_i in 1..p_room_count loop
    -- Create guest profile for this room
    v_guest_id := 'G-' || gen_random_uuid()::text;
    insert into guests (
      id, name, email, phone, status,
      loyalty_points, special_requests, notes, total_spend,
      parent_group_id, is_primary_contact
    ) values (
      v_guest_id,
      p_contact_name,
      p_contact_email,
      p_contact_phone,
      'Regular',
      0,
      '',
      'Group booking: ' || p_group_name || ' - Room ' || v_i,
      0,
      v_group_id,
      v_i = 1
    );

    -- Create guest-group relationship
    v_relationship_id := gen_random_uuid()::text;
    insert into guest_group_relationships (
      id, guest_id, group_id, relationship_type, status,
      start_date, end_date, role_title, is_primary_contact,
      created_at, updated_at
    ) values (
      v_relationship_id,
      v_guest_id,
      v_group_id,
      'GroupReservation',
      'Active',
      p_check_in_date,
      p_check_out_date,
      case when v_i = 1 then 'Primary Contact' else 'Member' end,
      v_i = 1,
      v_now,
      v_now
    );
  end loop;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'group_booking.create', 'group_booking', v_group_id, 'frontoffice',
    jsonb_build_object(
      'groupName', p_group_name,
      'roomCount', p_room_count,
      'roomType', p_room_type_needed
    )
  );

  return jsonb_build_object(
    'success', true,
    'groupId', v_group_id
  );
end;
$$;

-- Function: Void folio line
create or replace function void_folio_line(
  p_line_id text,
  p_reason text,
  p_user_id text,
  p_approved_by text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_line folio_lines%rowtype;
  v_folio_id text;
  v_amount numeric;
  v_now timestamp with time zone := now();
begin
  select * into v_line
  from folio_lines
  where id = p_line_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio line not found');
  end if;

  if v_line.is_voided then
    return jsonb_build_object('success', false, 'error', 'Line is already voided');
  end if;

  v_folio_id := v_line.folio_id;
  v_amount := v_line.amount;

  -- Mark line as voided
  update folio_lines
  set is_voided = true,
      voided_at = v_now,
      voided_by = p_user_id,
      void_reason = p_reason
  where id = p_line_id;

  -- Update folio balance
  update folios
  set balance = balance - v_amount,
      total_charges = total_charges - v_amount,
      updated_at = v_now
  where id = v_folio_id;

  -- Void audit log
  insert into void_audit_log (
    id, voided_by, original_table, original_id, original_amount, original_description,
    void_reason, folio_id, approved_by, details
  ) values (
    gen_random_uuid()::text, p_user_id, 'folio_lines', p_line_id, v_amount, v_line.description,
    p_reason, v_folio_id, p_approved_by, jsonb_build_object('lineType', v_line.line_type)
  );

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.charge.void', 'folio_line', p_line_id, 'frontoffice',
    jsonb_build_object('reason', p_reason, 'amount', v_amount)
  );

  return jsonb_build_object('success', true, 'lineId', p_line_id, 'amountReversed', v_amount);
end;
$$;

-- Function: Run night audit
create or replace function run_night_audit(
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_business_date date;
  v_next_date date;
  v_revenue_posted numeric := 0.00;
  v_rooms_sold integer := 0;
  v_arrivals integer := 0;
  v_departures integer := 0;
  v_no_shows integer := 0;
  v_exceptions jsonb := '[]'::jsonb;
  v_now timestamp with time zone := now();
begin
  -- Get current business date
  select business_date into v_business_date
  from business_dates
  where id = 'current'
  for update;

  if v_business_date is null then
    return jsonb_build_object('success', false, 'error', 'Business date not configured');
  end if;

  -- Check if already run
  if exists (select 1 from business_dates where id = 'current' and is_night_audit_complete = true) then
    return jsonb_build_object('success', false, 'error', 'Night audit already completed for ' || v_business_date);
  end if;

  -- Calculate revenue posted today (non-voided folio lines for today's transactions)
  select coalesce(sum(amount), 0.00) into v_revenue_posted
  from folio_lines
  where transaction_date = v_business_date
  and is_voided = false;

  -- Count rooms sold today (new check-ins)
  select count(*) into v_rooms_sold
  from reservations
  where status = 'CheckedIn'
  and check_in_date = v_business_date;

  -- Count arrivals today
  select count(*) into v_arrivals
  from reservations
  where check_in_date = v_business_date;

  -- Count departures today
  select count(*) into v_departures
  from reservations
  where check_out_date = v_business_date
  and status = 'CheckedOut';

  -- Count no-shows (confirmed but not checked in, past check-in date)
  select count(*) into v_no_shows
  from reservations
  where status = 'Confirmed'
  and check_in_date < v_business_date;

  -- Build exceptions list
  v_exceptions := jsonb_build_array(
    jsonb_build_object('type', 'no_show', 'count', v_no_shows, 'message', v_no_shows || ' reservation(s) are no-shows'),
    jsonb_build_object('type', 'departure_not_checked_out', 'count', (
      select count(*) from reservations
      where check_out_date = v_business_date and status = 'CheckedIn'
    ), 'message', 'Guests departing today not yet checked out')
  );

  -- Advance business date
  v_next_date := v_business_date + interval '1 day';

  update business_dates
  set business_date = v_next_date,
      previous_business_date = v_business_date,
      is_night_audit_complete = true,
      night_audit_started_at = v_now,
      night_audit_completed_at = v_now,
      night_audit_by = p_user_id,
      revenue_posted = v_revenue_posted,
      rooms_sold = v_rooms_sold,
      arrivals = v_arrivals,
      departures = v_departures,
      no_shows = v_no_shows,
      exceptions_count = jsonb_array_length(v_exceptions),
      exceptions = v_exceptions,
      updated_at = v_now
  where id = 'current';

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'night_audit.run', 'business_date', 'current', 'frontoffice',
    jsonb_build_object(
      'date', v_business_date,
      'nextDate', v_next_date,
      'revenue', v_revenue_posted,
      'roomsSold', v_rooms_sold,
      'arrivals', v_arrivals,
      'departures', v_departures,
      'noShows', v_no_shows
    )
  );

  return jsonb_build_object(
    'success', true,
    'date', v_business_date,
    'nextDate', v_next_date,
    'revenuePosted', v_revenue_posted,
    'roomsSold', v_rooms_sold,
    'arrivals', v_arrivals,
    'departures', v_departures,
    'noShows', v_no_shows,
    'exceptions', v_exceptions
  );
end;
$$;

-- ======================================================================================
-- PHASE 2: SEED POSTING RULES
-- ======================================================================================

insert into posting_rules (id, name, description, source_module, transaction_type, debit_account_code, credit_account_code, tax_account_code, priority)
values
('pr_room_revenue', 'Room Revenue', 'Guest room accommodation revenue', 'frontoffice', 'RoomRevenue', null, null, null, 100),
('pr_fb_revenue', 'F&B Revenue', 'Food and beverage revenue', 'f&b', 'FBRevenue', null, null, null, 100),
('pr_bar_revenue', 'Bar Revenue', 'Bar and beverage revenue', 'f&b', 'BarRevenue', null, null, null, 100),
('pr_tax_output', 'Tax Output', 'Tax payable on sales', 'frontoffice', 'Tax', null, null, null, 200),
('pr_service_charge', 'Service Charge', 'Service charge revenue', 'frontoffice', 'ServiceCharge', null, null, null, 200),
('pr_payment_cash', 'Cash Payment', 'Cash receipt', 'frontoffice', 'Payment', null, null, null, 300),
('pr_payment_card', 'Card Payment', 'Credit/debit card receipt', 'frontoffice', 'Payment', null, null, null, 300),
('pr_refund', 'Refund', 'Payment refund to guest', 'frontoffice', 'Refund', null, null, null, 300)
on conflict (id) do nothing;

-- Insert current fiscal period (skipped for fresh DB)
-- 12. AUDIT LOGS TABLE
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  user_id text,
  user_name text,
  device text,
  ip_address text,
  module text,
  record_id text,
  action text not null,
  details text
);

create table if not exists notifications (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  message text not null,
  type text not null check (type in ('info', 'warning', 'success', 'task')),
  department text not null,
  read boolean not null default false
);

create table if not exists dispatched_emails (
  id text primary key,
  reservation_id text,
  recipient_email text not null,
  recipient_name text not null,
  subject text not null,
  body text not null,
  sent_at text not null,
  link_url text
);

create table if not exists guest_feedbacks (
  id text primary key,
  reservation_id text,
  guest_name text not null,
  rating integer not null,
  comment text,
  feedback_date text not null
);

create table if not exists guest_communications (
  id text primary key,
  guest_id text references guests(id) on delete cascade,
  reservation_id text references reservations(id) on delete set null,
  room_number text,
  message text not null,
  message_type text not null check (message_type in ('Request', 'Booking', 'Inquiry', 'Complaint', 'Other')),
  status text not null check (status in ('Pending', 'Resolved', 'In Progress')) default 'Pending',
  reply text,
  created_at timestamp with time zone not null default now(),
  replied_at timestamp with time zone,
  replied_by text
);

create table if not exists airport_shuttle_requests (
  id text primary key,
  guest_id text references guests(id) on delete cascade,
  reservation_id text references reservations(id) on delete set null,
  room_number text,
  scheduled_date date not null,
  scheduled_time time not null,
  shuttle_type text not null check (shuttle_type in ('Pickup', 'Drop-off')),
  flight_number text,
  flight_time time,
  status text not null check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')) default 'Pending',
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_airport_shuttle_requests_scheduled_date on airport_shuttle_requests(scheduled_date);
create index if not exists idx_airport_shuttle_requests_status on airport_shuttle_requests(status);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_airport_shuttle_requests_updated_at on airport_shuttle_requests;

create trigger update_airport_shuttle_requests_updated_at
  before update on airport_shuttle_requests
  for each row
  execute function update_updated_at_column();

create table if not exists inventory_requisitions (
  id text primary key,
  number text not null,
  department text not null,
  requested_by text not null,
  request_date date not null,
  priority text not null check (priority in ('Normal', 'High', 'Urgent')),
  status text not null check (status in ('Pending', 'Verified', 'Approved', 'Issued', 'Received', 'Cancelled')),
  items jsonb not null default '[]'::jsonb
);

create table if not exists inventory_suppliers (
  id text primary key,
  code text not null,
  name text not null,
  contact_person text,
  phone text,
  email text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  rating integer not null default 3
);

create table if not exists inventory_stock_movements (
  id text primary key,
  movement_date date not null,
  item_id text,
  item_name text not null,
  type text not null check (type in ('Purchase', 'Issue', 'Transfer', 'Adjustment', 'Damage', 'Return')),
  quantity numeric not null,
  cost numeric not null default 0.00,
  reference text,
  "user" text,
  store_from text,
  store_to text
);

create table if not exists inventory_grns (
  id text primary key,
  number text not null,
  supplier_id text,
  supplier_name text not null,
  purchase_order_id text,
  delivery_note text,
  invoice_number text,
  received_date date not null,
  receiver text not null,
  items jsonb not null default '[]'::jsonb,
  total_value numeric not null default 0.00
);

create table if not exists journal_entries (
  id text primary key,
  entry_date date not null,
  reference text not null,
  description text not null,
  status text not null check (status in ('Draft', 'Pending', 'Approved', 'Posted', 'Reversed')),
  created_by text not null,
  approved_by text,
  amount numeric,
  lines jsonb not null default '[]'::jsonb,
  attachments text[] not null default '{}'::text[],
  department text,
  cost_center text
);

create table if not exists sales_transactions (
  id text primary key,
  transaction_date date not null,
  invoice_number text not null,
  module text not null check (module in ('F&B POS', 'Gift Shop', 'Front Desk Folio', 'Other')),
  customer_name text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0.00,
  tax numeric not null default 0.00,
  service_charge numeric,
  discount numeric,
  total numeric not null default 0.00,
  payment_method text not null,
  split_payments jsonb not null default '[]'::jsonb,
  status text not null check (status in ('Completed', 'Voided', 'Pending')),
  cashier_name text
);

create table if not exists expense_requests (
  id text primary key,
  request_date date not null,
  department text not null,
  category text not null,
  subcategory text,
  description text not null,
  amount numeric not null default 0.00,
  status text not null check (status in ('Under Review', 'Approved', 'Paid', 'Rejected')),
  requested_by text not null,
  approver text,
  attachments integer not null default 0,
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  is_grn boolean not null default false,
  grn_id text,
  supplier_name text
);

-- 13. GLOBAL SETTINGS TABLE
create table if not exists global_settings (
  id text primary key default 'main',
  custom_hotel_name text not null,
  custom_hotel_address text not null,
  hotel_tin text,
  hotel_vat_no text,
  hotel_vat_date text,
  tax_percent numeric not null default 15.0,
  service_charge_percent numeric not null default 10.0,
  exchange_rate numeric not null default 1.0,
  hero_image_url text,
  contact_phone text,
  public_tagline text,
  social_links jsonb not null default '[]'::jsonb,
  invoice_template text default 'modern',
  invoice_footer_text text,
  invoice_bank_details text,
  payment_types text[] not null default '{"Cash", "Credit Card", "Mobile Money", "Bank Transfer"}'::text[],
  addon_charges jsonb not null default '[]'::jsonb,
  pos_categories text[] not null default '{}'::text[],
  pos_outlets text[] not null default '{}'::text[],
  pos_printers text[] not null default '{}'::text[],
  pos_outlet_categories jsonb not null default '{}'::jsonb,
  split_folio_rules jsonb not null default '[]'::jsonb,
  loyalty_points_per_dollar numeric not null default 1.0,
  loyalty_redemption_rate numeric not null default 0.01,
  cancellation_grace_hours integer not null default 24,
  cancellation_penalty_percent numeric not null default 0.00,
  credit_limit_default numeric not null default 0.00,
  auto_night_audit_time text,
  operating_hours jsonb not null default '{}'::jsonb,
  revenue_mappings jsonb not null default '{}'::jsonb,
  room_types text[] not null default '{}'::text[],
  room_features text[] not null default '{}'::text[],
  guest_statuses text[] not null default '{}'::text[],
  inventory_categories text[] not null default '{}'::text[],
  inventory_locations text[] not null default '{}'::text[],
  inventory_units text[] not null default '{}'::text[],
  floors text[] not null default '{}'::text[],
  departments text[] not null default '{}'::text[],
  session_timeout integer,
  password_complexity text check (password_complexity in ('low', 'medium', 'high')),
  maintenance_mode boolean not null default false,
  allowed_ips text[] not null default '{}'::text[],
  backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual')),
  system_log_level text check (system_log_level in ('info', 'detailed', 'debug')),
  api_integrations jsonb not null default '[]'::jsonb,
  module_toggles jsonb not null default '{}'::jsonb,
  force_mfa boolean not null default false,
  strict_password_rotation boolean not null default false,
  biometric_reauth boolean not null default false,
  maintenance_message text,
  public_booking_enabled boolean not null default true,
  guest_portal_enabled boolean not null default true,
  vip_spend_threshold numeric not null default 0.00,
  public_page_content jsonb not null default '{}'::jsonb,
  terms_adventure_liability text,
  terms_waitlist_protocol text,
  terms_conservation_devotion text,
  terms_billing_cancellation text,
  terms_wilderness_emergency text,
  booking_terms text,
  policy_sections jsonb not null default '[]'::jsonb,
  fee_components jsonb not null default '[]'::jsonb
);

-- Add fee_components column to existing global_settings table (migration for live DB)
alter table global_settings add column if not exists fee_components jsonb not null default '[]'::jsonb;

-- Add module_toggles column to existing global_settings table (migration for live DB)
alter table global_settings add column if not exists module_toggles jsonb not null default '{}'::jsonb;

-- Add missing settings columns to existing global_settings table (migration for live DB)
alter table global_settings add column if not exists hero_image_url text;

-- Add terms columns to existing global_settings table (migration for live DB)
alter table global_settings add column if not exists terms_adventure_liability text;
alter table global_settings add column if not exists terms_waitlist_protocol text;
alter table global_settings add column if not exists terms_conservation_devotion text;
alter table global_settings add column if not exists terms_billing_cancellation text;
alter table global_settings add column if not exists terms_wilderness_emergency text;
alter table global_settings add column if not exists booking_terms text;
alter table global_settings add column if not exists contact_phone text;
alter table global_settings add column if not exists public_tagline text;
alter table global_settings add column if not exists social_links jsonb not null default '[]'::jsonb;
alter table global_settings add column if not exists force_mfa boolean not null default false;
alter table global_settings add column if not exists strict_password_rotation boolean not null default false;
alter table global_settings add column if not exists biometric_reauth boolean not null default false;
alter table global_settings add column if not exists maintenance_message text;
alter table global_settings add column if not exists public_booking_enabled boolean not null default true;
alter table global_settings add column if not exists guest_portal_enabled boolean not null default true;
alter table global_settings add column if not exists vip_spend_threshold numeric not null default 0.00;
alter table global_settings add column if not exists public_page_content jsonb not null default '{}'::jsonb;

-- FEE COMPONENTS TABLE (configurable taxes, service charges, environmental fees, etc.)
create table if not exists fee_components (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  fee_type text not null check (fee_type in ('percentage', 'fixed_amount')),
  value numeric not null,
  is_enabled boolean not null default true,
  display_order integer not null default 0,
  account_code text references chart_of_accounts(code) on delete set null,
  applies_to text[] not null default '{All}'::text[],
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_fee_components_enabled on fee_components(is_enabled);
create index if not exists idx_fee_components_order on fee_components(display_order asc);

-- Enable RLS on all tables (Optional but standard for Supabase)
alter table rooms enable row level security;
alter table guests enable row level security;
alter table reservations enable row level security;
alter table rate_plans enable row level security;
alter table seasons enable row level security;
alter table packages enable row level security;
alter table inventory_stores enable row level security;
alter table inventory_items enable row level security;
alter table system_users enable row level security;
alter table custom_roles enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table user_roles enable row level security;
alter table role_permissions enable row level security;
alter table user_sessions enable row level security;
alter table audit_events enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table dispatched_emails enable row level security;
alter table guest_feedbacks enable row level security;
alter table inventory_requisitions enable row level security;
alter table inventory_suppliers enable row level security;
alter table inventory_stock_movements enable row level security;
alter table inventory_grns enable row level security;
alter table chart_of_accounts enable row level security;
alter table journal_entries enable row level security;
alter table sales_transactions enable row level security;
alter table expense_requests enable row level security;
alter table global_settings enable row level security;
alter table fee_components enable row level security;
alter table folios enable row level security;
alter table folio_lines enable row level security;
alter table folio_payments enable row level security;
alter table invoice_documents enable row level security;
alter table fiscal_periods enable row level security;
alter table journal_batches enable row level security;
alter table journal_lines enable row level security;
alter table posting_rules enable row level security;
alter table business_dates enable row level security;
alter table void_audit_log enable row level security;

-- Create basic access policies (Permit all anonymous reads and writes for simulation/development)
-- You can tighten these once authentication flows are strictly restricted.
drop policy if exists "Allow all public reads" on rooms;
create policy "Allow all public reads" on rooms for select using (true);
drop policy if exists "Allow all public writes" on rooms;
create policy "Allow all public writes" on rooms for all using (true) with check (true);

drop policy if exists "Allow all public reads" on guests;
create policy "Allow all public reads" on guests for select using (true);
drop policy if exists "Allow all public writes" on guests;
create policy "Allow all public writes" on guests for all using (true) with check (true);

drop policy if exists "Allow all public reads" on reservations;
create policy "Allow all public reads" on reservations for select using (true);
drop policy if exists "Allow all public writes" on reservations;
create policy "Allow all public writes" on reservations for all using (true) with check (true);

drop policy if exists "Allow all public reads" on rate_plans;
create policy "Allow all public reads" on rate_plans for select using (true);
drop policy if exists "Allow all public writes" on rate_plans;
create policy "Allow all public writes" on rate_plans for all using (true) with check (true);

drop policy if exists "Allow all public reads" on seasons;
create policy "Allow all public reads" on seasons for select using (true);
drop policy if exists "Allow all public writes" on seasons;
create policy "Allow all public writes" on seasons for all using (true) with check (true);

drop policy if exists "Allow all public reads" on packages;
create policy "Allow all public reads" on packages for select using (true);
drop policy if exists "Allow all public writes" on packages;
create policy "Allow all public writes" on packages for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_stores;
create policy "Allow all public reads" on inventory_stores for select using (true);
drop policy if exists "Allow all public writes" on inventory_stores;
create policy "Allow all public writes" on inventory_stores for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_items;
create policy "Allow all public reads" on inventory_items for select using (true);
drop policy if exists "Allow all public writes" on inventory_items;
create policy "Allow all public writes" on inventory_items for all using (true) with check (true);

drop policy if exists "Allow all public reads" on system_users;
drop policy if exists "Allow all public writes" on system_users;

drop policy if exists "Allow all public reads" on custom_roles;
create policy "Allow all public reads" on custom_roles for select using (true);
drop policy if exists "Allow all public writes" on custom_roles;
create policy "Allow all public writes" on custom_roles for all using (true) with check (true);

drop policy if exists "Allow all public reads" on roles;
drop policy if exists "Allow all public writes" on roles;
drop policy if exists "Allow all public reads" on permissions;
drop policy if exists "Allow all public writes" on permissions;
drop policy if exists "Allow all public reads" on user_roles;
drop policy if exists "Allow all public writes" on user_roles;
drop policy if exists "Allow all public reads" on role_permissions;
drop policy if exists "Allow all public writes" on role_permissions;
drop policy if exists "Allow all public reads" on user_sessions;
drop policy if exists "Allow all public writes" on user_sessions;
drop policy if exists "Allow all public reads" on audit_events;
drop policy if exists "Allow all public writes" on audit_events;

drop policy if exists "Allow all public reads" on audit_logs;
create policy "Allow all public reads" on audit_logs for select using (true);
drop policy if exists "Allow all public writes" on audit_logs;
create policy "Allow all public writes" on audit_logs for all using (true) with check (true);

drop policy if exists "Allow all public reads" on notifications;
create policy "Allow all public reads" on notifications for select using (true);
drop policy if exists "Allow all public writes" on notifications;
create policy "Allow all public writes" on notifications for all using (true) with check (true);

drop policy if exists "Allow all public reads" on dispatched_emails;
create policy "Allow all public reads" on dispatched_emails for select using (true);
drop policy if exists "Allow all public writes" on dispatched_emails;
create policy "Allow all public writes" on dispatched_emails for all using (true) with check (true);

drop policy if exists "Allow all public reads" on guest_feedbacks;
create policy "Allow all public reads" on guest_feedbacks for select using (true);
drop policy if exists "Allow all public writes" on guest_feedbacks;
create policy "Allow all public writes" on guest_feedbacks for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_requisitions;
create policy "Allow all public reads" on inventory_requisitions for select using (true);
drop policy if exists "Allow all public writes" on inventory_requisitions;
create policy "Allow all public writes" on inventory_requisitions for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_suppliers;
create policy "Allow all public reads" on inventory_suppliers for select using (true);
drop policy if exists "Allow all public writes" on inventory_suppliers;
create policy "Allow all public writes" on inventory_suppliers for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_stock_movements;
create policy "Allow all public reads" on inventory_stock_movements for select using (true);
drop policy if exists "Allow all public writes" on inventory_stock_movements;
create policy "Allow all public writes" on inventory_stock_movements for all using (true) with check (true);

drop policy if exists "Allow all public reads" on inventory_grns;
create policy "Allow all public reads" on inventory_grns for select using (true);
drop policy if exists "Allow all public writes" on inventory_grns;
create policy "Allow all public writes" on inventory_grns for all using (true) with check (true);

drop policy if exists "Allow all public reads" on chart_of_accounts;
create policy "Allow all public reads" on chart_of_accounts for select using (true);
drop policy if exists "Allow all public writes" on chart_of_accounts;
create policy "Allow all public writes" on chart_of_accounts for all using (true) with check (true);

drop policy if exists "Allow all public reads" on journal_entries;
create policy "Allow all public reads" on journal_entries for select using (true);
drop policy if exists "Allow all public writes" on journal_entries;
create policy "Allow all public writes" on journal_entries for all using (true) with check (true);

drop policy if exists "Allow all public reads" on sales_transactions;
create policy "Allow all public reads" on sales_transactions for select using (true);
drop policy if exists "Allow all public writes" on sales_transactions;
create policy "Allow all public writes" on sales_transactions for all using (true) with check (true);

drop policy if exists "Allow all public reads" on expense_requests;
create policy "Allow all public reads" on expense_requests for select using (true);
drop policy if exists "Allow all public writes" on expense_requests;
create policy "Allow all public writes" on expense_requests for all using (true) with check (true);

drop policy if exists "Allow all public reads" on global_settings;
create policy "Allow all public reads" on global_settings for select using (true);
drop policy if exists "Allow all public writes" on global_settings;
create policy "Allow all public writes" on global_settings for all using (true) with check (true);

-- Phase 2 tables: drop any public policies (server-side access only via service_role)
drop policy if exists "Allow all public reads" on folios;
drop policy if exists "Allow all public writes" on folios;
drop policy if exists "Allow all public reads" on folio_lines;
drop policy if exists "Allow all public writes" on folio_lines;
drop policy if exists "Allow all public reads" on folio_payments;
drop policy if exists "Allow all public writes" on folio_payments;
drop policy if exists "Allow all public reads" on invoice_documents;
drop policy if exists "Allow all public writes" on invoice_documents;
drop policy if exists "Allow all public reads" on fiscal_periods;
drop policy if exists "Allow all public writes" on fiscal_periods;
drop policy if exists "Allow all public reads" on journal_batches;
drop policy if exists "Allow all public writes" on journal_batches;
drop policy if exists "Allow all public reads" on journal_lines;
drop policy if exists "Allow all public writes" on journal_lines;
drop policy if exists "Allow all public reads" on posting_rules;
drop policy if exists "Allow all public writes" on posting_rules;
drop policy if exists "Allow all public reads" on business_dates;
drop policy if exists "Allow all public writes" on business_dates;
drop policy if exists "Allow all public reads" on void_audit_log;
drop policy if exists "Allow all public writes" on void_audit_log;

-- ======================================================================================
-- MIGRATION: Create folios for existing checked-in reservations without folios
-- ======================================================================================
insert into folios (id, reservation_id, folio_type, status, balance, total_charges, total_payments, currency, opened_at, created_by)
select
  gen_random_uuid()::text,
  r.id,
  'Guest',
  'Open',
  coalesce((select sum((c->>'amount')::numeric) from jsonb_array_elements(r.charges) as c where (c->>'isVoided')::boolean != true), 0.00)
  - coalesce((select sum((p->>'amount')::numeric) from jsonb_array_elements(r.payments) as p where (p->>'isVoided')::boolean != true), 0.00),
  coalesce((select sum((c->>'amount')::numeric) from jsonb_array_elements(r.charges) as c where (c->>'isVoided')::boolean != true), 0.00),
  coalesce((select sum((p->>'amount')::numeric) from jsonb_array_elements(r.payments) as p where (p->>'isVoided')::boolean != true), 0.00),
  'USD',
  now(),
  null
from reservations r
left join folios f on f.reservation_id = r.id
where r.status = 'CheckedIn'
and f.id is null;

-- Migrate existing charges to folio_lines (skipped for fresh DB)
-- Migrate existing payments to folio_payments (skipped for fresh DB)
-- ============================================
-- PRE-SEEDING DATA (MATCHING ERP INITIAL STATE)
-- ============================================

insert into roles (id, name, description, is_system, is_superuser) values
('role_frontoffice', 'frontoffice', 'Front Office role', true, false),
('role_housekeeping', 'housekeeping', 'Housekeeping role', true, false),
('role_fb', 'f&b', 'Food & Beverage role', true, false),
('role_maintenance', 'maintenance', 'Maintenance role', true, false),
('role_inventory', 'inventory', 'Inventory role', true, false),
('role_finance', 'finance', 'Finance role', true, false),
('role_hr', 'hr', 'Human Resources role', true, false),
('role_executive', 'executive', 'Executive superuser role', true, true),
('role_procurement', 'procurement', 'Procurement role', true, false)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  is_superuser = excluded.is_superuser,
  updated_at = now();

insert into permissions (id, code, module, description) values
('perm_reservation_create', 'reservation:create', 'frontoffice', 'Create reservation'),
('perm_reservation_update', 'reservation:update', 'frontoffice', 'Update reservation'),
('perm_reservation_delete', 'reservation:delete', 'frontoffice', 'Delete reservation'),
('perm_reservation_check_in', 'reservation:check_in', 'frontoffice', 'Check in guest'),
('perm_reservation_check_out', 'reservation:check_out', 'frontoffice', 'Check out guest'),
('perm_folio_charge_add', 'folio:charge:add', 'frontoffice', 'Add folio charge'),
('perm_folio_charge_void', 'folio:charge:void', 'finance', 'Void folio charge'),
('perm_folio_payment_add', 'folio:payment:add', 'frontoffice', 'Add folio payment'),
('perm_folio_payment_void', 'folio:payment:void', 'finance', 'Void folio payment'),
('perm_room_status_update', 'room:status:update', 'housekeeping', 'Update room status'),
('perm_rates_view', 'rates:view', 'frontoffice', 'View rates'),
('perm_rates_update', 'rates:update', 'frontoffice', 'Update rates'),
('perm_reports_view', 'reports:view', 'shared', 'View reports'),
('perm_reports_export', 'reports:export', 'shared', 'Export reports'),
('perm_settings_update', 'settings:update', 'admin', 'Update global settings'),
('perm_settings_tax_update', 'settings:tax:update', 'finance', 'Update tax settings'),
('perm_users_manage', 'users:manage', 'admin', 'Manage users'),
('perm_roles_manage', 'roles:manage', 'admin', 'Manage roles'),
('perm_audit_view', 'audit:view', 'admin', 'View audit events'),
('perm_inventory_adjust', 'inventory:stock:adjust', 'inventory', 'Adjust stock'),
('perm_inventory_transfer_create', 'inventory:transfer:create', 'inventory', 'Create inventory transfer'),
('perm_procurement_requisition_approve', 'procurement:requisition:approve', 'procurement', 'Approve requisition'),
('perm_procurement_po_create', 'procurement:po:create', 'procurement', 'Create purchase order'),
('perm_procurement_po_approve', 'procurement:po:approve', 'procurement', 'Approve purchase order'),
('perm_finance_journal_create', 'finance:journal:create', 'finance', 'Create journal entry'),
('perm_finance_journal_post', 'finance:journal:post', 'finance', 'Post journal entry'),
('perm_finance_period_close', 'finance:period:close', 'finance', 'Close fiscal period'),
('perm_night_audit_run', 'night_audit:run', 'frontoffice', 'Run night audit')
on conflict (id) do update set
  code = excluded.code,
  module = excluded.module,
  description = excluded.description;

insert into role_permissions (role_id, permission_id)
select 'role_frontoffice', id from permissions
where code in (
  'reservation:create',
  'reservation:update',
  'reservation:check_in',
  'reservation:check_out',
  'folio:charge:add',
  'folio:payment:add',
  'rates:view',
  'reports:view',
  'night_audit:run'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_housekeeping', id from permissions
where code in (
  'room:status:update',
  'reports:view'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_fb', id from permissions
where code in (
  'folio:charge:add',
  'folio:payment:add',
  'reports:view'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_maintenance', id from permissions
where code in (
  'room:status:update',
  'reports:view'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_inventory', id from permissions
where code in (
  'inventory:stock:adjust',
  'inventory:transfer:create',
  'reports:view',
  'reports:export'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_finance', id from permissions
where code in (
  'folio:charge:void',
  'folio:payment:void',
  'rates:view',
  'rates:update',
  'settings:tax:update',
  'audit:view',
  'reports:view',
  'reports:export',
  'finance:journal:create',
  'finance:journal:post',
  'finance:period:close'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_hr', id from permissions
where code in (
  'users:manage',
  'audit:view',
  'reports:view'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_procurement', id from permissions
where code in (
  'procurement:requisition:approve',
  'procurement:po:create',
  'procurement:po:approve',
  'reports:view',
  'reports:export'
)
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select 'role_executive', id from permissions
on conflict do nothing;

-- Seed Chart of Accounts (needed for fee component revenue account mapping)
insert into chart_of_accounts (id, code, name, category, is_active) values
(gen_random_uuid()::text, '1010', 'Cash on Hand', 'Asset', true),
(gen_random_uuid()::text, '1020', 'Bank - Operating', 'Asset', true),
(gen_random_uuid()::text, '1100', 'Accounts Receivable', 'Asset', true),
(gen_random_uuid()::text, '2200', 'Tax Payable', 'Liability', true),
(gen_random_uuid()::text, '2300', 'Service Charge Payable', 'Liability', true),
(gen_random_uuid()::text, '2400', 'Environmental Tax Payable', 'Liability', true),
(gen_random_uuid()::text, '4010', 'Room Revenue', 'Revenue', true),
(gen_random_uuid()::text, '4020', 'F&B Revenue', 'Revenue', true),
(gen_random_uuid()::text, '4030', 'Gift Shop Revenue', 'Revenue', true),
(gen_random_uuid()::text, '4040', 'Miscellaneous Revenue', 'Revenue', true),
(gen_random_uuid()::text, '5010', 'Cost of Sales', 'Expense', true)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  is_active = excluded.is_active;

-- Seed default fee components (VAT + Service Charge)
insert into fee_components (id, name, fee_type, value, is_enabled, display_order, account_code) values
('fc_vat', 'VAT', 'percentage', 15.0, true, 1, '2200'),
('fc_sc', 'Service Charge', 'percentage', 10.0, true, 2, '2300')
on conflict (id) do update set
  name = excluded.name,
  fee_type = excluded.fee_type,
  value = excluded.value,
  is_enabled = excluded.is_enabled,
  display_order = excluded.display_order,
  account_code = excluded.account_code;

-- Seed global settings
insert into global_settings (
  id, custom_hotel_name, custom_hotel_address, hotel_tin, hotel_vat_no, hotel_vat_date,
  tax_percent, service_charge_percent, exchange_rate, hero_image_url, contact_phone,
  public_tagline, social_links, invoice_template, payment_types, fee_components,
  module_toggles, force_mfa, strict_password_rotation, biometric_reauth,
  maintenance_message, public_booking_enabled, guest_portal_enabled,
  vip_spend_threshold, public_page_content, terms_adventure_liability, terms_waitlist_protocol,
  terms_conservation_devotion, terms_billing_cancellation, terms_wilderness_emergency
) values (
  'main', 'Grand Hotel ERP', 'Main Street, City, Country', '', '', '',
  15.0, 10.0, 120.0,
  '/src/assets/images/gheralta_hero_banner_1780826654743.png',
  '+251-11-RECEPTION',
  'Experience organic luxury carved from local red sandstones.',
  '[{"platform":"Instagram","url":"#"},{"platform":"Facebook","url":"#"}]'::jsonb,
  'modern',
  '{"Cash", "Credit Card", "Mobile Money", "Bank Transfer"}'::text[],
  '[{"id":"fc_vat","name":"VAT","feeType":"percentage","value":15,"isEnabled":true,"displayOrder":1,"accountCode":"2200"},{"id":"fc_sc","name":"Service Charge","feeType":"percentage","value":10,"isEnabled":true,"displayOrder":2,"accountCode":"2300"}]'::jsonb,
  '{}'::jsonb, false, false, false,
  'The system is undergoing scheduled maintenance. Some features may be temporarily unavailable.',
  true, true, 0.00,
  '{"guestPortalTitle":"Guest Companion Portal","guestPortalSubtitle":"Select a simulated room occupant to trigger digital keys, room service demands, checkout balance settling, or guest requests.","guestDirectoryItems":[{"label":"Check-In Hour","text":"3:00 PM"},{"label":"Check-Out Hour","text":"11:00 AM"},{"label":"Spa & Wellness","text":"8:00 AM - 10:00 PM"},{"label":"Pool Access","text":"6:00 AM - 11:00 PM"},{"label":"Breakfast Room","text":"Level G, 07:00 - 10:30"},{"label":"Emergency","text":"Dial 9 from Room Phone"}],"guestPolicyText":"Respect quiet hours (11 PM - 7 AM). Non-smoking facility. Pets allowed in designated suites only. Enjoy your stay.","guestWifiSsid":"Hotel_Guest_WiFi","guestWifiPasswordPattern":"Welcome@{roomNumber}","giftShopTitle":"Luxe Souvenirs","serviceRequestTitle":"Companion Requests","bookingHeroBadge":"HIGHLANDS • MOUNTAINS • PORTAL","bookingRoomSectionTitle":"Traditional Stone Bungalows","bookingRoomSectionSubtitle":"Each bungalow features dry-stone walls and provides stunning views of the surrounding landscapes.","bookingStoryTitle":"The Heritage & Eco-Values","bookingStoryText":"The Lodge was constructed using purely local sandstones and ancient clay techniques in harmony with environmental laws."}'::jsonb,
  'The Mountain Lodge is physically situated on sheer towering sandstone cliffs in a remote highland region. All hiking trails, climbing paths, vertical rope ladders, and remote monastery peak expeditions are highly physically demanding and undertaken solely at the explorer''s own personal hazard risk.',
  'To guarantee guest peak safety configuration guidelines, ecological tourist volume control, and precise cottage matching, all direct and online booking registrations land in an active "Waitlisted" status on our synchronized ERP engine.',
  'Our sandstone cottages represent indigenous heritage architectural preservation. Guests pledge complete adherence to local community conservation guidelines. Water is an extremely sparse commodity in this region; artesian well resources must be utilized with high-efficiency mindfulness.',
  'All bookings require a valid secondary Credit/Debit card presentation as stay collateral during digital checkout submission. There is no instant charge under the waitlist; however, registering invalid payment coordinates will void waitlist priority bounds.',
  'In case of extreme mountaineering trauma or altitude disorientation, the lodge operates a designated heli-evacuation coordinate landing zone in coordinate contact with local emergency trackers. Cellular signals on remote peaks can drift; we recommend always reporting your hourly ascension pathway mapping to our front desk officer.'
)
on conflict (id) do update set
  tax_percent = excluded.tax_percent,
  service_charge_percent = excluded.service_charge_percent,
  exchange_rate = excluded.exchange_rate,
  hero_image_url = excluded.hero_image_url,
  contact_phone = excluded.contact_phone,
  public_tagline = excluded.public_tagline,
  social_links = excluded.social_links,
  fee_components = excluded.fee_components,
  module_toggles = excluded.module_toggles,
  force_mfa = excluded.force_mfa,
  strict_password_rotation = excluded.strict_password_rotation,
  biometric_reauth = excluded.biometric_reauth,
  maintenance_message = excluded.maintenance_message,
  public_booking_enabled = excluded.public_booking_enabled,
  guest_portal_enabled = excluded.guest_portal_enabled,
  vip_spend_threshold = excluded.vip_spend_threshold,
  public_page_content = excluded.public_page_content,
  terms_adventure_liability = excluded.terms_adventure_liability,
  terms_waitlist_protocol = excluded.terms_waitlist_protocol,
  terms_conservation_devotion = excluded.terms_conservation_devotion,
  terms_billing_cancellation = excluded.terms_billing_cancellation,
  terms_wilderness_emergency = excluded.terms_wilderness_emergency;

insert into system_users (
  id,
  name,
  email,
  role,
  role_description,
  avatar_initials,
  status,
  password_hash,
  password_updated_at,
  allowed_tabs,
  allowed_settings
) values
('U-101', 'Front Office Supervisor', 'frontoffice@erp.com', 'frontoffice', 'Night Auditor', 'FO', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"frontoffice", "settings"}', '{"viewRatePlans": true, "viewRoomOutlook": true, "viewSalesCampaigns": true}'::jsonb),
('U-102', 'Housekeeping Manager', 'housekeeping@erp.com', 'housekeeping', 'HK Supervisor', 'HK', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"housekeeping", "settings"}', '{"viewRoomOutlook": true}'::jsonb),
('U-103', 'F&B Director', 'fb@erp.com', 'f&b', 'Culinary Director', 'FB', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"f&b", "settings"}', '{"viewRoomOutlook": true}'::jsonb),
('U-104', 'Chief Engineer', 'maintenance@erp.com', 'maintenance', 'Chief Engineer', 'CE', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"maintenance", "settings"}', '{"viewRoomOutlook": true}'::jsonb),
('U-105', 'General Manager', 'gm@erp.com', 'executive', 'General Manager', 'GM', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"frontoffice", "housekeeping", "f&b", "maintenance", "inventory", "finance", "hr", "executive", "admin", "procurement", "settings"}', '{"editGlobalSettings": true, "adjustHotelTaxes": true, "bypassHousekeepingLock": true, "manageUserAccounts": true, "viewRatePlans": true, "editRatePlans": true, "viewRoomOutlook": true, "viewSalesCampaigns": true, "manageSalesCampaigns": true}'::jsonb),
('U-106', 'Finance Controller', 'finance@erp.com', 'finance', 'Finance Controller', 'FC', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"finance", "settings"}', '{"viewRatePlans": true, "editRatePlans": true, "adjustHotelTaxes": true}'::jsonb),
('U-107', 'HR Manager', 'hr@erp.com', 'hr', 'HR Manager', 'HR', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"hr", "settings"}', '{"manageUserAccounts": true}'::jsonb),
('U-108', 'Inventory Manager', 'inventory@erp.com', 'inventory', 'Stores Manager', 'IM', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"inventory", "settings"}', '{}'::jsonb),
('U-109', 'Procurement Lead', 'procurement@erp.com', 'procurement', 'Procurement Lead', 'PL', 'Active', crypt('admin123', gen_salt('bf', 10)), now(), '{"procurement", "settings"}', '{}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  role_description = excluded.role_description,
  avatar_initials = excluded.avatar_initials,
  status = excluded.status,
  password_hash = excluded.password_hash,
  password_updated_at = excluded.password_updated_at,
  allowed_tabs = excluded.allowed_tabs,
  allowed_settings = excluded.allowed_settings,
  updated_at = now();

insert into user_roles (user_id, role_id) values
('U-101', 'role_frontoffice'),
('U-102', 'role_housekeeping'),
('U-103', 'role_fb'),
('U-104', 'role_maintenance'),
('U-105', 'role_executive'),
('U-106', 'role_finance'),
('U-107', 'role_hr'),
('U-108', 'role_inventory'),
('U-109', 'role_procurement')
on conflict do nothing;

-- Seed Rooms
insert into rooms (id, number, type, floor, status, rate, features) values
('101', '101', 'Single', 1, 'Vacant Clean', 120, '{"Wifi", "TV", "Desk"}'),
('102', '102', 'Single', 1, 'Vacant Clean', 120, '{"Wifi", "TV", "Desk"}'),
('103', '103', 'Single', 1, 'Vacant Clean', 125, '{"Wifi", "TV", "Desk", "Mini-bar"}'),
('104', '104', 'Single', 1, 'Vacant Clean', 120, '{"Wifi", "TV"}'),
('105', '105', 'Single', 1, 'Vacant Clean', 120, '{"Wifi", "TV", "Desk"}'),
('201', '201', 'Double', 2, 'Vacant Clean', 180, '{"Wifi", "TV", "AC", "Ocean View"}'),
('202', '202', 'Double', 2, 'Vacant Clean', 180, '{"Wifi", "TV", "AC", "Garden View"}'),
('203', '203', 'Double', 2, 'Vacant Clean', 185, '{"Wifi", "TV", "AC", "Mini Fridge"}'),
('204', '204', 'Double', 2, 'Vacant Clean', 180, '{"Wifi", "TV", "AC"}'),
('205', '205', 'Double', 2, 'Vacant Clean', 190, '{"Wifi", "TV", "AC", "Balcony"}'),
('301', '301', 'Double', 3, 'Vacant Clean', 195, '{"Wifi", "TV", "Balcony", "Safe"}'),
('302', '302', 'Double', 3, 'Vacant Clean', 195, '{"Wifi", "TV", "Balcony", "Safe"}'),
('303', '303', 'Single', 3, 'Vacant Clean', 130, '{"Wifi", "TV", "Desk"}'),
('304', '304', 'Double', 3, 'Vacant Clean', 195, '{"Wifi", "TV", "Safe"}'),
('305', '305', 'Suite', 3, 'Vacant Clean', 320, '{"Wifi", "King Bed", "Kitchenette", "Living Area", "Jaccuzi"}'),
('401', '401', 'Suite', 4, 'Vacant Clean', 350, '{"Wifi", "Living Area", "King Bed", "Coffee machine", "City View"}'),
('402', '402', 'Suite', 4, 'Vacant Clean', 350, '{"Wifi", "Living Area", "King Bed", "Coffee machine"}'),
('403', '403', 'Deluxe', 4, 'Vacant Clean', 260, '{"Wifi", "Balcony", "AC", "Mini-bar"}'),
('404', '404', 'Deluxe', 4, 'Vacant Clean', 260, '{"Wifi", "Balcony", "AC", "Mini-bar"}'),
('405', '405', 'Deluxe', 4, 'Vacant Clean', 260, '{"Wifi", "Balcony", "AC"}'),
('501', '501', 'Deluxe', 5, 'Vacant Clean', 280, '{"Wifi", "Top Floor View", "Jaccuzi", "Premium Audio"}'),
('502', '502', 'Penthouse', 5, 'Vacant Clean', 650, '{"Private Elevator", "Panoramic Terrace", "Infiniti Pool Access", "Private Bar", "Butler Service"}'),
('503', '503', 'Penthouse', 5, 'Vacant Clean', 700, '{"Private Elevator", "Panoramic Terrace", "Ocean View", "Private Bar", "Chef On Demand"}')
on conflict (id) do nothing;

-- Seed Rate Plans
insert into rate_plans (id, name, description, base_modifier, active) values
('RP-STD', 'Standard Rate', 'Base flexible rate', 1.0, true),
('RP-NRF', 'Non-Refundable', '10% discount for pre-payment', 0.9, true),
('RP-BB', 'Bed & Breakfast', 'Includes gourmet breakfast buffet', 1.2, true),
('RP-SPA', 'Spa Package', 'Includes 1 hour daily spa treatment', 1.5, true)
on conflict (id) do nothing;

-- Seed Seasons
insert into seasons (id, name, start_month, start_day, end_month, end_day, multiplier) values
('S-PEAK', 'Summer High Season', 5, 1, 7, 31, 1.5),
('S-WINTER', 'Winter Holiday', 11, 15, 11, 31, 1.8),
('S-LOW', 'Off-Peak Monsoons', 8, 1, 9, 30, 0.7)
on conflict (id) do nothing;

-- Seed Packages
insert into packages (id, name, description, price, charge_frequency) values
('PKG-AIRPORT', 'Airport Shuttle', 'One-way pickup/drop-off', 45, 'once'),
('PKG-WIFI', 'Premium WiFi', 'Uncapped gigabit speed', 15, 'daily'),
('PKG-MINIBAR', 'Mini-Bar Refill', 'Daily snack & drinks restock', 25, 'daily')
on conflict (id) do nothing;

-- Seed Inventory Stores
insert into inventory_stores (id, name, type, manager) values
('ST-MAIN', 'Central Warehouse', 'Main', 'Warehouse Manager'),
('ST-GIFT', 'Gift Store', 'Departmental', 'Gift Shop Supervisor'),
('ST-BAR', 'Bar Store', 'Departmental', 'Bar Manager'),
('ST-REST', 'Restaurant Store', 'Departmental', 'Head Chef'),
('ST-HK', 'Housekeeping Central', 'Departmental', 'Executive Housekeeper'),
('ST-OFC', 'Front Office Store', 'Departmental', 'Front Desk Manager')
on conflict (id) do nothing;

-- ================================================================================
-- AUTOMATIC GUEST-TO-GROUP PROFILE LINKING SYSTEM
-- ================================================================================

-- 1. GROUP PROFILES TABLE
create table if not exists group_profiles (
  id text primary key,
  code text unique not null,
  name text not null,
  type text not null check (type in (
    'GroupReservation',
    'CorporateAccount',
    'TravelAgent',
    'TourOperator',
    'CrewBooking',
    'Conference',
    'Event',
    'LongTermContract'
  )),
  status text not null default 'Active' check (status in (
    'Active',
    'Inactive',
    'Suspended',
    'Blacklisted',
    'Archived'
  )),
  
  -- Contact Information
  contact_name text,
  contact_email text,
  contact_phone text,
  organization_name text,
  billing_address jsonb not null default '{}'::jsonb,
  
  -- Financial Information
  credit_limit numeric not null default 0.00,
  current_balance numeric not null default 0.00,
  payment_terms text not null default 'Net 30',
  payment_method text check (payment_method in ('Credit', 'Cash', 'Check', 'Bank Transfer', 'Mixed')),
  tax_id text,
  vat_number text,
  
  -- Contract Information
  contract_start_date date,
  contract_end_date date,
  discount_percent numeric not null default 0.00,
  commission_percent numeric not null default 0.00,
  
  -- Analytics
  total_revenue numeric not null default 0.00,
  total_room_nights integer not null default 0,
  total_stays integer not null default 0,
  average_daily_rate numeric not null default 0.00,
  total_rooms_used integer not null default 0,
  
  -- Metadata
  notes text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for group_profiles
create index if not exists idx_group_profiles_code on group_profiles(code);
create index if not exists idx_group_profiles_type on group_profiles(type);
create index if not exists idx_group_profiles_status on group_profiles(status);
create index if not exists idx_group_profiles_organization on group_profiles(organization_name);

-- 2. GUEST GROUP RELATIONSHIPS TABLE
create table if not exists guest_group_relationships (
  id text primary key,
  guest_id text not null references guests(id) on delete cascade,
  group_id text not null references group_profiles(id) on delete cascade,
  
  -- Relationship Details
  relationship_type text not null check (relationship_type in (
    'GroupReservation',
    'CorporateAccount',
    'TravelAgent',
    'TourOperator',
    'CrewBooking',
    'Conference',
    'Event',
    'LongTermContract'
  )),
  status text not null default 'Active' check (status in (
    'Active',
    'Inactive',
    'Terminated',
    'Expired'
  )),
  is_primary_contact boolean not null default false,
  role_title text,
  
  -- Date Tracking
  start_date date not null default current_date,
  end_date date,
  
  -- Analytics
  total_stays integer not null default 0,
  total_revenue numeric not null default 0.00,
  total_room_nights integer not null default 0,
  last_stay_date date,
  
  -- Linking Context
  reservation_id text references reservations(id) on delete set null,
  linked_via text check (linked_via in ('Manual', 'Automatic', 'Reservation', 'CheckIn')),
  linked_reason text,
  
  -- Metadata
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for guest_group_relationships
create index if not exists idx_guest_group_relationships_guest_id on guest_group_relationships(guest_id);
create index if not exists idx_guest_group_relationships_group_id on guest_group_relationships(group_id);
create index if not exists idx_guest_group_relationships_status on guest_group_relationships(status);
create index if not exists idx_guest_group_relationships_type on guest_group_relationships(relationship_type);
create index if not exists idx_guest_group_relationships_dates on guest_group_relationships(start_date, end_date);

-- 3. GROUP AUDIT LOG TABLE
create table if not exists group_audit_log (
  id text primary key,
  group_id text references group_profiles(id) on delete cascade,
  guest_id text,
  relationship_id text references guest_group_relationships(id) on delete set null,
  
  -- Audit Details
  action text not null check (action in (
    'group_created',
    'group_updated',
    'group_deleted',
    'guest_linked',
    'guest_unlinked',
    'relationship_updated',
    'analytics_updated',
    'status_changed'
  )),
  entity_type text check (entity_type in ('GroupProfile', 'GuestGroupRelationship')),
  entity_id text,
  
  -- Context
  user_id text,
  user_name text,
  module text,
  outcome text check (outcome in ('success', 'failure', 'denied')),
  
  -- Details
  details jsonb not null default '{}'::jsonb,
  previous_values jsonb not null default '{}'::jsonb,
  new_values jsonb not null default '{}'::jsonb,
  reason text,
  
  -- Timestamp
  created_at timestamptz not null default now()
);

-- Indexes for group_audit_log
create index if not exists idx_group_audit_log_group_id on group_audit_log(group_id);
create index if not exists idx_group_audit_log_action on group_audit_log(action);
create index if not exists idx_group_audit_log_created_at on group_audit_log(created_at desc);

-- 4. UPDATE EXISTING TABLES WITH FOREIGN KEYS

-- Add group_id to reservations table
alter table reservations add column if not exists group_id text references group_profiles(id) on delete set null;
create index if not exists idx_reservations_group_id on reservations(group_id);

-- Add group relationship fields to guests table
alter table guests add column if not exists parent_group_id text references group_profiles(id) on delete set null;
alter table guests add column if not exists parent_corporate_id text references group_profiles(id) on delete set null;
alter table guests add column if not exists is_primary_contact boolean not null default false;
alter table guests add column if not exists billing_routing_profile_id text;
create index if not exists idx_guests_parent_group_id on guests(parent_group_id);
create index if not exists idx_guests_parent_corporate_id on guests(parent_corporate_id);

-- 5. AUTOMATIC LINKING FUNCTIONS

-- Function to automatically link guest to group based on reservation
create or replace function auto_link_guest_to_group(p_reservation_id text)
returns boolean as $$
declare
  v_reservation reservations%rowtype;
  v_group_id text;
  v_guest_id text;
  v_existing_relationship guest_group_relationships%rowtype;
  v_new_relationship_id text;
  v_group_type text;
begin
  -- Get reservation details
  select * into v_reservation
  from reservations
  where id = p_reservation_id;
  
  if not found then
    return false;
  end if;
  
  -- Check if reservation has a group_id
  if v_reservation.group_id is null then
    return false;
  end if;
  
  v_group_id := v_reservation.group_id;
  
  -- Get group type
  select type into v_group_type
  from group_profiles
  where id = v_group_id
  limit 1;
  
  if v_group_type is null then
    return false;
  end if;
  
  -- Find or create guest profile
  select id into v_guest_id
  from guests
  where email = v_reservation.guest_email
  limit 1;
  
  if v_guest_id is null then
    -- Create guest profile if it doesn't exist
    v_guest_id := 'G-' || gen_random_uuid()::text;
    
    insert into guests (
      id,
      name,
      email,
      phone,
      status,
      loyalty_points,
      special_requests,
      notes,
      total_spend,
      preferences,
      identification_doc
    )
    values (
      v_guest_id,
      v_reservation.guest_name,
      v_reservation.guest_email,
      v_reservation.guest_phone,
      coalesce(v_reservation.guest_status, 'Regular'),
      0,
      '',
      '',
      0,
      '{}'::jsonb,
      '{}'::jsonb
    );
  end if;
  
  -- Check if guest already has an active relationship with this group
  select * into v_existing_relationship
  from guest_group_relationships
  where guest_id = v_guest_id
  and group_id = v_group_id
  and status = 'Active'
  limit 1;
  
  if found then
    -- Update existing relationship
    update guest_group_relationships
    set 
      total_stays = total_stays + 1,
      last_stay_date = v_reservation.check_in_date,
      updated_at = now()
    where id = v_existing_relationship.id;
  else
    -- Create new relationship
    v_new_relationship_id := 'GGR-' || gen_random_uuid()::text;
    
    insert into guest_group_relationships (
      id,
      guest_id,
      group_id,
      relationship_type,
      status,
      start_date,
      linked_via,
      linked_reason,
      reservation_id,
      created_at,
      updated_at
    )
    values (
      v_new_relationship_id,
      v_guest_id,
      v_group_id,
      v_group_type,
      'Active',
      v_reservation.check_in_date,
      'Reservation',
      'Auto-linked from reservation ' || p_reservation_id,
      p_reservation_id,
      now(),
      now()
    );
    
    -- Update guest's parent_group_id
    update guests
    set parent_group_id = v_group_id
    where id = v_guest_id;
  end if;
  
  -- Log the action
  insert into group_audit_log (
    id,
    group_id,
    action,
    entity_type,
    entity_id,
    module,
    outcome,
    details,
    created_at
  )
  values (
    gen_random_uuid()::text,
    v_group_id,
    'guest_linked',
    'GuestGroupRelationship',
    v_new_relationship_id,
    'auto_linking',
    'success',
    jsonb_build_object(
      'reservation_id', p_reservation_id,
      'guest_email', v_reservation.guest_email,
      'guest_id', v_guest_id,
      'linked_via', 'Reservation'
    ),
    now()
  );
  
  return true;
end;
$$ language plpgsql;

-- Function to update group analytics when reservation is completed
create or replace function update_group_analytics(p_reservation_id text)
returns boolean as $$
declare
  v_reservation reservations%rowtype;
  v_group_id text;
  v_revenue numeric;
  v_nights integer;
begin
  -- Get reservation details
  select * into v_reservation
  from reservations
  where id = p_reservation_id;
  
  if not found then
    return false;
  end if;
  
  v_group_id := v_reservation.group_id;
  
  if v_group_id is null then
    return false;
  end if;
  
  -- Calculate revenue and nights
  v_revenue := v_reservation.total_amount;
  v_nights := (v_reservation.check_out_date - v_reservation.check_in_date);
  
  -- Update group analytics
  update group_profiles
  set 
    total_revenue = total_revenue + v_revenue,
    total_room_nights = total_room_nights + v_nights,
    total_stays = total_stays + 1,
    average_daily_rate = (total_revenue + v_revenue) / nullif((total_room_nights + v_nights), 0),
    total_rooms_used = total_rooms_used + 1,
    updated_at = now()
  where id = v_group_id;
  
  -- Update relationship analytics
  update guest_group_relationships
  set 
    total_revenue = total_revenue + v_revenue,
    total_room_nights = total_room_nights + v_nights,
    updated_at = now()
  where reservation_id = p_reservation_id;
  
  return true;
end;
$$ language plpgsql;

-- 6. TRIGGERS FOR AUTOMATIC LINKING

-- Trigger to auto-link guest to group on reservation creation/update
create or replace function trigger_auto_link_guest()
returns trigger as $$
begin
  if new.group_id is not null and new.status = 'Confirmed' then
    perform auto_link_guest_to_group(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_link_guest on reservations;
create trigger trg_auto_link_guest
after insert or update of group_id, status on reservations
for each row
execute function trigger_auto_link_guest();

-- Trigger to update analytics on reservation completion
create or replace function trigger_update_analytics()
returns trigger as $$
begin
  if new.status = 'CheckedOut' and old.status != 'CheckedOut' then
    perform update_group_analytics(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_analytics on reservations;
create trigger trg_update_analytics
after update of status on reservations
for each row
execute function trigger_update_analytics();

-- ======================================================================================
-- PHASE 3: DOCUMENT STORAGE & VERIFICATION
-- ======================================================================================

-- 22. ID DOCUMENTS TABLE (store guest ID documents with metadata)
create table if not exists id_documents (
  id text primary key,
  guest_id text references guests(id) on delete cascade,
  reservation_id text references reservations(id) on delete set null,
  document_type text not null check (document_type in ('Passport', 'National ID', 'Driver License', 'Other')),
  document_number text,
  document_name text,
  document_country text,
  issue_date date,
  expiry_date date,
  storage_path text not null, -- Supabase Storage path
  storage_bucket text not null default 'id-documents',
  file_name text not null,
  file_size integer,
  file_mime_type text,
  uploaded_at timestamp with time zone not null default now(),
  uploaded_by text references system_users(id) on delete set null,
  is_verified boolean not null default false,
  verified_at timestamp with time zone,
  verified_by text references system_users(id) on delete set null,
  verification_notes text,
  ocr_extracted_data jsonb not null default '{}'::jsonb,
  face_match_score numeric,
  is_primary boolean not null default true
);

create index if not exists idx_id_documents_guest_id on id_documents(guest_id);
create index if not exists idx_id_documents_reservation_id on id_documents(reservation_id);
create index if not exists idx_id_documents_is_verified on id_documents(is_verified);

-- 23. PAYMENT RECEIPTS TABLE (store payment screenshots)
create table if not exists payment_receipts (
  id text primary key,
  folio_payment_id text references folio_payments(id) on delete cascade,
  folio_id text references folios(id) on delete set null,
  reservation_id text references reservations(id) on delete set null,
  payment_method text not null,
  amount numeric not null,
  storage_path text not null, -- Supabase Storage path
  storage_bucket text not null default 'payment-receipts',
  file_name text not null,
  file_size integer,
  file_mime_type text,
  uploaded_at timestamp with time zone not null default now(),
  uploaded_by text references system_users(id) on delete set null,
  is_verified boolean not null default false,
  verified_at timestamp with time zone,
  verified_by text references system_users(id) on delete set null,
  verification_status text check (verification_status in ('Pending', 'Approved', 'Rejected', 'Flagged')) not null default 'Pending',
  rejection_reason text,
  ocr_extracted_data jsonb not null default '{}'::jsonb
);

create index if not exists idx_payment_receipts_folio_payment_id on payment_receipts(folio_payment_id);
create index if not exists idx_payment_receipts_reservation_id on payment_receipts(reservation_id);
create index if not exists idx_payment_receipts_verification_status on payment_receipts(verification_status);

-- 24. DOCUMENT VERIFICATIONS TABLE (audit trail for verification workflow)
create table if not exists document_verifications (
  id text primary key,
  document_id text,
  document_type text not null check (document_type in ('ID Document', 'Payment Receipt')),
  verification_action text not null check (verification_action in ('Submitted', 'Verified', 'Rejected', 'Flagged')),
  previous_status text,
  new_status text,
  verified_by text references system_users(id) on delete set null,
  verified_at timestamp with time zone not null default now(),
  notes text,
  ip_address text,
  user_agent text
);

create index if not exists idx_document_verifications_document_id on document_verifications(document_id);
create index if not exists idx_document_verifications_verified_at on document_verifications(verified_at desc);

-- ======================================================================================
-- PHASE 4: ENHANCED GL POSTING FUNCTIONS
-- ======================================================================================

-- Function: Post folio charges to GL
create or replace function post_folio_charges_to_gl(
  p_folio_id text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_reservation reservations%rowtype;
  v_period fiscal_periods%rowtype;
  v_batch_id text;
  v_batch_name text;
  v_line_count integer := 0;
  v_total_debit numeric := 0.00;
  v_total_credit numeric := 0.00;
  v_now timestamp with time zone := now();
  v_business_date date;
begin
  -- Get current business date
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  -- Get reservation
  select * into v_reservation
  from reservations
  where id = v_folio.reservation_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  -- Get or create fiscal period
  select * into v_period
  from fiscal_periods
  where start_date <= v_business_date and end_date >= v_business_date
  and status = 'Open'
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'No open fiscal period for business date');
  end if;

  -- Create journal batch
  v_batch_id := gen_random_uuid()::text;
  v_batch_name := 'Folio ' || v_folio.id || ' - ' || v_reservation.guest_name;

  insert into journal_batches (
    id, batch_name, batch_type, fiscal_period_id, status,
    total_debit, total_credit, source_module, description,
    created_by, created_at
  ) values (
    v_batch_id, v_batch_name, 'Auto', v_period.id, 'Posted',
    0.00, 0.00, 'frontoffice',
    'Auto-posted folio charges for reservation ' || v_reservation.id,
    p_user_id, v_now
  );

  -- Post each unposted charge line
  for v_line_count in
    select id, amount, line_type, description, revenue_account_code
    from folio_lines
    where folio_id = p_folio_id
    and is_voided = false
    and posted_to_gl = false
  loop
    declare
      v_rule posting_rules%rowtype;
      v_debit_account text;
      v_credit_account text;
      v_journal_line_id text;
    begin
      -- Get posting rule
      select * into v_rule
      from posting_rules
      where source_module = 'frontoffice'
      and transaction_type = case
        when v_line_count.line_type = 'Room' then 'RoomRevenue'
        when v_line_count.line_type = 'F&B' then 'FBRevenue'
        when v_line_count.line_type = 'Minibar' then 'MinibarRevenue'
        when v_line_count.line_type = 'Laundry' then 'LaundryRevenue'
        when v_line_count.line_type = 'Spa' then 'SpaRevenue'
        when v_line_count.line_type = 'Tax' then 'Tax'
        when v_line_count.line_type = 'ServiceCharge' then 'ServiceCharge'
        when v_line_count.line_type = 'Discount' then 'Discount'
        else 'Other'
      end
      and is_active = true
      and (valid_from is null or valid_from <= v_business_date)
      and (valid_to is null or valid_to >= v_business_date)
      order by priority asc
      limit 1;

      if v_rule is not null then
        v_debit_account := v_rule.debit_account_code;
        v_credit_account := v_rule.credit_account_code;
      else
        -- Fallback to line's revenue account
        v_debit_account := v_line_count.revenue_account_code;
        v_credit_account := (select code from chart_of_accounts where name ilike '%accounts receivable%' limit 1);
      end if;

      -- Create journal entry
      v_journal_line_id := gen_random_uuid()::text;

      -- Debit line (revenue)
      insert into journal_lines (
        id, journal_entry_id, batch_id, line_number,
        account_code, debit, credit, description,
        reference, entity_type, entity_id, created_at
      ) values (
        v_journal_line_id, v_batch_id, v_batch_id, v_line_count,
        v_debit_account, v_line_count.amount, 0.00,
        v_line_count.description,
        v_folio.id, 'folio', v_folio.id, v_now
      );

      v_total_debit := v_total_debit + v_line_count.amount;

      -- Credit line (receivable)
      insert into journal_lines (
        id, journal_entry_id, batch_id, line_number,
        account_code, debit, credit, description,
        reference, entity_type, entity_id, created_at
      ) values (
        gen_random_uuid()::text, v_batch_id, v_batch_id, v_line_count + 1,
        v_credit_account, 0.00, v_line_count.amount,
        v_line_count.description,
        v_folio.id, 'folio', v_folio.id, v_now
      );

      v_total_credit := v_total_credit + v_line_count.amount;

      -- Mark line as posted
      update folio_lines
      set posted_to_gl = true, gl_batch_id = v_batch_id
      where id = v_line_count.id;
    end;
  end loop;

  -- Update batch totals
  update journal_batches
  set total_debit = v_total_debit,
      total_credit = v_total_credit,
      posted_at = v_now,
      posted_by = p_user_id
  where id = v_batch_id;

  -- Update folio
  update folios
  set updated_at = v_now
  where id = p_folio_id;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.post_to_gl', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object('batchId', v_batch_id, 'lineCount', v_line_count, 'totalDebit', v_total_debit, 'totalCredit', v_total_credit)
  );

  return jsonb_build_object(
    'success', true,
    'batchId', v_batch_id,
    'lineCount', v_line_count,
    'totalDebit', v_total_debit,
    'totalCredit', v_total_credit
  );
end;
$$;

-- ======================================================================================
-- PHASE 5: NIGHT AUDIT COMPLETION
-- ======================================================================================

-- Function: Complete night audit with business date rollover
create or replace function complete_night_audit(
  p_user_id text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_current_business_date date;
  v_next_business_date date;
  v_now timestamp with time zone := now();
  v_revenue_posted numeric := 0.00;
  v_rooms_sold integer := 0;
  v_arrivals integer := 0;
  v_departures integer := 0;
  v_no_shows integer := 0;
  v_exceptions jsonb := '[]'::jsonb;
  v_posted_folios integer := 0;
begin
  -- Get current business date
  select business_date into v_current_business_date
  from business_dates
  where id = 'current'
  for update;

  if v_current_business_date is null then
    return jsonb_build_object('success', false, 'error', 'No current business date found');
  end if;

  -- Check if already completed
  if (select is_night_audit_complete from business_dates where id = 'current') = true then
    return jsonb_build_object('success', false, 'error', 'Night audit already completed for current business date');
  end if;

  -- Calculate statistics
  select 
    coalesce(sum(total_amount), 0.00),
    count(*) filter (where status = 'CheckedIn' and check_in_date = v_current_business_date),
    count(*) filter (where status = 'CheckedOut' and check_out_date = v_current_business_date),
    count(*) filter (where status = 'Cancelled' and check_in_date = v_current_business_date)
  into v_revenue_posted, v_arrivals, v_departures, v_no_shows
  from reservations
  where check_in_date <= v_current_business_date
  and check_out_date > v_current_business_date;

  v_rooms_sold := (select count(*) from reservations where status = 'CheckedIn');

  -- Post all open folios to GL
  for v_posted_folios in
    select id from folios
    where status = 'Open'
    and reservation_id in (
      select id from reservations
      where check_in_date <= v_current_business_date
      and check_out_date > v_current_business_date
    )
  loop
    declare
      v_result jsonb;
    begin
      select post_folio_charges_to_gl(v_posted_folios, p_user_id) into v_result;
      if not (v_result->>'success')::boolean then
        v_exceptions := v_exceptions || jsonb_build_object(
          'folioId', v_posted_folios,
          'error', v_result->>'error'
        );
      end if;
    end;
  end loop;

  -- Calculate next business date
  v_next_business_date := v_current_business_date + interval '1 day';

  -- Update business dates
  update business_dates
  set 
    business_date = v_next_business_date,
    previous_business_date = v_current_business_date,
    is_night_audit_complete = true,
    night_audit_completed_at = v_now,
    night_audit_by = p_user_id,
    revenue_posted = v_revenue_posted,
    rooms_sold = v_rooms_sold,
    arrivals = v_arrivals,
    departures = v_departures,
    no_shows = v_no_shows,
    exceptions_count = jsonb_array_length(v_exceptions),
    exceptions = v_exceptions,
    notes = coalesce(notes, '') || case when notes is not null then ' ' else '' end || coalesce(p_notes, ''),
    updated_at = v_now
  where id = 'current';

  -- Reset for new business day
  update business_dates
  set 
    is_night_audit_complete = false,
    night_audit_started_at = null,
    night_audit_completed_at = null,
    night_audit_by = null,
    revenue_posted = 0.00,
    rooms_sold = 0,
    arrivals = 0,
    departures = 0,
    no_shows = 0,
    exceptions_count = 0,
    exceptions = '[]'::jsonb
  where id = 'next_day';

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'night_audit.complete', 'business_date', 'current', 'frontoffice',
    jsonb_build_object(
      'previousDate', v_current_business_date,
      'newDate', v_next_business_date,
      'revenuePosted', v_revenue_posted,
      'roomsSold', v_rooms_sold,
      'foliosPosted', v_posted_folios,
      'exceptions', v_exceptions
    )
  );

  return jsonb_build_object(
    'success', true,
    'previousDate', v_current_business_date,
    'newDate', v_next_business_date,
    'revenuePosted', v_revenue_posted,
    'roomsSold', v_rooms_sold,
    'arrivals', v_arrivals,
    'departures', v_departures,
    'foliosPosted', v_posted_folios,
    'exceptions', v_exceptions
  );
end;
$$;

-- ======================================================================================
-- PHASE 6: ENHANCED INVOICE GENERATION
-- ======================================================================================

-- Function: Generate invoice from folio
create or replace function generate_folio_invoice(
  p_folio_id text,
  p_user_id text,
  p_invoice_type text default 'Guest'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_reservation reservations%rowtype;
  v_invoice_id text;
  v_invoice_number text;
  v_now timestamp with time zone := now();
  v_sequence_num integer;
begin
  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  -- Get reservation
  select * into v_reservation
  from reservations
  where id = v_folio.reservation_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  -- Generate invoice number
  select coalesce(max(cast(substring(invoice_number from 'INV-\d+') as integer)), 0) + 1
  into v_sequence_num
  from invoice_documents
  where invoice_number like 'INV-%';

  v_invoice_number := 'INV-' || lpad(v_sequence_num::text, 6, '0');

  -- Create invoice
  v_invoice_id := gen_random_uuid()::text;

  insert into invoice_documents (
    id, folio_id, invoice_number, invoice_type,
    issue_date, due_date,
    subtotal, tax_total, discount_total, total, amount_paid, status,
    customer_name, customer_email, customer_address,
    customer_tin, customer_vat_no,
    hotel_tin, hotel_vat_no, hotel_vat_date,
    payment_terms, notes,
    created_by, created_at
  ) values (
    v_invoice_id, p_folio_id, v_invoice_number, p_invoice_type,
    current_date, current_date + interval '30 days',
    v_folio.total_charges, v_folio.tax_total, 0.00, v_folio.balance, v_folio.total_payments, 'Issued',
    v_reservation.guest_name, v_reservation.guest_email,
    v_reservation.custom_hotel_address,
    v_reservation.guest_tin, v_reservation.guest_vat_no,
    v_reservation.hotel_tin, v_reservation.hotel_vat_no, v_reservation.hotel_vat_date,
    'Due on Receipt', 'Auto-generated from folio ' || p_folio_id,
    p_user_id, v_now
  );

  -- Close folio if fully paid
  if v_folio.balance <= 0 then
    update folios
    set status = 'Closed', closed_at = v_now
    where id = p_folio_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'invoice.generated', 'invoice', v_invoice_id, 'frontoffice',
    jsonb_build_object('invoiceNumber', v_invoice_number, 'folioId', p_folio_id, 'amount', v_folio.balance)
  );

  return jsonb_build_object(
    'success', true,
    'invoiceId', v_invoice_id,
    'invoiceNumber', v_invoice_number,
    'amount', v_folio.balance
  );
end;
$$;

-- 7. HELPER FUNCTIONS

-- Function to get guest group summary
create or replace function get_guest_group_summary(p_guest_id text)
returns jsonb as $$
declare
  v_summary jsonb;
  v_current_group jsonb;
  v_previous_groups jsonb;
  v_total_stays integer;
  v_total_revenue numeric;
  v_total_room_nights integer;
begin
  -- Get current active group
  select jsonb_build_object(
    'groupId', gr.group_id,
    'groupName', gp.name,
    'groupType', gp.type,
    'groupCode', gp.code,
    'startDate', gr.start_date,
    'isPrimaryContact', gr.is_primary_contact,
    'roleTitle', gr.role_title
  ) into v_current_group
  from guest_group_relationships gr
  join group_profiles gp on gr.group_id = gp.id
  where gr.guest_id = p_guest_id
  and gr.status = 'Active'
  limit 1;
  
  -- Get historical groups
  select jsonb_agg(
    jsonb_build_object(
      'groupId', gr.group_id,
      'groupName', gp.name,
      'groupType', gp.type,
      'startDate', gr.start_date,
      'endDate', gr.end_date,
      'totalStays', gr.total_stays,
      'totalRevenue', gr.total_revenue
    )
  ) into v_previous_groups
  from guest_group_relationships gr
  join group_profiles gp on gr.group_id = gp.id
  where gr.guest_id = p_guest_id
  and gr.status != 'Active';
  
  -- Calculate totals
  select 
    coalesce(sum(total_stays), 0),
    coalesce(sum(total_revenue), 0),
    coalesce(sum(total_room_nights), 0)
  into v_total_stays, v_total_revenue, v_total_room_nights
  from guest_group_relationships
  where guest_id = p_guest_id;
  
  -- Build summary
  v_summary := jsonb_build_object(
    'guestId', p_guest_id,
    'currentGroup', v_current_group,
    'previousGroups', coalesce(v_previous_groups, '[]'::jsonb),
    'totalGroupStays', v_total_stays,
    'totalGroupRevenue', v_total_revenue,
    'totalGroupRoomNights', v_total_room_nights
  );
  
  return v_summary;
end;
$$ language plpgsql;

-- Seed additional inventory store
insert into inventory_stores (id, name, type, manager) values
('ST-ENG', 'Engineering Plant Store', 'Departmental', 'Chief Engineer')
on conflict (id) do nothing;

-- ======================================================================================
-- GIFT SHOP POS SCHEMA
-- ======================================================================================

-- Add retail_price to inventory items for decoupled retail pricing

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
  sale_date timestamp with time zone not null default now(),
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

create index if not exists idx_gift_shop_sales_date on gift_shop_sales(sale_date desc);
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
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_gift_shop_issues_date on gift_shop_issues(created_at desc);
create index if not exists idx_gift_shop_issues_product on gift_shop_issues(product_id);

-- Enable RLS on gift shop tables
alter table gift_shop_sales enable row level security;
alter table gift_shop_issues enable row level security;

-- Gift shop policies (drop-and-create for idempotency)
drop policy if exists "Allow all public reads" on gift_shop_sales;
create policy "Allow all public reads" on gift_shop_sales for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_sales;
create policy "Allow all public writes" on gift_shop_sales for all using (true) with check (true);

drop policy if exists "Allow all public reads" on gift_shop_issues;
create policy "Allow all public reads" on gift_shop_issues for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_issues;
create policy "Allow all public writes" on gift_shop_issues for all using (true) with check (true);

-- ======================================================================================
-- INVENTORY PORTAL DEMO SEED DATA
-- ======================================================================================

-- Suppliers (aligned with frontend defaults)
insert into inventory_suppliers (id, code, name, contact_person, phone, email, status, rating) values
('S-001', 'SUP-001', 'Global Foods Ltd', 'Account Manager', '+1 234 567 890', 'sales@globalfoods.com', 'Active', 5),
('S-002', 'SUP-002', 'Luxe Hospitality Supplies', 'Operations Lead', '+1 987 654 321', 'orders@luxesupplies.pro', 'Active', 5),
('S-003', 'SUP-003', 'Prime Meats & Poultry', 'Sales Representative', '+1 555 123 456', 'sales@primemeats.com', 'Active', 4),
('S-004', 'SUP-004', 'Metro Office Solutions', 'Client Services', '+1 444 888 999', 'support@metro-office.com', 'Inactive', 3),
('S-005', 'SUP-005', 'Technical Maintenance Parts', 'Fleet Supervisor', '+1 222 333 444', 'service@techmaintenance.net', 'Active', 5)
on conflict (id) do nothing;

-- Inventory Items (diverse categories, all mapped columns)
insert into inventory_items (
  id, code, name, category, subcategory, unit, brand, supplier_id,
  max_stock, reorder_level, last_cost, avg_cost, current_stock,
  location, barcode, store_id, stock, price, min_stock,
  retail_price, sale_price, guest_portal_active, image_url, dietary_tags
) values
('I-001', 'FVG-001', 'Fresh Organic Tomatoes', 'Food & Beverage', 'Fresh Produce', 'kg', 'GreenFields', 'S-001', 500, 50, 12.50, 12.50, 120, 'Central Warehouse', '8901234567890', 'ST-MAIN', 120, 12.50, 30, 0.00, 0.00, false, null, '{}'),
('I-002', 'FVG-002', 'Chicken Breast Fillet', 'Food & Beverage', 'Meat & Poultry', 'kg', 'Prime Farms', 'S-003', 300, 40, 45.00, 45.00, 85, 'Central Warehouse', '8901234567891', 'ST-MAIN', 85, 45.00, 20, 0.00, 0.00, false, null, '{}'),
('I-003', 'FVB-003', 'Mineral Water 500ml', 'Food & Beverage', 'Beverages', 'pcs', 'AquaPure', 'S-001', 2000, 200, 3.50, 3.50, 450, 'Bar Store', '8901234567892', 'ST-BAR', 450, 3.50, 100, 8.00, 6.00, true, null, array['Vegetarian','Vegan']),
('I-004', 'HKG-001', 'Luxury Shampoo 30ml', 'Housekeeping', 'Guest Amenities', 'pcs', 'LuxeScent', 'S-002', 5000, 500, 1.20, 1.20, 1200, 'Housekeeping Central', '8901234567893', 'ST-HK', 1200, 1.20, 200, 5.00, 4.00, true, null, '{}'),
('I-005', 'HKC-002', 'All-Purpose Cleaner', 'Housekeeping', 'Cleaning Chemicals', 'ltr', 'CleanMax', 'S-002', 200, 30, 18.00, 18.00, 45, 'Housekeeping Central', '8901234567894', 'ST-HK', 45, 18.00, 10, 0.00, 0.00, false, null, array['Eco-Friendly']),
('I-006', 'ENG-001', 'LED Bulb 9W', 'Engineering', 'Electrical', 'pcs', 'BrightLight', 'S-005', 300, 50, 8.50, 8.50, 95, 'Engineering Plant Store', '8901234567895', 'ST-ENG', 95, 8.50, 20, 0.00, 0.00, false, null, '{}'),
('I-007', 'ENP-002', 'PVC Pipe 20mm', 'Engineering', 'Plumbing', 'mtr', 'FlowTech', 'S-005', 500, 60, 6.00, 6.00, 130, 'Engineering Plant Store', '8901234567896', 'ST-ENG', 130, 6.00, 25, 0.00, 0.00, false, null, '{}'),
('I-008', 'OFF-001', 'A4 Copy Paper Ream', 'Office Supplies', 'Stationery', 'pcs', 'PaperMills', 'S-004', 100, 20, 12.00, 12.00, 35, 'Central Warehouse', '8901234567897', 'ST-MAIN', 35, 12.00, 10, 0.00, 0.00, false, null, '{}'),
('I-009', 'OFF-002', 'Ink Cartridge HP-63', 'Office Supplies', 'Printing', 'pcs', 'HP', 'S-004', 50, 10, 45.00, 45.00, 18, 'Central Warehouse', '8901234567898', 'ST-MAIN', 18, 45.00, 5, 0.00, 0.00, false, null, '{}'),
('I-010', 'GFT-001', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 200, 30, 8.00, 8.00, 60, 'Gift Store', '8901234567899', 'ST-GIFT', 60, 8.00, 15, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-011', 'GFT-002', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 100, 10, 2.00, 2.00, 40, 'Gift Store', '8901234567900', 'ST-GIFT', 40, 2.00, 5, 5.00, 0.00, true, null, '{}'),
('I-012', 'FVB-004', 'Ethiopian Coffee Beans 1kg', 'Food & Beverage', 'Beverages', 'kg', 'Habesha Roast', 'S-001', 100, 15, 35.00, 35.00, 28, 'Restaurant Store', '8901234567901', 'ST-REST', 28, 35.00, 10, 45.00, 40.00, true, null, array['Organic','Fair Trade']),
('I-013', 'FVD-005', 'Mozzarella Cheese Block', 'Food & Beverage', 'Dairy', 'kg', 'DairyGold', 'S-001', 80, 10, 28.00, 28.00, 22, 'Restaurant Store', '8901234567902', 'ST-REST', 22, 28.00, 8, 0.00, 0.00, false, null, array['Vegetarian']),
('I-014', 'HKL-003', 'Linen Bed Sheets King', 'Housekeeping', 'Laundry Supplies', 'pcs', 'SoftThread', 'S-002', 150, 25, 65.00, 65.00, 40, 'Housekeeping Central', '8901234567903', 'ST-HK', 40, 65.00, 15, 0.00, 0.00, false, null, '{}'),
('I-015', 'ENG-003', 'Air Filter 16x25x1', 'Engineering', 'HVAC', 'pcs', 'FilterPro', 'S-005', 80, 15, 22.00, 22.00, 18, 'Engineering Plant Store', '8901234567904', 'ST-ENG', 18, 22.00, 8, 0.00, 0.00, false, null, '{}'),
('I-016', 'OFC-001', 'Ballpoint Pen Black', 'Office Supplies', 'Stationery', 'pcs', 'WriteWell', 'S-004', 200, 30, 1.50, 1.50, 45, 'Front Office Store', '8901234567905', 'ST-OFC', 45, 1.50, 15, 0.00, 0.00, false, null, '{}'),
('I-017', 'OFC-002', 'Sticky Notes 3x3 Yellow', 'Office Supplies', 'Stationery', 'pcs', 'Post-it', 'S-004', 100, 20, 4.00, 4.00, 30, 'Front Office Store', '8901234567906', 'ST-OFC', 30, 4.00, 10, 0.00, 0.00, false, null, '{}'),
('I-018', 'OFC-003', 'Thermal Paper Roll 80mm', 'Office Supplies', 'Printing', 'pcs', 'PrintTech', 'S-004', 80, 15, 12.00, 12.00, 22, 'Front Office Store', '8901234567907', 'ST-OFC', 22, 12.00, 8, 0.00, 0.00, false, null, '{}'),
('I-019', 'OFC-004', 'Room Key Cards Pack', 'Office Supplies', 'Consumables', 'pcs', 'SecureKey', 'S-005', 500, 50, 3.00, 3.00, 120, 'Front Office Store', '8901234567908', 'ST-OFC', 120, 3.00, 30, 0.00, 0.00, false, null, '{}'),
('I-020', 'GFT-003', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 300, 40, 8.00, 8.00, 80, 'Central Warehouse', '8901234567909', 'ST-MAIN', 80, 8.00, 20, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-021', 'GFT-004', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 150, 20, 2.00, 2.00, 60, 'Central Warehouse', '8901234567910', 'ST-MAIN', 60, 2.00, 10, 5.00, 0.00, true, null, '{}'),
('I-022', 'GFT-005', 'Local Coffee Blend', 'Gift Shop', 'Souvenirs', 'pcs', 'Habesha Roast', 'S-003', 200, 30, 10.00, 10.00, 55, 'Central Warehouse', '8901234567911', 'ST-MAIN', 55, 10.00, 15, 24.00, 20.00, true, null, '{}'),
('I-023', 'GFT-006', 'Crystal Keepsake', 'Gift Shop', 'Souvenirs', 'pcs', 'ArtisanGlass', 'S-002', 80, 15, 40.00, 40.00, 25, 'Central Warehouse', '8901234567912', 'ST-MAIN', 25, 40.00, 8, 95.00, 80.00, true, null, '{}')
on conflict (id) do nothing;

-- Requisitions
insert into inventory_requisitions (id, number, department, requested_by, request_date, priority, status, items) values
('REQ-001', 'REQ-0001', 'Housekeeping', 'Alice Johnson', '2026-06-01', 'Normal', 'Issued', '[{"itemId":"I-004","name":"Luxury Shampoo 30ml","requestedQty":200,"issuedQty":200,"unit":"pcs","cost":1.20},{"itemId":"I-005","name":"All-Purpose Cleaner","requestedQty":10,"issuedQty":10,"unit":"ltr","cost":18.00}]'::jsonb),
('REQ-002', 'REQ-0002', 'Restaurant', 'Chef Marco', '2026-06-05', 'High', 'Approved', '[{"itemId":"I-001","name":"Fresh Organic Tomatoes","requestedQty":50,"issuedQty":0,"unit":"kg","cost":12.50},{"itemId":"I-012","name":"Ethiopian Coffee Beans 1kg","requestedQty":5,"issuedQty":0,"unit":"kg","cost":35.00}]'::jsonb),
('REQ-003', 'REQ-0003', 'Engineering', 'Tom Bradley', '2026-06-08', 'Urgent', 'Pending', '[{"itemId":"I-006","name":"LED Bulb 9W","requestedQty":20,"issuedQty":0,"unit":"pcs","cost":8.50},{"itemId":"I-015","name":"Air Filter 16x25x1","requestedQty":10,"issuedQty":0,"unit":"pcs","cost":22.00}]'::jsonb),
('REQ-004', 'REQ-0004', 'Front Office', 'Sarah Lee', '2026-06-10', 'Normal', 'Received', '[{"itemId":"I-003","name":"Mineral Water 500ml","requestedQty":100,"issuedQty":100,"unit":"pcs","cost":3.50}]'::jsonb)
on conflict (id) do nothing;

-- Stock Movements
insert into inventory_stock_movements (id, movement_date, item_id, item_name, type, quantity, cost, reference, "user", store_from, store_to) values
('M-001', '2026-06-01', 'I-001', 'Fresh Organic Tomatoes', 'Purchase', 120, 12.50, 'GRN-0001', 'John Storekeeper', null, 'Central Warehouse'),
('M-002', '2026-06-01', 'I-004', 'Luxury Shampoo 30ml', 'Purchase', 500, 1.20, 'GRN-0001', 'John Storekeeper', null, 'Housekeeping Central'),
('M-003', '2026-06-02', 'I-004', 'Luxury Shampoo 30ml', 'Issue', -200, 1.20, 'REQ-0001', 'Alice Johnson', 'Housekeeping Central', null),
('M-004', '2026-06-03', 'I-006', 'LED Bulb 9W', 'Purchase', 50, 8.50, 'GRN-0002', 'John Storekeeper', null, 'Engineering Plant Store'),
('M-005', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', -50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-006', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', 50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-007', '2026-06-05', 'I-012', 'Ethiopian Coffee Beans 1kg', 'Adjustment', -2, 35.00, 'ADJ-001', 'System', 'Restaurant Store', null),
('M-008', '2026-06-06', 'I-010', 'Hotel Branded Mug', 'Damage', -3, 8.00, 'DMG-001', 'Gift Shop Supervisor', 'Gift Store', null),
('M-009', '2026-06-07', 'I-002', 'Chicken Breast Fillet', 'Purchase', 40, 45.00, 'GRN-0003', 'John Storekeeper', null, 'Central Warehouse')
on conflict (id) do nothing;

-- Goods Received Notes (GRNs)
insert into inventory_grns (id, number, supplier_id, supplier_name, purchase_order_id, delivery_note, invoice_number, received_date, receiver, items, total_value) values
('GRN-001', 'GRN-2026-0001', 'S-001', 'Global Foods Ltd', 'PO-5023', 'DN-12345', 'INV-4001', '2026-06-01', 'John Storekeeper',
'[{"itemId":"I-001","name":"Fresh Organic Tomatoes","receivedQty":120,"unitCost":12.50,"batchNumber":"B-105","expiryDate":"2027-04-15"},{"itemId":"I-004","name":"Luxury Shampoo 30ml","receivedQty":500,"unitCost":1.20,"batchNumber":"B-203","expiryDate":"2028-01-01"}]'::jsonb, 2100.00),
('GRN-002', 'GRN-2026-0002', 'S-005', 'Technical Maintenance Parts', 'PO-5024', 'DN-12346', 'INV-4002', '2026-06-03', 'John Storekeeper',
'[{"itemId":"I-006","name":"LED Bulb 9W","receivedQty":50,"unitCost":8.50,"batchNumber":"B-301","expiryDate":"2030-12-31"},{"itemId":"I-015","name":"Air Filter 16x25x1","receivedQty":10,"unitCost":22.00,"batchNumber":"B-302","expiryDate":"2030-12-31"}]'::jsonb, 645.00),
('GRN-003', 'GRN-2026-0003', 'S-003', 'Prime Meats & Poultry', 'PO-5025', 'DN-12347', 'INV-4003', '2026-06-07', 'John Storekeeper',
'[{"itemId":"I-002","name":"Chicken Breast Fillet","receivedQty":40,"unitCost":45.00,"batchNumber":"B-401","expiryDate":"2026-06-14"}]'::jsonb, 1800.00)
on conflict (id) do nothing;

-- Enable RLS on sensitive admin tables
alter table if exists system_users enable row level security;
alter table if exists custom_roles enable row level security;
alter table if exists global_settings enable row level security;
alter table if exists audit_events enable row level security;

-- Drop any overly permissive anon policies
drop policy if exists "system_users_anon_all" on system_users;
drop policy if exists "custom_roles_anon_all" on custom_roles;
drop policy if exists "global_settings_anon_all" on global_settings;
drop policy if exists "audit_events_anon_all" on audit_events;

-- Restrict anon to SELECT only on admin tables (writes must go through server with service role)
drop policy if exists "system_users_anon_select" on system_users;
create policy system_users_anon_select on system_users for select to anon using (true);
drop policy if exists "custom_roles_anon_select" on custom_roles;
create policy custom_roles_anon_select on custom_roles for select to anon using (true);
drop policy if exists "global_settings_anon_select" on global_settings;
create policy global_settings_anon_select on global_settings for select to anon using (true);
drop policy if exists "audit_events_anon_select" on audit_events;
create policy audit_events_anon_select on audit_events for select to anon using (true);

-- ================================================================================

-- AUTOMATIC GUEST-TO-GROUP PROFILE LINKING SYSTEM

-- Database Migration Script

-- ================================================================================

-- This migration creates the database schema for comprehensive group profile

-- management and automatic guest-to-group relationship tracking.

--

-- Run this script in your Supabase SQL Editor after the main schema.sql

-- ================================================================================



-- ================================================================================

-- 1. GROUP PROFILES TABLE

-- ================================================================================

-- Comprehensive group profile management for all group types:

-- - Group Reservations

-- - Corporate Accounts

-- - Travel Agents

-- - Tour Operators

-- - Crew Bookings

-- - Conferences

-- - Events

-- - Long-Term Contracts

-- ================================================================================



-- Indexes for group_profiles

create index if not exists idx_group_profiles_contact_email on group_profiles(contact_email);

create index if not exists idx_group_profiles_created_at on group_profiles(created_at desc);



-- ================================================================================

-- 2. GUEST GROUP RELATIONSHIPS TABLE

-- ================================================================================

-- Historical tracking of guest-group relationships with full metadata

-- Supports multiple group memberships over time with analytics

-- ================================================================================



-- Composite indexes for guest_group_relationships

create index if not exists idx_guest_group_relationships_reservation_id on guest_group_relationships(reservation_id);

create index if not exists idx_guest_group_relationships_active on guest_group_relationships(guest_id, group_id) where status = 'Active';

create index if not exists idx_guest_group_relationships_guest_active on guest_group_relationships(guest_id) where status = 'Active';



-- Unique constraint to prevent duplicate active relationships

create unique index if not exists idx_guest_group_relationships_unique_active 

on guest_group_relationships(guest_id, group_id) 

where status = 'Active' and end_date is null;



-- ================================================================================

-- 3. GROUP AUDIT LOG TABLE

-- ================================================================================

-- Dedicated audit logging for group operations and relationship changes

-- ================================================================================



-- Indexes for group_audit_log

create index if not exists idx_group_audit_log_timestamp on group_audit_log(created_at desc);

create index if not exists idx_group_audit_log_user_id on group_audit_log(user_id);

create index if not exists idx_group_audit_log_guest_id on group_audit_log(guest_id);

create index if not exists idx_group_audit_log_entity on group_audit_log(entity_type, entity_id);



-- ================================================================================

-- 4. UPDATE RESERVATIONS TABLE

-- ================================================================================

-- Add proper foreign key to group_profiles and update existing columns

-- ================================================================================



-- Add group_profile_id column if it doesn't exist

alter table reservations 

add column if not exists group_profile_id text references group_profiles(id) on delete set null;



-- Create index for group_profile_id

create index if not exists idx_reservations_group_profile_id on reservations(group_profile_id);



-- Update existing index for booking_group_id to include group_profile_id

drop index if exists idx_reservations_booking_group_id;



-- ================================================================================

-- 5. UPDATE GUESTS TABLE

-- ================================================================================

-- Add columns for group relationship tracking (for backward compatibility)

-- ================================================================================



-- Add columns if they don't exist

alter table guests 

add column if not exists parent_group_id text references group_profiles(id) on delete set null,

add column if not exists parent_corporate_id text references group_profiles(id) on delete set null,

add column if not exists is_primary_contact boolean not null default false,

add column if not exists billing_routing_profile_id text;



-- Create indexes



-- ================================================================================

-- 6. AUTOMATIC LINKING TRIGGER FUNCTIONS

-- ================================================================================

-- PostgreSQL functions to automatically link guests to groups on reservation operations

-- ================================================================================



-- Function: Automatically link guest to group when reservation is created/updated

create or replace function auto_link_guest_to_group()

returns trigger

language plpgsql

security definer

as $$

declare

  v_group_id text;

  v_relationship_type text;

  v_existing_relationship record;

begin

  -- Determine group_id from reservation

  if new.group_profile_id is not null then

    v_group_id := new.group_profile_id;

  elsif new.booking_group_id is not null then

    -- Try to find group profile by booking_group_id

    select id into v_group_id from group_profiles 

    where code = new.booking_group_id or id = new.booking_group_id

    limit 1;

  end if;

  

  -- If no group found, exit

  if v_group_id is null then

    return new;

  end if;

  

  -- Determine relationship type from group profile

  select type into v_relationship_type from group_profiles where id = v_group_id;

  

  -- Check if guest profile exists

  if not exists (select 1 from guests where email = new.guest_email limit 1) then

    -- Guest profile doesn't exist yet - will be created separately

    return new;

  end if;

  

  -- Check for existing active relationship

  select * into v_existing_relationship from guest_group_relationships

  where guest_id = (select id from guests where email = new.guest_email limit 1)

    and group_id = v_group_id

    and status = 'Active'

    and (end_date is null or end_date >= current_date)

  limit 1;

  

  if v_existing_relationship is not null then

    -- Update existing relationship with new reservation

    update guest_group_relationships

    set reservation_id = new.id,

        updated_at = now()

    where id = v_existing_relationship.id;

  else

    -- Create new relationship

    insert into guest_group_relationships (

      id,

      guest_id,

      group_id,

      reservation_id,

      relationship_type,

      status,

      start_date,

      is_primary_contact,

      created_at,

      created_by

    ) values (

      gen_random_uuid()::text,

      (select id from guests where email = new.guest_email limit 1),

      v_group_id,

      new.id,

      v_relationship_type,

      'Active',

      new.check_in_date,

      false,

      now(),

      current_setting('request.jwt.claim.sub', true)  -- Get current user if available

    );

    

    -- Update guest's parent_group_id for backward compatibility

    update guests

    set parent_group_id = v_group_id

    where email = new.guest_email;

  end if;

  

  return new;

end;

$$;



-- Create trigger for automatic linking on reservation insert/update

drop trigger if exists trigger_auto_link_guest_to_group on reservations;

create trigger trigger_auto_link_guest_to_group

after insert or update of group_profile_id, booking_group_id, guest_email

on reservations

for each row

execute function auto_link_guest_to_group();



-- ================================================================================

-- 7. ANALYTICS UPDATE FUNCTIONS

-- ================================================================================

-- Functions to update group and relationship analytics when reservations change

-- ================================================================================



-- Function: Update group analytics when reservation is checked out

create or replace function update_group_analytics_on_checkout()

returns trigger

language plpgsql

security definer

as $$

begin

  -- Update group profile analytics

  update group_profiles

  set total_revenue = total_revenue + coalesce(new.total_amount, 0),

      total_room_nights = total_room_nights + 

        (new.check_out_date - new.check_in_date)::integer,

      total_stays = total_stays + 1,

      updated_at = now()

  where id = new.group_profile_id;

  

  -- Update guest-group relationship analytics

  update guest_group_relationships

  set total_stays = total_stays + 1,

      total_room_nights = total_room_nights + 

        (new.check_out_date - new.check_in_date)::integer,

      total_revenue = total_revenue + coalesce(new.total_amount, 0),

      last_stay_date = new.check_out_date,

      updated_at = now()

  where reservation_id = new.id;

  

  return new;

end;

$$;



-- Create trigger for analytics update on checkout

drop trigger if exists trigger_update_group_analytics on reservations;

create trigger trigger_update_group_analytics

after update of status

on reservations

for each row

when (new.status = 'CheckedOut' and old.status != 'CheckedOut')

execute function update_group_analytics_on_checkout();



-- ================================================================================
-- 8. DATA MIGRATION
-- ================================================================================
-- All data migrations skipped for fresh database setup
-- ================================================================================
-- Migrate group_bookings to group_profiles (skipped for fresh DB)
-- Migrate corporate_accounts to group_profiles (skipped for fresh DB)
-- Migrate existing guest parent relationships (skipped for fresh DB)
-- Migrate corporate relationships (skipped for fresh DB)
-- Update reservations group_booking_id -> group_profile_id (skipped for fresh DB)
-- ================================================================================

-- 9. HELPER FUNCTIONS

-- ================================================================================

-- Utility functions for group relationship management

-- ================================================================================



-- Function: Get guest's active group relationships

create or replace function get_guest_active_groups(p_guest_id text)

returns table (

  group_id text,

  group_name text,

  group_type text,

  relationship_type text,

  start_date date,

  is_primary_contact boolean,

  total_stays integer,

  total_revenue numeric

)

language plpgsql

security definer

as $$

begin

  return query

  select 

    gp.id as group_id,

    gp.name as group_name,

    gp.type as group_type,

    ggr.relationship_type,

    ggr.start_date,

    ggr.is_primary_contact,

    ggr.total_stays,

    ggr.total_revenue

  from guest_group_relationships ggr

  join group_profiles gp on ggr.group_id = gp.id

  where ggr.guest_id = p_guest_id

    and ggr.status = 'Active'

    and (ggr.end_date is null or ggr.end_date >= current_date)

  order by ggr.start_date desc;

end;

$$;



-- Function: Get group's active members

create or replace function get_group_active_members(p_group_id text)

returns table (

  guest_id text,

  guest_name text,

  guest_email text,

  relationship_type text,

  start_date date,

  is_primary_contact boolean,

  total_stays integer,

  total_revenue numeric

)

language plpgsql

security definer

as $$

begin

  return query

  select 

    g.id as guest_id,

    g.name as guest_name,

    g.email as guest_email,

    ggr.relationship_type,

    ggr.start_date,

    ggr.is_primary_contact,

    ggr.total_stays,

    ggr.total_revenue

  from guest_group_relationships ggr

  join guests g on ggr.guest_id = g.id

  where ggr.group_id = p_group_id

    and ggr.status = 'Active'

    and (ggr.end_date is null or ggr.end_date >= current_date)

  order by ggr.is_primary_contact desc, ggr.start_date asc;

end;

$$;



-- Function: Link guest to group (manual/automatic)

create or replace function link_guest_to_group(

  p_guest_id text,

  p_group_id text,

  p_relationship_type text,

  p_is_primary_contact boolean default false,

  p_reservation_id text default null,

  p_user_id text default null

)

returns jsonb

language plpgsql

security definer

as $$

declare

  v_existing_relationship record;

  v_group_type text;

  v_new_relationship_id text;

begin

  -- Validate inputs

  if not exists (select 1 from guests where id = p_guest_id) then

    return jsonb_build_object('success', false, 'error', 'Guest not found');

  end if;

  

  if not exists (select 1 from group_profiles where id = p_group_id) then

    return jsonb_build_object('success', false, 'error', 'Group not found');

  end if;

  

  -- Get group type

  select type into v_group_type from group_profiles where id = p_group_id;

  

  -- Check for existing active relationship

  select * into v_existing_relationship from guest_group_relationships

  where guest_id = p_guest_id

    and group_id = p_group_id

    and status = 'Active'

    and (end_date is null or end_date >= current_date)

  limit 1;

  

  if v_existing_relationship is not null then

    -- Update existing relationship

    update guest_group_relationships

    set is_primary_contact = p_is_primary_contact,

        reservation_id = coalesce(p_reservation_id, reservation_id),

        updated_at = now(),

        updated_by = p_user_id

    where id = v_existing_relationship.id;

    

    -- Log audit

    insert into group_audit_log (

      id, action, entity_type, entity_id, group_id, guest_id,

      relationship_id, previous_values, new_values, user_id, user_name

    ) values (

      gen_random_uuid()::text,

      'relationship_updated',

      'GuestGroupRelationship',

      v_existing_relationship.id,

      p_group_id,

      p_guest_id,

      v_existing_relationship.id,

      jsonb_build_object('isPrimaryContact', v_existing_relationship.is_primary_contact),

      jsonb_build_object('isPrimaryContact', p_is_primary_contact),

      p_user_id,

      (select name from system_users where id = p_user_id limit 1)

    );

    

    return jsonb_build_object('success', true, 'action', 'updated', 'relationshipId', v_existing_relationship.id);

  end if;

  

  -- Create new relationship

  v_new_relationship_id := gen_random_uuid()::text;

  

  insert into guest_group_relationships (

    id,

    guest_id,

    group_id,

    reservation_id,

    relationship_type,

    status,

    start_date,

    is_primary_contact,

    created_at,

    created_by

  ) values (

    v_new_relationship_id,

    p_guest_id,

    p_group_id,

    p_reservation_id,

    coalesce(p_relationship_type, v_group_type),

    'Active',

    current_date,

    p_is_primary_contact,

    now(),

    p_user_id

  );

  

  -- Update guest's parent_group_id for backward compatibility

  update guests

  set parent_group_id = p_group_id,

      is_primary_contact = p_is_primary_contact

  where id = p_guest_id;

  

  -- Log audit

  insert into group_audit_log (

    id, action, entity_type, entity_id, group_id, guest_id,

    relationship_id, new_values, user_id, user_name

  ) values (

    gen_random_uuid()::text,

    'relationship_created',

    'GuestGroupRelationship',

    v_new_relationship_id,

    p_group_id,

    p_guest_id,

    v_new_relationship_id,

    jsonb_build_object(

      'guestId', p_guest_id,

      'groupId', p_group_id,

      'relationshipType', coalesce(p_relationship_type, v_group_type),

      'isPrimaryContact', p_is_primary_contact

    ),

    p_user_id,

    (select name from system_users where id = p_user_id limit 1)

  );

  

  return jsonb_build_object('success', true, 'action', 'created', 'relationshipId', v_new_relationship_id);

end;

$$;



-- Function: Unlink guest from group

create or replace function unlink_guest_from_group(

  p_guest_id text,

  p_group_id text,

  p_reason text default null,

  p_user_id text default null

)

returns jsonb

language plpgsql

security definer

as $$

declare

  v_existing_relationship record;

begin

  -- Find active relationship

  select * into v_existing_relationship from guest_group_relationships

  where guest_id = p_guest_id

    and group_id = p_group_id

    and status = 'Active'

    and (end_date is null or end_date >= current_date)

  limit 1;

  

  if v_existing_relationship is null then

    return jsonb_build_object('success', false, 'error', 'No active relationship found');

  end if;

  

  -- Terminate relationship

  update guest_group_relationships

  set status = 'Terminated',

      end_date = current_date,

      updated_at = now(),

      updated_by = p_user_id

  where id = v_existing_relationship.id;

  

  -- Clear guest's parent_group_id if this was the primary group

  update guests

  set parent_group_id = null,

      is_primary_contact = false

  where id = p_guest_id and parent_group_id = p_group_id;

  

  -- Log audit

  insert into group_audit_log (

    id, action, entity_type, entity_id, group_id, guest_id,

    relationship_id, previous_values, new_values, reason, user_id, user_name

  ) values (

    gen_random_uuid()::text,

    'relationship_terminated',

    'GuestGroupRelationship',

    v_existing_relationship.id,

    p_group_id,

    p_guest_id,

    v_existing_relationship.id,

    jsonb_build_object('status', 'Active', 'endDate', null),

    jsonb_build_object('status', 'Terminated', 'endDate', current_date),

    p_reason,

    p_user_id,

    (select name from system_users where id = p_user_id limit 1)

  );

  

  return jsonb_build_object('success', true, 'action', 'terminated', 'relationshipId', v_existing_relationship.id);

end;

$$;



-- ================================================================================

-- MIGRATION COMPLETE

-- ================================================================================

-- The following tables have been created/updated:

-- 1. group_profiles - Comprehensive group profile management

-- 2. guest_group_relationships - Historical relationship tracking

-- 3. group_audit_log - Dedicated audit logging

-- 4. reservations - Added group_profile_id foreign key

-- 5. guests - Added parent_group_id and parent_corporate_id foreign keys

--

-- The following triggers have been created:

-- 1. trigger_auto_link_guest_to_group - Automatic linking on reservation operations

-- 2. trigger_update_group_analytics - Analytics update on checkout

--

-- The following functions have been created:

-- 1. get_guest_active_groups - Get guest's active group relationships

-- 2. get_group_active_members - Get group's active members

-- 3. link_guest_to_group - Link guest to group (manual/automatic)

-- 4. unlink_guest_from_group - Unlink guest from group

--

-- ================================================================================
-- Migration: Update create_group_booking function to create group profiles and guest relationships

-- This updates the group booking creation to:

-- 1. Create group profile in group_profiles table

-- 2. Create group booking record in group_bookings table (legacy)

-- 3. Create guest profiles in guests table for each room

-- 4. Create guest-group relationships in guest_group_relationships table



-- Drop old function

drop function if exists create_group_booking;



-- Create updated function

create or replace function create_group_booking(

  p_group_name text,

  p_contact_name text,

  p_contact_email text,

  p_contact_phone text,

  p_room_type_needed text,

  p_room_count integer,

  p_check_in_date date,

  p_check_out_date date,

  p_discount_percent numeric,

  p_status text,

  p_user_id text

)

returns jsonb

language plpgsql

security definer

as $$

declare

  v_group_id text := 'GRP-' || (floor(random() * 9000) + 1000)::int::text;

  v_group_code text := v_group_id;

  v_now timestamp with time zone := now();

  v_i integer;

  v_guest_id text;

  v_relationship_id text;

begin

  -- Create group profile record (new system)

  insert into group_profiles (

    id, code, name, type, status,

    contact_name, contact_email, contact_phone,

    organization_name, billing_address,

    preferences, notes,

    commission_percent,

    created_at, updated_at

  ) values (

    v_group_id, v_group_code, p_group_name, 'GroupReservation',

    case when p_status = 'Confirmed' then 'Active' else 'Active' end,

    p_contact_name, p_contact_email, p_contact_phone,

    p_group_name, '{}'::jsonb,

    jsonb_build_object('preferredRoomType', p_room_type_needed),

    'Group booking: ' || p_group_name,

    0.00,

    v_now, v_now

  );



  -- Create group booking record (legacy system for compatibility)

  insert into group_bookings (

    id, group_name, contact_name, contact_email, contact_phone,

    room_type_needed, room_count, check_in_date, check_out_date,

    discount_percent, status

  ) values (

    v_group_id, p_group_name, p_contact_name, p_contact_email, p_contact_phone,

    p_room_type_needed, p_room_count, p_check_in_date, p_check_out_date,

    p_discount_percent, p_status

  );



  -- Create guest profiles and guest-group relationships for each room

  for v_i in 1..p_room_count loop

    -- Create guest profile for this room

    v_guest_id := 'G-' || gen_random_uuid()::text;

    insert into guests (

      id, name, email, phone, status,

      loyalty_points, special_requests, notes, total_spend,

      parent_group_id, is_primary_contact

    ) values (

      v_guest_id,

      p_contact_name,

      p_contact_email,

      p_contact_phone,

      'Regular',

      0,

      '',

      'Group booking: ' || p_group_name || ' - Room ' || v_i,

      0,

      v_group_id,

      v_i = 1

    );



    -- Create guest-group relationship

    v_relationship_id := gen_random_uuid()::text;

    insert into guest_group_relationships (

      id, guest_id, group_id, relationship_type, status,

      start_date, end_date, role_title, is_primary_contact,

      created_at, updated_at

    ) values (

      v_relationship_id,

      v_guest_id,

      v_group_id,

      'GroupReservation',

      'Active',

      p_check_in_date,

      p_check_out_date,

      case when v_i = 1 then 'Primary Contact' else 'Member' end,

      v_i = 1,

      v_now,

      v_now

    );

  end loop;



  -- Audit

  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)

  values (

    gen_random_uuid()::text, p_user_id, 'group_booking.create', 'group_booking', v_group_id, 'frontoffice',

    jsonb_build_object(

      'groupName', p_group_name,

      'roomCount', p_room_count,

      'roomType', p_room_type_needed

    )

  );



  return jsonb_build_object(

    'success', true,

    'groupId', v_group_id

  );

end;

$$;

-- ======================================================================================

-- Migration 003: Gift Shop POS Tables & Invoice Sequence

-- ======================================================================================



-- Add retail_price to inventory items for decoupled retail pricing



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



-- Gift Shop Issues (damaged / broken / lost write-offs)



-- Enable RLS on gift shop tables

alter table gift_shop_sales enable row level security;

alter table gift_shop_issues enable row level security;

-- ======================================================================================

-- INVENTORY PORTAL SCHEMA ALIGNMENT

-- Adds columns missing from inventory_items to match the frontend InventoryItem interface

-- ======================================================================================



-- ======================================================================================

-- SEED INVENTORY DEMO DATA

-- Populates all inventory portal tables with realistic hotel ERP data

-- ======================================================================================



-- Suppliers (aligned with frontend defaults)

insert into inventory_suppliers (id, code, name, contact_person, phone, email, status, rating) values

('S-001', 'SUP-001', 'Global Foods Ltd', 'Account Manager', '+1 234 567 890', 'sales@globalfoods.com', 'Active', 5),

('S-002', 'SUP-002', 'Luxe Hospitality Supplies', 'Operations Lead', '+1 987 654 321', 'orders@luxesupplies.pro', 'Active', 5),

('S-003', 'SUP-003', 'Prime Meats & Poultry', 'Sales Representative', '+1 555 123 456', 'sales@primemeats.com', 'Active', 4),

('S-004', 'SUP-004', 'Metro Office Solutions', 'Client Services', '+1 444 888 999', 'support@metro-office.com', 'Inactive', 3),

('S-005', 'SUP-005', 'Technical Maintenance Parts', 'Fleet Supervisor', '+1 222 333 444', 'service@techmaintenance.net', 'Active', 5)

on conflict (id) do nothing;



-- Inventory Items (diverse categories, all mapped columns)

insert into inventory_items (

  id, code, name, category, subcategory, unit, brand, supplier_id,

  max_stock, reorder_level, last_cost, avg_cost, current_stock,

  location, barcode, store_id, stock, price, min_stock,

  retail_price, sale_price, guest_portal_active, image_url, dietary_tags

) values

('I-001', 'FVG-001', 'Fresh Organic Tomatoes', 'Food & Beverage', 'Fresh Produce', 'kg', 'GreenFields', 'S-001', 500, 50, 12.50, 12.50, 120, 'Central Warehouse', '8901234567890', 'ST-MAIN', 120, 12.50, 30, 0.00, 0.00, false, null, '{}'),

('I-002', 'FVG-002', 'Chicken Breast Fillet', 'Food & Beverage', 'Meat & Poultry', 'kg', 'Prime Farms', 'S-003', 300, 40, 45.00, 45.00, 85, 'Central Warehouse', '8901234567891', 'ST-MAIN', 85, 45.00, 20, 0.00, 0.00, false, null, '{}'),

('I-003', 'FVB-003', 'Mineral Water 500ml', 'Food & Beverage', 'Beverages', 'pcs', 'AquaPure', 'S-001', 2000, 200, 3.50, 3.50, 450, 'Bar Store', '8901234567892', 'ST-BAR', 450, 3.50, 100, 8.00, 6.00, true, null, array['Vegetarian','Vegan']),

('I-004', 'HKG-001', 'Luxury Shampoo 30ml', 'Housekeeping', 'Guest Amenities', 'pcs', 'LuxeScent', 'S-002', 5000, 500, 1.20, 1.20, 1200, 'Housekeeping Central', '8901234567893', 'ST-HK', 1200, 1.20, 200, 5.00, 4.00, true, null, '{}'),

('I-005', 'HKC-002', 'All-Purpose Cleaner', 'Housekeeping', 'Cleaning Chemicals', 'ltr', 'CleanMax', 'S-002', 200, 30, 18.00, 18.00, 45, 'Housekeeping Central', '8901234567894', 'ST-HK', 45, 18.00, 10, 0.00, 0.00, false, null, array['Eco-Friendly']),

('I-006', 'ENG-001', 'LED Bulb 9W', 'Engineering', 'Electrical', 'pcs', 'BrightLight', 'S-005', 300, 50, 8.50, 8.50, 95, 'Engineering Plant Store', '8901234567895', 'ST-ENG', 95, 8.50, 20, 0.00, 0.00, false, null, '{}'),

('I-007', 'ENP-002', 'PVC Pipe 20mm', 'Engineering', 'Plumbing', 'mtr', 'FlowTech', 'S-005', 500, 60, 6.00, 6.00, 130, 'Engineering Plant Store', '8901234567896', 'ST-ENG', 130, 6.00, 25, 0.00, 0.00, false, null, '{}'),

('I-008', 'OFF-001', 'A4 Copy Paper Ream', 'Office Supplies', 'Stationery', 'pcs', 'PaperMills', 'S-004', 100, 20, 12.00, 12.00, 35, 'Central Warehouse', '8901234567897', 'ST-MAIN', 35, 12.00, 10, 0.00, 0.00, false, null, '{}'),

('I-009', 'OFF-002', 'Ink Cartridge HP-63', 'Office Supplies', 'Printing', 'pcs', 'HP', 'S-004', 50, 10, 45.00, 45.00, 18, 'Central Warehouse', '8901234567898', 'ST-MAIN', 18, 45.00, 5, 0.00, 0.00, false, null, '{}'),

('I-010', 'GFT-001', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 200, 30, 8.00, 8.00, 60, 'Gift Store', '8901234567899', 'ST-GIFT', 60, 8.00, 15, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),

('I-011', 'GFT-002', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 100, 10, 2.00, 2.00, 40, 'Gift Store', '8901234567900', 'ST-GIFT', 40, 2.00, 5, 5.00, 0.00, true, null, '{}'),

('I-012', 'FVB-004', 'Ethiopian Coffee Beans 1kg', 'Food & Beverage', 'Beverages', 'kg', 'Habesha Roast', 'S-001', 100, 15, 35.00, 35.00, 28, 'Restaurant Store', '8901234567901', 'ST-REST', 28, 35.00, 10, 45.00, 40.00, true, null, array['Organic','Fair Trade']),

('I-013', 'FVD-005', 'Mozzarella Cheese Block', 'Food & Beverage', 'Dairy', 'kg', 'DairyGold', 'S-001', 80, 10, 28.00, 28.00, 22, 'Restaurant Store', '8901234567902', 'ST-REST', 22, 28.00, 8, 0.00, 0.00, false, null, array['Vegetarian']),

('I-014', 'HKL-003', 'Linen Bed Sheets King', 'Housekeeping', 'Laundry Supplies', 'pcs', 'SoftThread', 'S-002', 150, 25, 65.00, 65.00, 40, 'Housekeeping Central', '8901234567903', 'ST-HK', 40, 65.00, 15, 0.00, 0.00, false, null, '{}'),

('I-015', 'ENG-003', 'Air Filter 16x25x1', 'Engineering', 'HVAC', 'pcs', 'FilterPro', 'S-005', 80, 15, 22.00, 22.00, 18, 'Engineering Plant Store', '8901234567904', 'ST-ENG', 18, 22.00, 8, 0.00, 0.00, false, null, '{}'),

('I-016', 'OFC-001', 'Ballpoint Pen Black', 'Office Supplies', 'Stationery', 'pcs', 'WriteWell', 'S-004', 200, 30, 1.50, 1.50, 45, 'Front Office Store', '8901234567905', 'ST-OFC', 45, 1.50, 15, 0.00, 0.00, false, null, '{}'),

('I-017', 'OFC-002', 'Sticky Notes 3x3 Yellow', 'Office Supplies', 'Stationery', 'pcs', 'Post-it', 'S-004', 100, 20, 4.00, 4.00, 30, 'Front Office Store', '8901234567906', 'ST-OFC', 30, 4.00, 10, 0.00, 0.00, false, null, '{}'),

('I-018', 'OFC-003', 'Thermal Paper Roll 80mm', 'Office Supplies', 'Printing', 'pcs', 'PrintTech', 'S-004', 80, 15, 12.00, 12.00, 22, 'Front Office Store', '8901234567907', 'ST-OFC', 22, 12.00, 8, 0.00, 0.00, false, null, '{}'),

('I-019', 'OFC-004', 'Room Key Cards Pack', 'Office Supplies', 'Consumables', 'pcs', 'SecureKey', 'S-005', 500, 50, 3.00, 3.00, 120, 'Front Office Store', '8901234567908', 'ST-OFC', 120, 3.00, 30, 0.00, 0.00, false, null, '{}'),

('I-020', 'GFT-003', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 300, 40, 8.00, 8.00, 80, 'Central Warehouse', '8901234567909', 'ST-MAIN', 80, 8.00, 20, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),

('I-021', 'GFT-004', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 150, 20, 2.00, 2.00, 60, 'Central Warehouse', '8901234567910', 'ST-MAIN', 60, 2.00, 10, 5.00, 0.00, true, null, '{}'),

('I-022', 'GFT-005', 'Local Coffee Blend', 'Gift Shop', 'Souvenirs', 'pcs', 'Habesha Roast', 'S-003', 200, 30, 10.00, 10.00, 55, 'Central Warehouse', '8901234567911', 'ST-MAIN', 55, 10.00, 15, 24.00, 20.00, true, null, '{}'),

('I-023', 'GFT-006', 'Crystal Keepsake', 'Gift Shop', 'Souvenirs', 'pcs', 'ArtisanGlass', 'S-002', 80, 15, 40.00, 40.00, 25, 'Central Warehouse', '8901234567912', 'ST-MAIN', 25, 40.00, 8, 95.00, 80.00, true, null, '{}')

on conflict (id) do nothing;



-- Requisitions

insert into inventory_requisitions (id, number, department, requested_by, request_date, priority, status, items) values

('REQ-001', 'REQ-0001', 'Housekeeping', 'Alice Johnson', '2026-06-01', 'Normal', 'Issued', '[{"itemId":"I-004","name":"Luxury Shampoo 30ml","requestedQty":200,"issuedQty":200,"unit":"pcs","cost":1.20},{"itemId":"I-005","name":"All-Purpose Cleaner","requestedQty":10,"issuedQty":10,"unit":"ltr","cost":18.00}]'::jsonb),

('REQ-002', 'REQ-0002', 'Restaurant', 'Chef Marco', '2026-06-05', 'High', 'Approved', '[{"itemId":"I-001","name":"Fresh Organic Tomatoes","requestedQty":50,"issuedQty":0,"unit":"kg","cost":12.50},{"itemId":"I-012","name":"Ethiopian Coffee Beans 1kg","requestedQty":5,"issuedQty":0,"unit":"kg","cost":35.00}]'::jsonb),

('REQ-003', 'REQ-0003', 'Engineering', 'Tom Bradley', '2026-06-08', 'Urgent', 'Pending', '[{"itemId":"I-006","name":"LED Bulb 9W","requestedQty":20,"issuedQty":0,"unit":"pcs","cost":8.50},{"itemId":"I-015","name":"Air Filter 16x25x1","requestedQty":10,"issuedQty":0,"unit":"pcs","cost":22.00}]'::jsonb),

('REQ-004', 'REQ-0004', 'Front Office', 'Sarah Lee', '2026-06-10', 'Normal', 'Received', '[{"itemId":"I-003","name":"Mineral Water 500ml","requestedQty":100,"issuedQty":100,"unit":"pcs","cost":3.50}]'::jsonb)

on conflict (id) do nothing;



-- Stock Movements

insert into inventory_stock_movements (id, movement_date, item_id, item_name, type, quantity, cost, reference, "user", store_from, store_to) values

('M-001', '2026-06-01', 'I-001', 'Fresh Organic Tomatoes', 'Purchase', 120, 12.50, 'GRN-0001', 'John Storekeeper', null, 'Central Warehouse'),

('M-002', '2026-06-01', 'I-004', 'Luxury Shampoo 30ml', 'Purchase', 500, 1.20, 'GRN-0001', 'John Storekeeper', null, 'Housekeeping Central'),

('M-003', '2026-06-02', 'I-004', 'Luxury Shampoo 30ml', 'Issue', -200, 1.20, 'REQ-0001', 'Alice Johnson', 'Housekeeping Central', null),

('M-004', '2026-06-03', 'I-006', 'LED Bulb 9W', 'Purchase', 50, 8.50, 'GRN-0002', 'John Storekeeper', null, 'Engineering Plant Store'),

('M-005', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', -50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),

('M-006', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', 50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),

('M-007', '2026-06-05', 'I-012', 'Ethiopian Coffee Beans 1kg', 'Adjustment', -2, 35.00, 'ADJ-001', 'System', 'Restaurant Store', null),

('M-008', '2026-06-06', 'I-010', 'Hotel Branded Mug', 'Damage', -3, 8.00, 'DMG-001', 'Gift Shop Supervisor', 'Gift Store', null),

('M-009', '2026-06-07', 'I-002', 'Chicken Breast Fillet', 'Purchase', 40, 45.00, 'GRN-0003', 'John Storekeeper', null, 'Central Warehouse')

on conflict (id) do nothing;



-- Goods Received Notes (GRNs)

insert into inventory_grns (id, number, supplier_id, supplier_name, purchase_order_id, delivery_note, invoice_number, received_date, receiver, items, total_value) values

('GRN-001', 'GRN-2026-0001', 'S-001', 'Global Foods Ltd', 'PO-5023', 'DN-12345', 'INV-4001', '2026-06-01', 'John Storekeeper',

'[{"itemId":"I-001","name":"Fresh Organic Tomatoes","receivedQty":120,"unitCost":12.50,"batchNumber":"B-105","expiryDate":"2027-04-15"},{"itemId":"I-004","name":"Luxury Shampoo 30ml","receivedQty":500,"unitCost":1.20,"batchNumber":"B-203","expiryDate":"2028-01-01"}]'::jsonb, 2100.00),

('GRN-002', 'GRN-2026-0002', 'S-005', 'Technical Maintenance Parts', 'PO-5024', 'DN-12346', 'INV-4002', '2026-06-03', 'John Storekeeper',

'[{"itemId":"I-006","name":"LED Bulb 9W","receivedQty":50,"unitCost":8.50,"batchNumber":"B-301","expiryDate":"2030-12-31"},{"itemId":"I-015","name":"Air Filter 16x25x1","receivedQty":10,"unitCost":22.00,"batchNumber":"B-302","expiryDate":"2030-12-31"}]'::jsonb, 645.00),

('GRN-003', 'GRN-2026-0003', 'S-003', 'Prime Meats & Poultry', 'PO-5025', 'DN-12347', 'INV-4003', '2026-06-07', 'John Storekeeper',

'[{"itemId":"I-002","name":"Chicken Breast Fillet","receivedQty":40,"unitCost":45.00,"batchNumber":"B-401","expiryDate":"2026-06-14"}]'::jsonb, 1800.00)

on conflict (id) do nothing;

-- Seed preset system users for development / demo access

-- Password for all seeded accounts: admin123

-- Run this in your Supabase SQL Editor if the app is in database auth mode.



INSERT INTO system_users (

  id, name, email, role, role_description, avatar_initials,

  status, password_hash, force_password_change, created_at, updated_at

) VALUES

  ('U-101', 'Front Office Supervisor', 'frontoffice@erp.com', 'frontoffice', 'Night Auditor', 'FO', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-102', 'Housekeeping Manager', 'housekeeping@erp.com', 'housekeeping', 'HK Supervisor', 'HK', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-103', 'F&B Director', 'fb@erp.com', 'f&b', 'Culinary Director', 'FB', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-104', 'Chief Engineer', 'maintenance@erp.com', 'maintenance', 'Chief Engineer', 'CE', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-105', 'General Manager', 'gm@erp.com', 'executive', 'General Manager', 'GM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-106', 'Finance Controller', 'finance@erp.com', 'finance', 'Finance Controller', 'FC', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-107', 'HR Manager', 'hr@erp.com', 'hr', 'HR Manager', 'HR', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-108', 'Inventory Manager', 'inventory@erp.com', 'inventory', 'Stores Manager', 'IM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-109', 'Procurement Lead', 'procurement@erp.com', 'procurement', 'Procurement Lead', 'PL', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),

  ('U-110', 'System Administrator', 'admin@erp.com', 'admin', 'System Administrator', 'SA', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now())

ON CONFLICT (email) DO NOTHING;



-- Restrict System Administrator to Admin portal only

UPDATE system_users

SET allowed_tabs = '{"admin", "settings"}'::text[], role = 'admin'

WHERE email = 'admin@erp.com';

-- Add permission_matrix JSONB column to system_users for granular RBAC

alter table system_users add column if not exists permission_matrix jsonb not null default '{}'::jsonb;

-- Security enhancements: account lockout, forced password change, reset tokens, RLS

alter table if exists system_users

  add column if not exists force_password_change boolean not null default false,

  add column if not exists password_reset_token text,

  add column if not exists password_reset_expires timestamp with time zone;



-- Enable RLS on sensitive admin tables

alter table if exists system_users enable row level security;

alter table if exists custom_roles enable row level security;

alter table if exists global_settings enable row level security;

alter table if exists audit_events enable row level security;



-- Drop any existing anon/policy rules so we can recreate cleanly

-- (safe to re-run)

drop policy if exists "system_users_anon_all" on system_users;

drop policy if exists "custom_roles_anon_all" on custom_roles;

drop policy if exists "global_settings_anon_all" on global_settings;

-- Migration: Add module_toggles and missing settings columns to global_settings

-- This ensures all GlobalHotelSettings fields have corresponding DB columns.



alter table global_settings add column if not exists module_toggles jsonb not null default '{}'::jsonb;

alter table global_settings add column if not exists hero_image_url text;

alter table global_settings add column if not exists contact_phone text;

alter table global_settings add column if not exists public_tagline text;

alter table global_settings add column if not exists social_links jsonb not null default '[]'::jsonb;

alter table global_settings add column if not exists force_mfa boolean not null default false;

alter table global_settings add column if not exists strict_password_rotation boolean not null default false;

alter table global_settings add column if not exists biometric_reauth boolean not null default false;

alter table global_settings add column if not exists maintenance_message text;

alter table global_settings add column if not exists public_booking_enabled boolean not null default true;

alter table global_settings add column if not exists guest_portal_enabled boolean not null default true;

alter table global_settings add column if not exists vip_spend_threshold numeric not null default 0.00;

alter table global_settings add column if not exists public_page_content jsonb not null default '{}'::jsonb;



comment on column global_settings.module_toggles is 'JSONB map of admin/department module toggle keys to boolean enabled state.';

-- Migration: Add allowed_ips column to global_settings

-- This column is referenced in server.ts KNOWN_GLOBAL_SETTINGS_COLUMNS but was missing from previous migrations



alter table global_settings add column if not exists allowed_ips text[] not null default '{}'::text[];



comment on column global_settings.allowed_ips is 'Array of allowed IP addresses for system access control';

-- Add api_integrations column to global_settings table

-- Add isolation_policy column to global_settings table

-- Used for subsystem isolation/zero-trust security settings

ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;

-- Add auto_night_audit_time column to global_settings table

-- Used for automatic night audit scheduling

-- Add backup_frequency column to global_settings table

-- Used for backup scheduling (daily, weekly, manual)

-- Add system_log_level column to global_settings table

-- Used for system logging verbosity (info, detailed, debug)

-- Comprehensive migration to add ALL missing columns to global_settings table

-- This ensures the database is fully aligned with schema.sql



ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;



-- Add audit columns for tracking changes

ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS created_at timestamptz default now();



ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();



ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS created_by text;



ALTER TABLE global_settings 

ADD COLUMN IF NOT EXISTS updated_by text;

-- Migration 017: Pending admin changes queue for Executive Governance approval workflow



CREATE TABLE IF NOT EXISTS pending_admin_changes (

  id          TEXT PRIMARY KEY,

  title       TEXT NOT NULL,

  description TEXT,

  change_type TEXT NOT NULL,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  submitted_by TEXT NOT NULL,

  status      TEXT NOT NULL DEFAULT 'Pending',

  payload     JSONB NOT NULL

);



CREATE INDEX IF NOT EXISTS idx_pending_admin_changes_status ON pending_admin_changes (status);

-- Risk & Compliance Management Table

create table if not exists risk_compliance (

  id text primary key default gen_random_uuid()::text,

  title text not null,

  category text not null check (category in ('Compliance', 'Legal', 'Financial', 'Safety', 'Operational')),

  status text not null check (status in ('Good', 'Warning', 'Critical', 'Expired')),

  expiry_date date,

  owner text not null,

  description text default '',

  created_at timestamp with time zone default now(),

  updated_at timestamp with time zone default now()

);



-- Index for faster queries

create index if not exists idx_risk_compliance_status on risk_compliance(status);

create index if not exists idx_risk_compliance_expiry on risk_compliance(expiry_date);

create index if not exists idx_risk_compliance_category on risk_compliance(category);



-- Insert sample data

insert into risk_compliance (title, category, status, expiry_date, owner, description) values

  ('Fire Safety Certification', 'Safety', 'Warning', '2024-12-31', 'Engineering', 'Annual fire safety inspection and certification'),

  ('Liquor License Renewal', 'Legal', 'Warning', '2024-06-30', 'Executive', 'State liquor license renewal'),

  ('GDPR / Data Privacy Audit', 'Compliance', 'Good', '2024-11-05', 'Admin', 'Annual data privacy compliance audit'),

  ('Asset Insurance Policy', 'Financial', 'Good', '2025-01-15', 'Finance', 'Property and liability insurance coverage'),

  ('Health & Safety Inspection', 'Safety', 'Good', '2024-09-30', 'Engineering', 'Quarterly health and safety inspection'),

  ('Food Safety Certificate', 'Compliance', 'Good', '2024-08-15', 'F&B', 'Restaurant food handling certification'),

  ('Building Permit Renewal', 'Legal', 'Good', '2025-03-01', 'Engineering', 'Municipal building compliance'),

  ('Environmental Compliance', 'Compliance', 'Warning', '2024-07-31', 'Engineering', 'Waste management and environmental standards')

on conflict do nothing;

-- ============================================================

-- 019_public_page_editor.sql

-- Public Page Editor: pages, versions, blocks, templates, media,

-- policy metadata, legal review records, audit log

-- ============================================================



-- 1. Pages

CREATE TABLE IF NOT EXISTS pages (

  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  property_id           TEXT NOT NULL DEFAULT 'single-property',

  slug                  TEXT NOT NULL,

  page_type             TEXT NOT NULL CHECK (page_type IN ('marketing','policy')),

  status                TEXT NOT NULL DEFAULT 'draft'

                          CHECK (status IN ('draft','in_review','published','archived')),

  published_version_id  TEXT,

  current_draft_id      TEXT,

  locale                TEXT NOT NULL DEFAULT 'en',
  title                 TEXT,

  seo_title             TEXT,

  seo_description       TEXT,

  seo_og_image_url      TEXT,

  seo_canonical_url     TEXT,

  structured_data       JSONB,

  scheduled_publish_at  TIMESTAMPTZ,

  scheduled_expire_at   TIMESTAMPTZ,

  created_by            TEXT NOT NULL,

  updated_by            TEXT NOT NULL,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (property_id, slug, locale)

);



CREATE INDEX IF NOT EXISTS idx_pages_property_id ON pages(property_id);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);



-- 2. Page Versions (immutable snapshots)

CREATE TABLE IF NOT EXISTS page_versions (

  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id         TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  version_number  INT NOT NULL,

  block_tree      JSONB NOT NULL,

  change_summary  TEXT,

  created_by      TEXT NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (page_id, version_number)

);



CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);



-- Prevent direct updates/deletes to version records (enforce immutability)

CREATE OR REPLACE FUNCTION prevent_version_mutation()

RETURNS TRIGGER LANGUAGE plpgsql AS $$

BEGIN

  RAISE EXCEPTION 'Page version records are immutable and cannot be modified or deleted.';

END;

$$;



drop trigger if exists trg_prevent_version_update on page_versions;

CREATE TRIGGER trg_prevent_version_update

  BEFORE UPDATE ON page_versions

  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();



drop trigger if exists trg_prevent_version_delete on page_versions;

CREATE TRIGGER trg_prevent_version_delete

  BEFORE DELETE ON page_versions

  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();



-- 3. Blocks (live working state for current draft)

CREATE TABLE IF NOT EXISTS blocks (

  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  property_id TEXT NOT NULL DEFAULT 'single-property',

  block_type  TEXT NOT NULL CHECK (block_type IN (

    'hero','text_rich','image','gallery','features','room_card','offer_card',

    'testimonial','cta_button','video','map','embedded_form',

    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',

    'faq_accordion','divider','spacer',

    'navigation','contact_form','newsletter','carousel','stats_counter','team_list','container',

    'tabs','pricing_table','testimonial_slider','before_after','masonry_gallery','countdown_timer','scroll_reveal',

    'booking_hero','booking_room_card','booking_filter_bar',

    'booking_experience_section','booking_testimonials_section',

    'booking_story_section','booking_footer_section','booking_sidebar_section','booking_features_section'

  )),

  position    INT NOT NULL,

  config      JSONB NOT NULL DEFAULT '{}',

  is_dynamic  BOOLEAN NOT NULL DEFAULT false,

  template_id TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);

CREATE INDEX IF NOT EXISTS idx_blocks_page_position ON blocks(page_id, position);



-- 4. Block Templates

CREATE TABLE IF NOT EXISTS block_templates (

  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  property_id   TEXT, -- NULL = system-wide template

  name          TEXT NOT NULL,

  block_type    TEXT NOT NULL,

  config        JSONB NOT NULL DEFAULT '{}',

  thumbnail_url TEXT,

  is_system     BOOLEAN NOT NULL DEFAULT false,

  created_by    TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_block_templates_property_id ON block_templates(property_id);



-- 5. Media Assets

CREATE TABLE IF NOT EXISTS media_assets (

  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  property_id     TEXT NOT NULL DEFAULT 'single-property',

  filename        TEXT NOT NULL,

  mime_type       TEXT NOT NULL,

  file_size_bytes BIGINT NOT NULL,

  width_px        INT,

  height_px       INT,

  cdn_url         TEXT NOT NULL,

  alt_text        TEXT,

  scan_status     TEXT NOT NULL DEFAULT 'pending'

                    CHECK (scan_status IN ('pending','clean','quarantined')),

  usage_refs      JSONB DEFAULT '[]',

  uploaded_by     TEXT NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_media_assets_property_id ON media_assets(property_id);

CREATE INDEX IF NOT EXISTS idx_media_assets_scan_status ON media_assets(scan_status);



-- 6. Policy Page Metadata

CREATE TABLE IF NOT EXISTS policy_page_metadata (

  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id               TEXT NOT NULL UNIQUE REFERENCES pages(id) ON DELETE CASCADE,

  effective_date        DATE,

  requires_legal_review BOOLEAN NOT NULL DEFAULT true,

  legal_template_id     TEXT,

  jurisdiction_tags     TEXT[] DEFAULT '{}',

  last_approved_by      TEXT,

  last_approved_at      TIMESTAMPTZ,

  last_approved_version_id TEXT,

  change_log            JSONB DEFAULT '[]'

);



-- 7. Legal Page Templates (central corporate-approved base templates)

CREATE TABLE IF NOT EXISTS legal_page_templates (

  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  template_name   TEXT NOT NULL,

  jurisdiction    TEXT[] DEFAULT '{}',

  block_tree      JSONB NOT NULL,

  mandatory_block_ids TEXT[] DEFAULT '{}',

  approved_by     TEXT,

  approved_at     TIMESTAMPTZ,

  version         INT NOT NULL DEFAULT 1,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);



-- 8. Legal Review Records (enforcement layer for policy publishing)

CREATE TABLE IF NOT EXISTS legal_review_records (

  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  version_id  TEXT NOT NULL REFERENCES page_versions(id) ON DELETE CASCADE,

  reviewer_id TEXT NOT NULL,

  decision    TEXT NOT NULL CHECK (decision IN ('approved','rejected')),

  comments    TEXT,

  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (page_id, version_id)

);



CREATE INDEX IF NOT EXISTS idx_legal_review_records_page_id ON legal_review_records(page_id);

CREATE INDEX IF NOT EXISTS idx_legal_review_records_version_id ON legal_review_records(version_id);



-- DB constraint: policy page cannot be published without approved legal review

CREATE OR REPLACE FUNCTION enforce_policy_page_legal_review()

RETURNS TRIGGER LANGUAGE plpgsql AS $$

BEGIN

  IF NEW.status = 'published' THEN

    IF (SELECT page_type FROM pages WHERE id = NEW.id) = 'policy' THEN

      IF NOT EXISTS (

        SELECT 1 FROM legal_review_records

        WHERE page_id = NEW.id

          AND version_id = NEW.published_version_id

          AND decision = 'approved'

      ) THEN

        RAISE EXCEPTION 'Policy pages require an approved legal_review_record before publishing';

      END IF;

    END IF;

  END IF;

  RETURN NEW;

END;

$$;



drop trigger if exists trg_enforce_legal_review on pages;

CREATE TRIGGER trg_enforce_legal_review

  BEFORE UPDATE ON pages

  FOR EACH ROW EXECUTE FUNCTION enforce_policy_page_legal_review();



-- 9. Page Audit Log

CREATE TABLE IF NOT EXISTS page_audit_log (

  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id       TEXT REFERENCES pages(id),

  property_id   TEXT NOT NULL DEFAULT 'single-property',

  actor_id      TEXT NOT NULL,

  action        TEXT NOT NULL,

  version_id    TEXT REFERENCES page_versions(id),

  before_state  JSONB,

  after_state   JSONB,

  diff          JSONB,

  ip_address    INET,

  user_agent    TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_page_audit_log_page_id ON page_audit_log(page_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_audit_log_property_id ON page_audit_log(property_id, created_at DESC);



-- Insert sample legal page template

INSERT INTO legal_page_templates (template_name, jurisdiction, block_tree, mandatory_block_ids, approved_by, approved_at)

VALUES (

  'Privacy Policy v1',

  ARRAY['ETH', 'EU-GDPR'],

  '[

    {"block_type":"policy_clause","position":1,"config":{"title":"Data Collection","content":"We collect..."}},

    {"block_type":"policy_clause","position":2,"config":{"title":"Data Usage","content":"We use your data to..."}},

    {"block_type":"policy_clause","position":3,"config":{"title":"Your Rights","content":"You have the right to..."}}

  ]',

  ARRAY['policy_clause'],

  'system',

  now()

) ON CONFLICT DO NOTHING;



-- Insert sample system block templates

INSERT INTO block_templates (property_id, name, block_type, config, is_system, created_by)

VALUES

  (NULL, 'Hero Banner - Default', 'hero', '{"title":"Welcome","subtitle":"Your perfect stay awaits","backgroundImage":""}', true, 'system'),

  (NULL, 'Room Card - Standard', 'room_card', '{"showPrice":true,"showAmenities":true}', true, 'system'),

  (NULL, 'CTA Button - Book Now', 'cta_button', '{"text":"Book Now","link":"/booking"}', true, 'system'),

  (NULL, 'Policy Clause - Standard', 'policy_clause', '{"title":"","content":""}', true, 'system')

ON CONFLICT DO NOTHING;

-- ============================================================

-- 020_page_editor_public_booking.sql

-- Allow 'public_booking' page type and add preview link tokens

-- ============================================================



-- Relax page_type check constraint to include public_booking

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_page_type_check;

ALTER TABLE pages ADD CONSTRAINT pages_page_type_check

  CHECK (page_type IN ('marketing','policy','public_booking'));



-- Preview share links for stakeholder review

CREATE TABLE IF NOT EXISTS page_preview_links (

  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  token       TEXT NOT NULL UNIQUE,

  created_by  TEXT NOT NULL,

  expires_at  TIMESTAMPTZ NOT NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_page_preview_links_token ON page_preview_links(token);

CREATE INDEX IF NOT EXISTS idx_page_preview_links_page_id ON page_preview_links(page_id);

-- ============================================================

-- 021_page_editor_initial_data.sql

-- Modern Booking Page with modular individual blocks

-- ============================================================



-- Add title column to pages table

ALTER TABLE pages ADD COLUMN IF NOT EXISTS title TEXT;



-- Insert modern booking page

INSERT INTO pages (

  id, property_id, slug, page_type, status, locale,

  seo_title, seo_description, seo_og_image_url, seo_canonical_url,

  title, created_by, updated_by

) VALUES

  (

    'page-booking',

    'single-property',

    'booking',

    'public_booking',

    'published',

    'en',

    'Book Your Stay',

    'Online reservations for your perfect stay with modern booking experience',

    NULL,

    'https://example.com/booking',

    'Modern Booking Page',

    'system',

    'system'

  )

ON CONFLICT (property_id, slug, locale) DO NOTHING;



-- Delete old monolithic booking_engine block and any stale individual room cards

DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_engine';

DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_room_card' AND id IN ('block-booking-room-card-1', 'block-booking-room-card-2');



-- Insert modular blocks for the booking page (grid layout ready)

INSERT INTO blocks (id, page_id, property_id, block_type, position, config, is_dynamic, created_at, updated_at) VALUES

  (

    'block-booking-hero',

    'page-booking',

    'single-property',

    'booking_hero',

    0,

    '{

      "title": "",

      "subtitle": "",

      "badge": "Direct Booking",

      "imageUrl": "",

      "videoUrl": "",

      "overlay": true,

      "height": "400px",

      "overlayColor": "bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent",

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-filter-bar',

    'page-booking',

    'single-property',

    'booking_filter_bar',

    1,

    '{

      "showPromoCode": true,

      "primaryColor": "#4f46e5",

      "accentColor": "#f59e0b",

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-room-list',

    'page-booking',

    'single-property',

    'booking_room_card',

    2,

    '{

      "primaryColor": "#4f46e5",

      "accentColor": "#f59e0b",

      "amenitiesLabel": "Amenities",

      "soldOutLabel": "Sold Out",

      "availableLabel": "{count} rooms available",

      "perNightLabel": "/night",

      "noImageLabel": "No image",

      "addLabel": "+",

      "removeLabel": "-",

      "emptyLabel": "No rooms available for the selected dates.",

      "colSpan": 3,

      "rowSpan": 2

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-sidebar',

    'page-booking',

    'single-property',

    'booking_sidebar_section',

    3,

    '{

      "title": "Contact Us",

      "email": "",

      "phone": "",

      "address": "",

      "position": "right",

      "colSpan": 1,

      "rowSpan": 2

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-features',

    'page-booking',

    'single-property',

    'booking_features_section',

    4,

    '{

      "title": "Why Book Direct",

      "description": "Enjoy the best rates and perks.",

      "features": [],

      "columns": 4,

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-experience-section',

    'page-booking',

    'single-property',

    'booking_experience_section',

    5,

    '{

      "title": "Enhance Your Stay",

      "description": "Add experiences to your reservation.",

      "showSection": true,

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-testimonials-section',

    'page-booking',

    'single-property',

    'booking_testimonials_section',

    6,

    '{

      "title": "Guest Reviews",

      "testimonials": [],

      "showSection": true,

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-story-section',

    'page-booking',

    'single-property',

    'booking_story_section',

    7,

    '{

      "title": "Our Story",

      "text": "Experience the perfect blend of luxury and nature.",

      "stat1": "100+",

      "stat2": "5 Star",

      "stat1Label": "Rooms",

      "stat2Label": "Rating",

      "showSection": true,

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  ),

  (

    'block-booking-footer-section',

    'page-booking',

    'single-property',

    'booking_footer_section',

    8,

    '{

      "text": "Thank you for choosing our hotel.",

      "copyright": "Â© 2026 Grand Hotel. All rights reserved.",

      "links": [],

      "showSection": true,

      "primaryColor": "#4f46e5",

      "colSpan": 4,

      "rowSpan": 1

    }',

    false,

    NOW(),

    NOW()

  )

ON CONFLICT DO NOTHING;

-- ============================================================

-- 022_page_creator_block_types.sql

-- Allow the block types used by the LEGO-style page creator.

-- Note: The modern booking page setup is handled in 021_page_editor_initial_data.sql

-- ============================================================



-- ============================================================
-- 024_public_testimonials.sql

-- 024_public_testimonials.sql

-- Guest testimonials submitted through the public booking portal.

-- ============================================================



CREATE TABLE IF NOT EXISTS public_testimonials (

  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  property_id   TEXT NOT NULL DEFAULT 'single-property',

  guest_name    TEXT NOT NULL,

  location      TEXT,

  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),

  comment       TEXT NOT NULL,

  stay_date     TEXT,

  room_type     TEXT,

  avatar_url    TEXT,

  status        TEXT NOT NULL DEFAULT 'approved'

                  CHECK (status IN ('pending','approved','rejected')),

  source        TEXT NOT NULL DEFAULT 'public_portal'

                  CHECK (source IN ('public_portal','imported','manager')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);



CREATE INDEX IF NOT EXISTS idx_public_testimonials_property_id ON public_testimonials(property_id);

CREATE INDEX IF NOT EXISTS idx_public_testimonials_status ON public_testimonials(status);

CREATE INDEX IF NOT EXISTS idx_public_testimonials_created_at ON public_testimonials(created_at DESC);



-- Seed a few demo testimonials so the public portal is never empty on first run.

INSERT INTO public_testimonials (

  id, property_id, guest_name, location, rating, comment, stay_date, room_type, avatar_url, status, source

) VALUES

  (

    'tstm-demo-1',

    'single-property',

    'Eleanor Vance',

    'London, UK',

    5,

    'Our stay was absolutely pristine. The penthouse exceeded all expectations. The hospitality is unmatched.',

    'May 2026',

    'Penthouse',

    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',

    'approved',

    'imported'

  ),

  (

    'tstm-demo-2',

    'single-property',

    'Dr. Marcus Sterling',

    'Boston, USA',

    5,

    'I travel extensively for business and expect perfection. The resort combines breathtaking design with personalized service.',

    'June 2026',

    'Suite',

    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',

    'approved',

    'imported'

  ),

  (

    'tstm-demo-3',

    'single-property',

    'The Sato Family',

    'Tokyo, Japan',

    5,

    'Traveling with children can be demanding, but the family villa was fantastic. The kids were occupied while we fully relaxed.',

    'April 2026',

    'Family',

    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',

    'approved',

    'imported'

  ),

  (

    'tstm-demo-4',

    'single-property',

    'Chloe & Nathan Davis',

    'Sydney, Australia',

    5,

    'We spent our honeymoon in the Deluxe Room and were blown away. Falling asleep to the ocean sound was magic.',

    'June 2026',

    'Deluxe',

    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',

    'approved',

    'imported'

  )

ON CONFLICT (id) DO NOTHING;

-- ============================================================

-- 025_booking_page_blocks.sql

-- Add booking-specific block types and seed default booking page

-- ============================================================



-- 2. Create the default booking page

-- Use upsert to ensure the page exists

INSERT INTO pages (

  id,

  property_id,

  slug,

  page_type,

  status,

  locale,

  seo_title,

  seo_description,

  created_by,

  updated_by

) VALUES (

  'default-booking-page',

  'single-property',

  'booking',

  'marketing',

  'published',

  'en',

  'Book Your Stay - Grand Vista Resort',

  'Reserve your luxury escape at Grand Vista Resort. Choose from our sanctuary suites and bespoke experiences.',

  'system',

  'system'

) ON CONFLICT (property_id, slug, locale) DO UPDATE SET

  seo_title = EXCLUDED.seo_title,

  seo_description = EXCLUDED.seo_description,

  updated_by = EXCLUDED.updated_by,

  updated_at = now();



-- 3. Create initial page version only if the page exists

INSERT INTO page_versions (

  id,

  page_id,

  version_number,

  block_tree,

  change_summary,

  created_by

) SELECT

  'booking-page-v1',

  'default-booking-page',

  1,

  '[]'::jsonb,

  'Initial booking page version',

  'system'

WHERE EXISTS (SELECT 1 FROM pages WHERE id = 'default-booking-page')

ON CONFLICT (page_id, version_number) DO NOTHING;



-- 4. Update the page to reference the published version

UPDATE pages

SET published_version_id = 'booking-page-v1',

    current_draft_id = 'booking-page-v1'

WHERE id = 'default-booking-page' AND EXISTS (SELECT 1 FROM page_versions WHERE id = 'booking-page-v1');



-- 5. Insert default blocks for the booking page

-- Note: These blocks will be rendered by PublicBlockRenderer

-- Only insert if the page exists



-- Helper function to insert block if page exists

DO $$

DECLARE

  page_exists BOOLEAN;

BEGIN

  SELECT EXISTS(SELECT 1 FROM pages WHERE id = 'default-booking-page') INTO page_exists;



  IF page_exists THEN

    -- Hero Section

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_hero',

      0,

      '{

        "imageUrl": "",

        "title": "Where the Sea Greets the Horizon",

        "tagline": "Unmatched Ocean Luxury",

        "address": "Via Cristoforo Colombo, 84017 Positano SA, Italy"

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Filter Bar

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_filter_bar',

      1,

      '{}'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Room Cards

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_room_card',

      2,

      '{

        "title": "Our Sanctuary Suites",

        "subtitle": "Choose your perfect escape"

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Experience Section

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_experience_section',

      3,

      '{

        "title": "Epic Mountain Experiences",

        "description": "Curated packages for unforgettable stays"

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Story Section

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_story_section',

      4,

      '{

        "title": "Our Story",

        "description": "Experience the perfect blend of luxury and nature.",

        "stat1": "100+ Rooms",

        "stat1Label": "Capacity",

        "stat2": "5 Star Rating",

        "stat2Label": "Quality",

        "text": "Experience the perfect blend of luxury and nature. Tucked away on rugged cliffs overlooking pristine waters, Grand Vista Resort brings bespoke hospitality, award-winning spa treatments, and Michelin-star culinary secrets together into a seamless private escape."

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Features Section

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_features_section',

      5,

      '{

        "title": "Why Book Direct",

        "description": "Enjoy the best rates and perks."

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Testimonials Section

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_testimonials_section',

      6,

      '{

        "title": "Verified Guest Remarks"

      }'::jsonb

    ) ON CONFLICT DO NOTHING;



    -- Footer

    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)

    VALUES (

      gen_random_uuid()::text,

      'default-booking-page',

      'single-property',

      'booking_footer_section',

      7,

      '{}'::jsonb

    ) ON CONFLICT DO NOTHING;

  END IF;

END $$;

-- ============================================================

-- 026_public_portal_rls.sql

-- Add RLS policies for public portal access to pages and blocks

-- ============================================================



-- Enable RLS on pages table (if not already enabled)

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;



-- Policy: Allow public read access to published pages

drop policy if exists "Allow public read access to published pages" on pages;

CREATE POLICY "Allow public read access to published pages"

ON pages FOR SELECT

USING (status = 'published');



-- Policy: Allow service role full access (for admin operations)

drop policy if exists "Allow service role full access to pages" on pages;

CREATE POLICY "Allow service role full access to pages"

ON pages FOR ALL

USING (auth.role() = 'service_role');



-- Enable RLS on blocks table (if not already enabled)

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;



-- Policy: Allow public read access to blocks from published pages

drop policy if exists "Allow public read access to blocks from published pages" on blocks;

CREATE POLICY "Allow public read access to blocks from published pages"

ON blocks FOR SELECT

USING (

  EXISTS (

    SELECT 1 FROM pages

    WHERE pages.id = blocks.page_id

    AND pages.status = 'published'

  )

);



-- Policy: Allow service role full access to blocks

drop policy if exists "Allow service role full access to blocks" on blocks;

CREATE POLICY "Allow service role full access to blocks"

ON blocks FOR ALL

USING (auth.role() = 'service_role');



-- Enable RLS on page_versions table (if not already enabled)

ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;



-- Policy: Allow public read access to published versions

drop policy if exists "Allow public read access to published page versions" on page_versions;

CREATE POLICY "Allow public read access to published page versions"

ON page_versions FOR SELECT

USING (

  EXISTS (

    SELECT 1 FROM pages

    WHERE pages.published_version_id = page_versions.id

    AND pages.status = 'published'

  )

);



-- Policy: Allow service role full access to page_versions

drop policy if exists "Allow service role full access to page_versions" on page_versions;

CREATE POLICY "Allow service role full access to page_versions"

ON page_versions FOR ALL

USING (auth.role() = 'service_role');



-- Enable RLS on testimonials table (if not already enabled)

ALTER TABLE public_testimonials ENABLE ROW LEVEL SECURITY;



-- Policy: Allow public read access to approved testimonials

drop policy if exists "Allow public read access to approved testimonials" on public_testimonials;

CREATE POLICY "Allow public read access to approved testimonials"

ON public_testimonials FOR SELECT

USING (status = 'approved');



-- Policy: Allow authenticated users to insert testimonials

drop policy if exists "Allow authenticated users to insert testimonials" on public_testimonials;

CREATE POLICY "Allow authenticated users to insert testimonials"

ON public_testimonials FOR INSERT

WITH CHECK (auth.role() = 'authenticated');



-- Policy: Allow service role full access to testimonials

drop policy if exists "Allow service role full access to testimonials" on public_testimonials;

CREATE POLICY "Allow service role full access to testimonials"

ON public_testimonials FOR ALL

USING (auth.role() = 'service_role');

-- Add booking_terms column to global_settings for public booking terms and conditions



alter table global_settings add column if not exists booking_terms text default '';

