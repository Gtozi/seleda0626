
import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Droplets,
  Thermometer,
  Wifi,
  Lock,
  Tv,
  Bath,
  Wrench
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const RoomMaintenanceModule: React.FC = () => {
  const { rooms, setRoomStatus } = useERP();
  const [filter, setFilter] = useState<'All' | 'Out of Order' | 'Available' | 'Issues'>('All');

  // Mock Issues data
  const roomIssues = [
    { room: '101', issue: 'Sink leakage', category: 'Plumbing', duration: '2h', status: 'Blocked' },
    { room: '204', issue: 'AC making noise', category: 'HVAC', duration: '5h', status: 'Blocked' },
    { room: '302', issue: 'TV Remote not working', category: 'Electrical', duration: '30m', status: 'Operational' },
    { room: '105', issue: 'Door lock battery low', category: 'Security', duration: '1h', status: 'Operational' },
  ];

  const getIssueIcon = (category: string) => {
    switch (category) {
      case 'Plumbing': return <Droplets size={14} className="text-blue-500" />;
      case 'HVAC': return <Thermometer size={14} className="text-amber-500" />;
      case 'Electrical': return <Zap size={14} className="text-indigo-500" />;
      case 'Security': return <Lock size={14} className="text-slate-500" />;
      default: return <Wrench size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Guest Room Maintenance</h2>
           <p className="text-xs text-slate-400 font-medium">Room-specific fault tracking and inventory returns</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
           {['All', 'Out of Order', 'Issues'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                 filter === f ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Room Grid */}
         <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
               {rooms.map((room) => {
                 const hasIssue = roomIssues.find(i => i.room === room.number);
                 const ooo = room.status === 'Out of Order';
                 
                 return (
                   <div 
                     key={room.number}
                     className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                       ooo ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200' :
                       hasIssue ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200' :
                       'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:border-indigo-300'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-black text-slate-400">#{room.number}</span>
                        {ooo && <ShieldAlert size={12} className="text-rose-500 animate-pulse" />}
                        {hasIssue && !ooo && <AlertTriangle size={12} className="text-amber-500" />}
                     </div>
                     <span className={`text-[8px] font-black uppercase tracking-tight block ${ooo ? 'text-rose-600' : 'text-slate-400'}`}>
                        {room.status}
                     </span>
                     
                     {hasIssue && (
                       <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate">{hasIssue.issue}</span>
                       </div>
                     )}
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Dedicated Issue List */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Active Room Issues</h3>
               <div className="space-y-3">
                  {roomIssues.map((issue, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl space-y-3 border border-transparent hover:border-indigo-100 transition-colors">
                       <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-3xs">
                                {getIssueIcon(issue.category)}
                             </div>
                             <div>
                                <span className="block text-[10px] font-black text-slate-900 dark:text-white leading-tight">Room {issue.room}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{issue.category}</span>
                             </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight ${issue.status === 'Blocked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                             {issue.status}
                          </span>
                       </div>
                       
                       <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 italic leading-snug">
                          "{issue.issue}"
                       </p>

                       <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock size={10} />
                             <span className="text-[9px] font-bold">{issue.duration} elapsed</span>
                          </div>
                          <button 
                            onClick={() => setRoomStatus(issue.room, 'Vacant Clean')}
                            className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition"
                          >
                             <CheckCircle2 size={12} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
               <h3 className="text-sm font-sans font-extrabold">Room Status Actions</h3>
               <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group">
                     <div className="flex items-center gap-3">
                        <AlertTriangle size={14} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mark Out of Order</span>
                     </div>
                     <ArrowUpRight size={14} className="group-hover:translate-x-1 transition text-slate-500" />
                  </button>
                  <button className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition group">
                     <div className="flex items-center gap-3">
                        <ShieldAlert size={14} className="text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mark Out of Service</span>
                     </div>
                     <ArrowUpRight size={14} className="group-hover:translate-x-1 transition text-slate-500" />
                  </button>
                  <button className="flex items-center justify-between p-3 bg-emerald-500/80 hover:bg-emerald-500 rounded-2xl transition group">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Return to Inventory</span>
                     </div>
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RoomMaintenanceModule;
