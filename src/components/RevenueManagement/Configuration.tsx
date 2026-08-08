/**
 * Configuration Component
 * Manages RMS settings, pricing rules, forecast settings, competitor settings, alert thresholds, and user preferences
 */

import React, { useState, useMemo } from 'react';
import {
  Settings,
  DollarSign,
  TrendingUp,
  Users,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

const Configuration = () => {
  const [selectedSection, setSelectedSection] = useState<'general' | 'pricing' | 'forecast' | 'competitor' | 'alerts' | 'preferences'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  const configSections = [
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'pricing', name: 'Pricing Rules', icon: DollarSign },
    { id: 'forecast', name: 'Forecast Settings', icon: TrendingUp },
    { id: 'competitor', name: 'Competitor Settings', icon: Users },
    { id: 'alerts', name: 'Alert Thresholds', icon: Bell },
    { id: 'preferences', name: 'User Preferences', icon: Shield }
  ];

  const generalSettings = useMemo(() => [
    { id: 'auto_update', name: 'Auto-update Rates', description: 'Automatically update rates based on demand', value: true, type: 'boolean' },
    { id: 'sync_channels', name: 'Sync Channels', description: 'Automatically sync rates to all channels', value: true, type: 'boolean' },
    { id: 'update_frequency', name: 'Update Frequency', description: 'How often to check for rate updates', value: 'hourly', type: 'select', options: ['real-time', 'hourly', 'daily'] },
    { id: 'default_currency', name: 'Default Currency', description: 'Currency for rate display', value: 'USD', type: 'select', options: ['USD', 'EUR', 'GBP', 'ETB'] },
    { id: 'timezone', name: 'Timezone', description: 'Timezone for rate calculations', value: 'UTC+3', type: 'select', options: ['UTC+3', 'UTC+0', 'UTC-5', 'UTC-8'] }
  ], []);

  const pricingRules = useMemo(() => [
    { id: 'min_rate', name: 'Minimum Rate', description: 'Minimum allowed rate for any room type', value: 80, type: 'number' },
    { id: 'max_rate', name: 'Maximum Rate', description: 'Maximum allowed rate for any room type', value: 500, type: 'number' },
    { id: 'rate_change_limit', name: 'Rate Change Limit', description: 'Maximum percentage change per update', value: 20, type: 'number' },
    { id: 'competitor_parity', name: 'Competitor Parity', description: 'Stay within X% of competitor rates', value: 10, type: 'number' },
    { id: 'loyalty_discount', name: 'Loyalty Discount', description: 'Default discount for loyalty members', value: 10, type: 'number' }
  ], []);

  const forecastSettings = useMemo(() => [
    { id: 'forecast_horizon', name: 'Forecast Horizon', description: 'Days to forecast ahead', value: 90, type: 'number' },
    { id: 'model_type', name: 'Forecast Model', description: 'AI model for demand forecasting', value: 'advanced', type: 'select', options: ['basic', 'standard', 'advanced'] },
    { id: 'include_events', name: 'Include Events', description: 'Factor in local events in forecasts', value: true, type: 'boolean' },
    { id: 'include_seasonality', name: 'Include Seasonality', description: 'Factor in seasonal patterns', value: true, type: 'boolean' },
    { id: 'update_frequency', name: 'Forecast Update', description: 'How often to regenerate forecasts', value: 'daily', type: 'select', options: ['hourly', 'daily', 'weekly'] }
  ], []);

  const competitorSettings = useMemo(() => [
    { id: 'auto_monitor', name: 'Auto Monitor', description: 'Automatically monitor competitor rates', value: true, type: 'boolean' },
    { id: 'check_frequency', name: 'Check Frequency', description: 'How often to check competitor rates', value: 'daily', type: 'select', options: ['hourly', 'daily', 'weekly'] },
    { id: 'competitor_count', name: 'Competitor Count', description: 'Number of competitors to track', value: 5, type: 'number' },
    { id: 'alert_threshold', name: 'Alert Threshold', description: 'Rate difference percentage for alerts', value: 15, type: 'number' },
    { id: 'include_ota', name: 'Include OTA Rates', description: 'Track OTA displayed rates', value: true, type: 'boolean' }
  ], []);

  const alertThresholds = useMemo(() => [
    { id: 'low_occupancy', name: 'Low Occupancy Alert', description: 'Alert when occupancy falls below', value: 60, type: 'number' },
    { id: 'high_occupancy', name: 'High Occupancy Alert', description: 'Alert when occupancy exceeds', value: 90, type: 'number' },
    { id: 'rate_parity', name: 'Rate Parity Alert', description: 'Alert on rate parity violation', value: true, type: 'boolean' },
    { id: 'forecast_variance', name: 'Forecast Variance', description: 'Alert when actual varies from forecast by', value: 15, type: 'number' },
    { id: 'competitor_change', name: 'Competitor Change Alert', description: 'Alert on significant competitor rate changes', value: true, type: 'boolean' }
  ], []);

  const userPreferences = useMemo(() => [
    { id: 'email_notifications', name: 'Email Notifications', description: 'Receive email alerts', value: true, type: 'boolean' },
    { id: 'push_notifications', name: 'Push Notifications', description: 'Receive push notifications', value: true, type: 'boolean' },
    { id: 'daily_summary', name: 'Daily Summary', description: 'Receive daily revenue summary', value: true, type: 'boolean' },
    { id: 'report_format', name: 'Default Report Format', description: 'Preferred format for reports', value: 'PDF', type: 'select', options: ['PDF', 'Excel', 'CSV'] },
    { id: 'dashboard_view', name: 'Default Dashboard View', description: 'Initial dashboard view', value: 'revenue', type: 'select', options: ['revenue', 'occupancy', 'adr', 'revpar'] }
  ], []);

  const getSettings = () => {
    switch (selectedSection) {
      case 'general': return generalSettings;
      case 'pricing': return pricingRules;
      case 'forecast': return forecastSettings;
      case 'competitor': return competitorSettings;
      case 'alerts': return alertThresholds;
      case 'preferences': return userPreferences;
      default: return generalSettings;
    }
  };

  const handleSave = () => {
    setHasChanges(false);
    // Save logic here
  };

  const handleReset = () => {
    setHasChanges(false);
    // Reset logic here
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuration</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage RMS settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {configSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{configSections.find(s => s.id === selectedSection)?.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Database className="w-4 h-4" />
            <span>Last synced: 5 min ago</span>
          </div>
        </div>
        <div className="space-y-4">
          {getSettings().map((setting) => (
            <SettingRow
              key={setting.id}
              setting={setting}
              onChange={() => setHasChanges(true)}
            />
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="Rate Engine"
            status="operational"
            lastUpdate="2 min ago"
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
          <StatusCard
            title="Forecast Engine"
            status="operational"
            lastUpdate="15 min ago"
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
          <StatusCard
            title="Channel Sync"
            status="operational"
            lastUpdate="5 min ago"
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
        </div>
      </div>

      {/* Configuration Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Configuration Tips</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Set appropriate rate change limits to prevent drastic price fluctuations</li>
              <li>• Enable competitor monitoring to stay competitive in the market</li>
              <li>• Configure alert thresholds to receive timely notifications</li>
              <li>• Review forecast settings regularly to improve accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingRowProps {
  setting: {
    id: string;
    name: string;
    description: string;
    value: any;
    type: 'boolean' | 'number' | 'select';
    options?: string[];
  };
  onChange: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ setting, onChange }) => {
  const renderInput = () => {
    switch (setting.type) {
      case 'boolean':
        return (
          <button
            onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              setting.value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                setting.value ? 'translate-x-6' : ''
              }`}
            />
          </button>
        );
      case 'number':
        return (
          <input
            type="number"
            defaultValue={setting.value}
            onChange={onChange}
            className="w-24 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          />
        );
      case 'select':
        return (
          <select
            defaultValue={setting.value}
            onChange={onChange}
            className="w-32 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            {setting.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-white">{setting.name}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
      </div>
      <div className="ml-4">
        {renderInput()}
      </div>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  status: string;
  lastUpdate: string;
  icon: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, lastUpdate, icon }) => {
  const statusColors = {
    operational: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">{lastUpdate}</span>
      </div>
    </div>
  );
};

export default Configuration;
