/**
 * Restaurant Reservations Module
 * Browse restaurants, view menus, reserve tables, modify/cancel reservations
 */

import { useState } from 'react';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  X,
  Search,
  Star,
  MapPin,
  Phone,
  CheckCircle2
} from 'lucide-react';

interface RestaurantReservationsModuleProps {
  reservationId?: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  rating: number;
  image?: string;
  openingHours: string;
  location: string;
  phone: string;
}

interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  specialRequests?: string;
}

const RestaurantReservationsModule: React.FC<RestaurantReservationsModuleProps> = ({
  reservationId
}) => {
  const [restaurants] = useState<Restaurant[]>([
    {
      id: 'REST-001',
      name: 'The Grand Restaurant',
      cuisine: 'International',
      description: 'Fine dining with international cuisine and stunning city views',
      rating: 4.8,
      openingHours: '6:00 AM - 11:00 PM',
      location: 'Ground Floor',
      phone: '+251 11 555 1235'
    },
    {
      id: 'REST-002',
      name: 'Ethiopian Kitchen',
      cuisine: 'Ethiopian',
      description: 'Traditional Ethiopian dishes in a cultural setting',
      rating: 4.6,
      openingHours: '11:00 AM - 10:00 PM',
      location: 'First Floor',
      phone: '+251 11 555 1236'
    },
    {
      id: 'REST-003',
      name: 'Poolside Grill',
      cuisine: 'Grill & BBQ',
      description: 'Fresh grilled dishes by the poolside',
      rating: 4.5,
      openingHours: '12:00 PM - 9:00 PM',
      location: 'Pool Area',
      phone: '+251 11 555 1237'
    }
  ]);

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'RESV-001',
      restaurantId: 'REST-001',
      restaurantName: 'The Grand Restaurant',
      date: '2026-08-16',
      time: '19:00',
      guests: 2,
      status: 'Confirmed',
      specialRequests: 'Window seat preferred'
    }
  ]);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    date: '',
    time: '',
    guests: 2,
    specialRequests: ''
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'Confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400',
      'Completed': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const handleMakeReservation = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowReservationModal(true);
  };

  const handleSubmitReservation = () => {
    if (!selectedRestaurant) return;

    const reservation: Reservation = {
      id: `RESV-${String(reservations.length + 1).padStart(3, '0')}`,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      date: newReservation.date,
      time: newReservation.time,
      guests: newReservation.guests,
      status: 'Pending',
      specialRequests: newReservation.specialRequests
    };

    setReservations([...reservations, reservation]);
    setShowReservationModal(false);
    setNewReservation({ date: '', time: '', guests: 2, specialRequests: '' });
    setSelectedRestaurant(null);
  };

  const handleCancelReservation = (reservationId: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      setReservations(reservations.map(res => 
        res.id === reservationId 
          ? { ...res, status: 'Cancelled' as const }
          : res
      ));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Restaurant Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reserve tables at our world-class restaurants
          </p>
        </div>
      </div>

      {/* Restaurants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
              <UtensilsCrossed size={48} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{restaurant.name}</h3>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{restaurant.rating}</span>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{restaurant.cuisine}</div>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">{restaurant.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={14} />
                  <span>{restaurant.openingHours}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={14} />
                  <span>{restaurant.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={14} />
                  <span>{restaurant.phone}</span>
                </div>
              </div>
              <button
                onClick={() => handleMakeReservation(restaurant)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Calendar size={16} />
                Reserve Table
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* My Reservations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Reservations</h3>
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{reservation.restaurantName}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Date</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(reservation.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Time</div>
                      <div className="font-medium text-slate-900 dark:text-white">{reservation.time}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Guests</div>
                      <div className="font-medium text-slate-900 dark:text-white">{reservation.guests}</div>
                    </div>
                    {reservation.specialRequests && (
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Special Requests</div>
                        <div className="font-medium text-slate-900 dark:text-white">{reservation.specialRequests}</div>
                      </div>
                    )}
                  </div>
                </div>
                {reservation.status === 'Confirmed' && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Reserve at {selectedRestaurant.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newReservation.date}
                  onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newReservation.time}
                  onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newReservation.guests}
                    onChange={(e) => setNewReservation({ ...newReservation, guests: parseInt(e.target.value) })}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={newReservation.specialRequests}
                  onChange={(e) => setNewReservation({ ...newReservation, specialRequests: e.target.value })}
                  placeholder="Any special requests..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReservationModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReservation}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <CheckCircle2 size={16} />
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantReservationsModule;
