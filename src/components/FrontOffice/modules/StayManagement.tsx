/**
 * Front Office Stay Management Module
 * Room moves, stay extensions, early departures, and occupancy management
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  RefreshCw,
  BedDouble,
  ArrowRightLeft,
  Clock,
  LogOut,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  Save,
  X,
  ChevronDown,
  Home
} from 'lucide-react';
import StatCard from '../StatCard';

type StayStatus = 'active' | 'extended' | 'shortened' | 'room-moved' | 'due-out' | 'due-in' | 'checked-out';
type StayAction = 'none' | 'extend' | 'room-move' | 'early-departure' | 'amend';

interface StayRecord {
  id: string;
  guestName: string;
  reservationId: string;
  roomNumber: string;
  roomType: string;
  originalCheckIn: string;
  originalCheckOut: string;
  currentCheckOut: string;
  originalNights: number;
  currentNights: number;
  adults: number;
  children: number;
  status: StayStatus;
  lastAction: string;
  lastActionDate: string;
  notes: string;
  ratePerNight: number;
  folioBalance: number;
}

const StayManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'overview' | 'extensions' | 'room-moves' | 'early-departures' | 'amend') || 'overview';
  const setActiveTab = (tab: 'overview' | 'extensions' | 'room-moves' | 'early-departures' | 'amend') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStay, setSelectedStay] = useState<StayRecord | null>(null);
  const [actionMode, setActionMode] = useState<StayAction>('none');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [stays] = useState<StayRecord[]>([
    {
      id: 'STY-001',
      guestName: 'John Smith',
      reservationId: 'RES-001',
      roomNumber: '301',
      roomType: 'Deluxe King',
      originalCheckIn: '2026-07-29',
      originalCheckOut: '2026-08-02',
      currentCheckOut: '2026-08-02',
      originalNights: 4,
      currentNights: 4,
      adults: 2,
      children: 0,
      status: 'active',
      lastAction: 'Check-in',
      lastActionDate: '2026-07-29',
      notes: 'Quiet room requested',
      ratePerNight: 145,
      folioBalance: 480,
    },
    {
      id: 'STY-002',
      guestName: 'Sarah Johnson',
      reservationId: 'RES-002',
      roomNumber: '205',
      roomType: 'Standard Twin',
      originalCheckIn: '2026-07-28',
      originalCheckOut: '2026-07-30',
      currentCheckOut: '2026-08-01',
      originalNights: 2,
      currentNights: 4,
      adults: 1,
      children: 1,
      status: 'extended',
      lastAction: 'Extended stay',
      lastActionDate: '2026-07-29',
      notes: 'Guest extended for business meetings',
      ratePerNight: 120,
      folioBalance: 260,
    },
    {
      id: 'STY-003',
      guestName: 'Michael Chen',
      reservationId: 'RES-003',
      roomNumber: '412',
      roomType: 'Executive Suite',
      originalCheckIn: '2026-07-25',
      originalCheckOut: '2026-08-05',
      currentCheckOut: '2026-08-05',
      originalNights: 11,
      currentNights: 11,
      adults: 2,
      children: 0,
      status: 'room-moved',
      lastAction: 'Room move',
      lastActionDate: '2026-07-27',
      notes: 'Moved from 410 due to AC issue',
      ratePerNight: 220,
      folioBalance: 1540,
    },
    {
      id: 'STY-004',
      guestName: 'Emma Wilson',
      reservationId: 'RES-004',
      roomNumber: '118',
      roomType: 'Standard Queen',
      originalCheckIn: '2026-07-30',
      originalCheckOut: '2026-08-03',
      currentCheckOut: '2026-07-31',
      originalNights: 4,
      currentNights: 1,
      adults: 1,
      children: 0,
      status: 'shortened',
      lastAction: 'Early departure',
      lastActionDate: '2026-07-31',
      notes: 'Family emergency',
      ratePerNight: 110,
      folioBalance: 110,
    },
    {
      id: 'STY-005',
      guestName: 'Robert Brown',
      reservationId: 'RES-005',
      roomNumber: '320',
      roomType: 'Deluxe Twin',
      originalCheckIn: '2026-07-31',
      originalCheckOut: '2026-08-04',
      currentCheckOut: '2026-08-04',
      originalNights: 4,
      currentNights: 4,
      adults: 2,
      children: 1,
      status: 'due-in',
      lastAction: 'Reservation created',
      lastActionDate: '2026-07-20',
      notes: 'Late arrival after 22:00',
      ratePerNight: 135,
      folioBalance: 0,
    },
  ]);

  const [availableRooms] = useState([
    { number: '302', type: 'Deluxe King', floor: '3', status: 'ready' },
    { number: '303', type: 'Deluxe King', floor: '3', status: 'ready' },
    { number: '206', type: 'Standard Twin', floor: '2', status: 'ready' },
    { number: '413', type: 'Executive Suite', floor: '4', status: 'ready' },
    { number: '119', type: 'Standard Queen', floor: '1', status: 'ready' },
  ]);

  const filteredStays = stays.filter(stay => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      stay.guestName.toLowerCase().includes(q) ||
      stay.reservationId.toLowerCase().includes(q) ||
      stay.roomNumber.toLowerCase().includes(q) ||
      stay.roomType.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: StayStatus) => {
    const config: Record<StayStatus, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      extended: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Extended' },
      shortened: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Shortened' },
      'room-moved': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Room Moved' },
      'due-out': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Due Out' },
      'due-in': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Due In' },
      'checked-out': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Checked Out' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const openAction = (stay: StayRecord, action: StayAction) => {
    setSelectedStay(stay);
    setActionMode(action);
    setNewCheckOut(stay.currentCheckOut);
    setNewRoomNumber(stay.roomNumber);
    setNewNotes('');
  };

  const closeAction = () => {
    setSelectedStay(null);
    setActionMode('none');
  };

  const handleActionSubmit = () => {
    // Placeholder for action submission - would integrate with backend
    closeAction();
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
    <div className="space-y-6 animate-fade-in" id="stay-management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stay Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage in-house stays, extensions, room moves, and early departures</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
            <Plus size={16} />
            New Action
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Stays" value="128" icon={BedDouble} variant="rooms" />
        <StatCard label="Due Out Today" value="24" icon={LogOut} variant="alert" />
        <StatCard label="Extensions" value="8" icon={Clock} variant="primary" />
        <StatCard label="Room Moves" value="3" icon={ArrowRightLeft} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" label="Overview" icon={Home} />
        <TabButton id="extensions" label="Extensions" icon={Calendar} />
        <TabButton id="room-moves" label="Room Moves" icon={ArrowRightLeft} />
        <TabButton id="early-departures" label="Early Departures" icon={LogOut} />
        <TabButton id="amend" label="Amend Stay" icon={Edit} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search guest, reservation, room..."
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">In-House Stays</h3>
            <span className="text-xs text-slate-500">{filteredStays.length} records found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Check In</th>
                  <th className="px-4 py-3 text-left font-semibold">Check Out</th>
                  <th className="px-4 py-3 text-left font-semibold">Nights</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Action</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStays.map((stay) => (
                  <tr key={stay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{stay.guestName}</div>
                      <div className="text-xs text-slate-500">{stay.reservationId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{stay.roomNumber}</div>
                      <div className="text-xs text-slate-500">{stay.roomType}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{stay.originalCheckIn}</td>
                    <td className="px-4 py-3 text-slate-600">{stay.currentCheckOut}</td>
                    <td className="px-4 py-3 text-slate-600">{stay.currentNights}</td>
                    <td className="px-4 py-3">{getStatusBadge(stay.status)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">${stay.folioBalance}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600">{stay.lastAction}</div>
                      <div className="text-xs text-slate-400">{stay.lastActionDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAction(stay, 'extend')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Extend stay"
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          onClick={() => openAction(stay, 'room-move')}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="Room move"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                        <button
                          onClick={() => openAction(stay, 'early-departure')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Early departure"
                        >
                          <LogOut size={16} />
                        </button>
                        <button
                          onClick={() => openAction(stay, 'amend')}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Amend stay"
                        >
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

      {/* Extensions Tab */}
      {activeTab === 'extensions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Stay Extensions</h3>
          <div className="space-y-4">
            {stays.filter(s => s.status === 'extended' || s.status === 'active').map(stay => (
              <div key={stay.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{stay.guestName} <span className="text-slate-500 text-sm">({stay.reservationId})</span></div>
                  <div className="text-sm text-slate-500 mt-1">Room {stay.roomNumber} · {stay.roomType} · Current departure {stay.currentCheckOut}</div>
                </div>
                <button
                  onClick={() => openAction(stay, 'extend')}
                  className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Extend Stay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Moves Tab */}
      {activeTab === 'room-moves' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Room Moves</h3>
          <div className="space-y-4">
            {stays.filter(s => s.status === 'room-moved' || s.status === 'active').map(stay => (
              <div key={stay.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{stay.guestName} <span className="text-slate-500 text-sm">({stay.reservationId})</span></div>
                  <div className="text-sm text-slate-500 mt-1">Current room {stay.roomNumber} · {stay.roomType}</div>
                </div>
                <button
                  onClick={() => openAction(stay, 'room-move')}
                  className="mt-3 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Move Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Early Departures Tab */}
      {activeTab === 'early-departures' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Early Departures</h3>
          <div className="space-y-4">
            {stays.filter(s => s.status === 'shortened' || s.status === 'active').map(stay => (
              <div key={stay.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{stay.guestName} <span className="text-slate-500 text-sm">({stay.reservationId})</span></div>
                  <div className="text-sm text-slate-500 mt-1">Room {stay.roomNumber} · Original checkout {stay.originalCheckOut}</div>
                </div>
                <button
                  onClick={() => openAction(stay, 'early-departure')}
                  className="mt-3 md:mt-0 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  Process Early Departure
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amend Tab */}
      {activeTab === 'amend' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Amend Stay</h3>
          <p className="text-sm text-slate-500 mb-4">Select a stay from the overview table and use the actions menu to amend details.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStays.slice(0, 6).map(stay => (
              <div key={stay.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                <div className="font-medium text-slate-900">{stay.guestName}</div>
                <div className="text-sm text-slate-500 mt-1">{stay.roomNumber} · {stay.roomType}</div>
                <button
                  onClick={() => openAction(stay, 'amend')}
                  className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Amend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {selectedStay && actionMode !== 'none' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {actionMode === 'extend' && 'Extend Stay'}
                {actionMode === 'room-move' && 'Room Move'}
                {actionMode === 'early-departure' && 'Early Departure'}
                {actionMode === 'amend' && 'Amend Stay'}
              </h3>
              <button onClick={closeAction} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="font-medium text-slate-900">{selectedStay.guestName}</div>
                <div className="text-slate-500">{selectedStay.reservationId} · Room {selectedStay.roomNumber} · {selectedStay.roomType}</div>
                <div className="text-slate-500 mt-1">Current checkout: {selectedStay.currentCheckOut}</div>
              </div>

              {actionMode === 'extend' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Check-out Date</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              {actionMode === 'room-move' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Room</label>
                  <select
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {availableRooms.map(room => (
                      <option key={room.number} value={room.number}>{room.number} · {room.type} · Floor {room.floor}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionMode === 'early-departure' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Actual Departure Date</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-700">Early departures may require rate adjustment and housekeeping notification.</p>
                  </div>
                </div>
              )}

              {actionMode === 'amend' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={newCheckOut}
                      onChange={(e) => setNewCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
                    <input
                      type="text"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  placeholder="Add reason or special instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={closeAction} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleActionSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayManagement;
