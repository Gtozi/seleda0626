import React, { useState } from 'react';
import { 
  Users,
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
  Badge,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  IdCard,
  Printer,
  LogIn,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const VisitorManagement: React.FC = () => {
  const [showNewVisitor, setShowNewVisitor] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const visitorTypes = [
    'Contractor',
    'Vendor',
    'Interview Candidate',
    'Delivery Personnel',
    'Government Official',
    'VIP Visitor',
    'General Visitor'
  ];

  const statuses = ['Pre-registered', 'Checked In', 'Checked Out', 'Blacklisted', 'Expired'];

  const visitors = [
    { 
      id: 'VIS-001', 
      name: 'John Smith',
      company: 'ABC Construction',
      type: 'Contractor',
      host: 'Carlos M.',
      purpose: 'Building maintenance',
      status: 'Checked In',
      checkInTime: '2024-01-15 08:30',
      checkOutTime: null,
      expectedDeparture: '2024-01-15 17:00',
      badgeNumber: 'BG-2024-001',
      blacklistStatus: 'Clear'
    },
    { 
      id: 'VIS-002', 
      name: 'Mary Johnson',
      company: 'Tech Solutions Inc',
      type: 'Vendor',
      host: 'Elena R.',
      purpose: 'Equipment delivery',
      status: 'Checked Out',
      checkInTime: '2024-01-15 09:00',
      checkOutTime: '2024-01-15 10:30',
      expectedDeparture: '2024-01-15 10:00',
      badgeNumber: 'BG-2024-002',
      blacklistStatus: 'Clear'
    },
    { 
      id: 'VIS-003', 
      name: 'Robert Davis',
      company: 'City Inspector Office',
      type: 'Government Official',
      host: 'John D.',
      purpose: 'Safety inspection',
      status: 'Checked In',
      checkInTime: '2024-01-15 10:00',
      checkOutTime: null,
      expectedDeparture: '2024-01-15 14:00',
      badgeNumber: 'BG-2024-003',
      blacklistStatus: 'Clear'
    },
    { 
      id: 'VIS-004', 
      name: 'Sarah Wilson',
      company: 'Self-employed',
      type: 'Interview Candidate',
      host: 'HR Department',
      purpose: 'Job interview',
      status: 'Checked Out',
      checkInTime: '2024-01-14 14:00',
      checkOutTime: '2024-01-14 15:30',
      expectedDeparture: '2024-01-14 15:00',
      badgeNumber: 'BG-2024-004',
      blacklistStatus: 'Clear'
    },
    { 
      id: 'VIS-005', 
      name: 'Michael Brown',
      company: 'XYZ Logistics',
      type: 'Delivery Personnel',
      host: 'Receiving',
      purpose: 'Package delivery',
      status: 'Blacklisted',
      checkInTime: '2024-01-10 11:00',
      checkOutTime: '2024-01-10 11:30',
      expectedDeparture: '2024-01-10 11:30',
      badgeNumber: 'BG-2024-005',
      blacklistStatus: 'Blacklisted - Security violation'
    },
  ];

  const filteredVisitors = visitors.filter(visitor => {
    const statusMatch = filterStatus === 'all' || visitor.status === filterStatus;
    const typeMatch = filterType === 'all' || visitor.type === filterType;
    return statusMatch && typeMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Contractor': return 'bg-blue-100 text-blue-700';
      case 'Vendor': return 'bg-green-100 text-green-700';
      case 'Interview Candidate': return 'bg-purple-100 text-purple-700';
      case 'Delivery Personnel': return 'bg-amber-100 text-amber-700';
      case 'Government Official': return 'bg-red-100 text-red-700';
      case 'VIP Visitor': return 'bg-rose-100 text-rose-700';
      case 'General Visitor': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-registered': return 'bg-slate-100 text-slate-700';
      case 'Checked In': return 'bg-green-100 text-green-700';
      case 'Checked Out': return 'bg-blue-100 text-blue-700';
      case 'Blacklisted': return 'bg-red-100 text-red-700';
      case 'Expired': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewVisitorForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Register New Visitor</h2>
        <button 
          onClick={() => setShowNewVisitor(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Visitor name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Company name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visitor Type</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select type...</option>
              {visitorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Host</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select host...</option>
              <option value="John D.">John D.</option>
              <option value="Elena R.">Elena R.</option>
              <option value="Carlos M.">Carlos M.</option>
              <option value="Sarah L.">Sarah L.</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
          <textarea 
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Purpose of visit"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Check-in</label>
            <input 
              type="datetime-local"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Departure</label>
            <input 
              type="datetime-local"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input 
              type="tel"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Contact number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Email address"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Register & Print Badge
          </button>
          <button 
            onClick={() => setShowNewVisitor(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const VisitorDetail = ({ visitor }: { visitor: any }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <IdCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{visitor.id}</h2>
            <p className="text-slate-600 dark:text-slate-400">{visitor.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedVisitor(null)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Type</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(visitor.type)}`}>
            {visitor.type}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(visitor.status)}`}>
            {visitor.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Company</p>
          <p className="font-medium text-slate-900 dark:text-white">{visitor.company}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Host</p>
          <p className="font-medium text-slate-900 dark:text-white">{visitor.host}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Badge Number</p>
          <p className="font-medium text-slate-900 dark:text-white">{visitor.badgeNumber}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Blacklist Status</p>
          <p className={`font-medium ${visitor.blacklistStatus === 'Clear' ? 'text-green-600' : 'text-red-600'}`}>
            {visitor.blacklistStatus}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Check-in Time</p>
          <p className="font-medium text-slate-900 dark:text-white">{visitor.checkInTime}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Check-out Time</p>
          <p className="font-medium text-slate-900 dark:text-white">{visitor.checkOutTime || 'Not checked out'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Purpose</p>
        <p className="text-slate-900 dark:text-white">{visitor.purpose}</p>
      </div>

      <div className="flex gap-3">
        {visitor.status === 'Checked In' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Printer className="w-4 h-4" />
          Reprint Badge
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Visitor Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Register, track, and manage visitors</p>
        </div>
        <button 
          onClick={() => setShowNewVisitor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Visitor
        </button>
      </div>

      {showNewVisitor && <NewVisitorForm />}

      {selectedVisitor ? (
        <VisitorDetail visitor={selectedVisitor} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search visitors..."
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
                  {visitorTypes.map(type => (
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
                  <LogIn className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Currently On Site</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {visitors.filter(v => v.status === 'Checked In').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Today</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{visitors.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Badge className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Badges Issued</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{visitors.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Blacklisted</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {visitors.filter(v => v.blacklistStatus !== 'Clear').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visitor List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <IdCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{visitor.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{visitor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{visitor.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(visitor.type)}`}>
                          {visitor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{visitor.host}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                          {visitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{visitor.checkInTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{visitor.badgeNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedVisitor(visitor)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          {visitor.status === 'Checked In' && (
                            <button className="p-1 text-slate-400 hover:text-green-600 transition">
                              <LogOut className="w-4 h-4" />
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

export default VisitorManagement;