/**
 * Wedding Booking Module
 * Wedding packages, venues, and inquiry form
 */

import { useState } from 'react';
import { Heart, Calendar, Users, Send } from 'lucide-react';

const WeddingBookingModule: React.FC = () => {
  const [formData, setFormData] = useState({
    weddingDate: '',
    guestCount: '',
    package: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: ''
  });

  const weddingPackages = [
    { id: 'basic', name: 'Basic Package', price: 5000, features: ['Venue', 'Basic decoration', 'Catering for 50'] },
    { id: 'standard', name: 'Standard Package', price: 10000, features: ['Venue', 'Premium decoration', 'Catering for 100', 'Photography'] },
    { id: 'premium', name: 'Premium Package', price: 20000, features: ['Venue', 'Luxury decoration', 'Catering for 200', 'Photography', 'Videography', 'Live music'] }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Wedding Planning</h1>
        <p className="text-lg opacity-90">Create your perfect day with our wedding packages and venues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weddingPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
            <p className="text-2xl font-bold text-pink-600 mb-4">${pkg.price}</p>
            <ul className="space-y-2 mb-4">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Heart size={16} className="text-pink-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition-colors">
              Select Package
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Wedding Inquiry</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="tel" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wedding Date</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
          </div>
          <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            <Send size={20} />
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
};

export default WeddingBookingModule;