/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyReportItem {
  id: string;
  name: string;
  category: 'Reception' | 'Reservation' | 'Night Audit' | 'Gift Shop & Supplies';
  description: string;
  generatedAt: string;
}

export const DAILY_REPORTS_LIST: DailyReportItem[] = [
  // Gift Shop & Supplies Reports
  { id: 'rep-gs-sales', name: 'Gift Shop Daily Sales Report', category: 'Gift Shop & Supplies', description: 'Lists aggregate gift shop sales margins, staff metrics, transaction counts, card vs cash vs room charge splits.', generatedAt: 'Auto (23:00 UTC)' },
  { id: 'rep-gs-recon', name: 'Gift Shop Cash Reconciliation Report', category: 'Gift Shop & Supplies', description: 'Tracks cash drawers opening floats, cash sales collected, deposits made, actual vs expected cash variances.', generatedAt: 'Daily Shift End' },
  { id: 'rep-gs-inventory', name: 'Daily Inventory Movement Report', category: 'Gift Shop & Supplies', description: 'Audits physical catalog openings, item arrivals, actual stock sold, write-offs, damages, and remaining stocks.', generatedAt: 'Auto (Night Audit)' },
  { id: 'rep-fo-supplies', name: 'Daily Office Supplies Consumption Report', category: 'Gift Shop & Supplies', description: 'Itemizes papers, cards, printed blanks, and pens distributed to staff, tracking department costs.', generatedAt: 'Auto (08:00 UTC)' },

  // Reception Reports
  { id: 'rep-arr', name: 'Arrival Report', category: 'Reception', description: 'Lists all scheduled reservations arriving today, VIPs, and expected check-in times.', generatedAt: 'Auto (06:00 UTC)' },
  { id: 'rep-dep', name: 'Departure Report', category: 'Reception', description: 'Lists in-house rooms scheduled to check out today, key balances, and group check-outs.', generatedAt: 'Auto (06:00 UTC)' },
  { id: 'rep-inh', name: 'In-House Guest Report', category: 'Reception', description: 'Full manifest of registered, checked-in guests, including names, room details, and stay dates.', generatedAt: 'Real-time' },
  { id: 'rep-vip', name: 'VIP Guest Report', category: 'Reception', description: 'Detailed focus list of high-priority VIP arrivals and active VIP guest rooms for premium service tracking.', generatedAt: 'Real-time' },
  { id: 'rep-avl', name: 'Room Availability Report', category: 'Reception', description: 'Tracks available inventory for walk-ins by room type, physical status (clean/dirty), and OOO locks.', generatedAt: 'Real-time' },
  { id: 'rep-dsc', name: 'Room Discrepancy Report', category: 'Reception', description: 'Audits physical occupancy reports from housekeeping against digital frontdesk reservation logs.', generatedAt: 'Auto (08:00 UTC)' },
  { id: 'rep-nsh', name: 'No-Show Report', category: 'Reception', description: 'Compiled overnight list of missing arrivals from the prior operational cycle for release/booking penalty captures.', generatedAt: 'Auto (Night Audit)' },
  { id: 'rep-eci', name: 'Early Check-In Report', category: 'Reception', description: 'Details guests checked in prior to standard operational hours and the supplementary fees posted.', generatedAt: 'Daily Wrap' },
  { id: 'rep-lco', name: 'Late Check-Out Report', category: 'Reception', description: 'Lists approved checkout extensions, actual exit timestamps, and hourly penalty rates.', generatedAt: 'Daily Wrap' },
  { id: 'rep-lnf', name: 'Lost & Found Report', category: 'Reception', description: 'Active housekeeping ledger containing recovered items, custody locations, and claiming history.', generatedAt: 'Daily Wrap' },
  { id: 'rep-gcr', name: 'Guest Complaint Report', category: 'Reception', description: 'Summarizes all open/unresolved and closed guest negative feedback cases with active resolution SLAs.', generatedAt: 'Real-time' },
  { id: 'rep-nto', name: 'Guest & Reservation Notes Report', category: 'Reception', description: 'Compiles all active reservation notes, guest special requests, and front desk communication logs for operational handover.', generatedAt: 'Real-time' },

  // Reservation Reports
  { id: 'res-pku', name: 'Reservation Pickup Report', category: 'Reservation', description: 'Calculates the volume of bookings made today for future stay periods to track sales pickup rate.', generatedAt: 'Daily Wrap' },
  { id: 'res-fut', name: 'Future Booking Report', category: 'Reservation', description: 'Visualizes booking volume, expected occupancy, and corporate blockings for the next 90 days.', generatedAt: 'Daily Wrap' },
  { id: 'res-can', name: 'Cancellation Report', category: 'Reservation', description: 'Tracks cancelled reservations, cancellation policies applied, and direct revenue loss indices.', generatedAt: 'Daily Wrap' },
  { id: 'res-grp', name: 'Group Reservation Status Report', category: 'Reservation', description: 'Monitors corporate conferences, tour operator blocks, room pickup ratios, and shared master folios.', generatedAt: 'Real-time' },
  { id: 'res-cor', name: 'Corporate Reservation Report', category: 'Reservation', description: 'Calculates contractual reservations volume under active company profiles and contracted discount codes.', generatedAt: 'Daily Wrap' },

  // Night Audit Reports
  { id: 'rep-adj', name: 'Adjustments & Voids Report', category: 'Night Audit', description: 'Lists all voided charges, reversed payments, discounts, rebates, and manual rate overrides posted during the operational day.', generatedAt: 'Auto (Night Audit)' },
  { id: 'rep-tax', name: 'Tax Summary Report', category: 'Night Audit', description: 'Summarizes all tax charges posted for room revenue, F&B, and ancillary services. Includes current date, MTD, and YTD totals.', generatedAt: 'Auto (Night Audit)' },
  { id: 'rep-usr', name: 'User Reconciliation Report', category: 'Night Audit', description: 'Summary of all transactions and payments posted by each front desk user during the selected shift period.', generatedAt: 'Daily Shift End' },
  { id: 'aud-sum', name: 'Night Audit Summary Report', category: 'Night Audit', description: 'Official end-of-day certificate reconciling all hotel room charges and ledger closures.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-rev', name: 'Daily Revenue Report', category: 'Night Audit', description: 'Detailed breakdown of room rate revenues, housekeeping, F&B, gift shop, and transport charge posts.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-cls', name: 'Cashier Closing Report', category: 'Night Audit', description: 'Shift-by-shift balance logs showing opening drawers, payment collections, cash drops, and card settlements.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-crd', name: 'Credit Sales Report', category: 'Night Audit', description: 'Itemizes card collections, invoice drops for approved accounts, and merchant payment fees.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-cty', name: 'City Ledger Report', category: 'Night Audit', description: 'Lists post-checkout invoices transferred to corporate accounts, credit partners, and agency accounts.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-hse', name: 'House Account Report', category: 'Night Audit', description: 'Audits active internal, operations, crew, and complimentary suites room charges posted.', generatedAt: 'Auto (Night Audit)' },
  { id: 'aud-occ', name: 'Occupancy Ledger Report', category: 'Night Audit', description: 'Final statistical book detailing occupancy percentages, average daily rates, and RevPAR outputs.', generatedAt: 'Auto (Night Audit)' }
];

export interface WeeklyComparisonItem {
  metric: string;
  currentWeek: string | number;
  previousWeek: string | number;
  variance: string;
  isPositive: boolean;
}

export const WEEKLY_COMPARATIVE_DATA: WeeklyComparisonItem[] = [
  { metric: 'Occupancy Rate', currentWeek: '78.4%', previousWeek: '74.2%', variance: '+4.2%', isPositive: true },
  { metric: 'Room Revenue', currentWeek: '$34,923', previousWeek: '$31,450', variance: '+11.04%', isPositive: true },
  { metric: 'Ancillary Revenue', currentWeek: '$12,410', previousWeek: '$10,290', variance: '+20.6%', isPositive: true },
  { metric: 'Average Daily Rate (ADR)', currentWeek: '$180.20', previousWeek: '$182.50', variance: '-1.26%', isPositive: false },
  { metric: 'Revenue Per Available Room (RevPAR)', currentWeek: '$141.27', previousWeek: '$135.41', variance: '+4.3%', isPositive: true },
  { metric: 'Booking Source (OTA Share)', currentWeek: '42%', previousWeek: '46%', variance: '-4.0%', isPositive: true }, // less OTA share is positive
  { metric: 'Direct Website Share', currentWeek: '38%', previousWeek: '33%', variance: '+5.0%', isPositive: true },
  { metric: 'Corporate Account Volume', currentWeek: '20%', previousWeek: '21%', variance: '-1.0%', isPositive: false },
  { metric: 'Guest Satisfaction Score', currentWeek: '94 / 100', previousWeek: '91 / 100', variance: '+3.3%', isPositive: true },
  { metric: 'Unresolved Complaints', currentWeek: '2 cases', previousWeek: '6 cases', variance: '-66.7%', isPositive: true },
  { metric: 'Staff Deficit Days', currentWeek: '0 days', previousWeek: '1 day', variance: '-100%', isPositive: true }
];

export interface MonthlyReportSection {
  title: string;
  content: string;
  trend: string;
}

export const MONTHLY_SECTIONS: MonthlyReportSection[] = [
  { 
    title: 'Executive Summary', 
    content: 'The property maintained exceptionally strong operating traction through the current month, showing an encouraging surge in direct-consumer bookings. House operations settled with zero critical safety breaches or cash variances, while housekeeping completed rapid clean turn times post check-outs. Our primary focus is balancing the upcoming seasonal occupancy drop with targeted corporate retreat bundle drives.',
    trend: 'Overall Performance: Elite' 
  },
  { 
    title: 'Occupancy Analysis', 
    content: 'Overall monthly occupancy reached 81.3% (against a budget projection of 75%). Highest utilization was recorded across Suite and Deluxe rooms (92% occupancy), while traditional Single rooms sat at 64% utilization. Housekeeping completed 945 turnarounds with an average inspection score of 98.2%. Recommendation is to maintain promotional upgrades on Double rooms during low mid-week periods.',
    trend: 'Occupancy Variance: +6.3% vs Budget' 
  },
  { 
    title: 'Revenue Analysis', 
    content: 'Cumulative gross operational revenues crossed $142,650, driven heavily by luxury suite tarification and premium spa activities. Ancillary F&B post-to-room charges spiked by 18.2% after introducing in-room QR service menus. Credit collections processed with zero merchant gateway failures. Cash inventory deposits reconciled to the penny.',
    trend: 'Revenue Variance: +12.4% vs Prev Month' 
  },
  { 
    title: 'ADR & RevPAR Analysis', 
    content: 'Average Daily Rate (ADR) solidified at $188.50, slightly lower than projected due to deep corporate group discounts granted in week 2. However, the superior occupancy volume lifted Revenue Per Available Room (RevPAR) to an elite $153.25, surpassing both last month ($140.20) and the previous year same-month baseline ($131.40).',
    trend: 'RevPAR Growth: +16.6% YoY' 
  },
  { 
    title: 'Budget vs Actual', 
    content: 'Aggregated payroll expenses remained 3.2% below budget boundaries due to optimized staffing schedules under dynamic hotel capacity forecasts. Room cleaning chemical expenses spiked by 5% because of supply chain adjustments. The net operating margin (GOP) settled at 34.2%, which is 4.2 points higher than budgeted margins.',
    trend: 'GOP Surplus: +$14,200' 
  },
  { 
    title: 'Booking Source Analysis & Demographics', 
    content: 'Direct digital checkout portal expanded to capture 34% of all bookings, reducing aggregate OTA commissions by nearly $4,100 this month. OTA collections (Booking.com and Expedia) took up a 48% share, while Corporate contracts maintained 18%. Top guest origin demographic remains high-spend domestic travelers (41%), followed by European corporate partners (22%).',
    trend: 'OTA Share: -6.0% (Positive change)' 
  },
  { 
    title: 'Repeat Guest & Guest Satisfaction Analysis', 
    content: 'Our Net Promoter Score (NPS) settled at an extraordinary 95.1/100. Returning loyalty-member counts represented 28.3% of total checked-in guests, validating the personalized check-in greeting protocols implemented last quarter. Guest surveys highlighted high appreciation for express digital checkout procedures.',
    trend: 'Loyalty Returns: +2.1% MoM' 
  },
  { 
    title: 'Complaint & Incident Analysis', 
    content: 'A total of 18 guest complaints were logged this month. 16 cases were fully resolved within our strict 15-minute operational SLA. The remaining 2 cases involved persistent AC issues in Suite 402, which have been completed. Operational risks are fully mitigated; security reported zero perimeter conflicts or guest disputes.',
    trend: 'SLA Fulfillment: 88.8% Resolved in 15m' 
  },
  { 
    title: 'Staff Performance, Attendance & Training', 
    content: 'Front office team attendance registered at 98.4%. Employee productivity metrics tracked average Check-in cycle Times at 2.4 minutes and Check-out cycles at 1.8 minutes. The customer service academy conducted 8 hours of training regarding high-tier customer grievance recovery techniques.',
    trend: 'Customer Gripes SLA: Outstanding' 
  },
  { 
    title: 'Audit Findings, Cash Variances & Risks', 
    content: 'Finance department audited 30 Night Audit packets and confirmed perfect digital ledger postings, room charge synchronizations, and cashier drawer counts. The maximum recorded cashier drawer variance was a negligible $2.10, which was registered and cleared within standard operational bounds. Operational risks remain low.',
    trend: 'Cash Variance: Reconciled' 
  }
];

export interface RecommendationTemplate {
  category: 'Revenue Optimization' | 'Upselling' | 'Occupancy Improvement' | 'Guest Experience' | 'Cost Reduction' | 'Staffing Optimization';
  title: string;
  impact: 'High' | 'Medium';
  recommendation: string;
}

export const AI_RECOMMENDATIONS: RecommendationTemplate[] = [
  {
    category: 'Revenue Optimization',
    title: 'Yield Rate Escalation for Deluxes',
    impact: 'High',
    recommendation: 'Weekend deluxe demand is tracking 35% higher than previous year models. Raise dynamic weekend tariff levels for deluxe room categories by 8% to capture additional consumer surplus without occupancy decay.'
  },
  {
    category: 'Upselling',
    title: 'Pre-Arrival Email Upgrades Automated Trigger',
    impact: 'Medium',
    recommendation: 'Initialize automated triggers in the PMS check-in workflow to offer unsold Suites at a discounted rate ($100 upgrade instead of normal $200 step) 48 hours prior to check-in. Target high-satisfaction guest records first.'
  },
  {
    category: 'Occupancy Improvement',
    title: 'Mid-Week Corporate Workation Bundle',
    impact: 'High',
    recommendation: 'Single and Double room occupancy drops below 45% on Tuesdays and Wednesdays. Partner with local enterprise chambers to pitch mid-week bundles, packing complimentary premium conference room access.'
  },
  {
    category: 'Guest Experience',
    title: 'Luggage-Free Room Checkouts Acceleration',
    impact: 'Medium',
    recommendation: 'A high density of positive guest reviews mention express self-checkout. Introduce contactless baggage tagging at the front door to allow guests to head straight to airport transits while frontdesk dispatches digital folio closing reports.'
  },
  {
    category: 'Cost Reduction',
    title: 'Thermostatic Night Locks configuration',
    impact: 'Medium',
    recommendation: 'Energy costs represent the largest auxiliary hotel expense. Program smart IoT thermostats in Vacant Clean and Out-of-Order rooms to lock into eco temperature boundaries (24°C) automatically via real-time PMS status synchronization.'
  },
  {
    category: 'Staffing Optimization',
    title: 'Dynamic Cleaning Stagger Shifts',
    impact: 'High',
    recommendation: 'Housekeeping peak loads align strictly with double checkout spikes (Saturdays 11:00 to 14:00). Stagger Saturday cleaning rosters into check-out rush shifts with bonus incentives to minimize guest ready-room wait times by 20 mins.'
  }
];

export interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  recipients: string[];
  status: 'Active' | 'Paused';
  nextRun: string;
}

export const DEFAULT_SCHEDULES: ScheduledReport[] = [
  { id: 'sch-001', reportName: 'Daily Front Office Executive Summary', frequency: 'Daily', recipients: [], status: 'Active', nextRun: 'Tonight, 23:55' },
  { id: 'sch-002', reportName: 'Weekly Performance Report & Forecast', frequency: 'Weekly', recipients: [], status: 'Active', nextRun: 'June 7, 2026' },
  { id: 'sch-003', reportName: 'Monthly Management & Variance Review', frequency: 'Monthly', recipients: [], status: 'Active', nextRun: 'June 30, 2026' },
  { id: 'sch-004', reportName: 'City Ledger & Accounts Receivable audit', frequency: 'Daily', recipients: [], status: 'Paused', nextRun: 'Manual Trigger Only' }
];

export interface VersionEntry {
  id: string;
  reportName: string;
  generatedBy: string;
  timestamp: string;
  fileSize: string;
  status: 'Draft' | 'Approved' | 'Sent';
}

export const INSTANT_VERSION_HISTORY: VersionEntry[] = [
  { id: 'ver-829', reportName: 'Daily Front Office Executive Summary (May 31)', generatedBy: 'System Auto (06:00)', timestamp: '2026-05-31 06:00', fileSize: '1.24 MB', status: 'Sent' },
  { id: 'ver-828', reportName: 'Daily Front Office Executive Summary (May 30)', generatedBy: 'Night Auditor Alice', timestamp: '2026-05-30 23:58', fileSize: '1.21 MB', status: 'Approved' },
  { id: 'ver-827', reportName: 'Night Audit Ledger Balance (May 30)', generatedBy: 'Night Auditor Alice', timestamp: '2026-05-30 23:55', fileSize: '2.45 MB', status: 'Approved' },
  { id: 'ver-826', reportName: 'Weekly Performance Analysis (W21 2026)', generatedBy: 'Front Office Mgr Tsige', timestamp: '2026-05-28 14:20', fileSize: '3.82 MB', status: 'Approved' },
  { id: 'ver-825', reportName: 'Monthly Profit & Discrepancies Map (April)', generatedBy: 'System Auto', timestamp: '2026-05-01 00:05', fileSize: '8.40 MB', status: 'Sent' }
];
