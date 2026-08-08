/**
 * Channel Performance Component
 * Analyzes revenue, ADR, conversion, acquisition cost, cancellation rate, and net revenue by channel
 */

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Phone,
  Users,
  Building,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Settings,
  Filter
} from 'lucide-react';

const ChannelPerformance = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const channels = useMemo(() => [
    { 
      id: 'website', 
      name: 'Hotel Website', 
      icon: Globe,
      revenue: 125000, 
      adr: 155, 
      conversion: 4.2, 
      acquisitionCost: 0,
      cancellationRate: 8,
      netRevenue: 125000,
      bookings: 245,
      growth: 15
    },
    { 
      id: 'call_center', 
      name: 'Call Center', 
      icon: Phone,
      revenue: 68000, 
      adr: 145, 
      conversion: 12.5, 
      acquisitionCost: 15,
      cancellationRate: 12,
      netRevenue: 57800,
      bookings: 120,
      growth: 8
    },
    { 
      id: 'walk_in', 
      name: 'Walk-in', 
      icon: Users,
      revenue: 35000, 
      adr: 140, 
      conversion: 85, 
      acquisitionCost: 0,
      cancellationRate: 5,
      netRevenue: 35000,
      bookings: 65,
      growth: 3
    },
    { 
      id: 'booking', 
      name: 'Booking.com', 
      icon: Globe,
      revenue: 89000, 
      adr: 160, 
      conversion: 3.8, 
      acquisitionCost: 18,
      cancellationRate: 15,
      netRevenue: 72980,
      bookings: 180,
      growth: 22
    },
    { 
      id: 'expedia', 
      name: 'Expedia', 
      icon: Globe,
      revenue: 72000, 
      adr: 158, 
      conversion: 3.5, 
      acquisitionCost: 17,
      cancellationRate: 14,
      netRevenue: 59760,
      bookings: 145,
      growth: 18
    },
    { 
      id: 'gds', 
      name: 'GDS', 
      icon: Building,
      revenue: 45000, 
      adr: 165, 
      conversion: 2.8, 
      acquisitionCost: 12,
      cancellationRate: 10,
      netRevenue: 39600,
      bookings: 85,
      growth: 5
    },
    { 
      id: 'travel_agent', 
      name: 'Travel Agents', 
      icon: Briefcase,
      revenue: 38000, 
      adr: 150, 
      conversion: 8.5, 
      acquisitionCost: 10,
      cancellationRate: 11,
      netRevenue: 34200,
      bookings: 75,
      growth: 6
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      icon: Building,
      revenue: 98000, 
      adr: 165, 
      conversion: 15.2, 
      acquisitionCost: 5,
      cancellationRate: 7,
      netRevenue: 93100,
      bookings: 195,
      growth: 12
    },
    { 
      id: 'wholesale', 
      name: 'Wholesalers', 
      icon: Package,
      revenue: 52000, 
      adr: 115, 
      conversion: 6.5, 
      acquisitionCost: 20,
      cancellationRate: 18,
      netRevenue: 41600,
      bookings: 110,
      growth: 9
    }
  ], []);

  const channelMetrics = useMemo(() => {
    const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
    const totalNetRevenue = channels.reduce((sum, c) => sum + c.netRevenue, 0);
    const totalBookings = channels.reduce((sum, c) => sum + c.bookings, 0);
    const avgADR = Math.round(channels.reduce((sum, c) => sum + c.adr, 0) / channels.length);
    const avgAcquisitionCost = Math.round(channels.reduce((sum, c) => sum + c.acquisitionCost, 0) / channels.length);

    return { totalRevenue, totalNetRevenue, totalBookings, avgADR, avgAcquisitionCost };
  }, [channels]);

  const topChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.netRevenue - a.netRevenue).slice(0, 3);
  }, [channels]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Channel Performance</h2>
          <p className="text-slate-600 dark:text-slate-400">Analyze revenue and performance by distribution channel</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${channelMetrics.totalRevenue.toLocaleString()}`}
          change={12}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Net Revenue"
          value={`$${channelMetrics.totalNetRevenue.toLocaleString()}`}
          change={11}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Total Bookings"
          value={channelMetrics.totalBookings}
          change={8}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Avg ADR"
          value={`$${channelMetrics.avgADR}`}
          change={6}
          icon={<BarChart3 className="w-5 h-5" />}
          color="orange"
        />
        <MetricCard
          title="Avg Acquisition Cost"
          value={`${channelMetrics.avgAcquisitionCost}%`}
          change={-5}
          icon={<Settings className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Channel Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Channel Performance</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <ChannelCard
                key={channel.id}
                channel={channel}
                selected={selectedChannel === channel.id}
                onSelect={() => setSelectedChannel(channel.id)}
                icon={<Icon className="w-5 h-5" />}
              />
            );
          })}
        </div>
      </div>

      {/* Top Channels */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Performing Channels (Net Revenue)</h3>
        <div className="space-y-3">
          {topChannels.map((channel, idx) => (
            <TopChannelRow key={channel.id} channel={channel} rank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
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
      <div className={`flex items-center gap-1 text-sm font-medium ${
        change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change)}%
      </div>
    </div>
  );
};

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    icon: any;
    revenue: number;
    adr: number;
    conversion: number;
    acquisitionCost: number;
    cancellationRate: number;
    netRevenue: number;
    bookings: number;
    growth: number;
  };
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, selected, onSelect, icon }) => {
  const marginPercent = Math.round(((channel.revenue - channel.netRevenue) / channel.revenue) * 100);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">{channel.name}</h4>
          <p className={`text-sm ${channel.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {channel.growth >= 0 ? '+' : ''}{channel.growth}% growth
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-medium text-slate-900 dark:text-white">${channel.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Net Revenue</p>
          <p className="font-medium text-green-600 dark:text-green-400">${channel.netRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">ADR</p>
          <p className="font-medium text-slate-900 dark:text-white">${channel.adr}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Conversion</p>
          <p className="font-medium text-slate-900 dark:text-white">{channel.conversion}%</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Acq. Cost</p>
          <p className="font-medium text-slate-900 dark:text-white">{channel.acquisitionCost}%</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Cancel Rate</p>
          <p className="font-medium text-slate-900 dark:text-white">{channel.cancellationRate}%</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">Channel Margin</span>
          <span className="font-medium text-slate-900 dark:text-white">{100 - marginPercent}%</span>
        </div>
      </div>
    </div>
  );
};

interface TopChannelRowProps {
  channel: {
    name: string;
    netRevenue: number;
    revenue: number;
    bookings: number;
    growth: number;
  };
  rank: number;
}

const TopChannelRow: React.FC<TopChannelRowProps> = ({ channel, rank }) => {
  const marginPercent = Math.round(((channel.revenue - channel.netRevenue) / channel.revenue) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
          {rank}
        </span>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{channel.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{channel.bookings} bookings</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-semibold text-slate-900 dark:text-white">${channel.revenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Net Revenue</p>
          <p className="font-semibold text-green-600 dark:text-green-400">${channel.netRevenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Margin</p>
          <p className="font-semibold text-slate-900 dark:text-white">{100 - marginPercent}%</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${channel.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {channel.growth >= 0 ? '+' : ''}{channel.growth}%
          </p>
        </div>
      </div>
    </div>
  );
};

import { Package } from 'lucide-react';

export default ChannelPerformance;
