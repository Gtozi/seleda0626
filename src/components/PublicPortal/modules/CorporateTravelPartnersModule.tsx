/**
 * Corporate & Travel Partners Module
 * Corporate accounts, travel agencies, and partner programs
 */

import { Building, Briefcase, Users, Handshake } from 'lucide-react';

const CorporateTravelPartnersModule: React.FC = () => {
  const partnerTypes = [
    { id: '1', name: 'Corporate Accounts', icon: <Building size={32} />, description: 'Special rates for corporate clients' },
    { id: '2', name: 'Travel Agencies', icon: <Briefcase size={32} />, description: 'Partner with us for commission' },
    { id: '3', name: 'Tour Operators', icon: <Users size={32} />, description: 'Group booking benefits' },
    { id: '4', name: 'Event Planners', icon: <Handshake size={32} />, description: 'Venue partnership programs' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Corporate & Travel Partners</h1>
        <p className="text-lg opacity-90">Partner with us for exclusive benefits and rates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partnerTypes.map((partner) => (
          <div key={partner.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              {partner.icon}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{partner.name}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{partner.description}</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CorporateTravelPartnersModule;