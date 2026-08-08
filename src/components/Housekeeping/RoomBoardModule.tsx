/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { RoomStatus, RoomType } from '../../types/erp';
import { 
  Sparkles, 
  CheckCircle, 
  Wrench, 
  Search, 
  User, 
  Check, 
  Filter, 
  AlertTriangle,
  Info,
  Clock,
  Send,
  Printer,
  Layers,
  Moon,
  Waves,
  Coffee,
  Package,
  Play,
  Pause,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

interface RoomBoardModuleProps {
  priorityQueue: string[];
  setPriorityQueue: React.Dispatch<React.SetStateAction<string[]>>;
  housekeepers: any[];
  setHousekeepers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function RoomBoardModule({ 
  priorityQueue, 
  setPriorityQueue, 
  housekeepers, 
  setHousekeepers 
}: RoomBoardModuleProps) {
  const { 
    rooms, 
    setRoomStatus, 
    addNotification,
    formatAmount
  } = useERP();

  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoomNum, setActiveRoomNum] = useState<string | null>(null);

  // Mock extra room data
  const [roomDetails, setRoomDetails] = useState<Record<string, any>>({
    '101': { dnd: false, lastCleaned: '08:30 AM', lastInspected: '09:00 AM', housekeeper: 'Elena R.', arrival: '2026-05-30', departure: '2026-06-02' },
    '102': { dnd: true, lastCleaned: '07:45 AM', lastInspected: '08:15 AM', housekeeper: 'Carlos M.', arrival: '2026-05-28', departure: '2026-05-31' },
    '103': { dnd: false, lastCleaned: '09:15 AM', lastInspected: '10:00 AM', housekeeper: 'Aisha P.', arrival: '2026-05-29', departure: '2026-06-05' },
    '304': { dnd: false, lastCleaned: 'Yesterday', lastInspected: 'Yesterday', housekeeper: 'Aisha P.', arrival: '2026-05-30', departure: '2026-06-05' },
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Checklist state
  const [checklist, setChecklist] = useState({
    linens: false,
    towels: false,
    bathroom: false,
    minibar: false,
    dusting: false,
    vacuum: false
  });

  // Maintenance state
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState<'info' | 'warning'>('warning');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant Clean': return 'bg-emerald-500';
      case 'Vacant Dirty': return 'bg-orange-500';
      case 'Occupied Clean': return 'bg-indigo-500';
      case 'Occupied Dirty': return 'bg-rose-500';
      case 'Inspected': return 'bg-purple-500';
      case 'Out of Order': return 'bg-slate-700';
      case 'Out of Service': return 'bg-red-700';
      case 'Maintenance Required': return 'bg-amber-600';
      default: return 'bg-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Vacant Clean': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Vacant Dirty': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Occupied Clean': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Occupied Dirty': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Inspected': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Out of Order': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const floors = useMemo(() => {
    return Array.from(new Set(rooms.map(r => r.floor))).sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchFloor = selectedFloor === 'all' || room.floor === selectedFloor;
      const matchStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchType = typeFilter === 'all' || room.type === typeFilter;
      const matchSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFloor && matchStatus && matchType && matchSearch;
    });
  }, [rooms, selectedFloor, statusFilter, typeFilter, searchTerm]);

  const activeRoom = useMemo(() => {
    return rooms.find(r => r.number === activeRoomNum) || null;
  }, [rooms, activeRoomNum]);

  const handleSelectRoom = (roomNum: string) => {
    setActiveRoomNum(roomNum);
    const r = rooms.find(rm => rm.number === roomNum);
    setChecklist({
      linens: r ? r.status.includes('Clean') || r.status === 'Inspected' : false,
      towels: r ? r.status.includes('Clean') || r.status === 'Inspected' : false,
      bathroom: r ? r.status.includes('Clean') || r.status === 'Inspected' : false,
      minibar: r ? r.status.includes('Clean') || r.status === 'Inspected' : false,
      dusting: r ? r.status.includes('Clean') || r.status === 'Inspected' : false,
      vacuum: r ? r.status.includes('Clean') || r.status === 'Inspected' : false
    });
  };

  const toggleChecklistItem = (item: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const togglePriorityRoom = (roomNum: string) => {
    const exists = priorityQueue.includes(roomNum);
    if (exists) {
      addNotification(`Room ${roomNum} removed from Priority Queue.`, 'info', 'Housekeeping');
      setPriorityQueue(prev => prev.filter(r => r !== roomNum));
    } else {
      addNotification(`Room ${roomNum} flagged as HIGH PRIORITY. Staff notified.`, 'warning', 'Housekeeping');
      setPriorityQueue(prev => [...prev, roomNum]);
    }
  };

  const handleAssignStaff = (housekeeperId: string, roomNum: string) => {
    setHousekeepers(prev => prev.map(hk => {
      if (hk.id === housekeeperId) {
        const exists = hk.assignedRooms.includes(roomNum);
        return {
          ...hk,
          assignedRooms: exists ? hk.assignedRooms : [...hk.assignedRooms, roomNum]
        };
      } else {
        return {
          ...hk,
          assignedRooms: hk.assignedRooms.filter((r: string) => r !== roomNum)
        };
      }
    }));
    addNotification(`Room ${roomNum} assigned directly to ${housekeepers.find(h => h.id === housekeeperId)?.name}.`, 'info', 'Housekeeping');
  };

  const handleDispatchMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceMsg.trim() || !activeRoomNum) return;

    addNotification(`[Room ${activeRoomNum}] Housekeeping Alert: ${maintenanceMsg}`, maintenancePriority, 'Maintenance');
    setRoomStatus(activeRoomNum, 'Maintenance Required');
    setMaintenanceMsg('');
  };

  const handleUpdateStatus = (status: any) => {
    if (!activeRoomNum) return;
    setRoomStatus(activeRoomNum, status);
    addNotification(`Room ${activeRoomNum} status updated to ${status}.`, 'success', 'Housekeeping');
  };

  const handleCompleteCleaning = () => {
    if (!activeRoomNum) return;
    const nextStatus = rooms.find(r => r.number === activeRoomNum)?.status.startsWith('Occupied') ? 'Occupied Clean' : 'Vacant Clean';
    setRoomStatus(activeRoomNum, nextStatus);
    addNotification(`Room ${activeRoomNum} cleaning complete. Pending inspection.`, 'info', 'Housekeeping');
  };

  const handleSupervisorInspection = () => {
    if (!activeRoomNum) return;
    setRoomStatus(activeRoomNum, 'Inspected');
    addNotification(`Room ${activeRoomNum} inspected and verified.`, 'success', 'Housekeeping');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* ROOM BOARD FILTERS & GRID */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center gap-4 transition-all shadow-3xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search room number, type, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
             >
               <Layers size={14} />
             </button>
             <button 
               onClick={() => setViewMode('table')}
               className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
             >
               <ClipboardList size={14} />
             </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Every Floor</option>
              {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map(room => {
                const isPriority = priorityQueue.includes(room.number);
                const isAssigned = housekeepers.some(hk => hk.assignedRooms.includes(room.number));
                const housekeeper = housekeepers.find(hk => hk.assignedRooms.includes(room.number));
                const details = roomDetails[room.number] || { dnd: false, lastCleaned: 'N/A', housekeeper: 'Unassigned' };
                const statusColor = getStatusColor(room.status);
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={room.number}
                    onClick={() => handleSelectRoom(room.number)}
                    className={`p-0 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                      activeRoomNum === room.number 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-3xs'
                    } bg-white dark:bg-slate-950`}
                  >
                    <div className={`h-1.5 w-full ${statusColor}`} />
                    
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-none">#{room.number}</span>
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">{room.type}</span>
                        </div>
                        {isPriority && <Sparkles size={10} className="text-amber-500 animate-pulse" />}
                      </div>
                      
                      <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border inline-block ${getStatusBadge(room.status)}`}>
                        {room.status.toUpperCase()}
                      </div>

                      <div className="pt-2 border-t border-slate-50 dark:border-slate-900 space-y-1">
                        <div className="flex items-center justify-between text-[7px] font-mono text-slate-400">
                          <span>HSKP:</span>
                          <span className="text-slate-600 dark:text-slate-300 font-bold">{details.housekeeper}</span>
                        </div>
                        <div className="flex items-center justify-between text-[7px] font-mono text-slate-400">
                          <span>CLEAN:</span>
                          <span className="text-slate-600 dark:text-slate-300 font-bold">{details.lastCleaned}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); togglePriorityRoom(room.number); }}
                         className={`p-1.5 rounded-lg shadow-sm ${isPriority ? 'bg-amber-500 text-white' : 'bg-white text-slate-600'} transition hover:scale-110`}
                       >
                         <Sparkles size={12} />
                       </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900rder border-slate-200 dark:border-slate-8008rounded-3xl overflow-hidden shadow-3xs">
            <table className="w-full text-left border-collapse text-[10px] dark:text-slate-200">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 h-10 border-b dark:border-slate-700 text-slate-400 dark:text-slate-300 uppercase font-black tracking-widest">
                  <th className="px-4">Room</th>
                  <th className="px-4">Type</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Housekeeper</th>
                  <th className="px-4">Last Cleaned</th>
                  <th className="px-4">Arrival / Dep.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {filteredRooms.map(room => {
                   const details = roomDetails[room.number] || { lastCleaned: 'N/A', housekeeper: 'Unassigned', arrival: 'N/A', departure: 'N/A' };
                   return (
                    <tr 
                      key={room.number} 
                      onClick={() => handleSelectRoom(room.number)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer h-12 transition-colors ${activeRoomNum === room.number ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <td className="px-4 font-black">#{room.number}</td>
                      <td className="px-4 text-slate-500 font-bold">{room.type}</td>
                      <td className="px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black ${getStatusBadge(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-4 font-bold text-slate-600 dark:text-slate-300">{details.housekeeper}</td>
                      <td className="px-4 text-slate-400 font-mono italic">{details.lastCleaned}</td>
                      <td className="px-4 text-slate-400 font-mono text-[9px]">
                         <div>{details.arrival}</div>
                         <div className="font-black text-slate-600">{details.departure}</div>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECTION & CHECKLIST DRAWER (Right column) */}
      <div className="lg:col-span-4 space-y-6">
        {activeRoom ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-xs sticky top-4 space-y-6 theme-transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white leading-none">Operation Centre: {activeRoom.number}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-widest">{activeRoom.type} • Floor {activeRoom.floor}</p>
              </div>
              <div className="flex gap-1">
                 <button className="p-1 px-2 border border-slate-200 dark:border-slate-800 rounded text-[9px] font-black uppercase text-slate-500">History</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <button onClick={handleCompleteCleaning} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 hover:border-emerald-500 transition-all group">
                  <Play size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase">Start Clean</span>
               </button>
               <button onClick={handleSupervisorInspection} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl flex flex-col items-center gap-1 hover:border-purple-500 transition-all group">
                  <CheckCircle2 size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase">Inspection</span>
               </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">Quick Status Update</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Vacant Clean', 'Vacant Dirty',
                  'Occupied Clean', 'Occupied Dirty',
                  'Inspected', 'Ready',
                  'Pickup', 'Sleep-Out',
                  'Do Not Disturb', 'Out of Order',
                  'Out of Service', 'Maintenance Required'
                ].map((s) => (
                  <button 
                    key={s}
                    onClick={() => handleUpdateStatus(s)}
                    className={`px-2 py-1.5 rounded-xl border text-[8px] font-black text-left transition-all ${activeRoom.status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase block">Assign Duty</span>
              <div className="flex flex-wrap gap-2">
                {housekeepers.map(hk => (
                  <button
                    key={hk.id}
                    onClick={() => handleAssignStaff(hk.id, activeRoom.number)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold font-sans transition ${
                      hk.assignedRooms.includes(activeRoom.number)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-400'
                    }`}
                  >
                    {hk.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t dark:border-slate-800 pt-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Report Maintenance Issue</span>
              </div>
              <form onSubmit={handleDispatchMaintenance} className="space-y-3">
                <select className="w-full bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border dark:border-slate-800 text-[10px] outline-none font-bold">
                   <option>Electrical Issue</option>
                   <option>Plumbing Issue</option>
                   <option>Furniture Repair</option>
                   <option>HVAC / AC Issue</option>
                   <option>Security / Keycard</option>
                </select>
                <textarea 
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="Notes for Engineering team..." 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 rounded-2xl text-[10px] outline-none min-h-[60px] font-sans"
                />
                <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl py-3 font-black font-mono text-[10px] tracking-widest hover:bg-slate-800 transition">
                   DISPATCH ENGINEERING
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4">
             <div className="p-5 bg-white dark:bg-slate-850 rounded-full shadow-sm text-slate-300 dark:text-slate-600">
               <Layers size={48} strokeWidth={1} />
             </div>
             <div className="space-y-1">
               <h4 className="text-sm font-sans font-extrabold text-slate-800 dark:text-slate-100">Verification Terminal Standby</h4>
               <p className="text-[10px] text-slate-400 font-sans max-w-[200px]">Select a room from the matrix to begin detailed cleaning inspection & staff dispatch.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
