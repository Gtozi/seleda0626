/**
 * Procurement Intelligence Module
 * 
 * Analytics:
 * - Purchase Spend
 * - Vendor Scorecards
 * - Lead Time
 * - Contract Compliance
 * - Savings Analysis
 * - Purchase Trends
 */

import { useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  FileText,
  Award,
  Download,
  Filter,
  Calendar,
  Percent,
  Package,
  Building2,
  Clock
} from 'lucide-react';

interface ProcurementMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'spend' | 'vendor' | 'leadtime' | 'contract' | 'savings' | 'trends';
}

const PROCUREMENT_ANALYTICS = [
  // Purchase Spend
  { id: 'total_spend', name: 'Total Purchase Spend', value: 280000, target: 300000, unit: '$', trend: -7, category: 'spend' },
  { id: 'food_spend', name: 'Food Spend', value: 120000, target: 125000, unit: '$', trend: -4, category: 'spend' },
  { id: 'beverage_spend', name: 'Beverage Spend', value: 45000, target: 50000, unit: '$', trend: -10, category: 'spend' },
  { id: 'supplies_spend', name: 'Supplies Spend', value: 65000, target: 70000, unit: '$', trend: -7, category: 'spend' },
  { id: 'capital_spend', name: 'Capital Spend', value: 50000, target: 55000, unit: '$', trend: -9, category: 'spend' },
  
  // Vendor Scorecards
  { id: 'vendor_count', name: 'Active Vendors', value: 85, target: 80, unit: '', trend: 6, category: 'vendor' },
  { id: 'avg_vendor_score', name: 'Avg Vendor Score', value: 4.2, target: 4.0, unit: '/5', trend: 5, category: 'vendor' },
  { id: 'top_performers', name: 'Top Performers', value: 25, target: 20, unit: '%', trend: 25, category: 'vendor' },
  { id: 'at_risk_vendors', name: 'At-Risk Vendors', value: 5, target: 10, unit: '', trend: -50, category: 'vendor' },
  
  // Lead Time
  { id: 'avg_lead_time', name: 'Avg Lead Time', value: 4.5, target: 5, unit: 'days', trend: -10, category: 'leadtime' },
  { id: 'on_time_delivery', name: 'On-Time Delivery', value: 92, target: 90, unit: '%', trend: 2, category: 'leadtime' },
  { id: 'emergency_orders', name: 'Emergency Orders', value: 8, target: 10, unit: '%', trend: -20, category: 'leadtime' },
  
  // Contract Compliance
  { id: 'contract_coverage', name: 'Contract Coverage', value: 78, target: 75, unit: '%', trend: 4, category: 'contract' },
  { id: 'contract_compliance', name: 'Contract Compliance', value: 95, target: 90, unit: '%', trend: 6, category: 'contract' },
  { id: 'expiring_contracts', name: 'Expiring Contracts', value: 6, target: 8, unit: '', trend: -25, category: 'contract' },
  
  // Savings Analysis
  { id: 'total_savings', name: 'Total Savings', value: 35000, target: 30000, unit: '$', trend: 17, category: 'savings' },
  { id: 'savings_percent', name: 'Savings %', value: 12, target: 10, unit: '%', trend: 20, category: 'savings' },
  { id: 'cost_avoidance', name: 'Cost Avoidance', value: 18000, target: 15000, unit: '$', trend: 20, category: 'savings' },
  
  // Purchase Trends
  { id: 'purchase_frequency', name: 'Purchase Frequency', value: 450, target: 400, unit: '/month', trend: 12, category: 'trends' },
  { id: 'avg_order_value', name: 'Avg Order Value', value: 622, target: 600, unit: '$', trend: 4, category: 'trends' },
  { id: 'seasonal_variance', name: 'Seasonal Variance', value: 25, target: 30, unit: '%', trend: -17, category: 'trends' },
];

const PROCUREMENT_CATEGORIES = [
  { id: 'spend', label: 'Spend', icon: DollarSign },
  { id: 'vendor', label: 'Vendors', icon: Building2 },
  { id: 'leadtime', label: 'Lead Time', icon: Clock },
  { id: 'contract', label: 'Contracts', icon: FileText },
  { id: 'savings', label: 'Savings', icon: Award },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
];

const ProcurementIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? PROCUREMENT_ANALYTICS 
    : PROCUREMENT_ANALYTICS.filter(m => m.category === selectedCategory);

  const getStatusColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (trend < 0) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Procurement Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Purchase spend, vendor performance, and savings analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Procurement Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {PROCUREMENT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white text-center">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Procurement Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map(metric => (
          <div
            key={metric.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {metric.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {metric.unit === '$' ? 'USD' : metric.unit}
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.trend)}`}>
                {metric.trend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{metric.trend >= 0 ? '+' : ''}{metric.trend}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'days' ? ' days' : metric.unit === '/month' ? '/month' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'days' ? ' days' : metric.unit === '/month' ? '/month' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metric.value >= metric.target ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spend by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spend by Category
        </h3>
        <div className="space-y-4">
          {[
            { category: 'Food & Beverage', spend: 165000, percentage: 59, color: 'bg-indigo-500' },
            { category: 'Supplies', spend: 65000, percentage: 23, color: 'bg-blue-500' },
            { category: 'Capital Equipment', spend: 50000, percentage: 18, color: 'bg-emerald-500' },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">${item.spend.toLocaleString()}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Vendor Performance
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Fresh Foods Co', spend: 45000, score: 4.8, onTime: 98 },
            { name: 'Beverage Dist Inc', spend: 28000, score: 4.5, onTime: 95 },
            { name: 'Hotel Supplies Ltd', spend: 22000, score: 4.3, onTime: 92 },
            { name: 'Linens & More', spend: 18000, score: 4.7, onTime: 97 },
          ].map((vendor, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{vendor.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Spend: ${vendor.spend.toLocaleString()} | On-Time: {vendor.onTime}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{vendor.score}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcurementIntelligence;
