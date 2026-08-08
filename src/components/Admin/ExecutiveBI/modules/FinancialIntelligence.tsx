/**
 * Financial Intelligence Module
 * 
 * Data sourced from Finance & Accounting.
 * 
 * Analytics:
 * - Profit & Loss
 * - Balance Sheet
 * - Cash Flow
 * - Budget vs Actual
 * - Cost Centers
 * - Department Profitability
 * - Expense Trends
 * - Financial Ratios
 * - Working Capital
 * - Liquidity
 */

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Filter,
  Calendar,
  Scale,
  Wallet,
  LineChart,
  Percent
} from 'lucide-react';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'pnl' | 'balance' | 'cashflow' | 'budget' | 'costcenters' | 'ratios';
}

const FINANCIAL_ANALYTICS = [
  // Profit & Loss
  { id: 'total_revenue', name: 'Total Revenue', value: 1250000, target: 1200000, unit: '$', trend: 12, category: 'pnl' },
  { id: 'gross_profit', name: 'Gross Profit', value: 525000, target: 480000, unit: '$', trend: 10, category: 'pnl' },
  { id: 'net_profit', name: 'Net Profit', value: 380000, target: 350000, unit: '$', trend: 8, category: 'pnl' },
  { id: 'ebitda', name: 'EBITDA', value: 420000, target: 400000, unit: '$', trend: 9, category: 'pnl' },
  { id: 'operating_margin', name: 'Operating Margin', value: 42, target: 40, unit: '%', trend: 5, category: 'pnl' },
  
  // Balance Sheet
  { id: 'total_assets', name: 'Total Assets', value: 2500000, target: 2400000, unit: '$', trend: 4, category: 'balance' },
  { id: 'total_liabilities', name: 'Total Liabilities', value: 1800000, target: 1850000, unit: '$', trend: -3, category: 'balance' },
  { id: 'equity', name: 'Shareholder Equity', value: 700000, target: 550000, unit: '$', trend: 27, category: 'balance' },
  { id: 'working_capital', name: 'Working Capital', value: 450000, target: 400000, unit: '$', trend: 12, category: 'balance' },
  
  // Cash Flow
  { id: 'operating_cash_flow', name: 'Operating Cash Flow', value: 320000, target: 300000, unit: '$', trend: 7, category: 'cashflow' },
  { id: 'investing_cash_flow', name: 'Investing Cash Flow', value: -150000, target: -100000, unit: '$', trend: -50, category: 'cashflow' },
  { id: 'financing_cash_flow', name: 'Financing Cash Flow', value: 200000, target: 150000, unit: '$', trend: 33, category: 'cashflow' },
  { id: 'free_cash_flow', name: 'Free Cash Flow', value: 280000, target: 250000, unit: '$', trend: 12, category: 'cashflow' },
  
  // Budget vs Actual
  { id: 'revenue_variance', name: 'Revenue Variance', value: 8, target: 0, unit: '%', trend: 0, category: 'budget' },
  { id: 'expense_variance', name: 'Expense Variance', value: -5, target: 0, unit: '%', trend: 0, category: 'budget' },
  { id: 'profit_variance', name: 'Profit Variance', value: 12, target: 0, unit: '%', trend: 0, category: 'budget' },
  
  // Cost Centers
  { id: 'rooms_cost', name: 'Rooms Cost', value: 350000, target: 360000, unit: '$', trend: -3, category: 'costcenters' },
  { id: 'fb_cost', name: 'F&B Cost', value: 280000, target: 290000, unit: '$', trend: -3, category: 'costcenters' },
  { id: 'engineering_cost', name: 'Engineering Cost', value: 120000, target: 125000, unit: '$', trend: -4, category: 'costcenters' },
  { id: 'admin_cost', name: 'Admin Cost', value: 180000, target: 175000, unit: '$', trend: 3, category: 'costcenters' },
  
  // Financial Ratios
  { id: 'current_ratio', name: 'Current Ratio', value: 1.8, target: 1.5, unit: '', trend: 20, category: 'ratios' },
  { id: 'quick_ratio', name: 'Quick Ratio', value: 1.2, target: 1.0, unit: '', trend: 20, category: 'ratios' },
  { id: 'debt_to_equity', name: 'Debt to Equity', value: 2.6, target: 3.0, unit: '', trend: -13, category: 'ratios' },
  { id: 'return_on_assets', name: 'Return on Assets', value: 15, target: 12, unit: '%', trend: 25, category: 'ratios' },
];

const ANALYTICS_CATEGORIES = [
  { id: 'pnl', label: 'Profit & Loss', icon: BarChart3 },
  { id: 'balance', label: 'Balance Sheet', icon: Scale },
  { id: 'cashflow', label: 'Cash Flow', icon: Wallet },
  { id: 'budget', label: 'Budget vs Actual', icon: Target },
  { id: 'costcenters', label: 'Cost Centers', icon: PieChart },
  { id: 'ratios', label: 'Financial Ratios', icon: Percent },
];

const FinancialIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? FINANCIAL_ANALYTICS 
    : FINANCIAL_ANALYTICS.filter(m => m.category === selectedCategory);

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
            Financial Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Profit & Loss, cash flow, budget analysis, and financial ratios
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

      {/* Analytics Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {ANALYTICS_CATEGORIES.map(cat => {
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

      {/* Financial Metrics Grid */}
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
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : ''}
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

      {/* Department Profitability */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Department Profitability
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Rooms Division', revenue: 450000, profit: 180000, margin: 40 },
            { name: 'Food & Beverage', revenue: 320000, profit: 64000, margin: 20 },
            { name: 'Engineering', revenue: 80000, profit: 12000, margin: 15 },
            { name: 'Administration', revenue: 120000, profit: 24000, margin: 20 },
          ].map(dept => (
            <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{dept.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Revenue: ${dept.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${dept.profit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dept.margin}% margin
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Labor Costs', value: 420000, change: 5 },
            { name: 'Cost of Goods Sold', value: 280000, change: -3 },
            { name: 'Operating Expenses', value: 180000, change: 2 },
            { name: 'Utilities', value: 45000, change: -8 },
          ].map(expense => (
            <div key={expense.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{expense.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${expense.value.toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${expense.change >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expense.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">{expense.change >= 0 ? '+' : ''}{expense.change}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialIntelligence;
