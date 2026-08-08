/**
 * Spa & Wellness Booking Module
 * Book spa treatments, massages, facials, and wellness packages
 */

import { useState } from 'react';
import { Sparkles, Calendar, Clock, User } from 'lucide-react';

const SpaWellnessBookingModule: React.FC = () => {
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  const treatments = [
    { id: '1', name: 'Swedish Massage', duration: '60 min', price: 80, therapist: 'Available' },
    { id: '2', name: 'Deep Tissue Massage', duration: '90 min', price: 120, therapist: 'Available' },
    { id: '3', name: 'Hot Stone Therapy', duration: '75 min', price: 100, therapist: 'Available' },
    { id: '4', name: 'Facial Treatment', duration: '45 min', price: 60, therapist: 'Available' },
    { id: '5', name: 'Body Scrub', duration: '30 min', price: 50, therapist: 'Available' },
    { id: '6', name: 'Wellness Package', duration: '3 hours', price: 200, therapist: 'Available' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Spa & Wellness</h1>
        <p className="text-lg opacity-90">Relax and rejuvenate with our premium spa treatments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{treatment.name}</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{treatment.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{treatment.therapist}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">${treatment.price}</span>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaWellnessBookingModule;