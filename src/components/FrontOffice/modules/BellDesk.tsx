/**
 * Front Office Bell Desk Module
 * Luggage handling, storage, and guest assistance
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
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
  Home,
  ArrowUp,
  ArrowDown,
  QrCode,
  Printer,
  Receipt
} from 'lucide-react';
import StatCard from '../StatCard';

type LuggageStatus = 'stored' | 'delivered' | 'claimed' | 'pending' | 'in_transit';
type LuggageType = 'suitcase' | 'backpack' | 'duffel' | 'garment_bag' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface LuggageItem {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId?: string;
  type: LuggageType;
  description: string;
  quantity: number;
  status: LuggageStatus;
  storageLocation: string;
  storedAt: string;
  expectedDelivery?: string;
  deliveredAt?: string;
  claimedAt?: string;
  priority: Priority;
  notes: string;
  tagNumber: string;
  weight?: string;
  specialHandling?: string;
}

interface BellStaff {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'break';
  activeTasks: number;
  location: string;
}

const BellDesk = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'luggage' | 'deliveries' | 'staff' | 'history') || 'luggage';
  const setActiveTab = (tab: 'luggage' | 'deliveries' | 'staff' | 'history') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showLuggageModal, setShowLuggageModal] = useState(false);
  const [selectedLuggage, setSelectedLuggage] = useState<LuggageItem | null>(null);

  const [luggageForm, setLuggageForm] = useState({
    guestName: '',
    roomNumber: '',
    reservationId: '',
    type: 'suitcase' as LuggageType,
    description: '',
    quantity: '1',
    storageLocation: '',
    expectedDelivery: '',
    priority: 'medium' as Priority,
    notes: '',
    weight: '',
    specialHandling: ''
  });

  const [luggageItems] = useState<LuggageItem[]>([
    {
      id: 'LUG-001',
      guestName: 'John Smith',
      roomNumber: '301',
      reservationId: 'RES-001',
      type: 'suitcase',
      description: 'Large black suitcase',
      quantity: 2,
      status: 'stored',
      storageLocation: 'Storage A-12',
      storedAt: '2026-07-29 10:30',
      expectedDelivery: '2026-07-29 14:00',
      priority: 'medium',
      notes: 'Guest arriving at 2 PM',
      tagNumber: 'TAG-12345',
      weight: '25 kg',
    },
    {
      id: 'LUG-002',
      guestName: 'Sarah Johnson',
      roomNumber: '205',
      reservationId: 'RES-002',
      type: 'backpack',
      description: 'Hiking backpack',
      quantity: 1,
      status: 'delivered',
      storageLocation: 'Storage B-05',
      storedAt: '2026-07-29 09:00',
      expectedDelivery: '2026-07-29 11:00',
      deliveredAt: '2026-07-29 11:05',
      priority: 'medium',
      notes: 'Delivered to room',
      tagNumber: 'TAG-12346',
      weight: '8 kg',
    },
    {
      id: 'LUG-003',
      guestName: 'Michael Chen',
      roomNumber: '412',
      reservationId: 'RES-003',
      type: 'garment_bag',
      description: 'Business suit garment bag',
      quantity: 1,
      status: 'claimed',
      storageLocation: 'Storage A-08',
      storedAt: '2026-07-28 16:00',
      expectedDelivery: '2026-07-29 08:00',
      deliveredAt: '2026-07-29 08:00',
      claimedAt: '2026-07-29 09:30',
      priority: 'high',
      notes: 'Fragile - handle with care',
      tagNumber: 'TAG-12347',
      specialHandling: 'Fragile',
    },
    {
      id: 'LUG-004',
      guestName: 'Emma Wilson',
      roomNumber: '118',
      reservationId: 'RES-004',
      type: 'duffel',
      description: 'Sports equipment duffel',
      quantity: 1,
      status: 'in_transit',
      storageLocation: 'Bell Desk',
      storedAt: '2026-07-29 12:00',
      expectedDelivery: '2026-07-29 12:30',
      priority: 'low',
      notes: 'Being delivered to room',
      tagNumber: 'TAG-12348',
      weight: '15 kg',
    },
    {
      id: 'LUG-005',
      guestName: 'Robert Brown',
      roomNumber: '320',
      reservationId: 'RES-005',
      type: 'suitcase',
      description: 'Family luggage - 3 suitcases',
      quantity: 3,
      status: 'pending',
      storageLocation: 'Lobby',
      storedAt: '2026-07-29 13:00',
      expectedDelivery: '2026-07-29 15:00',
      priority: 'medium',
      notes: 'Guest checking in at 3 PM',
      tagNumber: 'TAG-12349',
      weight: '40 kg',
    },
  ]);

  const [staff] = useState<BellStaff[]>([
    { id: 'STF-01', name: 'Ahmed Ali', status: 'available', activeTasks: 0, location: 'Bell Desk' },
    { id: 'STF-02', name: 'Bekele Tadesse', status: 'busy', activeTasks: 2, location: 'Floor 3' },
    { id: 'STF-03', name: 'Chala Demissie', status: 'available', activeTasks: 0, location: 'Bell Desk' },
    { id: 'STF-04', name: 'Dawit Abebe', status: 'break', activeTasks: 0, location: 'Break Room' },
  ]);

  const filteredLuggage = luggageItems.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.guestName.toLowerCase().includes(q) ||
      item.roomNumber.toLowerCase().includes(q) ||
      item.tagNumber.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: LuggageStatus) => {
    const config: Record<LuggageStatus, { bg: string; text: string; label: string }> = {
      stored: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Stored' },
      delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' },
      claimed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Claimed' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      in_transit: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Transit' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const handleLuggageSubmit = () => {
    setShowLuggageModal(false);
    setLuggageForm({
      guestName: '',
      roomNumber: '',
      reservationId: '',
      type: 'suitcase',
      description: '',
      quantity: '1',
      storageLocation: '',
      expectedDelivery: '',
      priority: 'medium',
      notes: '',
      weight: '',
      specialHandling: ''
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
    <div className="space-y-6 animate-fade-in" id="bell-desk">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bell Desk</h2>
          <p className="text-sm text-slate-500 mt-1">Luggage handling, storage, and guest assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLuggageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Store Luggage
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="In Storage" value="2" icon={Package} variant="primary" />
        <StatCard label="Pending Delivery" value="2" icon={Clock} variant="alert" />
        <StatCard label="Staff Available" value="2" icon={User} variant="rooms" />
        <StatCard label="Today's Total" value="5" icon={Receipt} variant="revenue" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="luggage" label="Luggage" icon={Package} />
        <TabButton id="deliveries" label="Deliveries" icon={ArrowDown} />
        <TabButton id="staff" label="Staff" icon={User} />
        <TabButton id="history" label="History" icon={Clock} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'luggage' || activeTab === 'history') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by guest, room, or tag..."
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

      {/* Luggage Tab */}
      {activeTab === 'luggage' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Luggage Storage</h3>
            <span className="text-xs text-slate-500">{filteredLuggage.filter(l => l.status === 'stored' || l.status === 'pending' || l.status === 'in_transit').length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tag #</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Delivery</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLuggage.filter(l => l.status === 'stored' || l.status === 'pending' || l.status === 'in_transit').map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{item.tagNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.guestName}</div>
                      <div className="text-xs text-slate-500">{item.quantity} item(s)</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3 text-slate-600">{item.storageLocation}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.expectedDelivery}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLuggage(item)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Deliver">
                          <ArrowDown size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Print tag">
                          <Printer size={16} />
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

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Pending Deliveries</h3>
          <div className="space-y-3">
            {luggageItems.filter(l => l.status === 'pending' || l.status === 'in_transit').map((item) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{item.guestName}</span>
                      <span className="text-xs text-slate-500">Room {item.roomNumber}</span>
                      <span className="font-mono text-xs text-slate-500">{item.tagNumber}</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                    <div className="text-xs text-slate-500 mt-1">Expected: {item.expectedDelivery}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">{item.status.replace('_', ' ')}</span>
                    <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Mark delivered">
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Bell Staff</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Active Tasks</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        member.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        member.status === 'busy' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{member.activeTasks}</td>
                    <td className="px-4 py-3 text-slate-600">{member.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="View tasks">
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

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Luggage History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tag #</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Stored</th>
                  <th className="px-4 py-3 text-left font-semibold">Claimed</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLuggage.filter(l => l.status === 'claimed' || l.status === 'delivered').map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{item.tagNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.guestName}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3 text-slate-600">{item.storedAt}</td>
                    <td className="px-4 py-3 text-slate-600">{item.claimedAt || item.deliveredAt || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Luggage Modal */}
      {showLuggageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Store Luggage</h3>
              <button onClick={() => setShowLuggageModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={luggageForm.guestName}
                    onChange={(e) => setLuggageForm({ ...luggageForm, guestName: e.target.value })}
                    placeholder="Enter guest name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={luggageForm.roomNumber}
                    onChange={(e) => setLuggageForm({ ...luggageForm, roomNumber: e.target.value })}
                    placeholder="Room number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Luggage Type</label>
                  <select
                    value={luggageForm.type}
                    onChange={(e) => setLuggageForm({ ...luggageForm, type: e.target.value as LuggageType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="suitcase">Suitcase</option>
                    <option value="backpack">Backpack</option>
                    <option value="duffel">Duffel Bag</option>
                    <option value="garment_bag">Garment Bag</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={luggageForm.quantity}
                    onChange={(e) => setLuggageForm({ ...luggageForm, quantity: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Storage Location</label>
                  <input
                    type="text"
                    value={luggageForm.storageLocation}
                    onChange={(e) => setLuggageForm({ ...luggageForm, storageLocation: e.target.value })}
                    placeholder="e.g., Storage A-12"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected Delivery</label>
                  <input
                    type="datetime-local"
                    value={luggageForm.expectedDelivery}
                    onChange={(e) => setLuggageForm({ ...luggageForm, expectedDelivery: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                  <input
                    type="text"
                    value={luggageForm.weight}
                    onChange={(e) => setLuggageForm({ ...luggageForm, weight: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={luggageForm.priority}
                    onChange={(e) => setLuggageForm({ ...luggageForm, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={luggageForm.description}
                  onChange={(e) => setLuggageForm({ ...luggageForm, description: e.target.value })}
                  rows={2}
                  placeholder="Describe the luggage..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Special Handling</label>
                <input
                  type="text"
                  value={luggageForm.specialHandling}
                  onChange={(e) => setLuggageForm({ ...luggageForm, specialHandling: e.target.value })}
                  placeholder="e.g., Fragile, Keep cold"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={luggageForm.notes}
                  onChange={(e) => setLuggageForm({ ...luggageForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowLuggageModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleLuggageSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Store Luggage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BellDesk;
