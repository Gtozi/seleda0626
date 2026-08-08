/**
 * Human Capital Intelligence Module
 * 
 * Analytics:
 * - Headcount
 * - Labor Cost
 * - Payroll Trends
 * - Attendance
 * - Overtime
 * - Employee Turnover
 * - Recruitment Metrics
 * - Performance Ratings
 * - Training Effectiveness
 */

import { useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  BarChart3,
  GraduationCap,
  Award,
  Download,
  Filter,
  Calendar,
  Percent,
  Briefcase,
  UserCheck
} from 'lucide-react';

interface HCMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'headcount' | 'labor' | 'payroll' | 'attendance' | 'turnover' | 'recruitment' | 'performance' | 'training';
}

const HC_ANALYTICS = [
  // Headcount
  { id: 'total_headcount', name: 'Total Headcount', value: 185, target: 180, unit: '', trend: 3, category: 'headcount' },
  { id: 'full_time', name: 'Full-Time', value: 145, target: 140, unit: '', trend: 4, category: 'headcount' },
  { id: 'part_time', name: 'Part-Time', value: 40, target: 40, unit: '', trend: 0, category: 'headcount' },
  
  // Labor Cost
  { id: 'labor_cost', name: 'Labor Cost', value: 420000, target: 400000, unit: '$', trend: 5, category: 'labor' },
  { id: 'labor_cost_percent', name: 'Labor Cost %', value: 34, target: 35, unit: '%', trend: -3, category: 'labor' },
  { id: 'cost_per_employee', name: 'Cost per Employee', value: 2270, target: 2200, unit: '$', trend: 3, category: 'labor' },
  
  // Payroll Trends
  { id: 'payroll_growth', name: 'Payroll Growth', value: 5, target: 4, unit: '%', trend: 25, category: 'payroll' },
  { id: 'avg_salary', name: 'Avg Salary', value: 45000, target: 44000, unit: '$', trend: 2, category: 'payroll' },
  { id: 'benefit_cost', name: 'Benefit Cost', value: 84000, target: 80000, unit: '$', trend: 5, category: 'payroll' },
  
  // Attendance
  { id: 'attendance_rate', name: 'Attendance Rate', value: 96, target: 95, unit: '%', trend: 1, category: 'attendance' },
  { id: 'absenteeism', name: 'Absenteeism Rate', value: 2.5, target: 3.0, unit: '%', trend: -17, category: 'attendance' },
  { id: 'punctuality', name: 'Punctuality Rate', value: 94, target: 92, unit: '%', trend: 2, category: 'attendance' },
  
  // Overtime
  { id: 'overtime_hours', name: 'Overtime Hours', value: 850, target: 1000, unit: 'hrs', trend: -15, category: 'attendance' },
  { id: 'overtime_cost', name: 'Overtime Cost', value: 25500, target: 30000, unit: '$', trend: -15, category: 'attendance' },
  
  // Employee Turnover
  { id: 'turnover_rate', name: 'Turnover Rate', value: 18, target: 20, unit: '%', trend: -10, category: 'turnover' },
  { id: 'voluntary_turnover', name: 'Voluntary Turnover', value: 12, target: 15, unit: '%', trend: -20, category: 'turnover' },
  { id: 'involuntary_turnover', name: 'Involuntary Turnover', value: 6, target: 5, unit: '%', trend: 20, category: 'turnover' },
  
  // Recruitment Metrics
  { id: 'time_to_hire', name: 'Time to Hire', value: 18, target: 21, unit: 'days', trend: -14, category: 'recruitment' },
  { id: 'cost_per_hire', name: 'Cost per Hire', value: 3500, target: 4000, unit: '$', trend: -12, category: 'recruitment' },
  { id: 'offer_acceptance', name: 'Offer Acceptance Rate', value: 85, target: 80, unit: '%', trend: 6, category: 'recruitment' },
  
  // Performance Ratings
  { id: 'avg_performance', name: 'Avg Performance Rating', value: 3.8, target: 3.5, unit: '/5', trend: 9, category: 'performance' },
  { id: 'high_performers', name: 'High Performers', value: 25, target: 20, unit: '%', trend: 25, category: 'performance' },
  { id: 'development_needed', name: 'Development Needed', value: 10, target: 15, unit: '%', trend: -33, category: 'performance' },
  
  // Training Effectiveness
  { id: 'training_hours', name: 'Training Hours', value: 1850, target: 1500, unit: 'hrs', trend: 23, category: 'training' },
  { id: 'training_completion', name: 'Training Completion', value: 92, target: 85, unit: '%', trend: 8, category: 'training' },
  { id: 'training_roi', name: 'Training ROI', value: 150, target: 120, unit: '%', trend: 25, category: 'training' },
];

const HC_CATEGORIES = [
  { id: 'headcount', label: 'Headcount', icon: Users },
  { id: 'labor', label: 'Labor Cost', icon: DollarSign },
  { id: 'payroll', label: 'Payroll', icon: Briefcase },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'turnover', label: 'Turnover', icon: TrendingDown },
  { id: 'recruitment', label: 'Recruitment', icon: Users },
  { id: 'performance', label: 'Performance', icon: Award },
  { id: 'training', label: 'Training', icon: GraduationCap },
];

const HumanCapitalIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? HC_ANALYTICS 
    : HC_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Human Capital Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Headcount, labor cost, and workforce analytics
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

      {/* HC Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Users className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {HC_CATEGORIES.map(cat => {
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

      {/* HC Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'days' ? ' days' : metric.unit === 'hrs' ? ' hrs' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'days' ? ' days' : metric.unit === 'hrs' ? ' hrs' : ''}
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

      {/* Department Headcount */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Department Headcount
        </h3>
        <div className="space-y-4">
          {[
            { dept: 'Front Office', count: 45, budget: 50, variance: -10 },
            { dept: 'Housekeeping', count: 52, budget: 50, variance: 4 },
            { dept: 'F&B', count: 38, budget: 40, variance: -5 },
            { dept: 'Engineering', count: 18, budget: 20, variance: -10 },
            { dept: 'Administration', count: 32, budget: 30, variance: 7 },
          ].map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{dept.dept}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Budget: {dept.budget} staff
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dept.count}</p>
                <span className={`text-xs font-medium ${
                  dept.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {dept.variance >= 0 ? '+' : ''}{dept.variance}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HumanCapitalIntelligence;
