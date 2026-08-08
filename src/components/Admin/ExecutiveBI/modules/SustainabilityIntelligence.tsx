/**
 * Sustainability Intelligence Module
 * 
 * Environmental KPIs:
 * - Electricity Consumption
 * - Water Consumption
 * - Fuel Consumption
 * - Carbon Emissions
 * - Waste Generation
 * - Recycling Rate
 * 
 * ESG Metrics:
 * - Environmental
 * - Social
 * - Governance
 * - Sustainability Targets
 * - Carbon Reduction Progress
 */

import { useState } from 'react';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Zap,
  Droplets,
  Fuel,
  Cloud,
  Trash2,
  Recycle,
  Download,
  Filter,
  Calendar,
  Percent,
  Target,
  Award,
  Users,
  Scale
} from 'lucide-react';

interface SustainabilityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'energy' | 'water' | 'fuel' | 'carbon' | 'waste' | 'esg';
}

const SUSTAINABILITY_ANALYTICS = [
  // Electricity Consumption
  { id: 'electricity', name: 'Electricity Consumption', value: 95000, target: 100000, unit: 'kWh', trend: -5, category: 'energy' },
  { id: 'electricity_cost', name: 'Electricity Cost', value: 14250, target: 15000, unit: '$', trend: -5, category: 'energy' },
  { id: 'energy_per_room', name: 'Energy per Room', value: 79, target: 85, unit: 'kWh', trend: -7, category: 'energy' },
  
  // Water Consumption
  { id: 'water', name: 'Water Consumption', value: 42000, target: 45000, unit: 'gal', trend: -7, category: 'water' },
  { id: 'water_cost', name: 'Water Cost', value: 4200, target: 4500, unit: '$', trend: -7, category: 'water' },
  { id: 'water_per_room', name: 'Water per Room', value: 35, target: 38, unit: 'gal', trend: -8, category: 'water' },
  
  // Fuel Consumption
  { id: 'fuel', name: 'Fuel Consumption', value: 12000, target: 15000, unit: 'gallons', trend: -20, category: 'fuel' },
  { id: 'fuel_cost', name: 'Fuel Cost', value: 4800, target: 6000, unit: '$', trend: -20, category: 'fuel' },
  
  // Carbon Emissions
  { id: 'carbon_emissions', name: 'Carbon Emissions', value: 85, target: 100, unit: 'tons', trend: -15, category: 'carbon' },
  { id: 'carbon_per_room', name: 'Carbon per Room', value: 0.07, target: 0.08, unit: 'tons', trend: -12, category: 'carbon' },
  { id: 'carbon_reduction', name: 'Carbon Reduction', value: 15, target: 10, unit: '%', trend: 50, category: 'carbon' },
  
  // Waste Generation
  { id: 'waste_generated', name: 'Waste Generated', value: 25000, target: 28000, unit: 'lbs', trend: -11, category: 'waste' },
  { id: 'waste_per_room', name: 'Waste per Room', value: 21, target: 24, unit: 'lbs', trend: -12, category: 'waste' },
  { id: 'recycling_rate', name: 'Recycling Rate', value: 68, target: 65, unit: '%', trend: 5, category: 'waste' },
  
  // ESG Metrics
  { id: 'esg_score', name: 'ESG Score', value: 78, target: 75, unit: '/100', trend: 4, category: 'esg' },
  { id: 'environmental', name: 'Environmental Score', value: 82, target: 80, unit: '/100', trend: 2, category: 'esg' },
  { id: 'social', name: 'Social Score', value: 75, target: 75, unit: '/100', trend: 0, category: 'esg' },
  { id: 'governance', name: 'Governance Score', value: 78, target: 70, unit: '/100', trend: 11, category: 'esg' },
];

const SUSTAINABILITY_CATEGORIES = [
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
  { id: 'carbon', label: 'Carbon', icon: Cloud },
  { id: 'waste', label: 'Waste', icon: Trash2 },
  { id: 'esg', label: 'ESG', icon: Leaf },
];

const SustainabilityIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? SUSTAINABILITY_ANALYTICS 
    : SUSTAINABILITY_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Sustainability Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Environmental KPIs, carbon emissions, and ESG metrics
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

      {/* Sustainability Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Leaf className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {SUSTAINABILITY_CATEGORIES.map(cat => {
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

      {/* Sustainability Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === 'kWh' ? ' kWh' : metric.unit === 'gal' ? ' gal' : metric.unit === 'gallons' ? ' gallons' : metric.unit === 'tons' ? ' tons' : metric.unit === 'lbs' ? ' lbs' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/100' ? '/100' : metric.unit === 'kWh' ? ' kWh' : metric.unit === 'gal' ? ' gal' : metric.unit === 'gallons' ? ' gallons' : metric.unit === 'tons' ? ' tons' : metric.unit === 'lbs' ? ' lbs' : ''}
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

      {/* ESG Scorecard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ESG Scorecard
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { category: 'Environmental', score: 82, target: 80, color: 'bg-emerald-500' },
            { category: 'Social', score: 75, target: 75, color: 'bg-blue-500' },
            { category: 'Governance', score: 78, target: 70, color: 'bg-purple-500' },
          ].map((esg, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${esg.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{esg.category}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{esg.score}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Target: {esg.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability Targets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sustainability Targets Progress
        </h3>
        <div className="space-y-4">
          {[
            { target: 'Carbon Neutrality by 2030', progress: 35, status: 'On Track' },
            { target: 'Zero Waste by 2025', progress: 68, status: 'On Track' },
            { target: '100% Renewable Energy by 2027', progress: 45, status: 'On Track' },
            { target: 'Water Reduction 20% by 2026', progress: 60, status: 'Ahead' },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{item.target}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.progress}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Ahead' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityIntelligence;
