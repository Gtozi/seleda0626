-- Audit Trail Triggers Migration
-- Creates DB triggers on operational tables to write to audit_events
-- This is Step 3.3 of the remediation roadmap

-- Step 1: Create helper function to set session variables for audit context
create or replace function set_audit_context(p_key text, p_value text)
returns void
language plpgsql
security definer
as $$
begin
  perform set_config(p_key, p_value, false);
end;
$$;

comment on function set_audit_context is 'Helper function to set session configuration variables. Used to set app.user_id for audit triggers.';

-- Step 2: Ensure audit_events table has all required columns
alter table audit_events
add column if not exists before_data jsonb,
add column if not exists after_data jsonb,
add column if not exists table_name text,
add column if not exists record_id text;

-- Step 2: Create generic audit trigger function
create or replace function audit_trigger_func()
returns trigger
language plpgsql
security definer
as $$
declare
  v_user_id text;
begin
  -- Get current user from session variable (set by middleware)
  v_user_id := current_setting('app.user_id', true);

  if TG_OP = 'DELETE' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD),
      null,
      now()
    );
    return OLD;
  elsif TG_OP = 'UPDATE' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
    return NEW;
  elsif TG_OP = 'INSERT' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::text,
      null,
      to_jsonb(NEW),
      now()
    );
    return NEW;
  end if;
  return null;
end;
$$;

-- Step 3: Create audit triggers on operational tables

-- Reservations
drop trigger if exists audit_reservations_trigger on reservations;
create trigger audit_reservations_trigger
after insert or update or delete on reservations
for each row execute function audit_trigger_func();

-- Folios
drop trigger if exists audit_folios_trigger on folios;
create trigger audit_folios_trigger
after insert or update or delete on folios
for each row execute function audit_trigger_func();

-- Folio lines
drop trigger if exists audit_folio_lines_trigger on folio_lines;
create trigger audit_folio_lines_trigger
after insert or update or delete on folio_lines
for each row execute function audit_trigger_func();

-- Folio payments
drop trigger if exists audit_folio_payments_trigger on folio_payments;
create trigger audit_folio_payments_trigger
after insert or update or delete on folio_payments
for each row execute function audit_trigger_func();

-- Rooms
drop trigger if exists audit_rooms_trigger on rooms;
create trigger audit_rooms_trigger
after insert or update or delete on rooms
for each row execute function audit_trigger_func();

-- Guests
drop trigger if exists audit_guests_trigger on guests;
create trigger audit_guests_trigger
after insert or update or delete on guests
for each row execute function audit_trigger_func();

-- System users
drop trigger if exists audit_system_users_trigger on system_users;
create trigger audit_system_users_trigger
after insert or update or delete on system_users
for each row execute function audit_trigger_func();

-- Roles
drop trigger if exists audit_roles_trigger on roles;
create trigger audit_roles_trigger
after insert or update or delete on roles
for each row execute function audit_trigger_func();

-- Global settings
drop trigger if exists audit_global_settings_trigger on global_settings;
create trigger audit_global_settings_trigger
after insert or update or delete on global_settings
for each row execute function audit_trigger_func();

-- Inventory items
drop trigger if exists audit_inventory_items_trigger on inventory_items;
create trigger audit_inventory_items_trigger
after insert or update or delete on inventory_items
for each row execute function audit_trigger_func();

-- Room types
drop trigger if exists audit_room_types_trigger on room_types;
create trigger audit_room_types_trigger
after insert or update or delete on room_types
for each row execute function audit_trigger_func();

-- Rate plans
drop trigger if exists audit_rate_plans_trigger on rate_plans;
create trigger audit_rate_plans_trigger
after insert or update or delete on rate_plans
for each row execute function audit_trigger_func();

-- Packages
drop trigger if exists audit_packages_trigger on packages;
create trigger audit_packages_trigger
after insert or update or delete on packages
for each row execute function audit_trigger_func();

-- Employees
drop trigger if exists audit_employees_trigger on employees;
create trigger audit_employees_trigger
after insert or update or delete on employees
for each row execute function audit_trigger_func();

-- Tour operators
drop trigger if exists audit_tour_operators_trigger on tour_operators;
create trigger audit_tour_operators_trigger
after insert or update or delete on tour_operators
for each row execute function audit_trigger_func();

-- Allotments
drop trigger if exists audit_allotments_trigger on allotments;
create trigger audit_allotments_trigger
after insert or update or delete on allotments
for each row execute function audit_trigger_func();

-- Vouchers
drop trigger if exists audit_vouchers_trigger on vouchers;
create trigger audit_vouchers_trigger
after insert or update or delete on vouchers
for each row execute function audit_trigger_func();

-- Step 4: Add comments for documentation
comment on function audit_trigger_func is 'Generic audit trigger function that writes INSERT/UPDATE/DELETE events to audit_events table with before/after data.';
comment on column audit_events.before_data is 'JSONB representation of record state before the change (for UPDATE/DELETE).';
comment on column audit_events.after_data is 'JSONB representation of record state after the change (for INSERT/UPDATE).';
comment on column audit_events.table_name is 'Name of the table where the change occurred.';
comment on column audit_events.record_id is 'ID of the affected record.';
