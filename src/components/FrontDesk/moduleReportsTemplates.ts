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

export const WEEKLY_COMPARATIVE_DATA: WeeklyComparisonItem[] = [];

export interface MonthlyReportSection {
  title: string;
  content: string;
  trend: string;
}

export const MONTHLY_SECTIONS: MonthlyReportSection[] = [];

export interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  recipients: string[];
  status: 'Active' | 'Paused';
  nextRun: string;
}

export const DEFAULT_SCHEDULES: ScheduledReport[] = [];

export interface VersionEntry {
  id: string;
  reportName: string;
  generatedBy: string;
  timestamp: string;
  fileSize: string;
  status: 'Draft' | 'Approved' | 'Sent';
}

export const INSTANT_VERSION_HISTORY: VersionEntry[] = [];
