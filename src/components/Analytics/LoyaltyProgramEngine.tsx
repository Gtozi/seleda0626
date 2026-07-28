/**
 * Loyalty Program Engine
 * Points-based loyalty system with tier management, reward redemption, and campaign management
 */

import React, { useState, useMemo } from 'react';
import {
  Crown,
  Star,
  Gem,
  Award,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Target,
  Plus,
  Search,
  Filter,
  Download,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface LoyaltyMember {
  memberId: string;
  guestId: string;
  guestName: string;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  pointsBalance: number;
  pointsEarned: number;
  pointsRedeemed: number;
  joinDate: string;
  lastActivity: string;
  staysThisYear: number;
  revenueThisYear: number;
  nextTierProgress: number;
}

interface LoyaltyTransaction {
  transactionId: string;
  memberId: string;
  memberName: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Reward {
  rewardId: string;
  rewardName: string;
  description: string;
  pointsCost: number;
  tierRequirement: 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'room_upgrade' | 'free_night' | 'dining' | 'spa' | 'experience' | 'merchandise';
  available: boolean;
  redemptionCount: number;
  expiryDate?: string;
}

interface Campaign {
  campaignId: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  bonusMultiplier: number;
  targetTier?: 'silver' | 'gold' | 'platinum' | 'diamond';
  status: 'active' | 'scheduled' | 'ended';
  participants: number;
  pointsAwarded: number;
}

const mockMembers: LoyaltyMember[] = [
  {
    memberId: 'LM-001',
    guestId: 'G-1001',
    guestName: 'John Smith',
    tier: 'platinum',
    pointsBalance: 24500,
    pointsEarned: 45200,
    pointsRedeemed: 20700,
    joinDate: '2024-03-15',
    lastActivity: '2026-06-28',
    staysThisYear: 8,
    revenueThisYear: 28500,
    nextTierProgress: 75
  },
  {
    memberId: 'LM-002',
    guestId: 'G-1002',
    guestName: 'Sarah Johnson',
    tier: 'gold',
    pointsBalance: 12300,
    pointsEarned: 28500,
    pointsRedeemed: 16200,
    joinDate: '2024-08-22',
    lastActivity: '2026-05-22',
    staysThisYear: 4,
    revenueThisYear: 14200,
    nextTierProgress: 60
  },
  {
    memberId: 'LM-003',
    guestId: 'G-1003',
    guestName: 'Michael Brown',
    tier: 'diamond',
    pointsBalance: 45800,
    pointsEarned: 67800,
    pointsRedeemed: 22000,
    joinDate: '2023-11-10',
    lastActivity: '2026-06-28',
    staysThisYear: 12,
    revenueThisYear: 42300,
    nextTierProgress: 100
  },
  {
    memberId: 'LM-004',
    guestId: 'G-1004',
    guestName: 'Emily Davis',
    tier: 'silver',
    pointsBalance: 3200,
    pointsEarned: 12300,
    pointsRedeemed: 9100,
    joinDate: '2025-01-05',
    lastActivity: '2026-04-10',
    staysThisYear: 2,
    revenueThisYear: 5800,
    nextTierProgress: 35
  },
  {
    memberId: 'LM-005',
    guestId: 'G-1005',
    guestName: 'Robert Wilson',
    tier: 'gold',
    pointsBalance: 18900,
    pointsEarned: 38900,
    pointsRedeemed: 20000,
    joinDate: '2024-06-18',
    lastActivity: '2026-06-05',
    staysThisYear: 6,
    revenueThisYear: 21500,
    nextTierProgress: 82
  }
];

const mockTransactions: LoyaltyTransaction[] = [
  {
    transactionId: 'LT-001',
    memberId: 'LM-001',
    memberName: 'John Smith',
    type: 'earn',
    points: 1200,
    reason: 'Stay completed',
    referenceType: 'reservation',
    referenceId: 'RES-4523',
    timestamp: '2026-06-28T14:30:00Z',
    status: 'completed'
  },
  {
    transactionId: 'LT-002',
    memberId: 'LM-003',
    memberName: 'Michael Brown',
    type: 'redeem',
    points: -5000,
    reason: 'Free night redemption',
    referenceType: 'reward',
    referenceId: 'RWD-102',
    timestamp: '2026-06-27T09:15:00Z',
    status: 'completed'
  },
  {
    transactionId: 'LT-003',
    memberId: 'LM-002',
    memberName: 'Sarah Johnson',
    type: 'earn',
    points: 850,
    reason: 'Stay completed',
    referenceType: 'reservation',
    referenceId: 'RES-4524',
    timestamp: '2026-06-26T16:45:00Z',
    status: 'completed'
  },
  {
    transactionId: 'LT-004',
    memberId: 'LM-005',
    memberName: 'Robert Wilson',
    type: 'earn',
    points: 1500,
    reason: 'Bonus: Double points weekend',
    referenceType: 'campaign',
    referenceId: 'CMP-2024',
    timestamp: '2026-06-25T11:20:00Z',
    status: 'completed'
  },
  {
    transactionId: 'LT-005',
    memberId: 'LM-001',
    memberName: 'John Smith',
    type: 'redeem',
    points: -3000,
    reason: 'Spa package redemption',
    referenceType: 'reward',
    referenceId: 'RWD-205',
    timestamp: '2026-06-24T15:00:00Z',
    status: 'completed'
  }
];

const mockRewards: Reward[] = [
  {
    rewardId: 'RWD-001',
    rewardName: 'Room Upgrade',
    description: 'Upgrade to next room category',
    pointsCost: 5000,
    tierRequirement: 'silver',
    category: 'room_upgrade',
    available: true,
    redemptionCount: 45,
  },
  {
    rewardId: 'RWD-002',
    rewardName: 'Free Night',
    description: 'Complimentary night stay (standard room)',
    pointsCost: 15000,
    tierRequirement: 'gold',
    category: 'free_night',
    available: true,
    redemptionCount: 23,
  },
  {
    rewardId: 'RWD-003',
    rewardName: 'Spa Treatment',
    description: '60-minute massage or facial',
    pointsCost: 3000,
    tierRequirement: 'silver',
    category: 'spa',
    available: true,
    redemptionCount: 67,
  },
  {
    rewardId: 'RWD-004',
    rewardName: 'Fine Dining',
    description: '$100 dining credit',
    pointsCost: 4000,
    tierRequirement: 'gold',
    category: 'dining',
    available: true,
    redemptionCount: 34,
  },
  {
    rewardId: 'RWD-005',
    rewardName: 'Suite Upgrade',
    description: 'Upgrade to suite category',
    pointsCost: 10000,
    tierRequirement: 'platinum',
    category: 'room_upgrade',
    available: true,
    redemptionCount: 12,
  },
  {
    rewardId: 'RWD-006',
    rewardName: 'Exclusive Experience',
    description: 'Private dinner with chef',
    pointsCost: 25000,
    tierRequirement: 'diamond',
    category: 'experience',
    available: true,
    redemptionCount: 5,
  }
];

const mockCampaigns: Campaign[] = [
  {
    campaignId: 'CMP-001',
    campaignName: 'Summer Double Points',
    description: 'Earn 2x points on all stays',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    bonusMultiplier: 2,
    status: 'active',
    participants: 234,
    pointsAwarded: 45600
  },
  {
    campaignId: 'CMP-002',
    campaignName: 'Gold Member Bonus',
    description: 'Extra 500 points for gold members',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    bonusMultiplier: 1.5,
    targetTier: 'gold',
    status: 'active',
    participants: 89,
    pointsAwarded: 22300
  },
  {
    campaignId: 'CMP-003',
    campaignName: 'Platinum Exclusive',
    description: 'Triple points for platinum members',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    bonusMultiplier: 3,
    targetTier: 'platinum',
    status: 'scheduled',
    participants: 0,
    pointsAwarded: 0
  }
];

const tierConfig = {
  silver: { icon: Shield, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800', pointsRequired: 0 },
  gold: { icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30', pointsRequired: 10000 },
  platinum: { icon: Award, color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', pointsRequired: 25000 },
  diamond: { icon: Crown, color: 'text-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', pointsRequired: 50000 }
};

const StatCard = ({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon: any;
  color: string;
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold ${change.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          <TrendingUp size={14} />
          <span>{Math.abs(change.value)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
  </div>
);

export default function LoyaltyProgramEngine() {
  const [activeTab, setActiveTab] = useState<'members' | 'transactions' | 'rewards' | 'campaigns'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | 'silver' | 'gold' | 'platinum' | 'diamond'>('all');

  const totalPoints = useMemo(() => mockMembers.reduce((sum, member) => sum + member.pointsBalance, 0), []);
  const activeMembers = useMemo(() => mockMembers.filter(m => m.lastActivity >= '2026-06-01').length, []);
  const totalRedemptions = useMemo(() => mockRewards.reduce((sum, reward) => sum + reward.redemptionCount, 0), []);

  const filteredMembers = useMemo(() => {
    return mockMembers.filter(member => {
      const matchesSearch = member.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.memberId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === 'all' || member.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [searchTerm, selectedTier]);

  return (
    <div className="space-y-6 animate-fade-in" id="loyalty-program-engine">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Guest Retention</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Loyalty Program</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
            <Plus size={14} /> Add Member
          </button>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs flex items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={mockMembers.length}
          change={{ value: 12.5, isPositive: true }}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Members"
          value={activeMembers}
          change={{ value: 8.3, isPositive: true }}
          icon={Zap}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Points Outstanding"
          value={totalPoints.toLocaleString()}
          change={{ value: 15.2, isPositive: true }}
          icon={CreditCard}
          color="bg-amber-500"
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          change={{ value: 22.1, isPositive: true }}
          icon={Gift}
          color="bg-purple-500"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'transactions', label: 'Transactions', icon: CreditCard },
          { id: 'rewards', label: 'Rewards', icon: Gift },
          { id: 'campaigns', label: 'Campaigns', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500/20 transition w-full"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'silver', 'gold', 'platinum', 'diamond'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    selectedTier === tier
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const TierIcon = tierConfig[member.tier].icon;
              return (
                <div key={member.memberId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tierConfig[member.tier].bgColor}`}>
                        <TierIcon size={24} className={tierConfig[member.tier].color} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{member.guestName}</h3>
                        <p className="text-[10px] font-mono text-slate-500">{member.memberId}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${tierConfig[member.tier].bgColor} ${tierConfig[member.tier].color}`}>
                      {member.tier}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Points Balance</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{member.pointsBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600 dark:text-slate-400">This Year</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">${member.revenueThisYear.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${member.nextTierProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">Next tier progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{member.nextTierProgress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter size={12} /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Member</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Points</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Reason</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{transaction.transactionId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{transaction.memberName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                        transaction.type === 'earn' ? 'bg-emerald-100 text-emerald-700' :
                        transaction.type === 'redeem' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-bold ${transaction.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{transaction.reason}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-slate-500">{transaction.referenceType}: {transaction.referenceId}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {transaction.status === 'completed' ? (
                        <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle size={16} className="text-rose-500 mx-auto" />
                      )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRewards.map((reward) => {
            const TierIcon = tierConfig[reward.tierRequirement].icon;
            return (
              <div key={reward.rewardId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tierConfig[reward.tierRequirement].bgColor}`}>
                    <Gift size={24} className={tierConfig[reward.tierRequirement].color} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize flex items-center gap-1 ${tierConfig[reward.tierRequirement].bgColor} ${tierConfig[reward.tierRequirement].color}`}>
                    <TierIcon size={12} />
                    {reward.tierRequirement}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{reward.rewardName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Points Cost</p>
                    <p className="text-lg font-black text-amber-600">{reward.pointsCost.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Redeemed</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{reward.redemptionCount}</p>
                  </div>
                </div>
                <button
                  disabled={!reward.available}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    reward.available
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {reward.available ? 'Redeem Reward' : 'Unavailable'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Campaigns</h3>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
              <Plus size={14} /> Create Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.campaignId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{campaign.campaignName}</h3>
                    <p className="text-[10px] font-mono text-slate-500">{campaign.campaignId}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${
                    campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{campaign.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Start Date</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{campaign.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">End Date</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Multiplier</p>
                    <p className="text-xs font-bold text-amber-600">{campaign.bonusMultiplier}x</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Participants</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{campaign.participants}</p>
                  </div>
                </div>
                {campaign.targetTier && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Target Tier</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${tierConfig[campaign.targetTier].bgColor} ${tierConfig[campaign.targetTier].color}`}>
                      {campaign.targetTier}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Points Awarded</p>
                  <p className="text-lg font-black text-emerald-600">{campaign.pointsAwarded.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
