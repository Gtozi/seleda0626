/**
 * Security & Compliance Dashboard
 * PCI DSS compliance, GDPR consent management, fraud detection, and security auditing
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  FileText,
  Activity,
  Users,
  Clock,
  Settings,
  Download,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  XCircle,
  Info,
  AlertCircle
} from 'lucide-react';

interface SecurityEvent {
  eventId: string;
  eventType: 'login_attempt' | 'data_access' | 'rate_override' | 'payment' | 'permission_change';
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
  action: 'allow' | 'block' | 'flag';
  timestamp: string;
  details?: string;
}

interface ComplianceConsent {
  consentId: string;
  guestId: string;
  guestName: string;
  consentType: 'gdpr_data_processing' | 'marketing_communications' | 'payment_processing';
  granted: boolean;
  grantedAt: string;
  revokedAt?: string;
  documentVersion: string;
  ipAddress: string;
}

interface SecurityMetric {
  metric: string;
  value: number;
  threshold: number;
  status: 'compliant' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const SecurityComplianceDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // Mock data
  const securityMetrics: SecurityMetric[] = useMemo(() => [
    { metric: 'Failed Login Attempts', value: 23, threshold: 50, status: 'compliant', trend: 'down' },
    { metric: 'High-Risk Events', value: 5, threshold: 10, status: 'warning', trend: 'up' },
    { metric: 'Unauthorized Access Attempts', value: 2, threshold: 5, status: 'compliant', trend: 'stable' },
    { metric: 'Data Access Violations', value: 0, threshold: 1, status: 'compliant', trend: 'stable' },
  ], []);

  const securityEvents: SecurityEvent[] = useMemo(() => [
    {
      eventId: 'SE-001',
      eventType: 'login_attempt',
      userId: 'U-123',
      userName: 'John Doe',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      riskScore: 15,
      action: 'allow',
      timestamp: '2026-07-19T14:30:00Z',
      details: 'Successful login from known location',
    },
    {
      eventId: 'SE-002',
      eventType: 'payment',
      userId: 'U-456',
      userName: 'Sarah Smith',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      riskScore: 8,
      action: 'allow',
      timestamp: '2026-07-19T14:25:00Z',
      details: 'Payment processed successfully',
    },
    {
      eventId: 'SE-003',
      eventType: 'rate_override',
      userId: 'U-789',
      userName: 'Mike Johnson',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      riskScore: 35,
      action: 'flag',
      timestamp: '2026-07-19T14:20:00Z',
      details: 'Large rate override (25% above rack rate)',
    },
    {
      eventId: 'SE-004',
      eventType: 'login_attempt',
      userId: 'U-999',
      userName: 'Unknown',
      ipAddress: '203.0.113.50',
      userAgent: 'Mozilla/5.0 (compatible; bot/1.0)',
      riskScore: 85,
      action: 'block',
      timestamp: '2026-07-19T14:15:00Z',
      details: 'Suspicious login attempt from unknown IP',
    },
    {
      eventId: 'SE-005',
      eventType: 'data_access',
      userId: 'U-321',
      userName: 'Admin User',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      riskScore: 5,
      action: 'allow',
      timestamp: '2026-07-19T14:10:00Z',
      details: 'Accessed guest financial records',
    },
  ], []);

  const consents: ComplianceConsent[] = useMemo(() => [
    {
      consentId: 'C-001',
      guestId: 'G-123',
      guestName: 'John Doe',
      consentType: 'gdpr_data_processing',
      granted: true,
      grantedAt: '2026-07-15T10:00:00Z',
      documentVersion: '2.1',
      ipAddress: '192.168.1.100',
    },
    {
      consentId: 'C-002',
      guestId: 'G-456',
      guestName: 'Sarah Smith',
      consentType: 'marketing_communications',
      granted: true,
      grantedAt: '2026-07-16T14:30:00Z',
      revokedAt: '2026-07-18T09:00:00Z',
      documentVersion: '2.1',
      ipAddress: '192.168.1.105',
    },
    {
      consentId: 'C-003',
      guestId: 'G-789',
      guestName: 'Mike Johnson',
      consentType: 'payment_processing',
      granted: true,
      grantedAt: '2026-07-17T16:45:00Z',
      documentVersion: '2.1',
      ipAddress: '192.168.1.110',
    },
  ], []);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'allow': return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'block': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'flag': return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'gdpr_data_processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'marketing_communications': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'payment_processing': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Compliance</h2>
          <p className="text-slate-600 dark:text-slate-400">Monitor security events and compliance status</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <div key={metric.metric} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className={`text-sm font-medium ${getMetricStatus(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{metric.metric}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Threshold: {metric.threshold}</p>
          </div>
        ))}
      </div>

      {/* Compliance Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">PCI DSS Compliance</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Compliant</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Payment card data protection standards met</p>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">GDPR Compliance</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Compliant</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Data protection and consent management active</p>
          </div>
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Security Audit</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Review Required</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Annual security audit due in 30 days</p>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Events</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {securityEvents.map((event) => (
              <tr key={event.eventId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => setSelectedEvent(event)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white capitalize">{event.eventType.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{event.userName}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{event.ipAddress}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(event.riskScore)}`}>
                    {event.riskScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getActionIcon(event.action)}
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 capitalize">{event.action}</span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GDPR Consents */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">GDPR Consents</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Consent Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Granted At
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Document Version
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {consents.map((consent) => (
              <tr key={consent.consentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{consent.guestName}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getConsentTypeColor(consent.consentType)}`}>
                    {consent.consentType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {consent.granted ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Granted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-red-600 dark:text-red-400">Revoked</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(consent.grantedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{consent.documentVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Event Details</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Event Type</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedEvent.eventType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Risk Score</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedEvent.riskScore)}`}>
                    {selectedEvent.riskScore}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">User</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Action</p>
                  <div className="flex items-center gap-2">
                    {getActionIcon(selectedEvent.action)}
                    <span className="font-medium text-slate-900 dark:text-white capitalize">{selectedEvent.action}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">IP Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Timestamp</p>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
              </div>
              {selectedEvent.details && (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Details</p>
                  <p className="text-slate-900 dark:text-white">{selectedEvent.details}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">User Agent</p>
                <p className="text-xs text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{selectedEvent.userAgent}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityComplianceDashboard;
