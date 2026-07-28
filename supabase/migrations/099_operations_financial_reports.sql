-- ============================================================================
-- Operations Manager Portal: Financial Reports Tables
-- Migration 099
-- ============================================================================

-- Financial Report Definitions: catalog of available financial reports
create table if not exists operations_financial_report_definition (
  report_id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Monthly','Quarterly','YearOverYear')),
  department_scope text not null default 'AllDepartments' check (department_scope in ('AllDepartments','RoomsOnly','FandBOnly','Custom')),
  includes_budget_comparison boolean not null default true,
  includes_prior_period_comparison boolean not null default false,
  output_formats text[] not null default '{PDF,Excel}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Monthly Financial Report: department-level P&L for a single month
create table if not exists operations_monthly_financial_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  month date not null,
  revenue_by_department jsonb not null default '{}',
  expense_by_department jsonb not null default '{}',
  undistributed_expenses numeric(14,2) not null default 0,
  fixed_charges numeric(14,2) not null default 0,
  gop numeric(14,2) not null default 0,
  net_operating_income numeric(14,2) not null default 0,
  budget_variance jsonb not null default '{}',
  occupancy_for_month numeric(5,2) not null default 0,
  adr_for_month numeric(14,2) not null default 0,
  revpar_for_month numeric(14,2) not null default 0,
  goppar_for_month numeric(14,2) not null default 0,
  generated_at timestamptz not null default now(),
  source_snapshot_date date not null default current_date,
  unique(month)
);

-- Quarterly Financial Report: rollup of 3 monthly reports
create table if not exists operations_quarterly_financial_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  quarter text not null unique,
  monthly_breakdown jsonb not null default '[]',
  quarter_total_revenue numeric(14,2) not null default 0,
  quarter_total_expense numeric(14,2) not null default 0,
  quarter_gop numeric(14,2) not null default 0,
  quarter_net_operating_income numeric(14,2) not null default 0,
  quarter_over_quarter_variance jsonb not null default '{}',
  quarter_budget_variance jsonb not null default '{}',
  average_occupancy numeric(5,2) not null default 0,
  average_adr numeric(14,2) not null default 0,
  average_revpar numeric(14,2) not null default 0,
  generated_at timestamptz not null default now()
);

-- Year-over-Year Report: comparison of same period across years
create table if not exists operations_yoy_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('Month','Quarter','YTD')),
  current_period_label text not null,
  prior_period_label text not null,
  current_period_financials jsonb not null default '{}',
  prior_period_financials jsonb not null default '{}',
  variance_amount jsonb not null default '{}',
  variance_percent jsonb not null default '{}',
  occupancy_current_vs_prior jsonb not null default '{}',
  adr_current_vs_prior jsonb not null default '{}',
  revpar_current_vs_prior jsonb not null default '{}',
  commentary text,
  generated_at timestamptz not null default now()
);

-- Financial Report Schedule: recurring automated financial report generation
create table if not exists operations_financial_report_schedule (
  schedule_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_financial_report_definition(report_id) on delete cascade,
  recipient_list text[] not null default '{}',
  frequency text not null default 'Monthly' check (frequency in ('Monthly','Quarterly','Annual')),
  format text not null default 'PDF' check (format in ('PDF','Excel')),
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ops_fin_monthly_month on operations_monthly_financial_report(month);
create index if not exists idx_ops_fin_quarterly_quarter on operations_quarterly_financial_report(quarter);
create index if not exists idx_ops_fin_yoy_period_type on operations_yoy_report(period_type);
create index if not exists idx_ops_fin_yoy_generated_at on operations_yoy_report(generated_at desc);
create index if not exists idx_ops_fin_schedule_report_id on operations_financial_report_schedule(report_id);
create index if not exists idx_ops_fin_schedule_active on operations_financial_report_schedule(is_active);
create index if not exists idx_ops_fin_def_type on operations_financial_report_definition(type);

-- Enable RLS
alter table operations_financial_report_definition enable row level security;
alter table operations_monthly_financial_report enable row level security;
alter table operations_quarterly_financial_report enable row level security;
alter table operations_yoy_report enable row level security;
alter table operations_financial_report_schedule enable row level security;

-- RLS Policies: authenticated users can read; operations managers/admins/exec can write
drop policy if exists "ops_fin_def_read" on operations_financial_report_definition;
create policy "ops_fin_def_read" on operations_financial_report_definition
  for select to authenticated using (true);

drop policy if exists "ops_fin_def_write" on operations_financial_report_definition;
create policy "ops_fin_def_write" on operations_financial_report_definition
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_monthly_read" on operations_monthly_financial_report;
create policy "ops_fin_monthly_read" on operations_monthly_financial_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_monthly_write" on operations_monthly_financial_report;
create policy "ops_fin_monthly_write" on operations_monthly_financial_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_quarterly_read" on operations_quarterly_financial_report;
create policy "ops_fin_quarterly_read" on operations_quarterly_financial_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_quarterly_write" on operations_quarterly_financial_report;
create policy "ops_fin_quarterly_write" on operations_quarterly_financial_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_yoy_read" on operations_yoy_report;
create policy "ops_fin_yoy_read" on operations_yoy_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_yoy_write" on operations_yoy_report;
create policy "ops_fin_yoy_write" on operations_yoy_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_schedule_read" on operations_financial_report_schedule;
create policy "ops_fin_schedule_read" on operations_financial_report_schedule
  for select to authenticated using (true);

drop policy if exists "ops_fin_schedule_write" on operations_financial_report_schedule;
create policy "ops_fin_schedule_write" on operations_financial_report_schedule
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

-- Seed financial report definitions
insert into operations_financial_report_definition (name, type, department_scope, includes_budget_comparison, includes_prior_period_comparison, output_formats)
values
  ('Monthly P&L Summary', 'Monthly', 'AllDepartments', true, false, '{PDF,Excel}'),
  ('Quarterly Financial Rollup', 'Quarterly', 'AllDepartments', true, true, '{PDF,Excel}'),
  ('Year-over-Year Comparison', 'YearOverYear', 'AllDepartments', false, true, '{PDF,Excel}'),
  ('Rooms Department Monthly', 'Monthly', 'RoomsOnly', true, false, '{PDF,Excel}'),
  ('F&B Department Monthly', 'Monthly', 'FandBOnly', true, false, '{PDF,Excel}')
on conflict (report_id) do nothing;
