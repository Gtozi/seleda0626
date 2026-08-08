/**
 * Concierge Services Module
 * Request airport transfers, tours, restaurant recommendations, tickets, shopping assistance
 */

import { useState } from 'react';
import {
  ConciergeBell,
  Plane,
  Car,
  MapPin,
  Ticket,
  ShoppingBag,
  BriefcaseMedical,
  Info,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ConciergeServicesModuleProps {
  reservationId?: string;
}

interface ServiceRequest {
  id: string;
  type: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  submittedAt: string;
  completedAt?: string;
}

const ConciergeServicesModule: React.FC<ConciergeServicesModuleProps> = ({
  reservationId
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      id: 'REQ-001',
      type: 'Airport Transfer',
      description: 'Need pickup from Bole International Airport on August 15th at 2:00 PM',
      status: 'Completed',
      submittedAt: '2026-08-10T10:00:00',
      completedAt: '2026-08-15T14:30:00'
    }
  ]);

  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [requestDescription, setRequestDescription] = useState('');

  const services = [
    { id: 'airport-transfer', name: 'Airport Transfer', icon: <Plane size={24} />, description: 'Arrange airport pickup or drop-off' },
    { id: 'taxi', name: 'Taxi Service', icon: <Car size={24} />, description: 'Book local taxi transportation' },
    { id: 'tours', name: 'Tours & Excursions', icon: <MapPin size={24} />, description: 'Local tours and sightseeing' },
    { id: 'restaurant', name: 'Restaurant Recommendations', icon: <ConciergeBell size={24} />, description: 'Local dining suggestions' },
    { id: 'tickets', name: 'Event Tickets', icon: <Ticket size={24} />, description: 'Book tickets to local events' },
    { id: 'shopping', name: 'Shopping Assistance', icon: <ShoppingBag size={24} />, description: 'Shopping recommendations and logistics' },
    { id: 'medical', name: 'Medical Assistance', icon: <BriefcaseMedical size={24} />, description: 'Medical services and pharmacies' },
    { id: 'info', name: 'Local Information', icon: <Info size={24} />, description: 'General local area information' }
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

  const handleSubmitRequest = () => {
    if (!selectedService || !requestDescription.trim()) return;

    const newRequest: ServiceRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      type: services.find(s => s.id === selectedService)?.name || selectedService,
      description: requestDescription,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setRequests([newRequest, ...requests]);
    setShowNewRequestModal(false);
    setSelectedService('');
    setRequestDescription('');
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Concierge Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal assistance for all your needs
          </p>
        </div>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Send size={16} />
          New Request
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service.id);
              setShowNewRequestModal(true);
            }}
            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition text-left"
          >
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              {service.icon}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{service.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{service.description}</p>
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
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{request.description}</p>
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">New Concierge Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Service Type
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a service...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
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
                  placeholder="Describe your request in detail..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                disabled={!selectedService || !requestDescription.trim()}
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

export default ConciergeServicesModule;
