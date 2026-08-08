/**
 * Engineering Intelligence Module
 * 
 * Analytics:
 * - Asset Performance
 * - Equipment Downtime
 * - Maintenance Cost
 * - Work Order Backlog
 * - Preventive Maintenance Compliance
 * - Energy Usage
 * - Utility Consumption
 */

import { useState } from 'react';
import {
  Wrench,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Zap,
  Download,
  Filter,
  Calendar,
  Percent,
  CheckCircle2,
  Activity,
  Thermometer
} from 'lucide-react';

interface EngineeringMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'assets' | 'downtime' | 'maintenance' | 'pm' | 'energy' | 'utilities';
}

const ENGINEERING_ANALYTICS = [
  // Asset Performance
  { id: 'asset_availability', name: 'Asset Availability', value: 94, target: 90, unit: '%', trend: 4, category: 'assets' },
  { id: 'asset_utilization', name: 'Asset Utilization', value: 78, target: 75, unit: '%', trend: 4, category: 'assets' },
  { id: 'asset_age', name: 'Avg Asset Age', value: 8, target: 10, unit: 'years', trend: -20, category: 'assets' },
  
  // Equipment Downtime
  { id: 'downtime_hours', name: 'Downtime Hours', value: 24, target: 30, unit: 'hrs', trend: -20, category: 'downtime' },
  { id: 'mttr', name: 'Mean Time to Repair', value: 4.5, target: 6, unit: 'hrs', trend: -25, category: 'downtime' },
  { id: 'mtbf', name: 'Mean Time Between Failures', value: 720, target: 600, unit: 'hrs', trend: 20, category: 'downtime' },
  
  // Maintenance Cost
  { id: 'maintenance_cost', name: 'Maintenance Cost', value: 45000, target: 50000, unit: '$', trend: -10, category: 'maintenance' },
  { id: 'cost_per_room', name: 'Cost per Room', value: 36, target: 40, unit: '$', trend: -10, category: 'maintenance' },
  { id: 'reactive_cost', name: 'Reactive Cost', value: 18000, target: 20000, unit: '$', trend: -10, category: 'maintenance' },
  
  // Work Order Backlog
  { id: 'open_work_orders', name: 'Open Work Orders', value: 28, target: 25, unit: '', trend: 12, category: 'maintenance' },
  { id: 'critical_orders', name: 'Critical Orders', value: 3, target: 5, unit: '', trend: -40, category: 'maintenance' },
  { id: 'avg_resolution', name: 'Avg Resolution Time', value: 18, target: 24, unit: 'hrs', trend: -25, category: 'maintenance' },
  
  // Preventive Maintenance Compliance
  { id: 'pm_compliance', name: 'PM Compliance', value: 89, target: 85, unit: '%', trend: 5, category: 'pm' },
  { id: 'pm_completion', name: 'PM Completion Rate', value: 95, target: 90, unit: '%', trend: 6, category: 'pm' },
  { id: 'pm_on_time', name: 'PM On-Time Rate', value: 92, target: 90, unit: '%', trend: 2, category: 'pm' },
  
  // Energy Usage
  { id: 'electricity', name: 'Electricity', value: 95000, target: 100000, unit: 'kWh', trend: -5, category: 'energy' },
  { id: 'gas', name: 'Natural Gas', value: 45000, target: 50000, unit: 'therms', trend: -10, category: 'energy' },
  { id: 'fuel', name: 'Fuel', value: 12000, target: 15000, unit: 'gallons', trend: -20, category: 'energy' },
  
  // Utility Consumption
  { id: 'water', name: 'Water', value: 42000, target: 45000, unit: 'gal', trend: -7, category: 'utilities' },
  { id: 'utility_cost', name: 'Utility Cost', value: 28000, target: 30000, unit: '$', trend: -7, category: 'utilities' },
  { id: 'energy_cost_per_room', name: 'Energy Cost per Room', value: 22, target: 25, unit: '$', trend: -12, category: 'utilities' },
];

const ENGINEERING_CATEGORIES = [
  { id: 'assets', label: 'Assets', icon: Building2 },
  { id: 'downtime', label: 'Downtime', icon: Clock },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'pm', label: 'PM Compliance', icon: CheckCircle2 },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'utilities', label: 'Utilities', icon: Thermometer },
];

const EngineeringIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? ENGINEERING_ANALYTICS 
    : ENGINEERING_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Engineering Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Asset performance, maintenance, and energy analytics
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

      {/* Engineering Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Wrench className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {ENGINEERING_CATEGORIES.map(cat => {
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

      {/* Engineering Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'kWh' ? ' kWh' : metric.unit === 'therms' ? ' therms' : metric.unit === 'gallons' ? ' gal' : metric.unit === 'hrs' ? ' hrs' : metric.unit === 'years' ? ' years' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'kWh' ? ' kWh' : metric.unit === 'therms' ? ' therms' : metric.unit === 'gallons' ? ' gal' : metric.unit === 'hrs' ? ' hrs' : metric.unit === 'years' ? ' years' : ''}
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

      {/* Work Order Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Work Order Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'Open', count: 28, color: 'bg-blue-500' },
            { status: 'In Progress', count: 15, color: 'bg-amber-500' },
            { status: 'Pending Parts', count: 8, color: 'bg-purple-500' },
            { status: 'Completed', count: 45, color: 'bg-emerald-500' },
          ].map((order, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${order.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{order.status}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{order.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Consumption */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Energy Consumption
        </h3>
        <div className="space-y-4">
          {[
            { type: 'Electricity', usage: 95000, cost: 14250, trend: -5, unit: 'kWh' },
            { type: 'Natural Gas', usage: 45000, cost: 6750, trend: -10, unit: 'therms' },
            { type: 'Water', usage: 42000, cost: 4200, trend: -7, unit: 'gal' },
            { type: 'Fuel', usage: 12000, cost: 4800, trend: -20, unit: 'gallons' },
          ].map((energy, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{energy.type}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {energy.usage.toLocaleString()} {energy.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${energy.cost.toLocaleString()}
                </p>
                <span className={`text-xs font-medium ${
                  energy.trend >= 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {energy.trend >= 0 ? '+' : ''}{energy.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EngineeringIntelligence;
