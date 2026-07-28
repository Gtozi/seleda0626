/**
 * Group Booking Workflow Enhancement Component
 * Enhanced group booking management with room allocation, contracts, and billing
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Bed,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Save,
  ArrowRight,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Info
} from 'lucide-react';

interface GroupBooking {
  id: string;
  groupName: string;
  company: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount: number;
  guestCount: number;
  roomType: string;
  ratePerRoom: number;
  totalAmount: number;
  status: 'inquiry' | 'tentative' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  depositRequired: number;
  depositPaid: number;
  contractSent: boolean;
  contractSigned: boolean;
  specialRequests: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RoomAllocation {
  id: string;
  groupBookingId: string;
  roomNumber: string;
  roomType: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'assigned' | 'checked_in' | 'checked_out';
}

interface BillingItem {
  id: string;
  groupBookingId: string;
  description: string;
  amount: number;
  type: 'room_charge' | 'service' | 'adjustment' | 'deposit';
  date: Date;
  status: 'pending' | 'posted' | 'paid';
}

const GroupBookingWorkflow = () => {
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'details' | 'allocation' | 'billing' | 'contract'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroupBookings = async () => {
    try {
      const res = await fetch('/api/front-office/group-bookings');
      if (res.ok) {
        const data = await res.json();
        setGroupBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch group bookings:', error);
    }
  };

  const fetchRoomAllocations = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/front-office/group-bookings/${bookingId}/allocations`);
      if (res.ok) {
        const data = await res.json();
        setRoomAllocations(data);
      }
    } catch (error) {
      console.error('Failed to fetch room allocations:', error);
    }
  };

  const fetchBillingItems = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/front-office/group-bookings/${bookingId}/billing`);
      if (res.ok) {
        const data = await res.json();
        setBillingItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch billing items:', error);
    }
  };

  useEffect(() => {
    fetchGroupBookings();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      fetchRoomAllocations(selectedBooking.id);
      fetchBillingItems(selectedBooking.id);
    }
  }, [selectedBooking]);

  const filteredBookings = useMemo(() => {
    return groupBookings.filter(booking => {
      const matchesSearch = 
        booking.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [groupBookings, searchQuery, selectedStatus]);

  const stats = useMemo(() => ({
    totalBookings: groupBookings.length,
    activeBookings: groupBookings.filter(b => ['inquiry', 'tentative', 'confirmed'].includes(b.status)).length,
    confirmedBookings: groupBookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: groupBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    pendingDeposits: groupBookings.filter(b => b.depositPaid < b.depositRequired).length
  }), [groupBookings]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/front-office/group-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchGroupBookings();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSendContract = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/front-office/group-bookings/${bookingId}/contract`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchGroupBookings();
      }
    } catch (error) {
      console.error('Failed to send contract:', error);
    }
  };

  const handleAddAllocation = async (allocation: Partial<RoomAllocation>) => {
    try {
      const res = await fetch(`/api/front-office/group-bookings/${selectedBooking?.id}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocation)
      });
      if (res.ok) {
        if (selectedBooking) {
          await fetchRoomAllocations(selectedBooking.id);
        }
      }
    } catch (error) {
      console.error('Failed to add allocation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      inquiry: 'bg-slate-100 text-slate-700',
      tentative: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-green-100 text-green-700',
      checked_in: 'bg-blue-100 text-blue-700',
      checked_out: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Group Booking Workflow</h2>
          <p className="text-slate-600">Enhanced group booking management with allocation and billing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGroupBookings}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Group Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.confirmedBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Deposits</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingDeposits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="inquiry">Inquiry</option>
              <option value="tentative">Tentative</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Group</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rooms/Guests</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Deposit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">No group bookings found</td>
              </tr>
            ) : (
              filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{booking.groupName}</p>
                      <p className="text-sm text-slate-600">{booking.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-900">{booking.contactPerson}</p>
                      <p className="text-sm text-slate-600">{booking.contactEmail}</p>
                      <p className="text-sm text-slate-600">{booking.contactPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      <p>{booking.checkInDate}</p>
                      <p>{booking.checkOutDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      <p>{booking.roomCount} rooms</p>
                      <p>{booking.guestCount} guests</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">${booking.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">${booking.ratePerRoom}/room</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">${booking.depositPaid}/${booking.depositRequired}</p>
                    {booking.depositPaid < booking.depositRequired && (
                      <p className="text-xs text-amber-600">Pending</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setView('details');
                        }}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      {!booking.contractSent && (
                        <button
                          onClick={() => handleSendContract(booking.id)}
                          className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                          title="Send Contract"
                        >
                          <FileText size={16} className="text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details View */}
      {view === 'details' && selectedBooking && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Booking Details</h3>
            <button
              onClick={() => {
                setSelectedBooking(null);
                setView('list');
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Group Name</p>
                  <p className="font-medium text-slate-900">{selectedBooking.groupName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Company</p>
                  <p className="font-medium text-slate-900">{selectedBooking.company}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Contact Person</p>
                  <p className="font-medium text-slate-900">{selectedBooking.contactPerson}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{selectedBooking.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium text-slate-900">{selectedBooking.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Dates</p>
                  <p className="font-medium text-slate-900">{selectedBooking.checkInDate} - {selectedBooking.checkOutDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Special Requests</p>
                <p className="text-sm text-slate-900">{selectedBooking.specialRequests || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setView('allocation')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Bed size={16} />
              Room Allocation
            </button>
            <button
              onClick={() => setView('billing')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <DollarSign size={16} />
              Billing
            </button>
            <button
              onClick={() => setView('contract')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              Contract
            </button>
          </div>
        </div>
      )}

      {/* Room Allocation View */}
      {view === 'allocation' && selectedBooking && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Room Allocation</h3>
            <button
              onClick={() => setView('details')}
              className="text-slate-600 hover:text-slate-900"
            >
              Back to Details
            </button>
          </div>

          <div className="space-y-3">
            {roomAllocations.length === 0 ? (
              <p className="text-sm text-slate-600">No room allocations yet</p>
            ) : (
              roomAllocations.map(allocation => (
                <div key={allocation.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Room {allocation.roomNumber}</p>
                    <p className="text-sm text-slate-600">{allocation.guestName}</p>
                    <p className="text-xs text-slate-500">{allocation.checkInDate} - {allocation.checkOutDate}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}>
                    {allocation.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => handleAddAllocation({})}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Room Allocation
          </button>
        </div>
      )}

      {/* Billing View */}
      {view === 'billing' && selectedBooking && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
            <button
              onClick={() => setView('details')}
              className="text-slate-600 hover:text-slate-900"
            >
              Back to Details
            </button>
          </div>

          <div className="space-y-3">
            {billingItems.length === 0 ? (
              <p className="text-sm text-slate-600">No billing items yet</p>
            ) : (
              billingItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.description}</p>
                    <p className="text-sm text-slate-600 capitalize">{item.type}</p>
                    <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">${item.amount.toLocaleString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">${selectedBooking.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBookingWorkflow;
