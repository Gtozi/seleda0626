/**
 * RMS Dashboard - Main Dashboard Component
 * Displays key revenue management KPIs, charts, and actionable insights
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Bed,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Activity,
  BarChart3,
  LineChart
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const RMSDashboard = () => {
  const { rooms, reservations, salesTransactions, currentSystemDate, formatAmount } = useERP();

  // Calculate RMS KPIs
  const metrics = useMemo(() => {
    const today = currentSystemDate;
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayReservations = reservations.filter(r =>
      r.checkInDate <= today && r.checkOutDate > today
    );

    // Occupancy Rate
    const occupancyRate = rooms.length > 0
      ? Math.round((todayReservations.length / rooms.length) * 100)
      : 0;

    // ADR - Average Daily Rate
    const todayRoomRevenue = salesTransactions
      .filter(t => t.date === today && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const adr = todayReservations.length > 0
      ? Math.round(todayRoomRevenue / todayReservations.length)
      : 0;

    // RevPAR - Revenue Per Available Room
    const revpar = rooms.length > 0
      ? Math.round(todayRoomRevenue / rooms.length)
      : 0;

    // Revenue Growth (vs last week)
    const lastWeekRevenue = salesTransactions
      .filter(t => new Date(t.date) >= weekAgo && new Date(t.date) < new Date(today) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const revenueGrowth = lastWeekRevenue > 0
      ? Math.round(((todayRoomRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : 0;

    // Pending Recommendations
    const pendingRecommendations = 8; // Would come from RMS API

    // Rate Parity Status
    const parityViolations = 2; // Would come from RMS API

    // Forecast Accuracy
    const forecastAccuracy = 87; // Would come from RMS API

    // Additional KPIs from new architecture
    const gopPAR = Math.round(revpar * 0.35); // Gross Operating Profit Per Available Room
    const revenuePerGuest = todayReservations.length > 0 ? Math.round(todayRoomRevenue / todayReservations.length * 1.5) : 0;
    const totalRevenue = todayRoomRevenue + Math.round(todayRoomRevenue * 0.25); // Room + ancillary
    const marketPenetration = 78; // Would come from RMS API
    const mpi = 1.15; // Market Penetration Index
    const rgci = 1.08; // Revenue Generation Capacity Index
    const forecastRevenue = Math.round(todayRoomRevenue * 1.12); // Forecasted revenue

    return {
      occupancyRate,
      adr,
      revpar,
      revenueGrowth,
      pendingRecommendations,
      parityViolations,
      forecastAccuracy,
      todayRoomRevenue,
      gopPAR,
      revenuePerGuest,
      totalRevenue,
      marketPenetration,
      mpi,
      rgci,
      forecastRevenue
    };
  }, [reservations, rooms, salesTransactions, currentSystemDate]);

  // Mock pricing recommendations data
  const recommendations = useMemo(() => [
    { id: 1, roomType: 'Deluxe Suite', currentRate: 150, recommendedRate: 165, confidence: 92, reason: 'High demand forecast' },
    { id: 2, roomType: 'Standard Room', currentRate: 100, recommendedRate: 105, confidence: 85, reason: 'Competitor rate increase' },
    { id: 3, roomType: 'Ocean View', currentRate: 200, recommendedRate: 190, confidence: 78, reason: 'Low occupancy forecast' },
    { id: 4, roomType: 'Family Suite', currentRate: 250, recommendedRate: 275, confidence: 88, reason: 'Weekend demand surge' },
  ], []);

  // Mock competitor data
  const competitors = useMemo(() => [
    { name: 'Hotel A', rate: 155, occupancy: 78, adr: 145 },
    { name: 'Hotel B', rate: 145, occupancy: 82, adr: 138 },
    { name: 'Hotel C', rate: 160, occupancy: 75, adr: 152 },
    { name: 'Our Hotel', rate: metrics.adr, occupancy: metrics.occupancyRate, adr: metrics.adr },
  ], [metrics]);

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate}%`}
          change={metrics.occupancyRate > 75 ? 5 : -3}
          icon={<Bed className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="ADR"
          value={formatAmount(metrics.adr)}
          change={metrics.revenueGrowth}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="RevPAR"
          value={formatAmount(metrics.revpar)}
          change={metrics.revenueGrowth}
          icon={<Target className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="GOPPAR"
          value={formatAmount(metrics.gopPAR)}
          change={metrics.revenueGrowth}
          icon={<TrendingUp className="w-5 h-5" />}
          color="cyan"
        />
        <KPICard
          title="Revenue Per Guest"
          value={formatAmount(metrics.revenuePerGuest)}
          change={metrics.revenueGrowth}
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <KPICard
          title="Total Revenue"
          value={formatAmount(metrics.totalRevenue)}
          change={metrics.revenueGrowth}
          icon={<LineChart className="w-5 h-5" />}
          color="emerald"
        />
        <KPICard
          title="Market Penetration"
          value={`${metrics.marketPenetration}%`}
          change={3}
          icon={<BarChart3 className="w-5 h-5" />}
          color="amber"
        />
        <KPICard
          title="MPI"
          value={metrics.mpi.toFixed(2)}
          change={5}
          icon={<Activity className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SecondaryKPICard
          title="RGI (Revenue Generation Index)"
          value={metrics.rgci.toFixed(2)}
          target={1.0}
          icon={<Target className="w-5 h-5" />}
        />
        <SecondaryKPICard
          title="Forecast Revenue"
          value={formatAmount(metrics.forecastRevenue)}
          actual={formatAmount(metrics.totalRevenue)}
          variance={Math.round(((metrics.forecastRevenue - metrics.totalRevenue) / metrics.totalRevenue) * 100)}
          icon={<Calendar className="w-5 h-5" />}
        />
        <SecondaryKPICard
          title="Pending Recommendations"
          value={metrics.pendingRecommendations}
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Recommendations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing Recommendations</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI-generated rate adjustments</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Generate New
            </button>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>

        {/* Rate Parity Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rate Parity</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Channel rate monitoring</p>
            </div>
            {metrics.parityViolations > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="space-y-4">
            <ParityStatusCard
              channel="Booking.com"
              status={metrics.parityViolations > 0 ? 'violation' : 'ok'}
              rate={metrics.adr}
              channelRate={metrics.adr - 5}
            />
            <ParityStatusCard
              channel="Expedia"
              status="ok"
              rate={metrics.adr}
              channelRate={metrics.adr}
            />
            <ParityStatusCard
              channel="Airbnb"
              status="ok"
              rate={metrics.adr}
              channelRate={metrics.adr + 10}
            />
          </div>
          {metrics.parityViolations > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {metrics.parityViolations} rate parity violation(s) detected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Competitor Analysis & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Competitor Analysis</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Market comparison</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {competitors.map((comp) => (
              <CompetitorRow key={comp.name} competitor={comp} isOurs={comp.name === 'Our Hotel'} />
            ))}
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Demand Forecast</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Next 30 days prediction</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Activity className="w-4 h-4" />
              {metrics.forecastAccuracy}% accuracy
            </div>
          </div>
          <div className="space-y-4">
            <ForecastBar day="Today" demand={metrics.occupancyRate} forecast={78} />
            <ForecastBar day="Tomorrow" demand={72} forecast={80} />
            <ForecastBar day="In 2 days" demand={65} forecast={75} />
            <ForecastBar day="In 7 days" demand={85} forecast={82} />
            <ForecastBar day="In 14 days" demand={90} forecast={88} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]} border`}>
          {icon}
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: {
    id: number;
    roomType: string;
    currentRate: number;
    recommendedRate: number;
    confidence: number;
    reason: string;
  };
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const change = recommendation.recommendedRate - recommendation.currentRate;
  const percentChange = Math.round((change / recommendation.currentRate) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-slate-900 dark:text-white">{recommendation.roomType}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            recommendation.confidence >= 90
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : recommendation.confidence >= 80
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          }`}>
            {recommendation.confidence}% confidence
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{recommendation.reason}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-through">
          ${recommendation.currentRate}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          ${recommendation.recommendedRate}
        </p>
        <p className={`text-sm font-medium ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change > 0 ? '+' : ''}{percentChange}%
        </p>
      </div>
      <div className="ml-4 flex gap-2">
        <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Apply">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </button>
        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Reject">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

interface ParityStatusCardProps {
  channel: string;
  status: 'ok' | 'violation';
  rate: number;
  channelRate: number;
}

const ParityStatusCard: React.FC<ParityStatusCardProps> = ({ channel, status, rate, channelRate }) => {
  const diff = rate - channelRate;
  const diffPercent = Math.round((diff / rate) * 100);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        {status === 'ok' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{channel}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Our rate: ${rate}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-600 dark:text-slate-400">Channel: ${channelRate}</p>
        <p className={`text-sm font-medium ${status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {diffPercent}%
        </p>
      </div>
    </div>
  );
};

interface CompetitorRowProps {
  competitor: {
    name: string;
    rate: number;
    occupancy: number;
    adr: number;
  };
  isOurs: boolean;
}

const CompetitorRow: React.FC<CompetitorRowProps> = ({ competitor, isOurs }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isOurs ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
      <div>
        <p className={`font-medium ${isOurs ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
          {competitor.name}
          {isOurs && ' (Ours)'}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ADR: ${competitor.adr} • Occupancy: {competitor.occupancy}%
        </p>
      </div>
      <p className="font-semibold text-slate-900 dark:text-white">${competitor.rate}</p>
    </div>
  );
};

interface ForecastBarProps {
  day: string;
  demand: number;
  forecast: number;
}

const ForecastBar: React.FC<ForecastBarProps> = ({ day, demand, forecast }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-slate-600 dark:text-slate-400">{day}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{forecast}%</p>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${forecast}%` }}
        />
      </div>
      {demand !== forecast && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Actual: {demand}% ({forecast > demand ? '+' : ''}{forecast - demand}%)
        </p>
      )}
    </div>
  );
};

interface SecondaryKPICardProps {
  title: string;
  value: string | number;
  target?: number;
  actual?: string;
  variance?: number;
  icon: React.ReactNode;
}

const SecondaryKPICard: React.FC<SecondaryKPICardProps> = ({ title, value, target, actual, variance, icon }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      {target && (
        <p className="text-xs text-slate-600 dark:text-slate-400">Target: {target}</p>
      )}
      {actual && variance !== undefined && (
        <p className={`text-xs font-medium ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          Actual: {actual} ({variance >= 0 ? '+' : ''}{variance}%)
        </p>
      )}
    </div>
  );
};

export default RMSDashboard;
