/**
 * Inventory Intelligence Module
 * 
 * Analytics:
 * - Stock Value
 * - Inventory Turnover
 * - Dead Stock
 * - Slow Moving Items
 * - Fast Moving Items
 * - Stock Variance
 * - Inventory Accuracy
 */

import { useState } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Calendar,
  Percent,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface InventoryMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'value' | 'turnover' | 'deadstock' | 'slowmoving' | 'fastmoving' | 'variance' | 'accuracy';
}

const INVENTORY_ANALYTICS = [
  // Stock Value
  { id: 'total_stock_value', name: 'Total Stock Value', value: 185000, target: 180000, unit: '$', trend: 3, category: 'value' },
  { id: 'food_inventory', name: 'Food Inventory', value: 85000, target: 80000, unit: '$', trend: 6, category: 'value' },
  { id: 'beverage_inventory', name: 'Beverage Inventory', value: 45000, target: 45000, unit: '$', trend: 0, category: 'value' },
  { id: 'supplies_inventory', name: 'Supplies Inventory', value: 55000, target: 55000, unit: '$', trend: 0, category: 'value' },
  
  // Inventory Turnover
  { id: 'turnover_rate', name: 'Inventory Turnover', value: 8.5, target: 8.0, unit: 'x', trend: 6, category: 'turnover' },
  { id: 'days_inventory', name: 'Days of Inventory', value: 43, target: 45, unit: 'days', trend: -4, category: 'turnover' },
  { id: 'turnover_food', name: 'Food Turnover', value: 12, target: 10, unit: 'x', trend: 20, category: 'turnover' },
  { id: 'turnover_beverage', name: 'Beverage Turnover', value: 6, target: 5, unit: 'x', trend: 20, category: 'turnover' },
  
  // Dead Stock
  { id: 'dead_stock_value', name: 'Dead Stock Value', value: 8500, target: 10000, unit: '$', trend: -15, category: 'deadstock' },
  { id: 'dead_stock_percent', name: 'Dead Stock %', value: 4.6, target: 5.0, unit: '%', trend: -8, category: 'deadstock' },
  { id: 'dead_stock_items', name: 'Dead Stock Items', value: 125, target: 150, unit: '', trend: -17, category: 'deadstock' },
  
  // Slow Moving Items
  { id: 'slow_moving_value', name: 'Slow Moving Value', value: 22000, target: 25000, unit: '$', trend: -12, category: 'slowmoving' },
  { id: 'slow_moving_percent', name: 'Slow Moving %', value: 12, target: 15, unit: '%', trend: -20, category: 'slowmoving' },
  { id: 'slow_moving_items', name: 'Slow Moving Items', value: 280, target: 300, unit: '', trend: -7, category: 'slowmoving' },
  
  // Fast Moving Items
  { id: 'fast_moving_value', name: 'Fast Moving Value', value: 145000, target: 130000, unit: '$', trend: 12, category: 'fastmoving' },
  { id: 'fast_moving_percent', name: 'Fast Moving %', value: 78, target: 75, unit: '%', trend: 4, category: 'fastmoving' },
  { id: 'fast_moving_items', name: 'Fast Moving Items', value: 450, target: 400, unit: '', trend: 12, category: 'fastmoving' },
  
  // Stock Variance
  { id: 'stock_variance', name: 'Stock Variance', value: 2.5, target: 3.0, unit: '%', trend: -17, category: 'variance' },
  { id: 'variance_value', name: 'Variance Value', value: 4625, target: 5400, unit: '$', trend: -14, category: 'variance' },
  { id: 'variance_items', name: 'Variance Items', value: 45, target: 60, unit: '', trend: -25, category: 'variance' },
  
  // Inventory Accuracy
  { id: 'inventory_accuracy', name: 'Inventory Accuracy', value: 97.5, target: 95, unit: '%', trend: 3, category: 'accuracy' },
  { id: 'cycle_count_accuracy', name: 'Cycle Count Accuracy', value: 98, target: 95, unit: '%', trend: 3, category: 'accuracy' },
  { id: 'audit_accuracy', name: 'Audit Accuracy', value: 96, target: 95, unit: '%', trend: 1, category: 'accuracy' },
];

const INVENTORY_CATEGORIES = [
  { id: 'value', label: 'Stock Value', icon: DollarSign },
  { id: 'turnover', label: 'Turnover', icon: RefreshCw },
  { id: 'deadstock', label: 'Dead Stock', icon: AlertTriangle },
  { id: 'slowmoving', label: 'Slow Moving', icon: Activity },
  { id: 'fastmoving', label: 'Fast Moving', icon: BarChart3 },
  { id: 'variance', label: 'Variance', icon: TrendingDown },
  { id: 'accuracy', label: 'Accuracy', icon: CheckCircle2 },
];

const InventoryIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? INVENTORY_ANALYTICS 
    : INVENTORY_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Inventory Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stock value, turnover, and inventory accuracy analytics
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

      {/* Inventory Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Package className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {INVENTORY_CATEGORIES.map(cat => {
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

      {/* Inventory Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : metric.unit === 'days' ? ' days' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : metric.unit === 'days' ? ' days' : ''}
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

      {/* Inventory Movement Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inventory Movement Analysis
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: 'Fast Moving', value: 145000, percentage: 78, color: 'bg-emerald-500' },
            { type: 'Slow Moving', value: 22000, percentage: 12, color: 'bg-amber-500' },
            { type: 'Dead Stock', value: 8500, percentage: 4.6, color: 'bg-rose-500' },
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.type}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${item.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stock by Category
        </h3>
        <div className="space-y-4">
          {[
            { category: 'Food & Beverage', value: 130000, turnover: 9, color: 'bg-indigo-500' },
            { category: 'Guest Supplies', value: 35000, turnover: 6, color: 'bg-blue-500' },
            { category: 'Operational Supplies', value: 20000, turnover: 8, color: 'bg-emerald-500' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.category}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Turnover: {item.turnover}x
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${item.value.toLocaleString()}
                </p>
                <div className={`w-3 h-3 rounded-full ${item.color} ml-auto mt-1`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryIntelligence;
