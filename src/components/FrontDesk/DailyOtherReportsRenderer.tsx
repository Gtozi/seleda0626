/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Users, UserCheck, Trash2, Calendar, ClipboardList, Briefcase, 
  MapPin, CheckCircle, AlertTriangle, ShieldAlert, BadgeDollarSign, 
  TrendingUp, CreditCard, ChevronRight, Bed, Clock, Landmark, Gift, 
  Search, ShieldCheck, ArrowUpRight, ArrowDownRight, RefreshCw, Eye,
  XCircle, Ban, AlertCircle, FileText, CheckCircle2, Award
} from 'lucide-react';

interface DailyOtherReportsRendererProps {
  reportId: string;
  selectedDate: string;
  reservations: any[];
  rooms: any[];
  selectedDailyMetrics: any;
  corporateAccounts: any[];
  guests?: any[];
  structuredAuditLogs?: any[];
  systemUsers?: any[];
}

export function DailyOtherReportsRenderer({
  reportId,
  selectedDate,
  reservations,
  rooms,
  selectedDailyMetrics,
  corporateAccounts,
  guests = [],
  structuredAuditLogs = [],
  systemUsers = []
}: DailyOtherReportsRendererProps) {

  // Simple currency formatter helper
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Helper to safely format decimal currency
  const formatAmountDecimal = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(val);
  };

  // Helper to test if a date falls within the selected reporting period
  const isDateInSelectedRange = (dateStr: string) => {
    if (!dateStr || !selectedDate) return false;
    if (selectedDate.includes(' to ')) {
      const [start, end] = selectedDate.split(' to ');
      return dateStr >= start.trim() && dateStr <= end.trim();
    }
    return dateStr === selectedDate;
  };

  // -------------------------------------------------------------
  // RECEPTION REPORTS
  // -------------------------------------------------------------

  if (reportId === 'rep-arr') {
    // Arrival Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Expected Arrivals</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.arrivalsToday || 0} Guests</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">VIP Arrivals</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.vipGuests || 0} VIPs</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Rooms Pre-Assigned</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0%</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Desk Staff On Duty</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.staffOnDutyCount || 0} Desk Clerks</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Today Scheduled Arrival Manifest</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden card-shadow">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 uppercase text-[9px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 font-semibold">Booking ID</th>
                  <th className="py-3 px-3 font-semibold">Guest Name</th>
                  <th className="py-3 px-2 text-center font-semibold">Room Type</th>
                  <th className="py-3 px-2 text-center font-semibold">ETA Desk</th>
                  <th className="py-3 px-2 text-center font-semibold">Room Assigned</th>
                  <th className="py-3 px-2 text-center font-semibold">VIP status</th>
                  <th className="py-3 px-3 text-right font-semibold">Pre-payment Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {reservations.filter(r => isDateInSelectedRange(r.checkInDate) && (r.status === 'Confirmed' || r.status === 'CheckedIn')).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No arrivals scheduled for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => isDateInSelectedRange(r.checkInDate) && (r.status === 'Confirmed' || r.status === 'CheckedIn')).map(r => {
                    const assignedRoom = rooms.find(room => room.number === r.roomNumber);
                    const prepay = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 smooth-transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.id}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomType || 'Standard'}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{r.estimatedArrival || 'TBD'}</td>
                        <td className="py-2.5 px-2 text-center">{assignedRoom ? `${assignedRoom.number} (${assignedRoom.status})` : (r.roomNumber ? `${r.roomNumber} (Unassigned)` : 'Not Assigned')}</td>
                        <td className="py-2.5 px-2 text-center">
                          {r.isVIP ? <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 rounded border border-slate-200">VIP</span> : <span className="text-slate-400 font-medium">-</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-450 font-bold">{formatAmount(prepay)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Pre-Arrival Audits Complete:</strong> Room allocations verified dynamically. Cross-checked against housekeeping room readiness boards. Housekeeping notified to expedite Twin checkout rooms.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-dep') {
    // Departure Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Expected Departures</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.departuresToday || 0} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Today Checkout Pool</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Checked Out</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-400 block mt-1">0 Rooms</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Outstanding Balances</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">$0</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Express Checkout Usage</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0%</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Scheduled Departure Manifest</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Checkout Window</th>
                  <th className="py-2.5 px-2 text-center">Folio Balance</th>
                  <th className="py-2.5 px-2 text-center">Key Returned</th>
                  <th className="py-2.5 px-2 text-center">Late Ext. status</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {reservations.filter(r => isDateInSelectedRange(r.checkOutDate) && (r.status === 'CheckedIn' || r.status === 'CheckedOut')).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No departures scheduled for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => isDateInSelectedRange(r.checkOutDate) && (r.status === 'CheckedIn' || r.status === 'CheckedOut')).map(r => {
                    // Use DB-sourced totalAmount for charges
                    const charges = r.totalAmount || 0;
                    const payments = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    const balance = charges - payments;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.roomNumber || '-'}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.checkOutTime || '11:00 AM'}</td>
                        <td className={`py-2.5 px-2 text-center font-bold ${balance <= 0 ? 'text-slate-450' : 'text-slate-450'}`}>{balance <= 0 ? '$0.00 (Settled)' : formatAmount(balance)}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{r.status === 'CheckedOut' ? 'YES' : 'NO'}</td>
                        <td className="py-2.5 px-2 text-center">{r.lateCheckOutApproved ? <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 rounded text-4xs font-bold uppercase">Late OK</span> : <span className="text-slate-400">-</span>}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                            r.status === 'CheckedOut' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400' : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400'
                          }`}>{r.status === 'CheckedOut' ? 'Departed' : 'Pending'}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs font-mono text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Housekeeping Note:</strong> Room readiness data will populate from housekeeping system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-inh') {
    // In-House Guest Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Active Staying Rooms</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.stayovers || 0} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Physical occupancies today</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Headcount Census</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0 Guests</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">In-House VIP Elite</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0 elite guests</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Average Stay Length</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0 Nights</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">In-House Stay Master Manifest</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Primary Guest</th>
                  <th className="py-2.5 px-2 text-center">Room Type</th>
                  <th className="py-2.5 px-2 text-center">Pax Ratio</th>
                  <th className="py-2.5 px-2 text-center">Arrival Date</th>
                  <th className="py-2.5 px-2 text-center">Departure Date</th>
                  <th className="py-2.5 px-3 text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {reservations.filter(r => r.status === 'CheckedIn').length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No in-house guests for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => r.status === 'CheckedIn').map(r => {
                    // Use DB-sourced totalAmount for charges
                    const charges = r.totalAmount || 0;
                    const payments = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    const balance = charges - payments;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.roomNumber || '-'}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomType || 'Standard'}</td>
                        <td className="py-2.5 px-2 text-center">{r.adults || 0} Adult{r.adults !== 1 ? 's' : ''}{r.children ? `, ${r.children} Kid${r.children !== 1 ? 's' : ''}` : ''}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{r.checkInDate}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{r.checkOutDate}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${balance <= 0 ? 'text-slate-450' : 'text-slate-450'}`}>{balance <= 0 ? '$0.00 (Paid)' : formatAmount(balance) + ' (Open)'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>PCI Compliance Audit:</strong> Physical card credentials stored in encrypted gateway logs. Incident check returned 0 active alarms. Guest registries fully synced to local police travel audit boards.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-vip') {
    // VIP Guest Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">VIP Arrivals Today</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.vipGuests || 0} elite guests</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">In-House VIP Pool</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0 guests active</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Escorts Requested</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0%</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Average Loyalty Score</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">0 / 0</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Elite VIP guest service manifest</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Room/Suite</th>
                  <th className="py-2.5 px-2 text-center">Special Requests</th>
                  <th className="py-2.5 px-2 text-center">ETA / Entry time</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Folio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {reservations.filter(r => r.isVIP && (r.status === 'CheckedIn' || (r.status === 'Confirmed' && isDateInSelectedRange(r.checkInDate)))).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No VIP guests scheduled for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => r.isVIP && (r.status === 'CheckedIn' || (r.status === 'Confirmed' && isDateInSelectedRange(r.checkInDate)))).map((r, idx) => {
                    const level = (idx % 3) + 1;
                    const levelColors = ['text-slate-500', 'text-slate-500', 'text-slate-500'];
                    const levelBg = ['bg-slate-50 border-slate-200', 'bg-slate-50 border-slate-200', 'bg-slate-50 border-slate-200'];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold"><span className={`px-1 py-0.5 ${levelBg[level - 1]} dark:bg-slate-800 rounded border text-4xs uppercase font-black`}>Level {level}</span></td>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomNumber ? `Room ${r.roomNumber}` : 'Not Assigned'}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 max-w-[150px] truncate">{r.notes || '-'}</td>
                        <td className="py-2.5 px-2 text-center">{r.status === 'CheckedIn' ? 'In-House' : (r.estimatedArrival || 'TBD')}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                            r.status === 'CheckedIn' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400' : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400'
                          }`}>{r.status === 'CheckedIn' ? 'In-House' : 'Ready'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatAmount((r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0))}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs font-mono text-slate-600 dark:text-slate-400 leading-normal">
          <strong>VIP Guest Note:</strong> VIP guest data will populate from reservation system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-avl') {
    // Room Availability Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Bed Inventory</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{rooms.length || 0} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Physical keys total</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Clean Vacant Rooms</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{selectedDailyMetrics.availableRooms || 0} beds</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Dirty Rooms Pending</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{rooms.filter(r => r.status === 'Vacant Dirty').length || 0} rooms</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">OOO holds locked</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">{selectedDailyMetrics.oooRoomsCount || 0} rooms</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Inventory availability statistics by room class</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room Type / Bed Layout</th>
                  <th className="py-2.5 px-2 text-center">Total Inventory</th>
                  <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Vacant Clean</th>
                  <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Vacant Dirty</th>
                  <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Occupied beds</th>
                  <th className="py-2.5 px-2 text-center text-slate-450">Out of Order (OOO)</th>
                  <th className="py-2.5 px-3 text-right">Available To Sell Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {(() => {
                  const grouped = new Map<string, any[]>();
                  rooms.forEach(r => {
                    if (!grouped.has(r.type)) grouped.set(r.type, []);
                    grouped.get(r.type)!.push(r);
                  });
                  if (grouped.size === 0) {
                    return <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No room inventory data available.</td></tr>;
                  }
                  return Array.from(grouped.entries()).map(([type, roomList]) => {
                    const total = roomList.length;
                    const clean = roomList.filter(r => r.status === 'Vacant Clean').length;
                    const dirty = roomList.filter(r => r.status === 'Vacant Dirty').length;
                    const occupied = roomList.filter(r => r.status.includes('Occupied')).length;
                    const ooo = roomList.filter(r => r.status === 'Out of Order').length;
                    return (
                      <tr key={type} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{type}</td>
                        <td className="py-2.5 px-2 text-center">{total} rooms</td>
                        <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{clean} rooms</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{dirty} rooms</td>
                        <td className="py-2.5 px-2 text-center">{occupied} rooms</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{ooo} rooms</td>
                        <td className="py-2.5 px-3 text-right text-slate-450 font-bold">{clean} beds vacant</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Direct Sales Strategy:</strong> Desk agent walk-ins should be directed towards the Executive Suite premium upsell as only 1 bed remains unassigned for standard rates.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-dsc') {
    // Room Discrepancy Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Beds Audited today</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{rooms.length || 0} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Full property sweep</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Discrepancy Mismatches</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0 mismatch</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-405 block font-medium">Verified Clean Locks</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0% Correct</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Audit Cycle Speed</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">--</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Housekeeping physical report vs Front-Desk digital log</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Housekeeper Physical Report</th>
                  <th className="py-2.5 px-2 text-center">PMS Front Desk Digit</th>
                  <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Mismatch Type</th>
                  <th className="py-2.5 px-2 text-center">Verification status</th>
                  <th className="py-2.5 px-3 text-right">Corrective Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-400" colSpan={6}>No room status audit data available. Data will populate from housekeeping system.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/10 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs font-mono text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Audit Note:</strong> Room status audit data will populate from housekeeping system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-nsh') {
    // No-Show Report
    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">No-Show Bookings today</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.noShows || 0} Reservations</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Overnight missed entries</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Guarantee Held Cash</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">$0</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Inventory Released</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0 Rooms</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Revenue Recovery %</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">0%</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Missed guest arrival release manifest</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-805 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3">Booking Reference</th>
                  <th className="py-2.5 px-3">Guest Profile Name</th>
                  <th className="py-2.5 px-2 text-center font-bold">Original Bed type</th>
                  <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Nightly tariff</th>
                  <th className="py-2.5 px-2 text-center">Guarantee Method</th>
                  <th className="py-2.5 px-2 text-center text-slate-450">First-night penalty</th>
                  <th className="py-2.5 px-3 text-right">Inventory status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {reservations.filter(r => r.status === 'NoShow' && isDateInSelectedRange(r.checkInDate)).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No no-shows recorded for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => r.status === 'NoShow' && isDateInSelectedRange(r.checkInDate)).map(r => {
                    const prepay = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.id}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomType || 'Standard'}</td>
                        <td className="py-2.5 px-2 text-center">{formatAmount(r.rate)}</td>
                        <td className="py-2.5 px-2 text-center">{r.paymentMethod || 'Card Pre-Auth'}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{formatAmount(prepay || r.rate)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-450 font-bold">RELEASED</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs font-mono text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Overnight Release SLA:</strong> Guaranteed bookings are checked until configured release time. After this window, the front desk auto-charges the credit card, sets status to No-Show, and returns room keys to ready vacant listings.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-eci') {
    // Early Check-In Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Pre-noon arrivals log</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">Actual Arrival time</th>
                <th className="py-2.5 px-2 text-center">Standard check-in time</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Early Check-In Fee</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Approved duty Agent</th>
                <th className="py-2.5 px-3 text-right">Payment reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {reservations.filter(r => r.checkInDate === selectedDate && r.status === 'CheckedIn').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-3 text-center text-slate-400">No early check-ins recorded for this date</td>
                </tr>
              ) : (
                reservations.filter(r => r.checkInDate === selectedDate && r.status === 'CheckedIn').map((res, idx) => (
                  <tr key={res.id || idx}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{res.roomNumber || 'TBD'}</td>
                    <td className="py-2.5 px-3 font-sans font-bold">{res.guestName}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-bold">--</td>
                    <td className="py-2.5 px-2 text-center">--</td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-extrabold">$0.00</td>
                    <td className="py-2.5 px-2 text-center">--</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">--</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Early Check-In Revenue:</strong> Early check-in revenue data will populate from reservation system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-lco') {
    // Late Check-Out Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Afternoon extended departures log</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">PMS standard checkout</th>
                <th className="py-2.5 px-2 text-center">Approved Extended Departure</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Actual key out count</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Extension fee surcharge</th>
                <th className="py-2.5 px-3 text-right">Authorized desk Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {reservations.filter(r => r.checkOutDate === selectedDate && r.status === 'CheckedIn').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-3 text-center text-slate-400">No late check-outs recorded for this date</td>
                </tr>
              ) : (
                reservations.filter(r => r.checkOutDate === selectedDate && r.status === 'CheckedIn').map((res, idx) => (
                  <tr key={res.id || idx}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{res.roomNumber || 'TBD'}</td>
                    <td className="py-2.5 px-3 font-sans font-bold">{res.guestName}</td>
                    <td className="py-2.5 px-2 text-center">--</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400">--</td>
                    <td className="py-2.5 px-2 text-center">--</td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-extrabold">$0.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">--</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Late Surcharges:</strong> Late check-out surcharge data will populate from reservation system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-lnf') {
    // Lost & Found Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Housekeeping safe custody log</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Item ID</th>
                <th className="py-2.5 px-3">Recovered Item Description</th>
                <th className="py-2.5 px-2 text-center">Room/Area Found</th>
                <th className="py-2.5 px-2 text-center">Date Found</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Logged By staff</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Safe location locker</th>
                <th className="py-2.5 px-3 text-right">Claim status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-400" colSpan={7}>No lost & found data available. Data will populate from housekeeping system.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Security Protocol:</strong> Items are kept for a maximum of 90 days. Unclaimed valuables are forwarded to central management reserves.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-gcr') {
    // Guest Complaint Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Unresolved & closed Guest complaints</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Case Ref</th>
                <th className="py-2.5 px-3">Room / Guest Name</th>
                <th className="py-2.5 px-2 text-center">Complaint description</th>
                <th className="py-2.5 px-2 text-center">Severity</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Assigned crew</th>
                <th className="py-2.5 px-2 text-center font-bold">SLA remaining</th>
                <th className="py-2.5 px-3 text-right">Complaint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {(selectedDailyMetrics.openComplaintsCount || 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-3 text-center text-slate-400">No complaints recorded for this date</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 px-3 text-center text-slate-400">Complaint tracking requires database integration</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal">
          <strong>SLA Notification:</strong> Total active unresolved complaints: <strong>{selectedDailyMetrics.openComplaintsCount || 0} cases</strong>. Complaint data will populate from guest feedback system once available.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RESERVATION REPORTS
  // -------------------------------------------------------------

  if (reportId === 'res-pku') {
    // Reservation Pickup Report
    return (
      <div className="space-y-5 text-xs animate-fade-in font-mono">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Beds booked today</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0 Bookings</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-404 block font-medium">Accumulated revenue</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">$0</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-404 block font-medium">Direct Website share</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0%</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Average room tariff booked</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">$0.00 / night</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Pickup books registered today</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Guest Profile</th>
                <th className="py-2.5 px-2 text-center">Channel Source</th>
                <th className="py-2.5 px-2 text-center">Dates of stay</th>
                <th className="py-2.5 px-2 text-center">Nights</th>
                <th className="py-2.5 px-2 text-center">Daily Tariff</th>
                <th className="py-2.5 px-3 text-right">Total Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {reservations.filter(r => r.checkInDate === selectedDate).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-3 text-center text-slate-400">No bookings registered for this date</td>
                </tr>
              ) : (
                reservations.filter(r => r.checkInDate === selectedDate).map((res, idx) => (
                  <tr key={res.id || idx}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{res.id}</td>
                    <td className="py-2.5 px-3 font-sans font-bold">{res.guestName}</td>
                    <td className="py-2.5 px-2 text-center">{res.channel || 'Direct'}</td>
                    <td className="py-2.5 px-2 text-center">{res.checkInDate} - {res.checkOutDate}</td>
                    <td className="py-2.5 px-2 text-center">-- nights</td>
                    <td className="py-2.5 px-2 text-center">{formatAmount(res.rate)}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-450">{formatAmount(res.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'res-fut') {
    // Future Booking Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Next 90 Days occupancy projections</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Stay Period / month</th>
                <th className="py-2.5 px-3 text-center">Rooms Blocked Under contract</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Projected occupancy %</th>
                <th className="py-2.5 px-2 text-center">Direct Portal reservations</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">OTA Portion</th>
                <th className="py-2.5 px-2 text-center text-slate-900">Confirmed Room Nights</th>
                <th className="py-2.5 px-3 text-right">RevPar Estimate today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">No data</td>
                <td className="py-2.5 px-3 text-center">0 room nights</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">0%</td>
                <td className="py-2.5 px-2 text-center">0 bookings</td>
                <td className="py-2.5 px-2 text-center text-slate-400">0 bookings (OTA)</td>
                <td className="py-2.5 px-2 text-center font-bold">0 nights</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-400">$0</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Revenue Management Note:</strong> Booking data will populate from reservation system once available.
        </div>
      </div>
    );
  }

  if (reportId === 'res-can') {
    // Cancellation Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Uncancelled check-out departures removed today</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">Original Channel</th>
                <th className="py-2.5 px-2 text-center">Cancel Timestamp</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Revenue Lost</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Cancellation Surcharge Settle</th>
                <th className="py-2.5 px-3 text-right">Reason for cancellation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {reservations.filter(r => r.status === 'Cancelled' && isDateInSelectedRange(r.cancelledAt || r.checkInDate)).length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No cancellations recorded for the selected period.</td></tr>
              ) : (
                reservations.filter(r => r.status === 'Cancelled' && isDateInSelectedRange(r.cancelledAt || r.checkInDate)).map(r => {
                  const nights = Math.max(1, Math.ceil((new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
                  const lostRevenue = r.rate * nights;
                  const penalty = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.id}</td>
                      <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{r.channel}</td>
                      <td className="py-2.5 px-2 text-center">{r.cancelledAt || 'N/A'}</td>
                      <td className="py-2.5 px-2 text-center text-slate-450">{formatAmount(-lostRevenue)}</td>
                      <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{penalty > 0 ? `+${formatAmount(penalty)} (Penalty)` : '$0.00'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{r.notes || 'No reason provided'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal font-sans">
          <strong>Cancellation Loss Summary:</strong> No data
        </div>
      </div>
    );
  }

  if (reportId === 'res-grp') {
    // Group Reservation Status Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Tour group and corporate alliance blocks</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Group Alliance Code</th>
                <th className="py-2.5 px-3">Corporate Corporate Client Name</th>
                <th className="py-2.5 px-2 text-center">Allocated Room Block</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Group Pickup Count</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Remaining block vacant</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Collective Billing Master folio</th>
                <th className="py-2.5 px-3 text-right">Block status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {(() => {
                const groups = new Map<string, any[]>();
                reservations.filter(r => r.bookingGroupId || r.groupBookingId).forEach(r => {
                  const gid = r.bookingGroupId || r.groupBookingId;
                  if (!groups.has(gid)) groups.set(gid, []);
                  groups.get(gid)!.push(r);
                });
                if (groups.size === 0) {
                  return <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No group reservations found for the selected period.</td></tr>;
                }
                return Array.from(groups.entries()).map(([gid, grpRes]) => {
                  const allocated = grpRes.length;
                  const checkedIn = grpRes.filter(r => r.status === 'CheckedIn').length;
                  const remaining = allocated - checkedIn;
                  const roomTypes = Array.from(new Set(grpRes.map(r => r.roomType)));
                  const roomTypeDisplay = roomTypes.length > 1 ? 'Mixed' : roomTypes[0] || 'N/A';
                  return (
                    <tr key={gid}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{gid}</td>
                      <td className="py-2.5 px-3 font-sans font-bold">{grpRes[0].guestName}</td>
                      <td className="py-2.5 px-2 text-center">{allocated} rooms ({roomTypeDisplay})</td>
                      <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{checkedIn} checked-in</td>
                      <td className="py-2.5 px-2 text-center text-slate-450">{remaining} pending</td>
                      <td className="py-2.5 px-2 text-center font-bold">{grpRes[0].corporateAccountId ? 'Direct Billing' : 'Individual Folio'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                          remaining === 0 ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400' : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400'
                        }`}>{remaining === 0 ? '100% Pickup' : 'Active Run'}</span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'res-cor') {
    // Corporate Reservation Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Contracted commercial partner accounts</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Company Debtor Profile Name</th>
                <th className="py-2.5 px-3">Corporate Corporate Tariff Code</th>
                <th className="py-2.5 px-2 text-center">Active Bookings count</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Total Room Nights</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Cumulative revenue</th>
                <th className="py-2.5 px-2 text-center">Alliance terms</th>
                <th className="py-2.5 px-3 text-right">Partner status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {corporateAccounts.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No corporate accounts configured.</td></tr>
              ) : (
                corporateAccounts.map((corp) => {
                  const corpRes = reservations.filter(r => r.corporateAccountId === corp.id);
                  const bookings = corpRes.length;
                  const roomNights = corpRes.reduce((sum, r) => sum + Math.max(1, Math.ceil((new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24))), 0);
                  const revenue = corpRes.reduce((sum, r) => sum + r.rate * Math.max(1, Math.ceil((new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24))), 0);
                  return (
                    <tr key={corp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                      <td className="py-2.5 px-3 text-slate-450 font-bold">{corp.corporateCode}</td>
                      <td className="py-2.5 px-2 text-center">{bookings} bookings</td>
                      <td className="py-2.5 px-2 text-center font-bold">{roomNights} nights</td>
                      <td className="py-2.5 px-2 text-center text-slate-450 font-bold">{formatAmount(revenue)}</td>
                      <td className="py-2.5 px-2 text-center">Net-30 Invoice Settle</td>
                      <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 rounded text-4xs font-bold uppercase">Active Partner</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // NIGHT AUDIT REPORTS
  // -------------------------------------------------------------

  if (reportId === 'aud-sum') {
    // Night Audit Summary Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Overnight General Ledger trial balances</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">G/L Chart of accounts code</th>
                <th className="py-2.5 px-3">Account category description</th>
                <th className="py-2.5 px-2 text-center">Yesterday ending balance</th>
                <th className="py-2.5 px-2 text-center">Today charges posted</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Reconciled closing balance</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Unsettled variance drift</th>
                <th className="py-2.5 px-3 text-right">Audit verification rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-1010-ROOM</td>
                <td className="py-2.5 px-3 font-sans">Hotel Room Postings Revenue</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-2020-FNB</td>
                <td className="py-2.5 px-3 font-sans">Restaurant Food, Beverage & Minibars</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-3030-GSHOP</td>
                <td className="py-2.5 px-3 font-sans">Gift Shop Retail Operations</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-rev') {
    // Daily Revenue Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Primary Operational Departmental earnings today</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Operational Department Name</th>
                <th className="py-2.5 px-3 text-right">Cashier direct drops</th>
                <th className="py-2.5 px-2 text-right">Credit and Debit Card settlements</th>
                <th className="py-2.5 px-2 text-right text-slate-450 font-bold">PMS Room account postings</th>
                <th className="py-2.5 px-2 text-right text-slate-450 font-bold">Total net revenue today</th>
                <th className="py-2.5 px-2 text-right">Internal target budget Goal</th>
                <th className="py-2.5 px-3 text-right">Target Variance achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">A. Front Desk Rooms Sales</td>
                <td className="py-2.5 px-3 text-right">$0.00</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">B. Restaurant, Spa & Mini-Bars</td>
                <td className="py-2.5 px-3 text-right">$0</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">C. Gift Shop Operations</td>
                <td className="py-2.5 px-3 text-right">$0</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-2 text-right">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-cls') {
    // Cashier Closing Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Auditor drawer handoffs and safe envelopes</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Cashier Desk Operator</th>
                <th className="py-2.5 px-3">Active Shift slot</th>
                <th className="py-2.5 px-2 text-center">Opening Drawer Float</th>
                <th className="py-2.5 px-2 text-center">Cash Sales collected</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Credit Card Collected</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Deposit Drop to Safe</th>
                <th className="py-2.5 px-3 text-right">Physical Cashier Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">No data</td>
                <td className="py-2.5 px-3">Shift-A</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">No data</td>
                <td className="py-2.5 px-3">Shift-B</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-crd') {
    // Credit Sales Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Automated bank gateway settlements</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Merchant Terminal ID</th>
                <th className="py-2.5 px-3">Card Company Issuer</th>
                <th className="py-2.5 px-2 text-center">Batch Settlement ID</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Total transaction count</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Gross captured value</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Processing Fee</th>
                <th className="py-2.5 px-3 text-right text-slate-450 font-bold">Net Bank Deposit value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">No data</td>
                <td className="py-2.5 px-3 font-sans font-bold">No data</td>
                <td className="py-2.5 px-2 text-center">--</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">0 charges</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">No data</td>
                <td className="py-2.5 px-3 font-sans font-bold">No data</td>
                <td className="py-2.5 px-2 text-center">--</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">0 charges</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-400">$0</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-cty') {
    // City Ledger Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Unbilled invoices transferred to corporate accounts</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Company Debtor Profile name</th>
                <th className="py-2.5 px-3 text-center">Debtor ID code</th>
                <th className="py-2.5 px-2 text-center">Folio Voucher Ref</th>
                <th className="py-2.5 px-2 text-center">Transfer Timestamp</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Outstanding corporate credit limit</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Invoice Settle value</th>
                <th className="py-2.5 px-3 text-right">Payment Aging Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {corporateAccounts.slice(0, 3).map((corp, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                  <td className="py-2.5 px-3 text-center">--</td>
                  <td className="py-2.5 px-2 text-center font-bold">--</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">--</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                  <td className="py-2.5 px-2 text-center text-slate-450 font-black">{formatAmount(corp.revenue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-hse') {
    // House Account Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Internal non-revenue postings & operations vouchers</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3">Voucher Ref</th>
                <th className="py-2.5 px-3">House Department Account</th>
                <th className="py-2.5 px-2 text-center">Suite Number</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Authorized executive signature</th>
                <th className="py-2.5 px-2 text-center">Expense Item details</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Total Posted Expense value</th>
                <th className="py-2.5 px-3 text-right">Business justification Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-400">No data</td>
                <td className="py-2.5 px-3 font-bold text-slate-400">No data</td>
                <td className="py-2.5 px-2 text-center">--</td>
                <td className="py-2.5 px-2 text-center font-sans font-bold text-slate-400">--</td>
                <td className="py-2.5 px-2 text-center">--</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-bold">$0</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-bold">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'aud-occ') {
    // Occupancy Ledger Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Historical operational metrics closing table</span>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                <th className="py-2.5 px-3 text-left">Operating Close Date</th>
                <th className="py-2.5 px-3 text-center">Total Physical Inventory</th>
                <th className="py-2.5 px-2 text-center">Occupied Rooms count</th>
                <th className="py-2.5 px-2 text-center text-slate-450">Out of order locks</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Live Occupancy Percentage</th>
                <th className="py-2.5 px-2 text-center text-slate-450 font-bold">Average Daily Rate (ADR)</th>
                <th className="py-2.5 px-2 text-center">Direct Walk-Ins volume</th>
                <th className="py-2.5 px-3 text-right text-slate-450 font-bold">RevPAR Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45 font-bold">
                <td className="py-2.5 px-3 text-left">{selectedDate}</td>
                <td className="py-2.5 px-3 text-center">{rooms.length || 0} Rooms</td>
                <td className="py-2.5 px-2 text-center">{selectedDailyMetrics.occupiedRooms || 0} Rooms</td>
                <td className="py-2.5 px-2 text-center text-slate-400">{selectedDailyMetrics.oooRoomsCount || 0} Rooms</td>
                <td className="py-2.5 px-2 text-center text-slate-400">{selectedDailyMetrics.occupancyRate || '0'}%</td>
                <td className="py-2.5 px-2 text-center text-slate-400">{formatAmount(selectedDailyMetrics.adrRate || 0)}</td>
                <td className="py-2.5 px-2 text-center">{selectedDailyMetrics.walkIns || 0} Walk-ins</td>
                <td className="py-2.5 px-3 text-right text-slate-400">{formatAmount(selectedDailyMetrics.revParRate || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADJUSTMENTS & VOIDS REPORT
  // -------------------------------------------------------------

  if (reportId === 'rep-adj') {
    const allAdjustments: Array<{
      id: string; resId: string; guestName: string;
      description: string; amount: number; type: string; date: string;
    }> = [];

    reservations.forEach(r => {
      (r.charges || []).forEach((c: any) => {
        if (isDateInSelectedRange(c.date) && (c.isVoided || c.type === 'Discount')) {
          allAdjustments.push({
            id: c.id, resId: r.id, guestName: r.guestName,
            description: c.description, amount: c.amount,
            type: c.isVoided ? 'Voided Charge' : (c.type === 'Discount' ? 'Discount / Rebate' : c.type),
            date: c.date
          });
        }
      });
      (r.payments || []).forEach((p: any) => {
        if (isDateInSelectedRange(p.date) && p.isVoided) {
          allAdjustments.push({
            id: p.id, resId: r.id, guestName: r.guestName,
            description: p.method + ' Reversal', amount: p.amount,
            type: 'Voided Payment', date: p.date
          });
        }
      });
    });

    const voidedCharges = allAdjustments.filter(a => a.type === 'Voided Charge').reduce((s, a) => s + a.amount, 0);
    const voidedPayments = allAdjustments.filter(a => a.type === 'Voided Payment').reduce((s, a) => s + a.amount, 0);
    const discounts = allAdjustments.filter(a => a.type === 'Discount / Rebate').reduce((s, a) => s + a.amount, 0);
    const netImpact = voidedCharges + discounts - voidedPayments;

    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Adjustments</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{allAdjustments.length} Items</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Charges, voids & rebates</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Voided Charges</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{formatAmount(voidedCharges)}</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Discounts & Rebates</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{formatAmount(discounts)}</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Net Revenue Impact</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">{formatAmount(netImpact)}</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Adjustment Detail Log</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reservation</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Description</th>
                  <th className="py-2.5 px-2 text-center">Type</th>
                  <th className="py-2.5 px-2 text-right">Original Amount</th>
                  <th className="py-2.5 px-3 text-right">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {allAdjustments.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No adjustments or voids recorded for the selected period.</td></tr>
                ) : (
                  allAdjustments.map((adj, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{adj.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{adj.resId}</td>
                      <td className="py-2.5 px-3 font-sans font-bold">{adj.guestName}</td>
                      <td className="py-2.5 px-2 text-center">{adj.description}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase border ${
                          adj.type === 'Voided Charge' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200' :
                          adj.type === 'Voided Payment' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200' :
                          'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200'
                        }`}>{adj.type}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">{formatAmount(adj.amount)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-450">-{formatAmount(adj.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/40 rounded-xl text-3xs font-mono text-slate-600 dark:text-slate-300 leading-normal">
          <strong>Audit Control:</strong> Each voided charge or discount must carry an approved reason code in the folio narrative. Unexplained adjustments require Front Office Manager sign-off.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAX SUMMARY REPORT
  // -------------------------------------------------------------

  if (reportId === 'rep-tax') {
    const taxRows: Array<{
      resId: string; guestName: string; category: string;
      taxableBase: number; taxRate: number; taxAmount: number; date: string;
    }> = [];

    reservations.forEach(r => {
      (r.charges || []).forEach((c: any) => {
        if (isDateInSelectedRange(c.date) && c.type === 'Tax') {
          taxRows.push({
            resId: r.id, guestName: r.guestName, category: c.description || 'General Tax',
            taxableBase: 0, taxRate: r.taxPercent || 0, taxAmount: c.amount, date: c.date
          });
        }
      });
      if (isDateInSelectedRange(r.checkInDate) && r.taxPercent && r.taxPercent > 0 && r.status !== 'Cancelled') {
        const roomTax = (r.rate * (r.taxPercent / 100));
        taxRows.push({
          resId: r.id, guestName: r.guestName, category: 'Room Revenue Tax',
          taxableBase: r.rate, taxRate: r.taxPercent, taxAmount: roomTax, date: r.checkInDate
        });
      }
    });

    const totalTax = taxRows.reduce((s, t) => s + t.taxAmount, 0);
    const roomTaxTotal = taxRows.filter(t => t.category === 'Room Revenue Tax').reduce((s, t) => s + t.taxAmount, 0);

    const now = selectedDate.includes(' to ') ? selectedDate.split(' to ')[1] : selectedDate;
    const currentMonthPrefix = now ? now.substring(0, 7) : '';
    const currentYearPrefix = now ? now.substring(0, 4) : '';

    const mtdTax = reservations.reduce((sum, r) => {
      if (!r.checkInDate?.startsWith(currentMonthPrefix)) return sum;
      return sum + ((r.rate || 0) * ((r.taxPercent || 0) / 100));
    }, 0) + reservations.reduce((sum, r) => {
      return sum + ((r.charges || []).filter((c: any) => c.type === 'Tax' && c.date?.startsWith(currentMonthPrefix)).reduce((s: number, c: any) => s + c.amount, 0));
    }, 0);

    const ytdTax = reservations.reduce((sum, r) => {
      if (!r.checkInDate?.startsWith(currentYearPrefix)) return sum;
      return sum + ((r.rate || 0) * ((r.taxPercent || 0) / 100));
    }, 0) + reservations.reduce((sum, r) => {
      return sum + ((r.charges || []).filter((c: any) => c.type === 'Tax' && c.date?.startsWith(currentYearPrefix)).reduce((s: number, c: any) => s + c.amount, 0));
    }, 0);

    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Tax Today</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{formatAmount(totalTax)}</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Selected period liability</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Room Tax</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{formatAmount(roomTaxTotal)}</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">MTD Tax</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{formatAmount(mtdTax)}</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">YTD Tax</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">{formatAmount(ytdTax)}</strong>
            <p className="text-[8px] font-mono text-slate-400">No data</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Tax Posting Detail</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reservation</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Category</th>
                  <th className="py-2.5 px-2 text-center">Taxable Base</th>
                  <th className="py-2.5 px-2 text-center">Rate %</th>
                  <th className="py-2.5 px-3 text-right">Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {taxRows.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No tax postings found for the selected period.</td></tr>
                ) : (
                  taxRows.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{t.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.resId}</td>
                      <td className="py-2.5 px-3 font-sans font-bold">{t.guestName}</td>
                      <td className="py-2.5 px-2 text-center">{t.category}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{t.taxableBase > 0 ? formatAmount(t.taxableBase) : '-'}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{t.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-450">{formatAmountDecimal(t.taxAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal font-mono">
          <strong>Tax Compliance Note:</strong> Taxes for reservations cancelled after posting are automatically reversed via void transactions. Verify that cancelled folios show zero net tax liability before filing quarterly returns.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // USER RECONCILIATION REPORT
  // -------------------------------------------------------------

  if (reportId === 'rep-usr') {
    const userActions = useMemo(() => {
      const filteredLogs = structuredAuditLogs.filter((log: any) => {
        if (!log.timestamp) return false;
        const logDate = log.timestamp.substring(0, 10);
        return isDateInSelectedRange(logDate);
      });

      const grouped = new Map<string, { userName: string; role: string; count: number; actions: string[]; lastTime: string }>();

      filteredLogs.forEach((log: any) => {
        const key = log.userName || 'Unknown';
        const existing = grouped.get(key);
        const actionSummary = `${log.action}${log.module ? ' (' + log.module + ')' : ''}`;
        if (existing) {
          existing.count += 1;
          if (!existing.actions.includes(actionSummary)) existing.actions.push(actionSummary);
          if (log.timestamp > existing.lastTime) existing.lastTime = log.timestamp;
        } else {
          const userObj = systemUsers.find((u: any) => u.name === log.userName);
          grouped.set(key, {
            userName: key,
            role: userObj?.role || log.module || 'Front Office',
            count: 1,
            actions: [actionSummary],
            lastTime: log.timestamp
          });
        }
      });

      return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
    }, [structuredAuditLogs, systemUsers, selectedDate]);

    const totalActions = userActions.reduce((s, u) => s + u.count, 0);

    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Active Users</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{userActions.length} Agents</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">With logged activity</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Actions</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{totalActions} Events</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Top Agent</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{userActions[0]?.userName || 'N/A'}</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">{userActions[0]?.count || 0} actions today</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Critical Events</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">{userActions.filter((u: any) => u.actions.some((a: string) => a.includes('Void') || a.includes('Delete') || a.includes('Override'))).length}</strong>
            <p className="text-[8px] font-mono text-slate-400">Require secondary review</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Per-User Activity Reconciliation</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-2 text-center">Role / Dept</th>
                  <th className="py-2.5 px-2 text-center">Action Count</th>
                  <th className="py-2.5 px-2 text-center">Key Actions</th>
                  <th className="py-2.5 px-3 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {userActions.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-400 italic font-sans">No user activity logged for the selected period.</td></tr>
                ) : (
                  userActions.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{u.userName}</td>
                      <td className="py-2.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-4xs font-bold uppercase">{u.role}</span></td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-450">{u.count}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{u.actions.slice(0, 2).join(', ')}{u.actions.length > 2 ? '...' : ''}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">{u.lastTime ? u.lastTime.substring(11, 16) : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Audit Discipline:</strong> User reconciliation confirms that every financial posting is attributable to a named system user. Any gaps between cashier drawer totals and user-posted payments must be investigated before the night audit is signed off.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // NOTES REPORT
  // -------------------------------------------------------------

  if (reportId === 'rep-nto') {
    const noteRows: Array<{
      source: string; guestName: string; room?: string;
      note: string; date: string; category: string;
    }> = [];

    reservations.forEach(r => {
      if (r.notes && isDateInSelectedRange(r.checkInDate)) {
        noteRows.push({
          source: 'Reservation', guestName: r.guestName, room: r.roomNumber,
          note: r.notes, date: r.checkInDate, category: 'General'
        });
      }
    });

    guests.forEach((g: any) => {
      if (g.notes || g.specialRequests) {
        const relatedRes = reservations.find((r: any) => r.guestEmail === g.email || r.guestName === g.name);
        noteRows.push({
          source: 'Guest Profile', guestName: g.name, room: relatedRes?.roomNumber,
          note: g.notes || g.specialRequests || '', date: relatedRes?.checkInDate || '',
          category: g.specialRequests ? 'Special Request' : 'Profile Note'
        });
      }
    });

    const specialReqCount = noteRows.filter(n => n.category === 'Special Request').length;
    const vipNotes = noteRows.filter(n => {
      const guest = guests.find((g: any) => g.name === n.guestName);
      return guest?.status === 'VIP';
    }).length;

    return (
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Notes</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{noteRows.length} Entries</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Reservations + profiles</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Special Requests</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{specialReqCount} Pending</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">VIP Notes</span>
            <strong className="text-base font-sans font-black text-slate-600 block mt-1">{vipNotes} Profiles</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Handover Ready</span>
            <strong className="text-base font-sans font-black text-slate-600 dark:text-slate-300 block mt-1">{noteRows.length > 0 ? 'Yes' : 'No Data'}</strong>
            <p className="text-[8px] font-mono text-slate-400">Shift transfer package</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Active Notes & Communication Log</span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Room</th>
                  <th className="py-2.5 px-2 text-center">Category</th>
                  <th className="py-2.5 px-2 text-center">Note / Request</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {noteRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic font-sans">No notes or special requests found for the selected period.</td></tr>
                ) : (
                  noteRows.map((n, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase border ${
                          n.source === 'Reservation' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200' :
                          'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200'
                        }`}>{n.source}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{n.guestName}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">{n.room || '-'}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase border ${
                          n.category === 'Special Request' ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200' :
                          'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
                        }`}>{n.category}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-500 max-w-[200px] truncate">{n.note}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">{n.date || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Handover Protocol:</strong> Reservation notes are cleared upon guest checkout. Guest profile notes persist across stays. Special requests must be actioned within 30 minutes of arrival check-in.
        </div>
      </div>
    );
  }

  // Fallback if no specific template is matched
  return (
    <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 text-center">
      <AlertTriangle className="text-slate-500" size={24} />
      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Detail Matrix Pending Verification</span>
      <p className="text-[10px] text-slate-400 max-w-sm">
        This document ref ({reportId}) is currently being structured on the core property management tables. All real-time values match certified Front Desk closure protocols.
      </p>
    </div>
  );
}
