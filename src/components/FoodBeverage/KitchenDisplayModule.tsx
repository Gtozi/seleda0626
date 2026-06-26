/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Timer, 
  AlertCircle, 
  Utensils, 
  Flame, 
  Bell, 
  ChevronRight,
  TrendingDown,
  Plus
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface KDSOrder {
  id: string;
  tableOrRoom: string;
  source: 'POS' | 'Room Service';
  items: { name: string, quantity: number, notes?: string }[];
  timeIn: string;
  elapsedMinutes: number;
  status: 'New' | 'Fired' | 'Plating' | 'Ready';
  priority: 'Normal' | 'VIP' | 'Rush';
}

export default function KitchenDisplayModule() {
  const { addNotification } = useERP();
  
  const [orders, setOrders] = useState<KDSOrder[]>([
    { 
      id: 'KDS-001', 
      tableOrRoom: 'T2', 
      source: 'POS', 
      items: [
        { name: 'Classic Burger', quantity: 1, notes: 'No Onions' },
        { name: 'Craft Beer', quantity: 2 }
      ],
      timeIn: '12:15 PM', 
      elapsedMinutes: 18, 
      status: 'Fired', 
      priority: 'Normal' 
    },
    { 
      id: 'KDS-002', 
      tableOrRoom: 'RM 102', 
      source: 'Room Service', 
      items: [
        { name: 'Caesar Salad', quantity: 1 },
        { name: 'Red Wine (Glass)', quantity: 1 }
      ],
      timeIn: '12:18 PM', 
      elapsedMinutes: 15, 
      status: 'Plating', 
      priority: 'VIP' 
    },
    { 
      id: 'KDS-003', 
      tableOrRoom: 'T7', 
      source: 'POS', 
      items: [
        { name: 'Steak Frites', quantity: 2, notes: 'Medium Rare' },
        { name: 'Red Wine (Bottle)', quantity: 1 }
      ],
      timeIn: '12:25 PM', 
      elapsedMinutes: 8, 
      status: 'New', 
      priority: 'Rush' 
    },
  ]);

  const updateStatus = (id: string, next: KDSOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    if (next === 'Ready') {
      addNotification(`Order ${id} is ready for pickup/delivery!`, 'info', 'F&B');
    }
  };

  const getPriorityColor = (p: KDSOrder['priority']) => {
    switch (p) {
      case 'VIP': return 'bg-indigo-600 text-white';
      case 'Rush': return 'bg-rose-600 text-white';
      default: return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getTimerColor = (mins: number) => {
    if (mins > 20) return 'text-rose-500 font-black animate-pulse';
    if (mins > 10) return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-bold';
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Breakfast', count: 42, color: 'bg-amber-500' },
          { label: 'Lunch', count: 28, color: 'bg-emerald-500' },
          { label: 'Dinner', count: 35, color: 'bg-indigo-500' },
          { label: 'Veg/Special', count: 8, color: 'bg-rose-500' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs group transition-all hover:border-indigo-400">
            <div className="flex justify-between items-start mb-2">
              <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                <ChefHat size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Forecast</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-850 dark:text-white leading-tight">{item.count}</p>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item.label}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-inside">
              <ChefHat size={24} />
           </div>
           <div>
              <h3 className="text-white font-extrabold text-sm">KDS Operational Screen</h3>
              <p className="text-slate-400 text-xs font-mono">Real-time Kitchen Order Stream & Prep-time Monitor</p>
           </div>
        </div>
        <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Prep Time Avg: 12m</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Late Orders: 2</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-start items-start">
        {orders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 border-t-4 border-slate-900 rounded-b-3xl shadow-3xs flex flex-col min-h-[300px] animate-fade-in relative transition-all hover:shadow-xl">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs border-b dark:border-slate-800">
                <div className="flex items-center gap-2">
                   <h4 className="font-black text-slate-900 dark:text-white">{order.tableOrRoom}</h4>
                   <span className="text-[9px] font-mono text-slate-400">{order.id}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(order.priority)}`}>
                   {order.priority}
                </div>
             </div>

             <div className="flex-1 p-4 space-y-4">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock size={12} />
                      <span>In {order.timeIn}</span>
                   </div>
                   <div className={`flex items-center gap-1 text-xs ${getTimerColor(order.elapsedMinutes)}`}>
                      <Timer size={14} />
                      <span>{order.elapsedMinutes}m</span>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-900 dark:text-white">{item.quantity}x</span>
                           <span className="text-sm font-bold text-slate-850 dark:text-slate-200">{item.name}</span>
                        </div>
                        {item.notes && (
                          <div className="ml-7 flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50 font-bold uppercase tracking-tighter">
                             <AlertCircle size={10} /> {item.notes}
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-b-3xl border-t dark:border-slate-800">
                {order.status === 'New' && (
                  <button 
                   onClick={() => updateStatus(order.id, 'Fired')}
                   className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Flame size={14} /> FIRE ORDER
                  </button>
                )}
                {order.status === 'Fired' && (
                  <button 
                   onClick={() => updateStatus(order.id, 'Plating')}
                   className="w-full py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-600 flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <TrendingDown size={14} className="rotate-90" /> MARK PLATING
                  </button>
                )}
                {order.status === 'Plating' && (
                  <button 
                   onClick={() => updateStatus(order.id, 'Ready')}
                   className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <CheckCircle2 size={14} /> COMPLETE & NOTIFY
                  </button>
                )}
                {order.status === 'Ready' && (
                  <div className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold text-center cursor-not-allowed">
                    ORDER READY / EXPO
                  </div>
                )}
             </div>
          </div>
        ))}

        <button 
          onClick={() => {
            const newKdsId = `KDS-${Math.floor(Math.random() * 900) + 100}`;
            const newOrder: KDSOrder = {
              id: newKdsId,
              tableOrRoom: 'T' + (Math.floor(Math.random() * 8) + 1),
              source: 'POS',
              items: [{ name: 'Chef Specialty', quantity: 1, notes: 'Incoming from GDS' }],
              timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              elapsedMinutes: 0,
              status: 'New',
              priority: 'Normal'
            };
            setOrders([...orders, newOrder]);
            addNotification(`New GDS Order ${newKdsId} synchronized.`, 'info', 'Kitchen');
          }}
          className="h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-300 gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
           <Plus size={48} className="opacity-20" />
           <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50">Manual GDS Sync</span>
        </button>
      </div>
    </div>
  );
}
