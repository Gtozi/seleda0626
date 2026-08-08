/**
 * Operations Command Center
 * Live operational overview across all departments
 */

import React, { useState, useEffect } from 'react';
import {
  Command,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Bed,
  Utensils,
  Wrench,
  Shield,
  Car,
  Calendar,
  RefreshCw,
  Bell,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  Play,
  Pause,
  Radio
} from 'lucide-react';

interface DepartmentStatus {
  name: string;
  status: 'operational' | 'degraded' | 'critical' | 'offline';
  statusText: string;
  lastUpdate: string;
  activeIssues: number;
  icon: any;
}

interface LiveAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
  department: string;
  acknowledged: boolean;
}

const OperationsCommandCenter: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<DepartmentStatus[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);

  const mockDepartments: DepartmentStatus[] = [
    {
      name: 'Front Office',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '2 min ago',
      activeIssues: 0,
      icon: Users
    },
    {
      name: 'Housekeeping',
      status: 'degraded',
      statusText: 'Staff Shortage',
      lastUpdate: '5 min ago',
      activeIssues: 2,
      icon: Bed
    },
    {
      name: 'Engineering',
      status: 'critical',
      statusText: 'HVAC Failure',
      lastUpdate: '1 min ago',
      activeIssues: 3,
      icon: Wrench
    },
    {
      name: 'Food & Beverage',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '3 min ago',
      activeIssues: 0,
      icon: Utensils
    },
    {
      name: 'Kitchen',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '4 min ago',
      activeIssues: 0,
      icon: Utensils
    },
    {
      name: 'Laundry',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '10 min ago',
      activeIssues: 0,
      icon: Activity
    },
    {
      name: 'Spa',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '15 min ago',
      activeIssues: 0,
      icon: Activity
    },
    {
      name: 'Security',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '1 min ago',
      activeIssues: 0,
      icon: Shield
    },
    {
      name: 'Transportation',
      status: 'degraded',
      statusText: 'Vehicle Maintenance',
      lastUpdate: '20 min ago',
      activeIssues: 1,
      icon: Car
    },
    {
      name: 'Events',
      status: 'operational',
      statusText: 'Normal Operations',
      lastUpdate: '8 min ago',
      activeIssues: 0,
      icon: Calendar
    }
  ];

  const mockAlerts: LiveAlert[] = [
    {
      id: '1',
      type: 'critical',
      category: 'Equipment Failure',
      message: 'HVAC system failure on Floor 3 affecting 12 rooms',
      timestamp: '10 min ago',
      department: 'Engineering',
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      category: 'Staff Shortage',
      message: '3 housekeepers called in sick for afternoon shift',
      timestamp: '25 min ago',
      department: 'Housekeeping',
      acknowledged: false
    },
    {
      id: '3',
      type: 'critical',
      category: 'Guest Escalation',
      message: 'Guest in Room 305 reporting water leak, immediate attention required',
      timestamp: '5 min ago',
      department: 'Front Office',
      acknowledged: true
    },
    {
      id: '4',
      type: 'warning',
      category: 'Equipment Failure',
      message: 'Airport shuttle van requires maintenance - 1 vehicle out of service',
      timestamp: '30 min ago',
      department: 'Transportation',
      acknowledged: false
    },
    {
      id: '5',
      type: 'info',
      category: 'VIP Arrival',
      message: 'VVIP guest Mr. Smith arriving at 3:00 PM, suite preparation in progress',
      timestamp: '1 hour ago',
      department: 'Front Office',
      acknowledged: true
    }
  ];

  useEffect(() => {
    setDepartments(mockDepartments);
    setAlerts(mockAlerts);
  }, []);

  const getStatusColor = (status: DepartmentStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'degraded':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'offline':
        return 'bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusIcon = (status: DepartmentStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 size={16} />;
      case 'degraded':
        return <AlertTriangle size={16} />;
      case 'critical':
        return <XCircle size={16} />;
      case 'offline':
        return <XCircle size={16} />;
    }
  };

  const getAlertTypeColor = (type: LiveAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = selectedFilter === 'all' || alert.type === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Command size={28} />
            Operations Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Live operational overview across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {isLive ? <Pause size={20} className="text-slate-600 dark:text-slate-400" /> : <Play size={20} className="text-slate-600 dark:text-slate-400" />}
          </button>
          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Department Status Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Radio size={16} />
          Live Department Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className={`p-4 rounded-lg border ${getStatusColor(dept.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="font-semibold text-sm">{dept.name}</span>
                  </div>
                  {getStatusIcon(dept.status)}
                </div>
                <p className="text-xs mt-2 font-medium">{dept.statusText}</p>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="opacity-75">{dept.lastUpdate}</span>
                  {dept.activeIssues > 0 && (
                    <span className="font-semibold">{dept.activeIssues} issue{dept.activeIssues > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={16} />
            Live Alerts
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No alerts match your filters
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertTypeColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-slate-400">
                        {alert.category}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">
                      {alert.message}
                    </p>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 inline-block">
                      {alert.department}
                    </span>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsCommandCenter;