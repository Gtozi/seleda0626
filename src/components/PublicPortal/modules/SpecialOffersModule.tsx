/**
 * Special Offers Module
 * Display flash sales, early bird offers, last minute deals, and seasonal promotions
 */

import { Tag, Clock, Percent, Flame } from 'lucide-react';

const SpecialOffersModule: React.FC = () => {
  const offers = [
    { id: '1', title: 'Flash Sale', discount: '30% OFF', description: 'Limited time offer on all room types', validUntil: '2026-08-15', type: 'flash' },
    { id: '2', title: 'Early Bird', discount: '20% OFF', description: 'Book 30 days in advance and save', validUntil: '2026-09-01', type: 'early' },
    { id: '3', title: 'Last Minute', discount: '15% OFF', description: 'Book within 48 hours of arrival', validUntil: '2026-08-31', type: 'last' },
    { id: '4', title: 'Seasonal Offer', discount: '25% OFF', description: 'Summer special on extended stays', validUntil: '2026-08-30', type: 'seasonal' }
  ];

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'flash': return <Flame size={24} />;
      case 'early': return <Clock size={24} />;
      case 'last': return <Percent size={24} />;
      case 'seasonal': return <Tag size={24} />;
      default: return <Tag size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Special Offers</h1>
        <p className="text-lg opacity-90">Don't miss out on these exclusive deals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              {getOfferIcon(offer.type)}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{offer.title}</h3>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">{offer.discount}</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{offer.description}</p>
            <div className="text-sm text-slate-500 mb-4">Valid until: {offer.validUntil}</div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialOffersModule;