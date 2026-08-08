/**
 * Business Intelligence Component
 * Provides revenue analytics, forecast analytics, daily/weekly/monthly revenue, YoY comparison, market trends, and revenue heat maps
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  LineChart,
  PieChart,
  Settings,
  Download,
  Filter
} from 'lucide-react';

const BusinessIntelligence = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'ytd'>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'occupancy' | 'adr' | 'revpar'>('revenue');

  const revenueData = useMemo(() => [
    { period: 'Jan', revenue: 45000, occupancy: 72, adr: 145, revpar: 104 },
    { period: 'Feb', revenue: 42000, occupancy: 68, adr: 142, revpar: 97 },
    { period: 'Mar', revenue: 48000, occupancy: 75, adr: 148, revpar: 111 },
    { period: 'Apr', revenue: 52000, occupancy: 78, adr: 152, revpar: 119 },
    { period: 'May', revenue: 49000, occupancy: 74, adr: 150, revpar: 111 },
    { period: 'Jun', revenue: 55000, occupancy: 80, adr: 155, revpar: 124 },
    { period: 'Jul', revenue: 58000, occupancy: 82, adr: 158, revpar: 130 },
    { period: 'Aug', revenue: 56000, occupancy: 81, adr: 156, revpar: 126 },
    { period: 'Sep', revenue: 51000, occupancy: 76, adr: 152, revpar: 115 },
    { period: 'Oct', revenue: 47000, occupancy: 73, adr: 148, revpar: 108 },
    { period: 'Nov', revenue: 44000, occupancy: 70, adr: 145, revpar: 102 },
    { period: 'Dec', revenue: 62000, occupancy: 85, adr: 165, revpar: 140 }
  ], []);

  const yoyComparison = useMemo(() => [
    { metric: 'Total Revenue', current: 609000, previous: 545000, growth: 11.7 },
    { metric: 'Occupancy', current: 76.5, previous: 72.3, growth: 5.8 },
    { metric: 'ADR', current: 151, previous: 142, growth: 6.3 },
    { metric: 'RevPAR', current: 115, previous: 103, growth: 11.7 }
  ], []);

  const marketTrends = useMemo(() => [
    { trend: 'Business travel recovery', impact: 'positive', confidence: 85 },
    { trend: 'Leisure demand surge', impact: 'positive', confidence: 78 },
    { trend: 'Group booking increase', impact: 'positive', confidence: 72 },
    { trend: 'Rate compression in OTA', impact: 'negative', confidence: 65 }
  ], []);

  const forecastAccuracy = useMemo(() => [
    { period: 'Last 7 days', accuracy: 92, variance: 3 },
    { period: 'Last 30 days', accuracy: 88, variance: 5 },
    { period: 'Last 90 days', accuracy: 85, variance: 7 }
  ], []);

  const getMetricValue = (data: any) => {
    switch (selectedMetric) {
      case 'revenue': return data.revenue;
      case 'occupancy': return data.occupancy;
      case 'adr': return data.adr;
      case 'revpar': return data.revpar;
      default: return data.revenue;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Revenue';
      case 'occupancy': return 'Occupancy %';
      case 'adr': return 'ADR ($)';
      case 'revpar': return 'RevPAR ($)';
      default: return 'Revenue';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Business Intelligence</h2>
          <p className="text-slate-600 dark:text-slate-400">Revenue analytics and market intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="ytd">Year to Date</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* YoY Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Year-over-Year Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {yoyComparison.map((item) => (
            <YoYCard key={item.metric} item={item} />
          ))}
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{getMetricLabel()} Trend</h3>
          <div className="flex gap-2">
            {['revenue', 'occupancy', 'adr', 'revpar'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-end gap-2">
          {revenueData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                style={{
                  height: `${(getMetricValue(data) / Math.max(...revenueData.map(d => getMetricValue(d)))) * 100}%`
                }}
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{data.period}</p>
              <p className="text-xs font-medium text-slate-900 dark:text-white">
                {selectedMetric === 'occupancy' ? `${getMetricValue(data)}%` : `$${getMetricValue(data)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Market Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketTrends.map((trend, idx) => (
            <TrendCard key={idx} trend={trend} />
          ))}
        </div>
      </div>

      {/* Forecast Accuracy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Forecast Accuracy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecastAccuracy.map((forecast) => (
            <ForecastAccuracyCard key={forecast.period} forecast={forecast} />
          ))}
        </div>
      </div>

      {/* Revenue Heat Map */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Heat Map (Room Type vs Month)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-2 text-slate-600 dark:text-slate-400">Room Type</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">Jan</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">Feb</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">Mar</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">Apr</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">May</th>
                <th className="text-center p-2 text-slate-600 dark:text-slate-400">Jun</th>
              </tr>
            </thead>
            <tbody>
              {['Deluxe Suite', 'Standard Room', 'Ocean View', 'Family Suite'].map((roomType) => (
                <tr key={roomType} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 text-slate-900 dark:text-white font-medium">{roomType}</td>
                  {[1, 2, 3, 4, 5, 6].map((month) => {
                    const intensity = Math.random() * 100;
                    const color = intensity > 75 ? 'bg-green-500' : intensity > 50 ? 'bg-green-400' : intensity > 25 ? 'bg-green-300' : 'bg-green-200';
                    return (
                      <td key={month} className="p-2">
                        <div className={`w-full h-8 ${color} rounded flex items-center justify-center text-xs font-medium text-white`}>
                          {Math.round(intensity)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface YoYCardProps {
  item: {
    metric: string;
    current: number;
    previous: number;
    growth: number;
  };
}

const YoYCard: React.FC<YoYCardProps> = ({ item }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{item.metric}</p>
      <div className="flex items-center justify-between mb-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {item.metric.includes('Revenue') || item.metric.includes('ADR') || item.metric.includes('RevPAR') ? '$' : ''}{item.current.toLocaleString()}
        </p>
        <div className={`flex items-center gap-1 text-sm font-medium ${item.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {item.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(item.growth)}%
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Previous: {item.metric.includes('Revenue') || item.metric.includes('ADR') || item.metric.includes('RevPAR') ? '$' : ''}{item.previous.toLocaleString()}
      </p>
    </div>
  );
};

interface TrendCardProps {
  trend: {
    trend: string;
    impact: 'positive' | 'negative';
    confidence: number;
  };
}

const TrendCard: React.FC<TrendCardProps> = ({ trend }) => {
  const impactColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{trend.trend}</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[trend.impact]}`}>
          {trend.impact}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">Confidence</span>
        <span className="font-semibold text-slate-900 dark:text-white">{trend.confidence}%</span>
      </div>
    </div>
  );
};

interface ForecastAccuracyCardProps {
  forecast: {
    period: string;
    accuracy: number;
    variance: number;
  };
}

const ForecastAccuracyCard: React.FC<ForecastAccuracyCardProps> = ({ forecast }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{forecast.period}</p>
      <div className="flex items-center justify-between mb-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{forecast.accuracy}%</p>
        <Activity className="w-5 h-5 text-blue-500" />
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${forecast.accuracy}%` }}
        />
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Variance: ±{forecast.variance}%</p>
    </div>
  );
};

export default BusinessIntelligence;
