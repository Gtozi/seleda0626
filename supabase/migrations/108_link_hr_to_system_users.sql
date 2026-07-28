-- Link HR Employees to System Users Migration
-- Adds FK between HR staff records and system_users
-- This is Step 2.6 of the remediation roadmap

-- Step 1: Create employees table (HR staff records)
create table if not exists employees (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text unique,
  phone text,
  department text,
  position text,
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'On Leave', 'Terminated')),
  hire_date date,
  salary numeric default 0,
  avatar_initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on employees
alter table employees enable row level security;

-- Basic RLS policy: allow all for authenticated users
drop policy if exists employees_all_authenticated on employees;
create policy employees_all_authenticated on employees
  for all using (true) with check (true);

-- Step 2: Add linked_employee_id column to system_users
alter table system_users
add column if not exists linked_employee_id text references employees(id) on delete set null;

-- Step 3: Create index for faster queries
create index if not exists idx_system_users_linked_employee_id on system_users(linked_employee_id);

-- Step 4: Backfill linked_employee_id by matching email
-- Match system_users.email with employees.email
update system_users
set linked_employee_id = (
  select id from employees
  where lower(employees.email) = lower(system_users.email)
  limit 1
)
where linked_employee_id is null and email is not null;

-- Step 5: Add comment for documentation
comment on column system_users.linked_employee_id is 'Foreign key reference to employees table for HR staff records. Links login accounts to HR employee profiles.';

-- Step 6: Create function to auto-link employee on user creation
create or replace function link_employee_on_user_creation()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If linked_employee_id is not provided, try to match by email
  if NEW.linked_employee_id is null and NEW.email is not null then
    select id into NEW.linked_employee_id
    from employees
    where lower(email) = lower(NEW.email)
    limit 1;
  end if;
  return NEW;
end;
$$;

-- Step 7: Create trigger to auto-link on user creation
drop trigger if exists system_users_link_employee_trigger on system_users;
create trigger system_users_link_employee_trigger
before insert on system_users
for each row
execute function link_employee_on_user_creation();

comment on function link_employee_on_user_creation is 'Trigger function that auto-links system_users to employees by email when linked_employee_id is not provided.';
