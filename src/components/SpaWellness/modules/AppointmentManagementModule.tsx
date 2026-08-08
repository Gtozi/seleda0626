/**
 * Appointment Management Module
 * Handles appointment booking, scheduling, status management, and therapist assignment
 */

import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Phone,
  MapPin,
  CreditCard,
  ArrowRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface AppointmentManagementModuleProps {
  selectedAppointmentId?: string;
  onClearSelectedAppointmentId?: () => void;
  onViewGuestProfile?: (guestId: string) => void;
  onViewTherapist?: (therapistId: string) => void;
}

interface Appointment {
  id: string;
  guestName: string;
  guestId: string;
  treatment: string;
  therapist: string;
  therapistId: string;
  date: string;
  time: string;
  duration: number;
  status: 'Requested' | 'Confirmed' | 'Checked In' | 'In Treatment' | 'Completed' | 'Cancelled' | 'No Show' | 'Rescheduled';
  source: 'Guest Portal' | 'Front Desk' | 'Concierge' | 'Reception' | 'Telephone' | 'Walk-in' | 'Corporate Booking';
  room: string;
  amount: number;
  notes: string;
}

const AppointmentManagementModule: React.FC<AppointmentManagementModuleProps> = ({
  selectedAppointmentId,
  onClearSelectedAppointmentId,
  onViewGuestProfile,
  onViewTherapist
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APT-001',
      guestName: 'Sarah Johnson',
      guestId: 'GST-001',
      treatment: 'Swedish Massage (60 min)',
      therapist: 'Emily Chen',
      therapistId: 'THP-001',
      date: '2026-07-31',
      time: '09:00',
      duration: 60,
      status: 'In Treatment',
      source: 'Guest Portal',
      room: 'Massage Room 1',
      amount: 120,
      notes: 'Prefers light pressure'
    },
    {
      id: 'APT-002',
      guestName: 'Michael Williams',
      guestId: 'GST-002',
      treatment: 'Deep Tissue Massage (90 min)',
      therapist: 'David Miller',
      therapistId: 'THP-002',
      date: '2026-07-31',
      time: '10:30',
      duration: 90,
      status: 'Confirmed',
      source: 'Concierge',
      room: 'Massage Room 2',
      amount: 150,
      notes: 'Focus on lower back'
    },
    {
      id: 'APT-003',
      guestName: 'Emma Davis',
      guestId: 'GST-003',
      treatment: 'Hydrating Facial (45 min)',
      therapist: 'Lisa Park',
      therapistId: 'THP-003',
      date: '2026-07-31',
      time: '11:00',
      duration: 45,
      status: 'Checked In',
      source: 'Front Desk',
      room: 'Facial Room 1',
      amount: 95,
      notes: 'Sensitive skin'
    },
    {
      id: 'APT-004',
      guestName: 'James Brown',
      guestId: 'GST-004',
      treatment: 'Hot Stone Massage (75 min)',
      therapist: 'Emily Chen',
      therapistId: 'THP-001',
      date: '2026-07-31',
      time: '14:00',
      duration: 75,
      status: 'Confirmed',
      source: 'Telephone',
      room: 'Massage Room 1',
      amount: 165,
      notes: ''
    },
    {
      id: 'APT-005',
      guestName: 'Olivia Wilson',
      guestId: 'GST-005',
      treatment: 'Couples Retreat Package',
      therapist: 'David Miller & Emily Chen',
      therapistId: 'THP-002,THP-001',
      date: '2026-07-31',
      time: '15:30',
      duration: 120,
      status: 'Confirmed',
      source: 'Guest Portal',
      room: 'Couples Room',
      amount: 350,
      notes: 'Anniversary celebration'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Checked In':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'In Treatment':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      case 'No Show':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400';
      case 'Rescheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle2 size={16} />;
      case 'Checked In':
        return <CheckCircle2 size={16} />;
      case 'In Treatment':
        return <Clock size={16} />;
      case 'Completed':
        return <CheckCircle2 size={16} />;
      case 'Cancelled':
        return <XCircle size={16} />;
      case 'No Show':
        return <AlertCircle size={16} />;
      case 'Rescheduled':
        return <Calendar size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.therapist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || apt.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule and manage spa appointments
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

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="In Treatment">In Treatment</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Sources</option>
            <option value="Guest Portal">Guest Portal</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Concierge">Concierge</option>
            <option value="Reception">Reception</option>
            <option value="Telephone">Telephone</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Corporate Booking">Corporate Booking</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
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
                  Treatment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Source
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
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{appointment.id}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.room}</div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onViewGuestProfile?.(appointment.guestId)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <User size={16} />
                      <span className="font-medium">{appointment.guestName}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-900 dark:text-white">{appointment.treatment}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.duration} min</div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onViewTherapist?.(appointment.therapistId)}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {appointment.therapist}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                      <Clock size={14} />
                      <span>{appointment.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="Requested">Requested</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="In Treatment">In Treatment</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      {appointment.source === 'Guest Portal' && <Phone size={14} />}
                      {appointment.source === 'Concierge' && <MapPin size={14} />}
                      {appointment.source === 'Front Desk' && <User size={14} />}
                      <span>{appointment.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">
                    ${appointment.amount}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
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

      {/* New Appointment Modal Placeholder */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Appointment</h2>
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Appointment booking form would be implemented here with guest selection, treatment choice, therapist assignment, and time slot selection.
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

export default AppointmentManagementModule;