/**
 * Transportation Module
 * Book airport pickup, shuttle, limousine, car rental, chauffeur services
 */

import { useState } from 'react';
import {
  Car,
  Plane,
  Bus,
  Gem,
  User,
  Calendar,
  Clock,
  MapPin,
  Search,
  Plus,
  CheckCircle2
} from 'lucide-react';

interface TransportationModuleProps {
  reservationId?: string;
}

interface Vehicle {
  id: string;
  type: 'Airport Pickup' | 'Airport Drop-off' | 'Shuttle' | 'Limousine' | 'Car Rental' | 'Chauffeur';
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerTrip?: number;
  image?: string;
}

interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: string;
  date: string;
  time: string;
  pickupLocation: string;
  dropoffLocation?: string;
  duration?: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  totalPrice: number;
}

const TransportationModule: React.FC<TransportationModuleProps> = ({
  reservationId
}) => {
  const [vehicles] = useState<Vehicle[]>([
    {
      id: 'V-001',
      type: 'Airport Pickup',
      name: 'Standard Sedan',
      description: 'Comfortable sedan for airport transfers',
      capacity: 3,
      pricePerTrip: 45.00
    },
    {
      id: 'V-002',
      type: 'Airport Pickup',
      name: 'Premium SUV',
      description: 'Spacious SUV for groups and luggage',
      capacity: 6,
      pricePerTrip: 75.00
    },
    {
      id: 'V-003',
      type: 'Limousine',
      name: 'Luxury Limousine',
      description: 'Premium limousine service for special occasions',
      capacity: 8,
      pricePerHour: 150.00
    },
    {
      id: 'V-004',
      type: 'Shuttle',
      name: 'Hotel Shuttle',
      description: 'Complimentary shuttle service to key locations',
      capacity: 12,
      pricePerTrip: 0
    },
    {
      id: 'V-005',
      type: 'Car Rental',
      name: 'Economy Car',
      description: 'Self-drive economy car rental',
      capacity: 4,
      pricePerHour: 25.00
    },
    {
      id: 'V-006',
      type: 'Chauffeur',
      name: 'Private Chauffeur',
      description: 'Professional chauffeur service',
      capacity: 4,
      pricePerHour: 80.00
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-001',
      vehicleId: 'V-001',
      vehicleName: 'Standard Sedan',
      type: 'Airport Pickup',
      date: '2026-08-15',
      time: '14:00',
      pickupLocation: 'Bole International Airport',
      status: 'Confirmed',
      totalPrice: 45.00
    }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    pickupLocation: '',
    dropoffLocation: '',
    duration: 1
  });

  const types = ['All', 'Airport Pickup', 'Airport Drop-off', 'Shuttle', 'Limousine', 'Car Rental', 'Chauffeur'];

  const filteredVehicles = vehicles.filter(vehicle => {
    return typeFilter === 'All' || vehicle.type === typeFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Airport Pickup':
      case 'Airport Drop-off': return <Plane size={20} />;
      case 'Shuttle': return <Bus size={20} />;
      case 'Limousine': return <Gem size={20} />;
      case 'Car Rental': return <Car size={20} />;
      case 'Chauffeur': return <User size={20} />;
      default: return <Car size={20} />;
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

  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedVehicle) return;

    const totalPrice = selectedVehicle.pricePerTrip 
      ? selectedVehicle.pricePerTrip 
      : selectedVehicle.pricePerHour * newBooking.duration;

    const booking: Booking = {
      id: `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      type: selectedVehicle.type,
      date: newBooking.date,
      time: newBooking.time,
      pickupLocation: newBooking.pickupLocation,
      dropoffLocation: newBooking.dropoffLocation || undefined,
      duration: selectedVehicle.pricePerHour ? newBooking.duration : undefined,
      status: 'Pending',
      totalPrice
    };

    setBookings([...bookings, booking]);
    setShowBookingModal(false);
    setNewBooking({ date: '', time: '', pickupLocation: '', dropoffLocation: '', duration: 1 });
    setSelectedVehicle(null);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transportation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book transportation services for your travel needs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <Search size={18} className="text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
              {getTypeIcon(vehicle.type)}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{vehicle.name}</h3>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                  {vehicle.type}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{vehicle.description}</p>
              <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{vehicle.capacity} passengers</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {vehicle.pricePerTrip ? (
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${vehicle.pricePerTrip.toFixed(2)}
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/trip</span>
                    </span>
                  ) : (
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${vehicle.pricePerHour.toFixed(2)}
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/hour</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleBookVehicle(vehicle)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  <Plus size={16} />
                  Book
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
                    <h4 className="font-medium text-slate-900 dark:text-white">{booking.vehicleName}</h4>
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
                      <div className="text-slate-500 dark:text-slate-400">Pickup</div>
                      <div className="font-medium text-slate-900 dark:text-white">{booking.pickupLocation}</div>
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
      {showBookingModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Book {selectedVehicle.name}
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
                  Pickup Location
                </label>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={newBooking.pickupLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
                    placeholder="Enter pickup location"
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              {selectedVehicle.type !== 'Airport Pickup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Drop-off Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBooking.dropoffLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, dropoffLocation: e.target.value })}
                    placeholder="Enter drop-off location"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              {selectedVehicle.pricePerHour && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBooking.duration}
                    onChange={(e) => setNewBooking({ ...newBooking, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Total</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${(selectedVehicle.pricePerTrip || selectedVehicle.pricePerHour * newBooking.duration).toFixed(2)}
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

export default TransportationModule;
