/**
 * Reports Center Module
 * 
 * Executive Reports:
 * - Executive Summary
 * - General Manager Dashboard
 * - Owner Report
 * - Board Report
 * - Regional Performance
 * - Multi-Property Dashboard
 * 
 * Financial Reports:
 * - Profit & Loss
 * - Cash Flow
 * - Revenue Summary
 * - Budget Variance
 * - Department Profitability
 * 
 * Operational Reports:
 * - Daily Operations Summary
 * - Morning Briefing Report
 * - Executive Flash Report
 * - Weekly Performance
 * - Monthly Business Review
 * 
 * Forecast Reports:
 * - Revenue Forecast
 * - Occupancy Forecast
 * - Demand Forecast
 * - Budget Forecast
 * 
 * Custom Reports:
 * - Self-Service Report Builder
 * - Scheduled Reports
 * - Report Templates
 * - Dashboard Export
 */

import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Activity,
  TrendingUp,
  Settings,
  Share2
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'financial' | 'operational' | 'forecast' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand';
  lastRun: string;
  status: 'ready' | 'generating' | 'scheduled';
}

const REPORTS = [
  // Executive Reports
  { id: 'exec_1', name: 'Executive Summary', description: 'High-level overview of hotel performance', category: 'executive', frequency: 'daily', lastRun: '2024-01-15 08:00', status: 'ready' },
  { id: 'exec_2', name: 'General Manager Dashboard', description: 'Comprehensive GM performance dashboard', category: 'executive', frequency: 'daily', lastRun: '2024-01-15 08:00', status: 'ready' },
  { id: 'exec_3', name: 'Owner Report', description: 'Owner-focused financial and operational summary', category: 'executive', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'exec_4', name: 'Board Report', description: 'Board-level strategic performance report', category: 'executive', frequency: 'quarterly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'exec_5', name: 'Regional Performance', description: 'Regional performance comparison', category: 'executive', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'exec_6', name: 'Multi-Property Dashboard', description: 'Consolidated multi-property performance', category: 'executive', frequency: 'daily', lastRun: '2024-01-15 08:00', status: 'ready' },
  
  // Financial Reports
  { id: 'fin_1', name: 'Profit & Loss', description: 'Detailed P&L statement', category: 'financial', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fin_2', name: 'Cash Flow', description: 'Cash flow analysis and forecast', category: 'financial', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fin_3', name: 'Revenue Summary', description: 'Revenue breakdown by segment', category: 'financial', frequency: 'weekly', lastRun: '2024-01-14 00:00', status: 'ready' },
  { id: 'fin_4', name: 'Budget Variance', description: 'Budget vs actual analysis', category: 'financial', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fin_5', name: 'Department Profitability', description: 'Profitability by department', category: 'financial', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  
  // Operational Reports
  { id: 'ops_1', name: 'Daily Operations Summary', description: 'Daily operational performance summary', category: 'operational', frequency: 'daily', lastRun: '2024-01-15 08:00', status: 'ready' },
  { id: 'ops_2', name: 'Morning Briefing Report', description: 'Morning briefing for department heads', category: 'operational', frequency: 'daily', lastRun: '2024-01-15 07:00', status: 'ready' },
  { id: 'ops_3', name: 'Executive Flash Report', description: 'Quick executive flash report', category: 'operational', frequency: 'daily', lastRun: '2024-01-15 08:00', status: 'ready' },
  { id: 'ops_4', name: 'Weekly Performance', description: 'Weekly performance review', category: 'operational', frequency: 'weekly', lastRun: '2024-01-14 00:00', status: 'ready' },
  { id: 'ops_5', name: 'Monthly Business Review', description: 'Comprehensive monthly business review', category: 'operational', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  
  // Forecast Reports
  { id: 'fcast_1', name: 'Revenue Forecast', description: 'Revenue forecast and analysis', category: 'forecast', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fcast_2', name: 'Occupancy Forecast', description: 'Occupancy forecast by segment', category: 'forecast', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fcast_3', name: 'Demand Forecast', description: 'Demand forecast and trends', category: 'forecast', frequency: 'monthly', lastRun: '2024-01-01 00:00', status: 'ready' },
  { id: 'fcast_4', name: 'Budget Forecast', description: 'Budget forecast and variance', category: 'forecast', frequency: 'quarterly', lastRun: '2024-01-01 00:00', status: 'ready' },
  
  // Custom Reports
  { id: 'custom_1', name: 'Self-Service Report Builder', description: 'Build custom reports on demand', category: 'custom', frequency: 'on_demand', lastRun: '-', status: 'ready' },
  { id: 'custom_2', name: 'Scheduled Reports', description: 'Manage scheduled report deliveries', category: 'custom', frequency: 'on_demand', lastRun: '-', status: 'ready' },
  { id: 'custom_3', name: 'Report Templates', description: 'Report template library', category: 'custom', frequency: 'on_demand', lastRun: '-', status: 'ready' },
  { id: 'custom_4', name: 'Dashboard Export', description: 'Export dashboard data', category: 'custom', frequency: 'on_demand', lastRun: '-', status: 'ready' },
];

const REPORT_CATEGORIES = [
  { id: 'executive', label: 'Executive', icon: BarChart3 },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'operational', label: 'Operational', icon: Activity },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'custom', label: 'Custom', icon: Settings },
];

const ReportsCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReports = REPORTS.filter(report => {
    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      executive: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      operational: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      forecast: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      custom: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[category as keyof typeof colors] || colors.executive;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports Center
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Executive, financial, operational, and custom reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <FileText className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All Reports</p>
        </button>
        {REPORT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {report.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{report.frequency}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Last run: {report.lastRun}</span>
              <span className={`flex items-center gap-1 ${report.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`}>
                <CheckCircle2 className="w-3 h-3" />
                {report.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Reports', count: REPORTS.length, color: 'bg-indigo-500' },
            { label: 'Executive', count: REPORTS.filter(r => r.category === 'executive').length, color: 'bg-emerald-500' },
            { label: 'Financial', count: REPORTS.filter(r => r.category === 'financial').length, color: 'bg-blue-500' },
            { label: 'Operational', count: REPORTS.filter(r => r.category === 'operational').length, color: 'bg-amber-500' },
            { label: 'Custom', count: REPORTS.filter(r => r.category === 'custom').length, color: 'bg-purple-500' },
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
