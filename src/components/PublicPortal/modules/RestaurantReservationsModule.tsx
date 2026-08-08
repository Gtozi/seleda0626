/**
 * Restaurant Reservations Module
 * Browse restaurants, menus, and make table reservations
 */

import { useState } from 'react';
import { UtensilsCrossed, Calendar, Clock, MapPin, Phone, Star } from 'lucide-react';

const RestaurantReservationsModule: React.FC = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  const restaurants = [
    {
      id: '1',
      name: 'The Grand Restaurant',
      cuisine: 'International',
      description: 'Fine dining with international cuisine',
      openingHours: '6:00 AM - 11:00 PM',
      dressCode: 'Smart Casual',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: '2',
      name: 'Ethiopian Kitchen',
      cuisine: 'Ethiopian',
      description: 'Traditional Ethiopian cuisine',
      openingHours: '7:00 AM - 10:00 PM',
      dressCode: 'Casual',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: '3',
      name: 'Lake View Restaurant',
      cuisine: 'Seafood',
      description: 'Fresh seafood with lake views',
      openingHours: '11:00 AM - 10:00 PM',
      dressCode: 'Smart Casual',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Restaurant Reservations</h1>
        <p className="text-lg opacity-90">Reserve your table at our award-winning restaurants</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{restaurant.name}</h3>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold">{restaurant.rating}</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3">{restaurant.description}</p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={16} />
                  <span>{restaurant.cuisine}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{restaurant.openingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{restaurant.dressCode}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold transition-colors">
                Reserve Table
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantReservationsModule;