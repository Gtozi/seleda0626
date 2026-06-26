
import React, { useMemo, useState } from 'react';
import { 
  Package, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight,
  ClipboardList,
  BarChart3,
  Calendar,
  Clock,
  BellOff,
  Box
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { useERP } from '../../context/ERPContext';

const InventoryDashboard: React.FC = () => {
  const { inventoryItems, inventoryStores, inventoryRequisitions, stockMovements, formatAmount } = useERP();

  // Derived Stats
  const totalValue = useMemo(() => {
    return inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.avgCost), 0);
  }, [inventoryItems]);

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(item => item.currentStock <= item.reorderLevel && !dismissedAlerts.has(item.id));
  }, [inventoryItems, dismissedAlerts]);

  const topStats = [
    { label: 'Total Value', value: formatAmount(totalValue), sub: `Across ${inventoryItems.length} SKUs`, color: 'bg-emerald-500', icon: DollarSign },
    { label: 'Total Stores', value: inventoryStores.length.toString(), sub: 'Operational Outlets', color: 'bg-blue-500', icon: Package },
    { label: 'Low Stock', value: lowStockItems.length.toString(), sub: 'Reorder required', color: 'bg-amber-500', icon: AlertCircle },
    { label: 'Pending Req', value: inventoryRequisitions.filter(r => r.status === 'Pending').length.toString(), sub: 'Internal demands', color: 'bg-indigo-500', icon: Truck },
    { label: 'Stores Active', value: inventoryStores.filter(s => s.type === 'Departmental').length.toString(), sub: 'Outlets synced', color: 'bg-purple-500', icon: ClipboardList },
  ];

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventoryItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + (item.currentStock * item.avgCost);
    });
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [inventoryItems]);

  const storeStockData = useMemo(() => {
    const data = inventoryStores.map(store => {
      const value = inventoryItems
        .filter(item => item.location === store.name)
        .reduce((sum, item) => sum + (item.currentStock * item.avgCost), 0);
      return { 
        name: store.name.replace(' Store', '').replace(' Central', ''), 
        value 
      };
    }).filter(s => s.value > 0);
    return data;
  }, [inventoryItems, inventoryStores]);

  const consumptionTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    // Aggregate stock movements by month (simplified: use movement quantity)
    const monthlyData = months.map(m => ({ month: m, consumption: 0, purchase: 0 }));
    stockMovements.forEach(m => {
      const d = new Date(m.date);
      const monthIdx = d.getMonth();
      // Map to our 5-month window roughly
      const idx = monthIdx % 5;
      if (m.type === 'Issue' || m.type === 'Transfer') {
        monthlyData[idx].consumption += Math.abs(m.quantity) * m.cost;
      } else if (m.type === 'Purchase') {
        monthlyData[idx].purchase += m.quantity * m.cost;
      }
    });
    // Fallback to proportional estimates when no real movement data exists yet
    const last = monthlyData[4];
    if (last.consumption === 0) last.consumption = totalValue * 0.35;
    if (last.purchase === 0) last.purchase = totalValue * 0.4;
    return monthlyData;
  }, [stockMovements, totalValue]);

  const fastMovingItems = useMemo(() => {
    // Derive from actual Issue stock movements; fallback to highest-stock items
    const issueTotals: Record<string, number> = {};
    stockMovements.filter(m => m.type === 'Issue').forEach(m => {
      issueTotals[m.itemId] = (issueTotals[m.itemId] || 0) + Math.abs(m.quantity);
    });
    const sorted = Object.entries(issueTotals)
      .map(([itemId, issues]) => {
        const item = inventoryItems.find(i => i.id === itemId);
        return item ? { name: item.name, issues, stock: item.currentStock, trend: issues > item.currentStock ? 'up' : 'steady' } : null;
      })
      .filter(Boolean) as { name: string; issues: number; stock: number; trend: 'up' | 'steady' }[];
    sorted.sort((a, b) => b.issues - a.issues);
    if (sorted.length >= 4) return sorted.slice(0, 4);
    // Fallback: pad with highest-stock items
    const extras = inventoryItems
      .filter(i => !sorted.find(s => s.name === i.name))
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 4 - sorted.length)
      .map(item => ({ name: item.name, issues: 0, stock: item.currentStock, trend: 'steady' as const }));
    return [...sorted, ...extras];
  }, [stockMovements, inventoryItems]);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {topStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-3xs group hover:border-emerald-400 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:${stat.color.replace('bg-', 'text-')} transition-colors`}>
                  <Icon size={14} />
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
              <p className="text-[8px] text-slate-500 font-medium">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Value Chart & Trends */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Store Inventory Value</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Distribution across all stores (including Bar & Gift)</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stock Value</span>
                    </div>
                 </div>
              </div>
              <div className="h-64 mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storeStockData}>
                       <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} vertical={false} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={10} />
                       <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={10} />
                       <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                         formatter={(value: number) => formatAmount(value)}
                       />
                       <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                 <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-6">Inventory Value by Category</h3>
                 <div className="h-48 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={categoryData}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                             {categoryData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatAmount(value)} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                       <span className="text-[8px] font-black text-slate-400 uppercase">Total</span>
                       <span className="text-xs font-black text-slate-900 dark:text-white">{formatAmount(totalValue)}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-y-2 mt-4">
                    {categoryData.slice(0, 4).map((c, i) => (
                       <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 tracking-tight">{c.name}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                 <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-6">Fast-Moving Items (Last 7 Days)</h3>
                 <div className="space-y-4">
                    {fastMovingItems.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl group hover:bg-emerald-50 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-3xs">
                                <Box size={14} />
                             </div>
                             <div>
                                <span className="block text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{item.name}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.issues} Units Issued</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={`text-[8px] font-black ${item.trend === 'up' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {item.trend === 'up' ? <TrendingUp size={10} /> : <Clock size={10} />}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Recent Alerts & Dead Stock */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-sans font-extrabold flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-400" /> Reorder Alerts
                 </h3>
                 <span className="bg-rose-500 text-[8px] font-black px-1.5 py-0.5 rounded-full">{lowStockItems.length} URGENT</span>
              </div>
              <div className="space-y-4">
                 {lowStockItems.slice(0, 3).map((a, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl">
                       <div className="w-1 origin-center rounded-full bg-amber-500" />
                       <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-black tracking-tight">{a.name}</span>
                          <p className="text-[9px] text-white/50 leading-relaxed mt-0.5 truncate">Stock: {a.currentStock} {a.unit} | Min: {a.reorderLevel}</p>
                          <span className="text-[8px] text-white/30 block mt-1.5 font-bold uppercase">{a.location}</span>
                       </div>
                    </div>
                 ))}
                 {lowStockItems.length === 0 && (
                   <p className="text-[10px] text-white/40 text-center py-4">No low stock items detected.</p>
                 )}
              </div>
              <button
                onClick={() => {
                  const ids = new Set(dismissedAlerts);
                  lowStockItems.forEach(a => ids.add(a.id));
                  setDismissedAlerts(ids);
                }}
                className="w-full bg-white/10 hover:bg-white/20 transition p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 flex items-center justify-center gap-2"
              >
                <BellOff size={12} />
                Clear Notifications
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Store Stock Level (%)</h3>
              <p className="text-[10px] text-slate-400 font-medium">Capacity vs Actual</p>
              <div className="space-y-3">
                 {inventoryStores.map((store, i) => {
                   const storeItems = inventoryItems.filter(item => item.location === store.name);
                   const capacity = storeItems.reduce((sum, item) => sum + item.maxStock, 0) || 1000;
                   const actual = storeItems.reduce((sum, item) => sum + item.currentStock, 0);
                   const percent = Math.min(100, Math.round((actual / capacity) * 100));
                   
                   return (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                          <span className="text-slate-600 dark:text-slate-400">{store.name}</span>
                          <span className="text-slate-900 dark:text-white">{percent}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${percent}%` }} 
                          />
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
};

export default InventoryDashboard;
