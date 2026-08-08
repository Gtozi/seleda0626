/**
 * Rate Management Component
 * Manages rate plans, seasonal rates, weekend rates, and rate features
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Star
} from 'lucide-react';

const RateManagement = () => {
  const [selectedRatePlan, setSelectedRatePlan] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const ratePlans = useMemo(() => [
    { 
      id: '1', 
      name: 'BAR (Best Available Rate)', 
      code: 'BAR',
      type: 'Standard',
      baseRate: 150,
      currency: 'USD',
      active: true,
      description: 'Standard rate for all guests',
      features: ['Flexible cancellation', 'Free WiFi', 'Breakfast included']
    },
    { 
      id: '2', 
      name: 'Corporate Rate', 
      code: 'CORP',
      type: 'Corporate',
      baseRate: 120,
      currency: 'USD',
      active: true,
      description: 'Negotiated corporate rates',
      features: ['Flexible cancellation', 'Free WiFi', 'Breakfast included', 'Late checkout']
    },
    { 
      id: '3', 
      name: 'Government Rate', 
      code: 'GOV',
      type: 'Government',
      baseRate: 100,
      currency: 'USD',
      active: true,
      description: 'Government employee rates',
      features: ['ID required', 'Free WiFi', 'Breakfast included']
    },
    { 
      id: '4', 
      name: 'OTA Rate', 
      code: 'OTA',
      type: 'OTA',
      baseRate: 165,
      currency: 'USD',
      active: true,
      description: 'Online Travel Agency rates',
      features: ['Commission included', 'Free WiFi', 'Breakfast included']
    },
    { 
      id: '5', 
      name: 'Package Rate', 
      code: 'PKG',
      type: 'Package',
      baseRate: 200,
      currency: 'USD',
      active: true,
      description: 'Room + dining package',
      features: ['Dining credit', 'Free WiFi', 'Breakfast included', 'Spa access']
    },
    { 
      id: '6', 
      name: 'Loyalty Rate', 
      code: 'LOY',
      type: 'Loyalty',
      baseRate: 135,
      currency: 'USD',
      active: true,
      description: 'Member exclusive rates',
      features: ['Member only', 'Free WiFi', 'Breakfast included', 'Points earned']
    }
  ], []);

  const seasonalRates = useMemo(() => [
    { id: 1, name: 'Peak Season', startDate: '2024-12-15', endDate: '2025-01-15', adjustment: '+30%', active: true },
    { id: 2, name: 'High Season', startDate: '2024-06-01', endDate: '2024-08-31', adjustment: '+20%', active: true },
    { id: 3, name: 'Shoulder Season', startDate: '2024-04-01', endDate: '2024-05-31', adjustment: '+10%', active: true },
    { id: 4, name: 'Low Season', startDate: '2024-09-01', endDate: '2024-11-30', adjustment: '-15%', active: true }
  ], []);

  const weekendRates = useMemo(() => [
    { id: 1, roomType: 'Deluxe Suite', weekdayRate: 150, weekendRate: 180, adjustment: '+20%', active: true },
    { id: 2, roomType: 'Standard Room', weekdayRate: 100, weekendRate: 120, adjustment: '+20%', active: true },
    { id: 3, roomType: 'Ocean View', weekdayRate: 200, weekendRate: 240, adjustment: '+20%', active: true }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rate Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage rate plans, seasonal rates, and rate features</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Calendar className="w-4 h-4" />
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Rate Plan
          </button>
        </div>
      </div>

      {/* Rate Plans */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rate Plans</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>{ratePlans.filter(r => r.active).length} active</span>
            <span>•</span>
            <span>{ratePlans.length} total</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratePlans.map((plan) => (
            <RatePlanCard
              key={plan.id}
              plan={plan}
              selected={selectedRatePlan === plan.id}
              onSelect={() => setSelectedRatePlan(plan.id)}
            />
          ))}
        </div>
      </div>

      {/* Seasonal Rates */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Seasonal Rates</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Season
          </button>
        </div>
        <div className="space-y-3">
          {seasonalRates.map((season) => (
            <SeasonalRateCard key={season.id} season={season} />
          ))}
        </div>
      </div>

      {/* Weekend Rates */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekend Rates</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Configure
          </button>
        </div>
        <div className="space-y-3">
          {weekendRates.map((rate) => (
            <WeekendRateCard key={rate.id} rate={rate} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface RatePlanCardProps {
  plan: {
    id: string;
    name: string;
    code: string;
    type: string;
    baseRate: number;
    currency: string;
    active: boolean;
    description: string;
    features: string[];
  };
  selected: boolean;
  onSelect: () => void;
}

const RatePlanCard: React.FC<RatePlanCardProps> = ({ plan, selected, onSelect }) => {
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h4>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {plan.code}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
        </div>
        {plan.active ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">{plan.type}</span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {plan.currency} {plan.baseRate}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {plan.features.slice(0, 3).map((feature, idx) => (
          <span key={idx} className="text-xs text-slate-600 dark:text-slate-400">
            • {feature}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
          <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
          <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

interface SeasonalRateCardProps {
  season: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    adjustment: string;
    active: boolean;
  };
}

const SeasonalRateCard: React.FC<SeasonalRateCardProps> = ({ season }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 dark:text-white">{season.name}</h4>
          {season.active ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {season.startDate} → {season.endDate}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-semibold ${season.adjustment.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {season.adjustment}
        </p>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Edit
        </button>
      </div>
    </div>
  );
};

interface WeekendRateCardProps {
  rate: {
    id: number;
    roomType: string;
    weekdayRate: number;
    weekendRate: number;
    adjustment: string;
    active: boolean;
  };
}

const WeekendRateCard: React.FC<WeekendRateCardProps> = ({ rate }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-white mb-1">{rate.roomType}</h4>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>Weekday: ${rate.weekdayRate}</span>
          <span>Weekend: ${rate.weekendRate}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-green-600 dark:text-green-400">{rate.adjustment}</p>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Edit
        </button>
      </div>
    </div>
  );
};

export default RateManagement;
