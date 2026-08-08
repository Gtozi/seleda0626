import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank, Target, TrendingUp, BarChart3, AlertCircle, RefreshCw, Plus, Download
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine
} from 'recharts';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

interface BudgetEntry {
  id: string;
  budget_name: string;
  period: string;
  account_code: string;
  department: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percent: number;
  version: string;
  approved_by?: string;
  created_at: string;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BudgetAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [activeBudgetTab, setActiveBudgetTab] = useState<'entries' | 'types' | 'forecast' | 'transfer' | 'approval'>('entries');
  const [newBudgetForm, setNewBudgetForm] = useState({
    budgetName: '', period: new Date().getFullYear() + '-Q' + Math.ceil((new Date().getMonth() + 1) / 3),
    accountCode: '', department: 'Front Office', budgetedAmount: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance/budget-actual', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
      setBudgets(data || []);
    } catch (err: any) {
      console.error('Error loading budget data:', err);
      setError(err.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateBudget = async () => {
    try {
      await fetch('/api/finance/budget-actual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newBudgetForm),
      });
      setShowNewBudget(false);
      setNewBudgetForm({ budgetName: '', period: new Date().getFullYear() + '-Q' + Math.ceil((new Date().getMonth() + 1) / 3), accountCode: '', department: 'Front Office', budgetedAmount: 0 });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget entry');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + (Number(b.budgeted_amount) || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + (Number(b.actual_amount) || 0), 0);
  const totalVariance = totalActual - totalBudget;
  const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const chartData = budgets.map(b => ({
    name: b.department || b.budget_name || b.account_code,
    budget: Number(b.budgeted_amount) || 0,
    actual: Number(b.actual_amount) || 0,
    var: (Number(b.actual_amount) || 0) - (Number(b.budgeted_amount) || 0),
  }));

  const budgetColumns: Column<BudgetEntry>[] = [
    {
      key: 'budget_name',
      label: 'Budget Name',
      render: (b) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.budget_name || '—'}</span>
          <span className="text-[9px] font-bold text-slate-400 font-mono">{b.id.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      render: (b) => <span className="text-[10px] font-bold text-slate-500 font-mono">{b.period || '—'}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (b) => <span className="text-[10px] font-bold text-slate-500">{b.department || '—'}</span>,
    },
    {
      key: 'account_code',
      label: 'Account',
      render: (b) => <span className="text-[10px] font-bold text-slate-500 font-mono">{b.account_code || '—'}</span>,
    },
    {
      key: 'budgeted_amount',
      label: 'Budgeted',
      align: 'right',
      render: (b) => <span className="text-xs font-mono text-slate-900 dark:text-white">${fmt(Number(b.budgeted_amount) || 0)}</span>,
    },
    {
      key: 'actual_amount',
      label: 'Actual',
      align: 'right',
      render: (b) => <span className="text-xs font-mono text-indigo-600">${fmt(Number(b.actual_amount) || 0)}</span>,
    },
    {
      key: 'variance',
      label: 'Variance',
      align: 'right',
      render: (b) => {
        const v = Number(b.variance) || 0;
        return <span className={`text-xs font-black ${v > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>${fmt(v)}</span>;
      },
    },
    {
      key: 'version',
      label: 'Status',
      align: 'center',
      render: (b) => (
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
            b.version === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
            b.version === 'Draft' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
          }`}>
            {b.version}
          </span>
        </div>
      ),
    },
  ];

  const renderBudgetTypes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { code: 'OP', name: 'Operating Budget', desc: 'Day-to-day operational expenses and revenue', color: 'bg-blue-50 text-blue-700', count: 24 },
          { code: 'CAP', name: 'Capital Budget', desc: 'Major purchases, renovations, and capital projects', color: 'bg-purple-50 text-purple-700', count: 8 },
          { code: 'CASH', name: 'Cash Budget', desc: 'Projected cash inflows and outflows', color: 'bg-emerald-50 text-emerald-700', count: 12 },
          { code: 'FLEX', name: 'Flexible Budget', desc: 'Adjusts based on activity volume', color: 'bg-amber-50 text-amber-700', count: 6 },
          { code: 'ZBB', name: 'Zero-Based Budget', desc: 'All expenses must be justified each period', color: 'bg-rose-50 text-rose-700', count: 4 },
        ].map(bt => (
          <div key={bt.code} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${bt.color}`}>{bt.code}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{bt.name}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{bt.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{bt.count} entries</span>
              <button className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForecast = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Q3 Forecast', value: '$2.1M', sub: '+5% vs Q2', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Q4 Forecast', value: '$2.4M', sub: '+14% vs Q3', icon: Target, color: 'text-indigo-600' },
          { label: 'FY 2025 Projection', value: '$9.8M', sub: 'Annual forecast', icon: PiggyBank, color: 'text-blue-600' },
          { label: 'Confidence Level', value: '87%', sub: 'High accuracy', icon: BarChart3, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Quarterly Forecast Breakdown</h3>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Q3 Forecast</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Q4 Forecast</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">FY Total</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
            </tr>
          </thead>
          <tbody>
            {[
              { dept: 'Front Office', q3: 580000, q4: 650000, trend: 'Up' },
              { dept: 'F&B', q3: 420000, q4: 480000, trend: 'Up' },
              { dept: 'Housekeeping', q3: 180000, q4: 195000, trend: 'Stable' },
              { dept: 'Engineering', q3: 220000, q4: 240000, trend: 'Up' },
              { dept: 'Administration', q3: 280000, q4: 290000, trend: 'Stable' },
            ].map((r, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{r.dept}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">${r.q3.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs font-mono">${r.q4.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${(r.q3 + r.q4).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] font-black uppercase ${r.trend === 'Up' ? 'text-emerald-600' : 'text-slate-400'}`}>{r.trend}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Budget Transfers</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase transition">
          <Plus size={14} /> New Transfer
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transfer ID</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">From</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">To</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'BT-001', from: 'Marketing', to: 'Front Office', amount: 15000, date: '2024-06-01', status: 'Approved' },
              { id: 'BT-002', from: 'Administration', to: 'Engineering', amount: 25000, date: '2024-05-20', status: 'Approved' },
              { id: 'BT-003', from: 'Housekeeping', to: 'F&B', amount: 8000, date: '2024-06-05', status: 'Pending' },
              { id: 'BT-004', from: 'Front Office', to: 'Engineering', amount: 12000, date: '2024-05-15', status: 'Approved' },
            ].map((t, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{t.id}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{t.from}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{t.to}</td>
                <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${t.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{t.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${t.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApproval = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Approvals', value: '3', sub: 'Awaiting review', icon: AlertCircle, color: 'text-amber-600' },
          { label: 'Approved This Month', value: '12', sub: 'Budgets ratified', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Rejected', value: '1', sub: 'Sent back for revision', icon: Target, color: 'text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Pending Budget Approvals</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Name</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted By</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Q3 Marketing Campaign', dept: 'Marketing', amount: 85000, by: 'Sarah T.' },
              { name: 'IT Infrastructure Upgrade', dept: 'IT', amount: 120000, by: 'Mike K.' },
              { name: 'Staff Training Program', dept: 'HR', amount: 35000, by: 'Lisa M.' },
            ].map((b, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{b.name}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{b.dept}</td>
                <td className="px-4 py-3 text-right text-xs font-mono font-black text-indigo-600">${b.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{b.by}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-100">Approve</button>
                    <button className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase hover:bg-rose-100">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 min-h-screen p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500 text-sans">
      <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit">
        <button onClick={() => setActiveBudgetTab('entries')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeBudgetTab === 'entries' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Budget Entries</button>
        <button onClick={() => setActiveBudgetTab('types')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeBudgetTab === 'types' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Budget Types</button>
        <button onClick={() => setActiveBudgetTab('forecast')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeBudgetTab === 'forecast' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Forecasting</button>
        <button onClick={() => setActiveBudgetTab('transfer')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeBudgetTab === 'transfer' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Transfers</button>
        <button onClick={() => setActiveBudgetTab('approval')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition ${activeBudgetTab === 'approval' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Approvals</button>
      </div>

      {activeBudgetTab === 'types' && renderBudgetTypes()}
      {activeBudgetTab === 'forecast' && renderForecast()}
      {activeBudgetTab === 'transfer' && renderTransfer()}
      {activeBudgetTab === 'approval' && renderApproval()}

      {activeBudgetTab === 'entries' && (
      <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
        <button
          onClick={() => setShowNewBudget(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all"
        >
          <Plus size={16} />
          New Budget Entry
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: `$${fmt(totalBudget)}`, sub: 'Allocated Funds', icon: PiggyBank, color: 'text-indigo-600' },
          { label: 'Total Actual', value: `$${fmt(totalActual)}`, sub: 'Spent to Date', icon: Target, color: 'text-emerald-600' },
          { label: 'Variance', value: `$${fmt(totalVariance)}`, sub: totalVariance > 0 ? 'Over Budget' : 'Under Budget', icon: totalVariance > 0 ? AlertCircle : TrendingUp, color: totalVariance > 0 ? 'text-rose-600' : 'text-emerald-600' },
          { label: 'Utilization', value: `${utilization.toFixed(1)}%`, sub: 'Budget Used', icon: BarChart3, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading budget data...</div>
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Departmental Budget Variance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Variance Analysis (Actual vs Allocated)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500">Under Budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-slate-500">Over Budget</span>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Bar dataKey="var" radius={[4, 4, 0, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.var > 0 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <DataTable
            columns={budgetColumns}
            data={budgets}
            rowKey={(row) => row.id}
            sortable
            filterable
            filterPlaceholder="Search budgets..."
            filterKeys={['budget_name', 'period', 'department', 'account_code', 'version']}
            emptyMessage="No budget entries found. Click New Budget Entry to create one."
          />
        </>
      )}

      <ModalSystem
        isOpen={showNewBudget}
        onClose={() => setShowNewBudget(false)}
        title="New Budget Entry"
        subtitle="Create a new budget line item"
        variant="form"
        size="md"
        showFooter={false}
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Budget Name</label>
              <input
                type="text"
                value={newBudgetForm.budgetName}
                onChange={(e) => setNewBudgetForm({ ...newBudgetForm, budgetName: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Q3 Front Office Budget"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Period</label>
              <input
                type="text"
                value={newBudgetForm.period}
                onChange={(e) => setNewBudgetForm({ ...newBudgetForm, period: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2026-Q3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Department</label>
              <select
                value={newBudgetForm.department}
                onChange={(e) => setNewBudgetForm({ ...newBudgetForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Front Office">Front Office</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="F&B">F&B</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Code</label>
              <input
                type="text"
                value={newBudgetForm.accountCode}
                onChange={(e) => setNewBudgetForm({ ...newBudgetForm, accountCode: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="4000"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Budgeted Amount</label>
            <input
              type="number"
              value={newBudgetForm.budgetedAmount}
              onChange={(e) => setNewBudgetForm({ ...newBudgetForm, budgetedAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="120000"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-700">
          <button onClick={() => setShowNewBudget(false)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">Cancel</button>
          <button onClick={handleCreateBudget} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Create Budget</button>
        </div>
      </ModalSystem>
      </>
      )}
    </div>
  );
};

export default BudgetAnalysis;
