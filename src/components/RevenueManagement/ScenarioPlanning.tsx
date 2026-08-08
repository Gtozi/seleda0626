/**
 * Scenario Planning Component
 * Creates and compares pricing scenarios, demand scenarios, competitive scenarios, and impact analysis
 */

import React, { useState, useMemo } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Copy,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bed,
  Activity,
  Settings,
  Save,
  Download
} from 'lucide-react';

const ScenarioPlanning = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  const scenarios = useMemo(() => [
    { 
      id: '1', 
      name: 'Baseline - Current Strategy', 
      type: 'baseline',
      description: 'Current pricing and inventory strategy',
      parameters: {
        occupancy: 78,
        adr: 145,
        revpar: 113,
        revenue: 45000
      },
      results: {
        occupancy: 78,
        adr: 145,
        revpar: 113,
        revenue: 45000,
        profit: 12600
      },
      status: 'active',
      createdAt: '2024-01-15'
    },
    { 
      id: '2', 
      name: 'Aggressive Pricing', 
      type: 'pricing',
      description: 'Increase rates by 15% across all room types',
      parameters: {
        rateIncrease: 15,
        targetOccupancy: 72
      },
      results: {
        occupancy: 72,
        adr: 167,
        revpar: 120,
        revenue: 48000,
        profit: 14400
      },
      status: 'draft',
      createdAt: '2024-01-20'
    },
    { 
      id: '3', 
      name: 'Volume Focus', 
      type: 'demand',
      description: 'Reduce rates by 10% to drive occupancy to 85%',
      parameters: {
        rateDecrease: 10,
        targetOccupancy: 85
      },
      results: {
        occupancy: 85,
        adr: 131,
        revpar: 111,
        revenue: 44250,
        profit: 13275
      },
      status: 'draft',
      createdAt: '2024-01-22'
    },
    { 
      id: '4', 
      name: 'Competitive Parity', 
      type: 'competitive',
      description: 'Match competitor rates within 5%',
      parameters: {
        competitorMatch: 95,
        rateAdjustment: 8
      },
      results: {
        occupancy: 80,
        adr: 157,
        revpar: 126,
        revenue: 50400,
        profit: 15120
      },
      status: 'draft',
      createdAt: '2024-01-25'
    },
    { 
      id: '5', 
      name: 'Mixed Strategy', 
      type: 'mixed',
      description: 'Premium rates for peak, discount for off-peak',
      parameters: {
        peakIncrease: 20,
        offPeakDecrease: 15
      },
      results: {
        occupancy: 76,
        adr: 152,
        revpar: 115,
        revenue: 45750,
        profit: 13725
      },
      status: 'draft',
      createdAt: '2024-01-28'
    }
  ], []);

  const comparisonData = useMemo(() => {
    if (!comparisonMode || scenarios.length < 2) return null;
    const baseline = scenarios.find(s => s.type === 'baseline');
    if (!baseline) return null;

    return scenarios.filter(s => s.id !== baseline.id).map(scenario => ({
      name: scenario.name,
      occupancyDiff: scenario.results.occupancy - baseline.results.occupancy,
      adrDiff: scenario.results.adr - baseline.results.adr,
      revparDiff: scenario.results.revpar - baseline.results.revpar,
      revenueDiff: scenario.results.revenue - baseline.results.revenue,
      profitDiff: scenario.results.profit - baseline.results.profit
    }));
  }, [scenarios, comparisonMode]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scenario Planning</h2>
          <p className="text-slate-600 dark:text-slate-400">Create and compare revenue optimization scenarios</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Compare Scenarios
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Scenario
          </button>
        </div>
      </div>

      {/* Comparison View */}
      {comparisonMode && comparisonData && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Scenario Comparison vs Baseline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400">Scenario</th>
                  <th className="text-center p-3 text-slate-600 dark:text-slate-400">Occupancy Δ</th>
                  <th className="text-center p-3 text-slate-600 dark:text-slate-400">ADR Δ</th>
                  <th className="text-center p-3 text-slate-600 dark:text-slate-400">RevPAR Δ</th>
                  <th className="text-center p-3 text-slate-600 dark:text-slate-400">Revenue Δ</th>
                  <th className="text-center p-3 text-slate-600 dark:text-slate-400">Profit Δ</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((data, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{data.name}</td>
                    <td className="p-3 text-center">
                      <span className={data.occupancyDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {data.occupancyDiff >= 0 ? '+' : ''}{data.occupancyDiff}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={data.adrDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {data.adrDiff >= 0 ? '+' : ''}${data.adrDiff}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={data.revparDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {data.revparDiff >= 0 ? '+' : ''}${data.revparDiff}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={data.revenueDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {data.revenueDiff >= 0 ? '+' : ''}${data.revenueDiff.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={data.profitDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {data.profitDiff >= 0 ? '+' : ''}${data.profitDiff.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scenarios List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scenarios</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedScenario === scenario.id}
              onSelect={() => setSelectedScenario(scenario.id)}
            />
          ))}
        </div>
      </div>

      {/* Scenario Builder */}
      {selectedScenario && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scenario Builder</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Play className="w-4 h-4" />
                Run Simulation
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          <ScenarioBuilder scenario={scenarios.find(s => s.id === selectedScenario)!} />
        </div>
      )}
    </div>
  );
};

interface ScenarioCardProps {
  scenario: {
    id: string;
    name: string;
    type: string;
    description: string;
    results: {
      occupancy: number;
      adr: number;
      revpar: number;
      revenue: number;
      profit: number;
    };
    status: string;
    createdAt: string;
  };
  selected: boolean;
  onSelect: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, selected, onSelect }) => {
  const typeColors = {
    baseline: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    pricing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    demand: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    competitive: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    mixed: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{scenario.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[scenario.type as keyof typeof typeColors]}`}>
              {scenario.type}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{scenario.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Occupancy</p>
          <p className="font-medium text-slate-900 dark:text-white">{scenario.results.occupancy}%</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">ADR</p>
          <p className="font-medium text-slate-900 dark:text-white">${scenario.results.adr}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">RevPAR</p>
          <p className="font-medium text-slate-900 dark:text-white">${scenario.results.revpar}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-medium text-green-600 dark:text-green-400">${scenario.results.revenue.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Created: {scenario.createdAt}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ScenarioBuilderProps {
  scenario: {
    name: string;
    type: string;
    description: string;
    parameters: any;
  };
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ scenario }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scenario Name</label>
          <input
            type="text"
            defaultValue={scenario.name}
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scenario Type</label>
          <select
            defaultValue={scenario.type}
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="baseline">Baseline</option>
            <option value="pricing">Pricing Strategy</option>
            <option value="demand">Demand Focus</option>
            <option value="competitive">Competitive Response</option>
            <option value="mixed">Mixed Strategy</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
        <textarea
          defaultValue={scenario.description}
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
        />
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Rate Adjustment (%)</label>
            <input
              type="number"
              defaultValue={scenario.parameters.rateIncrease || scenario.parameters.rateDecrease || 0}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Target Occupancy (%)</label>
            <input
              type="number"
              defaultValue={scenario.parameters.targetOccupancy || 78}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Time Period</label>
            <select className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm">
              <option>Next 30 days</option>
              <option>Next 90 days</option>
              <option>Next 6 months</option>
              <option>Next 12 months</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPlanning;
