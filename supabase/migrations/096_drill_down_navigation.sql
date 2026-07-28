-- Executive Portal - Drill-Down Navigation Functions
-- Phase 8: Add drill-down navigation respecting source-module permissions

-- Function to get drill-down links for a specific tile
CREATE OR REPLACE FUNCTION get_drill_down_links(p_tile_id UUID)
RETURNS TABLE(
    link_id UUID,
    tile_id UUID,
    target_module VARCHAR,
    target_view VARCHAR,
    required_permission VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.link_id,
        dl.tile_id,
        dl.target_module,
        dl.target_view,
        dl.required_permission,
        dl.created_at
    FROM drill_down_links dl
    WHERE dl.tile_id = p_tile_id
    ORDER BY dl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission for a drill-down link
CREATE OR REPLACE FUNCTION check_drill_down_permission(
    p_link_id UUID,
    p_user_permissions TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    required_perm VARCHAR;
BEGIN
    -- Get the required permission for the link
    SELECT required_permission INTO required_perm
    FROM drill_down_links
    WHERE link_id = p_link_id;
    
    -- If no permission required, allow access
    IF required_perm IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has the required permission
    IF required_perm = ANY(p_user_permissions) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get accessible drill-down links for a user
CREATE OR REPLACE FUNCTION get_accessible_drill_down_links(
    p_tile_id UUID,
    p_user_permissions TEXT[]
)
RETURNS TABLE(
    link_id UUID,
    tile_id UUID,
    target_module VARCHAR,
    target_view VARCHAR,
    required_permission VARCHAR,
    is_accessible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.link_id,
        dl.tile_id,
        dl.target_module,
        dl.target_view,
        dl.required_permission,
        CASE 
            WHEN dl.required_permission IS NULL THEN TRUE
            WHEN dl.required_permission = ANY(p_user_permissions) THEN TRUE
            ELSE FALSE
        END AS is_accessible
    FROM drill_down_links dl
    WHERE dl.tile_id = p_tile_id
    ORDER BY dl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to create a drill-down link
CREATE OR REPLACE FUNCTION create_drill_down_link(
    p_tile_id UUID,
    p_target_module VARCHAR,
    p_target_view VARCHAR,
    p_required_permission VARCHAR
)
RETURNS UUID AS $$
DECLARE
    new_link_id UUID;
BEGIN
    INSERT INTO drill_down_links (
        tile_id, target_module, target_view, required_permission
    )
    VALUES (
        p_tile_id, p_target_module, p_target_view, p_required_permission
    )
    RETURNING link_id INTO new_link_id;
    
    RETURN new_link_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a drill-down link
CREATE OR REPLACE FUNCTION update_drill_down_link(
    p_link_id UUID,
    p_target_module VARCHAR,
    p_target_view VARCHAR,
    p_required_permission VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE drill_down_links
    SET 
        target_module = p_target_module,
        target_view = p_target_view,
        required_permission = p_required_permission,
        updated_at = NOW()
    WHERE link_id = p_link_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a drill-down link
CREATE OR REPLACE FUNCTION delete_drill_down_link(p_link_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM drill_down_links
    WHERE link_id = p_link_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Insert sample drill-down links for key metrics
-- Note: Using placeholder UUIDs for tile_id - in production these would reference actual metric IDs
INSERT INTO drill_down_links (tile_id, target_module, target_view, required_permission) VALUES
  -- Occupancy Rate drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'room-occupancy', 'view_frontoffice'),
  -- ADR drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'room-rates', 'view_frontoffice'),
  -- RevPAR drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'revenue-analysis', 'view_frontoffice'),
  -- Total Revenue drill-down to Finance
  (uuid_generate_v4(), 'finance', 'revenue-report', 'view_finance'),
  -- Labor Cost % drill-down to HR
  (uuid_generate_v4(), 'hr', 'labor-report', 'view_hr'),
  -- Open Work Orders drill-down to Maintenance
  (uuid_generate_v4(), 'maintenance', 'work-orders', 'view_maintenance'),
  -- Pipeline Value drill-down to Sales & Events
  (uuid_generate_v4(), 'sales', 'pipeline', 'view_sales'),
  -- Food Cost % drill-down to F&B
  (uuid_generate_v4(), 'foodbeverage', 'cost-analysis', 'view_fandb'),
  -- Headcount drill-down to HR
  (uuid_generate_v4(), 'hr', 'staffing', 'view_hr'),
  -- Cash Position drill-down to Finance
  (uuid_generate_v4(), 'finance', 'cash-management', 'view_finance'),
  -- GOPPAR drill-down to Finance
  (uuid_generate_v4(), 'finance', 'profit-loss', 'view_finance'),
  -- AR Aging drill-down to Finance
  (uuid_generate_v4(), 'finance', 'accounts-receivable', 'view_finance'),
  -- Turnover Rate drill-down to HR
  (uuid_generate_v4(), 'hr', 'turnover-report', 'view_hr')
ON CONFLICT DO NOTHING;
