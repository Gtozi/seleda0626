-- Migration 122: Configuration Versioning & Rollback
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT,
  diff JSONB,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_config_versions_table ON config_versions(table_name);
CREATE INDEX IF NOT EXISTS idx_config_versions_record ON config_versions(record_id);
CREATE INDEX IF NOT EXISTS idx_config_versions_changed ON config_versions(changed_at DESC);

ALTER TABLE config_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_ver_read" ON config_versions;
CREATE POLICY "config_ver_read" ON config_versions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "config_ver_write" ON config_versions;
CREATE POLICY "config_ver_write" ON config_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
  v_version INTEGER;
BEGIN
  v_user_id := current_setting('app.user_id', true);
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM config_versions
  WHERE table_name = TG_TABLE_NAME AND record_id = NEW.id::text;
  INSERT INTO config_versions (table_name, record_id, diff, changed_by, version)
  VALUES (TG_TABLE_NAME, NEW.id::text, jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)), v_user_id, v_version);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_global_settings' AND event_object_table = 'global_settings') THEN
    CREATE TRIGGER config_version_global_settings AFTER UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_custom_roles' AND event_object_table = 'custom_roles') THEN
    CREATE TRIGGER config_version_custom_roles AFTER UPDATE ON custom_roles FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_role_permissions' AND event_object_table = 'role_permissions') THEN
    CREATE TRIGGER config_version_role_permissions AFTER UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
END $$;
