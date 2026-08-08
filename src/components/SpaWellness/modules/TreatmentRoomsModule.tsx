/**
 * Treatment Rooms Module
 * Manages treatment room availability, scheduling, maintenance, and equipment
 */

import { useState } from 'react';
import {
  Home,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  MoreVertical,
  MapPin,
  Users,
  Sparkles
} from 'lucide-react';

interface TreatmentRoom {
  id: string;
  name: string;
  type: 'Massage Room' | 'Couples Room' | 'Facial Room' | 'Hydrotherapy Room' | 'Salon Station' | 'Consultation Room' | 'Yoga Studio';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
  capacity: number;
  currentOccupancy: number;
  equipment: string[];
  features: string[];
  lastMaintenance: string;
  nextMaintenance: string;
}

const TreatmentRoomsModule: React.FC = () => {
  const [rooms, setRooms] = useState<TreatmentRoom[]>([
    {
      id: 'ROOM-001',
      name: 'Massage Room 1',
      type: 'Massage Room',
      status: 'Occupied',
      capacity: 2,
      currentOccupancy: 2,
      equipment: ['Massage Table', 'Hot Stone Heater', 'Aromatherapy Diffuser'],
      features: ['Sound System', 'Dimmable Lighting', 'Temperature Control'],
      lastMaintenance: '2026-07-15',
      nextMaintenance: '2026-08-15'
    },
    {
      id: 'ROOM-002',
      name: 'Massage Room 2',
      type: 'Massage Room',
      status: 'Available',
      capacity: 2,
      currentOccupancy: 0,
      equipment: ['Massage Table', 'Hot Stone Heater'],
      features: ['Sound System', 'Dimmable Lighting'],
      lastMaintenance: '2026-07-10',
      nextMaintenance: '2026-08-10'
    },
    {
      id: 'ROOM-003',
      name: 'Couples Suite',
      type: 'Couples Room',
      status: 'Available',
      capacity: 4,
      currentOccupancy: 0,
      equipment: ['2 Massage Tables', 'Jacuzzi', 'Champagne Cooler'],
      features: ['Privacy Curtains', 'Sound System', 'Ambient Lighting', 'Mini Bar'],
      lastMaintenance: '2026-07-20',
      nextMaintenance: '2026-08-20'
    },
    {
      id: 'ROOM-004',
      name: 'Facial Room 1',
      type: 'Facial Room',
      status: 'Occupied',
      capacity: 1,
      currentOccupancy: 1,
      equipment: ['Facial Bed', 'Steamer', 'Magnifying Lamp', 'Product Warmer'],
      features: ['LED Lighting', 'Extraction System', 'Storage Cabinet'],
      lastMaintenance: '2026-07-18',
      nextMaintenance: '2026-08-18'
    },
    {
      id: 'ROOM-005',
      name: 'Hydrotherapy Room',
      type: 'Hydrotherapy Room',
      status: 'Maintenance',
      capacity: 2,
      currentOccupancy: 0,
      equipment: ['Hydrotherapy Tub', 'Vichy Shower', 'Body Wrap Station'],
      features: ['Temperature Control', 'Water Jets', 'Aromatherapy System'],
      lastMaintenance: '2026-07-01',
      nextMaintenance: '2026-07-31'
    },
    {
      id: 'ROOM-006',
      name: 'Salon Station 1',
      type: 'Salon Station',
      status: 'Available',
      capacity: 1,
      currentOccupancy: 0,
      equipment: ['Styling Chair', 'Mirror Station', 'Hair Dryer'],
      features: ['Electrical Outlets', 'Tool Storage', 'Lighting'],
      lastMaintenance: '2026-07-12',
      nextMaintenance: '2026-08-12'
    },
    {
      id: 'ROOM-007',
      name: 'Yoga Studio',
      type: 'Yoga Studio',
      status: 'Available',
      capacity: 15,
      currentOccupancy: 0,
      equipment: ['Yoga Mats', 'Blocks', 'Straps', 'Bolsters'],
      features: ['Hardwood Floor', 'Mirrors', 'Sound System', 'Climate Control'],
      lastMaintenance: '2026-07-25',
      nextMaintenance: '2026-08-25'
    },
    {
      id: 'ROOM-008',
      name: 'Consultation Room',
      type: 'Consultation Room',
      status: 'Available',
      capacity: 4,
      currentOccupancy: 0,
      equipment: ['Consultation Table', 'Computer Station', 'Printer'],
      features: ['Privacy Glass', 'Whiteboard', 'Display Screen'],
      lastMaintenance: '2026-07-08',
      nextMaintenance: '2026-08-08'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);

  const roomTypes = ['All', 'Massage Room', 'Couples Room', 'Facial Room', 'Hydrotherapy Room', 'Salon Station', 'Consultation Room', 'Yoga Studio'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Occupied':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Cleaning':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <CheckCircle2 size={16} />;
      case 'Occupied':
        return <Users size={16} />;
      case 'Maintenance':
        return <Wrench size={16} />;
      case 'Cleaning':
        return <Sparkles size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
    const matchesType = typeFilter === 'All' || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (roomId: string, newStatus: TreatmentRoom['status']) => {
    setRooms(rooms.map(room =>
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Treatment Rooms</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage room availability, scheduling, and maintenance
          </p>
        </div>
        <button
          onClick={() => setShowNewRoomModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Room
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
                placeholder="Search rooms..."
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
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cleaning">Cleaning</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Home size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{room.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{room.type}</p>
                </div>
              </div>
              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value as TreatmentRoom['status'])}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                <span className="font-medium text-slate-900 dark:text-white">{room.currentOccupancy}/{room.capacity}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Wrench size={14} />
                <span className="truncate">Next: {new Date(room.nextMaintenance).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin size={14} />
                <span className="truncate">{room.equipment.slice(0, 2).join(', ')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">{room.id}</span>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Calendar size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Room Modal Placeholder */}
      {showNewRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Room</h2>
              <button
                onClick={() => setShowNewRoomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Room creation form would be implemented here with room type, capacity, equipment, and feature selection.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewRoomModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentRoomsModule;