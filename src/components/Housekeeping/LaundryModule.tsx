/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { toISODate } from '../../utils/date';
import { 
  Waves, 
  Clock, 
  RotateCw, 
  Send, 
  ClipboardList, 
  History, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';

interface LaundryJob {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  serviceType: 'Dry Cleaning' | 'Ironing' | 'Wet wash' | 'Express Press';
  piecesCount: number;
  totalCharged: number;
  status: 'Received' | 'Washing' | 'Drying' | 'Ironing' | 'Ready' | 'Delivered and Charged';
  isBilled: boolean;
  date: string;
}

interface LinenStock {
  id: string;
  name: string;
  targetCount: number;
  available: number;
  inWash: number;
  dispatched: number;
}

interface LinenLog {
  id: string;
  item: string;
  quantity: number;
  type: 'Send to Laundry' | 'Return from Laundry';
  sender: string;
  timestamp: string;
}

export default function LaundryModule() {
  const { 
    reservations, 
    addFolioCharge, 
    addNotification, 
    formatAmount 
  } = useERP();

  // Laundry state
  const [laundryJobs, setLaundryJobs] = useState<LaundryJob[]>([
    { id: 'LD-9281', reservationId: 'RES-001', guestName: 'Amanda Sterling', roomNumber: '102', serviceType: 'Dry Cleaning', piecesCount: 4, totalCharged: 48, status: 'Washing', isBilled: false, date: '2026-05-29' },
    { id: 'LD-9282', reservationId: 'RES-002', guestName: 'Michael Chang', roomNumber: '203', serviceType: 'Express Press', piecesCount: 2, totalCharged: 18, status: 'Ironing', isBilled: false, date: '2026-05-29' },
    { id: 'LD-9283', reservationId: 'RES-003', guestName: 'Guest Member C', roomNumber: '304', serviceType: 'Wet wash', piecesCount: 8, totalCharged: 32, status: 'Ready', isBilled: false, date: '2026-05-29' },
  ]);

  const [linenStocks, setLinenStocks] = useState<LinenStock[]>([
    { id: 'LN-01', name: 'Premium King Bedsheet', targetCount: 500, available: 412, inWash: 58, dispatched: 30 },
    { id: 'LN-02', name: 'Plush Microfibre Pillowcase', targetCount: 800, available: 670, inWash: 90, dispatched: 40 },
    { id: 'LN-03', name: 'Egyptian Bath Towel', targetCount: 600, available: 495, inWash: 70, dispatched: 35 },
    { id: 'LN-04', name: 'Egyptian Hand Towel', targetCount: 400, available: 320, inWash: 55, dispatched: 25 },
    { id: 'LN-05', name: 'Honeycomb Cotton Bathrobe', targetCount: 150, available: 112, inWash: 23, dispatched: 15 },
  ]);

  const [linenLogs, setLinenLogs] = useState<LinenLog[]>([
    { id: 'LL-01', item: 'Egyptian Bath Towel', quantity: 50, type: 'Send to Laundry', sender: 'Staff Member A', timestamp: '08:15 AM' },
    { id: 'LL-02', item: 'Premium King Bedsheet', quantity: 40, type: 'Return from Laundry', sender: 'Staff Member B', timestamp: '09:00 AM' },
  ]);

  // Form states
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [laundryServiceType, setLaundryServiceType] = useState<LaundryJob['serviceType']>('Dry Cleaning');
  const [laundryPieces, setLaundryPieces] = useState<number>(3);
  const [customLinenType, setCustomLinenType] = useState<string>(linenStocks[0].name);
  const [customLinenQty, setCustomLinenQty] = useState<number>(20);

  const inHouseGuests = useMemo(() => {
    return reservations.filter(res => res.status === 'CheckedIn');
  }, [reservations]);

  const handleCreateLaundryJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId) return;

    const matchedRes = inHouseGuests.find(r => r.id === selectedResId);
    if (!matchedRes) return;

    const rateMap = { 'Dry Cleaning': 12, 'Ironing': 5, 'Wet wash': 4, 'Express Press': 9 };
    const costPerPiece = rateMap[laundryServiceType];
    const totalCost = costPerPiece * laundryPieces;

    const newJob: LaundryJob = {
      id: `LD-${Math.floor(Math.random() * 9000) + 1000}`,
      reservationId: matchedRes.id,
      guestName: matchedRes.guestName,
      roomNumber: matchedRes.roomNumber || 'N/A',
      serviceType: laundryServiceType,
      piecesCount: laundryPieces,
      totalCharged: totalCost,
      status: 'Received',
      isBilled: false,
      date: toISODate()
    };

    setLaundryJobs(prev => [newJob, ...prev]);
    addNotification(`Laundry request registered for Room ${matchedRes.roomNumber || ''}.`, 'info', 'Housekeeping');
    setSelectedResId('');
    setLaundryPieces(3);
  };

  const updateLaundryStatus = (jobId: string, nextStatus: LaundryJob['status']) => {
    const jobToUpdate = laundryJobs.find(j => j.id === jobId);
    
    if (jobToUpdate && nextStatus === 'Delivered and Charged' && !jobToUpdate.isBilled) {
      addFolioCharge(jobToUpdate.reservationId, {
        amount: jobToUpdate.totalCharged,
        description: `Laundry Service: ${jobToUpdate.serviceType} - ${jobToUpdate.piecesCount} pcs (Job ${jobToUpdate.id})`
      });
      addNotification(`Folio charged ${formatAmount(jobToUpdate.totalCharged)} for Room ${jobToUpdate.roomNumber} delivery.`, 'success', 'Housekeeping');
    }

    setLaundryJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { 
          ...job, 
          status: nextStatus,
          isBilled: nextStatus === 'Delivered and Charged' ? true : job.isBilled
        };
      }
      return job;
    }));
  };

  const handleLinenSendReturn = (type: 'Send to Laundry' | 'Return from Laundry') => {
    if (!customLinenType || customLinenQty <= 0) return;

    const newLog: LinenLog = {
      id: `LL-${Math.floor(Math.random() * 9000) + 1000}`,
      item: customLinenType,
      quantity: customLinenQty,
      type: type,
      sender: 'Staff Member A (Linen In-charge)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLinenLogs(prev => [newLog, ...prev]);

    setLinenStocks(prev => prev.map(l => {
      if (l.name === customLinenType) {
        if (type === 'Send to Laundry') {
          return {
            ...l,
            available: Math.max(0, l.available - customLinenQty),
            inWash: l.inWash + customLinenQty
          };
        } else {
          return {
            ...l,
            available: l.available + customLinenQty,
            inWash: Math.max(0, l.inWash - customLinenQty)
          };
        }
      }
      return l;
    }));

    addNotification(`Linen ${type} logged for ${customLinenQty} pieces.`, 'info', 'Housekeeping');
    setCustomLinenQty(20);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Guest Laundry Management */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans tracking-widest text-slate-400 font-black uppercase">GUEST SERVICES</span>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <Waves size={16} className="text-indigo-650 dark:text-indigo-400" />
                Guest Utility Laundry & Valet Billing Console
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Manage guest wash/iron requests, track cleaning progress, and auto-bill entries to Folio.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* New Job Form */}
            <form onSubmit={handleCreateLaundryJob} className="md:col-span-4 bg-slate-50 dark:bg-slate-950/40 p-4 border dark:border-slate-800 rounded-2xl space-y-4 font-sans text-3xs">
              <div className="border-b dark:border-slate-800 pb-2 mb-1">
                <span className="text-[10px] font-sans tracking-widest text-slate-400 font-black uppercase block font-semibold leading-tight">INTAKE STATION</span>
                <h3 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-100 mt-0.5">New Laundry Ticket</h3>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">1. Select Occupied Guest</label>
                <select
                  required
                  value={selectedResId}
                  onChange={(e) => setSelectedResId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-850 p-2 border dark:border-slate-800 rounded-lg text-3xs outline-none cursor-pointer font-sans font-bold"
                >
                  <option value="">Choose resident...</option>
                  {inHouseGuests.map(res => (
                    <option key={res.id} value={res.id}>{res.guestName} (Room {res.roomNumber})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">2. Service Category</label>
                <select
                  value={laundryServiceType}
                  onChange={(e) => setLaundryServiceType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-850 p-2 border dark:border-slate-800 rounded-lg text-3xs outline-none cursor-pointer"
                >
                  <option value="Dry Cleaning">Dry Cleaning ($12/pc)</option>
                  <option value="Ironing">Ironing & Pressing ($5/pc)</option>
                  <option value="Wet wash">Wet Wash Standard ($4/pc)</option>
                  <option value="Express Press">Express Press Suit ($9/pc)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">3. Pieces Count</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={laundryPieces}
                  onChange={(e) => setLaundryPieces(parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-slate-850 p-2 border dark:border-slate-850 rounded-lg text-3xs outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-black h-10 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer font-sans"
              >
                <Send size={14} /> Register & Queue
              </button>
            </form>

            {/* Jobs Queue */}
            <div className="md:col-span-8 space-y-3">
               <div className="flex justify-between items-center bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-slate-700">
                  <span className="text-[10px] font-sans tracking-widest text-indigo-650 dark:text-indigo-400 font-black uppercase">LIVE JOB QUEUE STATION</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-sans text-indigo-600 dark:text-indigo-400 font-black uppercase">Real-time tracking</span>
                  </div>
               </div>

               <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-4xs overflow-x-auto max-h-[280px]">
                  <table className="w-full text-left border-collapse font-sans text-3xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-850 font-bold text-slate-450 h-8 border-b dark:border-slate-800">
                        <th className="px-3">Job ID</th>
                        <th className="px-3">Guest & Room</th>
                        <th className="px-3">Service</th>
                        <th className="px-3 text-center">Items</th>
                        <th className="px-3 text-right">Price</th>
                        <th className="px-3">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {laundryJobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors h-11">
                          <td className="px-3 font-bold text-slate-400">{job.id}</td>
                          <td className="px-3">
                            <strong className="text-slate-900 dark:text-white block font-sans">{job.guestName}</strong>
                            <span className="text-[9px] text-slate-400 block tracking-tight font-sans uppercase">Room {job.roomNumber}</span>
                          </td>
                          <td className="px-3 text-slate-600 dark:text-slate-300">{job.serviceType}</td>
                          <td className="px-3 text-center font-bold">{job.piecesCount}</td>
                          <td className="px-3 text-right font-black text-emerald-600 dark:text-emerald-400">{formatAmount(job.totalCharged)}</td>
                          <td className="px-3">
                             <select
                               value={job.status}
                               onChange={(e) => updateLaundryStatus(job.id, e.target.value as any)}
                               className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg px-2 py-1 text-[8px] font-black text-indigo-650 dark:text-indigo-400 outline-none cursor-pointer"
                             >
                                <option value="Received">📥 Received</option>
                                <option value="Washing">🧼 Washing</option>
                                <option value="Drying">☀️ Drying</option>
                                <option value="Ironing">👔 Ironing</option>
                                <option value="Ready">📁 Ready</option>
                                <option value="Delivered and Charged">✔ Delivered</option>
                             </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>

        {/* Linen Inventory - Right Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs">
           <div>
              <span className="text-[10px] font-sans tracking-widest text-slate-400 font-black uppercase">CONTRACTOR DISPATCH</span>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <RotateCw size={16} className="text-teal-600 dark:text-teal-400" />
                Linen Dispatch Tracker
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Track external sends & returns of commercial laundry yields.</p>
           </div>

           <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border dark:border-slate-800 rounded-2xl space-y-4">
              <div className="space-y-3 font-sans text-3xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Linen item category</label>
                  <select
                    value={customLinenType}
                    onChange={(e) => setCustomLinenType(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 p-2 border dark:border-slate-800 rounded-lg outline-none font-bold cursor-pointer"
                  >
                    {linenStocks.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Qty Pieces</label>
                  <input
                    type="number"
                    value={customLinenQty}
                    onChange={(e) => setCustomLinenQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-850 p-2 border dark:border-slate-800 rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLinenSendReturn('Send to Laundry')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition"
                  >
                    Send to wash
                  </button>
                  <button 
                    onClick={() => handleLinenSendReturn('Return from Laundry')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition"
                  >
                    Return clean
                  </button>
                </div>
              </div>
           </div>

           <div className="space-y-3 pt-2">
              <span className="text-[10px] font-sans tracking-widest text-slate-400 font-black uppercase block">Stock Resilience Matrix</span>
              <div className="space-y-2.5">
                {linenStocks.map(stock => {
                  const pct = Math.round((stock.available / stock.targetCount) * 100);
                  const color = pct < 70 ? 'bg-amber-500' : 'bg-emerald-500';
                  return (
                    <div key={stock.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-sans">
                         <span className="text-slate-800 dark:text-slate-200 font-bold">{stock.name}</span>
                         <span className="text-slate-400 font-bold">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden flex">
                         <div className={color} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
