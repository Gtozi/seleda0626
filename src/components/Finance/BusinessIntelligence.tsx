import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  change_percent: number;
  period: string;
  unit: string;
}

interface RevenueTrend {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface LiquidityRatio {
  name: string;
  value: number;
  benchmark: number;
  status: 'good' | 'warning' | 'critical';
}

const BusinessIntelligence = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'ratios' | 'forecasts' | 'cost_analysis'>('overview');
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [liquidityRatios, setLiquidityRatios] = useState<LiquidityRatio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'overview':
        await fetchMetrics();
        break;
      case 'trends':
        await fetchRevenueTrends();
        break;
      case 'ratios':
        await fetchLiquidityRatios();
        break;
    }
    setLoading(false);
  };

  const fetchMetrics = async () => {
    const { data } = await supabase
      .from('financial_metrics')
      .select('*')
      .order('name');
    setMetrics(data || []);
  };

  const fetchRevenueTrends = async () => {
    const { data } = await supabase
      .from('revenue_trends')
      .select('*')
      .order('period');
    setRevenueTrends(data || []);
  };

  const fetchLiquidityRatios = async () => {
    const { data } = await supabase
      .from('liquidity_ratios')
      .select('*');
    setLiquidityRatios(data || []);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'ratios', label: 'Financial Ratios' },
    { id: 'forecasts', label: 'Forecasts' },
    { id: 'cost_analysis', label: 'Cost Analysis' },
  ];

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 min-h-screen p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit shadow-sm hover:shadow-md transition-all duration-300">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewView metrics={metrics} />}
          {activeTab === 'trends' && <TrendsView trends={revenueTrends} />}
          {activeTab === 'ratios' && <RatiosView ratios={liquidityRatios} />}
          {activeTab === 'forecasts' && <ForecastsView />}
          {activeTab === 'cost_analysis' && <CostAnalysisView />}
        </>
      )}
    </div>
  );
};

const OverviewView = ({ metrics }: { metrics: FinancialMetric[] }) => {
  const kpiCards = [
    { name: 'Total Revenue', value: metrics.find(m => m.name === 'total_revenue')?.value || 0, change: metrics.find(m => m.name === 'total_revenue')?.change_percent || 0, color: 'green' },
    { name: 'Total Expenses', value: metrics.find(m => m.name === 'total_expenses')?.value || 0, change: metrics.find(m => m.name === 'total_expenses')?.change_percent || 0, color: 'red' },
    { name: 'Gross Profit', value: metrics.find(m => m.name === 'gross_profit')?.value || 0, change: metrics.find(m => m.name === 'gross_profit')?.change_percent || 0, color: 'blue' },
    { name: 'Operating Profit', value: metrics.find(m => m.name === 'operating_profit')?.value || 0, change: metrics.find(m => m.name === 'operating_profit')?.change_percent || 0, color: 'purple' },
    { name: 'Net Profit', value: metrics.find(m => m.name === 'net_profit')?.value || 0, change: metrics.find(m => m.name === 'net_profit')?.change_percent || 0, color: 'green' },
    { name: 'EBITDA', value: metrics.find(m => m.name === 'ebitda')?.value || 0, change: metrics.find(m => m.name === 'ebitda')?.change_percent || 0, color: 'blue' },
    { name: 'Cash Position', value: metrics.find(m => m.name === 'cash_position')?.value || 0, change: metrics.find(m => m.name === 'cash_position')?.change_percent || 0, color: 'green' },
    { name: 'Bank Balance', value: metrics.find(m => m.name === 'bank_balance')?.value || 0, change: metrics.find(m => m.name === 'bank_balance')?.change_percent || 0, color: 'blue' },
  ];

  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Overview</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Key performance indicators and summaries</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <div key={kpi.name} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.name}</div>
            <div className={`text-2xl font-bold ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
              ${kpi.value.toLocaleString()}
            </div>
            <div className={`text-sm font-medium mt-1 ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            AR Aging Summary
          </h3>
          <div className="space-y-3">
            {[
              { label: '0-30 Days', amount: 45000, color: 'bg-green-500' },
              { label: '31-60 Days', amount: 23000, color: 'bg-yellow-500' },
              { label: '61-90 Days', amount: 12000, color: 'bg-orange-500' },
              { label: '90+ Days', amount: 8000, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            AP Aging Summary
          </h3>
          <div className="space-y-3">
            {[
              { label: '0-30 Days', amount: 32000, color: 'bg-green-500' },
              { label: '31-60 Days', amount: 18000, color: 'bg-yellow-500' },
              { label: '61-90 Days', amount: 9000, color: 'bg-orange-500' },
              { label: '90+ Days', amount: 5000, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendsView = ({ trends }: { trends: RevenueTrend[] }) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue and Expense Trends</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Historical revenue, expense, and profit analysis</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Revenue & Expense Trends
        </h3>
        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-slate-500 dark:text-slate-400">
            Chart visualization would be rendered here
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Period</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Expenses</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Profit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {trends.map(trend => {
              const margin = trend.revenue > 0 ? (trend.profit / trend.revenue) * 100 : 0;
              return (
                <tr key={trend.period} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium">{trend.period}</td>
                  <td className="px-4 py-3 text-right text-green-600">${trend.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">${trend.expenses.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${trend.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${trend.profit.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{margin.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RatiosView = ({ ratios }: { ratios: LiquidityRatio[] }) => {
  const statusColors = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Ratios</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Liquidity, profitability, and efficiency ratios</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ratios.map(ratio => (
          <div key={ratio.name} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{ratio.name}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {ratio.value.toFixed(2)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Benchmark: {ratio.benchmark}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ratio.status]}`}>
                {ratio.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Ratio Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Liquidity Ratios</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Current Ratio</span>
                <span className="font-medium">1.85</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Quick Ratio</span>
                <span className="font-medium">1.42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Cash Ratio</span>
                <span className="font-medium">0.95</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Profitability Ratios</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Margin</span>
                <span className="font-medium">42.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Operating Margin</span>
                <span className="font-medium">18.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Net Profit Margin</span>
                <span className="font-medium">12.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForecastsView = () => {
  const mockForecastData = [
    { metric: 'Revenue', forecast: 850000, actual: 875000, variance: 25000, accuracy: 97.1, period: 'Q2 2024' },
    { metric: 'Expenses', forecast: 620000, actual: 635000, variance: 15000, accuracy: 97.6, period: 'Q2 2024' },
    { metric: 'Net Profit', forecast: 230000, actual: 240000, variance: 10000, accuracy: 95.8, period: 'Q2 2024' },
    { metric: 'Occupancy Rate', forecast: 78, actual: 82, variance: 4, accuracy: 95.1, period: 'Q2 2024' },
    { metric: 'ADR', forecast: 145, actual: 152, variance: 7, accuracy: 95.4, period: 'Q2 2024' },
    { metric: 'RevPAR', forecast: 113, actual: 125, variance: 12, accuracy: 90.4, period: 'Q2 2024' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Forecasts</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Forecast vs actual performance comparison</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Accuracy</div>
          <div className="text-2xl font-bold text-green-600">
            {(mockForecastData.reduce((sum, f) => sum + f.accuracy, 0) / mockForecastData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Variance</div>
          <div className="text-2xl font-bold text-blue-600">
            ${mockForecastData.reduce((sum, f) => sum + (typeof f.variance === 'number' && f.metric !== 'Occupancy Rate' && f.metric !== 'ADR' && f.metric !== 'RevPAR' ? f.variance : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Over Forecast</div>
          <div className="text-2xl font-bold text-emerald-600">
            {mockForecastData.filter(f => f.actual > f.forecast).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Under Forecast</div>
          <div className="text-2xl font-bold text-rose-600">
            {mockForecastData.filter(f => f.actual < f.forecast).length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Forecast vs Actual Comparison
        </h3>
        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg mb-6">
          <div className="text-slate-500 dark:text-slate-400">
            Chart visualization would be rendered here
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Metric</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Forecast</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actual</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Variance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Accuracy %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Period</th>
            </tr>
          </thead>
          <tbody>
            {mockForecastData.map(forecast => (
              <tr key={forecast.metric} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{forecast.metric}</td>
                <td className="px-4 py-3 text-right">
                  {typeof forecast.forecast === 'number' && forecast.metric !== 'Occupancy Rate' && forecast.metric !== 'ADR' && forecast.metric !== 'RevPAR' 
                    ? `$${forecast.forecast.toLocaleString()}` 
                    : forecast.forecast}
                </td>
                <td className="px-4 py-3 text-right">
                  {typeof forecast.actual === 'number' && forecast.metric !== 'Occupancy Rate' && forecast.metric !== 'ADR' && forecast.metric !== 'RevPAR' 
                    ? `$${forecast.actual.toLocaleString()}` 
                    : forecast.actual}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${forecast.actual >= forecast.forecast ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {forecast.actual >= forecast.forecast ? '+' : ''}{typeof forecast.variance === 'number' && forecast.metric !== 'Occupancy Rate' && forecast.metric !== 'ADR' && forecast.metric !== 'RevPAR' 
                    ? `$${forecast.variance.toLocaleString()}` 
                    : forecast.variance}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    forecast.accuracy >= 95 ? 'bg-green-100 text-green-800' :
                    forecast.accuracy >= 90 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {forecast.accuracy.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{forecast.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CostAnalysisView = () => {
  const mockCostData = [
    { category: 'Room Operations', budget: 250000, actual: 245000, variance: -5000, variancePercent: -2.0, trend: 'Decreasing' },
    { category: 'Food & Beverage', budget: 180000, actual: 195000, variance: 15000, variancePercent: 8.3, trend: 'Increasing' },
    { category: 'Staff Salaries', budget: 320000, actual: 325000, variance: 5000, variancePercent: 1.6, trend: 'Stable' },
    { category: 'Utilities', budget: 45000, actual: 48000, variance: 3000, variancePercent: 6.7, trend: 'Increasing' },
    { category: 'Maintenance', budget: 35000, actual: 32000, variance: -3000, variancePercent: -8.6, trend: 'Decreasing' },
    { category: 'Marketing', budget: 28000, actual: 30000, variance: 2000, variancePercent: 7.1, trend: 'Increasing' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Cost Analysis</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Budget vs actual cost breakdown by category</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-blue-600">
            ${mockCostData.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Actual</div>
          <div className="text-2xl font-bold text-green-600">
            ${mockCostData.reduce((sum, c) => sum + c.actual, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Variance</div>
          <div className="text-2xl font-bold text-yellow-600">
            ${mockCostData.reduce((sum, c) => sum + c.variance, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Over Budget</div>
          <div className="text-2xl font-bold text-red-600">
            {mockCostData.filter(c => c.variance > 0).length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actual</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Variance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Variance %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody>
            {mockCostData.map(cost => (
              <tr key={cost.category} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{cost.category}</td>
                <td className="px-4 py-3 text-right">${cost.budget.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">${cost.actual.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-medium ${cost.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {cost.variance >= 0 ? '+' : ''}${cost.variance.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right ${cost.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {cost.variancePercent >= 0 ? '+' : ''}{cost.variancePercent.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    cost.trend === 'Decreasing' ? 'bg-green-100 text-green-800' :
                    cost.trend === 'Increasing' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cost.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
