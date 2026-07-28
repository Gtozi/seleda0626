-- Executive Portal - Role-Based Dashboard Views
-- Phase 4: Implement DashboardView customization per role

-- Owner Dashboard View - Focus on high-level financial and operational metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Owner Executive Summary', 'Owner',
   '{"total_revenue": {"row": 0, "col": 0, "size": "Medium"}, "goppar": {"row": 0, "col": 1, "size": "Medium"}, "occupancy_rate": {"row": 1, "col": 0, "size": "Small"}, "adr": {"row": 1, "col": 1, "size": "Small"}, "revpar": {"row": 1, "col": 2, "size": "Small"}, "cash_position": {"row": 2, "col": 0, "size": "Small"}, "ar_aging": {"row": 2, "col": 1, "size": "Small"}, "turnover_rate": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Department Manager Dashboard View - Focus on operational metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Department Manager Operations', 'DepartmentManager',
   '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "open_work_orders": {"row": 0, "col": 2, "size": "Small"}, "pipeline_value": {"row": 1, "col": 0, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 1, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 2, "size": "Small"}, "room_turnaround_time": {"row": 2, "col": 0, "size": "Small"}, "inspection_pass_rate": {"row": 2, "col": 1, "size": "Small"}, "ooo_room_count": {"row": 2, "col": 2, "size": "Small"}}',
   'WTD', TRUE)
ON CONFLICT DO NOTHING;

-- Finance Dashboard View - Focus on financial metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Finance Departmental', 'Finance',
   '{"total_revenue": {"row": 0, "col": 0, "size": "Medium"}, "goppar": {"row": 0, "col": 1, "size": "Medium"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "cash_position": {"row": 1, "col": 1, "size": "Small"}, "ar_aging": {"row": 1, "col": 2, "size": "Small"}, "ap_aging": {"row": 2, "col": 0, "size": "Small"}, "budget_vs_actual_variance_percent": {"row": 2, "col": 1, "size": "Small"}, "pl_departmental": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Auditor Dashboard View - Focus on compliance and risk metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Auditor Compliance View', 'Auditor',
   '{"labor_cost_percent": {"row": 0, "col": 0, "size": "Small"}, "food_cost_percent": {"row": 0, "col": 1, "size": "Small"}, "open_work_orders": {"row": 0, "col": 2, "size": "Small"}, "ar_aging": {"row": 1, "col": 0, "size": "Small"}, "ap_aging": {"row": 1, "col": 1, "size": "Small"}, "goods_receipt_discrepancy_rate": {"row": 1, "col": 2, "size": "Small"}, "permission_change_frequency": {"row": 2, "col": 0, "size": "Small"}, "pm_compliance_rate": {"row": 2, "col": 1, "size": "Small"}, "comp_void_rate": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Add additional alert rules for role-specific metrics
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  45.0,
  'Warning',
  ARRAY['DepartmentManager', 'GM'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'Room Turnaround Time'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  90.0,
  'Warning',
  ARRAY['DepartmentManager', 'GM'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'Inspection Pass Rate'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  3.0,
  'Warning',
  ARRAY['Auditor', 'Finance', 'GM'],
  'Both',
  TRUE,
  INTERVAL '1 week'
FROM metric_definitions 
WHERE name = 'Goods-Receipt Discrepancy Rate'
ON CONFLICT DO NOTHING;
