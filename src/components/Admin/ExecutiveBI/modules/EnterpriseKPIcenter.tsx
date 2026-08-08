/**
 * Enterprise KPI Center Module
 * 
 * This module provides comprehensive KPI management including:
 * - KPI Scorecards
 * - Trend Analysis
 * - Drill-down capabilities
 * - Goal Tracking
 * - KPI Ownership
 * - Benchmark Comparison
 * 
 * KPI Categories:
 * - Financial
 * - Operational
 * - Guest Experience
 * - Revenue
 * - Marketing
 * - Human Resources
 * - Procurement
 * - Sustainability
 * - Risk
 * - Asset Performance
 */

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  DollarSign,
  Activity,
  Star,
  Briefcase,
  ShoppingCart,
  Wrench,
  Shield,
  Leaf,
  Scale,
  Zap,
  Filter,
  Search,
  Download,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface KPIDefinition {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  target: number;
  threshold: number;
  unit: string;
  trend: number;
  owner: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  lastUpdated: string;
}

const KPI_CATEGORIES = [
  'Financial',
  'Operational',
  'Guest Experience',
  'Revenue',
  'Marketing',
  'Human Resources',
  'Procurement',
  'Sustainability',
  'Risk',
  'Asset Performance'
];

const MOCK_KPIS: KPIDefinition[] = [
  // Financial KPIs
  {
    id: 'total_revenue',
    name: 'Total Revenue',
    category: 'Financial',
    currentValue: 1250000,
    target: 1200000,
    threshold: 1100000,
    unit: '$',
    trend: 12,
    owner: 'CFO',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'gross_profit_margin',
    name: 'Gross Profit Margin',
    category: 'Financial',
    currentValue: 42,
    target: 40,
    threshold: 35,
    unit: '%',
    trend: 5,
    owner: 'CFO',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'ebitda',
    name: 'EBITDA',
    category: 'Financial',
    currentValue: 380000,
    target: 350000,
    threshold: 300000,
    unit: '$',
    trend: 8,
    owner: 'CFO',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Operational KPIs
  {
    id: 'occupancy_rate',
    name: 'Occupancy Rate',
    category: 'Operational',
    currentValue: 78,
    target: 75,
    threshold: 70,
    unit: '%',
    trend: 4,
    owner: 'GM',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'adr',
    name: 'Average Daily Rate',
    category: 'Operational',
    currentValue: 145,
    target: 140,
    threshold: 130,
    unit: '$',
    trend: 6,
    owner: 'Revenue Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'revpar',
    name: 'RevPAR',
    category: 'Operational',
    currentValue: 113,
    target: 105,
    threshold: 95,
    unit: '$',
    trend: 8,
    owner: 'Revenue Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Guest Experience KPIs
  {
    id: 'guest_satisfaction',
    name: 'Guest Satisfaction',
    category: 'Guest Experience',
    currentValue: 4.2,
    target: 4.0,
    threshold: 3.8,
    unit: '/5',
    trend: 5,
    owner: 'Front Office Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'nps',
    name: 'Net Promoter Score',
    category: 'Guest Experience',
    currentValue: 72,
    target: 70,
    threshold: 60,
    unit: '',
    trend: 3,
    owner: 'Marketing Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'complaint_rate',
    name: 'Complaint Rate',
    category: 'Guest Experience',
    currentValue: 2.1,
    target: 2.5,
    threshold: 3.0,
    unit: '%',
    trend: -15,
    owner: 'Front Office Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Revenue KPIs
  {
    id: 'revenue_per_available_room',
    name: 'Revenue Per Available Room',
    category: 'Revenue',
    currentValue: 156,
    target: 150,
    threshold: 140,
    unit: '$',
    trend: 7,
    owner: 'Revenue Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'booking_pace',
    name: 'Booking Pace',
    category: 'Revenue',
    currentValue: 78,
    target: 75,
    threshold: 70,
    unit: '%',
    trend: 5,
    owner: 'Revenue Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Marketing KPIs
  {
    id: 'lead_conversion_rate',
    name: 'Lead Conversion Rate',
    category: 'Marketing',
    currentValue: 28,
    target: 25,
    threshold: 20,
    unit: '%',
    trend: 12,
    owner: 'Sales Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'campaign_roi',
    name: 'Campaign ROI',
    category: 'Marketing',
    currentValue: 320,
    target: 300,
    threshold: 250,
    unit: '%',
    trend: 8,
    owner: 'Marketing Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Human Resources KPIs
  {
    id: 'labor_cost_percentage',
    name: 'Labor Cost %',
    category: 'Human Resources',
    currentValue: 32,
    target: 35,
    threshold: 40,
    unit: '%',
    trend: -8,
    owner: 'HR Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'employee_turnover',
    name: 'Employee Turnover',
    category: 'Human Resources',
    currentValue: 18,
    target: 20,
    threshold: 25,
    unit: '%',
    trend: -10,
    owner: 'HR Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'employee_satisfaction',
    name: 'Employee Satisfaction',
    category: 'Human Resources',
    currentValue: 3.8,
    target: 3.5,
    threshold: 3.2,
    unit: '/5',
    trend: 4,
    owner: 'HR Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Procurement KPIs
  {
    id: 'inventory_turnover',
    name: 'Inventory Turnover',
    category: 'Procurement',
    currentValue: 4.2,
    target: 4.0,
    threshold: 3.5,
    unit: 'x',
    trend: 5,
    owner: 'Procurement Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'vendor_performance',
    name: 'Vendor Performance',
    category: 'Procurement',
    currentValue: 4.1,
    target: 4.0,
    threshold: 3.5,
    unit: '/5',
    trend: 3,
    owner: 'Procurement Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Sustainability KPIs
  {
    id: 'energy_consumption',
    name: 'Energy Consumption',
    category: 'Sustainability',
    currentValue: 95000,
    target: 100000,
    threshold: 110000,
    unit: 'kWh',
    trend: -5,
    owner: 'Engineering Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'water_consumption',
    name: 'Water Consumption',
    category: 'Sustainability',
    currentValue: 42000,
    target: 45000,
    threshold: 50000,
    unit: 'gal',
    trend: -7,
    owner: 'Engineering Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Risk KPIs
  {
    id: 'safety_incident_rate',
    name: 'Safety Incident Rate',
    category: 'Risk',
    currentValue: 0.8,
    target: 1.0,
    threshold: 1.5,
    unit: '/1000',
    trend: -20,
    owner: 'Security Manager',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'compliance_score',
    name: 'Compliance Score',
    category: 'Risk',
    currentValue: 96,
    target: 95,
    threshold: 90,
    unit: '%',
    trend: 2,
    owner: 'Compliance Officer',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  
  // Asset Performance KPIs
  {
    id: 'asset_availability',
    name: 'Asset Availability',
    category: 'Asset Performance',
    currentValue: 94,
    target: 92,
    threshold: 88,
    unit: '%',
    trend: 2,
    owner: 'Engineering Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  },
  {
    id: 'pm_compliance',
    name: 'Preventive Maintenance Compliance',
    category: 'Asset Performance',
    currentValue: 89,
    target: 85,
    threshold: 80,
    unit: '%',
    trend: 5,
    owner: 'Engineering Director',
    status: 'on-track',
    lastUpdated: '2026-07-30'
  }
];

const EnterpriseKPIcenter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedKPI, setSelectedKPI] = useState<KPIDefinition | null>(null);

  const filteredKPIs = MOCK_KPIS.filter(kpi => {
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'at-risk':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'off-track':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'off-track':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const categoryStats = KPI_CATEGORIES.reduce((acc, category) => {
    const categoryKPIs = MOCK_KPIS.filter(kpi => kpi.category === category);
    const onTrack = categoryKPIs.filter(kpi => kpi.status === 'on-track').length;
    const atRisk = categoryKPIs.filter(kpi => kpi.status === 'at-risk').length;
    const offTrack = categoryKPIs.filter(kpi => kpi.status === 'off-track').length;
    
    acc[category] = {
      total: categoryKPIs.length,
      onTrack,
      atRisk,
      offTrack
    };
    return acc;
  }, {} as Record<string, { total: number; onTrack: number; atRisk: number; offTrack: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enterprise KPI Center
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive KPI scorecards and performance tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Target className="w-4 h-4" />
            <span>Set Targets</span>
          </button>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CATEGORIES.map(category => {
          const stats = categoryStats[category];
          const onTrackPercent = stats.total > 0 ? (stats.onTrack / stats.total) * 100 : 0;
          
          return (
            <div
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {category}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.total} KPIs
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400">On Track: {stats.onTrack}</span>
                  <span className="text-rose-600 dark:text-rose-400">Off Track: {stats.offTrack}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${onTrackPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search KPIs or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {KPI_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKPIs.map(kpi => (
          <div
            key={kpi.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedKPI(kpi)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {kpi.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {kpi.category}
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                {getStatusIcon(kpi.status)}
                <span className="capitalize">{kpi.status.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.unit === '$' ? '$' : ''}{kpi.currentValue.toLocaleString()}{kpi.unit === '%' ? '%' : kpi.unit === '/5' ? '/5' : kpi.unit === 'x' ? 'x' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current Value
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}{kpi.unit === '%' ? '%' : kpi.unit === '/5' ? '/5' : kpi.unit === 'x' ? 'x' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    kpi.status === 'on-track' ? 'bg-emerald-500' :
                    kpi.status === 'at-risk' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${calculateProgress(kpi.currentValue, kpi.target)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-600" />
                  )}
                  <span className={kpi.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">vs last period</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Owner: {kpi.owner}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedKPI.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedKPI.category}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedKPI(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedKPI.unit === '$' ? '$' : ''}{selectedKPI.currentValue.toLocaleString()}{selectedKPI.unit === '%' ? '%' : selectedKPI.unit === '/5' ? '/5' : selectedKPI.unit === 'x' ? 'x' : ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedKPI.unit === '$' ? '$' : ''}{selectedKPI.target.toLocaleString()}{selectedKPI.unit === '%' ? '%' : selectedKPI.unit === '/5' ? '/5' : selectedKPI.unit === 'x' ? 'x' : ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Threshold</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedKPI.unit === '$' ? '$' : ''}{selectedKPI.threshold.toLocaleString()}{selectedKPI.unit === '%' ? '%' : selectedKPI.unit === '/5' ? '/5' : selectedKPI.unit === 'x' ? 'x' : ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedKPI.trend >= 0 ? '+' : ''}{selectedKPI.trend}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Owner</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedKPI.owner}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedKPI.status)}`}>
                    {selectedKPI.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Last Updated</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedKPI.lastUpdated}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span>View Trend Analysis</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Target className="w-4 h-4" />
                  <span>Adjust Target</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseKPIcenter;
