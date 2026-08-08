/**
 * Configuration Module
 * 
 * Dashboard Setup:
 * - Dashboard Templates
 * - Widget Library
 * - Personalized Layouts
 * - Theme Configuration
 * 
 * KPI Setup:
 * - KPI Definitions
 * - Targets
 * - Thresholds
 * - Ownership
 * - Alert Rules
 * 
 * Analytics Setup:
 * - Data Refresh Schedule
 * - Aggregation Rules
 * - Data Warehouse Mapping
 * - Security Policies
 */

import { useState } from 'react';
import {
  Settings,
  LayoutDashboard,
  Target,
  Database,
  Shield,
  Bell,
  Clock,
  Download,
  Filter,
  Calendar,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ConfigItem {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'kpi' | 'analytics';
  status: 'active' | 'inactive';
  lastModified: string;
}

const CONFIG_ITEMS = [
  // Dashboard Setup
  { id: 'dash_1', name: 'Executive Dashboard Template', description: 'Default executive dashboard layout', category: 'dashboard', status: 'active', lastModified: '2024-01-10' },
  { id: 'dash_2', name: 'GM Dashboard Template', description: 'General manager dashboard layout', category: 'dashboard', status: 'active', lastModified: '2024-01-08' },
  { id: 'dash_3', name: 'Widget Library', description: 'Available dashboard widgets', category: 'dashboard', status: 'active', lastModified: '2024-01-05' },
  { id: 'dash_4', name: 'Theme Configuration', description: 'Color scheme and theme settings', category: 'dashboard', status: 'active', lastModified: '2024-01-01' },
  
  // KPI Setup
  { id: 'kpi_1', name: 'KPI Definitions', description: 'Define and manage KPIs', category: 'kpi', status: 'active', lastModified: '2024-01-12' },
  { id: 'kpi_2', name: 'KPI Targets', description: 'Set KPI targets and goals', category: 'kpi', status: 'active', lastModified: '2024-01-11' },
  { id: 'kpi_3', name: 'Threshold Configuration', description: 'Configure KPI thresholds', category: 'kpi', status: 'active', lastModified: '2024-01-10' },
  { id: 'kpi_4', name: 'KPI Ownership', description: 'Assign KPI ownership', category: 'kpi', status: 'active', lastModified: '2024-01-09' },
  { id: 'kpi_5', name: 'Alert Rules', description: 'Configure KPI alert rules', category: 'kpi', status: 'active', lastModified: '2024-01-08' },
  
  // Analytics Setup
  { id: 'analytics_1', name: 'Data Refresh Schedule', description: 'Configure data refresh intervals', category: 'analytics', status: 'active', lastModified: '2024-01-07' },
  { id: 'analytics_2', name: 'Aggregation Rules', description: 'Data aggregation configuration', category: 'analytics', status: 'active', lastModified: '2024-01-06' },
  { id: 'analytics_3', name: 'Data Warehouse Mapping', description: 'Map data sources to warehouse', category: 'analytics', status: 'active', lastModified: '2024-01-05' },
  { id: 'analytics_4', name: 'Security Policies', description: 'Configure data access policies', category: 'analytics', status: 'active', lastModified: '2024-01-04' },
];

const CONFIG_CATEGORIES = [
  { id: 'dashboard', label: 'Dashboard Setup', icon: LayoutDashboard },
  { id: 'kpi', label: 'KPI Setup', icon: Target },
  { id: 'analytics', label: 'Analytics Setup', icon: Database },
];

const Configuration = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = selectedCategory === 'all' 
    ? CONFIG_ITEMS 
    : CONFIG_ITEMS.filter(item => item.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      dashboard: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      kpi: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      analytics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[category as keyof typeof colors] || colors.dashboard;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dashboard setup, KPI configuration, and analytics settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Config</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Configuration Categories */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Settings className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Settings</p>
        </button>
        {CONFIG_CATEGORIES.map(cat => {
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

      {/* Configuration Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Modified: {item.lastModified}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1 ${item.status === 'active' ? 'text-emerald-600' : 'text-gray-600'}`}>
                {item.status === 'active' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Dashboard Widget', icon: Plus },
            { label: 'Create KPI', icon: Target },
            { label: 'Set Alert Threshold', icon: Bell },
            { label: 'Configure Data Source', icon: Database },
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

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Data Warehouse', status: 'Online', color: 'bg-emerald-500' },
            { label: 'Analytics Engine', status: 'Online', color: 'bg-emerald-500' },
            { label: 'Alert System', status: 'Online', color: 'bg-emerald-500' },
            { label: 'Security Policies', status: 'Active', color: 'bg-blue-500' },
          ].map((system, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${system.color}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{system.label}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{system.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
