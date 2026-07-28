/**
 * Guest Lifetime Value Modeling Component
 * Analyzes and predicts guest lifetime value for targeted marketing
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Award,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Repeat,
  ShoppingCart,
  Heart,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';

interface GuestLTVData {
  guestId: string;
  name: string;
  email: string;
  totalRevenue: number;
  totalStays: number;
  avgStayValue: number;
  predictedLTV: number;
  ltvSegment: 'high' | 'medium' | 'low';
  lastStay: string;
  nextPredictedStay: string;
  retentionScore: number;
  satisfactionScore: number;
  bookingFrequency: number;
  avgNightsPerStay: number;
  preferredRoomType: string;
  preferredChannel: string;
  loyaltyTier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
}

interface LTVSegment {
  segment: string;
  count: number;
  avgLTV: number;
  totalRevenue: number;
  retentionRate: number;
  color: string;
}

interface LTVTrend {
  period: string;
  newGuests: number;
  avgInitialLTV: number;
  predicted3YearLTV: number;
  actualLTV: number;
}

const GuestLifetimeValue = () => {
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<GuestLTVData[]>([]);
  const [segments, setSegments] = useState<LTVSegment[]>([]);
  const [trends, setTrends] = useState<LTVTrend[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ltv' | 'revenue' | 'stays' | 'retention'>('ltv');

  const fetchGuestLTVData = async () => {
    setLoading(true);
    try {
      const [guestsRes, segmentsRes, trendsRes] = await Promise.all([
        fetch('/api/front-office/guest-ltv/guests'),
        fetch('/api/front-office/guest-ltv/segments'),
        fetch('/api/front-office/guest-ltv/trends')
      ]);

      if (guestsRes.ok) setGuests(await guestsRes.json());
      if (segmentsRes.ok) setSegments(await segmentsRes.json());
      if (trendsRes.ok) setTrends(await trendsRes.json());
    } catch (error) {
      console.error('Failed to fetch LTV data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestLTVData();
  }, []);

  const filteredGuests = useMemo(() => {
    return guests
      .filter(guest => {
        const matchesSearch = 
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSegment = selectedSegment === 'all' || guest.ltvSegment === selectedSegment;
        return matchesSearch && matchesSegment;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'ltv':
            return b.predictedLTV - a.predictedLTV;
          case 'revenue':
            return b.totalRevenue - a.totalRevenue;
          case 'stays':
            return b.totalStays - a.totalStays;
          case 'retention':
            return b.retentionScore - a.retentionScore;
          default:
            return 0;
        }
      });
  }, [guests, searchQuery, selectedSegment, sortBy]);

  const stats = useMemo(() => {
    return {
      totalGuests: guests.length,
      totalLTV: guests.reduce((sum, g) => sum + g.predictedLTV, 0),
      avgLTV: guests.length > 0 ? guests.reduce((sum, g) => sum + g.predictedLTV, 0) / guests.length : 0,
      highValueGuests: guests.filter(g => g.ltvSegment === 'high').length,
      retentionRate: guests.length > 0 
        ? guests.reduce((sum, g) => sum + g.retentionScore, 0) / guests.length 
        : 0
    };
  }, [guests]);

  const getLoyaltyTierColor = (tier: string) => {
    const colors = {
      platinum: 'bg-purple-100 text-purple-700',
      gold: 'bg-amber-100 text-amber-700',
      silver: 'bg-slate-100 text-slate-700',
      bronze: 'bg-orange-100 text-orange-700',
      none: 'bg-slate-50 text-slate-600'
    };
    return colors[tier as keyof typeof colors] || 'bg-slate-50 text-slate-600';
  };

  const getSegmentColor = (segment: string) => {
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-slate-100 text-slate-600'
    };
    return colors[segment as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Guest Lifetime Value</h2>
          <p className="text-slate-600 mt-1">Analyze and predict guest value for targeted marketing strategies</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGuestLTVData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-md rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalGuests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Predicted LTV</p>
              <p className="text-3xl font-bold text-slate-900">${stats.totalLTV.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg text-purple-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg LTV</p>
              <p className="text-3xl font-bold text-slate-900">${stats.avgLTV.toFixed(0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg text-amber-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">High Value Guests</p>
              <p className="text-3xl font-bold text-slate-900">{stats.highValueGuests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LTV Segments */}
      <div className="grid grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-lg">{segment.segment} Value</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                segment.segment === 'high' ? 'bg-green-100 text-green-700' :
                segment.segment === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {segment.count} guests
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Avg LTV</span>
                <span className="font-bold text-slate-900">${segment.avgLTV.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Total Revenue</span>
                <span className="font-bold text-slate-900">${segment.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 font-medium">Retention Rate</span>
                <span className="font-bold text-slate-900">{segment.retentionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
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
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={selectedSegment}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            >
              <option value="all">All Segments</option>
              <option value="high">High Value</option>
              <option value="medium">Medium Value</option>
              <option value="low">Low Value</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          >
            <option value="ltv">Sort by LTV</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="stays">Sort by Stays</option>
            <option value="retention">Sort by Retention</option>
          </select>
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Guest</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">LTV</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Revenue</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Stays</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Retention</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No guests found</td>
              </tr>
            ) : (
              filteredGuests.map(guest => (
                <tr key={guest.guestId} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{guest.name}</p>
                      <p className="text-sm text-slate-600">{guest.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSegmentColor(guest.ltvSegment)}`}>
                          {guest.ltvSegment}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">${guest.predictedLTV.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">Predicted</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-medium">${guest.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">${guest.avgStayValue.toFixed(0)}/stay</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-medium">{guest.totalStays}</p>
                    <p className="text-xs text-slate-600">{guest.avgNightsPerStay.toFixed(1)} nights/avg</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-slate-900">{guest.retentionScore.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-slate-500">{guest.satisfactionScore.toFixed(1)} sat</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLoyaltyTierColor(guest.loyaltyTier)}`}>
                      {guest.loyaltyTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors">View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* LTV Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="font-semibold text-slate-900 mb-6 text-lg">LTV Trend Analysis</h3>
        <div className="h-64 flex items-end gap-2">
          {trends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col gap-1 group cursor-pointer">
              <div className="flex-1 flex gap-1 rounded-t-lg overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-500 transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-600"
                  style={{ height: `${(trend.avgInitialLTV / 5000) * 100}%` }}
                  title={`Initial: $${trend.avgInitialLTV}`}
                />
                <div
                  className="bg-gradient-to-t from-green-600 to-green-500 transition-all duration-300 group-hover:from-green-700 group-hover:to-green-600"
                  style={{ height: `${(trend.predicted3YearLTV / 5000) * 100}%` }}
                  title={`Predicted: $${trend.predicted3YearLTV}`}
                />
                <div
                  className="bg-gradient-to-t from-purple-600 to-purple-500 transition-all duration-300 group-hover:from-purple-700 group-hover:to-purple-600"
                  style={{ height: `${(trend.actualLTV / 5000) * 100}%` }}
                  title={`Actual: $${trend.actualLTV}`}
                />
              </div>
              <p className="text-xs text-slate-600 text-center truncate group-hover:text-purple-600 transition-colors font-medium">{trend.period}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            <span className="text-blue-700 font-medium">Initial LTV</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
            <span className="text-green-700 font-medium">Predicted 3-Year</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
            <span className="text-purple-700 font-medium">Actual</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-3">LTV Insights</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Target size={16} className="mt-0.5 flex-shrink-0" />
                <span>High-value guests represent 15% of guests but contribute 45% of revenue</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Repeat size={16} className="mt-0.5 flex-shrink-0" />
                <span>Guests with retention score &gt;80% have 3.2x higher LTV</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <Heart size={16} className="mt-0.5 flex-shrink-0" />
                <span>Loyalty program members show 28% higher repeat booking rate</span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <ShoppingCart size={16} className="mt-0.5 flex-shrink-0" />
                <span>Direct channel guests have 40% higher LTV than OTA guests</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestLifetimeValue;
