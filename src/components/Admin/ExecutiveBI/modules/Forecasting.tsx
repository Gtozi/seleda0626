/**
 * Forecasting Module
 * 
 * Forecast Types:
 * - Revenue Forecast
 * - Occupancy Forecast
 * - Cash Flow Forecast
 * - Payroll Forecast
 * - Purchase Forecast
 * - Utility Forecast
 * - Labor Forecast
 * - Demand Forecast
 */

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bed,
  Wallet,
  Users,
  ShoppingCart,
  Zap,
  Activity,
  Download,
  Filter,
  Calendar,
  Percent,
  LineChart,
  BarChart3
} from 'lucide-react';

interface ForecastMetric {
  id: string;
  name: string;
  forecast: number;
  actual: number;
  accuracy: number;
  unit: string;
  category: 'revenue' | 'occupancy' | 'cashflow' | 'payroll' | 'purchase' | 'utility' | 'labor' | 'demand';
}

const FORECAST_TYPES = [
  { id: 'revenue', label: 'Revenue Forecast', icon: DollarSign },
  { id: 'occupancy', label: 'Occupancy Forecast', icon: Bed },
  { id: 'cashflow', label: 'Cash Flow Forecast', icon: Wallet },
  { id: 'payroll', label: 'Payroll Forecast', icon: Users },
  { id: 'purchase', label: 'Purchase Forecast', icon: ShoppingCart },
  { id: 'utility', label: 'Utility Forecast', icon: Zap },
  { id: 'labor', label: 'Labor Forecast', icon: Activity },
  { id: 'demand', label: 'Demand Forecast', icon: LineChart },
];

const FORECAST_METRICS = [
  // Revenue Forecast
  { id: 'revenue_7d', name: 'Revenue (7d)', forecast: 285000, actual: 278000, accuracy: 97, unit: '$', category: 'revenue' },
  { id: 'revenue_30d', name: 'Revenue (30d)', forecast: 1250000, actual: 1220000, accuracy: 98, unit: '$', category: 'revenue' },
  { id: 'revenue_90d', name: 'Revenue (90d)', forecast: 3750000, actual: 3680000, accuracy: 98, unit: '$', category: 'revenue' },
  
  // Occupancy Forecast
  { id: 'occupancy_7d', name: 'Occupancy (7d)', forecast: 82, actual: 80, accuracy: 98, unit: '%', category: 'occupancy' },
  { id: 'occupancy_30d', name: 'Occupancy (30d)', forecast: 78, actual: 76, accuracy: 97, unit: '%', category: 'occupancy' },
  { id: 'occupancy_90d', name: 'Occupancy (90d)', forecast: 75, actual: 73, accuracy: 97, unit: '%', category: 'occupancy' },
  
  // Cash Flow Forecast
  { id: 'cashflow_7d', name: 'Cash Flow (7d)', forecast: 85000, actual: 82000, accuracy: 96, unit: '$', category: 'cashflow' },
  { id: 'cashflow_30d', name: 'Cash Flow (30d)', forecast: 320000, actual: 310000, accuracy: 97, unit: '$', category: 'cashflow' },
  
  // Payroll Forecast
  { id: 'payroll_7d', name: 'Payroll (7d)', forecast: 98000, actual: 95000, accuracy: 97, unit: '$', category: 'payroll' },
  { id: 'payroll_30d', name: 'Payroll (30d)', forecast: 420000, actual: 408000, accuracy: 97, unit: '$', category: 'payroll' },
  
  // Purchase Forecast
  { id: 'purchase_7d', name: 'Purchases (7d)', forecast: 65000, actual: 63000, accuracy: 97, unit: '$', category: 'purchase' },
  { id: 'purchase_30d', name: 'Purchases (30d)', forecast: 280000, actual: 272000, accuracy: 97, unit: '$', category: 'purchase' },
  
  // Utility Forecast
  { id: 'utility_7d', name: 'Utilities (7d)', forecast: 9500, actual: 9200, accuracy: 97, unit: '$', category: 'utility' },
  { id: 'utility_30d', name: 'Utilities (30d)', forecast: 38000, actual: 36800, accuracy: 97, unit: '$', category: 'utility' },
  
  // Labor Forecast
  { id: 'labor_hours_7d', name: 'Labor Hours (7d)', forecast: 5200, actual: 5050, accuracy: 97, unit: 'hrs', category: 'labor' },
  { id: 'labor_hours_30d', name: 'Labor Hours (30d)', forecast: 22000, actual: 21400, accuracy: 97, unit: 'hrs', category: 'labor' },
  
  // Demand Forecast
  { id: 'demand_7d', name: 'Demand (7d)', forecast: 82, actual: 80, accuracy: 98, unit: '%', category: 'demand' },
  { id: 'demand_30d', name: 'Demand (30d)', forecast: 85, actual: 82, accuracy: 96, unit: '%', category: 'demand' },
];

const Forecasting = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? FORECAST_METRICS 
    : FORECAST_METRICS.filter(m => m.category === selectedCategory);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (accuracy >= 90) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
    if (accuracy >= 85) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forecasting
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revenue, occupancy, and demand forecasts
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

      {/* Forecast Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <LineChart className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All Forecasts</p>
        </button>
        {FORECAST_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedCategory(type.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCategory === type.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{type.label}</p>
            </button>
          );
        })}
      </div>

      {/* Forecast Metrics */}
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
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(metric.accuracy)}`}>
                <TrendingUp className="w-4 h-4" />
                <span>{metric.accuracy}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.unit === '$' ? '$' : ''}{metric.forecast.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'hrs' ? ' hrs' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Forecast
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.actual.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'hrs' ? ' hrs' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Actual
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${metric.accuracy}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Forecast Accuracy
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Forecast Accuracy Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Excellent (95%+)', count: 12, color: 'bg-emerald-500' },
            { label: 'Good (90-94%)', count: 3, color: 'bg-blue-500' },
            { label: 'Fair (85-89%)', count: 0, color: 'bg-amber-500' },
            { label: 'Poor (<85%)', count: 0, color: 'bg-rose-500' },
          ].map((status, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${status.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{status.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{status.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">forecasts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Forecast Trend
        </h3>
        <div className="space-y-4">
          {[
            { period: 'Week 1', forecast: 285000, actual: 278000, variance: 2.5 },
            { period: 'Week 2', forecast: 295000, actual: 288000, variance: 2.4 },
            { period: 'Week 3', forecast: 310000, actual: 302000, variance: 2.6 },
            { period: 'Week 4', forecast: 360000, actual: 352000, variance: 2.3 },
          ].map((week, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{week.period}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Forecast: ${week.forecast.toLocaleString()} | Actual: ${week.actual.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {week.variance}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">variance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
