/**
 * Packages & Promotions Module
 * Display and book special packages and promotional offers
 */

import { useState } from 'react';
import { Sparkles, Tag, Calendar, Users, Check, ArrowRight } from 'lucide-react';

const PackagesPromotionsModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const packages = [
    {
      id: '1',
      name: 'Bed & Breakfast',
      description: 'Start your day right with our complimentary breakfast buffet',
      price: 25,
      chargeFrequency: 'daily',
      category: 'dining',
      features: ['Continental breakfast', 'Hot items', 'Fresh juices', 'Coffee bar']
    },
    {
      id: '2',
      name: 'Half Board',
      description: 'Enjoy breakfast and dinner during your stay',
      price: 45,
      chargeFrequency: 'daily',
      category: 'dining',
      features: ['Breakfast buffet', '3-course dinner', 'Soft drinks included']
    },
    {
      id: '3',
      name: 'Honeymoon Package',
      description: 'Romantic package for newlyweds',
      price: 200,
      chargeFrequency: 'once',
      category: 'romance',
      features: ['Champagne on arrival', 'Rose petals', 'Late checkout', 'Couples massage']
    },
    {
      id: '4',
      name: 'Family Vacation',
      description: 'Perfect package for families with children',
      price: 150,
      chargeFrequency: 'once',
      category: 'family',
      features: ['Kids stay free', 'Family room upgrade', 'Kids meals included', 'Activity pack']
    },
    {
      id: '5',
      name: 'Wellness Retreat',
      description: 'Rejuvenate with our wellness package',
      price: 180,
      chargeFrequency: 'once',
      category: 'wellness',
      features: ['Spa treatment', 'Yoga session', 'Healthy meals', 'Meditation class']
    },
    {
      id: '6',
      name: 'Golf Package',
      description: 'Golf lovers special with green fees included',
      price: 120,
      chargeFrequency: 'once',
      category: 'sports',
      features: ['Green fees', 'Club rental', 'Golf cart', 'Pro shop discount']
    }
  ];

  const filteredPackages = selectedCategory === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Packages & Promotions</h1>
        <p className="text-lg opacity-90">Enhance your stay with our specially curated packages</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'dining', 'romance', 'family', 'wellness', 'sports'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={24} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                {pkg.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{pkg.description}</p>
            <div className="space-y-2 mb-4">
              {pkg.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check size={16} className="text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-2xl font-bold text-indigo-600">+${pkg.price}</span>
                <span className="text-slate-600 dark:text-slate-400 text-sm">/{pkg.chargeFrequency}</span>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Add Package
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagesPromotionsModule;