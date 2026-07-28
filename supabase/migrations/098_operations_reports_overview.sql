-- ============================================================================
-- Operations Manager Portal: Reports & Overview Tables
-- Migration 098
-- ============================================================================

-- Report Definitions: catalog of available operational reports
create table if not exists operations_report_definition (
  report_id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('DailyOperations','Housekeeping','Maintenance','FandB','FrontOffice','HR','Procurement','SalesEvents','CrossDepartment')),
  description text,
  default_date_range text not null default 'Today' check (default_date_range in ('Today','Yesterday','WTD','MTD','Custom')),
  fields text[] not null default '{}',
  output_formats text[] not null default '{PDF}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generated Reports: records of report generation runs
create table if not exists operations_generated_report (
  generated_report_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_report_definition(report_id) on delete cascade,
  generated_by text,
  date_range_used text,
  generated_at timestamptz not null default now(),
  format text not null default 'PDF' check (format in ('PDF','Excel','CSV')),
  file_ref text,
  status text not null default 'Generating' check (status in ('Ready','Failed','Generating'))
);

-- Report Schedules: recurring automated report generation + delivery
create table if not exists operations_report_schedule (
  schedule_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_report_definition(report_id) on delete cascade,
  recipient_list text[] not null default '{}',
  frequency text not null default 'Daily' check (frequency in ('Daily','Weekly','Monthly')),
  format text not null default 'PDF' check (format in ('PDF','Excel')),
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Report Archive: retention tracking for generated reports
create table if not exists operations_report_archive (
  archive_entry_id uuid primary key default gen_random_uuid(),
  generated_report_id uuid not null references operations_generated_report(generated_report_id) on delete cascade,
  retained_until date not null,
  archived_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ops_gen_report_report_id on operations_generated_report(report_id);
create index if not exists idx_ops_gen_report_generated_at on operations_generated_report(generated_at desc);
create index if not exists idx_ops_schedule_report_id on operations_report_schedule(report_id);
create index if not exists idx_ops_schedule_active on operations_report_schedule(is_active);
create index if not exists idx_ops_archive_retained_until on operations_report_archive(retained_until);
create index if not exists idx_ops_report_def_category on operations_report_definition(category);

-- Enable RLS
alter table operations_report_definition enable row level security;
alter table operations_generated_report enable row level security;
alter table operations_report_schedule enable row level security;
alter table operations_report_archive enable row level security;

-- RLS Policies: authenticated users can read; operations managers/admins can write
drop policy if exists "ops_report_def_read" on operations_report_definition;
create policy "ops_report_def_read" on operations_report_definition
  for select to authenticated using (true);

drop policy if exists "ops_report_def_write" on operations_report_definition;
create policy "ops_report_def_write" on operations_report_definition
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_gen_report_read" on operations_generated_report;
create policy "ops_gen_report_read" on operations_generated_report
  for select to authenticated using (true);

drop policy if exists "ops_gen_report_write" on operations_generated_report;
create policy "ops_gen_report_write" on operations_generated_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_schedule_read" on operations_report_schedule;
create policy "ops_schedule_read" on operations_report_schedule
  for select to authenticated using (true);

drop policy if exists "ops_schedule_write" on operations_report_schedule;
create policy "ops_schedule_write" on operations_report_schedule
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_archive_read" on operations_report_archive;
create policy "ops_archive_read" on operations_report_archive
  for select to authenticated using (true);

drop policy if exists "ops_archive_write" on operations_report_archive;
create policy "ops_archive_write" on operations_report_archive
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

-- Seed report definitions
insert into operations_report_definition (name, category, description, default_date_range, fields, output_formats)
values
  ('Daily Operations Summary', 'DailyOperations', 'Occupancy, arrivals/departures, F&B covers, open escalations, staffing gaps — one page, end-of-day', 'Today', '{"Occupancy","Arrivals","Departures","F&B Covers","Open Escalations","Staffing Gaps"}', '{"PDF","Excel"}'),
  ('Shift Handover Report', 'DailyOperations', 'Formatted export of shift handover notes and any carried-forward action items', 'Today', '{"Shift Period","Outgoing Manager","Summary","Carried Forward Items"}', '{"PDF"}'),
  ('Housekeeping Daily Report', 'Housekeeping', 'Rooms cleaned, inspection results, OOO log', 'Today', '{"Rooms Cleaned","Inspection Results","OOO Log"}', '{"PDF","Excel","CSV"}'),
  ('Maintenance Work Order Log', 'Maintenance', 'All work orders in a date range with status and resolution time', 'WTD', '{"Work Order ID","Status","Resolution Time","Room"}', '{"PDF","Excel","CSV"}'),
  ('F&B Daily Cost & Comp Report', 'FandB', 'Cover count, comp/void log with reasons, food cost %', 'Today', '{"Cover Count","Comp/Void Log","Food Cost %"}', '{"PDF","Excel"}'),
  ('Front Office Arrivals/Departures', 'FrontOffice', 'Full guest list with room, rate, notes for the day', 'Today', '{"Guest Name","Room","Rate","Notes"}', '{"PDF","Excel","CSV"}'),
  ('Staffing & Attendance Summary', 'HR', 'Scheduled vs. present by department, overtime flagged', 'MTD', '{"Department","Scheduled","Present","Overtime"}', '{"PDF","Excel"}'),
  ('Goods Receipt & Discrepancy Log', 'Procurement', 'Receipts in range, any discrepancy noted', 'WTD', '{"Receipt ID","PO Number","Discrepancy","Notes"}', '{"PDF","Excel","CSV"}'),
  ('Escalation Log', 'CrossDepartment', 'All escalations in range with severity, resolution time, department', 'MTD', '{"Escalation ID","Department","Severity","Resolution Time","Status"}', '{"PDF","Excel"}'),
  ('Weekly Cross-Department Summary', 'CrossDepartment', 'Rolled-up version of the Daily Operations Summary across 7 days', 'WTD', '{"Daily Occupancy","Daily Arrivals","Daily Departures","F&B Covers","Escalations","Staffing Gaps"}', '{"PDF","Excel"}')
on conflict (report_id) do nothing;
