import React, { useState } from 'react';
import { 
  AlertTriangle,
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
  ShieldAlert,
  Activity,
  Flame,
  Droplets,
  Wrench,
  Lock,
  Heart,
  Briefcase,
  Camera
} from 'lucide-react';

const IncidentManagement: React.FC = () => {
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const incidentCategories = [
    'Theft',
    'Assault',
    'Guest Complaint',
    'Medical Emergency',
    'Fire',
    'Water Leak',
    'Property Damage',
    'Security Breach',
    'Lost Property',
    'Workplace Accident',
    'Fraud',
    'Cybersecurity Incident'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Draft', 'Reported', 'Classified', 'Assigned', 'In Progress', 'Investigation', 'Corrective Action', 'Closed'];

  const incidents = [
    { 
      id: 'INC-001', 
      category: 'Theft', 
      description: 'Guest reported stolen laptop from room 312',
      location: 'Room 312',
      reportedBy: 'Guest - John Smith',
      reportedAt: '2024-01-15 10:30',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'John D.',
      createdAt: '2024-01-15 10:30'
    },
    { 
      id: 'INC-002', 
      category: 'Medical Emergency', 
      description: 'Guest experienced chest pain near pool area',
      location: 'Pool Area',
      reportedBy: 'Staff - Elena R.',
      reportedAt: '2024-01-15 09:15',
      priority: 'Critical',
      status: 'Closed',
      assignedTo: 'Elena R.',
      createdAt: '2024-01-15 09:15'
    },
    { 
      id: 'INC-003', 
      category: 'Property Damage', 
      description: 'Broken window in lobby due to weather',
      location: 'Lobby',
      reportedBy: 'Staff - Carlos M.',
      reportedAt: '2024-01-15 08:00',
      priority: 'Medium',
      status: 'Corrective Action',
      assignedTo: 'Carlos M.',
      createdAt: '2024-01-15 08:00'
    },
    { 
      id: 'INC-004', 
      category: 'Security Breach', 
      description: 'Unauthorized access attempt at rear entrance',
      location: 'Rear Entrance',
      reportedBy: 'System - CCTV',
      reportedAt: '2024-01-14 23:45',
      priority: 'High',
      status: 'Investigation',
      assignedTo: 'Sarah L.',
      createdAt: '2024-01-14 23:45'
    },
    { 
      id: 'INC-005', 
      category: 'Lost Property', 
      description: 'Guest left wallet in restaurant',
      location: 'Restaurant',
      reportedBy: 'Guest - Mary Johnson',
      reportedAt: '2024-01-14 18:30',
      priority: 'Low',
      status: 'Closed',
      assignedTo: 'Unassigned',
      createdAt: '2024-01-14 18:30'
    },
  ];

  const filteredIncidents = incidents.filter(incident => {
    const statusMatch = filterStatus === 'all' || incident.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || incident.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Theft': return Lock;
      case 'Medical Emergency': return Heart;
      case 'Fire': return Flame;
      case 'Water Leak': return Droplets;
      case 'Property Damage': return Wrench;
      case 'Security Breach': return ShieldAlert;
      case 'Workplace Accident': return Activity;
      case 'Fraud': return Briefcase;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-700';
      case 'Reported': return 'bg-blue-100 text-blue-700';
      case 'Classified': return 'bg-indigo-100 text-indigo-700';
      case 'Assigned': return 'bg-purple-100 text-purple-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Investigation': return 'bg-orange-100 text-orange-700';
      case 'Corrective Action': return 'bg-teal-100 text-teal-700';
      case 'Closed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewIncidentForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Report New Incident</h2>
        <button 
          onClick={() => setShowNewIncident(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Incident Category</label>
          <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
            <option value="">Select category...</option>
            {incidentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea 
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Describe the incident..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Incident location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reported By</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Who reported this"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Unassigned</option>
              <option value="John D.">John D.</option>
              <option value="Elena R.">Elena R.</option>
              <option value="Carlos M.">Carlos M.</option>
              <option value="Sarah L.">Sarah L.</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Submit Incident
          </button>
          <button 
            onClick={() => setShowNewIncident(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const IncidentDetail = ({ incident }: { incident: any }) => {
    const CategoryIcon = getCategoryIcon(incident.category);
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <CategoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{incident.id}</h2>
              <p className="text-slate-600 dark:text-slate-400">{incident.category}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedIncident(null)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Priority</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(incident.priority)}`}>
              {incident.priority}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
              {incident.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Location</p>
            <p className="font-medium text-slate-900 dark:text-white">{incident.location}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Assigned To</p>
            <p className="font-medium text-slate-900 dark:text-white">{incident.assignedTo}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Reported By</p>
            <p className="font-medium text-slate-900 dark:text-white">{incident.reportedBy}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Reported At</p>
            <p className="font-medium text-slate-900 dark:text-white">{incident.reportedAt}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Description</p>
          <p className="text-slate-900 dark:text-white">{incident.description}</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Edit className="w-4 h-4" />
            Update Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <FileText className="w-4 h-4" />
            Add Notes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Incident Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Report, track, and manage security incidents</p>
        </div>
        <button 
          onClick={() => setShowNewIncident(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Incident
        </button>
      </div>

      {showNewIncident && <NewIncidentForm />}

      {selectedIncident ? (
        <IncidentDetail incident={selectedIncident} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search incidents..."
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
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Incident</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredIncidents.map((incident) => {
                    const CategoryIcon = getCategoryIcon(incident.category);
                    return (
                      <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                              <CategoryIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{incident.id}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{incident.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{incident.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{incident.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{incident.assignedTo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{incident.reportedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedIncident(incident)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-red-600 transition">
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}
    </div>
  );
};

export default IncidentManagement;