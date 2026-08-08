/**
 * Alerts & Exceptions Module
 * 
 * Automatic alerts for:
 * - Revenue Drop
 * - Occupancy Drop
 * - Cost Overrun
 * - Budget Variance
 * - Guest Satisfaction Decline
 * - Labor Cost Increase
 * - Inventory Shortage
 * - Fraud Indicators
 * - Energy Spike
 * - Compliance Violations
 */

import { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Bed,
  Users,
  Package,
  Shield,
  Zap,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Calendar,
  Bell,
  XCircle
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'revenue' | 'occupancy' | 'cost' | 'budget' | 'satisfaction' | 'labor' | 'inventory' | 'fraud' | 'energy' | 'compliance';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  value: number;
  threshold: number;
}

const ALERTS = [
  // Revenue Drop
  { id: 'alert_rev_1', title: 'Revenue Drop Alert', description: 'Daily revenue dropped 15% below threshold', severity: 'high', category: 'revenue', status: 'active', timestamp: '2024-01-15 09:30', value: 85000, threshold: 100000 },
  { id: 'alert_rev_2', title: 'Weekly Revenue Variance', description: 'Weekly revenue 8% below forecast', severity: 'medium', category: 'revenue', status: 'acknowledged', timestamp: '2024-01-14 14:00', value: 275000, threshold: 300000 },
  
  // Occupancy Drop
  { id: 'alert_occ_1', title: 'Occupancy Drop Alert', description: 'Occupancy dropped to 65% (threshold: 75%)', severity: 'high', category: 'occupancy', status: 'active', timestamp: '2024-01-15 08:00', value: 65, threshold: 75 },
  { id: 'alert_occ_2', title: 'Future Occupancy Warning', description: 'Occupancy forecast for next week shows 20% drop', severity: 'medium', category: 'occupancy', status: 'acknowledged', timestamp: '2024-01-14 10:00', value: 58, threshold: 72 },
  
  // Cost Overrun
  { id: 'alert_cost_1', title: 'Labor Cost Overrun', description: 'Labor costs exceeded budget by 12%', severity: 'high', category: 'cost', status: 'active', timestamp: '2024-01-15 07:00', value: 44800, threshold: 40000 },
  { id: 'alert_cost_2', title: 'Energy Cost Spike', description: 'Energy costs increased by 25% this month', severity: 'medium', category: 'cost', status: 'acknowledged', timestamp: '2024-01-13 16:00', value: 35000, threshold: 28000 },
  
  // Budget Variance
  { id: 'alert_budget_1', title: 'Budget Variance Alert', description: 'F&B department exceeded budget by 15%', severity: 'high', category: 'budget', status: 'active', timestamp: '2024-01-15 06:00', value: 34500, threshold: 30000 },
  { id: 'alert_budget_2', title: 'Capital Budget Variance', description: 'Capital spending 20% above budget', severity: 'medium', category: 'budget', status: 'acknowledged', timestamp: '2024-01-12 11:00', value: 60000, threshold: 50000 },
  
  // Guest Satisfaction Decline
  { id: 'alert_sat_1', title: 'Guest Satisfaction Drop', description: 'Guest satisfaction dropped to 3.8 (threshold: 4.0)', severity: 'critical', category: 'satisfaction', status: 'active', timestamp: '2024-01-15 05:00', value: 3.8, threshold: 4.0 },
  { id: 'alert_sat_2', title: 'NPS Decline Warning', description: 'NPS dropped 5 points this week', severity: 'medium', category: 'satisfaction', status: 'acknowledged', timestamp: '2024-01-14 09:00', value: 68, threshold: 72 },
  
  // Labor Cost Increase
  { id: 'alert_labor_1', title: 'Overtime Cost Increase', description: 'Overtime costs increased by 30%', severity: 'high', category: 'labor', status: 'active', timestamp: '2024-01-15 04:00', value: 32500, threshold: 25000 },
  { id: 'alert_labor_2', title: 'Staffing Cost Variance', description: 'Staffing costs 10% above budget', severity: 'medium', category: 'labor', status: 'acknowledged', timestamp: '2024-01-13 08:00', value: 46200, threshold: 42000 },
  
  // Inventory Shortage
  { id: 'alert_inv_1', title: 'Food Inventory Shortage', description: 'Critical food items below minimum stock', severity: 'high', category: 'inventory', status: 'active', timestamp: '2024-01-15 03:00', value: 25, threshold: 50 },
  { id: 'alert_inv_2', title: 'Beverage Stock Low', description: 'Premium beverages at 20% stock level', severity: 'medium', category: 'inventory', status: 'acknowledged', timestamp: '2024-01-14 07:00', value: 20, threshold: 30 },
  
  // Fraud Indicators
  { id: 'alert_fraud_1', title: 'Unusual Transaction Pattern', description: 'Unusual transaction pattern detected in F&B', severity: 'critical', category: 'fraud', status: 'active', timestamp: '2024-01-15 02:00', value: 8500, threshold: 5000 },
  { id: 'alert_fraud_2', title: 'Access Violation Alert', description: 'Multiple access violations detected', severity: 'high', category: 'fraud', status: 'acknowledged', timestamp: '2024-01-13 06:00', value: 5, threshold: 2 },
  
  // Energy Spike
  { id: 'alert_energy_1', title: 'Energy Consumption Spike', description: 'Energy usage 40% above normal', severity: 'high', category: 'energy', status: 'active', timestamp: '2024-01-15 01:00', value: 140, threshold: 100 },
  { id: 'alert_energy_2', title: 'Water Usage Anomaly', description: 'Water consumption 25% above average', severity: 'medium', category: 'energy', status: 'acknowledged', timestamp: '2024-01-14 05:00', value: 52500, threshold: 42000 },
  
  // Compliance Violations
  { id: 'alert_comp_1', title: 'Fire Safety Compliance', description: 'Fire safety inspection due in 3 days - 2 items outstanding', severity: 'critical', category: 'compliance', status: 'active', timestamp: '2024-01-15 00:00', value: 2, threshold: 0 },
  { id: 'alert_comp_2', title: 'Health Inspection Warning', description: 'Health inspection scheduled - 1 item needs attention', severity: 'high', category: 'compliance', status: 'acknowledged', timestamp: '2024-01-12 04:00', value: 1, threshold: 0 },
];

const ALERT_CATEGORIES = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'occupancy', label: 'Occupancy', icon: Bed },
  { id: 'cost', label: 'Cost', icon: TrendingDown },
  { id: 'budget', label: 'Budget', icon: FileText },
  { id: 'satisfaction', label: 'Satisfaction', icon: Users },
  { id: 'labor', label: 'Labor', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'fraud', label: 'Fraud', icon: Shield },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'compliance', label: 'Compliance', icon: FileText },
];

const AlertsExceptions = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredAlerts = ALERTS.filter(alert => {
    const categoryMatch = selectedCategory === 'all' || alert.category === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const statusMatch = selectedStatus === 'all' || alert.status === selectedStatus;
    return categoryMatch && severityMatch && statusMatch;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-500',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-500',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      acknowledged: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const activeAlertsCount = ALERTS.filter(a => a.status === 'active').length;
  const criticalAlertsCount = ALERTS.filter(a => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts & Exceptions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time alerts for revenue, occupancy, costs, and compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-900 dark:text-rose-400">Active Alerts</span>
          </div>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-400">{activeAlertsCount}</p>
        </div>
        <div className="bg-rose-100 dark:bg-rose-900/30 border border-rose-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-500" />
            <span className="text-sm font-medium text-rose-900 dark:text-rose-400">Critical</span>
          </div>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-400">{criticalAlertsCount}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-400">Acknowledged</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-400">{ALERTS.filter(a => a.status === 'acknowledged').length}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-400">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">{ALERTS.filter(a => a.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Alert Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-2 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All</p>
        </button>
        {ALERT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-2 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{alert.timestamp}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Threshold</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.threshold.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.status === 'active' && (
                  <>
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Dismiss
                    </button>
                    <button className="px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Acknowledge
                    </button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <button className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsExceptions;
