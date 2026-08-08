/**
 * Benchmarking Module
 * 
 * Compare against:
 * - Previous Period
 * - Previous Year
 * - Budget
 * - Forecast
 * - Hotel Group
 * - Region
 * - Brand
 * - Market Segment
 * - Industry Benchmark
 */

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Building2,
  Globe,
  Award,
  Download,
  Filter,
  Percent,
  ArrowRight,
  GitCompare
} from 'lucide-react';

interface BenchmarkMetric {
  id: string;
  name: string;
  value: number;
  comparison: number;
  unit: string;
  variance: number;
  category: 'revenue' | 'occupancy' | 'adr' | 'revpar' | 'cost' | 'satisfaction' | 'productivity';
}

const BENCHMARK_COMPARISONS = [
  { id: 'previous_period', label: 'Previous Period', icon: Calendar },
  { id: 'previous_year', label: 'Previous Year', icon: Calendar },
  { id: 'budget', label: 'Budget', icon: Target },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'hotel_group', label: 'Hotel Group', icon: Building2 },
  { id: 'region', label: 'Region', icon: Globe },
  { id: 'brand', label: 'Brand', icon: Award },
  { id: 'market_segment', label: 'Market Segment', icon: BarChart3 },
  { id: 'industry', label: 'Industry Benchmark', icon: GitCompare },
];

const BENCHMARK_METRICS = [
  // Revenue
  { id: 'total_revenue', name: 'Total Revenue', value: 1250000, comparison: 1200000, unit: '$', variance: 4, category: 'revenue' },
  { id: 'rooms_revenue', name: 'Rooms Revenue', value: 850000, comparison: 800000, unit: '$', variance: 6, category: 'revenue' },
  { id: 'fb_revenue', name: 'F&B Revenue', value: 320000, comparison: 300000, unit: '$', variance: 7, category: 'revenue' },
  
  // Occupancy
  { id: 'occupancy', name: 'Occupancy Rate', value: 78, comparison: 75, unit: '%', variance: 4, category: 'occupancy' },
  { id: 'adr', name: 'ADR', value: 145, comparison: 140, unit: '$', variance: 4, category: 'adr' },
  { id: 'revpar', name: 'RevPAR', value: 113, comparison: 105, unit: '$', variance: 8, category: 'revpar' },
  
  // Cost
  { id: 'labor_cost', name: 'Labor Cost %', value: 34, comparison: 35, unit: '%', variance: -3, category: 'cost' },
  { id: 'food_cost', name: 'Food Cost %', value: 32, comparison: 35, unit: '%', variance: -9, category: 'cost' },
  { id: 'energy_cost', name: 'Energy Cost', value: 28000, comparison: 30000, unit: '$', variance: -7, category: 'cost' },
  
  // Satisfaction
  { id: 'guest_satisfaction', name: 'Guest Satisfaction', value: 4.2, comparison: 4.0, unit: '/5', variance: 5, category: 'satisfaction' },
  { id: 'nps', name: 'NPS', value: 72, comparison: 70, unit: '', variance: 3, category: 'satisfaction' },
  
  // Productivity
  { id: 'revenue_per_employee', name: 'Revenue per Employee', value: 6757, comparison: 6500, unit: '$', variance: 4, category: 'productivity' },
  { id: 'rooms_per_staff', name: 'Rooms per Staff', value: 6.5, comparison: 6.0, unit: '', variance: 8, category: 'productivity' },
];

const Benchmarking = () => {
  const [selectedComparison, setSelectedComparison] = useState<string>('budget');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (variance < 0) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
  };

  const comparisonLabel = BENCHMARK_COMPARISONS.find(c => c.id === selectedComparison)?.label || 'Budget';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Benchmarking
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Performance comparison against {comparisonLabel}
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

      {/* Comparison Options */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {BENCHMARK_COMPARISONS.map(comp => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedComparison(comp.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedComparison === comp.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{comp.label}</p>
            </button>
          );
        })}
      </div>

      {/* Benchmark Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BENCHMARK_METRICS.map(metric => (
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
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getVarianceColor(metric.variance)}`}>
                {metric.variance >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{metric.variance >= 0 ? '+' : ''}{metric.variance}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.comparison.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {comparisonLabel}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metric.value >= metric.comparison ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.comparison) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Summary vs {comparisonLabel}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Outperforming', count: 8, color: 'bg-emerald-500' },
            { label: 'On Target', count: 3, color: 'bg-blue-500' },
            { label: 'Underperforming', count: 1, color: 'bg-amber-500' },
            { label: 'Critical', count: 0, color: 'bg-rose-500' },
          ].map((status, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${status.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{status.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{status.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">metrics</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Industry Benchmark Comparison
        </h3>
        <div className="space-y-4">
          {[
            { metric: 'RevPAR', hotel: 113, industry: 105, percentile: 75 },
            { metric: 'Occupancy', hotel: 78, industry: 72, percentile: 68 },
            { metric: 'ADR', hotel: 145, industry: 138, percentile: 72 },
            { metric: 'Guest Satisfaction', hotel: 4.2, industry: 4.0, percentile: 65 },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.metric}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hotel: {item.hotel} | Industry: {item.industry}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {item.percentile}th
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">percentile</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benchmarking;
