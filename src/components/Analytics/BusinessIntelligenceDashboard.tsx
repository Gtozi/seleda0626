/**
 * Advanced Business Intelligence Dashboard
 * Predictive analytics, guest lifetime value modeling, market segmentation, and channel attribution
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  Target,
  Zap,
  Brain,
  LineChart,
  Filter,
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface GuestLifetimeValue {
  guestId: string;
  guestName: string;
  totalRevenue: number;
  totalStays: number;
  averageDailyRate: number;
  totalNights: number;
  lastStayDate: string;
  predictedNextStay: string;
  churnRisk: number;
  segment: string;
}

interface PredictiveModel {
  modelId: string;
  modelType: 'demand_forecast' | 'cancellation_prediction' | 'upsell_propensity';
  accuracy: number;
  lastTrained: string;
  features: string[];
}

interface MarketSegment {
  segmentId: string;
  segmentName: string;
  guestCount: number;
  revenue: number;
  averageADR: number;
  growthRate: number;
  characteristics: string[];
}

interface ChannelAttribution {
  channelId: string;
  channelName: string;
  bookings: number;
  revenue: number;
  conversionRate: number;
  costPerAcquisition: number;
  returnOnAdSpend: number;
  trend: 'up' | 'down' | 'stable';
}

const mockLTVData: GuestLifetimeValue[] = [
  {
    guestId: 'G-1001',
    guestName: 'John Smith',
    totalRevenue: 45200,
    totalStays: 12,
    averageDailyRate: 185,
    totalNights: 244,
    lastStayDate: '2026-06-15',
    predictedNextStay: '2026-08-20',
    churnRisk: 0.15,
    segment: 'Corporate'
  },
  {
    guestId: 'G-1002',
    guestName: 'Sarah Johnson',
    totalRevenue: 28500,
    totalStays: 8,
    averageDailyRate: 165,
    totalNights: 173,
    lastStayDate: '2026-05-22',
    predictedNextStay: '2026-09-10',
    churnRisk: 0.32,
    segment: 'Leisure'
  },
  {
    guestId: 'G-1003',
    guestName: 'Michael Brown',
    totalRevenue: 67800,
    totalStays: 18,
    averageDailyRate: 195,
    totalNights: 348,
    lastStayDate: '2026-06-28',
    predictedNextStay: '2026-07-25',
    churnRisk: 0.08,
    segment: 'Corporate'
  },
  {
    guestId: 'G-1004',
    guestName: 'Emily Davis',
    totalRevenue: 12300,
    totalStays: 4,
    averageDailyRate: 145,
    totalNights: 85,
    lastStayDate: '2026-04-10',
    predictedNextStay: '2026-12-15',
    churnRisk: 0.58,
    segment: 'Leisure'
  },
  {
    guestId: 'G-1005',
    guestName: 'Robert Wilson',
    totalRevenue: 38900,
    totalStays: 10,
    averageDailyRate: 178,
    totalNights: 219,
    lastStayDate: '2026-06-05',
    predictedNextStay: '2026-08-05',
    churnRisk: 0.22,
    segment: 'Corporate'
  }
];

const mockPredictiveModels: PredictiveModel[] = [
  {
    modelId: 'M-001',
    modelType: 'demand_forecast',
    accuracy: 0.87,
    lastTrained: '2026-06-15',
    features: ['historical_bookings', 'seasonality', 'events', 'competitor_pricing', 'weather']
  },
  {
    modelId: 'M-002',
    modelType: 'cancellation_prediction',
    accuracy: 0.82,
    lastTrained: '2026-06-10',
    features: ['booking_lead_time', 'deposit_status', 'guest_history', 'price_sensitivity', 'season']
  },
  {
    modelId: 'M-003',
    modelType: 'upsell_propensity',
    accuracy: 0.79,
    lastTrained: '2026-06-18',
    features: ['guest_segment', 'past_upsells', 'stay_length', 'room_type', 'booking_channel']
  }
];

const mockMarketSegments: MarketSegment[] = [
  {
    segmentId: 'S-001',
    segmentName: 'Corporate',
    guestCount: 245,
    revenue: 892000,
    averageADR: 185,
    growthRate: 0.12,
    characteristics: ['Business travelers', 'Repeat bookings', 'Extended stays']
  },
  {
    segmentId: 'S-002',
    segmentName: 'Leisure',
    guestCount: 512,
    revenue: 654000,
    averageADR: 142,
    growthRate: 0.08,
    characteristics: ['Vacation travelers', 'Weekend stays', 'Family bookings']
  },
  {
    segmentId: 'S-003',
    segmentName: 'Group',
    guestCount: 89,
    revenue: 423000,
    averageADR: 168,
    growthRate: 0.15,
    characteristics: ['Events', 'Conferences', 'Weddings']
  },
  {
    segmentId: 'S-004',
    segmentName: 'VIP',
    guestCount: 34,
    revenue: 287000,
    averageADR: 245,
    growthRate: 0.05,
    characteristics: ['High value', 'Suite bookings', 'Premium services']
  }
];

const mockChannelAttribution: ChannelAttribution[] = [
  {
    channelId: 'CH-001',
    channelName: 'Direct Website',
    bookings: 156,
    revenue: 285000,
    conversionRate: 0.042,
    costPerAcquisition: 12,
    returnOnAdSpend: 12.5,
    trend: 'up'
  },
  {
    channelId: 'CH-002',
    channelName: 'Booking.com',
    bookings: 234,
    revenue: 412000,
    conversionRate: 0.035,
    costPerAcquisition: 45,
    returnOnAdSpend: 8.2,
    trend: 'stable'
  },
  {
    channelId: 'CH-003',
    channelName: 'Expedia',
    bookings: 98,
    revenue: 156000,
    conversionRate: 0.028,
    costPerAcquisition: 52,
    returnOnAdSpend: 6.8,
    trend: 'down'
  },
  {
    channelId: 'CH-004',
    channelName: 'Corporate Contracts',
    bookings: 89,
    revenue: 234000,
    conversionRate: 0.067,
    costPerAcquisition: 8,
    returnOnAdSpend: 18.3,
    trend: 'up'
  }
];

const StatCard = ({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon: any;
  color: string;
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold ${change.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change.value)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
  </div>
);

export default function BusinessIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ltv' | 'segments' | 'channels' | 'predictions'>('overview');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '180d' | '365d'>('90d');

  const totalLTV = useMemo(() => mockLTVData.reduce((sum, guest) => sum + guest.totalRevenue, 0), []);
  const avgChurnRisk = useMemo(() => mockLTVData.reduce((sum, guest) => sum + guest.churnRisk, 0) / mockLTVData.length, []);
  const highRiskGuests = useMemo(() => mockLTVData.filter(guest => guest.churnRisk > 0.5).length, []);

  return (
    <div className="space-y-6 animate-fade-in" id="business-intelligence-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Advanced Analytics</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Business Intelligence</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['30d', '90d', '180d', '365d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'ltv', label: 'Guest LTV', icon: Users },
          { id: 'segments', label: 'Segments', icon: PieChart },
          { id: 'channels', label: 'Attribution', icon: Target },
          { id: 'predictions', label: 'AI Models', icon: Brain }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Guest LTV"
              value={`$${(totalLTV / 1000).toFixed(0)}K`}
              change={{ value: 12.5, isPositive: true }}
              icon={DollarSign}
              color="bg-emerald-500"
            />
            <StatCard
              title="Active Segments"
              value={mockMarketSegments.length}
              change={{ value: 8.3, isPositive: true }}
              icon={PieChart}
              color="bg-blue-500"
            />
            <StatCard
              title="Avg Churn Risk"
              value={`${(avgChurnRisk * 100).toFixed(1)}%`}
              change={{ value: 5.2, isPositive: false }}
              icon={AlertCircle}
              color="bg-rose-500"
            />
            <StatCard
              title="High Risk Guests"
              value={highRiskGuests}
              change={{ value: 2.1, isPositive: true }}
              icon={Users}
              color="bg-amber-500"
            />
          </div>

          {/* Predictive Models Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <div className="flex items-center gap-2 mb-6">
                <Brain size={20} className="text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Model Performance</h3>
              </div>
              <div className="space-y-4">
                {mockPredictiveModels.map((model) => (
                  <div key={model.modelId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {model.modelType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{model.modelId}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Last trained: {model.lastTrained}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${model.accuracy > 0.8 ? 'text-emerald-600' : model.accuracy > 0.75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {(model.accuracy * 100).toFixed(0)}%
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Revenue Opportunity</span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Corporate segment shows 12% growth potential based on booking patterns
                  </p>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-rose-600" />
                    <span className="text-sm font-bold text-rose-900 dark:text-rose-400">Churn Alert</span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300">
                    3 leisure guests at high risk - recommend retention campaign
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-400">Channel Optimization</span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Direct website outperforming OTAs - increase marketing investment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest LTV Tab */}
      {activeTab === 'ltv' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Guest Lifetime Value Analysis</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Filter size={12} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Guest</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Total Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Stays</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">ADR</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Nights</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Segment</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Churn Risk</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Predicted Next Stay</th>
                </tr>
              </thead>
              <tbody>
                {mockLTVData.map((guest) => (
                  <tr key={guest.guestId} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{guest.guestName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{guest.guestId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">${guest.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{guest.totalStays}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${guest.averageDailyRate}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{guest.totalNights}</td>
                    <td className="text-right py-3 px-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        {guest.segment}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-xs font-bold ${
                        guest.churnRisk < 0.3 ? 'text-emerald-600' :
                        guest.churnRisk < 0.5 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {(guest.churnRisk * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{guest.predictedNextStay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Market Segments Tab */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockMarketSegments.map((segment) => (
            <div key={segment.segmentId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{segment.segmentName}</h3>
                  <p className="text-[10px] font-mono text-slate-500">{segment.segmentId}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${segment.growthRate > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {segment.growthRate > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{(segment.growthRate * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Guests</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{segment.guestCount}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Revenue</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">${(segment.revenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Avg ADR</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">${segment.averageADR}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Share</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {((segment.revenue / mockMarketSegments.reduce((sum, s) => sum + s.revenue, 0)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Characteristics:</p>
                {segment.characteristics.map((char, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{char}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Channel Attribution Tab */}
      {activeTab === 'channels' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Channel Attribution Analysis</h3>
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> Date Range
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Channel</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Bookings</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Conversion Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">CPA</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">ROAS</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Trend</th>
                </tr>
              </thead>
              <tbody>
                {mockChannelAttribution.map((channel) => (
                  <tr key={channel.channelId} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="py-3 px-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{channel.channelName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{channel.channelId}</div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{channel.bookings}</td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">${channel.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{(channel.conversionRate * 100).toFixed(1)}%</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-600 dark:text-slate-400">${channel.costPerAcquisition}</td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-emerald-600">{channel.returnOnAdSpend.toFixed(1)}x</td>
                    <td className="text-center py-3 px-4">
                      <div className={`flex items-center justify-center gap-1 text-xs font-bold ${
                        channel.trend === 'up' ? 'text-emerald-600' :
                        channel.trend === 'down' ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        {channel.trend === 'up' ? <TrendingUp size={14} /> :
                         channel.trend === 'down' ? <TrendingDown size={14} /> :
                         <Activity size={14} />}
                        <span className="capitalize">{channel.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex items-center gap-2 mb-6">
              <Brain size={20} className="text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Predictive Models</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockPredictiveModels.map((model) => (
                <div key={model.modelId} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {model.modelType.replace('_', ' ')}
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      model.accuracy > 0.8 ? 'bg-emerald-100 text-emerald-700' :
                      model.accuracy > 0.75 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {(model.accuracy * 100).toFixed(0)}% Accurate
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Last trained: {model.lastTrained}</p>
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.features.map((feature, idx) => (
                          <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
