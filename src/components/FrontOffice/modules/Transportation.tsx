/**
 * Front Office Transportation Module
 * Airport transfers, shuttle services, and vehicle management
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
  ChevronDown,
  Clock,
  User,
  Plane,
  MapPin,
  Calendar,
  Phone,
  CreditCard,
  Route,
  Fuel,
  Wrench
} from 'lucide-react';
import StatCard from '../StatCard';

type TripStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type TripType = 'airport_pickup' | 'airport_dropoff' | 'local_transfer' | 'shuttle' | 'other';
type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

interface Trip {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId?: string;
  type: TripType;
  status: TripStatus;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledDate: string;
  scheduledTime: string;
  vehicleId?: string;
  driverId?: string;
  passengers: number;
  luggage: number;
  flightNumber?: string;
  notes: string;
  cost?: number;
  paymentStatus: 'paid' | 'pending' | 'complimentary';
  completedAt?: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: 'sedan' | 'suv' | 'van' | 'bus' | 'shuttle';
  plateNumber: string;
  capacity: number;
  status: VehicleStatus;
  driverId?: string;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'available' | 'on_trip' | 'off_duty';
  assignedVehicleId?: string;
  activeTrips: number;
}

const Transportation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'trips' | 'vehicles' | 'drivers' | 'schedule') || 'trips';
  const setActiveTab = (tab: 'trips' | 'vehicles' | 'drivers' | 'schedule') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [tripForm, setTripForm] = useState({
    guestName: '',
    roomNumber: '',
    reservationId: '',
    type: 'airport_pickup' as TripType,
    pickupLocation: '',
    dropoffLocation: '',
    scheduledDate: '',
    scheduledTime: '',
    passengers: '1',
    luggage: '1',
    flightNumber: '',
    notes: '',
    cost: '',
    paymentStatus: 'pending' as 'paid' | 'pending' | 'complimentary'
  });

  const [trips] = useState<Trip[]>([
    {
      id: 'TRP-001',
      guestName: 'John Smith',
      roomNumber: '301',
      reservationId: 'RES-001',
      type: 'airport_pickup',
      status: 'scheduled',
      pickupLocation: 'Bole International Airport',
      dropoffLocation: 'SELEDA Hotel',
      scheduledDate: '2026-07-30',
      scheduledTime: '14:00',
      vehicleId: 'VH-001',
      driverId: 'DRV-001',
      passengers: 2,
      luggage: 3,
      flightNumber: 'ET456',
      notes: 'Guest arriving on ET456',
      cost: 45,
      paymentStatus: 'pending',
    },
    {
      id: 'TRP-002',
      guestName: 'Sarah Johnson',
      roomNumber: '205',
      reservationId: 'RES-002',
      type: 'airport_dropoff',
      status: 'confirmed',
      pickupLocation: 'SELEDA Hotel',
      dropoffLocation: 'Bole International Airport',
      scheduledDate: '2026-07-31',
      scheduledTime: '08:00',
      vehicleId: 'VH-002',
      driverId: 'DRV-002',
      passengers: 1,
      luggage: 2,
      flightNumber: 'ET789',
      notes: 'Flight at 10:30 AM',
      cost: 45,
      paymentStatus: 'paid',
    },
    {
      id: 'TRP-003',
      guestName: 'Michael Chen',
      roomNumber: '412',
      reservationId: 'RES-003',
      type: 'local_transfer',
      status: 'in_progress',
      pickupLocation: 'SELEDA Hotel',
      dropoffLocation: 'United Nations Conference Center',
      scheduledDate: '2026-07-29',
      scheduledTime: '09:00',
      vehicleId: 'VH-003',
      driverId: 'DRV-003',
      passengers: 1,
      luggage: 1,
      notes: 'Business meeting',
      cost: 25,
      paymentStatus: 'paid',
    },
    {
      id: 'TRP-004',
      guestName: 'Emma Wilson',
      roomNumber: '118',
      reservationId: 'RES-004',
      type: 'shuttle',
      status: 'completed',
      pickupLocation: 'SELEDA Hotel',
      dropoffLocation: 'Meskel Square',
      scheduledDate: '2026-07-29',
      scheduledTime: '10:00',
      vehicleId: 'VH-004',
      driverId: 'DRV-004',
      passengers: 4,
      luggage: 2,
      notes: 'Shopping trip',
      cost: 0,
      paymentStatus: 'complimentary',
      completedAt: '2026-07-29 11:30',
    },
    {
      id: 'TRP-005',
      guestName: 'Robert Brown',
      roomNumber: '320',
      reservationId: 'RES-005',
      type: 'airport_pickup',
      status: 'scheduled',
      pickupLocation: 'Bole International Airport',
      dropoffLocation: 'SELEDA Hotel',
      scheduledDate: '2026-08-01',
      scheduledTime: '16:00',
      passengers: 2,
      luggage: 4,
      flightNumber: 'ET123',
      notes: 'Family with 2 children',
      cost: 55,
      paymentStatus: 'pending',
    },
  ]);

  const [vehicles] = useState<Vehicle[]>([
    {
      id: 'VH-001',
      name: 'Toyota Camry',
      type: 'sedan',
      plateNumber: 'AA-1234',
      capacity: 4,
      status: 'available',
      driverId: 'DRV-001',
      fuelLevel: 85,
      lastMaintenance: '2026-06-15',
      nextMaintenance: '2026-09-15',
    },
    {
      id: 'VH-002',
      name: 'Toyota Land Cruiser',
      type: 'suv',
      plateNumber: 'AA-5678',
      capacity: 7,
      status: 'in_use',
      driverId: 'DRV-002',
      fuelLevel: 60,
      lastMaintenance: '2026-06-20',
      nextMaintenance: '2026-09-20',
    },
    {
      id: 'VH-003',
      name: 'Mercedes V-Class',
      type: 'van',
      plateNumber: 'AA-9012',
      capacity: 6,
      status: 'in_use',
      driverId: 'DRV-003',
      fuelLevel: 45,
      lastMaintenance: '2026-07-01',
      nextMaintenance: '2026-10-01',
    },
    {
      id: 'VH-004',
      name: 'Toyota Hiace',
      type: 'shuttle',
      plateNumber: 'AA-3456',
      capacity: 14,
      status: 'available',
      driverId: 'DRV-004',
      fuelLevel: 70,
      lastMaintenance: '2026-06-10',
      nextMaintenance: '2026-09-10',
    },
    {
      id: 'VH-005',
      name: 'Hyundai H1',
      type: 'bus',
      plateNumber: 'AA-7890',
      capacity: 12,
      status: 'maintenance',
      fuelLevel: 30,
      lastMaintenance: '2026-07-25',
      nextMaintenance: '2026-08-25',
    },
  ]);

  const [drivers] = useState<Driver[]>([
    { id: 'DRV-001', name: 'Abebe Bikila', phone: '+251 911 123 4567', licenseNumber: 'DL-001', status: 'available', assignedVehicleId: 'VH-001', activeTrips: 0 },
    { id: 'DRV-002', name: 'Belayneh Daba', phone: '+251 911 234 5678', licenseNumber: 'DL-002', status: 'on_trip', assignedVehicleId: 'VH-002', activeTrips: 1 },
    { id: 'DRV-003', name: 'Chala Adugna', phone: '+251 911 345 6789', licenseNumber: 'DL-003', status: 'on_trip', assignedVehicleId: 'VH-003', activeTrips: 1 },
    { id: 'DRV-004', name: 'Dereje Tadesse', phone: '+251 911 456 7890', licenseNumber: 'DL-004', status: 'available', assignedVehicleId: 'VH-004', activeTrips: 0 },
    { id: 'DRV-005', name: 'Ephrem Seyoum', phone: '+251 911 567 8901', licenseNumber: 'DL-005', status: 'off_duty', activeTrips: 0 },
  ]);

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      trip.guestName.toLowerCase().includes(q) ||
      trip.roomNumber.toLowerCase().includes(q) ||
      trip.pickupLocation.toLowerCase().includes(q) ||
      trip.dropoffLocation.toLowerCase().includes(q) ||
      (trip.flightNumber && trip.flightNumber.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: TripStatus) => {
    const config: Record<TripStatus, { bg: string; text: string; label: string }> = {
      scheduled: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Scheduled' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getVehicleStatusBadge = (status: VehicleStatus) => {
    const config: Record<VehicleStatus, { bg: string; text: string; label: string }> = {
      available: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Available' },
      in_use: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Use' },
      maintenance: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Maintenance' },
      out_of_service: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Out of Service' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const handleTripSubmit = () => {
    setShowTripModal(false);
    setTripForm({
      guestName: '',
      roomNumber: '',
      reservationId: '',
      type: 'airport_pickup',
      pickupLocation: '',
      dropoffLocation: '',
      scheduledDate: '',
      scheduledTime: '',
      passengers: '1',
      luggage: '1',
      flightNumber: '',
      notes: '',
      cost: '',
      paymentStatus: 'pending'
    });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in" id="transportation">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transportation</h2>
          <p className="text-sm text-slate-500 mt-1">Airport transfers, shuttle services, and vehicle management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTripModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Trip
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Trips" value="2" icon={Route} variant="primary" />
        <StatCard label="Scheduled Today" value="2" icon={Calendar} variant="alert" />
        <StatCard label="Available Vehicles" value="2" icon={Car} variant="rooms" />
        <StatCard label="Available Drivers" value="2" icon={User} variant="guests" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="trips" label="Trips" icon={Route} />
        <TabButton id="vehicles" label="Vehicles" icon={Car} />
        <TabButton id="drivers" label="Drivers" icon={User} />
        <TabButton id="schedule" label="Schedule" icon={Calendar} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'trips' || activeTab === 'schedule') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 cursor-pointer">
            <Filter size={16} />
            Filter
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Transport Trips</h3>
            <span className="text-xs text-slate-500">{filteredTrips.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length} active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Route</th>
                  <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.filter(t => t.status !== 'completed' && t.status !== 'cancelled').map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{trip.guestName}</div>
                      <div className="text-xs text-slate-500">Room {trip.roomNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        {trip.type === 'airport_pickup' && <Plane size={16} />}
                        {trip.type === 'airport_dropoff' && <Plane size={16} />}
                        {trip.type === 'local_transfer' && <MapPin size={16} />}
                        {trip.type === 'shuttle' && <Car size={16} />}
                        <span className="capitalize">{trip.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600 max-w-xs truncate">{trip.pickupLocation}</div>
                      <div className="text-xs text-slate-500">→ {trip.dropoffLocation}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{trip.scheduledDate}</div>
                      <div className="text-xs text-slate-500">{trip.scheduledTime}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(trip.status)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        trip.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        trip.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {trip.paymentStatus.charAt(0).toUpperCase() + trip.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Complete">
                          <CheckCircle2 size={16} />
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

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Vehicle Fleet</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Plate</th>
                  <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Fuel</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{vehicle.name}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{vehicle.type}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{vehicle.plateNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{vehicle.capacity} passengers</td>
                    <td className="px-4 py-3">{getVehicleStatusBadge(vehicle.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${vehicle.fuelLevel > 50 ? 'bg-emerald-500' : vehicle.fuelLevel > 25 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${vehicle.fuelLevel}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-600">{vehicle.fuelLevel}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Maintenance">
                          <Wrench size={16} />
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

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Drivers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Driver</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">License</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold">Active Trips</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{driver.name}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.phone}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{driver.licenseNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        driver.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        driver.status === 'on_trip' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {driver.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{driver.assignedVehicleId || '-'}</td>
                    <td className="px-4 py-3 text-slate-900">{driver.activeTrips}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Call">
                          <Phone size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                          <Edit size={16} />
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

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Today's Schedule</h3>
          <div className="space-y-3">
            {filteredTrips.filter(t => t.scheduledDate === '2026-07-29' || t.scheduledDate === '2026-07-30').map((trip) => (
              <div key={trip.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{trip.guestName}</span>
                      <span className="text-xs text-slate-500">Room {trip.roomNumber}</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {trip.pickupLocation} → {trip.dropoffLocation}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {trip.scheduledDate} at {trip.scheduledTime} · {trip.passengers} passenger(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">{trip.scheduledTime}</div>
                    {trip.cost && <div className="text-sm font-medium text-slate-900">${trip.cost}</div>}
                    <div className="mt-1">{getStatusBadge(trip.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Book Transportation</h3>
              <button onClick={() => setShowTripModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={tripForm.guestName}
                    onChange={(e) => setTripForm({ ...tripForm, guestName: e.target.value })}
                    placeholder="Enter guest name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={tripForm.roomNumber}
                    onChange={(e) => setTripForm({ ...tripForm, roomNumber: e.target.value })}
                    placeholder="Room number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trip Type</label>
                  <select
                    value={tripForm.type}
                    onChange={(e) => setTripForm({ ...tripForm, type: e.target.value as TripType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="airport_pickup">Airport Pickup</option>
                    <option value="airport_dropoff">Airport Drop-off</option>
                    <option value="local_transfer">Local Transfer</option>
                    <option value="shuttle">Shuttle</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Passengers</label>
                  <input
                    type="number"
                    value={tripForm.passengers}
                    onChange={(e) => setTripForm({ ...tripForm, passengers: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Location</label>
                  <input
                    type="text"
                    value={tripForm.pickupLocation}
                    onChange={(e) => setTripForm({ ...tripForm, pickupLocation: e.target.value })}
                    placeholder="Pickup address"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Drop-off Location</label>
                  <input
                    type="text"
                    value={tripForm.dropoffLocation}
                    onChange={(e) => setTripForm({ ...tripForm, dropoffLocation: e.target.value })}
                    placeholder="Drop-off address"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={tripForm.scheduledDate}
                    onChange={(e) => setTripForm({ ...tripForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={tripForm.scheduledTime}
                    onChange={(e) => setTripForm({ ...tripForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flight Number (if airport)</label>
                  <input
                    type="text"
                    value={tripForm.flightNumber}
                    onChange={(e) => setTripForm({ ...tripForm, flightNumber: e.target.value })}
                    placeholder="e.g., ET456"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cost ($)</label>
                  <input
                    type="number"
                    value={tripForm.cost}
                    onChange={(e) => setTripForm({ ...tripForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowTripModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleTripSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Book Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportation;
