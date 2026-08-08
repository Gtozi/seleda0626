import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Target, Award, DollarSign, Users, BarChart3,
  Mail, MousePointerClick, Megaphone, Heart, Star, Crown,
  RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
  Building2, Briefcase, Plane, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import { fetchSalesAnalytics, fetchLeads, fetchCorporateAccounts } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const SalesDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [a, l, c] = await Promise.all([
        fetchSalesAnalytics().catch(() => null),
        fetchLeads().catch(() => []),
        fetchCorporateAccounts().catch(() => []),
      ]);
      setAnalytics(a);
      setLeads(l);
      setAccounts(c);
    } catch (err) {
      // graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalLeads = analytics?.totalLeads ?? leads.length;
  const wonLeads = analytics?.wonLeads ?? leads.filter(l => l.stage === 'Won').length;
  const conversionRate = analytics?.conversionRate ?? (totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0);
  const pipelineValue = analytics?.totalPipelineValue ?? leads.reduce((s, l) => s + Number(l.opportunity_value || 0), 0);
  const contractValue = analytics?.totalContractValue ?? 0;

  const salesKPIs = [
    { label: 'Revenue Pipeline', value: `$${fmt(pipelineValue)}`, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600', trend: '+12%' },
    { label: 'Open Opportunities', value: leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length, icon: Target, color: 'bg-blue-50 text-blue-600', trend: '+5' },
    { label: 'Won Opportunities', value: wonLeads, icon: Award, color: 'bg-emerald-50 text-emerald-600', trend: '+3' },
    { label: 'Lost Opportunities', value: leads.filter(l => l.stage === 'Lost').length, icon: Target, color: 'bg-rose-50 text-rose-600', trend: '-1' },
    { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, icon: BarChart3, color: 'bg-amber-50 text-amber-600', trend: '+2.4%' },
    { label: 'Average Deal Size', value: `$${fmt(wonLeads > 0 ? pipelineValue / wonLeads : 0)}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600', trend: '+8%' },
    { label: 'Corporate Revenue', value: `$${fmt(accounts.reduce((s, a) => s + Number(a.unpaid_balance || 0), 0))}`, icon: Building2, color: 'bg-cyan-50 text-cyan-600', trend: '+15%' },
    { label: 'Repeat Guest %', value: '34%', icon: Users, color: 'bg-pink-50 text-pink-600', trend: '+5%' },
  ];

  const marketingKPIs = [
    { label: 'Campaign Performance', value: '87%', icon: Megaphone, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Lead Generation', value: totalLeads, icon: Target, color: 'bg-blue-50 text-blue-600' },
    { label: 'Email Open Rate', value: '42%', icon: Mail, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Click Rate', value: '18%', icon: MousePointerClick, color: 'bg-amber-50 text-amber-600' },
    { label: 'Conversion Rate', value: '6.2%', icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
    { label: 'Cost per Lead', value: '$45', icon: DollarSign, color: 'bg-rose-50 text-rose-600' },
    { label: 'ROMI', value: '3.4x', icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
  ];

  const crmKPIs = [
    { label: 'Active Loyalty Members', value: '1,247', icon: Crown, color: 'bg-amber-50 text-amber-600' },
    { label: 'Guest Satisfaction', value: '4.6/5', icon: Star, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Net Promoter Score', value: '72', icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { label: 'Guest Lifetime Value', value: '$8,420', icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Churn Rate', value: '8.3%', icon: Activity, color: 'bg-orange-50 text-orange-600' },
    { label: 'Guest Retention', value: '91.7%', icon: Users, color: 'bg-blue-50 text-blue-600' },
  ];

  const pipelineData = [
    { stage: 'Prospect', count: leads.filter(l => l.stage === 'Prospect').length || 12, value: 45000 },
    { stage: 'Qualified', count: leads.filter(l => l.stage === 'Qualified').length || 8, value: 32000 },
    { stage: 'Proposal', count: leads.filter(l => l.stage === 'Proposal').length || 5, value: 28000 },
    { stage: 'Negotiation', count: leads.filter(l => l.stage === 'Negotiation').length || 3, value: 18000 },
    { stage: 'Won', count: wonLeads || 7, value: 22000 },
    { stage: 'Lost', count: leads.filter(l => l.stage === 'Lost').length || 2, value: 5000 },
  ];

  const revenueTrendData = [
    { month: 'Jan', corporate: 42000, group: 28000, events: 15000 },
    { month: 'Feb', corporate: 38000, group: 32000, events: 18000 },
    { month: 'Mar', corporate: 55000, group: 41000, events: 22000 },
    { month: 'Apr', corporate: 48000, group: 38000, events: 19000 },
    { month: 'May', corporate: 62000, group: 45000, events: 28000 },
    { month: 'Jun', corporate: 58000, group: 52000, events: 31000 },
  ];

  const customerTypeData = [
    { name: 'Corporate', value: 35, color: '#6366f1' },
    { name: 'Leisure', value: 28, color: '#10b981' },
    { name: 'Group', value: 18, color: '#f59e0b' },
    { name: 'Travel Agent', value: 12, color: '#ec4899' },
    { name: 'Government', value: 7, color: '#06b6d4' },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Sales, Marketing & CRM Dashboard</h2>
          <p className="text-xs text-slate-400 font-medium">Unified KPIs across sales pipeline, marketing performance, and customer relationship management</p>
        </div>
        <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Sales KPIs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><TrendingUp size={14} /></div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Sales KPIs</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {salesKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 w-fit rounded-xl ${kpi.color}`}><Icon size={16} /></div>
                  {kpi.trend && (
                    <span className={`text-[9px] font-black ${kpi.trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'} flex items-center gap-0.5`}>
                      {kpi.trend.startsWith('-') ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                      {kpi.trend}
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">{kpi.value}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marketing KPIs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Megaphone size={14} /></div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Marketing KPIs</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {marketingKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-3xs">
                <div className={`p-1.5 w-fit rounded-lg ${kpi.color} mb-2`}><Icon size={14} /></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{kpi.value}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRM KPIs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><Heart size={14} /></div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">CRM KPIs</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {crmKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-3xs">
                <div className={`p-1.5 w-fit rounded-lg ${kpi.color} mb-2`}><Icon size={14} /></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{kpi.value}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Sales Pipeline by Stage</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Lead distribution and value across pipeline stages</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Revenue Trend</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Corporate, group, and event revenue over time</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
              <Area type="monotone" dataKey="corporate" stackId="1" stroke="#6366f1" fill="#6366f120" name="Corporate" />
              <Area type="monotone" dataKey="group" stackId="1" stroke="#10b981" fill="#10b98120" name="Group" />
              <Area type="monotone" dataKey="events" stackId="1" stroke="#f59e0b" fill="#f59e0b20" name="Events" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Types */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Customer Segments</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Revenue distribution by customer type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={customerTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {customerTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {customerTypeData.map((c) => (
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

        {/* Recent Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs lg:col-span-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Recent Leads</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Latest entries in the sales pipeline</p>
          <div className="space-y-2">
            {recentLeads.length > 0 ? recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Briefcase size={14} /></div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{lead.lead_name}</p>
                    <p className="text-[10px] font-bold text-slate-500">{lead.company || '—'} · {lead.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-600">${fmt(lead.opportunity_value)}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    lead.stage === 'Won' ? 'bg-emerald-50 text-emerald-600' :
                    lead.stage === 'Lost' ? 'bg-rose-50 text-rose-600' :
                    lead.stage === 'Negotiation' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>{lead.stage}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Target size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">No leads yet. Create your first lead to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
