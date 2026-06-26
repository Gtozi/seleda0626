import React from 'react';
import { CreditCard, DollarSign, Download, FileSpreadsheet, CheckCircle2, AlertCircle, TrendingUp, Calculator } from 'lucide-react';

const PayrollManagement = () => {
  const payrollItems = [
    { name: 'Sarah Johnson', salary: 12500, allowances: 1200, deductions: 450, net: 13250, status: 'Processed' },
    { name: 'Robert Wilson', salary: 10800, allowances: 800, deductions: 380, net: 11220, status: 'Processed' },
    { name: 'Elena Martinez', salary: 11500, allowances: 1000, deductions: 410, net: 12090, status: 'Review' },
    { name: 'James Chen', salary: 9200, allowances: 600, deductions: 280, net: 9520, status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Net Pay', value: '$248.5k', sub: 'Projected', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Tax Liabilities', value: '$42.2k', sub: 'Q2 Reserver', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Payroll Velocity', value: '98%', sub: 'Accuracy Score', icon: TrendingUp, color: 'text-indigo-500' },
          { label: 'Next Run', value: 'Jun 28', sub: 'Schedule Active', icon: Calculator, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs text-sans">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Payroll Cycle: June 2024</h3>
           <div className="flex gap-2">
              <button className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                 <Calculator size={14} />
                 Execute Run
              </button>
              <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400">
                 <Download size={16} />
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Allowances</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payload</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {payrollItems.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">${p.salary.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-xs font-bold text-emerald-500 font-mono">+${p.allowances.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-xs font-bold text-rose-500 font-mono">-${p.deductions.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                   <span className="text-xs font-black text-indigo-600">${p.net.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      p.status === 'Processed' ? 'bg-emerald-50 text-emerald-600' : 
                      p.status === 'Review' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollManagement;
