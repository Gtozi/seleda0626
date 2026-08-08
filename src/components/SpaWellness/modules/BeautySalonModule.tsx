/**
 * Beauty Salon Module
 * Manages hair services, nail services, makeup, and stylist assignments
 */

import { useState } from 'react';
import {
  Scissors,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  MoreVertical,
  Sparkles,
  Palette
} from 'lucide-react';

interface BeautySalonModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onViewAppointment?: (appointmentId: string) => void;
}

interface SalonService {
  id: string;
  name: string;
  category: 'Hair Services' | 'Nail Services' | 'Makeup' | 'Barber Services' | 'Bridal Packages';
  duration: number;
  price: number;
  description: string;
}

interface SalonAppointment {
  id: string;
  guestName: string;
  guestId: string;
  service: string;
  stylist: string;
  stylistId: string;
  date: string;
  time: string;
  duration: number;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  station: string;
  amount: number;
}

interface Stylist {
  id: string;
  name: string;
  specializations: string[];
  rating: number;
  availability: string;
}

const BeautySalonModule: React.FC<BeautySalonModuleProps> = ({
  onViewGuestProfile,
  onViewAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'stylists'>('appointments');

  const [services, setServices] = useState<SalonService[]>([
    {
      id: 'SVC-001',
      name: 'Haircut & Styling',
      category: 'Hair Services',
      duration: 45,
      price: 75,
      description: 'Professional haircut and styling session'
    },
    {
      id: 'SVC-002',
      name: 'Hair Coloring',
      category: 'Hair Services',
      duration: 120,
      price: 150,
      description: 'Full hair coloring service with premium products'
    },
    {
      id: 'SVC-003',
      name: 'Manicure',
      category: 'Nail Services',
      duration: 30,
      price: 35,
      description: 'Classic manicure with nail shaping and polish'
    },
    {
      id: 'SVC-004',
      name: 'Pedicure',
      category: 'Nail Services',
      duration: 45,
      price: 45,
      description: 'Relaxing pedicure with foot massage and polish'
    },
    {
      id: 'SVC-005',
      name: 'Bridal Makeup',
      category: 'Makeup',
      duration: 90,
      price: 200,
      description: 'Full bridal makeup application with trial'
    },
    {
      id: 'SVC-006',
      name: 'Beard Trim & Style',
      category: 'Barber Services',
      duration: 30,
      price: 40,
      description: 'Professional beard trimming and styling'
    }
  ]);

  const [appointments, setAppointments] = useState<SalonAppointment[]>([
    {
      id: 'SAL-APT-001',
      guestName: 'Sarah Johnson',
      guestId: 'GST-001',
      service: 'Haircut & Styling',
      stylist: 'Emma Davis',
      stylistId: 'STY-001',
      date: '2026-07-31',
      time: '09:00',
      duration: 45,
      status: 'In Progress',
      station: 'Station 1',
      amount: 75
    },
    {
      id: 'SAL-APT-002',
      guestName: 'Michael Williams',
      guestId: 'GST-002',
      service: 'Beard Trim & Style',
      stylist: 'James Brown',
      stylistId: 'STY-002',
      date: '2026-07-31',
      time: '10:00',
      duration: 30,
      status: 'Confirmed',
      station: 'Station 2',
      amount: 40
    },
    {
      id: 'SAL-APT-003',
      guestName: 'Emma Davis',
      guestId: 'GST-003',
      service: 'Manicure',
      stylist: 'Lisa Park',
      stylistId: 'STY-003',
      date: '2026-07-31',
      time: '11:00',
      duration: 30,
      status: 'Confirmed',
      station: 'Station 3',
      amount: 35
    },
    {
      id: 'SAL-APT-004',
      guestName: 'Olivia Wilson',
      guestId: 'GST-004',
      service: 'Bridal Makeup',
      stylist: 'Sarah Johnson',
      stylistId: 'STY-004',
      date: '2026-07-31',
      time: '14:00',
      duration: 90,
      status: 'Confirmed',
      station: 'Station 4',
      amount: 200
    }
  ]);

  const [stylists, setStylists] = useState<Stylist[]>([
    {
      id: 'STY-001',
      name: 'Emma Davis',
      specializations: ['Haircut', 'Styling', 'Coloring'],
      rating: 4.8,
      availability: 'Mon-Sat 9AM-7PM'
    },
    {
      id: 'STY-002',
      name: 'James Brown',
      specializations: ['Barber Services', 'Beard Styling', 'Men\'s Cuts'],
      rating: 4.7,
      availability: 'Tue-Sun 10AM-6PM'
    },
    {
      id: 'STY-003',
      name: 'Lisa Park',
      specializations: ['Nail Services', 'Manicure', 'Pedicure'],
      rating: 4.9,
      availability: 'Mon-Fri 9AM-5PM'
    },
    {
      id: 'STY-004',
      name: 'Sarah Johnson',
      specializations: ['Makeup', 'Bridal Services', 'Special Occasion'],
      rating: 4.9,
      availability: 'By Appointment'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Hair Services': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Nail Services': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Makeup': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
      'Barber Services': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Bridal Packages': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'In Progress':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Beauty Salon</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage hair services, nail services, makeup, and stylist assignments
          </p>
        </div>
        <button
          onClick={() => setShowNewAppointmentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'appointments'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'services'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('stylists')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'stylists'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Stylists
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Stylist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{appointment.id}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.station}</div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onViewGuestProfile?.(appointment.guestId)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {appointment.guestName}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-900 dark:text-white">
                      {appointment.service}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {appointment.stylist}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      <div>{new Date(appointment.date).toLocaleDateString()}</div>
                      <div className="text-sm">{appointment.time}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">
                      ${appointment.amount}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      <Scissors size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{service.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(service.category)}`}>
                    {service.category}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{service.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">${service.price}</div>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stylists Tab */}
      {activeTab === 'stylists' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <User size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{stylist.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Sparkles size={14} fill="currentColor" />
                      <span>{stylist.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Specializations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stylist.specializations.map((spec, index) => (
                        <span key={index} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} />
                    <span>{stylist.availability}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Appointment Modal Placeholder */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Salon Appointment</h2>
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Salon appointment form would be implemented here with guest selection, service choice, stylist assignment, and time slot selection.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeautySalonModule;