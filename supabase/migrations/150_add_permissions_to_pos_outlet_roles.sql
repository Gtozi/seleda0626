ALTER TABLE pos_outlet_roles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

COMMENT ON COLUMN pos_outlet_roles.permissions IS 'Custom permission overrides per outlet role assignment (JSONB: {category: [actions]})';
