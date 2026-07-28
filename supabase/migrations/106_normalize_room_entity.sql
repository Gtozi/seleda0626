-- Normalize Room Entity Migration
-- Sets room_type_id as NOT NULL with FK constraint, deprecates type column
-- This is Step 2.4 of the remediation roadmap

-- Step 1: Ensure all rooms have room_type_id populated
-- First, try to match by existing type field to room_types.name
update rooms
set room_type_id = (
  select id from room_types
  where lower(name) = lower(rooms.type)
  limit 1
)
where room_type_id is null and type is not null;

-- Step 2: For any remaining NULL room_type_id, assign a default (rt_double)
update rooms
set room_type_id = 'rt_double'
where room_type_id is null;

-- Step 3: Add NOT NULL constraint to room_type_id
alter table rooms
alter column room_type_id set not null;

-- Step 4: Add FK constraint (it already exists from migration 029, but ensure it's properly set)
-- Drop existing FK if it exists to recreate with proper settings
alter table rooms
drop constraint if exists rooms_room_type_id_fkey;

alter table rooms
add constraint rooms_room_type_id_fkey
foreign key (room_type_id) references room_types(id) on delete restrict;

-- Step 5: Deprecate the type column
-- Add comment indicating it's deprecated
comment on column rooms.type is 'DEPRECATED: Use room_type_id foreign key instead. This column will be removed in a future migration.';

-- Step 6: Create a function to get room type name (for backward compatibility)
-- This can be used in views or queries that need the type name
create or replace function get_room_type_name(p_room_id text)
returns text
language sql
stable
as $$
  select rt.name
  from rooms r
  join room_types rt on r.room_type_id = rt.id
  where r.id = p_room_id;
$$;

-- Step 7: Create a view that includes the type name for backward compatibility
-- This allows legacy queries to continue working while we transition
create or replace view rooms_with_type_name as
select
  r.*,
  rt.name as type_name,
  rt.description as type_description,
  rt.base_price as type_base_price,
  rt.max_occupancy as type_max_occupancy,
  rt.bed_configuration as type_bed_configuration,
  rt.room_size_sqft as type_room_size_sqft,
  rt.amenities as type_amenities,
  rt.image_url_1 as type_image_url_1,
  rt.image_url_2 as type_image_url_2,
  rt.image_url_3 as type_image_url_3,
  rt.is_active as type_is_active,
  rt.display_order as type_display_order
from rooms r
join room_types rt on r.room_type_id = rt.id;

-- Add comment for documentation
comment on view rooms_with_type_name is 'Backward-compatible view that includes room type details joined from room_types table. Use this for queries that need type name without explicit joins.';
