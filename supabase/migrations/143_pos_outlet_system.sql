-- Migration 143: POS Outlet System with Role-Based Access Control
-- This migration creates a dedicated POS system that supports multiple outlet types
-- (Restaurant, Bar, Gift Shop, Spa, etc.) with role-based access control

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create POS Outlets table
CREATE TABLE IF NOT EXISTS public.pos_outlets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  outlet_type TEXT NOT NULL CHECK (outlet_type IN ('restaurant', 'bar', 'gift_shop', 'spa', 'reception', 'cafe', 'pool_bar', 'room_service', 'other')),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  store_location TEXT DEFAULT 'Main Store', -- Links to inventory location
  default_tax_rate NUMERIC(5,2) DEFAULT 15.00,
  default_service_charge NUMERIC(5,2) DEFAULT 10.00,
  operating_hours JSONB DEFAULT '{}',
  printer_station TEXT,
  payment_terminal_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  property_id UUID
);

-- Create POS Outlet Roles table - maps users to specific outlets with roles
CREATE TABLE IF NOT EXISTS public.pos_outlet_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'supervisor', 'cashier', 'server', 'bartender', 'staff')),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  UNIQUE(user_id, outlet_id)
);

-- Create POS Outlet Categories table - for menu categorization per outlet
CREATE TABLE IF NOT EXISTS public.pos_outlet_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(outlet_id, name)
);

-- Create POS Menu Items table - links menu items to outlets
CREATE TABLE IF NOT EXISTS public.pos_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.pos_outlet_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  selling_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  preparation_time INTEGER, -- in minutes
  is_taxable BOOLEAN DEFAULT true,
  tax_rate NUMERIC(5,2),
  is_service_charge_applicable BOOLEAN DEFAULT true,
  recipe JSONB DEFAULT '{}',
  modifiers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pos_outlets_type ON public.pos_outlets(outlet_type);
CREATE INDEX IF NOT EXISTS idx_pos_outlets_active ON public.pos_outlets(is_active);
CREATE INDEX IF NOT EXISTS idx_pos_outlet_roles_user ON public.pos_outlet_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_outlet_roles_outlet ON public.pos_outlet_roles(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_outlet_roles_role ON public.pos_outlet_roles(role);
CREATE INDEX IF NOT EXISTS idx_pos_outlet_categories_outlet ON public.pos_outlet_categories(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_items_outlet ON public.pos_menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_items_category ON public.pos_menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_pos_menu_items_active ON public.pos_menu_items(is_active, is_available);

-- Updated at trigger for pos_outlets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pos_outlets_updated_at BEFORE UPDATE ON public.pos_outlets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pos_menu_items_updated_at BEFORE UPDATE ON public.pos_menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.pos_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_outlet_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_outlet_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pos_outlets
CREATE POLICY "Allow service role full access to pos_outlets"
    ON public.pos_outlets FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to view active pos_outlets"
    ON public.pos_outlets FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow pos managers to update their outlet"
    ON public.pos_outlets FOR UPDATE
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.pos_outlet_roles 
            WHERE user_id = auth.uid() 
            AND outlet_id = public.pos_outlets.id 
            AND role IN ('manager', 'supervisor')
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );

-- RLS Policies for pos_outlet_roles
CREATE POLICY "Allow service role full access to pos_outlet_roles"
    ON public.pos_outlet_roles FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow users to view their own outlet roles"
    ON public.pos_outlet_roles FOR SELECT
    USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Allow managers to view roles in their outlet"
    ON public.pos_outlet_roles FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.pos_outlet_roles por1
            WHERE por1.user_id = auth.uid()
            AND por1.outlet_id = public.pos_outlet_roles.outlet_id
            AND por1.role IN ('manager', 'supervisor')
            AND (por1.valid_until IS NULL OR por1.valid_until > NOW())
        )
    );

CREATE POLICY "Allow admins to manage outlet roles"
    ON public.pos_outlet_roles FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id::text = auth.uid()::text
            AND r.name IN ('System Administrator', 'General Manager', 'Operations Manager', 'Executive')
        )
    );

-- RLS Policies for pos_outlet_categories
CREATE POLICY "Allow service role full access to pos_outlet_categories"
    ON public.pos_outlet_categories FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to view categories for accessible outlets"
    ON public.pos_outlet_categories FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.pos_outlet_roles por
            WHERE por.user_id = auth.uid()
            AND por.outlet_id = public.pos_outlet_categories.outlet_id
            AND (por.valid_until IS NULL OR por.valid_until > NOW())
        )
    );

-- RLS Policies for pos_menu_items
CREATE POLICY "Allow service role full access to pos_menu_items"
    ON public.pos_menu_items FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to view menu items for accessible outlets"
    ON public.pos_menu_items FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.pos_outlet_roles por
            WHERE por.user_id = auth.uid()
            AND por.outlet_id = public.pos_menu_items.outlet_id
            AND (por.valid_until IS NULL OR por.valid_until > NOW())
        )
    );

CREATE POLICY "Allow outlet managers to manage menu items"
    ON public.pos_menu_items FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.pos_outlet_roles por
            WHERE por.user_id = auth.uid()
            AND por.outlet_id = public.pos_menu_items.outlet_id
            AND por.role IN ('manager', 'supervisor')
            AND (por.valid_until IS NULL OR por.valid_until > NOW())
        )
    );

-- Function to get user's accessible POS outlets
CREATE OR REPLACE FUNCTION public.get_user_pos_outlets(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    outlet_id UUID,
    outlet_name TEXT,
    outlet_type TEXT,
    outlet_code TEXT,
    user_role TEXT,
    is_primary BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id as outlet_id,
        po.name as outlet_name,
        po.outlet_type as outlet_type,
        po.code as outlet_code,
        por.role as user_role,
        por.is_primary as is_primary
    FROM public.pos_outlets po
    INNER JOIN public.pos_outlet_roles por ON po.id = por.outlet_id
    WHERE 
        por.user_id = p_user_id
        AND po.is_active = true
        AND (por.valid_until IS NULL OR por.valid_until > NOW())
    ORDER BY por.is_primary DESC, por.role DESC, po.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's primary POS outlet (or first accessible)
CREATE OR REPLACE FUNCTION public.get_user_primary_pos_outlet(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
    v_outlet_id UUID;
BEGIN
    SELECT outlet_id INTO v_outlet_id
    FROM public.get_user_pos_outlets(p_user_id)
    WHERE is_primary = true
    LIMIT 1;
    
    IF v_outlet_id IS NULL THEN
        SELECT outlet_id INTO v_outlet_id
        FROM public.get_user_pos_outlets(p_user_id)
        LIMIT 1;
    END IF;
    
    RETURN v_outlet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role in outlet
CREATE OR REPLACE FUNCTION public.has_pos_outlet_role(
    p_outlet_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_required_role TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_required_role IS NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM public.pos_outlet_roles
            WHERE user_id = p_user_id
            AND outlet_id = p_outlet_id
            AND (valid_until IS NULL OR valid_until > NOW())
        );
    ELSE
        RETURN EXISTS (
            SELECT 1 FROM public.pos_outlet_roles
            WHERE user_id = p_user_id
            AND outlet_id = p_outlet_id
            AND role = p_required_role
            AND (valid_until IS NULL OR valid_until > NOW())
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default POS outlets if they don't exist
INSERT INTO public.pos_outlets (name, outlet_type, code, description, location, is_active)
VALUES 
    ('Main Restaurant', 'restaurant', 'REST-MAIN', 'Primary restaurant dining area', 'Ground Floor', true),
    ('Pool Bar', 'bar', 'BAR-POOL', 'Swimming pool bar service', 'Pool Area', true),
    ('Lobby Bar', 'bar', 'BAR-LOBBY', 'Main lobby bar', 'Lobby', true),
    ('Gift Shop', 'gift_shop', 'GIFT-MAIN', 'Hotel gift shop and boutique', 'Lobby', true),
    ('Spa', 'spa', 'SPA-MAIN', 'Wellness spa and treatment center', 'Wellness Floor', true)
ON CONFLICT (code) DO NOTHING;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_pos_outlets TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_primary_pos_outlet TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_pos_outlet_role TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.pos_outlets IS 'Defines POS outlet types (Restaurant, Bar, Gift Shop, Spa, etc.) with their configurations';
COMMENT ON TABLE public.pos_outlet_roles IS 'Maps users to specific POS outlets with role-based access control';
COMMENT ON TABLE public.pos_outlet_categories IS 'Menu categories specific to each POS outlet';
COMMENT ON TABLE public.pos_menu_items IS 'Menu items linked to specific POS outlets with pricing and availability';
COMMENT ON FUNCTION public.get_user_pos_outlets IS 'Returns all POS outlets accessible to the user with their roles';
COMMENT ON FUNCTION public.get_user_primary_pos_outlet IS 'Returns the user primary POS outlet or first accessible outlet';
COMMENT ON FUNCTION public.has_pos_outlet_role IS 'Checks if user has access to a specific POS outlet with optional role verification';
