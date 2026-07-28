import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

function getDateRange(rangeType: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  switch (rangeType) {
    case 'daily': break;
    case 'weekly': start.setDate(start.getDate() - 7); break;
    case 'monthly': start.setMonth(start.getMonth() - 1); break;
    case 'quarterly': start.setMonth(start.getMonth() - 3); break;
    case 'ytd': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); break;
    case 'custom':
      if (customStart) start.setTime(new Date(customStart).getTime());
      if (customEnd) end.setTime(new Date(customEnd).getTime());
      end.setHours(23, 59, 59, 999); break;
    default: start.setMonth(start.getMonth() - 1);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// Report definitions per department
const REPORT_DEFS: Record<string, Array<{ id: string; title: string; category: string; description: string; format: string; table: string; qtype: string }>> = {
  finance: [
    { id: 'trial-balance', title: 'Trial Balance', category: 'Financial Statements', description: 'Debit and credit balances for all ledger accounts.', format: 'PDF/XLS', table: 'journal_entries', qtype: 'trial_balance' },
    { id: 'balance-sheet', title: 'Balance Sheet', category: 'Financial Statements', description: 'Assets, liabilities, and equity snapshot.', format: 'PDF', table: 'journal_entries', qtype: 'balance_sheet' },
    { id: 'profit-loss', title: 'Profit & Loss Statement', category: 'Financial Statements', description: 'Revenue and expense breakdown.', format: 'PDF/XLS', table: 'journal_entries', qtype: 'pnl' },
    { id: 'cash-flow', title: 'Cash Flow Analysis', category: 'Financial Statements', description: 'Operating, investing, and financing cash flows.', format: 'PDF', table: 'journal_entries', qtype: 'cash_flow' },
    { id: 'daily-revenue', title: 'Daily Revenue Summary', category: 'Operational', description: 'Consolidated revenue across all departments.', format: 'PDF', table: 'reservations', qtype: 'daily_revenue' },
    { id: 'ar-aging', title: 'Accounts Receivable Aging', category: 'Accounting', description: 'Outstanding AR by aging buckets.', format: 'XLS', table: 'ar_ledger', qtype: 'ar_aging' },
    { id: 'ap-aging', title: 'Accounts Payable Aging', category: 'Accounting', description: 'Outstanding AP by vendor and aging.', format: 'XLS', table: 'ap_bills', qtype: 'ap_aging' },
    { id: 'bank-reconciliation', title: 'Bank Audit & Reconciliation', category: 'Treasury', description: 'Bank balances and reconciliation status.', format: 'PDF', table: 'bank_accounts', qtype: 'bank_recon' },
    { id: 'general-ledger', title: 'General Ledger', category: 'Accounting', description: 'Complete transaction-level ledger entries.', format: 'XLS', table: 'journal_entries', qtype: 'general_ledger' },
    { id: 'budget-vs-actual', title: 'Budget vs Actual', category: 'Budgeting', description: 'Budgeted vs actual revenue and expenses.', format: 'PDF/XLS', table: 'journal_entries', qtype: 'budget_variance' },
    { id: 'tax-compliance', title: 'Tax Compliance Report', category: 'Tax', description: 'VAT, withholding tax, and ERCA filings.', format: 'PDF', table: 'journal_entries', qtype: 'tax' },
    { id: 'fixed-assets', title: 'Fixed Assets Register', category: 'Accounting', description: 'Asset values, depreciation, and disposals.', format: 'XLS', table: 'fixed_assets', qtype: 'fixed_assets' },
    { id: 'period-close', title: 'Period Close Summary', category: 'Accounting', description: 'Month-end close checklist and status.', format: 'PDF', table: 'accounting_periods', qtype: 'period_close' },
    { id: 'sales-registry', title: 'Sales Registry', category: 'Revenue', description: 'Daily sales transactions and tax breakdown.', format: 'XLS', table: 'orders', qtype: 'sales_registry' },
    { id: 'erca-vat', title: 'ERCA VAT Export', category: 'Tax', description: 'VAT declaration data for ERCA submission.', format: 'CSV', table: 'journal_entries', qtype: 'vat_export' },
    { id: 'departmental-pnl', title: 'Departmental P&L', category: 'Financial Statements', description: 'P&L by operating department.', format: 'PDF/XLS', table: 'journal_entries', qtype: 'dept_pnl' },
  ],
  fnb: [
    { id: 'daily-sales', title: 'Daily Sales Report', category: 'Sales', description: 'Aggregate sales per outlet and covers.', format: 'PDF', table: 'orders', qtype: 'daily_sales' },
    { id: 'menu-performance', title: 'Menu Performance', category: 'Sales', description: 'Top/bottom menu items by volume and margin.', format: 'PDF', table: 'order_lines', qtype: 'menu_perf' },
    { id: 'cogs', title: 'Cost of Goods Sold', category: 'Financial', description: 'Food and beverage cost analysis.', format: 'XLS', table: 'stock_transactions', qtype: 'cogs' },
    { id: 'waste-analysis', title: 'Waste Analysis', category: 'Operations', description: 'Wastage and spoilage by item.', format: 'PDF', table: 'wastage_logs', qtype: 'waste' },
    { id: 'beverage-inventory', title: 'Beverage Inventory', category: 'Inventory', description: 'Beverage stock levels and valuation.', format: 'XLS', table: 'stock_transactions', qtype: 'bev_inventory' },
    { id: 'staff-performance', title: 'Staff Performance', category: 'HR', description: 'Server productivity and sales per staff.', format: 'PDF', table: 'orders', qtype: 'staff_perf' },
    { id: 'outlet-performance', title: 'Outlet Performance', category: 'Sales', description: 'Revenue and KPIs by outlet.', format: 'PDF/XLS', table: 'orders', qtype: 'outlet_perf' },
    { id: 'food-inventory', title: 'Food Inventory Report', category: 'Inventory', description: 'Food stock levels, par values, variances.', format: 'XLS', table: 'stock_transactions', qtype: 'food_inventory' },
    { id: 'banquet-events', title: 'Banquet & Events Report', category: 'Operations', description: 'Banquet event revenue and covers.', format: 'PDF', table: 'banquet_events', qtype: 'banquet' },
    { id: 'recipe-costing', title: 'Recipe Costing Analysis', category: 'Financial', description: 'Standard vs actual recipe cost variance.', format: 'XLS', table: 'recipes', qtype: 'recipe_cost' },
    { id: 'supplier-performance', title: 'Supplier Performance', category: 'Procurement', description: 'Delivery timeliness and quality by supplier.', format: 'PDF', table: 'fb_suppliers', qtype: 'supplier_perf' },
    { id: 'po-analysis', title: 'Purchase Order Analysis', category: 'Procurement', description: 'PO volume, spend, and fulfillment.', format: 'XLS', table: 'fb_purchase_orders', qtype: 'po_analysis' },
    { id: 'inv-valuation', title: 'Inventory Valuation', category: 'Financial', description: 'Current stock valuation at cost.', format: 'XLS', table: 'stock_transactions', qtype: 'inv_valuation' },
    { id: 'sales-category', title: 'Sales by Category', category: 'Sales', description: 'Revenue breakdown by menu category.', format: 'PDF', table: 'order_lines', qtype: 'sales_category' },
    { id: 'peak-hours', title: 'Peak Hours Analysis', category: 'Operations', description: 'Order volume by hour and daypart.', format: 'PDF', table: 'orders', qtype: 'peak_hours' },
    { id: 'meal-preferences', title: 'Guest Meal Preferences', category: 'Sales', description: 'Dietary preferences and allergen tracking.', format: 'PDF', table: 'orders', qtype: 'meal_prefs' },
    { id: 'room-service', title: 'Room Service Report', category: 'Operations', description: 'In-room dining revenue and response times.', format: 'PDF', table: 'orders', qtype: 'room_service' },
  ],
  engineering: [
    { id: 'maintenance-requests', title: 'Maintenance Requests', category: 'Operations', description: 'All maintenance work orders and status.', format: 'PDF', table: 'work_orders', qtype: 'maintenance' },
    { id: 'preventive-maintenance', title: 'Preventive Maintenance', category: 'Preventive', description: 'PM schedule completion and compliance.', format: 'PDF', table: 'pm_schedules', qtype: 'pm' },
    { id: 'equipment-inventory', title: 'Equipment Inventory', category: 'Inventory', description: 'Asset register with location and condition.', format: 'XLS', table: 'work_orders', qtype: 'equipment' },
    { id: 'energy-consumption', title: 'Energy Consumption', category: 'Utilities', description: 'Electricity, water, and gas usage trends.', format: 'PDF/XLS', table: 'work_orders', qtype: 'energy' },
    { id: 'work-order-summary', title: 'Work Order Summary', category: 'Operations', description: 'Work order volume, resolution time, costs.', format: 'PDF', table: 'work_orders', qtype: 'wo_summary' },
    { id: 'vendor-performance', title: 'Vendor Performance', category: 'Procurement', description: 'External contractor performance and costs.', format: 'PDF', table: 'work_orders', qtype: 'vendor_perf' },
    { id: 'asset-lifecycle', title: 'Asset Lifecycle Report', category: 'Maintenance', description: 'Asset depreciation and replacement schedule.', format: 'XLS', table: 'fixed_assets', qtype: 'asset_lifecycle' },
    { id: 'water-consumption', title: 'Water Consumption Report', category: 'Utilities', description: 'Water usage by area and cost analysis.', format: 'PDF', table: 'work_orders', qtype: 'water' },
    { id: 'gas-consumption', title: 'Gas Consumption Report', category: 'Utilities', description: 'Gas usage and cost tracking.', format: 'PDF', table: 'work_orders', qtype: 'gas' },
    { id: 'compliance', title: 'Compliance & Safety Report', category: 'Compliance', description: 'Safety inspections and regulatory compliance.', format: 'PDF', table: 'work_orders', qtype: 'compliance' },
    { id: 'room-maintenance', title: 'Room Maintenance Status', category: 'Operations', description: 'Guest room maintenance requests and status.', format: 'PDF', table: 'work_orders', qtype: 'room_maint' },
    { id: 'staff-productivity', title: 'Staff Productivity Report', category: 'HR', description: 'Engineer productivity and throughput.', format: 'PDF', table: 'work_orders', qtype: 'staff_prod' },
    { id: 'parts-inventory', title: 'Parts Inventory Report', category: 'Inventory', description: 'Spare parts stock levels and valuation.', format: 'XLS', table: 'spare_parts', qtype: 'parts_inv' },
    { id: 'maintenance-budget', title: 'Maintenance Budget vs Actual', category: 'Financial', description: 'Budgeted vs actual maintenance spend.', format: 'PDF/XLS', table: 'work_orders', qtype: 'maint_budget' },
    { id: 'equipment-downtime', title: 'Equipment Downtime Report', category: 'Operations', description: 'Equipment downtime incidents and impact.', format: 'PDF', table: 'work_orders', qtype: 'downtime' },
  ],
  housekeeping: [
    { id: 'daily-room-status', title: 'Daily Room Status', category: 'Operations', description: 'Current status of all rooms.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'room_status' },
    { id: 'weekly-cleaning', title: 'Weekly Cleaning Summary', category: 'Operations', description: 'Cleaning tasks completed vs scheduled.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'weekly_cleaning' },
    { id: 'room-inspection', title: 'Room Inspection Report', category: 'Quality', description: 'Inspection scores and deficiency tracking.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'inspection' },
    { id: 'linen-variance', title: 'Linen Variance Audit', category: 'Inventory', description: 'Issued vs returned linen counts.', format: 'XLS', table: 'ops_housekeeping_tasks', qtype: 'linen' },
    { id: 'staff-productivity', title: 'Staff Productivity', category: 'HR', description: 'Rooms cleaned per attendant vs targets.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'staff_prod' },
    { id: 'guest-complaints', title: 'Guest Complaint Report', category: 'Quality', description: 'Housekeeping-related guest complaints.', format: 'PDF', table: 'guest_requests', qtype: 'complaints' },
    { id: 'room-board-status', title: 'Room Board Status', category: 'Operations', description: 'Real-time room board snapshot.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'board_status' },
    { id: 'lost-found', title: 'Lost & Found Report', category: 'Operations', description: 'Recovered items and custody tracking.', format: 'XLS', table: 'guest_requests', qtype: 'lost_found' },
    { id: 'amenities-consumption', title: 'Amenities Consumption', category: 'Inventory', description: 'Amenity usage and replenishment tracking.', format: 'XLS', table: 'stock_transactions', qtype: 'amenities' },
    { id: 'task-completion', title: 'Task Completion Report', category: 'Operations', description: 'Task completion rates by category and shift.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'task_completion' },
    { id: 'laundry-tracking', title: 'Laundry Tracking Report', category: 'Operations', description: 'Laundry volume and turnaround times.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'laundry' },
    { id: 'chemical-usage', title: 'Chemical Usage Report', category: 'Inventory', description: 'Cleaning chemical consumption and cost.', format: 'XLS', table: 'stock_transactions', qtype: 'chemical' },
    { id: 'staff-scheduling', title: 'Staff Scheduling Report', category: 'HR', description: 'Roster vs actual attendance.', format: 'PDF', table: 'employees', qtype: 'scheduling' },
    { id: 'deep-cleaning', title: 'Deep Cleaning Schedule', category: 'Operations', description: 'Deep cleaning cycle status by room.', format: 'PDF', table: 'ops_housekeeping_tasks', qtype: 'deep_clean' },
    { id: 'guest-satisfaction', title: 'Guest Satisfaction Scores', category: 'Quality', description: 'Cleanliness ratings and guest feedback.', format: 'PDF', table: 'guest_requests', qtype: 'satisfaction' },
    { id: 'overtime', title: 'Overtime Report', category: 'HR', description: 'Overtime hours and cost by attendant.', format: 'XLS', table: 'employees', qtype: 'overtime' },
  ],
  frontdesk: [
    { id: 'daily-audit', title: 'Daily Audit Report', category: 'Night Audit', description: 'End-of-day reconciliation and ledger closure.', format: 'PDF', table: 'reservations', qtype: 'daily_audit' },
    { id: 'check-in-out', title: 'Check-In/Check-Out Report', category: 'Guest Management', description: 'Arrivals and departures with times.', format: 'PDF', table: 'reservations', qtype: 'check_in_out' },
    { id: 'gift-shop-inventory', title: 'Gift Shop Inventory', category: 'Inventory', description: 'Gift shop stock levels and sales.', format: 'XLS', table: 'gift_shop_sales', qtype: 'gift_shop_inv' },
    { id: 'reservations', title: 'Reservation Report', category: 'Guest Management', description: 'All reservations by source and status.', format: 'PDF/XLS', table: 'reservations', qtype: 'reservations' },
    { id: 'night-audit', title: 'Night Audit Report', category: 'Night Audit', description: 'Night audit reconciliation summary.', format: 'PDF', table: 'reservations', qtype: 'night_audit' },
    { id: 'guest-history', title: 'Guest History Report', category: 'CRM', description: 'Guest profile and stay history.', format: 'XLS', table: 'reservations', qtype: 'guest_history' },
    { id: 'folio-analysis', title: 'Folio Analysis', category: 'Financial', description: 'Folio balances and revenue breakdown.', format: 'XLS', table: 'folios', qtype: 'folio_analysis' },
    { id: 'payment-breakdown', title: 'Payment Method Breakdown', category: 'Financial', description: 'Revenue by payment method.', format: 'PDF', table: 'folios', qtype: 'payment_methods' },
    { id: 'occupancy', title: 'Occupancy Rate Report', category: 'Operational', description: 'Daily occupancy percentages.', format: 'PDF', table: 'reservations', qtype: 'occupancy' },
    { id: 'adr', title: 'ADR Report', category: 'Financial', description: 'Average Daily Rate trends.', format: 'PDF', table: 'reservations', qtype: 'adr' },
    { id: 'revpar', title: 'RevPAR Report', category: 'Financial', description: 'Revenue per Available Room.', format: 'PDF', table: 'reservations', qtype: 'revpar' },
    { id: 'no-show', title: 'No-Show Report', category: 'Guest Management', description: 'No-show reservations and revenue impact.', format: 'PDF', table: 'reservations', qtype: 'no_show' },
    { id: 'cancellation', title: 'Cancellation Report', category: 'Guest Management', description: 'Cancelled reservations and reasons.', format: 'PDF', table: 'reservations', qtype: 'cancellation' },
    { id: 'ota-performance', title: 'OTA Performance', category: 'Sales', description: 'Bookings by online travel agency.', format: 'PDF', table: 'reservations', qtype: 'ota' },
    { id: 'walk-in', title: 'Walk-in Analysis', category: 'Guest Management', description: 'Walk-in guest volume and conversion.', format: 'PDF', table: 'reservations', qtype: 'walk_in' },
    { id: 'group-booking', title: 'Group Booking Summary', category: 'Guest Management', description: 'Group bookings and block utilization.', format: 'PDF', table: 'group_bookings', qtype: 'group_booking' },
    { id: 'guest-complaints', title: 'Guest Complaints Report', category: 'Quality', description: 'Front desk complaints and resolution.', format: 'PDF', table: 'guest_requests', qtype: 'fd_complaints' },
  ],
  inventory: [
    { id: 'stock-levels', title: 'Stock Levels Report', category: 'Stock', description: 'Current stock quantities by location.', format: 'XLS', table: 'stock_transactions', qtype: 'stock_levels' },
    { id: 'inventory-valuation', title: 'Inventory Valuation', category: 'Financial', description: 'Stock value at cost by category.', format: 'XLS', table: 'stock_transactions', qtype: 'inv_valuation' },
    { id: 'stock-movement', title: 'Stock Movement Report', category: 'Stock', description: 'All stock transactions.', format: 'XLS', table: 'stock_transactions', qtype: 'stock_movement' },
    { id: 'reorder-alerts', title: 'Reorder Alerts', category: 'Procurement', description: 'Items below par level requiring reorder.', format: 'PDF', table: 'stock_transactions', qtype: 'reorder' },
    { id: 'supplier-performance', title: 'Supplier Performance', category: 'Procurement', description: 'Supplier delivery and quality metrics.', format: 'PDF', table: 'fb_suppliers', qtype: 'supplier_perf' },
    { id: 'waste-spoilage', title: 'Waste & Spoilage Report', category: 'Operations', description: 'Wastage log with reasons and cost impact.', format: 'PDF', table: 'wastage_logs', qtype: 'waste' },
    { id: 'stock-variance', title: 'Stock Variance Analysis', category: 'Stock', description: 'Physical count vs system stock variance.', format: 'XLS', table: 'stock_counts', qtype: 'variance' },
    { id: 'expiration-tracking', title: 'Expiration Tracking', category: 'Stock', description: 'Items nearing or past expiration.', format: 'PDF', table: 'stock_transactions', qtype: 'expiration' },
    { id: 'store-performance', title: 'Store Performance', category: 'Operations', description: 'Stock turnover and efficiency by location.', format: 'PDF', table: 'stock_transactions', qtype: 'store_perf' },
    { id: 'consumption', title: 'Consumption Report', category: 'Stock', description: 'Material consumption by department.', format: 'XLS', table: 'stock_transactions', qtype: 'consumption' },
    { id: 'procurement-cost', title: 'Procurement Cost Analysis', category: 'Financial', description: 'Purchasing spend and cost trends.', format: 'XLS', table: 'fb_purchase_orders', qtype: 'proc_cost' },
    { id: 'po-status', title: 'Purchase Order Status', category: 'Procurement', description: 'Open and closed POs with delivery status.', format: 'PDF', table: 'fb_purchase_orders', qtype: 'po_status' },
    { id: 'receiving', title: 'Receiving Report', category: 'Procurement', description: 'Goods received notes and discrepancies.', format: 'PDF', table: 'stock_transactions', qtype: 'receiving' },
    { id: 'stock-count', title: 'Stock Count Summary', category: 'Stock', description: 'Cycle count results and adjustments.', format: 'XLS', table: 'stock_counts', qtype: 'stock_count' },
    { id: 'slow-moving', title: 'Slow-Moving Items', category: 'Stock', description: 'Items with low turnover and high holding cost.', format: 'PDF', table: 'stock_transactions', qtype: 'slow_moving' },
    { id: 'inventory-aging', title: 'Inventory Aging Report', category: 'Financial', description: 'Stock age distribution and obsolescence risk.', format: 'XLS', table: 'stock_transactions', qtype: 'aging' },
  ],
  executive: [
    { id: 'executive-summary', title: 'Executive Summary', category: 'Executive', description: 'High-level KPI snapshot for leadership.', format: 'PDF', table: 'reservations', qtype: 'exec_summary' },
    { id: 'kpi-dashboard', title: 'KPI Dashboard', category: 'Executive', description: 'Real-time operational and financial KPIs.', format: 'PDF', table: 'reservations', qtype: 'kpi' },
    { id: 'occupancy-analysis', title: 'Occupancy Analysis', category: 'Operational', description: 'Occupancy trends and forecasting.', format: 'PDF', table: 'reservations', qtype: 'occupancy' },
    { id: 'revenue-performance', title: 'Revenue Performance', category: 'Financial', description: 'Total revenue and RevPAR analysis.', format: 'PDF/XLS', table: 'reservations', qtype: 'revenue' },
    { id: 'labor-cost', title: 'Labor Cost Analysis', category: 'HR', description: 'Labor spend as % of revenue and productivity.', format: 'PDF', table: 'employees', qtype: 'labor_cost' },
    { id: 'guest-satisfaction', title: 'Guest Satisfaction Report', category: 'Quality', description: 'Overall guest scores and NPS trends.', format: 'PDF', table: 'guest_requests', qtype: 'satisfaction' },
    { id: 'financial-summary', title: 'Financial Summary', category: 'Financial', description: 'P&L summary and key financial ratios.', format: 'PDF', table: 'journal_entries', qtype: 'fin_summary' },
    { id: 'dept-performance', title: 'Departmental Performance', category: 'Operational', description: 'Cross-departmental KPI comparison.', format: 'PDF/XLS', table: 'reservations', qtype: 'dept_perf' },
    { id: 'budget-variance', title: 'Budget Variance Analysis', category: 'Financial', description: 'Actual vs budget with variance explanations.', format: 'PDF/XLS', table: 'journal_entries', qtype: 'budget_var' },
    { id: 'market-segmentation', title: 'Market Segmentation', category: 'Strategic', description: 'Revenue by market segment and channel.', format: 'PDF', table: 'reservations', qtype: 'market_seg' },
    { id: 'competitive-analysis', title: 'Competitive Analysis', category: 'Strategic', description: 'Market positioning and competitor benchmarks.', format: 'PDF', table: 'reservations', qtype: 'competitive' },
    { id: 'operational-efficiency', title: 'Operational Efficiency', category: 'Operational', description: 'Process efficiency and cost optimization.', format: 'PDF', table: 'work_orders', qtype: 'ops_efficiency' },
    { id: 'capex', title: 'Capital Expenditure Report', category: 'Financial', description: 'Capex projects, spend, and ROI.', format: 'PDF/XLS', table: 'fixed_assets', qtype: 'capex' },
    { id: 'revenue-forecast', title: 'Revenue Forecast', category: 'Strategic', description: 'Forward-looking revenue projections.', format: 'PDF', table: 'forecast_entries', qtype: 'forecast' },
    { id: 'compliance', title: 'Compliance Report', category: 'Compliance', description: 'Regulatory and internal compliance status.', format: 'PDF', table: 'risk_compliance', qtype: 'compliance' },
    { id: 'risk-assessment', title: 'Risk Assessment', category: 'Risk', description: 'Enterprise risk register and mitigation.', format: 'PDF', table: 'risk_compliance', qtype: 'risk' },
    { id: 'sustainability', title: 'Sustainability Report', category: 'Strategic', description: 'ESG metrics and sustainability initiatives.', format: 'PDF', table: 'work_orders', qtype: 'sustainability' },
  ],
  hr: [
    { id: 'headcount', title: 'Headcount Report', category: 'Workforce', description: 'Active employees by department and role.', format: 'PDF', table: 'employees', qtype: 'headcount' },
    { id: 'payroll-summary', title: 'Payroll Summary', category: 'Financial', description: 'Total payroll cost by department.', format: 'PDF/XLS', table: 'employees', qtype: 'payroll_summary' },
    { id: 'attendance', title: 'Attendance Report', category: 'Operations', description: 'Attendance rates and absences.', format: 'PDF', table: 'employees', qtype: 'attendance' },
    { id: 'overtime', title: 'Overtime Analysis', category: 'Financial', description: 'Overtime hours and cost by employee.', format: 'XLS', table: 'employees', qtype: 'ot_analysis' },
    { id: 'leave-balance', title: 'Leave Balance Report', category: 'Operations', description: 'Outstanding leave balances by type.', format: 'PDF', table: 'employees', qtype: 'leave_balance' },
    { id: 'turnover', title: 'Turnover Analysis', category: 'Workforce', description: 'Hires vs terminations and turnover rate.', format: 'PDF', table: 'employees', qtype: 'turnover' },
    { id: 'performance-review', title: 'Performance Review Status', category: 'Performance', description: 'Review completion and score distribution.', format: 'PDF', table: 'employees', qtype: 'perf_review' },
    { id: 'training-completion', title: 'Training Completion', category: 'Development', description: 'Training program completion rates.', format: 'PDF', table: 'employees', qtype: 'training' },
    { id: 'recruitment-pipeline', title: 'Recruitment Pipeline', category: 'Recruitment', description: 'Open positions and candidate stages.', format: 'PDF', table: 'employees', qtype: 'recruitment' },
    { id: 'labor-cost', title: 'Labor Cost Analysis', category: 'Financial', description: 'Labor spend as % of revenue.', format: 'PDF/XLS', table: 'employees', qtype: 'labor_cost' },
    { id: 'department-distribution', title: 'Department Distribution', category: 'Workforce', description: 'Headcount distribution across departments.', format: 'PDF', table: 'employees', qtype: 'dept_dist' },
    { id: 'compensation', title: 'Compensation Analysis', category: 'Financial', description: 'Salary ranges and compensation benchmarks.', format: 'XLS', table: 'employees', qtype: 'compensation' },
  ],
  procurement: [
    { id: 'po-summary', title: 'Purchase Order Summary', category: 'Procurement', description: 'PO volume, value, and status breakdown.', format: 'PDF/XLS', table: 'fb_purchase_orders', qtype: 'po_summary' },
    { id: 'supplier-performance', title: 'Supplier Performance', category: 'Suppliers', description: 'Delivery timeliness and quality by supplier.', format: 'PDF', table: 'fb_suppliers', qtype: 'supplier_perf' },
    { id: 'spend-analysis', title: 'Spend Analysis', category: 'Financial', description: 'Procurement spend by category and supplier.', format: 'XLS', table: 'fb_purchase_orders', qtype: 'spend' },
    { id: 'receiving-report', title: 'Receiving Report', category: 'Operations', description: 'Goods received notes and discrepancies.', format: 'PDF', table: 'stock_transactions', qtype: 'receiving' },
    { id: 'requisition-summary', title: 'Requisition Summary', category: 'Procurement', description: 'Requisition volume and approval cycle time.', format: 'PDF', table: 'stock_transactions', qtype: 'requisition' },
    { id: 'contract-status', title: 'Contract Status Report', category: 'Contracts', description: 'Active contracts and expiration tracking.', format: 'PDF', table: 'fb_suppliers', qtype: 'contract_status' },
    { id: 'budget-variance', title: 'Budget vs Actual', category: 'Financial', description: 'Procurement budget vs actual spend.', format: 'PDF/XLS', table: 'fb_purchase_orders', qtype: 'budget_var' },
    { id: 'invoice-status', title: 'Invoice Status Report', category: 'Financial', description: 'Supplier invoice aging and payment status.', format: 'XLS', table: 'ap_bills', qtype: 'invoice_status' },
    { id: 'rfq-analysis', title: 'RFQ Analysis', category: 'Procurement', description: 'RFQ volume, response rates, and savings.', format: 'PDF', table: 'fb_purchase_orders', qtype: 'rfq' },
    { id: 'inventory-valuation', title: 'Inventory Valuation', category: 'Financial', description: 'Stock value at cost by category.', format: 'XLS', table: 'stock_transactions', qtype: 'inv_valuation' },
    { id: 'cost-saving', title: 'Cost Saving Report', category: 'Financial', description: 'Realized savings from procurement initiatives.', format: 'PDF', table: 'fb_purchase_orders', qtype: 'cost_saving' },
    { id: 'approval-cycle', title: 'Approval Cycle Time', category: 'Operations', description: 'Time from requisition to PO approval.', format: 'PDF', table: 'fb_purchase_orders', qtype: 'approval_cycle' },
  ],
};

// GET /:department/metadata — returns report catalog with real last-run data
router.get('/:department/metadata', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { department } = req.params;
  const defs = REPORT_DEFS[department];
  if (!defs) return res.status(404).json({ error: 'Unknown department' });

  let versionMap = new Map<string, any>();
  try {
    const { data: versions } = await supabaseAdmin
      .from('report_versions')
      .select('report_name, status, created_at, generated_by')
      .order('created_at', { ascending: false })
      .limit(200);
    for (const v of versions || []) {
      if (!versionMap.has(v.report_name)) versionMap.set(v.report_name, v);
    }
  } catch (_e) {
    // table may not exist yet — continue with empty map
  }

  const reports = defs.map(def => {
    const v = versionMap.get(def.id);
    let lastRun = 'Never';
    if (v?.created_at) {
      const diff = Date.now() - new Date(v.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) lastRun = 'Just now';
      else if (mins < 60) lastRun = `${mins} mins ago`;
      else if (mins < 1440) lastRun = `${Math.floor(mins / 60)} hours ago`;
      else lastRun = `${Math.floor(mins / 1440)} days ago`;
    }
    return {
      id: def.id, title: def.title, period: (req.query.rangeType as string) || 'monthly',
      status: v?.status || 'Draft', format: def.format, lastRun,
      category: def.category, description: def.description,
    };
  });

  return res.json({ reports });
});

// GET /:department/data — returns real aggregated metrics from DB
router.get('/:department/data', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { department } = req.params;
  const { rangeType, customStart, customEnd } = req.query as Record<string, string>;
  const { start, end } = getDateRange(rangeType || 'monthly', customStart, customEnd);
  const defs = REPORT_DEFS[department];
  if (!defs) return res.status(404).json({ error: 'Unknown department' });

  const reportData: Record<string, any> = {};
  for (const def of defs) {
    try {
      reportData[def.id] = await fetchReportData(def.table, def.qtype, start, end);
    } catch (err: any) {
      reportData[def.id] = { error: err.message, data: [] };
    }
  }

  return res.json({ department, rangeType: rangeType || 'monthly', startDate: start, endDate: end, reports: reportData, generatedAt: new Date().toISOString() });
});

// POST /:department/:reportId/generate — generates a report, records in report_versions
router.post('/:department/:reportId/generate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { department, reportId } = req.params;
  const { rangeType, customStart, customEnd } = req.body || {};
  const { start, end } = getDateRange(rangeType || 'monthly', customStart, customEnd);
  const def = REPORT_DEFS[department]?.find(d => d.id === reportId);
  if (!def) return res.status(404).json({ error: 'Report not found' });

  const data = await fetchReportData(def.table, def.qtype, start, end);

  let version: any = null;
  try {
    const { data: v } = await supabaseAdmin
      .from('report_versions')
      .insert({ report_name: reportId, department, status: 'Finalized', generated_by: req.user?.name || req.user?.id || null, date_range: rangeType || 'monthly', start_date: start, end_date: end, summary: data?.summary || null })
      .select().single();
    version = v;
  } catch (_e) {
    // table may not exist yet — continue without recording
  }

  return res.json({ reportId, title: def.title, department, rangeType: rangeType || 'monthly', startDate: start, endDate: end, data, version, generatedAt: new Date().toISOString() });
});

// ── Data fetcher — queries real DB tables based on type ──
async function fetchReportData(table: string, qtype: string, start: string, end: string): Promise<any> {
  if (!supabaseAdmin) return { data: [], summary: {} };

  // Reservations-based queries
  if (table === 'reservations') {
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .gte('check_in_date', start)
      .lte('check_in_date', end);
    if (error) return { error: error.message, data: [] };

    const total = (data || []).length;
    const totalRevenue = (data || []).reduce((s, r) => s + (r.total_amount || 0), 0);
    const confirmed = (data || []).filter(r => r.status === 'confirmed' || r.status === 'checked_in').length;
    const checkedIn = (data || []).filter(r => r.status === 'checked_in').length;
    const cancelled = (data || []).filter(r => r.status === 'cancelled').length;
    const noShows = (data || []).filter(r => r.status === 'no_show').length;

    return {
      summary: { total, totalRevenue, confirmed, checkedIn, cancelled, noShows,
        avgRevenue: total > 0 ? totalRevenue / total : 0 },
      data: data || [],
    };
  }

  // Journal entries (finance)
  if (table === 'journal_entries') {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .gte('date', start.split('T')[0])
      .lte('date', end.split('T')[0]);
    if (error) return { error: error.message, data: [] };

    const totalDebits = (data || []).reduce((s, j) => s + (j.total_debit || 0), 0);
    const totalCredits = (data || []).reduce((s, j) => s + (j.total_credit || 0), 0);

    return { summary: { totalEntries: (data || []).length, totalDebits, totalCredits }, data: data || [] };
  }

  // Work orders (engineering)
  if (table === 'work_orders') {
    const { data, error } = await supabaseAdmin
      .from('work_orders')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };

    const completed = (data || []).filter(w => w.status === 'completed').length;
    const pending = (data || []).filter(w => w.status === 'open' || w.status === 'assigned').length;

    return { summary: { total: (data || []).length, completed, pending }, data: data || [] };
  }

  // Housekeeping tasks
  if (table === 'ops_housekeeping_tasks') {
    const { data, error } = await supabaseAdmin
      .from('ops_housekeeping_tasks')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, completed: (data || []).filter(t => t.status === 'completed').length }, data: data || [] };
  }

  // Stock transactions (inventory/f&B)
  if (table === 'stock_transactions') {
    const { data, error } = await supabaseAdmin
      .from('stock_transactions')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Orders (F&B)
  if (table === 'orders') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    const totalRevenue = (data || []).reduce((s, o) => s + (o.total || 0), 0);
    return { summary: { totalOrders: (data || []).length, totalRevenue }, data: data || [] };
  }

  // Order lines (F&B menu performance)
  if (table === 'order_lines') {
    const { data, error } = await supabaseAdmin
      .from('order_lines')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { totalLines: (data || []).length }, data: data || [] };
  }

  // Wastage logs
  if (table === 'wastage_logs') {
    const { data, error } = await supabaseAdmin
      .from('wastage_logs')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalCost: (data || []).reduce((s, w) => s + (w.cost || 0), 0) }, data: data || [] };
  }

  // AR ledger
  if (table === 'ar_ledger') {
    const { data, error } = await supabaseAdmin
      .from('ar_ledger')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, outstanding: (data || []).reduce((s, r) => s + (r.balance || 0), 0) }, data: data || [] };
  }

  // AP bills
  if (table === 'ap_bills') {
    const { data, error } = await supabaseAdmin
      .from('ap_bills')
      .select('*')
      .gte('bill_date', start)
      .lte('bill_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, outstanding: (data || []).reduce((s, b) => s + (b.amount_due || 0), 0) }, data: data || [] };
  }

  // Bank accounts
  if (table === 'bank_accounts') {
    const { data, error } = await supabaseAdmin.from('bank_accounts').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Fixed assets
  if (table === 'fixed_assets') {
    const { data, error } = await supabaseAdmin.from('fixed_assets').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalValue: (data || []).reduce((s, a) => s + (a.purchase_cost || 0), 0) }, data: data || [] };
  }

  // Accounting periods
  if (table === 'accounting_periods') {
    const { data, error } = await supabaseAdmin.from('accounting_periods').select('*').order('start_date', { ascending: false }).limit(10);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // F&B suppliers
  if (table === 'fb_suppliers') {
    const { data, error } = await supabaseAdmin.from('fb_suppliers').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, active: (data || []).filter(s => s.is_active).length }, data: data || [] };
  }

  // F&B purchase orders
  if (table === 'fb_purchase_orders') {
    const { data, error } = await supabaseAdmin
      .from('fb_purchase_orders')
      .select('*')
      .gte('order_date', start)
      .lte('order_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalSpend: (data || []).reduce((s, p) => s + (p.total_amount || 0), 0) }, data: data || [] };
  }

  // Banquet events
  if (table === 'banquet_events') {
    const { data, error } = await supabaseAdmin
      .from('banquet_events')
      .select('*')
      .gte('event_date', start)
      .lte('event_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalRevenue: (data || []).reduce((s, e) => s + (e.estimated_revenue || 0), 0) }, data: data || [] };
  }

  // Recipes
  if (table === 'recipes') {
    const { data, error } = await supabaseAdmin.from('recipes').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // PM schedules
  if (table === 'pm_schedules') {
    const { data, error } = await supabaseAdmin.from('pm_schedules').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Spare parts
  if (table === 'spare_parts') {
    const { data, error } = await supabaseAdmin.from('spare_parts').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalValue: (data || []).reduce((s, p) => s + ((p.unit_cost || 0) * (p.quantity || 0)), 0) }, data: data || [] };
  }

  // Guest requests
  if (table === 'guest_requests') {
    const { data, error } = await supabaseAdmin
      .from('guest_requests')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, resolved: (data || []).filter(g => g.status === 'resolved' || g.status === 'completed').length }, data: data || [] };
  }

  // Employees
  if (table === 'employees') {
    const { data, error } = await supabaseAdmin.from('employees').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, active: (data || []).filter(e => e.status === 'active').length }, data: data || [] };
  }

  // Gift shop sales
  if (table === 'gift_shop_sales') {
    const { data, error } = await supabaseAdmin
      .from('gift_shop_sales')
      .select('*')
      .gte('sale_date', start)
      .lte('sale_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalRevenue: (data || []).reduce((s, g) => s + (g.total_amount || 0), 0) }, data: data || [] };
  }

  // Folios
  if (table === 'folios') {
    const { data, error } = await supabaseAdmin
      .from('folios')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length, totalBalance: (data || []).reduce((s, f) => s + (f.balance || 0), 0) }, data: data || [] };
  }

  // Group bookings
  if (table === 'group_bookings') {
    const { data, error } = await supabaseAdmin
      .from('group_bookings')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Stock counts
  if (table === 'stock_counts') {
    const { data, error } = await supabaseAdmin
      .from('stock_counts')
      .select('*')
      .gte('count_date', start)
      .lte('count_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Forecast entries
  if (table === 'forecast_entries') {
    const { data, error } = await supabaseAdmin
      .from('forecast_entries')
      .select('*')
      .gte('forecast_date', start)
      .lte('forecast_date', end);
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Risk compliance
  if (table === 'risk_compliance') {
    const { data, error } = await supabaseAdmin.from('risk_compliance').select('*');
    if (error) return { error: error.message, data: [] };
    return { summary: { total: (data || []).length }, data: data || [] };
  }

  // Default fallback
  return { data: [], summary: {} };
}

export default router;
