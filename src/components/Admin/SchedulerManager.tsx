import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Play, Clock, CheckCircle2, XCircle, Settings2,
  Calendar, Zap, AlertCircle,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

interface ScheduledJob {
  id: string;
  name: string;
  type: string;
  schedule_cron: string;
  config: any;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
}

interface JobRun {
  id: string;
  job_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  result: any;
  error: string | null;
  created_at: string;
}

const JOB_TYPE_ICONS: Record<string, any> = {
  night_audit: Moon,
  allotment_release: Zap,
  report_email: Calendar,
  backup: Settings2,
};

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-rose-50 text-rose-600',
  running: 'bg-indigo-50 text-indigo-600',
  pending: 'bg-amber-50 text-amber-600',
};

function Moon(props: any) { return <Calendar {...props} />; }

const SchedulerManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [runs, setRuns] = useState<Record<string, JobRun[]>>({});
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editJob, setEditJob] = useState<ScheduledJob | null>(null);
  const [editForm, setEditForm] = useState({ name: '', scheduleCron: '', enabled: true });

  const token = localStorage.getItem('erp_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/scheduler/jobs', { headers });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) { setError(err.message || 'Failed to load jobs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadRuns = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/scheduler/jobs/${jobId}/runs`, { headers });
      const data = await res.json();
      setRuns(prev => ({ ...prev, [jobId]: data.runs || [] }));
    } catch (err: any) { setError(err.message); }
  };

  const handleToggle = async (job: ScheduledJob) => {
    try {
      await fetch(`/api/admin/scheduler/jobs/${job.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ enabled: !job.enabled }),
      });
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleTrigger = async (job: ScheduledJob) => {
    try {
      await fetch(`/api/admin/scheduler/jobs/${job.id}/trigger`, { method: 'POST', headers });
      loadData();
      if (expandedJob === job.id) loadRuns(job.id);
    } catch (err: any) { setError(err.message); }
  };

  const handleEditSave = async () => {
    if (!editJob) return;
    try {
      await fetch(`/api/admin/scheduler/jobs/${editJob.id}`, {
        method: 'PATCH', headers, body: JSON.stringify(editForm),
      });
      setShowEditModal(false);
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  const jobColumns: Column<ScheduledJob>[] = [
    { key: 'name', label: 'Job Name', render: (j) => <span className="text-xs font-black text-slate-900 dark:text-white">{j.name}</span> },
    { key: 'type', label: 'Type', align: 'center', render: (j) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{j.type}</span> },
    { key: 'schedule_cron', label: 'Schedule', align: 'center', render: (j) => <span className="text-[10px] font-mono font-bold text-indigo-600">{j.schedule_cron}</span> },
    { key: 'enabled', label: 'Status', align: 'center', render: (j) => (
      <button onClick={() => handleToggle(j)} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition ${j.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
        {j.enabled ? 'Active' : 'Disabled'}
      </button>
    ) },
    { key: 'last_run', label: 'Last Run', align: 'center', render: (j) => <span className="text-[10px] font-bold text-slate-500">{j.last_run ? new Date(j.last_run).toLocaleString() : 'Never'}</span> },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (j) => (
      <div className="flex justify-center gap-1">
        <button onClick={() => handleTrigger(j)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Run now"><Play size={14} /></button>
        <button onClick={() => { setEditJob(j); setEditForm({ name: j.name, scheduleCron: j.schedule_cron, enabled: j.enabled }); setShowEditModal(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Edit"><Settings2 size={14} /></button>
        <button onClick={() => { if (expandedJob === j.id) { setExpandedJob(null); } else { setExpandedJob(j.id); loadRuns(j.id); } }} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="History"><Clock size={14} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Scheduler & Job Engine</h2>
          <p className="text-xs text-slate-400 font-medium">Automated cron-based job runner for night audit, allotment release, reports, and backups</p>
        </div>
        <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <DataTable columns={jobColumns} data={jobs} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search jobs..." filterKeys={['name', 'type']} emptyMessage="No scheduled jobs." />

      {/* Run History */}
      {expandedJob && runs[expandedJob] && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Run History — {jobs.find(j => j.id === expandedJob)?.name}
            </h3>
          </div>
          {runs[expandedJob].length === 0 ? (
            <div className="p-6 text-center text-[10px] font-bold text-slate-400">No runs recorded.</div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {runs[expandedJob].map(run => (
                <div key={run.id} className="p-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STATUS_STYLES[run.status] || STATUS_STYLES['pending']}`}>
                        {run.status === 'success' && <CheckCircle2 size={9} className="inline mr-1" />}
                        {run.status === 'failed' && <XCircle size={9} className="inline mr-1" />}
                        {run.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(run.created_at).toLocaleString()}</span>
                    </div>
                    {run.error && <p className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={9} /> {run.error}</p>}
                    {run.result && <p className="text-[10px] font-bold text-slate-500 mt-1">{JSON.stringify(run.result)}</p>}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">
                    {run.started_at && run.completed_at ? `${Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <ModalSystem isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Scheduled Job" subtitle="Modify schedule and settings" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Job Name</label>
            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Cron Schedule</label>
            <input value={editForm.scheduleCron} onChange={e => setEditForm({ ...editForm, scheduleCron: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0 2 * * *" />
            <p className="text-[9px] font-bold text-slate-400 mt-1">Format: minute hour day month weekday (e.g., "0 2 * * *" = daily at 2 AM)</p>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Enabled</label>
            <select value={String(editForm.enabled)} onChange={e => setEditForm({ ...editForm, enabled: e.target.value === 'true' })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="true">Active</option><option value="false">Disabled</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowEditModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleEditSave} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Save</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default SchedulerManager;
