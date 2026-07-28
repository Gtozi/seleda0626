/**
 * Market Segmentation Analysis Component
 * Analyzes guest segments, booking patterns, and market trends
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  Star,
  Zap,
  Activity,
  Award
} from 'lucide-react';

interface Segment {
  segmentId: string;
  name: string;
  description: string;
  guestCount: number;
  revenue: number;
  marketShare: number;
  avgBookingValue: number;
  avgLengthOfStay: number;
  seasonalTrend: 'increasing' | 'stable' | 'decreasing';
  growthRate: number;
  primaryChannel: string;
  satisfaction: number;
  loyaltyRate: number;
}

interface BookingPattern {
  segment: string;
  period: string;
  bookings: number;
  revenue: number;
  adr: number;
  occupancy: number;
}

interface SegmentComparison {
  metric: string;
  corporate: number;
  leisure: number;
  group: number;
  transient: number;
  airline: number;
}

const MarketSegmentation = () => {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [patterns, setPatterns] = useState<BookingPattern[]>([]);
  const [comparisons, setComparisons] = useState<SegmentComparison[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSegmentationData = async () => {
    setLoading(true);
    try {
      const [segmentsRes, patternsRes, comparisonsRes] = await Promise.all([
        fetch(`/api/front-office/segmentation/segments?period=${selectedPeriod}`),
        fetch(`/api/front-office/segmentation/patterns?period=${selectedPeriod}`),
        fetch(`/api/front-office/segmentation/comparisons`)
      ]);

      if (segmentsRes.ok) setSegments(await segmentsRes.json());
      if (patternsRes.ok) setPatterns(await patternsRes.json());
      if (comparisonsRes.ok) setComparisons(await comparisonsRes.json());
    } catch (error) {
      console.error('Failed to fetch segmentation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentationData();
  }, [selectedPeriod]);

  const filteredSegments = useMemo(() => {
    return segments.filter(segment => 
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [segments, searchQuery]);

  const totalGuests = useMemo(() => {
    return segments.reduce((sum, s) => sum + s.guestCount, 0);
  }, [segments]);

  const totalRevenue = useMemo(() => {
    return segments.reduce((sum, s) => sum + s.revenue, 0);
  }, [segments]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUpRight size={16} className="text-green-600" />;
      case 'decreasing':
        return <ArrowDownRight size={16} className="text-red-600" />;
      default:
        return <Activity size={16} className="text-slate-600" />;
    }
  };

  const getSegmentIcon = (segment: string) => {
    const icons: Record<string, React.ReactNode> = {
      corporate: <Briefcase size={20} />,
      leisure: <Users size={20} />,
      group: <Building2 size={20} />,
      transient: <Globe size={20} />,
      airline: <Target size={20} />
    };
    return icons[segment.toLowerCase()] || <Users size={20} />;
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-teal-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Market Segmentation</h2>
          <p className="text-slate-600 mt-1">Analyze guest segments and booking patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchSegmentationData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-md rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-slate-900">{totalGuests.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg text-teal-600">
              <PieChart size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Segments</p>
              <p className="text-3xl font-bold text-slate-900">{segments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-cyan-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg text-cyan-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Growth Rate</p>
              <p className="text-3xl font-bold text-slate-900">
                {segments.length > 0 
                  ? (segments.reduce((sum, s) => sum + s.growthRate, 0) / segments.length).toFixed(1)
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
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-slate-500">
              <Filter size={16} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
              <Plus size={16} />
              Add Segment
            </button>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSegments.map((segment, index) => (
          <div 
            key={segment.segmentId} 
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg text-teal-600">
                  {getSegmentIcon(segment.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{segment.name}</h3>
                  <p className="text-sm text-slate-600">{segment.description}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                segment.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {getTrendIcon(segment.seasonalTrend)}
                <span className={`text-sm font-semibold ${
                  segment.growthRate >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {segment.growthRate >= 0 ? '+' : ''}{segment.growthRate}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Guests</span>
                <span className="font-bold text-slate-900">{segment.guestCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Revenue</span>
                <span className="font-bold text-slate-900">${segment.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Market Share</span>
                <span className="font-bold text-slate-900">{segment.marketShare.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Avg Booking</span>
                <span className="font-bold text-slate-900">${segment.avgBookingValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Avg Stay</span>
                <span className="font-bold text-slate-900">{segment.avgLengthOfStay.toFixed(1)} nights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Primary Channel</span>
                <span className="font-bold text-slate-900">{segment.primaryChannel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Satisfaction</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-900">{segment.satisfaction.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Loyalty Rate</span>
                <span className="font-bold text-slate-900">{segment.loyaltyRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Patterns */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="font-semibold text-slate-900 mb-6 text-lg">Booking Patterns by Segment</h3>
        <div className="h-64 flex items-end gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="flex-1 flex flex-col gap-2 group cursor-pointer">
              <div className="flex-1 flex gap-1 rounded-t-lg overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-t from-teal-600 to-teal-500 transition-all duration-300 group-hover:from-teal-700 group-hover:to-teal-600"
                  style={{ height: `${(pattern.bookings / 100) * 100}%` }}
                  title={`Bookings: ${pattern.bookings}`}
                />
                <div
                  className="bg-gradient-to-t from-cyan-600 to-cyan-500 transition-all duration-300 group-hover:from-cyan-700 group-hover:to-cyan-600"
                  style={{ height: `${(pattern.occupancy / 100) * 100}%` }}
                  title={`Occupancy: ${pattern.occupancy}%`}
                />
              </div>
              <p className="text-xs text-slate-600 text-center truncate group-hover:text-teal-600 transition-colors font-medium">{pattern.segment}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            <span className="text-teal-700 font-medium">Bookings</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full" />
            <span className="text-cyan-700 font-medium">Occupancy</span>
          </div>
        </div>
      </div>

      {/* Segment Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h3 className="font-semibold text-slate-900 text-lg">Segment Comparison</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Metric</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Corporate</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Leisure</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Group</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Transient</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Airline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisons.map((comparison, index) => (
              <tr key={index} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200">
                <td className="px-6 py-4 font-semibold text-slate-900">{comparison.metric}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.corporate}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.leisure}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.group}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.transient}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-medium">{comparison.airline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-3">Segment Insights</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Target size={16} className="mt-0.5 flex-shrink-0" />
                <span>Corporate segment shows highest growth rate (+15% YoY)</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Award size={16} className="mt-0.5 flex-shrink-0" />
                <span>Leisure segment maintains highest satisfaction score (4.7/5)</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Activity size={16} className="mt-0.5 flex-shrink-0" />
                <span>Group bookings increasing during Q3 peak season</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Globe size={16} className="mt-0.5 flex-shrink-0" />
                <span>Direct channel most effective for corporate segment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSegmentation;
