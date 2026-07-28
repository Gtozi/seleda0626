/**
 * Channel Performance Attribution Component
 * Analyzes booking channel performance, conversion rates, and revenue attribution
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Building,
  Smartphone,
  Mail,
  Phone,
  Target,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  LineChart
} from 'lucide-react';

interface ChannelPerformance {
  channelId: string;
  channelName: string;
  channelType: 'ota' | 'direct' | 'corporate' | 'travel_agent' | 'wholesale';
  bookings: number;
  revenue: number;
  revenueShare: number;
  conversionRate: number;
  averageBookingValue: number;
  cancellationRate: number;
  averageLeadTime: number;
  growthRate: number;
  status: 'active' | 'inactive' | 'under_review';
}

interface AttributionData {
  period: string;
  channel: string;
  attributedRevenue: number;
  touchpoints: number;
  lastTouchRevenue: number;
  firstTouchRevenue: number;
  linearAttribution: number;
  timeDecayRevenue: number;
}

interface ChannelComparison {
  metric: string;
  direct: number;
  booking_com: number;
  expedia: number;
  airbnb: number;
  corporate: number;
  travel_agent: number;
}

const ChannelPerformanceAttribution = () => {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<ChannelPerformance[]>([]);
  const [attributionData, setAttributionData] = useState<AttributionData[]>([]);
  const [comparisons, setComparisons] = useState<ChannelComparison[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchChannelData = async () => {
    setLoading(true);
    try {
      const [channelsRes, attributionRes, comparisonsRes] = await Promise.all([
        fetch(`/api/front-office/channels/performance?period=${selectedPeriod}`),
        fetch(`/api/front-office/channels/attribution?period=${selectedPeriod}`),
        fetch(`/api/front-office/channels/comparisons`)
      ]);

      if (channelsRes.ok) setChannels(await channelsRes.json());
      if (attributionRes.ok) setAttributionData(await attributionRes.json());
      if (comparisonsRes.ok) setComparisons(await comparisonsRes.json());
    } catch (error) {
      console.error('Failed to fetch channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [selectedPeriod]);

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = 
        channel.channelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || channel.channelType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [channels, searchQuery, selectedType]);

  const totalRevenue = useMemo(() => {
    return channels.reduce((sum, c) => sum + c.revenue, 0);
  }, [channels]);

  const totalBookings = useMemo(() => {
    return channels.reduce((sum, c) => sum + c.bookings, 0);
  }, [channels]);

  const getChannelIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      ota: <Globe size={20} />,
      direct: <Building size={20} />,
      corporate: <Target size={20} />,
      travel_agent: <Phone size={20} />,
      wholesale: <Mail size={20} />
    };
    return icons[type] || <Globe size={20} />;
  };

  const getChannelColor = (type: string) => {
    const colors: Record<string, string> = {
      ota: 'bg-blue-100 text-blue-700',
      direct: 'bg-green-100 text-green-700',
      corporate: 'bg-purple-100 text-purple-700',
      travel_agent: 'bg-amber-100 text-amber-700',
      wholesale: 'bg-slate-100 text-slate-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Channel Performance Attribution</h2>
          <p className="text-slate-600 mt-1">Analyze booking channel performance and revenue attribution</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchChannelData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-md rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-blue-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-green-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-900">{totalBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg text-indigo-600">
              <Percent size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Conversion</p>
              <p className="text-3xl font-bold text-slate-900">
                {channels.length > 0 
                  ? (channels.reduce((sum, c) => sum + c.conversionRate, 0) / channels.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg text-purple-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Growth</p>
              <p className="text-3xl font-bold text-slate-900">
                {channels.length > 0 
                  ? (channels.reduce((sum, c) => sum + c.growthRate, 0) / channels.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={selectedType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="ota">OTA</option>
              <option value="direct">Direct</option>
              <option value="corporate">Corporate</option>
              <option value="travel_agent">Travel Agent</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Plus size={16} />
            Add Channel
          </button>
        </div>
      </div>

      {/* Channel Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredChannels.map((channel, index) => (
          <div 
            key={channel.channelId} 
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg text-indigo-600">
                  {getChannelIcon(channel.channelType)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{channel.channelName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getChannelColor(channel.channelType)}`}>
                    {channel.channelType}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                channel.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {channel.growthRate >= 0 ? (
                  <ArrowUpRight size={14} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={14} className="text-red-600" />
                )}
                <span className={`text-sm font-semibold ${
                  channel.growthRate >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {channel.growthRate >= 0 ? '+' : ''}{channel.growthRate}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Bookings</span>
                <span className="font-bold text-slate-900">{channel.bookings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Revenue</span>
                <span className="font-bold text-slate-900">${channel.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Revenue Share</span>
                <span className="font-bold text-slate-900">{channel.revenueShare.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Conversion Rate</span>
                <span className="font-bold text-slate-900">{channel.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Avg Booking Value</span>
                <span className="font-bold text-slate-900">${channel.averageBookingValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Cancellation Rate</span>
                <span className="font-bold text-slate-900">{channel.cancellationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Avg Lead Time</span>
                <span className="font-bold text-slate-900">{channel.averageLeadTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Status</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  channel.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {channel.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span className="text-sm font-medium">{channel.status}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attribution Model Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="font-semibold text-slate-900 text-lg">Attribution Model Comparison</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Period</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Channel</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Last Touch</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">First Touch</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Linear</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Time Decay</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Touchpoints</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attributionData.map((data, index) => (
              <tr key={index} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{data.period}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{data.channel}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">${data.lastTouchRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">${data.firstTouchRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">${data.linearAttribution.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">${data.timeDecayRevenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">{data.touchpoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Channel Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="font-semibold text-slate-900 text-lg">Channel Comparison</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Metric</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Direct</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Booking.com</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Expedia</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Airbnb</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Corporate</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Travel Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisons.map((comparison, index) => (
              <tr key={index} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                <td className="px-6 py-4 font-semibold text-slate-900">{comparison.metric}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.direct}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.booking_com}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.expedia}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.airbnb}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.corporate}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.travel_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-3">Channel Performance Insights</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Target size={16} className="mt-0.5 flex-shrink-0" />
                <span>Direct channel shows highest conversion rate (24.5%) and lowest cancellation rate (3.2%)</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Activity size={16} className="mt-0.5 flex-shrink-0" />
                <span>Booking.com leads in booking volume but has higher commission costs</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <LineChart size={16} className="mt-0.5 flex-shrink-0" />
                <span>Linear attribution model provides most balanced revenue distribution</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Globe size={16} className="mt-0.5 flex-shrink-0" />
                <span>Corporate segment shows 18% YoY growth through direct channel partnerships</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelPerformanceAttribution;
