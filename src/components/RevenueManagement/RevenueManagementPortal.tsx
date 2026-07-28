/**
 * Revenue Management Portal
 * Phase 2: RMS Dashboard with dynamic pricing, demand forecasting, and competitor analysis
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bed,
  Target,
  Calendar,
  RefreshCw,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Activity,
  LineChart,
  PieChart
} from 'lucide-react';

import RMSDashboard from './RMSDashboard';
import PricingRecommendations from './PricingRecommendations';
import CompetitorManagement from './CompetitorManagement';
import DemandForecasts from './DemandForecasts';
import LOSRules from './LOSRules';
import CorporateRates from './CorporateRates';
import ChannelManager from './ChannelManager';

type RMSModule = 'dashboard' | 'recommendations' | 'competitors' | 'forecasts' | 'los' | 'corporate' | 'channels';

const RevenueManagementPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Daily pricing recommendations generated', time: '10 min ago' },
    { id: 2, type: 'warning', message: 'Rate parity violation detected for Booking.com', time: '1 hour ago' },
    { id: 3, type: 'info', message: 'Expedia sync completed successfully', time: '2 hours ago' }
  ]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    // Trigger data refresh
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Dynamic pricing & demand forecasting</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Last refreshed</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {lastRefreshed.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <ModuleButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Dashboard"
            active={activeModule === 'dashboard'}
            module="dashboard"
          />
          <ModuleButton
            icon={<Target className="w-4 h-4" />}
            label="Recommendations"
            active={activeModule === 'recommendations'}
            module="recommendations"
          />
          <ModuleButton
            icon={<Users className="w-4 h-4" />}
            label="Competitors"
            active={activeModule === 'competitors'}
            module="competitors"
          />
          <ModuleButton
            icon={<Activity className="w-4 h-4" />}
            label="Forecasts"
            active={activeModule === 'forecasts'}
            module="forecasts"
          />
          <ModuleButton
            icon={<Calendar className="w-4 h-4" />}
            label="LOS Rules"
            active={activeModule === 'los'}
            module="los"
          />
          <ModuleButton
            icon={<DollarSign className="w-4 h-4" />}
            label="Corporate Rates"
            active={activeModule === 'corporate'}
            module="corporate"
          />
          <ModuleButton
            icon={<LineChart className="w-4 h-4" />}
            label="Channel Manager"
            active={activeModule === 'channels'}
            module="channels"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {activeModule === 'dashboard' && <RMSDashboard />}
        {activeModule === 'recommendations' && <PricingRecommendations />}
        {activeModule === 'competitors' && <CompetitorManagement />}
        {activeModule === 'forecasts' && <DemandForecasts />}
        {activeModule === 'los' && <LOSRules />}
        {activeModule === 'corporate' && <CorporateRates />}
        {activeModule === 'channels' && <ChannelManager />}
      </div>
    </div>
  );
};

interface ModuleButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  module: RMSModule;
}

const ModuleButton: React.FC<ModuleButtonProps> = ({ icon, label, active, module }) => {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default RevenueManagementPortal;
