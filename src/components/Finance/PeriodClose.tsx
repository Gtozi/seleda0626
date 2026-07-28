import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Unlock,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Download,
  Play,
  Pause,
  ArrowRight,
  Users,
  BarChart3,
  Plus
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchAccountingPeriods,
  createAccountingPeriod,
  closeAccountingPeriod,
  reopenAccountingPeriod,
  type AccountingPeriod,
} from '../../services/periodCloseService';

const PeriodClose = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'history' | 'settings'>('checklist');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriodForm, setNewPeriodForm] = useState({
    periodName: '',
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    notes: '',
  });

  const checklistItems = [
    { id: 1, category: 'Revenue', task: 'Verify all room revenue posted', completed: true, assignedTo: 'Front Desk' },
    { id: 2, category: 'Revenue', task: 'Reconcile POS terminal batches', completed: true, assignedTo: 'F&B Manager' },
    { id: 3, category: 'Revenue', task: 'Review guest folio adjustments', completed: true, assignedTo: 'Night Auditor' },
    { id: 4, category: 'Accounts Receivable', task: 'Post all AR invoices', completed: true, assignedTo: 'AR Specialist' },
    { id: 5, category: 'Accounts Receivable', task: 'Review AR aging report', completed: true, assignedTo: 'AR Specialist' },
    { id: 6, category: 'Accounts Payable', task: 'Verify all bills entered', completed: true, assignedTo: 'AP Clerk' },
    { id: 7, category: 'Accounts Payable', task: 'Process vendor payments', completed: false, assignedTo: 'AP Manager' },
    { id: 8, category: 'Bank Reconciliation', task: 'Reconcile all bank accounts', completed: true, assignedTo: 'Accountant' },
    { id: 9, category: 'Bank Reconciliation', task: 'Verify cash on hand', completed: true, assignedTo: 'Cashier' },
    { id: 10, category: 'General Ledger', task: 'Review journal entries', completed: true, assignedTo: 'Controller' },
    { id: 11, category: 'General Ledger', task: 'Post depreciation', completed: false, assignedTo: 'Accountant' },
    { id: 12, category: 'Tax Compliance', task: 'Calculate VAT liability', completed: true, assignedTo: 'Tax Specialist' },
    { id: 13, category: 'Tax Compliance', task: 'Calculate withholding tax', completed: true, assignedTo: 'Tax Specialist' },
    { id: 14, category: 'Financial Reports', task: 'Generate trial balance', completed: true, assignedTo: 'Controller' },
    { id: 15, category: 'Financial Reports', task: 'Generate P&L statement', completed: false, assignedTo: 'Controller' },
    { id: 16, category: 'Financial Reports', task: 'Generate balance sheet', completed: false, assignedTo: 'Controller' },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAccountingPeriods();
      setPeriods(data);
      if (data.length > 0 && !selectedPeriod) {
        setSelectedPeriod(data[0].id);
      }
    } catch (err: any) {
      console.error('Error loading accounting periods:', err);
      setError(err.message || 'Failed to load accounting periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePeriod = async () => {
    if (!newPeriodForm.periodName || !newPeriodForm.periodStart || !newPeriodForm.periodEnd) {
      setError('Period name, start date and end date are required');
      return;
    }
    try {
      await createAccountingPeriod(newPeriodForm);
      await loadData();
      setShowNewPeriod(false);
      setNewPeriodForm({
        periodName: '',
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        notes: '',
      });
    } catch (err: any) {
      console.error('Failed to create period:', err);
      setError(err.message || 'Failed to create period');
    }
  };

  const handleClosePeriod = async (periodId: string) => {
    try {
      await closeAccountingPeriod(periodId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to close period:', err);
      setError(err.message || 'Failed to close period');
    }
  };

  const handleReopenPeriod = async (periodId: string) => {
    try {
      await reopenAccountingPeriod(periodId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reopen period:', err);
      setError(err.message || 'Failed to reopen period');
    }
  };

  const renderChecklist = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Completion', value: `${Math.round(progressPercentage)}%`, sub: `${completedCount}/${checklistItems.length} tasks`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Pending', value: `${checklistItems.length - completedCount}`, sub: 'tasks remaining', icon: Clock, color: 'text-amber-500' },
          { label: 'Lock Type', value: 'Soft', sub: 'can be reopened', icon: Unlock, color: 'text-indigo-500' },
          { label: 'Due Date', value: 'Jul 10, 2024', sub: '5 days left', icon: Calendar, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold"
          >
            <option>June 2024</option>
            <option>May 2024</option>
            <option>April 2024</option>
          </select>
          <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition">
            <Lock size={14} /> Close Period
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Period Close Checklist</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {['Revenue', 'Accounts Receivable', 'Accounts Payable', 'Bank Reconciliation', 'General Ledger', 'Tax Compliance', 'Financial Reports'].map((category, catIndex) => (
            <div key={catIndex} className="p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 size={14} />
                {category}
              </h4>
              <div className="space-y-3">
                {checklistItems.filter(item => item.category === category).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.completed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {item.completed && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.task}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">Assigned to: {item.assignedTo}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Period Close History</h3>
        <button
          onClick={() => setShowNewPeriod(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition"
        >
          <Plus size={14} /> New Period
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: 'period_name',
            label: 'Period Name',
            render: (item: AccountingPeriod) => <span className="text-xs font-bold text-slate-900 dark:text-white">{item.period_name}</span>,
          },
          {
            key: 'period_start',
            label: 'Period',
            render: (item: AccountingPeriod) => <span className="text-xs font-bold text-slate-500">{item.period_start} to {item.period_end}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (item: AccountingPeriod) => (
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                item.status === 'Closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {item.status}
              </span>
            ),
          },
          {
            key: 'closed_by',
            label: 'Closed By',
            render: (item: AccountingPeriod) => <span className="text-xs font-bold text-slate-500">{item.closed_by || '-'}</span>,
          },
          {
            key: 'closed_at',
            label: 'Closed Date',
            render: (item: AccountingPeriod) => <span className="text-xs font-bold text-slate-500">{item.closed_at ? new Date(item.closed_at).toLocaleDateString() : '-'}</span>,
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            sortable: false,
            render: (item: AccountingPeriod) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View Details">
                  <FileText size={14} />
                </button>
                {item.status === 'Closed' && (
                  <button
                    onClick={() => handleReopenPeriod(item.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 transition"
                    title="Reopen Period"
                  >
                    <Unlock size={14} />
                  </button>
                )}
                {item.status === 'Open' && (
                  <button
                    onClick={() => handleClosePeriod(item.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition"
                    title="Close Period"
                  >
                    <Lock size={14} />
                  </button>
                )}
              </div>
            ),
          },
        ] as Column<AccountingPeriod>[]}
        data={periods}
        rowKey={(item) => item.id}
        sortable
        filterable
        filterPlaceholder="Search periods..."
        filterKeys={['period_name', 'status', 'closed_by']}
        emptyMessage="No accounting periods found. Click New Period to create one."
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Lock Configuration</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Default Lock Type</span>
                <select className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold">
                  <option>Soft Lock</option>
                  <option>Hard Lock</option>
                </select>
              </div>
              <p className="text-[9px] text-slate-500 font-bold">Soft locks can be reopened by authorized users. Hard locks require admin approval.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Auto-Lock Deadline</span>
                <input type="number" defaultValue={5} className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-center" />
              </div>
              <p className="text-[9px] text-slate-500 font-bold">Days after period end before auto-lock</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Email Notifications</span>
                <span className="text-[9px] text-slate-500 font-bold">Send reminders to assigned users</span>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Alert on Overdue</span>
                <span className="text-[9px] text-slate-500 font-bold">Notify when deadline is missed</span>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Completion Summary</span>
                <span className="text-[9px] text-slate-500 font-bold">Send daily progress reports</span>
              </div>
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Approval Workflow</h3>
        <div className="space-y-3">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Required Approvers</span>
            <p className="text-xs font-medium">Controller, CFO</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Minimum Approvals</span>
            <p className="text-xs font-medium">2 of 2</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'checklist' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Checklist
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Settings
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {activeTab === 'checklist' && renderChecklist()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'settings' && renderSettings()}

      <ModalSystem
        isOpen={showNewPeriod}
        onClose={() => setShowNewPeriod(false)}
        title="New Accounting Period"
        subtitle="Create a new period for closing"
        variant="form"
        size="md"
        showFooter={false}
      >
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Period Name *</label>
                <input
                  type="text"
                  value={newPeriodForm.periodName}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, periodName: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="June 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Date *</label>
                  <input
                    type="date"
                    value={newPeriodForm.periodStart}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, periodStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Date *</label>
                  <input
                    type="date"
                    value={newPeriodForm.periodEnd}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notes</label>
                <textarea
                  value={newPeriodForm.notes}
                  onChange={(e) => setNewPeriodForm({ ...newPeriodForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Optional notes about this period..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-950/20">
              <button
                onClick={() => setShowNewPeriod(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePeriod}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
              >
                Create Period
              </button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default PeriodClose;
