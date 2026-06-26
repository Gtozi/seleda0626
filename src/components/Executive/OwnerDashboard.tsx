import React, { useMemo } from 'react';
import {
  Briefcase,
  TrendingUp,
  Building,
  BarChart3,
  ShieldCheck,
  Coins,
  ArrowUpRight,
  Target,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useERP } from '../../context/ERPContext';

const OwnerDashboard = () => {
  const { stats, salesTransactions, expenseRequests, currentSystemDate, riskCompliance } = useERP();

  // Calculate equity growth from financial data
  const equityData = useMemo(() => {
    const years: { year: string; value: number }[] = [];
    const currentYear = new Date(currentSystemDate).getFullYear();

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const yearSales = salesTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && t.status === 'Completed';
      }).reduce((sum, t) => sum + t.total, 0);

      const yearExpenses = expenseRequests.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === year && e.status === 'Paid';
      }).reduce((sum, e) => sum + e.amount, 0);

      const yearlyProfit = yearSales - yearExpenses;
      const equityValue = (yearlyProfit / 1000000) * 10 + 40; // Simplified equity calculation

      years.push({
        year: i === 0 ? `${year} (FC)` : year.toString(),
        value: Math.round(equityValue * 10) / 10
      });
    }

    return years;
  }, [salesTransactions, expenseRequests, currentSystemDate]);

  // Calculate financial metrics from real data
  const metrics = useMemo(() => {
    const totalRevenue = salesTransactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);

    const totalExpenses = expenseRequests
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const totalInvestment = totalRevenue * 0.8; // Simplified investment base
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    const portfolioValue = totalRevenue * 1.5; // Simplified portfolio valuation
    const annualDividend = netProfit * 0.3; // 30% of profit as dividend

    // Calculate operational health from compliance
    const compliantAssets = riskCompliance.filter(r => r.status === 'Good').length;
    const operationalHealth = riskCompliance.length > 0 ? (compliantAssets / riskCompliance.length) * 5 : 4.9;

    return [
      { label: 'Return on Investment (ROI)', value: `${roi.toFixed(1)}%`, sub: 'Target: 12.0%', icon: Target, color: roi >= 12 ? 'text-emerald-500' : 'text-amber-500' },
      { label: 'Portfolio Asset Value', value: `$${(portfolioValue / 1000000).toFixed(1)}M`, sub: '+8.4% Appreciation', icon: Building, color: 'text-indigo-500' },
      { label: 'Annual Net Dividend', value: `$${(annualDividend / 1000000).toFixed(1)}M`, sub: 'Est. Oct 2024', icon: Coins, color: 'text-amber-500' },
      { label: 'Operational Health', value: `${(operationalHealth * 10).toFixed(0)}%`, sub: 'Compliance Verified', icon: ShieldCheck, color: operationalHealth >= 4 ? 'text-emerald-500' : 'text-amber-500' },
    ];
  }, [stats, salesTransactions, expenseRequests, riskCompliance]);

  // Calculate capital projects from expense data
  const capitalProjects = useMemo(() => {
    const currentYear = new Date(currentSystemDate).getFullYear();
    const projectCategories = {
      'Beachfront Club Expansion': 0,
      'HVAC Energy Efficiency Retrofit': 0,
      'Kitchen Renovation (Main)': 0,
    };

    expenseRequests
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === currentYear && e.status === 'Paid';
      })
      .forEach(e => {
        if (e.description.toLowerCase().includes('beach') || e.description.toLowerCase().includes('club')) {
          projectCategories['Beachfront Club Expansion'] += e.amount;
        } else if (e.description.toLowerCase().includes('hvac') || e.description.toLowerCase().includes('energy')) {
          projectCategories['HVAC Energy Efficiency Retrofit'] += e.amount;
        } else if (e.description.toLowerCase().includes('kitchen') || e.description.toLowerCase().includes('renovation')) {
          projectCategories['Kitchen Renovation (Main)'] += e.amount;
        }
      });

    return Object.entries(projectCategories).map(([name, spent]) => {
      const budget = name === 'Beachfront Club Expansion' ? 4200000 :
                     name === 'HVAC Energy Efficiency Retrofit' ? 1800000 : 900000;
      const progress = Math.min(100, (spent / budget) * 100);
      const color = progress >= 90 ? 'bg-emerald-500' : progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500';
      return { name, budget, progress, color };
    });
  }, [expenseRequests, currentSystemDate]);

  return (
    <div className="space-y-6 font-sans">
      <div className="p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
            <Building size={120} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Proprietary Assets</span>
               <h3 className="text-3xl font-black tracking-tight leading-none">GRAND HOTEL Portfolio</h3>
               <p className="text-sm text-slate-400 font-medium max-w-sm">Strategic multi-asset ownership view with real-time equity tracking and risk oversight.</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/10 px-6 py-4 rounded-3xl border border-white/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Equity</span>
                  <span className="text-2xl font-black">${(equityData[equityData.length - 1]?.value || 58.2).toFixed(1)}M</span>
               </div>
               <div className="bg-emerald-500 px-6 py-4 rounded-3xl text-slate-950">
                  <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest block mb-1">Annual Yield</span>
                  <span className="text-2xl font-black">{metrics[0]?.value || '18.4%'}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${m.color} mb-4`}>
               <m.icon size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{m.label}</span>
            <div className="flex items-baseline justify-between">
               <span className="text-xl font-black text-slate-900 dark:text-white capitalize">{m.value}</span>
               <span className="text-[9px] font-black text-emerald-500">+2.4%</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Portfolio Equity Growth ($M)</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Institutional Valuation History</p>
               </div>
               <div className="flex items-center gap-2">
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Download Prospectus</button>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                     <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                     <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                     <Tooltip />
                     <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="#6366f1" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 font-sans">Active Capital Projects</h3>
            <div className="space-y-6">
               {capitalProjects.map((p, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <div className="space-y-0.5">
                          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{p.name}</h4>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Commisioned: ${(p.budget / 1000000).toFixed(1)}M</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-900 dark:text-white">{p.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
                       <div className={`h-full ${p.color}`} style={{ width: `${p.progress}%` }} />
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 tracking-widest hover:bg-slate-900 hover:text-white transition group flex items-center justify-center gap-2">
               Investment Ledger
               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
