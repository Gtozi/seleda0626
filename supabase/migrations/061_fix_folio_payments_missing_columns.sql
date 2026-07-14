-- Migration 061: Add missing columns to folio_payments table
-- These columns are referenced in post_folio_payment (migrations 052-056)
-- but were never added via ALTER TABLE to the live schema.

alter table folio_payments add column if not exists user_id text references system_users(id) on delete set null;
alter table folio_payments add column if not exists receipt_url text;
alter table folio_payments add column if not exists bank_account_id text references bank_accounts(id) on delete set null;
alter table folio_payments add column if not exists target_folio text check (target_folio in ('A', 'B', null));

-- Backfill user_id from created_by for existing rows
update folio_payments set user_id = created_by where user_id is null and created_by is not null;

-- Index for bank_account_id lookups
create index if not exists idx_folio_payments_bank_account on folio_payments(bank_account_id);
create index if not exists idx_folio_payments_user_id on folio_payments(user_id);
