/**
 * Loyalty Program Integration Component
 * Manages guest loyalty tiers, points, rewards, and program settings
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Star,
  Crown,
  Gem,
  Gift,
  Ticket,
  Percent,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bed
} from 'lucide-react';

interface LoyaltyMember {
  memberId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  pointsEarned: number;
  pointsRedeemed: number;
  membershipDate: string;
  lastActivity: string;
  staysCount: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'suspended';
  nextTierProgress: number;
  nextTierPoints: number;
}

interface Reward {
  rewardId: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'room_upgrade' | 'free_night' | 'dining' | 'amenities' | 'experience';
  image?: string;
  available: boolean;
  redemptionCount: number;
  expiryDate?: string;
}

interface Transaction {
  transactionId: string;
  memberId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  date: string;
  reference?: string;
}

interface TierBenefit {
  tier: string;
  pointsMultiplier: number;
  roomUpgradePriority: number;
  lateCheckout: string;
  welcomeAmenity: string;
  exclusiveOffers: boolean;
  freeNightsPerYear: number;
  bonusPointsOnSignup: number;
}

const LoyaltyProgram = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'members' | 'rewards' | 'transactions' | 'settings'>('members');
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tierBenefits, setTierBenefits] = useState<TierBenefit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const [membersRes, rewardsRes, transactionsRes, statsRes, tiersRes] = await Promise.all([
        fetch('/api/front-office/loyalty/members'),
        fetch('/api/front-office/loyalty/rewards'),
        fetch('/api/front-office/loyalty/transactions'),
        fetch('/api/front-office/loyalty/stats'),
        fetch('/api/front-office/loyalty/tiers')
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (rewardsRes.ok) setRewards(await rewardsRes.json());
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (tiersRes.ok) setTierBenefits(await tiersRes.json());
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'all' || member.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [members, searchQuery, selectedTier]);

  const getTierIcon = (tier: string) => {
    const icons = {
      bronze: <Crown size={20} />,
      silver: <Star size={20} />,
      gold: <Award size={20} />,
      platinum: <Gem size={20} />
    };
    return icons[tier as keyof typeof icons] || <Star size={20} />;
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-700',
      silver: 'bg-slate-100 text-slate-700',
      gold: 'bg-amber-100 text-amber-700',
      platinum: 'bg-purple-100 text-purple-700'
    };
    return colors[tier as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getRewardCategoryIcon = (category: string) => {
    const icons = {
      room_upgrade: <Bed size={20} />,
      free_night: <Calendar size={20} />,
      dining: <Star size={20} />,
      amenities: <Gift size={20} />,
      experience: <Ticket size={20} />
    };
    return icons[category as keyof typeof icons] || <Gift size={20} />;
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-amber-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Loyalty Program</h2>
          <p className="text-slate-600 mt-1">Manage guest loyalty tiers, points, and rewards</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLoyaltyData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-md rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Members</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-green-600">
                <Star size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Members</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeMembers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg text-amber-600">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Points Issued</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalPointsIssued.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg text-purple-600">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Rewards Redeemed</p>
                <p className="text-3xl font-bold text-slate-900">{stats.rewardsRedeemed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <nav className="flex gap-6 px-6">
          <button
            onClick={() => setView('members')}
            className={`pb-4 px-1 text-sm font-semibold transition-all border-b-2 ${
              view === 'members' 
                ? 'text-amber-600 border-amber-600' 
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setView('rewards')}
            className={`pb-4 px-1 text-sm font-semibold transition-all border-b-2 ${
              view === 'rewards' 
                ? 'text-amber-600 border-amber-600' 
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setView('transactions')}
            className={`pb-4 px-1 text-sm font-semibold transition-all border-b-2 ${
              view === 'transactions' 
                ? 'text-amber-600 border-amber-600' 
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setView('settings')}
            className={`pb-4 px-1 text-sm font-semibold transition-all border-b-2 ${
              view === 'settings' 
                ? 'text-amber-600 border-amber-600' 
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Members View */}
      {view === 'members' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-500">
                  <Filter size={16} />
                </div>
                <select
                  value={selectedTier}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTier(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="all">All Tiers</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
                <Plus size={16} />
                Add Member
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Tier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Stays</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={20} className="animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No members found</td>
                  </tr>
                ) : (
                  filteredMembers.map(member => (
                    <tr key={member.memberId} className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{member.guestName}</p>
                          <p className="text-sm text-slate-600">{member.guestEmail}</p>
                          <p className="text-xs text-slate-500">Since {new Date(member.membershipDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            member.tier === 'platinum' ? 'bg-purple-100 text-purple-600' :
                            member.tier === 'gold' ? 'bg-amber-100 text-amber-600' :
                            member.tier === 'silver' ? 'bg-slate-100 text-slate-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {getTierIcon(member.tier)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(member.tier)}`}>
                            {member.tier}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{member.points.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          {member.nextTierPoints - member.points > 0 
                            ? `${member.nextTierPoints - member.points} to ${member.tier === 'bronze' ? 'Silver' : member.tier === 'silver' ? 'Gold' : member.tier === 'gold' ? 'Platinum' : 'Max'}`
                            : 'Max tier reached'
                          }
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{member.staysCount}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">${member.totalRevenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {member.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span className="text-sm font-medium">{member.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors">View</button>
                          <button className="text-slate-600 hover:text-slate-700 text-sm font-semibold transition-colors">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Rewards View */}
      {view === 'rewards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Available Rewards</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} />
              Add Reward
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <div key={reward.rewardId} className={`bg-white rounded-xl border ${reward.available ? 'border-slate-200' : 'border-slate-100 opacity-60'} p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {getRewardCategoryIcon(reward.category)}
                  </div>
                  {!reward.available && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      Unavailable
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{reward.name}</h4>
                <p className="text-sm text-slate-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Points Cost</p>
                    <p className="font-bold text-slate-900">{reward.pointsCost.toLocaleString()} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Redeemed</p>
                    <p className="font-medium text-slate-900">{reward.redemptionCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions View */}
      {view === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(transaction => (
                <tr key={transaction.transactionId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'earned' ? 'bg-green-100 text-green-700' :
                      transaction.type === 'redeemed' ? 'bg-blue-100 text-blue-700' :
                      transaction.type === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{transaction.description}</td>
                  <td className={`px-6 py-4 font-medium ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{transaction.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings View */}
      {view === 'settings' && (
        <div className="space-y-6">
          <h3 className="font-semibold text-slate-900">Tier Benefits Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tierBenefits.map((benefit, index) => (
              <div key={index} className={`bg-white rounded-xl border border-slate-200 p-6 ${getTierColor(benefit.tier).split(' ').slice(0, 2).join(' ')}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-slate-600">{getTierIcon(benefit.tier)}</div>
                  <h4 className="font-semibold text-slate-900 capitalize">{benefit.tier} Tier</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Points Multiplier</span>
                    <span className="font-medium text-slate-900">{benefit.pointsMultiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room Upgrade Priority</span>
                    <span className="font-medium text-slate-900">{benefit.roomUpgradePriority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Late Checkout</span>
                    <span className="font-medium text-slate-900">{benefit.lateCheckout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Welcome Amenity</span>
                    <span className="font-medium text-slate-900">{benefit.welcomeAmenity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Free Nights/Year</span>
                    <span className="font-medium text-slate-900">{benefit.freeNightsPerYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Signup Bonus</span>
                    <span className="font-medium text-slate-900">{benefit.bonusPointsOnSignup} pts</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                  Edit Benefits
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;
