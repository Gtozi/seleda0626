/**
 * Operational Intelligence Module
 * 
 * Consolidated operational analytics from:
 * - Front Office
 * - Housekeeping
 * - Food & Beverage
 * - Kitchen
 * - Engineering
 * - Security
 * - Laundry
 * - Spa
 * - Transportation
 * 
 * Metrics include:
 * - Service Levels
 * - Operational Efficiency
 * - SLA Compliance
 * - Productivity
 * - Utilization
 * - Bottlenecks
 */

import { useState } from 'react';
import {
  Activity,
  Bed,
  Utensils,
  Wrench,
  Shield,
  Truck,
  Sparkles,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  BarChart3,
  Filter
} from 'lucide-react';

interface OperationalMetric {
  department: string;
  metric: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  status: 'good' | 'warning' | 'critical';
}

const DEPARTMENTS = [
  'Front Office',
  'Housekeeping',
  'Food & Beverage',
  'Kitchen',
  'Engineering',
  'Security',
  'Laundry',
  'Spa',
  'Transportation'
];

const MOCK_METRICS: OperationalMetric[] = [
  // Front Office
  { department: 'Front Office', metric: 'Check-in Time', value: 4.2, target: 5, unit: 'min', trend: -8, status: 'good' },
  { department: 'Front Office', metric: 'Check-out Time', value: 3.8, target: 5, unit: 'min', trend: -12, status: 'good' },
  { department: 'Front Office', metric: 'Service Score', value: 4.5, target: 4.0, unit: '/5', trend: 5, status: 'good' },
  
  // Housekeeping
  { department: 'Housekeeping', metric: 'Room Turnaround', value: 35, target: 45, unit: 'min', trend: -15, status: 'good' },
  { department: 'Housekeeping', metric: 'Inspection Score', value: 96, target: 95, unit: '%', trend: 2, status: 'good' },
  { department: 'Housekeeping', metric: 'Productivity', value: 12, target: 10, unit: 'rooms/day', trend: 8, status: 'good' },
  
  // Food & Beverage
  { department: 'Food & Beverage', metric: 'Table Turnover', value: 2.8, target: 2.5, unit: 'x', trend: 6, status: 'good' },
  { department: 'Food & Beverage', metric: 'Service Time', value: 18, target: 20, unit: 'min', trend: -5, status: 'good' },
  { department: 'Food & Beverage', metric: 'Guest Satisfaction', value: 4.3, target: 4.0, unit: '/5', trend: 4, status: 'good' },
  
  // Kitchen
  { department: 'Kitchen', metric: 'Ticket Time', value: 12, target: 15, unit: 'min', trend: -10, status: 'good' },
  { department: 'Kitchen', metric: 'Food Cost', value: 32, target: 35, unit: '%', trend: -4, status: 'good' },
  { department: 'Kitchen', metric: 'Waste %', value: 3.2, target: 4, unit: '%', trend: -8, status: 'good' },
  
  // Engineering
  { department: 'Engineering', metric: 'Response Time', value: 18, target: 30, unit: 'min', trend: -25, status: 'good' },
  { department: 'Engineering', metric: 'PM Compliance', value: 89, target: 85, unit: '%', trend: 5, status: 'good' },
  { department: 'Engineering', metric: 'Asset Availability', value: 94, target: 90, unit: '%', trend: 2, status: 'good' },
  
  // Security
  { department: 'Security', metric: 'Response Time', value: 4.5, target: 5, unit: 'min', trend: -10, status: 'good' },
  { department: 'Security', metric: 'Incident Rate', value: 0.8, target: 1.0, unit: '/day', trend: -20, status: 'good' },
  { department: 'Security', metric: 'Patrol Coverage', value: 98, target: 95, unit: '%', trend: 2, status: 'good' },
  
  // Laundry
  { department: 'Laundry', metric: 'Turnaround Time', value: 8, target: 12, unit: 'hours', trend: -15, status: 'good' },
  { department: 'Laundry', metric: 'Quality Score', value: 97, target: 95, unit: '%', trend: 2, status: 'good' },
  { department: 'Laundry', metric: 'Productivity', value: 450, target: 400, unit: 'lbs/day', trend: 8, status: 'good' },
  
  // Spa
  { department: 'Spa', metric: 'Utilization', value: 72, target: 70, unit: '%', trend: 5, status: 'good' },
  { department: 'Spa', metric: 'Guest Satisfaction', value: 4.6, target: 4.2, unit: '/5', trend: 6, status: 'good' },
  { department: 'Spa', metric: 'Revenue per Treatment', value: 85, target: 80, unit: '$', trend: 4, status: 'good' },
  
  // Transportation
  { department: 'Transportation', metric: 'On-time Rate', value: 94, target: 90, unit: '%', trend: 3, status: 'good' },
  { department: 'Transportation', metric: 'Vehicle Utilization', value: 78, target: 75, unit: '%', trend: 4, status: 'good' },
  { department: 'Transportation', metric: 'Guest Satisfaction', value: 4.4, target: 4.0, unit: '/5', trend: 5, status: 'good' }
];

const DEPARTMENT_ICONS: Record<string, any> = {
  'Front Office': Bed,
  'Housekeeping': Sparkles,
  'Food & Beverage': Utensils,
  'Kitchen': Utensils,
  'Engineering': Wrench,
  'Security': Shield,
  'Laundry': Activity,
  'Spa': Sparkles,
  'Transportation': Truck
};

const OperationalIntelligence = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const filteredMetrics = selectedDepartment === 'all' 
    ? MOCK_METRICS 
    : MOCK_METRICS.filter(m => m.department === selectedDepartment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const departmentStats = DEPARTMENTS.reduce((acc, dept) => {
    const deptMetrics = MOCK_METRICS.filter(m => m.department === dept);
    const good = deptMetrics.filter(m => m.status === 'good').length;
    const warning = deptMetrics.filter(m => m.status === 'warning').length;
    const critical = deptMetrics.filter(m => m.status === 'critical').length;
    
    acc[dept] = {
      total: deptMetrics.length,
      good,
      warning,
      critical,
      avgTrend: deptMetrics.reduce((sum, m) => sum + m.trend, 0) / deptMetrics.length
    };
    return acc;
  }, {} as Record<string, { total: number; good: number; warning: number; critical: number; avgTrend: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Operational Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consolidated operational analytics across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {DEPARTMENTS.map(department => {
          const stats = departmentStats[department];
          const Icon = DEPARTMENT_ICONS[department];
          const goodPercent = stats.total > 0 ? (stats.good / stats.total) * 100 : 0;
          
          return (
            <div
              key={department}
              onClick={() => setSelectedDepartment(department)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedDepartment === department
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {department}
                </h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400">Good: {stats.good}</span>
                  <span className="text-rose-600 dark:text-rose-400">Critical: {stats.critical}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${goodPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {stats.avgTrend >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-600" />
                  )}
                  <span>{stats.avgTrend >= 0 ? '+' : ''}{stats.avgTrend.toFixed(1)}% avg trend</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-4">
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map((metric, index) => (
          <div
            key={`${metric.department}-${metric.metric}-${index}`}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {metric.metric}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {metric.department}
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)}
                <span className="capitalize">{metric.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toLocaleString()}{metric.unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.target.toLocaleString()}{metric.unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {metric.trend >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                )}
                <span className={metric.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">vs target</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Operational Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {MOCK_METRICS.filter(m => m.status === 'good').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Good Performance
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {MOCK_METRICS.filter(m => m.status === 'warning').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Needs Attention
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {MOCK_METRICS.filter(m => m.status === 'critical').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Critical Issues
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {MOCK_METRICS.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalIntelligence;
