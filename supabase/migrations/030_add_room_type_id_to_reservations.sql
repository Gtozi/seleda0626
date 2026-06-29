-- Add room_type_id to reservations table for alignment with room_types schema
-- This allows reservations to reference the room_types table directly

-- Add room_type_id column to reservations table
alter table reservations
add column if not exists room_type_id text references room_types(id) on delete set null;

-- Create index for faster queries
create index if not exists idx_reservations_room_type_id on reservations(room_type_id);

-- Update existing reservations to link to room types based on room_type field
update reservations 
set room_type_id = (
  select id from room_types 
  where lower(name) = lower(reservations.room_type) 
  limit 1
)
where room_type_id is null and room_type is not null;

-- Add comment for documentation
comment on column reservations.room_type_id is 'Foreign key reference to room_types table for enhanced room type management';
