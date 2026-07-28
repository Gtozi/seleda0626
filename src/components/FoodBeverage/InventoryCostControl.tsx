/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Truck,
  ArrowDownToLine,
  ClipboardCheck
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function InventoryCostControl() {
  const { formatAmount, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'cost-control'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: Truck },
    { id: 'cost-control', label: 'Cost Control', icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory & Cost Control</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Inventory management and cost control analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatAmount(45200)}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Food Cost %</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">32.5%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Stockouts</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-red-600 dark:text-red-400" />
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
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Raw Materials</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">245</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Semi-Finished</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">38</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Finished Goods</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">67</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Packaging</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">52</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Inventory module</p>
              <p className="text-xs mt-1">Manage inventory across all categories</p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Goods Receipt</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Inbound deliveries</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Internal Transfer</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Between stores</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Production</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Consumption & output</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Stock Count</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Cycle counts</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Waste</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Spoilage & expiry</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Inventory Transactions module</p>
              <p className="text-xs mt-1">Track all inventory movements and adjustments</p>
            </div>
          </div>
        )}

        {activeTab === 'cost-control' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Standard Recipe Cost</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Theoretical cost per recipe</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Actual Recipe Cost</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Real cost from consumption</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Food Cost %</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">32.5% current</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Beverage Cost %</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">28.5% current</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Contribution Margin</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Per item analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Gross Margin</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Overall profitability</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Purchase Price Variance</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Price difference tracking</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Production Variance</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Yield analysis</p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Consumption Variance</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Usage vs standard</p>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Daily Profitability</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Daily P&L tracking</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cost Control module</p>
              <p className="text-xs mt-1">Recipe costs, margins, variance analysis, and daily profitability</p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Profitability Panel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          Daily Profitability Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Revenue</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatAmount(12500)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +8.5% vs yesterday
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">COGS</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatAmount(4200)}</p>
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +2.3% vs yesterday
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Gross Margin</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">66.4%</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +1.2% vs yesterday
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Net Profit</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatAmount(8300)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +12.1% vs yesterday
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
