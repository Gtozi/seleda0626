/**
 * Food & Beverage Intelligence Module
 * 
 * Analytics:
 * - Restaurant Revenue
 * - Outlet Performance
 * - Menu Engineering
 * - Food Cost
 * - Beverage Cost
 * - Waste Analysis
 * - Inventory Consumption
 * - Kitchen Efficiency
 * - Table Turnover
 */

import { useState } from 'react';
import {
  Utensils,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Download,
  Filter,
  Calendar,
  Percent,
  Clock,
  Trash2,
  ChefHat,
  Coffee
} from 'lucide-react';

interface FBMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'revenue' | 'outlet' | 'menu' | 'cost' | 'waste' | 'efficiency';
}

const FB_ANALYTICS = [
  // Restaurant Revenue
  { id: 'fb_revenue', name: 'F&B Revenue', value: 320000, target: 300000, unit: '$', trend: 7, category: 'revenue' },
  { id: 'restaurant_revenue', name: 'Restaurant Revenue', value: 220000, target: 200000, unit: '$', trend: 10, category: 'revenue' },
  { id: 'bar_revenue', name: 'Bar Revenue', value: 85000, target: 80000, unit: '$', trend: 6, category: 'revenue' },
  { id: 'room_service', name: 'Room Service Revenue', value: 15000, target: 20000, unit: '$', trend: -25, category: 'revenue' },
  
  // Outlet Performance
  { id: 'main_restaurant', name: 'Main Restaurant', value: 180000, target: 160000, unit: '$', trend: 12, category: 'outlet' },
  { id: 'lounge_bar', name: 'Lounge Bar', value: 65000, target: 60000, unit: '$', trend: 8, category: 'outlet' },
  { id: 'pool_bar', name: 'Pool Bar', value: 20000, target: 20000, unit: '$', trend: 0, category: 'outlet' },
  { id: 'cafe', name: 'Cafe', value: 55000, target: 60000, unit: '$', trend: -8, category: 'outlet' },
  
  // Menu Engineering
  { id: 'menu_items', name: 'Menu Items', value: 145, target: 150, unit: '', trend: -3, category: 'menu' },
  { id: 'star_items', name: 'Star Items', value: 25, target: 20, unit: '', trend: 25, category: 'menu' },
  { id: 'plowhorse_items', name: 'Plowhorse Items', value: 35, target: 30, unit: '', trend: 17, category: 'menu' },
  { id: 'puzzle_items', name: 'Puzzle Items', value: 15, target: 20, unit: '', trend: -25, category: 'menu' },
  
  // Food Cost
  { id: 'food_cost_percent', name: 'Food Cost %', value: 32, target: 35, unit: '%', trend: -9, category: 'cost' },
  { id: 'beverage_cost_percent', name: 'Beverage Cost %', value: 28, target: 30, unit: '%', trend: -7, category: 'cost' },
  { id: 'total_cost', name: 'Total F&B Cost', value: 102400, target: 105000, unit: '$', trend: -2, category: 'cost' },
  
  // Waste Analysis
  { id: 'food_waste', name: 'Food Waste', value: 8500, target: 10000, unit: '$', trend: -15, category: 'waste' },
  { id: 'beverage_waste', name: 'Beverage Waste', value: 3200, target: 4000, unit: '$', trend: -20, category: 'waste' },
  { id: 'waste_percent', name: 'Waste %', value: 3.2, target: 4.0, unit: '%', trend: -20, category: 'waste' },
  
  // Kitchen Efficiency
  { id: 'ticket_time', name: 'Avg Ticket Time', value: 12, target: 15, unit: 'min', trend: -20, category: 'efficiency' },
  { id: 'table_turnover', name: 'Table Turnover', value: 2.8, target: 2.5, unit: 'x', trend: 12, category: 'efficiency' },
  { id: 'seat_utilization', name: 'Seat Utilization', value: 68, target: 65, unit: '%', trend: 5, category: 'efficiency' },
];

const FB_CATEGORIES = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'outlet', label: 'Outlets', icon: BarChart3 },
  { id: 'menu', label: 'Menu', icon: Utensils },
  { id: 'cost', label: 'Cost', icon: PieChart },
  { id: 'waste', label: 'Waste', icon: Trash2 },
  { id: 'efficiency', label: 'Efficiency', icon: Activity },
];

const FoodBeverageIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? FB_ANALYTICS 
    : FB_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Food & Beverage Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Restaurant performance, menu engineering, and cost analysis
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

      {/* F&B Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Utensils className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {FB_CATEGORIES.map(cat => {
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

      {/* F&B Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : metric.unit === 'min' ? ' min' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : metric.unit === 'min' ? ' min' : ''}
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

      {/* Outlet Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Outlet Performance
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Main Restaurant', revenue: 180000, covers: 4500, avgCheck: 40, margin: 35 },
            { name: 'Lounge Bar', revenue: 65000, covers: 1800, avgCheck: 36, margin: 68 },
            { name: 'Pool Bar', revenue: 20000, covers: 800, avgCheck: 25, margin: 72 },
            { name: 'Cafe', revenue: 55000, covers: 2500, avgCheck: 22, margin: 28 },
          ].map(outlet => (
            <div key={outlet.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{outlet.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {outlet.covers.toLocaleString()} covers | Avg: ${outlet.avgCheck}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${outlet.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {outlet.margin}% margin
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Engineering */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Menu Engineering Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'Star Items', count: 25, contribution: 45, color: 'bg-emerald-500' },
            { type: 'Plowhorse Items', count: 35, contribution: 30, color: 'bg-blue-500' },
            { type: 'Puzzle Items', count: 15, contribution: 15, color: 'bg-amber-500' },
            { type: 'Dog Items', count: 10, contribution: 5, color: 'bg-rose-500' },
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.type}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.contribution}% revenue</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen Efficiency */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Kitchen Efficiency Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { metric: 'Avg Ticket Time', value: 12, target: 15, trend: '-20%', status: 'excellent' },
            { metric: 'Table Turnover', value: 2.8, target: 2.5, trend: '+12%', status: 'good' },
            { metric: 'Seat Utilization', value: 68, target: 65, trend: '+5%', status: 'good' },
          ].map((efficiency, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{efficiency.metric}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {efficiency.value}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Target: {efficiency.target}</span>
                <span className={`text-xs font-medium ${
                  efficiency.trend.includes('+') ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {efficiency.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodBeverageIntelligence;
