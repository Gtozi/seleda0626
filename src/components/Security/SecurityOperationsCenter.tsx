import React, { useState } from 'react';
import { 
  Monitor,
  AlertTriangle,
  MapPin,
  Camera,
  Radio,
  Users,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Bell,
  ShieldAlert,
  UserCheck,
  Video,
  Lock,
  FileText,
  RefreshCw
} from 'lucide-react';

const SecurityOperationsCenter: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'incidents' | 'patrols' | 'cctv' | 'alarms' | 'access' | 'emergency' | 'staff'>('incidents');

  const incidentQueue = [
    { id: 'INC-001', type: 'Unauthorized Access', location: 'Rear Entrance', priority: 'High', status: 'Active', time: '10:45 AM', assignedTo: 'John D.' },
    { id: 'INC-002', type: 'Medical Emergency', location: 'Pool Area', priority: 'Critical', status: 'In Progress', time: '09:30 AM', assignedTo: 'Elena R.' },
    { id: 'INC-003', type: 'Suspicious Activity', location: 'Parking Lot', priority: 'Medium', status: 'Pending', time: '08:15 AM', assignedTo: 'Unassigned' },
    { id: 'INC-004', type: 'Property Damage', location: 'Lobby', priority: 'Low', status: 'Active', time: '07:00 AM', assignedTo: 'Carlos M.' },
    { id: 'INC-005', type: 'Fire Alarm', location: 'Kitchen', priority: 'Critical', status: 'Resolved', time: '06:30 AM', assignedTo: 'Sarah L.' },
  ];

  const activePatrols = [
    { id: 'PAT-001', officer: 'John D.', route: 'Guest Floors', status: 'In Progress', progress: 75, lastCheckpoint: 'Floor 3', startTime: '10:00 AM' },
    { id: 'PAT-002', officer: 'Elena R.', route: 'Public Areas', status: 'In Progress', progress: 45, lastCheckpoint: 'Lobby', startTime: '10:15 AM' },
    { id: 'PAT-003', officer: 'Carlos M.', route: 'Perimeter', status: 'Completed', progress: 100, lastCheckpoint: 'Gate', startTime: '09:00 AM' },
    { id: 'PAT-004', officer: 'Sarah L.', route: 'Parking', status: 'In Progress', progress: 60, lastCheckpoint: 'Section B', startTime: '10:30 AM' },
  ];

  const cctvStatus = [
    { id: 'CAM-001', name: 'Lobby Entrance', location: 'Main Building', status: 'Online', recording: true, lastMotion: '10:42 AM' },
    { id: 'CAM-002', name: 'Reception Desk', location: 'Main Building', status: 'Online', recording: true, lastMotion: '10:44 AM' },
    { id: 'CAM-003', name: 'Elevator Bank', location: 'Main Building', status: 'Online', recording: true, lastMotion: '10:40 AM' },
    { id: 'CAM-004', name: 'Parking Lot', location: 'Exterior', status: 'Offline', recording: false, lastMotion: '08:15 AM' },
    { id: 'CAM-005', name: 'Pool Area', location: 'Recreation', status: 'Online', recording: true, lastMotion: '10:30 AM' },
    { id: 'CAM-006', name: 'Rear Entrance', location: 'Exterior', status: 'Online', recording: true, lastMotion: '10:35 AM' },
  ];

  const alarmStatus = [
    { id: 'ALM-001', type: 'Fire Alarm', location: 'Kitchen', status: 'Active', time: '09:30 AM', acknowledged: false },
    { id: 'ALM-002', type: 'Door Alarm', location: 'Server Room', status: 'Cleared', time: '08:15 AM', acknowledged: true },
    { id: 'ALM-003', type: 'Motion Alarm', location: 'Storage Room', status: 'Active', time: '07:00 AM', acknowledged: false },
    { id: 'ALM-004', type: 'Panic Alarm', location: 'Room 204', status: 'Resolved', time: '06:30 AM', acknowledged: true },
  ];

  const accessControlEvents = [
    { id: 'ACC-001', type: 'Access Denied', user: 'Unknown Card', location: 'Rear Entrance', time: '10:45 AM', status: 'Flagged' },
    { id: 'ACC-002', type: 'Access Granted', user: 'John D.', location: 'Main Entrance', time: '10:40 AM', status: 'Normal' },
    { id: 'ACC-003', type: 'Access Denied', user: 'Expired Card', location: 'Server Room', time: '10:35 AM', status: 'Flagged' },
    { id: 'ACC-004', type: 'Access Granted', user: 'Elena R.', location: 'Office Area', time: '10:30 AM', status: 'Normal' },
    { id: 'ACC-005', type: 'After Hours Access', user: 'Carlos M.', location: 'Maintenance', time: '10:25 AM', status: 'Warning' },
  ];

  const emergencyNotifications = [
    { id: 'EMG-001', type: 'Fire Emergency', location: 'Kitchen', status: 'Active', priority: 'Critical', time: '09:30 AM' },
    { id: 'EMG-002', type: 'Medical Emergency', location: 'Pool Area', status: 'In Progress', priority: 'High', time: '09:30 AM' },
    { id: 'EMG-003', type: 'Evacuation Drill', location: 'All Areas', status: 'Scheduled', priority: 'Medium', time: '2:00 PM' },
  ];

  const staffAvailability = [
    { id: 'STF-001', name: 'John D.', role: 'Security Officer', status: 'On Duty', location: 'Guest Floors', shift: 'Day', radio: 'CH-1' },
    { id: 'STF-002', name: 'Elena R.', role: 'Security Officer', status: 'On Duty', location: 'Pool Area', shift: 'Day', radio: 'CH-2' },
    { id: 'STF-003', name: 'Carlos M.', role: 'Security Supervisor', status: 'On Duty', location: 'Security Office', shift: 'Day', radio: 'CH-1' },
    { id: 'STF-004', name: 'Sarah L.', role: 'Security Officer', status: 'On Break', location: 'Break Room', shift: 'Day', radio: 'CH-3' },
    { id: 'STF-005', name: 'Mike T.', role: 'Security Officer', status: 'Off Duty', location: 'Off Site', shift: 'Night', radio: 'Off' },
  ];

  const tabs = [
    { id: 'incidents', label: 'Incident Queue', icon: AlertTriangle, count: incidentQueue.length },
    { id: 'patrols', label: 'Active Patrols', icon: MapPin, count: activePatrols.filter(p => p.status === 'In Progress').length },
    { id: 'cctv', label: 'CCTV Status', icon: Camera, count: cctvStatus.filter(c => c.status === 'Online').length },
    { id: 'alarms', label: 'Alarm Status', icon: Radio, count: alarmStatus.filter(a => a.status === 'Active').length },
    { id: 'access', label: 'Access Events', icon: Lock, count: accessControlEvents.filter(a => a.status === 'Flagged').length },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert, count: emergencyNotifications.filter(e => e.status === 'Active').length },
    { id: 'staff', label: 'Staff Availability', icon: Users, count: staffAvailability.filter(s => s.status === 'On Duty').length },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'incidents':
        return (
          <div className="space-y-4">
            {incidentQueue.map((incident) => (
              <div key={incident.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{incident.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                      incident.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                      incident.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{incident.priority}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      incident.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                      incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{incident.status}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{incident.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Type</p>
                    <p className="font-medium text-slate-900 dark:text-white">{incident.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{incident.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Assigned To</p>
                    <p className="font-medium text-slate-900 dark:text-white">{incident.assignedTo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'patrols':
        return (
          <div className="space-y-4">
            {activePatrols.map((patrol) => (
              <div key={patrol.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{patrol.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      patrol.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      patrol.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{patrol.status}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{patrol.startTime}</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-medium text-slate-900 dark:text-white">{patrol.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${patrol.progress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Officer</p>
                    <p className="font-medium text-slate-900 dark:text-white">{patrol.officer}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Route</p>
                    <p className="font-medium text-slate-900 dark:text-white">{patrol.route}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Last Checkpoint</p>
                    <p className="font-medium text-slate-900 dark:text-white">{patrol.lastCheckpoint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'cctv':
        return (
          <div className="space-y-4">
            {cctvStatus.map((camera) => (
              <div key={camera.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Camera className={`w-5 h-5 ${camera.status === 'Online' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-semibold text-slate-900 dark:text-white">{camera.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      camera.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{camera.status}</span>
                    {camera.recording && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Recording</span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{camera.lastMotion}</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-400">Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">{camera.location}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'alarms':
        return (
          <div className="space-y-4">
            {alarmStatus.map((alarm) => (
              <div key={alarm.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-5 h-5 ${alarm.status === 'Active' ? 'text-red-500' : 'text-green-500'}`} />
                    <span className="font-semibold text-slate-900 dark:text-white">{alarm.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alarm.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>{alarm.status}</span>
                    {!alarm.acknowledged && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">Not Acknowledged</span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{alarm.time}</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-400">Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">{alarm.location}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'access':
        return (
          <div className="space-y-4">
            {accessControlEvents.map((event) => (
              <div key={event.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className={`w-5 h-5 ${
                      event.status === 'Flagged' ? 'text-red-500' :
                      event.status === 'Warning' ? 'text-amber-500' : 'text-green-500'
                    }`} />
                    <span className="font-semibold text-slate-900 dark:text-white">{event.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'Flagged' ? 'bg-red-100 text-red-700' :
                      event.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>{event.status}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{event.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">User</p>
                    <p className="font-medium text-slate-900 dark:text-white">{event.user}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-4">
            {emergencyNotifications.map((emergency) => (
              <div key={emergency.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${
                      emergency.priority === 'Critical' ? 'text-red-500' :
                      emergency.priority === 'High' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <span className="font-semibold text-slate-900 dark:text-white">{emergency.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emergency.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      emergency.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{emergency.priority}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emergency.status === 'Active' ? 'bg-red-100 text-red-700' :
                      emergency.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{emergency.status}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{emergency.time}</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-400">Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">{emergency.location}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-4">
            {staffAvailability.map((staff) => (
              <div key={staff.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-5 h-5 ${
                      staff.status === 'On Duty' ? 'text-green-500' :
                      staff.status === 'On Break' ? 'text-amber-500' : 'text-slate-400'
                    }`} />
                    <span className="font-semibold text-slate-900 dark:text-white">{staff.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      staff.status === 'On Duty' ? 'bg-green-100 text-green-700' :
                      staff.status === 'On Break' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{staff.status}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{staff.shift}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Role</p>
                    <p className="font-medium text-slate-900 dark:text-white">{staff.role}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{staff.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Radio Channel</p>
                    <p className="font-medium text-slate-900 dark:text-white">{staff.radio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Operations Center</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time security monitoring and dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            New Incident
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedTab === tab.id ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default SecurityOperationsCenter;