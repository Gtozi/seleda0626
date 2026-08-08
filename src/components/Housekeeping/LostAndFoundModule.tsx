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
  category: 'Electronics' | 'Clothing' | 'Valuables' | 'Documents' | 'Others';
  status: 'Found' | 'Logged' | 'Vaulted' | 'Claim Pending' | 'Returned' | 'Disposed';
  foundDate: string;
  foundBy: string;
  location: string;
  description?: string;
  guestName?: string;
  guestContact?: string;
  custodyLog: Array<{ action: string; timestamp: string; performedBy: string }>;
  photoUrl?: string;
  disposalDate?: string;
}

const initialItems: LostFoundItem[] = [
  { 
    id: 'LF-2209', 
    item: 'iPhone 14 Pro Max', 
    room: '402', 
    category: 'Electronics', 
    status: 'Vaulted', 
    foundDate: '2026-05-28', 
    foundBy: 'Staff Member A', 
    location: 'Safe A-04',
    description: 'Black iPhone with cracked screen, found in bedside drawer',
    guestName: 'John Smith',
    guestContact: '+251911123456',
    custodyLog: [
      { action: 'Found', timestamp: '2026-05-28 09:30', performedBy: 'Staff Member A' },
      { action: 'Logged', timestamp: '2026-05-28 09:45', performedBy: 'Front Desk' },
      { action: 'Vaulted', timestamp: '2026-05-28 10:00', performedBy: 'Security' }
    ]
  },
  { 
    id: 'LF-2210', 
    item: 'Woolen Scarf', 
    room: '105', 
    category: 'Clothing', 
    status: 'Claim Pending', 
    foundDate: '2026-05-29', 
    foundBy: 'Staff Member B', 
    location: 'Bin 12',
    description: 'Navy blue wool scarf, designer brand',
    guestName: 'Jane Doe',
    guestContact: '+251911987654',
    custodyLog: [
      { action: 'Found', timestamp: '2026-05-29 14:00', performedBy: 'Staff Member B' },
      { action: 'Logged', timestamp: '2026-05-29 14:15', performedBy: 'Front Desk' }
    ]
  },
  { 
    id: 'LF-2211', 
    item: 'Gold Wedding Ring', 
    room: 'Suite 2', 
    category: 'Valuables', 
    status: 'Vaulted', 
    foundDate: '2026-05-27', 
    foundBy: 'Staff Member A', 
    location: 'Safe A-01',
    description: 'Gold band with diamond, wedding ring',
    guestName: 'Robert Johnson',
    guestContact: '+251911555555',
    custodyLog: [
      { action: 'Found', timestamp: '2026-05-27 16:30', performedBy: 'Staff Member A' },
      { action: 'Logged', timestamp: '2026-05-27 16:45', performedBy: 'Front Desk' },
      { action: 'Vaulted', timestamp: '2026-05-27 17:00', performedBy: 'Security' }
    ]
  },
  { 
    id: 'LF-2212', 
    item: 'Passport', 
    room: '301', 
    category: 'Documents', 
    status: 'Returned', 
    foundDate: '2026-05-26', 
    foundBy: 'Staff Member C', 
    location: 'Front Desk',
    description: 'US Passport, expired 2027',
    guestName: 'Michael Brown',
    guestContact: '+251911333333',
    custodyLog: [
      { action: 'Found', timestamp: '2026-05-26 11:00', performedBy: 'Staff Member C' },
      { action: 'Logged', timestamp: '2026-05-26 11:15', performedBy: 'Front Desk' },
      { action: 'Returned', timestamp: '2026-05-26 12:00', performedBy: 'Front Desk' }
    ]
  },
];

export default function LostAndFoundModule() {
  const [items, setItems] = React.useState<LostFoundItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Found' | 'Logged' | 'Vaulted' | 'Claim Pending' | 'Returned' | 'Disposed'>('All');

  const filteredItems = items.filter(i => {
    const matchesSearch = i.item.toLowerCase().includes(searchTerm.toLowerCase()) || i.room.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateItemStatus = (itemId: string, newStatus: LostFoundItem['status']) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newLog = {
          action: newStatus,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          performedBy: 'Current User'
        };
        return {
          ...item,
          status: newStatus,
          custodyLog: [...item.custodyLog, newLog]
        };
      }
      return item;
    }));
  };

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
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value as any)}
             className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 transition"
           >
             <option value="All">All Status</option>
             <option value="Found">Found</option>
             <option value="Logged">Logged</option>
             <option value="Vaulted">Vaulted</option>
             <option value="Claim Pending">Claim Pending</option>
             <option value="Returned">Returned</option>
             <option value="Disposed">Disposed</option>
           </select>
           <button className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
             <Plus size={14} /> Intake Item
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Item Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredItems.map((item) => (
             <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xl flex gap-4 transition-all hover:border-rose-200 group">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850 relative overflow-hidden">
                   {item.category === 'Electronics' ? <Camera size={32} className="text-slate-300" /> : 
                    item.category === 'Documents' ? <Package size={32} className="text-slate-300" /> : 
                    <Package size={32} className="text-slate-300" />}
                   <div className="absolute top-1 right-1">
                     <div className={`w-2 h-2 rounded-full ${
                       item.status === 'Vaulted' ? 'bg-emerald-500' : 
                       item.status === 'Claim Pending' ? 'bg-amber-500' : 
                       item.status === 'Returned' ? 'bg-blue-500' : 
                       item.status === 'Disposed' ? 'bg-slate-500' : 
                       'bg-rose-500'
                     }`} />
                   </div>
                </div>

                <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{item.item}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Room {item.room} • {item.id}</span>
                      </div>
                   </div>

                   {item.description && (
                     <p className="text-[9px] text-slate-500 italic">{item.description}</p>
                   )}

                   {item.guestName && (
                     <div className="text-[9px] text-slate-600">
                       <span className="font-bold">Guest:</span> {item.guestName}
                     </div>
                   )}

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
                        item.status === 'Returned' ? 'bg-blue-50 text-blue-700' :
                        item.status === 'Disposed' ? 'bg-slate-100 text-slate-600' :
                        item.status === 'Logged' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>{item.status}</span>
                      <div className="flex gap-1">
                        {item.status === 'Claim Pending' && (
                          <button 
                            onClick={() => updateItemStatus(item.id, 'Returned')}
                            className="text-[9px] font-black flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          >
                            <CheckCircle size={10} /> Return
                          </button>
                        )}
                        {item.status === 'Logged' && (
                          <button 
                            onClick={() => updateItemStatus(item.id, 'Vaulted')}
                            className="text-[9px] font-black flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                          >
                            Vault
                          </button>
                        )}
                      </div>
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
