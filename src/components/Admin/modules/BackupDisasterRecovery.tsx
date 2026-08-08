import React, { useState } from 'react';
import { Database, HardDrive, Clock, RefreshCw, Play, AlertTriangle, CheckCircle, XCircle, Search, Filter, Calendar, Settings, Shield, TestTube, Trash2, Download, Upload, MoreVertical, Activity, Server, Globe, Camera } from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: string;
  duration: string;
  startTime: string;
  endTime?: string;
  location: string;
}

interface Snapshot {
  id: string;
  name: string;
  created: string;
  size: string;
  status: 'available' | 'corrupted' | 'restoring';
  description: string;
}

interface Replication {
  id: string;
  source: string;
  destination: string;
  status: 'syncing' | 'synced' | 'error';
  lastSync: string;
  lag: string;
}

interface RetentionPolicy {
  id: string;
  name: string;
  dailyBackups: number;
  weeklyBackups: number;
  monthlyBackups: number;
  retentionPeriod: string;
  isActive: boolean;
}

const BackupDisasterRecovery: React.FC = () => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([
    { id: '1', name: 'Daily Full Backup', type: 'full', status: 'completed', size: '45.2 GB', duration: '2h 15m', startTime: '2024-01-15 02:00', endTime: '2024-01-15 04:15', location: 'Primary Storage' },
    { id: '2', name: 'Hourly Incremental', type: 'incremental', status: 'running', size: '1.2 GB', duration: '15m', startTime: '2024-01-15 14:00', location: 'Primary Storage' },
    { id: '3', name: 'Weekly Differential', type: 'differential', status: 'completed', size: '12.8 GB', duration: '45m', startTime: '2024-01-14 02:00', endTime: '2024-01-14 02:45', location: 'Primary Storage' },
    { id: '4', name: 'Daily Full Backup', type: 'full', status: 'failed', size: '0 GB', duration: '0m', startTime: '2024-01-14 02:00', location: 'Primary Storage' },
    { id: '5', name: 'Hourly Incremental', type: 'incremental', status: 'scheduled', size: '0 GB', duration: '0m', startTime: '2024-01-15 15:00', location: 'Primary Storage' },
  ]);

  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    { id: '1', name: 'Pre-Update Snapshot', created: '2024-01-15 10:30', size: '42.5 GB', status: 'available', description: 'System snapshot before major update' },
    { id: '2', name: 'Weekly Baseline', created: '2024-01-14 02:00', size: '45.2 GB', status: 'available', description: 'Weekly baseline snapshot' },
    { id: '3', name: 'Emergency Backup', created: '2024-01-13 15:45', size: '38.9 GB', status: 'corrupted', description: 'Emergency backup during system issue' },
  ]);

  const [replications, setReplications] = useState<Replication[]>([
    { id: '1', source: 'Primary DB', destination: 'DR Site 1', status: 'synced', lastSync: '2 minutes ago', lag: '0s' },
    { id: '2', source: 'Primary Storage', destination: 'Cloud Backup', status: 'syncing', lastSync: '5 minutes ago', lag: '2m' },
    { id: '3', source: 'Primary DB', destination: 'DR Site 2', status: 'error', lastSync: '1 hour ago', lag: '1h' },
  ]);

  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([
    { id: '1', name: 'Standard Policy', dailyBackups: 7, weeklyBackups: 4, monthlyBackups: 12, retentionPeriod: '1 year', isActive: true },
    { id: '2', name: 'Extended Policy', dailyBackups: 14, weeklyBackups: 8, monthlyBackups: 24, retentionPeriod: '2 years', isActive: false },
    { id: '3', name: 'Compliance Policy', dailyBackups: 30, weeklyBackups: 12, monthlyBackups: 36, retentionPeriod: '7 years', isActive: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'backups' | 'snapshots' | 'replication' | 'retention' | 'dr_testing'>('backups');

  const filteredBackups = backupJobs.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || backup.type === filterType;
    const matchesStatus = filterStatus === 'all' || backup.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const backupTypes = [
    { id: 'full', name: 'Full', icon: Database, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'incremental', name: 'Incremental', icon: Activity, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'differential', name: 'Differential', icon: HardDrive, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'synced': case 'available': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'running': case 'syncing': case 'restoring': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'failed': case 'error': case 'corrupted': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'scheduled': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const backupStats = [
    { label: 'Total Backups', value: backupJobs.length, icon: Database, color: 'text-blue-600' },
    { label: 'Completed', value: backupJobs.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Running', value: backupJobs.filter(b => b.status === 'running').length, icon: Activity, color: 'text-cyan-600' },
    { label: 'Failed', value: backupJobs.filter(b => b.status === 'failed').length, icon: XCircle, color: 'text-red-600' },
    { label: 'Snapshots', value: snapshots.length, icon: CameraIcon, color: 'text-purple-600' },
    { label: 'Storage Used', value: '102 GB', icon: HardDrive, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Backup & Disaster Recovery</h1>
          <p className="text-xs text-slate-400">Manage backup schedule, restore, snapshot, replication, disaster recovery testing, and retention policy</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Play size={16} />
          Create Backup
        </button>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {backupStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'backups'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Backups
        </button>
        <button
          onClick={() => setActiveTab('snapshots')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'snapshots'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Snapshots
        </button>
        <button
          onClick={() => setActiveTab('replication')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'replication'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Replication
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'retention'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Retention Policy
        </button>
        <button
          onClick={() => setActiveTab('dr_testing')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'dr_testing'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          DR Testing
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search backups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {backupTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'backups' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Backup Job</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredBackups.map((backup) => {
                  const type = backupTypes.find(t => t.id === backup.type);
                  const TypeIcon = type?.icon || Database;
                  return (
                    <tr key={backup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                            <TypeIcon size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{backup.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{backup.size}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{backup.duration}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{backup.startTime}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{backup.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Restore">
                            <RefreshCw size={14} className="text-indigo-600" />
                          </button>
                          <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Download">
                            <Download size={14} className="text-amber-600" />
                          </button>
                          <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="More options">
                            <MoreVertical size={14} className="text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'snapshots' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">System Snapshots</h3>
              <p className="text-xs text-slate-400">Point-in-time system states</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <CameraIcon size={14} />
              Create Snapshot
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Snapshot</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 flex items-center justify-center">
                          <CameraIcon size={20} />
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{snapshot.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{snapshot.created}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{snapshot.size}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(snapshot.status)}`}>
                        {snapshot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{snapshot.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Restore from snapshot">
                          <RefreshCw size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-rose-50 rounded-lg transition" title="Delete snapshot">
                          <Trash2 size={14} className="text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'replication' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Data Replication</h3>
              <p className="text-xs text-slate-400">Multi-site data synchronization</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Globe size={14} />
              Add Replication
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Sync</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Lag</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {replications.map((replication) => (
                  <tr key={replication.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{replication.source}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{replication.destination}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(replication.status)}`}>
                        {replication.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{replication.lastSync}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{replication.lag}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Force sync">
                          <RefreshCw size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="Configure">
                          <Settings size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'retention' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Retention Policies</h3>
              <p className="text-xs text-slate-400">Backup retention and cleanup rules</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Settings size={14} />
              Add Policy
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Policy</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Daily</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Weekly</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Monthly</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Retention</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {retentionPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{policy.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{policy.dailyBackups} days</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{policy.weeklyBackups} weeks</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{policy.monthlyBackups} months</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{policy.retentionPeriod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${policy.isActive ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400'}`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover-bg-indigo-50 rounded-lg transition" title="Edit policy">
                          <Settings size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover-bg-amber-50 rounded-lg transition" title={policy.isActive ? 'Deactivate' : 'Activate'}>
                          {policy.isActive ? <XCircle size={14} className="text-amber-600" /> : <CheckCircle size={14} className="text-emerald-600" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dr_testing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Disaster Recovery Testing</h3>
              <p className="text-xs text-slate-400">Validate backup integrity and recovery procedures</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <TestTube size={14} />
              Run DR Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Last DR Test</div>
                  <div className="text-[10px] text-slate-400">2024-01-10</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Result: Passed</div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Next Scheduled</div>
                  <div className="text-[10px] text-slate-400">2024-01-22</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">In 7 days</div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">RTO/RPO</div>
                  <div className="text-[10px] text-slate-400">Target metrics</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">RTO: 4h | RPO: 1h</div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Recent Test Results</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Full System Recovery Test</div>
                    <div className="text-[10px] text-slate-400">2024-01-10 02:00 - 06:30</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">
                  Passed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Database Replication Test</div>
                    <div className="text-[10px] text-slate-400">2024-01-03 14:00 - 15:30</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                  Warning
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Backup Alerts</h3>
            <p className="text-xs text-slate-400">Failed backups and critical issues</p>
          </div>
        </div>

        <div className="space-y-4">
          {backupJobs.filter(b => b.status === 'failed').map((backup) => {
            const type = backupTypes.find(t => t.id === backup.type);
            const TypeIcon = type?.icon || Database;
            return (
              <div key={backup.id} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{backup.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                        Failed
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Backup job failed to complete. Check logs for details.</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Type: {type?.name}</span>
                      <span>Time: {backup.startTime}</span>
                      <span>Location: {backup.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                      Retry
                    </button>
                    <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BackupDisasterRecovery;