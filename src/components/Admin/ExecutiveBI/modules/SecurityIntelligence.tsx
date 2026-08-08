/**
 * Security Intelligence Module
 * 
 * Analytics:
 * - Incident Trends
 * - Risk Heat Maps
 * - Fraud Analytics
 * - Access Violations
 * - Emergency Response
 * - Compliance Metrics
 */

import { useState } from 'react';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Map,
  Lock,
  Activity,
  Download,
  Filter,
  Calendar,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'incidents' | 'risk' | 'fraud' | 'access' | 'emergency' | 'compliance';
}

const SECURITY_ANALYTICS = [
  // Incident Trends
  { id: 'total_incidents', name: 'Total Incidents', value: 12, target: 15, unit: '', trend: -20, category: 'incidents' },
  { id: 'resolved_incidents', name: 'Resolved Incidents', value: 10, target: 12, unit: '', trend: -17, category: 'incidents' },
  { id: 'open_incidents', name: 'Open Incidents', value: 2, target: 3, unit: '', trend: -33, category: 'incidents' },
  { id: 'incident_rate', name: 'Incident Rate', value: 0.4, target: 0.5, unit: '/day', trend: -20, category: 'incidents' },
  
  // Risk Heat Maps
  { id: 'risk_score', name: 'Overall Risk Score', value: 35, target: 40, unit: '/100', trend: -12, category: 'risk' },
  { id: 'high_risk_areas', name: 'High Risk Areas', value: 3, target: 5, unit: '', trend: -40, category: 'risk' },
  { id: 'medium_risk_areas', name: 'Medium Risk Areas', value: 8, target: 10, unit: '', trend: -20, category: 'risk' },
  { id: 'low_risk_areas', name: 'Low Risk Areas', value: 15, target: 12, unit: '', trend: 25, category: 'risk' },
  
  // Fraud Analytics
  { id: 'fraud_cases', name: 'Fraud Cases', value: 2, target: 3, unit: '', trend: -33, category: 'fraud' },
  { id: 'fraud_prevented', name: 'Fraud Prevented', value: 5, target: 3, unit: '', trend: 67, category: 'fraud' },
  { id: 'fraud_value', name: 'Fraud Value', value: 4500, target: 8000, unit: '$', trend: -44, category: 'fraud' },
  
  // Access Violations
  { id: 'access_violations', name: 'Access Violations', value: 8, target: 10, unit: '', trend: -20, category: 'access' },
  { id: 'unauthorized_access', name: 'Unauthorized Access', value: 3, target: 5, unit: '', trend: -40, category: 'access' },
  { id: 'keycard_issues', name: 'Keycard Issues', value: 5, target: 5, unit: '', trend: 0, category: 'access' },
  
  // Emergency Response
  { id: 'response_time', name: 'Avg Response Time', value: 4.5, target: 5, unit: 'min', trend: -10, category: 'emergency' },
  { id: 'emergency_drills', name: 'Emergency Drills', value: 4, target: 4, unit: '/quarter', trend: 0, category: 'emergency' },
  { id: 'drill_participation', name: 'Drill Participation', value: 92, target: 90, unit: '%', trend: 2, category: 'emergency' },
  
  // Compliance Metrics
  { id: 'compliance_score', name: 'Compliance Score', value: 94, target: 90, unit: '%', trend: 4, category: 'compliance' },
  { id: 'safety_compliance', name: 'Safety Compliance', value: 96, target: 95, unit: '%', trend: 1, category: 'compliance' },
  { id: 'audit_findings', name: 'Audit Findings', value: 3, target: 5, unit: '', trend: -40, category: 'compliance' },
];

const SECURITY_CATEGORIES = [
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'risk', label: 'Risk', icon: Map },
  { id: 'fraud', label: 'Fraud', icon: Shield },
  { id: 'access', label: 'Access', icon: Lock },
  { id: 'emergency', label: 'Emergency', icon: Activity },
  { id: 'compliance', label: 'Compliance', icon: FileText },
];

const SecurityIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? SECURITY_ANALYTICS 
    : SECURITY_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Security Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Incident trends, risk analysis, and compliance metrics
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

      {/* Security Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Shield className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {SECURITY_CATEGORIES.map(cat => {
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

      {/* Security Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === '/day' ? '/day' : metric.unit === '/quarter' ? '/quarter' : metric.unit === 'min' ? ' min' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === '/day' ? '/day' : metric.unit === '/quarter' ? '/quarter' : metric.unit === 'min' ? ' min' : ''}
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

      {/* Incident Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Incident Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'Theft', count: 3, trend: -25, color: 'bg-rose-500' },
            { type: 'Safety', count: 4, trend: -20, color: 'bg-amber-500' },
            { type: 'Access', count: 2, trend: -50, color: 'bg-blue-500' },
            { type: 'Other', count: 3, trend: 0, color: 'bg-gray-500' },
          ].map((incident, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${incident.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{incident.type}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{incident.count}</p>
              <span className={`text-xs font-medium ${
                incident.trend >= 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {incident.trend >= 0 ? '+' : ''}{incident.trend}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Assessment
        </h3>
        <div className="space-y-4">
          {[
            { area: 'Guest Rooms', risk: 'Low', score: 25, trend: -10 },
            { area: 'Parking Areas', risk: 'Medium', score: 45, trend: -5 },
            { area: 'Public Areas', risk: 'Low', score: 30, trend: -15 },
            { area: 'Storage Areas', risk: 'Medium', score: 50, trend: 0 },
          ].map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{risk.area}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Risk Level: {risk.risk}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{risk.score}</p>
                <span className={`text-xs font-medium ${
                  risk.trend >= 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {risk.trend >= 0 ? '+' : ''}{risk.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityIntelligence;
