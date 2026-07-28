import React, { useState } from 'react';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Send,
  BarChart3,
  ArrowDownRight
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';

const TaxCompliance = () => {
  const [activeTab, setActiveTab] = useState<'vat' | 'withholding' | 'tot' | 'excise'>('vat');

  const vatReturns = [
    { id: 'VAT-2024-06', period: 'June 2024', status: 'Filed', filingDate: '2024-07-15', dueDate: '2024-07-20', taxableSales: 610500, vatCollected: 61050, vatPaid: 12500, netVat: 48550 },
    { id: 'VAT-2024-05', period: 'May 2024', status: 'Filed', filingDate: '2024-06-18', dueDate: '2024-06-20', taxableSales: 585200, vatCollected: 58520, vatPaid: 11200, netVat: 47320 },
    { id: 'VAT-2024-04', period: 'April 2024', status: 'Filed', filingDate: '2024-05-17', dueDate: '2024-05-20', taxableSales: 545800, vatCollected: 54580, vatPaid: 10800, netVat: 43780 },
  ];

  const withholdingTax = [
    { id: 'WHT-2024-06', period: 'June 2024', status: 'Pending', dueDate: '2024-07-20', totalWithheld: 15200, vendors: 8 },
    { id: 'WHT-2024-05', period: 'May 2024', status: 'Filed', filingDate: '2024-06-18', dueDate: '2024-06-20', totalWithheld: 14800, vendors: 7 },
    { id: 'WHT-2024-04', period: 'April 2024', status: 'Filed', filingDate: '2024-05-17', dueDate: '2024-05-20', totalWithheld: 13500, vendors: 6 },
  ];

  const totReturns = [
    { id: 'TOT-2024-Q2', period: 'Q2 2024', status: 'Pending', dueDate: '2024-07-31', grossTurnover: 1841500, totPayable: 36830 },
    { id: 'TOT-2024-Q1', period: 'Q1 2024', status: 'Filed', filingDate: '2024-04-28', dueDate: '2024-04-30', grossTurnover: 1720500, totPayable: 34410 },
  ];

  const renderVAT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'VAT Collected (YTD)', value: '$174,150', sub: '10% rate', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'VAT Paid (YTD)', value: '$34,500', sub: 'Input tax', icon: ArrowDownRight, color: 'text-amber-500' },
          { label: 'Net VAT Payable', value: '$139,650', sub: 'Due to ERCA', icon: Send, color: 'text-indigo-500' },
          { label: 'Next Filing', value: 'Jul 20, 2024', sub: '12 days left', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">VAT Returns History</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'id', label: 'Return ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</span> },
          { key: 'taxableSales', label: 'Taxable Sales', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.taxableSales.toLocaleString()}</span> },
          { key: 'vatCollected', label: 'VAT Collected', align: 'right', render: (item: any) => <span className="text-xs font-mono text-emerald-600">${item.vatCollected.toLocaleString()}</span> },
          { key: 'vatPaid', label: 'VAT Paid', align: 'right', render: (item: any) => <span className="text-xs font-mono text-amber-600">${item.vatPaid.toLocaleString()}</span> },
          { key: 'netVat', label: 'Net VAT', align: 'right', render: (item: any) => <span className="text-xs font-mono font-black text-indigo-600">${item.netVat.toLocaleString()}</span> },
          { key: 'dueDate', label: 'Due Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.dueDate}</span> },
          {
            key: 'status', label: 'Status', align: 'center',
            render: (item: any) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
              </div>
            ),
          },
          {
            key: 'actions', label: 'Actions', align: 'center', sortable: false,
            render: (item: any) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Download size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Printer size={14} /></button>
              </div>
            ),
          },
        ] as Column<any>[]}
        data={vatReturns}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search VAT returns..."
        filterKeys={['id', 'period', 'status']}
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderWithholding = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Withheld (YTD)', value: '$43,500', sub: 'From vendors', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Pending Filing', value: '$15,200', sub: 'June 2024', icon: Clock, color: 'text-amber-500' },
          { label: 'Vendors Covered', value: '21', sub: 'Active contracts', icon: FileText, color: 'text-indigo-500' },
          { label: 'Avg Rate', value: '2.0%', sub: 'Withholding', icon: BarChart3, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Withholding Tax Returns</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'id', label: 'Return ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</span> },
          { key: 'totalWithheld', label: 'Total Withheld', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.totalWithheld.toLocaleString()}</span> },
          { key: 'vendors', label: 'Vendors', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-500">{item.vendors}</span> },
          { key: 'dueDate', label: 'Due Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.dueDate}</span> },
          {
            key: 'status', label: 'Status', align: 'center',
            render: (item: any) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
              </div>
            ),
          },
          {
            key: 'actions', label: 'Actions', align: 'center', sortable: false,
            render: (item: any) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Download size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Printer size={14} /></button>
              </div>
            ),
          },
        ] as Column<any>[]}
        data={withholdingTax}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search withholding returns..."
        filterKeys={['id', 'period', 'status']}
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderTOT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Turnover (YTD)', value: '$3,562,000', sub: 'Q1 + Q2', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'TOT Payable (YTD)', value: '$71,240', sub: '2% rate', icon: Send, color: 'text-indigo-500' },
          { label: 'Pending Filing', value: '$36,830', sub: 'Q2 2024', icon: Clock, color: 'text-amber-500' },
          { label: 'Next Filing', value: 'Jul 31, 2024', sub: '23 days left', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Turnover Tax (TOT) Returns</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'id', label: 'Return ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</span> },
          { key: 'grossTurnover', label: 'Gross Turnover', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.grossTurnover.toLocaleString()}</span> },
          { key: 'totPayable', label: 'TOT Payable', align: 'right', render: (item: any) => <span className="text-xs font-mono font-black text-indigo-600">${item.totPayable.toLocaleString()}</span> },
          { key: 'dueDate', label: 'Due Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.dueDate}</span> },
          {
            key: 'status', label: 'Status', align: 'center',
            render: (item: any) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
              </div>
            ),
          },
          {
            key: 'actions', label: 'Actions', align: 'center', sortable: false,
            render: (item: any) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Download size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Printer size={14} /></button>
              </div>
            ),
          },
        ] as Column<any>[]}
        data={totReturns}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search TOT returns..."
        filterKeys={['id', 'period', 'status']}
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderExcise = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-3xl shadow-3xs text-center">
        <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Excise Tax Module</h3>
        <p className="text-xs text-slate-500 font-medium mb-6">This module is currently not applicable to your business operations.</p>
        <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase">
          Configure Module
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('vat')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'vat' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            VAT
          </button>
          <button 
            onClick={() => setActiveTab('withholding')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'withholding' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Withholding
          </button>
          <button 
            onClick={() => setActiveTab('tot')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'tot' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            TOT
          </button>
          <button 
            onClick={() => setActiveTab('excise')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'excise' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Excise
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Upload size={16} />
            Import
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {activeTab === 'vat' && renderVAT()}
      {activeTab === 'withholding' && renderWithholding()}
      {activeTab === 'tot' && renderTOT()}
      {activeTab === 'excise' && renderExcise()}
    </div>
  );
};

export default TaxCompliance;
