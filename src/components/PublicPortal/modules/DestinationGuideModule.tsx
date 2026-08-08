/**
 * Destination Guide Module
 * Information about local attractions, restaurants, shopping, and activities
 */

import { MapPin, UtensilsCrossed, ShoppingBag, Building, Plane, Hospital } from 'lucide-react';

const DestinationGuideModule: React.FC = () => {
  const categories = [
    { id: 'attractions', name: 'Attractions', icon: <MapPin size={24} />, items: ['National Museum', 'Entoto Mountains', 'Holy Trinity Cathedral'] },
    { id: 'restaurants', name: 'Restaurants', icon: <UtensilsCrossed size={24} />, items: ['Traditional Ethiopian', 'International Cuisine', 'Local Cafes'] },
    { id: 'shopping', name: 'Shopping', icon: <ShoppingBag size={24} />, items: ['Local Markets', 'Artisan Shops', 'Modern Malls'] },
    { id: 'culture', name: 'Culture', icon: <Building size={24} />, items: ['Historical Sites', 'Cultural Centers', 'Art Galleries'] },
    { id: 'transport', name: 'Transportation', icon: <Plane size={24} />, items: ['Airport Info', 'Public Transit', 'Car Rental'] },
    { id: 'healthcare', name: 'Healthcare', icon: <Hospital size={24} />, items: ['Hospitals', 'Pharmacies', 'Emergency Services'] }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Destination Guide</h1>
        <p className="text-lg opacity-90">Explore everything our destination has to offer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-green-600">
              {category.icon}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{category.name}</h3>
            </div>
            <ul className="space-y-2">
              {category.items.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationGuideModule;