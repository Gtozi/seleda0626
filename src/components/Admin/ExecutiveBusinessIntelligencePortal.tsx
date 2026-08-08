/**
 * Executive & Business Intelligence (EBI) Portal
 * Version: 2.0
 * 
 * The executive command center of the Hotel ERP that consolidates information from every
 * ERP module into a single source of truth for strategic decision-making.
 * 
 * This portal does not own operational data - it consumes, aggregates, analyzes, and
 * visualizes enterprise data without becoming the system of record.
 */

import { useState } from 'react';
import {
  LayoutGrid,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Utensils,
  Wrench,
  Briefcase,
  ShoppingCart,
  Shield,
  Leaf,
  Scale,
  Target,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Search,
  Settings,
  RefreshCw,
  Download,
  Bell,
  Building2,
  Globe,
  Calendar,
  FileText,
  Zap,
  Award,
  ClipboardCheck,
  FileSearch,
  Database,
  Sliders
} from 'lucide-react';

// Module imports
import ExecutiveDashboard from './ExecutiveBI/modules/ExecutiveDashboard';
import EnterpriseKPIcenter from './ExecutiveBI/modules/EnterpriseKPIcenter';
import OperationalIntelligence from './ExecutiveBI/modules/OperationalIntelligence';
import FinancialIntelligence from './ExecutiveBI/modules/FinancialIntelligence';
import RevenueIntelligence from './ExecutiveBI/modules/RevenueIntelligence';
import GuestIntelligence from './ExecutiveBI/modules/GuestIntelligence';
import SalesMarketingIntelligence from './ExecutiveBI/modules/SalesMarketingIntelligence';
import FoodBeverageIntelligence from './ExecutiveBI/modules/FoodBeverageIntelligence';
import HousekeepingIntelligence from './ExecutiveBI/modules/HousekeepingIntelligence';
import EngineeringIntelligence from './ExecutiveBI/modules/EngineeringIntelligence';
import HumanCapitalIntelligence from './ExecutiveBI/modules/HumanCapitalIntelligence';
import ProcurementIntelligence from './ExecutiveBI/modules/ProcurementIntelligence';
import InventoryIntelligence from './ExecutiveBI/modules/InventoryIntelligence';
import SecurityIntelligence from './ExecutiveBI/modules/SecurityIntelligence';
import SustainabilityIntelligence from './ExecutiveBI/modules/SustainabilityIntelligence';
import Benchmarking from './ExecutiveBI/modules/Benchmarking';
import Forecasting from './ExecutiveBI/modules/Forecasting';
import AIDecisionSupport from './ExecutiveBI/modules/AIDecisionSupport';
import StrategicPlanning from './ExecutiveBI/modules/StrategicPlanning';
import AlertsExceptions from './ExecutiveBI/modules/AlertsExceptions';
import ReportsCenter from './ExecutiveBI/modules/ReportsCenter';
import EnterpriseDataExplorer from './ExecutiveBI/modules/EnterpriseDataExplorer';
import Configuration from './ExecutiveBI/modules/Configuration';

type EBIModule = 
  | 'executive-dashboard'
  | 'enterprise-kpi-center'
  | 'operational-intelligence'
  | 'financial-intelligence'
  | 'revenue-intelligence'
  | 'guest-intelligence'
  | 'sales-marketing-intelligence'
  | 'food-beverage-intelligence'
  | 'housekeeping-intelligence'
  | 'engineering-intelligence'
  | 'human-capital-intelligence'
  | 'procurement-intelligence'
  | 'inventory-intelligence'
  | 'security-intelligence'
  | 'sustainability-intelligence'
  | 'benchmarking'
  | 'forecasting'
  | 'ai-decision-support'
  | 'strategic-planning'
  | 'alerts-exceptions'
  | 'reports-center'
  | 'enterprise-data-explorer'
  | 'configuration';

interface ModuleConfig {
  id: EBIModule;
  label: string;
  icon: any;
  description: string;
  category: 'dashboard' | 'intelligence' | 'analytics' | 'planning' | 'management';
  priority: 'high' | 'medium' | 'low';
}

const MODULES: ModuleConfig[] = [
  // Dashboard
  { 
    id: 'executive-dashboard', 
    label: 'Executive Dashboard', 
    icon: LayoutGrid, 
    description: 'Enterprise KPIs & strategic metrics', 
    category: 'dashboard', 
    priority: 'high' 
  },
  { 
    id: 'enterprise-kpi-center', 
    label: 'Enterprise KPI Center', 
    icon: BarChart3, 
    description: 'KPI scorecards & trend analysis', 
    category: 'dashboard', 
    priority: 'high' 
  },
  
  // Intelligence Modules
  { 
    id: 'operational-intelligence', 
    label: 'Operational Intelligence', 
    icon: Activity, 
    description: 'Consolidated operational analytics', 
    category: 'intelligence', 
    priority: 'high' 
  },
  { 
    id: 'financial-intelligence', 
    label: 'Financial Intelligence', 
    icon: DollarSign, 
    description: 'P&L, cash flow, budget analysis', 
    category: 'intelligence', 
    priority: 'high' 
  },
  { 
    id: 'revenue-intelligence', 
    label: 'Revenue Intelligence', 
    icon: TrendingUp, 
    description: 'Occupancy, ADR, RevPAR analytics', 
    category: 'intelligence', 
    priority: 'high' 
  },
  { 
    id: 'guest-intelligence', 
    label: 'Guest Intelligence', 
    icon: Users, 
    description: 'Guest demographics & satisfaction', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'sales-marketing-intelligence', 
    label: 'Sales & Marketing Intelligence', 
    icon: Target, 
    description: 'Pipeline, conversion, campaign ROI', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'food-beverage-intelligence', 
    label: 'Food & Beverage Intelligence', 
    icon: Utensils, 
    description: 'Restaurant performance & menu analysis', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'housekeeping-intelligence', 
    label: 'Housekeeping Intelligence', 
    icon: Award, 
    description: 'Productivity & room turnaround', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'engineering-intelligence', 
    label: 'Engineering Intelligence', 
    icon: Wrench, 
    description: 'Asset performance & maintenance', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'human-capital-intelligence', 
    label: 'Human Capital Intelligence', 
    icon: Briefcase, 
    description: 'Headcount, labor cost, productivity', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'procurement-intelligence', 
    label: 'Procurement Intelligence', 
    icon: ShoppingCart, 
    description: 'Spend analysis & vendor performance', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'inventory-intelligence', 
    label: 'Inventory Intelligence', 
    icon: Database, 
    description: 'Stock value & turnover analysis', 
    category: 'intelligence', 
    priority: 'low' 
  },
  { 
    id: 'security-intelligence', 
    label: 'Security Intelligence', 
    icon: Shield, 
    description: 'Incidents & risk analytics', 
    category: 'intelligence', 
    priority: 'medium' 
  },
  { 
    id: 'sustainability-intelligence', 
    label: 'Sustainability Intelligence', 
    icon: Leaf, 
    description: 'ESG metrics & environmental KPIs', 
    category: 'intelligence', 
    priority: 'low' 
  },
  
  // Analytics
  { 
    id: 'benchmarking', 
    label: 'Benchmarking', 
    icon: Scale, 
    description: 'Compare vs budget, forecast, industry', 
    category: 'analytics', 
    priority: 'medium' 
  },
  { 
    id: 'forecasting', 
    label: 'Forecasting', 
    icon: Calendar, 
    description: 'Revenue, occupancy, demand forecasts', 
    category: 'analytics', 
    priority: 'high' 
  },
  { 
    id: 'ai-decision-support', 
    label: 'AI Decision Support', 
    icon: Zap, 
    description: 'AI-powered recommendations', 
    category: 'analytics', 
    priority: 'medium' 
  },
  
  // Planning
  { 
    id: 'strategic-planning', 
    label: 'Strategic Planning', 
    icon: ClipboardCheck, 
    description: 'Business plans, OKRs, targets', 
    category: 'planning', 
    priority: 'medium' 
  },
  
  // Management
  { 
    id: 'alerts-exceptions', 
    label: 'Alerts & Exceptions', 
    icon: AlertTriangle, 
    description: 'Real-time alerts & exceptions', 
    category: 'management', 
    priority: 'high' 
  },
  { 
    id: 'reports-center', 
    label: 'Reports Center', 
    icon: FileBarChart, 
    description: 'Executive & operational reports', 
    category: 'management', 
    priority: 'high' 
  },
  { 
    id: 'enterprise-data-explorer', 
    label: 'Enterprise Data Explorer', 
    icon: Search, 
    description: 'Self-service analytics & drill-down', 
    category: 'management', 
    priority: 'medium' 
  },
  { 
    id: 'configuration', 
    label: 'Configuration', 
    icon: Sliders, 
    description: 'Dashboard setup & KPI configuration', 
    category: 'management', 
    priority: 'low' 
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  dashboard: 'Dashboards',
  intelligence: 'Intelligence',
  analytics: 'Analytics',
  planning: 'Planning',
  management: 'Management'
};

const ExecutiveBusinessIntelligencePortal = ({ activeTab = 'executive-dashboard' }: { activeTab?: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModule, setActiveModule] = useState<EBIModule>(activeTab as EBIModule || 'executive-dashboard');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const filteredModules = selectedCategory === 'all' 
    ? MODULES 
    : MODULES.filter(m => m.category === selectedCategory);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
  };

  return (
    <div className="space-y-6 animate-fade-in" id="executive-business-intelligence-portal">
      {/* Portal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Executive & Business Intelligence Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enterprise decision support and strategic analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="relative p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {MODULES.map(module => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                activeModule === module.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium truncate">{module.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All Categories
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === key
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Module Content */}
      <div className="min-h-[600px]">
        {activeModule === 'executive-dashboard' && <ExecutiveDashboard />}
        {activeModule === 'enterprise-kpi-center' && <EnterpriseKPIcenter />}
        {activeModule === 'operational-intelligence' && <OperationalIntelligence />}
        {activeModule === 'financial-intelligence' && <FinancialIntelligence />}
        {activeModule === 'revenue-intelligence' && <RevenueIntelligence />}
        {activeModule === 'guest-intelligence' && <GuestIntelligence />}
        {activeModule === 'sales-marketing-intelligence' && <SalesMarketingIntelligence />}
        {activeModule === 'food-beverage-intelligence' && <FoodBeverageIntelligence />}
        {activeModule === 'housekeeping-intelligence' && <HousekeepingIntelligence />}
        {activeModule === 'engineering-intelligence' && <EngineeringIntelligence />}
        {activeModule === 'human-capital-intelligence' && <HumanCapitalIntelligence />}
        {activeModule === 'procurement-intelligence' && <ProcurementIntelligence />}
        {activeModule === 'inventory-intelligence' && <InventoryIntelligence />}
        {activeModule === 'security-intelligence' && <SecurityIntelligence />}
        {activeModule === 'sustainability-intelligence' && <SustainabilityIntelligence />}
        {activeModule === 'benchmarking' && <Benchmarking />}
        {activeModule === 'forecasting' && <Forecasting />}
        {activeModule === 'ai-decision-support' && <AIDecisionSupport />}
        {activeModule === 'strategic-planning' && <StrategicPlanning />}
        {activeModule === 'alerts-exceptions' && <AlertsExceptions />}
        {activeModule === 'reports-center' && <ReportsCenter />}
        {activeModule === 'enterprise-data-explorer' && <EnterpriseDataExplorer />}
        {activeModule === 'configuration' && <Configuration />}
      </div>

      {/* Last Refreshed Info */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last refreshed: {lastRefreshed.toLocaleString()}
      </div>
    </div>
  );
};

export default ExecutiveBusinessIntelligencePortal;
