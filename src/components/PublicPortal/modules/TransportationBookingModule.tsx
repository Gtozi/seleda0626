/**
 * Transportation Booking Module
 * Book airport transfers, limousine services, and transportation
 */

import { Car, Plane, Clock, Phone } from 'lucide-react';

const TransportationBookingModule: React.FC = () => {
  const services = [
    { id: '1', name: 'Airport Pickup', price: 50, capacity: '4 passengers', vehicle: 'Sedan' },
    { id: '2', name: 'Airport Drop-off', price: 50, capacity: '4 passengers', vehicle: 'Sedan' },
    { id: '3', name: 'Limousine Service', price: 150, capacity: '6 passengers', vehicle: 'Limousine' },
    { id: '4', name: 'Shuttle Service', price: 25, capacity: '12 passengers', vehicle: 'Van' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Transportation Services</h1>
        <p className="text-lg opacity-90">Book reliable transportation for your travel needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Car size={32} className="text-amber-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{service.vehicle}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <span>Capacity: {service.capacity}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-600">${service.price}</span>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportationBookingModule;