import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ArrowRight, 
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Activity,
  Home,
  RefreshCw
} from 'lucide-react';

const FinancialReports = () => {
  const [activeReport, setActiveReport] = React.useState<string | null>(null);

  const reports = [
    { id: 'bs', title: 'Balance Sheet', period: 'April 2024', status: 'Finalized', format: 'PDF/XLS', lastRun: '2 days ago' },
    { id: 'pl', title: 'Profit & Loss Statement', period: 'Q1 2024', status: 'Audit Pending', format: 'PDF', lastRun: 'Last Week' },
    { id: 'cf', title: 'Cash Flow Analysis', period: 'M-TD May', status: 'Draft', format: 'Live', lastRun: 'Today, 08:30 AM' },
    { id: 'dr', title: 'Daily Revenue Summary', period: '2026-06-03', status: 'Live', format: 'PDF', lastRun: '5 mins ago' },
    { id: 'ar', title: 'Accounts Receivable Aging', period: 'Current', status: 'Synced', format: 'XLS', lastRun: '1 hour ago' },
    { id: 'ba', title: 'Bank Audit & Recon', period: 'May 2024', status: 'In Review', format: 'Audit', lastRun: '2 hours ago' },
  ];

  const renderReportContent = () => {
    switch (activeReport) {
      case 'pl':
        return <ProfitAndLossView onBack={() => setActiveReport(null)} />;
      case 'bs':
        return <BalanceSheetView onBack={() => setActiveReport(null)} />;
      case 'cf':
        return <CashFlowView onBack={() => setActiveReport(null)} />;
      case 'dr':
        return <DailyRevenueSummaryView onBack={() => setActiveReport(null)} />;
      case 'ar':
        return <ARAgeingView onBack={() => setActiveReport(null)} />;
      case 'ba':
        return <BankAuditView onBack={() => setActiveReport(null)} />;
      default:
        return renderReportList();
    }
  };

  const renderReportList = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
       {/* Strategic Statements */}
       <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Standard Financial Statements</h3>
             <button className="text-[10px] font-black text-indigo-600 uppercase">View Archive</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
             {reports.map((rpt, i) => (
               <div 
                key={i} 
                onClick={() => setActiveReport(rpt.id)}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-600 transition-all hover:shadow-lg active:scale-[0.98]"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <FileSpreadsheet size={20} />
                     </div>
                     <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"><Download size={12} /></button>
                     </div>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{rpt.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{rpt.period}</p>
                  <div className="mt-8 flex items-center justify-between">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        rpt.status === 'Finalized' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        rpt.status === 'Draft' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                     }`}>
                        {rpt.status}
                     </span>
                     <span className="text-[9px] font-bold text-slate-400">Run: {rpt.lastRun}</span>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* report configurations & templates */}
       <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[40px] text-white">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80 font-sans">Dynamic Report Builder</h4>
             <p className="text-[11px] text-indigo-100 font-medium mb-6 leading-relaxed">Customize financial layouts and export real-time ledger data for external audit.</p>
             <button className="w-full py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition group flex items-center justify-center gap-2">
                Configure Custom Run
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Audited Reports Log</h3>
             <div className="space-y-4">
                {[
                  { label: 'Fiscal Close: March', category: 'Compliance', icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Q1 VAT Submission', category: 'Taxation', icon: Layers, color: 'text-indigo-500' },
                  { label: 'Inventory Valuation', category: 'Internal', icon: TrendingUp, color: 'text-blue-500' },
                ].map((auth, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950 ${auth.color}`}>
                           <auth.icon size={16} />
                        </div>
                        <div>
                           <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{auth.label}</h5>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{auth.category}</span>
                        </div>
                     </div>
                     <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-6 text-sans">
      {renderReportContent()}
    </div>
  );
};

const ProfitAndLossView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Profit & Loss Statement</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Fiscal Quarter: Q1 2024 • Jan - Mar</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <Download size={14} /> PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20">
          Print Report
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/2">Account Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Debit</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {/* Revenue Section */}
                   <tr className="bg-indigo-50/20 dark:bg-indigo-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Operating Revenue</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">Room Revenue - Deluxe Wing</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">$425,000.00</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$425,000.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">Room Revenue - Penthouse</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">$185,500.00</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$185,500.00</td>
                   </tr>
                   <tr className="bg-slate-50/50 dark:bg-slate-950/40">
                      <td className="px-6 py-3 text-[10px] font-black text-slate-900 dark:text-white uppercase">Gross Operating Income</td>
                      <td colSpan={2}></td>
                      <td className="px-6 py-3 text-sm font-black text-indigo-600 text-right underline decoration-indigo-600/30">$610,500.00</td>
                   </tr>

                   {/* Expenses Section */}
                   <tr className="bg-rose-50/20 dark:bg-rose-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-rose-600 uppercase tracking-widest">Operating Expenses</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">Staff Payroll & Benefits</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$182,000.00</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">($182,000.00)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">Maintenance & Utilities</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$45,200.00</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-4 text-xs font-mono text-right">($45,200.00)</td>
                   </tr>
                   <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-t-2 border-double border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Net Operating Surplus</td>
                      <td colSpan={2}></td>
                      <td className="px-6 py-4 text-lg font-black text-emerald-600 text-right">$383,300.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs text-center space-y-4">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <TrendingUp size={28} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Benchmark</h4>
                <p className="text-2xl font-black text-slate-900 dark:text-white">+14.2%</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Above Q4 2023</p>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Controller's Review</h4>
             <p className="text-xs font-medium leading-relaxed italic opacity-80">
               "Operating margins remain strong at 62%. Recommend increasing maintenance allocation for Q2 property facade project."
             </p>
             <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-[10px]">EW</div>
                <div>
                   <p className="text-[10px] font-black leading-none">Elena Wright</p>
                   <p className="text-[8px] font-bold opacity-50 uppercase mt-1">Chief Financial Officer</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
);

const BalanceSheetView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Balance Sheet</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">As of April 30, 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <Download size={14} /> PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20">
          Sync GL
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/3">Classification</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {/* Assets Section */}
                   <tr className="bg-indigo-50/20 dark:bg-indigo-500/5">
                      <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Assets</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Cash and Equivalents</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$2,450,200.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Accounts Receivable</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$185,500.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Fixed Assets (Property)</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$12,850,000.00</td>
                   </tr>
                   <tr className="bg-slate-50/50 dark:bg-slate-950/40">
                      <td className="px-6 py-3 text-[10px] font-black text-slate-900 dark:text-white uppercase pl-8 text-right underline underline-offset-4 decoration-indigo-200">Total Assets</td>
                      <td className="px-6 py-3 text-sm font-black text-indigo-600 text-right underline decoration-double">$15,485,700.00</td>
                   </tr>

                   {/* Liabilities Section */}
                   <tr className="bg-rose-50/20 dark:bg-rose-500/5">
                      <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-rose-600 uppercase tracking-widest">Liabilities & Equity</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Accounts Payable</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$315,200.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Long-term Debt</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$4,500,000.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Owner's Equity</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$10,670,500.00</td>
                   </tr>
                   <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-t-2 border-double border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight text-right underline underline-offset-4 decoration-rose-200">Total Liabilities & Equity</td>
                      <td className="px-6 py-4 text-lg font-black text-rose-600 text-right">$15,485,700.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquidity Ratio</h4>
                <p className="text-2xl font-black text-slate-900 dark:text-white">7.8x</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Excellent (Above 2.0x)</p>
             </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-3xl text-white space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Asset Management</h4>
             <p className="text-xs font-medium leading-relaxed italic opacity-80">
               "Strong asset-to-liability coverage. Equity position strengthened by Q1 retained earnings. Recommending property appreciation re-evaluation for next review."
             </p>
          </div>
       </div>
    </div>
  </div>
);

const CashFlowView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Statement of Cash Flows</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q1 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <Download size={14} /> XLSX
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20">
          Live Sync
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/3">Activity Classification</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cash Impact</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {/* Operating Activities */}
                   <tr className="bg-emerald-50/20 dark:bg-emerald-500/5">
                      <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operating Activities</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Net Income (Adjusted)</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$383,300.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Depreciation & Amortization</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$25,000.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Change in Accounts Receivable</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black text-rose-500">($42,000.00)</td>
                   </tr>
                   <tr className="bg-emerald-50/10 dark:bg-emerald-500/10">
                      <td className="px-6 py-3 text-[10px] font-black text-slate-900 dark:text-white uppercase pl-8 text-right underline underline-offset-4 decoration-emerald-200">Net Cash from Operations</td>
                      <td className="px-6 py-3 text-sm font-black text-emerald-600 text-right">$366,300.00</td>
                   </tr>

                   {/* Investing Activities */}
                   <tr className="bg-blue-50/20 dark:bg-blue-500/5">
                      <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">Investing Activities</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Capital Expenditures (CapEx)</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black text-rose-500">($125,000.00)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 pl-8">Sale of Property/Plant</td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-black">$0.00</td>
                   </tr>
                   <tr className="bg-blue-50/10 dark:bg-blue-500/10 border-t border-blue-100 dark:border-blue-900/30">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight text-right underline underline-offset-4 decoration-blue-200">Net Cash from Investing</td>
                      <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">($125,000.00)</td>
                   </tr>

                   {/* Total Cash Change */}
                   <tr className="bg-slate-900 text-white">
                      <td className="px-6 py-4 text-[12px] font-black uppercase tracking-tight">Net Change in Cash</td>
                      <td className="px-6 py-4 text-lg font-black text-right font-mono">$241,300.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs space-y-4">
             <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Positions</h4>
                <TrendingUp size={14} className="text-emerald-500" />
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Operating Account</span>
                   <span className="text-xs font-black text-emerald-600">$1,850,200</span>
                </div>
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Payroll Fund</span>
                   <span className="text-xs font-black text-indigo-600">$450,000</span>
                </div>
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Reserve Capital</span>
                   <span className="text-xs font-black text-slate-500">$150,000</span>
                </div>
             </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-3xl text-white space-y-2">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Burn Rate Analysis</h4>
             <p className="text-xl font-black">42.2 Months</p>
             <p className="text-[10px] font-bold opacity-60 uppercase">Runway with current operating reserves</p>
          </div>
       </div>
    </div>
  </div>
);

const DailyRevenueSummaryView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Revenue Summary</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Reporting Date: June 03, 2026 • Live Sync</p>
        </div>
      </div>
      <div className="flex gap-2">
         <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase">
            <RefreshCw size={12} className="animate-spin" /> Live Updates
         </span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
       {[
         { label: 'Total Revenue', value: '$84,520.00', sub: '+12% vs Budget', icon: DollarSign, color: 'text-emerald-500' },
         { label: 'Occupancy %', value: '88.4%', sub: '242/274 Rooms', icon: Home, color: 'text-indigo-500' },
         { label: 'ADR', value: '$349.25', sub: 'Avg Daily Rate', icon: TrendingUp, color: 'text-blue-500' },
         { label: 'RevPAR', value: '$308.73', sub: 'Revenue Per Available Room', icon: Activity, color: 'text-amber-500' },
       ].map((stat, i) => (
         <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950 ${stat.color}`}>
                  <stat.icon size={18} />
               </div>
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h4>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.sub}</p>
         </div>
       ))}
    </div>

    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
       <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Departmental Revenue Split</h4>
       </div>
       <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-slate-50/50 dark:bg-slate-950/40 font-mono">
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Day Actual</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MTD Actual</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Variance</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {[
               { dept: 'Rooms Revenue', day: 58400, mtd: 175200, var: 4.2 },
               { dept: 'Food & Beverage', day: 18200, mtd: 54600, var: -1.5 },
               { dept: 'Spa & Wellness', day: 5420, mtd: 16260, var: 8.4 },
               { dept: 'Ancillary / Other', day: 2500, mtd: 7500, var: 2.1 },
             ].map((row, i) => (
               <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{row.dept}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right font-black">${row.day.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right">${row.mtd.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-[10px] font-black text-right ${row.var >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {row.var >= 0 ? '+' : ''}{row.var}%
                  </td>
               </tr>
             ))}
             <tr className="bg-slate-900 text-white font-black">
                <td className="px-6 py-4 text-xs uppercase">Total Portfolio Yield</td>
                <td className="px-6 py-4 text-sm text-right">$84,520.00</td>
                <td className="px-6 py-4 text-sm text-right">$253,560.00</td>
                <td className="px-6 py-4 text-xs text-right text-emerald-400">+3.8%</td>
             </tr>
          </tbody>
       </table>
    </div>
  </div>
);

const ARAgeingView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AR Ageing Detailed Report</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Accounts Receivable Dashboard • Oct 2026</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">
          Apply Filters
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
       {[
         { range: '0-30 Days', amount: 142500, color: 'bg-emerald-500' },
         { range: '31-60 Days', amount: 52000, color: 'bg-indigo-500' },
         { range: '61-90 Days', amount: 24500, color: 'bg-blue-500' },
         { range: '90+ Days', amount: 8200, color: 'bg-amber-500' },
         { range: 'Total AR', amount: 227200, color: 'bg-slate-900 dark:bg-slate-800' },
       ].map((bucket, i) => (
         <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${bucket.color}`} />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bucket.range}</h4>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">${bucket.amount.toLocaleString()}</p>
            <div className="mt-2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full ${bucket.color}`} style={{ width: `${(bucket.amount / 227200) * 100}%` }} />
            </div>
         </div>
       ))}
    </div>

    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
       <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-slate-50/50 dark:bg-slate-950/40 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Group Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">0-30</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">31-60</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">60+</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {[
               { name: 'Apex Global Logistics', type: 'Corporate', total: 45000, r1: 30000, r2: 15000, r3: 0 },
               { name: 'Silverstone Events', type: 'Group', total: 28500, r1: 12000, r2: 10000, r3: 6500 },
               { name: 'Elite Travel Concierge', type: 'OTA', total: 12400, r1: 12400, r2: 0, r3: 0 },
               { name: 'North Star Consulting', type: 'Corporate', total: 8200, r1: 0, r2: 0, r3: 8200 },
             ].map((client, i) => (
               <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                     <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter block group-hover:text-indigo-600 transition-colors">{client.name}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Last Contact: 2 days ago</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-[9px] font-black text-slate-500 uppercase">{client.type}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white text-right font-mono">${client.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 text-right">${client.r1.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 text-right">${client.r2.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-xs font-black text-right ${client.r3 > 0 ? 'text-rose-600' : 'text-slate-200'}`}>${client.r3.toLocaleString()}</td>
               </tr>
             ))}
          </tbody>
       </table>
    </div>
  </div>
);

const BankAuditView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Audit & Reconciliation</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">System Ledger vs Bank Statements • May 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
         <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <RefreshCw size={14} /> Refresh Feed
         </button>
         <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20">
            Finalize Reconciliation
         </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs space-y-6">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck size={16} className="text-emerald-500" /> Active Settlement Status
          </h4>
          <div className="space-y-4">
             {[
               { bank: 'Chase Operating', ledger: 1850200, statement: 1845100, diff: 5100, status: 'Adjusting' },
               { bank: 'Wells Fargo Payroll', ledger: 450000, statement: 450000, diff: 0, status: 'Matched' },
               { bank: 'AMEX Merchant Sync', ledger: 125400, statement: 122100, diff: 3300, status: 'Pending' },
             ].map((recon, i) => (
                <div key={i} className="p-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{recon.bank}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        recon.status === 'Matched' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>{recon.status}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div>
                         <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Ledger</span>
                         <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${recon.ledger.toLocaleString()}</span>
                      </div>
                      <div>
                         <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Statement</span>
                         <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${recon.statement.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Variance</span>
                         <span className={`text-xs font-black font-mono ${recon.diff === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ${recon.diff.toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Anomaly Awareness</h4>
             <p className="text-2xl font-black mb-2">$8,400.00</p>
             <p className="text-xs font-medium opacity-80 leading-relaxed uppercase tracking-tight">Total Unreconciled Variance Across Portfolios</p>
          </div>
          <div className="mt-12 space-y-3 relative z-10">
             <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Latest Exception: POS Terminal #42</span>
                <p className="text-[10px] opacity-70">Batched 14:02 PM. Transaction #8821 matched but fee adjustment required ($12.50).</p>
             </div>
             <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/20">
                Generate Exception Report
             </button>
          </div>
          <Activity className="absolute -right-12 -bottom-12 opacity-10" size={240} />
       </div>
    </div>
  </div>
);

export default FinancialReports;
