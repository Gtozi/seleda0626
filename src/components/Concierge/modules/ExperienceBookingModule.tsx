/**
 * Experience & Activity Booking Module
 * Manage reservations for tours, museums, cultural experiences, etc.
 */

import { useState, useEffect } from 'react';
import { MapPin, Plus, RefreshCw, Calendar, Users, Star } from 'lucide-react';

interface ExperienceBookingModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface GuestService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
}

interface ExperienceRequest {
  id: string;
  guest_name: string;
  room_number: string;
  description: string;
  priority: string;
  status: string;
  submitted_at: string;
}

const ExperienceBookingModule: React.FC<ExperienceBookingModuleProps> = ({ onViewGuestProfile }) => {
  const [services, setServices] = useState<GuestService[]>([]);
  const [requests, setRequests] = useState<ExperienceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guest_name: '',
    room_number: '',
    experience_id: '',
    date_time: '',
    participants: 1,
    notes: ''
  });

  // Fetch available experiences
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/concierge/services?category=concierge');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
  };

  // Fetch experience booking requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?request_type=Tour Booking&department=Concierge');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching experience requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRequests();
  }, []);

  // Create new experience booking
  const handleCreateBooking = async () => {
    const selectedService = services.find(s => s.id === newBooking.experience_id);
    try {
      const response = await fetch('/api/concierge/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: newBooking.guest_name,
          room_number: newBooking.room_number,
          request_type: 'Tour Booking',
          description: `Experience: ${selectedService?.name}, Date: ${newBooking.date_time}, Participants: ${newBooking.participants}, Notes: ${newBooking.notes}`,
          priority: 'Normal',
          assigned_department: 'Concierge'
        })
      });

      if (response.ok) {
        setShowBookingForm(false);
        setNewBooking({
          guest_name: '',
          room_number: '',
          experience_id: '',
          date_time: '',
          participants: 1,
          notes: ''
        });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Experience & Activity Booking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book tours, museums, cultural experiences, and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            New Booking
          </button>
        </div>
      </div>

      {/* Available Experiences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                <Star size={16} className="text-amber-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${service.price}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'}`}>
                  {service.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Bookings</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading bookings...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No bookings found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{request.guest_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{request.room_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-md truncate">{request.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(request.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExperienceBookingModule;