/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Wallet,
  Receipt,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function FinancialControl() {
  const { addNotification, formatAmount } = useERP();
  const [activeTab, setActiveTab] = useState<'sales' | 'cogs' | 'production' | 'waste' | 'journal-entries' | 'reconciliation'>('sales');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'sales', label: 'Restaurant Sales', icon: DollarSign },
    { id: 'cogs', label: 'COGS', icon: Calculator },
    { id: 'production', label: 'Batch Production', icon: TrendingUp },
    { id: 'waste', label: 'Waste', icon: AlertTriangle },
    { id: 'journal-entries', label: 'Journal Entries', icon: FileText },
    { id: 'reconciliation', label: 'Reconciliation', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Control</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Automatic ERP journal posting and financial reconciliation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatAmount(12500)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">COGS Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatAmount(4200)}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Gross Margin</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">66.4%</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Waste Cost</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatAmount(180)}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Restaurant Sale Journal Entry</h3>
              <div className="bg-white dark:bg-slate-800 rounded p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <p>Dr Cash / Bank / Guest Ledger</p>
                <p>Cr Food Revenue</p>
                <p>Cr Tax Payable</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Restaurant Sales module</p>
              <p className="text-xs mt-1">Automatic posting of all restaurant sales to general ledger</p>
            </div>
          </div>
        )}

        {activeTab === 'cogs' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Inventory Consumption Journal Entry</h3>
              <div className="bg-white dark:bg-slate-800 rounded p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <p>Dr Cost of Goods Sold</p>
                <p>Cr Inventory</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">COGS module</p>
              <p className="text-xs mt-1">Track cost of goods sold based on actual consumption</p>
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Batch Production Journal Entry</h3>
              <div className="bg-white dark:bg-slate-800 rounded p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <p>Dr Semi-Finished Inventory</p>
                <p>Cr Raw Material Inventory</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Batch Production module</p>
              <p className="text-xs mt-1">Track production costs and inventory transfers</p>
            </div>
          </div>
        )}

        {activeTab === 'waste' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Waste Journal Entry</h3>
              <div className="bg-white dark:bg-slate-800 rounded p-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                <p>Dr Waste Expense</p>
                <p>Cr Inventory</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waste module</p>
              <p className="text-xs mt-1">Track waste, spoilage, and breakage costs</p>
            </div>
          </div>
        )}

        {activeTab === 'journal-entries' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Journal Entries module</p>
              <p className="text-xs mt-1">View and manage all F&B journal entries posted to ERP</p>
            </div>
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Reconciliation module</p>
              <p className="text-xs mt-1">Reconcile POS sales with financial records</p>
            </div>
          </div>
        )}
      </div>

      {/* Integration Status Panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Finance Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">General Ledger</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Auto-posting enabled and synced</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Tax Module</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Tax calculations integrated</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Accounts Payable</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Supplier invoices linked</p>
          </div>
        </div>
      </div>
    </div>
  );
}
