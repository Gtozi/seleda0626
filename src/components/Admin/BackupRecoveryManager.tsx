import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Calendar, 
  HardDrive, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface BackupJob {
  id: string;
  backup_type: 'full' | 'incremental' | 'schema_only';
  status: 'pending' | 'running' | 'completed' | 'failed';
  backup_size_bytes: number | null;
  storage_location: string;
  storage_path: string | null;
  initiated_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface BackupSchedule {
  id: string;
  schedule_name: string;
  backup_type: 'full' | 'incremental' | 'schema_only';
  cron_schedule: string;
  retention_days: number;
  is_active: boolean;
  storage_location: string;
  last_run_at: string | null;
  next_run_at: string | null;
}

interface BackupStats {
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  total_size_bytes: number;
  avg_backup_size_bytes: number;
  last_backup_time: string | null;
  last_backup_status: string | null;
}

export default function BackupRecoveryManager() {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    schedule_name: '',
    backup_type: 'full' as const,
    cron_schedule: '0 2 * * *',
    retention_days: 30,
    storage_location: 'supabase'
  });

  const fetchBackupData = async () => {
    try {
      setLoading(true);
      const [backupsRes, schedulesRes, statsRes] = await Promise.all([
        fetch('/api/admin/backups'),
        fetch('/api/admin/backup-schedules'),
        fetch('/api/admin/backup-statistics')
      ]);

      if (backupsRes.ok) {
        const backupsData = await backupsRes.json();
        setBackups(backupsData);
      }

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const createBackup = async (backupType: 'full' | 'incremental' | 'schema_only') => {
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_type: backupType })
      });
      if (res.ok) {
        fetchBackupData();
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const createSchedule = async () => {
    try {
      const res = await fetch('/api/admin/backup-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
      if (res.ok) {
        setShowCreateSchedule(false);
        setNewSchedule({
          schedule_name: '',
          backup_type: 'full',
          cron_schedule: '0 2 * * *',
          retention_days: 30,
          storage_location: 'supabase'
        });
        fetchBackupData();
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/backup-schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      if (res.ok) {
        fetchBackupData();
      }
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/admin/backup-schedules/${scheduleId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchBackupData();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Backup & Recovery Manager</h2>
          <p className="text-sm text-slate-500">Automated database backups and recovery procedures</p>
        </div>
        <button
          onClick={fetchBackupData}
          className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-4 h-4 inline mr-1" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Backups</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total_backups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Successful</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.successful_backups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed_backups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Size</p>
                <p className="text-lg font-bold text-slate-900">{formatBytes(stats.total_size_bytes)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Last Backup</p>
                <p className="text-sm font-bold text-slate-900">
                  {stats.last_backup_time ? new Date(stats.last_backup_time).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Quick Backup Actions
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => createBackup('full')}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Database className="w-4 h-4" />
            Full Backup
          </button>
          <button
            onClick={() => createBackup('incremental')}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Download className="w-4 h-4" />
            Incremental Backup
          </button>
          <button
            onClick={() => createBackup('schema_only')}
            className="flex items-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
          >
            <Settings className="w-4 h-4" />
            Schema Only
          </button>
        </div>
      </div>

      {/* Backup Schedules */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Backup Schedules
          </h3>
          <button
            onClick={() => setShowCreateSchedule(!showCreateSchedule)}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            {showCreateSchedule ? 'Cancel' : 'Create Schedule'}
          </button>
        </div>

        {showCreateSchedule && (
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule Name</label>
                <input
                  type="text"
                  value={newSchedule.schedule_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, schedule_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Daily Backup"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Backup Type</label>
                <select
                  value={newSchedule.backup_type}
                  onChange={(e) => setNewSchedule({ ...newSchedule, backup_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="full">Full</option>
                  <option value="incremental">Incremental</option>
                  <option value="schema_only">Schema Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule</label>
                <select
                  value={newSchedule.cron_schedule}
                  onChange={(e) => setNewSchedule({ ...newSchedule, cron_schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="0 2 * * *">Daily at 2 AM</option>
                  <option value="0 2 * * 0">Weekly on Sunday at 2 AM</option>
                  <option value="0 2 1 * *">Monthly on 1st at 2 AM</option>
                  <option value="0 */6 * * *">Every 6 hours</option>
                  <option value="*/30 * * * *">Every 30 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Retention (days)</label>
                <input
                  type="number"
                  value={newSchedule.retention_days}
                  onChange={(e) => setNewSchedule({ ...newSchedule, retention_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  min="1"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={createSchedule}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No backup schedules configured</p>
            </div>
          ) : (
            schedules.map(schedule => (
              <div key={schedule.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{schedule.schedule_name}</h4>
                    <p className="text-sm text-slate-500">
                      {getCronDescription(schedule.cron_schedule)} • {schedule.backup_type} • {schedule.retention_days} days retention
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Last run</p>
                    <p className="text-sm font-medium text-slate-900">
                      {schedule.last_run_at ? new Date(schedule.last_run_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSchedule(schedule.id, schedule.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      schedule.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {schedule.is_active ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Recent Backups
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {backups.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Database className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No backups available</p>
            </div>
          ) : (
            backups.map(backup => (
              <div key={backup.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {getStatusIcon(backup.status)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 capitalize">{backup.backup_type.replace('_', ' ')} Backup</h4>
                    <p className="text-sm text-slate-500">
                      {backup.storage_location} • {formatBytes(backup.backup_size_bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Initiated</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(backup.initiated_at).toLocaleString()}
                    </p>
                  </div>
                  {backup.status === 'completed' && (
                    <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition">
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                  )}
                  {backup.status === 'failed' && backup.error_message && (
                    <div className="text-xs text-red-600 max-w-xs truncate" title={backup.error_message}>
                      {backup.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
