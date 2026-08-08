/**
 * Market Segmentation Component
 * Analyzes revenue, ADR, RevPAR, occupancy, and profitability by market segment
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Bed,
  BarChart3,
  PieChart,
  Settings,
  Plus,
  Edit
} from 'lucide-react';

const MarketSegmentation = () => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'revenue' | 'adr' | 'revpar' | 'occupancy' | 'profitability'>('revenue');

  const segments = useMemo(() => [
    { 
      id: 'leisure', 
      name: 'Leisure', 
      icon: Users,
      revenue: 125000, 
      adr: 145, 
      revpar: 113, 
      occupancy: 78, 
      profitability: 32,
      growth: 12,
      color: 'blue'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      icon: Briefcase,
      revenue: 98000, 
      adr: 165, 
      revpar: 132, 
      occupancy: 80, 
      profitability: 38,
      growth: 8,
      color: 'green'
    },
    { 
      id: 'government', 
      name: 'Government', 
      icon: Building,
      revenue: 45000, 
      adr: 110, 
      revpar: 88, 
      occupancy: 80, 
      profitability: 25,
      growth: 5,
      color: 'purple'
    },
    { 
      id: 'group', 
      name: 'Group', 
      icon: Users,
      revenue: 78000, 
      adr: 130, 
      revpar: 104, 
      occupancy: 80, 
      profitability: 28,
      growth: 15,
      color: 'orange'
    },
    { 
      id: 'airline', 
      name: 'Airline Crew', 
      icon: Plane,
      revenue: 35000, 
      adr: 95, 
      revpar: 76, 
      occupancy: 80, 
      profitability: 22,
      growth: -3,
      color: 'red'
    },
    { 
      id: 'wholesale', 
      name: 'Wholesale', 
      icon: Package,
      revenue: 52000, 
      adr: 115, 
      revpar: 92, 
      occupancy: 80, 
      profitability: 20,
      growth: 6,
      color: 'amber'
    },
    { 
      id: 'ota', 
      name: 'OTA', 
      icon: Globe,
      revenue: 89000, 
      adr: 155, 
      revpar: 124, 
      occupancy: 80, 
      profitability: 18,
      growth: 18,
      color: 'cyan'
    },
    { 
      id: 'direct', 
      name: 'Direct', 
      icon: Phone,
      revenue: 67000, 
      adr: 140, 
      revpar: 112, 
      occupancy: 80, 
      profitability: 35,
      growth: 10,
      color: 'emerald'
    },
    { 
      id: 'loyalty', 
      name: 'Loyalty', 
      icon: Star,
      revenue: 28000, 
      adr: 135, 
      revpar: 108, 
      occupancy: 80, 
      profitability: 30,
      growth: 22,
      color: 'yellow'
    }
  ], []);

  const segmentMix = useMemo(() => segments.map(s => ({
    name: s.name,
    percentage: Math.round((s.revenue / segments.reduce((sum, seg) => sum + seg.revenue, 0)) * 100)
  })), [segments]);

  const topPerformers = useMemo(() => {
    return [...segments].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  }, [segments]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Market Segmentation</h2>
          <p className="text-slate-600 dark:text-slate-400">Analyze performance by market segment</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="revenue">Revenue View</option>
            <option value="adr">ADR View</option>
            <option value="revpar">RevPAR View</option>
            <option value="occupancy">Occupancy View</option>
            <option value="profitability">Profitability View</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        </div>
      </div>

      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${segments.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">+11.5%</span>
            <span className="text-slate-600 dark:text-slate-400">vs last period</span>
          </div>
        </div>

        {/* Average ADR */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Average ADR</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${Math.round(segments.reduce((sum, s) => sum + s.adr, 0) / segments.length)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">+8.2%</span>
            <span className="text-slate-600 dark:text-slate-400">vs last period</span>
          </div>
        </div>

        {/* Average Occupancy */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bed className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Occupancy</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(segments.reduce((sum, s) => sum + s.occupancy, 0) / segments.length)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">+3.1%</span>
            <span className="text-slate-600 dark:text-slate-400">vs last period</span>
          </div>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Market Segments</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment) => {
            const Icon = segment.icon;
            return (
              <SegmentCard
                key={segment.id}
                segment={segment}
                selected={selectedSegment === segment.id}
                onSelect={() => setSelectedSegment(segment.id)}
                icon={<Icon className="w-5 h-5" />}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      </div>

      {/* Segment Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Mix by Segment</h3>
          <div className="space-y-3">
            {segmentMix.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-32 text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-medium text-slate-900 dark:text-white text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Performing Segments</h3>
          <div className="space-y-3">
            {topPerformers.map((segment, idx) => (
              <div key={segment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{segment.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    ${segment.revenue.toLocaleString()}
                  </p>
                  <p className={`text-sm ${segment.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SegmentCardProps {
  segment: {
    id: string;
    name: string;
    icon: any;
    revenue: number;
    adr: number;
    revpar: number;
    occupancy: number;
    profitability: number;
    growth: number;
    color: string;
  };
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  viewMode: string;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, selected, onSelect, icon, viewMode }) => {
  const getValue = () => {
    switch (viewMode) {
      case 'revenue': return `$${segment.revenue.toLocaleString()}`;
      case 'adr': return `$${segment.adr}`;
      case 'revpar': return `$${segment.revpar}`;
      case 'occupancy': return `${segment.occupancy}%`;
      case 'profitability': return `${segment.profitability}%`;
      default: return `$${segment.revenue.toLocaleString()}`;
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
  };

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
        <div className={`p-2 rounded-lg ${colorClasses[segment.color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">{segment.name}</h4>
          <p className={`text-sm ${segment.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {segment.growth >= 0 ? '+' : ''}{segment.growth}% growth
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-medium text-slate-900 dark:text-white">${segment.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">ADR</p>
          <p className="font-medium text-slate-900 dark:text-white">${segment.adr}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">RevPAR</p>
          <p className="font-medium text-slate-900 dark:text-white">${segment.revpar}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Profitability</p>
          <p className="font-medium text-slate-900 dark:text-white">{segment.profitability}%</p>
        </div>
      </div>
    </div>
  );
};

// Import additional icons
import { Briefcase, Building, Plane, Package, Globe, Phone, Star } from 'lucide-react';

export default MarketSegmentation;
