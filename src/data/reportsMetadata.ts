/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReportItem {
  id: string;
  name: string;
  category: string;
  description: string;
  generatedAt: string;
}

export interface MetricComparison {
  metric: string;
  current: string | number;
  previous: string | number;
  variance: string;
  isPositive: boolean;
}

export interface AIRecommendation {
  category: string;
  title: string;
  impact: 'High' | 'Medium';
  recommendation: string;
}

export interface DepartmentReports {
  daily: ReportItem[];
  weekly: MetricComparison[];
  monthly: { title: string; content: string; trend: string }[];
  monthlyStats?: MetricComparison[];
  quarterly?: { title: string; content: string; trend: string }[];
  quarterlyStats?: MetricComparison[];
  aiRecommendations: AIRecommendation[];
}

export const REPORTS_METADATA: Record<string, DepartmentReports> = {
  'Front Office': {
    daily: [
      { id: 'rep-arr', name: 'Arrival Report', category: 'Reception', description: 'Lists all scheduled reservations arriving today, VIPs, and expected check-in times.', generatedAt: 'Auto (06:00 UTC)' },
      { id: 'rep-dep', name: 'Departure Report', category: 'Reception', description: 'Lists in-house rooms scheduled to check out today, key balances, and group check-outs.', generatedAt: 'Auto (06:00 UTC)' },
      { id: 'rep-vip', name: 'VIP Guest Report', category: 'Reception', description: 'Detailed focus list of high-priority VIP arrivals and active VIP guest rooms.', generatedAt: 'Real-time' },
      { id: 'aud-sum', name: 'Night Audit Summary Report', category: 'Night Audit', description: 'Official end-of-day certificate reconciling all hotel room charges and ledger closures.', generatedAt: 'Auto (Night Audit)' },
      { id: 'rep-gs-sales', name: 'Gift Shop Daily Sales Report', category: 'Gift Shop & Supplies', description: 'Lists aggregate gift shop sales margins, staff metrics, transaction counts.', generatedAt: 'Auto (23:00 UTC)' },
    ],
    weekly: [
      { metric: 'Occupancy Rate', current: '78.4%', previous: '74.2%', variance: '+4.2%', isPositive: true },
      { metric: 'Room Revenue', current: '$34,923', previous: '$31,450', variance: '+11.04%', isPositive: true },
      { metric: 'ADR', current: '$180.20', previous: '$182.50', variance: '-1.26%', isPositive: false },
      { metric: 'RevPAR', current: '$141.27', previous: '$135.41', variance: '+4.3%', isPositive: true },
      { metric: 'Guest Satisfaction', current: '94.2/100', previous: '91.5/100', variance: '+2.7%', isPositive: true },
    ],
    monthly: [
      { title: 'Executive Summary', content: 'Strong operating traction with surge in direct-consumer bookings. House operations settled with zero critical safety breaches.', trend: 'Overall Performance: Elite' },
      { title: 'Revenue Analysis', content: 'Gross operational revenues crossed $142,650, driven heavily by luxury suite tarification and premium spa activities.', trend: '+12.4% vs Prev Month' },
    ],
    monthlyStats: [
      { metric: 'Monthly Occupancy', current: '82.1%', previous: '79.4%', variance: '+2.7%', isPositive: true },
      { metric: 'ADR (Average Daily Rate)', current: '$185.40', previous: '$178.20', variance: '+$7.20', isPositive: true },
      { metric: 'RevPAR', current: '$152.21', previous: '$141.49', variance: '+7.6%', isPositive: true },
      { metric: 'Total Revenue', current: '$142,650', previous: '$126,900', variance: '+12.4%', isPositive: true },
    ],
    quarterly: [
      { title: 'Market Positioning', content: 'Aggressive expansion into the corporate events sector has yielded a 24% increase in B2B lead generation.', trend: 'Market Share: +4%' },
      { title: 'Loyalty Retention', content: 'The "Grand Rewards" program saw a 15% increase in activation rates this quarter.', trend: 'Retention: Optimal' },
    ],
    quarterlyStats: [
      { metric: 'Quarterly Revenue', current: '$412,450', previous: '$385,200', variance: '+7.1%', isPositive: true },
      { metric: 'Net promoter Score', current: '92', previous: '89', variance: '+3', isPositive: true },
      { metric: 'Direct Bookings %', current: '42%', previous: '38%', variance: '+4%', isPositive: true },
      { metric: 'Cancellation Rate', current: '8.4%', previous: '11.2%', variance: '-2.8%', isPositive: true },
    ],
    aiRecommendations: [
      { category: 'Revenue Optimization', title: 'Yield Rate Escalation for Deluxes', impact: 'High', recommendation: 'Raise weekend tariff levels for deluxe room categories by 8%.' },
      { category: 'Upselling', title: 'Pre-Arrival Suite Upgrades', impact: 'Medium', recommendation: 'Automate triggers to offer unsold Suites at a discounted rate 48h prior to check-in.' },
    ]
  },
  'Housekeeping': {
    daily: [
      { id: 'hk-rooms-status', name: 'Daily Room Status Report', category: 'Operational', description: 'Current status of all rooms (Clean, Dirty, OOO, Occupied).', generatedAt: 'Real-time' },
      { id: 'hk-productivity', name: 'Staff Productivity Report', category: 'Staffing', description: 'Rooms cleaned per attendant vs targets and average cleaning times.', generatedAt: 'Daily Shift End' },
      { id: 'hk-linen-variance', name: 'Linen Variance Audit', category: 'Inventory', description: 'Issued vs Returned linen counts and calculated shrinkage.', generatedAt: 'Daily Shift End' },
      { id: 'hk-lost-found', name: 'Lost & Found Ledger', category: 'Operations', description: 'Active housekeeping ledger containing recovered items and custody locations.', generatedAt: 'Daily Wrap' },
    ],
    weekly: [
      { metric: 'Avg Cleaning Time', current: '32m', previous: '35m', variance: '-8.5%', isPositive: true },
      { metric: 'Inspection Pass Rate', current: '94.2%', previous: '91.5%', variance: '+2.7%', isPositive: true },
      { metric: 'Linen Loss Rate', current: '3.4%', previous: '3.8%', variance: '-10.5%', isPositive: true },
      { metric: 'Housekeeping Cost/Room', current: '$46.20', previous: '$48.50', variance: '-4.7%', isPositive: true },
    ],
    monthly: [
      { title: 'Operational Efficiency', content: 'Housekeeping completed 945 turnarounds with an average inspection score of 98.2%.', trend: '+2.1% efficiency' },
      { title: 'Resource Management', content: 'Linen lifecycle optimized through new washing protocol resulting in 15% drop in replacement costs.', trend: '-15% Replacement Cost' },
    ],
    monthlyStats: [
      { metric: 'Average Cleaning Time', current: '31m', previous: '34m', variance: '-8.8%', isPositive: true },
      { metric: 'Inspection Score', current: '98.2%', previous: '96.5%', variance: '+1.7%', isPositive: true },
      { metric: 'Linen Loss Value', current: '$1,240', previous: '$1,450', variance: '-14.5%', isPositive: true },
      { metric: 'Chemical Cost/Room', current: '$1.42', previous: '$1.55', variance: '-8.4%', isPositive: true },
    ],
    quarterly: [
      { title: 'Sustainability Audit', content: 'Successfully transitioned to 100% biodegradable cleaning agents across all room categories.', trend: 'ESG Rating: A+' },
      { title: 'Staff Retention', content: 'Zero voluntary turnover in the senior housekeeping team for two consecutive quarters.', trend: 'Stability: High' },
    ],
    quarterlyStats: [
      { metric: 'Total Rooms Cleaned', current: '2,845', previous: '2,620', variance: '+8.6%', isPositive: true },
      { metric: 'Staff Training Hours', current: '124h', previous: '98h', variance: '+26h', isPositive: true },
      { metric: 'Guest Comfort Score', current: '4.8/5', previous: '4.5/5', variance: '+0.3', isPositive: true },
      { metric: 'Lost & Found Resolution', current: '94%', previous: '88%', variance: '+6%', isPositive: true },
    ],
    aiRecommendations: [
      { category: 'Staffing Optimization', title: 'Dynamic Cleaning Stagger Shifts', impact: 'High', recommendation: 'Stagger Saturday rosters into check-out rush shifts to minimize guest wait times.' },
    ]
  },
  'F&B': {
    daily: [
      { id: 'fb-sales-summary', name: 'Daily Sales & Cover Summary', category: 'Sales', description: 'Aggregate sales per outlet (Bar, Restaurant, Room Service) and guest covers.', generatedAt: 'Auto (Night Audit)' },
      { id: 'fb-inventory-movement', name: 'Ingredient Movement Report', category: 'Inventory', description: 'Stock depletion vs sales reconciliation for key recipe items.', generatedAt: 'Daily Shift End' },
      { id: 'fb-wastage-loss', name: 'Wastage & Loss Ledger', category: 'Inventory', description: 'Itemized list of recorded wastage, spoilage, and preparation losses.', generatedAt: 'Daily Wrap' },
      { id: 'fb-popularity-index', name: 'Menu Engineering Report', category: 'Sales', description: 'Top and bottom performing menu items by volume and margin.', generatedAt: 'Auto (23:00 UTC)' },
    ],
    weekly: [
      { metric: 'Average Guest Check', current: '$42.50', previous: '$38.20', variance: '+11.2%', isPositive: true },
      { metric: 'Food Cost %', current: '28.4%', previous: '29.1%', variance: '-2.4%', isPositive: true },
      { metric: 'Beverage Cost %', current: '18.2%', previous: '17.5%', variance: '+4.0%', isPositive: false },
      { metric: 'Total Covers', current: '1,420', previous: '1,280', variance: '+10.9%', isPositive: true },
    ],
    monthly: [
      { title: 'F&B P&L Summary', content: 'Outlet margins remained healthy despite seasonal price hikes in fresh produce.', trend: 'Net Margin: 32%' },
      { title: 'Popularity Trends', content: 'Introduction of local specialty menu contributed to 15% increase in diner retention.', trend: '+15% Repeat Diners' },
    ],
    monthlyStats: [
      { metric: 'Revenue per Cover', current: '$48.50', previous: '$44.20', variance: '+$4.30', isPositive: true },
      { metric: 'Food Cost Percentage', current: '27.4%', previous: '28.8%', variance: '-1.4%', isPositive: true },
      { metric: 'Total Orders', current: '1,540', previous: '1,320', variance: '+16.7%', isPositive: true },
      { metric: 'Table Turn Time', current: '52m', previous: '58m', variance: '-6m', isPositive: true },
    ],
    quarterly: [
      { title: 'Menu Engineering', content: 'Re-engineering of the banquet packages led to a 22% increase in medium-sized event bookings.', trend: 'Growth: +22%' },
      { title: 'Procurement Strategy', content: 'New farm-to-table partnerships have reduced frozen logistics dependence by 30%.', trend: 'Sustainability: High' },
    ],
    quarterlyStats: [
      { metric: 'Banquet Revenue', current: '$84k', previous: '$68k', variance: '+$16k', isPositive: true },
      { metric: 'Wastage Reduction', current: '12.4%', previous: '18.2%', variance: '-5.8%', isPositive: true },
      { metric: 'Guest Rating (Food)', current: '9.4/10', previous: '8.8/10', variance: '+0.6', isPositive: true },
      { metric: 'Labor Cost %', current: '18.5%', previous: '19.4%', variance: '-0.9%', isPositive: true },
    ],
    aiRecommendations: [
      { category: 'Revenue Optimization', title: 'Dynamic Happy Hour Timing', impact: 'Medium', recommendation: 'Extend happy hour by 30 mins on Wednesdays to capture late-office crowd.' },
    ]
  },
  'Engineering': {
    daily: [
      { id: 'eng-work-orders', name: 'Daily Work Order Status', category: 'Maintenance', description: 'Summary of maintenance requests received, resolved, and pending.', generatedAt: 'Real-time' },
      { id: 'eng-ppm-completion', name: 'PPM Schedule Progress', category: 'Preventive', description: 'Completion status of planned preventive maintenance tasks.', generatedAt: 'Daily Wrap' },
      { id: 'eng-utility-logs', name: 'Utility Consumption Snapshot', category: 'Utilities', description: 'Water and electricity usage readings for main plant and room blocks.', generatedAt: 'Auto (Night Audit)' },
    ],
    weekly: [
      { metric: 'Work Order Resolution Time', current: '4.2h', previous: '5.1h', variance: '-17.6%', isPositive: true },
      { metric: 'PPM Completion Rate', current: '98.5%', previous: '96.2%', variance: '+2.3%', isPositive: true },
      { metric: 'Electricity Consumption', current: '4.2k kWh', previous: '4.5k kWh', variance: '-6.6%', isPositive: true },
      { metric: 'Asset Uptime', current: '99.8%', previous: '99.2%', variance: '+0.6%', isPositive: true },
    ],
    monthly: [
      { title: 'Asset Lifecycle Audit', content: 'Boiler systems maintained peak efficiency through quarterly descaling.', trend: 'Uptime: 100%' },
      { title: 'Energy Savings Initiative', content: 'New hallway LED replacements resulted in 12% drop in communal lighting costs.', trend: '-12% Energy Cost' },
    ],
    monthlyStats: [
      { metric: 'PPM Completion', current: '99.2%', previous: '97.5%', variance: '+1.7%', isPositive: true },
      { metric: 'Avg Utility Cost/Room', current: '$12.40', previous: '$13.10', variance: '-5.3%', isPositive: true },
      { metric: 'Emergency Repairs', current: '14', previous: '22', variance: '-8', isPositive: true },
      { metric: 'Stock Availability', current: '94%', previous: '91%', variance: '+3%', isPositive: true },
    ],
    quarterlyStats: [
      { metric: 'Capex Utilization', current: '78%', previous: '62%', variance: '+16%', isPositive: true },
      { metric: 'System Uptime', current: '99.98%', previous: '99.92%', variance: '+0.06%', isPositive: true },
    ],
    aiRecommendations: [
      { category: 'Cost Reduction', title: 'Predictive HVAC Maintenance', impact: 'High', recommendation: 'Service central chiller early due to anticipated heatwave next month.' },
    ]
  },
  'Inventory': {
    daily: [
      { id: 'inv-valuation', name: 'Stock Valuation Report', category: 'Financial', description: 'Current landed value of all inventory assets across storage locations.', generatedAt: 'Auto (Night Audit)' },
      { id: 'inv-low-stock', name: 'Low Stock Alert Ledger', category: 'Procurement', description: 'Items currently below established par levels requiring immediate reorder.', generatedAt: 'Real-time' },
      { id: 'inv-receipts', name: 'Goods Received Audit', category: 'Logistics', description: 'Summary of all stock arrivals and vendor delivery performance for the day.', generatedAt: 'Daily Wrap' },
    ],
    weekly: [
      { metric: 'Stock Turnover Ratio', current: '4.2x', previous: '3.9x', variance: '+7.7%', isPositive: true },
      { metric: 'Inventory Shrinkage', current: '0.8%', previous: '1.2%', variance: '-33.3%', isPositive: true },
      { metric: 'Out of Stock Incidents', current: '2', previous: '5', variance: '-60%', isPositive: true },
    ],
    monthly: [
      { title: 'Inventory Utilization', content: 'Central stores optimized grouping by velocity, reducing pick times by 14%.', trend: 'Efficiency: +14%' },
      { title: 'Procurement Strategy', content: 'Consolidation of beverage vendors yielded a 4% volume discount across top 20 lines.', trend: 'Cost Save: 4%' },
    ],
    monthlyStats: [
      { metric: 'Stock Precision', current: '99.8%', previous: '99.2%', variance: '+0.6%', isPositive: true },
      { metric: 'Dead Stock Value', current: '$2,400', previous: '$4,100', variance: '-41%', isPositive: true },
      { metric: 'Recycle Rate', current: '42%', previous: '38%', variance: '+4%', isPositive: true },
    ],
    quarterlyStats: [
      { metric: 'Supply Chain Carbon', current: '12.4t', previous: '14.2t', variance: '-12.7%', isPositive: true },
      { metric: 'Vendor Compliance', current: '96%', previous: '92%', variance: '+4%', isPositive: true },
    ],
    aiRecommendations: [
       { category: 'Cost Reduction', title: 'Bulk Purchase Alignment', impact: 'Medium', recommendation: 'Procure cleaning supplies in 200L drums to save 12% vs current 20L units.' },
    ]
  },
  'Finance': {
    daily: [
      { id: 'fin-daily-revenue', name: 'Daily Revenue Summary', category: 'Revenue', description: 'Consolidated revenue across all hotel departments and outlets.', generatedAt: 'Auto (Night Audit)' },
      { id: 'fin-cash-position', name: 'Cash Position & Bank Audit', category: 'Treasury', description: 'Bank balances, petty cash, and mobile money ledger balances.', generatedAt: 'Real-time' },
      { id: 'fin-ar-ageing', name: 'AR Ageing Detail', category: 'Credits', description: 'Outstanding balances categorized by ageing buckets (30, 60, 90 days).', generatedAt: 'Daily Wrap' },
    ],
    weekly: [
      { metric: 'Net Operating Income', current: '$84.2k', previous: '$79.5k', variance: '+5.9%', isPositive: true },
      { metric: 'Accounts Receivable', current: '$112k', previous: '$124k', variance: '-9.7%', isPositive: true },
      { metric: 'Operating Expenses', current: '$32.4k', previous: '$34.1k', variance: '-5.0%', isPositive: true },
    ],
    monthly: [
      { title: 'P&L Variance Review', content: 'Operational margins stayed within 2% of budget despite global inflation indices.', trend: 'Margin: 34.2%' },
      { title: 'Capital Expenditure', content: 'First phase of lobby renovation completed under-budget by $4,500.', trend: 'Budget Variance: -8%' },
    ],
    monthlyStats: [
      { metric: 'EBITDA Margin', current: '28.4%', previous: '26.2%', variance: '+2.2%', isPositive: true },
      { metric: 'Cash Flow Index', current: '1.42', previous: '1.28', variance: '+0.14', isPositive: true },
      { metric: 'Payroll % Revenue', current: '32.1%', previous: '34.5%', variance: '-2.4%', isPositive: true },
    ],
    quarterlyStats: [
      { metric: 'ROI (Project Alpha)', current: '14.2%', previous: 'N/A', variance: 'New', isPositive: true },
      { metric: 'Debt Coverage', current: '4.8x', previous: '4.2x', variance: '+0.6x', isPositive: true },
    ],
    aiRecommendations: [
       { category: 'Revenue Optimization', title: 'Payment Gateway Consolidation', impact: 'Medium', recommendation: 'Consolidate card processors to negotiate 0.2% lower transaction fees.' },
    ]
  },
  'Executive': {
    daily: [
      { id: 'exec-hotel-pulse', name: 'Strategic Hotel Pulse', category: 'Executive', description: 'Snapshot of critical RevPAR, ADR, and Occupancy metrics across the property.', generatedAt: 'Real-time' },
      { id: 'exec-vip-movement', name: 'Executive VIP Manifest', category: 'Guest Relations', description: 'Real-time tracking of ultra-high-net-worth (UHNW) guests and embassy delegates.', generatedAt: 'Real-time' },
      { id: 'exec-p&l-today', name: 'Daily P&L Proxy', category: 'Finance', description: 'Estimated net operating income based on real-time revenue and forecast costs.', generatedAt: 'Auto (Night Audit)' },
    ],
    weekly: [
      { metric: 'Net Profit Margin', current: '38.2%', previous: '34.5%', variance: '+10.7%', isPositive: true },
      { metric: 'RevPAR Index', current: '142.5', previous: '138.2', variance: '+3.1%', isPositive: true },
      { metric: 'Operating Efficiency', current: '94.2%', previous: '91.8%', variance: '+2.6%', isPositive: true },
      { metric: 'EBITDA (Est)', current: '$1.2M', previous: '$1.1M', variance: '+9.1%', isPositive: true },
      { metric: 'Market Share', current: '24.5%', previous: '23.8%', variance: '+2.9%', isPositive: true },
    ],
    monthly: [
      { title: 'Strategic Growth Vectors', content: 'Our pivot towards corporate workation retreats has yielded a 12% boost in mid-week occupancy floors.', trend: 'Growth Index: High' },
      { title: 'Fiscal Discipline Audit', content: 'Aggregated departmental expenditures remained within 1.5% of annualised budget targets.', trend: 'Variance: -1.5%' },
    ],
    monthlyStats: [
      { metric: 'Brand Equity Index', current: '88% ', previous: '84%', variance: '+4%', isPositive: true },
      { metric: 'Market Saturation', current: '24.2%', previous: '22.1%', variance: '+2.1%', isPositive: true },
    ],
    quarterlyStats: [
      { metric: 'Portfolio Growth', current: '12%', previous: '8%', variance: '+4%', isPositive: true },
      { metric: 'Reg. Compliance', current: '100%', previous: '100%', variance: 'Stable', isPositive: true },
    ],
    aiRecommendations: [
       { category: 'Growth Strategy', title: 'Loyalty Tier Expansion', impact: 'High', recommendation: 'Introduce an "Elite-Diamond" tier for high-spend corporate controllers to lock in long-term contracts.' },
       { category: 'Risk Management', title: 'Energy Price Hedging', impact: 'High', recommendation: 'Negotiate fixed energy tariffs for Q4 due to anticipated seasonal volatility.' },
    ]
  },
  'HR': {
    daily: [
      { id: 'hr-attendance', name: 'Daily Attendance Report', category: 'Staffing', description: 'Real-time clock-in/out logs and calculated lateness indices.', generatedAt: 'Real-time' },
      { id: 'hr-roster-variance', name: 'Shift Roster Variance', category: 'Staffing', description: 'Actual staff on duty vs scheduled roster requirements.', generatedAt: 'Real-time' },
    ],
    weekly: [
      { metric: 'Staff Attendance Rate', current: '98.2%', previous: '96.5%', variance: '+1.7%', isPositive: true },
      { metric: 'Total Overtime Hours', current: '124h', previous: '110h', variance: '+12.7%', isPositive: false },
      { metric: 'Employee Engagement', current: '88/100', previous: '85/100', variance: '+3.5%', isPositive: true },
    ],
    monthly: [
      { title: 'Training Index', content: 'Customer grievance recovery training completed for 95% of front-line staff.', trend: 'Compliance: High' },
      { title: 'Turnover Analysis', content: 'Turnover remains exceptionally low at 1.2% for the current quarter.', trend: 'Retention: Optimal' },
    ],
    monthlyStats: [
      { metric: 'Retention Rate', current: '98.8%', previous: '97.2%', variance: '+1.6%', isPositive: true },
      { metric: 'Training Compliance', current: '95%', previous: '88%', variance: '+7%', isPositive: true },
      { metric: 'Avg Hiring Cost', current: '$850', previous: '$920', variance: '-$70', isPositive: true },
    ],
    quarterlyStats: [
      { metric: 'Quarterly Turnover', current: '1.2%', previous: '3.4%', variance: '-2.2%', isPositive: true },
      { metric: 'Staff Health Index', current: '92/100', previous: '86/100', variance: '+6', isPositive: true },
    ],
    aiRecommendations: [
       { category: 'Staffing Optimization', title: 'Wellness Initiative Launch', impact: 'Medium', recommendation: 'Implement a "Team Member of the Month" bonus to sustain peak motivation indices.' },
    ]
  },
  'Procurement': {
    daily: [
       { id: 'pro-pending-pr', name: 'Pending Purchase Requests', category: 'Procurement', description: 'List of all departmental requisitions awaiting manager or director approval.', generatedAt: 'Real-time' },
       { id: 'pro-unfilled-po', name: 'Unfulfilled Purchase Orders', category: 'Logistics', description: 'Active orders currently past their requested delivery date.', generatedAt: 'Real-time' },
    ],
    weekly: [
       { metric: 'Vendor Lead Time', current: '2.4 days', previous: '2.8 days', variance: '-14.2%', isPositive: true },
       { metric: 'Procurement Cycle Time', current: '4.8h', previous: '5.5h', variance: '-12.7%', isPositive: true },
       { metric: 'Cost Savings Index', current: '8.4%', previous: '7.2%', variance: '+16.7%', isPositive: true },
    ],
    monthly: [
       { title: 'Vendor Audit Summary', content: 'Quality compliance audits for fresh produce vendors passed with zero critical non-conformities.', trend: 'Quality: Standard' },
       { title: 'Supply Chain Risk', content: 'Alternative vendor pathways established for imported beverage lines.', trend: 'Risk: Mitigated' },
    ],
    monthlyStats: [
       { metric: 'PO Fulfillment Rate', current: '96.4%', previous: '92.1%', variance: '+4.3%', isPositive: true },
       { metric: 'Cost Avoidance', current: '$12,450', previous: '$8,200', variance: '+$4,250', isPositive: true },
       { metric: 'Vendor Lead Time', current: '2.2 days', previous: '2.8 days', variance: '-0.6 days', isPositive: true },
    ],
    quarterlyStats: [
       { metric: 'Category Savings', current: '14.2%', previous: '11.8%', variance: '+2.4%', isPositive: true },
       { metric: 'Contract Coverage', current: '88%', previous: '74%', variance: '+14%', isPositive: true },
    ],
    aiRecommendations: [
       { category: 'Cost Reduction', title: 'Volume Contract Negotiation', impact: 'High', recommendation: 'Consolidate paper goods orders into a single 12-month contract for 8% saving.' },
    ]
  }
};



