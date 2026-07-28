-- ============================================================
-- Fix audit_permission_change() trigger function
-- ============================================================
-- Issues:
--   1. NEW.id doesn't exist on role_permissions (composite key)
--   2. OLD/NEW passed into jsonb without to_jsonb() cast
--   3. TG_OP uppercase may violate audit_events.action check
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_permission_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_id text;
BEGIN
  -- Try 'id' column first, fall back to composite key for join tables
  v_entity_id := COALESCE(
    to_jsonb(NEW)->>'id',
    to_jsonb(OLD)->>'id',
    NULL
  );

  IF v_entity_id IS NULL THEN
    -- For role_permissions: use role_id:permission_id composite key
    v_entity_id := COALESCE(
      (to_jsonb(NEW)->>'role_id') || ':' || (to_jsonb(NEW)->>'permission_id'),
      (to_jsonb(OLD)->>'role_id') || ':' || (to_jsonb(OLD)->>'permission_id'),
      'unknown'
    );
  END IF;

  INSERT INTO audit_events (
    id,
    created_at,
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    module,
    ip_address,
    user_agent,
    outcome,
    details
  )
  VALUES (
    gen_random_uuid()::text,
    now(),
    current_setting('app.user_id', true)::text,
    (SELECT name FROM system_users WHERE id = current_setting('app.user_id', true)::text LIMIT 1),
    lower(TG_OP),
    TG_TABLE_NAME,
    v_entity_id,
    'security',
    inet_client_addr()::text,
    current_setting('request.user_agent', true),
    'success',
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'operation', lower(TG_OP),
      'table', TG_TABLE_NAME
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
