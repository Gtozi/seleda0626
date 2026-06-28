import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Users,
  Bed,
  DollarSign,
  Star,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Zap,
  Target,
  Percent,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useERP } from '../../context/ERPContext';

const ExecutiveDashboard = () => {
  const { stats, rooms, reservations, salesTransactions, currentSystemDate, expenseRequests, riskCompliance } = useERP();

  // Date range state
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal state
  const [selectedKPI, setSelectedKPI] = useState<typeof financialKpis[0] | null>(null);

  // Calculate date range boundaries
  const getDateRangeBounds = () => {
    let end = new Date(currentSystemDate);
    let start = new Date(currentSystemDate);

    switch (dateRange) {
      case 'today':
        start = new Date(currentSystemDate);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'custom':
        if (customStartDate) start = new Date(customStartDate);
        if (customEndDate) end = new Date(customEndDate);
        break;
    }

    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  // Generate dynamic AI insights based on real data
  const aiInsights = useMemo(() => {
    const insights = [];

    // Staffing alert based on occupancy
    if (stats.occupancyRate > 80) {
      insights.push({
        title: 'Staffing Alert',
        text: `High occupancy (${stats.occupancyRate}%) detected. Consider increasing Front Office staff by 15-20% for optimal guest service during peak periods.`
      });
    } else if (stats.occupancyRate < 50) {
      insights.push({
        title: 'Staffing Optimization',
        text: `Low occupancy (${stats.occupancyRate}%) presents opportunity. Consider reducing scheduled shifts by 10% to optimize labor costs while maintaining service levels.`
      });
    } else {
      insights.push({
        title: 'Staffing Status',
        text: `Occupancy at ${stats.occupancyRate}% - current staffing levels are well-aligned with guest demand. No immediate adjustments required.`
      });
    }

    // Profitability insight based on expense data
    const fbExpenses = expenseRequests
      .filter(e => e.status === 'Paid' && e.department.toLowerCase().includes('food') || e.department.toLowerCase().includes('beverage'))
      .reduce((sum, e) => sum + e.amount, 0);

    const fbRevenue = salesTransactions
      .filter(t => t.status === 'Completed' && t.module === 'F&B POS')
      .reduce((sum, t) => sum + t.total, 0);

    if (fbExpenses > 0 && fbRevenue > 0) {
      const fbMargin = ((fbRevenue - fbExpenses) / fbRevenue) * 100;
      if (fbMargin < 30) {
        insights.push({
          title: 'F&B Cost Analysis',
          text: `F&B margin at ${fbMargin.toFixed(1)}% below target. Audit ingredient costs and menu pricing to improve profitability by 3-5%.`
        });
      } else {
        insights.push({
          title: 'F&B Performance',
          text: `F&B margin at ${fbMargin.toFixed(1)}% exceeds target. Current cost controls and pricing strategy are performing effectively.`
        });
      }
    }

    return insights;
  }, [stats, expenseRequests, salesTransactions]);

  const { start: rangeStart, end: rangeEnd } = getDateRangeBounds();

  const financialKpis = useMemo(() => {
    // Filter transactions by date range
    const filteredTransactions = salesTransactions.filter(t =>
      t.status === 'Completed' &&
      t.date >= rangeStart &&
      t.date <= rangeEnd
    );

    const rangeRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const accountsReceivable = salesTransactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.total, 0);
    const openIssues = rooms.filter(r => r.status === 'Out of Order').length;

    // Calculate GOPPAR (Gross Operating Profit per Available Room)
    const totalOperatingExpenses = expenseRequests
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
    const grossOperatingProfit = stats.totalRevenue - totalOperatingExpenses;
    const goppar = rooms.length > 0 ? grossOperatingProfit / rooms.length : 0;

    // TRevPAR (Total Revenue per Available Room)
    const trevpar = stats.revpar;

    return [
      { label: `${dateRange === 'today' ? "Today's" : dateRange === 'week' ? "Weekly" : dateRange === 'month' ? "Monthly" : "Range"} Revenue`, value: `$${rangeRevenue.toLocaleString()}`, trend: `${stats.totalRevenue > 0 ? '+' : ''}${((rangeRevenue / Math.max(stats.totalRevenue, 1)) * 100).toFixed(1)}%`, isPositive: rangeRevenue > 0, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
      { label: "Accounts Receivable", value: `$${accountsReceivable.toLocaleString()}`, trend: `${accountsReceivable > 0 ? 'Pending' : 'Clear'}`, isPositive: accountsReceivable === 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
      { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, trend: `${stats.occupiedRoomsCount}/${rooms.length} rooms`, isPositive: stats.occupancyRate >= 50, icon: Bed, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
      { label: "ADR", value: `$${stats.adr.toFixed(2)}`, trend: `RevPAR $${stats.revpar.toFixed(2)}`, isPositive: stats.adr > 0, icon: Target, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
      { label: "GOPPAR", value: `$${goppar.toFixed(2)}`, trend: `GOP: $${(grossOperatingProfit / 1000).toFixed(1)}k`, isPositive: goppar > 0, icon: Percent, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
      { label: "TRevPAR", value: `$${trevpar.toFixed(2)}`, trend: `Total Rev: $${(stats.totalRevenue / 1000).toFixed(1)}k`, isPositive: trevpar > 0, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
      { label: "Arrivals Today", value: `${stats.arrivalsTodayCount}`, trend: `Dep: ${stats.departuresTodayCount}`, isPositive: stats.arrivalsTodayCount > 0, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
      { label: "Out of Order", value: `${openIssues}`, trend: `${stats.dirtyRoomsCount} dirty`, isPositive: openIssues === 0, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
    ];
  }, [stats, rooms, salesTransactions, currentSystemDate, expenseRequests, rangeStart, rangeEnd, dateRange]);

  const occupancyTrend = useMemo(() => {
    const last7Days: { day: string; occ: number; rev: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentSystemDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRes = reservations.filter(r => r.checkInDate <= dateStr && r.checkOutDate > dateStr);
      const occ = rooms.length > 0 ? Math.round((dayRes.length / rooms.length) * 100) : 0;
      const rev = salesTransactions
        .filter(t => t.date === dateStr && t.status === 'Completed')
        .reduce((sum, t) => sum + t.total, 0);
      last7Days.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), occ, rev });
    }
    return last7Days;
  }, [rooms, reservations, salesTransactions, currentSystemDate]);

  const revenueByDept = useMemo(() => {
    const deptMap: Record<string, number> = {};
    salesTransactions
      .filter(t => t.status === 'Completed')
      .forEach(t => {
        const dept = t.module || 'Other';
        deptMap[dept] = (deptMap[dept] || 0) + t.total;
      });
    const colors = ['#B5563C', '#5F7A4F', '#C18A3B', '#9C4A36', '#6B5C4D'];
    return Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [salesTransactions]);

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Date Range</span>
        </div>
        <div className="flex items-center gap-2">
          {['today', 'week', 'month', 'custom'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                dateRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {financialKpis.map((kpi, i) => (
          <div
            key={i}
            onClick={() => setSelectedKPI(kpi)}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs transition-all hover:shadow-sm hover:border-indigo-300 cursor-pointer"
          >
            <div className={`p-2 w-fit rounded-xl ${kpi.bg} ${kpi.color} mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
               <h3 className="text-lg font-black text-slate-900 dark:text-white">{kpi.value}</h3>
               <div className={`flex items-center gap-0.5 text-[9px] font-bold ${kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {kpi.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {kpi.trend}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Drill-Down Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedKPI(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedKPI.bg} ${selectedKPI.color}`}>
                  <selectedKPI.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedKPI.label}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Detailed Breakdown</p>
                </div>
              </div>
              <button onClick={() => setSelectedKPI(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Value</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedKPI.value}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trend</p>
                <div className={`flex items-center gap-2 text-sm font-bold ${selectedKPI.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedKPI.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {selectedKPI.trend}
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-700/50">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Performance Insight</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedKPI.isPositive
                    ? 'This metric is performing well. Continue monitoring trends to maintain positive trajectory.'
                    : 'This metric requires attention. Review operational factors impacting performance.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedKPI(null)}
              className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-500" />
                Revenue & Occupancy Velocity
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Weekly Performance Lifecycle</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500">Revenue ($)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[10px] font-bold text-slate-500">Occ. (%)</span>
               </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B5563C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#B5563C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#6B5C4D' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#6B5C4D' }} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#6B5C4D' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="rev" stroke="#B5563C" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area yAxisId="right" type="monotone" dataKey="occ" stroke="#C9BBA8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Mix */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Department Revenue Mix</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByDept} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {revenueByDept.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {revenueByDept.map((dept, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-black">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  {dept.name}
                </div>
                <span className="text-slate-900 dark:text-white">${dept.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="lg:col-span-12 grid md:grid-cols-3 gap-6">
           {/* Insights Card */}
           <div className="bg-indigo-600 rounded-[32px] p-6 text-white overflow-hidden relative">
              <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/10" />
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Strategic Insights</span>
                 </div>
                 <div className="space-y-4">
                    {aiInsights.map((insight, i) => (
                      <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/10">
                         <h4 className="text-xs font-black uppercase mb-1">{insight.title}</h4>
                         <p className="text-[11px] opacity-80 leading-relaxed font-medium">{insight.text}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Guest Heartbeat */}
           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Guest Experience Pulse</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Booking.com', score: '9.2/10', trend: '+0.2', color: 'text-blue-500' },
                   { label: 'TripAdvisor', score: '4.8/5.0', trend: 'stable', color: 'text-emerald-500' },
                   { label: 'Google Maps', score: '4.7/5.0', trend: '+0.1', color: 'text-indigo-500' },
                 ].map((rev, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{rev.label}</span>
                         <h5 className="text-sm font-black text-slate-900 dark:text-white leading-none mt-1">{rev.score}</h5>
                      </div>
                      <span className={`text-[10px] font-black ${rev.color} uppercase`}>{rev.trend}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-4 py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-50 transition">
                View Feedback Logs
              </button>
           </div>

           {/* Risk Management */}
           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Compliance & Risk</h3>
              <div className="space-y-3">
                 {riskCompliance.slice(0, 3).map((risk) => {
                   const today = new Date();
                   const expiry = new Date(risk.expiryDate);
                   const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                   const status = risk.status;
                   const progressWidth = status === 'Critical' || status === 'Expired' ? 25 : status === 'Warning' ? 66 : 100;

                   return (
                     <div key={risk.id} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{risk.title}</span>
                           <span className={`text-[9px] font-black uppercase ${
                             status === 'Critical' || status === 'Expired' ? 'text-rose-500' :
                             status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'
                           }`}>{status}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${
                             status === 'Critical' || status === 'Expired' ? 'bg-rose-500' :
                             status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                           }`} style={{ width: `${progressWidth}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">
                           {daysUntilExpiry > 0 ? `Expires in ${daysUntilExpiry} days` : daysUntilExpiry === 0 ? 'Expires today' : 'Expired'}
                        </p>
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

export default ExecutiveDashboard;
