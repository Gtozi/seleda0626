/**
 * Membership Management Module
 * Manages spa memberships, renewals, benefits, and attendance tracking
 */

import { useState } from 'react';
import {
  Crown,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  MoreVertical,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

interface MembershipManagementModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface Membership {
  id: string;
  memberName: string;
  guestId: string;
  type: 'Monthly' | 'Quarterly' | 'Annual' | 'Family' | 'Corporate' | 'VIP';
  status: 'Active' | 'Expired' | 'Frozen' | 'Pending';
  startDate: string;
  endDate: string;
  price: number;
  benefits: string[];
  visitsRemaining: number;
  totalVisits: number;
  autoRenew: boolean;
  paymentMethod: string;
}

const MembershipManagementModule: React.FC<MembershipManagementModuleProps> = ({
  onViewGuestProfile
}) => {
  const [memberships, setMemberships] = useState<Membership[]>([
    {
      id: 'MBR-001',
      memberName: 'Sarah Johnson',
      guestId: 'GST-001',
      type: 'Annual',
      status: 'Active',
      startDate: '2026-01-15',
      endDate: '2027-01-15',
      price: 1299,
      benefits: ['Unlimited Spa Access', '20% Retail Discount', 'Priority Booking', 'Monthly Massage'],
      visitsRemaining: -1,
      totalVisits: 24,
      autoRenew: true,
      paymentMethod: 'Credit Card'
    },
    {
      id: 'MBR-002',
      memberName: 'Michael Williams',
      guestId: 'GST-002',
      type: 'Monthly',
      status: 'Active',
      startDate: '2026-06-01',
      endDate: '2026-07-31',
      price: 149,
      benefits: ['4 Spa Visits', '10% Retail Discount', 'Standard Booking'],
      visitsRemaining: 2,
      totalVisits: 2,
      autoRenew: true,
      paymentMethod: 'Credit Card'
    },
    {
      id: 'MBR-003',
      memberName: 'Emma Davis',
      guestId: 'GST-003',
      type: 'VIP',
      status: 'Active',
      startDate: '2026-03-01',
      endDate: '2027-03-01',
      price: 2499,
      benefits: ['Unlimited Everything', '30% Retail Discount', 'VIP Booking', 'Personal Concierge', 'Free Guest Passes'],
      visitsRemaining: -1,
      totalVisits: 36,
      autoRenew: true,
      paymentMethod: 'Credit Card'
    },
    {
      id: 'MBR-004',
      memberName: 'James Brown',
      guestId: 'GST-004',
      type: 'Family',
      status: 'Active',
      startDate: '2026-05-15',
      endDate: '2027-05-15',
      price: 1999,
      benefits: ['Family Spa Access (4 members)', '15% Retail Discount', 'Family Booking Priority'],
      visitsRemaining: -1,
      totalVisits: 18,
      autoRenew: false,
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'MBR-005',
      memberName: 'Olivia Wilson',
      guestId: 'GST-005',
      type: 'Quarterly',
      status: 'Expired',
      startDate: '2026-01-01',
      endDate: '2026-04-01',
      price: 399,
      benefits: ['12 Spa Visits', '10% Retail Discount'],
      visitsRemaining: 0,
      totalVisits: 12,
      autoRenew: false,
      paymentMethod: 'Credit Card'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showNewMembershipModal, setShowNewMembershipModal] = useState(false);

  const membershipTypes = ['All', 'Monthly', 'Quarterly', 'Annual', 'Family', 'Corporate', 'VIP'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      case 'Frozen':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Pending':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Corporate':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Family':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      case 'Annual':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Quarterly':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400';
      case 'Monthly':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || membership.status === statusFilter;
    const matchesType = typeFilter === 'All' || membership.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (membershipId: string, newStatus: Membership['status']) => {
    setMemberships(memberships.map(membership =>
      membership.id === membershipId ? { ...membership, status: newStatus } : membership
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Membership Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spa memberships, renewals, and benefits
          </p>
        </div>
        <button
          onClick={() => setShowNewMembershipModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Membership
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
                placeholder="Search memberships..."
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
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Frozen">Frozen</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {membershipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Memberships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemberships.map((membership) => (
          <div key={membership.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Crown size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{membership.memberName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{membership.id}</p>
                </div>
              </div>
              <select
                value={membership.status}
                onChange={(e) => handleStatusChange(membership.id, e.target.value as Membership['status'])}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(membership.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Frozen">Frozen</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(membership.type)}`}>
                {membership.type}
              </span>
              {membership.autoRenew && (
                <div className="flex items-center gap-1 text-emerald-500 text-xs">
                  <CheckCircle2 size={12} />
                  <span>Auto-renew</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${membership.price}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Price</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {membership.visitsRemaining === -1 ? 'Unlimited' : membership.visitsRemaining}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Visits Left</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={14} />
                <span>Expires: {new Date(membership.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp size={14} />
                <span>Total visits: {membership.totalVisits}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onViewGuestProfile?.(membership.guestId)}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View Profile
              </button>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <CreditCard size={16} />
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

      {/* New Membership Modal Placeholder */}
      {showNewMembershipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Membership</h2>
              <button
                onClick={() => setShowNewMembershipModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Membership creation form would be implemented here with guest selection, membership type, benefits, and payment configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewMembershipModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagementModule;