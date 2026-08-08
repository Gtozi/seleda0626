/**
 * Sales & Marketing Intelligence Module
 * 
 * Analytics:
 * - Pipeline
 * - Lead Conversion
 * - Corporate Production
 * - OTA Performance
 * - Campaign ROI
 * - Market Segments
 * - Customer Acquisition Cost
 * - Repeat Business
 */

import { useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Funnel,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  Percent,
  Building2,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

interface SalesMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'pipeline' | 'conversion' | 'corporate' | 'ota' | 'campaign' | 'segments' | 'acquisition';
}

const SALES_ANALYTICS = [
  // Pipeline
  { id: 'total_pipeline', name: 'Total Pipeline', value: 2500000, target: 2000000, unit: '$', trend: 25, category: 'pipeline' },
  { id: 'qualified_leads', name: 'Qualified Leads', value: 450, target: 400, unit: '', trend: 12, category: 'pipeline' },
  { id: 'opportunities', name: 'Active Opportunities', value: 85, target: 80, unit: '', trend: 6, category: 'pipeline' },
  { id: 'proposal_stage', name: 'In Proposal Stage', value: 25, target: 20, unit: '', trend: 25, category: 'pipeline' },
  
  // Lead Conversion
  { id: 'lead_conversion', name: 'Lead Conversion Rate', value: 28, target: 25, unit: '%', trend: 12, category: 'conversion' },
  { id: 'lead_to_booking', name: 'Lead to Booking', value: 18, target: 15, unit: '%', trend: 20, category: 'conversion' },
  { id: 'proposal_to_booking', name: 'Proposal to Booking', value: 65, target: 60, unit: '%', trend: 8, category: 'conversion' },
  
  // Corporate Production
  { id: 'corporate_revenue', name: 'Corporate Revenue', value: 850000, target: 800000, unit: '$', trend: 6, category: 'corporate' },
  { id: 'corporate_bookings', name: 'Corporate Bookings', value: 125, target: 120, unit: '', trend: 4, category: 'corporate' },
  { id: 'avg_contract_value', name: 'Avg Contract Value', value: 6800, target: 6500, unit: '$', trend: 5, category: 'corporate' },
  
  // OTA Performance
  { id: 'ota_revenue', name: 'OTA Revenue', value: 562500, target: 600000, unit: '$', trend: -6, category: 'ota' },
  { id: 'ota_commission', name: 'OTA Commission Rate', value: 18, target: 20, unit: '%', trend: -10, category: 'ota' },
  { id: 'ota_occupancy', name: 'OTA Occupancy', value: 35, target: 40, unit: '%', trend: -12, category: 'ota' },
  
  // Campaign ROI
  { id: 'campaign_roi', name: 'Campaign ROI', value: 320, target: 300, unit: '%', trend: 7, category: 'campaign' },
  { id: 'marketing_spend', name: 'Marketing Spend', value: 45000, target: 50000, unit: '$', trend: -10, category: 'campaign' },
  { id: 'cost_per_lead', name: 'Cost Per Lead', value: 85, target: 100, unit: '$', trend: -15, category: 'campaign' },
  
  // Market Segments
  { id: 'corporate_segment', name: 'Corporate Segment', value: 45, target: 40, unit: '%', trend: 12, category: 'segments' },
  { id: 'leisure_segment', name: 'Leisure Segment', value: 35, target: 40, unit: '%', trend: -12, category: 'segments' },
  { id: 'group_segment', name: 'Group Segment', value: 15, target: 15, unit: '%', trend: 0, category: 'segments' },
  { id: 'transient_segment', name: 'Transient Segment', value: 5, target: 5, unit: '%', trend: 0, category: 'segments' },
  
  // Customer Acquisition
  { id: 'cac', name: 'Customer Acquisition Cost', value: 125, target: 150, unit: '$', trend: -17, category: 'acquisition' },
  { id: 'ltv_cac_ratio', name: 'LTV/CAC Ratio', value: 22, target: 20, unit: 'x', trend: 10, category: 'acquisition' },
  { id: 'new_customers', name: 'New Customers', value: 320, target: 300, unit: '/month', trend: 7, category: 'acquisition' },
];

const SALES_CATEGORIES = [
  { id: 'pipeline', label: 'Pipeline', icon: Funnel },
  { id: 'conversion', label: 'Conversion', icon: Target },
  { id: 'corporate', label: 'Corporate', icon: Building2 },
  { id: 'ota', label: 'OTA Performance', icon: Globe },
  { id: 'campaign', label: 'Campaign ROI', icon: BarChart3 },
  { id: 'segments', label: 'Segments', icon: PieChart },
  { id: 'acquisition', label: 'Acquisition', icon: Users },
];

const SalesMarketingIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? SALES_ANALYTICS 
    : SALES_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Sales & Marketing Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pipeline, conversion, campaign ROI, and market segment analytics
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

      {/* Sales Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {SALES_CATEGORIES.map(cat => {
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

      {/* Sales Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'x' ? 'x' : ''}
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

      {/* Pipeline Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sales Pipeline Funnel
        </h3>
        <div className="space-y-4">
          {[
            { stage: 'Leads', value: 450, conversion: 100, color: 'bg-indigo-500' },
            { stage: 'Qualified', value: 280, conversion: 62, color: 'bg-blue-500' },
            { stage: 'Proposals', value: 125, conversion: 28, color: 'bg-emerald-500' },
            { stage: 'Negotiation', value: 85, conversion: 19, color: 'bg-amber-500' },
            { stage: 'Closed Won', value: 45, conversion: 10, color: 'bg-green-500' },
          ].map((stage, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{stage.stage}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stage.value} deals</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stage.conversion}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${stage.color}`}
                  style={{ width: `${stage.conversion}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Campaign Performance
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Summer Promotion', spend: 15000, revenue: 85000, roi: 467, status: 'Active' },
            { name: 'Corporate Packages', spend: 12000, revenue: 68000, roi: 467, status: 'Active' },
            { name: 'Email Campaign', spend: 5000, revenue: 25000, roi: 400, status: 'Completed' },
            { name: 'Social Media Ads', spend: 8000, revenue: 32000, roi: 300, status: 'Active' },
          ].map((campaign, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Spend: ${campaign.spend.toLocaleString()} | Revenue: ${campaign.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {campaign.roi}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'Active' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {campaign.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesMarketingIntelligence;
