/**
 * Loyalty Program Module
 * View membership tier, points balance, earned/redeemed points, available rewards, member benefits
 */

import { useState } from 'react';
import {
  Star,
  Award,
  Gift,
  TrendingUp,
  Crown,
  Diamond,
  Target,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface LoyaltyProgramModuleProps {
  guestId?: string;
}

interface LoyaltyInfo {
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  pointsBalance: number;
  pointsEarned: number;
  pointsRedeemed: number;
  nextTierPoints: number;
  memberSince: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'Room Upgrade' | 'Free Night' | 'Dining Credit' | 'Spa Credit' | 'Experience';
  image?: string;
}

interface Benefit {
  id: string;
  name: string;
  description: string;
  tier: string;
}

const LoyaltyProgramModule: React.FC<LoyaltyProgramModuleProps> = ({
  guestId
}) => {
  const [loyaltyInfo] = useState<LoyaltyInfo>({
    tier: 'Gold',
    pointsBalance: 12500,
    pointsEarned: 25000,
    pointsRedeemed: 12500,
    nextTierPoints: 25000,
    memberSince: '2023-01-15'
  });

  const [rewards] = useState<Reward[]>([
    {
      id: 'RWD-001',
      name: 'Room Upgrade',
      description: 'Upgrade to the next room category',
      pointsRequired: 5000,
      category: 'Room Upgrade'
    },
    {
      id: 'RWD-002',
      name: 'Free Night',
      description: 'Complimentary night stay',
      pointsRequired: 20000,
      category: 'Free Night'
    },
    {
      id: 'RWD-003',
      name: 'Dining Credit',
      description: '$50 dining credit at any hotel restaurant',
      pointsRequired: 3000,
      category: 'Dining Credit'
    },
    {
      id: 'RWD-004',
      name: 'Spa Credit',
      description: '$75 spa credit for any treatment',
      pointsRequired: 7500,
      category: 'Spa Credit'
    },
    {
      id: 'RWD-005',
      name: 'Private Tour',
      description: 'Exclusive city tour with private guide',
      pointsRequired: 15000,
      category: 'Experience'
    }
  ]);

  const [benefits] = useState<Benefit[]>([
    { id: 'B-001', name: 'Early Check-in', description: 'Check in from 12:00 PM', tier: 'Gold' },
    { id: 'B-002', name: 'Late Check-out', description: 'Check out until 2:00 PM', tier: 'Gold' },
    { id: 'B-003', name: 'Room Upgrade', description: 'Subject to availability', tier: 'Platinum' },
    { id: 'B-004', name: 'Free Breakfast', description: 'Daily complimentary breakfast', tier: 'Gold' },
    { id: 'B-005', name: 'Executive Lounge Access', description: 'Access to executive lounge', tier: 'Platinum' },
    { id: 'B-006', name: 'Personal Concierge', description: 'Dedicated concierge service', tier: 'Diamond' }
  ]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Silver': return <Star size={32} />;
      case 'Gold': return <Award size={32} />;
      case 'Platinum': return <Crown size={32} />;
      case 'Diamond': return <Diamond size={32} />;
      default: return <Star size={32} />;
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'Silver': 'from-slate-400 to-slate-500',
      'Gold': 'from-amber-400 to-amber-500',
      'Platinum': 'from-slate-300 to-slate-400',
      'Diamond': 'from-cyan-400 to-cyan-500'
    };
    return colors[tier as keyof typeof colors] || colors['Silver'];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Room Upgrade': return <Award size={20} />;
      case 'Free Night': return <Star size={20} />;
      case 'Dining Credit': return <Gift size={20} />;
      case 'Spa Credit': return <Target size={20} />;
      case 'Experience': return <TrendingUp size={20} />;
      default: return <Gift size={20} />;
    }
  };

  const progressPercentage = (loyaltyInfo.pointsBalance / loyaltyInfo.nextTierPoints) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loyalty Program</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your membership benefits and rewards
        </p>
      </div>

      {/* Membership Card */}
      <div className={`bg-gradient-to-br ${getTierColor(loyaltyInfo.tier)} rounded-xl p-6 text-white`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm font-medium opacity-90 mb-1">Membership Tier</div>
            <div className="flex items-center gap-3">
              {getTierIcon(loyaltyInfo.tier)}
              <h2 className="text-3xl font-bold">{loyaltyInfo.tier}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium opacity-90 mb-1">Member Since</div>
            <div className="text-lg font-semibold">
              {new Date(loyaltyInfo.memberSince).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="text-xs opacity-75 mb-1">Points Balance</div>
            <div className="text-2xl font-bold">{loyaltyInfo.pointsBalance.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="text-xs opacity-75 mb-1">Points Earned</div>
            <div className="text-2xl font-bold">{loyaltyInfo.pointsEarned.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="text-xs opacity-75 mb-1">Points Redeemed</div>
            <div className="text-2xl font-bold">{loyaltyInfo.pointsRedeemed.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="opacity-90">Progress to {loyaltyInfo.tier === 'Diamond' ? 'Max Tier' : 'Next Tier'}</span>
            <span className="font-medium">
              {loyaltyInfo.pointsBalance.toLocaleString()} / {loyaltyInfo.nextTierPoints.toLocaleString()} points
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {getCategoryIcon(reward.category)}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{reward.category}</div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {reward.pointsRequired.toLocaleString()} pts
                  </div>
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{reward.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{reward.description}</p>
              <button
                disabled={loyaltyInfo.pointsBalance < reward.pointsRequired}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  loyaltyInfo.pointsBalance >= reward.pointsRequired
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {loyaltyInfo.pointsBalance >= reward.pointsRequired ? (
                  <>
                    Redeem
                    <ArrowRight size={16} />
                  </>
                ) : (
                  'Not Enough Points'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Member Benefits */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Member Benefits</h3>
        <div className="space-y-3">
          {benefits
            .filter(benefit => {
              const tierOrder = ['Silver', 'Gold', 'Platinum', 'Diamond'];
              const currentTierIndex = tierOrder.indexOf(loyaltyInfo.tier);
              const benefitTierIndex = tierOrder.indexOf(benefit.tier as any);
              return benefitTierIndex <= currentTierIndex;
            })
            .map((benefit) => (
            <div key={benefit.id} className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{benefit.name}</h4>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    benefit.tier === loyaltyInfo.tier
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {benefit.tier}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Points Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Stay at SELEDA Grand Hotel</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Aug 15, 2026</div>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">+2,500</div>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Redeemed: Dining Credit</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Aug 10, 2026</div>
            </div>
            <div className="text-red-600 dark:text-red-400 font-semibold">-3,000</div>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Stay at SELEDA Grand Hotel</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Jul 20, 2026</div>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">+2,500</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramModule;
