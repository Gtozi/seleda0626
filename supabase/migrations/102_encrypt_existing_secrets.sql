-- ============================================================
-- 102_encrypt_existing_secrets.sql
-- Add encrypted_api_integrations column and migrate plaintext secrets
-- ============================================================

ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS encrypted_api_integrations JSONB;

-- Copy existing plaintext api_integrations to encrypted_api_integrations
UPDATE global_settings 
SET encrypted_api_integrations = api_integrations 
WHERE api_integrations IS NOT NULL 
  AND api_integrations != '[]'::jsonb
  AND encrypted_api_integrations IS NULL;

-- Set plaintext column to empty array (was NOT NULL with default '[]')
UPDATE global_settings 
SET api_integrations = '[]'::jsonb 
WHERE encrypted_api_integrations IS NOT NULL 
  AND encrypted_api_integrations != '[]'::jsonb;

-- Drop NOT NULL constraint so app layer can manage it
ALTER TABLE global_settings ALTER COLUMN api_integrations DROP NOT NULL;
