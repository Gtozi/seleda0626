/**
 * Demand Forecasts Component
 * Displays AI-powered demand predictions with enhanced KPIs and features
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Target,
  DollarSign,
  Bed,
  Users,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Download,
  Filter
} from 'lucide-react';

const DemandForecasts = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90' | '365'>('30');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');

  const forecastData = useMemo(() => [
    { date: '2024-01-29', occupancy: 78, adr: 145, revpar: 113, demand: 'high', confidence: 92 },
    { date: '2024-01-30', occupancy: 82, adr: 148, revpar: 121, demand: 'high', confidence: 88 },
    { date: '2024-01-31', occupancy: 75, adr: 142, revpar: 107, demand: 'medium', confidence: 85 },
    { date: '2024-02-01', occupancy: 70, adr: 138, revpar: 97, demand: 'low', confidence: 82 },
    { date: '2024-02-02', occupancy: 85, adr: 155, revpar: 132, demand: 'high', confidence: 90 },
    { date: '2024-02-03', occupancy: 88, adr: 160, revpar: 141, demand: 'high', confidence: 87 },
    { date: '2024-02-04', occupancy: 65, adr: 135, revpar: 88, demand: 'low', confidence: 80 },
  ], []);

  const forecastMetrics = useMemo(() => {
    const avgOccupancy = Math.round(forecastData.reduce((sum, f) => sum + f.occupancy, 0) / forecastData.length);
    const avgADR = Math.round(forecastData.reduce((sum, f) => sum + f.adr, 0) / forecastData.length);
    const avgRevPAR = Math.round(forecastData.reduce((sum, f) => sum + f.revpar, 0) / forecastData.length);
    const avgConfidence = Math.round(forecastData.reduce((sum, f) => sum + f.confidence, 0) / forecastData.length);
    const highDemandDays = forecastData.filter(f => f.demand === 'high').length;

    return { avgOccupancy, avgADR, avgRevPAR, avgConfidence, highDemandDays };
  }, [forecastData]);

  const demandFactors = useMemo(() => [
    { factor: 'Local Events', impact: 'positive', confidence: 85, description: 'Conference in city center' },
    { factor: 'Seasonality', impact: 'positive', confidence: 90, description: 'Peak season approaching' },
    { factor: 'Competitor Pricing', impact: 'neutral', confidence: 75, description: 'Competitor rates stable' },
    { factor: 'Weather Forecast', impact: 'negative', confidence: 70, description: 'Rain expected' }
  ], []);

  const roomTypes = ['all', 'Deluxe Suite', 'Standard Room', 'Ocean View', 'Family Suite'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Demand Forecasts</h2>
          <p className="text-slate-600 dark:text-slate-400">AI-powered demand predictions and revenue forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>{type === 'all' ? 'All Room Types' : type}</option>
            ))}
          </select>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
            <option value="365">Next 365 days</option>
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

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Avg Occupancy"
          value={`${forecastMetrics.avgOccupancy}%`}
          icon={<Bed className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Avg ADR"
          value={`$${forecastMetrics.avgADR}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Avg RevPAR"
          value={`$${forecastMetrics.avgRevPAR}`}
          icon={<Target className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Confidence"
          value={`${forecastMetrics.avgConfidence}%`}
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="High Demand Days"
          value={forecastMetrics.highDemandDays}
          icon={<TrendingUp className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Forecast Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Demand Forecast Chart</h3>
          <div className="flex items-center gap-2">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Chart</button>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Table</button>
          </div>
        </div>
        <div className="space-y-3">
          {forecastData.map((forecast) => (
            <ForecastRow key={forecast.date} forecast={forecast} />
          ))}
        </div>
      </div>

      {/* Demand Factors */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Demand Factors</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Factors
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandFactors.map((factor, idx) => (
            <DemandFactorCard key={idx} factor={factor} />
          ))}
        </div>
      </div>

      {/* Forecast Accuracy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Forecast Accuracy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AccuracyCard
            title="Last 7 Days"
            accuracy={92}
            variance={3}
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
          <AccuracyCard
            title="Last 30 Days"
            accuracy={88}
            variance={5}
            icon={<Activity className="w-5 h-5 text-blue-500" />}
          />
          <AccuracyCard
            title="Last 90 Days"
            accuracy={85}
            variance={7}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
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
  color: 'blue' | 'green' | 'purple' | 'amber' | 'rose';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
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

interface ForecastRowProps {
  forecast: {
    date: string;
    occupancy: number;
    adr: number;
    revpar: number;
    demand: string;
    confidence: number;
  };
}

const ForecastRow: React.FC<ForecastRowProps> = ({ forecast }) => {
  const demandColors = {
    high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    low: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{forecast.date}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${demandColors[forecast.demand as keyof typeof demandColors]}`}>
            {forecast.demand} demand
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">Occupancy</p>
          <p className="font-semibold text-slate-900 dark:text-white">{forecast.occupancy}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">ADR</p>
          <p className="font-semibold text-slate-900 dark:text-white">${forecast.adr}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">RevPAR</p>
          <p className="font-semibold text-slate-900 dark:text-white">${forecast.revpar}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">Confidence</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">{forecast.confidence}%</p>
        </div>
      </div>
    </div>
  );
};

interface DemandFactorCardProps {
  factor: {
    factor: string;
    impact: string;
    confidence: number;
    description: string;
  };
}

const DemandFactorCard: React.FC<DemandFactorCardProps> = ({ factor }) => {
  const impactColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{factor.factor}</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[factor.impact as keyof typeof impactColors]}`}>
          {factor.impact}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{factor.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Confidence</span>
        <span className="font-medium text-slate-900 dark:text-white">{factor.confidence}%</span>
      </div>
    </div>
  );
};

interface AccuracyCardProps {
  title: string;
  accuracy: number;
  variance: number;
  icon: React.ReactNode;
}

const AccuracyCard: React.FC<AccuracyCardProps> = ({ title, accuracy, variance, icon }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        {icon}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Accuracy</span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{accuracy}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Variance: ±{variance}%</p>
    </div>
  );
};

export default DemandForecasts;
