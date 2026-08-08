/**
 * Reservations Module
 * Search availability, book rooms, modify/cancel reservations, view booking history
 */

import { useState } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  X,
  Users,
  Bed,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  ChevronRight
} from 'lucide-react';

interface ReservationsModuleProps {
  guestId?: string;
}

interface Reservation {
  id: string;
  confirmationNumber: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  roomType: string;
  ratePlan: string;
  package?: string;
  totalAmount: number;
  currency: string;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Refunded';
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}

interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

const ReservationsModule: React.FC<ReservationsModuleProps> = ({
  guestId
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'bookings' | 'history'>('bookings');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'RES-001',
      confirmationNumber: 'CONF-2026-001',
      hotelName: 'SELEDA Grand Hotel',
      checkInDate: '2026-08-15',
      checkOutDate: '2026-08-20',
      guests: 2,
      roomType: 'Deluxe King Room',
      ratePlan: 'Best Available Rate',
      package: 'Bed & Breakfast',
      totalAmount: 1250.00,
      currency: 'USD',
      paymentStatus: 'Paid',
      status: 'Confirmed'
    },
    {
      id: 'RES-002',
      confirmationNumber: 'CONF-2026-002',
      hotelName: 'SELEDA Grand Hotel',
      checkInDate: '2026-06-10',
      checkOutDate: '2026-06-15',
      guests: 2,
      roomType: 'Executive Suite',
      ratePlan: 'Corporate Rate',
      package: 'All Inclusive',
      totalAmount: 2500.00,
      currency: 'USD',
      paymentStatus: 'Paid',
      status: 'Completed'
    }
  ]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const getStatusColor = (status: string) => {
    const colors = {
      'Confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400',
      'Completed': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'Paid': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Partial': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Pending': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400',
      'Refunded': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const filteredReservations = reservations.filter(res => {
    if (statusFilter === 'All') return true;
    return res.status === statusFilter;
  });

  const handleSearch = () => {
    setActiveTab('search');
  };

  const handleModify = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowModifyModal(true);
  };

  const handleCancel = (reservationId: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      setReservations(reservations.map(res => 
        res.id === reservationId 
          ? { ...res, status: 'Cancelled' as const }
          : res
      ));
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book, modify, or manage your reservations
          </p>
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Reservation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'bookings'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Calendar size={18} />
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Clock size={18} />
          Booking History
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Search Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Destination
              </label>
              <input
                type="text"
                placeholder="Enter destination"
                value={searchCriteria.destination}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, destination: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                value={searchCriteria.checkIn}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, checkIn: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                value={searchCriteria.checkOut}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, checkOut: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Guests & Rooms
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={searchCriteria.guests}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, guests: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <Bed size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={searchCriteria.rooms}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, rooms: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
              <Search size={18} />
              Search Available Rooms
            </button>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4">
              <Filter size={18} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {reservation.hotelName}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        {reservation.paymentStatus}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <span className="font-medium">Confirmation:</span> {reservation.confirmationNumber}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Check-in</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {new Date(reservation.checkInDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Check-out</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Duration</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {calculateNights(reservation.checkInDate, reservation.checkOutDate)} nights
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Guests</div>
                        <div className="font-medium text-slate-900 dark:text-white">{reservation.guests}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Room Type</div>
                        <div className="font-medium text-slate-900 dark:text-white">{reservation.roomType}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Rate Plan</div>
                        <div className="font-medium text-slate-900 dark:text-white">{reservation.ratePlan}</div>
                      </div>
                      {reservation.package && (
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Package</div>
                          <div className="font-medium text-slate-900 dark:text-white">{reservation.package}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Total</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {reservation.currency} {reservation.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {reservation.status === 'Confirmed' && (
                      <>
                        <button
                          onClick={() => handleModify(reservation)}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
                        >
                          <Edit size={16} />
                          Modify
                        </button>
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Booking History</h2>
          <div className="space-y-4">
            {reservations.filter(r => r.status === 'Completed' || r.status === 'Cancelled').map((reservation) => (
              <div key={reservation.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{reservation.hotelName}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(reservation.checkInDate).toLocaleDateString()} - {new Date(reservation.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Modify Reservation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Check-in Date
                </label>
                <input
                  type="date"
                  defaultValue={selectedReservation.checkInDate}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Check-out Date
                </label>
                <input
                  type="date"
                  defaultValue={selectedReservation.checkOutDate}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModifyModal(false);
                  // Handle modification logic
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsModule;
