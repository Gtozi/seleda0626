/**
 * Dynamic Pricing Component
 * Manages automated pricing strategies including BAR, occupancy-based, demand-based, and event pricing
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Settings,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const DynamicPricing = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<'bar' | 'occupancy' | 'demand' | 'competitor' | 'event' | 'los' | 'last_minute' | 'early_booking'>('bar');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState('daily');

  const strategies = [
    { id: 'bar', name: 'BAR (Best Available Rate)', description: 'Standard rate with dynamic adjustments', active: true },
    { id: 'occupancy', name: 'Occupancy-based Pricing', description: 'Rates adjust based on occupancy levels', active: true },
    { id: 'demand', name: 'Demand-based Pricing', description: 'AI-driven demand forecasting', active: true },
    { id: 'competitor', name: 'Competitor-based Pricing', description: 'Market-competitive rate positioning', active: false },
    { id: 'event', name: 'Event Pricing', description: 'Dynamic rates during high-demand events', active: true },
    { id: 'los', name: 'Length of Stay Pricing', description: 'Discounts for longer stays', active: true },
    { id: 'last_minute', name: 'Last-minute Pricing', description: 'Discounts for unsold inventory', active: false },
    { id: 'early_booking', name: 'Early Booking Pricing', description: 'Discounts for advance bookings', active: true }
  ];

  const pricingRules = useMemo(() => [
    { id: 1, roomType: 'Deluxe Suite', strategy: 'occupancy', minOccupancy: 80, adjustment: '+15%', active: true },
    { id: 2, roomType: 'Standard Room', strategy: 'demand', demandScore: 75, adjustment: '+10%', active: true },
    { id: 3, roomType: 'Ocean View', strategy: 'event', event: 'Conference', adjustment: '+25%', active: true },
    { id: 4, roomType: 'Family Suite', strategy: 'los', minNights: 5, adjustment: '-10%', active: true }
  ], []);

  const recentAdjustments = useMemo(() => [
    { id: 1, roomType: 'Deluxe Suite', oldRate: 150, newRate: 165, reason: 'High occupancy forecast', time: '2 hours ago' },
    { id: 2, roomType: 'Standard Room', oldRate: 100, newRate: 105, reason: 'Competitor rate increase', time: '4 hours ago' },
    { id: 3, roomType: 'Ocean View', oldRate: 200, newRate: 190, reason: 'Low demand forecast', time: '6 hours ago' }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Pricing</h2>
          <p className="text-slate-600 dark:text-slate-400">Automated pricing strategies and rules</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Generate Rates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing Strategies</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto-update</span>
            <button
              onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoUpdateEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  autoUpdateEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              selected={selectedStrategy === strategy.id}
              onSelect={() => setSelectedStrategy(strategy.id as any)}
            />
          ))}
        </div>
      </div>

      {/* Pricing Rules */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Pricing Rules</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Rule
          </button>
        </div>
        <div className="space-y-3">
          {pricingRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </div>

      {/* Recent Adjustments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Rate Adjustments</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View History
          </button>
        </div>
        <div className="space-y-3">
          {recentAdjustments.map((adjustment) => (
            <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StrategyCardProps {
  strategy: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  };
  selected: boolean;
  onSelect: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, selected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{strategy.name}</h4>
        {strategy.active ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-400" />
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{strategy.description}</p>
    </button>
  );
};

interface RuleCardProps {
  rule: {
    id: number;
    roomType: string;
    strategy: string;
    minOccupancy?: number;
    demandScore?: number;
    event?: string;
    minNights?: number;
    adjustment: string;
    active: boolean;
  };
}

const RuleCard: React.FC<RuleCardProps> = ({ rule }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 dark:text-white">{rule.roomType}</h4>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {rule.strategy}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {rule.minOccupancy && `Min occupancy: ${rule.minOccupancy}% • `}
          {rule.demandScore && `Demand score: ${rule.demandScore} • `}
          {rule.event && `Event: ${rule.event} • `}
          {rule.minNights && `Min nights: ${rule.minNights} • `}
          Adjustment: {rule.adjustment}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

interface AdjustmentCardProps {
  adjustment: {
    id: number;
    roomType: string;
    oldRate: number;
    newRate: number;
    reason: string;
    time: string;
  };
}

const AdjustmentCard: React.FC<AdjustmentCardProps> = ({ adjustment }) => {
  const change = adjustment.newRate - adjustment.oldRate;
  const percentChange = Math.round((change / adjustment.oldRate) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 dark:text-white">{adjustment.roomType}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">{adjustment.time}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{adjustment.reason}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-through">
          ${adjustment.oldRate}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          ${adjustment.newRate}
        </p>
        <p className={`text-sm font-medium ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change > 0 ? '+' : ''}{percentChange}%
        </p>
      </div>
    </div>
  );
};

export default DynamicPricing;
