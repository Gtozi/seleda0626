/**
 * Night Audit Automation Component
 * Automates end-of-day processes, room status updates, financial reconciliation
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Moon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Bed,
  Users,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Settings,
  Eye,
  Search,
  Filter
} from 'lucide-react';

interface AuditTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: string;
  error?: string;
}

interface AuditReport {
  id: string;
  date: string;
  status: 'in_progress' | 'completed' | 'failed';
  tasks: AuditTask[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalRevenue: number;
    roomsOccupied: number;
    roomsAvailable: number;
    checkIns: number;
    checkOuts: number;
    noShows: number;
    housekeepingIssues: number;
  };
  startedAt: Date;
  completedAt?: Date;
  startedBy: string;
}

interface RoomDiscrepancy {
  roomId: string;
  roomNumber: string;
  expectedStatus: string;
  actualStatus: string;
  discrepancy: string;
  resolved: boolean;
}

interface FinancialDiscrepancy {
  id: string;
  type: 'room_charge' | 'payment' | 'adjustment';
  amount: number;
  description: string;
  status: 'unresolved' | 'resolved';
}

const NightAuditAutomation = () => {
  const [currentAudit, setCurrentAudit] = useState<AuditReport | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditReport[]>([]);
  const [roomDiscrepancies, setRoomDiscrepancies] = useState<RoomDiscrepancy[]>([]);
  const [financialDiscrepancies, setFinancialDiscrepancies] = useState<FinancialDiscrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'current' | 'history' | 'discrepancies'>('dashboard');
  const [autoRunEnabled, setAutoRunEnabled] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('23:00');

  const fetchCurrentAudit = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/current');
      if (res.ok) {
        const data = await res.json();
        setCurrentAudit(data);
      }
    } catch (error) {
      console.error('Failed to fetch current audit:', error);
    }
  };

  const fetchAuditHistory = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/history');
      if (res.ok) {
        const data = await res.json();
        setAuditHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit history:', error);
    }
  };

  const fetchDiscrepancies = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/discrepancies');
      if (res.ok) {
        const data = await res.json();
        setRoomDiscrepancies(data.rooms || []);
        setFinancialDiscrepancies(data.financial || []);
      }
    } catch (error) {
      console.error('Failed to fetch discrepancies:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentAudit(), fetchAuditHistory(), fetchDiscrepancies()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleStartAudit = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/start', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchCurrentAudit();
      }
    } catch (error) {
      console.error('Failed to start audit:', error);
    }
  };

  const handlePauseAudit = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/pause', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchCurrentAudit();
      }
    } catch (error) {
      console.error('Failed to pause audit:', error);
    }
  };

  const handleResolveDiscrepancy = async (type: 'room' | 'financial', id: string) => {
    try {
      const endpoint = type === 'room' 
        ? `/api/front-office/night-audit/room-discrepancies/${id}/resolve`
        : `/api/front-office/night-audit/financial-discrepancies/${id}/resolve`;
      
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        await fetchDiscrepancies();
      }
    } catch (error) {
      console.error('Failed to resolve discrepancy:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch('/api/front-office/night-audit/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: currentAudit?.id })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `night-audit-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const stats = useMemo(() => {
    return {
      todayOccupancy: currentAudit?.summary?.roomsOccupied || 0,
      todayRevenue: currentAudit?.summary?.totalRevenue || 0,
      pendingTasks: currentAudit?.tasks?.filter(t => t.status === 'pending').length || 0,
      failedTasks: currentAudit?.tasks?.filter(t => t.status === 'failed').length || 0,
      unresolvedDiscrepancies: roomDiscrepancies.filter(d => !d.resolved).length + financialDiscrepancies.filter(d => d.status === 'unresolved').length
    };
  }, [currentAudit, roomDiscrepancies, financialDiscrepancies]);

  const getTaskStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-600',
      running: 'bg-blue-100 text-blue-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  const getTaskStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={16} />,
      running: <RefreshCw size={16} />,
      completed: <CheckCircle2 size={16} />,
      failed: <XCircle size={16} />
    };
    return icons[status] || <Clock size={16} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Night Audit Automation</h2>
          <p className="text-slate-600">Automate end-of-day processes and reconciliation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Scheduled:</span>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledTime(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setAutoRunEnabled(!autoRunEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRunEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {autoRunEnabled ? 'Auto-Run ON' : 'Auto-Run OFF'}
          </button>
          {currentAudit?.status === 'in_progress' ? (
            <button
              onClick={handlePauseAudit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Pause size={16} />
              Pause
            </button>
          ) : (
            <button
              onClick={handleStartAudit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play size={16} />
              Start Audit
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Bed size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Occupancy</p>
              <p className="text-2xl font-bold text-slate-900">{stats.todayOccupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${stats.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Failed Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{stats.failedTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Discrepancies</p>
              <p className="text-2xl font-bold text-slate-900">{stats.unresolvedDiscrepancies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'dashboard' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('current')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'current' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Current Audit
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'history' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setView('discrepancies')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'discrepancies' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Discrepancies
        </button>
      </div>

      {view === 'dashboard' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Audit Progress */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Current Audit Progress</h3>
            {currentAudit ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentAudit.status === 'completed' ? 'bg-green-100 text-green-700' :
                    currentAudit.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentAudit.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm font-medium text-slate-900">
                    {currentAudit.summary.completedTasks}/{currentAudit.summary.totalTasks} tasks
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentAudit.summary.completedTasks / currentAudit.summary.totalTasks) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Started</span>
                  <span className="text-sm text-slate-900">
                    {new Date(currentAudit.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No active audit</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleGenerateReport}
                className="w-full flex items-center gap-2 px-4 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                <FileText size={16} />
                Generate Report
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Download size={16} />
                Export Data
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Eye size={16} />
                View Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'current' && currentAudit && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Audit Tasks</h3>
          <div className="space-y-3">
            {currentAudit.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTaskStatusColor(task.status)}`}>
                    {getTaskStatusIcon(task.status)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{task.name}</p>
                    <p className="text-sm text-slate-600">{task.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {task.status === 'completed' && task.duration && (
                    <p className="text-sm text-slate-600">{task.duration}s</p>
                  )}
                  {task.status === 'failed' && task.error && (
                    <p className="text-sm text-red-600">{task.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Started By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditHistory.map(audit => (
                <tr key={audit.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="text-sm text-slate-900">{audit.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      audit.status === 'completed' ? 'bg-green-100 text-green-700' :
                      audit.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{audit.summary.completedTasks}/{audit.summary.totalTasks}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">${audit.summary.totalRevenue.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{audit.startedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'discrepancies' && (
        <div className="space-y-6">
          {/* Room Discrepancies */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Room Discrepancies</h3>
            <div className="space-y-3">
              {roomDiscrepancies.length === 0 ? (
                <p className="text-sm text-slate-600">No room discrepancies found</p>
              ) : (
                roomDiscrepancies.map(discrepancy => (
                  <div key={discrepancy.roomId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Room {discrepancy.roomNumber}</p>
                      <p className="text-sm text-slate-600">{discrepancy.discrepancy}</p>
                      <p className="text-xs text-slate-500">Expected: {discrepancy.expectedStatus} | Actual: {discrepancy.actualStatus}</p>
                    </div>
                    {!discrepancy.resolved && (
                      <button
                        onClick={() => handleResolveDiscrepancy('room', discrepancy.roomId)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Discrepancies */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Financial Discrepancies</h3>
            <div className="space-y-3">
              {financialDiscrepancies.length === 0 ? (
                <p className="text-sm text-slate-600">No financial discrepancies found</p>
              ) : (
                financialDiscrepancies.map(discrepancy => (
                  <div key={discrepancy.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">${discrepancy.amount}</p>
                      <p className="text-sm text-slate-600">{discrepancy.description}</p>
                      <p className="text-xs text-slate-500 capitalize">{discrepancy.type}</p>
                    </div>
                    {discrepancy.status === 'unresolved' && (
                      <button
                        onClick={() => handleResolveDiscrepancy('financial', discrepancy.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightAuditAutomation;
