import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, TrendingUp, BarChart3, ArrowUpRight, Calculator, PieChart as PieIcon, Target, Edit2, Check } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useERP } from '../../context/ERPContext';

const BudgetPlanning = () => {
  const { expenseRequests, currentSystemDate, salesTransactions, stats } = useERP();

  // Editable budget state
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [budgetValues, setBudgetValues] = useState<Record<string, number>>({
    'Front Office': 450000,
    'Housekeeping': 620000,
    'F&B': 850000,
    'Engineering': 320000,
    'Marketing': 180000,
  });

  const budgetData = useMemo(() => {
    const deptMap: Record<string, { budget: number; actual: number }> = {
      'Front Office': { budget: budgetValues['Front Office'], actual: 0 },
      'Housekeeping': { budget: budgetValues['Housekeeping'], actual: 0 },
      'F&B': { budget: budgetValues['F&B'], actual: 0 },
      'Engineering': { budget: budgetValues['Engineering'], actual: 0 },
      'Marketing': { budget: budgetValues['Marketing'], actual: 0 },
    };

    const currentYear = new Date(currentSystemDate).getFullYear();
    expenseRequests
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === currentYear && e.status === 'Paid';
      })
      .forEach(e => {
        const deptKey = Object.keys(deptMap).find(k => e.department.toLowerCase().includes(k.toLowerCase()));
        if (deptKey) {
          deptMap[deptKey].actual += e.amount;
        }
      });

    return Object.entries(deptMap).map(([dept, data]) => ({ dept, budget: data.budget, actual: data.actual }));
  }, [expenseRequests, currentSystemDate, budgetValues]);

  const totalBudget = budgetData.reduce((sum, d) => sum + d.budget, 0);
  const totalActual = budgetData.reduce((sum, d) => sum + d.actual, 0);
  const variance = totalActual - totalBudget;

  // Calculate CAPEX from capital expenditures
  const capex = useMemo(() => {
    const currentYear = new Date(currentSystemDate).getFullYear();
    return expenseRequests
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === currentYear &&
               e.status === 'Paid' &&
               (e.category === 'CAPEX' || e.description.toLowerCase().includes('capital') ||
                e.department.toLowerCase().includes('engineering') || e.description.toLowerCase().includes('renovation'));
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenseRequests, currentSystemDate]);

  // Calculate Operating Margin
  const operatingMargin = useMemo(() => {
    const totalRevenue = salesTransactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const totalOperatingExpenses = expenseRequests
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
    const grossOperatingProfit = totalRevenue - totalOperatingExpenses;
    return totalRevenue > 0 ? (grossOperatingProfit / totalRevenue) * 100 : 0;
  }, [salesTransactions, expenseRequests]);

  const handleBudgetChange = (dept: string, value: number) => {
    setBudgetValues(prev => ({ ...prev, [dept]: value }));
  };

  const toggleEdit = (dept: string) => {
    if (editingBudget === dept) {
      setEditingBudget(null);
    } else {
      setEditingBudget(dept);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Annual Budget', value: `$${(totalBudget / 1000000).toFixed(1)}M`, sub: 'Projected Spend', icon: Calculator, color: 'text-indigo-500' },
          { label: 'Variance (YTD)', value: `${variance >= 0 ? '+' : ''}$${(variance / 1000).toFixed(0)}k`, sub: variance < 0 ? 'Savings Path' : 'Over Budget', icon: TrendingUp, color: variance < 0 ? 'text-emerald-500' : 'text-rose-500' },
          { label: 'CAPEX Portfolio', value: `$${(capex / 1000000).toFixed(1)}M`, sub: 'Active Projects', icon: Target, color: 'text-blue-500' },
          { label: 'Operating Margin', value: `${operatingMargin.toFixed(1)}%`, sub: 'Target: 35%', icon: BarChart3, color: operatingMargin >= 35 ? 'text-emerald-500' : 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <stat.icon className={`mb-3 ${stat.color}`} size={18} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs font-sans">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Departmental Budget vs Actual</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Fiscal Year 2024 Performance</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                     <span className="text-[10px] font-bold text-slate-500">Allocated Budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-indigo-500" />
                     <span className="text-[10px] font-bold text-slate-500">Actual Expenditure</span>
                  </div>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} width={100} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                     <Bar dataKey="budget" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={12} />
                     <Bar dataKey="actual" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            {/* Editable Budget Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Budget Targets</h3>
                  <Edit2 size={14} className="text-slate-400" />
               </div>
               <div className="space-y-3">
                  {budgetData.map((dept) => (
                    <div key={dept.dept} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.dept}</span>
                       <div className="flex items-center gap-2">
                          {editingBudget === dept.dept ? (
                            <>
                              <input
                                type="number"
                                value={budgetValues[dept.dept]}
                                onChange={(e) => handleBudgetChange(dept.dept, Number(e.target.value))}
                                className="w-24 px-2 py-1 text-xs border border-indigo-300 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                              <button
                                onClick={() => toggleEdit(dept.dept)}
                                className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                              >
                                <Check size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-black text-slate-900 dark:text-white">${(dept.budget / 1000).toFixed(0)}k</span>
                              <button
                                onClick={() => toggleEdit(dept.dept)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition"
                              >
                                <Edit2 size={12} />
                              </button>
                            </>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[40px] text-white">
               <h3 className="text-sm font-black uppercase tracking-tight mb-6">Strategic Initiatives</h3>
               <div className="space-y-4">
                  {[
                    { label: 'Sustainability Audit', progress: 85 },
                    { label: 'Q3 Staff Bonus Fund', progress: 40 },
                    { label: 'IT Infrastructure Rehab', progress: 65 },
                  ].map((inv, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>{inv.label}</span>
                          <span className="opacity-80">{inv.progress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${inv.progress}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-6 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                  Review All Projects
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;
