import React, { useState } from 'react';
import { Building2, ArrowRightLeft, FileText, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const IntercompanyAccounting = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Mock data for intercompany transactions
  const intercompanyInvoices = [
    {
      id: 'IC-2024-001',
      fromEntity: 'Gheralta Hotel',
      toEntity: 'Gheralta Resort',
      date: '2024-01-15',
      type: 'Service Charge',
      amount: 15000,
      status: 'Posted',
      glRef: 'GL-2024-0145'
    },
    {
      id: 'IC-2024-002',
      fromEntity: 'Gheralta Resort',
      toEntity: 'Gheralta Hotel',
      date: '2024-01-20',
      type: 'Staff Allocation',
      amount: 8500,
      status: 'Pending',
      glRef: '-'
    },
    {
      id: 'IC-2024-003',
      fromEntity: 'Gheralta Hotel',
      toEntity: 'Corporate Office',
      date: '2024-01-25',
      type: 'Management Fee',
      amount: 25000,
      status: 'Approved',
      glRef: '-'
    }
  ];

  const dueToFrom = [
    {
      id: 'DTF-001',
      entity: 'Gheralta Resort',
      type: 'Due To',
      amount: 15000,
      aging: '0-30'
    },
    {
      id: 'DTF-002',
      entity: 'Corporate Office',
      type: 'Due From',
      amount: 25000,
      aging: '0-30'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Intercompany Accounting</h1>
          <p className="text-sm text-slate-500 mt-1">Manage intercompany transactions, due to/from accounts, and elimination entries</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center gap-2">
          <FileText size={14} /> Create Intercompany Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transactions</span>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{intercompanyInvoices.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due To Balance</span>
          </div>
          <span className="text-2xl font-black text-emerald-600">$15,000</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-rose-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due From Balance</span>
          </div>
          <span className="text-2xl font-black text-rose-600">$25,000</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft size={16} className="text-amber-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Position</span>
          </div>
          <span className="text-2xl font-black text-amber-600">$10,000</span>
        </div>
      </div>

      {/* Intercompany Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Intercompany Invoices</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">From Entity</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">To Entity</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">GL Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {intercompanyInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                <td className="px-4 py-3 text-xs font-bold text-indigo-600">{invoice.id}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{invoice.fromEntity}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{invoice.toEntity}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{invoice.type}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{invoice.date}</td>
                <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white text-right">${invoice.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    invoice.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' :
                    invoice.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">{invoice.glRef}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Due To / Due From Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Due To / Due From Accounts</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aging</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {dueToFrom.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{item.entity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    item.type === 'Due To' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white text-right">${item.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{item.aging}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Elimination Entries Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Elimination Entries</h3>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2">
            <FileText size={12} /> Create Entry
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry ID</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity 1</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity 2</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { id: 'EL-2024-001', period: 'Q1 2024', account: 'Intercompany Revenue', entity1: 'Gheralta Hotel', entity2: 'Gheralta Resort', amount: 15000, status: 'Posted' },
              { id: 'EL-2024-002', period: 'Q1 2024', account: 'Intercompany Expenses', entity1: 'Gheralta Resort', entity2: 'Gheralta Hotel', amount: 8500, status: 'Posted' },
              { id: 'EL-2024-003', period: 'Q2 2024', account: 'Management Fee', entity1: 'Gheralta Hotel', entity2: 'Corporate Office', amount: 25000, status: 'Pending' },
            ].map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-indigo-600">{entry.id}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{entry.period}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{entry.account}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{entry.entity1}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{entry.entity2}</td>
                <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white text-right">${entry.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    entry.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedInvoice.id}</h3>
              <p className="text-sm text-slate-500 mt-1">Intercompany Transaction Details</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">From Entity</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedInvoice.fromEntity}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">To Entity</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedInvoice.toEntity}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Transaction Type</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedInvoice.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedInvoice.date}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Amount</span>
                  <span className="text-2xl font-black text-indigo-600">${selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                    selectedInvoice.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' :
                    selectedInvoice.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">GL Reference</span>
                <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{selectedInvoice.glRef}</span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest transition">
                Close
              </button>
              {selectedInvoice.status === 'Pending' && (
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition">
                  Approve
                </button>
              )}
              {selectedInvoice.status === 'Approved' && (
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition">
                  Post to GL
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntercompanyAccounting;
