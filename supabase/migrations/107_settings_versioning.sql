-- Settings Version & Checksum Migration
-- Adds version tracking and checksum validation to global_settings
-- This is Step 2.5 of the remediation roadmap

-- Step 1: Add version and checksum columns to global_settings
alter table global_settings
add column if not exists settings_version integer not null default 1;

alter table global_settings
add column if not exists settings_checksum text;

-- Step 2: Initialize checksum for existing settings
-- Compute MD5 checksum of the entire row (excluding version/checksum columns themselves)
-- Uses to_jsonb(gs) minus the version/checksum keys for a schema-agnostic approach
update global_settings gs
set settings_checksum = (
  encode(
    digest(
      (
        select (to_jsonb(gs) - 'settings_version' - 'settings_checksum')::text
      ),
      'md5'
    ),
    'hex'
  )
)
where settings_checksum is null;

-- Step 3: Create function to increment version and update checksum
create or replace function update_settings_version_and_checksum()
returns trigger
language plpgsql
security definer
as $$
declare
  v_checksum text;
begin
  -- Compute new checksum from the entire NEW row minus version/checksum columns
  select encode(
    digest(
      (
        select (to_jsonb(NEW) - 'settings_version' - 'settings_checksum')::text
      ),
      'md5'
    ),
    'hex'
  ) into v_checksum;

  -- Increment version if checksum changed
  if OLD.settings_checksum is null or OLD.settings_checksum != v_checksum then
    NEW.settings_version := OLD.settings_version + 1;
  end if;

  NEW.settings_checksum := v_checksum;
  return NEW;
end;
$$;

-- Step 4: Create trigger to auto-update version and checksum
drop trigger if exists global_settings_version_checksum_trigger on global_settings;
create trigger global_settings_version_checksum_trigger
before update on global_settings
for each row
execute function update_settings_version_and_checksum();

-- Step 5: Add comments for documentation
comment on column global_settings.settings_version is 'Auto-incremented version number for settings changes. Used by frontend to detect stale settings.';
comment on column global_settings.settings_checksum is 'MD5 checksum of settings values. Used to detect actual data changes.';
comment on function update_settings_version_and_checksum is 'Trigger function that auto-increments version and updates checksum when settings change.';

-- Step 6: Helper function to get table columns for dynamic schema queries
-- Used by server.ts to filter known columns without manual list maintenance
create or replace function get_table_columns(p_table_name text)
returns table (column_name text)
language sql
stable
as $$
  select column_name
  from information_schema.columns
  where table_name = lower(p_table_name)
    and table_schema = 'public'
  order by ordinal_position;
$$;

comment on function get_table_columns is 'Returns column names for a given table. Used for dynamic schema validation without manual column lists.';
