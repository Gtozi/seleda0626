import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ArrowRight,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useERP } from '../../context/ERPContext';

const FinanceCommand = () => {
  const { stats, salesTransactions, expenseRequests, currentSystemDate, journals } = useERP();

  // Date range state
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  const { start: rangeStart, end: rangeEnd } = getDateRangeBounds();

  // Export functionality
  const handleExportCSV = () => {
    const filteredTransactions = salesTransactions.filter(t =>
      t.status === 'Completed' &&
      t.date >= rangeStart &&
      t.date <= rangeEnd
    );

    const csvContent = [
      ['Date', 'Module', 'Total', 'Status', 'Items'].join(','),
      ...filteredTransactions.map(t =>
        [t.date, t.module, t.total.toFixed(2), t.status, t.items.length].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_export_${rangeStart}_to_${rangeEnd}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revenueStats = useMemo(() => {
    // Filter transactions by date range
    const filteredTransactions = salesTransactions.filter(t =>
      t.status === 'Completed' &&
      t.date >= rangeStart &&
      t.date <= rangeEnd
    );

    const rangeRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const roomsRevenue = filteredTransactions.filter(t => t.module === 'Front Desk Folio').reduce((sum, t) => sum + t.total, 0);
    const fbRevenue = filteredTransactions.filter(t => t.module === 'F&B POS').reduce((sum, t) => sum + t.total, 0);
    const accountsPayable = expenseRequests.filter(e => e.status === 'Approved' || e.status === 'Under Review').reduce((sum, e) => sum + e.amount, 0);
    const cashPosition = journals.filter(j => j.accountType === 'Asset' && j.accountName.toLowerCase().includes('cash')).reduce((sum, j) => sum + j.credit, 0);

    return [
      { label: `${dateRange === 'today' ? "Today's" : dateRange === 'week' ? "Weekly" : dateRange === 'month' ? "Monthly" : "Range"} Revenue`, value: `$${rangeRevenue.toLocaleString()}`, sub: `Rooms: $${(roomsRevenue / 1000).toFixed(1)}k • F&B: $${(fbRevenue / 1000).toFixed(1)}k`, trend: rangeRevenue > 0 ? "+0%" : "No sales", color: "text-indigo-600" },
      { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, sub: "All time cumulative", trend: "+0%", color: "text-emerald-600" },
      { label: "Accounts Payable", value: `$${accountsPayable.toLocaleString()}`, sub: "Pending approvals", trend: accountsPayable > 0 ? "Pending" : "Clear", color: "text-rose-600" },
      { label: "Cash Position", value: `$${cashPosition.toLocaleString()}`, sub: "Liquid Assets", trend: "+$0", color: "text-amber-600" },
    ];
  }, [stats, salesTransactions, expenseRequests, currentSystemDate, journals, rangeStart, rangeEnd, dateRange]);

  const profitabilityData = useMemo(() => {
    const last6Months: { month: string; revenue: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentSystemDate);
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('en', { month: 'short' });
      const monthSales = salesTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear() && t.status === 'Completed';
      }).reduce((sum, t) => sum + t.total, 0);
      const monthExpenses = expenseRequests.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear() && e.status === 'Paid';
      }).reduce((sum, e) => sum + e.amount, 0);
      last6Months.push({ month: monthName, revenue: monthSales, profit: monthSales - monthExpenses });
    }
    return last6Months;
  }, [salesTransactions, expenseRequests, currentSystemDate]);

  const expenseBreakdown = useMemo(() => {
    const deptMap: Record<string, number> = {};
    expenseRequests.filter(e => e.status === 'Paid').forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + e.amount;
    });
    const total = Object.values(deptMap).reduce((sum, v) => sum + v, 0) || 1;
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#94a3b8'];
    return Object.entries(deptMap)
      .slice(0, 5)
      .map(([name, value], i) => ({ name, value: Math.round((value / total) * 100), color: colors[i % colors.length] }));
  }, [expenseRequests]);

  // Calculate budget utilization from expense requests
  const budgetUtilization = useMemo(() => {
    const currentYear = new Date(currentSystemDate).getFullYear();
    const deptBudgets: Record<string, { budget: number; used: number }> = {
      'Marketing': { budget: 45000, used: 0 },
      'Engineering': { budget: 120000, used: 0 },
      'Administration': { budget: 240000, used: 0 },
    };

    expenseRequests
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === currentYear && e.status === 'Paid';
      })
      .forEach(e => {
        const deptKey = Object.keys(deptBudgets).find(k => e.department.toLowerCase().includes(k.toLowerCase()));
        if (deptKey) {
          deptBudgets[deptKey].used += e.amount;
        }
      });

    return Object.entries(deptBudgets).map(([dept, data]) => {
      const utilization = (data.used / data.budget) * 100;
      const status = utilization > 100 ? 'Over' : utilization < 80 ? 'Savings' : 'On Track';
      return {
        dept,
        budget: `$${(data.budget / 1000).toFixed(0)}k`,
        used: `$${(data.used / 1000).toFixed(0)}k`,
        status,
      };
    });
  }, [expenseRequests, currentSystemDate]);

  // Calculate cash flow projection from real data
  const cashFlowProjection = useMemo(() => {
    const today = new Date(currentSystemDate);
    const next30Days = new Date(today);
    next30Days.setDate(next30Days.getDate() + 30);

    // Calculate expected outflow (approved/pending expenses)
    const expectedOutflow = expenseRequests
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate >= today && eDate <= next30Days && (e.status === 'Approved' || e.status === 'Pending' || e.status === 'Under Review');
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate expected inflow (reservations with deposits)
    const expectedInflow = salesTransactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= today && tDate <= next30Days && t.status === 'Pending';
      })
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate tax reserves (18% of revenue)
    const taxReserves = salesTransactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0) * 0.18;

    return [
      { label: 'Next 30 Days Outflow', value: `$${(expectedOutflow / 1000).toFixed(1)}k`, pct: Math.min(100, (expectedOutflow / 500000) * 100), color: 'bg-rose-500' },
      { label: 'Expected Inflow', value: `$${(expectedInflow / 1000).toFixed(1)}k`, pct: Math.min(100, (expectedInflow / 500000) * 100), color: 'bg-emerald-500' },
      { label: 'Tax Reserves', value: `$${(taxReserves / 1000).toFixed(1)}k`, pct: 100, color: 'bg-indigo-500' },
    ];
  }, [expenseRequests, salesTransactions, currentSystemDate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Date Range</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stat.color}`}>{stat.label}</div>
            <div className="flex items-baseline justify-between mb-2">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
               <span className="text-[10px] font-black text-emerald-500 flex items-center">{stat.trend} <ArrowUpRight size={10} /></span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Profitability Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue vs Net Profit</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Monthly Financial Trajectory</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-500">Gross Revenue</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500">Net Profit</span>
               </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="revenue" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="profit" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Structure */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Expense Decomposition</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {expenseBreakdown.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {expenseBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-black">
                <div className="flex items-center gap-2 text-slate-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-bold">{item.value}%</span>
                  <span className="text-slate-900 dark:text-white w-12 text-right">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Cash Flow Forecast */}
         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px]">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cash Flow Projection</h4>
               <Wallet size={18} className="text-emerald-500" />
            </div>
            <div className="space-y-4">
               {cashFlowProjection.map((c, i) => (
                 <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span className="text-slate-500">{c.label}</span>
                       <span className="text-slate-900 dark:text-white">{c.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Budget Variance */}
         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px]">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Department Budget Utilization</h4>
            <div className="space-y-5">
               {budgetUtilization.map((b, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div>
                       <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.dept}</span>
                       <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mt-0.5">Budget: {b.budget}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${b.status === 'Over' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {b.status}
                       </span>
                       <p className="text-xs font-black text-slate-900 dark:text-white mt-1 uppercase">{b.used}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinanceCommand;
