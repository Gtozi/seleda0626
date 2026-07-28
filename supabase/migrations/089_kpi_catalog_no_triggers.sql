-- Executive Portal - Full KPI Catalog Expansion (No trigger dependency)
-- Phase 3: Expand to full KPI catalog with all department metrics including GOPPAR
-- This version avoids triggering updated_at functions

-- Additional Front Office metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Booking Channel Mix', 'Front Office', 'Percent', 'Neutral', NULL, 'Distribution by booking channel (OTA, Direct, Corporate)', 'Front Office', FALSE),
  ('Cancellation Rate', 'Front Office', 'Percent', 'LowerIsBetter', 5.0, 'Cancellations / Total Bookings', 'Front Office', FALSE),
  ('No-Show Rate', 'Front Office', 'Percent', 'LowerIsBetter', 3.0, 'No-shows / Total Arrivals', 'Front Office', FALSE),
  ('Average Length of Stay', 'Front Office', 'Duration', 'HigherIsBetter', 2.5, 'Total Room Nights / Total Arrivals', 'Front Office', FALSE)
ON CONFLICT DO NOTHING;

-- Additional F&B metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Beverage Cost %', 'F&B', 'Percent', 'LowerIsBetter', 25.0, 'Beverage Cost / Beverage Revenue', 'F&B', FALSE),
  ('Average Check', 'F&B', 'Currency', 'HigherIsBetter', 35.0, 'Total F&B Revenue / Total Covers', 'F&B', FALSE),
  ('Cover Count', 'F&B', 'Count', 'HigherIsBetter', NULL, 'Total number of guests served', 'F&B', FALSE),
  ('Comp/Void Rate', 'F&B', 'Percent', 'LowerIsBetter', 2.0, 'Comps + Voids / Total Transactions', 'F&B', FALSE),
  ('Revenue per Outlet', 'F&B', 'Currency', 'HigherIsBetter', NULL, 'Outlet Revenue / Outlet Capacity', 'F&B', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Finance metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('P&L Departmental', 'Finance', 'Currency', 'HigherIsBetter', NULL, 'Departmental profit/loss by cost center', 'Finance', FALSE),
  ('Budget vs Actual Variance %', 'Finance', 'Percent', 'Neutral', 0.0, '(Actual - Budget) / Budget', 'Finance', FALSE),
  ('Cash Position', 'Finance', 'Currency', 'HigherIsBetter', 50000.0, 'Available cash and equivalents', 'Finance', FALSE),
  ('AR Aging', 'Finance', 'Duration', 'LowerIsBetter', 30.0, 'Average days accounts receivable outstanding', 'Finance', FALSE),
  ('AP Aging', 'Finance', 'Duration', 'LowerIsBetter', 45.0, 'Average days accounts payable outstanding', 'Finance', FALSE),
  ('GOPPAR', 'Finance', 'Currency', 'HigherIsBetter', 45000.0, 'Gross Operating Profit Per Available Room', 'Finance', TRUE)
ON CONFLICT DO NOTHING;

-- Additional Housekeeping metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Room Turnaround Time', 'Housekeeping', 'Duration', 'LowerIsBetter', 45.0, 'Average time to clean a room (minutes)', 'Housekeeping', FALSE),
  ('Inspection Pass Rate', 'Housekeeping', 'Percent', 'HigherIsBetter', 95.0, 'Passed inspections / Total inspections', 'Housekeeping', FALSE),
  ('OOO Room Count', 'Housekeeping', 'Count', 'LowerIsBetter', 2.0, 'Rooms out of order for maintenance', 'Housekeeping', FALSE),
  ('Rooms Cleaned per Attendant-Shift', 'Housekeeping', 'Count', 'HigherIsBetter', 12.0, 'Total rooms cleaned / Total attendant shifts', 'Housekeeping', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Maintenance/Engineering metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Average Resolution Time', 'Maintenance', 'Duration', 'LowerIsBetter', 24.0, 'Average time to resolve work orders (hours)', 'Maintenance', FALSE),
  ('PM Compliance Rate', 'Maintenance', 'Percent', 'HigherIsBetter', 90.0, 'Completed PMs / Scheduled PMs', 'Maintenance', FALSE),
  ('OOS Room Count', 'Maintenance', 'Count', 'LowerIsBetter', 1.0, 'Rooms out of service for maintenance', 'Maintenance', FALSE)
ON CONFLICT DO NOTHING;

-- Additional HR & Payroll metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Labor Cost %', 'HR', 'Percent', 'LowerIsBetter', 35.0, 'Labor Cost / Total Revenue', 'HR', FALSE),
  ('Overtime Hours', 'HR', 'Duration', 'LowerIsBetter', 8.0, 'Total overtime hours per period', 'HR', FALSE),
  ('Leave Balance Liability', 'HR', 'Currency', 'LowerIsBetter', 100000.0, 'Total accrued leave liability', 'HR', FALSE),
  ('Turnover Rate', 'HR', 'Percent', 'LowerIsBetter', 15.0, 'Departures / Average headcount', 'HR', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Procurement & Stores metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Purchase Spend by Category', 'Procurement', 'Currency', 'Neutral', NULL, 'Total spend by procurement category', 'Procurement', FALSE),
  ('Main Store Stock Value', 'Procurement', 'Currency', 'Neutral', NULL, 'Total value of main store inventory', 'Procurement', FALSE),
  ('Goods-Receipt Discrepancy Rate', 'Procurement', 'Percent', 'LowerIsBetter', 2.0, 'Discrepancies / Total receipts', 'Procurement', FALSE),
  ('Days of Stock on Hand', 'Procurement', 'Duration', 'Neutral', 30.0, 'Average inventory days / consumption rate', 'Procurement', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Sales & Events metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Pipeline Value by Stage', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Total pipeline value by sales stage', 'Sales & Events', FALSE),
  ('Win Rate', 'Sales & Events', 'Percent', 'HigherIsBetter', 40.0, 'Won opportunities / Total opportunities', 'Sales & Events', FALSE),
  ('Average Deal Size', 'Sales & Events', 'Currency', 'HigherIsBetter', 15000.0, 'Total pipeline value / Number of deals', 'Sales & Events', FALSE),
  ('Booked Group/Event Revenue', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Revenue from confirmed group bookings', 'Sales & Events', FALSE),
  ('Forecast vs Actual Booking Pace', 'Sales & Events', 'Percent', 'Neutral', 0.0, '(Actual Bookings - Forecast) / Forecast', 'Sales & Events', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Guest Portal metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Direct Booking Conversion Rate', 'Guest Portal', 'Percent', 'HigherIsBetter', 25.0, 'Direct bookings / Total website visits', 'Guest Portal', FALSE),
  ('In-Stay Request Volume by Type', 'Guest Portal', 'Count', 'Neutral', NULL, 'Guest requests by category', 'Guest Portal', FALSE),
  ('Request Resolution Time', 'Guest Portal', 'Duration', 'LowerIsBetter', 30.0, 'Average time to resolve guest requests (minutes)', 'Guest Portal', FALSE),
  ('Guest Satisfaction Signal', 'Guest Portal', 'Ratio', 'HigherIsBetter', 4.5, 'Average guest rating (1-5 scale)', 'Guest Portal', FALSE)
ON CONFLICT DO NOTHING;

-- Additional System Admin metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Active User Count', 'System Admin', 'Count', 'Neutral', NULL, 'Total active system users', 'System Admin', FALSE),
  ('Permission Change Frequency', 'System Admin', 'Count', 'LowerIsBetter', 5.0, 'Permission changes per week (GM-only view)', 'System Admin', FALSE)
ON CONFLICT DO NOTHING;

-- Update the default GM dashboard view to include additional key metrics
UPDATE dashboard_views 
SET tile_layout = 
  '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "revpar": {"row": 0, "col": 2, "size": "Small"}, "total_revenue": {"row": 0, "col": 3, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "open_work_orders": {"row": 1, "col": 1, "size": "Small"}, "pipeline_value": {"row": 1, "col": 2, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 3, "size": "Small"}, "goppar": {"row": 2, "col": 0, "size": "Medium"}, "cash_position": {"row": 2, "col": 1, "size": "Small"}, "ar_aging": {"row": 2, "col": 2, "size": "Small"}, "turnover_rate": {"row": 2, "col": 3, "size": "Small"}}'
WHERE name = 'GM Daily Dashboard';

-- Add alert rule for GOPPAR
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  40000.0,
  'Warning',
  ARRAY['GM', 'Finance', 'Owner'],
  'Both',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'GOPPAR'
ON CONFLICT DO NOTHING;

-- Add alert rule for AR Aging
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  45.0,
  'Warning',
  ARRAY['GM', 'Finance'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'AR Aging'
ON CONFLICT DO NOTHING;

-- Add alert rule for Turnover Rate
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  20.0,
  'Critical',
  ARRAY['GM', 'HR'],
  'Both',
  TRUE,
  INTERVAL '1 week'
FROM metric_definitions 
WHERE name = 'Turnover Rate'
ON CONFLICT DO NOTHING;
