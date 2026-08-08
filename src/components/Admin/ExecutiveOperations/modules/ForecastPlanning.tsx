/**
 * Forecast & Planning Module
 * Revenue forecast, occupancy forecast, budget planning, labor planning, inventory forecast, cash flow forecast, capital planning, scenario planning
 */

import { useState } from 'react';
import {
  Target,
  Bed,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Building2,
  BarChart3
} from 'lucide-react';

const ForecastPlanning = () => {
  const [selectedView, setSelectedView] = useState<'revenue' | 'occupancy' | 'budget' | 'labor' | 'inventory' | 'cashflow' | 'capital' | 'scenario'>('revenue');

  const views = [
    { id: 'revenue', label: 'Revenue Forecast', icon: DollarSign },
    { id: 'occupancy', label: 'Occupancy Forecast', icon: Bed },
    { id: 'budget', label: 'Budget Planning', icon: Target },
    { id: 'labor', label: 'Labor Planning', icon: Users },
    { id: 'inventory', label: 'Inventory Forecast', icon: ShoppingCart },
    { id: 'cashflow', label: 'Cash Flow Forecast', icon: TrendingUp },
    { id: 'capital', label: 'Capital Planning', icon: Building2 },
    { id: 'scenario', label: 'Scenario Planning', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedView === view.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Icon size={14} />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          {views.find(v => v.id === selectedView)?.label}
        </h3>
        <div className="text-center py-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Forecasting and planning tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForecastPlanning;
