/**
 * Spa & Wellness Module
 * Book massages, facials, gym sessions, sauna, wellness packages
 */

import { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Star,
  Search,
  Filter,
  Plus,
  Heart,
  Dumbbell,
  Droplets,
  Sun
} from 'lucide-react';

interface SpaWellnessModuleProps {
  reservationId?: string;
}

interface Treatment {
  id: string;
  name: string;
  category: 'Massage' | 'Facial' | 'Body Treatment' | 'Wellness Package';
  description: string;
  duration: number;
  price: number;
  therapist?: string;
  image?: string;
}

interface Booking {
  id: string;
  treatmentId: string;
  treatmentName: string;
  date: string;
  time: string;
  duration: number;
  therapist?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  price: number;
}

const SpaWellnessModule: React.FC<SpaWellnessModuleProps> = ({
  reservationId
}) => {
  const [treatments] = useState<Treatment[]>([
    {
      id: 'T-001',
      name: 'Swedish Massage',
      category: 'Massage',
      description: 'Relaxing full-body massage with aromatic oils',
      duration: 60,
      price: 80.00,
      therapist: 'Available'
    },
    {
      id: 'T-002',
      name: 'Deep Tissue Massage',
      category: 'Massage',
      description: 'Intensive muscle relief therapy',
      duration: 90,
      price: 120.00,
      therapist: 'Available'
    },
    {
      id: 'T-003',
      name: 'Anti-Aging Facial',
      category: 'Facial',
      description: 'Rejuvenating facial treatment with premium products',
      duration: 60,
      price: 95.00,
      therapist: 'Available'
    },
    {
      id: 'T-004',
      name: 'Body Scrub & Wrap',
      category: 'Body Treatment',
      description: 'Exfoliating body scrub followed by hydrating wrap',
      duration: 75,
      price: 110.00,
      therapist: 'Available'
    },
    {
      id: 'T-005',
      name: 'Couples Retreat Package',
      category: 'Wellness Package',
      description: 'Romantic spa experience for two including massage and facial',
      duration: 120,
      price: 250.00,
      therapist: 'Available'
    },
    {
      id: 'T-006',
      name: 'Personal Training Session',
      category: 'Wellness Package',
      description: 'One-on-one fitness training with certified trainer',
      duration: 60,
      price: 60.00,
      therapist: 'Available'
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-001',
      treatmentId: 'T-001',
      treatmentName: 'Swedish Massage',
      date: '2026-08-16',
      time: '10:00',
      duration: 60,
      therapist: 'Sarah Johnson',
      status: 'Confirmed',
      price: 80.00
    }
  ]);

  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    therapist: ''
  });

  const categories = ['All', 'Massage', 'Facial', 'Body Treatment', 'Wellness Package'];

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || treatment.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Massage': return <Heart size={20} />;
      case 'Facial': return <Sparkles size={20} />;
      case 'Body Treatment': return <Droplets size={20} />;
      case 'Wellness Package': return <Sun size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Massage': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
      'Facial': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Body Treatment': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
      'Wellness Package': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400'
    };
    return colors[category as keyof typeof colors] || colors['Massage'];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400',
      'Completed': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const handleBookTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedTreatment) return;

    const booking: Booking = {
      id: `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      treatmentId: selectedTreatment.id,
      treatmentName: selectedTreatment.name,
      date: newBooking.date,
      time: newBooking.time,
      duration: selectedTreatment.duration,
      therapist: newBooking.therapist || undefined,
      status: 'Pending',
      price: selectedTreatment.price
    };

    setBookings([...bookings, booking]);
    setShowBookingModal(false);
    setNewBooking({ date: '', time: '', therapist: '' });
    setSelectedTreatment(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'Cancelled' as const }
          : booking
      ));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Spa & Wellness</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Relax and rejuvenate with our premium spa services
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 text-white">
          <Heart size={32} className="mb-2" />
          <div className="font-semibold">Massage</div>
          <div className="text-sm opacity-90">Relaxing therapy</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
          <Sparkles size={32} className="mb-2" />
          <div className="font-semibold">Facial</div>
          <div className="text-sm opacity-90">Skin care</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 text-white">
          <Droplets size={32} className="mb-2" />
          <div className="font-semibold">Sauna & Steam</div>
          <div className="text-sm opacity-90">Thermal therapy</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <Dumbbell size={32} className="mb-2" />
          <div className="font-semibold">Fitness</div>
          <div className="text-sm opacity-90">Gym & training</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Treatments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreatments.map((treatment) => (
          <div key={treatment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
              {getCategoryIcon(treatment.category)}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{treatment.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(treatment.category)}`}>
                  {treatment.category}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{treatment.description}</p>
              <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{treatment.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{treatment.therapist}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${treatment.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleBookTreatment(treatment)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  <Calendar size={16} />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Bookings</h3>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{booking.treatmentName}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Date</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Time</div>
                      <div className="font-medium text-slate-900 dark:text-white">{booking.time}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Duration</div>
                      <div className="font-medium text-slate-900 dark:text-white">{booking.duration} min</div>
                    </div>
                    {booking.therapist && (
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Therapist</div>
                        <div className="font-medium text-slate-900 dark:text-white">{booking.therapist}</div>
                      </div>
                    )}
                  </div>
                </div>
                {booking.status === 'Confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
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

      {/* Booking Modal */}
      {showBookingModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Book {selectedTreatment.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newBooking.time}
                  onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Therapist (Optional)
                </label>
                <input
                  type="text"
                  value={newBooking.therapist}
                  onChange={(e) => setNewBooking({ ...newBooking, therapist: e.target.value })}
                  placeholder="Leave blank for any available therapist"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Price</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${selectedTreatment.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBooking}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Plus size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaWellnessModule;
