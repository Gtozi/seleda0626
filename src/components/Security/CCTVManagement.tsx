import React, { useState } from 'react';
import { 
  Camera,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Tag,
  Video,
  Monitor,
  AlertTriangle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Radio,
  HardDrive
} from 'lucide-react';

const CCTVManagement: React.FC = () => {
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const locations = ['Main Building', 'Exterior', 'Parking', 'Recreation', 'Service Areas', 'Public Areas'];
  const statuses = ['Online', 'Offline', 'Maintenance', 'Recording', 'Standby'];

  const cameras = [
    { 
      id: 'CAM-001', 
      name: 'Lobby Entrance',
      location: 'Main Building',
      ipAddress: '192.168.1.101',
      status: 'Online',
      recording: true,
      health: 'Good',
      lastMotion: '2024-01-15 10:42',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-002', 
      name: 'Reception Desk',
      location: 'Main Building',
      ipAddress: '192.168.1.102',
      status: 'Online',
      recording: true,
      health: 'Good',
      lastMotion: '2024-01-15 10:44',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-003', 
      name: 'Elevator Bank',
      location: 'Main Building',
      ipAddress: '192.168.1.103',
      status: 'Online',
      recording: true,
      health: 'Good',
      lastMotion: '2024-01-15 10:40',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-004', 
      name: 'Parking Lot',
      location: 'Exterior',
      ipAddress: '192.168.1.104',
      status: 'Offline',
      recording: false,
      health: 'Poor',
      lastMotion: '2024-01-15 08:15',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-005', 
      name: 'Pool Area',
      location: 'Recreation',
      ipAddress: '192.168.1.105',
      status: 'Online',
      recording: true,
      health: 'Good',
      lastMotion: '2024-01-15 10:30',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-006', 
      name: 'Rear Entrance',
      location: 'Exterior',
      ipAddress: '192.168.1.106',
      status: 'Online',
      recording: true,
      health: 'Good',
      lastMotion: '2024-01-15 10:35',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
    { 
      id: 'CAM-007', 
      name: 'Loading Dock',
      location: 'Service Areas',
      ipAddress: '192.168.1.107',
      status: 'Maintenance',
      recording: false,
      health: 'Fair',
      lastMotion: '2024-01-15 07:00',
      retentionDays: 30,
      resolution: '1080p',
      model: 'AXIS M3065'
    },
  ];

  const filteredCameras = cameras.filter(camera => {
    const statusMatch = filterStatus === 'all' || camera.status === filterStatus;
    const locationMatch = filterLocation === 'all' || camera.location === filterLocation;
    return statusMatch && locationMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-700';
      case 'Offline': return 'bg-red-100 text-red-700';
      case 'Maintenance': return 'bg-amber-100 text-amber-700';
      case 'Recording': return 'bg-blue-100 text-blue-700';
      case 'Standby': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Good': return 'bg-green-100 text-green-700';
      case 'Fair': return 'bg-amber-100 text-amber-700';
      case 'Poor': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewCameraForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add New Camera</h2>
        <button 
          onClick={() => setShowNewCamera(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Camera Name</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Lobby Entrance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select location...</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IP Address</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., 192.168.1.101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., AXIS M3065"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resolution</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Retention Days</label>
            <input 
              type="number"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., 30"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Add Camera
          </button>
          <button 
            onClick={() => setShowNewCamera(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const CameraDetail = ({ camera }: { camera: any }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Camera className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{camera.id}</h2>
            <p className="text-slate-600 dark:text-slate-400">{camera.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedCamera(null)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(camera.status)}`}>
            {camera.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Health</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(camera.health)}`}>
            {camera.health}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Location</p>
          <p className="font-medium text-slate-900 dark:text-white">{camera.location}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">IP Address</p>
          <p className="font-medium text-slate-900 dark:text-white">{camera.ipAddress}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Model</p>
          <p className="font-medium text-slate-900 dark:text-white">{camera.model}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Resolution</p>
          <p className="font-medium text-slate-900 dark:text-white">{camera.resolution}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Retention</p>
          <p className="font-medium text-slate-900 dark:text-white">{camera.retentionDays} days</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Recording</p>
          <p className={`font-medium ${camera.recording ? 'text-green-600' : 'text-red-600'}`}>
            {camera.recording ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Motion Detected</p>
        <p className="text-slate-900 dark:text-white">{camera.lastMotion}</p>
      </div>

      {/* Live View Placeholder */}
      <div className="mb-6 bg-slate-900 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center">
          <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">Live View</p>
          <p className="text-slate-500 text-sm">{camera.name}</p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mb-6 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
              <SkipBack className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <Play className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
              <SkipForward className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
              <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
              <Maximize className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '35%' }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Video className="w-4 h-4" />
          Request Playback
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
          <Camera className="w-4 h-4" />
          Capture Snapshot
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CCTV Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage security cameras</p>
        </div>
        <button 
          onClick={() => setShowNewCamera(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Camera
        </button>
      </div>

      {showNewCamera && <NewCameraForm />}

      {selectedCamera ? (
        <CameraDetail camera={selectedCamera} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search cameras..."
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
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
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
                  <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Cameras</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{cameras.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Online</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {cameras.filter(c => c.status === 'Online').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Offline</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {cameras.filter(c => c.status === 'Offline').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recording</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {cameras.filter(c => c.recording).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Camera List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Camera</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recording</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Motion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredCameras.map((camera) => (
                    <tr key={camera.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{camera.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{camera.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{camera.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{camera.ipAddress}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                          {camera.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(camera.health)}`}>
                          {camera.health}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${camera.recording ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {camera.recording ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{camera.lastMotion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedCamera(camera)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Video className="w-4 h-4" />
                          </button>
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

export default CCTVManagement;