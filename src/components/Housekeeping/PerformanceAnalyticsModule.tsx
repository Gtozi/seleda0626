/**
 * Performance Analytics Module
 * Housekeeping performance tracking, quality scores, and productivity metrics
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Star,
  Target,
  AlertCircle
} from 'lucide-react';

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  change: number;
  trend: 'up' | 'down';
}

interface StaffPerformance {
  staffId: string;
  name: string;
  roomsCompleted: number;
  averageTime: number;
  qualityScore: number;
  tasksCompleted: number;
  onTimeRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface QualityTrend {
  date: string;
  averageScore: number;
  inspections: number;
  issues: number;
}

const PerformanceAnalyticsModule = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data
  const metrics: PerformanceMetric[] = useMemo(() => [
    { metric: 'Clean Room Rate', value: 96.5, target: 95, change: 2.3, trend: 'up' },
    { metric: 'Average Cleaning Time', value: 28, target: 30, change: -1.5, trend: 'down' },
    { metric: 'Quality Score', value: 92.3, target: 90, change: 1.8, trend: 'up' },
    { metric: 'On-Time Completion', value: 94.2, target: 95, change: -0.8, trend: 'down' },
  ], []);

  const staffPerformance: StaffPerformance[] = useMemo(() => [
    { staffId: 'HK-01', name: 'Sarah M.', roomsCompleted: 12, averageTime: 26, qualityScore: 96, tasksCompleted: 15, onTimeRate: 98, trend: 'up' },
    { staffId: 'HK-02', name: 'John D.', roomsCompleted: 10, averageTime: 32, qualityScore: 88, tasksCompleted: 12, onTimeRate: 92, trend: 'stable' },
    { staffId: 'HK-03', name: 'Maria G.', roomsCompleted: 8, averageTime: 25, qualityScore: 97, tasksCompleted: 10, onTimeRate: 100, trend: 'up' },
    { staffId: 'HK-04', name: 'Ahmed K.', roomsCompleted: 11, averageTime: 29, qualityScore: 91, tasksCompleted: 13, onTimeRate: 95, trend: 'down' },
  ], []);

  const qualityTrends: QualityTrend[] = useMemo(() => [
    { date: '2026-07-13', averageScore: 90.5, inspections: 45, issues: 4 },
    { date: '2026-07-14', averageScore: 91.2, inspections: 48, issues: 4 },
    { date: '2026-07-15', averageScore: 89.8, inspections: 42, issues: 5 },
    { date: '2026-07-16', averageScore: 92.1, inspections: 50, issues: 3 },
    { date: '2026-07-17', averageScore: 93.4, inspections: 52, issues: 2 },
    { date: '2026-07-18', averageScore: 91.8, inspections: 47, issues: 4 },
    { date: '2026-07-19', averageScore: 92.3, inspections: 49, issues: 3 },
  ], []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'stable': return <div className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 dark:text-green-400';
    if (score >= 90) return 'text-blue-600 dark:text-blue-400';
    if (score >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
          <p className="text-slate-600 dark:text-slate-400">Track quality scores and productivity metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.metric} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className={`text-sm flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}{metric.metric.includes('Rate') || metric.metric.includes('Score') ? '%' : ' min'}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{metric.metric}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Target: {metric.target}{metric.metric.includes('Rate') || metric.metric.includes('Score') ? '%' : ' min'}</p>
          </div>
        ))}
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Staff Performance</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select className="text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <option>All Staff</option>
                <option>Top Performers</option>
                <option>Needs Improvement</option>
              </select>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Rooms Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Avg Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Quality Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                On-Time Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {staffPerformance.map((staff) => (
              <tr key={staff.staffId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{staff.roomsCompleted}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{staff.averageTime} min</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${getScoreColor(staff.qualityScore)}`}>{staff.qualityScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{staff.onTimeRate}%</td>
                <td className="px-6 py-4">
                  {getTrendIcon(staff.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quality Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quality Score Trend</h3>
          <div className="space-y-3">
            {qualityTrends.map((trend) => (
              <div key={trend.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{trend.averageScore}%</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{trend.inspections} inspections</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${trend.averageScore >= 95 ? 'bg-green-500' : trend.averageScore >= 90 ? 'bg-blue-500' : trend.averageScore >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${trend.averageScore}%` }}
                    />
                  </div>
                </div>
                {trend.issues > 0 && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{trend.issues}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Performers</h3>
          <div className="space-y-4">
            {staffPerformance.slice(0, 3).map((staff, index) => (
              <div key={staff.staffId} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' : index === 1 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
                  <Award className={`w-4 h-4 ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : index === 1 ? 'text-slate-600 dark:text-slate-400' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{staff.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{staff.roomsCompleted} rooms completed</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getScoreColor(staff.qualityScore)}`}>{staff.qualityScore}%</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Quality</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Achievement */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Target Achievement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{metric.metric}</span>
                <span className={`text-sm font-medium ${metric.value >= metric.target ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metric.value >= metric.target ? 'On Track' : 'Below Target'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${metric.value >= metric.target ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Current: {metric.value}%</span>
                <span>Target: {metric.target}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsModule;
