/**
 * Strategic Planning Module
 * 
 * - Annual Business Plans
 * - Strategic Objectives
 * - OKRs
 * - KPI Targets
 * - Department Goals
 * - Capital Projects
 * - Growth Initiatives
 */

import { useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Percent,
  Building2,
  DollarSign,
  Award,
  Flag,
  Briefcase
} from 'lucide-react';

interface StrategicItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  category: 'business_plan' | 'objectives' | 'okrs' | 'kpi_targets' | 'department_goals' | 'capital_projects' | 'growth';
  dueDate: string;
}

const STRATEGIC_ITEMS = [
  // Annual Business Plans
  { id: 'bp_1', title: '2024 Business Plan', description: 'Annual business plan with revenue and expense projections', progress: 85, target: 100, status: 'on_track', category: 'business_plan', dueDate: '2024-12-31' },
  
  // Strategic Objectives
  { id: 'obj_1', title: 'Market Expansion', description: 'Expand into 2 new market segments', progress: 60, target: 100, status: 'on_track', category: 'objectives', dueDate: '2024-09-30' },
  { id: 'obj_2', title: 'Digital Transformation', description: 'Complete digital transformation initiative', progress: 45, target: 100, status: 'at_risk', category: 'objectives', dueDate: '2024-12-31' },
  
  // OKRs
  { id: 'okr_1', title: 'Revenue Growth OKR', description: 'Achieve 15% revenue growth year-over-year', progress: 72, target: 100, status: 'on_track', category: 'okrs', dueDate: '2024-12-31' },
  { id: 'okr_2', title: 'Guest Satisfaction OKR', description: 'Achieve 4.5 guest satisfaction score', progress: 85, target: 100, status: 'on_track', category: 'okrs', dueDate: '2024-12-31' },
  { id: 'okr_3', title: 'Cost Reduction OKR', description: 'Reduce operating costs by 8%', progress: 65, target: 100, status: 'on_track', category: 'okrs', dueDate: '2024-12-31' },
  
  // KPI Targets
  { id: 'kpi_1', title: 'RevPAR Target', description: 'Achieve $115 RevPAR', progress: 98, target: 100, status: 'on_track', category: 'kpi_targets', dueDate: '2024-12-31' },
  { id: 'kpi_2', title: 'Occupancy Target', description: 'Achieve 80% occupancy rate', progress: 97, target: 100, status: 'on_track', category: 'kpi_targets', dueDate: '2024-12-31' },
  { id: 'kpi_3', title: 'ADR Target', description: 'Achieve $150 ADR', progress: 96, target: 100, status: 'on_track', category: 'kpi_targets', dueDate: '2024-12-31' },
  
  // Department Goals
  { id: 'dept_1', title: 'Housekeeping Efficiency', description: 'Improve room turnaround time by 20%', progress: 75, target: 100, status: 'on_track', category: 'department_goals', dueDate: '2024-09-30' },
  { id: 'dept_2', title: 'F&B Profitability', description: 'Achieve 35% F&B profit margin', progress: 80, target: 100, status: 'on_track', category: 'department_goals', dueDate: '2024-12-31' },
  { id: 'dept_3', title: 'Engineering Response', description: 'Reduce maintenance response time by 25%', progress: 60, target: 100, status: 'at_risk', category: 'department_goals', dueDate: '2024-10-31' },
  
  // Capital Projects
  { id: 'cap_1', title: 'Room Renovation Phase 1', description: 'Renovate 50 guest rooms', progress: 40, target: 100, status: 'behind', category: 'capital_projects', dueDate: '2024-08-31' },
  { id: 'cap_2', title: 'Restaurant Renovation', description: 'Complete main restaurant renovation', progress: 85, target: 100, status: 'on_track', category: 'capital_projects', dueDate: '2024-07-31' },
  { id: 'cap_3', title: 'HVAC Upgrade', description: 'Upgrade HVAC system', progress: 25, target: 100, status: 'behind', category: 'capital_projects', dueDate: '2024-11-30' },
  
  // Growth Initiatives
  { id: 'growth_1', title: 'Corporate Partnership', description: 'Establish 3 new corporate partnerships', progress: 67, target: 100, status: 'on_track', category: 'growth', dueDate: '2024-12-31' },
  { id: 'growth_2', title: 'Loyalty Program Launch', description: 'Launch new loyalty program', progress: 90, target: 100, status: 'on_track', category: 'growth', dueDate: '2024-06-30' },
];

const STRATEGIC_CATEGORIES = [
  { id: 'business_plan', label: 'Business Plan', icon: Briefcase },
  { id: 'objectives', label: 'Objectives', icon: Flag },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'kpi_targets', label: 'KPI Targets', icon: Award },
  { id: 'department_goals', label: 'Department Goals', icon: Building2 },
  { id: 'capital_projects', label: 'Capital Projects', icon: DollarSign },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
];

const StrategicPlanning = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredItems = STRATEGIC_ITEMS.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      on_track: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      at_risk: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      behind: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[status as keyof typeof colors] || colors.on_track;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle2 className="w-4 h-4" />;
      case 'at_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'behind': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Strategic Planning
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Business plans, OKRs, and strategic objectives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="behind">Behind</option>
            <option value="completed">Completed</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Strategic Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Target className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All Items</p>
        </button>
        {STRATEGIC_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Strategic Items */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.progress}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.progress >= 100 ? 'bg-emerald-500' : item.progress >= 75 ? 'bg-blue-500' : item.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Due: {item.dueDate}</span>
                <span>Target: {item.target}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Strategic Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'On Track', count: 10, color: 'bg-emerald-500' },
            { label: 'At Risk', count: 3, color: 'bg-amber-500' },
            { label: 'Behind', count: 2, color: 'bg-rose-500' },
            { label: 'Completed', count: 0, color: 'bg-blue-500' },
          ].map((status, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className={`w-3 h-3 rounded-full ${status.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{status.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{status.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">items</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategicPlanning;
