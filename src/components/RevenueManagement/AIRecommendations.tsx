/**
 * AI Recommendations Component
 * Provides pricing recommendations, inventory recommendations, distribution recommendations, promotional recommendations, and actionable insights
 */

import React, { useState, useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Bed,
  Globe,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Settings,
  Filter
} from 'lucide-react';

const AIRecommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState<'pricing' | 'inventory' | 'distribution' | 'promotional' | 'all'>('all');
  const [autoApply, setAutoApply] = useState(false);

  const recommendations = useMemo(() => [
    { 
      id: '1', 
      type: 'pricing',
      priority: 'high',
      title: 'Increase Deluxe Suite rate by 15%',
      description: 'High demand forecast for next 30 days. Competitor rates increased by 12%.',
      roomType: 'Deluxe Suite',
      currentRate: 150,
      recommendedRate: 172,
      potentialRevenue: 4500,
      confidence: 92,
      timeframe: 'Next 30 days',
      status: 'pending',
      reason: 'Demand surge + competitor pricing'
    },
    { 
      id: '2', 
      type: 'inventory',
      priority: 'medium',
      title: 'Release 10 rooms from OTA allocation',
      description: 'Direct bookings performing better. Shift inventory to direct channel.',
      roomType: 'Standard Room',
      currentAllocation: 50,
      recommendedAllocation: 40,
      potentialRevenue: 2200,
      confidence: 85,
      timeframe: 'Immediate',
      status: 'pending',
      reason: 'Channel performance optimization'
    },
    { 
      id: '3', 
      type: 'distribution',
      priority: 'high',
      title: 'Enable Expedia rate parity check',
      description: 'Rate parity violation detected. Enable automatic parity monitoring.',
      channel: 'Expedia',
      currentStatus: 'manual',
      recommendedStatus: 'automatic',
      potentialRevenue: 1800,
      confidence: 88,
      timeframe: 'Immediate',
      status: 'pending',
      reason: 'Rate parity violation'
    },
    { 
      id: '4', 
      type: 'promotional',
      priority: 'low',
      title: 'Launch flash sale for Ocean View',
      description: 'Low occupancy forecast. Consider 20% flash sale for 3-day period.',
      roomType: 'Ocean View',
      currentOccupancy: 65,
      targetOccupancy: 80,
      potentialRevenue: 3200,
      confidence: 78,
      timeframe: 'Next 7 days',
      status: 'pending',
      reason: 'Occupancy optimization'
    },
    { 
      id: '5', 
      type: 'pricing',
      priority: 'medium',
      title: 'Adjust weekend rates for Family Suite',
      description: 'Weekend demand lower than expected. Reduce weekend premium by 5%.',
      roomType: 'Family Suite',
      currentWeekendRate: 180,
      recommendedWeekendRate: 171,
      potentialRevenue: 900,
      confidence: 82,
      timeframe: 'Next weekend',
      status: 'pending',
      reason: 'Demand adjustment'
    },
    { 
      id: '6', 
      type: 'inventory',
      priority: 'high',
      title: 'Increase overbooking limit for peak season',
      description: 'Historical wash rate 15% during holidays. Safe to increase overbooking.',
      roomType: 'All Room Types',
      currentLimit: 10,
      recommendedLimit: 15,
      potentialRevenue: 7500,
      confidence: 90,
      timeframe: 'Holiday season',
      status: 'pending',
      reason: 'Wash rate analysis'
    }
  ], []);

  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter(r => r.type === selectedCategory);
  }, [recommendations, selectedCategory]);

  const summaryMetrics = useMemo(() => {
    const totalPotential = recommendations.reduce((sum, r) => sum + r.potentialRevenue, 0);
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const avgConfidence = Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length);
    const pending = recommendations.filter(r => r.status === 'pending').length;

    return { totalPotential, highPriority, avgConfidence, pending };
  }, [recommendations]);

  const categoryIcons = {
    pricing: DollarSign,
    inventory: Bed,
    distribution: Globe,
    promotional: Tag
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
          <p className="text-slate-600 dark:text-slate-400">AI-powered revenue optimization suggestions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto-apply</span>
            <button
              onClick={() => setAutoApply(!autoApply)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoApply ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  autoApply ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Potential Revenue"
          value={`$${summaryMetrics.totalPotential.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="High Priority"
          value={summaryMetrics.highPriority}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${summaryMetrics.avgConfidence}%`}
          icon={<Brain className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Pending Actions"
          value={summaryMetrics.pending}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pricing', 'inventory', 'distribution', 'promotional'].map((category) => {
            const Icon = category !== 'all' ? categoryIcons[category as keyof typeof categoryIcons] : Brain;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {category !== 'all' && <Icon className="w-4 h-4" />}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommendations</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Apply All
          </button>
        </div>
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            title="Demand Pattern Detected"
            description="Leisure demand increasing 15% YoY for December. Consider extending high-season pricing."
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
          <InsightCard
            title="Competitor Activity Alert"
            description="3 nearby hotels increased rates by 10-15% for holiday period. Market pricing opportunity."
            icon={<AlertTriangle className="w-5 h-5" />}
            color="amber"
          />
          <InsightCard
            title="Channel Shift Opportunity"
            description="Direct bookings up 22% while OTA bookings down 8%. Shift inventory allocation recommended."
            icon={<Globe className="w-5 h-5" />}
            color="blue"
          />
          <InsightCard
            title="Package Performance Insight"
            description="Spa packages showing 35% higher conversion than room-only. Consider bundling more packages."
            icon={<Zap className="w-5 h-5" />}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]} border`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: {
    id: string;
    type: string;
    priority: string;
    title: string;
    description: string;
    roomType?: string;
    channel?: string;
    currentRate?: number;
    recommendedRate?: number;
    currentAllocation?: number;
    recommendedAllocation?: number;
    currentStatus?: string;
    recommendedStatus?: string;
    currentOccupancy?: number;
    targetOccupancy?: number;
    currentWeekendRate?: number;
    recommendedWeekendRate?: number;
    currentLimit?: number;
    recommendedLimit?: number;
    potentialRevenue: number;
    confidence: number;
    timeframe: string;
    status: string;
    reason: string;
  };
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

  const typeIcons = {
    pricing: DollarSign,
    inventory: Bed,
    distribution: Globe,
    promotional: Tag
  };

  const Icon = typeIcons[recommendation.type as keyof typeof typeIcons];

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">{recommendation.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[recommendation.priority as keyof typeof priorityColors]}`}>
                {recommendation.priority}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{recommendation.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span>{recommendation.roomType || recommendation.channel}</span>
              <span>•</span>
              <span>{recommendation.timeframe}</span>
              <span>•</span>
              <span>Confidence: {recommendation.confidence}%</span>
            </div>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Potential Revenue</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">+${recommendation.potentialRevenue.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-600 dark:text-slate-400">Reason: {recommendation.reason}</p>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Apply">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </button>
          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Dismiss">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" title="View Details">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'blue' | 'purple';
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
          {icon}
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
};

export default AIRecommendations;
