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
  PieChart,
  Package
} from 'lucide-react';

import RMSDashboard from './RMSDashboard';
import PricingRecommendations from './PricingRecommendations';
import CompetitorManagement from './CompetitorManagement';
import DemandForecasts from './DemandForecasts';
import LOSRules from './LOSRules';
import CorporateRates from './CorporateRates';
import ChannelManager from './ChannelManager';
import DynamicPricing from './DynamicPricing';
import RateManagement from './RateManagement';
import InventoryControls from './InventoryControls';
import YieldManagement from './YieldManagement';
import MarketSegmentation from './MarketSegmentation';
import ChannelPerformance from './ChannelPerformance';
import DistributionManagement from './DistributionManagement';
import GroupEvaluation from './GroupEvaluation';
import DisplacementAnalysis from './DisplacementAnalysis';
import OverbookingManagement from './OverbookingManagement';
import RestrictionsManagement from './RestrictionsManagement';
import PackagePricing from './PackagePricing';
import PromotionsAnalysis from './PromotionsAnalysis';
import BusinessIntelligence from './BusinessIntelligence';
import AIRecommendations from './AIRecommendations';
import ScenarioPlanning from './ScenarioPlanning';
import Reports from './Reports';
import Configuration from './Configuration';

type RMSModule = 
  | 'dashboard' 
  | 'recommendations' 
  | 'competitors' 
  | 'forecasts' 
  | 'los' 
  | 'corporate' 
  | 'channels'
  | 'dynamic_pricing'
  | 'rate_management'
  | 'inventory_controls'
  | 'yield_management'
  | 'market_segmentation'
  | 'channel_performance'
  | 'distribution_management'
  | 'group_evaluation'
  | 'displacement_analysis'
  | 'overbooking_management'
  | 'restrictions_management'
  | 'package_pricing'
  | 'promotions_analysis'
  | 'business_intelligence'
  | 'ai_recommendations'
  | 'scenario_planning'
  | 'reports'
  | 'configuration';

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
          <ModuleButton
            icon={<TrendingUp className="w-4 h-4" />}
            label="Dynamic Pricing"
            active={activeModule === 'dynamic_pricing'}
            module="dynamic_pricing"
          />
          <ModuleButton
            icon={<DollarSign className="w-4 h-4" />}
            label="Rate Management"
            active={activeModule === 'rate_management'}
            module="rate_management"
          />
          <ModuleButton
            icon={<Bed className="w-4 h-4" />}
            label="Inventory"
            active={activeModule === 'inventory_controls'}
            module="inventory_controls"
          />
          <ModuleButton
            icon={<Target className="w-4 h-4" />}
            label="Yield Mgmt"
            active={activeModule === 'yield_management'}
            module="yield_management"
          />
          <ModuleButton
            icon={<Users className="w-4 h-4" />}
            label="Segments"
            active={activeModule === 'market_segmentation'}
            module="market_segmentation"
          />
          <ModuleButton
            icon={<LineChart className="w-4 h-4" />}
            label="Channel Perf"
            active={activeModule === 'channel_performance'}
            module="channel_performance"
          />
          <ModuleButton
            icon={<PieChart className="w-4 h-4" />}
            label="Distribution"
            active={activeModule === 'distribution_management'}
            module="distribution_management"
          />
          <ModuleButton
            icon={<Users className="w-4 h-4" />}
            label="Group Eval"
            active={activeModule === 'group_evaluation'}
            module="group_evaluation"
          />
          <ModuleButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Displacement"
            active={activeModule === 'displacement_analysis'}
            module="displacement_analysis"
          />
          <ModuleButton
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Overbooking"
            active={activeModule === 'overbooking_management'}
            module="overbooking_management"
          />
          <ModuleButton
            icon={<Calendar className="w-4 h-4" />}
            label="Restrictions"
            active={activeModule === 'restrictions_management'}
            module="restrictions_management"
          />
          <ModuleButton
            icon={<Package className="w-4 h-4" />}
            label="Packages"
            active={activeModule === 'package_pricing'}
            module="package_pricing"
          />
          <ModuleButton
            icon={<Activity className="w-4 h-4" />}
            label="Promotions"
            active={activeModule === 'promotions_analysis'}
            module="promotions_analysis"
          />
          <ModuleButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="BI"
            active={activeModule === 'business_intelligence'}
            module="business_intelligence"
          />
          <ModuleButton
            icon={<Target className="w-4 h-4" />}
            label="AI Recs"
            active={activeModule === 'ai_recommendations'}
            module="ai_recommendations"
          />
          <ModuleButton
            icon={<Activity className="w-4 h-4" />}
            label="Scenarios"
            active={activeModule === 'scenario_planning'}
            module="scenario_planning"
          />
          <ModuleButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Reports"
            active={activeModule === 'reports'}
            module="reports"
          />
          <ModuleButton
            icon={<Settings className="w-4 h-4" />}
            label="Config"
            active={activeModule === 'configuration'}
            module="configuration"
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
        {activeModule === 'dynamic_pricing' && <DynamicPricing />}
        {activeModule === 'rate_management' && <RateManagement />}
        {activeModule === 'inventory_controls' && <InventoryControls />}
        {activeModule === 'yield_management' && <YieldManagement />}
        {activeModule === 'market_segmentation' && <MarketSegmentation />}
        {activeModule === 'channel_performance' && <ChannelPerformance />}
        {activeModule === 'distribution_management' && <DistributionManagement />}
        {activeModule === 'group_evaluation' && <GroupEvaluation />}
        {activeModule === 'displacement_analysis' && <DisplacementAnalysis />}
        {activeModule === 'overbooking_management' && <OverbookingManagement />}
        {activeModule === 'restrictions_management' && <RestrictionsManagement />}
        {activeModule === 'package_pricing' && <PackagePricing />}
        {activeModule === 'promotions_analysis' && <PromotionsAnalysis />}
        {activeModule === 'business_intelligence' && <BusinessIntelligence />}
        {activeModule === 'ai_recommendations' && <AIRecommendations />}
        {activeModule === 'scenario_planning' && <ScenarioPlanning />}
        {activeModule === 'reports' && <Reports />}
        {activeModule === 'configuration' && <Configuration />}
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
