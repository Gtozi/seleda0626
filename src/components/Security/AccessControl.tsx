import React, { useState } from 'react';
import { 
  Lock,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Tag,
  Shield,
  DoorOpen,
  Users,
  Building2,
  Key,
  AlertTriangle,
  Clock as ClockIcon,
  Ban,
  CheckCircle
} from 'lucide-react';

const AccessControl: React.FC = () => {
  const [showNewAccess, setShowNewAccess] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const accessTypes = ['Employee Access', 'Guest Access', 'Contractor Access', 'Temporary Access', 'Emergency Access'];
  const statuses = ['Active', 'Inactive', 'Suspended', 'Expired', 'Revoked'];

  const accessRecords = [
    { 
      id: 'ACC-001', 
      userId: 'EMP-001',
      userName: 'John D.',
      type: 'Employee Access',
      role: 'Security Officer',
      zones: ['All Public Areas', 'Guest Floors', 'Security Office'],
      doors: 15,
      status: 'Active',
      validFrom: '2024-01-01',
      validUntil: '2025-01-01',
      lastAccess: '2024-01-15 10:30',
      accessCount: 234
    },
    { 
      id: 'ACC-002', 
      userId: 'EMP-002',
      userName: 'Elena R.',
      type: 'Employee Access',
      role: 'Security Officer',
      zones: ['All Public Areas', 'Pool Area', 'Garden'],
      doors: 12,
      status: 'Active',
      validFrom: '2024-01-01',
      validUntil: '2025-01-01',
      lastAccess: '2024-01-15 09:45',
      accessCount: 189
    },
    { 
      id: 'ACC-003', 
      userId: 'CON-001',
      userName: 'ABC Construction',
      type: 'Contractor Access',
      role: 'Contractor',
      zones: ['Maintenance Area', 'Boiler Room', 'Loading Dock'],
      doors: 5,
      status: 'Active',
      validFrom: '2024-01-10',
      validUntil: '2024-01-20',
      lastAccess: '2024-01-15 08:00',
      accessCount: 45
    },
    { 
      id: 'ACC-004', 
      userId: 'GST-001',
      userName: 'Guest Room 312',
      type: 'Guest Access',
      role: 'Guest',
      zones: ['Guest Room 312', 'Guest Floor 3', 'Public Areas'],
      doors: 3,
      status: 'Active',
      validFrom: '2024-01-14',
      validUntil: '2024-01-16',
      lastAccess: '2024-01-15 11:00',
      accessCount: 12
    },
    { 
      id: 'ACC-005', 
      userId: 'EMP-003',
      userName: 'Former Employee',
      type: 'Employee Access',
      role: 'Housekeeping',
      zones: ['All Guest Floors', 'Housekeeping Storage'],
      doors: 20,
      status: 'Revoked',
      validFrom: '2023-01-01',
      validUntil: '2024-01-01',
      lastAccess: '2024-01-01 17:00',
      accessCount: 1520
    },
  ];

  const filteredAccess = accessRecords.filter(record => {
    const statusMatch = filterStatus === 'all' || record.status === filterStatus;
    const typeMatch = filterType === 'all' || record.type === filterType;
    return statusMatch && typeMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Employee Access': return 'bg-blue-100 text-blue-700';
      case 'Guest Access': return 'bg-green-100 text-green-700';
      case 'Contractor Access': return 'bg-amber-100 text-amber-700';
      case 'Temporary Access': return 'bg-purple-100 text-purple-700';
      case 'Emergency Access': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-slate-100 text-slate-700';
      case 'Suspended': return 'bg-amber-100 text-amber-700';
      case 'Expired': return 'bg-orange-100 text-orange-700';
      case 'Revoked': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewAccessForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Grant New Access</h2>
        <button 
          onClick={() => setShowNewAccess(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select user...</option>
              <option value="EMP-001">John D. - Security Officer</option>
              <option value="EMP-002">Elena R. - Security Officer</option>
              <option value="EMP-003">Carlos M. - Security Supervisor</option>
              <option value="CON-001">ABC Construction - Contractor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Access Type</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select type...</option>
              {accessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Access Zones</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['All Public Areas', 'Guest Floors', 'Security Office', 'Maintenance Area', 'Server Room', 'Loading Dock', 'Pool Area', 'Garden'].map(zone => (
              <label key={zone} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{zone}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valid From</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valid Until</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Access Schedule</label>
          <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
            <option value="24-7">24/7 Access</option>
            <option value="business">Business Hours Only</option>
            <option value="dayshift">Day Shift (6AM-6PM)</option>
            <option value="nightshift">Night Shift (6PM-6AM)</option>
            <option value="custom">Custom Schedule</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Grant Access
          </button>
          <button 
            onClick={() => setShowNewAccess(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AccessDetail = ({ record }: { record: any }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{record.id}</h2>
            <p className="text-slate-600 dark:text-slate-400">{record.userName}</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedAccess(null)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Type</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(record.type)}`}>
            {record.type}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
            {record.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Role</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.role}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">User ID</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.userId}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Valid From</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.validFrom}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Valid Until</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.validUntil}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Doors Accessible</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.doors}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Access Count</p>
          <p className="font-medium text-slate-900 dark:text-white">{record.accessCount}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Access Zones</p>
        <div className="flex flex-wrap gap-2">
          {record.zones.map((zone: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
              {zone}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Access</p>
        <p className="text-slate-900 dark:text-white">{record.lastAccess}</p>
      </div>

      <div className="flex gap-3">
        {record.status === 'Active' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            <Ban className="w-4 h-4" />
            Suspend
          </button>
        )}
        {record.status === 'Active' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            <XCircle className="w-4 h-4" />
            Revoke
          </button>
        )}
        {(record.status === 'Suspended' || record.status === 'Revoked') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <CheckCircle className="w-4 h-4" />
            Reactivate
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Edit className="w-4 h-4" />
          Modify
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Access Control</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage access permissions and door controls</p>
        </div>
        <button 
          onClick={() => setShowNewAccess(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Grant Access
        </button>
      </div>

      {showNewAccess && <NewAccessForm />}

      {selectedAccess ? (
        <AccessDetail record={selectedAccess} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search access records..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {accessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Access</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accessRecords.filter(r => r.status === 'Active').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DoorOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Doors</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">45</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recent Violations</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{accessRecords.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Access List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Zones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Access</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAccess.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{record.userName}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{record.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{record.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{record.zones.length} zones</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{record.validUntil}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{record.lastAccess}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedAccess(record)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          {record.status === 'Active' && (
                            <button className="p-1 text-slate-400 hover:text-amber-600 transition">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessControl;