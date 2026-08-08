import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Activity, Clock, MapPin, Smartphone, Search, Filter, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'permission_change' | 'password_expiry' | 'mfa_compliance' | 'device_trust' | 'ip_restriction';
  severity: 'critical' | 'high' | 'medium' | 'low';
  user: string;
  description: string;
  timestamp: string;
  ip: string;
  location: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SecurityMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

const SecurityCenter: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([
    { id: '1', type: 'failed_login', severity: 'high', user: 'john.smith@seleda.com', description: 'Multiple failed login attempts', timestamp: '2024-01-15 14:30', ip: '192.168.1.100', location: 'Paris, France', status: 'investigating' },
    { id: '2', type: 'suspicious_activity', severity: 'critical', user: 'sarah.johnson@seleda.com', description: 'Unusual access pattern detected', timestamp: '2024-01-15 14:25', ip: '203.0.113.45', location: 'Unknown', status: 'active' },
    { id: '3', type: 'permission_change', severity: 'medium', user: 'admin@seleda.com', description: 'Admin role granted to user', timestamp: '2024-01-15 14:15', ip: '192.168.1.50', location: 'Paris, France', status: 'resolved' },
    { id: '4', type: 'password_expiry', severity: 'low', user: 'mike.wilson@vendor.com', description: 'Password expiring in 7 days', timestamp: '2024-01-15 14:10', ip: '192.168.1.75', location: 'Paris, France', status: 'active' },
    { id: '5', type: 'mfa_compliance', severity: 'medium', user: 'emily.davis@seleda.com', description: 'MFA not enabled for admin user', timestamp: '2024-01-15 14:05', ip: '192.168.1.60', location: 'Malibu, CA', status: 'active' },
    { id: '6', type: 'device_trust', severity: 'high', user: 'robert.chen@seleda.com', description: 'New device detected', timestamp: '2024-01-15 14:00', ip: '198.51.100.20', location: 'New York, NY', status: 'investigating' },
    { id: '7', type: 'ip_restriction', severity: 'critical', user: 'unknown', description: 'Access from blocked IP range', timestamp: '2024-01-15 13:45', ip: '45.33.32.156', location: 'Moscow, Russia', status: 'active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const metrics: SecurityMetric[] = [
    { label: 'Failed Logins (24h)', value: 12, trend: 'up', icon: Lock, color: 'text-red-600' },
    { label: 'Suspicious Activity', value: 3, trend: 'down', icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Permission Changes', value: 8, trend: 'stable', icon: Shield, color: 'text-blue-600' },
    { label: 'Password Expiry', value: 15, trend: 'up', icon: Lock, color: 'text-purple-600' },
    { label: 'MFA Compliance', value: 92, trend: 'up', icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Device Trust Issues', value: 5, trend: 'down', icon: Smartphone, color: 'text-cyan-600' },
  ];

  const eventTypes = [
    { id: 'failed_login', name: 'Failed Login', icon: Lock, color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' },
    { id: 'suspicious_activity', name: 'Suspicious Activity', icon: AlertTriangle, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'permission_change', name: 'Permission Change', icon: Shield, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'password_expiry', name: 'Password Expiry', icon: Lock, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'mfa_compliance', name: 'MFA Compliance', icon: Eye, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'device_trust', name: 'Device Trust', icon: Smartphone, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'ip_restriction', name: 'IP Restriction', icon: MapPin, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'medium': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'low': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'resolved': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'investigating': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Security Center</h1>
          <p className="text-xs text-slate-400">Monitor failed logins, suspicious activity, permission changes, password expiry, MFA compliance, device trust, and IP restrictions</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Shield size={16} />
          Security Report
        </button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${metric.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  metric.trend === 'up' ? 'bg-red-100 dark:bg-red-900/20' : 
                  metric.trend === 'down' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {metric.trend === 'up' && <Activity size={12} className="text-red-600" />}
                  {metric.trend === 'down' && <Activity size={12} className="text-emerald-600 rotate-180" />}
                  {metric.trend === 'stable' && <Activity size={12} className="text-slate-400" />}
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{metric.label}</div>
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
              placeholder="Search security events..."
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
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEvents.map((event) => {
                const type = eventTypes.find(t => t.id === event.type);
                const TypeIcon = type?.icon || AlertOctagon;
                return (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{event.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{event.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{event.ip}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{event.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{event.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Monitoring Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Security Monitoring</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {eventTypes.map((type) => (
            <div key={type.id} className={`p-4 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <type.icon size={24} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{events.filter(e => e.type === type.id).length} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Security Alerts</h3>
            <p className="text-xs text-slate-400">Critical and high-priority security events</p>
          </div>
        </div>

        <div className="space-y-4">
          {events.filter(e => e.severity === 'critical' || e.severity === 'high').map((event) => {
            const type = eventTypes.find(t => t.id === event.type);
            const TypeIcon = type?.icon || AlertOctagon;
            return (
              <div key={event.id} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{type?.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>User: {event.user}</span>
                      <span>IP: {event.ip}</span>
                      <span>Location: {event.location}</span>
                      <span>Time: {event.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                      Investigate
                    </button>
                    <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      Resolve
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

export default SecurityCenter;