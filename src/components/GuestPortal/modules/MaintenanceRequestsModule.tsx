/**
 * Maintenance Requests Module
 * Report issues like AC, TV, lighting, plumbing, Wi-Fi, safe, electrical problems, furniture damage
 */

import { useState } from 'react';
import {
  Wrench,
  Thermometer,
  Tv,
  Lightbulb,
  Droplets,
  Wifi,
  Lock,
  Zap,
  Armchair,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  Camera
} from 'lucide-react';

interface MaintenanceRequestsModuleProps {
  reservationId?: string;
}

interface MaintenanceRequest {
  id: string;
  type: string;
  description: string;
  priority: 'Normal' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  submittedAt: string;
  completedAt?: string;
  imageUrl?: string;
}

const MaintenanceRequestsModule: React.FC<MaintenanceRequestsModuleProps> = ({
  reservationId
}) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: 'MT-001',
      type: 'Air Conditioning',
      description: 'AC not cooling properly',
      priority: 'Normal',
      status: 'Completed',
      submittedAt: '2026-07-30T14:00:00',
      completedAt: '2026-07-30T16:30:00'
    }
  ]);

  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [uploadingImage, setUploadingImage] = useState(false);

  const issueTypes = [
    { id: 'ac', name: 'Air Conditioning', icon: <Thermometer size={20} /> },
    { id: 'tv', name: 'Television', icon: <Tv size={20} /> },
    { id: 'lighting', name: 'Lighting', icon: <Lightbulb size={20} /> },
    { id: 'plumbing', name: 'Plumbing', icon: <Droplets size={20} /> },
    { id: 'wifi', name: 'Wi-Fi', icon: <Wifi size={20} /> },
    { id: 'safe', name: 'Safe', icon: <Lock size={20} /> },
    { id: 'electrical', name: 'Electrical Problems', icon: <Zap size={20} /> },
    { id: 'furniture', name: 'Furniture Damage', icon: <Armchair size={20} /> }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'Urgent'
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const handleSubmitRequest = () => {
    if (!selectedType || !requestDescription.trim()) return;

    const newRequest: MaintenanceRequest = {
      id: `MT-${String(requests.length + 1).padStart(3, '0')}`,
      type: issueTypes.find(t => t.id === selectedType)?.name || selectedType,
      description: requestDescription,
      priority,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setRequests([newRequest, ...requests]);
    setShowNewRequestModal(false);
    setSelectedType('');
    setRequestDescription('');
    setPriority('Normal');
  };

  const handleCancelRequest = (requestId: string) => {
    if (confirm('Are you sure you want to cancel this request?')) {
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'Cancelled' as const }
          : req
      ));
    }
  };

  const handleImageUpload = () => {
    setUploadingImage(true);
    // Simulate image upload
    setTimeout(() => {
      setUploadingImage(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Report maintenance issues in your room
          </p>
        </div>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Report Issue
        </button>
      </div>

      {/* Issue Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {issueTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type.id);
              setShowNewRequestModal(true);
            }}
            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition text-left"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              {type.icon}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{type.name}</h3>
          </button>
        ))}
      </div>

      {/* My Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Requests</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{request.type}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{request.description}</p>
                  {request.imageUrl && (
                    <div className="mb-2">
                      <img src={request.imageUrl} alt="Issue" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Submitted: {new Date(request.submittedAt).toLocaleString()}</span>
                    </div>
                    {request.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Completed: {new Date(request.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                {request.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Report Maintenance Issue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Issue Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an issue type...</option>
                  {issueTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <Camera size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Upload a photo of the issue
                  </p>
                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Uploading...' : 'Choose Photo'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Normal"
                      checked={priority === 'Normal'}
                      onChange={(e) => setPriority(e.target.value as 'Normal' | 'Urgent')}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Urgent"
                      checked={priority === 'Urgent'}
                      onChange={(e) => setPriority(e.target.value as 'Normal' | 'Urgent')}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Urgent</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!selectedType || !requestDescription.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequestsModule;
