/**
 * Operations Manager Portal
 * A single operational command center for day-to-day property management
 * Landing view = Daily Briefing (not KPI dashboard - that's Executive Portal)
 * Focus: "what needs my attention today, and let me handle it from here"
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  Users,
  ArrowRightLeft,
  LogOut,
  StickyNote,
  RefreshCw,
  Bell,
  Calendar,
  Clock,
  User,
  Bed,
  Utensils,
  Wrench,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FileText,
  Settings,
  LogIn,
  Star,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Activity,
  ShoppingCart,
  DollarSign,
  Grid3x3,
  FileBarChart,
  Download,
  MailOpen,
  Archive,
  CalendarDays,
  CircleDot,
  TrendingDown,
  BarChart3,
  PiggyBank,
  Percent,
  Save,
  Eye
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

type OperationsView = 
  | 'overview'
  | 'briefing' 
  | 'action-queue' 
  | 'escalations' 
  | 'staffing' 
  | 'handoffs' 
  | 'handover' 
  | 'notes'
  | 'reports'
  | 'financial-reports';

type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
type ActionItemStatus = 'New' | 'InProgress' | 'Resolved' | 'Dismissed';
type EscalationSeverity = 'Minor' | 'Moderate' | 'Major' | 'Critical';
type EscalationStatus = 'Open' | 'InProgress' | 'Resolved' | 'EscalatedFurther';
type Shift = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

interface DailyBriefing {
  briefingId: string;
  briefingDate: string;
  arrivalsCount: number;
  departuresCount: number;
  vipArrivals: Array<{ name: string; room: string; notes: string }>;
  eventsToday: Array<{ name: string; time: string; location: string; type: string }>;
  staffingGapCount: number;
  openEscalationCount: number;
  generatedAt: string;
}

interface ActionItem {
  itemId: string;
  sourceModule: string;
  sourceRecordId: string;
  itemType: string;
  title: string;
  description: string;
  priority: Priority;
  status: ActionItemStatus;
  assignedTo: string | null;
  dueBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  requiresApprovalAmount: number | null;
}

interface Escalation {
  escalationId: string;
  raisedBy: string;
  department: string;
  linkedGuestId: string | null;
  linkedRoomId: string | null;
  category: string;
  severity: EscalationSeverity;
  description: string;
  status: EscalationStatus;
  assignedTo: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface EscalationEvent {
  eventId: string;
  escalationId: string;
  actor: string;
  note: string;
  statusChange: string | null;
  createdAt: string;
}

interface StaffingStatus {
  id: string;
  department: string;
  statusDate: string;
  shift: Shift;
  scheduledCount: number;
  presentCount: number;
  gapCount: number;
  coveragePlan: string | null;
  updatedAt: string;
}

interface Handoff {
  handoffId: string;
  fromDepartment: string;
  toDepartment: string;
  sourceRecordType: string;
  sourceRecordId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface HandoverNote {
  noteId: string;
  outgoingManager: string;
  incomingManager: string | null;
  shiftDate: string;
  shiftPeriod: string;
  summary: string;
  openItemRefs: string[];
  acknowledgedAt: string | null;
  createdAt: string;
}

interface ManagerNote {
  noteId: string;
  linkedType: string;
  linkedId: string | null;
  author: string;
  text: string;
  visibleToRoles: string[];
  createdAt: string;
}

type HealthIndicator = 'Good' | 'Attention' | 'Critical';
type StaffingLevel = 'FullyStaffed' | 'Gap' | 'Overstaffed';

type DepartmentName = 'FrontOffice' | 'Housekeeping' | 'FandB' | 'Maintenance' | 'HR' | 'Procurement' | 'SalesEvents' | 'GuestPortal';

interface DepartmentOverviewCard {
  department: DepartmentName;
  statusSummary: string;
  headlineMetric: number | string;
  headlineMetricLabel: string;
  openActionItemCount: number;
  staffingStatus: StaffingLevel;
  lastUpdated: string;
  healthIndicator: HealthIndicator;
}

type ReportCategory = 'DailyOperations' | 'Housekeeping' | 'Maintenance' | 'FandB' | 'FrontOffice' | 'HR' | 'Procurement' | 'SalesEvents' | 'CrossDepartment';
type ReportDateRange = 'Today' | 'Yesterday' | 'WTD' | 'MTD' | 'Custom';
type ReportFormat = 'PDF' | 'Excel' | 'CSV';
type ReportStatus = 'Ready' | 'Failed' | 'Generating';

type ScheduleFrequency = 'Daily' | 'Weekly' | 'Monthly';

interface ReportDefinition {
  reportId: string;
  name: string;
  category: ReportCategory;
  description: string;
  defaultDateRange: ReportDateRange;
  fields: string[];
  outputFormats: ReportFormat[];
}

interface GeneratedReport {
  generatedReportId: string;
  reportId: string;
  reportName: string;
  generatedBy: string;
  dateRangeUsed: string;
  generatedAt: string;
  format: ReportFormat;
  fileRef: string;
  status: ReportStatus;
}

interface ReportSchedule {
  scheduleId: string;
  reportId: string;
  reportName: string;
  recipientList: string[];
  frequency: ScheduleFrequency;
  format: ReportFormat;
  isActive: boolean;
  lastSentAt: string | null;
}

type FinancialReportType = 'Monthly' | 'Quarterly' | 'YearOverYear';
type DepartmentScope = 'AllDepartments' | 'RoomsOnly' | 'FandBOnly' | 'Custom';
type FinancialScheduleFrequency = 'Monthly' | 'Quarterly' | 'Annual';
type PeriodType = 'Month' | 'Quarter' | 'YTD';

interface FinancialReportDefinition {
  reportId: string;
  name: string;
  type: FinancialReportType;
  departmentScope: DepartmentScope;
  includesBudgetComparison: boolean;
  includesPriorPeriodComparison: boolean;
  outputFormats: ReportFormat[];
}

interface MonthlyFinancialReport {
  reportInstanceId: string;
  month: string;
  revenueByDepartment: Record<string, number>;
  expenseByDepartment: Record<string, number>;
  undistributedExpenses: number;
  fixedCharges: number;
  gop: number;
  netOperatingIncome: number;
  budgetVariance: Record<string, { actual: number; budget: number; varianceAmount: number; variancePercent: number }>;
  occupancyForMonth: number;
  adrForMonth: number;
  revparForMonth: number;
  gopparForMonth: number;
  generatedAt: string;
  sourceSnapshotDate: string;
}

interface QuarterlyFinancialReport {
  reportInstanceId: string;
  quarter: string;
  monthlyBreakdown: MonthlyFinancialReport[];
  quarterTotalRevenue: number;
  quarterTotalExpense: number;
  quarterGOP: number;
  quarterNetOperatingIncome: number;
  quarterOverQuarterVariance: Record<string, { amount: number; percent: number }>;
  quarterBudgetVariance: Record<string, { actual: number; budget: number; varianceAmount: number; variancePercent: number }>;
  averageOccupancy: number;
  averageADR: number;
  averageRevPAR: number;
  generatedAt: string;
}

interface YearOverYearReport {
  reportInstanceId: string;
  periodType: PeriodType;
  currentPeriodLabel: string;
  priorPeriodLabel: string;
  currentPeriodFinancials: Record<string, number>;
  priorPeriodFinancials: Record<string, number>;
  varianceAmount: Record<string, number>;
  variancePercent: Record<string, number>;
  occupancyCurrentVsPrior: { current: number; prior: number };
  adrCurrentVsPrior: { current: number; prior: number };
  revparCurrentVsPrior: { current: number; prior: number };
  commentary: string | null;
  generatedAt: string;
}

const OperationsManagerPortal = ({ embedded = false, forcedView, hideNav = false }: { embedded?: boolean; forcedView?: OperationsView; hideNav?: boolean } = {}) => {
  const { addNotification } = useERP();
  const [internalView, setInternalView] = useState<OperationsView>('briefing');
  const activeView = forcedView ?? internalView;
  const setActiveView = (v: OperationsView) => { if (!forcedView) setInternalView(v); };
  const [loading, setLoading] = useState(false);

  // Data states
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [escalationEvents, setEscalationEvents] = useState<EscalationEvent[]>([]);
  const [staffing, setStaffing] = useState<StaffingStatus[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [handoverNotes, setHandoverNotes] = useState<HandoverNote[]>([]);
  const [managerNotes, setManagerNotes] = useState<ManagerNote[]>([]);

  // Overview & Reports states
  const [departmentOverview, setDepartmentOverview] = useState<DepartmentOverviewCard[]>([]);
  const [reportDefinitions, setReportDefinitions] = useState<ReportDefinition[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [reportDateRange, setReportDateRange] = useState<ReportDateRange>('Today');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportSubView, setReportSubView] = useState<'library' | 'history' | 'schedules'>('library');

  // Financial Reports states
  const [financialReportDefs, setFinancialReportDefs] = useState<FinancialReportDefinition[]>([]);
  const [monthlyFinancialReport, setMonthlyFinancialReport] = useState<MonthlyFinancialReport | null>(null);
  const [quarterlyFinancialReport, setQuarterlyFinancialReport] = useState<QuarterlyFinancialReport | null>(null);
  const [yoyReport, setYoyReport] = useState<YearOverYearReport | null>(null);
  const [financialSubView, setFinancialSubView] = useState<'monthly' | 'quarterly' | 'yoy'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7));
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [yoyPeriodType, setYoyPeriodType] = useState<PeriodType>('Month');
  const [yoyCommentary, setYoyCommentary] = useState<string>('');
  const [savingCommentary, setSavingCommentary] = useState(false);

  // Filter states
  const [actionFilter, setActionFilter] = useState<'all' | 'New' | 'InProgress' | 'Resolved'>('all');
  const [escalationFilter, setEscalationFilter] = useState<'all' | 'Open' | 'InProgress' | 'Resolved'>('all');

  // API calls
  const fetchBriefing = async (date?: string) => {
    setLoading(true);
    try {
      const queryDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/operations/briefing?date=${queryDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBriefing(data);
      }
    } catch (error) {
      console.error('Failed to fetch briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionItems = async () => {
    try {
      const response = await fetch('/api/operations/action-items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActionItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch action items:', error);
    }
  };

  const fetchEscalations = async () => {
    try {
      const response = await fetch('/api/operations/escalations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEscalations(data);
      }
    } catch (error) {
      console.error('Failed to fetch escalations:', error);
    }
  };

  const fetchEscalationDetail = async (escalationId: string) => {
    try {
      const response = await fetch(`/api/operations/escalations/${escalationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedEscalation(data.escalation);
        setEscalationEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch escalation detail:', error);
    }
  };

  const fetchStaffing = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/operations/staffing?date=${today}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffing(data);
      }
    } catch (error) {
      console.error('Failed to fetch staffing:', error);
    }
  };

  const fetchHandoffs = async () => {
    try {
      const response = await fetch('/api/operations/handoffs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHandoffs(data);
      }
    } catch (error) {
      console.error('Failed to fetch handoffs:', error);
    }
  };

  const fetchHandoverNotes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/operations/handover?date=${today}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHandoverNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch handover notes:', error);
    }
  };

  const fetchManagerNotes = async () => {
    try {
      const response = await fetch('/api/operations/notes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setManagerNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch manager notes:', error);
    }
  };

  const fetchDepartmentOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/operations/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartmentOverview(data);
      }
    } catch (error) {
      console.error('Failed to fetch department overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDefinitions = async () => {
    try {
      const response = await fetch('/api/operations/reports/definitions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportDefinitions(data);
      }
    } catch (error) {
      console.error('Failed to fetch report definitions:', error);
    }
  };

  const fetchGeneratedReports = async () => {
    try {
      const response = await fetch('/api/operations/reports/generated', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch generated reports:', error);
    }
  };

  const fetchReportSchedules = async () => {
    try {
      const response = await fetch('/api/operations/reports/schedules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportSchedules(data);
      }
    } catch (error) {
      console.error('Failed to fetch report schedules:', error);
    }
  };

  const generateReport = async (reportId: string) => {
    setGeneratingReport(true);
    try {
      const response = await fetch('/api/operations/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}`
        },
        body: JSON.stringify({ reportId, dateRange: reportDateRange, format: reportFormat })
      });
      if (response.ok) {
        addNotification('Report generated successfully', 'success', 'Executive');
        fetchGeneratedReports();
      } else {
        addNotification('Failed to generate report', 'warning', 'Executive');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      addNotification('Failed to generate report', 'warning', 'Executive');
    } finally {
      setGeneratingReport(false);
    }
  };

  const fetchFinancialReportDefs = async () => {
    try {
      const response = await fetch('/api/operations/financial-reports/definitions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFinancialReportDefs(data);
      }
    } catch (error) {
      console.error('Failed to fetch financial report definitions:', error);
    }
  };

  const fetchMonthlyFinancialReport = async (month: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/operations/financial-reports/monthly?month=${month}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMonthlyFinancialReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuarterlyFinancialReport = async (quarter: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/operations/financial-reports/quarterly?quarter=${quarter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQuarterlyFinancialReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch quarterly financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYoYReport = async (periodType: PeriodType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/operations/financial-reports/yoy?periodType=${periodType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setYoyReport(data);
        setYoyCommentary(data.commentary || '');
      }
    } catch (error) {
      console.error('Failed to fetch YoY report:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveYoYCommentary = async () => {
    if (!yoyReport) return;
    setSavingCommentary(true);
    try {
      const response = await fetch('/api/operations/financial-reports/yoy/commentary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}`
        },
        body: JSON.stringify({ reportInstanceId: yoyReport.reportInstanceId, commentary: yoyCommentary })
      });
      if (response.ok) {
        addNotification('Commentary saved', 'success', 'Executive');
        setYoyReport({ ...yoyReport, commentary: yoyCommentary });
      } else {
        addNotification('Failed to save commentary', 'warning', 'Executive');
      }
    } catch (error) {
      console.error('Failed to save commentary:', error);
      addNotification('Failed to save commentary', 'warning', 'Executive');
    } finally {
      setSavingCommentary(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBriefing();
    fetchActionItems();
    fetchEscalations();
    fetchStaffing();
    fetchHandoffs();
    fetchHandoverNotes();
    fetchManagerNotes();
    fetchDepartmentOverview();
    fetchReportDefinitions();
    fetchGeneratedReports();
    fetchReportSchedules();
    fetchFinancialReportDefs();
  }, []);

  // Refresh data when view changes
  useEffect(() => {
    switch (activeView) {
      case 'overview':
        fetchDepartmentOverview();
        break;
      case 'briefing':
        fetchBriefing();
        break;
      case 'action-queue':
        fetchActionItems();
        break;
      case 'escalations':
        fetchEscalations();
        break;
      case 'staffing':
        fetchStaffing();
        break;
      case 'handoffs':
        fetchHandoffs();
        break;
      case 'handover':
        fetchHandoverNotes();
        break;
      case 'notes':
        fetchManagerNotes();
        break;
      case 'reports':
        fetchReportDefinitions();
        fetchGeneratedReports();
        fetchReportSchedules();
        break;
      case 'financial-reports':
        fetchFinancialReportDefs();
        if (financialSubView === 'monthly') fetchMonthlyFinancialReport(selectedMonth);
        else if (financialSubView === 'quarterly') fetchQuarterlyFinancialReport(selectedQuarter || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
        else fetchYoYReport(yoyPeriodType);
        break;
    }
  }, [activeView]);

  // Helper functions
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Urgent': return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50';
      case 'High': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'Normal': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getSeverityColor = (severity: EscalationSeverity) => {
    switch (severity) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50';
      case 'Major': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/50';
      case 'Minor': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
      case 'New':
      case 'Sent':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50';
      case 'InProgress':
      case 'Acknowledged':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'Resolved':
      case 'Completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50';
      case 'Dismissed':
      case 'EscalatedFurther':
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'FrontOffice': return <Building2 className="w-4 h-4" />;
      case 'FandB': return <Utensils className="w-4 h-4" />;
      case 'Housekeeping': return <Bed className="w-4 h-4" />;
      case 'Maintenance': return <Wrench className="w-4 h-4" />;
      case 'HR': return <Users className="w-4 h-4" />;
      case 'Procurement': return <ShoppingCart className="w-4 h-4" />;
      case 'SalesEvents': return <Calendar className="w-4 h-4" />;
      case 'GuestPortal': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Navigation items
  const navItems = [
    { id: 'overview' as OperationsView, label: 'Overview', icon: Grid3x3 },
    { id: 'briefing' as OperationsView, label: 'Daily Briefing', icon: LayoutDashboard },
    { id: 'action-queue' as OperationsView, label: 'Action Queue', icon: Inbox, badge: actionItems.filter(i => i.status === 'New').length },
    { id: 'escalations' as OperationsView, label: 'Escalations', icon: AlertTriangle, badge: escalations.filter(e => e.status === 'Open').length },
    { id: 'staffing' as OperationsView, label: 'Staffing Status', icon: Users },
    { id: 'handoffs' as OperationsView, label: 'Handoffs', icon: ArrowRightLeft },
    { id: 'handover' as OperationsView, label: 'Shift Handover', icon: LogOut },
    { id: 'notes' as OperationsView, label: 'Manager Notes', icon: StickyNote },
    { id: 'reports' as OperationsView, label: 'Reports', icon: FileBarChart },
    { id: 'financial-reports' as OperationsView, label: 'Financial Reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="operations-portal-module">
      {/* Header — hidden when embedded in UnifiedPortal */}
      {!embedded && (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Operations Command</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Operations Manager Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              switch (activeView) {
                case 'overview': fetchDepartmentOverview(); break;
                case 'briefing': fetchBriefing(); break;
                case 'action-queue': fetchActionItems(); break;
                case 'escalations': fetchEscalations(); break;
                case 'staffing': fetchStaffing(); break;
                case 'handoffs': fetchHandoffs(); break;
                case 'handover': fetchHandoverNotes(); break;
                case 'notes': fetchManagerNotes(); break;
                case 'reports':
                  fetchReportDefinitions();
                  fetchGeneratedReports();
                  fetchReportSchedules();
                  break;
                case 'financial-reports':
                  fetchFinancialReportDefs();
                  if (financialSubView === 'monthly') fetchMonthlyFinancialReport(selectedMonth);
                  else if (financialSubView === 'quarterly') fetchQuarterlyFinancialReport(selectedQuarter || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
                  else fetchYoYReport(yoyPeriodType);
                  break;
              }
              addNotification('Data refreshed', 'success', 'Executive');
            }}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="relative px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-800">
            <Bell size={14} />
            {(actionItems.filter(i => i.status === 'New').length + escalations.filter(e => e.status === 'Open').length) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {actionItems.filter(i => i.status === 'New').length + escalations.filter(e => e.status === 'Open').length}
              </span>
            )}
          </button>
        </div>
      </div>
      )}

      {/* View Selector — hidden when hideNav is set by UnifiedPortal */}
      {!hideNav && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeView === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Content Views */}
      <div>
        {activeView === 'overview' && (
          <DepartmentOverviewView
            departments={departmentOverview}
            loading={loading}
            onRefresh={fetchDepartmentOverview}
            getModuleIcon={getModuleIcon}
          />
        )}

        {activeView === 'briefing' && (
          <DailyBriefingView 
            briefing={briefing} 
            loading={loading} 
            onRefresh={fetchBriefing}
          />
        )}

        {activeView === 'action-queue' && (
          <ActionQueueView 
            items={actionItems} 
            filter={actionFilter}
            onFilterChange={setActionFilter}
            onRefresh={fetchActionItems}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getModuleIcon={getModuleIcon}
          />
        )}

        {activeView === 'escalations' && (
          <EscalationsView 
            escalations={escalations}
            selectedEscalation={selectedEscalation}
            escalationEvents={escalationEvents}
            filter={escalationFilter}
            onFilterChange={setEscalationFilter}
            onSelectEscalation={fetchEscalationDetail}
            onRefresh={fetchEscalations}
            getSeverityColor={getSeverityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {activeView === 'staffing' && (
          <StaffingView 
            staffing={staffing}
            onRefresh={fetchStaffing}
          />
        )}

        {activeView === 'handoffs' && (
          <HandoffsView 
            handoffs={handoffs}
            onRefresh={fetchHandoffs}
            getStatusColor={getStatusColor}
          />
        )}

        {activeView === 'handover' && (
          <HandoverView 
            notes={handoverNotes}
            onRefresh={fetchHandoverNotes}
          />
        )}

        {activeView === 'notes' && (
          <ManagerNotesView 
            notes={managerNotes}
            onRefresh={fetchManagerNotes}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            definitions={reportDefinitions}
            generatedReports={generatedReports}
            schedules={reportSchedules}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
            reportDateRange={reportDateRange}
            setReportDateRange={setReportDateRange}
            reportFormat={reportFormat}
            setReportFormat={setReportFormat}
            generatingReport={generatingReport}
            onGenerate={generateReport}
            onRefreshDefinitions={fetchReportDefinitions}
            onRefreshGenerated={fetchGeneratedReports}
            onRefreshSchedules={fetchReportSchedules}
            subView={reportSubView}
            setSubView={setReportSubView}
            addNotification={addNotification}
          />
        )}

        {activeView === 'financial-reports' && (
          <FinancialReportsView
            definitions={financialReportDefs}
            monthlyReport={monthlyFinancialReport}
            quarterlyReport={quarterlyFinancialReport}
            yoyReport={yoyReport}
            subView={financialSubView}
            setSubView={setFinancialSubView}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedQuarter={selectedQuarter}
            setSelectedQuarter={setSelectedQuarter}
            yoyPeriodType={yoyPeriodType}
            setYoyPeriodType={setYoyPeriodType}
            yoyCommentary={yoyCommentary}
            setYoyCommentary={setYoyCommentary}
            savingCommentary={savingCommentary}
            onSaveCommentary={saveYoYCommentary}
            loading={loading}
            onFetchMonthly={fetchMonthlyFinancialReport}
            onFetchQuarterly={fetchQuarterlyFinancialReport}
            onFetchYoY={fetchYoYReport}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DAILY BRIEFING VIEW
// ============================================================================

const DailyBriefingView = ({ 
  briefing, 
  loading, 
  onRefresh 
}: { 
  briefing: DailyBriefing | null;
  loading: boolean;
  onRefresh: () => void;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No briefing data available</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Generate Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<ArrowUp className="w-5 h-5 text-emerald-600" />}
          label="Arrivals Today"
          value={briefing.arrivalsCount}
          color="emerald"
        />
        <MetricCard
          icon={<ArrowDown className="w-5 h-5 text-blue-600" />}
          label="Departures Today"
          value={briefing.departuresCount}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-amber-600" />}
          label="Staffing Gaps"
          value={briefing.staffingGapCount}
          color="amber"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          label="Open Escalations"
          value={briefing.openEscalationCount}
          color="rose"
        />
      </div>

      {/* VIP Arrivals */}
      {briefing.vipArrivals && briefing.vipArrivals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">VIP Arrivals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefing.vipArrivals.map((vip, idx) => (
              <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">{vip.name}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Room: {vip.room}</p>
                {vip.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">{vip.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Today */}
      {briefing.eventsToday && briefing.eventsToday.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Events Today</h3>
          </div>
          <div className="space-y-3">
            {briefing.eventsToday.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{event.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Briefing status: <span className="font-bold text-emerald-600 dark:text-emerald-400">Generated</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Last updated: {new Date(briefing.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50',
    rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-2 ${colorClasses[color] || ''}`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
};

// ============================================================================
// ACTION QUEUE VIEW
// ============================================================================

const ActionQueueView = ({
  items,
  filter,
  onFilterChange,
  onRefresh,
  getPriorityColor,
  getStatusColor,
  getModuleIcon,
}: {
  items: ActionItem[];
  filter: 'all' | 'New' | 'InProgress' | 'Resolved';
  onFilterChange: (filter: 'all' | 'New' | 'InProgress' | 'Resolved') => void;
  onRefresh: () => void;
  getPriorityColor: (priority: Priority) => string;
  getStatusColor: (status: string) => string;
  getModuleIcon: (module: string) => React.ReactNode;
}) => {
  const filteredItems = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'New', 'InProgress', 'Resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/([A-Z])/g, ' $1').trim()}
            {status !== 'all' && (
              <span className="ml-2 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                {items.filter(i => i.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No action items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.itemId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getModuleIcon(item.sourceModule)}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sourceModule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(item.status)}`}>
                    {item.status.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{item.description}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                  {item.dueBy && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(item.dueBy).toLocaleDateString()}
                    </span>
                  )}
                  {item.requiresApprovalAmount && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${item.requiresApprovalAmount.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ESCALATIONS VIEW
// ============================================================================

const EscalationsView = ({
  escalations,
  selectedEscalation,
  escalationEvents,
  filter,
  onFilterChange,
  onSelectEscalation,
  onRefresh,
  getSeverityColor,
  getStatusColor,
}: {
  escalations: Escalation[];
  selectedEscalation: Escalation | null;
  escalationEvents: EscalationEvent[];
  filter: 'all' | 'Open' | 'InProgress' | 'Resolved';
  onFilterChange: (filter: 'all' | 'Open' | 'InProgress' | 'Resolved') => void;
  onSelectEscalation: (id: string) => void;
  onRefresh: () => void;
  getSeverityColor: (severity: EscalationSeverity) => string;
  getStatusColor: (status: string) => string;
}) => {
  const filteredEscalations = filter === 'all' ? escalations : escalations.filter(e => e.status === filter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'Open', 'InProgress', 'Resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/([A-Z])/g, ' $1').trim()}
            {status !== 'all' && (
              <span className="ml-2 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                {escalations.filter(e => e.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Escalations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: List */}
        <div className="space-y-3">
          {filteredEscalations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No escalations found</p>
            </div>
          ) : (
            filteredEscalations.map((escalation) => (
              <div
                key={escalation.escalationId}
                onClick={() => onSelectEscalation(escalation.escalationId)}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  selectedEscalation?.escalationId === escalation.escalationId
                    ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{escalation.category}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{escalation.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getSeverityColor(escalation.severity)}`}>
                      {escalation.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(escalation.status)}`}>
                      {escalation.status.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{escalation.description}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {new Date(escalation.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right: Detail */}
        {selectedEscalation && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Escalation Details</h3>
              <button
                onClick={() => onSelectEscalation('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{selectedEscalation.category}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{selectedEscalation.department}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getSeverityColor(selectedEscalation.severity)}`}>
                    {selectedEscalation.severity}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{selectedEscalation.description}</p>
              </div>
            </div>

            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Timeline</h4>
            <div className="space-y-3">
              {escalationEvents.length === 0 ? (
                <p className="text-xs text-slate-500">No events recorded yet</p>
              ) : (
                escalationEvents.map((event) => (
                  <div key={event.eventId} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-800 dark:text-slate-100">{event.note}</p>
                      {event.statusChange && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          Status changed to {event.statusChange}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STAFFING VIEW
// ============================================================================

const StaffingView = ({ staffing, onRefresh }: { staffing: StaffingStatus[]; onRefresh: () => void }) => {
  return (
    <div className="space-y-4">
      {staffing.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No staffing data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffing.map((status) => (
            <div
              key={status.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{status.department}</h4>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                  {status.shift}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-xl font-black text-slate-900 dark:text-white">{status.scheduledCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled</p>
                </div>
                <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-700/50">
                  <p className="text-xl font-black text-emerald-600">{status.presentCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Present</p>
                </div>
                <div className="text-center bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3 border border-rose-200 dark:border-rose-700/50">
                  <p className={`text-xl font-black ${status.gapCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                    {status.gapCount}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gap</p>
                </div>
              </div>

              {status.coveragePlan && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 border border-amber-200 dark:border-amber-700/50">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Coverage Plan:</span> {status.coveragePlan}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 mt-4 font-medium">
                Updated: {new Date(status.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HANDOFFS VIEW
// ============================================================================

const HandoffsView = ({ handoffs, onRefresh, getStatusColor }: { handoffs: Handoff[]; onRefresh: () => void; getStatusColor: (status: string) => string }) => {
  return (
    <div className="space-y-4">
      {handoffs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
          <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No handoffs in progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {handoffs.map((handoff) => (
            <div
              key={handoff.handoffId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{handoff.fromDepartment}</span>
                    <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">{handoff.toDepartment}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(handoff.status)}`}>
                  {handoff.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {handoff.sourceRecordType}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(handoff.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HANDOVER VIEW
// ============================================================================

const HandoverView = ({ notes, onRefresh }: { notes: HandoverNote[]; onRefresh: () => void }) => {
  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
          <LogOut className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No handover notes recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.noteId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    {note.shiftPeriod} Shift - {new Date(note.shiftDate).toLocaleDateString()}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Outgoing: {note.outgoingManager}
                  </p>
                </div>
                {note.acknowledgedAt ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Acknowledged
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    Pending Acknowledgment
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">{note.summary}</p>

              {note.openItemRefs && note.openItemRefs.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 border border-amber-200 dark:border-amber-700/50">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Carried Forward Items: {note.openItemRefs.length}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 mt-4 font-medium">
                Created: {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MANAGER NOTES VIEW
// ============================================================================

const ManagerNotesView = ({ notes, onRefresh }: { notes: ManagerNote[]; onRefresh: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg">
          <Plus className="w-3 h-3" />
          New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
          <StickyNote className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No manager notes recorded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.noteId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-full">
                  {note.linkedType}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 line-clamp-3">{note.text}</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  By: {note.author}
                </span>
                {note.visibleToRoles && note.visibleToRoles.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    Visible to: {note.visibleToRoles.join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DEPARTMENT OVERVIEW VIEW
// ============================================================================

const DepartmentOverviewView = ({
  departments,
  loading,
  onRefresh,
  getModuleIcon,
}: {
  departments: DepartmentOverviewCard[];
  loading: boolean;
  onRefresh: () => void;
  getModuleIcon: (module: string) => React.ReactNode;
}) => {
  const getHealthConfig = (health: HealthIndicator) => {
    switch (health) {
      case 'Good':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50', dot: 'bg-emerald-500', label: 'Good' };
      case 'Attention':
        return { color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50', dot: 'bg-amber-500', label: 'Attention' };
      case 'Critical':
        return { color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50', dot: 'bg-rose-500', label: 'Critical' };
      default:
        return { color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700', dot: 'bg-slate-400', label: 'Unknown' };
    }
  };

  const getStaffingBadge = (status: StaffingLevel) => {
    switch (status) {
      case 'FullyStaffed':
        return { label: 'Fully Staffed', className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' };
      case 'Gap':
        return { label: 'Staffing Gap', className: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' };
      case 'Overstaffed':
        return { label: 'Overstaffed', className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' };
      default:
        return { label: status, className: 'text-slate-600 bg-slate-50 dark:bg-slate-800' };
    }
  };

  const departmentLabel = (dept: DepartmentName): string => {
    const labels: Record<DepartmentName, string> = {
      FrontOffice: 'Front Office',
      Housekeeping: 'Housekeeping',
      FandB: 'F&B',
      Maintenance: 'Maintenance & Engineering',
      HR: 'HR & Payroll',
      Procurement: 'Procurement & Stores',
      SalesEvents: 'Sales & Events',
      GuestPortal: 'Guest Portal',
    };
    return labels[dept] || dept;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
        <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No department data available</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Refresh Overview
        </button>
      </div>
    );
  }

  const criticalCount = departments.filter(d => d.healthIndicator === 'Critical').length;
  const attentionCount = departments.filter(d => d.healthIndicator === 'Attention').length;
  const goodCount = departments.filter(d => d.healthIndicator === 'Good').length;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{goodCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Good</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{attentionCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attention</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{criticalCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical</p>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const health = getHealthConfig(dept.healthIndicator);
          const staffing = getStaffingBadge(dept.staffingStatus);
          return (
            <div
              key={dept.department}
              className={`bg-white dark:bg-slate-900 border-2 p-6 rounded-3xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
                dept.healthIndicator === 'Critical'
                  ? 'border-rose-200 dark:border-rose-700/50'
                  : dept.healthIndicator === 'Attention'
                  ? 'border-amber-200 dark:border-amber-700/50'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getModuleIcon(dept.department)}
                  <span className="text-xs font-black text-slate-900 dark:text-white">{departmentLabel(dept.department)}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${health.color}`}>
                  <div className={`w-2 h-2 rounded-full ${health.dot}`} />
                  <span className="text-[9px] font-black uppercase tracking-wider">{health.label}</span>
                </div>
              </div>

              {/* Headline Metric */}
              <div className="mb-4">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{dept.headlineMetric}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{dept.headlineMetricLabel}</p>
              </div>

              {/* Status Summary */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{dept.statusSummary}</p>

              {/* Footer Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Inbox className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{dept.openActionItemCount} open</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${staffing.className}`}>
                  {staffing.label}
                </span>
              </div>

              <p className="text-[9px] text-slate-400 mt-3 font-medium">
                Updated: {new Date(dept.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// REPORTS VIEW
// ============================================================================

const ReportsView = ({
  definitions,
  generatedReports,
  schedules,
  selectedReport,
  onSelectReport,
  reportDateRange,
  setReportDateRange,
  reportFormat,
  setReportFormat,
  generatingReport,
  onGenerate,
  onRefreshDefinitions,
  onRefreshGenerated,
  onRefreshSchedules,
  subView,
  setSubView,
  addNotification,
}: {
  definitions: ReportDefinition[];
  generatedReports: GeneratedReport[];
  schedules: ReportSchedule[];
  selectedReport: ReportDefinition | null;
  onSelectReport: (report: ReportDefinition | null) => void;
  reportDateRange: ReportDateRange;
  setReportDateRange: (range: ReportDateRange) => void;
  reportFormat: ReportFormat;
  setReportFormat: (format: ReportFormat) => void;
  generatingReport: boolean;
  onGenerate: (reportId: string) => void;
  onRefreshDefinitions: () => void;
  onRefreshGenerated: () => void;
  onRefreshSchedules: () => void;
  subView: 'library' | 'history' | 'schedules';
  setSubView: (view: 'library' | 'history' | 'schedules') => void;
  addNotification: (message: string, type: 'info' | 'warning' | 'success' | 'task', department: 'Front Office' | 'Housekeeping' | 'F&B' | 'Maintenance' | 'Finance' | 'Procurement' | 'HR' | 'Spa' | 'Executive') => void;
}) => {
  const categoryColors: Record<ReportCategory, string> = {
    DailyOperations: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    Housekeeping: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    Maintenance: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    FandB: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    FrontOffice: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    HR: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
    Procurement: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    SalesEvents: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
    CrossDepartment: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
  };

  const subNavItems = [
    { id: 'library' as const, label: 'Report Library', icon: FileBarChart },
    { id: 'history' as const, label: 'Generated Reports', icon: Archive },
    { id: 'schedules' as const, label: 'Schedules', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subView === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Report Library */}
      {subView === 'library' && (
        <div className="space-y-4">
          {definitions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <FileBarChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No report definitions available</p>
            </div>
          ) : (
            <>
              {/* Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {definitions.map((report) => (
                  <div
                    key={report.reportId}
                    className={`bg-white dark:bg-slate-900 border-2 p-6 rounded-3xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      selectedReport?.reportId === report.reportId
                        ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                    onClick={() => onSelectReport(selectedReport?.reportId === report.reportId ? null : report)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full ${categoryColors[report.category] || categoryColors.CrossDepartment}`}>
                        {report.category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex gap-1">
                        {report.outputFormats.map((fmt) => (
                          <span key={fmt} className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2">{report.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{report.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <CalendarDays className="w-3 h-3" />
                      Default: {report.defaultDateRange}
                    </div>
                  </div>
                ))}
              </div>

              {/* Generation Panel */}
              {selectedReport && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileBarChart size={20} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Generate: {selectedReport.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Date Range */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Date Range</label>
                      <select
                        value={reportDateRange}
                        onChange={(e) => setReportDateRange(e.target.value as ReportDateRange)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="WTD">Week to Date</option>
                        <option value="MTD">Month to Date</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {/* Format */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Output Format</label>
                      <select
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {selectedReport.outputFormats.map((fmt) => (
                          <option key={fmt} value={fmt}>{fmt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                      <button
                        onClick={() => onGenerate(selectedReport.reportId)}
                        disabled={generatingReport}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingReport ? (
                          <><RefreshCw size={14} className="animate-spin" /> Generating...</>
                        ) : (
                          <><Download size={14} /> Generate Report</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Fields List */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Included Fields</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.fields.map((field, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Generated Reports History */}
      {subView === 'history' && (
        <div className="space-y-4">
          {generatedReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <Archive className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No generated reports yet</p>
              <p className="text-xs text-slate-400 mt-2">Generate a report from the Report Library to see it here</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Archive size={20} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Report Archive</h3>
              </div>
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <div
                    key={report.generatedReportId}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        report.status === 'Ready'
                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
                          : report.status === 'Failed'
                          ? 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400'
                      }`}>
                        {report.status === 'Ready' ? <CheckCircle2 size={16} /> : report.status === 'Failed' ? <XCircle size={16} /> : <RefreshCw size={16} className="animate-spin" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{report.reportName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{report.dateRangeUsed}</span>
                          <span className="text-[10px] text-slate-400">{new Date(report.generatedAt).toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{report.format}</span>
                        </div>
                      </div>
                    </div>
                    {report.status === 'Ready' && (
                      <button
                        onClick={() => {
                          if (report.fileRef) {
                            window.open(report.fileRef, '_blank');
                          } else {
                            addNotification('File not available', 'warning', 'Executive');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] shadow-sm hover:shadow-md transition-all"
                      >
                        <Download size={12} /> Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedules */}
      {subView === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => addNotification('Schedule creation form will open here', 'info', 'Executive')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg"
            >
              <Plus className="w-3 h-3" />
              New Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No report schedules configured</p>
              <p className="text-xs text-slate-400 mt-2">Set up automated report generation and delivery</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.scheduleId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${schedule.isActive ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <CalendarDays size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{schedule.reportName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{schedule.frequency}</span>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{schedule.format}</span>
                          {schedule.isActive && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all ${
                        schedule.isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {schedule.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <MailOpen className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {schedule.recipientList.length} recipients
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {schedule.lastSentAt ? `Last sent: ${new Date(schedule.lastSentAt).toLocaleDateString()}` : 'Never sent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FINANCIAL REPORTS VIEW
// ============================================================================

const formatCurrency = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatPercent = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const formatVariance = (variance: number): string => {
  if (typeof variance !== 'number' || isNaN(variance)) return '—';
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(variance));
  return `${variance >= 0 ? '+' : '-'}${formatted}`;
};

const FinancialReportsView = ({
  definitions,
  monthlyReport,
  quarterlyReport,
  yoyReport,
  subView,
  setSubView,
  selectedMonth,
  setSelectedMonth,
  selectedQuarter,
  setSelectedQuarter,
  yoyPeriodType,
  setYoyPeriodType,
  yoyCommentary,
  setYoyCommentary,
  savingCommentary,
  onSaveCommentary,
  loading,
  onFetchMonthly,
  onFetchQuarterly,
  onFetchYoY,
}: {
  definitions: FinancialReportDefinition[];
  monthlyReport: MonthlyFinancialReport | null;
  quarterlyReport: QuarterlyFinancialReport | null;
  yoyReport: YearOverYearReport | null;
  subView: 'monthly' | 'quarterly' | 'yoy';
  setSubView: (view: 'monthly' | 'quarterly' | 'yoy') => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedQuarter: string;
  setSelectedQuarter: (quarter: string) => void;
  yoyPeriodType: PeriodType;
  setYoyPeriodType: (type: PeriodType) => void;
  yoyCommentary: string;
  setYoyCommentary: (commentary: string) => void;
  savingCommentary: boolean;
  onSaveCommentary: () => void;
  loading: boolean;
  onFetchMonthly: (month: string) => void;
  onFetchQuarterly: (quarter: string) => void;
  onFetchYoY: (periodType: PeriodType) => void;
}) => {
  const subNavItems = [
    { id: 'monthly' as const, label: 'Monthly', icon: CalendarDays },
    { id: 'quarterly' as const, label: 'Quarterly', icon: BarChart3 },
    { id: 'yoy' as const, label: 'Year-over-Year', icon: TrendingUp },
  ];

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (variance < 0) return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subView === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Monthly Financial Report */}
      {subView === 'monthly' && (
        <div className="space-y-4">
          {/* Month Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Month</label>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                onFetchMonthly(e.target.value);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : !monthlyReport ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No financial data available for this period</p>
              <p className="text-xs text-slate-400 mt-2">Ensure the period has been at least soft-closed in Finance</p>
            </div>
          ) : (
            <>
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Occupancy', value: `${monthlyReport.occupancyForMonth}%`, icon: Percent, color: 'text-indigo-600' },
                  { label: 'ADR', value: formatCurrency(monthlyReport.adrForMonth), icon: DollarSign, color: 'text-emerald-600' },
                  { label: 'RevPAR', value: formatCurrency(monthlyReport.revparForMonth), icon: TrendingUp, color: 'text-blue-600' },
                  { label: 'GOPPAR', value: formatCurrency(monthlyReport.gopparForMonth), icon: PiggyBank, color: 'text-purple-600' },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${kpi.color}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                      </div>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Revenue & Expense Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue by Department
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(monthlyReport.revenueByDepartment).map(([dept, amount]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{dept}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Total Revenue</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(Object.values(monthlyReport.revenueByDepartment).reduce((a, b) => a + b, 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-500" /> Expenses
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(monthlyReport.expenseByDepartment).map(([dept, amount]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{dept}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Undistributed Expenses</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(monthlyReport.undistributedExpenses)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Fixed Charges</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(monthlyReport.fixedCharges)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GOP & NOI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700/50 p-6 rounded-3xl shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Gross Operating Profit</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlyReport.gop)}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50 p-6 rounded-3xl shadow-sm">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Net Operating Income</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlyReport.netOperatingIncome)}</p>
                </div>
              </div>

              {/* Budget Variance */}
              {Object.keys(monthlyReport.budgetVariance).length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" /> Budget vs. Actual Variance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pr-4">Line Item</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Actual</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Budget</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Variance</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pl-4">Var %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(monthlyReport.budgetVariance).map(([line, data]) => (
                          <tr key={line} className="border-b border-slate-100 dark:border-slate-800/50">
                            <td className="text-xs font-bold text-slate-700 dark:text-slate-300 py-3 pr-4">{line}</td>
                            <td className="text-xs font-black text-slate-900 dark:text-white text-right py-3 px-4">{formatCurrency(data.actual)}</td>
                            <td className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right py-3 px-4">{formatCurrency(data.budget)}</td>
                            <td className={`text-xs font-black text-right py-3 px-4 ${getVarianceColor(data.varianceAmount)}`}>{formatVariance(data.varianceAmount)}</td>
                            <td className={`text-xs font-black text-right py-3 pl-4 ${getVarianceColor(data.variancePercent)}`}>{formatPercent(data.variancePercent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Source Snapshot */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <Clock className="w-3 h-3" />
                Generated: {new Date(monthlyReport.generatedAt).toLocaleString()} · Source snapshot: {monthlyReport.sourceSnapshotDate}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quarterly Financial Report */}
      {subView === 'quarterly' && (
        <div className="space-y-4">
          {/* Quarter Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Quarter</label>
            </div>
            <select
              value={selectedQuarter || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                onFetchQuarterly(e.target.value);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 4 }, (_, i) => {
                const q = `${new Date().getFullYear()}-Q${i + 1}`;
                return <option key={q} value={q}>{q}</option>;
              })}
              {Array.from({ length: 4 }, (_, i) => {
                const q = `${new Date().getFullYear() - 1}-Q${i + 1}`;
                return <option key={q} value={q}>{q}</option>;
              })}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : !quarterlyReport ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No quarterly data available</p>
            </div>
          ) : (
            <>
              {/* Quarter Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: formatCurrency(quarterlyReport.quarterTotalRevenue), color: 'text-emerald-600' },
                  { label: 'Total Expense', value: formatCurrency(quarterlyReport.quarterTotalExpense), color: 'text-rose-600' },
                  { label: 'Quarter GOP', value: formatCurrency(quarterlyReport.quarterGOP), color: 'text-indigo-600' },
                  { label: 'Net Operating Income', value: formatCurrency(quarterlyReport.quarterNetOperatingIncome), color: 'text-purple-600' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <p className={`text-lg font-black ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Average KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Avg Occupancy', value: `${quarterlyReport.averageOccupancy}%` },
                  { label: 'Avg ADR', value: formatCurrency(quarterlyReport.averageADR) },
                  { label: 'Avg RevPAR', value: formatCurrency(quarterlyReport.averageRevPAR) },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Monthly Breakdown */}
              {quarterlyReport.monthlyBreakdown && quarterlyReport.monthlyBreakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Monthly Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pr-4">Month</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Revenue</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">GOP</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">NOI</th>
                          <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pl-4">Occ%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quarterlyReport.monthlyBreakdown.map((m) => (
                          <tr key={m.reportInstanceId} className="border-b border-slate-100 dark:border-slate-800/50">
                            <td className="text-xs font-bold text-slate-700 dark:text-slate-300 py-3 pr-4">{new Date(m.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                            <td className="text-xs font-black text-slate-900 dark:text-white text-right py-3 px-4">{formatCurrency(Object.values(m.revenueByDepartment).reduce((a, b) => a + b, 0))}</td>
                            <td className="text-xs font-black text-emerald-600 dark:text-emerald-400 text-right py-3 px-4">{formatCurrency(m.gop)}</td>
                            <td className="text-xs font-black text-indigo-600 dark:text-indigo-400 text-right py-3 px-4">{formatCurrency(m.netOperatingIncome)}</td>
                            <td className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right py-3 pl-4">{m.occupancyForMonth}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* QoQ Variance */}
              {Object.keys(quarterlyReport.quarterOverQuarterVariance).length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Quarter-over-Quarter Variance</h3>
                  <div className="space-y-3">
                    {Object.entries(quarterlyReport.quarterOverQuarterVariance).map(([line, data]) => (
                      <div key={line} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{line}</span>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-black ${getVarianceColor(data.amount)}`}>{formatVariance(data.amount)}</span>
                          <span className={`text-xs font-black ${getVarianceColor(data.percent)}`}>{formatPercent(data.percent)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Year-over-Year Report */}
      {subView === 'yoy' && (
        <div className="space-y-4">
          {/* Period Type Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Type</label>
            </div>
            <select
              value={yoyPeriodType}
              onChange={(e) => {
                setYoyPeriodType(e.target.value as PeriodType);
                onFetchYoY(e.target.value as PeriodType);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Month">Month</option>
              <option value="Quarter">Quarter</option>
              <option value="YTD">Year to Date</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : !yoyReport ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No year-over-year data available</p>
            </div>
          ) : (
            <>
              {/* Period Labels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Current Period</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{yoyReport.currentPeriodLabel}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prior Period</p>
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400">{yoyReport.priorPeriodLabel}</p>
                </div>
              </div>

              {/* KPI Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Occupancy', current: `${yoyReport.occupancyCurrentVsPrior.current}%`, prior: `${yoyReport.occupancyCurrentVsPrior.prior}%` },
                  { label: 'ADR', current: formatCurrency(yoyReport.adrCurrentVsPrior.current), prior: formatCurrency(yoyReport.adrCurrentVsPrior.prior) },
                  { label: 'RevPAR', current: formatCurrency(yoyReport.revparCurrentVsPrior.current), prior: formatCurrency(yoyReport.revparCurrentVsPrior.prior) },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Current</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{kpi.current}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold">Prior</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{kpi.prior}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Variance Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Financial Variance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pr-4">Line Item</th>
                        <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Current</th>
                        <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Prior Year</th>
                        <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 px-4">Variance</th>
                        <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 pl-4">Var %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(yoyReport.currentPeriodFinancials).map((line) => {
                        const current = yoyReport.currentPeriodFinancials[line] || 0;
                        const prior = yoyReport.priorPeriodFinancials[line] || 0;
                        const variance = yoyReport.varianceAmount[line] || (current - prior);
                        const variancePct = yoyReport.variancePercent[line] || (prior !== 0 ? ((current - prior) / prior) * 100 : 0);
                        return (
                          <tr key={line} className="border-b border-slate-100 dark:border-slate-800/50">
                            <td className="text-xs font-bold text-slate-700 dark:text-slate-300 py-3 pr-4">{line}</td>
                            <td className="text-xs font-black text-slate-900 dark:text-white text-right py-3 px-4">{formatCurrency(current)}</td>
                            <td className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right py-3 px-4">{formatCurrency(prior)}</td>
                            <td className={`text-xs font-black text-right py-3 px-4 ${getVarianceColor(variance)}`}>{formatVariance(variance)}</td>
                            <td className={`text-xs font-black text-right py-3 pl-4 ${getVarianceColor(variancePct)}`}>{formatPercent(variancePct)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manager Commentary */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" /> Manager Commentary
                </h3>
                <textarea
                  value={yoyCommentary}
                  onChange={(e) => setYoyCommentary(e.target.value)}
                  placeholder="Add narrative context for notable variances (e.g. 'Q3 dip reflects planned closure of 6 rooms for renovation')..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={onSaveCommentary}
                    disabled={savingCommentary}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCommentary ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {savingCommentary ? 'Saving...' : 'Save Commentary'}
                  </button>
                </div>
                {yoyReport.commentary && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Saved Commentary</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{yoyReport.commentary}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Report Definitions */}
      {definitions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" /> Available Financial Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {definitions.map((def) => (
              <div key={def.reportId} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{def.type}</span>
                  <div className="flex gap-1">
                    {def.outputFormats.map((fmt) => (
                      <span key={fmt} className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{fmt}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{def.name}</p>
                <div className="flex items-center gap-3 mt-2">
                  {def.includesBudgetComparison && <span className="text-[9px] font-bold text-emerald-600">Budget vs. Actual</span>}
                  {def.includesPriorPeriodComparison && <span className="text-[9px] font-bold text-blue-600">Prior Period</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsManagerPortal;
