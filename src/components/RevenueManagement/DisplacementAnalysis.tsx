/**
 * Displacement Analysis Component
 * Evaluates revenue lost, revenue gained, opportunity cost, ancillary revenue, and total profitability
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react';

const DisplacementAnalysis = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('30');

  const displacementScenarios = useMemo(() => [
    { 
      id: '1', 
      name: 'Tech Conference Group', 
      dates: '2024-12-15 to 2024-12-18',
      rooms: 50,
      nights: 3,
      status: 'pending',
      analysis: {
        revenueLost: 22500,
        revenueGained: 21750,
        opportunityCost: 3500,
        ancillaryRevenue: 4200,
        totalProfitability: -750,
        recommendation: 'reject',
        confidence: 78
      }
    },
    { 
      id: '2', 
      name: 'Corporate Retreat', 
      dates: '2024-11-20 to 2024-11-22',
      rooms: 35,
      nights: 2,
      status: 'pending',
      analysis: {
        revenueLost: 8400,
        revenueGained: 9100,
        opportunityCost: 1200,
        ancillaryRevenue: 1800,
        totalProfitability: 1300,
        recommendation: 'accept',
        confidence: 85
      }
    },
    { 
      id: '3', 
      name: 'Holiday Season Group', 
      dates: '2024-12-24 to 2024-12-26',
      rooms: 40,
      nights: 2,
      status: 'pending',
      analysis: {
        revenueLost: 18000,
        revenueGained: 12800,
        opportunityCost: 5800,
        ancillaryRevenue: 2400,
        totalProfitability: -8600,
        recommendation: 'reject',
        confidence: 92
      }
    }
  ], []);

  const summaryMetrics = useMemo(() => {
    const totalLost = displacementScenarios.reduce((sum, s) => sum + s.analysis.revenueLost, 0);
    const totalGained = displacementScenarios.reduce((sum, s) => sum + s.analysis.revenueGained, 0);
    const totalOpportunity = displacementScenarios.reduce((sum, s) => sum + s.analysis.opportunityCost, 0);
    const totalAncillary = displacementScenarios.reduce((sum, s) => sum + s.analysis.ancillaryRevenue, 0);
    const netProfitability = displacementScenarios.reduce((sum, s) => sum + s.analysis.totalProfitability, 0);

    return { totalLost, totalGained, totalOpportunity, totalAncillary, netProfitability };
  }, [displacementScenarios]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Displacement Analysis</h2>
          <p className="text-slate-600 dark:text-slate-400">Evaluate opportunity cost and profitability of group bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Calculator className="w-4 h-4" />
            Run Analysis
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Revenue Lost"
          value={`$${summaryMetrics.totalLost.toLocaleString()}`}
          change={-12}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
        />
        <MetricCard
          title="Revenue Gained"
          value={`$${summaryMetrics.totalGained.toLocaleString()}`}
          change={8}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Opportunity Cost"
          value={`$${summaryMetrics.totalOpportunity.toLocaleString()}`}
          change={-5}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="orange"
        />
        <MetricCard
          title="Ancillary Revenue"
          value={`$${summaryMetrics.totalAncillary.toLocaleString()}`}
          change={15}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Net Profitability"
          value={`$${summaryMetrics.netProfitability.toLocaleString()}`}
          change={summaryMetrics.netProfitability >= 0 ? 5 : -8}
          icon={<BarChart3 className="w-5 h-5" />}
          color={summaryMetrics.netProfitability >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Displacement Scenarios */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Displacement Scenarios</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Scenario
          </button>
        </div>
        <div className="space-y-4">
          {displacementScenarios.map((scenario) => (
            <DisplacementScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedScenario === scenario.id}
              onSelect={() => setSelectedScenario(scenario.id)}
            />
          ))}
        </div>
      </div>

      {/* Analysis Formula */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Displacement Calculation Formula</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormulaCard
            title="Revenue Lost"
            formula="Transient Rate × Rooms × Nights"
            description="Revenue that would be generated from transient guests displaced by group booking"
            example="$150 × 50 × 3 = $22,500"
          />
          <FormulaCard
            title="Revenue Gained"
            formula="Group Rate × Rooms × Nights"
            description="Revenue generated from the group booking"
            example="$145 × 50 × 3 = $21,750"
          />
          <FormulaCard
            title="Opportunity Cost"
            formula="Revenue Lost - Revenue Gained"
            description="Net revenue difference between displaced transient and group booking"
            example="$22,500 - $21,750 = $750"
          />
          <FormulaCard
            title="Total Profitability"
            formula="Revenue Gained + Ancillary Revenue - Opportunity Cost"
            description="Final profitability including ancillary revenue from group"
            example="$21,750 + $4,200 - $750 = $25,200"
          />
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
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
      <div className={`flex items-center gap-1 text-sm font-medium ${
        change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(change)}%
      </div>
    </div>
  );
};

interface DisplacementScenarioCardProps {
  scenario: {
    id: string;
    name: string;
    dates: string;
    rooms: number;
    nights: number;
    status: string;
    analysis: {
      revenueLost: number;
      revenueGained: number;
      opportunityCost: number;
      ancillaryRevenue: number;
      totalProfitability: number;
      recommendation: string;
      confidence: number;
    };
  };
  selected: boolean;
  onSelect: () => void;
}

const DisplacementScenarioCard: React.FC<DisplacementScenarioCardProps> = ({ scenario, selected, onSelect }) => {
  const recommendationColors = {
    accept: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    reject: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    review: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{scenario.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recommendationColors[scenario.analysis.recommendation as keyof typeof recommendationColors]}`}>
              {scenario.analysis.recommendation}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{scenario.dates} • {scenario.rooms} rooms × {scenario.nights} nights</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">Confidence</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{scenario.analysis.confidence}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue Lost</p>
          <p className="font-medium text-red-600 dark:text-red-400">${scenario.analysis.revenueLost.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue Gained</p>
          <p className="font-medium text-green-600 dark:text-green-400">${scenario.analysis.revenueGained.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Opportunity Cost</p>
          <p className="font-medium text-amber-600 dark:text-amber-400">${scenario.analysis.opportunityCost.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Ancillary</p>
          <p className="font-medium text-blue-600 dark:text-blue-400">${scenario.analysis.ancillaryRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Net Profit</p>
          <p className={`font-medium ${scenario.analysis.totalProfitability >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${scenario.analysis.totalProfitability.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {scenario.analysis.recommendation === 'accept' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {scenario.analysis.recommendation === 'accept' ? 'Accept this group' : 'Reject this group'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface FormulaCardProps {
  title: string;
  formula: string;
  description: string;
  example: string;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ title, formula, description, example }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h4>
      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded mb-2">
        <code className="text-sm text-blue-600 dark:text-blue-400">{formula}</code>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{description}</p>
      <p className="text-xs text-slate-500 dark:text-slate-500">Example: {example}</p>
    </div>
  );
};

export default DisplacementAnalysis;
