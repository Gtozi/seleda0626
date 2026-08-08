/**
 * Local Recommendations Module
 * Knowledge base for restaurants, attractions, shopping, etc.
 */

import { useState } from 'react';
import { MapPin, Star, Search, Plus, Utensils, Camera, ShoppingBag, Landmark } from 'lucide-react';

interface LocalRecommendationsModuleProps {}

interface Recommendation {
  id: string;
  name: string;
  category: string;
  rating: number;
  address: string;
  phone?: string;
  notes: string;
}

const LocalRecommendationsModule: React.FC<LocalRecommendationsModuleProps> = () => {
  const [activeCategory, setActiveCategory] = useState('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      name: 'Traditional Ethiopian Restaurant',
      category: 'restaurants',
      rating: 4.5,
      address: '123 Bole Road, Addis Ababa',
      phone: '+251 911 123 456',
      notes: 'Best traditional cuisine, live music on weekends'
    },
    {
      id: '2',
      name: 'National Museum of Ethiopia',
      category: 'attractions',
      rating: 4.8,
      address: '456 King George VI Street, Addis Ababa',
      phone: '+251 911 234 567',
      notes: 'Historical artifacts, Lucy skeleton'
    },
    {
      id: '3',
      name: 'Edna Mall',
      category: 'shopping',
      rating: 4.2,
      address: '789 Bole Road, Addis Ababa',
      phone: '+251 911 345 678',
      notes: 'Shopping center with international brands'
    }
  ]);

  const categories = [
    { id: 'restaurants', label: 'Restaurants', icon: <Utensils size={16} /> },
    { id: 'attractions', label: 'Attractions', icon: <Camera size={16} /> },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={16} /> },
    { id: 'cultural', label: 'Cultural Sites', icon: <Landmark size={16} /> }
  ];

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = rec.category === activeCategory;
    const matchesSearch = !searchQuery || rec.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Local Recommendations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Knowledge base for restaurants, attractions, shopping, and more
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <Plus size={16} />
          Add Recommendation
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeCategory === category.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search recommendations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      {/* Recommendations List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredRecommendations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No recommendations found
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredRecommendations.map((rec) => (
              <div key={rec.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{rec.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rec.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{rec.address}</p>
                      {rec.phone && (
                        <p className="text-sm text-slate-500 dark:text-slate-500">{rec.phone}</p>
                      )}
                      {rec.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">{rec.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalRecommendationsModule;