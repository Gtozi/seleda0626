/**
 * Housekeeping Intelligence Module
 * 
 * Analytics:
 * - Room Cleaning Productivity
 * - Room Turnaround Time
 * Inspection Scores
 * - Linen Usage
 * - Laundry Costs
 * - Out-of-Service Rooms
 */

import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bed,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Percent,
  Shirt,
  Trash2,
  Home
} from 'lucide-react';

interface HousekeepingMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'productivity' | 'turnaround' | 'quality' | 'linen' | 'costs' | 'status';
}

const HOUSEKEEPING_ANALYTICS = [
  // Room Cleaning Productivity
  { id: 'rooms_per_day', name: 'Rooms per Day', value: 12, target: 10, unit: '', trend: 20, category: 'productivity' },
  { id: 'cleaning_hours', name: 'Avg Cleaning Time', value: 28, target: 30, unit: 'min', trend: -7, category: 'productivity' },
  { id: 'staff_productivity', name: 'Staff Productivity', value: 85, target: 80, unit: '%', trend: 6, category: 'productivity' },
  
  // Room Turnaround Time
  { id: 'turnaround_time', name: 'Turnaround Time', value: 35, target: 45, unit: 'min', trend: -22, category: 'turnaround' },
  { id: 'check_out_clean', name: 'Checkout to Clean', value: 40, target: 60, unit: 'min', trend: -33, category: 'turnaround' },
  { id: 'clean_to_inspect', name: 'Clean to Inspect', value: 15, target: 20, unit: 'min', trend: -25, category: 'turnaround' },
  
  // Inspection Scores
  { id: 'inspection_score', name: 'Inspection Score', value: 96, target: 95, unit: '/100', trend: 1, category: 'quality' },
  { id: 'pass_rate', name: 'First Pass Rate', value: 92, target: 90, unit: '%', trend: 2, category: 'quality' },
  { id: 'guest_satisfaction', name: 'Guest Satisfaction', value: 4.3, target: 4.0, unit: '/5', trend: 8, category: 'quality' },
  
  // Linen Usage
  { id: 'linen_per_room', name: 'Linen per Room', value: 2.8, target: 3.0, unit: 'sets', trend: -7, category: 'linen' },
  { id: 'linen_replacement', name: 'Linen Replacement', value: 15, target: 20, unit: 'days', trend: -25, category: 'linen' },
  { id: 'linen_loss', name: 'Linen Loss Rate', value: 2.5, target: 3.0, unit: '%', trend: -17, category: 'linen' },
  
  // Laundry Costs
  { id: 'laundry_cost', name: 'Laundry Cost', value: 8500, target: 9000, unit: '$', trend: -6, category: 'costs' },
  { id: 'cost_per_room', name: 'Cost per Room', value: 6.80, target: 7.50, unit: '$', trend: -9, category: 'costs' },
  { id: 'external_laundry', name: 'External Laundry', value: 35, target: 40, unit: '%', trend: -12, category: 'costs' },
  
  // Out-of-Service Rooms
  { id: 'out_of_service', name: 'Out of Service', value: 4, target: 5, unit: 'rooms', trend: -20, category: 'status' },
  { id: 'maintenance_ooo', name: 'Maintenance OOO', value: 2, target: 3, unit: 'rooms', trend: -33, category: 'status' },
  { id: 'available_rooms', name: 'Available Rooms', value: 96, target: 95, unit: '%', trend: 1, category: 'status' },
];

const HK_CATEGORIES = [
  { id: 'productivity', label: 'Productivity', icon: Sparkles },
  { id: 'turnaround', label: 'Turnaround', icon: Clock },
  { id: 'quality', label: 'Quality', icon: Star },
  { id: 'linen', label: 'Linen', icon: Shirt },
  { id: 'costs', label: 'Costs', icon: Trash2 },
  { id: 'status', label: 'Room Status', icon: Home },
];

const HousekeepingIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? HOUSEKEEPING_ANALYTICS 
    : HOUSEKEEPING_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Housekeeping Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Productivity, room turnaround, and quality analytics
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

      {/* Housekeeping Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {HK_CATEGORIES.map(cat => {
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

      {/* Housekeeping Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === '/5' ? '/5' : metric.unit === 'x' ? 'x' : metric.unit === 'days' ? ' days' : metric.unit === 'min' ? ' min' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === '/5' ? '/5' : metric.unit === 'x' ? 'x' : metric.unit === 'days' ? ' days' : metric.unit === 'min' ? ' min' : ''}
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

      {/* Room Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Room Status Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'Clean', count: 85, color: 'bg-emerald-500' },
            { status: 'Dirty', count: 12, color: 'bg-amber-500' },
            { status: 'Inspected', count: 8, color: 'bg-blue-500' },
            { status: 'Out of Service', count: 4, color: 'bg-rose-500' },
          ].map((room, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${room.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{room.status}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{room.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">rooms</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Productivity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Staff Productivity
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Maria Santos', rooms: 15, score: 98, status: 'Excellent' },
            { name: 'John Smith', rooms: 14, score: 95, status: 'Excellent' },
            { name: 'Emily Chen', rooms: 13, score: 92, status: 'Good' },
            { name: 'David Kim', rooms: 12, score: 88, status: 'Good' },
          ].map((staff, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{staff.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{staff.rooms} rooms/day</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{staff.score}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HousekeepingIntelligence;
