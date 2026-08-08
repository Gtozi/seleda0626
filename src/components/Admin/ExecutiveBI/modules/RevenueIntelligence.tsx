/**
 * Revenue Intelligence Module
 * 
 * Data sourced from Revenue Management.
 * 
 * Analytics:
 * - Occupancy
 * - ADR
 * - RevPAR
 * - TRevPAR
 * - GOPPAR
 * - Booking Pace
 * - Pickup
 * - Demand Forecast
 * - Yield Performance
 * - Channel Mix
 */

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Bed,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Calendar,
  PieChart,
  LineChart,
  Download,
  Filter,
  Percent,
  Users,
  Building2
} from 'lucide-react';

interface RevenueMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'occupancy' | 'adr' | 'revpar' | 'booking' | 'forecast' | 'channel';
}

const REVENUE_ANALYTICS = [
  // Occupancy Metrics
  { id: 'occupancy', name: 'Occupancy Rate', value: 78, target: 75, unit: '%', trend: 4, category: 'occupancy' },
  { id: 'length_of_stay', name: 'Average Length of Stay', value: 3.2, target: 3.0, unit: 'nights', trend: 7, category: 'occupancy' },
  
  // ADR Metrics
  { id: 'adr', name: 'Average Daily Rate', value: 145, target: 140, unit: '$', trend: 4, category: 'adr' },
  { id: 'adr_trend', name: 'ADR Trend (30d)', value: 6, target: 5, unit: '%', trend: 20, category: 'adr' },
  
  // RevPAR Metrics
  { id: 'revpar', name: 'RevPAR', value: 113, target: 105, unit: '$', trend: 8, category: 'revpar' },
  { id: 'trevpar', name: 'TRevPAR', value: 156, target: 150, unit: '$', trend: 4, category: 'revpar' },
  { id: 'goppar', name: 'GOPPAR', value: 85, target: 80, unit: '$', trend: 6, category: 'revpar' },
  
  // Booking Pace
  { id: 'booking_pace', name: 'Booking Pace', value: 78, target: 75, unit: '%', trend: 4, category: 'booking' },
  { id: 'pickup_30d', name: 'Pickup (30d)', value: 125000, target: 100000, unit: '$', trend: 25, category: 'booking' },
  { id: 'pickup_60d', name: 'Pickup (60d)', value: 280000, target: 250000, unit: '$', trend: 12, category: 'booking' },
  { id: 'pickup_90d', name: 'Pickup (90d)', value: 450000, target: 400000, unit: '$', trend: 12, category: 'booking' },
  
  // Demand Forecast
  { id: 'demand_forecast_7d', name: 'Demand Forecast (7d)', value: 82, target: 80, unit: '%', trend: 2, category: 'forecast' },
  { id: 'demand_forecast_30d', name: 'Demand Forecast (30d)', value: 85, target: 82, unit: '%', trend: 4, category: 'forecast' },
  { id: 'demand_forecast_90d', name: 'Demand Forecast (90d)', value: 88, target: 85, unit: '%', trend: 3, category: 'forecast' },
  
  // Yield Performance
  { id: 'yield_performance', name: 'Yield Performance', value: 92, target: 90, unit: '%', trend: 2, category: 'forecast' },
  { id: 'revenue_yield', name: 'Revenue Yield', value: 1.12, target: 1.10, unit: 'x', trend: 2, category: 'forecast' },
  
  // Channel Mix
  { id: 'direct', name: 'Direct Booking', value: 35, target: 30, unit: '%', trend: 17, category: 'channel' },
  { id: 'ota', name: 'OTA Channels', value: 45, target: 50, unit: '%', trend: -10, category: 'channel' },
  { id: 'corporate', name: 'Corporate', value: 15, target: 15, unit: '%', trend: 0, category: 'channel' },
  { id: 'groups', name: 'Groups', value: 5, target: 5, unit: '%', trend: 0, category: 'channel' },
];

const REVENUE_CATEGORIES = [
  { id: 'occupancy', label: 'Occupancy', icon: Bed },
  { id: 'adr', label: 'ADR', icon: DollarSign },
  { id: 'revpar', label: 'RevPAR', icon: BarChart3 },
  { id: 'booking', label: 'Booking Pace', icon: Calendar },
  { id: 'forecast', label: 'Forecast', icon: LineChart },
  { id: 'channel', label: 'Channel Mix', icon: PieChart },
];

const RevenueIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? REVENUE_ANALYTICS 
    : REVENUE_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Revenue Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Occupancy, ADR, RevPAR, and yield management analytics
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

      {/* Revenue Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Metrics</p>
        </button>
        {REVENUE_CATEGORIES.map(cat => {
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

      {/* Revenue Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : ''}
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

      {/* Channel Mix Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Channel Mix Breakdown
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Direct Booking', value: 35, revenue: 437500, color: 'bg-indigo-500' },
            { name: 'OTA Channels', value: 45, revenue: 562500, color: 'bg-blue-500' },
            { name: 'Corporate', value: 15, revenue: 187500, color: 'bg-emerald-500' },
            { name: 'Groups', value: 5, revenue: 62500, color: 'bg-amber-500' },
          ].map(channel => (
            <div key={channel.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${channel.color}`} />
                  <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-white">{channel.value}%</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ${channel.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${channel.color}`}
                  style={{ width: `${channel.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Forecast Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demand Forecast
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { period: '7 Days', forecast: 82, actual: 78, trend: '+5%' },
            { period: '30 Days', forecast: 85, actual: 80, trend: '+6%' },
            { period: '90 Days', forecast: 88, actual: 82, trend: '+7%' },
          ].map(forecast => (
            <div key={forecast.period} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{forecast.period}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {forecast.forecast}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Actual: {forecast.actual}%
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                {forecast.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueIntelligence;
