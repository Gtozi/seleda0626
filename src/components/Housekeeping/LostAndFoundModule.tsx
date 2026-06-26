import React from 'react';
import { 
  Package, 
  Search, 
  Camera, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowRight,
  Filter,
  CheckCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LostFoundItem {
  id: string;
  item: string;
  room: string;
  category: 'Electronics' | 'Clothing' | 'Valuables' | 'Others';
  status: 'Vaulted' | 'Disposed' | 'Returned' | 'Claim Pending';
  foundDate: string;
  foundBy: string;
  location: string;
}

const initialItems: LostFoundItem[] = [
  { id: 'LF-2209', item: 'iPhone 14 Pro Max', room: '402', category: 'Electronics', status: 'Vaulted', foundDate: '2026-05-28', foundBy: 'Staff Member A', location: 'Safe A-04' },
  { id: 'LF-2210', item: 'Woolen Scarf', room: '105', category: 'Clothing', status: 'Claim Pending', foundDate: '2026-05-29', foundBy: 'Staff Member B', location: 'Bin 12' },
  { id: 'LF-2211', item: 'Gold Wedding Ring', room: 'Suite 2', category: 'Valuables', status: 'Vaulted', foundDate: '2026-05-27', foundBy: 'Staff Member A', location: 'Safe A-01' },
];

export default function LostAndFoundModule() {
  const [items, setItems] = React.useState<LostFoundItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = items.filter(i => i.item.toLowerCase().includes(searchTerm.toLowerCase()) || i.room.includes(searchTerm));

  return (
    <div className="space-y-6 animate-fade-in" id="lost-found-vault">
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Secured Evidence Vault</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lost & Found Inventory</h2>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search item or room..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 transition w-64"
             />
           </div>
           <button className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
             <Plus size={14} /> Intake Item
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Item Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredItems.map((item) => (
             <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs flex gap-4 transition-all hover:border-rose-200 group">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850 relative overflow-hidden">
                   {item.category === 'Electronics' ? <Camera size={32} className="text-slate-300" /> : <Package size={32} className="text-slate-300" />}
                   <div className="absolute top-1 right-1">
                     <div className={`w-2 h-2 rounded-full ${item.status === 'Vaulted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                   </div>
                </div>

                <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{item.item}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Room {item.room} • {item.id}</span>
                      </div>
                   </div>

                   <div className="flex gap-2 text-[9px] font-mono">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={10} /> {item.location}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock size={10} /> {item.foundDate}
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-2">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        item.status === 'Vaulted' ? 'bg-emerald-50 text-emerald-700' :
                        item.status === 'Claim Pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{item.status}</span>
                      <button className="text-[9px] font-black flex items-center gap-1 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                         VERIFY RETURN <ArrowRight size={10} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-6 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-10">
                <ShieldCheck size={120} />
             </div>
             <div>
               <h3 className="font-black text-sm uppercase tracking-widest font-sans">Security Protocol</h3>
               <p className="text-[10px] opacity-60 mt-1 font-sans">Chain of custody auditing enabled for all valuable intakes.</p>
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <UserCheck size={16} className="text-rose-400" />
                   </div>
                   <div>
                     <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Authorized Keeper</span>
                     <span className="text-xs font-black font-sans">Staff Member A</span>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-2">
                   <span className="text-[9px] font-mono font-black text-rose-400 uppercase block">Disposal Schedule</span>
                   <p className="text-[10px] opacity-70 leading-tight font-sans">Items older than 90 days are automatically flagged for charitable disposal or staff claim cycles.</p>
                </div>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Vault Analytics</span>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Unclaimed Valuables', value: '12', color: 'text-rose-600' },
                   { label: 'Successful Returns', value: '84%', color: 'text-emerald-600' },
                   { label: 'Average Claim Time', value: '2.4 days', color: 'text-indigo-600' },
                 ].map((s, i) => (
                   <div key={i} className="flex justify-between items-center pb-2 border-b dark:border-slate-850">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.label}</span>
                      <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
