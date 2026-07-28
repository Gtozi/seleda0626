/**
 * Consolidated Reporting
 * Multi-property reporting with consolidated metrics and comparative analysis
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Bed,
  Calendar,
  Download,
  Filter,
  Building2,
  ArrowUp,
  ArrowDown,
  FileText,
  PieChart,
  LineChart,
  CheckCircle
} from 'lucide-react';

interface PropertyMetric {
  propertyId: string;
  propertyName: string;
  revenue: number;
  occupancy: number;
  adr: number;
  revpar: number;
  bookings: number;
  checkins: number;
}

interface ConsolidatedReport {
  period: string;
  totalRevenue: number;
  totalOccupancy: number;
  totalADR: number;
  totalRevPAR: number;
  totalBookings: number;
  properties: PropertyMetric[];
  revenueByProperty: { name: string; value: number }[];
  occupancyByProperty: { name: string; value: number }[];
}

const mockReport: ConsolidatedReport = {
  period: 'June 2026',
  totalRevenue: 285000,
  totalOccupancy: 78.5,
  totalADR: 245,
  totalRevPAR: 192,
  totalBookings: 452,
  properties: [
    {
      propertyId: 'PROP-001',
      propertyName: 'Grand Hotel Downtown',
      revenue: 125000,
      occupancy: 82,
      adr: 265,
      revpar: 217,
      bookings: 210,
      checkins: 198
    },
    {
      propertyId: 'PROP-002',
      propertyName: 'Seaside Resort',
      revenue: 98000,
      occupancy: 75,
      adr: 235,
      revpar: 176,
      bookings: 168,
      checkins: 155
    },
    {
      propertyId: 'PROP-003',
      propertyName: 'Mountain Lodge',
      revenue: 62000,
      occupancy: 71,
      adr: 220,
      revpar: 156,
      bookings: 74,
      checkins: 70
    }
  ],
  revenueByProperty: [
    { name: 'Grand Hotel Downtown', value: 125000 },
    { name: 'Seaside Resort', value: 98000 },
    { name: 'Mountain Lodge', value: 62000 }
  ],
  occupancyByProperty: [
    { name: 'Grand Hotel Downtown', value: 82 },
    { name: 'Seaside Resort', value: 75 },
    { name: 'Mountain Lodge', value: 71 }
  ]
};

export default function ConsolidatedReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProperties, setSelectedProperties] = useState<string[]>(['all']);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
        <ArrowUp size={12} /> {change.toFixed(1)}%
      </span>
    ) : (
      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
        <ArrowDown size={12} /> {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="consolidated-reporting">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Consolidated Reporting</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Consolidated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-purple-500" />
            {getChangeIndicator(mockReport.totalRevenue, 265000)}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(mockReport.totalRevenue)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Revenue</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Bed size={20} className="text-blue-500" />
            {getChangeIndicator(mockReport.totalOccupancy, 72)}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {mockReport.totalOccupancy}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Occupancy</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-emerald-500" />
            {getChangeIndicator(mockReport.totalADR, 230)}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(mockReport.totalADR)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average ADR</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={20} className="text-amber-500" />
            {getChangeIndicator(mockReport.totalRevPAR, 175)}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(mockReport.totalRevPAR)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average RevPAR</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-rose-500" />
            {getChangeIndicator(mockReport.totalBookings, 415)}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {mockReport.totalBookings}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Bookings</div>
        </div>
      </div>

      {/* Property Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Property Performance</h3>
            <button className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="text-left p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Property</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Occupancy</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">ADR</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">RevPAR</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Bookings</th>
                <th className="text-right p-4 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Check-ins</th>
              </tr>
            </thead>
            <tbody>
              {mockReport.properties.map((property) => (
                <tr key={property.propertyId} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{property.propertyName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{property.propertyId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(property.revenue)}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+8.2%</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{property.occupancy}%</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+5.1%</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(property.adr)}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+3.5%</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(property.revpar)}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+7.8%</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{property.bookings}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+12.3%</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{property.checkins}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{((property.checkins / property.bookings) * 100).toFixed(1)}% rate</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Property */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={18} className="text-purple-500" />
              Revenue Distribution
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{mockReport.period}</span>
          </div>
          <div className="space-y-3">
            {mockReport.revenueByProperty.map((item, index) => {
              const percentage = (item.value / mockReport.totalRevenue * 100).toFixed(1);
              const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500'];
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full {colors[index]}" style={{ backgroundColor: index === 0 ? '#a855f7' : index === 1 ? '#3b82f6' : '#10b981' }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: index === 0 ? '#a855f7' : index === 1 ? '#3b82f6' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white w-20 text-right">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LineChart size={18} className="text-blue-500" />
              Occupancy Comparison
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{mockReport.period}</span>
          </div>
          <div className="space-y-4">
            {mockReport.occupancyByProperty.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-blue-500"
                      style={{ width: `${item.value}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-white">
                      {item.value}%
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 w-12 text-right">
                  +{(item.value * 0.05).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={18} className="text-purple-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Revenue Summary</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Detailed revenue breakdown by property</p>
          </button>
          <button className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <Bed size={18} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Occupancy Report</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Room occupancy trends and patterns</p>
          </button>
          <button className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={18} className="text-emerald-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Booking Analytics</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Booking sources and channel performance</p>
          </button>
          <button className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <Users size={18} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Guest Analysis</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Guest demographics and preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}
