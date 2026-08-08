/**
 * Enterprise Data Explorer Module
 * 
 * Features:
 * - Self-Service Analytics
 * - Ad-hoc Queries
 * - Drill-down Analysis
 * - Pivot Tables
 * - KPI Explorer
 * - Cross-Department Analytics
 * - Data Export
 */

import { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calendar,
  Building2,
  TrendingUp,
  Layers,
  Share2,
  RefreshCw,
  Users,
  Package,
  Wrench,
  Shield
} from 'lucide-react';

interface DataQuery {
  id: string;
  name: string;
  description: string;
  type: 'kpi' | 'pivot' | 'drilldown' | 'cross_dept';
  lastRun: string;
  status: 'ready' | 'loading';
}

const DATA_QUERIES = [
  { id: 'query_1', name: 'Revenue by Department', description: 'Revenue breakdown by department', type: 'kpi', lastRun: '2024-01-15 09:00', status: 'ready' },
  { id: 'query_2', name: 'Occupancy Trends', description: 'Occupancy trends over time', type: 'drilldown', lastRun: '2024-01-15 08:00', status: 'ready' },
  { id: 'query_3', name: 'Guest Segmentation', description: 'Guest segmentation analysis', type: 'pivot', lastRun: '2024-01-14 16:00', status: 'ready' },
  { id: 'query_4', name: 'Cost Center Analysis', description: 'Cost center performance', type: 'cross_dept', lastRun: '2024-01-14 14:00', status: 'ready' },
  { id: 'query_5', name: 'Channel Performance', description: 'Booking channel performance', type: 'kpi', lastRun: '2024-01-15 07:00', status: 'ready' },
  { id: 'query_6', name: 'Staff Productivity', description: 'Staff productivity metrics', type: 'cross_dept', lastRun: '2024-01-13 18:00', status: 'ready' },
];

const DATA_SOURCES = [
  { id: 'pms', name: 'PMS', icon: Building2, recordCount: 125000 },
  { id: 'finance', name: 'Finance', icon: TrendingUp, recordCount: 45000 },
  { id: 'hr', name: 'HR', icon: Users, recordCount: 8500 },
  { id: 'inventory', name: 'Inventory', icon: Package, recordCount: 32000 },
  { id: 'engineering', name: 'Engineering', icon: Wrench, recordCount: 18000 },
  { id: 'security', name: 'Security', icon: Shield, recordCount: 5200 },
];

const DATA_TYPES = [
  { id: 'kpi', label: 'KPI Explorer', icon: BarChart3 },
  { id: 'pivot', label: 'Pivot Tables', icon: Table },
  { id: 'drilldown', label: 'Drill-down', icon: Layers },
  { id: 'cross_dept', label: 'Cross-Department', icon: Share2 },
];

const EnterpriseDataExplorer = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredQueries = DATA_QUERIES.filter(query => {
    const typeMatch = selectedType === 'all' || query.type === selectedType;
    const searchMatch = searchQuery === '' || 
      query.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.description.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      kpi: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      pivot: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      drilldown: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cross_dept: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[type as keyof typeof colors] || colors.kpi;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enterprise Data Explorer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Self-service analytics and ad-hoc data exploration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Database className="w-4 h-4" />
            <span>New Query</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Data Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedType('all')}
          className={`p-3 rounded-lg border transition-all ${
            selectedType === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Database className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All Types</p>
        </button>
        {DATA_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedType === type.id
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

      {/* Data Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Data Sources
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'PMS', count: 125000, icon: Building2 },
            { name: 'Finance', count: 45000, icon: TrendingUp },
            { name: 'HR', count: 8500, icon: Users },
            { name: 'Inventory', count: 32000, icon: Package },
            { name: 'Engineering', count: 18000, icon: Wrench },
            { name: 'Security', count: 5200, icon: Shield },
          ].map((source, index) => {
            const Icon = source.icon;
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <Icon className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{source.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{source.count.toLocaleString()} records</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Queries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueries.map(query => (
          <div
            key={query.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {query.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(query.type)}`}>
                    {query.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {query.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Last run: {query.lastRun}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Create KPI Dashboard', icon: BarChart3 },
            { label: 'Build Pivot Table', icon: Table },
            { label: 'Drill-down Analysis', icon: Layers },
            { label: 'Cross-Department Report', icon: Share2 },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDataExplorer;
