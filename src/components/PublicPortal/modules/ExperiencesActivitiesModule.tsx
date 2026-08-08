/**
 * Experiences & Activities Module
 * Browse and book tours, local experiences, and activities
 */

import { MapPin, Calendar, Users, Star } from 'lucide-react';

const ExperiencesActivitiesModule: React.FC = () => {
  const experiences = [
    { id: '1', name: 'City Tour', duration: '4 hours', price: 50, rating: 4.8, type: 'tour' },
    { id: '2', name: 'Hiking Adventure', duration: 'Full day', price: 80, rating: 4.7, type: 'adventure' },
    { id: '3', name: 'Cultural Experience', duration: '3 hours', price: 40, rating: 4.9, type: 'cultural' },
    { id: '4', name: 'Food Tour', duration: '5 hours', price: 60, rating: 4.6, type: 'food' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Experiences & Activities</h1>
        <p className="text-lg opacity-90">Discover local experiences and adventures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{exp.name}</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{exp.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <span>{exp.rating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-600">${exp.price}</span>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencesActivitiesModule;