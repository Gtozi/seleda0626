/**
 * Business Intelligence Dashboard Component
 * Advanced analytics and insights for Front Office operations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Bed,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Zap,
  Award,
  Globe,
  Building2,
  Clock,
  Star
} from 'lucide-react';

interface KPI {
  label: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  format: 'currency' | 'number' | 'percentage';
}

interface RevenueData {
  date: string;
  roomRevenue: number;
  foodBeverage: number;
  otherRevenue: number;
  total: number;
}

interface OccupancyData {
  date: string;
  occupancy: number;
  adr: number;
  revpar: number;
}

interface ChannelPerformance {
  channel: string;
  bookings: number;
  revenue: number;
  share: number;
  conversion: number;
}

interface GuestSegment {
  segment: string;
  count: number;
  revenue: number;
  avgStay: number;
  satisfaction: number;
}

const BusinessIntelligenceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Default KPIs with zero values
  const defaultKpis: KPI[] = [
    { label: 'Total Revenue', value: 0, change: 0, changeType: 'positive', icon: 'DollarSign', format: 'currency' },
    { label: 'Occupancy Rate', value: 0, change: 0, changeType: 'positive', icon: 'Users', format: 'percentage' },
    { label: 'Average ADR', value: 0, change: 0, changeType: 'positive', icon: 'TrendingUp', format: 'currency' },
    { label: 'RevPAR', value: 0, change: 0, changeType: 'positive', icon: 'BarChart3', format: 'currency' },
  ];
  
  const [kpis, setKpis] = useState<KPI[]>(defaultKpis);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [guestSegments, setGuestSegments] = useState<GuestSegment[]>([]);
  const [showChannelFilter, setShowChannelFilter] = useState(false);
  const [showSegmentFilter, setShowSegmentFilter] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/front-office/bi/dashboard?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        // Use API data if available, otherwise keep default zero values
        if (data.kpis && data.kpis.length > 0) {
          setKpis(data.kpis);
        }
        setRevenueData(data.revenue || []);
        setOccupancyData(data.occupancy || []);
        setChannelPerformance(data.channels || []);
        setGuestSegments(data.segments || []);
      } else {
        console.error('BI Dashboard endpoint returned:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const totalRevenue = useMemo(() => {
    return revenueData.reduce((sum, d) => sum + d.total, 0);
  }, [revenueData]);

  const avgOccupancy = useMemo(() => {
    if (occupancyData.length === 0) return 0;
    return occupancyData.reduce((sum, d) => sum + d.occupancy, 0) / occupancyData.length;
  }, [occupancyData]);

  const avgADR = useMemo(() => {
    if (occupancyData.length === 0) return 0;
    return occupancyData.reduce((sum, d) => sum + d.adr, 0) / occupancyData.length;
  }, [occupancyData]);

  const avgRevPAR = useMemo(() => {
    if (occupancyData.length === 0) return 0;
    return occupancyData.reduce((sum, d) => sum + d.revpar, 0) / occupancyData.length;
  }, [occupancyData]);

  const formatValue = (value: number, format: 'currency' | 'number' | 'percentage') => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return value.toLocaleString();
      case 'percentage':
        return `${value.toFixed(1)}%`;
    }
  };

  const getChangeColor = (changeType: 'positive' | 'negative', change: number) => {
    if (changeType === 'positive') {
      return change >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return change <= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/front-office/bi/dashboard/export?range=${dateRange}&format=csv`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bi-dashboard-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
    }
  };

  const handleChannelFilter = () => {
    setShowChannelFilter(!showChannelFilter);
  };

  const handleSegmentFilter = () => {
    setShowSegmentFilter(!showSegmentFilter);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Business Intelligence</h2>
          <p className="text-slate-600 mt-1">Advanced analytics and insights for data-driven decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-md rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && (
        <>
          {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                kpi.changeType === 'positive' && kpi.change >= 0 ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                kpi.changeType === 'negative' && kpi.change <= 0 ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                'bg-gradient-to-br from-red-100 to-rose-100 text-red-600'
              }`}>
                {kpi.icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                getChangeColor(kpi.changeType, kpi.change).includes('green') 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {kpi.changeType === 'positive' && kpi.change >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : kpi.changeType === 'negative' && kpi.change <= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                <span className="text-sm font-semibold">{Math.abs(kpi.change)}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">{kpi.label}</p>
            <p className="text-3xl font-bold text-slate-900">{formatValue(kpi.value, kpi.format)}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 text-lg">Revenue Trend</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              <span className="text-blue-700 font-medium">Room</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
              <span className="text-green-700 font-medium">F&B</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
              <span className="text-purple-700 font-medium">Other</span>
            </div>
          </div>
        </div>
        <div className="h-64 flex items-end gap-2">
          {revenueData.map((data, index) => (
            <div 
              key={index} 
              className="flex-1 flex flex-col gap-1 group cursor-pointer"
              title={`Total: $${data.total.toLocaleString()}`}
            >
              <div className="flex-1 flex gap-1 rounded-t-lg overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-500 transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-600"
                  style={{ height: `${(data.roomRevenue / totalRevenue) * 100}%` }}
                />
                <div
                  className="bg-gradient-to-t from-green-600 to-green-500 transition-all duration-300 group-hover:from-green-700 group-hover:to-green-600"
                  style={{ height: `${(data.foodBeverage / totalRevenue) * 100}%` }}
                />
                <div
                  className="bg-gradient-to-t from-purple-600 to-purple-500 transition-all duration-300 group-hover:from-purple-700 group-hover:to-purple-600"
                  style={{ height: `${(data.otherRevenue / totalRevenue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 text-center truncate group-hover:text-blue-600 transition-colors font-medium">{data.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy & ADR Chart */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="font-semibold text-slate-900 mb-6 text-lg">Occupancy Rate</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - avgOccupancy / 100)}`}
                  strokeLinecap="round"
                  className="animate-[stroke-dashoffset_1s_ease-out]"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{avgOccupancy.toFixed(1)}%</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Occupancy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="font-semibold text-slate-900 mb-6 text-lg">ADR & RevPAR</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-medium">ADR</span>
                <span className="text-lg font-bold text-slate-900">${avgADR.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((avgADR / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-medium">RevPAR</span>
                <span className="text-lg font-bold text-slate-900">${avgRevPAR.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((avgRevPAR / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Channel Performance</h3>
          <button onClick={handleChannelFilter} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Channel</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Bookings</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Share</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channelPerformance.map((channel, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Globe size={16} className="text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-900">{channel.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-900">{channel.bookings}</td>
                  <td className="px-4 py-4 text-right text-slate-900">${channel.revenue.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${channel.share}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-900">{channel.share.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      channel.conversion >= 5 ? 'bg-green-100 text-green-700' :
                      channel.conversion >= 3 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {channel.conversion.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Segments */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Guest Segments</h3>
          <button onClick={handleSegmentFilter} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {guestSegments.map((segment, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-blue-600" />
                <span className="font-semibold text-slate-900">{segment.segment}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-medium text-slate-900">{segment.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Revenue</span>
                  <span className="font-medium text-slate-900">${segment.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg Stay</span>
                  <span className="font-medium text-slate-900">{segment.avgStay.toFixed(1)} nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-slate-900">{segment.satisfaction.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Filter Modal */}
      {showChannelFilter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Filter Channels</h3>
            <div className="space-y-3 mb-4">
              {['Direct', 'Booking.com', 'Expedia', 'Airbnb', 'Other'].map(channel => (
                <label key={channel} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>{channel}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowChannelFilter(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => setShowChannelFilter(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Segment Filter Modal */}
      {showSegmentFilter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Filter Guest Segments</h3>
            <div className="space-y-3 mb-4">
              {['Leisure', 'Business', 'Groups', 'VIP'].map(segment => (
                <label key={segment} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>{segment}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSegmentFilter(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => setShowSegmentFilter(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Activity size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <ArrowUpRight size={16} className="mt-0.5 flex-shrink-0" />
                <span>Revenue increased by 12.5% compared to previous period</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Zap size={16} className="mt-0.5 flex-shrink-0" />
                <span>Direct bookings showing strong growth (+18% YoY)</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Target size={16} className="mt-0.5 flex-shrink-0" />
                <span>Corporate segment maintains highest satisfaction score (4.8/5)</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Award size={16} className="mt-0.5 flex-shrink-0" />
                <span>OTA channel performance improved with rate parity optimization</span>
              </li>
            </ul>
          </div>
        </div>
      </>
      )}
    </div>
  );
};

export default BusinessIntelligenceDashboard;
