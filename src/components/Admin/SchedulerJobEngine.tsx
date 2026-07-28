import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Edit,
  Zap
} from 'lucide-react';

interface ScheduledJob {
  id: string;
  job_name: string;
  job_type: 'backup' | 'cleanup' | 'report' | 'sync' | 'custom';
  job_handler: string;
  schedule_cron: string;
  enabled: boolean;
  priority: number;
  timeout_seconds: number;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  success_count: number;
  failure_count: number;
}

interface JobRun {
  id: string;
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  output: any;
  error_message: string | null;
  triggered_by: string;
  retry_count: number;
}

interface JobStatistics {
  total_jobs: number;
  enabled_jobs: number;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_duration_seconds: number;
  jobs_in_queue: number;
}

export default function SchedulerJobEngine() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [jobRuns, setJobRuns] = useState<JobRun[]>([]);
  const [statistics, setStatistics] = useState<JobStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({
    job_name: '',
    job_type: 'custom' as const,
    job_handler: '',
    schedule_cron: '0 2 * * *',
    priority: 5,
    timeout_seconds: 300
  });

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const [jobsRes, runsRes, statsRes] = await Promise.all([
        fetch('/api/admin/scheduler/jobs'),
        fetch('/api/admin/scheduler/job-runs'),
        fetch('/api/admin/scheduler/statistics')
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }

      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setJobRuns(runsData.slice(0, 20));
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch job data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
    const interval = setInterval(fetchJobData, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/scheduler/jobs/${jobId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchJobData();
      }
    } catch (error) {
      console.error('Failed to trigger job:', error);
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/scheduler/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      });
      if (res.ok) {
        fetchJobData();
      }
    } catch (error) {
      console.error('Failed to toggle job:', error);
    }
  };

  const createJob = async () => {
    try {
      const res = await fetch('/api/admin/scheduler/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        setShowCreateJob(false);
        setNewJob({
          job_name: '',
          job_type: 'custom',
          job_handler: '',
          schedule_cron: '0 2 * * *',
          priority: 5,
          timeout_seconds: 300
        });
        fetchJobData();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/scheduler/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchJobData();
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const getCronDescription = (cron: string) => {
    const cronMap: Record<string, string> = {
      '0 * * * *': 'Every hour',
      '0 */6 * * *': 'Every 6 hours',
      '0 2 * * *': 'Daily at 2 AM',
      '0 2 * * 0': 'Weekly on Sunday at 2 AM',
      '0 2 1 * *': 'Monthly on 1st at 2 AM',
      '*/30 * * * *': 'Every 30 minutes'
    };
    return cronMap[cron] || cron;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'backup':
        return <Settings className="w-4 h-4" />;
      case 'cleanup':
        return <Trash2 className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduler Job Engine</h2>
          <p className="text-sm text-slate-500">Automated task scheduling and execution management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateJob(!showCreateJob)}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            New Job
          </button>
          <button
            onClick={fetchJobData}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{statistics.total_jobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Play className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Enabled Jobs</p>
                <p className="text-2xl font-bold text-emerald-600">{statistics.enabled_jobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {statistics.total_runs > 0
                    ? `${Math.round((statistics.successful_runs / statistics.total_runs) * 100)}%`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">In Queue</p>
                <p className="text-2xl font-bold text-amber-600">{statistics.jobs_in_queue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Form */}
      {showCreateJob && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Create New Scheduled Job</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Name</label>
              <input
                type="text"
                value={newJob.job_name}
                onChange={(e) => setNewJob({ ...newJob, job_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Daily Cleanup"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Type</label>
              <select
                value={newJob.job_type}
                onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="backup">Backup</option>
                <option value="cleanup">Cleanup</option>
                <option value="report">Report</option>
                <option value="sync">Sync</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Handler Function</label>
              <input
                type="text"
                value={newJob.job_handler}
                onChange={(e) => setNewJob({ ...newJob, job_handler: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="cleanup_old_records"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule</label>
              <select
                value={newJob.schedule_cron}
                onChange={(e) => setNewJob({ ...newJob, schedule_cron: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="0 2 * * *">Daily at 2 AM</option>
                <option value="0 2 * * 0">Weekly on Sunday at 2 AM</option>
                <option value="0 2 1 * *">Monthly on 1st at 2 AM</option>
                <option value="0 */6 * * *">Every 6 hours</option>
                <option value="0 * * * *">Every hour</option>
                <option value="*/30 * * * *">Every 30 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority (1-10)</label>
              <input
                type="number"
                value={newJob.priority}
                onChange={(e) => setNewJob({ ...newJob, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={newJob.timeout_seconds}
                onChange={(e) => setNewJob({ ...newJob, timeout_seconds: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                min="60"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowCreateJob(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={createJob}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Create Job
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Jobs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Jobs
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No scheduled jobs configured</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${job.enabled ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      {getJobTypeIcon(job.job_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{job.job_name}</h4>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium capitalize">
                          {job.job_type}
                        </span>
                        {!job.enabled && (
                          <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {getCronDescription(job.schedule_cron)} • Priority: {job.priority} • Handler: {job.job_handler}
                      </p>
                      <div className="flex gap-6 text-xs">
                        <div>
                          <span className="text-slate-500">Total Runs:</span>
                          <span className="font-bold text-slate-900 ml-1">{job.run_count}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Success:</span>
                          <span className="font-bold text-emerald-600 ml-1">{job.success_count}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Failed:</span>
                          <span className="font-bold text-red-600 ml-1">{job.failure_count}</span>
                        </div>
                        {job.next_run_at && (
                          <div>
                            <span className="text-slate-500">Next Run:</span>
                            <span className="font-bold text-slate-900 ml-1">
                              {new Date(job.next_run_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {job.enabled && (
                      <button
                        onClick={() => triggerJob(job.id)}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition"
                        title="Trigger Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleJob(job.id, job.enabled)}
                      className={`p-2 rounded-lg transition ${
                        job.enabled
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                      title={job.enabled ? 'Disable' : 'Enable'}
                    >
                      {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Job Runs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Job Runs
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {jobRuns.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No job runs recorded</p>
            </div>
          ) : (
            jobRuns.map(run => (
              <div key={run.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {getStatusIcon(run.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 capitalize">{run.status}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm text-slate-500">
                        Triggered by {run.triggered_by}
                      </span>
                      {run.retry_count > 0 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          Retry #{run.retry_count}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-6 text-xs">
                      <div>
                        <span className="text-slate-500">Started:</span>
                        <span className="font-mono text-slate-900 ml-1">
                          {new Date(run.started_at).toLocaleString()}
                        </span>
                      </div>
                      {run.completed_at && (
                        <div>
                          <span className="text-slate-500">Duration:</span>
                          <span className="font-mono text-slate-900 ml-1">
                            {run.duration_seconds}s
                          </span>
                        </div>
                      )}
                    </div>
                    {run.error_message && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        {run.error_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
