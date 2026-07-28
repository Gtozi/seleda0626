/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { toISODate, formatTimeAgo } from '../../utils/date';
import { Room, RoomStatus, Reservation } from '../../types/erp';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { 
  Check, 
  X, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Moon, 
  Users, 
  Clock, 
  FileText, 
  Sparkles, 
  Trash2, 
  Info, 
  AlertCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  Wrench,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Plane,
  Car,
  Navigation,
  MessageSquare,
  Send,
  Smartphone,
  Mail
} from 'lucide-react';
import { calculateRemainingBalance } from '../../utils/billing';
import { 
  getRoomAllocationRecommendation, 
  calculateProposedAllocations, 
  calculateOverbookingRisk
} from '../../services/allocationService';
import { DashboardTemplate } from '../Shared/DashboardTemplate';
import { ModalSystem } from '../Shared/ModalSystem';

export default function DashboardModule({
  onNavigateToCRM,
  onProcessCheckout,
  onViewGuestProfile
}: {
  onNavigateToCRM?: (resData: { id: string, roomNumber?: string, guestName: string, guestEmail: string, guestPhone?: string, checkInDate: string, pendingCheckIn?: boolean }) => void;
  onProcessCheckout?: (resId: string) => void;
  onViewGuestProfile?: (guestId: string) => void;
}) {
  const {
    rooms,
    reservations,
    guests,
    guestCommunications,
    addGuestCommunication,
    updateGuestCommunication,
    airportShuttleRequests,
    addAirportShuttleRequest,
    updateAirportShuttleRequest,
    setRoomStatus,
    checkInReservation,
    checkOutReservation,
    assignRoomToReservation,
    currentSystemDate,
    runNightAudit,
    stats,
    notifications,
    clearNotification,
    formatAmount,
    addStructuredAuditLog
  } = useERP();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAuditConfirm, setShowAuditConfirm] = useState(false);
  const [auditResult, setAuditResult] = useState<{ date: string; message: string; revenuePosted: number } | null>(null);
  const [roomFilter, setRoomFilter] = useState<'all' | RoomStatus>('all');
  const [guestSearch, setGuestSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [filterArrivalsToday, setFilterArrivalsToday] = useState(false);

  // 💡 Predictive Pre-Assignment AI Mode state
  const [allocationMode, setAllocationMode] = useState<'standard' | 'predictive'>('predictive'); // default to predictive to showcase the feature!
  const [allocationLog, setAllocationLog] = useState<string[]>([]);
  const [allocationAlert, setAllocationAlert] = useState<string | null>(null);

  // Run automated bulk pre-assignments resolving preferences and housekeeper availability inside room board
  const runBulkPredictiveAllocation = () => {
    const unassignedArrivals = arrivalsToday.filter(r => !r.roomNumber);
    if (unassignedArrivals.length === 0) {
      setAllocationAlert("All standard arriving reservations for today already have assigned rooms!");
      setTimeout(() => setAllocationAlert(null), 5000);
      return;
    }

    const proposed = calculateProposedAllocations(unassignedArrivals, rooms, reservations, guests);
    
    if (proposed.length === 0) {
      setAllocationAlert("No optimal pre-assignments could be automated right now.");
      setTimeout(() => setAllocationAlert(null), 5000);
      return;
    }

    let assignedCount = 0;
    const logs: string[] = [];

    proposed.forEach(p => {
      assignRoomToReservation(p.reservationId, p.roomNumber);
      assignedCount++;
      logs.push(...p.logs);

      const guestName = reservations.find(r => r.id === p.reservationId)?.guestName || 'Guest';

      // Add audit log 
      addStructuredAuditLog?.({
        activity: 'Predictive Pre-Assignment',
        description: `Automated assignment: Room ${p.roomNumber} linked to guest ${guestName} with preference match score of ${p.score}%.`,
        department: 'Front Office',
        user: 'AI Routing Engine'
      });
    });

    setAllocationLog(logs);
    setAllocationAlert(`Predictive Engine completed! Pre-assigned ${assignedCount} incoming guests based on CRM preference arrays.`);
    setTimeout(() => setAllocationAlert(null), 6000);
  };

  // Guest Communication Hub state
  const [guestMessages, setGuestMessages] = useState(guestCommunications.map(comm => ({
    id: comm.id,
    guestName: guests.find(g => g.id === comm.guestId)?.name || 'Unknown Guest',
    room: comm.roomNumber || 'N/A',
    message: comm.message,
    time: formatTimeAgo(comm.createdAt),
    status: comm.status,
    type: comm.messageType,
    reply: comm.reply
  })));
  const [selectedMsgId, setSelectedMsgId] = useState<string>(guestCommunications[0]?.id || '');
  const [replyText, setReplyText] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync guestMessages with guestCommunications from context
  useEffect(() => {
    setGuestMessages(guestCommunications.map(comm => ({
      id: comm.id,
      guestName: guests.find(g => g.id === comm.guestId)?.name || 'Unknown Guest',
      room: comm.roomNumber || 'N/A',
      message: comm.message,
      time: formatTimeAgo(comm.createdAt),
      status: comm.status,
      type: comm.messageType,
      reply: comm.reply
    })));
  }, [guestCommunications, guests]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Update the communication in the database/context
    updateGuestCommunication(selectedMsgId, {
      status: 'Resolved',
      reply: replyText,
      repliedAt: new Date().toISOString(),
      repliedBy: 'Front Desk Agent'
    });

    const activeMsg = guestMessages.find(m => m.id === selectedMsgId);
    if (activeMsg && addStructuredAuditLog) {
      addStructuredAuditLog({
        action: 'GUEST_COMMUNICATION_REPLY',
        user: 'Front Desk Agent',
        details: `Sent smart reply to ${activeMsg.guestName} (${activeMsg.room}): "${replyText}"`,
        ipAddress: '192.168.1.33',
        status: 'Success',
        severity: 'Low'
      });
    }

    setReplyText('');
    setSuccessMessage(`Reply sent to ${activeMsg?.guestName || 'guest'}!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // 1. ARRIVALS TODAY
  const arrivalsToday = reservations.filter(
    res => res.status === 'Confirmed' && res.checkInDate === currentSystemDate
  );
  const arrivalsCheckedIn = reservations.filter(
    res => res.status === 'CheckedIn' && res.checkInDate === currentSystemDate
  ).length;

  // 2. DEPARTURES TODAY
  const departuresToday = reservations.filter(
    res => res.status === 'CheckedIn' && res.checkOutDate === currentSystemDate
  );
  const departuresCheckedOut = reservations.filter(
    res => res.status === 'CheckedOut' && res.checkOutDate === currentSystemDate
  ).length;

  // 3. IN-HOUSE GUESTS
  const inHouseGuests = reservations.filter(
    res => res.status === 'CheckedIn' && 
    (res.guestName.toLowerCase().includes(guestSearch.toLowerCase()) || 
     (res.roomNumber && res.roomNumber.includes(guestSearch)))
  );

  // 4. OCCUPANCY %
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status.includes('Occupied')).length;
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // 5. REVENUE SNAPSHOT
  const totalRevenue = stats.totalRevenue;
  const adr = stats.adr;
  const revpar = stats.revpar;

  // 6. PENDING PAYMENTS 
  let pendingPaymentsTotal = 0;
  const pendingPaymentsList: Array<{ id: string; name: string; room?: string; balance: number; total: number }> = [];

  reservations.forEach(res => {
    if (res.status === 'CheckedIn' || res.status === 'Confirmed') {
      const balance = calculateRemainingBalance(res);
      
      if (balance > 1) {
        pendingPaymentsTotal += balance;
        pendingPaymentsList.push({
          id: res.id,
          name: res.guestName,
          room: res.roomNumber,
          balance: balance,
          total: res.totalAmount
        });
      }
    }
  });
  // Sort list to show highest pending balances first
  pendingPaymentsList.sort((a, b) => b.balance - a.balance);

  // 7. HOUSEKEEPING ALERTS
  const activeDirtyRooms = rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Occupied Dirty');
  const housekeepingDispatches = notifications.filter(
    n => n.department === 'Housekeeping' && !n.read
  );

  // 8. MAINTENANCE ALERTS
  const activeOOORooms = rooms.filter(r => r.status === 'Out of Order');
  const maintenanceDispatches = notifications.filter(
    n => n.department === 'Maintenance' && !n.read
  );

  // 9. VIP ARRIVALS Today & Staying
  const vipArrivals = reservations.filter(
    res => res.guestStatus === 'VIP' && 
    (res.status === 'Confirmed' || res.status === 'CheckedIn') &&
    (res.checkInDate === currentSystemDate || res.checkOutDate === currentSystemDate)
  );

  // 10. AIRPORT SHUTTLE REQUESTS (Advance Schedule: T+1)
  const tomorrowDate = currentSystemDate ? (() => { const d = new Date(currentSystemDate); d.setDate(d.getDate() + 1); return toISODate(d); })() : '';
  const shuttleRequests = airportShuttleRequests
    .filter(req => req.scheduledDate === tomorrowDate)
    .map(req => ({
      id: req.id,
      guestName: guests.find(g => g.id === req.guestId)?.name || 'Unknown Guest',
      room: req.roomNumber || 'N/A',
      time: req.scheduledTime,
      type: req.shuttleType,
      flight: req.flightNumber || 'N/A',
      status: req.status,
      quantity: req.quantity || 1
    }));

  // 10. OVERBOOKING WARNINGS RISK RADAR
  const overbookingWarnings = calculateOverbookingRisk(rooms, reservations, currentSystemDate);

  // 11. RESERVATION SOURCE ANALYTICS
  const sourceCounts: { [key: string]: number } = {};
  reservations.forEach(res => {
    const ch = res.channel || 'Direct Website';
    sourceCounts[ch] = (sourceCounts[ch] || 0) + 1;
  });

  const sourceChartData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value
  }));

  const sourceColors: { [key: string]: string } = {
    'Expedia': '#f43f5e',
    'Walk-In': '#10b981',
    'Direct Website': '#3b82f6',
    'Corporate': '#8b5cf6',
    'Booking.com': '#eab308',
    'OTA': '#06b6d4',
  };

  // Helper for live room grid clean / dirty selectors
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'Vacant Clean': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 hover:from-emerald-100 hover:to-emerald-150';
      case 'Vacant Dirty': return 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 border-amber-200 hover:from-amber-100 hover:to-amber-150';
      case 'Occupied Clean': return 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200 hover:from-indigo-100 hover:to-indigo-150';
      case 'Occupied Dirty': return 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-200 hover:from-purple-100 hover:to-purple-150';
      case 'Out of Order': return 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-800 border-rose-200 hover:from-rose-100 hover:to-rose-150';
      default: return 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 border-slate-200 hover:from-slate-100 hover:to-slate-150';
    }
  };

  const getBadgeColor = (status: RoomStatus) => {
    switch (status) {
      case 'Vacant Clean': return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
      case 'Vacant Dirty': return 'bg-gradient-to-r from-amber-400 to-amber-500';
      case 'Occupied Clean': return 'bg-gradient-to-r from-indigo-400 to-indigo-500';
      case 'Occupied Dirty': return 'bg-gradient-to-r from-purple-400 to-purple-500';
      case 'Out of Order': return 'bg-gradient-to-r from-rose-400 to-rose-500';
    }
  };

  const executeAudit = () => {
    const res = runNightAudit();
    setAuditResult(res);
    setShowAuditConfirm(false);
    setTimeout(() => {
      setAuditResult(null);
    }, 5000);
  };

  // Live room search or filtered grid output
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(roomSearch) || room.type.toLowerCase().includes(roomSearch.toLowerCase());
    const matchesFilter = roomFilter === 'all' || room.status === roomFilter;
    
    if (filterArrivalsToday) {
      const hasArrivalToday = reservations.some(res => 
        res.roomNumber === room.number && 
        res.checkInDate === currentSystemDate && 
        res.status === 'Confirmed'
      );
      return matchesSearch && matchesFilter && hasArrivalToday;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardTemplate id="dashboard-module-container">

      {auditResult && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-3 animate-bounce">
          <Sparkles size={16} className="text-amber-400 animate-spin" />
          <div>
            <strong>Automated Day End Completed:</strong> Posted {formatAmount(auditResult.revenuePosted)} in room tariffs. Operating date advances to <strong className="text-white font-bold">{auditResult.date}</strong>.
          </div>
        </div>
      )}

      {/* SECTION 1: ESSENTIAL KPI WIDGETS (FIRST ROW) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" id="stats-banner">
        
        {/* WIDGET 1: Arrivals Today */}
        <div className="p-5 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900/30 dark:to-emerald-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5 smooth-transition">
          <div>
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Arrivals Today</p>
            <h3 className="text-2xl font-sans font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {arrivalsToday.length} <span className="text-xs font-mono font-semibold text-slate-400">due</span>
            </h3>
            <p className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {arrivalsCheckedIn} Checked-In Today
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl text-emerald-600 border border-emerald-200 shadow-inner">
            <ArrowDownLeft size={18} />
          </div>
        </div>

        {/* WIDGET 2: Departures Today */}
        <div className="p-5 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900/30 dark:to-indigo-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5 smooth-transition">
          <div>
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Departures Today</p>
            <h3 className="text-2xl font-sans font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {departuresToday.length} <span className="text-xs font-mono font-semibold text-slate-400">due</span>
            </h3>
            <p className="text-[10px] text-indigo-600 font-mono font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> {departuresCheckedOut} Checkout Transactions
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl text-indigo-600 border border-indigo-200 shadow-inner">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* WIDGET 3: In-house Guests Count */}
        <div className="p-5 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900/30 dark:to-amber-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5 smooth-transition">
          <div>
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">In-house Guests</p>
            <h3 className="text-2xl font-sans font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {inHouseGuests.length} <span className="text-xs font-mono font-semibold text-slate-400">active</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Occupying {occupiedCount} rooms inside hotel
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-amber-600 border border-amber-200 shadow-inner">
            <Users size={18} />
          </div>
        </div>

        {/* WIDGET 4: Occupancy % */}
        <div className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5 space-y-1.5 smooth-transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Occupancy %</p>
              <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tight mt-0.5">{occupancyPercentage}%</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {occupiedCount}/{totalRooms} Rooms
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${
                occupancyPercentage > 85 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : occupancyPercentage > 60 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* SECTION 2: REVENUE, SOURCE ANALYTICS & RISK WARNINGS (SECOND ROW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* WIDGET 5: Revenue Snapshot */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/20 text-slate-900 dark:text-slate-200 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/20 border border-indigo-200 dark:border-indigo-700/50 flex flex-col justify-between space-y-4 hover:shadow-xl dark:hover:shadow-slate-900/30 transition-shadow duration-300 backdrop-blur-xl smooth-transition">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-extrabold">Finance Engine Ledger</span>
              <h3 className="text-xs font-sans font-bold text-slate-700">Revenue Snapshot</h3>
            </div>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 text-indigo-600 rounded-lg">
              <DollarSign size={14} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono">Total System Revenue Cumulative</span>
              <div className="text-3xl font-sans font-black text-slate-900 tracking-tight">{formatAmount(totalRevenue)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">ADR (Average Daily Rate)</span>
                <span className="text-sm font-bold text-indigo-600">{formatAmount(adr)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">RevPAR (Rev Per Available Room)</span>
                <span className="text-sm font-bold text-indigo-600">{formatAmount(revpar)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center justify-between">
            <span>Room Tariff Booking Margin</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp size={11} /> +12.4% target pace
            </span>
          </div>
        </div>

        {/* WIDGET 6: Guest Communication Hub */}
        <div className="bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900/30 dark:to-indigo-900/20 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 flex flex-col justify-between space-y-3 smooth-transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold block flex items-center gap-1">
                <MessageSquare size={13} className="text-indigo-600" />
                Guest Communication
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">Active requests & messages from in-house rooms.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-gradient-to-r from-indigo-50 to-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {guestMessages.filter(m => m.status === 'Pending').length} pending
            </span>
          </div>

          <div className="space-y-2 flex-1 max-h-[140px] overflow-y-auto pr-1">
            {guestMessages.map(item => (
              <div 
                key={item.id} 
                onClick={() => {
                  setSelectedMsgId(item.id);
                  if (item.status === 'Resolved') {
                    setReplyText(item.reply || '');
                  } else {
                    setReplyText('');
                  }
                }}
                className={`text-xs p-2.5 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
                  selectedMsgId === item.id 
                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-300 shadow-sm' 
                    : 'bg-slate-50/45 border-transparent hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-slate-800">{item.guestName}</span>
                    <span className="text-[9px] text-indigo-600 font-mono font-bold ml-1.5">{item.room}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.1 rounded font-extrabold uppercase ${
                    item.status === 'Pending' 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-600 border border-amber-200' 
                      : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 border border-emerald-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans mt-1 line-clamp-1">{item.message}</p>
                <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400 font-mono">
                  <span>Category: {item.type}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Reply box */}
          <div className="pt-2 border-t border-slate-100">
            {successMessage ? (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-3xs font-mono font-bold text-center animate-pulse">
                {successMessage}
              </div>
            ) : (
              (() => {
                const activeMsg = guestMessages.find(m => m.id === selectedMsgId);
                if (!activeMsg) return null;
                return (
                  <form onSubmit={handleSendReply} className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Reply to <strong>{activeMsg.guestName}</strong>:</span>
                      {activeMsg.status === 'Resolved' && (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">✓ Resolved</span>
                      )}
                    </div>
                    {activeMsg.status === 'Resolved' ? (
                      <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 italic border border-slate-100">
                        {activeMsg.reply}
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-1">
                        <input 
                          type="text"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type response (e.g. Towels arriving shortly)"
                          className="w-full px-3 py-1.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-650"
                        />
                        <button 
                          type="submit"
                          className="p-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                          <Send size={11} />
                        </button>
                      </div>
                    )}
                  </form>
                );
              })()
            )}
          </div>
        </div>

        {/* WIDGET 10: Overbooking Warnings */}
        <div className="bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-900/30 dark:to-rose-900/20 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 flex flex-col justify-between space-y-3 smooth-transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold block">Overbooking Warnings</h4>
              <p className="text-[10px] text-slate-500 font-sans">Compare booked counts against physical stock.</p>
            </div>
            {overbookingWarnings.length > 0 ? (
              <span className="p-1 px-2.5 bg-gradient-to-r from-rose-100 to-rose-200 border border-rose-300 text-rose-700 text-[10px] font-mono font-extrabold rounded-full animate-pulse">
                {overbookingWarnings.length} Category Alert
              </span>
            ) : (
              <span className="p-0.5 px-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 text-[9px] font-mono font-bold rounded-full">
                ✓ Risk Safe
              </span>
            )}
          </div>

          <div className="space-y-2.5 flex-1 max-h-[145px] overflow-y-auto pr-1">
            {overbookingWarnings.length === 0 ? (
              <div className="p-6 bg-emerald-50/40 border border-dashed border-emerald-100 rounded-xl text-center space-y-1.5 mt-2">
                <ShieldCheck className="mx-auto text-emerald-500" size={18} />
                <p className="text-xs font-semibold text-emerald-800 font-sans">Inventory Risk: Green</p>
                <p className="text-[10px] text-slate-400 font-mono">No overbooking risks found for {currentSystemDate}.</p>
              </div>
            ) : (
              overbookingWarnings.map(warn => (
                <div key={warn.roomType} className="p-2.2 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-rose-800 font-bold">Overbooked Category: {warn.roomType}</strong>
                    <span className="text-[10px] font-mono text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded font-extrabold">+{warn.excess} excess</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>Physical Stock: {warn.capacity} rooms</span>
                    <span>Booked Active: {warn.activeBookings} accounts</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '100%' }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-400">
            System automatically restricts over-limit client-side quotes.
          </div>
        </div>

      </div>

      {/* SECTION 3: CHARTS, TELEMETRY ALERTS & VIP LISTS (THIRD ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">

        {/* WIDGET 11: Reservation Source Analytics */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">Source Revenue Analytics</h4>
            <p className="text-[10px] text-slate-500 font-sans">Reservations by incoming source channels.</p>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            {/* Pie Chart element */}
            <div className="col-span-5 h-24 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    innerRadius={22}
                    outerRadius={38}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sourceColors[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold leading-none text-slate-800">{reservations.length}</span>
                <span className="text-[7px] font-mono text-slate-400 uppercase mt-0.5 font-bold">Total</span>
              </div>
            </div>

            {/* Custom chart legend */}
            <div className="col-span-7 space-y-1 font-mono text-[9px] max-h-[110px] overflow-y-auto pr-0.5 border-l border-slate-50 pl-3">
              {sourceChartData.map(ch => {
                const color = sourceColors[ch.name] || '#64748b';
                return (
                  <div key={ch.name} className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1 font-semibold truncate">
                      <span className="w-1 h-1 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                      {ch.name}
                    </span>
                    <span className="font-bold shrink-0">{ch.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-1 text-[9px] font-mono text-slate-400 border-t border-slate-100">
            Internal Market Segmentation Logic Active
          </div>
        </div>

        {/* DEPARTURES CHECKLIST WIDGET */}
        <div className="bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-900/30 dark:to-rose-900/20 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase text-rose-600 font-extrabold flex items-center gap-1">
                <ArrowUpRight size={13} className="text-rose-500" /> Departures Today
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">Guests scheduled for checkout today.</p>
            </div>
            <span className="px-2 py-0.5 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 font-mono text-3xs font-bold rounded-full border border-rose-200">
              {departuresToday.length} Due
            </span>
          </div>

          <div className="space-y-2 flex-1 max-h-[145px] overflow-y-auto pr-1">
            {departuresToday.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic font-mono py-8">
                No guests due to depart {currentSystemDate}.
              </div>
            ) : (
              departuresToday.map(res => (
                <div key={res.id} className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-slate-900/30 hover:border-slate-300 dark:hover:border-slate-600">
                   <div className="flex justify-between items-start">
                      <div>
                         <div className="font-bold text-xs text-slate-800">{res.guestName}</div>
                         <div className="text-[9px] font-mono text-slate-500 leading-normal">
                           Room {res.roomNumber} | Folio: {res.id}
                         </div>
                      </div>
                      <button 
                        onClick={() => onProcessCheckout ? onProcessCheckout(res.id) : checkOutReservation(res.id)}
                        className="px-2 py-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-mono text-[9px] rounded font-bold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        Checkout
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center pt-2 border-t border-slate-50">
            <span>Folio verification active</span>
            <span className="text-rose-600 font-bold">{departuresCheckedOut} Settled Today</span>
          </div>
        </div>

        {/* WIDGET 9: VIP Arrivals Spotlight */}
        <div className="bg-gradient-to-br from-white to-amber-50/20 dark:from-slate-900/30 dark:to-amber-900/20 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase text-teal-700 font-extrabold flex items-center gap-1">
                <Award size={13} className="text-amber-500 animate-pulse" /> VIP Priority Roster
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">High priority concierge arrivals for today.</p>
            </div>
            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 font-mono text-3xs font-extrabold rounded-full border border-amber-300">
              {vipArrivals.length} High Profile
            </span>
          </div>

          <div className="space-y-2 flex-1 max-h-[145px] overflow-y-auto pr-1">
            {vipArrivals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic font-mono py-8">
                No VIP accounts scheduled for stay modifications today.
              </div>
            ) : (
              vipArrivals.map(res => (
                <div key={res.id} className="p-2 bg-gradient-to-tr from-amber-50/50 to-indigo-50/10 dark:from-amber-900/30 dark:to-indigo-900/20 border border-amber-100 dark:border-amber-700/50 rounded-xl space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-800 text-xs block">{res.guestName}</strong>
                      <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[140px]">
                        Category: {res.roomType} {res.roomNumber ? `| Code Room ${res.roomNumber}` : '| Room Req'}
                      </span>
                    </div>
                    <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold italic uppercase">
                      VIP Level
                    </span>
                  </div>
                  {res.notes && (
                    <div className="p-1.5 bg-white text-[10px] text-amber-700 border border-amber-100 rounded italic font-sans truncate">
                      ★ {res.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center">
            <span>Requests pre-loaded</span>
            <span className="text-indigo-600 font-bold">100% On-time</span>
          </div>
        </div>

        {/* NEW WIDGET: Airport Shuttle Requests (One Day Advance) */}
        <div className="bg-gradient-to-br from-white to-indigo-50/20 border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase text-indigo-700 font-extrabold flex items-center gap-1">
                <Plane size={13} className="text-indigo-500" /> Airport Shuttle
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">Advance Schedule: {tomorrowDate}</p>
            </div>
            <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 font-mono text-3xs font-bold rounded-full border border-indigo-200">
              {shuttleRequests.length} Due Tomorrow
            </span>
          </div>

          <div className="space-y-2 flex-1 max-h-[145px] overflow-y-auto pr-1">
            {shuttleRequests.map(item => (
              <div key={item.id} className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 transition-all duration-200 hover:shadow-md dark:hover:shadow-slate-900/30 hover:border-slate-300 dark:hover:border-slate-600">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-800 text-xs font-bold truncate">{item.guestName}</strong>
                      <span className={`text-[8px] font-mono px-1 rounded-sm uppercase font-black ${
                        item.type === 'Pickup' ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border border-amber-200'
                      }`}>
                        {item.type}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[8px] font-mono px-1 rounded-sm uppercase font-black bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 border border-indigo-200">
                          Qty {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5 flex items-center gap-2">
                       <span className="flex items-center gap-0.5"><Clock size={9} /> {item.time}</span>
                       <span className="flex items-center gap-0.5"><Plane size={9} /> {item.flight}</span>
                       <span className="flex items-center gap-0.5"><Navigation size={9} /> Rm {item.room}</span>
                    </div>
                  </div>
                  <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                    item.status === 'Confirmed' ? 'border-indigo-200 text-indigo-600 bg-gradient-to-r from-indigo-50 to-indigo-100' : 
                    item.status === 'Completed' ? 'border-emerald-200 text-emerald-600 bg-gradient-to-r from-emerald-50 to-emerald-100' : 
                    'border-slate-200 text-slate-500 bg-slate-50'
                  }`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center pt-2 border-t border-slate-50">
            <span className="flex items-center gap-1"><Car size={10} /> Fleet: 3 Active</span>
            <span className="text-indigo-600 font-bold">Resorts Hub Sync: OK</span>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: Interactive Live Room Grid + checked in folios ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* WIDGET 12: Live Room Status Interactive Board (Takes 2 Columns) */}
        <div className={`lg:col-span-2 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/20 border ${filterArrivalsToday ? 'border-emerald-300/60 ring-2 ring-emerald-500/10 shadow-emerald-100/30' : 'border-slate-200 dark:border-slate-700'} rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-slate-900/20 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-500 space-y-4 sm:space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-100/80 pb-3 sm:pb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="text-indigo-500" size={14} sm:size={16} /> Live Room Status Inventory
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Dynamic system grid. Select cells to post instant cleaning or mechanical dispatches.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Find room..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="px-2 sm:px-3 py-1.5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] sm:text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-24 sm:w-32 transition-all duration-200"
              />

              <button
                type="button"
                onClick={() => {
                  setFilterArrivalsToday(!filterArrivalsToday);
                  if (!filterArrivalsToday) setRoomFilter('all');
                }}
                className={`px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1 sm:gap-1.5 border cursor-pointer select-none ${
                  filterArrivalsToday 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-md hover:shadow-lg transform scale-[1.02]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <UserCheck size={11} sm:size={13} className={filterArrivalsToday ? 'animate-bounce' : ''} />
                <span className="hidden sm:inline">Arrivals Today</span>
                <span className="sm:hidden">Arrivals</span>
              </button>

              <select 
                value={roomFilter} 
                onChange={(e) => setRoomFilter(e.target.value as any)}
                className="px-2 py-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] sm:text-xs font-mono text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer transition-all duration-200"
              >
                <option value="all">All States</option>
                <option value="Vacant Clean">Vacant Clean</option>
                <option value="Vacant Dirty">Vacant Dirty</option>
                <option value="Occupied Clean">Occupied Clean</option>
                <option value="Occupied Dirty">Occupied Dirty</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1">
            {filteredRooms.map(room => {
              const checkedInRes = reservations.find(r => r.roomNumber === room.number && r.status === 'CheckedIn');
              return (
                <button
                  key={room.id}
                  id={`room-btn-${room.number}`}
                  onClick={() => setSelectedRoom(room)}
                  className={`relative p-2 sm:p-3.5 rounded-xl border text-left transition-all duration-200 hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col justify-between h-20 sm:h-24 ${getStatusColor(room.status)} shadow-sm cursor-pointer group`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-mono text-[10px] sm:text-xs font-bold">{room.number}</span>
                    <span className="text-[8px] sm:text-3xs font-mono opacity-80 uppercase font-semibold">{room.type.substring(0, 3)}</span>
                  </div>
                  
                  {checkedInRes ? (
                    <div className="truncate w-full text-[9px] sm:text-2xs font-sans font-bold text-slate-850 leading-tight">
                      👤 {checkedInRes.guestName.split(' ')[1] || checkedInRes.guestName}
                      {checkedInRes.guestStatus === 'VIP' && (
                        <span className="inline-block ml-1 text-[9px] sm:text-2xs text-amber-500 animate-pulse">★</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider opacity-60">
                      Empty
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${getBadgeColor(room.status)} shadow-sm`}></span>
                    <span className="text-[7px] sm:text-[8px] font-mono uppercase truncate max-w-[45px] sm:max-w-[55px] font-bold">
                      {room.status.replace('Vacant ', 'Vac. ').replace('Occupied ', 'Occ. ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ARRIVALS CHECKLIST WIDGET SECTION */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-slate-900/20 space-y-4 flex flex-col justify-start transition-colors duration-300 pointer-events-auto">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-start gap-2">
            <div 
              className="cursor-pointer group flex flex-col"
              onClick={() => {
                setFilterArrivalsToday(!filterArrivalsToday);
                if (!filterArrivalsToday) setRoomFilter('all');
              }}
            >
              <h3 className="text-sm font-sans font-semibold text-slate-850 flex items-center gap-1.5 group-hover:text-emerald-500 transition-colors">
                <UserCheck className={filterArrivalsToday ? 'text-emerald-500 animate-pulse' : 'text-slate-400 group-hover:text-emerald-400'} size={15} /> Arrivals Today
              </h3>
              <p className="text-xs text-slate-400">Scheduled checks for {currentSystemDate}.</p>
            </div>
            
            <div className="flex flex-col items-end gap-1.5">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-3xs font-bold rounded-full border border-emerald-100">
                {arrivalsToday.length} Due
              </span>
              
              {/* Dynamic Mode Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-lg text-[9px] select-none border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAllocationMode('standard')}
                  className={`px-1.5 py-0.75 rounded-md font-bold transition-all uppercase cursor-pointer ${
                    allocationMode === 'standard'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => setAllocationMode('predictive')}
                  className={`px-1.5 py-0.75 rounded-md font-bold transition-all uppercase cursor-pointer flex items-center gap-0.5 ${
                    allocationMode === 'predictive'
                      ? 'bg-indigo-600 text-white shadow-3xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Activate predictive pre-assignment based on CRM preferences and Housekeeping ready status"
                >
                  <Sparkles size={9} className="animate-pulse text-amber-300" /> AI Match
                </button>
              </div>
            </div>
          </div>

          {/* If predictive mode & alerts/logs are active */}
          {allocationAlert && (
            <div className="p-2.5 text-[10px] font-sans font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-700/50 animate-pulse">
              💡 {allocationAlert}
            </div>
          )}

          {allocationMode === 'predictive' && arrivalsToday.some(r => !r.roomNumber) && (
            <div className="p-3 bg-gradient-to-br from-indigo-50/60 to-slate-50 dark:from-indigo-900/20 dark:to-slate-900/20 border border-indigo-100 dark:border-indigo-700/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-2xs">
                <div className="flex items-center gap-1 font-sans font-extrabold text-indigo-950">
                  <Sparkles size={11} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>PREDICTIVE ALLOCATION CORE</span>
                </div>
                <span className="text-[8px] font-mono text-slate-450 uppercase bg-indigo-150 px-1 py-0.25 rounded">
                  Ready status sync
                </span>
              </div>
              <p className="text-3xs text-slate-500 font-sans leading-tight">
                Evaluate guest pillow, floor elevation, and scenery options in CRM against active room readiness to auto-assign optimal layouts.
              </p>
              <button
                type="button"
                onClick={runBulkPredictiveAllocation}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-3xs font-black uppercase rounded-lg shadow-2xs transition hover:scale-[1.01] flex items-center justify-center gap-1 cursor-pointer select-none"
              >
                <Sparkles size={11} className="text-amber-300" /> Auto-Preassign Arriving Rooms
              </button>
            </div>
          )}

          {/* Allocation Logs block */}
          {allocationMode === 'predictive' && allocationLog.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700 max-h-[100px] overflow-y-auto space-y-1">
              <div className="text-[8px] font-mono uppercase text-slate-400 font-bold tracking-wider">Allocation Engine Outputs:</div>
              {allocationLog.map((logStr, idx) => (
                <div key={idx} className="text-[9px] font-mono text-slate-600 leading-tight">
                  {logStr}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 flex-1">
            {arrivalsToday.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                No due arrivals left for {currentSystemDate}.
              </div>
            ) : (
              arrivalsToday.map(res => {
                // Find potential rooms for classic standard assignment (Vacant Clean of requested type)
                const availableRoomsOfType = rooms.filter(
                  r => r.type === res.roomType && r.status === 'Vacant Clean'
                );

                // Fetch prediction if in AI / predictive mode
                const guestProfile = guests.find(g => 
                  g.name.toLowerCase() === res.guestName.toLowerCase() || g.email === res.guestEmail
                );
                
                let assignedRec: any = null;
                if (res.roomNumber) {
                  const assignedRoom = rooms.find(rm => rm.number === res.roomNumber);
                  if (assignedRoom) {
                    assignedRec = getRoomAllocationRecommendation(res, assignedRoom, guests);
                  }
                }

                // Precompute predictive details if not assigned
                let recResultNode: React.ReactNode = null;
                if (!res.roomNumber && allocationMode === 'predictive') {
                  const vacantCleanOptions = rooms.filter(
                    r => r.type === res.roomType && r.status === 'Vacant Clean'
                  );
                  const vacantDirtyOptions = rooms.filter(
                    r => r.type === res.roomType && r.status === 'Vacant Dirty'
                  );

                  if (vacantCleanOptions.length > 0) {
                    const ratedCleanOpts = vacantCleanOptions.map(rm => ({
                      rm,
                      rec: getRoomAllocationRecommendation(res, rm, guests)
                    })).sort((a, b) => b.rec.score - a.rec.score);
                    
                    const bestClean = ratedCleanOpts[0];
                    recResultNode = (
                      <div className="space-y-1 border border-dashed border-indigo-200 bg-indigo-50/10 p-2 rounded-lg text-3xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold text-indigo-700 flex items-center gap-0.5 uppercase">
                            <Sparkles size={9} /> Optimal Allocation Recommend
                          </span>
                          <span className="px-1.5 py-0.25 font-sans bg-emerald-50 text-emerald-700 font-extrabold rounded">
                            {bestClean.rec.score}% match
                          </span>
                        </div>
                        <p className="text-slate-500 font-sans leading-tight">
                          Recommend **Room {bestClean.rm.number}** (Floor {bestClean.rm.floor}) based on CRM preferences:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bestClean.rec.matched.slice(1).map((m: string, idx: number) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 px-1 rounded text-[7.5px]">
                              {m.includes(':') ? m.split(':')[1] : m}
                            </span>
                          ))}
                          {bestClean.rec.pillowRequested && (
                            <span className="bg-amber-100 text-amber-805 px-1 rounded text-[7.5px] font-semibold">
                              ⚡ Auto feathers pillow kit
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => assignRoomToReservation(res.id, bestClean.rm.number)}
                          className="w-full mt-1.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-mono font-black text-[9px] uppercase tracking-wide rounded cursor-pointer transition-colors"
                        >
                          Accept pre-assignment room {bestClean.rm.number}
                        </button>
                      </div>
                    );
                  } else if (vacantDirtyOptions.length > 0) {
                    const bestDirty = vacantDirtyOptions[0];
                    recResultNode = (
                      <div className="space-y-1.5 border border-dashed border-amber-200 bg-amber-50/5 p-2 rounded-lg text-3xs">
                        <div className="flex justify-between items-center text-amber-700">
                          <span className="font-mono font-bold uppercase flex items-center gap-0.5">
                            ⚠️ Dirty Room Pipeline Wait (Inspected None)
                          </span>
                        </div>
                        <p className="text-slate-500 font-sans leading-tight">
                          No ready Vacant Clean rooms of type **{res.roomType}** exist in Housekeeping right now. Room {bestDirty.number} matches guest profile but is currently Dirty.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            assignRoomToReservation(res.id, bestDirty.number);
                            setRoomStatus(bestDirty.number, 'Vacant Clean');
                            setAllocationAlert(`Pre-assigned and sent Housekeeping rush speed-run order on Room ${bestDirty.number}!`);
                            setTimeout(() => setAllocationAlert(null), 4000);
                          }}
                          className="w-full py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-bold tracking-wide rounded border border-amber-200/50 cursor-pointer transition select-none uppercase"
                        >
                          ⚡ Bypass & Force Rush Clean Room {bestDirty.number}
                        </button>
                      </div>
                    );
                  } else {
                    recResultNode = (
                      <div className="p-2 border border-rose-200 bg-rose-50/10 rounded-lg text-3xs text-rose-850">
                        ❌ **Room Type Sold Out**: No rooms of type {res.roomType} are currently available clean or dirty. Upgrades or manual adjustment required.
                      </div>
                    );
                  }
                }

                return (
                  <div key={res.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 transition-colors duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-805">{res.guestName}</span>
                          {guestProfile?.status === 'VIP' && (
                            <span className="px-1 py-0.25 bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-[8px] uppercase tracking-wider scale-[0.95]">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-3xs font-mono text-slate-400 leading-normal">
                          {res.roomType} room | Adults: {res.adults} | Source: {res.channel}
                        </div>
                      </div>
                      <span className="text-3xs font-mono text-indigo-650 font-extrabold">{formatAmount(res.totalAmount || 0)}</span>
                    </div>

                    {/* Pre-Assignment details depending on Mode */}
                    {allocationMode === 'predictive' && (
                      <div className="border-t border-slate-100 pt-2 space-y-1.5">
                        {res.roomNumber && assignedRec ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-3xs font-mono text-slate-600">
                                Allocated layout: <span className="font-extrabold text-slate-900">Room {res.roomNumber}</span>
                              </span>
                              <span className="text-[9px] font-sans font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.25 rounded flex items-center gap-0.5">
                                <Sparkles size={8} /> {assignedRec.score}% Match
                              </span>
                            </div>
                            
                            {/* Matching badges */}
                            <div className="flex flex-wrap gap-1">
                              {assignedRec.matched.slice(1).map((matchStr: string, idx: number) => (
                                <span key={idx} className="text-[7.5px] font-sans bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded px-1 flex items-center gap-0.5">
                                  ✓ {matchStr.includes(':') ? matchStr.split(':')[0] : matchStr}
                                </span>
                              ))}
                              {assignedRec.actions.map((act: string, idx: number) => (
                                <span key={idx} className="text-[7.5px] font-sans bg-amber-50 text-amber-700 border border-amber-100 rounded px-1 font-semibold">
                                  ⚡ {act}
                                </span>
                              ))}
                              {assignedRec.warnings.map((w: string, idx: number) => (
                                <span key={idx} className="text-[7.5px] font-sans bg-rose-50 text-rose-700 border border-rose-100 rounded px-1 font-semibold">
                                  ⚠️ {w.includes(':') ? w.split(':')[0] : w}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          recResultNode
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-slate-100 dark:border-slate-800/40">
                      {res.roomNumber ? (
                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-350 block">
                          Current Room: <span className="font-extrabold text-slate-805 dark:text-slate-100">Room {res.roomNumber}</span>
                        </div>
                      ) : (
                        <div className="text-3xs text-amber-600 font-mono flex items-center gap-0.5">
                          <AlertCircle size={10} /> Room assignment needed
                        </div>
                      )}

                      <div className="flex gap-1">
                        {/* Classic Mode - Standard manual setup */}
                        {allocationMode === 'standard' && !res.roomNumber && availableRoomsOfType.length > 0 && (
                          <button
                            onClick={() => assignRoomToReservation(res.id, availableRoomsOfType[0].number)}
                            className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-mono text-3xs rounded-md transition cursor-pointer font-bold"
                          >
                            Assign Room {availableRoomsOfType[0].number}
                          </button>
                        )}
                        {res.roomNumber && (
                          <button
                            onClick={() => {
                              onNavigateToCRM?.({ id: res.id, roomNumber: res.roomNumber, guestName: res.guestName, guestEmail: res.guestEmail, guestPhone: res.guestPhone, checkInDate: res.checkInDate, pendingCheckIn: true });
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-3xs rounded-lg shadow-3xs font-black uppercase tracking-wide transition cursor-pointer select-none"
                          >
                            Check-In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* LOWER ROW: IN-HOUSE ACTIVE GUEST TABLE (WIDGET 3 FULL LEDGER) */}
      <div className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-slate-900/20 space-y-4 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-80s text-slate-800 dark:text-white flex items-center gap-1.5">
              <Users size={16} className="text-indigo-400" /> In-House Guest Directory Ledger
            </h3>
            <p className="text-xs text-slate-400">Search profiles, view assigned rooms, and trigger checkout folios instantaneously.</p>
          </div>
          <input
            type="text"
            placeholder="Search active guest / room number..."
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-650 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          />
        </div>

        {inHouseGuests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            No checked-in guests inside property match search queries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400 font-sans border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 font-mono text-slate-400 text-3xs uppercase bg-slate-50 dark:bg-slate-800/40">
                  <th className="py-2 px-3">Room Target</th>
                  <th className="py-2 px-3">Guest Name & Email</th>
                  <th className="py-2 px-3">Loyalty Profile</th>
                  <th className="py-2 px-3 flex-1">CheckIn / Out Dates</th>
                  <th className="py-2 px-3">Nightly Rate</th>
                  <th className="py-2 px-3 text-right">Instant Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inHouseGuests.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors duration-200">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-850 dark:text-slate-200">
                      {res.roomNumber ? `Suite ${res.roomNumber}` : 'Pending Block'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{res.guestName}</div>
                      <div className="text-3xs text-slate-400 leading-tight block">{res.guestEmail}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-3xs ${
                        res.guestStatus === 'VIP' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 font-black border border-amber-200 dark:border-amber-900/30' :
                        res.guestStatus === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40' :
                        'bg-slate-100 text-slate-650 bg-slate-100 dark:bg-slate-800 dark:text-slate-405 border border-slate-200 dark:border-slate-800'
                      }`}>
                        {res.guestStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      <span>{res.checkInDate} to {res.checkOutDate}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <div className="text-slate-700 dark:text-slate-350">{formatAmount(res.rate)}/nt</div>
                      <div className="text-3xs text-indigo-650 font-bold block">Folio: {formatAmount(res.totalAmount || 0)}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onProcessCheckout ? onProcessCheckout(res.id) : checkOutReservation(res.id)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 font-mono rounded-md text-3xs font-extrabold border border-rose-100 dark:border-rose-900/40 transition cursor-pointer"
                      >
                        Settle & Checkout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED ROOM CONSOLE MODAL CELL CLICK */}
      <ModalSystem
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={`Room ${selectedRoom?.number ?? ''} Operational Console`}
        variant="form"
        size="sm"
        showFooter={true}
        footer={
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-3 py-1.5 bg-slate-90 text-slate-605 border border-slate-200 dark:border-slate-750 dark:text-slate-300 hover:bg-slate-100 rounded-lg font-mono text-2xs cursor-pointer"
            >
              Close Console
            </button>
          </div>
        }
      >
        {selectedRoom && (
          <div className="text-xs space-y-2">
            <div className="flex justify-between font-sans">
              <span className="text-slate-400">Room Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRoom.type}</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="text-slate-400">Current Tariff:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatAmount(selectedRoom.rate)}/night</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="text-slate-400">Cleaning Status:</span>
              <span className={`px-2 py-0.5 rounded font-mono text-2xs ${getStatusColor(selectedRoom.status)} font-semibold`}>
                {selectedRoom.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 pt-1 font-sans">
              <span className="text-slate-400">Amenities Loaded:</span>
              <div className="flex flex-wrap gap-1">
                {selectedRoom.features.map(f => (
                  <span key={f} className="px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-3xs rounded-md">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Status Adjustments */}
            <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wide font-extrabold block">Adjust room state directly:</p>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {(['Vacant Clean', 'Vacant Dirty', 'Out of Order'] as RoomStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      setRoomStatus(selectedRoom.number, st);
                      setSelectedRoom(prev => prev ? { ...prev, status: st } : null);
                    }}
                    className={`px-2 py-1.5 border text-3xs font-mono rounded-lg text-center transition cursor-pointer ${
                      selectedRoom.status === st 
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold dark:bg-indigo-950/30 dark:text-indigo-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalSystem>

      {/* AUTOMATED NIGHT AUDIT CONFIRMATION */}
      <ModalSystem
        isOpen={showAuditConfirm}
        onClose={() => setShowAuditConfirm(false)}
        onConfirm={executeAudit}
        title="Execute Night End & Tariff Ledger?"
        variant="confirm"
        size="md"
        confirmLabel="Launch Audit"
        cancelLabel="Cancel Audit"
        confirmColor="slate"
        icon={<Moon size={20} className="text-amber-600 animate-spin" />}
      >
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
          <p>You are about to launch the automated Night End audit transactions for hotel operating day: <strong className="text-slate-800 dark:text-white">{currentSystemDate}</strong></p>
          <ul className="list-disc list-inside space-y-1 font-mono pl-1 text-[10px]">
            <li>Locks all system accounts and closes reservation bookings for the day.</li>
            <li>Applies and posts nightly room tariffs automatically to guest folios.</li>
            <li>Flags outstanding unresolved arrivals as cancelled no-shows.</li>
            <li>Reconciles metrics and rolls front office clock to the next day.</li>
          </ul>
          <p className="font-bold text-rose-600 dark:text-rose-450">This action runs final database queries and is irreversible.</p>
        </div>
      </ModalSystem>

    </DashboardTemplate>
  );
}
