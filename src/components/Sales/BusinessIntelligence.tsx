import React from 'react';
import {
  RefreshCw, BarChart3, TrendingUp,
  Activity, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const BusinessIntelligence: React.FC = () => {
  const revenueByChannel = [
    { channel: 'Direct', revenue: 125000, bookings: 340 },
    { channel: 'OTA', revenue: 98000, bookings: 280 },
    { channel: 'Corporate', revenue: 165000, bookings: 190 },
    { channel: 'Travel Agent', revenue: 72000, bookings: 95 },
    { channel: 'Group', revenue: 88000, bookings: 42 },
    { channel: 'Walk-in', revenue: 15000, bookings: 65 },
  ];

  const bookingTrend = [
    { month: 'Jan', bookings: 420, revenue: 185000 },
    { month: 'Feb', bookings: 380, revenue: 168000 },
    { month: 'Mar', bookings: 510, revenue: 220000 },
    { month: 'Apr', bookings: 460, revenue: 198000 },
    { month: 'May', bookings: 580, revenue: 255000 },
    { month: 'Jun', bookings: 620, revenue: 282000 },
  ];

  const marketSegment = [
    { name: 'Corporate', value: 35, color: '#6366f1' },
    { name: 'Leisure', value: 28, color: '#10b981' },
    { name: 'Group', value: 18, color: '#f59e0b' },
    { name: 'Travel Agent', value: 12, color: '#ec4899' },
    { name: 'Other', value: 7, color: '#06b6d4' },
  ];

  const performanceRadar = [
    { metric: 'Occupancy', value: 82 },
    { metric: 'ADR', value: 75 },
    { metric: 'RevPAR', value: 78 },
    { metric: 'Satisfaction', value: 92 },
    { metric: 'Retention', value: 87 },
    { metric: 'Conversion', value: 68 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Business Intelligence</h2>
          <p className="text-xs text-slate-400 font-medium">Revenue analysis, booking trends, market segmentation, and performance dashboards</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$1.28M', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', trend: '+15%' },
          { label: 'Total Bookings', value: '2,970', icon: Target, color: 'bg-indigo-50 text-indigo-600', trend: '+8%' },
          { label: 'Avg Daily Rate', value: '$285', icon: BarChart3, color: 'bg-purple-50 text-purple-600', trend: '+5%' },
          { label: 'RevPAR', value: '$234', icon: Activity, color: 'bg-amber-50 text-amber-600', trend: '+12%' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
              <div className={`p-2 w-fit rounded-xl ${kpi.color} mb-3`}><Icon size={16} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{kpi.value}</h3>
                <span className="text-[9px] font-black text-emerald-500">{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Revenue by Channel</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Distribution of revenue across booking channels</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByChannel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Booking & Revenue Trend</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Monthly booking volume and revenue performance</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={bookingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
              <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} name="Bookings" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Market Segmentation</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Revenue distribution by market segment</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={marketSegment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {marketSegment.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {marketSegment.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{c.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Performance Radar</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Key performance metrics across all dimensions</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={performanceRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} angle={90} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
