/**
 * Event & Activity Booking Module
 * Book hotel activities, excursions, local tours, cooking classes, cultural experiences, sports activities
 */

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Search,
  Plus,
  CheckCircle2,
  Mountain,
  UtensilsCrossed,
  Music,
  Trophy
} from 'lucide-react';

interface EventActivityBookingModuleProps {
  reservationId?: string;
}

interface Activity {
  id: string;
  name: string;
  category: 'Hotel Activity' | 'Excursion' | 'Local Tour' | 'Cooking Class' | 'Cultural Experience' | 'Sports Activity' | 'Entertainment';
  description: string;
  duration: number;
  price: number;
  rating: number;
  image?: string;
  location: string;
}

interface Booking {
  id: string;
  activityId: string;
  activityName: string;
  date: string;
  time: string;
  participants: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  totalPrice: number;
}

const EventActivityBookingModule: React.FC<EventActivityBookingModuleProps> = ({
  reservationId
}) => {
  const [activities] = useState<Activity[]>([
    {
      id: 'ACT-001',
      name: 'City Tour',
      category: 'Local Tour',
      description: 'Guided tour of Addis Ababa\'s historic sites',
      duration: 180,
      price: 50.00,
      rating: 4.7,
      location: 'City Center'
    },
    {
      id: 'ACT-002',
      name: 'Ethiopian Coffee Ceremony',
      category: 'Cultural Experience',
      description: 'Traditional coffee ceremony with local guide',
      duration: 60,
      price: 25.00,
      rating: 4.9,
      location: 'Hotel Lobby'
    },
    {
      id: 'ACT-003',
      name: 'Cooking Class',
      category: 'Cooking Class',
      description: 'Learn to prepare traditional Ethiopian dishes',
      duration: 120,
      price: 75.00,
      rating: 4.8,
      location: 'Hotel Kitchen'
    },
    {
      id: 'ACT-004',
      name: 'Mountain Hiking',
      category: 'Excursion',
      description: 'Guided hike to Entoto Mountains',
      duration: 240,
      price: 80.00,
      rating: 4.6,
      location: 'Entoto Mountains'
    },
    {
      id: 'ACT-005',
      name: 'Live Jazz Night',
      category: 'Entertainment',
      description: 'Evening jazz performance at the hotel lounge',
      duration: 120,
      price: 30.00,
      rating: 4.5,
      location: 'Hotel Lounge'
    },
    {
      id: 'ACT-006',
      name: 'Tennis Tournament',
      category: 'Sports Activity',
      description: 'Participate in our weekly tennis tournament',
      duration: 180,
      price: 40.00,
      rating: 4.4,
      location: 'Hotel Tennis Court'
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-001',
      activityId: 'ACT-002',
      activityName: 'Ethiopian Coffee Ceremony',
      date: '2026-08-16',
      time: '15:00',
      participants: 2,
      status: 'Confirmed',
      totalPrice: 50.00
    }
  ]);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    participants: 1
  });

  const categories = ['All', 'Hotel Activity', 'Excursion', 'Local Tour', 'Cooking Class', 'Cultural Experience', 'Sports Activity', 'Entertainment'];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || activity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hotel Activity': return <Calendar size={20} />;
      case 'Excursion': return <Mountain size={20} />;
      case 'Local Tour': return <MapPin size={20} />;
      case 'Cooking Class': return <UtensilsCrossed size={20} />;
      case 'Cultural Experience': return <Music size={20} />;
      case 'Sports Activity': return <Trophy size={20} />;
      case 'Entertainment': return <Music size={20} />;
      default: return <Calendar size={20} />;
    }
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

  const handleBookActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedActivity) return;

    const booking: Booking = {
      id: `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      date: newBooking.date,
      time: newBooking.time,
      participants: newBooking.participants,
      status: 'Pending',
      totalPrice: selectedActivity.price * newBooking.participants
    };

    setBookings([...bookings, booking]);
    setShowBookingModal(false);
    setNewBooking({ date: '', time: '', participants: 1 });
    setSelectedActivity(null);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events & Activities</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover and book exciting experiences
          </p>
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
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
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

      {/* Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/20 dark:to-emerald-900/20 flex items-center justify-center">
              {getCategoryIcon(activity.category)}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{activity.name}</h3>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{activity.rating}</span>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{activity.category}</div>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">{activity.description}</p>
              <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{activity.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{activity.location}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${activity.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleBookActivity(activity)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  <Plus size={16} />
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
                    <h4 className="font-medium text-slate-900 dark:text-white">{booking.activityName}</h4>
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
                      <div className="text-slate-500 dark:text-slate-400">Participants</div>
                      <div className="font-medium text-slate-900 dark:text-white">{booking.participants}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Total</div>
                      <div className="font-medium text-slate-900 dark:text-white">${booking.totalPrice.toFixed(2)}</div>
                    </div>
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
      {showBookingModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Book {selectedActivity.name}
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
                  Number of Participants
                </label>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newBooking.participants}
                    onChange={(e) => setNewBooking({ ...newBooking, participants: parseInt(e.target.value) })}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Price</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${(selectedActivity.price * newBooking.participants).toFixed(2)}
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
                <CheckCircle2 size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventActivityBookingModule;
