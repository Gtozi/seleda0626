/**
 * Loyalty Enrollment Module
 * Join loyalty program and view membership benefits
 */

import { Award, Star, Crown, Diamond } from 'lucide-react';

const LoyaltyEnrollmentModule: React.FC = () => {
  const tiers = [
    { name: 'Silver', icon: <Star size={32} />, points: 0, benefits: ['Member rates', 'Birthday bonus', 'Priority check-in'] },
    { name: 'Gold', icon: <Award size={32} />, points: 10000, benefits: ['All Silver benefits', 'Room upgrades', 'Late checkout', 'Free WiFi'] },
    { name: 'Platinum', icon: <Crown size={32} />, points: 25000, benefits: ['All Gold benefits', 'Executive lounge', 'Concierge service', 'Free breakfast'] },
    { name: 'Diamond', icon: <Diamond size={32} />, points: 50000, benefits: ['All Platinum benefits', 'Suite upgrades', 'Personal butler', 'Exclusive events'] }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Loyalty Program</h1>
        <p className="text-lg opacity-90">Join our loyalty program and earn exclusive rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              {tier.icon}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{tier.points} points required</p>
            <ul className="space-y-2 mb-4">
              {tier.benefits.map((benefit, bIdx) => (
                <li key={bIdx} className="text-sm text-slate-700 dark:text-slate-300">✓ {benefit}</li>
              ))}
            </ul>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors">
              Join Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoyaltyEnrollmentModule;