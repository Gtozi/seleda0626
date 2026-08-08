/**
 * Duty Manager Workspace
 * Shift-based operational management
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Book,
  AlertTriangle,
  Users,
  Wrench,
  Shield,
  ClipboardCheck,
  LogOut,
  LogIn,
  Plus,
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Edit,
  Save,
  X,
  FileText,
  CheckSquare,
  Flame,
  MapPin
} from 'lucide-react';

interface ShiftLogEntry {
  id: string;
  timestamp: string;
  category: string;
  description: string;
  author: string;
  priority: 'low' | 'medium' | 'high';
}

interface GuestIssue {
  id: string;
  roomNumber: string;
  guestName: string;
  issue: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  reportedAt: string;
  assignedTo?: string;
}

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  reportedAt: string;
  reportedBy: string;
}

interface WalkthroughItem {
  id: string;
  area: string;
  item: string;
  status: 'pending' | 'completed' | 'issue';
  notes?: string;
  completedAt?: string;
}

interface Handover {
  id: string;
  fromManager: string;
  toManager: string;
  shiftDate: string;
  shiftPeriod: string;
  summary: string;
  openItems: string[];
  acknowledgedAt?: string;
  createdAt: string;
}

const DutyManagerWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logbook' | 'issues' | 'incidents' | 'walkthrough' | 'handover'>('logbook');
  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [shiftLogs, setShiftLogs] = useState<ShiftLogEntry[]>([]);
  const [guestIssues, setGuestIssues] = useState<GuestIssue[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [walkthroughItems, setWalkthroughItems] = useState<WalkthroughItem[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [newLogEntry, setNewLogEntry] = useState({ category: 'General', description: '', priority: 'medium' as const });
  const [isEditing, setIsEditing] = useState(false);

  const mockShiftLogs: ShiftLogEntry[] = [
    {
      id: '1',
      timestamp: '08:00',
      category: 'Shift Start',
      description: 'Morning shift commenced. All departments reporting normal operations.',
      author: 'John Smith',
      priority: 'low'
    },
    {
      id: '2',
      timestamp: '09:15',
      category: 'VIP Arrival',
      description: 'VVIP Mr. Chen arrived in Presidential Suite. Butler service activated.',
      author: 'John Smith',
      priority: 'high'
    },
    {
      id: '3',
      timestamp: '10:30',
      category: 'Maintenance',
      description: 'HVAC issue reported on Floor 3. Engineering team dispatched.',
      author: 'John Smith',
      priority: 'medium'
    },
    {
      id: '4',
      timestamp: '11:45',
      category: 'Guest Issue',
      description: 'Guest in Room 205 reported noise from construction. Complimentary breakfast offered.',
      author: 'John Smith',
      priority: 'medium'
    }
  ];

  const mockGuestIssues: GuestIssue[] = [
    {
      id: '1',
      roomNumber: '305',
      guestName: 'Ms. Johnson',
      issue: 'Water leak in bathroom',
      status: 'in-progress',
      priority: 'high',
      reportedAt: '10:30',
      assignedTo: 'Engineering'
    },
    {
      id: '2',
      roomNumber: '412',
      guestName: 'Mr. Williams',
      issue: 'AC not cooling properly',
      status: 'open',
      priority: 'medium',
      reportedAt: '11:15'
    },
    {
      id: '3',
      roomNumber: '218',
      guestName: 'Dr. Brown',
      issue: 'Request for extra pillows',
      status: 'resolved',
      priority: 'low',
      reportedAt: '09:45',
      assignedTo: 'Housekeeping'
    }
  ];

  const mockIncidents: Incident[] = [
    {
      id: '1',
      type: 'Medical Emergency',
      description: 'Guest reported chest pain in lobby area. Paramedics called.',
      location: 'Main Lobby',
      severity: 'major',
      status: 'resolved',
      reportedAt: '09:30',
      reportedBy: 'Front Desk'
    },
    {
      id: '2',
      type: 'Equipment Failure',
      description: 'Elevator B stopped between floors. Guests safely evacuated.',
      location: 'Elevator B - North Wing',
      severity: 'moderate',
      status: 'investigating',
      reportedAt: '10:45',
      reportedBy: 'Security'
    }
  ];

  const mockWalkthroughItems: WalkthroughItem[] = [
    { id: '1', area: 'Lobby', item: 'Front desk cleanliness', status: 'completed' },
    { id: '2', area: 'Lobby', item: 'Entrance doors condition', status: 'completed' },
    { id: '3', area: 'Lobby', item: 'Seating area arrangement', status: 'completed' },
    { id: '4', area: 'Restaurant', item: 'Buffet setup readiness', status: 'pending' },
    { id: '5', area: 'Restaurant', item: 'Kitchen cleanliness', status: 'pending' },
    { id: '6', area: 'Pool Area', item: 'Water quality check', status: 'completed' },
    { id: '7', area: 'Pool Area', item: 'Safety equipment inspection', status: 'issue', notes: 'First aid kit needs restocking' },
    { id: '8', area: 'Parking', item: 'Lighting check', status: 'pending' },
    { id: '9', area: 'Parking', item: 'Security patrol log', status: 'completed' }
  ];

  const mockHandovers: Handover[] = [
    {
      id: '1',
      fromManager: 'Night Manager - Robert Taylor',
      toManager: 'Morning Manager - John Smith',
      shiftDate: '2026-07-31',
      shiftPeriod: 'Night to Morning',
      summary: 'Quiet night. One medical emergency resolved. All systems operational.',
      openItems: ['Room 305 water leak follow-up', 'Elevator B inspection'],
      acknowledgedAt: '08:05',
      createdAt: '07:55'
    }
  ];

  useEffect(() => {
    loadShiftData();
  }, [selectedShift]);

  const loadShiftData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setShiftLogs(mockShiftLogs);
    setGuestIssues(mockGuestIssues);
    setIncidents(mockIncidents);
    setWalkthroughItems(mockWalkthroughItems);
    setHandovers(mockHandovers);
  };

  const addLogEntry = () => {
    if (!newLogEntry.description) return;
    
    const entry: ShiftLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category: newLogEntry.category,
      description: newLogEntry.description,
      author: 'Current User',
      priority: newLogEntry.priority
    };

    setShiftLogs([...shiftLogs, entry]);
    setNewLogEntry({ category: 'General', description: '', priority: 'medium' });
  };

  const updateWalkthroughItem = (itemId: string, status: WalkthroughItem['status'], notes?: string) => {
    setWalkthroughItems(prev => prev.map(item =>
      item.id === itemId 
        ? { 
            ...item, 
            status, 
            notes: notes || item.notes,
            completedAt: status === 'completed' ? new Date().toISOString() : item.completedAt
          } 
        : item
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
      case 'investigating':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'open':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'issue':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'pending':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  const tabs = [
    { id: 'logbook', label: 'Shift Logbook', icon: Book },
    { id: 'issues', label: 'Guest Issues', icon: Users },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'walkthrough', label: 'Walkthrough', icon: ClipboardCheck },
    { id: 'handover', label: 'Shift Handover', icon: LogOut }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase size={28} />
            Duty Manager Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Shift-based operational management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="Morning">Morning Shift</option>
            <option value="Afternoon">Afternoon Shift</option>
            <option value="Evening">Evening Shift</option>
            <option value="Night">Night Shift</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Clock size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {activeTab === 'logbook' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Shift Logbook</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
              >
                {isEditing ? <Save size={16} /> : <Edit size={16} />}
                {isEditing ? 'Save' : 'Add Entry'}
              </button>
            </div>

            {isEditing && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={newLogEntry.category}
                    onChange={(e) => setNewLogEntry({ ...newLogEntry, category: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="General">General</option>
                    <option value="VIP Arrival">VIP Arrival</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Guest Issue">Guest Issue</option>
                    <option value="Staffing">Staffing</option>
                    <option value="Security">Security</option>
                  </select>
                  
                  <select
                    value={newLogEntry.priority}
                    onChange={(e) => setNewLogEntry({ ...newLogEntry, priority: e.target.value as any })}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  
                  <button
                    onClick={addLogEntry}
                    disabled={!newLogEntry.description}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
                  >
                    Add Entry
                  </button>
                </div>
                
                <textarea
                  placeholder="Enter log entry description..."
                  value={newLogEntry.description}
                  onChange={(e) => setNewLogEntry({ ...newLogEntry, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2">
              {shiftLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-500">{log.timestamp}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(log.priority)}`}>
                          {log.priority}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-slate-900 dark:text-white mt-1">{log.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        By {log.author}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Guest Issues</h3>
            <div className="space-y-2">
              {guestIssues.map((issue) => (
                <div key={issue.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-900 dark:text-white">
                          Room {issue.roomNumber}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {issue.guestName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-slate-900 dark:text-white mt-1">{issue.issue}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        <span>Reported: {issue.reportedAt}</span>
                        {issue.assignedTo && <span>Assigned to: {issue.assignedTo}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Incident Reports</h3>
            <div className="space-y-2">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Flame size={18} className="text-rose-600 dark:text-rose-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {incident.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-slate-900 dark:text-white mt-1">{incident.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {incident.location}
                        </span>
                        <span>Reported by: {incident.reportedBy}</span>
                        <span>{incident.reportedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'walkthrough' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Walkthrough Checklist</h3>
            <div className="space-y-2">
              {walkthroughItems.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 uppercase">
                          {item.area}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.item}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateWalkthroughItem(item.id, 'completed')}
                        className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded transition-colors"
                        title="Mark Complete"
                      >
                        <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </button>
                      <button
                        onClick={() => updateWalkthroughItem(item.id, 'issue', 'Issue noted')}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors"
                        title="Mark Issue"
                      >
                        <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'handover' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Shift Handover</h3>
              <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2">
                <Plus size={16} />
                Create Handover
              </button>
            </div>
            
            <div className="space-y-2">
              {handovers.map((handover) => (
                <div key={handover.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <LogOut size={18} className="text-slate-500" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {handover.fromManager}
                        </span>
                        <ChevronRight size={16} className="text-slate-400" />
                        <LogIn size={18} className="text-slate-500" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {handover.toManager}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {handover.shiftPeriod} - {handover.shiftDate}
                      </p>
                      <p className="text-slate-900 dark:text-white mt-2">{handover.summary}</p>
                      
                      {handover.openItems.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Open Items:
                          </p>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                            {handover.openItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        <span>Created: {handover.createdAt}</span>
                        {handover.acknowledgedAt && (
                          <span>Acknowledged: {handover.acknowledgedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DutyManagerWorkspace;