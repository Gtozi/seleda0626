/**
 * Gift Cards Module
 * Purchase gift cards for various hotel services
 */

import { Gift, CreditCard, ShoppingBag } from 'lucide-react';

const GiftCardsModule: React.FC = () => {
  const giftCardTypes = [
    { id: '1', name: 'Hotel Stay', description: 'Gift card for room bookings', minAmount: 50, maxAmount: 1000 },
    { id: '2', name: 'Dining', description: 'Gift card for restaurant meals', minAmount: 25, maxAmount: 500 },
    { id: '3', name: 'Spa', description: 'Gift card for spa treatments', minAmount: 30, maxAmount: 300 },
    { id: '4', name: 'Monetary', description: 'General purpose gift card', minAmount: 20, maxAmount: 2000 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Gift Cards</h1>
        <p className="text-lg opacity-90">Give the gift of luxury experiences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {giftCardTypes.map((card) => (
          <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Gift size={32} className="text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{card.name}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{card.description}</p>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              ${card.minAmount} - ${card.maxAmount}
            </div>
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold transition-colors">
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftCardsModule;