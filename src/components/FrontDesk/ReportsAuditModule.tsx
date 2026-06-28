/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { Room, Reservation } from '../../types/erp';
import {
  FileText,
  Calendar,
  CalendarRange,
  DollarSign,
  TrendingUp,
  UserCheck,
  Moon,
  RefreshCw,
  Sliders,
  X,
  Activity,
  Check,
  Plus,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Eye,
  BookOpen,
  ShieldAlert,
  BarChart3,
  PieChart,
  ArrowRight,
  Sparkles,
  Percent,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
  Mail,
  UserCheck2,
  Lock,
  ListCollapse,
  BadgeAlert,
  SlidersHorizontal,
  ChevronRight,
  BrainCircuit,
  Settings,
  MailWarning
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { 
  DAILY_REPORTS_LIST, 
  WEEKLY_COMPARATIVE_DATA, 
  MONTHLY_SECTIONS, 
  DEFAULT_SCHEDULES, 
  INSTANT_VERSION_HISTORY,
  DailyReportItem,
  WeeklyComparisonItem,
  MonthlyReportSection,
  ScheduledReport,
  VersionEntry
} from './moduleReportsTemplates';

import {
  GiftShopSuppliesDashboardWidgets,
  OperationsManagerExecutiveSummarySection,
  GiftShopSuppliesDailyReportRenderer,
  GiftShopSuppliesDeepDiveReview
} from './GiftshopSuppliesReport';

import { DailyOtherReportsRenderer } from './DailyOtherReportsRenderer';
import { NightAuditChecklistModal } from './NightAuditChecklistModal';
import {
  exportReportToPDF,
  exportReportToExcel,
  printReport,
  printElementById,
  ReportDocument,
  ReportSection
} from './reportExportUtils';
import { recordReportVersion, emailReport, createReportSchedule } from './reportApi';

export default function ReportsAuditModule() {
  const {
    rooms,
    reservations,
    guests,
    currentSystemDate,
    runNightAudit,
    auditLogs,
    structuredAuditLogs,
    systemUsers,
    stats,
    formatAmount,
    corporateAccounts
  } = useERP();

  // Primary Workspace tab state
  type TabType = 'dashboard' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'center' | 'alerts';
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Chart view selection for visual trends
  const [activeChartTab, setActiveChartTab] = useState<'occupancy' | 'revenue' | 'adr-revpar' | 'sources' | 'demographics' | 'complaints' | 'cancellations'>('occupancy');

  // Daily reports specific state
  const [searchDailyReport, setSearchDailyReport] = useState('');
  const [selectedReportCategory, setSelectedReportCategory] = useState<'All' | 'Reception' | 'Reservation' | 'Night Audit' | 'Gift Shop & Supplies'>('All');
  const [activeDetailReport, setActiveDetailReport] = useState<DailyReportItem | null>(DAILY_REPORTS_LIST[0]);
  const [showExecutiveSummary, setShowExecutiveSummary] = useState(false);
  const [dailyDateSelectionMode, setDailyDateSelectionMode] = useState<'single' | 'range'>('single');
  const [dailySelectedDate, setDailySelectedDate] = useState<string>('');
  const [dailyStartDate, setDailyStartDate] = useState<string>('');
  const [dailyEndDate, setDailyEndDate] = useState<string>('');

  useEffect(() => {
    if (currentSystemDate) {
      if (!dailySelectedDate) setDailySelectedDate(currentSystemDate);
      if (!dailyStartDate) setDailyStartDate(shiftDate(currentSystemDate, -2));
      if (!dailyEndDate) setDailyEndDate(currentSystemDate);
    }
  }, [currentSystemDate]);

  // Utility to add or subtract days in a safe way
  function shiftDate(baseDateStr: string, days: number): string {
    if (!baseDateStr) return '';
    const dateStr = baseDateStr.trim();
    const d = new Date(dateStr + 'T12:00:00'); // Add standard noon time to avoid timezone drift errors
    if (isNaN(d.getTime())) return baseDateStr;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  const selectedDailyMetrics = useMemo(() => {
    const isDateInSelectedRange = (dateStr: string) => {
      if (!dateStr) return false;
      if (dailyDateSelectionMode === 'single') {
        return dateStr === (dailySelectedDate || currentSystemDate);
      } else {
        const start = dailyStartDate || currentSystemDate;
        const end = dailyEndDate || currentSystemDate;
        return dateStr >= start && dateStr <= end;
      }
    };

    const totalRoomsCount = Math.max(1, rooms.length);
    const oooRooms = rooms.filter(r => r.status === 'Out of Order');
    const sellableRooms = totalRoomsCount - oooRooms.length;

    const occupiedRooms = rooms.filter(r => r.status.includes('Occupied')).length;
    const availableRooms = rooms.filter(r => r.status === 'Vacant Clean').length;

    // Filter arrivals by checkInDate falling in the range:
    const arrivalsToday = reservations.filter(r => 
      isDateInSelectedRange(r.checkInDate) && 
      (r.status === 'Confirmed' || r.status === 'CheckedIn')
    ).length;

    // Filter departures by checkOutDate falling in the range:
    const departuresToday = reservations.filter(r => 
      isDateInSelectedRange(r.checkOutDate) && 
      (r.status === 'CheckedIn' || r.status === 'CheckedOut')
    ).length;

    // Stayovers:
    const stayovers = reservations.filter(r => {
      if (r.status !== 'CheckedIn') return false;
      const targetSingle = dailySelectedDate || currentSystemDate;
      const targetStart = dailyStartDate || currentSystemDate;
      const targetEnd = dailyEndDate || currentSystemDate;
      if (dailyDateSelectionMode === 'single') {
        return r.checkInDate < targetSingle && r.checkOutDate > targetSingle;
      } else {
        return r.checkInDate < targetStart && r.checkOutDate > targetEnd;
      }
    }).length;

    // VIP guests
    const vipGuests = reservations.filter(r => {
      const isVip = r.guestStatus === 'VIP';
      if (!isVip) return false;
      const targetSingle = dailySelectedDate || currentSystemDate;
      const targetStart = dailyStartDate || currentSystemDate;
      const targetEnd = dailyEndDate || currentSystemDate;
      if (dailyDateSelectionMode === 'single') {
        return r.status === 'CheckedIn' || (r.checkInDate === targetSingle && r.status === 'Confirmed');
      } else {
        return r.status === 'CheckedIn' || (r.checkInDate >= targetStart && r.checkInDate <= targetEnd && r.status === 'Confirmed');
      }
    }).length;

    // No shows
    const noShows = reservations.filter(r => 
      r.status === 'Cancelled' && 
      isDateInSelectedRange(r.checkInDate) && 
      (r.notes?.toLowerCase().includes('no-show') || r.notes?.toLowerCase().includes('noshow'))
    ).length;

    // Walk ins
    const walkIns = reservations.filter(r => 
      isDateInSelectedRange(r.checkInDate) && 
      r.notes?.toLowerCase().includes('walk-in')
    ).length;

    // Room Revenue:
    const targetSingle = dailySelectedDate || currentSystemDate;
    const targetStart = dailyStartDate || currentSystemDate;
    const targetEnd = dailyEndDate || currentSystemDate;

    const roomRevenueTotal = reservations
      .filter(r => {
        if (r.status !== 'CheckedIn' || !r.roomNumber) return false;
        if (dailyDateSelectionMode === 'single') {
          return r.checkInDate <= targetSingle && r.checkOutDate >= targetSingle;
        } else {
          return (r.checkInDate <= targetEnd && r.checkOutDate >= targetStart);
        }
      })
      .reduce((sum, r) => sum + r.rate, 0);

    const occupiedCount = reservations.filter(r => {
      if (r.status !== 'CheckedIn' || !r.roomNumber) return false;
      if (dailyDateSelectionMode === 'single') {
        return r.checkInDate <= targetSingle && r.checkOutDate >= targetSingle;
      } else {
        return (r.checkInDate <= targetEnd && r.checkOutDate >= targetStart);
      }
    }).length || occupiedRooms;

    const adrRate = occupiedCount > 0 ? Math.round(roomRevenueTotal / occupiedCount) : 0;

    let dayMultiplier = 1;
    if (dailyDateSelectionMode === 'range') {
      const diffTime = Math.abs(new Date(targetEnd).getTime() - new Date(targetStart).getTime());
      dayMultiplier = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
    const finalSellable = sellableRooms * dayMultiplier;
    const revParRate = finalSellable > 0 ? Math.round(roomRevenueTotal / finalSellable) : 0;

    const guestSatisfactionScore = 0;
    const openComplaintsCount = 0;
    const pendingMaintenanceCount = oooRooms.length;
    const staffOnDutyCount = 0;

    return {
      totalRoomsCount,
      oooRoomsCount: oooRooms.length,
      sellableRooms,
      occupiedRooms: occupiedCount,
      availableRooms: Math.max(0, totalRoomsCount - occupiedCount - oooRooms.length),
      occupancyRate: Math.min(100, finalSellable > 0 ? Math.round((occupiedCount / finalSellable) * 105) : 0),
      arrivalsToday,
      departuresToday,
      stayovers,
      vipGuests,
      noShows,
      walkIns,
      roomRevenueTotal,
      adrRate,
      revParRate,
      guestSatisfactionScore: parseFloat(Math.min(100, Math.max(50, guestSatisfactionScore)).toFixed(1)),
      openComplaintsCount,
      pendingMaintenanceCount,
      staffOnDutyCount
    };
  }, [rooms, reservations, guests, dailyDateSelectionMode, dailySelectedDate, dailyStartDate, dailyEndDate, currentSystemDate]);

  // Weekly forecast states
  const [weeklyViewWeek, setWeeklyViewWeek] = useState('Current Week');

  // Monthly variance comparison selectors
  const [monthlyCompareBaseline, setMonthlyCompareBaseline] = useState<'prev-month' | 'same-month-yoy' | 'budget'>('prev-month');

  // Strategic modules state
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [customStrategicNote, setCustomStrategicNote] = useState('');
  const [currentAiRecommendations, setCurrentAiRecommendations] = useState<any[]>([]);

  // Distribution Center interactive state
  const [scheduledSchedules, setScheduledSchedules] = useState<ScheduledReport[]>(DEFAULT_SCHEDULES);
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>(INSTANT_VERSION_HISTORY);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  
  // Schedule creation form state
  const [newScheduleName, setNewScheduleName] = useState('No data');
  const [newScheduleFreq, setNewScheduleFreq] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [newScheduleEmail, setNewScheduleEmail] = useState('');

  // Email distribution lists
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState('');

  // Night audit confirm action popup
  const [showAuditConfirm, setShowAuditConfirm] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState<{ success: boolean; date: string; message: string; revenuePosted: number } | null>(null);

  // Exception log persistence (synced to storage / future DB)
  const [auditExceptionsLog, setAuditExceptionsLog] = useState<{ id: number; text: string; owner: string; loggedAt: string }[]>([]);

  // Export action cues
  const [exportTrigger, setExportTrigger] = useState<{ type: 'PDF' | 'Excel' | 'Email' | 'Print'; reportName: string } | null>(null);
  const [exportFeedback, setExportFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const downloadBlob = (content: string, mime: string, filename: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Assemble a contextual, multi-section report document based on the active tab.
  const buildReportDocument = (name: string): ReportDocument => {
    const sections: ReportSection[] = [];

    // Helper for daily date-range filtering
    const isInDailyRange = (dateStr: string) => {
      if (!dateStr) return false;
      if (dailyDateSelectionMode === 'single') {
        return dateStr === (dailySelectedDate || currentSystemDate);
      }
      const start = dailyStartDate || currentSystemDate;
      const end = dailyEndDate || currentSystemDate;
      return dateStr >= start && dateStr <= end;
    };

    // 1. KPI snapshot (always included)
    sections.push({
      title: 'Operational KPI Snapshot',
      columns: ['Metric', 'Value'],
      rows: [
        ['Occupancy Rate', `${metrics.occupancyRate}%`],
        ['Sellable Rooms', metrics.sellableRooms],
        ['Occupied Rooms', metrics.occupiedRooms],
        ['Available Rooms', metrics.availableRooms],
        ['Out of Order', metrics.oooRoomsCount],
        ['Arrivals Today', metrics.arrivalsToday],
        ['Departures Today', metrics.departuresToday],
        ['Stayovers', metrics.stayovers],
        ['VIP Guests', metrics.vipGuests],
        ['No Shows', metrics.noShows],
        ['Walk-ins', metrics.walkIns],
        ['Room Revenue', formatAmount(metrics.roomRevenueTotal)],
        ['ADR', formatAmount(metrics.adrRate)],
        ['RevPAR', formatAmount(metrics.revParRate)],
        ['Guest Satisfaction', `${metrics.guestSatisfactionScore}%`],
        ['Open Complaints', metrics.openComplaintsCount],
        ['Pending Maintenance', metrics.pendingMaintenanceCount],
        ['Staff On Duty', metrics.staffOnDutyCount]
      ]
    });

    // === DASHBOARD-SPECIFIC: 10-day trends + charts summary ===
    if (activeTab === 'dashboard') {
      sections.push({
        title: '10-Day Performance Trends',
        columns: ['Day', 'Occupancy %', 'Room Revenue', 'Ancillary', 'Total Revenue', 'ADR', 'RevPAR', 'Satisfaction', 'Noise', 'WiFi', 'HVAC', 'Cancellations'],
        rows: timelineData.map(d => [
          d.dateLabel, d.Occupancy, d.RoomRevenue, d.AncillaryRevenue, d.TotalRevenue,
          d.ADR, d.RevPAR, d.Satisfaction, d.NoiseComplaints, d.WifiComplaints, d.HvacComplaints, d.Cancellations
        ])
      });
      sections.push({
        title: 'Booking Channel Mix',
        columns: ['Channel', 'Share %'],
        rows: [
          ['No data', '0%'],
          ['No data', '0%'],
          ['No data', '0%'],
          ['No data', '0%'],
          ['No data', '0%']
        ]
      });
    }

    // === DAILY-SPECIFIC: actual filtered reservation / room data ===
    if (activeTab === 'daily' && activeDetailReport) {
      sections.push({
        title: `Daily Report - ${activeDetailReport.name}`,
        columns: ['Field', 'Detail'],
        rows: [
          ['Report Category', activeDetailReport.category],
          ['Report ID', activeDetailReport.id],
          ['Business Date', dailyDateSelectionMode === 'single' ? (dailySelectedDate || currentSystemDate) : `${dailyStartDate} → ${dailyEndDate}`],
          ['Description', activeDetailReport.description || '—']
        ]
      });

      const reportId = activeDetailReport.id;

      if (reportId === 'rep-arr') {
        const rows = reservations
          .filter(r => isInDailyRange(r.checkInDate) && (r.status === 'Confirmed' || r.status === 'CheckedIn'))
          .map(r => [r.id, r.guestName, r.roomType || 'Standard', r.roomNumber || 'Not Assigned', r.status, r.estimatedArrival || 'TBD']);
        sections.push({
          title: 'Today Scheduled Arrival Manifest',
          columns: ['Booking ID', 'Guest Name', 'Room Type', 'Room', 'Status', 'ETA'],
          rows: rows.length ? rows : [['—', 'No arrivals scheduled for the selected period.', '', '', '', '']]
        });
      }

      if (reportId === 'rep-dep') {
        const rows = reservations
          .filter(r => isInDailyRange(r.checkOutDate) && (r.status === 'CheckedIn' || r.status === 'CheckedOut'))
          .map(r => [r.roomNumber || '-', r.guestName, r.checkOutDate, r.status]);
        sections.push({
          title: 'Scheduled Departure Manifest',
          columns: ['Room', 'Guest Name', 'Checkout Date', 'Status'],
          rows: rows.length ? rows : [['—', 'No departures scheduled.', '', '']]
        });
      }

      if (reportId === 'rep-inh') {
        const rows = reservations
          .filter(r => r.status === 'CheckedIn')
          .map(r => [r.roomNumber || '-', r.guestName, r.roomType || 'Standard', r.checkInDate, r.checkOutDate]);
        sections.push({
          title: 'In-House Stay Master Manifest',
          columns: ['Room', 'Primary Guest', 'Room Type', 'Arrival', 'Departure'],
          rows: rows.length ? rows : [['—', 'No in-house guests.', '', '', '']]
        });
      }

      if (reportId === 'rep-vip') {
        const rows = reservations
          .filter(r => r.guestStatus === 'VIP' && (r.status === 'CheckedIn' || r.status === 'Confirmed'))
          .map(r => [r.id, r.guestName, r.roomNumber || '-', r.roomType || 'Standard', r.status]);
        sections.push({
          title: 'VIP Guest Focus List',
          columns: ['Booking ID', 'Guest Name', 'Room', 'Room Type', 'Status'],
          rows: rows.length ? rows : [['—', 'No VIP entries.', '', '', '']]
        });
      }

      if (reportId === 'rep-ava') {
        const rows = rooms.map(r => [r.number, r.type, r.status, r.floor || '-']);
        sections.push({
          title: 'Room Availability Status',
          columns: ['Room', 'Type', 'Status', 'Floor'],
          rows
        });
      }

      if (reportId === 'res-cor') {
        const rows = reservations
          .filter(r => r.corporateAccountId || r.notes?.toLowerCase().includes('corporate'))
          .map(r => [r.id, r.guestName, r.corporateAccountId || 'Direct', r.status]);
        sections.push({
          title: 'Corporate Reservation Manifest',
          columns: ['Booking ID', 'Guest Name', 'Corp Account', 'Status'],
          rows: rows.length ? rows : [['—', 'No corporate reservations.', '', '']]
        });
      }

      // Gift Shop & Supplies reports
      if (reportId === 'rep-gs-sales') {
        sections.push({
          title: 'Gift Shop Daily Sales Summary',
          columns: ['Metric', 'Value'],
          rows: [
            ['Total Daily Sales', '$0'],
            ['Transactions Volume', '0 sales'],
            ['Average Transaction Value', '$0'],
            ['Total Gross Margin', '$0'],
            ['Net Profit Level', '0%']
          ]
        });
        sections.push({
          title: 'Payments Distribution',
          columns: ['Method', 'Amount', 'Share'],
          rows: [
            ['Cash Payments', '$0', '0%'],
            ['Credit/Debit Cards', '$0', '0%'],
            ['Room Charges Posted', '$0', '0%'],
            ['Discounts Granted', '$0', '0 claims'],
            ['Refunds Processed', '$0', '0 vouchers']
          ]
        });
        sections.push({
          title: 'Sales Revenue by Staff On-Duty',
          columns: ['Staff', 'Role', 'Sales', 'Transactions'],
          rows: [
            ['No staff data available', '--', '--', '--']
          ]
        });
        sections.push({
          title: 'Top Selling Items',
          columns: ['Product', 'Units Sold', 'Revenue'],
          rows: [
            ['No sales data available', '--', '--']
          ]
        });
        sections.push({
          title: 'Slow Moving Items (Action Needed)',
          columns: ['Product', 'Rate', 'Recommendation'],
          rows: [
            ['No inventory data available', '--', '--']
          ]
        });
      }

      if (reportId === 'rep-gs-recon') {
        sections.push({
          title: 'Register Drawer Reconciliation',
          columns: ['Item', 'System', 'Physical', 'Variance'],
          rows: [
            ['Opening Cash Float', '$0.00', '$0.00', '$0.00'],
            ['Recorded Cash Sales', '$0.00', '$0.00', '$0.00'],
            ['Cash Refunds', '$0.00', '$0.00', '$0.00'],
            ['Expected Balance', '$0.00', '$0.00', '$0.00 (Balanced)'],
            ['Deposit to Safe', '$0.00', '$0.00', '$0.00'],
            ['Closing Cash Float', '$0.00', '$0.00', '$0.00']
          ]
        });
      }

      if (reportId === 'rep-gs-inventory') {
        sections.push({
          title: 'Gift Shop Inventory Movement',
          columns: ['Product', 'Opening', 'Sold', 'Damaged', 'Closing'],
          rows: [
            ['No inventory data available', '--', '--', '--', '--']
          ]
        });
      }

      if (reportId === 'rep-fo-supplies') {
        sections.push({
          title: 'Office Supplies Consumption',
          columns: ['Item', 'Staff', 'Department', 'Qty', 'Cost', 'Remaining'],
          rows: [
            ['No supplies data available', '--', '--', '--', '--', '--']
          ]
        });
        sections.push({
          title: 'Consumption Summary',
          columns: ['Metric', 'Value'],
          rows: [
            ['Total Daily Consumption Cost', '$0'],
            ['Departments Active', '0'],
            ['Staff Members Issued', '0'],
            ['Total Items Consumed', '0']
          ]
        });
      }
    }

    // === WEEKLY-SPECIFIC: variance + pickup pace + productivity ===
    if (activeTab === 'weekly') {
      sections.push({
        title: 'Weekly Performance vs Prior Week',
        columns: ['Metric', 'This Week', 'Last Week', 'Variance'],
        rows: getComparativeMetrics.weekly.map(c => [c.metric, c.current, c.previous, c.variance])
      });
      const weeklyCorps = getTopCorporatesAndNationalities.weekly;
      sections.push({
        title: 'Weekly Top Corporates',
        columns: ['Company', 'Bookings', 'Nights', 'Spend'],
        rows: weeklyCorps.corporates.map(c => [c.companyName, c.bookings, c.roomNights, formatAmount(c.revenue)])
      });
      sections.push({
        title: 'Weekly Guest Demographics',
        columns: ['Nationality', 'Guests', 'Nights', 'Spend Share'],
        rows: weeklyCorps.nationalities.map(n => [n.nationality, n.guests, n.nights, formatAmount(n.spend)])
      });
      sections.push({
        title: '30-Day Occupancy Forecast',
        columns: ['Period', 'Occupancy %', 'Status'],
        rows: [
          ['Next 1-7 Days', '0%', 'No data'],
          ['Next 8-14 Days', '0%', 'No data'],
          ['Next 15-21 Days', '0%', 'No data'],
          ['Next 22-30 Days', '0%', 'No data']
        ]
      });
      sections.push({
        title: 'Weekly Booking Pick-Up Pace',
        columns: ['Day', 'Current Week Bookings', 'Previous Week Bookings'],
        rows: pickupPaceData.weekly.map(d => [d.name, d.current, d.previous])
      });
      sections.push({
        title: 'Staff Productivity & Attendance',
        columns: ['Metric', 'Value'],
        rows: [
          ['Attendance Rate', '0%'],
          ['Average Check-in Duration', '0 min'],
          ['Average Check-out Duration', '0 min'],
          ['Overtime Incidents', '0'],
          ['Front Desk Shifts', 'No data'],
          ['Staff Deficits', 'No data']
        ]
      });
    }

    // === MONTHLY-SPECIFIC: KPIs + pickup pace + variance + narratives ===
    if (activeTab === 'monthly') {
      sections.push({
        title: 'Monthly KPI Overview',
        columns: ['Metric', 'Value', 'Context'],
        rows: [
          ['Monthly Occupancy', '0%', 'No data'],
          ['Average Daily Rate', '$0', 'No data'],
          ['Revenue Per Room', '$0', 'No data'],
          ['Direct Bookings', '0%', 'No data']
        ]
      });
      sections.push({
        title: 'Monthly Performance vs Prior Month',
        columns: ['Metric', 'This Month', 'Previous Month', 'Variance'],
        rows: getComparativeMetrics.monthly.map(c => [c.metric, c.current, c.previous, c.variance])
      });
      sections.push({
        title: 'Monthly Booking Pick-Up Pace',
        columns: ['Week', 'Current Month', 'Previous Month'],
        rows: pickupPaceData.monthly.map(d => [d.name, d.current, d.previous])
      });
      const monthlyCorps = getTopCorporatesAndNationalities.monthly;
      sections.push({
        title: 'Monthly Top Corporates',
        columns: ['Company', 'Bookings', 'Nights', 'Spend'],
        rows: monthlyCorps.corporates.map(c => [c.companyName, c.bookings, c.roomNights, formatAmount(c.revenue)])
      });
      sections.push({
        title: 'Monthly Guest Demographics',
        columns: ['Nationality', 'Guests', 'Nights', 'Spend Share'],
        rows: monthlyCorps.nationalities.map(n => [n.nationality, n.guests, n.nights, formatAmount(n.spend)])
      });
      sections.push({
        title: 'Monthly Managerial Review',
        columns: ['Section', 'Trend', 'Narrative'],
        rows: MONTHLY_SECTIONS.map(s => [s.title, s.trend, s.content])
      });
    }

    // === QUARTERLY-SPECIFIC: variance + strategic recommendations ===
    if (activeTab === 'quarterly') {
      sections.push({
        title: 'Quarterly Performance vs Prior Quarter',
        columns: ['Metric', 'This Quarter', 'Previous Quarter', 'Variance'],
        rows: getComparativeMetrics.quarterly.map(c => [c.metric, c.current, c.previous, c.variance])
      });
      const quarterlyCorps = getTopCorporatesAndNationalities.quarterly;
      sections.push({
        title: 'Quarterly Top Corporates',
        columns: ['Company', 'Bookings', 'Nights', 'Spend'],
        rows: quarterlyCorps.corporates.map(c => [c.companyName, c.bookings, c.roomNights, formatAmount(c.revenue)])
      });
      sections.push({
        title: 'Quarterly Guest Demographics',
        columns: ['Nationality', 'Guests', 'Nights', 'Spend Share'],
        rows: quarterlyCorps.nationalities.map(n => [n.nationality, n.guests, n.nights, formatAmount(n.spend)])
      });
      sections.push({
        title: 'Strategic Recommendations',
        columns: ['Category', 'Title', 'Impact', 'Recommendation'],
        rows: currentAiRecommendations.map((r: any) => [r.category, r.title, r.impact, r.recommendation])
      });
    }

    // === CENTER-SPECIFIC: schedules + version history ===
    if (activeTab === 'center') {
      sections.push({
        title: 'Distribution Schedules',
        columns: ['Report', 'Frequency', 'Recipients', 'Status', 'Next Run'],
        rows: scheduledSchedules.map(s => [s.reportName, s.frequency, s.recipients.join(', '), s.status, s.nextRun])
      });
      sections.push({
        title: 'Version History',
        columns: ['Report', 'Generated By', 'Timestamp', 'Size', 'Status'],
        rows: versionHistory.slice(0, 20).map(v => [v.reportName, v.generatedBy, v.timestamp, v.fileSize, v.status])
      });
    }

    // === ALERTS-SPECIFIC: all alerts + exceptions ===
    if (activeTab === 'alerts') {
      sections.push({
        title: 'All SLA Alerts',
        columns: ['Status', 'Severity', 'Alert', 'Description'],
        rows: alertsEvaluated.map(a => [a.triggered ? 'TRIGGERED' : 'OK', a.severity, a.title, a.description])
      });
    }

    // 3. Active SLA alerts (for non-alerts tabs, include only triggered)
    if (activeTab !== 'alerts') {
      const triggered = alertsEvaluated.filter(a => a.triggered);
      if (triggered.length > 0) {
        sections.push({
          title: 'Active SLA Alerts',
          columns: ['Severity', 'Alert', 'Description'],
          rows: triggered.map(a => [a.severity, a.title, a.description])
        });
      }
    }

    // 4. Night audit exceptions log
    if (auditExceptionsLog.length > 0) {
      sections.push({
        title: 'Night Audit Exceptions',
        columns: ['#', 'Owner', 'Description', 'Logged At'],
        rows: auditExceptionsLog.map((ex, i) => [i + 1, ex.owner, ex.text, new Date(ex.loggedAt).toLocaleString()])
      });
    }

    return {
      reportName: name,
      businessDate: currentSystemDate,
      propertyName: 'SELEDA Hotel ERP',
      sections
    };
  };

  // Append a version entry locally (immediate UI feedback + offline persistence).
  const addLocalVersion = (name: string, status: VersionEntry['status'], generatedBy?: string) => {
    const entry: VersionEntry = {
      id: `ver-${Date.now()}`,
      reportName: `${name} (${currentSystemDate})`,
      generatedBy: generatedBy || 'Front Office Export',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      fileSize: '0 KB',
      status
    };
    setVersionHistory(prev => [entry, ...prev]);
  };

  // Resolve recipients for a report: prefer matching active schedule, else full list.
  const resolveRecipients = (name: string): string[] => {
    const match = scheduledSchedules.find(
      s => s.status === 'Active' && s.reportName.toLowerCase().includes(name.toLowerCase())
    );
    if (match && match.recipients.length > 0) return match.recipients;
    return emailList;
  };

  const handleExport = async (type: 'PDF' | 'Excel' | 'Email', name: string) => {
    const doc = buildReportDocument(name);

    if (type === 'Excel') {
      exportReportToExcel(doc);
      addLocalVersion(name, 'Draft');
      recordReportVersion({ reportName: `${name} (XLSX)`, fileSize: '0 KB', status: 'Draft' });
    } else if (type === 'PDF') {
      exportReportToPDF(doc);
      addLocalVersion(name, 'Draft');
      recordReportVersion({ reportName: `${name} (PDF)`, fileSize: '0 KB', status: 'Draft' });
    } else if (type === 'Email') {
      const recipients = resolveRecipients(name);
      const summary = doc.sections
        .map(s => `${s.title}: ${s.rows.length} rows`)
        .join(' | ');
      const result = await emailReport({ reportName: name, recipients, fileSize: '0 KB', summary });
      addLocalVersion(name, 'Sent');
      setExportFeedback({
        ok: result.success,
        message: result.message + (recipients.length ? ` → ${recipients.join(', ')}` : '')
      });
      setTimeout(() => setExportFeedback(null), 4000);
    }
  };

  const triggerExport = (type: 'PDF' | 'Excel' | 'Email', name: string) => {
    setExportTrigger({ type, reportName: name });
    void handleExport(type, name);
    setTimeout(() => {
      setExportTrigger(null);
    }, 1800);
  };

  const triggerPrint = (name: string, sectionId?: string) => {
    setExportTrigger({ type: 'Print', reportName: name });
    if (sectionId) {
      printElementById(sectionId, name);
    } else {
      // fallback: print the whole page contextually
      printElementById('reports-audit-module-root', name);
    }
    setTimeout(() => setExportTrigger(null), 1800);
  };

  const handleLogExceptions = (items: Array<{ id: number; text: string; owner: string; loggedAt?: string }>) => {
    const now = new Date().toISOString();
    setAuditExceptionsLog(items.map(i => ({ ...i, loggedAt: i.loggedAt || now })));
  };

  const handleResolveFolio = (reservationId: string) => {
    setShowAuditConfirm(false);
    setActiveTab('daily');
    setSelectedReportCategory('Reservation');
    setActiveDetailReport(DAILY_REPORTS_LIST.find(r => r.id === 'rep-inh') || DAILY_REPORTS_LIST[0]);
    setSearchDailyReport(reservationId);
  };

  const handleResolveRoomStatus = (roomNumber?: string) => {
    setShowAuditConfirm(false);
    setActiveTab('daily');
    setSelectedReportCategory('Reception');
    setActiveDetailReport(DAILY_REPORTS_LIST.find(r => r.id === 'rep-dsc') || DAILY_REPORTS_LIST[0]);
    if (roomNumber) setSearchDailyReport(roomNumber);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSchedules = localStorage.getItem('erp_report_schedules');
    const savedVersions = localStorage.getItem('erp_report_versions');
    const savedExceptions = localStorage.getItem('erp_audit_exceptions');
    if (savedSchedules) {
      try { setScheduledSchedules(JSON.parse(savedSchedules)); } catch (e) { console.warn(e); }
    }
    if (savedVersions) {
      try { setVersionHistory(JSON.parse(savedVersions)); } catch (e) { console.warn(e); }
    }
    if (savedExceptions) {
      try { setAuditExceptionsLog(JSON.parse(savedExceptions)); } catch (e) { console.warn(e); }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('erp_report_schedules', JSON.stringify(scheduledSchedules));
  }, [scheduledSchedules]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('erp_report_versions', JSON.stringify(versionHistory));
  }, [versionHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('erp_audit_exceptions', JSON.stringify(auditExceptionsLog));
  }, [auditExceptionsLog]);

  // -------------------------------------------------------------
  // REAL-TIME OPERATIONAL METRICS CALCULATION (DB BACKED)
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalRoomsCount = Math.max(1, rooms.length);
    const oooRooms = rooms.filter(r => r.status === 'Out of Order');
    const sellableRooms = totalRoomsCount - oooRooms.length;

    const occupiedRooms = rooms.filter(r => r.status.includes('Occupied')).length;
    const availableRooms = rooms.filter(r => r.status === 'Vacant Clean').length;

    const occupancyRate = sellableRooms > 0 ? Math.round((occupiedRooms / sellableRooms) * 100) : 0;

    // Today's expected arrivals
    const arrivalsToday = reservations.filter(r => 
      r.checkInDate === currentSystemDate && 
      (r.status === 'Confirmed' || r.status === 'CheckedIn')
    ).length;

    // Today's expected departures
    const departuresToday = reservations.filter(r => 
      r.checkOutDate === currentSystemDate && 
      (r.status === 'CheckedIn' || r.status === 'CheckedOut')
    ).length;

    // Stayovers
    const stayovers = reservations.filter(r => 
      r.status === 'CheckedIn' && 
      r.checkInDate < currentSystemDate && 
      r.checkOutDate > currentSystemDate
    ).length;

    // VIP guests in house or arriving today
    const vipGuests = reservations.filter(r => 
      (r.status === 'CheckedIn' || (r.checkInDate === currentSystemDate && r.status === 'Confirmed')) && 
      r.guestStatus === 'VIP'
    ).length;

    // No shows: priors that did not show up or cancelled specifically on system date with no-show tags
    const noShows = reservations.filter(r => 
      r.status === 'Cancelled' && 
      r.checkInDate === currentSystemDate && 
      (r.notes?.toLowerCase().includes('no-show') || r.notes?.toLowerCase().includes('noshow'))
    ).length;

    // Walk ins
    const walkIns = reservations.filter(r => 
      r.checkInDate === currentSystemDate && 
      r.notes?.toLowerCase().includes('walk-in')
    ).length;

    // Real Room Revenue calculation based on checked-in rates
    const roomRevenueTotal = reservations
      .filter(r => r.status === 'CheckedIn' && r.roomNumber)
      .reduce((sum, r) => sum + r.rate, 0);

    // ADR
    const adrRate = occupiedRooms > 0 ? Math.round(roomRevenueTotal / occupiedRooms) : 0;

    // RevPAR
    const revParRate = sellableRooms > 0 ? Math.round(roomRevenueTotal / sellableRooms) : 0;

    // Guest Experience static indexes with variable micro drifts
    const guestSatisfactionScore = 0;
    const openComplaintsCount = 0;
    const pendingMaintenanceCount = oooRooms.length;
    const staffOnDutyCount = 0;

    return {
      totalRoomsCount,
      oooRoomsCount: oooRooms.length,
      sellableRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
      arrivalsToday,
      departuresToday,
      stayovers,
      vipGuests,
      noShows,
      walkIns,
      roomRevenueTotal,
      adrRate,
      revParRate,
      guestSatisfactionScore: parseFloat(guestSatisfactionScore.toFixed(1)),
      openComplaintsCount,
      pendingMaintenanceCount,
      staffOnDutyCount
    };
  }, [rooms, reservations, currentSystemDate]);

  // -------------------------------------------------------------
  // DYNAMIC COMPILATION OF CORPORATE ACCOUNTS & GUEST NATIONALITIES
  // -------------------------------------------------------------
  const getTopCorporatesAndNationalities = useMemo(() => {
    // Generate base mapping from actual database
    const emailToNationality = new Map<string, string>();
    guests.forEach(g => {
      if (g.email && g.nationality) {
        emailToNationality.set(g.email.toLowerCase(), g.nationality);
      }
    });

    const nameToNationality = new Map<string, string>();
    reservations.forEach(r => {
      const guestObj = guests.find(g => 
        g.name.toLowerCase() === r.guestName.toLowerCase() || 
        g.email.toLowerCase() === r.guestEmail.toLowerCase()
      );
      if (guestObj?.nationality) {
        nameToNationality.set(r.guestName, guestObj.nationality);
      }
    });

    const calculateForTimeframe = (timeframe: 'weekly' | 'monthly' | 'quarterly') => {
      let multiplier = 1;
      let randomDrift = 1.0;
      if (timeframe === 'weekly') {
        multiplier = 1;
        randomDrift = 0.95;
      } else if (timeframe === 'monthly') {
        multiplier = 4.3;
        randomDrift = 1.05;
      } else if (timeframe === 'quarterly') {
        multiplier = 12.8;
        randomDrift = 1.15;
      }

      // 1. Corporate Accounts
      const corpStatsMap = new Map<string, { companyName: string; bookings: number; roomNights: number; revenue: number; discountPercent: number }>();
      
      // Initialize with our database's corporate accounts
      corporateAccounts.forEach(acc => {
        const bookings = Math.round((acc.activeBookings || 2) * multiplier);
        const nights = Math.round(bookings * 2.8 * randomDrift);
        const revenue = Math.round(nights * 165 * (1 - acc.discountPercent / 100));
        corpStatsMap.set(acc.companyName, {
          companyName: acc.companyName,
          bookings,
          roomNights: nights,
          revenue,
          discountPercent: acc.discountPercent
        });
      });


      const sortedCorps = Array.from(corpStatsMap.values()).sort((a, b) => b.revenue - a.revenue);

      // 2. Nationalities
      const natCounts = new Map<string, { guestCount: number; roomNights: number; revenue: number }>();

      reservations.forEach(r => {
        let nat = nameToNationality.get(r.guestName) || emailToNationality.get(r.guestEmail.toLowerCase());
        if (!nat) {
          nat = 'Unknown';
        }

        const nights = Math.max(1, Math.round((new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
        const statsObj = natCounts.get(nat) || { guestCount: 0, roomNights: 0, revenue: 0 };
        
        statsObj.guestCount += 1;
        statsObj.roomNights += r.status === 'Cancelled' ? 0 : nights;
        statsObj.revenue += r.status === 'Cancelled' ? 0 : r.totalAmount || (r.rate * nights);

        natCounts.set(nat, statsObj);
      });

      // Scale and add nationalities
      const finalNationalities = Array.from(natCounts.entries()).map(([nat, statsObj]) => {
        const guestCount = Math.round(statsObj.guestCount * multiplier * randomDrift);
        const roomNights = Math.round(statsObj.roomNights * multiplier * randomDrift);
        const revenue = Math.round(statsObj.revenue * multiplier * randomDrift);
        
        return {
          nationality: nat,
          guestCount,
          roomNights,
          revenue
        };
      }).sort((a, b) => b.revenue - a.revenue);

      return {
        corporates: sortedCorps,
        nationalities: finalNationalities
      };
    };

    return {
      weekly: calculateForTimeframe('weekly'),
      monthly: calculateForTimeframe('monthly'),
      quarterly: calculateForTimeframe('quarterly')
    };
  }, [reservations, guests, corporateAccounts]);

  // -------------------------------------------------------------
  // DYNAMIC GENERATION OF METRIC COMPARISONS & PERIOD VARIANCES
  // -------------------------------------------------------------
  const getComparativeMetrics = useMemo(() => {
    const currentOOO = rooms.filter(r => r.status === 'Out of Order').length;
    const currentDirty = rooms.filter(r => r.status.includes('Dirty')).length;
    const currentSellable = rooms.length - currentOOO;
    const currentGuests = guests.length + reservations.filter(r => r.status === 'CheckedIn').length;
    
    const activeOccupancy = metrics.occupancyRate;
    const activeRevenue = metrics.roomRevenueTotal;
    const activeADR = metrics.adrRate;
    const activeRevPAR = metrics.revParRate;
    const activeSatisfaction = metrics.guestSatisfactionScore;

    const buildTable = (timeframe: 'weekly' | 'monthly' | 'quarterly', baseline?: 'prev-month' | 'same-month-yoy' | 'budget') => {
      let mult = 1;
      let driftRev = 1.0;
      let driftOcc = 1.0;

      if (timeframe === 'weekly') {
        mult = 1;
        driftRev = 0.91; 
        driftOcc = 0.95; 
      } else if (timeframe === 'monthly') {
        mult = 4.3;
        // Adjust drift based on baseline for monthly comparisons
        if (baseline === 'same-month-yoy') {
          driftRev = 0.82; // YoY typically shows more growth
          driftOcc = 0.87;
        } else if (baseline === 'budget') {
          driftRev = 0.92; // Budget is usually tighter
          driftOcc = 0.95;
        } else {
          driftRev = 0.88; // Default prev-month
          driftOcc = 0.93;
        }
      } else if (timeframe === 'quarterly') {
        mult = 12.8;
         driftRev = 0.85;
        driftOcc = 0.90;
      }

      // 1. Occupancy Rate
      const occCurrent = activeOccupancy || 0;
      const occPrev = 0;
      const occVar = 0;
      const occVarStr = '0%';

      // 2. Room Revenue
      const revCurrent = activeRevenue ? Math.round(activeRevenue * mult) : 0;
      const revPrev = 0;
      const revVarPct = 0;
      const revVarStr = '0%';

      // 3. Ancillary Revenue
      const ancCurrent = 0;
      const ancPrev = 0;
      const ancVarPct = 0;
      const ancVarStr = '0%';

      // 4. Average Daily Rate (ADR)
      const adrCurrent = activeADR || 0;
      const adrPrev = 0; 
      const adrVarPct = 0;
      const adrVarStr = '0%';

      // 5. Revenue Per Available Room (RevPAR)
      const revparCurrent = activeRevPAR || 0;
      const revparPrev = 0;
      const revparVarPct = 0;
      const revparVarStr = '0%';

      // 6. Booking Source (OTA Share)
      const otaCurrent = 0;
      const otaPrev = 0;
      const otaVar = 0;
      const otaVarStr = '0%'; 

      // 7. Direct Website Share
      const dirCurrent = 0;
      const dirPrev = 0;
      const dirVar = 0;
      const dirVarStr = '0%';

      // 8. Corporate Account Volume
      const corpCurrent = 0;
      const corpPrev = 0;
      const corpVar = '0%';

      // 9. Guest Satisfaction Score
      const satCurrent = activeSatisfaction || 0;
      const satPrev = 0;
      const satVar = 0;
      const satVarStr = '0%';

      // 10. Total Guests
      const guestsCurrent = Math.round(currentGuests * mult);
      const guestsPrev = 0;
      const guestsVarPct = 0;
      const guestsVarStr = '0%';

      // 11. Total Available Rooms
      const availCurrent = currentSellable;
      const availPrev = currentSellable;
      const availVar = 0;
      const availVarStr = '0';

      // 12. Out Of Order (OOO) Rooms
      const oooCurrent = currentOOO;
      const oooPrev = currentOOO;
      const oooVar = 0;
      const oooVarStr = '0'; 

      // 13. Out of Service (OOS) Rooms
      const oosCurrent = currentDirty;
      const oosPrev = currentDirty;
      const oosVar = 0;
      const oosVarStr = '0'; 

      return [
        { metric: 'Occupancy Rate', current: `${occCurrent}%`, previous: `${occPrev}%`, variance: occVarStr, isPositive: Number(occVar) >= 0 },
        { metric: 'Room Revenue', current: formatAmount(revCurrent), previous: formatAmount(revPrev), variance: revVarStr, isPositive: Number(revVarPct) >= 0 },
        { metric: 'Ancillary Revenue', current: formatAmount(ancCurrent), previous: formatAmount(ancPrev), variance: ancVarStr, isPositive: true },
        { metric: 'Average Daily Rate (ADR)', current: formatAmount(adrCurrent), previous: formatAmount(adrPrev), variance: adrVarStr, isPositive: Number(adrVarPct) >= 0 },
        { metric: 'Revenue Per Available Room (RevPAR)', current: formatAmount(revparCurrent), previous: formatAmount(revparPrev), variance: revparVarStr, isPositive: true },
        
        { metric: 'Total Guests', current: `${guestsCurrent} guests`, previous: `${guestsPrev} guests`, variance: guestsVarStr, isPositive: true },
        { metric: 'Total Available Rooms', current: `${availCurrent} rooms`, previous: `${availPrev} rooms`, variance: availVarStr, isPositive: availVar >= 0 },
        { metric: 'Out of Order (OOO) Rooms', current: `${oooCurrent} rooms`, previous: `${oooPrev} rooms`, variance: oooVarStr, isPositive: oooVar <= 0 },
        { metric: 'Out of Service (OOS) Rooms', current: `${oosCurrent} rooms`, previous: `${oosPrev} rooms`, variance: oosVarStr, isPositive: oosVar <= 0 },
        
        { metric: 'Gift Shop Sales', current: formatAmount(0), previous: formatAmount(0), variance: '0%', isPositive: true },
        { metric: 'Front Office Supplies Cost', current: formatAmount(0), previous: formatAmount(0), variance: '0%', isPositive: true },

        { metric: 'Booking Source (OTA Share)', current: `${otaCurrent}%`, previous: `${otaPrev}%`, variance: otaVarStr, isPositive: Number(otaVar) <= 0 }, 
        { metric: 'Direct Website Share', current: `${dirCurrent}%`, previous: `${dirPrev}%`, variance: dirVarStr, isPositive: true },
        { metric: 'Corporate Account Volume', current: `${corpCurrent}%`, previous: `${corpPrev}%`, variance: corpVar, isPositive: false },
        { metric: 'Guest Satisfaction Score', current: `${satCurrent} / 100`, previous: `${satPrev} / 100`, variance: satVarStr, isPositive: true }
      ];
    };

    return {
      weekly: buildTable('weekly'),
      monthly: buildTable('monthly', monthlyCompareBaseline),
      quarterly: buildTable('quarterly')
    };
  }, [rooms, reservations, guests, currentSystemDate, metrics, formatAmount, monthlyCompareBaseline]);

  // Pick-Up Pace: forward booking accumulation by period
  const pickupPaceData = useMemo(() => {
    const parseDate = (d: string) => new Date(d + 'T00:00:00');
    const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const today = parseDate(currentSystemDate);

    // Weekly: next 7 days vs prior 7 days
    const weeklyLabels = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      return { date: fmt(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });
    const weeklyCurrent = weeklyLabels.map(({ date }) => reservations.filter(r => r.checkInDate === date && (r.status === 'Confirmed' || r.status === 'CheckedIn')).length);
    const weeklyPrevious = weeklyLabels.map(({ date }) => {
      const prevDate = fmt(addDays(parseDate(date), -7));
      return reservations.filter(r => r.checkInDate === prevDate && (r.status === 'Confirmed' || r.status === 'CheckedIn')).length;
    });
    const weeklyTotalCurrent = weeklyCurrent.reduce((a, b) => a + b, 0);
    const weeklyTotalPrevious = weeklyPrevious.reduce((a, b) => a + b, 0);
    const weeklyVariance = weeklyTotalPrevious > 0 ? Math.round(((weeklyTotalCurrent - weeklyTotalPrevious) / weeklyTotalPrevious) * 100) : 0;

    // Monthly: next 4 weeks vs prior 4 weeks
    const monthlyLabels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
    const monthlyCurrent = monthlyLabels.map((_, i) => {
      const start = addDays(today, i * 7);
      const end = addDays(today, (i + 1) * 7);
      return reservations.filter(r => {
        const d = parseDate(r.checkInDate);
        return d >= start && d < end && (r.status === 'Confirmed' || r.status === 'CheckedIn');
      }).length;
    });
    const monthlyPrevious = monthlyLabels.map((_, i) => {
      const start = addDays(today, i * 7 - 28);
      const end = addDays(today, (i + 1) * 7 - 28);
      return reservations.filter(r => {
        const d = parseDate(r.checkInDate);
        return d >= start && d < end && (r.status === 'Confirmed' || r.status === 'CheckedIn');
      }).length;
    });
    const monthlyTotalCurrent = monthlyCurrent.reduce((a, b) => a + b, 0);
    const monthlyTotalPrevious = monthlyPrevious.reduce((a, b) => a + b, 0);
    const monthlyVariance = monthlyTotalPrevious > 0 ? Math.round(((monthlyTotalCurrent - monthlyTotalPrevious) / monthlyTotalPrevious) * 100) : 0;

    return {
      weekly: weeklyLabels.map((l, i) => ({ name: l.label, current: weeklyCurrent[i], previous: weeklyPrevious[i] })),
      weeklyTotalCurrent,
      weeklyTotalPrevious,
      weeklyVariance,
      monthly: monthlyLabels.map((l, i) => ({ name: l, current: monthlyCurrent[i], previous: monthlyPrevious[i] })),
      monthlyTotalCurrent,
      monthlyTotalPrevious,
      monthlyVariance
    };
  }, [reservations, currentSystemDate]);

  // Handle Night Audit Closing Click
  const handleExecuteNightAudit = () => {
    const res = runNightAudit();
    setAuditFeedback(res);
    setTimeout(() => {
      setAuditFeedback(null);
    }, 8000);
    return res;
  };

  // Automated notification assessment values
  const alertsEvaluated = useMemo(() => {
    return [
      {
        id: 'alt-target-occ',
        title: 'Occupancy falls below target',
        triggered: metrics.occupancyRate < 60,
        description: `No data`,
        severity: 'Medium'
      },
      {
        id: 'alt-overbook',
        title: 'Overbooking risk detected',
        triggered: (metrics.availableRooms < metrics.arrivalsToday) && (metrics.availableRooms < 3),
        description: `Unassigned arrivals today (${metrics.arrivalsToday}) exceeds available vacant rooms (${metrics.availableRooms}).`,
        severity: 'High'
      },
      {
        id: 'alt-vip',
        title: 'VIP Arrival Pending',
        triggered: metrics.vipGuests > 0,
        description: `The system registers ${metrics.vipGuests} active VIP entries requiring personalized welcome escorts.`,
        severity: 'Medium'
      },
      {
        id: 'alt-sla-complaint',
        title: 'Complaint unresolved beyond SLA',
        triggered: metrics.openComplaintsCount > 0,
        description: `Active guest complaints (${metrics.openComplaintsCount} open cases) currently exceeding the 15-minute response SLA.`,
        severity: 'High'
      },
      {
        id: 'alt-cash-variance',
        title: 'Cash variance exceeds threshold',
        triggered: false, // Reconciled in real-time, can toggle to test
        description: 'No data',
        severity: 'Low'
      },
      {
        id: 'alt-audit-incomplete',
        title: 'Night Audit incomplete',
        triggered: reservations.some(r => r.checkOutDate === currentSystemDate && r.status === 'CheckedIn'),
        description: `Operational day ${currentSystemDate} has pending check-outs. Night audit balance checks locked temporarily.`,
        severity: 'High'
      },
      {
        id: 'alt-room-discrepancy',
        title: 'Room status discrepancies detected',
        triggered: rooms.some(r => r.status === 'Vacant Clean' && reservations.some(res => res.roomNumber === r.number && res.status === 'CheckedIn')),
        description: 'Room digital assignments matching front-desk inventory maps. Discrepancy indices cleared.',
        severity: 'Medium'
      },
      {
        id: 'alt-rev-forecast',
        title: 'Revenue below forecast',
        triggered: metrics.roomRevenueTotal < 2500,
        description: `Current calculated room tariff of ${formatAmount(metrics.roomRevenueTotal)} lags expectations.`,
        severity: 'Medium'
      }
    ];
  }, [metrics, rooms, reservations, currentSystemDate, formatAmount]);

  const activeAlertsCount = alertsEvaluated.filter(a => a.triggered).length;

  // 10-DAY METRICS TIMELINE SIMULATION (CALCULATED + DRIFTED)
  const persistedHistory = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('erp_historical_stats');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.timelineData || null;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }, [currentSystemDate]);

  const timelineData = useMemo(() => {
    if (persistedHistory && Array.isArray(persistedHistory) && persistedHistory.length > 0) {
      return persistedHistory;
    }

    const generated = Array.from({ length: 10 }).map((_, i) => {
      const day = i + 1;
      
      return {
        dateLabel: `Day ${day}`,
        Occupancy: 0,
        RoomRevenue: 0,
        AncillaryRevenue: 0,
        TotalRevenue: 0,
        ADR: 0,
        RevPAR: 0,
        Satisfaction: 0,
        NoiseComplaints: 0,
        WifiComplaints: 0,
        HvacComplaints: 0,
        Cancellations: 0
      };
    });

    return generated;
  }, [metrics, rooms.length, persistedHistory]);

  useEffect(() => {
    if (typeof window === 'undefined' || !timelineData.length) return;
    localStorage.setItem('erp_historical_stats', JSON.stringify({ timelineData }));
  }, [timelineData]);

  return (
    <div className="space-y-6" id="grand-reporting-center">
      
      {/* Alert Top Strip if unresolved critical flags are active */}
      {activeAlertsCount > 0 && (
        <div className="bg-slate-500/10 dark:bg-slate-400/5 border border-slate-500/20 text-slate-800 dark:text-slate-400 p-3 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-2 text-xs">
            <BadgeAlert size={16} className="text-slate-600 dark:text-slate-400 shrink-0" />
            <span className="font-bold uppercase tracking-wider">Manager System Warnings Triggered</span>
            <span className="opacity-80">•</span>
            <span className="font-medium font-sans">
              There are {activeAlertsCount} pending Front Office operating alert flags pending.
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('alerts')}
            className="text-[10px] font-mono font-black uppercase text-slate-700 hover:text-white dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-600/20 px-3 py-1 rounded-lg transition"
          >
            Review SLA Board →
          </button>
        </div>
      )}

      {/* Primary Navigation Breadcrumb Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-3xs">
        <div>
          <span className="bg-slate-100 dark:bg-slate-950/60 text-slate-800 dark:text-slate-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-900 uppercase tracking-widest inline-block">
            Hotel Reporting & Audit Suite
          </span>
          <h3 className="text-xl font-sans font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1.5 leading-none">
            Manager Reporting & Controls Terminal
          </h3>
          <p className="text-2xs text-slate-400 font-mono mt-1">Operational Day: {currentSystemDate} | Active Audit Stream</p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAuditConfirm(true)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-2xl text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Moon size={13} fill="currentColor" />
            <span>Overnight Night Audit</span>
          </button>
          
          <button
            onClick={() => {
              setAiAnalysisRunning(true);
              setTimeout(() => {
                setAiAnalysisRunning(false);
                // Shift or supplement recommendations
                setCurrentAiRecommendations(prev => [
                  {
                    category: 'No data',
                    title: 'No data',
                    impact: 'Low',
                    recommendation: `No data`
                  },
                  ...prev
                ]);
              }, 1500);
            }}
            disabled={aiAnalysisRunning}
            className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-sans font-black rounded-2xl text-[11px] flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition duration-150 cursor-pointer"
          >
            <BrainCircuit size={13} className={aiAnalysisRunning ? "animate-spin text-slate-500" : "text-slate-400 dark:text-slate-600"} />
            <span>Generate Strategic AI Plan</span>
          </button>
        </div>
      </div>

      {auditFeedback && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3 animate-slide-in">
          <CheckCircle className="text-slate-600 dark:text-slate-400 shrink-0 p-1 bg-slate-100 dark:bg-slate-900 rounded-full" size={24} />
          <div>
            <strong className="text-slate-900 dark:text-white font-sans text-xs flex items-center gap-1.5">
              Night Audit Closed Operational Cycle
            </strong>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-3xs mt-1">
              {auditFeedback.message} Reconciled Room Revenues posted: <strong className="text-slate-900 dark:text-slate-200">{formatAmount(auditFeedback.revenuePosted)}</strong>.
            </p>
          </div>
        </div>
      )}

      {exportTrigger && (
        <div className="fixed bottom-6 right-6 p-4 bg-slate-950 text-white dark:bg-white dark:text-slate-950 border border-slate-800 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <Activity size={16} className="text-slate-400 animate-spin" />
          <span className="text-3xs font-mono font-bold uppercase tracking-wider">
            {exportTrigger.type === 'PDF' && `Generating PDF Download for ${exportTrigger.reportName}...`}
            {exportTrigger.type === 'Excel' && `Compiling XLSX Workbook for ${exportTrigger.reportName}...`}
            {exportTrigger.type === 'Print' && `Opening Print Preview for ${exportTrigger.reportName}...`}
            {exportTrigger.type === 'Email' && `Packaging Document for Distribution Lists...`}
          </span>
        </div>
      )}

      {exportFeedback && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-fade-in max-w-md border ${
          exportFeedback.ok
            ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-200'
            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-200'
        }`}>
          {exportFeedback.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span className="text-3xs font-mono font-bold tracking-wide">{exportFeedback.message}</span>
        </div>
      )}

      {/* Main Mode Navigation Sliders */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-850 rounded-2xl w-full xl:w-max gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 size={12} />
          <span>Manager Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Calendar size={12} />
          <span>Daily Reports Module</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Clock size={12} />
          <span>Weekly Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText size={12} />
          <span>Monthly Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('quarterly')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'quarterly'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles size={12} />
          <span>Strategic (Quarterly)</span>
        </button>

        <button
          onClick={() => setActiveTab('center')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition ${
            activeTab === 'center'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={12} />
          <span>Report distribution Center</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition relative ${
            activeTab === 'alerts'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <ShieldAlert size={12} className={activeAlertsCount > 0 ? "text-slate-500" : ""} />
          <span>SLA Warnings Board</span>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-slate-500 text-white font-mono text-4xs font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: MANAGER DASHBOARD (LIVE KPIs & GRAPHICS)
          ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" id="dashboard-report-content">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-sans font-black text-slate-900 dark:text-white">Front Office Manager Live Dashboard</h4>
              <p className="text-xs text-slate-400">Aggregated property parameters tracking in real-time under active reservation sets.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xs font-mono font-extrabold text-slate-400 flex items-center gap-1 mr-2">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping"></span>
                <span>LIVE DATA ENGINE SYNCED</span>
              </div>
              <button
                onClick={() => triggerPrint('Manager Dashboard', 'dashboard-report-content')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Printer size={11} /> Print
              </button>
              <button
                onClick={() => triggerExport('PDF', 'Manager Dashboard')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Download size={11} /> PDF
              </button>
              <button
                onClick={() => triggerExport('Excel', 'Manager Dashboard')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Sliders size={11} className="text-slate-500" /> Excel
              </button>
            </div>
          </div>

          {/* KPI BENTO GRID - 17 DYNAMIC METRICS FOR ENTERPRISE TRACKING */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 summary-section" id="dashboard-summary-section">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-4 px-4 pt-4 mb-4 rounded-t-2xl col-span-full">
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Dashboard KPI Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time operational metrics and performance indicators</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => triggerPrint('Dashboard KPI Summary', 'dashboard-summary-section')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                >
                  <Printer size={11} /> Print
                </button>
                <button
                  onClick={() => triggerExport('PDF', 'Dashboard KPI Summary')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                >
                  <Download size={11} /> PDF
                </button>
              </div>
            </div>
            
            {/* Occupancy card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Occupancy Rate</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 dark:text-slate-400 mt-2">{metrics.occupancyRate}%</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Of {metrics.sellableRooms} Active Rooms</span>
            </div>

            {/* Rooms Available */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Rooms Available</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{metrics.availableRooms}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Vacant Clean Beds</span>
            </div>

            {/* Rooms Occupied */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Rooms Occupied</span>
              <strong className="text-2xl font-sans font-black block text-slate-900 dark:text-white mt-2">{metrics.occupiedRooms}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Registered In-House</span>
            </div>

            {/* Out Of Order */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Out Of Order</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{metrics.oooRoomsCount}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Maintenance Hold</span>
            </div>

            {/* Arrivals Today */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block font-medium">Arrivals Today</span>
              <strong className="text-2xl font-sans font-black block text-slate-900 dark:text-white mt-2">{metrics.arrivalsToday}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Under Active Folios</span>
            </div>

            {/* Departures Today */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Departures today</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{metrics.departuresToday}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Settle Balances</span>
            </div>

            {/* Stayovers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Stayovers</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 dark:text-slate-400 mt-2">{metrics.stayovers}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Unchanged rooms</span>
            </div>

            {/* VIP Guests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px] bg-gradient-to-tr from-slate-500/5 to-slate-500/5">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">VIP Guests</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{metrics.vipGuests}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Premium Escort Set</span>
            </div>

            {/* No-Shows */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">No-Shows</span>
              <strong className="text-2xl font-sans font-black block text-slate-500 mt-2">{metrics.noShows}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Auto prior logs</span>
            </div>

            {/* Walk-Ins */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Walk-Ins</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 dark:text-slate-400 mt-2">{metrics.walkIns}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Direct Desk Books</span>
            </div>

            {/* Room Revenue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Room Revenue</span>
              <strong className="text-xl font-sans font-black block text-slate-900 dark:text-white mt-2 truncate">
                {formatAmount(metrics.roomRevenueTotal)}
              </strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Excl incidentals</span>
            </div>

            {/* ADR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block font-mono">Average Daily Rate</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{formatAmount(metrics.adrRate)}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Rev / Occupied Beds</span>
            </div>

            {/* RevPAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px] xl:col-span-1">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block font-mono">RevPAR</span>
              <strong className="text-2xl font-sans font-black block text-slate-600 mt-2">{formatAmount(metrics.revParRate)}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">Rev / Market Beds</span>
            </div>

            {/* Guest Satisfaction */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Satisfaction Score</span>
              <strong className="text-2.5xl font-sans font-black block text-slate-600 mt-2">{metrics.guestSatisfactionScore}%</strong>
              <span className="text-4xs text-slate-400 font-semibold mt-1 block">No data</span>
            </div>

            {/* Open Complaints */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Open Complaints</span>
              <strong className="text-2.5xl font-sans font-black block text-slate-500 mt-2">{metrics.openComplaintsCount}</strong>
              <span className="text-4xs text-slate-400 font-semibold mt-1 block">No data</span>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px]">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Pending Maintenances</span>
              <strong className="text-2.5xl font-sans font-black block text-slate-500 mt-2">{metrics.pendingMaintenanceCount}</strong>
              <span className="text-4xs text-slate-400 font-mono mt-1 block">No data</span>
            </div>

            {/* Staff on Duty */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-3xs min-h-[100px] xl:col-span-2">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Active Staff on Duty</span>
              <div className="flex items-center gap-3 mt-1.5">
                <strong className="text-2.5xl font-sans font-black text-slate-900 dark:text-white">{metrics.staffOnDutyCount} Staff</strong>
                <span className="text-4xs text-slate-400 dark:text-slate-400 font-mono font-bold leading-tight uppercase bg-slate-50 dark:bg-slate-950 pl-1.5 pr-2 py-1 rounded">
                  No data
                </span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CHARTS & TREND DIAGRAM DISPLAY */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 shadow-3xs space-y-4 graph-section" id="dashboard-graph-section">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Dashboard Chart Analytics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between the dynamic chart overlays generated from daily operational closes.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-wrap bg-slate-50 dark:bg-slate-950 p-0.5 rounded-xl border dark:border-slate-800 gap-1 overflow-x-auto">
                  {[
                    { id: 'occupancy', label: 'Occupancy %' },
                    { id: 'revenue', label: 'Revenue Trends' },
                    { id: 'adr-revpar', label: 'ADR & RevPAR' },
                    { id: 'sources', label: 'Booking Channels' },
                    { id: 'demographics', label: 'Guest Nationalities' },
                    { id: 'complaints', label: 'Complaints Matrix' },
                    { id: 'cancellations', label: 'Cancellations' }
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setActiveChartTab(ct.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-4xs font-mono font-bold uppercase transition block shrink-0 ${
                        activeChartTab === ct.id
                          ? 'bg-slate-950 dark:bg-slate-850 text-white dark:text-slate-400 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => triggerPrint('Dashboard Charts', 'dashboard-graph-section')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Printer size={11} /> Print
                  </button>
                  <button
                    onClick={() => triggerExport('PDF', 'Dashboard Charts')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Download size={11} /> PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Render Selected Interactive Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {/* 1. OCCUPANCY TREND */}
                {activeChartTab === 'occupancy' && (
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={9} domain={[50, 100]} />
                    <Tooltip contentStyle={{ fontSize: '10px', background: '#000', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line name="Property Occupancy Rate (%)" type="monotone" dataKey="Occupancy" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}

                {/* 2. REVENUE TREND */}
                {activeChartTab === 'revenue' && (
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar name="Room Tariffs ($)" dataKey="RoomRevenue" fill="#94a3b8" stackId="rev" />
                    <Bar name="Ancillary Retail ($)" dataKey="AncillaryRevenue" fill="#64748b" stackId="rev" />
                  </BarChart>
                )}

                {/* 3. ADR & REVPAR */}
                {activeChartTab === 'adr-revpar' && (
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line name="Average Daily Rate ($)" type="monotone" dataKey="ADR" stroke="#94a3b8" strokeWidth={2} />
                    <Line name="RevPAR ($)" type="monotone" dataKey="RevPAR" stroke="#64748b" strokeWidth={2} />
                  </LineChart>
                )}

                {/* 4. BOOKING CHANNELS PIE CHART */}
                {activeChartTab === 'sources' && (
                  <RechartsPie>
                    <Pie
                      data={[
                        { name: 'No data', value: 0, fill: '#94a3b8' },
                        { name: 'No data', value: 0, fill: '#94a3b8' },
                        { name: 'No data', value: 0, fill: '#94a3b8' },
                        { name: 'No data', value: 0, fill: '#94a3b8' },
                        { name: 'No data', value: 0, fill: '#94a3b8' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3, 4].map((index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </RechartsPie>
                )}

                {/* 5. GUEST NATIONALITIES HORIZONTAL BAR */}
                {activeChartTab === 'demographics' && (
                  <BarChart layout="vertical" data={[]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis dataKey="nationality" type="category" stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar name="Percentage Share (%)" dataKey="volume" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                )}

                {/* 6. COMPLAINTS MATRIX CHART */}
                {activeChartTab === 'complaints' && (
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar name="Noise Disruption" dataKey="NoiseComplaints" fill="#94a3b8" />
                    <Bar name="HVAC Cooling / AC failures" dataKey="HvacComplaints" fill="#64748b" />
                    <Bar name="Wi-Fi Dropout" dataKey="WifiComplaints" fill="#cbd5e1" />
                  </BarChart>
                )}

                {/* 7. CANCELLATION TREND */}
                {activeChartTab === 'cancellations' && (
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area name="Cancellations Logged" type="monotone" dataKey="Cancellations" fill="#cbd5e1" stroke="#94a3b8" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* GIFT SHOP & SUPPLIES DASHBOARD INTEGRATION */}
          <div className="mt-6">
            <GiftShopSuppliesDashboardWidgets />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: DAILY REPORTS MODULE
          ------------------------------------------------------------- */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Advanced Period Selector Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]">Workspace Query Configuration</h4>
                <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight mt-0.5">Hotel Operating Day Selector</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Query ledger indexes, reception streams, and daily checkout books by a specific day or date range.</p>
              </div>

              {/* Mode Toggle Controls */}
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 border dark:border-slate-800 rounded-xl gap-1 shrink-0">
                <button
                  onClick={() => setDailyDateSelectionMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                    dailyDateSelectionMode === 'single'
                      ? 'bg-slate-950 dark:bg-slate-800 text-white shadow-3xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar size={10} />
                  <span>Single Date</span>
                </button>
                <button
                  onClick={() => setDailyDateSelectionMode('range')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                    dailyDateSelectionMode === 'range'
                      ? 'bg-slate-950 dark:bg-slate-800 text-white shadow-3xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CalendarRange size={10} />
                  <span>Date Range</span>
                </button>
              </div>
            </div>

            {/* Inputs & Quick Preset Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-3 border-t border-slate-100 dark:border-slate-850">
              {dailyDateSelectionMode === 'single' ? (
                <>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Target Specific Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dailySelectedDate}
                        onChange={(e) => setDailySelectedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-mono outline-none focus:border-slate-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-8 flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mr-1">Quick Presets:</span>
                    <button
                      onClick={() => setDailySelectedDate(currentSystemDate)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                    >
                      Operating Today ({currentSystemDate})
                    </button>
                    <button
                      onClick={() => setDailySelectedDate(shiftDate(currentSystemDate, -1))}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => setDailySelectedDate(shiftDate(currentSystemDate, 1))}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                    >
                      Tomorrow
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Range Start Date</label>
                    <input
                      type="date"
                      value={dailyStartDate}
                      onChange={(e) => setDailyStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-mono outline-none focus:border-slate-500"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Range End Date</label>
                    <input
                      type="date"
                      value={dailyEndDate}
                      onChange={(e) => setDailyEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-mono outline-none focus:border-slate-500"
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mr-1 w-full">Quick Cycles:</span>
                    <button
                      onClick={() => {
                        setDailyStartDate(shiftDate(currentSystemDate, -2));
                        setDailyEndDate(currentSystemDate);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                    >
                      Last 3 Days
                    </button>
                    <button
                      onClick={() => {
                        setDailyStartDate(shiftDate(currentSystemDate, -6));
                        setDailyEndDate(currentSystemDate);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer"
                    >
                      Last 7 Days
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Indicator current report context */}
            <div className="py-2 px-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-150/50 dark:border-slate-900/40 flex justify-between items-center flex-wrap gap-2 text-3xs font-mono text-slate-700 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                <span>Active query range: <strong>{dailyDateSelectionMode === 'single' ? dailySelectedDate || currentSystemDate : `${dailyStartDate || currentSystemDate} to ${dailyEndDate || currentSystemDate}`}</strong></span>
              </span>
              <span className="text-slate-400 uppercase">
                {dailyDateSelectionMode === 'single' ? 'Single day active filter' : 'Aggregated period metrics'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* List of generation items */}
          <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Books Generator</h4>
              <p className="text-xs text-slate-400">Scheduled daily operational books compiled on Night Audit closure.</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border dark:border-slate-800">
              {['All', 'Reception', 'Reservation', 'Night Audit', 'Gift Shop & Supplies'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedReportCategory(cat as any)}
                  className={`px-2.5 py-1 text-4xs font-mono font-bold uppercase rounded-md transition ${
                    selectedReportCategory === cat 
                      ? 'bg-slate-950 dark:bg-slate-800 text-white' 
                      : 'text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
              <input
                type="text"
                placeholder="Search daily listings..."
                value={searchDailyReport}
                onChange={e => setSearchDailyReport(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-8 pr-4 py-2 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {DAILY_REPORTS_LIST.filter(rep => 
                (selectedReportCategory === 'All' || rep.category === selectedReportCategory) &&
                (searchDailyReport === '' || rep.name.toLowerCase().includes(searchDailyReport.toLowerCase()))
              ).map(rep => (
                <button
                  key={rep.id}
                  onClick={() => {
                    setActiveDetailReport(rep);
                    setShowExecutiveSummary(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-left border text-xs transition block cursor-pointer ${
                    activeDetailReport?.id === rep.id && !showExecutiveSummary
                      ? 'bg-slate-600 border-slate-600 text-white shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold tracking-tight">{rep.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                      activeDetailReport?.id === rep.id && !showExecutiveSummary
                        ? 'bg-slate-700 text-white border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-200 dark:border-slate-750'
                    }`}>
                      {rep.category}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-1 ${
                    activeDetailReport?.id === rep.id && !showExecutiveSummary
                      ? 'text-slate-100'
                      : 'text-slate-400'
                  }`}>
                    {rep.description}
                  </p>
                </button>
              ))}

              <div className="border-t border-slate-150 dark:border-slate-800 pt-3 mt-1.5">
                <button
                  onClick={() => {
                    setShowExecutiveSummary(true);
                    setActiveDetailReport(null);
                  }}
                  className={`w-full p-4 rounded-3xl text-left border text-xs font-black transition cursor-pointer flex items-center justify-between bg-gradient-to-tr ${
                    showExecutiveSummary
                      ? 'from-slate-600 to-slate-600 border-slate-600 text-white shadow-md'
                      : 'from-slate-400/10 to-slate-400/10 dark:from-slate-400/5 dark:to-slate-400/5 border-slate-200/50 text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-slate-400" />
                    <span>DAILY EXEC EXECUTIVE SUMMARY SUMMARY</span>
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Report Sheet View */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-6">
            
            {showExecutiveSummary ? (
              /* DAILY EXECUTIVE SUMMARY RENDER MODE */
              <div className="space-y-6 animate-fade-in summary-section" id="daily-exec-summary-content">
                
                {/* Header Action Strip */}
                <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Sparkles size={16} className="text-slate-400" />
                      <span>Daily Front Office Executive Summary</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Operational period query: <strong className="text-slate-600 dark:text-slate-400">{dailyDateSelectionMode === 'single' ? dailySelectedDate || currentSystemDate : `${dailyStartDate || currentSystemDate} to ${dailyEndDate || currentSystemDate}`}</strong>
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => triggerPrint('Executive Summary', 'daily-exec-summary-content')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button 
                      onClick={() => triggerExport('PDF', 'Executive Summary')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                    <button 
                      onClick={() => triggerExport('Excel', 'Executive Summary')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Sliders size={11} /> Excel
                    </button>
                    <button 
                      onClick={() => triggerExport('Email', 'Executive Summary')}
                      className="px-4 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Send size={11} /> Dispatch Email
                    </button>
                  </div>
                </div>

                {/* Sub-sections of Executive Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Occupancy Section */}
                  <div className="space-y-2 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b pb-1 font-mono">1. Occupancy Statistics</h4>
                    <ul className="text-3xs font-mono space-y-1 text-slate-650 leading-relaxed">
                      <li className="flex justify-between"><span>Live Occupancy Percentage:</span> <strong className="text-slate-600">{selectedDailyMetrics.occupancyRate}%</strong></li>
                      <li className="flex justify-between"><span>Active Occupied Rooms:</span> <strong className="text-slate-800">{selectedDailyMetrics.occupiedRooms}</strong></li>
                      <li className="flex justify-between"><span>Clean Available Beds:</span> <strong className="text-slate-600">{formatAmount(selectedDailyMetrics.availableRooms)}</strong></li>
                      <li className="flex justify-between"><span>Out of Order holds:</span> <strong>{selectedDailyMetrics.oooRoomsCount} rooms</strong></li>
                    </ul>
                  </div>

                  {/* Revenue Section */}
                  <div className="space-y-2 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b pb-1 font-mono">2. Revenue Statistics</h4>
                    <ul className="text-3xs font-mono space-y-1 text-slate-650 leading-relaxed">
                      <li className="flex justify-between"><span>Aggregated Room Revenue:</span> <strong className="text-slate-600">{formatAmount(selectedDailyMetrics.roomRevenueTotal)}</strong></li>
                      <li className="flex justify-between"><span>Average Daily Rate (ADR):</span> <strong>{formatAmount(selectedDailyMetrics.adrRate)}</strong></li>
                      <li className="flex justify-between"><span>RevPAR Indexing today:</span> <strong>{formatAmount(selectedDailyMetrics.revParRate)}</strong></li>
                      <li className="flex justify-between"><span>Collected card settlements:</span> <strong>{formatAmount(Math.round(selectedDailyMetrics.roomRevenueTotal * 0.95))}</strong></li>
                    </ul>
                  </div>

                  {/* Arrivals & Departures summary */}
                  <div className="space-y-2 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b pb-1 font-mono">3. Arrival & Departure Summary</h4>
                    <ul className="text-3xs font-mono space-y-1 text-slate-650 leading-relaxed">
                      <li className="flex justify-between"><span>Scheduled arrivals:</span> <strong>{selectedDailyMetrics.arrivalsToday} guests</strong></li>
                      <li className="flex justify-between"><span>Expected departures:</span> <strong>{selectedDailyMetrics.departuresToday} guests</strong></li>
                      <li className="flex justify-between"><span>Current active stayovers:</span> <strong className="text-slate-600">{selectedDailyMetrics.stayovers}</strong></li>
                      <li className="flex justify-between"><span>Direct walk-ins booked:</span> <strong className="text-slate-600">{selectedDailyMetrics.walkIns}</strong></li>
                    </ul>
                  </div>

                  {/* Operational Risk section */}
                  <div className="space-y-2 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b pb-1 font-mono text-slate-500">4. Operational Risks & Warnings</h4>
                    <ul className="text-3xs font-mono space-y-1 text-slate-700 dark:text-slate-400 leading-relaxed">
                      <li className="flex justify-between"><span>Security incidents:</span> <strong>0 cases</strong></li>
                      <li className="flex justify-between"><span>Cash drawer variances:</span> <strong>$0.00 drift</strong></li>
                      <li className="flex justify-between"><span>Active maintenance tasks:</span> <strong>{selectedDailyMetrics.pendingMaintenanceCount} open</strong></li>
                      <li className="flex justify-between"><span>Overbooking danger level:</span> <strong className="font-bold">LOW</strong></li>
                    </ul>
                  </div>

                  {/* Guest Complaints / VIP section */}
                  <div className="space-y-2 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20 md:col-span-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b pb-1 font-mono">5. Guest Services & VIP movement</h4>
                    <p className="text-[10px] text-slate-450 leading-normal mb-1">
                      VIP registrations represented {selectedDailyMetrics.vipGuests} guests arriving today. Team on duty ({selectedDailyMetrics.staffOnDutyCount} members) fully assigned to support. 
                      There are {selectedDailyMetrics.openComplaintsCount} open complaints regarding Wi-Fi speed and noise, which are categorized in housekeeping SLA logs.
                    </p>
                  </div>

                  {/* Gift Shop & Front Office Supplies Segment */}
                  <div className="md:col-span-2">
                    <OperationsManagerExecutiveSummarySection />
                  </div>
                </div>

                <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-900 text-3xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Approval Workflow Traceability certificate:</strong> No data
                </div>

              </div>
            ) : (
              /* DETAILED DAILY REPORT SHEETS */
              activeDetailReport && (
                <div className="space-y-5 animate-fade-in table-section" id="daily-table-section">
                  
                  {/* Item header */}
                  <div className="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-800 dark:to-slate-800 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                    <div>
                      <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block">{activeDetailReport.category} Daily Output</span>
                      <h3 className="text-base font-sans font-bold text-slate-950 dark:text-white uppercase tracking-tight">{activeDetailReport.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeDetailReport.description}</p>
                    </div>

                    <div className="flex gap-1">
                      <button 
                        onClick={() => triggerPrint(activeDetailReport.name, 'daily-table-section')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Printer size={11} /> Print
                      </button>
                      <button 
                        onClick={() => triggerExport('PDF', activeDetailReport.name)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Download size={11} /> PDF
                      </button>
                      <button 
                        onClick={() => triggerExport('Excel', activeDetailReport.name)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <SlidersHorizontal size={11} className="text-slate-500" /> Export XLS
                      </button>
                    </div>
                  </div>

                  {/* Standardized Daily Doc layout block containing relevant data representation */}
                  <div id="daily-detail-report-content" className="p-6 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/20 min-h-[300px] flex flex-col justify-between">
                    
                    {/* Content simulation depending on category chosen */}
                    <div className="space-y-4">
                      
                      {(activeDetailReport.category === 'Reception' || 
                        activeDetailReport.category === 'Reservation' || 
                        activeDetailReport.category === 'Night Audit') && (
                        <DailyOtherReportsRenderer
                          reportId={activeDetailReport.id}
                          selectedDate={dailyDateSelectionMode === 'single' ? dailySelectedDate || currentSystemDate : `${dailyStartDate || currentSystemDate} to ${dailyEndDate || currentSystemDate}`}
                          reservations={reservations}
                          rooms={rooms}
                          selectedDailyMetrics={selectedDailyMetrics}
                          corporateAccounts={corporateAccounts}
                          guests={guests}
                          structuredAuditLogs={structuredAuditLogs}
                          systemUsers={systemUsers}
                        />
                      )}

                      {activeDetailReport.category === 'Gift Shop & Supplies' && (
                        <GiftShopSuppliesDailyReportRenderer reportId={activeDetailReport.id} selectedDate={dailyDateSelectionMode === 'single' ? dailySelectedDate || currentSystemDate : `${dailyStartDate || currentSystemDate} to ${dailyEndDate || currentSystemDate}`} />
                      )}

                    </div>

                    <div className="pt-4 border-t border-slate-150 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-500 flex justify-between items-center bg-slate-100 dark:bg-slate-900/40 p-3 rounded-xl">
                      <span>Status: Automated Compile</span>
                      <span>Run Date: {activeDetailReport.generatedAt}</span>
                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: WEEKLY REPORTS MODULE
          ------------------------------------------------------------- */}
      {activeTab === 'weekly' && (
        <div className="space-y-6" id="weekly-report-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs">
            <div>
              <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Weekly Front Office Performance Review</h3>
              <p className="text-xs text-slate-450 mt-1">Full statistical reviews comparing current week outcomes with prior week parameters.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerPrint('Weekly Performance', 'weekly-report-content')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Printer size={11} /> Print
              </button>
              <button
                onClick={() => triggerExport('PDF', 'Weekly Performance')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Download size={11} /> PDF Export
              </button>
              <button
                onClick={() => triggerExport('Excel', 'Weekly Sales')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Sliders size={11} className="text-slate-500" /> Excel Book
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Comparative balance list */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4 table-section" id="weekly-table-section">
              <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                <div>
                  <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Metrics Comparison Table</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Current Week Ending: {currentSystemDate}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => triggerPrint('Weekly Metrics Table', 'weekly-table-section')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Printer size={11} /> Print
                  </button>
                  <button
                    onClick={() => triggerExport('PDF', 'Weekly Metrics Table')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Download size={11} /> PDF
                  </button>
                  <button
                    onClick={() => triggerExport('Excel', 'Weekly Metrics Table')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Sliders size={11} className="text-slate-500" /> Excel
                  </button>
                </div>
              </div>

              <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-3xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 font-mono text-[9px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-4 font-bold">Performance Attribute</th>
                      <th className="py-2.5 px-3 text-center font-bold">This Week</th>
                      <th className="py-2.5 px-3 text-center font-bold">Previous Week</th>
                      <th className="py-2.5 px-4 text-right font-bold">Variance (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                    {getComparativeMetrics.weekly.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-750 dark:text-slate-350">
                        <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white">{comp.metric}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{comp.current}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-450">{comp.previous}</td>
                        <td className={`py-2.5 px-4 text-right font-mono font-black ${
                          comp.isPositive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'
                        }`}>
                          {comp.variance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Corporates & Nationalities Grid for Weekly Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-150 dark:border-slate-850 animate-fade-in text-xs">
                {/* Top Corporates */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Weekly Top Corporates</span>
                    <TrendingUp size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Company</th>
                          <th className="py-2 px-2 text-center font-bold">Bookings</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.weekly.corporates.slice(0, 4).map((corp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.bookings}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(corp.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Nationalities */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Weekly Guest Demographics</span>
                    <Users size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Nationality</th>
                          <th className="py-2 px-2 text-center font-bold">Guests</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Spend Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.weekly.nationalities.slice(0, 4).map((nat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{nat.nationality}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.guestCount}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(nat.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Panel & Productivity Summary */}
            <div className="space-y-6">
              
              {/* 30-Day occupancy forecast */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4 summary-section" id="weekly-summary-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Forecast Summary</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estimated occupancy based on active reservation bookings in current month.</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Weekly Forecast Summary', 'weekly-summary-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Weekly Forecast Summary')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Next 1-7 Days', rate: 0, status: 'No data' },
                    { label: 'Next 8-14 Days', rate: 0, status: 'No data' },
                    { label: 'Next 15-21 Days', rate: 0, status: 'No data' },
                    { label: 'Next 22-30 Days', rate: 0, status: 'No data' }
                  ].map((fc, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono font-bold text-slate-500 uppercase">{fc.label}</span>
                        <span className="font-mono font-black text-slate-600">{fc.rate}% Occupancy ({fc.status})</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-slate-500 to-slate-500 rounded-full" style={{ width: `${fc.rate}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pick-Up Pace Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4 graph-section" id="weekly-graph-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Pick-Up Pace Chart</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Forward bookings by day vs same day last week.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-2xs font-mono font-black px-2 py-1 rounded-lg ${pickupPaceData.weeklyVariance >= 0 ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400' : 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400'}`}>
                      {pickupPaceData.weeklyVariance >= 0 ? '+' : ''}{pickupPaceData.weeklyVariance}% vs Prior Week
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => triggerPrint('Weekly Pick-Up Chart', 'weekly-graph-section')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Printer size={11} /> Print
                      </button>
                      <button
                        onClick={() => triggerExport('PDF', 'Weekly Pick-Up Chart')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Download size={11} /> PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pickupPaceData.weekly} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="current" name="This Week" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="previous" name="Last Week" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-3xs font-mono text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>Total Committed: {pickupPaceData.weeklyTotalCurrent} bookings</span>
                  <span className="text-slate-400">Prior: {pickupPaceData.weeklyTotalPrevious} bookings</span>
                </div>
              </div>

              {/* Staff productivity widget */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-850 shadow-sm space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-455 uppercase tracking-widest pl-0.5 block">Staff Productivity & attendance</span>
                <p className="text-3xs text-slate-400 font-sans leading-normal">
                  No data
                </p>
                <div className="flex justify-between text-3xs font-mono text-slate-500 border-t border-slate-800 pt-2">
                  <span>Front Desk Shifts: No data</span>
                  <span className="text-slate-400 font-bold">No data</span>
                </div>
              </div>

            </div>

          </div>

          {/* GIFT SHOP & SUPPLIES WEEKLY REVIEWS */}
          <GiftShopSuppliesDeepDiveReview timeframe="weekly" />

        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: MONTHLY AUDIT MODULE (SECTIONS & VARIANCE TOOLS)
          ------------------------------------------------------------- */}
      {activeTab === 'monthly' && (
        <div className="space-y-6" id="monthly-report-content">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs">
            <div>
              <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Monthly Front Office Performance Book</h3>
              <p className="text-xs text-slate-450 mt-1">Multi-section managerial review, budget analysis, and ledger variances.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerPrint('Monthly Performance', 'monthly-report-content')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Printer size={11} /> Print
              </button>
              <button
                onClick={() => triggerExport('PDF', 'Monthly Performance')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Download size={11} /> PDF
              </button>
              <button
                onClick={() => triggerExport('Excel', 'Monthly Performance')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Sliders size={11} className="text-slate-500" /> Excel
              </button>
            </div>

            {/* Variance comparison mode chooser */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border dark:border-slate-850 gap-1 text-3xs font-mono font-bold">
              <button
                onClick={() => setMonthlyCompareBaseline('prev-month')}
                className={`px-3 py-1.5 rounded-lg transition ${monthlyCompareBaseline === 'prev-month' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white' : 'text-slate-450'}`}
              >
                vs Prev Month
              </button>
              <button
                onClick={() => setMonthlyCompareBaseline('same-month-yoy')}
                className={`px-3 py-1.5 rounded-lg transition ${monthlyCompareBaseline === 'same-month-yoy' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white' : 'text-slate-450'}`}
              >
                vs Same Month Last Year
              </button>
              <button
                onClick={() => setMonthlyCompareBaseline('budget')}
                className={`px-3 py-1.5 rounded-lg transition ${monthlyCompareBaseline === 'budget' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white' : 'text-slate-450'}`}
              >
                Actual vs Budget
              </button>
            </div>
          </div>

          {/* Monthly KPI Overview Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {[
              { label: 'Monthly Occupancy', value: '0%', detail: 'No data', positive: false },
              { label: 'Average Daily Rate', value: '$0', detail: 'No data', positive: false },
              { label: 'Revenue Per Room', value: '$0', detail: 'No data', positive: false },
              { label: 'Direct Bookings', value: '0%', detail: 'No data', positive: false }
            ].map((kpi, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-3xs space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                <strong className="text-xl font-sans font-black text-slate-905 dark:text-white block">{kpi.value}</strong>
                <span className="text-[10px] font-sans font-bold text-slate-400">{kpi.detail}</span>
              </div>
            ))}
          </div>

          {/* Monthly Pick-Up Pace Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Monthly Booking Pick-Up Pace</h4>
                <p className="text-xs text-slate-450">Forward bookings by week vs same period last month.</p>
              </div>
              <div className={`text-2xs font-mono font-black px-2 py-1 rounded-lg ${pickupPaceData.monthlyVariance >= 0 ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400' : 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400'}`}>
                {pickupPaceData.monthlyVariance >= 0 ? '+' : ''}{pickupPaceData.monthlyVariance}% vs Prior Month
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pickupPaceData.monthly} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="current" name="This Month" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="previous" name="Last Month" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-3xs font-mono text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Total Committed: {pickupPaceData.monthlyTotalCurrent} bookings</span>
              <span className="text-slate-400">Prior: {pickupPaceData.monthlyTotalPrevious} bookings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Sections Content List */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-6">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Generated Performance Sections</span>
                <span className="text-3xs font-mono uppercase text-slate-600 font-black">Audit Ready</span>
              </div>

              <div className="space-y-4 animate-fade-in summary-section" id="monthly-summary-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Monthly Performance Summary</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive analysis of operational metrics and performance indicators</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Monthly Summary', 'monthly-summary-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Monthly Summary')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </div>
                {MONTHLY_SECTIONS.map((sec, i) => {
                  
                  // Modify micro values in mock depending on variance chosen to display dynamic reactivity
                  let displayedTrend = sec.trend;
                  if (monthlyCompareBaseline === 'same-month-yoy') {
                    displayedTrend = displayedTrend.replace('Budget', 'YoY same month').replace('MoM', 'YoY');
                  } else if (monthlyCompareBaseline === 'budget') {
                    displayedTrend = displayedTrend.replace('Prev Month', 'Budget Limit').replace('MoM', 'Budget targets');
                  }

                  return (
                    <div key={i} className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/20">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-sans font-black text-slate-955 dark:text-white uppercase tracking-tight">{sec.title}</h4>
                        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[9px] font-mono font-bold uppercase rounded border">
                          {displayedTrend}
                        </span>
                      </div>
                      <p className="text-3xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans">{sec.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Metric Comparisons & Variance Table */}
              <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-850 table-section" id="monthly-table-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Monthly Metrics Comparison Table</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {monthlyCompareBaseline === 'prev-month' ? 'Current Month vs Previous Month' : 
                       monthlyCompareBaseline === 'same-month-yoy' ? 'Current Month vs Same Month Last Year' : 
                       'Actual vs Budget'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Monthly Metrics Table', 'monthly-table-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Monthly Metrics Table')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                    <button
                      onClick={() => triggerExport('Excel', 'Monthly Metrics Table')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Sliders size={11} className="text-slate-500" /> Excel
                    </button>
                  </div>
                </div>

                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-3xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 font-mono text-[9px] uppercase text-slate-440 border-b border-slate-200 dark:border-slate-805">
                        <th className="py-2.5 px-4 font-bold">Performance Attribute</th>
                        <th className="py-2.5 px-3 text-center font-bold">This Month</th>
                        <th className="py-2.5 px-3 text-center font-bold">
                          {monthlyCompareBaseline === 'prev-month' ? 'Previous Month' : 
                           monthlyCompareBaseline === 'same-month-yoy' ? 'Same Month Last Year' : 
                           'Budget'}
                        </th>
                        <th className="py-2.5 px-4 text-right font-bold">Variance (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                      {getComparativeMetrics.monthly.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-755 dark:text-slate-355">
                          <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white">{comp.metric}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{comp.current}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-450">{comp.previous}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-black ${
                            comp.isPositive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'
                          }`}>
                            {comp.variance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Trend Performance Area Chart */}
              <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-850 graph-section" id="monthly-graph-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Monthly Trend Performance Chart</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No data available</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Monthly Trend Chart', 'monthly-graph-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Monthly Trend Chart')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </div>
                <div className="h-44 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-850" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} 
                        itemStyle={{ color: '#94a3b8' }}
                      />
                      <Area type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#94a3b8" fillOpacity={1} fill="url(#colorO)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Monthly Corporates & Nationalities Grid for Monthly Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-150 dark:border-slate-850 text-xs">
                {/* Top Monthly Corporates */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Monthly Corporate Leaderboard</span>
                    <TrendingUp size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Company</th>
                          <th className="py-2 px-2 text-center font-bold">Bookings</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.monthly.corporates.slice(0, 4).map((corp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.bookings}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(corp.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Monthly Nationalities */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Monthly Guest Demographics</span>
                    <Users size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Nationality</th>
                          <th className="py-2 px-2 text-center font-bold">Guests</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.monthly.nationalities.slice(0, 4).map((nat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{nat.nationality}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.guestCount}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(nat.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly KPI Overview Card & Controls */}
            <div className="space-y-6">
              
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-850 shadow-md space-y-4">
                <div>
                  <span className="text-slate-400 text-3xs font-mono font-bold uppercase tracking-widest pl-0.5 block">Estimated Monthly GOP margin</span>
                  <strong className="text-2.5xl font-sans font-black block text-slate-400 mt-1">0% GOP</strong>
                  <p className="text-3xs text-slate-400 font-sans mt-1">No data available.</p>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2 text-3xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Room Sales:</span>
                    <span className="text-slate-400 font-bold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commissions Saved (Directs):</span>
                    <span className="text-slate-400 font-bold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Complaints Resolved in SLA:</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                </div>
              </div>

              {/* Monthly Action Plan button trigger */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-3">
                <h4 className="text-xs font-black text-slate-955 dark:text-white uppercase tracking-widest block font-mono">Monthly Manager Action Plan</h4>
                <p className="text-3xs text-slate-450 leading-normal mb-2">
                  Dispatch the approved monthly performance report and budget variance books directly to the hotel owners and general management desk.
                </p>
                <button
                  onClick={() => triggerExport('Email', 'Monthly Performance Book')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-sans font-black rounded-xl text-3xs py-2.5 flex items-center justify-center gap-1.5 transition"
                >
                  <Send size={12} />
                  <span>Distribute Monthly Audit Book</span>
                </button>
              </div>

            </div>

          </div>

          {/* GIFT SHOP & SUPPLIES MONTHLY REVIEWS */}
          <GiftShopSuppliesDeepDiveReview timeframe="monthly" />

        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: QUARTERLY REPORTS & AI STRATEGIC SUGGESTIONS
          ------------------------------------------------------------- */}
       {activeTab === 'quarterly' && (
        <div className="space-y-6" id="quarterly-report-content">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs">
            <div>
              <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Quarterly Business Review</h3>
              <p className="text-xs text-slate-450 mt-1">Strategic analytics, AI recommendations, and quarterly performance review.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerPrint('Quarterly Review', 'quarterly-report-content')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Printer size={11} /> Print
              </button>
              <button
                onClick={() => triggerExport('PDF', 'Quarterly Review')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Download size={11} /> PDF
              </button>
              <button
                onClick={() => triggerExport('Excel', 'Quarterly Review')}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
              >
                <Sliders size={11} className="text-slate-500" /> Excel
              </button>
            </div>
          </div>

          {/* Quarterly KPI Overview Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in summary-section" id="quarterly-summary-section">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-4 px-4 pt-4 mb-4 rounded-t-2xl col-span-full">
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Quarterly KPI Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Key performance indicators — No data available</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => triggerPrint('Quarterly KPI Summary', 'quarterly-summary-section')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                >
                  <Printer size={11} /> Print
                </button>
                <button
                  onClick={() => triggerExport('PDF', 'Quarterly KPI Summary')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                >
                  <Download size={11} /> PDF
                </button>
              </div>
            </div>
            {[
              { label: 'Q3 Occupancy Avg', value: '0%', detail: 'No data available', positive: false },
              { label: 'Q3 Gross Revenue', value: '$0', detail: 'No data available', positive: false },
              { label: 'Q3 Average Daily Rate', value: '$0.00', detail: 'No data available', positive: false },
              { label: 'Q3 RevPAR Output', value: '$0.00', detail: 'No data available', positive: false }
            ].map((kpi, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-3xs space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                <strong className="text-xl font-sans font-black text-slate-905 dark:text-white block">{kpi.value}</strong>
                <span className="text-[10px] font-sans font-bold text-slate-500">{kpi.detail}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Strategic analytics list */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-6 summary-section" id="quarterly-strategic-summary">
              <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                <div>
                  <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Quarterly Strategic Summary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strategic market analytics, ADR growth trends, and corporate channel segment penetrations.</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => triggerPrint('Quarterly Strategic Summary', 'quarterly-strategic-summary')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Printer size={11} /> Print
                  </button>
                  <button
                    onClick={() => triggerExport('PDF', 'Quarterly Strategic Summary')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <Download size={11} /> PDF
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Quarterly Business Review Overview', desc: 'No data', value: '0%' },
                  { title: 'Corporate Account Volume & Market Channel Shares', desc: 'No data', value: '0%' },
                  { title: 'Guest Satisfaction & Customer Retention Indexing', desc: 'No data', value: '0%' },
                  { title: 'Staff Attrition & Training effectiveness', desc: 'No data', value: '0%' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex justify-between gap-4 items-start bg-slate-50/20">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-955 dark:text-white block">{item.title}</span>
                      <p className="text-3xs text-slate-450 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-105 dark:bg-slate-800 text-[9px] font-mono font-black uppercase text-slate-600 dark:text-slate-400 rounded-xl border shrink-0">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quarterly Metric Comparisons & Variance Table */}
              <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-850 table-section" id="quarterly-table-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Quarterly Metrics Comparison Table</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Current Q3 Performance Book</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Quarterly Metrics Table', 'quarterly-table-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Quarterly Metrics Table')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                    <button
                      onClick={() => triggerExport('Excel', 'Quarterly Metrics Table')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Sliders size={11} className="text-slate-500" /> Excel
                    </button>
                  </div>
                </div>

                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-3xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 font-mono text-[9px] uppercase text-slate-440 border-b border-slate-200 dark:border-slate-805">
                        <th className="py-2.5 px-4 font-bold">Performance Attribute</th>
                        <th className="py-2.5 px-3 text-center font-bold">This Quarter</th>
                        <th className="py-2.5 px-3 text-center font-bold">Previous Quarter</th>
                        <th className="py-2.5 px-4 text-right font-bold">Variance (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                      {getComparativeMetrics.quarterly.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-755 dark:text-slate-355">
                          <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white">{comp.metric}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{comp.current}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-450">{comp.previous}</td>
                          <td className={`py-2.5 px-4 text-right font-mono font-black ${
                            comp.isPositive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'
                          }`}>
                            {comp.variance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quarterly Revenue Growth Chart */}
              <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-850 graph-section" id="quarterly-graph-section">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-850 bg-gradient-to-r from-slate-50 to-slate-50 dark:from-slate-950/30 dark:to-slate-950/30 -mx-6 px-6 pt-4 mb-4 rounded-t-3xl">
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Quarterly Revenue Growth Chart</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No data available</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerPrint('Quarterly Revenue Chart', 'quarterly-graph-section')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Printer size={11} /> Print
                    </button>
                    <button
                      onClick={() => triggerExport('PDF', 'Quarterly Revenue Chart')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-lg text-3xs font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </div>
                <div className="h-44 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-850" />
                      <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} 
                        itemStyle={{ color: '#94a3b8' }}
                      />
                      <Legend fontSize={9} wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="Transient" name="Transient Revenue" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Corporate" name="Corporate Contract" fill="#64748b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Quarterly Corporates & Nationalities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-150 dark:border-slate-850 text-xs">
                {/* Top Quarterly Corporates */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Quarterly Corporate Accounts Rank</span>
                    <TrendingUp size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Company</th>
                          <th className="py-2 px-2 text-center font-bold">Bookings</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.quarterly.corporates.slice(0, 4).map((corp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.bookings}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{corp.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(corp.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Quarterly Nationalities */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Quarterly Guest Demographics</span>
                    <Users size={12} className="text-slate-500" />
                  </div>
                  <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-mono text-[9px] uppercase text-slate-450 border-b border-slate-150 dark:border-slate-850">
                          <th className="py-2 px-3 font-bold">Nationality</th>
                          <th className="py-2 px-2 text-center font-bold">Guests</th>
                          <th className="py-2 px-2 text-center font-bold">Nights</th>
                          <th className="py-2 px-3 text-right font-bold">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                        {getTopCorporatesAndNationalities.quarterly.nationalities.slice(0, 4).map((nat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{nat.nationality}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.guestCount}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{nat.roomNights}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-400">{formatAmount(nat.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generated strategic recommendations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-slate-600 dark:text-slate-400" />
                <h4 className="text-sm font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">AI Strategic Recommendations</h4>
              </div>

              <p className="text-3xs text-slate-450 leading-normal">
                Real-time yield optimization suggestions recalculated instantly based on active property occupancy and rate-plan profiles.
              </p>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar animate-fade-in text-xs">
                {currentAiRecommendations.map((rec, i) => (
                  <div key={i} className="p-3 border border-slate-150 dark:border-slate-800 rounded-2xl bg-gradient-to-tr from-slate-50/20 to-slate-50/20 dark:from-slate-950/20 dark:to-slate-950/10 space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-mono font-black uppercase text-slate-650 dark:text-slate-400">
                      <span>{rec.category}</span>
                      <span className={`px-1.5 py-0.5 rounded ${rec.impact === 'High' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500 font-normal'}`}>
                        {rec.impact} Impact
                      </span>
                    </div>
                    <strong className="font-sans font-bold text-slate-900 dark:text-white text-3xs mt-1 block leading-tight">{rec.title}</strong>
                    <p className="text-[10px] text-slate-500 font-sans leading-normal mt-1">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* GIFT SHOP & SUPPLIES QUARTERLY REVIEWS */}
          <GiftShopSuppliesDeepDiveReview timeframe="quarterly" />

        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 6: REPORT DISTRIBUTION CENTER (SCHEDULES, APPROVALS, VERSIONING)
          ------------------------------------------------------------- */}
      {activeTab === 'center' && (
        <div className="space-y-6">
          
          {/* Top Section Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Automated schedulers list */}
            <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">
                    Automated Distribution Schedulers
                  </h4>
                  <p className="text-xs text-slate-450 mt-1">Configure automated operational dispatches to hotel stakeholders.</p>
                </div>

                <button
                  onClick={() => setShowAddScheduleModal(true)}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-sans font-black text-3xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} /> Create Schedule
                </button>
              </div>

              <div className="space-y-3">
                {scheduledSchedules.map((sch) => (
                  <div key={sch.id} className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex justify-between gap-4 items-center flex-wrap bg-slate-50/20 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white font-bold font-sans">{sch.reportName}</strong>
                        <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[8px] font-mono font-bold uppercase rounded border">
                          {sch.frequency}
                        </span>
                      </div>
                      <p className="text-3xs text-slate-450 leading-normal font-mono">
                        Subs: {sch.recipients.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">Next distribution</span>
                        <span className="text-3xs font-mono font-black text-slate-800 dark:text-slate-300">{sch.nextRun}</span>
                      </div>

                      <button
                        onClick={() => {
                          setScheduledSchedules(prev => prev.map(item => 
                            item.id === sch.id 
                              ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } 
                              : item
                          ));
                        }}
                        className={`px-3 py-1.5 font-bold font-sans uppercase rounded-xl text-3xs transition cursor-pointer ${
                          sch.status === 'Active'
                            ? 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-150'
                            : 'bg-slate-100 text-slate-550 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {sch.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Distribution list settings */}
            <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest font-mono">Email Subscriber Circles</h4>
                <button 
                  onClick={() => setShowAddEmailModal(true)} 
                  className="p-1 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-850 rounded"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="text-3xs text-slate-450 leading-normal">
                Approved corporate addresses in property directory. Automated summaries route directly to these nodes.
              </p>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto no-scrollbar">
                {emailList.map((em, idx) => (
                  <div key={idx} className="p-2.5 border border-slate-105 dark:border-slate-850 rounded-xl flex justify-between items-center bg-slate-50/20 text-3xs font-mono dark:text-slate-300">
                    <span className="truncate pr-2 font-semibold text-slate-700 dark:text-slate-300">{em}</span>
                    <button 
                      onClick={() => setEmailList(prev => prev.filter(item => item !== em))}
                      className="text-slate-400 hover:text-slate-600 transition"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Historical versions and approvals queue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-4">
            <div>
              <h4 className="text-sm font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">
                Report Approval & Generation Version history
              </h4>
              <p className="text-xs text-slate-450">Track recent historical printings and dispatch statuses for accountability audits.</p>
            </div>

            <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-3xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-mono text-[9px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4 font-bold">Document Identification</th>
                    <th className="py-2.5 px-3 font-bold">Generated By</th>
                    <th className="py-2.5 px-3 font-bold">Generation Time</th>
                    <th className="py-2.5 px-3 font-bold">File Size</th>
                    <th className="py-2.5 px-3 font-bold text-center">Status</th>
                    <th className="py-2.5 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                  {versionHistory.map((ver, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-750 dark:text-slate-350">
                      <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">{ver.reportName}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{ver.generatedBy}</td>
                      <td className="py-3 px-3 font-mono">{ver.timestamp}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{ver.fileSize}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          ver.status === 'Sent'
                            ? 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-400'
                            : 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-400 font-bold animate-pulse'
                        }`}>
                          {ver.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {ver.status === 'Draft' && (
                            <button
                              onClick={() => {
                                setVersionHistory(prev => prev.map(item => 
                                  item.id === ver.id ? { ...item, status: 'Approved' } : item
                                ));
                              }}
                              className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white font-mono text-4xs font-black uppercase rounded-lg transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => triggerExport('PDF', ver.reportName)}
                            className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-250 hover:text-slate-600 dark:hover:bg-slate-750 text-slate-400 rounded-lg transition"
                            title="Download PDF Archive"
                          >
                            <Download size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 7: SLA WARNINGS & NOTIFICATIONS SYSTEM BOARD
          ------------------------------------------------------------- */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-2">
            <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Active Manager Alerts & Warning Hub</h3>
            <p className="text-xs text-slate-450">
              Evaluates critical operational thresholds. Managers automatically get notified when boundaries are violated or outstanding tickets are active.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertsEvaluated.map((alt) => (
              <div 
                key={alt.id} 
                className={`p-5 border rounded-2xl flex gap-4 transition duration-200 bg-white dark:bg-slate-900 shadow-3xs ${
                  alt.triggered
                    ? 'border-slate-500/20 bg-slate-500/5 dark:bg-slate-950/10'
                    : 'border-slate-150 dark:border-slate-850 opacity-80'
                }`}
              >
                <div className="shrink-0">
                  {alt.triggered ? (
                    <div className="p-2 bg-slate-100 dark:bg-slate-950 text-slate-500 rounded-xl animate-bounce">
                      <AlertTriangle size={18} />
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl">
                      <CheckCircle2 size={18} className="text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-950 dark:text-white font-sans font-black uppercase text-3xs tracking-tight">
                      {alt.title}
                    </strong>
                    {alt.triggered && (
                      <span className="bg-slate-500 text-white font-mono text-4xs font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {alt.severity} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-3xs text-slate-500 font-sans leading-normal">
                    {alt.description}
                  </p>
                  
                  {alt.triggered && (
                    <div className="pt-1 flex items-center gap-4 text-4xs font-mono tracking-wider uppercase font-black">
                      <span className="text-slate-400">Escalated: Front Office Manager</span>
                      <button 
                        onClick={() => {
                          // Simulating override resolve action
                          alert(`Manual administrative clear override dispatched for warning: "${alt.title}"`);
                        }}
                        className="text-slate-600 hover:text-slate-800 font-bold"
                      >
                        Override Clear →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {auditExceptionsLog.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-900/40 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-950/10 space-y-3">
              <div className="flex items-center gap-2">
                <BadgeAlert size={14} className="text-slate-600" />
                <div>
                  <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Night Audit Exceptions</h5>
                  <p className="text-3xs text-slate-500">Logged during recent night audit execution.</p>
                </div>
              </div>
              <div className="overflow-auto max-h-48">
                <table className="w-full text-3xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 uppercase text-[9px]">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Owner</th>
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 px-2 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900/30">
                    {auditExceptionsLog.map((ex, idx) => (
                      <tr key={ex.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15">
                        <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-100">{ex.owner}</td>
                        <td className="py-2 px-2 text-slate-700 dark:text-slate-200">{ex.text}</td>
                        <td className="py-2 px-2 text-right text-slate-400">{new Date(ex.loggedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NIGHT AUDIT CHECKLIST MODAL */}
      <NightAuditChecklistModal
        isOpen={showAuditConfirm}
        onClose={() => setShowAuditConfirm(false)}
        onExecute={handleExecuteNightAudit}
        rooms={rooms}
        reservations={reservations}
        currentSystemDate={currentSystemDate}
        formatAmount={formatAmount}
        onLogExceptions={handleLogExceptions}
        onResolveFolio={handleResolveFolio}
        onResolveRoomStatus={handleResolveRoomStatus}
      />

      {/* CREATE AUTOMATED SCHEDULE DISPATCH TRIGGER DIALOGUE */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 text-slate-800 dark:text-slate-100">
            <div>
              <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Create Distribution Schedule</h3>
              <p className="text-xs text-slate-400 mt-1">Specify automated report delivery triggers directly to circles.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-400 pl-0.5">Report Target</label>
                <select
                  value={newScheduleName}
                  onChange={e => setNewScheduleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2.5 rounded-xl font-bold outline-none"
                >
                  <option value="No data">No data</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-450 pl-0.5">Delivery Frequency</label>
                <select
                  value={newScheduleFreq}
                  onChange={e => setNewScheduleFreq(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2.5 rounded-xl font-semibold outline-none"
                >
                  <option value="Daily">Daily Automated</option>
                  <option value="Weekly">Weekly Digest</option>
                  <option value="Monthly">Monthly General Pack</option>
                  <option value="Quarterly">Quarterly Strategic Review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-450 pl-0.5">Subscribe recipient</label>
                <select
                  value={newScheduleEmail}
                  onChange={e => setNewScheduleEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2.5 rounded-xl outline-none"
                >
                  <option value="">Select corporate circle address...</option>
                  {emailList.map((em, idx) => (
                    <option key={idx} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 font-mono uppercase text-3xs font-semibold">
              <button
                onClick={() => setShowAddScheduleModal(false)}
                className="bg-slate-50 dark:bg-slate-950 text-slate-400 py-2 px-3 rounded-xl hover:bg-slate-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newScheduleEmail) {
                    alert('Please select a recipient.');
                    return;
                  }
                  
                  // Add schedule to collection dynamically
                  const newScheduleObj: ScheduledReport = {
                    id: `sch-${Math.floor(100 + Math.random() * 900)}`,
                    reportName: newScheduleName,
                    frequency: newScheduleFreq,
                    recipients: [newScheduleEmail],
                    status: 'Active',
                    nextRun: 'No data'
                  };

                  setScheduledSchedules(prev => [newScheduleObj, ...prev]);

                  // Best-effort backend persistence (falls back to local state silently).
                  createReportSchedule({
                    reportName: newScheduleName,
                    frequency: newScheduleFreq,
                    recipients: [newScheduleEmail],
                    status: 'Active',
                    nextRun: newScheduleObj.nextRun
                  });

                  // Push draft verification to history
                  const newVer: VersionEntry = {
                    id: `ver-${Math.floor(100 + Math.random() * 900)}`,
                    reportName: newScheduleName,
                    generatedBy: 'User Schedule Setup',
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    fileSize: '0 KB',
                    status: 'Draft'
                  };
                  setVersionHistory(prev => [newVer, ...prev]);

                  setShowAddScheduleModal(false);
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white font-sans font-black py-2.5 px-4 rounded-xl transition duration-150"
              >
                Create Scheduler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW EMAIL SUBSCRIBER POPUP */}
      {showAddEmailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-sm space-y-4 text-slate-800 dark:text-slate-100">
            <div>
              <h3 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">Add Corporate Circle</h3>
              <p className="text-xs text-slate-400 mt-1">Enroll an approved email address for distribution pipelines.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-400 pl-0.5">Email Node Address</label>
              <input
                type="email"
                placeholder="No data"
                value={newEmailInput}
                onChange={e => setNewEmailInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2.5 rounded-xl font-bold font-mono text-xs text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 font-mono uppercase text-3xs font-semibold">
              <button
                onClick={() => {
                  setShowAddEmailModal(false);
                  setNewEmailInput('');
                }}
                className="bg-slate-50 dark:bg-slate-950 text-slate-400 py-2 px-3 rounded-xl hover:bg-slate-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newEmailInput || !newEmailInput.includes('@')) {
                    alert('Please specify a valid email address.');
                    return;
                  }
                  setEmailList(prev => [...prev, newEmailInput]);
                  setNewEmailInput('');
                  setShowAddEmailModal(false);
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white font-sans font-black py-2.5 px-4 rounded-xl transition duration-150"
              >
                Enroll Address
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
