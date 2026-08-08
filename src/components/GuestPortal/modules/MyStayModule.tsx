/**
 * My Stay Module
 * Displays room details, current charges, hotel directory, map, schedule, and emergency contacts
 */

import { useState } from 'react';
import {
  Home,
  CreditCard,
  Map,
  Calendar,
  Phone,
  Sun,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  Navigation
} from 'lucide-react';

interface MyStayModuleProps {
  reservationId?: string;
}

interface RoomDetails {
  roomNumber: string;
  roomType: string;
  floor: number;
  bedType: string;
  view: string;
  amenities: string[];
}

interface CurrentCharge {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
}

const MyStayModule: React.FC<MyStayModuleProps> = ({
  reservationId
}) => {
  const [roomDetails] = useState<RoomDetails>({
    roomNumber: '305',
    roomType: 'Deluxe King Room',
    floor: 3,
    bedType: 'King Bed',
    view: 'City View',
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'TV', 'Coffee Maker']
  });

  const [currentCharges] = useState<CurrentCharge[]>([
    {
      id: 'CHG-001',
      description: 'Room Charge',
      amount: 250.00,
      date: '2026-08-15',
      category: 'Room'
    },
    {
      id: 'CHG-002',
      description: 'Room Service - Dinner',
      amount: 45.00,
      date: '2026-08-15',
      category: 'Dining'
    },
    {
      id: 'CHG-003',
      description: 'Spa Treatment',
      amount: 120.00,
      date: '2026-08-16',
      category: 'Spa'
    }
  ]);

  const [hotelInfo] = useState<HotelInfo>({
    name: 'SELEDA Grand Hotel',
    address: '123 Bole Avenue, Addis Ababa, Ethiopia',
    phone: '+251 11 555 1234',
    email: 'info@seledagrand.com',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM'
  });

  const [dailySchedule] = useState([
    {
      time: '7:00 AM',
      activity: 'Breakfast',
      location: 'Main Restaurant',
      description: 'Complimentary breakfast buffet'
    },
    {
      time: '9:00 AM',
      activity: 'Yoga Class',
      location: 'Fitness Center',
      description: 'Morning yoga session'
    },
    {
      time: '12:00 PM',
      activity: 'Lunch',
      location: 'Poolside Restaurant',
      description: 'Al fresco dining'
    },
    {
      time: '6:00 PM',
      activity: 'Happy Hour',
      location: 'Lounge Bar',
      description: 'Special cocktails and appetizers'
    },
    {
      time: '8:00 PM',
      activity: 'Live Music',
      location: 'Main Lobby',
      description: 'Jazz performance'
    }
  ]);

  const [emergencyContacts] = useState([
    {
      name: 'Front Desk',
      phone: '0',
      description: '24/7 reception'
    },
    {
      name: 'Housekeeping',
      phone: '1',
      description: 'Room service and cleaning'
    },
    {
      name: 'Security',
      phone: '2',
      description: 'Emergency security'
    },
    {
      name: 'Medical Emergency',
      phone: '911',
      description: 'External emergency services'
    }
  ]);

  const totalCharges = currentCharges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Stay</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your room details and hotel information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{new Date().toLocaleTimeString()}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Local Time</div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Home size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Room Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Room Number</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{roomDetails.roomNumber}</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Room Type</div>
            <div className="text-lg font-medium text-slate-900 dark:text-white">{roomDetails.roomType}</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Floor</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{roomDetails.floor}</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Bed Type</div>
            <div className="text-lg font-medium text-slate-900 dark:text-white">{roomDetails.bedType}</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">View</div>
            <div className="text-lg font-medium text-slate-900 dark:text-white">{roomDetails.view}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Room Amenities</div>
          <div className="flex flex-wrap gap-2">
            {roomDetails.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Current Charges */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <CreditCard size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Current Charges</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">USD {totalCharges.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-3">
          {currentCharges.map((charge) => (
            <div key={charge.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{charge.description}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {charge.category} • {new Date(charge.date).toLocaleDateString()}
                </div>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                USD {charge.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Directory */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Info size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hotel Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Hotel Name</div>
              <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Address</div>
              <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.address}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
                <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.phone}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-slate-500 dark:text-slate-400">Check-in</div>
                <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.checkInTime}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 dark:text-slate-400">Check-out</div>
                <div className="font-medium text-slate-900 dark:text-white">{hotelInfo.checkOutTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Map */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Map size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hotel Map</h3>
          </div>

          <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Navigation size={48} className="mx-auto text-slate-400 mb-2" />
              <div className="text-sm text-slate-500 dark:text-slate-400">Interactive hotel map</div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium">
            <Map size={16} />
            View Full Map
          </button>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Today's Schedule</h3>
        </div>

        <div className="space-y-3">
          {dailySchedule.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.time}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">{item.activity}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{item.location}</div>
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contacts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{contact.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{contact.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-red-600 dark:text-red-400" />
                <span className="font-bold text-slate-900 dark:text-white">{contact.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyStayModule;
