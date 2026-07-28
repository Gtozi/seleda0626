/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  Package,
  ChefHat,
  Trash2,
  ShoppingCart,
  Cake,
  FileText,
  TrendingUp,
  Plus,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Clock
} from 'lucide-react';

export default function ReportingBusinessIntelligence() {
  const [activeTab, setActiveTab] = useState<'sales' | 'cost' | 'inventory' | 'production' | 'waste' | 'purchasing' | 'banquet' | 'executive'>('sales');

  const tabs = [
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'cost', label: 'Cost', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'production', label: 'Production', icon: ChefHat },
    { id: 'waste', label: 'Waste', icon: Trash2 },
    { id: 'purchasing', label: 'Purchasing', icon: ShoppingCart },
    { id: 'banquet', label: 'Banquet', icon: Cake },
    { id: 'executive', label: 'Executive', icon: FileText },
  ];

  const salesReports = [
    { id: 'daily-sales', name: 'Daily Sales', icon: BarChart3 },
    { id: 'monthly-sales', name: 'Monthly Sales', icon: BarChart3 },
    { id: 'revenue-outlet', name: 'Revenue by Outlet', icon: PieChart },
    { id: 'revenue-category', name: 'Revenue by Category', icon: PieChart },
    { id: 'revenue-item', name: 'Revenue by Menu Item', icon: BarChart3 },
    { id: 'revenue-meal', name: 'Revenue by Meal Period', icon: LineChart },
    { id: 'payment-analysis', name: 'Payment Method Analysis', icon: PieChart },
  ];

  const costReports = [
    { id: 'food-cost', name: 'Food Cost', icon: DollarSign },
    { id: 'beverage-cost', name: 'Beverage Cost', icon: DollarSign },
    { id: 'recipe-cost', name: 'Recipe Cost', icon: TrendingUp },
    { id: 'gross-margin', name: 'Gross Margin', icon: TrendingUp },
    { id: 'purchase-variance', name: 'Purchase Variance', icon: Activity },
    { id: 'production-variance', name: 'Production Variance', icon: Activity },
  ];

  const inventoryReports = [
    { id: 'inventory-valuation', name: 'Inventory Valuation', icon: Package },
    { id: 'stock-movement', name: 'Stock Movement', icon: Activity },
    { id: 'inventory-consumption', name: 'Inventory Consumption', icon: Package },
    { id: 'abc-analysis', name: 'ABC Analysis', icon: BarChart3 },
    { id: 'dead-stock', name: 'Dead Stock', icon: Package },
    { id: 'slow-moving', name: 'Slow Moving Items', icon: Activity },
    { id: 'expiring-items', name: 'Expiring Items', icon: Activity },
  ];

  const productionReports = [
    { id: 'batch-production', name: 'Batch Production', icon: ChefHat },
    { id: 'yield-analysis', name: 'Yield Analysis', icon: TrendingUp },
    { id: 'production-efficiency', name: 'Production Efficiency', icon: Activity },
    { id: 'sub-recipe-usage', name: 'Sub-recipe Usage', icon: ChefHat },
    { id: 'production-variance', name: 'Production Variance', icon: Activity },
  ];

  const wasteReports = [
    { id: 'waste-outlet', name: 'Waste by Outlet', icon: Trash2 },
    { id: 'waste-item', name: 'Waste by Item', icon: Trash2 },
    { id: 'waste-category', name: 'Waste by Category', icon: Trash2 },
    { id: 'waste-reason', name: 'Waste by Reason', icon: Trash2 },
    { id: 'waste-cost', name: 'Waste Cost', icon: DollarSign },
  ];

  const purchasingReports = [
    { id: 'purchase-history', name: 'Purchase History', icon: ShoppingCart },
    { id: 'open-po', name: 'Open Purchase Orders', icon: FileText },
    { id: 'supplier-performance', name: 'Supplier Performance', icon: TrendingUp },
    { id: 'price-trends', name: 'Price Trends', icon: LineChart },
    { id: 'receiving-analysis', name: 'Receiving Analysis', icon: Package },
  ];

  const banquetReports = [
    { id: 'event-revenue', name: 'Event Revenue', icon: DollarSign },
    { id: 'event-profitability', name: 'Event Profitability', icon: TrendingUp },
    { id: 'package-sales', name: 'Package Sales', icon: Cake },
    { id: 'resource-utilization', name: 'Resource Utilization', icon: Activity },
  ];

  const executiveReports = [
    { id: 'daily-flash', name: 'Daily Flash Report', icon: FileText },
    { id: 'weekly-kpi', name: 'Weekly KPI Report', icon: BarChart3 },
  ];

  const getReports = () => {
    switch (activeTab) {
      case 'sales': return salesReports;
      case 'cost': return costReports;
      case 'inventory': return inventoryReports;
      case 'production': return productionReports;
      case 'waste': return wasteReports;
      case 'purchasing': return purchasingReports;
      case 'banquet': return banquetReports;
      case 'executive': return executiveReports;
      default: return salesReports;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reporting & Business Intelligence</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Comprehensive F&B analytics and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Reports" value="42" icon={FileText} color="indigo" />
        <KPICard label="Scheduled Reports" value="8" icon={Clock} color="amber" />
        <KPICard label="Data Points" value="1.2M" icon={Activity} color="green" />
        <KPICard label="Last Updated" value="2 min ago" icon={RefreshCw} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getReports().map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Report</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{tabs.find(t => t.id === activeTab)?.label} Reports module</p>
            <p className="text-xs mt-1">View and generate {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} reports</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Custom Report</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Create custom report</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Batch Export</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Export multiple reports</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Schedule Report</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Set up automated reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function KPICard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

