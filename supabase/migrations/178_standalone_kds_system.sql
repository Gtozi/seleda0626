-- Migration 178: Standalone KDS System
-- Decouples KDS from POS — KDS is now a standalone system that can connect to multiple POS outlets
-- Supports multiple KDS instances (displays), each with its own config and connected POS outlets

-- ── 1. KDS Instances ────────────────────────────────────────────────────
-- Each KDS instance is a physical or virtual display screen
-- A property can have multiple KDS instances (e.g. Kitchen KDS, Bar KDS, Expo KDS)
CREATE TABLE IF NOT EXISTS public.kds_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                          -- e.g. "Main Kitchen Display", "Bar KDS"
  description TEXT,
  instance_type TEXT NOT NULL DEFAULT 'station'
    CHECK (instance_type IN ('station', 'expo', 'combined')),
  -- 'station' = single prep station display, 'expo' = aggregate expediter view, 'combined' = both
  property_id UUID,                            -- multi-property support
  -- Display configuration
  display_config JSONB NOT NULL DEFAULT '{
    "theme": "dark",
    "font_scale": 1.0,
    "show_timers": true,
    "show_customer_name": true,
    "auto_bump_seconds": null,
    "sound_enabled": true,
    "columns": 4,
    "sort_by": "fired_at_asc"
  }'::jsonb,
  -- Which prep stations this display shows (empty = all stations)
  station_filter JSONB DEFAULT '[]'::jsonb,    -- array of station_ids
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,                    -- heartbeat from the display device
  display_device_id TEXT,                      -- hardware identifier
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kds_instances_property ON public.kds_instances(property_id);
CREATE INDEX IF NOT EXISTS idx_kds_instances_active ON public.kds_instances(is_active);

ALTER TABLE public.kds_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role all kds_instances" ON public.kds_instances;
CREATE POLICY "service_role all kds_instances" ON public.kds_instances FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read kds_instances" ON public.kds_instances;
CREATE POLICY "authenticated read kds_instances" ON public.kds_instances FOR SELECT
    USING (auth.role() = 'authenticated');

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_kds_instances_updated_at ON public.kds_instances;
CREATE TRIGGER update_kds_instances_updated_at BEFORE UPDATE ON public.kds_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kds_instances IS
  'Standalone KDS display instances — each represents a physical/virtual kitchen display screen';

-- ── 2. KDS ↔ POS Outlet Connections ─────────────────────────────────────
-- Many-to-many: a KDS instance can receive orders from multiple POS outlets
-- and a POS outlet can send orders to multiple KDS instances
CREATE TABLE IF NOT EXISTS public.kds_pos_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kds_instance_id UUID NOT NULL REFERENCES public.kds_instances(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  -- Connection config
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Filter which items route to this KDS (e.g. only food, not beverages)
  item_type_filter JSONB DEFAULT '["Prepared"]'::jsonb,  -- array of item_type values
  -- Webhook config for KDS→POS feedback (status updates, void/86)
  feedback_webhook_url TEXT,
  feedback_api_key TEXT,
  -- Priority weight for this connection (higher = preferred KDS)
  priority_weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kds_instance_id, outlet_id)
);

CREATE INDEX IF NOT EXISTS idx_kds_pos_connections_kds ON public.kds_pos_connections(kds_instance_id);
CREATE INDEX IF NOT EXISTS idx_kds_pos_connections_outlet ON public.kds_pos_connections(outlet_id);
CREATE INDEX IF NOT EXISTS idx_kds_pos_connections_active ON public.kds_pos_connections(is_active);

ALTER TABLE public.kds_pos_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role all kds_pos_connections" ON public.kds_pos_connections;
CREATE POLICY "service_role all kds_pos_connections" ON public.kds_pos_connections FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read kds_pos_connections" ON public.kds_pos_connections;
CREATE POLICY "authenticated read kds_pos_connections" ON public.kds_pos_connections FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kds_pos_connections_updated_at ON public.kds_pos_connections;
CREATE TRIGGER update_kds_pos_connections_updated_at BEFORE UPDATE ON public.kds_pos_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kds_pos_connections IS
  'Many-to-many link between KDS instances and POS outlets — enables multi-POS connectivity';

-- ── 3. Add kds_instance_id to kds_orders ────────────────────────────────
-- Links each KDS ticket to the specific KDS instance it was routed to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'kds_instance_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN kds_instance_id UUID REFERENCES public.kds_instances(id) ON DELETE SET NULL;
    COMMENT ON COLUMN public.kds_orders.kds_instance_id IS
      'FK to kds_instances.id — which KDS display this ticket was routed to';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kds_orders_instance ON public.kds_orders(kds_instance_id);

-- ── 4. External POS Connection Registry ─────────────────────────────────
-- For connecting external (non-SELEDA) POS systems to KDS
CREATE TABLE IF NOT EXISTS public.kds_external_pos_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kds_instance_id UUID NOT NULL REFERENCES public.kds_instances(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,                   -- e.g. "Toast POS", "Square POS"
  system_type TEXT NOT NULL DEFAULT 'generic'
    CHECK (system_type IN ('generic', 'toast', 'square', 'lightspeed', 'clover', 'other')),
  -- API credentials for receiving orders from external POS
  api_key TEXT NOT NULL,                       -- shared secret for webhook auth
  webhook_url TEXT,                            -- URL the external POS posts orders to
  -- Config
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_order_at TIMESTAMPTZ,
  total_orders_received INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kds_external_pos_kds ON public.kds_external_pos_systems(kds_instance_id);
CREATE INDEX IF NOT EXISTS idx_kds_external_pos_active ON public.kds_external_pos_systems(is_active);

ALTER TABLE public.kds_external_pos_systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role all kds_external_pos" ON public.kds_external_pos_systems;
CREATE POLICY "service_role all kds_external_pos" ON public.kds_external_pos_systems FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read kds_external_pos" ON public.kds_external_pos_systems;
CREATE POLICY "authenticated read kds_external_pos" ON public.kds_external_pos_systems FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_kds_external_pos_updated_at ON public.kds_external_pos_systems;
CREATE TRIGGER update_kds_external_pos_updated_at BEFORE UPDATE ON public.kds_external_pos_systems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kds_external_pos_systems IS
  'External POS system connections — enables third-party POS to send orders to KDS';

-- ── 5. Backfill kds_instance_id for existing kds_orders ─────────────────
-- Create a default KDS instance per outlet that has requires_kds=true
-- and link existing orders to it
DO $$
DECLARE
  r RECORD;
  default_instance UUID;
BEGIN
  FOR r IN SELECT DISTINCT outlet_id FROM public.kds_orders WHERE kds_instance_id IS NULL AND outlet_id IS NOT NULL LOOP
    -- Check if an instance already exists for this outlet
    SELECT ki.id INTO default_instance
      FROM public.kds_instances ki
      JOIN public.kds_pos_connections kpc ON kpc.kds_instance_id = ki.id
      WHERE kpc.outlet_id = r.outlet_id AND ki.is_active = true
      LIMIT 1;

    IF default_instance IS NULL THEN
      -- Create a default KDS instance
      INSERT INTO public.kds_instances (name, description, instance_type, is_active)
      VALUES ('Default KDS', 'Auto-created default KDS instance', 'combined', true)
      RETURNING id INTO default_instance;

      -- Connect it to the outlet
      INSERT INTO public.kds_pos_connections (kds_instance_id, outlet_id, is_active)
      VALUES (default_instance, r.outlet_id, true)
      ON CONFLICT (kds_instance_id, outlet_id) DO NOTHING;
    END IF;

    -- Link existing orders
    UPDATE public.kds_orders SET kds_instance_id = default_instance WHERE outlet_id = r.outlet_id AND kds_instance_id IS NULL;
  END LOOP;
END $$;
