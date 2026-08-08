-- Migration 218: Add safe room update functions that bypass problematic triggers
-- These functions perform direct updates without triggering the problematic triggers

-- Safe room status update function
CREATE OR REPLACE FUNCTION public.update_room_status_safe(room_id text, new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Temporarily disable ALL triggers by switching to replica role
  SET LOCAL session_replication_role = replica;
  
  -- Perform the update
  UPDATE public.rooms 
  SET status = new_status 
  WHERE id = room_id;
  
  -- Reset back to origin role
  SET LOCAL session_replication_role = origin;
END;
$$;

-- Safe room features update function
CREATE OR REPLACE FUNCTION public.update_room_features_safe(room_id text, new_features text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Temporarily disable ALL triggers by switching to replica role
  SET LOCAL session_replication_role = replica;
  
  -- Perform the update
  UPDATE public.rooms 
  SET features = new_features 
  WHERE id = room_id;
  
  -- Reset back to origin role
  SET LOCAL session_replication_role = origin;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_room_status_safe TO anon;
GRANT EXECUTE ON FUNCTION public.update_room_status_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_room_features_safe TO anon;
GRANT EXECUTE ON FUNCTION public.update_room_features_safe TO authenticated;