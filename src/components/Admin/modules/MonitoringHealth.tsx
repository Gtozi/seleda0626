import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Database, Server, Globe, Zap, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Search, Filter, MoreVertical, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  type: 'api' | 'background_job' | 'queue_worker' | 'storage' | 'cpu' | 'memory' | 'database' | 'search_engine' | 'cache' | 'message_broker';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  details: string;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  component: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

const MonitoringHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { id: '1', name: 'API Response Time', type: 'api', status: 'healthy', value: '125', unit: 'ms', trend: 'stable', lastUpdated: '2 seconds ago', details: 'Average response time across all endpoints' },
    { id: '2', name: 'API Error Rate', type: 'api', status: 'healthy', value: '0.02', unit: '%', trend: 'down', lastUpdated: '2 seconds ago', details: 'Percentage of failed API requests' },
    { id: '3', name: 'Background Jobs', type: 'background_job', status: 'warning', value: '85', unit: '%', trend: 'stable', lastUpdated: '1 minute ago', details: 'Job completion rate' },
    { id: '4', name: 'Queue Workers', type: 'queue_worker', status: 'healthy', value: '12', unit: 'active', trend: 'up', lastUpdated: '30 seconds ago', details: 'Active worker processes' },
    { id: '5', name: 'Storage Usage', type: 'storage', status: 'warning', value: '78', unit: '%', trend: 'up', lastUpdated: '5 minutes ago', details: 'Disk space utilization' },
    { id: '6', name: 'CPU Usage', type: 'cpu', status: 'healthy', value: '42', unit: '%', trend: 'stable', lastUpdated: '2 seconds ago', details: 'Processor utilization' },
    { id: '7', name: 'Memory Usage', type: 'memory', status: 'healthy', value: '65', unit: '%', trend: 'up', lastUpdated: '2 seconds ago', details: 'RAM utilization' },
    { id: '8', name: 'Database Connections', type: 'database', status: 'healthy', value: '45', unit: '/ 100', trend: 'stable', lastUpdated: '2 seconds ago', details: 'Active database connections' },
    { id: '9', name: 'Database Query Time', type: 'database', status: 'healthy', value: '15', unit: 'ms', trend: 'down', lastUpdated: '2 seconds ago', details: 'Average query execution time' },
    { id: '10', name: 'Search Engine', type: 'search_engine', status: 'healthy', value: '99.9', unit: '%', trend: 'stable', lastUpdated: '1 minute ago', details: 'Search index availability' },
    { id: '11', name: 'Cache Hit Rate', type: 'cache', status: 'healthy', value: '94', unit: '%', trend: 'up', lastUpdated: '2 seconds ago', details: 'Cache effectiveness' },
    { id: '12', name: 'Message Broker', type: 'message_broker', status: 'healthy', value: '1.2K', unit: 'msg/s', trend: 'stable', lastUpdated: '2 seconds ago', details: 'Message throughput' },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', severity: 'warning', component: 'Background Jobs', message: 'Job completion rate dropped below 90%', timestamp: '5 minutes ago', status: 'active' },
    { id: '2', severity: 'warning', component: 'Storage', message: 'Disk usage approaching 80% threshold', timestamp: '10 minutes ago', status: 'active' },
    { id: '3', severity: 'info', component: 'API', message: 'Scheduled maintenance window starting in 1 hour', timestamp: '55 minutes ago', status: 'active' },
  ]);

  const [searchTerm, setMonitorTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || metric.type === filterType;
    const matchesStatus = filterStatus === 'all' || metric.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const metricTypes = [
    { id: 'api', name: 'APIs', icon: Globe, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'background_job', name: 'Background Jobs', icon: Clock, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'queue_worker', name: 'Queue Workers', icon: Server, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'storage', name: 'Storage', icon: HardDrive, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'cpu', name: 'CPU', icon: Cpu, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'memory', name: 'Memory', icon: Zap, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'database', name: 'Database', icon: Database, color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'search_engine', name: 'Search Engine', icon: Search, color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
    { id: 'cache', name: 'Cache', icon: Activity, color: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400' },
    { id: 'message_broker', name: 'Message Broker', icon: Server, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'unknown': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const healthSummary = [
    { label: 'Total Metrics', value: metrics.length, icon: BarChart3, color: 'text-blue-600' },
    { label: 'Healthy', value: metrics.filter(m => m.status === 'healthy').length, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Warnings', value: metrics.filter(m => m.status === 'warning').length, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Critical', value: metrics.filter(m => m.status === 'critical').length, icon: XCircle, color: 'text-red-600' },
    { label: 'Active Alerts', value: alerts.filter(a => a.status === 'active').length, icon: AlertTriangle, color: 'text-purple-600' },
    { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Monitoring & Health</h1>
          <p className="text-xs text-slate-400">Monitor APIs, background jobs, queue workers, storage, CPU, memory, database, search engine, cache, and message broker</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <RefreshCw size={16} />
          Refresh All
        </button>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {healthSummary.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${summary.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{summary.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{summary.label}</div>
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
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setMonitorTerm(e.target.value)}
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
              {metricTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="unknown">Unknown</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMetrics.map((metric) => {
                const type = metricTypes.find(t => t.id === metric.type);
                const TypeIcon = type?.icon || Activity;
                return (
                  <tr key={metric.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                          <TypeIcon size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{metric.name}</div>
                          <div className="text-[10px] text-slate-400">{metric.details}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type?.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}</span>
                        <span className="text-xs text-slate-400">{metric.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && <TrendingUp size={14} className="text-emerald-600" />}
                        {metric.trend === 'down' && <TrendingDown size={14} className="text-red-600" />}
                        {metric.trend === 'stable' && <Minus size={14} className="text-slate-400" />}
                        <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{metric.trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{metric.lastUpdated}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="View details">
                          <BarChart3 size={14} className="text-indigo-600" />
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

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Alerts</h3>
            <p className="text-xs text-slate-400">System warnings and critical issues</p>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.filter(a => a.status === 'active').map((alert) => (
            <div key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
              alert.severity === 'warning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            } p-4 rounded-r-xl`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${getSeverityColor(alert.severity)} flex items-center justify-center shrink-0`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{alert.component}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Time: {alert.timestamp}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                    Investigate
                  </button>
                  <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Type Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">System Components</h3>
            <p className="text-xs text-slate-400">Health status by component type</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricTypes.map((type) => {
            const typeMetrics = metrics.filter(m => m.type === type.id);
            const healthyCount = typeMetrics.filter(m => m.status === 'healthy').length;
            const warningCount = typeMetrics.filter(m => m.status === 'warning').length;
            const criticalCount = typeMetrics.filter(m => m.status === 'critical').length;
            
            return (
              <div key={type.id} className={`p-4 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
                <type.icon size={24} className="mb-2" />
                <span className="text-xs font-bold">{type.name}</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] opacity-75">{typeMetrics.length} metrics</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {healthyCount > 0 && <div className="w-2 h-2 rounded-full bg-emerald-500" title={`Healthy: ${healthyCount}`} />}
                  {warningCount > 0 && <div className="w-2 h-2 rounded-full bg-amber-500" title={`Warning: ${warningCount}`} />}
                  {criticalCount > 0 && <div className="w-2 h-2 rounded-full bg-red-500" title={`Critical: ${criticalCount}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonitoringHealth;