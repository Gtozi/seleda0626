import React, { useState, useEffect } from 'react';
import { Users, Activity, Globe, AlertTriangle, Database, Shield, Clock, Zap, CheckCircle, Server, Cpu, HardDrive, Network, Settings, BarChart3, TrendingUp } from 'lucide-react';

const ExecutiveDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    portalHealth: 'healthy',
    apiStatus: 'operational',
    integrationStatus: 'operational',
    securityAlerts: 0,
    failedJobs: 0,
    backgroundQueue: 0,
    databaseHealth: 'healthy',
    licenseStatus: 'active',
    backupStatus: 'completed',
    systemPerformance: 'optimal',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkTraffic: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, event: 'User authentication system updated', time: '10 minutes ago', type: 'info' },
    { id: 2, event: 'Backup completed successfully', time: '2 hours ago', type: 'success' },
    { id: 3, event: 'Integration sync completed with warnings', time: '4 hours ago', type: 'warning' },
    { id: 4, event: 'New property added to system', time: '6 hours ago', type: 'success' },
    { id: 5, event: 'Security policy updated', time: '8 hours ago', type: 'info' },
  ]);

  const [portalStatus, setPortalStatus] = useState([
    { name: 'Front Office', status: 'operational', uptime: '99.9%' },
    { name: 'Housekeeping', status: 'operational', uptime: '99.8%' },
    { name: 'Food & Beverage', status: 'operational', uptime: '99.7%' },
    { name: 'Guest Portal', status: 'operational', uptime: '99.9%' },
    { name: 'Public Booking', status: 'degraded', uptime: '98.5%' },
    { name: 'Executive BI', status: 'operational', uptime: '99.6%' },
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 500) + 100,
        onlineUsers: Math.floor(Math.random() * 200) + 50,
        failedJobs: Math.floor(Math.random() * 5),
        backgroundQueue: Math.floor(Math.random() * 20),
        securityAlerts: Math.floor(Math.random() * 3),
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 20) + 40,
        diskUsage: Math.floor(Math.random() * 10) + 50,
        networkTraffic: Math.floor(Math.random() * 100) + 50
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    { title: 'Active Users', value: metrics.activeUsers, icon: Users, color: 'text-blue-600', trend: '+12%' },
    { title: 'Online Users', value: metrics.onlineUsers, icon: Activity, color: 'text-green-600', trend: '+8%' },
    { title: 'Portal Health', value: metrics.portalHealth, icon: Globe, color: 'text-emerald-600', trend: 'Stable' },
    { title: 'API Status', value: metrics.apiStatus, icon: Zap, color: 'text-yellow-600', trend: '99.9%' },
    { title: 'Integration Status', value: metrics.integrationStatus, icon: Network, color: 'text-purple-600', trend: '98.5%' },
    { title: 'Security Alerts', value: metrics.securityAlerts, icon: AlertTriangle, color: 'text-red-600', trend: '-2' },
    { title: 'Failed Jobs', value: metrics.failedJobs, icon: Clock, color: 'text-orange-600', trend: 'Low' },
    { title: 'Background Queue', value: metrics.backgroundQueue, icon: Activity, color: 'text-indigo-600', trend: 'Normal' },
    { title: 'Database Health', value: metrics.databaseHealth, icon: Database, color: 'text-cyan-600', trend: 'Healthy' },
    { title: 'License Status', value: metrics.licenseStatus, icon: Shield, color: 'text-green-600', trend: 'Active' },
    { title: 'Backup Status', value: metrics.backupStatus, icon: Database, color: 'text-emerald-600', trend: 'Recent' },
    { title: 'System Performance', value: metrics.systemPerformance, icon: Zap, color: 'text-blue-600', trend: 'Optimal' },
  ];

  const systemResources = [
    { title: 'CPU Usage', value: `${metrics.cpuUsage}%`, icon: Cpu, color: 'text-blue-600' },
    { title: 'Memory Usage', value: `${metrics.memoryUsage}%`, icon: Server, color: 'text-purple-600' },
    { title: 'Disk Usage', value: `${metrics.diskUsage}%`, icon: HardDrive, color: 'text-cyan-600' },
    { title: 'Network Traffic', value: `${metrics.networkTraffic} Mbps`, icon: Network, color: 'text-green-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'degraded': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'down': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-xs text-slate-400">System Administration Portal Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Settings size={16} className="inline mr-2" />
            Settings
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
            <BarChart3 size={16} className="inline mr-2" />
            Full Report
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 ${metric.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{metric.title}</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{metric.value}</h3>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">{metric.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemResources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 ${resource.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{resource.title}</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{resource.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">System Health Overview</h3>
              <p className="text-xs text-slate-400">Platform status monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 rounded-full text-xs font-bold">
                All Systems Operational
              </span>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Overall System Status</span>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 rounded-full text-xs font-bold">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Backup</span>
              <span className="text-sm text-slate-900 dark:text-white">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Uptime (30 days)</span>
              <span className="text-sm text-slate-900 dark:text-white">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active Integrations</span>
              <span className="text-sm text-slate-900 dark:text-white">24/25</span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Portal Status</h4>
            <div className="space-y-3">
              {portalStatus.map((portal, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{portal.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{portal.uptime}</span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(portal.status)}`}>
                      {portal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-slate-400">System events and changes</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 dark:text-white">{activity.event}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400">Common administrative tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Add User', icon: Users },
            { label: 'Run Backup', icon: Database },
            { label: 'View Logs', icon: Activity },
            { label: 'System Config', icon: Settings },
            { label: 'Security Scan', icon: Shield },
            { label: 'Generate Report', icon: BarChart3 },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={index} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;