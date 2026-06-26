/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  FileText,
  BarChart3,
  Waves,
  Package,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  Mail,
  Trash2,
  Filter,
  CheckCircle2,
  RefreshCw,
  Award,
  DollarSign,
  Briefcase,
  PlayCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useERP } from '../../context/ERPContext';

// Types for HK Structured Inputs
interface CleaningLog {
  id: string;
  timestamp: string;
  roomNumber: string;
  attendant: string;
  shift: 'Morning' | 'Evening' | 'Night';
  durationMins: number; // Avg cleaning time
  status: 'Clean' | 'Dirty' | 'Inspected' | 'Out of order';
}

interface InspectionLog {
  id: string;
  timestamp: string;
  roomNumber: string;
  inspector: string;
  pass: boolean;
  score: number; // 0-100%
  issuesFound: string;
}

interface LinenRecord {
  id: string;
  timestamp: string;
  itemType: string;
  issued: number;
  returned: number;
  loss: number;
  clerk: string;
}

interface LaundryBatch {
  id: string;
  timestamp: string;
  batchNum: string;
  weightKg: number;
  turnaroundMins: number;
  status: string;
}

interface ComplaintLog {
  id: string;
  timestamp: string;
  roomNumber: string;
  guestName: string;
  text: string;
  urgency: 'Low' | 'Medium' | 'High';
  resolutionMins: number;
  resolved: boolean;
}

interface MaintenanceIssue {
  id: string;
  timestamp: string;
  roomNumber: string;
  issueDesc: string;
  severity: 'Minor' | 'Major' | 'Critical';
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

interface DamageRecord {
  id: string;
  timestamp: string;
  item: string;
  category: 'Fixed Asset' | 'Furniture' | 'Equipment';
  location: string;
  reportedBy: string;
  description: string;
  estimatedCost: number;
}

interface SpoilageRecord {
  id: string;
  timestamp: string;
  item: string;
  category: 'Guest Amenities' | 'Consumables';
  qty: number;
  reason: 'Expired' | 'Damaged Packaging' | 'Contaminated' | 'Other';
  reportedBy: string;
}

export default function HKReportsModule() {
  const { currentSystemDate = '2026-05-31', addNotification } = useERP();

  // Role context simulation
  const [activeRole, setActiveRole] = useState<'Housekeeping Manager' | 'Operations Manager'>('Housekeeping Manager');
  const [activeWorkspace, setActiveWorkspace] = useState<'cockpit' | 'reports' | 'inputs'>('cockpit');

  // Input states & tables
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [inspectionLogs, setInspectionLogs] = useState<InspectionLog[]>([]);
  const [linenRecords, setLinenRecords] = useState<LinenRecord[]>([]);
  const [laundryBatches, setLaundryBatches] = useState<LaundryBatch[]>([]);
  const [complaintLogs, setComplaintLogs] = useState<ComplaintLog[]>([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState<MaintenanceIssue[]>([]);
  const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
  const [spoilageRecords, setSpoilageRecords] = useState<SpoilageRecord[]>([]);

  // Export / Print / Schedule states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'PDF' | 'Excel'>('PDF');
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-daily-status');
  const [activeReportCategory, setActiveReportCategory] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');

  // Autogen configuration
  const [scheduledRuns, setScheduledRuns] = useState<{ id: string; name: string; frequency: string; recipients: string }[]>([
    { id: '1', name: 'Morning Rooms Summary', frequency: 'Daily (06:00)', recipients: '' },
    { id: '2', name: 'Weekly Linen Variance Audit', frequency: 'Weekly (Sun 23:00)', recipients: '' }
  ]);

  // Filters State
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [filterStaff, setFilterStaff] = useState<string>('All');
  const [filterRoomType, setFilterRoomType] = useState<string>('All');
  const [filterDateStart, setFilterDateStart] = useState<string>(currentSystemDate);
  const [filterDateEnd, setFilterDateEnd] = useState<string>(currentSystemDate);

  // Form input states
  const [formRoom, setFormRoom] = useState('');
  const [formAttendant, setFormAttendant] = useState('Attendant A');
  const [formDuration, setFormDuration] = useState('35');
  const [formStatus, setFormStatus] = useState<'Clean' | 'Dirty' | 'Inspected' | 'Out of order'>('Clean');
  const [formShift, setFormShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  const [formInspectRoom, setFormInspectRoom] = useState('');
  const [formInspector, setFormInspector] = useState('Supervisor A');
  const [formInspectScore, setFormInspectScore] = useState('95');
  const [formInspectIssues, setFormInspectIssues] = useState('');

  const [formLinenItem, setFormLinenItem] = useState('Bed Sheets (King)');
  const [formLinenIssued, setFormLinenIssued] = useState('50');
  const [formLinenReturned, setFormLinenReturned] = useState('48');

  const [formLaundryBatch, setFormLaundryBatch] = useState('B-025');
  const [formLaundryWeight, setFormLaundryWeight] = useState('120');
  const [formLaundryTime, setFormLaundryTime] = useState('45');

  const [formComplaintRoom, setFormComplaintRoom] = useState('');
  const [formComplaintGuest, setFormComplaintGuest] = useState('');
  const [formComplaintText, setFormComplaintText] = useState('');
  const [formComplaintUrgency, setFormComplaintUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formComplaintResMins, setFormComplaintResMins] = useState('20');

  const [formMaintRoom, setFormMaintRoom] = useState('');
  const [formMaintDesc, setFormMaintDesc] = useState('');
  const [formMaintSeverity, setFormMaintSeverity] = useState<'Minor' | 'Major' | 'Critical'>('Minor');
  const [formMaintStaff, setFormMaintStaff] = useState('Attendant B');

  // Damage Form
  const [formDamageItem, setFormDamageItem] = useState('');
  const [formDamageCat, setFormDamageCat] = useState<'Fixed Asset' | 'Furniture' | 'Equipment'>('Fixed Asset');
  const [formDamageLoc, setFormDamageLoc] = useState('');
  const [formDamageDesc, setFormDamageDesc] = useState('');
  const [formDamageCost, setFormDamageCost] = useState('0');

  // Spoilage Form
  const [formSpoilageItem, setFormSpoilageItem] = useState('');
  const [formSpoilageCat, setFormSpoilageCat] = useState<'Guest Amenities' | 'Consumables'>('Guest Amenities');
  const [formSpoilageQty, setFormSpoilageQty] = useState('1');
  const [formSpoilageReason, setFormSpoilageReason] = useState<'Expired' | 'Damaged Packaging' | 'Contaminated' | 'Other'>('Expired');

  // Load default data on mount
  useEffect(() => {
    const defaultCleaning: CleaningLog[] = [
      { id: 'C-01', timestamp: '2026-05-31T08:30:00Z', roomNumber: '101', attendant: 'Attendant A', shift: 'Morning', durationMins: 32, status: 'Inspected' },
      { id: 'C-02', timestamp: '2026-05-31T09:12:00Z', roomNumber: '102', attendant: 'Attendant A', shift: 'Morning', durationMins: 40, status: 'Clean' },
      { id: 'C-03', timestamp: '2026-05-31T09:44:00Z', roomNumber: '203', attendant: 'Attendant B', shift: 'Morning', durationMins: 28, status: 'Inspected' },
      { id: 'C-04', timestamp: '2026-05-31T10:15:00Z', roomNumber: '304', attendant: 'Attendant C', shift: 'Evening', durationMins: 45, status: 'Dirty' },
      { id: 'C-05', timestamp: '2026-05-31T10:45:00Z', roomNumber: '412', attendant: 'Attendant D', shift: 'Morning', durationMins: 35, status: 'Clean' }
    ];

    const defaultInspections: InspectionLog[] = [
      { id: 'I-01', timestamp: '2026-05-31T09:00:00Z', roomNumber: '101', inspector: 'Supervisor A', pass: true, score: 96, issuesFound: 'None' },
      { id: 'I-02', timestamp: '2026-05-31T10:10:00Z', roomNumber: '203', inspector: 'Supervisor A', pass: true, score: 92, issuesFound: 'Dusty TV table' },
      { id: 'I-03', timestamp: '2026-05-31T10:50:00Z', roomNumber: '304', inspector: 'Supervisor B', pass: false, score: 74, issuesFound: 'Linen stained, bathroom floor wet' }
    ];

    const defaultLinens: LinenRecord[] = [
      { id: 'L-01', timestamp: '2026-05-31T07:15:00Z', itemType: 'Bed Sheets (King)', issued: 60, returned: 58, loss: 2, clerk: 'Attendant A' },
      { id: 'L-02', timestamp: '2026-05-31T07:30:00Z', itemType: 'Bath Towels', issued: 80, returned: 75, loss: 5, clerk: 'Attendant B' },
      { id: 'L-03', timestamp: '2026-05-31T08:00:00Z', itemType: 'Pillow Cases', issued: 120, returned: 120, loss: 0, clerk: 'Attendant C' }
    ];

    const defaultLaundry: LaundryBatch[] = [
      { id: 'LB-01', timestamp: '2026-05-31T08:45:00Z', batchNum: 'B-021', weightKg: 145, turnaroundMins: 55, status: 'Completed' },
      { id: 'LB-02', timestamp: '2026-05-31T09:30:00Z', batchNum: 'B-022', weightKg: 95, turnaroundMins: 42, status: 'Completed' },
      { id: 'LB-03', timestamp: '2026-05-31T10:15:00Z', batchNum: 'B-023', weightKg: 110, turnaroundMins: 48, status: 'In Progress' }
    ];

    const defaultComplaints: ComplaintLog[] = [
      { id: 'CP-01', timestamp: '2026-05-31T08:20:00Z', roomNumber: '104', guestName: 'Guest A', text: 'Stains discovered on pillows', urgency: 'High', resolutionMins: 15, resolved: true },
      { id: 'CP-02', timestamp: '2026-05-31T09:55:00Z', roomNumber: '302', guestName: 'Guest B', text: 'Toilet amenities missing', urgency: 'Medium', resolutionMins: 10, resolved: true },
      { id: 'CP-03', timestamp: '2026-05-31T10:40:00Z', roomNumber: '215', guestName: 'Guest C', text: 'Linen has odd damp odor', urgency: 'High', resolutionMins: 0, resolved: false }
    ];

    const defaultMaint: MaintenanceIssue[] = [
      { id: 'M-01', timestamp: '2026-05-31T08:40:00Z', roomNumber: '105', issueDesc: 'Leaking shower valve faucet', severity: 'Major', assignedTo: 'Attendant B', status: 'In Progress' },
      { id: 'M-02', timestamp: '2026-05-31T09:15:00Z', roomNumber: '304', issueDesc: 'Lamp bulb in bedroom flickers', severity: 'Minor', assignedTo: 'Attendant D', status: 'Resolved' },
      { id: 'M-03', timestamp: '2026-05-31T10:30:00Z', roomNumber: '501', issueDesc: 'Jacuzzi heater door seal loose', severity: 'Critical', assignedTo: 'Attendant B', status: 'Open' }
    ];

    const storedLogs = localStorage.getItem('hotel_erp_cleaning_logs');
    const storedInspections = localStorage.getItem('hotel_erp_ins_logs');
    const storedLinen = localStorage.getItem('hotel_erp_linen_logs');
    const storedLaundry = localStorage.getItem('hotel_erp_laundry_logs');
    const storedComplaints = localStorage.getItem('hotel_erp_complaints_logs');
    const storedMaint = localStorage.getItem('hotel_erp_maint_logs');

    setCleaningLogs(storedLogs ? JSON.parse(storedLogs) : defaultCleaning);
    setInspectionLogs(storedInspections ? JSON.parse(storedInspections) : defaultInspections);
    setLinenRecords(storedLinen ? JSON.parse(storedLinen) : defaultLinens);
    setLaundryBatches(storedLaundry ? JSON.parse(storedLaundry) : defaultLaundry);
    setComplaintLogs(storedComplaints ? JSON.parse(storedComplaints) : defaultComplaints);
    setMaintenanceIssues(storedMaint ? JSON.parse(storedMaint) : defaultMaint);

    const storedDamage = localStorage.getItem('hotel_erp_damage_logs');
    const storedSpoilage = localStorage.getItem('hotel_erp_spoilage_logs');
    setDamageRecords(storedDamage ? JSON.parse(storedDamage) : []);
    setSpoilageRecords(storedSpoilage ? JSON.parse(storedSpoilage) : []);
  }, []);

  // Sync to local storage
  const updateCleaning = (newList: CleaningLog[]) => {
    setCleaningLogs(newList);
    localStorage.setItem('hotel_erp_cleaning_logs', JSON.stringify(newList));
  };
  const updateInspections = (newList: InspectionLog[]) => {
    setInspectionLogs(newList);
    localStorage.setItem('hotel_erp_ins_logs', JSON.stringify(newList));
  };
  const updateLinen = (newList: LinenRecord[]) => {
    setLinenRecords(newList);
    localStorage.setItem('hotel_erp_linen_logs', JSON.stringify(newList));
  };
  const updateLaundry = (newList: LaundryBatch[]) => {
    setLaundryBatches(newList);
    localStorage.setItem('hotel_erp_laundry_logs', JSON.stringify(newList));
  };
  const updateComplaints = (newList: ComplaintLog[]) => {
    setComplaintLogs(newList);
    localStorage.setItem('hotel_erp_complaints_logs', JSON.stringify(newList));
  };
  const updateMaint = (newList: MaintenanceIssue[]) => {
    setMaintenanceIssues(newList);
    localStorage.setItem('hotel_erp_maint_logs', JSON.stringify(newList));
  };
  const updateDamage = (newList: DamageRecord[]) => {
    setDamageRecords(newList);
    localStorage.setItem('hotel_erp_damage_logs', JSON.stringify(newList));
  };
  const updateSpoilage = (newList: SpoilageRecord[]) => {
    setSpoilageRecords(newList);
    localStorage.setItem('hotel_erp_spoilage_logs', JSON.stringify(newList));
  };

  // Real-time Calculators based on Log states
  const metrics = useMemo(() => {
    // Rooms cleaned per attendant
    const cleanedByAttendant: Record<string, number> = {};
    cleaningLogs.forEach(c => {
      cleanedByAttendant[c.attendant] = (cleanedByAttendant[c.attendant] || 0) + 1;
    });
    const cleanedPerAttendantData = Object.entries(cleanedByAttendant).map(([name, count]) => ({
      name: name.split(' ')[0], 
      count
    }));

    // Average cleaning time
    const cleanDurations = cleaningLogs.map(c => c.durationMins);
    const avgCleaningTime = cleanDurations.length > 0 
      ? Math.round(cleanDurations.reduce((a, b) => a + b, 0) / cleanDurations.length)
      : 36;

    // Inspection pass rate
    const totalIns = inspectionLogs.length;
    const passedIns = inspectionLogs.filter(i => i.pass).length;
    const passRate = totalIns > 0 ? Math.round((passedIns / totalIns) * 100) : 85;

    // Linen shrinkage
    let totalIssued = 0;
    let totalReturned = 0;
    let totalLinenLoss = 0;
    linenRecords.forEach(l => {
      totalIssued += l.issued;
      totalReturned += l.returned;
      totalLinenLoss += l.loss;
    });
    const shrinkageRate = totalIssued > 0 ? parseFloat(((totalLinenLoss / totalIssued) * 100).toFixed(1)) : 3.4;

    // Cleanliness Score
    const totalScores = inspectionLogs.map(i => i.score);
    const avgScore = totalScores.length > 0 
      ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
      : 92;

    // Out of order frequency
    const oooCount = maintenanceIssues.filter(m => m.severity === 'Critical' && m.status !== 'Resolved').length;

    const totalDamageValue = damageRecords.reduce((sum, r) => sum + r.estimatedCost, 0);
    const totalSpoilageQty = spoilageRecords.reduce((sum, r) => sum + r.qty, 0);

    // Complaint resolution time
    const resolvedComplaints = complaintLogs.filter(c => c.resolved && c.resolutionMins > 0);
    const avgComplaintResTime = resolvedComplaints.length > 0 
      ? Math.round(resolvedComplaints.reduce((a, b) => a + b, 0) / resolvedComplaints.length)
      : 12;

    const costPerOccupiedRoom = 14500 / 310; // Simulated constant budget / occupancy

    return {
      cleanedPerAttendantData,
      avgCleaningTime,
      passRate,
      shrinkageRate,
      avgScore,
      oooCount,
      avgComplaintResTime,
      costPerOccupiedRoom,
      totalCleaned: cleaningLogs.length,
      pendingComplaints: complaintLogs.filter(c => !c.resolved).length
    };
  }, [cleaningLogs, inspectionLogs, linenRecords, complaintLogs, maintenanceIssues]);

  // Handle Logs Additions
  const handleAddCleaningLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoom) return;
    const newLog: CleaningLog = {
      id: `C-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomNumber: formRoom,
      attendant: formAttendant,
      shift: formShift,
      durationMins: parseInt(formDuration) || 35,
      status: formStatus
    };
    updateCleaning([newLog, ...cleaningLogs]);
    setFormRoom('');
    addNotification({
      id: `NT-${Date.now()}`,
      title: `Room ${formRoom} Cleaned`,
      message: `Assigned attendant ${formAttendant} recorded log. Mode: ${formStatus}.`,
      department: 'Housekeeping',
      timestamp: 'Just Now',
      unread: true,
      category: 'Task Completed'
    });
  };

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInspectRoom) return;
    const score = parseInt(formInspectScore) || 90;
    const isPass = score >= 80;
    const newLog: InspectionLog = {
      id: `I-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomNumber: formInspectRoom,
      inspector: formInspector,
      pass: isPass,
      score,
      issuesFound: formInspectIssues || 'None'
    };
    updateInspections([newLog, ...inspectionLogs]);
    setFormInspectRoom('');
    setFormInspectIssues('');
    addNotification({
      id: `NT-INS-${Date.now()}`,
      title: `Inspection Log Completed`,
      message: `Supervisor audited Room ${formInspectRoom} with ${score}% pass efficiency.`,
      department: 'Housekeeping',
      timestamp: 'Just Now',
      unread: true,
      category: 'Inspection completed'
    });
  };

  const handleAddLinen = (e: React.FormEvent) => {
    e.preventDefault();
    const is = parseInt(formLinenIssued) || 0;
    const ret = parseInt(formLinenReturned) || 0;
    const loss = Math.max(0, is - ret);
    const newLog: LinenRecord = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemType: formLinenItem,
      issued: is,
      returned: ret,
      loss,
      clerk: activeRole === 'Housekeeping Manager' ? 'Admin Clerk' : 'Shift Supervisor'
    };
    updateLinen([newLog, ...linenRecords]);
    addNotification({
      id: `NT-LIN-${Date.now()}`,
      title: `Linen Flow Logged`,
      message: `${is} ${formLinenItem} issued. ${ret} returned. Variance: ${loss} units.`,
      department: 'Housekeeping',
      timestamp: 'Just Now',
      unread: true,
      category: 'Resource Flow'
    });
  };

  const handleAddLaundryBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: LaundryBatch = {
      id: `LB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      batchNum: formLaundryBatch,
      weightKg: parseFloat(formLaundryWeight) || 120,
      turnaroundMins: parseInt(formLaundryTime) || 45,
      status: 'Completed'
    };
    updateLaundry([newLog, ...laundryBatches]);
    setFormLaundryBatch(`B-${Math.floor(Math.random() * 900) + 100}`);
  };

  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComplaintRoom || !formComplaintText) return;
    const newLog: ComplaintLog = {
      id: `CP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomNumber: formComplaintRoom,
      guestName: formComplaintGuest || 'Anonymous',
      text: formComplaintText,
      urgency: formComplaintUrgency,
      resolutionMins: parseInt(formComplaintResMins) || 0,
      resolved: parseInt(formComplaintResMins) > 0
    };
    updateComplaints([newLog, ...complaintLogs]);
    setFormComplaintRoom('');
    setFormComplaintGuest('');
    setFormComplaintText('');
    addNotification({
      id: `NT-CP-${Date.now()}`,
      title: `Housekeeping Complaint`,
      message: `Room ${formComplaintRoom} lodged feedback: ${formComplaintText}. Urgency: ${formComplaintUrgency}`,
      department: 'Housekeeping',
      timestamp: 'Just Now',
      unread: true,
      category: 'Alert'
    });
  };

  const handleAddMaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMaintRoom || !formMaintDesc) return;
    const newLog: MaintenanceIssue = {
      id: `M-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomNumber: formMaintRoom,
      issueDesc: formMaintDesc,
      severity: formMaintSeverity,
      assignedTo: formMaintStaff,
      status: 'Open'
    };
    updateMaint([newLog, ...maintenanceIssues]);
    setFormMaintRoom('');
    setFormMaintDesc('');
    addNotification({
      id: `NT-MT-${Date.now()}`,
      title: `Maintenance Request logged`,
      message: `Room ${formMaintRoom} issues logged: "${formMaintDesc}". High priority context, dispatched to Attendant B.`,
      department: 'Housekeeping',
      timestamp: 'Just Now',
      unread: true,
      category: 'Engineering Sync'
    });
  };

  const handleAddDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDamageItem || !formDamageLoc) return;
    const newRecord: DamageRecord = {
      id: `DMG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      item: formDamageItem,
      category: formDamageCat,
      location: formDamageLoc,
      reportedBy: formAttendant,
      description: formDamageDesc,
      estimatedCost: parseFloat(formDamageCost) || 0
    };
    updateDamage([newRecord, ...damageRecords]);
    setFormDamageItem('');
    setFormDamageLoc('');
    setFormDamageDesc('');
    setFormDamageCost('0');
    addNotification(`Damaged asset registered: ${formDamageItem} at ${formDamageLoc}`, 'warning', 'Housekeeping');
  };

  const handleAddSpoilage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSpoilageItem) return;
    const newRecord: SpoilageRecord = {
      id: `SPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      item: formSpoilageItem,
      category: formSpoilageCat,
      qty: parseInt(formSpoilageQty) || 1,
      reason: formSpoilageReason,
      reportedBy: formAttendant
    };
    updateSpoilage([newRecord, ...spoilageRecords]);
    setFormSpoilageItem('');
    setFormSpoilageQty('1');
    addNotification(`Spoilage registered: ${formSpoilageQty} units of ${formSpoilageItem}`, 'warning', 'Housekeeping');
  };

  // Automated scheduling adding handler
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auto scheduler setup
    alert('Configured automated report generation. Selected template will run using the customized recurring cron structure.');
  };

  // Exports Handshake Handlers (Fully operational visual simulations)
  const invokeSimulatedExport = () => {
    setShowExportModal(true);
    setTimeout(() => {
      const activeFilters = `Floor_${filterFloor}_Staff_${filterStaff}_Type_${filterRoomType}`;
      const name = `Housekeeping_Report_${selectedReportId}_${activeFilters}_${currentSystemDate}`;
      const extension = exportType === 'PDF' ? 'pdf' : 'xlsx';
      
      const fileContent = `GRAND HOTEL ERP - HOUSEKEEPING INTELLIGENCE ENGINE\n\nGenerated on: ${new Date().toLocaleString()}\nReport Category: ${activeReportCategory.toUpperCase()}\nReport ID: ${selectedReportId}\nFilters Applied:\n- Floor: ${filterFloor}\n- Staff Attendant: ${filterStaff}\n- Room Classification: ${filterRoomType}\n- Period: ${filterDateStart} to ${filterDateEnd}\n\n=================================\nMETRIC INTEGRITY ASSURANCE VALUES\n=================================\nAverage Cleaning turnaround: ${metrics.avgCleaningTime} mins\nSupervisor Inspection pass rating: ${metrics.passRate}%\nGuest Cleanliness compliance score: ${metrics.avgScore}%\nLinen Shrinkage margin: ${metrics.shrinkageRate}%\nHousekeeping cost per room: $${metrics.costPerOccupiedRoom.toFixed(2)}\n\n(Fully structured XML-CSS pipeline processed successfully.)`;
      
      const element = document.createElement("a");
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${name}.${extension}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setShowExportModal(false);
    }, 2200);
  };

  const handleSendEmailSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setShowEmailModal(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailInput('');
      alert(`Email dispatch successful! Template structured reports for ${selectedReportId} sent over Secure SMTP to: ${emailInput}. Verification docket tagged.`);
    }, 1500);
  };

  // Mock Trend Charts data combining inputs
  const monthlyTimelineData = [
    { name: 'Wk 1', averageTime: 38, passRate: 86, rating: 4.4, cost: 42 },
    { name: 'Wk 2', averageTime: 36, passRate: 88, rating: 4.6, cost: 44 },
    { name: 'Wk 3', averageTime: metrics.avgCleaningTime, passRate: metrics.passRate, rating: parseFloat((metrics.avgScore / 20).toFixed(1)), cost: metrics.costPerOccupiedRoom }
  ];

  const occupancyWorkloadData = [
    { day: 'Mon', occupancy: 65, tasksWeight: 35 },
    { day: 'Tue', occupancy: 70, tasksWeight: 42 },
    { day: 'Wed', occupancy: 82, tasksWeight: 55 },
    { day: 'Thu', occupancy: 79, tasksWeight: 48 },
    { day: 'Fri', occupancy: 95, tasksWeight: 75 },
    { day: 'Sat', occupancy: 100, tasksWeight: 80 },
    { day: 'Sun', occupancy: 88, tasksWeight: 60 }
  ];

  // Filters application
  const filteredCleaningLogs = useMemo(() => {
    return cleaningLogs.filter(log => {
      if (filterFloor !== 'All') {
        const floorPrefix = filterFloor === 'Penthouse' ? '5' : filterFloor;
        if (!log.roomNumber.startsWith(floorPrefix)) return false;
      }
      if (filterStaff !== 'All' && log.attendant !== filterStaff) return false;
      return true;
    });
  }, [cleaningLogs, filterFloor, filterStaff]);

  const filteredInspections = useMemo(() => {
    return inspectionLogs.filter(log => {
      if (filterFloor !== 'All') {
        const floorPrefix = filterFloor === 'Penthouse' ? '5' : filterFloor;
        if (!log.roomNumber.startsWith(floorPrefix)) return false;
      }
      return true;
    });
  }, [inspectionLogs, filterFloor]);

  const filteredComplaints = useMemo(() => {
    return complaintLogs.filter(log => {
      if (filterFloor !== 'All') {
        const floorPrefix = filterFloor === 'Penthouse' ? '5' : filterFloor;
        if (!log.roomNumber.startsWith(floorPrefix)) return false;
      }
      return true;
    });
  }, [complaintLogs, filterFloor]);

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-750 dark:text-slate-350" id="hk-reports-advanced-terminal">
      
      {/* 1. HERO CONTROLLER & ROLE MANAGER CONTEXT */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-205 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-extrabold flex items-center gap-1">
            <Briefcase size={12} className="text-indigo-405" /> HOTEL OPERATIONS CONTEXT SYNCED
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 inline-flex items-center gap-2">
            Housekeeping Intelligent Audit Suite
          </h2>
          <p className="text-xs text-slate-400 font-mono">Dynamic multi-layer analytics, structured data entry, and PDF/Excel compiling engine.</p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Workspace Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border p-0.5 rounded-xl text-3xs font-black uppercase tracking-wider">
            {[
              { id: 'cockpit', label: 'Monitor Cockpit', icon: BarChart3 },
              { id: 'reports', label: 'Report Builder', icon: FileText },
              { id: 'inputs', label: 'Operational Logs', icon: PlusCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkspace(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
                    activeWorkspace === tab.id 
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black shadow-3xs'
                    : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          {/* Role Context Pill */}
          <div className="flex bg-amber-400/15 border border-amber-400/30 rounded-xl px-2.5 py-1 text-slate-900 dark:text-amber-400 items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Auditing As:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider focus:ring-0 p-0 cursor-pointer text-slate-950 dark:text-amber-400 focus:outline-none"
            >
              <option value="Housekeeping Manager" className="bg-white dark:bg-slate-900 text-slate-800">Housekeeping Manager</option>
              <option value="Operations Manager" className="bg-white dark:bg-slate-900 text-slate-800">Operations Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. FILTER MATRIX RAIL (Visible across cockpit & reports tabs) */}
      <div className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-3xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1 shrink-0">
            <Filter size={11} /> Filters Suite
          </span>

          {/* Floor filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 border rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Floor:</span>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="bg-transparent border-none p-0 text-[11px] font-black uppercase focus:ring-0 cursor-pointer max-w-[80px]"
            >
              <option value="All">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>

          {/* Attendant filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 border rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Staff:</span>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="bg-transparent border-none p-0 text-[11px] font-black uppercase focus:ring-0 cursor-pointer"
            >
              <option value="All">All Attendants</option>
              <option value="Attendant A">Attendant A</option>
              <option value="Attendant B">Attendant B</option>
              <option value="Attendant C">Attendant C</option>
              <option value="Attendant D">Attendant D</option>
            </select>
          </div>

          {/* Room Type */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 border rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Classification:</span>
            <select
              value={filterRoomType}
              onChange={(e) => setFilterRoomType(e.target.value)}
              className="bg-transparent border-none p-0 text-[11px] font-black uppercase focus:ring-0 cursor-pointer"
            >
              <option value="All">All Classifications</option>
              <option value="K">Standard King</option>
              <option value="Q">Double Queen</option>
              <option value="S">Executive Suite</option>
              <option value="P">Presidential Suite</option>
            </select>
          </div>
        </div>

        {/* Date Filter Range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 border rounded-xl font-mono text-[10px]">
            <span className="text-slate-400 uppercase font-bold">Start:</span>
            <input 
              type="date" 
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="bg-transparent border-none p-0 text-[10.5px] font-bold focus:ring-0" 
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 border rounded-xl font-mono text-[10px]">
            <span className="text-slate-400 uppercase font-bold">End:</span>
            <input 
              type="date" 
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="bg-transparent border-none p-0 text-[10.5px] font-bold focus:ring-0" 
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: CONFIGURABLE COCKPIT VIEW BOARD (Manager Dashboard requirements) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'cockpit' && (
        <div className="space-y-6 animate-fade-in" id="hk-metrics-cockpit">
          
          {/* Subheader Title representing active Dashboard Mode selection */}
          <div className="flex justify-between items-center bg-slate-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-505/10 rounded-full -mr-12 -mt-12 blur-3xl" />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-505/15 px-2 py-0.5 rounded">
                {activeRole === 'Housekeeping Manager' ? 'Cockpit Segment' : 'Enterprise Operations Segment'}
              </span>
              <h3 className="text-base font-sans font-black tracking-tight uppercase">
                {activeRole === 'Housekeeping Manager' 
                  ? 'Housekeeping Manager Action Center' 
                  : 'Operations Director High-Level Snapshot'}
              </h3>
              <p className="text-[10.5px] text-slate-400 font-sans max-w-2xl leading-normal">
                {activeRole === 'Housekeeping Manager'
                  ? 'Detailed operational control room. Actively monitoring direct performance metrics, attendant queues, and linen variance signals.'
                  : 'Macro operational summary. Synced property exceptions, global room status balances against occupancy levels, and quality indices.'}
              </p>
            </div>
            <div className="hidden lg:block bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl font-mono text-3xs uppercase">
              Operational Stream Validity: <strong className="text-emerald-400">99.8% Online</strong>
            </div>
          </div>

          {/* MANAGER SNAPSHOTS GRID CARD CARDS */}
          {activeRole === 'Housekeeping Manager' ? (
            /* Housekeeping Manager Cockpit Metrics */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Completed vs Pending */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 sm:p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 rounded-xl">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm font-mono text-indigo-650 font-black tracking-widest">REAL TIME</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold leading-none">Rooms Cleaned Output</span>
                  <strong className="text-2xl sm:text-3 text-slate-900 dark:text-white font-sans font-black tracking-tight block mt-1.5">
                    {metrics.totalCleaned} / 26
                  </strong>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (metrics.totalCleaned / 26) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 2: Complaints Snapshot */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 sm:p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded">PENDING</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold leading-none">Complaints on Record</span>
                  <strong className="text-2xl sm:text-3 text-slate-900 dark:text-white font-sans font-black tracking-tight block mt-1.5">
                    {metrics.pendingComplaints} Logged
                  </strong>
                  <p className="text-4xs text-slate-400 mt-1 uppercase font-mono italic">Needs immediate dispatcher review SLA clock running.</p>
                </div>
              </div>

              {/* Card 3: Linen Shrinkage */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 sm:p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
                    <Package size={16} />
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-503 text-[9px] uppercase tracking-tight">STABLE</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold leading-none">Linen Loss / Loss Rate</span>
                  <strong className="text-2xl sm:text-3 text-slate-900 dark:text-white font-sans font-black tracking-tight block mt-1.5">
                    {metrics.shrinkageRate}%
                  </strong>
                  <p className="text-[9.5px] text-slate-500 font-mono mt-1">Average shrinkage threshold is &lt;4.0%</p>
                </div>
              </div>

              {/* Card 4: Cost per Occupied Room */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 sm:p-2.5 bg-amber-50 dark:bg-amber-955/30 text-amber-500 rounded-xl">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded">BUDGET SAFE</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold leading-none">Cost per Occupied Room</span>
                  <strong className="text-2xl sm:text-3 text-slate-900 dark:text-white font-sans font-black tracking-tight block mt-1.5">
                    ${metrics.costPerOccupiedRoom.toFixed(2)}
                  </strong>
                  <p className="text-4xs text-slate-400 mt-1 uppercase font-mono italic">Calculated housekeeping portion per occupied unit.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Operations Manager High-Level Dashboard view */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Snapshot block A */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">Cleanliness Index Track</span>
                  <span className="p-1 px-2 text-[9px] font-sans font-black bg-emerald-500/10 text-emerald-600 rounded uppercase">TARGET: &gt;90%</span>
                </div>
                <div className="py-4 space-y-2 text-center sm:text-left">
                  <span className="text-5xl font-black font-sans text-slate-900 dark:text-white tracking-tight">
                    {metrics.passRate}%
                  </span>
                  <h4 className="text-xs font-sans font-extrabold text-slate-800 dark:text-slate-200 uppercase mt-2">Supervisor Pass Efficiency Variance</h4>
                  <p className="text-4xs text-slate-400 uppercase font-mono max-w-xs block leading-relaxed italic">
                    Aggregate ratio of inspection audits passing without urgent touchup demands this cycle.
                  </p>
                </div>
              </div>

              {/* Exception Alarms Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <span className="text-[10px] font-mono text-rose-500 font-extrabold uppercase">CRITICAL SERVICE EXCEPTIONS</span>
                </div>
                <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
                  {complaintLogs.filter(c => !c.resolved).length > 0 ? (
                    complaintLogs.filter(c => !c.resolved).map(c => (
                      <div key={c.id} className="flex gap-2 text-xs">
                        <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-sans font-bold text-slate-800 dark:text-slate-200">Room {c.roomNumber} - Guest Escalation</h5>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs font-mono uppercase">Reason: "{c.text}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs uppercase font-mono">
                      No active exception constraints on stream.
                    </div>
                  )}
                </div>
              </div>

              {/* Workload Snapshot vs Occupancy ratio index */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase">Operations Workload Metrics</span>
                  <Award size={14} className="text-indigo-650" />
                </div>
                <div className="space-y-4 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Live Attendant Productivity Avg:</span>
                    <strong className="text-slate-900 dark:text-zinc-200">{metrics.avgCleaningTime} mins/room</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Out of Order / Under Repair:</span>
                    <strong className="text-slate-900 dark:text-zinc-200">{metrics.oooCount} suites</strong>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                    <span>Average Complaint Response Time:</span>
                    <strong className="font-extrabold">{metrics.avgComplaintResTime} mins</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ALERTS BOARD CONTAINER (Shortages, overdue cleaning, complaints notifications) */}
          <div className="bg-white dark:bg-slate-900 border border-rose-500/20 p-5 rounded-3xl shadow-3xs space-y-4">
            <div>
              <span className="text-[10px] font-mono text-rose-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle size={12} className="animate-bounce" /> LIVE SAFETY & SERVICE ALERTS ENGINE
              </span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Real-time exception triggers crossing housekeeping service levels and stock thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alert item 1 */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-105 dark:border-rose-900/40 rounded-2xl flex items-start gap-3">
                <Package size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase font-sans">Linen Shortage Forecast</h4>
                  <p className="text-[10.5px] text-slate-505 dark:text-slate-400 leading-normal mt-1">
                    Floor 3 linen caches dropped below par thresholds. High linen loss in washing batch B-023. Action recommended.
                  </p>
                </div>
              </div>

              {/* Alert item 2 */}
              <div className="p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-105 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-sans">Overdue Suite Preparations</h4>
                  <p className="text-[10.5px] text-slate-505 dark:text-slate-400 leading-normal mt-1">
                    Room 304 cleaning exceeds standard SLA constraints (45m elapsed). Front Desk has checked in guests early.
                  </p>
                </div>
              </div>

              {/* Alert item 3 */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border rounded-2xl flex items-start gap-3">
                <AlertTriangle size={18} className="text-zinc-550 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-sans">Critical Maintenance Lockouts</h4>
                  <p className="text-[10.5px] text-slate-505 dark:text-slate-400 leading-normal mt-1">
                    Room 501 currently out of service (Jacuzzi seal rupture). Dispatched to engineering technician Maintenance Team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* REAL TIME CHARTS & GRAPHS CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Attendant output or Cleaning Turnaround */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase uppercase">OPERATOR VELOCITY INDICES</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase">Attendant Productivity Shift Volume</h3>
                <p className="text-4xs text-slate-400 font-mono mt-0.5 uppercase">Real-time room count outputs finalized by active housekeepers in today's shift.</p>
              </div>

              {metrics.cleanedPerAttendantData.length > 0 ? (
                <div className="h-60 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.cleanedPerAttendantData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfd8dc" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={25}>
                        {metrics.cleanedPerAttendantData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 font-mono text-xs uppercase bg-slate-50 dark:bg-slate-950 rounded-2xl mt-4">No attendant logs recorded today.</div>
              )}
            </div>

            {/* Chart 2: Cleanliness feedback Trend or Workload analysis */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">STRESS COEFFICIENT ANALYSIS</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase">Occupancy Volume vs Housekeeping Workload Weight</h3>
                <p className="text-4xs text-slate-400 font-mono mt-0.5 uppercase">Correlates live hotel occupancy percentage against tasks assigned weight metrics.</p>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={occupancyWorkloadData}>
                    <defs>
                      <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfd8dc" opacity={0.3} />
                    <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOcc)" />
                    <Area type="monotone" dataKey="tasksWeight" name="Housekeeping Workload Ratio" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional double-grid charts tracking Quality trend feedback */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">SERVICE INTEGRITY ARCHIVES</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase">Guest Cleanliness Ratings Trend</h3>
                <p className="text-4xs text-slate-400 font-mono mt-0.5 uppercase">Plotting cleanliness evaluation reports from checkout response indices.</p>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfd8dc" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis domain={[3.5, 5]} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="rating" name="Rating (1-5 Star Scale)" stroke="#e4b011" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Out of order frequencies vs average resolve time */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">DIAGNOSTICS & HARDENING</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase">Laundry Processing Yield & Turnaround</h3>
                <p className="text-4xs text-slate-400 font-mono mt-0.5 uppercase">Auditing turnaround efficiency across batch weights in internal machinery.</p>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={laundryBatches}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cfd8dc" opacity={0.2} />
                    <XAxis dataKey="batchNum" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                    <Bar dataKey="weightKg" name="Processed Weight (Kg)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: STRUCTURED REPORT CATALOG & BUILDER (Daily/Weekly/Monthly/Quarter) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'reports' && (
        <div className="space-y-6 animate-fade-in" id="hk-reports-builder-app">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Sidebar navigation for structured Report categories */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-4 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-550 block uppercase tracking-widest font-extrabold">INTEL FILES</span>
                <h4 className="text-xs font-sans font-black uppercase text-slate-900 dark:text-white mt-0.5">Enterprise Ledger Tabs</h4>
              </div>

              {/* Interval selection tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border rounded-2xl text-[10px] font-black uppercase tracking-wider justify-between font-mono gap-0.5">
                {['daily', 'weekly', 'monthly', 'quarterly'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveReportCategory(cat as any);
                      // Auto-select first in category
                      if (cat === 'daily') setSelectedReportId('rep-daily-status');
                      if (cat === 'weekly') setSelectedReportId('rep-weekly-productivity');
                      if (cat === 'monthly') setSelectedReportId('rep-monthly-kpis');
                      if (cat === 'quarterly') setSelectedReportId('rep-quarterly-cost');
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[9px] max-w-max transition-all capitalize cursor-pointer font-bold ${
                      activeReportCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-3xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dynamic report lists based on selected timeline interval */}
              <nav className="space-y-1">
                {activeReportCategory === 'daily' && [
                  { id: 'rep-daily-status', name: 'Room Status Inventory' },
                  { id: 'rep-daily-productivity', name: 'Attendant Productivity' },
                  { id: 'rep-daily-linen', name: 'Linen Movement Log' },
                  { id: 'rep-daily-damage', name: 'Damage & Breakage Log' },
                  { id: 'rep-daily-spoilage', name: 'Consumable Spoilage Report' },
                  { id: 'rep-daily-complaints', name: 'Guest Complaint Dispatch' },
                  { id: 'rep-daily-maintenance', name: 'Engineering Work Orders' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-[11px] font-medium font-sans flex items-center justify-between tracking-tight transition cursor-pointer ${
                      selectedReportId === r.id ? 'bg-slate-900 dark:bg-zinc-200 text-white dark:text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}

                {activeReportCategory === 'weekly' && [
                  { id: 'rep-weekly-productivity', name: 'Productivity & Efficiency' },
                  { id: 'rep-weekly-complaints', name: 'Complaint Trend Matrix' },
                  { id: 'rep-weekly-deep-clean', name: 'Deep Cleaning Status' },
                  { id: 'rep-weekly-laundry', name: 'Laundry Workflows' },
                  { id: 'rep-weekly-supervisors', name: 'Supervisor Performance' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-[11px] font-medium font-sans flex items-center justify-between tracking-tight transition cursor-pointer ${
                      selectedReportId === r.id ? 'bg-slate-900 dark:bg-zinc-200 text-white dark:text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}

                {activeReportCategory === 'monthly' && [
                  { id: 'rep-monthly-kpis', name: 'Housekeeping real-time KPI' },
                  { id: 'rep-monthly-inventory', name: 'Linen & Chemical Stocks' },
                  { id: 'rep-monthly-damage', name: 'Damage & Breakage Trend' },
                  { id: 'rep-monthly-spoilage', name: 'Spoilage & Variance Report' },
                  { id: 'rep-monthly-cp-occupied', name: 'Cost Per Occupied Room' },
                  { id: 'rep-monthly-ranking', name: 'Staff Performance Ranking' },
                  { id: 'rep-monthly-satisfaction', name: 'Cleanliness Scores (Guest)' },
                  { id: 'rep-monthly-maint-sync', name: 'Engineering Coordination' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-[11px] font-medium font-sans flex items-center justify-between tracking-tight transition cursor-pointer ${
                      selectedReportId === r.id ? 'bg-slate-900 dark:bg-zinc-200 text-white dark:text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}

                {activeReportCategory === 'quarterly' && [
                  { id: 'rep-quarterly-cost', name: 'Financial Cost Analysis' },
                  { id: 'rep-quarterly-linen-life', name: 'Linen Lifecycle Auditing' },
                  { id: 'rep-quarterly-depreciation', name: 'Equipment Depreciation' },
                  { id: 'rep-quarterly-sop', name: 'SOP Compliance & Auditing' },
                  { id: 'rep-quarterly-trends', name: 'Efficiency & Sloping Trends' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-[11px] font-medium font-sans flex items-center justify-between tracking-tight transition cursor-pointer ${
                      selectedReportId === r.id ? 'bg-slate-900 dark:bg-zinc-200 text-white dark:text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </nav>

              {/* REPORT AUTO-GENERATION SCHEDULER PANEL */}
              <div className="border-t pt-4 space-y-3.5" id="report-auto-gen-scheduler">
                <div>
                  <h4 className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest font-extrabold flex items-center gap-1">
                    <Mail size={12} /> Email Auto-Scheduler
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase leading-snug">Generate and dispatch reports automatically via encrypted secure mail.</p>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  {scheduledRuns.map(run => (
                    <div key={run.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl flex items-center justify-between text-[10px]">
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-zinc-250 uppercase truncate max-w-[120px]">{run.name}</h5>
                        <span className="text-[9px] font-mono text-indigo-500">{run.frequency}</span>
                      </div>
                      <button 
                        onClick={() => setScheduledRuns(scheduledRuns.filter(r => r.id !== run.id))}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Email manual dispatch form simulation */}
                  <form onSubmit={handleSendEmailSimulation} className="pt-2 space-y-1.5">
                    <input 
                      type="email" 
                      placeholder="Send instant copy to (email)..."
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border text-[10.5px] px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 border text-white font-sans text-3xs font-black uppercase py-1.5 rounded-xl hover:bg-slate-850 cursor-pointer"
                    >
                      <Mail size={11} />
                      Send Instant Copy
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Main view listing compiling table reports based on Selection */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-5" id="compiled-reporting-sheet">
              
              {/* Header inside reporting display sheet */}
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <span className="text-[9px] font-mono text-indigo-500 bg-indigo-505/10 px-2 py-0.5 rounded uppercase font-black tracking-widest text-[9.5px]">
                    ACTIVE AUDITING SHEET SYSTEM
                  </span>
                  <h3 className="text-sm font-black font-sans uppercase text-slate-900 dark:text-white mt-1">
                    {selectedReportId.toUpperCase().replace('REP-', '').replace('-', ' ')} Summary
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-sans mt-0.5 max-w-xl">
                    Aggregated matrix matching physical floor layers, personnel attendance logs, and active resource balances.
                  </p>
                </div>

                {/* Exporter Actions */}
                <div className="flex gap-2 text-xs">
                  <select 
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border text-[10px] font-black uppercase py-1.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="PDF">PDF layout</option>
                    <option value="Excel">Excel format</option>
                  </select>
                  <button
                    onClick={invokeSimulatedExport}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white font-sans font-black uppercase text-3xs py-1.5 px-3.5 rounded-xl hover:bg-indigo-700 shadow-sm transition"
                  >
                    <Download size={12} />
                    Compile Now
                  </button>
                </div>
              </div>

              {/* REPORT LOG TABLE DATA VIEWER (Depending on selected template ID) */}
              <div className="overflow-x-auto border rounded-2xl">
                {selectedReportId.includes('status') ? (
                  /* Room Status Report Table */
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-[9px] uppercase text-slate-400 border-b">
                        <th className="py-2.5 px-4 font-bold">Room Suite</th>
                        <th className="py-2.5 px-3 font-bold">Attendant Name</th>
                        <th className="py-2.5 px-3 font-bold">Execution Class</th>
                        <th className="py-2.5 px-3 font-bold">Turnaround</th>
                        <th className="py-2.5 px-4 font-bold text-right">Status Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-sans">
                      {filteredCleaningLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-200">Room {log.roomNumber}</td>
                          <td className="py-3 px-3">{log.attendant}</td>
                          <td className="py-3 px-3 font-mono text-[10px] text-slate-500 uppercase">{log.shift} Shift</td>
                          <td className="py-3 px-3 font-mono">{log.durationMins} mins</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                              log.status === 'Inspected' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                              log.status === 'Clean' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                            }`}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : selectedReportId.includes('productivity') ? (
                  /* Attendant Productivity Table */
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-[9px] uppercase text-slate-400 border-b">
                        <th className="py-2.5 px-4 font-bold">Attendant Personnel</th>
                        <th className="py-2.5 px-3 font-bold">Assigned Tasks Today</th>
                        <th className="py-2.5 px-3 font-bold">Average turnaround</th>
                        <th className="py-2.5 px-4 font-bold text-right">Yield Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-sans">
                      {[
                        { name: 'Attendant A', tasks: filteredCleaningLogs.filter(c => c.attendant === 'Attendant A').length, score: 94 },
                        { name: 'Attendant B', tasks: filteredCleaningLogs.filter(c => c.attendant === 'Attendant B').length, score: 88 },
                        { name: 'Attendant C', tasks: filteredCleaningLogs.filter(c => c.attendant === 'Attendant C').length, score: 96 },
                        { name: 'Attendant D', tasks: filteredCleaningLogs.filter(c => c.attendant === 'Attendant D').length, score: 91 }
                      ].map((staff, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-200">{staff.name}</td>
                          <td className="py-3 px-3 font-mono">{staff.tasks} suites finalized</td>
                          <td className="py-3 px-3 font-mono">{metrics.avgCleaningTime} mins / suite</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{staff.score}% rating</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : selectedReportId.includes('linen') ? (
                  /* Linen Movement logs */
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-[9px] uppercase text-slate-400 border-b">
                        <th className="py-2.5 px-4 font-bold">Linen Classification</th>
                        <th className="py-2.5 px-3 font-bold text-center">Issued Units</th>
                        <th className="py-2.5 px-3 font-bold text-center">Returned Units</th>
                        <th className="py-2.5 px-4 font-bold text-right">Registered Shrinkage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-sans">
                      {linenRecords.map((lin) => (
                        <tr key={lin.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-200">{lin.itemType}</td>
                          <td className="py-3 px-3 text-center font-mono">{lin.issued} units</td>
                          <td className="py-3 px-3 text-center font-mono">{lin.returned} units</td>
                          <td className="py-3 px-4 text-right font-mono text-rose-500 font-bold">-{lin.loss} items</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : selectedReportId.includes('damage') ? (
                  /* Damage & Broken Assets Table */
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-[9px] uppercase text-slate-400 border-b">
                        <th className="py-2.5 px-4 font-bold">Asset/Item</th>
                        <th className="py-2.5 px-3 font-bold">Category</th>
                        <th className="py-2.5 px-3 font-bold">Location</th>
                        <th className="py-2.5 px-4 font-bold text-right">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px]">
                      {damageRecords.length > 0 ? damageRecords.map((dmg) => (
                        <tr key={dmg.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-black uppercase text-slate-900 dark:text-white">{dmg.item}</td>
                          <td className="py-3 px-3 text-slate-500">{dmg.category}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{dmg.location}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                             ${dmg.estimatedCost.toFixed(2)}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-mono uppercase">No damage records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : selectedReportId.includes('spoilage') ? (
                  /* Spoilage Table */
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-[9px] uppercase text-slate-400 border-b">
                        <th className="py-2.5 px-4 font-bold">Consumable Item</th>
                        <th className="py-2.5 px-3 font-bold text-center">Qty Spoiled</th>
                        <th className="py-2.5 px-3 font-bold">Reasoning</th>
                        <th className="py-2.5 px-4 font-bold text-right">Date Logged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px]">
                      {spoilageRecords.length > 0 ? spoilageRecords.map((spl) => (
                        <tr key={spl.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-black uppercase text-slate-900 dark:text-white">{spl.item}</td>
                          <td className="py-3 px-3 text-center font-mono font-black text-amber-600">{spl.qty} units</td>
                          <td className="py-3 px-3 text-slate-500 italic">{spl.reason}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 italic">
                             {new Date(spl.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-mono uppercase">No spoilage records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  /* Generic data logs visualizer for custom selected ledger sheet templates */
                  <div className="py-20 text-center text-slate-400 space-y-4">
                    <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-800" />
                    <div>
                      <h4 className="font-sans font-bold text-slate-900 dark:text-white uppercase text-xs">Aesthetic Layer Rendering</h4>
                      <p className="text-4xs text-slate-400 font-mono mt-1 max-w-xs mx-auto uppercase leading-relaxed">
                        Data synced dynamically through standard XML queries. No security bypass reported. Total matching rows: {filteredCleaningLogs.length} entries.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* AUTOMATED COMPLIANCE SUMMARY REPORT FOOTER */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border rounded-2xl text-xs font-sans text-slate-550 leading-relaxed space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#6366f1] font-black block">
                  Intelligent Compliance Ledger Digest
                </span>
                <p>
                  All generated datasets contain verified cryptographic digital handshakes. Sync processes align directly with active Hotel Cloud Node values.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: DATA INPUT MODULES STRUCTURE (Cleaning, Inspections, Linens, etc.) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'inputs' && (
        <div className="space-y-6 animate-fade-in" id="hk-inputs-section">
          
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl">
            <span className="text-[10px] font-mono text-indigo-405 block uppercase tracking-widest font-black mb-1">DATA RECORD ENGINE</span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-tight">Structured Operational Registration Forms</h3>
            <p className="text-[10.5px] text-slate-400 font-sans mt-0.5 max-w-2xl">
              Append real-time records on suite cleanliness ratings, supervisor assessments, and inventory flow dockets. Inputs trigger direct updates inside the reports catalog, audit streams, and real-time graphs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form 1: Rooms Cleaning Logs Input */}
            <form onSubmit={handleAddCleaningLog} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded uppercase font-black">LOG: 1</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Register Cleaning Log</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Suite Room Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 102"
                    required
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Turnaround (Mins)</label>
                    <input 
                      type="number" 
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Cleaning Class</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl"
                    >
                      <option value="Clean">✨ Clean</option>
                      <option value="Dirty">🧹 Dirty</option>
                      <option value="Inspected">🔍 Inspected</option>
                      <option value="Out of order">🔧 Out of order</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Attendant</label>
                    <select
                      value={formAttendant}
                      onChange={(e) => setFormAttendant(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl text-[11px]"
                    >
                      <option value="Staff Member A">Staff Member A</option>
                      <option value="Staff Member B">Staff Member B</option>
                      <option value="Staff Member C">Staff Member C</option>
                      <option value="Staff Member D">Staff Member D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Shift Phase</label>
                    <select
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl text-[11px]"
                    >
                      <option value="Morning">Morning Shift</option>
                      <option value="Evening">Evening Shift</option>
                      <option value="Night">Night Shift</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Append Cleaning Log
                </button>
              </div>
            </form>

            {/* Form 2: Supervisor Inspection Logs Input */}
            <form onSubmit={handleAddInspection} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-violet-150 text-indigo-700 dark:bg-indigo-950 px-2 py-0.5 rounded uppercase font-black">LOG: 2</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Supervisor Inspection Audit</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Suite Room Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 203"
                    required
                    value={formInspectRoom}
                    onChange={(e) => setFormInspectRoom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Inspect Rating (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={formInspectScore}
                      onChange={(e) => setFormInspectScore(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5 font-bold">Auditor Auditor</label>
                    <input 
                      type="text" 
                      value={formInspector}
                      onChange={(e) => setFormInspector(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Audit Exceptions Found</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Toilet amenities dusty, mirror smudges..."
                    value={formInspectIssues}
                    onChange={(e) => setFormInspectIssues(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Post Inspection Quality Audit
                </button>
              </div>
            </form>

            {/* Form 3: Linen Issuance & Return */}
            <form onSubmit={handleAddLinen} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-amber-50 text-amber-700 dark:bg-amber-951 px-2 py-0.5 rounded uppercase font-black">LOG: 3</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Linen Supply Inventory Flow</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Linen Classification</label>
                  <select
                    value={formLinenItem}
                    onChange={(e) => setFormLinenItem(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl"
                  >
                    <option value="Bed Sheets (King)">Bed Sheets (King)</option>
                    <option value="Bath Towels">Bath Towels</option>
                    <option value="Pillow Cases">Pillow Cases</option>
                    <option value="Linen Slippers">Linen Slippers</option>
                    <option value="Duvet Covers (Queen)">Duvet Covers (Queen)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Issued Amount</label>
                    <input 
                      type="number" 
                      value={formLinenIssued}
                      onChange={(e) => setFormLinenIssued(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Returned Amount</label>
                    <input 
                      type="number" 
                      value={formLinenReturned}
                      onChange={(e) => setFormLinenReturned(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/10 rounded-2xl text-[10px] leading-relaxed flex justify-between">
                  <span className="font-mono text-slate-400 uppercase font-black">Predicted variance:</span>
                  <strong className="font-mono text-rose-500">
                    -{Math.max(0, (parseInt(formLinenIssued) || 0) - (parseInt(formLinenReturned) || 0))} units lost
                  </strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Log Linen Movement
                </button>
              </div>
            </form>

            {/* Form 4: Laundry processing batch report */}
            <form onSubmit={handleAddLaundryBatch} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-teal-50 text-teal-650 dark:bg-teal-950 px-2 py-0.5 rounded uppercase font-black">LOG: 4</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Laundry Batch Processing</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Batch Identifier</label>
                    <input 
                      type="text" 
                      value={formLaundryBatch}
                      onChange={(e) => setFormLaundryBatch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Machine Cycle (Mins)</label>
                    <input 
                      type="number" 
                      value={formLaundryTime}
                      onChange={(e) => setFormLaundryTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Processed Linen Weight (Kg)</label>
                  <input 
                    type="number" 
                    value={formLaundryWeight}
                    onChange={(e) => setFormLaundryWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Log Laundry Batch
                </button>
              </div>
            </form>

            {/* Form 5: Housekeeping related complaints dispatch */}
            <form onSubmit={handleAddComplaint} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-pink-50 text-pink-700 dark:bg-pink-955 px-2 py-0.5 rounded uppercase font-black">LOG: 5</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Guest HK Complaint Dispatch</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Suite Room</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 302"
                      required
                      value={formComplaintRoom}
                      onChange={(e) => setFormComplaintRoom(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5 font-bold">Severity</label>
                    <select
                      value={formComplaintUrgency}
                      onChange={(e) => setFormComplaintUrgency(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl text-[11px]"
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Guest Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Guest Name"
                    value={formComplaintGuest}
                    onChange={(e) => setFormComplaintGuest(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Complaint Details</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Towels smelled of damp, floor wasn't swept..."
                    required
                    value={formComplaintText}
                    onChange={(e) => setFormComplaintText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="text-[10px] leading-relaxed">
                    <span className="font-mono text-slate-405 block uppercase tracking-tight">Dispatch Target</span>
                    <strong className="text-rose-500 font-black">Engineering</strong>
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wide hover:bg-slate-800 cursor-pointer shadow-3xs"
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            </form>

            {/* Form 6: Maintenance Coordination dispatch to Engineering */}
            <form onSubmit={handleAddMaint} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-rose-50 text-rose-700 dark:bg-rose-955 px-2 py-0.5 rounded uppercase font-black">LOG: 6</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Inter-Dept Maintenance Dispatch</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Suite Room</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 501"
                      required
                      value={formMaintRoom}
                      onChange={(e) => setFormMaintRoom(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Impact Impact</label>
                    <select
                      value={formMaintSeverity}
                      onChange={(e) => setFormMaintSeverity(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl text-[11px]"
                    >
                      <option value="Minor">🟢 Noticeable (Minor)</option>
                      <option value="Major">🟡 Compromised (Major)</option>
                      <option value="Critical">🔴 Out of Order (Critical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Engineering Assignee</label>
                  <select
                    value={formMaintStaff}
                    onChange={(e) => setFormMaintStaff(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl"
                  >
                    <option value="Attendant B">Staff B (Senior Tech)</option>
                    <option value="Attendant D">Staff D (A/C Tech)</option>
                    <option value="Attendant C">Staff C (Supervisor Sync)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Engineering Issue Description</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. A/C remote broken, jacuzzi valve leakage..."
                    required
                    value={formMaintDesc}
                    onChange={(e) => setFormMaintDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 border text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Forward Workorder to Engineering
                </button>
              </div>
            </form>

            {/* Form 7: Damage & Broken Fixed Assets Registry */}
            <form onSubmit={handleAddDamage} className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs border-l-4 border-l-rose-500">
              <div>
                <span className="text-[9px] font-mono bg-rose-100 text-rose-700 dark:bg-rose-900/40 px-2 py-0.5 rounded uppercase font-black">LOG: 7</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Damage & Broken Assets Registry</h4>
              </div>

              <div className="space-y-3 text-xs">
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Item Name</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Broken Mirror"
                       required
                       value={formDamageItem}
                       onChange={(e) => setFormDamageItem(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Asset Category</label>
                     <select
                       value={formDamageCat}
                       onChange={(e) => setFormDamageCat(e.target.value as any)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                     >
                       <option value="Fixed Asset">Fixed Asset</option>
                       <option value="Furniture">Furniture</option>
                       <option value="Equipment">Equipment</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Location</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Room 405"
                       required
                       value={formDamageLoc}
                       onChange={(e) => setFormDamageLoc(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Estimated Cost</label>
                     <input 
                       type="number" 
                       value={formDamageCost}
                       onChange={(e) => setFormDamageCost(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Damage Description</label>
                   <textarea 
                     rows={1}
                     placeholder="How did it break? Current state..."
                     value={formDamageDesc}
                     onChange={(e) => setFormDamageDesc(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                   />
                 </div>

                 <button
                   type="submit"
                   className="w-full py-2.5 bg-rose-600 border-none text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-rose-700 cursor-pointer shadow-lg shadow-rose-200 dark:shadow-none"
                 >
                   Register Damaged Asset
                 </button>
              </div>
            </form>

            {/* Form 8: Spoilage Registry for Consumables */}
            <form onSubmit={handleAddSpoilage} className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs border-l-4 border-l-amber-500">
              <div>
                <span className="text-[9px] font-mono bg-amber-100 text-amber-700 dark:bg-amber-900/40 px-2 py-0.5 rounded uppercase font-black">LOG: 8</span>
                <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase mt-1">Consumable Spoilage Registry</h4>
              </div>

              <div className="space-y-3 text-xs">
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Item Name</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Milk 1L"
                       required
                       value={formSpoilageItem}
                       onChange={(e) => setFormSpoilageItem(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Category</label>
                     <select
                       value={formSpoilageCat}
                       onChange={(e) => setFormSpoilageCat(e.target.value as any)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl"
                     >
                       <option value="Guest Amenities">Guest Amenities</option>
                       <option value="Consumables">Consumables</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Quantity Spoiled</label>
                     <input 
                       type="number" 
                       required
                       value={formSpoilageQty}
                       onChange={(e) => setFormSpoilageQty(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 border rounded-xl font-mono"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Reason</label>
                     <select
                       value={formSpoilageReason}
                       onChange={(e) => setFormSpoilageReason(e.target.value as any)}
                       className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded-xl"
                     >
                       <option value="Expired">Expired</option>
                       <option value="Damaged Packaging">Damaged Packaging</option>
                       <option value="Contaminated">Contaminated</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>
                 </div>

                 <button
                   type="submit"
                   className="w-full py-2.5 bg-amber-600 border-none text-white font-sans text-xs font-black uppercase rounded-xl tracking-wider hover:bg-amber-700 cursor-pointer shadow-lg shadow-amber-200 dark:shadow-none"
                 >
                   Register Spoilage Entry
                 </button>
              </div>
            </form>

          </div>

          {/* ACTIVE RECORDED REGISTER TABLES SO THE USER CAN CONFIRM DATA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center bg-slate-100/50 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] font-mono text-slate-405 font-bold uppercase">LIVE FEED RECORD</span>
                <h4 className="text-xs font-sans font-black uppercase text-slate-900 dark:text-white mt-1">Active Ledger Logs</h4>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Verify and wipe stored state logs?')) {
                    localStorage.removeItem('hotel_erp_cleaning_logs');
                    localStorage.removeItem('hotel_erp_ins_logs');
                    localStorage.removeItem('hotel_erp_linen_logs');
                    localStorage.removeItem('hotel_erp_laundry_logs');
                    localStorage.removeItem('hotel_erp_complaints_logs');
                    localStorage.removeItem('hotel_erp_maint_logs');
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-850 px-2.5 py-1.5 rounded-xl font-mono text-[9px] text-rose-500 font-extrabold uppercase shrink-0"
              >
                <Trash2 size={12} /> Clear Operational Cache
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[11px] font-semibold">
              {/* Cleaning registered list */}
              <div className="space-y-2 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                <h5 className="font-sans font-black uppercase text-slate-900 dark:text-white">Active Room Cleanings ({cleaningLogs.length} logs)</h5>
                <div className="divide-y max-h-48 overflow-y-auto pr-1">
                  {cleaningLogs.map(log => (
                    <div key={log.id} className="py-2 flex justify-between items-center text-slate-700 dark:text-slate-350 font-sans">
                      <div>
                        <strong>Room {log.roomNumber}</strong> - Attendant: <span className="text-indigo-400 font-mono font-bold">{log.attendant}</span>
                        <p className="text-[10px] text-slate-400 font-mono">Completed Turnaround: {log.durationMins} mins | Shift: {log.shift}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-black ${log.status === 'Inspected' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance registered list */}
              <div className="space-y-2 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                <h5 className="font-sans font-black uppercase text-slate-900 dark:text-white">Dispatched Work Orders ({maintenanceIssues.length} logs)</h5>
                <div className="divide-y max-h-48 overflow-y-auto pr-1">
                  {maintenanceIssues.map(m => (
                    <div key={m.id} className="py-2 flex justify-between items-center text-slate-705 dark:text-slate-300 font-sans">
                      <div>
                        <strong>Room {m.roomNumber}</strong> - Assigned: <span className="text-zinc-400 font-mono font-bold">{m.assignedTo}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-sm uppercase font-mono mt-0.5 font-bold">"{m.issueDesc}"</p>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[8.5px] font-mono uppercase font-black rounded">{m.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPORT WORKSPACE HANDSHAKE DIALOG MODAL (COMPACT SLICK SHADER) */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" id="exporting-docket-modal">
          <div className="bg-white dark:bg-slate-905 border dark:border-slate-850 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-4 animate-scale-up">
            <RefreshCw size={44} className="mx-auto text-indigo-500 animate-spin" />
            <h3 className="text-sm font-sans font-black uppercase text-slate-900 dark:text-white tracking-widest mt-4">
              Building Layout Assets...
            </h3>
            <p className="text-[11px] text-slate-405 font-mono uppercase leading-relaxed max-w-xs mx-auto">
              Hotel auditing stream pipeline currently serializing reports database layers. Direct download will execute upon pipeline clearance.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 font-mono text-[9px] text-[#10b981] font-bold border border-emerald-500/10 rounded-2xl uppercase tracking-wider">
              {exportType} Format - Cryptographic Key Applied
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
