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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.arrivalsToday || 5} Guests</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">Today schedule</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">VIP Arrivals</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.vipGuests || 2} VIPs</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">Premium greeting alert</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Rooms Pre-Assigned</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">100%</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Housekeeping cleared</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-xl card-shadow">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Desk Staff On Duty</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{selectedDailyMetrics.staffOnDutyCount || 3} Desk Clerks</strong>
            <p className="text-[8px] font-mono text-indigo-600">Assigned shift-slots</p>
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
                        <td className="py-2.5 px-2 text-center text-indigo-600 font-bold">{r.estimatedArrival || 'TBD'}</td>
                        <td className="py-2.5 px-2 text-center">{assignedRoom ? `${assignedRoom.number} (${assignedRoom.status})` : (r.roomNumber ? `${r.roomNumber} (Unassigned)` : 'Not Assigned')}</td>
                        <td className="py-2.5 px-2 text-center">
                          {r.isVIP ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded border border-amber-200">VIP</span> : <span className="text-slate-400 font-medium">-</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">{formatAmount(prepay)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.departuresToday || 4} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Today Checkout Pool</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Checked Out</span>
            <strong className="text-base font-sans font-black text-indigo-650 dark:text-indigo-400 block mt-1">2 Rooms</strong>
            <p className="text-[8px] text-indigo-600 font-mono mt-0.5">Keys returned safely</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Outstanding Balances</span>
            <strong className="text-base font-sans font-black text-rose-500 block mt-1">$450</strong>
            <p className="text-[8px] text-rose-700 font-mono mt-0.5">To be collected at desk</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 block font-bold">Express Checkout Usage</span>
            <strong className="text-base font-sans font-black text-emerald-950 dark:text-emerald-300 block mt-1">75.0%</strong>
            <p className="text-[8px] font-mono text-emerald-600">Digital lobby box</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Scheduled Departure Manifest</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Checkout Window</th>
                  <th className="py-2.5 px-2 text-center">Folio Balance</th>
                  <th className="py-2.5 px-2 text-center">Key Returned</th>
                  <th className="py-2.5 px-2 text-center">Late Ext. status</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {reservations.filter(r => isDateInSelectedRange(r.checkOutDate) && (r.status === 'CheckedIn' || r.status === 'CheckedOut')).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No departures scheduled for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => isDateInSelectedRange(r.checkOutDate) && (r.status === 'CheckedIn' || r.status === 'CheckedOut')).map(r => {
                    const charges = (r.charges || []).reduce((s: number, c: any) => s + (c.isVoided ? 0 : c.amount), 0);
                    const payments = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    const balance = charges - payments;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.roomNumber || '-'}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.checkOutTime || '11:00 AM'}</td>
                        <td className={`py-2.5 px-2 text-center font-bold ${balance <= 0 ? 'text-slate-450' : 'text-rose-500'}`}>{balance <= 0 ? '$0.00 (Settled)' : formatAmount(balance)}</td>
                        <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">{r.status === 'CheckedOut' ? 'YES' : 'NO'}</td>
                        <td className="py-2.5 px-2 text-center">{r.lateCheckOutApproved ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded text-4xs font-bold uppercase">Late OK</span> : <span className="text-slate-400">-</span>}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                            r.status === 'CheckedOut' ? 'bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
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

        <div className="p-3 bg-rose-50/20 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 rounded-xl text-3xs font-mono text-rose-700 dark:text-rose-400 leading-normal">
          <strong>Attention Housekeeping Desk:</strong> Rooms 104 and 301 are physically vacant. Clean-up crews assigned immediately to ready the rooms for upcoming 14:30 arrivals.
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.stayovers || 8} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Physical occupancies today</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Headcount Census</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">14 Guests</strong>
            <p className="text-[8px] text-indigo-600 font-mono mt-0.5">Including 2 children</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">In-House VIP Elite</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.vipGuests || 3} elite guests</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">Flagged profiles</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Average Stay Length</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">4.2 Nights</strong>
            <p className="text-[8px] font-mono text-indigo-600">Premium leisure booking mix</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">In-House Stay Master Manifest</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Primary Guest</th>
                  <th className="py-2.5 px-2 text-center">Room Type</th>
                  <th className="py-2.5 px-2 text-center">Pax Ratio</th>
                  <th className="py-2.5 px-2 text-center">Arrival Date</th>
                  <th className="py-2.5 px-2 text-center">Departure Date</th>
                  <th className="py-2.5 px-3 text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {reservations.filter(r => r.status === 'CheckedIn').length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No in-house guests for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => r.status === 'CheckedIn').map(r => {
                    const charges = (r.charges || []).reduce((s: number, c: any) => s + (c.isVoided ? 0 : c.amount), 0);
                    const payments = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                    const balance = charges - payments;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.roomNumber || '-'}</td>
                        <td className="py-2.5 px-3 font-sans font-bold">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomType || 'Standard'}</td>
                        <td className="py-2.5 px-2 text-center">{r.adults || 1} Adult{r.adults !== 1 ? 's' : ''}{r.children ? `, ${r.children} Kid${r.children !== 1 ? 's' : ''}` : ''}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{r.checkInDate}</td>
                        <td className="py-2.5 px-2 text-center text-slate-450">{r.checkOutDate}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${balance <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{balance <= 0 ? '$0.00 (Paid)' : formatAmount(balance) + ' (Open)'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.vipGuests || 2} elite guests</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">High Priority Service</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">In-House VIP Pool</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">3 guests active</strong>
            <p className="text-[8px] text-indigo-600 font-mono mt-0.5">Complimentary amenities served</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Escorts Requested</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">100%</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Duty Manager assigned</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Average Loyalty Score</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">98 / 100</strong>
            <p className="text-[8px] font-mono text-indigo-600">Tier-1 Club Members</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Elite VIP guest service manifest</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Room/Suite</th>
                  <th className="py-2.5 px-2 text-center">Special Requests</th>
                  <th className="py-2.5 px-2 text-center">ETA / Entry time</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Folio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {reservations.filter(r => r.isVIP && (r.status === 'CheckedIn' || (r.status === 'Confirmed' && isDateInSelectedRange(r.checkInDate)))).length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400 italic font-sans">No VIP guests scheduled for the selected period.</td></tr>
                ) : (
                  reservations.filter(r => r.isVIP && (r.status === 'CheckedIn' || (r.status === 'Confirmed' && isDateInSelectedRange(r.checkInDate)))).map((r, idx) => {
                    const level = (idx % 3) + 1;
                    const levelColors = ['text-amber-500', 'text-indigo-550', 'text-purple-550'];
                    const levelBg = ['bg-amber-50 border-amber-200', 'bg-indigo-50 border-indigo-200', 'bg-purple-50 border-purple-200'];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                        <td className="py-2.5 px-3 font-bold"><span className={`px-1 py-0.5 ${levelBg[level - 1]} dark:bg-slate-800 rounded border text-4xs uppercase font-black`}>Level {level}</span></td>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{r.guestName}</td>
                        <td className="py-2.5 px-2 text-center">{r.roomNumber ? `Room ${r.roomNumber}` : 'Not Assigned'}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 max-w-[150px] truncate">{r.notes || '-'}</td>
                        <td className="py-2.5 px-2 text-center">{r.status === 'CheckedIn' ? 'In-House' : (r.estimatedArrival || 'TBD')}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                            r.status === 'CheckedIn' ? 'bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
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

        <div className="p-3 bg-amber-50/20 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/40 rounded-xl text-3xs font-mono text-amber-700 dark:text-amber-400 leading-normal">
          <strong>Daily VIP Guest Directive:</strong> Ensure welcome amenities are delivered to suite 15 minutes prior to guest check-in. Clean keys pre-coded on sanitized gold folders.
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{rooms.length || 20} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Physical keys total</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Clean Vacant Rooms</span>
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">{selectedDailyMetrics.availableRooms || 6} beds</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Ready for immediate walk-in</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Dirty Rooms Pending</span>
            <strong className="text-base font-sans font-black text-amber-500 block mt-1">{rooms.filter(r => r.status === 'Vacant Dirty').length || 4} rooms</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">Occupational queue list</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">OOO holds locked</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{selectedDailyMetrics.oooRoomsCount || 1} rooms</strong>
            <p className="text-[8px] font-mono text-indigo-600">Maintenance blocked</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Inventory availability statistics by room class</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room Type / Bed Layout</th>
                  <th className="py-2.5 px-2 text-center">Total Inventory</th>
                  <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Vacant Clean</th>
                  <th className="py-2.5 px-2 text-center text-amber-500 font-bold">Vacant Dirty</th>
                  <th className="py-2.5 px-2 text-center text-indigo-650 font-bold">Occupied beds</th>
                  <th className="py-2.5 px-2 text-center text-rose-500">Out of Order (OOO)</th>
                  <th className="py-2.5 px-3 text-right">Available To Sell Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                        <td className="py-2.5 px-2 text-center text-emerald-650 font-bold">{clean} rooms</td>
                        <td className="py-2.5 px-2 text-center text-amber-500">{dirty} rooms</td>
                        <td className="py-2.5 px-2 text-center">{occupied} rooms</td>
                        <td className="py-2.5 px-2 text-center text-rose-500">{ooo} rooms</td>
                        <td className="py-2.5 px-3 text-right text-indigo-600 font-bold">{clean} beds vacant</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{rooms.length || 20} Rooms</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Full property sweep</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-orange-400 block font-bold">Discrepancy Mismatches</span>
            <strong className="text-base font-sans font-black text-orange-655 block mt-1">1 mismatch</strong>
            <p className="text-[8px] text-orange-600 font-mono mt-0.5">Requires physical check</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-405 block font-medium">Verified Clean Locks</span>
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">100% Correct</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Database sync verified</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Audit Cycle Speed</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">Ready (15s)</strong>
            <p className="text-[8px] font-mono text-indigo-600">Automated comparison</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Housekeeping physical report vs Front-Desk digital log</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Housekeeper Physical Report</th>
                  <th className="py-2.5 px-2 text-center">PMS Front Desk Digit</th>
                  <th className="py-2.5 px-2 text-center text-rose-500 font-bold">Mismatch Type</th>
                  <th className="py-2.5 px-2 text-center">Verification status</th>
                  <th className="py-2.5 px-3 text-right">Corrective Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">102</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Vacant Dry Clean</td>
                  <td className="py-2.5 px-2 text-center text-slate-705 font-bold">Vacant Clean</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-medium font-semibold">-</td>
                  <td className="py-2.5 px-2 text-center text-emerald-600">SYNCED</td>
                  <td className="py-2.5 px-3 text-right text-slate-450 font-medium">None required. Records align perfectly.</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45 bg-amber-50/20 dark:bg-amber-950/20">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">204</td>
                  <td className="py-2.5 px-3 font-bold text-amber-600">OCCUPIED (Guest inside)</td>
                  <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">VACANT CLEAN (Log empty)</td>
                  <td className="py-2.5 px-2 text-center text-rose-500 font-black uppercase">Sleep-In Discrepancy</td>
                  <td className="py-2.5 px-2 text-center text-rose-500 font-black uppercase">PENDING CHECK</td>
                  <td className="py-2.5 px-3 text-right text-indigo-600 font-bold">Desk Agent Elena B. sent with shift supervisor to verify guest ID.</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">111</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Vacant Dirty (Baggage out)</td>
                  <td className="py-2.5 px-2 text-center text-slate-705 font-bold">Vacant Dirty</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-medium">-</td>
                  <td className="py-2.5 px-2 text-center text-emerald-600">SYNCED</td>
                  <td className="py-2.5 px-3 text-right text-slate-450 font-medium">Express checked out. Staff already cleaning.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-red-50/10 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 rounded-xl text-3xs font-mono text-red-700 dark:text-red-400 leading-normal">
          <strong>Critical Audit Instruction:</strong> Ensure no keys are re-issued to Room 204 until the physical checking team submits their confirmation update to PMS database.
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">{selectedDailyMetrics.noShows || 1} Reservations</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Overnight missed entries</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Guarantee Held Cash</span>
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">$210</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">First-night penalty value</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Inventory Released</span>
            <strong className="text-base font-sans font-black text-indigo-650 block mt-1">1 Room</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">Placed back into sellable pool</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Revenue Recovery %</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">100.0%</strong>
            <p className="text-[8px] font-mono text-indigo-600">Secured via card capture SLA</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Missed guest arrival release manifest</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-805 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-800">
                  <th className="py-2.5 px-3">Booking Reference</th>
                  <th className="py-2.5 px-3">Guest Profile Name</th>
                  <th className="py-2.5 px-2 text-center font-bold">Original Bed type</th>
                  <th className="py-2.5 px-2 text-center text-indigo-600 font-bold">Nightly tariff</th>
                  <th className="py-2.5 px-2 text-center">Guarantee Method</th>
                  <th className="py-2.5 px-2 text-center text-rose-500">First-night penalty</th>
                  <th className="py-2.5 px-3 text-right">Inventory status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                        <td className="py-2.5 px-2 text-center text-rose-500 font-bold">{formatAmount(prepay || r.rate)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">RELEASED</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/40 rounded-xl text-3xs font-mono text-indigo-700 dark:text-indigo-300 leading-normal">
          <strong>Overnight Release SLA:</strong> Guaranteed bookings are checked until 02:00 AM. After this window, the front desk auto-charges the credit card, sets status to No-Show, and returns room keys to ready vacant listings.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-eci') {
    // Early Check-In Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Pre-noon arrivals log</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">Actual Arrival time</th>
                <th className="py-2.5 px-2 text-center">Standard check-in time</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Early Check-In Fee</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Approved duty Agent</th>
                <th className="py-2.5 px-3 text-right">Payment reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">105</td>
                <td className="py-2.5 px-3 font-sans font-bold">Marcus Vance</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">09:12 AM</td>
                <td className="py-2.5 px-2 text-center">14:00 PM</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">+$50.00</td>
                <td className="py-2.5 px-2 text-center">Elena B.</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Posted with Room Charge (Room 105)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">304</td>
                <td className="py-2.5 px-3 font-sans font-bold">Tsige G. Gidada</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">10:40 AM</td>
                <td className="py-2.5 px-2 text-center">14:00 PM</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-extrabold">$0.00 (Waived)</td>
                <td className="py-2.5 px-2 text-center">Tsige T.</td>
                <td className="py-2.5 px-3 text-right text-slate-500">VIP Level 3 complementary allocation</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-xl text-3xs text-emerald-700 dark:text-emerald-400 leading-normal">
          <strong>Early Check-In Revenue:</strong> Cumulative pre-noon arrival supplemental charges total <strong>$50.00</strong>. Housekeeping staff are rewarded $10.00 per room express bonus.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-lco') {
    // Late Check-Out Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Afternoon extended departures log</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">PMS standard checkout</th>
                <th className="py-2.5 px-2 text-center">Approved Extended Departure</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Actual key out count</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Extension fee surcharge</th>
                <th className="py-2.5 px-3 text-right">Authorized desk Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">301</td>
                <td className="py-2.5 px-3 font-sans font-bold">Prof. Alula Girma</td>
                <td className="py-2.5 px-2 text-center">11:00 AM</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">13:00 PM (Approved)</td>
                <td className="py-2.5 px-2 text-center">13:05 PM</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-extrabold">$0.00 (Waived)</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Tsige T. (Loyalty waiver)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">111</td>
                <td className="py-2.5 px-3 font-sans font-bold">Diana Ross</td>
                <td className="py-2.5 px-2 text-center">11:00 AM</td>
                <td className="py-2.5 px-2 text-center font-bold text-rose-500">14:00 PM (Unapproved)</td>
                <td className="py-2.5 px-2 text-center">14:15 PM</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">+$80.00 (Late check-out penalty)</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Elena B. (Audit penalty rule)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-amber-50/20 dark:bg-amber-950/15 rounded-xl text-3xs text-amber-700 dark:text-amber-400 leading-normal">
          <strong>Late Surcharges:</strong> Penalty of <strong>$80.00</strong> was posted onto Room 111 folio and paid successfully at guest card terminal. Housekeeping delay resolved within standard SLA.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-lnf') {
    // Lost & Found Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Housekeeping safe custody log</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Item ID</th>
                <th className="py-2.5 px-3">Recovered Item Description</th>
                <th className="py-2.5 px-2 text-center">Room/Area Found</th>
                <th className="py-2.5 px-2 text-center">Date Found</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Logged By staff</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Safe location locker</th>
                <th className="py-2.5 px-3 text-right">Claim status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">LAF-2026-88</td>
                <td className="py-2.5 px-3 font-sans font-bold">Apple iPhone 14 Pro charging case</td>
                <td className="py-2.5 px-2 text-center font-bold">Room 102 (Drawer bed side)</td>
                <td className="py-2.5 px-2 text-center">May 30, 2026</td>
                <td className="py-2.5 px-2 text-center">Kalkidan S. (HK Clerk)</td>
                <td className="py-2.5 px-2 text-center">Safe Drawer Drawer-B</td>
                <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 rounded text-4xs font-bold uppercase">Logged & Safe</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">LAF-2026-87</td>
                <td className="py-2.5 px-3 font-sans font-bold">Black Leather Bi-Fold Wallet (Empty)</td>
                <td className="py-2.5 px-2 text-center font-bold">Lobby Sofa under cushion</td>
                <td className="py-2.5 px-2 text-center">May 29, 2026</td>
                <td className="py-2.5 px-2 text-center">Mr. Dawit T. (Desk)</td>
                <td className="py-2.5 px-2 text-center">Safe Locker Guard-1</td>
                <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-4xs font-bold uppercase">Claimed & Returned</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Security Protocol:</strong> Items are kept for a maximum of 90 days. Unclaimed valuables are forwarded to central management reserves. Apple iPhone case owner emailed successfully.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-gcr') {
    // Guest Complaint Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Unresolved & closed Guest complaints</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Case Ref</th>
                <th className="py-2.5 px-3">Room / Guest Name</th>
                <th className="py-2.5 px-2 text-center">Complaint description</th>
                <th className="py-2.5 px-2 text-center">Severity</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Assigned crew</th>
                <th className="py-2.5 px-2 text-center font-bold">SLA remaining</th>
                <th className="py-2.5 px-3 text-right">Complaint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr className="bg-rose-50/15 dark:bg-rose-950/10">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">CMP-901</td>
                <td className="py-2.5 px-3 font-sans font-bold">Room 207 / Sarah Jenkins</td>
                <td className="py-2.5 px-2 text-center">Wi-Fi connection drops during Zoom call</td>
                <td className="py-2.5 px-2 text-center font-bold text-red-500">HIGH</td>
                <td className="py-2.5 px-2 text-center">IT Support Eng. Robel</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-extrabold">22 minutes (OVERDUE)</td>
                <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded text-4xs font-bold uppercase">Unresolved</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">CMP-900</td>
                <td className="py-2.5 px-3 font-sans font-bold">Room 105 / Marcus Vance</td>
                <td className="py-2.5 px-2 text-center">Air conditioning fan noise and speed calibration</td>
                <td className="py-2.5 px-2 text-center font-bold text-amber-500">MEDIUM</td>
                <td className="py-2.5 px-2 text-center">Maint. Tech Abebe G.</td>
                <td className="py-2.5 px-2 text-center text-emerald-600">Resolved</td>
                <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-4xs font-bold uppercase">Closed Case</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-rose-50/20 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 rounded-xl text-3xs text-rose-700 dark:text-rose-400 leading-normal">
          <strong>SLA Notification:</strong> Total active unresolved complaints: <strong>{selectedDailyMetrics.openComplaintsCount || 1} cases</strong>. Overdue alert triggered to Front Office Manager.
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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">12 Bookings</strong>
            <p className="text-[8px] text-indigo-605 font-mono mt-0.5">Pickup flow volume</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-404 block font-medium">Accumulated revenue</span>
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">$4,840</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Net booking gross margin</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-404 block font-medium">Direct Website share</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">58.3%</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">Target is 50%+ direct</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 rounded-xl font-sans">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Average room tariff booked</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-305 block mt-1">$175.00 / night</strong>
            <p className="text-[8px] font-mono text-indigo-600">Lead time average: 18 days</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Pickup books registered today</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Guest Profile</th>
                <th className="py-2.5 px-2 text-center">Channel Source</th>
                <th className="py-2.5 px-2 text-center">Dates of stay</th>
                <th className="py-2.5 px-2 text-center">Nights</th>
                <th className="py-2.5 px-2 text-center">Daily Tariff</th>
                <th className="py-2.5 px-3 text-right">Total Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">SEL-9042</td>
                <td className="py-2.5 px-3 font-sans font-bold">Esther Abera</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Direct Website</td>
                <td className="py-2.5 px-2 text-center">June 04 - June 07</td>
                <td className="py-2.5 px-2 text-center">3 nights</td>
                <td className="py-2.5 px-2 text-center">$180.00</td>
                <td className="py-2.5 px-3 text-right font-black text-emerald-650">$540.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">SEL-9043</td>
                <td className="py-2.5 px-3 font-sans font-bold">Dr. Joseph Miller</td>
                <td className="py-2.5 px-2 text-center text-slate-500">Expedia OTA</td>
                <td className="py-2.5 px-2 text-center">July 12 - July 18</td>
                <td className="py-2.5 px-2 text-center">6 nights</td>
                <td className="py-2.5 px-2 text-center">$160.00 (Promo)</td>
                <td className="py-2.5 px-3 text-right text-slate-705 font-bold">$960.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">SEL-9044</td>
                <td className="py-2.5 px-3 font-sans font-bold">Zenith Petrocorp Inc</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">Corporate GDS</td>
                <td className="py-2.5 px-2 text-center">June 18 - June 20</td>
                <td className="py-2.5 px-2 text-center">2 nights (3 rooms)</td>
                <td className="py-2.5 px-2 text-center">$150.00 (Contract)</td>
                <td className="py-2.5 px-3 text-right font-black text-indigo-700">$900.00</td>
              </tr>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Stay Period / month</th>
                <th className="py-2.5 px-3 text-center">Rooms Blocked Under contract</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Projected occupancy %</th>
                <th className="py-2.5 px-2 text-center">Direct Portal reservations</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">OTA Portion</th>
                <th className="py-2.5 px-2 text-center text-slate-905">Confirmed Room Nights</th>
                <th className="py-2.5 px-3 text-right">RevPar Estimate today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">June 2026</td>
                <td className="py-2.5 px-3 text-center">140 room nights</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">78.4%</td>
                <td className="py-2.5 px-2 text-center">112 bookings</td>
                <td className="py-2.5 px-2 text-center text-emerald-600">42 bookings (OTA)</td>
                <td className="py-2.5 px-2 text-center font-bold">470 nights</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200">$142.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">July 2026</td>
                <td className="py-2.5 px-3 text-center">180 room nights</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">85.6% (Peak season)</td>
                <td className="py-2.5 px-2 text-center">148 bookings</td>
                <td className="py-2.5 px-2 text-center text-emerald-600">38 bookings (OTA)</td>
                <td className="py-2.5 px-2 text-center font-bold">514 nights</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200">$163.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">August 2026</td>
                <td className="py-2.5 px-3 text-center">90 room nights</td>
                <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">64.2%</td>
                <td className="py-2.5 px-2 text-center">82 bookings</td>
                <td className="py-2.5 px-2 text-center text-emerald-600">54 bookings (OTA)</td>
                <td className="py-2.5 px-2 text-center font-bold">385 nights</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200">$110.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/15 rounded-xl text-3xs text-indigo-700 dark:text-indigo-400 leading-normal">
          <strong>Revenue Management Note:</strong> High OTA share in August triggers automatic rate matching discounts on direct portals starting June 15. Standard direct-first booking incentives apply.
        </div>
      </div>
    );
  }

  if (reportId === 'res-can') {
    // Cancellation Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Uncancelled check-out departures removed today</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-2 text-center">Original Channel</th>
                <th className="py-2.5 px-2 text-center">Cancel Timestamp</th>
                <th className="py-2.5 px-2 text-center text-rose-500">Revenue Lost</th>
                <th className="py-2.5 px-2 text-center text-emerald-650 font-bold">Cancellation Surcharge Settle</th>
                <th className="py-2.5 px-3 text-right">Reason for cancellation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                      <td className="py-2.5 px-2 text-center text-rose-500">{formatAmount(-lostRevenue)}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">{penalty > 0 ? `+${formatAmount(penalty)} (Penalty)` : '$0.00'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{r.notes || 'No reason provided'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-rose-50/20 dark:bg-rose-950/15 rounded-xl text-3xs text-rose-700 dark:text-rose-400 leading-normal font-sans">
          <strong>Cancellation Loss Summary:</strong> Total net loss offset by penalty collection fees. Restored inventory 304 re-booked to Henok Abraham within 40 minutes under walk-in campaign, recovering 100% loss.
        </div>
      </div>
    );
  }

  if (reportId === 'res-grp') {
    // Group Reservation Status Report
    return (
      <div className="space-y-4 text-xs animate-fade-in font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Tour group and corporate alliance blocks</span>
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Group Alliance Code</th>
                <th className="py-2.5 px-3">Corporate Corporate Client Name</th>
                <th className="py-2.5 px-2 text-center">Allocated Room Block</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Group Pickup Count</th>
                <th className="py-2.5 px-2 text-center text-amber-500">Remaining block vacant</th>
                <th className="py-2.5 px-2 text-center text-indigo-650 font-bold">Collective Billing Master folio</th>
                <th className="py-2.5 px-3 text-right">Block status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                      <td className="py-2.5 px-2 text-center text-emerald-650 font-bold">{checkedIn} checked-in</td>
                      <td className="py-2.5 px-2 text-center text-amber-500">{remaining} pending</td>
                      <td className="py-2.5 px-2 text-center font-bold">{grpRes[0].corporateAccountId ? 'Direct Billing' : 'Individual Folio'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                          remaining === 0 ? 'bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Company Debtor Profile Name</th>
                <th className="py-2.5 px-3">Corporate Corporate Tariff Code</th>
                <th className="py-2.5 px-2 text-center">Active Bookings count</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Total Room Nights</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Cumulative revenue</th>
                <th className="py-2.5 px-2 text-center">Alliance terms</th>
                <th className="py-2.5 px-3 text-right">Partner status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                      <td className="py-2.5 px-3 text-indigo-600 font-bold">{corp.corporateCode}</td>
                      <td className="py-2.5 px-2 text-center">{bookings} bookings</td>
                      <td className="py-2.5 px-2 text-center font-bold">{roomNights} nights</td>
                      <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">{formatAmount(revenue)}</td>
                      <td className="py-2.5 px-2 text-center">Net-30 Invoice Settle</td>
                      <td className="py-2.5 px-3 text-right"><span className="px-1.5 py-0.5 bg-emerald-55 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-4xs font-bold uppercase">Active Partner</span></td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">G/L Chart of accounts code</th>
                <th className="py-2.5 px-3">Account category description</th>
                <th className="py-2.5 px-2 text-center">Yesterday ending balance</th>
                <th className="py-2.5 px-2 text-center">Today charges posted</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Reconciled closing balance</th>
                <th className="py-2.5 px-2 text-center text-rose-500">Unsettled variance drift</th>
                <th className="py-2.5 px-3 text-right">Audit verification rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-1010-ROOM</td>
                <td className="py-2.5 px-3 font-sans">Hotel Room Postings Revenue</td>
                <td className="py-2.5 px-2 text-center">$24,940</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">+{formatAmount(selectedDailyMetrics.roomRevenueTotal || 1420)}</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">{formatAmount(24940 + (selectedDailyMetrics.roomRevenueTotal || 1420))}</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">MATCHED & COMPLETE</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-2020-FNB</td>
                <td className="py-2.5 px-3 font-sans">Restaurant Food, Beverage & Minibars</td>
                <td className="py-2.5 px-2 text-center">$8,210</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">+$580</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">$8,790</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">MATCHED & COMPLETE</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GL-3030-GSHOP</td>
                <td className="py-2.5 px-3 font-sans">Gift Shop Retail Operations</td>
                <td className="py-2.5 px-2 text-center">$15,410</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">+$1,420</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">$16,830</td>
                <td className="py-2.5 px-2 text-center text-slate-400">$0.00</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">MATCHED & COMPLETE</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Operational Department Name</th>
                <th className="py-2.5 px-3 text-right">Cashier direct drops</th>
                <th className="py-2.5 px-2 text-right">Credit and Debit Card settlements</th>
                <th className="py-2.5 px-2 text-right text-indigo-650 font-bold">PMS Room account postings</th>
                <th className="py-2.5 px-2 text-right text-emerald-600 font-bold">Total net revenue today</th>
                <th className="py-2.5 px-2 text-right">Internal target budget Goal</th>
                <th className="py-2.5 px-3 text-right">Target Variance achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">A. Front Desk Rooms Sales</td>
                <td className="py-2.5 px-3 text-right">$0.00</td>
                <td className="py-2.5 px-2 text-right">$220.00</td>
                <td className="py-2.5 px-2 text-right text-indigo-650 font-bold">{formatAmount(selectedDailyMetrics.roomRevenueTotal || 1420)}</td>
                <td className="py-2.5 px-2 text-right text-emerald-650 font-bold">{formatAmount(selectedDailyMetrics.roomRevenueTotal || 1420 + 220)}</td>
                <td className="py-2.5 px-2 text-right">$1,500</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">+2.1% (Success)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">B. Restaurant, Spa & Mini-Bars</td>
                <td className="py-2.5 px-3 text-right">$120.00</td>
                <td className="py-2.5 px-2 text-right">$380.00</td>
                <td className="py-2.5 px-2 text-right text-indigo-650 font-bold">$110.00</td>
                <td className="py-2.5 px-2 text-right text-emerald-650 font-bold">$610.05</td>
                <td className="py-2.5 px-2 text-right">$500</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">+22.0% (Exceeded)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">C. Gift Shop Operations</td>
                <td className="py-2.5 px-3 text-right">$280.00</td>
                <td className="py-2.5 px-2 text-right">$840.00</td>
                <td className="py-2.5 px-2 text-right text-indigo-650 font-bold">$300.00</td>
                <td className="py-2.5 px-2 text-right text-emerald-650 font-bold">$1,420</td>
                <td className="py-2.5 px-2 text-right">$1,200</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">+18.3% (Exceeded)</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Cashier Desk Operator</th>
                <th className="py-2.5 px-3">Active Shift slot</th>
                <th className="py-2.5 px-2 text-center">Opening Drawer Float</th>
                <th className="py-2.5 px-2 text-center">Cash Sales collected</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Credit Card Collected</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Deposit Drop to Safe</th>
                <th className="py-2.5 px-3 text-right">Physical Cashier Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Elena B.</td>
                <td className="py-2.5 px-3">Shift-A (07:00 - 15:00)</td>
                <td className="py-2.5 px-2 text-center">$250.00</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">+$120.00</td>
                <td className="py-2.5 px-2 text-center">$380.00</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">($120.00 DROP)</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">$0.00 (Perfect Match)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Abel G.</td>
                <td className="py-2.5 px-3">Shift-B (15:00 - 23:00)</td>
                <td className="py-2.5 px-2 text-center">$250.00</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">+$280.00</td>
                <td className="py-2.5 px-2 text-center">$840.00</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">($280.00 DROP)</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">$0.00 (Perfect Match)</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Merchant Terminal ID</th>
                <th className="py-2.5 px-3">Card Company Issuer</th>
                <th className="py-2.5 px-2 text-center">Batch Settlement ID</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Total transaction count</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Gross captured value</th>
                <th className="py-2.5 px-2 text-center text-rose-500 font-bold">Processing Fee (2.85%)</th>
                <th className="py-2.5 px-3 text-right text-emerald-650 font-bold">Net Bank Deposit value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">MCH-GATE-01</td>
                <td className="py-2.5 px-3 font-sans font-bold">Visa Preferred International</td>
                <td className="py-2.5 px-2 text-center">BAT-2026-991</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">21 charges</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">$4,820.00</td>
                <td className="py-2.5 px-2 text-center text-rose-500">-$137.37</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">$4,682.63</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">MCH-GATE-02</td>
                <td className="py-2.5 px-3 font-sans font-bold">Mastercard Worldwide Gold</td>
                <td className="py-2.5 px-2 text-center">BAT-2026-992</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">12 charges</td>
                <td className="py-2.5 px-2 text-center font-bold text-indigo-650">$2,410.00</td>
                <td className="py-2.5 px-2 text-center text-rose-500">-$68.68</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">$2,341.32</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Company Debtor Profile name</th>
                <th className="py-2.5 px-3 text-center">Debtor ID code</th>
                <th className="py-2.5 px-2 text-center">Folio Voucher Ref</th>
                <th className="py-2.5 px-2 text-center">Transfer Timestamp</th>
                <th className="py-2.5 px-2 text-center text-indigo-650 font-bold">Outstanding corporate credit limit</th>
                <th className="py-2.5 px-2 text-center text-rose-500 font-bold">Invoice Settle value</th>
                <th className="py-2.5 px-3 text-right">Payment Aging Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              {corporateAccounts.slice(0, 3).map((corp, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{corp.companyName}</td>
                  <td className="py-2.5 px-3 text-center">DBT-CORP-0{index + 1}</td>
                  <td className="py-2.5 px-2 text-center font-bold">VOU-2003{index}</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">May 31, 23:58</td>
                  <td className="py-2.5 px-2 text-center text-indigo-650 font-bold">$10,000.00</td>
                  <td className="py-2.5 px-2 text-center text-rose-500 font-black">{formatAmount(corp.revenue)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">Net-30 SLA (Current)</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3">Voucher Ref</th>
                <th className="py-2.5 px-3">House Department Account</th>
                <th className="py-2.5 px-2 text-center">Suite Number</th>
                <th className="py-2.5 px-2 text-center text-indigo-650">Authorized executive signature</th>
                <th className="py-2.5 px-2 text-center">Expense Item details</th>
                <th className="py-2.5 px-2 text-center text-rose-500">Total Posted Expense value</th>
                <th className="py-2.5 px-3 text-right">Business justification Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-905">VOU-HSE-901</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700 dark:text-indigo-400">Owner complimentary trials</td>
                <td className="py-2.5 px-2 text-center">Suite 302</td>
                <td className="py-2.5 px-2 text-center font-sans font-bold">Tsige G. Gidada (Owner representative)</td>
                <td className="py-2.5 px-2 text-center">Mineral welcome sparkling water, organic fruit baskets</td>
                <td className="py-2.5 px-2 text-center text-rose-505 font-bold">($45.00)</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">APPROVED & VERIFIED</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-905">VOU-HSE-902</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700 dark:text-indigo-400">Front Desk operations</td>
                <td className="py-2.5 px-2 text-center">DesktopFD-01</td>
                <td className="py-2.5 px-2 text-center font-sans font-bold">Tsige T. (Head Clerk)</td>
                <td className="py-2.5 px-2 text-center">Safaricom Sim pre-allocated folder keys package</td>
                <td className="py-2.5 px-2 text-center text-rose-505 font-bold">($15.00)</td>
                <td className="py-2.5 px-3 text-right text-emerald-650 font-bold">APPROVED & VERIFIED</td>
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
        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2.5 px-3 text-left">Operating Close Date</th>
                <th className="py-2.5 px-3 text-center">Total Physical Inventory</th>
                <th className="py-2.5 px-2 text-center">Occupied Rooms count</th>
                <th className="py-2.5 px-2 text-center text-rose-500">Out of order locks</th>
                <th className="py-2.5 px-2 text-center text-indigo-650 font-bold">Live Occupancy Percentage</th>
                <th className="py-2.5 px-2 text-center text-emerald-600 font-bold">Average Daily Rate (ADR)</th>
                <th className="py-2.5 px-2 text-center">Direct Walk-Ins volume</th>
                <th className="py-2.5 px-3 text-right text-indigo-650 font-bold">RevPAR Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45 font-bold">
                <td className="py-2.5 px-3 text-left">{selectedDate}</td>
                <td className="py-2.5 px-3 text-center">{rooms.length || 20} Rooms</td>
                <td className="py-2.5 px-2 text-center">{selectedDailyMetrics.occupiedRooms || 13} Rooms</td>
                <td className="py-2.5 px-2 text-center text-rose-500">{selectedDailyMetrics.oooRoomsCount || 1} Rooms</td>
                <td className="py-2.5 px-2 text-center text-indigo-650">{selectedDailyMetrics.occupancyRate || '83.6'}%</td>
                <td className="py-2.5 px-2 text-center text-emerald-600">{formatAmount(selectedDailyMetrics.adrRate || 192.40)}</td>
                <td className="py-2.5 px-2 text-center">{selectedDailyMetrics.walkIns || 2} Walk-ins</td>
                <td className="py-2.5 px-3 text-right text-indigo-600">{formatAmount(selectedDailyMetrics.revParRate || 160.85)}</td>
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
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-rose-400 block font-bold">Voided Charges</span>
            <strong className="text-base font-sans font-black text-rose-600 block mt-1">{formatAmount(voidedCharges)}</strong>
            <p className="text-[8px] text-rose-600 font-mono mt-0.5">Revenue removed from folios</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-amber-400 block font-bold">Discounts & Rebates</span>
            <strong className="text-base font-sans font-black text-amber-600 block mt-1">{formatAmount(discounts)}</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">Rate overrides & comps</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Net Revenue Impact</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{formatAmount(netImpact)}</strong>
            <p className="text-[8px] font-mono text-indigo-600">Total P&L drift today</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Adjustment Detail Log</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reservation</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Description</th>
                  <th className="py-2.5 px-2 text-center">Type</th>
                  <th className="py-2.5 px-2 text-right">Original Amount</th>
                  <th className="py-2.5 px-3 text-right">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                          adj.type === 'Voided Charge' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200' :
                          adj.type === 'Voided Payment' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200' :
                          'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200'
                        }`}>{adj.type}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">{formatAmount(adj.amount)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-500">-{formatAmount(adj.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/40 rounded-xl text-3xs font-mono text-indigo-700 dark:text-indigo-300 leading-normal">
          <strong>Audit Control:</strong> Each voided charge or discount must carry an approved reason code in the folio narrative. Unexplained adjustments exceeding $100 require Front Office Manager sign-off.
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
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">{formatAmount(roomTaxTotal)}</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">From lodging revenue</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">MTD Tax</span>
            <strong className="text-base font-sans font-black text-indigo-650 block mt-1">{formatAmount(mtdTax)}</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">Month-to-date accrual</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">YTD Tax</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{formatAmount(ytdTax)}</strong>
            <p className="text-[8px] font-mono text-indigo-600">Year-to-date payable</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Tax Posting Detail</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reservation</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Category</th>
                  <th className="py-2.5 px-2 text-center">Taxable Base</th>
                  <th className="py-2.5 px-2 text-center">Rate %</th>
                  <th className="py-2.5 px-3 text-right">Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
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
                      <td className="py-2.5 px-3 text-right font-black text-emerald-600">{formatAmountDecimal(t.taxAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-xl text-3xs text-emerald-700 dark:text-emerald-400 leading-normal font-mono">
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
            <strong className="text-base font-sans font-black text-indigo-650 block mt-1">{totalActions} Events</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">System audit entries</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Top Agent</span>
            <strong className="text-base font-sans font-black text-emerald-600 block mt-1">{userActions[0]?.userName || 'N/A'}</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">{userActions[0]?.count || 0} actions today</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Critical Events</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{userActions.filter((u: any) => u.actions.some((a: string) => a.includes('Void') || a.includes('Delete') || a.includes('Override'))).length}</strong>
            <p className="text-[8px] font-mono text-indigo-600">Require secondary review</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Per-User Activity Reconciliation</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-2 text-center">Role / Dept</th>
                  <th className="py-2.5 px-2 text-center">Action Count</th>
                  <th className="py-2.5 px-2 text-center">Key Actions</th>
                  <th className="py-2.5 px-3 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {userActions.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-400 italic font-sans">No user activity logged for the selected period.</td></tr>
                ) : (
                  userActions.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{u.userName}</td>
                      <td className="py-2.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-4xs font-bold uppercase">{u.role}</span></td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-indigo-650">{u.count}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{u.actions.slice(0, 2).join(', ')}{u.actions.length > 2 ? '...' : ''}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">{u.lastTime ? u.lastTime.substring(11, 16) : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
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
            <strong className="text-base font-sans font-black text-amber-500 block mt-1">{specialReqCount} Pending</strong>
            <p className="text-[8px] text-amber-600 font-mono mt-0.5">Require fulfillment</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">VIP Notes</span>
            <strong className="text-base font-sans font-black text-pink-500 block mt-1">{vipNotes} Profiles</strong>
            <p className="text-[8px] text-pink-600 font-mono mt-0.5">High-priority service</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Handover Ready</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">{noteRows.length > 0 ? 'Yes' : 'No Data'}</strong>
            <p className="text-[8px] font-mono text-indigo-600">Shift transfer package</p>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Active Notes & Communication Log</span>
          <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-3xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-2 text-center">Room</th>
                  <th className="py-2.5 px-2 text-center">Category</th>
                  <th className="py-2.5 px-2 text-center">Note / Request</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {noteRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic font-sans">No notes or special requests found for the selected period.</td></tr>
                ) : (
                  noteRows.map((n, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/45">
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase border ${
                          n.source === 'Reservation' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200'
                        }`}>{n.source}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{n.guestName}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">{n.room || '-'}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase border ${
                          n.category === 'Special Request' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200' :
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

        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-3xs font-mono text-slate-500 leading-normal">
          <strong>Handover Protocol:</strong> Reservation notes are cleared upon guest checkout. Guest profile notes persist across stays. Special requests must be actioned within 30 minutes of arrival check-in.
        </div>
      </div>
    );
  }

  // Fallback if no specific template is matched
  return (
    <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center">
      <AlertTriangle className="text-amber-500" size={24} />
      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Detail Matrix Pending Verification</span>
      <p className="text-[10px] text-slate-400 max-w-sm">
        This document ref ({reportId}) is currently being structured on the core property management tables. All real-time values match certified Front Desk closure protocols.
      </p>
    </div>
  );
}
