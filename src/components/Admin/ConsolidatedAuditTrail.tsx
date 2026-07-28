import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  MapPin,
  User,
  ChevronDown,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  organization_id: string;
  property_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  action: string;
  changes: any;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  organization_name?: string;
  property_name?: string;
}

interface Organization {
  id: string;
  org_name: string;
  org_code: string;
}

interface Property {
  id: string;
  property_name: string;
  property_code: string;
  organization_id: string;
}

export default function ConsolidatedAuditTrail() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedOrg) params.append('organization_id', selectedOrg);
      if (selectedProperty) params.append('property_id', selectedProperty);
      if (selectedEntityType) params.append('entity_type', selectedEntityType);
      if (selectedAction) params.append('action', selectedAction);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAuditLogs(), fetchOrganizations(), fetchProperties()]);
      setLoading(false);
    };
    loadData();
  }, [selectedOrg, selectedProperty, selectedEntityType, selectedAction, dateRange]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedOrg) params.append('organization_id', selectedOrg);
      if (selectedProperty) params.append('property_id', selectedProperty);
      if (selectedEntityType) params.append('entity_type', selectedEntityType);
      if (selectedAction) params.append('action', selectedAction);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);

      const res = await fetch(`/api/admin/audit-logs/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const filteredLogs = auditLogs.filter(log =>
    (log.event_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const entityTypes = [...Array.from(new Set(auditLogs.map(l => l.entity_type)))];
  const actions = [...Array.from(new Set(auditLogs.map(l => l.action)))];

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-100 text-emerald-700';
      case 'update': return 'bg-amber-100 text-amber-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'view': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Consolidated Audit Trail</h2>
          <p className="text-sm text-slate-500">Unified audit logging across organizations and properties</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Events</p>
              <p className="text-2xl font-bold text-slate-900">{auditLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Organizations</p>
              <p className="text-2xl font-bold text-slate-900">{organizations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Properties</p>
              <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(auditLogs.map(l => l.user_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={fetchAuditLogs}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.org_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Property
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                disabled={!selectedOrg}
              >
                <option value="">All Properties</option>
                {properties
                  .filter(p => !selectedOrg || p.organization_id === selectedOrg)
                  .map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.property_name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Entity Type
              </label>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{log.user_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{log.user_email || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div>
                        <p className="font-medium">{log.entity_type}</p>
                        <p className="text-xs text-slate-500">{log.event_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {log.organization_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {log.property_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetail(log)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Audit Log Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-slate-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Action
                  </label>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    User
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.user_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{selectedLog.user_email || ''}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    IP Address
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.ip_address || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Entity Type
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Event Type
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.event_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Organization
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.organization_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Property
                  </label>
                  <p className="text-sm text-slate-900">{selectedLog.property_name || '-'}</p>
                </div>
              </div>
              
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Changes
                  </label>
                  <pre className="bg-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Metadata
                  </label>
                  <pre className="bg-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    User Agent
                  </label>
                  <p className="text-sm text-slate-600 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
