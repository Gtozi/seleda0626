/**
 * Front Office Loyalty Interface Module
 * Membership management, rewards, and loyalty programs
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
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
  User,
  Star,
  Gift,
  CreditCard,
  TrendingUp,
  Calendar,
  Crown,
  Percent,
  Clock
} from 'lucide-react';
import StatCard from '../StatCard';

type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
type RewardStatus = 'available' | 'redeemed' | 'expired';
type TransactionType = 'earned' | 'redeemed' | 'bonus' | 'adjustment';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  points: number;
  pointsBalance: number;
  totalSpent: number;
  totalStays: number;
  joinDate: string;
  lastStay: string;
  status: 'active' | 'inactive' | 'suspended';
  preferences: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'room_upgrade' | 'free_night' | 'dining' | 'spa' | 'experience' | 'other';
  status: RewardStatus;
  validFrom: string;
  validTo?: string;
  terms: string;
  image?: string;
}

interface PointsTransaction {
  id: string;
  memberId: string;
  memberName: string;
  type: TransactionType;
  points: number;
  description: string;
  date: string;
  reference?: string;
}

const Loyalty = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'members' | 'rewards' | 'transactions' | 'tiers') || 'members';
  const setActiveTab = (tab: 'members' | 'rewards' | 'transactions' | 'tiers') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'bronze' as MembershipTier,
    initialPoints: '0'
  });

  const [members] = useState<Member[]>([
    {
      id: 'MEM-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+251 911 123 4567',
      tier: 'gold',
      points: 15000,
      pointsBalance: 8500,
      totalSpent: 12500,
      totalStays: 12,
      joinDate: '2025-01-15',
      lastStay: '2026-07-28',
      status: 'active',
      preferences: ['Room upgrade', 'Late checkout'],
    },
    {
      id: 'MEM-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+251 911 234 5678',
      tier: 'platinum',
      points: 35000,
      pointsBalance: 28000,
      totalSpent: 28000,
      totalStays: 25,
      joinDate: '2024-06-20',
      lastStay: '2026-07-29',
      status: 'active',
      preferences: ['Spa access', 'Airport transfer'],
    },
    {
      id: 'MEM-003',
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      phone: '+251 911 345 6789',
      tier: 'silver',
      points: 7500,
      pointsBalance: 3200,
      totalSpent: 5200,
      totalStays: 5,
      joinDate: '2025-09-10',
      lastStay: '2026-07-25',
      status: 'active',
      preferences: ['Early check-in'],
    },
    {
      id: 'MEM-004',
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      phone: '+251 911 456 7890',
      tier: 'bronze',
      points: 2500,
      pointsBalance: 1500,
      totalSpent: 1800,
      totalStays: 2,
      joinDate: '2026-05-01',
      lastStay: '2026-07-20',
      status: 'active',
      preferences: [],
    },
    {
      id: 'MEM-005',
      name: 'Robert Brown',
      email: 'r.brown@email.com',
      phone: '+251 911 567 8901',
      tier: 'diamond',
      points: 50000,
      pointsBalance: 42000,
      totalSpent: 45000,
      totalStays: 40,
      joinDate: '2023-03-15',
      lastStay: '2026-07-15',
      status: 'active',
      preferences: ['Suite upgrade', 'Butler service', 'VIP amenities'],
    },
  ]);

  const [rewards] = useState<Reward[]>([
    {
      id: 'RWD-001',
      name: 'Free Night',
      description: 'Complimentary night in standard room',
      pointsRequired: 10000,
      category: 'free_night',
      status: 'available',
      validFrom: '2026-01-01',
      terms: 'Subject to availability, blackout dates apply',
    },
    {
      id: 'RWD-002',
      name: 'Room Upgrade',
      description: 'Upgrade to next room category',
      pointsRequired: 5000,
      category: 'room_upgrade',
      status: 'available',
      validFrom: '2026-01-01',
      terms: 'Based on availability at check-in',
    },
    {
      id: 'RWD-003',
      name: 'Spa Package',
      description: 'Full day spa treatment',
      pointsRequired: 7500,
      category: 'spa',
      status: 'available',
      validFrom: '2026-01-01',
      terms: 'Includes massage, facial, and access to facilities',
    },
    {
      id: 'RWD-004',
      name: 'Dining Credit',
      description: '$100 dining credit',
      pointsRequired: 3000,
      category: 'dining',
      status: 'available',
      validFrom: '2026-01-01',
      terms: 'Valid at all hotel restaurants',
    },
    {
      id: 'RWD-005',
      name: 'Airport Transfer',
      description: 'Complimentary airport transfer',
      pointsRequired: 2000,
      category: 'experience',
      status: 'available',
      validFrom: '2026-01-01',
      terms: 'Must be booked 48 hours in advance',
    },
  ]);

  const [transactions] = useState<PointsTransaction[]>([
    {
      id: 'TXN-001',
      memberId: 'MEM-001',
      memberName: 'John Smith',
      type: 'earned',
      points: 500,
      description: 'Stay points - 3 nights',
      date: '2026-07-28',
      reference: 'RES-001',
    },
    {
      id: 'TXN-002',
      memberId: 'MEM-002',
      memberName: 'Sarah Johnson',
      type: 'redeemed',
      points: -3000,
      description: 'Redeemed: Dining Credit',
      date: '2026-07-29',
      reference: 'RWD-004',
    },
    {
      id: 'TXN-003',
      memberId: 'MEM-003',
      memberName: 'Michael Chen',
      type: 'earned',
      points: 300,
      description: 'Stay points - 2 nights',
      date: '2026-07-25',
      reference: 'RES-003',
    },
    {
      id: 'TXN-004',
      memberId: 'MEM-005',
      memberName: 'Robert Brown',
      type: 'bonus',
      points: 1000,
      description: 'Diamond tier bonus',
      date: '2026-07-15',
    },
    {
      id: 'TXN-005',
      memberId: 'MEM-001',
      memberName: 'John Smith',
      type: 'redeemed',
      points: -5000,
      description: 'Redeemed: Room Upgrade',
      date: '2026-07-20',
      reference: 'RWD-002',
    },
  ]);

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.phone.toLowerCase().includes(q)
    );
  });

  const getTierBadge = (tier: MembershipTier) => {
    const config: Record<MembershipTier, { bg: string; text: string; label: string; icon: any }> = {
      bronze: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Bronze', icon: Award },
      silver: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Silver', icon: Star },
      gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Gold', icon: Star },
      platinum: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Platinum', icon: Crown },
      diamond: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Diamond', icon: Crown },
    };
    const c = config[tier];
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        <c.icon size={12} />
        {c.label}
      </span>
    );
  };

  const getTierColor = (tier: MembershipTier) => {
    const colors: Record<MembershipTier, string> = {
      bronze: 'bg-amber-500',
      silver: 'bg-slate-500',
      gold: 'bg-yellow-500',
      platinum: 'bg-indigo-500',
      diamond: 'bg-cyan-500',
    };
    return colors[tier];
  };

  const handleMemberSubmit = () => {
    setShowMemberModal(false);
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      tier: 'bronze',
      initialPoints: '0'
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
    <div className="space-y-6 animate-fade-in" id="loyalty">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Loyalty Interface</h2>
          <p className="text-sm text-slate-500 mt-1">Membership management, rewards, and loyalty programs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMemberModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Member
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value="84" icon={User} variant="guests" />
        <StatCard label="Active Members" value="78" icon={CheckCircle2} variant="guests" />
        <StatCard label="Points Issued" value="125K" icon={Star} variant="revenue" />
        <StatCard label="Rewards Redeemed" value="156" icon={Gift} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="members" label="Members" icon={User} />
        <TabButton id="rewards" label="Rewards" icon={Gift} />
        <TabButton id="transactions" label="Transactions" icon={CreditCard} />
        <TabButton id="tiers" label="Tiers" icon={Crown} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'members' || activeTab === 'transactions') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members..."
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

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Loyalty Members</h3>
            <span className="text-xs text-slate-500">{filteredMembers.length} members</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Member</th>
                  <th className="px-4 py-3 text-left font-semibold">Tier</th>
                  <th className="px-4 py-3 text-left font-semibold">Points</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Spent</th>
                  <th className="px-4 py-3 text-left font-semibold">Stays</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">{getTierBadge(member.tier)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{member.pointsBalance.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">of {member.points.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-900">${member.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{member.totalStays}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
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

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Available Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.filter(r => r.status === 'available').map((reward) => (
              <div key={reward.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift size={20} className="text-indigo-600" />
                    <span className="font-medium text-slate-900">{reward.name}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{reward.pointsRequired.toLocaleString()} pts</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
                <div className="text-xs text-slate-500 mb-2">{reward.terms}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 capitalize">{reward.category.replace('_', ' ')}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Points Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Member</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Points</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{txn.memberName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        txn.type === 'earned' ? 'bg-emerald-100 text-emerald-700' :
                        txn.type === 'redeemed' ? 'bg-rose-100 text-rose-700' :
                        txn.type === 'bonus' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${txn.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {txn.points > 0 ? '+' : ''}{txn.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{txn.description}</td>
                    <td className="px-4 py-3 text-slate-600">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Membership Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { tier: 'bronze' as MembershipTier, points: 0, benefits: ['1 point per $1 spent', 'Birthday bonus', 'Priority check-in'] },
              { tier: 'silver' as MembershipTier, points: 5000, benefits: ['1.25 points per $1 spent', 'Room upgrade subject to availability', 'Late checkout (2 PM)'] },
              { tier: 'gold' as MembershipTier, points: 15000, benefits: ['1.5 points per $1 spent', 'Guaranteed room upgrade', 'Late checkout (3 PM)', 'Welcome amenity'] },
              { tier: 'platinum' as MembershipTier, points: 30000, benefits: ['2 points per $1 spent', 'Suite upgrade', 'Early check-in (11 AM)', 'Complimentary breakfast', 'Club access'] },
              { tier: 'diamond' as MembershipTier, points: 50000, benefits: ['2.5 points per $1 spent', 'Butler service', 'Early check-in (10 AM)', 'Late checkout (4 PM)', 'All-inclusive amenities', 'VIP transfers'] },
            ].map((tierInfo) => (
              <div key={tierInfo.tier} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  {getTierBadge(tierInfo.tier)}
                  <span className="text-sm text-slate-600">{tierInfo.points.toLocaleString()}+ pts</span>
                </div>
                <ul className="space-y-2">
                  {tierInfo.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add Loyalty Member</h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="+251 9XX XXX XXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Initial Tier</label>
                <select
                  value={memberForm.tier}
                  onChange={(e) => setMemberForm({ ...memberForm, tier: e.target.value as MembershipTier })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Initial Points</label>
                <input
                  type="number"
                  value={memberForm.initialPoints}
                  onChange={(e) => setMemberForm({ ...memberForm, initialPoints: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleMemberSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
