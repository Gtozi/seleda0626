/**
 * Yield Management Component
 * Optimizes occupancy, ADR, revenue, mix, and length of stay
 */

import React, { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  DollarSign,
  Bed,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Zap,
  CheckCircle2
} from 'lucide-react';

const YieldManagement = () => {
  const [selectedOptimization, setSelectedOptimization] = useState<'occupancy' | 'adr' | 'revenue' | 'mix' | 'los' | 'upgrade'>('occupancy');

  const optimizationTypes = [
    { id: 'occupancy', name: 'Occupancy Optimization', description: 'Maximize room occupancy', icon: Bed },
    { id: 'adr', name: 'ADR Optimization', description: 'Maximize average daily rate', icon: DollarSign },
    { id: 'revenue', name: 'Revenue Optimization', description: 'Maximize total revenue', icon: TrendingUp },
    { id: 'mix', name: 'Mix Optimization', description: 'Optimize guest segment mix', icon: BarChart3 },
    { id: 'los', name: 'Length of Stay', description: 'Optimize stay duration', icon: Calendar },
    { id: 'upgrade', name: 'Upgrade Opportunities', description: 'Identify upgrade potential', icon: Zap }
  ];

  const yieldMetrics = useMemo(() => [
    { id: 1, metric: 'Occupancy Rate', current: 78, target: 85, gap: 7, trend: 'up' },
    { id: 2, metric: 'ADR', current: 145, target: 160, gap: 15, trend: 'up' },
    { id: 3, metric: 'RevPAR', current: 113, target: 136, gap: 23, trend: 'up' },
    { id: 4, metric: 'Revenue per Guest', current: 280, target: 320, gap: 40, trend: 'up' }
  ], []);

  const optimizationOpportunities = useMemo(() => [
    { id: 1, type: 'Upgrade', roomType: 'Standard Room', suggestion: 'Upgrade to Deluxe Suite', potentialRevenue: 45, confidence: 85 },
    { id: 2, type: 'LOS Extension', roomType: 'Deluxe Suite', suggestion: 'Extend stay from 3 to 5 nights', potentialRevenue: 120, confidence: 72 },
    { id: 3, type: 'Cross-sell', roomType: 'Ocean View', suggestion: 'Add dining package', potentialRevenue: 35, confidence: 68 },
    { id: 4, type: 'Mix Adjustment', roomType: 'Family Suite', suggestion: 'Target corporate segment', potentialRevenue: 80, confidence: 75 }
  ], []);

  const yieldScenarios = useMemo(() => [
    { id: 1, name: 'Current', occupancy: 78, adr: 145, revpar: 113, revenue: 45000 },
    { id: 2, name: 'Optimistic', occupancy: 85, adr: 160, revpar: 136, revenue: 58000 },
    { id: 3, name: 'Conservative', occupancy: 75, adr: 140, revpar: 105, revenue: 42000 }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Yield Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Optimize occupancy, ADR, and revenue performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap className="w-4 h-4" />
            Run Optimization
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Optimization Types */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Optimization Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {optimizationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <OptimizationCard
                key={type.id}
                type={type}
                selected={selectedOptimization === type.id}
                onSelect={() => setSelectedOptimization(type.id as any)}
                icon={<Icon className="w-5 h-5" />}
              />
            );
          })}
        </div>
      </div>

      {/* Yield Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Yield Metrics vs Targets</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Set Targets
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {yieldMetrics.map((metric) => (
            <YieldMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Optimization Opportunities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {optimizationOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>

      {/* Yield Scenarios */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Yield Scenarios</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Scenario
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yieldScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface OptimizationCardProps {
  type: {
    id: string;
    name: string;
    description: string;
    icon: any;
  };
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}

const OptimizationCard: React.FC<OptimizationCardProps> = ({ type, selected, onSelect, icon }) => {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${selected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
          {icon}
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white">{type.name}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{type.description}</p>
    </button>
  );
};

interface YieldMetricCardProps {
  metric: {
    id: number;
    metric: string;
    current: number;
    target: number;
    gap: number;
    trend: 'up' | 'down';
  };
}

const YieldMetricCard: React.FC<YieldMetricCardProps> = ({ metric }) => {
  const gapPercent = Math.round((metric.gap / metric.target) * 100);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{metric.metric}</h4>
        {metric.trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Current</span>
          <span className="font-medium text-slate-900 dark:text-white">{metric.current}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Target</span>
          <span className="font-medium text-slate-900 dark:text-white">{metric.target}</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${((metric.current / metric.target) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {gapPercent}% gap to target
        </p>
      </div>
    </div>
  );
};

interface OpportunityCardProps {
  opportunity: {
    id: number;
    type: string;
    roomType: string;
    suggestion: string;
    potentialRevenue: number;
    confidence: number;
  };
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {opportunity.type}
          </span>
          <h4 className="font-medium text-slate-900 dark:text-white">{opportunity.roomType}</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{opportunity.suggestion}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Potential Revenue</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            +${opportunity.potentialRevenue}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Confidence</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {opportunity.confidence}%
          </p>
        </div>
        <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </button>
      </div>
    </div>
  );
};

interface ScenarioCardProps {
  scenario: {
    id: number;
    name: string;
    occupancy: number;
    adr: number;
    revpar: number;
    revenue: number;
  };
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{scenario.name}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Occupancy</span>
          <span className="font-medium text-slate-900 dark:text-white">{scenario.occupancy}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">ADR</span>
          <span className="font-medium text-slate-900 dark:text-white">${scenario.adr}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">RevPAR</span>
          <span className="font-medium text-slate-900 dark:text-white">${scenario.revpar}</span>
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Revenue</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">${scenario.revenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldManagement;
