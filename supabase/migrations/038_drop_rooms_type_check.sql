-- Drop the outdated rooms type check constraint
-- Room types are now managed dynamically through the room_types table,
-- and rooms are linked via room_type_id foreign key.

alter table rooms
  drop constraint if exists rooms_type_check;
