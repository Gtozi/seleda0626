import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ArrowRight, 
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
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reportCategories = [
    {
      title: 'Financial Statements',
      reports: [
        { id: 'tb', title: 'Trial Balance', period: 'April 2024', status: 'Finalized', format: 'PDF/XLS', lastRun: '2 days ago' },
        { id: 'bs', title: 'Balance Sheet', period: 'April 2024', status: 'Finalized', format: 'PDF/XLS', lastRun: '2 days ago' },
        { id: 'pl', title: 'Profit & Loss Statement', period: 'Q1 2024', status: 'Audit Pending', format: 'PDF', lastRun: 'Last Week' },
        { id: 'cf', title: 'Cash Flow Statement', period: 'M-TD May', status: 'Draft', format: 'Live', lastRun: 'Today, 08:30 AM' },
        { id: 'equity', title: 'Statement of Changes in Equity', period: 'Q1 2024', status: 'Draft', format: 'PDF', lastRun: 'Last Week' },
        { id: 'comprehensive', title: 'Comprehensive Income', period: 'Q1 2024', status: 'Draft', format: 'PDF', lastRun: 'Last Week' },
      ],
    },
    {
      title: 'General Ledger Reports',
      reports: [
        { id: 'gl_detail', title: 'GL Detail Report', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'gl_summary', title: 'GL Summary Report', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'je_report', title: 'Journal Entry Report', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '30 mins ago' },
        { id: 'je_register', title: 'Journal Register', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '30 mins ago' },
        { id: 'account_activity', title: 'Account Activity', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'audit_trail', title: 'Audit Trail', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '2 hours ago' },
        { id: 'coa_report', title: 'Chart of Accounts Listing', period: 'Current', status: 'Synced', format: 'PDF', lastRun: 'Today' },
      ],
    },
    {
      title: 'AR Reports',
      reports: [
        { id: 'ar', title: 'Accounts Receivable Aging', period: 'Current', status: 'Synced', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'ar_ledger', title: 'AR Ledger Report', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'customer_statement', title: 'Customer Statement', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'ar_collection', title: 'Collection Analysis', period: 'Q2 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'collection_report', title: 'Collection Report', period: 'Q2 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'ar_writeoff', title: 'Bad Debt Write-off Report', period: 'YTD 2024', status: 'Draft', format: 'PDF', lastRun: 'Last Week' },
      ],
    },
    {
      title: 'AP Reports',
      reports: [
        { id: 'ap_aging', title: 'Accounts Payable Aging', period: 'Current', status: 'Synced', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'ap_ledger', title: 'AP Ledger Report', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'vendor_statement', title: 'Vendor Statement', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'payment_schedule', title: 'Payment Schedule', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '2 hours ago' },
        { id: 'ap_payment', title: 'Payment History Report', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '2 hours ago' },
        { id: 'outstanding_bills', title: 'Outstanding Bills', period: 'Current', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'ap_vendor', title: 'Vendor Spending Analysis', period: 'Q2 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
      ],
    },
    {
      title: 'Cash & Bank Reports',
      reports: [
        { id: 'ba', title: 'Bank Audit & Recon', period: 'May 2024', status: 'In Review', format: 'Audit', lastRun: '2 hours ago' },
        { id: 'cash_book', title: 'Cash Book', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'bank_book', title: 'Bank Book', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'cash_flow', title: 'Daily Cash Flow', period: 'Today', status: 'Live', format: 'PDF', lastRun: '5 mins ago' },
        { id: 'cash_flow_forecast', title: 'Cash Flow Forecast', period: 'Q3 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'petty_cash', title: 'Petty Cash Report', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'bank_position', title: 'Bank Position Report', period: 'Current', status: 'Live', format: 'XLS', lastRun: '10 mins ago' },
      ],
    },
    {
      title: 'Budget & Cost Reports',
      reports: [
        { id: 'budget_var', title: 'Budget vs Actual Variance', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'variance_analysis', title: 'Variance Analysis', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'cost_center', title: 'Cost Center Report', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '2 hours ago' },
        { id: 'cost_center_analysis', title: 'Cost Center Analysis', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '2 hours ago' },
        { id: 'dept_pl', title: 'Department P&L', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'profit_center_analysis', title: 'Profit Center Analysis', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'forecast', title: 'Rolling Forecast Report', period: 'Q3 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'forecast_report', title: 'Forecast Report', period: 'Q3 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
      ],
    },
    {
      title: 'Asset & Tax Reports',
      reports: [
        { id: 'asset_reg', title: 'Fixed Asset Register', period: 'Current', status: 'Synced', format: 'XLS', lastRun: 'Today' },
        { id: 'asset_movement', title: 'Asset Movement', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'asset_disposal', title: 'Asset Disposal', period: 'YTD 2024', status: 'Draft', format: 'PDF', lastRun: 'Last Week' },
        { id: 'asset_dep', title: 'Depreciation Schedule', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'vat_report', title: 'VAT Return Report', period: 'June 2024', status: 'Pending', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'wht_report', title: 'Withholding Tax Report', period: 'June 2024', status: 'Pending', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'tax_summary', title: 'Tax Summary', period: 'Q2 2024', status: 'Draft', format: 'PDF', lastRun: 'Yesterday' },
        { id: 'tax_filing', title: 'Tax Filing Report', period: 'June 2024', status: 'Pending', format: 'PDF', lastRun: 'Yesterday' },
      ],
    },
    {
      title: 'Revenue Reports',
      reports: [
        { id: 'dr', title: 'Daily Revenue Summary', period: '2026-06-03', status: 'Live', format: 'PDF', lastRun: '5 mins ago' },
        { id: 'rev_dept', title: 'Revenue by Department', period: 'May 2024', status: 'Live', format: 'XLS', lastRun: '1 hour ago' },
        { id: 'rev_source', title: 'Revenue by Source', period: 'May 2024', status: 'Live', format: 'PDF', lastRun: '1 hour ago' },
        { id: 'rev_trend', title: 'Revenue Trend Analysis', period: 'H1 2024', status: 'Live', format: 'PDF', lastRun: 'Today' },
      ],
    },
  ];

  const allReports = reportCategories.flatMap(c => c.reports);

  const renderReportContent = () => {
    switch (activeReport) {
      case 'tb':
        return <TrialBalanceView onBack={() => setActiveReport(null)} />;
      case 'pl':
        return <ProfitAndLossView onBack={() => setActiveReport(null)} />;
      case 'bs':
        return <BalanceSheetView onBack={() => setActiveReport(null)} />;
      case 'cf':
        return <CashFlowView onBack={() => setActiveReport(null)} />;
      case 'equity':
        return <StatementOfChangesInEquityView onBack={() => setActiveReport(null)} />;
      case 'comprehensive':
        return <ComprehensiveIncomeView onBack={() => setActiveReport(null)} />;
      case 'je_register':
        return <JournalRegisterView onBack={() => setActiveReport(null)} />;
      case 'account_activity':
        return <AccountActivityView onBack={() => setActiveReport(null)} />;
      case 'audit_trail':
        return <AuditTrailView onBack={() => setActiveReport(null)} />;
      case 'customer_statement':
        return <CustomerStatementView onBack={() => setActiveReport(null)} />;
      case 'collection_report':
        return <CollectionReportView onBack={() => setActiveReport(null)} />;
      case 'vendor_statement':
        return <VendorStatementView onBack={() => setActiveReport(null)} />;
      case 'payment_schedule':
        return <PaymentScheduleView onBack={() => setActiveReport(null)} />;
      case 'outstanding_bills':
        return <OutstandingBillsView onBack={() => setActiveReport(null)} />;
      case 'cash_book':
        return <CashBookView onBack={() => setActiveReport(null)} />;
      case 'bank_book':
        return <BankBookView onBack={() => setActiveReport(null)} />;
      case 'cash_flow_forecast':
        return <CashFlowForecastView onBack={() => setActiveReport(null)} />;
      case 'variance_analysis':
        return <VarianceAnalysisView onBack={() => setActiveReport(null)} />;
      case 'cost_center_analysis':
        return <CostCenterAnalysisView onBack={() => setActiveReport(null)} />;
      case 'profit_center_analysis':
        return <ProfitCenterAnalysisView onBack={() => setActiveReport(null)} />;
      case 'forecast_report':
        return <ForecastReportView onBack={() => setActiveReport(null)} />;
      case 'asset_movement':
        return <AssetMovementView onBack={() => setActiveReport(null)} />;
      case 'asset_disposal':
        return <AssetDisposalView onBack={() => setActiveReport(null)} />;
      case 'tax_summary':
        return <TaxSummaryView onBack={() => setActiveReport(null)} />;
      case 'tax_filing':
        return <TaxFilingView onBack={() => setActiveReport(null)} />;
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
    <div className="space-y-8 animate-fade-in">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Reports</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Standard and custom financial reporting catalog</p>
      </div>
      {reportCategories.map((category, catIdx) => (
        <div key={catIdx}>
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{category.title}</h3>
            <button className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 transition-colors">View Archive</button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {category.reports.map((rpt, i) => (
               <div 
                key={`${catIdx}-${i}`} 
                onClick={() => setActiveReport(rpt.id)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-600 active:scale-[0.98]"
                style={{ animationDelay: `${(catIdx * 4 + i) * 40}ms` }}
               >
                  <div className="flex justify-between items-start mb-3">
                     <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <FileSpreadsheet size={18} />
                     </div>
                     <div className="flex gap-1" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"><Download size={11} /></button>
                     </div>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{rpt.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{rpt.period}</p>
                  <div className="mt-4 flex items-center justify-between">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        rpt.status === 'Finalized' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        rpt.status === 'Draft' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                        rpt.status === 'Live' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                        rpt.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                     }`}>
                        {rpt.status}
                     </span>
                     <span className="text-[8px] font-bold text-slate-400">{rpt.lastRun}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {/* report configurations & templates */}
       <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80 font-sans">Dynamic Report Builder</h4>
             <p className="text-[11px] text-indigo-100 font-medium mb-6 leading-relaxed">Customize financial layouts and export real-time ledger data for external audit.</p>
             <button className="w-full py-3 bg-white text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition group flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                Configure Custom Run
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Audited Reports Log</h3>
             <div className="space-y-4">
                {[
                  { label: 'Fiscal Close: March', category: 'Compliance', icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Q1 VAT Submission', category: 'Taxation', icon: Layers, color: 'text-indigo-500' },
                  { label: 'Inventory Valuation', category: 'Internal', icon: TrendingUp, color: 'text-blue-500' },
                ].map((auth, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer group hover:scale-[1.02]">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-700 ${auth.color}`}>
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
    </div>
  );

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 min-h-screen p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500 text-sans">
      {renderReportContent()}
    </div>
  );
};

const TrialBalanceView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Trial Balance</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">As of April 30, 2024 • Period: April 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">
          <Download size={14} /> PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">
          Sync GL
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Account Code</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Account Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Debit</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {/* Assets */}
                   <tr className="bg-indigo-50/20 dark:bg-indigo-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Assets (1000-1999)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">1000</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Cash and Equivalents</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$2,450,200.00</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">1100</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Accounts Receivable</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$185,500.00</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">1500</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Fixed Assets</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$12,850,000.00</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                   </tr>

                   {/* Liabilities */}
                   <tr className="bg-rose-50/20 dark:bg-rose-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-rose-600 uppercase tracking-widest">Liabilities (2000-2999)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">2000</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Accounts Payable</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$315,200.00</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">2100</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Long-term Debt</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$4,500,000.00</td>
                   </tr>

                   {/* Equity */}
                   <tr className="bg-emerald-50/20 dark:bg-emerald-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Equity (3000-3999)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">3000</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Owner's Equity</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$10,670,500.00</td>
                   </tr>

                   {/* Revenue */}
                   <tr className="bg-blue-50/20 dark:bg-blue-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">Revenue (4000-4999)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">4000</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Room Revenue</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$610,500.00</td>
                   </tr>

                   {/* Expenses */}
                   <tr className="bg-amber-50/20 dark:bg-amber-500/5">
                      <td colSpan={4} className="px-6 py-3 text-[10px] font-black text-amber-600 uppercase tracking-widest">Expenses (5000-5999)</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">5000</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Staff Payroll</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$182,000.00</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">5100</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Maintenance & Utilities</td>
                      <td className="px-6 py-3 text-xs font-mono text-right font-black">$45,200.00</td>
                      <td className="px-6 py-3 text-xs font-mono text-right">-</td>
                   </tr>

                   {/* Totals */}
                   <tr className="bg-slate-900 text-white font-black">
                      <td colSpan={2} className="px-6 py-4 text-xs uppercase">Total Debits</td>
                      <td className="px-6 py-4 text-sm text-right font-mono">$15,712,900.00</td>
                      <td className="px-6 py-4 text-sm text-right">-</td>
                   </tr>
                   <tr className="bg-slate-900 text-white font-black">
                      <td colSpan={2} className="px-6 py-4 text-xs uppercase">Total Credits</td>
                      <td className="px-6 py-4 text-sm text-right">-</td>
                      <td className="px-6 py-4 text-sm text-right font-mono">$15,712,900.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Status</h4>
                <p className="text-2xl font-black text-emerald-600">Balanced</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Debits = Credits</p>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg text-white space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Controller's Review</h4>
             <p className="text-xs font-medium leading-relaxed italic opacity-80">
               "Trial balance validates successfully. All accounts reconciled. Ready for financial statement generation."
             </p>
             <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px]">EW</div>
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

const ProfitAndLossView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Profit & Loss Statement</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Fiscal Quarter: Q1 2024 • Jan - Mar</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md-all hover:shadow-md">
          <Download size={14} /> PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">
          Print Report
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
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
                   <tr className="bg-slate-50/50 dark:bg-slate-700/40">
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
                   <tr className="bg-slate-50/50 dark:bg-slate-700/40 border-t-2 border-double border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Net Operating Surplus</td>
                      <td colSpan={2}></td>
                      <td className="px-6 py-4 text-lg font-black text-emerald-600 text-right">$383,300.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 text-center space-y-4">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <TrendingUp size={28} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Benchmark</h4>
                <p className="text-2xl font-black text-slate-900 dark:text-white">+14.2%</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Above Q4 2023</p>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg text-white space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Controller's Review</h4>
             <p className="text-xs font-medium leading-relaxed italic opacity-80">
               "Operating margins remain strong at 62%. Recommend increasing maintenance allocation for Q2 property facade project."
             </p>
             <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px]">EW</div>
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
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Balance Sheet</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">As of April 30, 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">
          <Download size={14} /> PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">
          Sync GL
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
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
                   <tr className="bg-slate-50/50 dark:bg-slate-700/40">
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
                   <tr className="bg-slate-50/50 dark:bg-slate-700/40 border-t-2 border-double border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight text-right underline underline-offset-4 decoration-rose-200">Total Liabilities & Equity</td>
                      <td className="px-6 py-4 text-lg font-black text-rose-600 text-right">$15,485,700.00</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquidity Ratio</h4>
                <p className="text-2xl font-black text-slate-900 dark:text-white">7.8x</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Excellent (Above 2.0x)</p>
             </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
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
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Statement of Cash Flows</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q1 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">
          <Download size={14} /> XLSX
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20">
          Live Sync
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 space-y-4">
             <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Positions</h4>
                <TrendingUp size={14} className="text-emerald-500" />
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Operating Account</span>
                   <span className="text-xs font-black text-emerald-600">$1,850,200</span>
                </div>
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Payroll Fund</span>
                   <span className="text-xs font-black text-indigo-600">$450,000</span>
                </div>
                <div className="flex justify-between items-end p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Reserve Capital</span>
                   <span className="text-xs font-black text-slate-500">$150,000</span>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
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
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Revenue Summary</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Reporting Date: June 03, 2026 • Live Sync</p>
        </div>
      </div>
      <div className="flex gap-2">
         <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
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
         <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
                  <stat.icon size={18} />
               </div>
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h4>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.sub}</p>
         </div>
       ))}
    </div>

    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
       <div className="p-4 bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Departmental Revenue Split</h4>
       </div>
       <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-slate-50/50 dark:bg-slate-700/40 font-mono">
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
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AR Ageing Detailed Report</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Accounts Receivable Dashboard • Oct 2026</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">
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
         <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${bucket.color}`} />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bucket.range}</h4>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">${bucket.amount.toLocaleString()}</p>
            <div className="mt-2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full ${bucket.color}`} style={{ width: `${(bucket.amount / 227200) * 100}%` }} />
            </div>
         </div>
       ))}
    </div>

    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
       <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-slate-50/50 dark:bg-slate-700/40 font-mono">
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
                     <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-black text-slate-500 uppercase">{client.type}</span>
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
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Audit & Reconciliation</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">System Ledger vs Bank Statements • May 2024</p>
        </div>
      </div>
      <div className="flex gap-2">
         <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">
            <RefreshCw size={14} /> Refresh Feed
         </button>
         <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">
            Finalize Reconciliation
         </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 space-y-6">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck size={16} className="text-emerald-500" /> Active Settlement Status
          </h4>
          <div className="space-y-4">
             {[
               { bank: 'Chase Operating', ledger: 1850200, statement: 1845100, diff: 5100, status: 'Adjusting' },
               { bank: 'Wells Fargo Payroll', ledger: 450000, statement: 450000, diff: 0, status: 'Matched' },
               { bank: 'AMEX Merchant Sync', ledger: 125400, statement: 122100, diff: 3300, status: 'Pending' },
             ].map((recon, i) => (
                <div key={i} className="p-5 bg-slate-50 dark:bg-slate-700/20 border border-slate-100 dark:border-slate-700 rounded-lg">
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

       <div className="bg-blue-600 p-8 rounded-lg text-white flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Anomaly Awareness</h4>
             <p className="text-2xl font-black mb-2">$8,400.00</p>
             <p className="text-xs font-medium opacity-80 leading-relaxed uppercase tracking-tight">Total Unreconciled Variance Across Portfolios</p>
          </div>
          <div className="mt-12 space-y-3 relative z-10">
             <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Latest Exception: POS Terminal #42</span>
                <p className="text-[10px] opacity-70">Batched 14:02 PM. Transaction #8821 matched but fee adjustment required ($12.50).</p>
             </div>
             <button className="w-full py-3 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/20">
                Generate Exception Report
             </button>
          </div>
          <Activity className="absolute -right-12 -bottom-12 opacity-10" size={240} />
       </div>
    </div>
  </div>
);

const StatementOfChangesInEquityView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Statement of Changes in Equity</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q1 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity Component</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Balance</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Income</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Dividends</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { comp: 'Share Capital', open: 5000000, net: 0, div: 0, close: 5000000 },
            { comp: 'Retained Earnings', open: 2500000, net: 285000, div: 100000, close: 2685000 },
            { comp: 'Other Comprehensive Income', open: 150000, net: 25000, div: 0, close: 175000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.comp}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.open.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">${r.net.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">${r.div.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.close.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ComprehensiveIncomeView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Statement of Comprehensive Income</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q1 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
          </tr>
        </thead>
        <tbody>
          {[
            { item: 'Net Income', amount: 285000 },
            { item: 'Unrealized Gains on Investments', amount: 45000 },
            { item: 'Foreign Currency Translation', amount: -12000 },
            { item: 'Total Comprehensive Income', amount: 318000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.item}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const JournalRegisterView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal Register</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal ID</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 'JV-001', date: '2024-05-01', desc: 'Monthly Revenue Posting', type: 'Automatic', amount: 145000, status: 'Posted' },
            { id: 'JV-002', date: '2024-05-05', desc: 'Vendor Payment', type: 'Manual', amount: 28500, status: 'Posted' },
            { id: 'JV-003', date: '2024-05-10', desc: 'Payroll Accrual', type: 'Recurring', amount: 85000, status: 'Posted' },
            { id: 'JV-004', date: '2024-05-15', desc: 'Depreciation Entry', type: 'Automatic', amount: 15000, status: 'Posted' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.id}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{r.type}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.amount.toLocaleString()}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AccountActivityView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Activity</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Account: 1010 - Cash on Hand • May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2024-05-01', ref: 'JV-001', desc: 'Opening Balance', debit: 150000, credit: 0, balance: 150000 },
            { date: '2024-05-05', ref: 'JV-002', desc: 'Guest Payment', debit: 8500, credit: 0, balance: 158500 },
            { date: '2024-05-10', ref: 'JV-003', desc: 'Petty Cash Withdrawal', debit: 0, credit: 2000, balance: 156500 },
            { date: '2024-05-15', ref: 'JV-004', desc: 'Deposit', debit: 12000, credit: 0, balance: 168500 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.ref}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">{r.debit > 0 ? '$' + r.debit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">{r.credit > 0 ? '$' + r.credit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AuditTrailView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Audit Trail</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
          </tr>
        </thead>
        <tbody>
          {[
            { time: '2024-05-01 09:30', user: 'John Doe', action: 'Create', entity: 'Journal Entry JV-001', details: 'Created manual journal entry' },
            { time: '2024-05-01 10:15', user: 'Sarah Smith', action: 'Post', entity: 'Journal Entry JV-001', details: 'Posted to GL' },
            { time: '2024-05-02 14:20', user: 'Mike Johnson', action: 'Approve', entity: 'Vendor Invoice INV-045', details: 'Approved for payment' },
            { time: '2024-05-03 11:45', user: 'Lisa Brown', action: 'Modify', entity: 'Account 1010', details: 'Updated account description' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.time}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.user}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{r.action}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{r.entity}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CustomerStatementView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Customer Statement</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Customer: ABC Corporation • May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Customer</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">ABC Corporation</p>
          <p className="text-xs text-slate-500">123 Business Ave, Addis Ababa</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Statement Date</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">May 31, 2024</p>
          <p className="text-xs text-slate-500">Period: May 1-31, 2024</p>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2024-05-01', ref: 'INV-001', desc: 'Opening Balance', debit: 0, credit: 0, balance: 45000 },
            { date: '2024-05-10', ref: 'INV-002', desc: 'Room Charges', debit: 8500, credit: 0, balance: 53500 },
            { date: '2024-05-15', ref: 'PAY-001', desc: 'Payment Received', debit: 0, credit: 20000, balance: 33500 },
            { date: '2024-05-20', ref: 'INV-003', desc: 'F&B Charges', debit: 3200, credit: 0, balance: 36700 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.ref}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">{r.debit > 0 ? '$' + r.debit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">{r.credit > 0 ? '$' + r.credit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CollectionReportView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Collection Report</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q2 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Due</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Collected</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Collection %</th>
          </tr>
        </thead>
        <tbody>
          {[
            { cust: 'ABC Corporation', due: 45000, collected: 35000, outstanding: 10000 },
            { cust: 'XYZ Travel', due: 28000, collected: 28000, outstanding: 0 },
            { cust: 'Global Events', due: 15000, collected: 5000, outstanding: 10000 },
            { cust: 'Tech Solutions', due: 12000, collected: 8000, outstanding: 4000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.cust}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.due.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">${r.collected.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">${r.outstanding.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">{((r.collected / r.due) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const VendorStatementView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Vendor Statement</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Vendor: ABC Supplies Ltd • May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2024-05-01', ref: 'INV-045', desc: 'Opening Balance', debit: 0, credit: 0, balance: 28000 },
            { date: '2024-05-10', ref: 'INV-046', desc: 'Supplies Invoice', debit: 0, credit: 5500, balance: 33500 },
            { date: '2024-05-15', ref: 'PAY-045', desc: 'Payment Made', debit: 10000, credit: 0, balance: 23500 },
            { date: '2024-05-20', ref: 'INV-047', desc: 'Equipment Invoice', debit: 0, credit: 8500, balance: 32000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.ref}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">{r.debit > 0 ? '$' + r.debit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">{r.credit > 0 ? '$' + r.credit.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PaymentScheduleView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Payment Schedule</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { vendor: 'ABC Supplies', invoice: 'INV-046', amount: 5500, due: '2024-05-15', status: 'Paid' },
            { vendor: 'XYZ Services', invoice: 'INV-047', amount: 8500, due: '2024-05-20', status: 'Pending' },
            { vendor: 'Tech Corp', invoice: 'INV-048', amount: 12000, due: '2024-05-25', status: 'Scheduled' },
            { vendor: 'Utility Co', invoice: 'INV-049', amount: 3200, due: '2024-05-30', status: 'Pending' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.vendor}</td>
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.invoice}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.amount.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.due}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : r.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OutstandingBillsView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Outstanding Bills</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">As of Today</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Overdue</th>
          </tr>
        </thead>
        <tbody>
          {[
            { vendor: 'XYZ Services', invoice: 'INV-047', amount: 8500, due: '2024-05-20', overdue: 10 },
            { vendor: 'Utility Co', invoice: 'INV-049', amount: 3200, due: '2024-05-30', overdue: 0 },
            { vendor: 'Tech Corp', invoice: 'INV-050', amount: 15000, due: '2024-05-25', overdue: 5 },
            { vendor: 'Food Supply', invoice: 'INV-051', amount: 6800, due: '2024-06-02', overdue: -2 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.vendor}</td>
              <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{r.invoice}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.amount.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.due}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${r.overdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{r.overdue > 0 ? r.overdue + ' days' : 'Current'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CashBookView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Cash Book</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipts</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Payments</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2024-05-01', desc: 'Opening Balance', receipts: 25000, payments: 0, balance: 25000 },
            { date: '2024-05-05', desc: 'Guest Payments', receipts: 8500, payments: 0, balance: 33500 },
            { date: '2024-05-10', desc: 'Petty Cash Withdrawal', receipts: 0, payments: 2000, balance: 31500 },
            { date: '2024-05-15', desc: 'POS Deposit', receipts: 12000, payments: 0, balance: 43500 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">{r.receipts > 0 ? '$' + r.receipts.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">{r.payments > 0 ? '$' + r.payments.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BankBookView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Book</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Account: CBE Operating • May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposits</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawals</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2024-05-01', desc: 'Opening Balance', deposits: 150000, withdrawals: 0, balance: 150000 },
            { date: '2024-05-05', desc: 'Guest Deposit', deposits: 25000, withdrawals: 0, balance: 175000 },
            { date: '2024-05-10', desc: 'Vendor Payment', deposits: 0, withdrawals: 15000, balance: 160000 },
            { date: '2024-05-15', desc: 'Revenue Deposit', deposits: 45000, withdrawals: 0, balance: 205000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.desc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">{r.deposits > 0 ? '$' + r.deposits.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">{r.withdrawals > 0 ? '$' + r.withdrawals.toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CashFlowForecastView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Cash Flow Forecast</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q3 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflows</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Outflows</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Net</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing</th>
          </tr>
        </thead>
        <tbody>
          {[
            { month: 'July', open: 205000, in: 85000, out: 65000, net: 20000, close: 225000 },
            { month: 'August', open: 225000, in: 90000, out: 70000, net: 20000, close: 245000 },
            { month: 'September', open: 245000, in: 95000, out: 75000, net: 20000, close: 265000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.month}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.open.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">${r.in.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-rose-600">${r.out.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.net.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.close.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const VarianceAnalysisView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Variance Analysis</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Variance</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">%</th>
          </tr>
        </thead>
        <tbody>
          {[
            { account: 'Room Revenue', budget: 450000, actual: 485000, variance: 35000 },
            { account: 'F&B Revenue', budget: 120000, actual: 115000, variance: -5000 },
            { account: 'Payroll', budget: 180000, actual: 175000, variance: 5000 },
            { account: 'Utilities', budget: 25000, actual: 28000, variance: -3000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.account}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.budget.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.actual.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black ${r.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${r.variance.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">{((r.variance / r.budget) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CostCenterAnalysisView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Cost Center Analysis</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Center</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Variance</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</th>
          </tr>
        </thead>
        <tbody>
          {[
            { cc: 'Front Office', budget: 85000, actual: 82000, variance: -3000 },
            { cc: 'Housekeeping', budget: 65000, actual: 68000, variance: 3000 },
            { cc: 'F&B', budget: 120000, actual: 115000, variance: -5000 },
            { cc: 'Engineering', budget: 45000, actual: 47000, variance: 2000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.cc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.budget.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.actual.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black ${r.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${r.variance.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">{((r.actual / r.budget) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ProfitCenterAnalysisView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Profit Center Analysis</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit Center</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin</th>
          </tr>
        </thead>
        <tbody>
          {[
            { pc: 'Rooms', revenue: 485000, expenses: 120000, profit: 365000 },
            { pc: 'F&B', revenue: 115000, expenses: 85000, profit: 30000 },
            { pc: 'Events', revenue: 45000, expenses: 35000, profit: 10000 },
            { pc: 'Spa', revenue: 28000, expenses: 22000, profit: 6000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.pc}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.revenue.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.expenses.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-emerald-600">${r.profit.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">{((r.profit / r.revenue) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ForecastReportView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Forecast Report</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q3 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Forecast Revenue</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Forecast Expenses</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Forecast Profit</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {[
            { month: 'July', rev: 520000, exp: 320000, profit: 200000, conf: 'High' },
            { month: 'August', rev: 550000, exp: 340000, profit: 210000, conf: 'High' },
            { month: 'September', rev: 580000, exp: 360000, profit: 220000, conf: 'Medium' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.month}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.rev.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.exp.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-emerald-600">${r.profit.toLocaleString()}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${r.conf === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{r.conf}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AssetMovementView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Asset Movement</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: May 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">From</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">To</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
          </tr>
        </thead>
        <tbody>
          {[
            { asset: 'Laptop-001', from: 'Front Office', to: 'Administration', date: '2024-05-10', reason: 'Staff Transfer' },
            { asset: 'Printer-003', from: 'Housekeeping', to: 'Front Office', date: '2024-05-15', reason: 'Equipment Upgrade' },
            { asset: 'Desk-012', from: 'F&B', to: 'Events', date: '2024-05-20', reason: 'Event Support' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.asset}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{r.from}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{r.to}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AssetDisposalView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Asset Disposal</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: YTD 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Value</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
          </tr>
        </thead>
        <tbody>
          {[
            { asset: 'Server-005', bookValue: 15000, salePrice: 2000, date: '2024-03-15', reason: 'Obsolete' },
            { asset: 'Vehicle-002', bookValue: 45000, salePrice: 35000, date: '2024-04-20', reason: 'Replacement' },
            { asset: 'Furniture-015', bookValue: 5000, salePrice: 1000, date: '2024-05-10', reason: 'Damaged' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.asset}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.bookValue.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.salePrice.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TaxSummaryView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tax Summary</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: Q2 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Type</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxable Amount</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Amount</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {[
            { type: 'VAT', taxable: 850000, tax: 127500, paid: 100000, outstanding: 27500 },
            { type: 'Withholding Tax', taxable: 250000, tax: 15000, paid: 15000, outstanding: 0 },
            { type: 'Tourism Levy', taxable: 450000, tax: 22500, paid: 22500, outstanding: 0 },
            { type: 'PAYE', taxable: 180000, tax: 27000, paid: 20000, outstanding: 7000 },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.type}</td>
              <td className="px-4 py-3 text-right text-xs font-mono">${r.taxable.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.tax.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-emerald-600">${r.paid.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-rose-600">${r.outstanding.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TaxFilingView = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <ArrowRight className="rotate-180" size={18} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tax Filing Report</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Period: June 2024</p>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Type</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Filing Period</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Amount</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { type: 'VAT', period: 'June 2024', amount: 127500, due: '2024-07-20', status: 'Pending' },
            { type: 'Withholding Tax', period: 'June 2024', amount: 15000, due: '2024-07-10', status: 'Filed' },
            { type: 'Tourism Levy', period: 'June 2024', amount: 22500, due: '2024-07-15', status: 'Filed' },
            { type: 'PAYE', period: 'June 2024', amount: 27000, due: '2024-07-07', status: 'Filed' },
          ].map((r, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
              <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.type}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.period}</td>
              <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${r.amount.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.due}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${r.status === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default FinancialReports;
