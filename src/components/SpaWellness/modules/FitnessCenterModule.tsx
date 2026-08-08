/**
 * Fitness Center Module
 * Manages gym access, personal trainers, group classes, and equipment booking
 */

import { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  MoreVertical,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';

interface FitnessCenterModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface FitnessClass {
  id: string;
  name: string;
  type: 'Yoga' | 'Pilates' | 'Spin' | 'HIIT' | 'Strength Training' | 'Zumba' | 'CrossFit';
  instructor: string;
  schedule: string;
  duration: number;
  capacity: number;
  enrolled: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  location: string;
}

interface PersonalTrainer {
  id: string;
  name: string;
  specializations: string[];
  availability: string;
  rating: number;
  hourlyRate: number;
}

interface EquipmentBooking {
  id: string;
  equipment: string;
  guestId: string;
  guestName: string;
  date: string;
  time: string;
  duration: number;
  status: 'Confirmed' | 'In Use' | 'Completed' | 'Cancelled';
}

const FitnessCenterModule: React.FC<FitnessCenterModuleProps> = ({
  onViewGuestProfile
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'trainers' | 'equipment'>('classes');

  const [classes, setClasses] = useState<FitnessClass[]>([
    {
      id: 'CLS-001',
      name: 'Morning Yoga Flow',
      type: 'Yoga',
      instructor: 'Michael Brown',
      schedule: 'Mon, Wed, Fri 7:00 AM',
      duration: 60,
      capacity: 15,
      enrolled: 12,
      status: 'Scheduled',
      location: 'Yoga Studio'
    },
    {
      id: 'CLS-002',
      name: 'High-Intensity Interval Training',
      type: 'HIIT',
      instructor: 'Sarah Johnson',
      schedule: 'Tue, Thu 6:00 PM',
      duration: 45,
      capacity: 20,
      enrolled: 18,
      status: 'Scheduled',
      location: 'Main Gym'
    },
    {
      id: 'CLS-003',
      name: 'Spin Class',
      type: 'Spin',
      instructor: 'David Miller',
      schedule: 'Mon, Wed, Fri 5:30 PM',
      duration: 45,
      capacity: 12,
      enrolled: 10,
      status: 'In Progress',
      location: 'Spin Studio'
    },
    {
      id: 'CLS-004',
      name: 'Pilates Core',
      type: 'Pilates',
      instructor: 'Emily Chen',
      schedule: 'Tue, Thu 9:00 AM',
      duration: 50,
      capacity: 10,
      enrolled: 8,
      status: 'Scheduled',
      location: 'Pilates Studio'
    }
  ]);

  const [trainers, setTrainers] = useState<PersonalTrainer[]>([
    {
      id: 'TRN-001',
      name: 'Michael Brown',
      specializations: ['Strength Training', 'Yoga', 'Nutrition'],
      availability: 'Mon-Fri 6AM-8PM',
      rating: 4.9,
      hourlyRate: 85
    },
    {
      id: 'TRN-002',
      name: 'Sarah Johnson',
      specializations: ['HIIT', 'Cardio', 'Weight Loss'],
      availability: 'Mon-Sat 7AM-7PM',
      rating: 4.8,
      hourlyRate: 75
    },
    {
      id: 'TRN-003',
      name: 'David Miller',
      specializations: ['Endurance', 'Spin', 'Triathlon Training'],
      availability: 'Tue-Sun 5AM-9PM',
      rating: 4.7,
      hourlyRate: 80
    }
  ]);

  const [equipmentBookings, setEquipmentBookings] = useState<EquipmentBooking[]>([
    {
      id: 'EQB-001',
      equipment: 'Treadmill #5',
      guestId: 'GST-001',
      guestName: 'Sarah Johnson',
      date: '2026-07-31',
      time: '07:00',
      duration: 30,
      status: 'In Use'
    },
    {
      id: 'EQB-002',
      equipment: ' squat Rack #2',
      guestId: 'GST-002',
      guestName: 'Michael Williams',
      date: '2026-07-31',
      time: '08:00',
      duration: 45,
      status: 'Confirmed'
    },
    {
      id: 'EQB-003',
      equipment: 'Elliptical #3',
      guestId: 'GST-003',
      guestName: 'Emma Davis',
      date: '2026-07-31',
      time: '09:00',
      duration: 30,
      status: 'Confirmed'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  const getClassTypeColor = (type: string) => {
    const colors = {
      'Yoga': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Pilates': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Spin': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
      'HIIT': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400',
      'Strength Training': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Zumba': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
      'CrossFit': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'In Progress':
      case 'In Use':
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fitness Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage gym access, classes, trainers, and equipment
          </p>
        </div>
        <button
          onClick={() => setShowNewBookingModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'classes'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Group Classes
        </button>
        <button
          onClick={() => setActiveTab('trainers')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'trainers'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Personal Trainers
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'equipment'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Equipment Booking
        </button>
      </div>

      {/* Group Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((fitnessClass) => (
              <div key={fitnessClass.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      <Dumbbell size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{fitnessClass.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{fitnessClass.instructor}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fitnessClass.status)}`}>
                    {fitnessClass.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassTypeColor(fitnessClass.type)}`}>
                    {fitnessClass.type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>{fitnessClass.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} />
                    <span>{fitnessClass.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={14} />
                    <span>{fitnessClass.location}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {fitnessClass.enrolled}/{fitnessClass.capacity} enrolled
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Trainers Tab */}
      {activeTab === 'trainers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{trainer.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Award size={14} fill="currentColor" />
                      <span>{trainer.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Specializations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trainer.specializations.map((spec, index) => (
                        <span key={index} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} />
                    <span>{trainer.availability}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white">${trainer.hourlyRate}/hr</div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Booking Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {equipmentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                      {booking.equipment}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onViewGuestProfile?.(booking.guestId)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {booking.guestName}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      <div>{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-sm">{booking.time}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {booking.duration} min
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
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

      {/* New Booking Modal Placeholder */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Booking</h2>
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Booking form would be implemented here with guest selection, class/equipment choice, and time slot selection.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessCenterModule;