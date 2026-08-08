import React, { useState } from 'react';
import { FileSearch, Shield, User, Settings, Globe, Download, Upload, Activity, Search, Filter, Calendar, Clock, ChevronRight, AlertTriangle, CheckCircle, XCircle, MoreVertical, Database, Key, Lock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface AuditLog {
  id: string;
  type: 'login' | 'record_change' | 'approval' | 'config_change' | 'api_call' | 'import' | 'export';
  user: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'failure' | 'pending';
  module: string;
}

interface AuditSummary {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

const AuditCenter: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', type: 'login', user: 'john.smith@seleda.com', action: 'User Login', details: 'Successful login from IP 192.168.1.100', timestamp: '2024-01-15 14:30:25', ip: '192.168.1.100', status: 'success', module: 'Authentication' },
    { id: '2', type: 'record_change', user: 'sarah.johnson@seleda.com', action: 'Update Reservation', details: 'Modified reservation RES-12345 check-in date', timestamp: '2024-01-15 14:28:15', ip: '192.168.1.75', status: 'success', module: 'Front Desk' },
    { id: '3', type: 'approval', user: 'gm@erp.com', action: 'Approve Budget', details: 'Approved Q1 2024 budget request', timestamp: '2024-01-15 14:25:00', ip: '192.168.1.50', status: 'success', module: 'Finance' },
    { id: '4', type: 'config_change', user: 'admin@erp.com', action: 'Update System Settings', details: 'Modified security policy settings', timestamp: '2024-01-15 14:20:30', ip: '192.168.1.10', status: 'success', module: 'Administration' },
    { id: '5', type: 'api_call', user: 'api_user@partner.com', action: 'GET /api/reservations', details: 'External API call to retrieve reservations', timestamp: '2024-01-15 14:18:45', ip: '203.0.113.45', status: 'success', module: 'API Gateway' },
    { id: '6', type: 'import', user: 'finance@erp.com', action: 'Import Financial Data', details: 'Imported 500 financial records from CSV', timestamp: '2024-01-15 14:15:20', ip: '192.168.1.60', status: 'success', module: 'Finance' },
    { id: '7', type: 'export', user: 'sales@erp.com', action: 'Export Sales Report', details: 'Exported monthly sales report to PDF', timestamp: '2024-01-15 14:10:10', ip: '192.168.1.80', status: 'success', module: 'Reports' },
    { id: '8', type: 'login', user: 'unknown@external.com', action: 'Failed Login Attempt', details: 'Failed login attempt with invalid credentials', timestamp: '2024-01-15 14:05:00', ip: '45.33.32.156', status: 'failure', module: 'Authentication' },
    { id: '9', type: 'record_change', user: 'frontoffice@erp.com', action: 'Create Guest Profile', details: 'Created new guest profile for John Doe', timestamp: '2024-01-15 14:00:30', ip: '192.168.1.70', status: 'success', module: 'Front Desk' },
    { id: '10', type: 'approval', user: 'ops_manager@erp.com', action: 'Reject Leave Request', details: 'Rejected leave request for employee EMP-456', timestamp: '2024-01-15 13:55:15', ip: '192.168.1.65', status: 'success', module: 'HR' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    return matchesSearch && matchesType && matchesStatus && matchesModule;
  });

  const auditTypes = [
    { id: 'login', name: 'Login', icon: Lock, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'record_change', name: 'Record Changes', icon: Database, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'approval', name: 'Approval History', icon: CheckCircle, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'config_change', name: 'Configuration Changes', icon: Settings, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'api_call', name: 'API Calls', icon: Globe, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'import', name: 'Imports', icon: Upload, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'export', name: 'Exports', icon: Download, color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'failure': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const auditSummaries: AuditSummary[] = [
    { type: 'Total Events', count: auditLogs.length, trend: 'up', icon: TrendingUp, color: 'text-blue-600' },
    { type: 'Successful', count: auditLogs.filter(l => l.status === 'success').length, trend: 'up', icon: CheckCircle, color: 'text-emerald-600' },
    { type: 'Failed', count: auditLogs.filter(l => l.status === 'failure').length, trend: 'down', icon: XCircle, color: 'text-red-600' },
    { type: 'Logins', count: auditLogs.filter(l => l.type === 'login').length, trend: 'stable', icon: Lock, color: 'text-purple-600' },
    { type: 'API Calls', count: auditLogs.filter(l => l.type === 'api_call').length, trend: 'up', icon: Globe, color: 'text-cyan-600' },
    { type: 'Config Changes', count: auditLogs.filter(l => l.type === 'config_change').length, trend: 'stable', icon: Settings, color: 'text-amber-600' },
  ];

  const modules = [...new Set(auditLogs.map(log => log.module))];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Audit Center</h1>
          <p className="text-xs text-slate-400">Track every system action including login, record changes, approval history, configuration changes, API calls, imports, and exports</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {auditSummaries.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${summary.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  summary.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 
                  summary.trend === 'down' ? 'bg-red-100 dark:bg-red-900/20' : 
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {summary.trend === 'up' ? <TrendingUp size={12} className="text-emerald-600" /> : 
                   summary.trend === 'down' ? <TrendingDown size={12} className="text-red-600" /> : 
                   <Activity size={12} className="text-slate-400" />}
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{summary.count}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{summary.type}</div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {auditTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Event Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const type = auditTypes.find(t => t.id === log.type);
                const TypeIcon = type?.icon || TrendingUp;
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                          <TypeIcon size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{type?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{log.ip}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="View details">
                          <FileSearch size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-50 rounded-lg transition" title="More options">
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

      {/* Audit Type Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Audit Type Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of audit events by type</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {auditTypes.map((type) => (
            <div key={type.id} className={`p-4 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <type.icon size={24} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{auditLogs.filter(l => l.type === type.id).length} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Security Alerts</h3>
            <p className="text-xs text-slate-400">Failed logins and suspicious activities</p>
          </div>
        </div>

        <div className="space-y-4">
          {auditLogs.filter(l => l.status === 'failure' || l.type === 'login').map((log) => {
            const type = auditTypes.find(t => t.id === log.type);
            const TypeIcon = type?.icon || TrendingUp;
            return (
              <div key={log.id} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{log.details}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>User: {log.user}</span>
                      <span>IP: {log.ip}</span>
                      <span>Time: {log.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                      Investigate
                    </button>
                    <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      Block IP
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

export default AuditCenter;