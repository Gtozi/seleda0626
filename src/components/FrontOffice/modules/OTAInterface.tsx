/**
 * Front Office OTA Interface Module
 * Online Travel Agency channel management and distribution
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
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
  Calendar,
  DollarSign,
  TrendingUp,
  Link2,
  Clock,
  BarChart3,
  Settings,
  Hotel
} from 'lucide-react';
import StatCard from '../StatCard';

type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
type SyncStatus = 'synced' | 'pending' | 'failed';
type ChannelType = 'booking_com' | 'expedia' | 'airbnb' | 'agoda' | 'tripadvisor' | 'google' | 'direct' | 'other';

interface OTAChannel {
  id: string;
  name: string;
  type: ChannelType;
  status: ConnectionStatus;
  lastSync: string;
  nextSync: string;
  commissionRate: number;
  bookingCount: number;
  revenue: number;
  active: boolean;
  apiKey?: string;
  settings: {
    autoConfirm: boolean;
    instantBooking: boolean;
    minimumStay: number;
    leadTime: number;
  };
}

interface BookingSync {
  id: string;
  channel: string;
  channelType: ChannelType;
  reservationId: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: SyncStatus;
  syncedAt?: string;
  error?: string;
}

const OTAInterface = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'channels' | 'bookings' | 'inventory' | 'rates' | 'analytics') || 'channels';
  const setActiveTab = (tab: 'channels' | 'bookings' | 'inventory' | 'rates' | 'analytics') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<OTAChannel | null>(null);

  const [channelForm, setChannelForm] = useState({
    name: '',
    type: 'booking_com' as ChannelType,
    commissionRate: '',
    apiKey: '',
    autoConfirm: false,
    instantBooking: false,
    minimumStay: '1',
    leadTime: '0'
  });

  const [channels] = useState<OTAChannel[]>([
    {
      id: 'OTA-001',
      name: 'Booking.com',
      type: 'booking_com',
      status: 'connected',
      lastSync: '2026-07-29 10:30',
      nextSync: '2026-07-29 11:30',
      commissionRate: 15,
      bookingCount: 234,
      revenue: 45600,
      active: true,
      settings: {
        autoConfirm: true,
        instantBooking: true,
        minimumStay: 1,
        leadTime: 0,
      },
    },
    {
      id: 'OTA-002',
      name: 'Expedia',
      type: 'expedia',
      status: 'connected',
      lastSync: '2026-07-29 10:25',
      nextSync: '2026-07-29 11:25',
      commissionRate: 12,
      bookingCount: 156,
      revenue: 32400,
      active: true,
      settings: {
        autoConfirm: true,
        instantBooking: false,
        minimumStay: 1,
        leadTime: 1,
      },
    },
    {
      id: 'OTA-003',
      name: 'Airbnb',
      type: 'airbnb',
      status: 'syncing',
      lastSync: '2026-07-29 10:00',
      nextSync: '2026-07-29 11:00',
      commissionRate: 14,
      bookingCount: 89,
      revenue: 18200,
      active: true,
      settings: {
        autoConfirm: false,
        instantBooking: false,
        minimumStay: 2,
        leadTime: 2,
      },
    },
    {
      id: 'OTA-004',
      name: 'Agoda',
      type: 'agoda',
      status: 'connected',
      lastSync: '2026-07-29 10:20',
      nextSync: '2026-07-29 11:20',
      commissionRate: 13,
      bookingCount: 67,
      revenue: 12500,
      active: true,
      settings: {
        autoConfirm: true,
        instantBooking: true,
        minimumStay: 1,
        leadTime: 0,
      },
    },
    {
      id: 'OTA-005',
      name: 'Google Hotels',
      type: 'google',
      status: 'error',
      lastSync: '2026-07-29 09:00',
      nextSync: '2026-07-29 10:00',
      commissionRate: 10,
      bookingCount: 45,
      revenue: 8900,
      active: false,
      settings: {
        autoConfirm: true,
        instantBooking: true,
        minimumStay: 1,
        leadTime: 0,
      },
    },
  ]);

  const [bookingSyncs] = useState<BookingSync[]>([
    {
      id: 'SYNC-001',
      channel: 'Booking.com',
      channelType: 'booking_com',
      reservationId: 'RES-OTA-001',
      guestName: 'John Smith',
      roomType: 'Deluxe King',
      checkIn: '2026-08-01',
      checkOut: '2026-08-04',
      totalAmount: 450,
      status: 'synced',
      syncedAt: '2026-07-29 10:30',
    },
    {
      id: 'SYNC-002',
      channel: 'Expedia',
      channelType: 'expedia',
      reservationId: 'RES-OTA-002',
      guestName: 'Sarah Johnson',
      roomType: 'Standard Twin',
      checkIn: '2026-08-05',
      checkOut: '2026-08-07',
      totalAmount: 380,
      status: 'synced',
      syncedAt: '2026-07-29 10:25',
    },
    {
      id: 'SYNC-003',
      channel: 'Airbnb',
      channelType: 'airbnb',
      reservationId: 'RES-OTA-003',
      guestName: 'Michael Chen',
      roomType: 'Suite',
      checkIn: '2026-08-10',
      checkOut: '2026-08-12',
      totalAmount: 620,
      status: 'pending',
    },
    {
      id: 'SYNC-004',
      channel: 'Google Hotels',
      channelType: 'google',
      reservationId: 'RES-OTA-004',
      guestName: 'Emma Wilson',
      roomType: 'Deluxe King',
      checkIn: '2026-08-15',
      checkOut: '2026-08-18',
      totalAmount: 540,
      status: 'failed',
      error: 'API authentication failed',
    },
  ]);

  const filteredChannels = channels.filter(ch => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.name.toLowerCase().includes(q) ||
      ch.type.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: ConnectionStatus) => {
    const config: Record<ConnectionStatus, { bg: string; text: string; label: string }> = {
      connected: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Connected' },
      disconnected: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Disconnected' },
      error: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Error' },
      syncing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Syncing' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getSyncStatusBadge = (status: SyncStatus) => {
    const config: Record<SyncStatus, { bg: string; text: string; label: string }> = {
      synced: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Synced' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      failed: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Failed' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const handleChannelSubmit = () => {
    setShowChannelModal(false);
    setChannelForm({
      name: '',
      type: 'booking_com',
      commissionRate: '',
      apiKey: '',
      autoConfirm: false,
      instantBooking: false,
      minimumStay: '1',
      leadTime: '0'
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
    <div className="space-y-6 animate-fade-in" id="ota-interface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">OTA Interface</h2>
          <p className="text-sm text-slate-500 mt-1">Online Travel Agency channel management and distribution</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChannelModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Channel
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Channels" value="4" icon={Globe} variant="primary" />
        <StatCard label="Total Bookings" value="591" icon={Calendar} variant="rooms" />
        <StatCard label="OTA Revenue" value="$117,600" icon={DollarSign} variant="revenue" />
        <StatCard label="Avg Commission" value="13%" icon={TrendingUp} variant="revenue" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="channels" label="Channels" icon={Globe} />
        <TabButton id="bookings" label="Booking Sync" icon={Calendar} />
        <TabButton id="inventory" label="Inventory" icon={Hotel} />
        <TabButton id="rates" label="Rates" icon={DollarSign} />
        <TabButton id="analytics" label="Analytics" icon={BarChart3} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'channels' || activeTab === 'bookings') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search channels or bookings..."
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

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Connected Channels</h3>
            <span className="text-xs text-slate-500">{filteredChannels.length} channels</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Channel</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Commission</th>
                  <th className="px-4 py-3 text-left font-semibold">Bookings</th>
                  <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Sync</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChannels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">{ch.name}</div>
                          <div className="text-xs text-slate-500 capitalize">{ch.type.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ch.status)}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{ch.commissionRate}%</td>
                    <td className="px-4 py-3 text-slate-600">{ch.bookingCount}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${ch.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{ch.lastSync}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedChannel(ch)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Sync now">
                          <RefreshCw size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Settings">
                          <Settings size={16} />
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

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Booking Synchronization</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Channel</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Room Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Dates</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingSyncs.map((sync) => (
                  <tr key={sync.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{sync.channel}</div>
                      <div className="text-xs text-slate-500">{sync.reservationId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{sync.guestName}</td>
                    <td className="px-4 py-3 text-slate-600">{sync.roomType}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{sync.checkIn}</div>
                      <div className="text-xs text-slate-500">to {sync.checkOut}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${sync.totalAmount}</td>
                    <td className="px-4 py-3">
                      {getSyncStatusBadge(sync.status)}
                      {sync.error && <div className="text-xs text-rose-600 mt-1">{sync.error}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {sync.status === 'failed' && (
                          <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer" title="Retry sync">
                            <RefreshCw size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="View">
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

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Inventory Distribution</h3>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-slate-900">Deluxe King</div>
                <div className="text-sm text-slate-500">10 rooms total</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Booking.com</span>
                  <span className="text-slate-900">5 rooms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Expedia</span>
                  <span className="text-slate-900">3 rooms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Direct</span>
                  <span className="text-slate-900">2 rooms</span>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-slate-900">Standard Twin</div>
                <div className="text-sm text-slate-500">15 rooms total</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Booking.com</span>
                  <span className="text-slate-900">8 rooms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Agoda</span>
                  <span className="text-slate-900">4 rooms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Direct</span>
                  <span className="text-slate-900">3 rooms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rates Tab */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Rate Parity & Pricing</h3>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-slate-900">Deluxe King - Standard Rate</div>
                <div className="text-lg font-bold text-slate-900">$150/night</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Booking.com</div>
                  <div className="font-medium text-slate-900">$150</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Expedia</div>
                  <div className="font-medium text-slate-900">$150</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Airbnb</div>
                  <div className="font-medium text-slate-900">$165</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Direct</div>
                  <div className="font-medium text-slate-900">$140</div>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-slate-900">Standard Twin - Standard Rate</div>
                <div className="text-lg font-bold text-slate-900">$120/night</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Booking.com</div>
                  <div className="font-medium text-slate-900">$120</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Expedia</div>
                  <div className="font-medium text-slate-900">$120</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Agoda</div>
                  <div className="font-medium text-slate-900">$125</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-slate-500">Direct</div>
                  <div className="font-medium text-slate-900">$110</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">OTA Performance Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Top Channel</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Booking.com</p>
              <p className="text-sm text-slate-500">234 bookings · $45,600 revenue</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Best Commission Rate</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Google Hotels</p>
              <p className="text-sm text-slate-500">10% commission</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Sync Success Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">97.5%</p>
              <p className="text-sm text-slate-500">Last 30 days</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Booking Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">$199</p>
              <p className="text-sm text-slate-500">Per reservation</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Channel Mix</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">40%</p>
              <p className="text-sm text-slate-500">Direct bookings</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly Growth</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">+18%</p>
              <p className="text-sm text-slate-500">OTA revenue increase</p>
            </div>
          </div>
        </div>
      )}

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add OTA Channel</h3>
              <button onClick={() => setShowChannelModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={channelForm.name}
                    onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                    placeholder="e.g., Booking.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Channel Type</label>
                  <select
                    value={channelForm.type}
                    onChange={(e) => setChannelForm({ ...channelForm, type: e.target.value as ChannelType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="booking_com">Booking.com</option>
                    <option value="expedia">Expedia</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="agoda">Agoda</option>
                    <option value="tripadvisor">TripAdvisor</option>
                    <option value="google">Google Hotels</option>
                    <option value="direct">Direct</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={channelForm.commissionRate}
                    onChange={(e) => setChannelForm({ ...channelForm, commissionRate: e.target.value })}
                    placeholder="e.g., 15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={channelForm.apiKey}
                    onChange={(e) => setChannelForm({ ...channelForm, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Stay (nights)</label>
                  <input
                    type="number"
                    value={channelForm.minimumStay}
                    onChange={(e) => setChannelForm({ ...channelForm, minimumStay: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lead Time (days)</label>
                  <input
                    type="number"
                    value={channelForm.leadTime}
                    onChange={(e) => setChannelForm({ ...channelForm, leadTime: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelForm.autoConfirm}
                    onChange={(e) => setChannelForm({ ...channelForm, autoConfirm: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Auto-confirm bookings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelForm.instantBooking}
                    onChange={(e) => setChannelForm({ ...channelForm, instantBooking: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Enable instant booking</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowChannelModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleChannelSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Link2 size={16} />
                Connect Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTAInterface;
