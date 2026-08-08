/**
 * AI Decision Support Module
 * 
 * AI Recommendations:
 * - Revenue Optimization
 * - Cost Reduction
 * - Staffing Optimization
 * - Purchasing Optimization
 * - Energy Saving
 * - Upselling Opportunities
 * - Cross-selling Opportunities
 * - Guest Retention
 * - Maintenance Prediction
 * - Risk Alerts
 */

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scissors,
  Users,
  ShoppingCart,
  Zap,
  ArrowUp,
  ArrowRight,
  Heart,
  Wrench,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  category: 'revenue' | 'cost' | 'staffing' | 'purchasing' | 'energy' | 'upselling' | 'crossselling' | 'retention' | 'maintenance' | 'risk';
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
}

const AI_RECOMMENDATIONS = [
  // Revenue Optimization
  { id: 'rev_opt_1', title: 'Increase ADR by 5%', description: 'Based on demand patterns, recommend increasing ADR by 5% for next weekend', impact: 45000, confidence: 85, category: 'revenue', status: 'pending' },
  { id: 'rev_opt_2', title: 'Dynamic Pricing for Corporate', description: 'Implement dynamic pricing for corporate segments to capture 8% more revenue', impact: 28000, confidence: 78, category: 'revenue', status: 'pending' },
  
  // Cost Reduction
  { id: 'cost_red_1', title: 'Optimize Labor Schedule', description: 'Reduce overtime by 15% through better shift scheduling', impact: 18000, confidence: 92, category: 'cost', status: 'in_progress' },
  { id: 'cost_red_2', title: 'Energy Efficiency Upgrade', description: 'Install LED lighting in common areas to reduce energy costs by 12%', impact: 12000, confidence: 88, category: 'cost', status: 'pending' },
  
  // Staffing Optimization
  { id: 'staff_opt_1', title: 'Adjust Weekend Staffing', description: 'Increase front desk staff by 2 on weekends based on occupancy forecast', impact: 5000, confidence: 95, category: 'staffing', status: 'pending' },
  { id: 'staff_opt_2', title: 'Cross-Train Housekeeping', description: 'Cross-train 5 housekeeping staff for flexibility during peak periods', impact: 8000, confidence: 82, category: 'staffing', status: 'pending' },
  
  // Purchasing Optimization
  { id: 'pur_opt_1', title: 'Bulk Food Purchasing', description: 'Increase bulk food purchases to reduce costs by 8%', impact: 9600, confidence: 90, category: 'purchasing', status: 'pending' },
  { id: 'pur_opt_2', title: 'Vendor Consolidation', description: 'Consolidate 3 suppliers to reduce administrative overhead', impact: 4500, confidence: 75, category: 'purchasing', status: 'pending' },
  
  // Energy Saving
  { id: 'energy_save_1', title: 'HVAC Schedule Optimization', description: 'Adjust HVAC schedules based on occupancy patterns to save 10% energy', impact: 8500, confidence: 94, category: 'energy', status: 'pending' },
  { id: 'energy_save_2', title: 'Water Conservation', description: 'Install low-flow showerheads to reduce water consumption by 15%', impact: 3200, confidence: 89, category: 'energy', status: 'pending' },
  
  // Upselling Opportunities
  { id: 'upsell_1', title: 'Room Upgrade Offers', description: 'Target guests booking standard rooms with upgrade offers at check-in', impact: 15000, confidence: 80, category: 'upselling', status: 'pending' },
  { id: 'upsell_2', title: 'Spa Package Promotion', description: 'Promote spa packages to guests booking extended stays', impact: 8500, confidence: 77, category: 'upselling', status: 'pending' },
  
  // Cross-selling Opportunities
  { id: 'cross_sell_1', title: 'Dining Package Add-on', description: 'Offer dining packages to room-only bookings', impact: 12000, confidence: 83, category: 'crossselling', status: 'pending' },
  { id: 'cross_sell_2', title: 'Airport Transfer Promotion', description: 'Promote airport transfers to international guests', impact: 4500, confidence: 85, category: 'crossselling', status: 'pending' },
  
  // Guest Retention
  { id: 'retention_1', title: 'Loyalty Program Enhancement', description: 'Enhance loyalty program with personalized offers to increase repeat bookings by 12%', impact: 35000, confidence: 87, category: 'retention', status: 'pending' },
  { id: 'retention_2', title: 'Post-Stay Engagement', description: 'Implement automated post-stay engagement to improve guest retention', impact: 18000, confidence: 79, category: 'retention', status: 'pending' },
  
  // Maintenance Prediction
  { id: 'maint_pred_1', title: 'Preventive HVAC Maintenance', description: 'Schedule preventive maintenance for HVAC unit 3 to prevent failure (85% probability)', impact: 12000, confidence: 85, category: 'maintenance', status: 'pending' },
  { id: 'maint_pred_2', title: 'Elevator Maintenance', description: 'Schedule elevator maintenance before peak season to avoid downtime', impact: 8000, confidence: 72, category: 'maintenance', status: 'pending' },
  
  // Risk Alerts
  { id: 'risk_alert_1', title: 'Occupancy Drop Warning', description: 'Forecast shows 15% occupancy drop in 3 weeks due to local event', impact: -45000, confidence: 68, category: 'risk', status: 'pending' },
  { id: 'risk_alert_2', title: 'Compliance Risk', description: 'Fire safety inspection due in 2 weeks - 2 items need attention', impact: -25000, confidence: 95, category: 'risk', status: 'in_progress' },
];

const AI_CATEGORIES = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'cost', label: 'Cost', icon: Scissors },
  { id: 'staffing', label: 'Staffing', icon: Users },
  { id: 'purchasing', label: 'Purchasing', icon: ShoppingCart },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'upselling', label: 'Upselling', icon: ArrowUp },
  { id: 'crossselling', label: 'Cross-selling', icon: ArrowRight },
  { id: 'retention', label: 'Retention', icon: Heart },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'risk', label: 'Risk', icon: AlertTriangle },
];

const AIDecisionSupport = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredRecommendations = AI_RECOMMENDATIONS.filter(rec => {
    const categoryMatch = selectedCategory === 'all' || rec.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || rec.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (impact < 0) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-emerald-500';
    if (confidence >= 80) return 'bg-blue-500';
    if (confidence >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      implemented: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      dismissed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Decision Support
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered recommendations for revenue, cost, and operational optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* AI Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-2 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Brain className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">All</p>
        </button>
        {AI_CATEGORIES.map(cat => {
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

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecommendations.map(rec => (
          <div
            key={rec.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {rec.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(rec.status)}`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {rec.description}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${getImpactColor(rec.impact)}`}>
                    {rec.impact >= 0 ? '+' : ''}${rec.impact.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Impact</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(rec.confidence)}`} />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.confidence}%</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  AI-generated recommendation based on historical data analysis
                </span>
              </div>
              <div className="flex items-center gap-2">
                {rec.status === 'pending' && (
                  <>
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Dismiss
                    </button>
                    <button className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Implement
                    </button>
                  </>
                )}
                {rec.status === 'in_progress' && (
                  <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Impact Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Impact Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Potential Impact', value: 263500, color: 'text-emerald-600' },
            { label: 'Implemented Savings', value: 45000, color: 'text-blue-600' },
            { label: 'In Progress', value: 43000, color: 'text-amber-600' },
            { label: 'Pending', value: 175500, color: 'text-gray-600' },
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>${item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDecisionSupport;
