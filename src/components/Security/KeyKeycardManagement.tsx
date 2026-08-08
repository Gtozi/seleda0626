import React, { useState } from 'react';
import { 
  Key,
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
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  QrCode,
  Smartphone
} from 'lucide-react';

const KeyKeycardManagement: React.FC = () => {
  const [showNewKey, setShowNewKey] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const keyTypes = ['Master Key', 'Department Key', 'Emergency Key', 'Spare Key', 'Guest Keycard', 'Mobile Key', 'Staff Card', 'Contractor Card'];
  const statuses = ['Issued', 'Available', 'Lost', 'Damaged', 'Inactive', 'Decommissioned'];

  const keys = [
    { 
      id: 'KEY-001', 
      type: 'Master Key',
      keyNumber: 'MK-001',
      assignedTo: 'John D.',
      department: 'Security',
      accessLevel: 'Full Property',
      status: 'Issued',
      issuedDate: '2024-01-01',
      lastAudit: '2024-01-15',
      returnDate: null,
      location: 'Security Office'
    },
    { 
      id: 'KEY-002', 
      type: 'Master Key',
      keyNumber: 'MK-002',
      assignedTo: 'Elena R.',
      department: 'Security',
      accessLevel: 'Full Property',
      status: 'Issued',
      issuedDate: '2024-01-01',
      lastAudit: '2024-01-15',
      returnDate: null,
      location: 'Security Office'
    },
    { 
      id: 'KEY-003', 
      type: 'Department Key',
      keyNumber: 'HK-001',
      assignedTo: 'Housekeeping Supervisor',
      department: 'Housekeeping',
      accessLevel: 'All Guest Rooms',
      status: 'Issued',
      issuedDate: '2024-01-01',
      lastAudit: '2024-01-15',
      returnDate: null,
      location: 'Housekeeping Office'
    },
    { 
      id: 'KEY-004', 
      type: 'Emergency Key',
      keyNumber: 'EM-001',
      assignedTo: 'Unassigned',
      department: 'General',
      accessLevel: 'All Areas',
      status: 'Available',
      issuedDate: null,
      lastAudit: '2024-01-15',
      returnDate: null,
      location: 'Security Safe'
    },
    { 
      id: 'KEY-005', 
      type: 'Guest Keycard',
      keyNumber: 'GC-2024-001',
      assignedTo: 'Guest Room 312',
      department: 'Front Desk',
      accessLevel: 'Room 312',
      status: 'Issued',
      issuedDate: '2024-01-14',
      lastAudit: '2024-01-15',
      returnDate: '2024-01-16',
      location: 'Guest Room 312'
    },
    { 
      id: 'KEY-006', 
      type: 'Staff Card',
      keyNumber: 'SC-001',
      assignedTo: 'Carlos M.',
      department: 'Maintenance',
      accessLevel: 'Maintenance Areas',
      status: 'Issued',
      issuedDate: '2024-01-01',
      lastAudit: '2024-01-15',
      returnDate: null,
      location: 'Maintenance Office'
    },
    { 
      id: 'KEY-007', 
      type: 'Guest Keycard',
      keyNumber: 'GC-2024-002',
      assignedTo: 'Lost',
      department: 'Front Desk',
      accessLevel: 'Room 205',
      status: 'Lost',
      issuedDate: '2024-01-10',
      lastAudit: '2024-01-12',
      returnDate: null,
      location: 'Unknown'
    },
  ];

  const filteredKeys = keys.filter(key => {
    const statusMatch = filterStatus === 'all' || key.status === filterStatus;
    const typeMatch = filterType === 'all' || key.type === filterType;
    return statusMatch && typeMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Master Key': return 'bg-red-100 text-red-700';
      case 'Department Key': return 'bg-blue-100 text-blue-700';
      case 'Emergency Key': return 'bg-amber-100 text-amber-700';
      case 'Spare Key': return 'bg-slate-100 text-slate-700';
      case 'Guest Keycard': return 'bg-green-100 text-green-700';
      case 'Mobile Key': return 'bg-purple-100 text-purple-700';
      case 'Staff Card': return 'bg-indigo-100 text-indigo-700';
      case 'Contractor Card': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Issued': return 'bg-blue-100 text-blue-700';
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      case 'Damaged': return 'bg-orange-100 text-orange-700';
      case 'Inactive': return 'bg-slate-100 text-slate-700';
      case 'Decommissioned': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewKeyForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add New Key/Keycard</h2>
        <button 
          onClick={() => setShowNewKey(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Type</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select type...</option>
              {keyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Number</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., MK-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select department...</option>
              <option value="Security">Security</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Front Desk">Front Desk</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Access Level</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., All Guest Rooms"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Storage Location</label>
          <input 
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="e.g., Security Safe"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Add Key
          </button>
          <button 
            onClick={() => setShowNewKey(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const KeyDetail = ({ key }: { key: any }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{key.id}</h2>
            <p className="text-slate-600 dark:text-slate-400">{key.keyNumber}</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedKey(null)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Type</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(key.type)}`}>
            {key.type}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(key.status)}`}>
            {key.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Assigned To</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.assignedTo}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Department</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.department}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Access Level</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.accessLevel}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Location</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.location}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Issued Date</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.issuedDate || 'Not issued'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Return Date</p>
          <p className="font-medium text-slate-900 dark:text-white">{key.returnDate || 'Not returned'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Audit</p>
        <p className="text-slate-900 dark:text-white">{key.lastAudit}</p>
      </div>

      <div className="flex gap-3">
        {key.status === 'Issued' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <RefreshCw className="w-4 h-4" />
            Return Key
          </button>
        )}
        {key.status === 'Available' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Unlock className="w-4 h-4" />
            Issue Key
          </button>
        )}
        {key.status === 'Lost' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            <AlertTriangle className="w-4 h-4" />
            Report Found
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Download className="w-4 h-4" />
          Audit Trail
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Key & Keycard Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage physical keys and electronic keycards</p>
        </div>
        <button 
          onClick={() => setShowNewKey(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {showNewKey && <NewKeyForm />}

      {selectedKey ? (
        <KeyDetail key={selectedKey} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search keys..."
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
                  {keyTypes.map(type => (
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Keys</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{keys.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Issued</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {keys.filter(k => k.status === 'Issued').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Lost</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {keys.filter(k => k.status === 'Lost').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Keycards</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {keys.filter(k => k.type.includes('Keycard') || k.type.includes('Card')).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Access Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{key.keyNumber}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{key.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(key.type)}`}>
                          {key.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{key.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{key.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{key.accessLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{key.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedKey(key)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          {key.status === 'Issued' && (
                            <button className="p-1 text-slate-400 hover:text-green-600 transition">
                              <RefreshCw className="w-4 h-4" />
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

export default KeyKeycardManagement;