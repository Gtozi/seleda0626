import React, { useState } from 'react';
import { Building2, Globe, DollarSign, FileText, BarChart3, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const FinancialConsolidation = () => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Mock data for consolidated entities
  const entities = [
    {
      id: 'ENT-001',
      name: 'Gheralta Hotel',
      type: 'Hotel',
      currency: 'ETB',
      revenue: 15000000,
      expenses: 12000000,
      profit: 3000000,
      status: 'Included'
    },
    {
      id: 'ENT-002',
      name: 'Gheralta Resort',
      type: 'Resort',
      currency: 'ETB',
      revenue: 8500000,
      expenses: 7000000,
      profit: 1500000,
      status: 'Included'
    },
    {
      id: 'ENT-003',
      name: 'Corporate Office',
      type: 'Corporate',
      currency: 'ETB',
      revenue: 2000000,
      expenses: 3500000,
      profit: -1500000,
      status: 'Included'
    }
  ];

  const consolidationSummary = {
    totalRevenue: 25500000,
    totalExpenses: 22500000,
    totalProfit: 3000000,
    eliminationEntries: 500000,
    consolidatedRevenue: 25000000,
    consolidatedExpenses: 22000000,
    consolidatedProfit: 3000000
  };

  const currencyTranslations = [
    {
      id: 'FX-001',
      fromCurrency: 'USD',
      toCurrency: 'ETB',
      rate: 57.5,
      date: '2024-01-31'
    },
    {
      id: 'FX-002',
      fromCurrency: 'EUR',
      toCurrency: 'ETB',
      rate: 62.3,
      date: '2024-01-31'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Consolidation</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-property and multi-company financial consolidation with currency translation</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center gap-2">
          <BarChart3 size={14} /> Run Consolidation
        </button>
      </div>

      {/* Consolidation Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <span className="text-2xl font-black text-emerald-600">${(consolidationSummary.totalRevenue / 1000000).toFixed(1)}M</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-rose-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</span>
          </div>
          <span className="text-2xl font-black text-rose-600">${(consolidationSummary.totalExpenses / 1000000).toFixed(1)}M</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consolidated Profit</span>
          </div>
          <span className="text-2xl font-black text-indigo-600">${(consolidationSummary.consolidatedProfit / 1000000).toFixed(1)}M</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-amber-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eliminations</span>
          </div>
          <span className="text-2xl font-black text-amber-600">${(consolidationSummary.eliminationEntries / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      {/* Entities Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Consolidated Entities</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Expenses</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Profit</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entities.map((entity) => (
              <tr key={entity.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedEntity(entity)}>
                <td className="px-4 py-3 text-xs font-bold text-indigo-600">{entity.name}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{entity.type}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">{entity.currency}</td>
                <td className="px-4 py-3 text-xs font-black text-emerald-600 text-right">${(entity.revenue / 1000000).toFixed(2)}M</td>
                <td className="px-4 py-3 text-xs font-black text-rose-600 text-right">${(entity.expenses / 1000000).toFixed(2)}M</td>
                <td className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white text-right">${(entity.profit / 1000000).toFixed(2)}M</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    entity.status === 'Included' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {entity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Currency Translation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Currency Translation Rates</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">From Currency</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">To Currency</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Exchange Rate</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currencyTranslations.map((fx) => (
              <tr key={fx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{fx.fromCurrency}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{fx.toCurrency}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-900 dark:text-white text-right">{fx.rate.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{fx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group Financial Statements */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Group Financial Statements</h3>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2">
            <FileText size={12} /> Generate Statements
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Consolidated Income Statement */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Consolidated Income Statement</h4>
              <p className="text-[10px] text-slate-500">Period: Q1 2024</p>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { label: 'Total Revenue', amount: 25000000, isTotal: false },
                  { label: 'Cost of Goods Sold', amount: -15000000, isTotal: false },
                  { label: 'Gross Profit', amount: 10000000, isTotal: true },
                  { label: 'Operating Expenses', amount: -7000000, isTotal: false },
                  { label: 'Operating Income', amount: 3000000, isTotal: true },
                  { label: 'Other Income/Expenses', amount: 0, isTotal: false },
                  { label: 'Net Income', amount: 3000000, isTotal: true },
                ].map((item, i) => (
                  <tr key={i} className={item.isTotal ? 'bg-slate-50 dark:bg-slate-950/20 font-black' : ''}>
                    <td className="px-4 py-2 text-xs text-slate-900 dark:text-white">{item.label}</td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-900 dark:text-white">${(item.amount / 1000000).toFixed(2)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Consolidated Balance Sheet */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-950/20 p-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Consolidated Balance Sheet</h4>
              <p className="text-[10px] text-slate-500">As of March 31, 2024</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Assets</p>
                {[
                  { label: 'Current Assets', amount: 15000000 },
                  { label: 'Non-Current Assets', amount: 35000000 },
                  { label: 'Total Assets', amount: 50000000, isTotal: true },
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between py-1 ${item.isTotal ? 'font-black border-t border-slate-200 dark:border-slate-800 pt-2' : ''}`}>
                    <span className="text-xs text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-xs font-mono text-slate-900 dark:text-white">${(item.amount / 1000000).toFixed(2)}M</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Liabilities & Equity</p>
                {[
                  { label: 'Current Liabilities', amount: 12000000 },
                  { label: 'Non-Current Liabilities', amount: 15000000 },
                  { label: 'Total Liabilities', amount: 27000000, isTotal: true },
                  { label: 'Equity', amount: 23000000, isTotal: true },
                  { label: 'Total Liabilities & Equity', amount: 50000000, isTotal: true },
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between py-1 ${item.isTotal ? 'font-black border-t border-slate-200 dark:border-slate-800 pt-2' : ''}`}>
                    <span className="text-xs text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-xs font-mono text-slate-900 dark:text-white">${(item.amount / 1000000).toFixed(2)}M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEntity(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedEntity.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Entity Financial Details</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Entity Type</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedEntity.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Base Currency</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-white">{selectedEntity.currency}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Revenue</span>
                  <span className="text-xl font-black text-emerald-600">${(selectedEntity.revenue / 1000000).toFixed(2)}M</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Expenses</span>
                  <span className="text-xl font-black text-rose-600">${(selectedEntity.expenses / 1000000).toFixed(2)}M</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Profit</span>
                  <span className={`text-xl font-black ${selectedEntity.profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>${(selectedEntity.profit / 1000000).toFixed(2)}M</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Consolidation Status</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                  selectedEntity.status === 'Included' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedEntity.status}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setSelectedEntity(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest transition">
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition">
                View Detailed Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialConsolidation;
