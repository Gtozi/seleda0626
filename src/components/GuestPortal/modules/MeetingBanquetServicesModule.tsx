/**
 * Meeting & Banquet Services Module
 * Meeting room booking, banquet inquiry, conference packages, equipment requests, catering requests
 */

import { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  UtensilsCrossed,
  Monitor,
  Plus,
  CheckCircle2,
  Send,
  Search
} from 'lucide-react';

interface MeetingBanquetServicesModuleProps {
  reservationId?: string;
}

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  image?: string;
}

interface BanquetInquiry {
  id: string;
  type: string;
  date: string;
  time: string;
  guests: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  submittedAt: string;
}

const MeetingBanquetServicesModule: React.FC<MeetingBanquetServicesModuleProps> = ({
  reservationId
}) => {
  const [meetingRooms] = useState<MeetingRoom[]>([
    {
      id: 'MR-001',
      name: 'Executive Boardroom',
      capacity: 20,
      pricePerHour: 150.00,
      amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Catering Available']
    },
    {
      id: 'MR-002',
      name: 'Conference Hall A',
      capacity: 100,
      pricePerHour: 300.00,
      amenities: ['Stage', 'Sound System', 'Projector', 'Lighting Control']
    },
    {
      id: 'MR-003',
      name: 'Small Meeting Room',
      capacity: 8,
      pricePerHour: 75.00,
      amenities: ['TV Screen', 'Whiteboard', 'Coffee Service']
    }
  ]);

  const [inquiries, setInquiries] = useState<BanquetInquiry[]>([
    {
      id: 'INQ-001',
      type: 'Banquet',
      date: '2026-08-20',
      time: '18:00',
      guests: 50,
      status: 'Confirmed',
      submittedAt: '2026-07-25T10:00:00'
    }
  ]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    duration: 2
  });
  const [newInquiry, setNewInquiry] = useState({
    type: 'Banquet',
    date: '',
    time: '',
    guests: 10,
    requirements: ''
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const handleBookRoom = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!selectedRoom) return;
    // Handle booking logic
    setShowBookingModal(false);
    setNewBooking({ date: '', time: '', duration: 2 });
    setSelectedRoom(null);
  };

  const handleSubmitInquiry = () => {
    const inquiry: BanquetInquiry = {
      id: `INQ-${String(inquiries.length + 1).padStart(3, '0')}`,
      type: newInquiry.type,
      date: newInquiry.date,
      time: newInquiry.time,
      guests: newInquiry.guests,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setInquiries([...inquiries, inquiry]);
    setShowInquiryModal(false);
    setNewInquiry({ type: 'Banquet', date: '', time: '', guests: 10, requirements: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meeting & Banquet Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book meeting rooms and inquire about banquet services
          </p>
        </div>
        <button
          onClick={() => setShowInquiryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Send size={16} />
          Banquet Inquiry
        </button>
      </div>

      {/* Meeting Rooms */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Meeting Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meetingRooms.map((room) => (
            <div key={room.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <Users size={48} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{room.name}</h4>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{room.capacity} people</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>${room.pricePerHour}/hr</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.amenities.slice(0, 2).map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 2 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                      +{room.amenities.length - 2} more
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleBookRoom(room)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  <Calendar size={16} />
                  Book Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Inquiries */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Inquiries</h3>
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{inquiry.type}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Date</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(inquiry.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Time</div>
                      <div className="font-medium text-slate-900 dark:text-white">{inquiry.time}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Guests</div>
                      <div className="font-medium text-slate-900 dark:text-white">{inquiry.guests}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Book {selectedRoom.name}
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
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Total</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${(selectedRoom.pricePerHour * newBooking.duration).toFixed(2)}
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

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Banquet Inquiry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Event Type
                </label>
                <select
                  value={newInquiry.type}
                  onChange={(e) => setNewInquiry({ ...newInquiry, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Banquet">Banquet</option>
                  <option value="Conference">Conference</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newInquiry.date}
                  onChange={(e) => setNewInquiry({ ...newInquiry, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newInquiry.time}
                  onChange={(e) => setNewInquiry({ ...newInquiry, time: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expected Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={newInquiry.guests}
                  onChange={(e) => setNewInquiry({ ...newInquiry, guests: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={newInquiry.requirements}
                  onChange={(e) => setNewInquiry({ ...newInquiry, requirements: e.target.value })}
                  placeholder="Describe your requirements..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInquiryModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInquiry}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Send size={16} />
                Submit Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingBanquetServicesModule;
