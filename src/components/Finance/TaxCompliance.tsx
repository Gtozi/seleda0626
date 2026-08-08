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
  const [activeTab, setActiveTab] = useState<'vat' | 'withholding' | 'tot' | 'excise' | 'paye' | 'pension' | 'customs' | 'local' | 'audit' | 'sales_tax'>('vat');

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
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Value Added Tax</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">VAT returns, collections, and remittances</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'VAT Collected (YTD)', value: '$174,150', sub: '10% rate', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'VAT Paid (YTD)', value: '$34,500', sub: 'Input tax', icon: ArrowDownRight, color: 'text-amber-500' },
          { label: 'Net VAT Payable', value: '$139,650', sub: 'Due to ERCA', icon: Send, color: 'text-indigo-500' },
          { label: 'Next Filing', value: 'Jul 20, 2024', sub: '12 days left', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
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
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderWithholding = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Withholding Tax</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vendor payment withholding and remittance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Withheld (YTD)', value: '$43,500', sub: 'From vendors', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Pending Filing', value: '$15,200', sub: 'June 2024', icon: Clock, color: 'text-amber-500' },
          { label: 'Vendors Covered', value: '21', sub: 'Active contracts', icon: FileText, color: 'text-indigo-500' },
          { label: 'Avg Rate', value: '2.0%', sub: 'Withholding', icon: BarChart3, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
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
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderTOT = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Turnover Tax</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Quarterly turnover tax returns and payments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Turnover (YTD)', value: '$3,562,000', sub: 'Q1 + Q2', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'TOT Payable (YTD)', value: '$71,240', sub: '2% rate', icon: Send, color: 'text-indigo-500' },
          { label: 'Pending Filing', value: '$36,830', sub: 'Q2 2024', icon: Clock, color: 'text-amber-500' },
          { label: 'Next Filing', value: 'Jul 31, 2024', sub: '23 days left', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
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
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderExcise = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-lg shadow-sm text-center">
        <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Excise Tax Module</h3>
        <p className="text-xs text-slate-500 font-medium mb-6">This module is currently not applicable to your business operations.</p>
        <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase">
          Configure Module
        </button>
      </div>
    </div>
  );

  const payeReturns = [
    { id: 'PAYE-2024-06', period: 'June 2024', status: 'Filed', filingDate: '2024-07-10', employees: 145, grossSalary: 285000, payeDeducted: 28500, pensionDeducted: 22800 },
    { id: 'PAYE-2024-05', period: 'May 2024', status: 'Filed', filingDate: '2024-06-10', employees: 142, grossSalary: 278000, payeDeducted: 27800, pensionDeducted: 22240 },
    { id: 'PAYE-2024-04', period: 'April 2024', status: 'Filed', filingDate: '2024-05-10', employees: 140, grossSalary: 272000, payeDeducted: 27200, pensionDeducted: 21760 },
  ];

  const renderPAYE = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Pay As You Earn</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Employee income tax deduction and remittance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'PAYE Deducted (YTD)', value: '$83,500', sub: 'From employees', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Employees', value: '145', sub: 'Active payroll', icon: FileText, color: 'text-indigo-500' },
          { label: 'Gross Salary (YTD)', value: '$835,000', sub: 'Total payroll', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Next Filing', value: 'Jul 10, 2024', sub: 'Monthly', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">PAYE Returns History</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'id', label: 'Return ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</span> },
          { key: 'employees', label: 'Employees', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-500">{item.employees}</span> },
          { key: 'grossSalary', label: 'Gross Salary', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.grossSalary.toLocaleString()}</span> },
          { key: 'payeDeducted', label: 'PAYE Deducted', align: 'right', render: (item: any) => <span className="text-xs font-mono font-black text-indigo-600">${item.payeDeducted.toLocaleString()}</span> },
          { key: 'filingDate', label: 'Filing Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.filingDate}</span> },
          {
            key: 'status', label: 'Status', align: 'center',
            render: (item: any) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
              </div>
            ),
          },
        ] as Column<any>[]}
        data={payeReturns}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search PAYE returns..."
        filterKeys={['id', 'period', 'status']}
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderPension = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Pension Contributions</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Employee and employer pension remittance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pension Deducted (YTD)', value: '$66,800', sub: 'Employee 8%', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Employer Contribution', value: '$66,800', sub: 'Employer 11%', icon: BarChart3, color: 'text-indigo-500' },
          { label: 'Total Remitted', value: '$133,600', sub: 'To Pension Fund', icon: Send, color: 'text-blue-500' },
          { label: 'Next Remittance', value: 'Jul 10, 2024', sub: 'Monthly', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Pension Remittance Schedule</h3>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee 8%</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Employer 11%</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { period: 'June 2024', employee: 22800, employer: 31350, status: 'Pending' },
              { period: 'May 2024', employee: 22240, employer: 30580, status: 'Remitted' },
              { period: 'April 2024', employee: 21760, employer: 29920, status: 'Remitted' },
            ].map((p, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{p.period}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">${p.employee.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">${p.employer.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${(p.employee + p.employer).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.status === 'Remitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustoms = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Customs Duty</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Import declarations and duty payments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Customs Duty Paid (YTD)', value: '$42,300', sub: 'Import duties', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Import Declarations', value: '18', sub: 'This year', icon: FileText, color: 'text-indigo-500' },
          { label: 'Avg Duty Rate', value: '12.5%', sub: 'Blended rate', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Pending Clearance', value: '2', sub: 'In transit', icon: Clock, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Customs Declarations</h3>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Declaration</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">CIF Value</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Rate</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Paid</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { decl: 'CD-2024-018', item: 'Kitchen Equipment Import', cif: 45000, rate: '15%', duty: 6750, date: '2024-06-01', status: 'Cleared' },
              { decl: 'CD-2024-017', item: 'IT Equipment Import', cif: 28000, rate: '10%', duty: 2800, date: '2024-05-20', status: 'Cleared' },
              { decl: 'CD-2024-016', item: 'Furniture Import', cif: 35000, rate: '12%', duty: 4200, date: '2024-05-10', status: 'Cleared' },
              { decl: 'CD-2024-019', item: 'HVAC System Import', cif: 52000, rate: '15%', duty: 7800, date: '2024-06-05', status: 'Pending' },
            ].map((c, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{c.decl}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{c.item}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">${c.cif.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">{c.rate}</td>
                <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${c.duty.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${c.status === 'Cleared' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLocal = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Local Taxes</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Municipal and subcity tax payments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Municipal Tax (YTD)', value: '$12,450', sub: 'City of Addis', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Service Tax (YTD)', value: '$8,200', sub: 'Local services', icon: FileText, color: 'text-indigo-500' },
          { label: 'Property Tax (YTD)', value: '$5,600', sub: 'Annual levy', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Next Payment', value: 'Jul 15, 2024', sub: 'Municipal', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Local Tax Payments</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Payment
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'Payment ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'taxType', label: 'Tax Type', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.taxType}</span> },
          { key: 'jurisdiction', label: 'Jurisdiction', render: (item: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.jurisdiction}</span> },
          { key: 'amount', label: 'Amount', align: 'right', render: (item: any) => <span className="text-xs font-mono font-black text-indigo-600">${item.amount.toLocaleString()}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.period}</span> },
          { key: 'dueDate', label: 'Due Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.dueDate}</span> },
          {
            key: 'status', label: 'Status', align: 'center',
            render: (item: any) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
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
        data={[
          { id: 'LOC-2024-006', taxType: 'Municipal Tax', jurisdiction: 'City of Addis Ababa', amount: 4150, period: 'June 2024', dueDate: '2024-07-15', status: 'Pending' },
          { id: 'LOC-2024-005', taxType: 'Service Tax', jurisdiction: 'Bole Subcity', amount: 2750, period: 'June 2024', dueDate: '2024-07-15', status: 'Pending' },
          { id: 'LOC-2024-004', taxType: 'Municipal Tax', jurisdiction: 'City of Addis Ababa', amount: 4150, period: 'May 2024', dueDate: '2024-06-15', status: 'Paid' },
          { id: 'LOC-2024-003', taxType: 'Property Tax', jurisdiction: 'Kirkos Subcity', amount: 5600, period: 'Q2 2024', dueDate: '2024-06-30', status: 'Paid' },
          { id: 'LOC-2024-002', taxType: 'Service Tax', jurisdiction: 'Bole Subcity', amount: 2650, period: 'May 2024', dueDate: '2024-06-15', status: 'Paid' },
        ]}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search local tax payments..."
        filterKeys={['id', 'taxType', 'jurisdiction', 'status']}
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Tax Audit Support</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Audit findings and compliance tracking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Last Audit', value: 'Mar 2024', sub: 'Completed', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Next Audit', value: 'Sep 2024', sub: 'Scheduled', icon: Calendar, color: 'text-amber-500' },
          { label: 'Open Findings', value: '3', count: 'Resolved', icon: AlertCircle, color: 'text-rose-500' },
          { label: 'Compliance Score', value: '94%', sub: 'Excellent', icon: CheckCircle2, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Audit Findings</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'Finding ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'category', label: 'Category', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.category}</span> },
          { key: 'description', label: 'Description', render: (item: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.description}</span> },
          { key: 'riskLevel', label: 'Risk Level', align: 'center', render: (item: any) => (
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
              item.riskLevel === 'High' ? 'bg-rose-50 text-rose-600' :
              item.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>{item.riskLevel}</span>
          ) },
          { key: 'status', label: 'Status', align: 'center', render: (item: any) => (
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
              item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
              item.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'
            }`}>{item.status}</span>
          ) },
          { key: 'dueDate', label: 'Due Date', render: (item: any) => <span className="text-xs font-bold text-slate-500">{item.dueDate}</span> },
          {
            key: 'actions', label: 'Actions', align: 'center', sortable: false,
            render: (item: any) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Download size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition"><CheckCircle2 size={14} /></button>
              </div>
            ),
          },
        ] as Column<any>[]}
        data={[
          { id: 'AUD-2024-001', category: 'VAT Compliance', description: 'Missing supporting documents for Q1 2024', riskLevel: 'Medium', status: 'Resolved', dueDate: '2024-04-30' },
          { id: 'AUD-2024-002', category: 'Withholding Tax', description: 'Vendor TIN verification incomplete', riskLevel: 'High', status: 'In Progress', dueDate: '2024-07-15' },
          { id: 'AUD-2024-003', category: 'PAYE Reporting', description: 'Minor discrepancy in employee deductions', riskLevel: 'Low', status: 'Resolved', dueDate: '2024-05-15' },
          { id: 'AUD-2024-004', category: 'TOT Filing', description: 'Turnover calculation review needed', riskLevel: 'Medium', status: 'Open', dueDate: '2024-07-31' },
        ]}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search audit findings..."
        filterKeys={['id', 'category', 'description', 'status']}
        containerClassName="rounded-lg"
      />
    </div>
  );

  const renderSalesTax = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sales Tax</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sales tax collection and remittance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Sales Tax Collected (YTD)', value: '$28,500', sub: '5% rate', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Taxable Sales (YTD)', value: '$570,000', sub: 'Subject to tax', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Tax Remitted', value: '$24,200', sub: 'To authorities', icon: Send, color: 'text-indigo-500' },
          { label: 'Next Filing', value: 'Jul 15, 2024', sub: 'Monthly', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sales Tax Returns</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition">
            <FileSpreadsheet size={14} /> Generate Return
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'Return ID', render: (item: any) => <span className="text-[10px] font-mono text-slate-500">{item.id}</span> },
          { key: 'period', label: 'Period', render: (item: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</span> },
          { key: 'taxableSales', label: 'Taxable Sales', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-900 dark:text-white">${item.taxableSales.toLocaleString()}</span> },
          { key: 'taxCollected', label: 'Tax Collected', align: 'right', render: (item: any) => <span className="text-xs font-mono text-emerald-600">${item.taxCollected.toLocaleString()}</span> },
          { key: 'taxRate', label: 'Tax Rate', align: 'right', render: (item: any) => <span className="text-xs font-mono text-slate-500">{item.taxRate}%</span> },
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
        data={[
          { id: 'ST-2024-06', period: 'June 2024', status: 'Pending', dueDate: '2024-07-15', taxableSales: 95000, taxCollected: 4750, taxRate: 5 },
          { id: 'ST-2024-05', period: 'May 2024', status: 'Filed', filingDate: '2024-06-15', dueDate: '2024-06-15', taxableSales: 92000, taxCollected: 4600, taxRate: 5 },
          { id: 'ST-2024-04', period: 'April 2024', status: 'Filed', filingDate: '2024-05-15', dueDate: '2024-05-15', taxableSales: 88000, taxCollected: 4400, taxRate: 5 },
          { id: 'ST-2024-03', period: 'March 2024', status: 'Filed', filingDate: '2024-04-15', dueDate: '2024-04-15', taxableSales: 95000, taxCollected: 4750, taxRate: 5 },
        ]}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search sales tax returns..."
        filterKeys={['id', 'period', 'status']}
        containerClassName="rounded-lg"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('vat')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'vat' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            VAT
          </button>
          <button 
            onClick={() => setActiveTab('withholding')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'withholding' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Withholding
          </button>
          <button 
            onClick={() => setActiveTab('tot')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'tot' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            TOT
          </button>
          <button 
            onClick={() => setActiveTab('excise')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'excise' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Excise
          </button>
          <button 
            onClick={() => setActiveTab('paye')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'paye' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            PAYE
          </button>
          <button 
            onClick={() => setActiveTab('pension')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'pension' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Pension
          </button>
          <button 
            onClick={() => setActiveTab('customs')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'customs' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Customs Duty
          </button>
          <button 
            onClick={() => setActiveTab('local')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'local' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Local Taxes
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Tax Audit
          </button>
          <button 
            onClick={() => setActiveTab('sales_tax')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeTab === 'sales_tax' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Sales Tax
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Upload size={16} />
            Import
          </button>
          <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {activeTab === 'vat' && renderVAT()}
      {activeTab === 'withholding' && renderWithholding()}
      {activeTab === 'tot' && renderTOT()}
      {activeTab === 'excise' && renderExcise()}
      {activeTab === 'paye' && renderPAYE()}
      {activeTab === 'pension' && renderPension()}
      {activeTab === 'customs' && renderCustoms()}
      {activeTab === 'local' && renderLocal()}
      {activeTab === 'audit' && renderAudit()}
      {activeTab === 'sales_tax' && renderSalesTax()}
    </div>
  );
};

export default TaxCompliance;
