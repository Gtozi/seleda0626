-- Check the trigger functions that fire on INSERT to find the created_at reference

-- 1. Check the BEFORE INSERT trigger function (most likely culprit)
SELECT proname, prosrc FROM pg_proc WHERE proname = 'ensure_reservation_group_profile_and_guest';

-- 2. Check the audit trigger function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'audit_trigger_func';

-- 3. Check the auto_link_guest_to_group function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'auto_link_guest_to_group';

-- 4. Check the auto_link_guest_to_group_profile function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'auto_link_guest_to_group_profile';

-- 5. Check the trigger_auto_link_guest function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'trigger_auto_link_guest';