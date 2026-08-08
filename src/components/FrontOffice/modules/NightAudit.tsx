/**
 * Front Office Night Audit Module
 * End-of-day audit, automated checks, and daily closing tasks
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Moon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Printer,
  FileText,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Save,
  X,
  BedDouble,
  DollarSign,
  Users,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { fetchNightAudit, runNightAudit, type AuditSummary } from '../../../services/nightAuditService';
import StatCard from '../StatCard';

type AuditTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

interface AuditTask {
  id: string;
  name: string;
  description: string;
  status: AuditTaskStatus;
  duration?: string;
  lastRun?: string;
  critical: boolean;
}

const NightAudit = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'run' | 'tasks' | 'summary' | 'history') || 'run';
  const setActiveTab = (tab: 'run' | 'tasks' | 'summary' | 'history') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [auditRunning, setAuditRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<AuditTask[]>([
    {
      id: 'TA001',
      name: 'Room & Tax Posting',
      description: 'Post room charges and taxes for all occupied rooms',
      status: 'pending',
      critical: true,
    },
    {
      id: 'TA002',
      name: 'Folio Balance Verification',
      description: 'Verify all folio balances match posted charges',
      status: 'pending',
      critical: true,
    },
    {
      id: 'TA003',
      name: 'Rate & Package Validation',
      description: 'Validate rate codes and package inclusions',
      status: 'pending',
      critical: true,
    },
    {
      id: 'TA004',
      name: 'No-Show Processing',
      description: 'Mark reservations as no-show where applicable',
      status: 'pending',
      critical: false,
    },
    {
      id: 'TA005',
      name: 'Payment Gateway Reconciliation',
      description: 'Reconcile pending online payments',
      status: 'pending',
      critical: true,
    },
    {
      id: 'TA006',
      name: 'Room Status Sync',
      description: 'Synchronize housekeeping and front office room statuses',
      status: 'pending',
      critical: false,
    },
    {
      id: 'TA007',
      name: 'Backup Daily Data',
      description: 'Create daily backup of transactional data',
      status: 'pending',
      critical: true,
    },
    {
      id: 'TA008',
      name: 'Generate Night Reports',
      description: 'Generate daily revenue, occupancy, and financial reports',
      status: 'pending',
      critical: false,
    },
  ]);

  const [summary, setSummary] = useState<AuditSummary | null>(null);

  const [auditHistory, setAuditHistory] = useState<AuditSummary[]>([]);

  const loadAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const { summary: newSummary, history } = await fetchNightAudit();
      setSummary(newSummary);
      setAuditHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load night audit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const runAudit = async () => {
    setShowConfirmation(false);
    setAuditRunning(true);
    setError(null);
    try {
      const data = await runNightAudit();
      setSummary(data);
      setTasks(prev => prev.map(t => ({
        ...t,
        status: 'completed' as const,
        duration: '1s',
        lastRun: new Date().toISOString(),
      })));
      await loadAudit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Night audit failed');
      console.error(err);
    } finally {
      setAuditRunning(false);
    }
  };

  const resetTasks = () => {
    setTasks(prev => prev.map(t => ({ ...t, status: 'pending', duration: undefined, lastRun: undefined })));
  };

  const getTaskIcon = (status: AuditTaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={18} className="text-emerald-600" />;
      case 'failed': return <XCircle size={18} className="text-rose-600" />;
      case 'running': return <RefreshCw size={18} className="text-blue-600 animate-spin" />;
      case 'skipped': return <AlertTriangle size={18} className="text-amber-600" />;
      default: return <Clock size={18} className="text-slate-400" />;
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading night audit…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
          <p className="font-medium">Error loading night audit</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadAudit}
            className="mt-3 px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">No night audit data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="night-audit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Night Audit</h2>
          <p className="text-sm text-slate-500 mt-1">End-of-day audit, automated checks, and daily closing</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={auditRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {auditRunning ? <Pause size={16} /> : <Play size={16} />}
            {auditRunning ? 'Running...' : 'Run Night Audit'}
          </button>
          <button
            onClick={resetTasks}
            disabled={auditRunning}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value={String(summary.totalRooms)} icon={BedDouble} variant="primary" />
        <StatCard label="Occupied" value={String(summary.occupiedRooms)} icon={Users} variant="rooms" />
        <StatCard label="Expected Revenue" value={`$${summary.expectedRevenue.toLocaleString()}`} icon={DollarSign} variant="revenue" />
        <StatCard label="Transactions" value={String(summary.transactions)} icon={Receipt} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="run" label="Run Audit" icon={Play} />
        <TabButton id="tasks" label="Audit Tasks" icon={FileText} />
        <TabButton id="summary" label="Daily Summary" icon={TrendingUp} />
        <TabButton id="history" label="History" icon={Clock} />
      </div>

      {/* Run Tab */}
      {activeTab === 'run' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Night Audit Run</h3>
              <p className="text-sm text-slate-500">Audit date: {summary.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                auditRunning ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {auditRunning ? 'In Progress' : 'Not Started'}
              </span>
              {tasks.every(t => t.status === 'completed') && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  Completed
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex-shrink-0">
                  {getTaskIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{task.name}</span>
                    {task.critical && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-semibold rounded">CRITICAL</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{task.description}</p>
                  {task.duration && (
                    <p className="text-xs text-slate-400 mt-1">Completed in {task.duration}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Audit Task Configuration</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Task</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-center font-semibold">Critical</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{task.name}</td>
                    <td className="px-4 py-3 text-slate-600">{task.description}</td>
                    <td className="px-4 py-3 text-center">
                      {task.critical ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{task.lastRun ? new Date(task.lastRun).toLocaleTimeString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Daily Summary — {summary.date}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Occupancy</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{((summary.occupiedRooms / summary.totalRooms) * 100).toFixed(1)}%</p>
              <p className="text-sm text-slate-500">{summary.occupiedRooms} of {summary.totalRooms} rooms</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Expected Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${summary.expectedRevenue.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Posted: ${summary.postedRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Variance</p>
              <p className={`text-2xl font-bold mt-1 ${summary.variance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${summary.variance}</p>
              <p className="text-sm text-slate-500">{summary.variance === 0 ? 'Balanced' : 'Review required'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Check-ins</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.checkedIn}</p>
              <p className="text-sm text-slate-500">Walk-ins: {summary.walkIns}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Check-outs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.checkedOut}</p>
              <p className="text-sm text-slate-500">No-shows: {summary.noShows}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Transactions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.transactions}</p>
              <p className="text-sm text-slate-500">Total for day</p>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Audit History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Started</th>
                  <th className="px-4 py-3 text-left font-semibold">Completed</th>
                  <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Variance</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditHistory.map((record) => (
                  <tr key={record.date} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{record.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        record.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{record.startedAt || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{record.completedAt || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-900">${record.postedRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={record.variance === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        ${record.variance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer" title="Print report">
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Run Night Audit?</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700">Night audit will post room charges, update folios, and roll the business date. Ensure all cashiering shifts are closed.</p>
              </div>
              <p className="text-sm text-slate-500">This action cannot be undone. Continue?</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={runAudit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Play size={16} />
                Start Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightAudit;
