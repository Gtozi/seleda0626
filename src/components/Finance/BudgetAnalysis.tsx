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

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-amber-50 min-h-screen p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 text-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
        <button
          onClick={() => setShowNewBudget(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          New Budget Entry
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
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
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
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
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
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
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Q3 Front Office Budget"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Period</label>
              <input
                type="text"
                value={newBudgetForm.period}
                onChange={(e) => setNewBudgetForm({ ...newBudgetForm, period: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="120000"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowNewBudget(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md">Cancel</button>
          <button onClick={handleCreateBudget} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all">Create Budget</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default BudgetAnalysis;
