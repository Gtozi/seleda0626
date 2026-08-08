/**
 * Emergency Coordination
 * Emergency command center for crisis management
 */

import React, { useState } from 'react';
import {
  Flame,
  Phone,
  MapPin,
  Users,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Shield,
  X
} from 'lucide-react';

interface Emergency {
  id: string;
  type: 'fire' | 'medical' | 'flood' | 'power' | 'security' | 'evacuation' | 'natural-disaster';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  location: string;
  status: 'active' | 'responding' | 'contained' | 'resolved';
  reportedAt: string;
  incidentCommander: string;
  description: string;
}

const EmergencyCoordination: React.FC = () => {
  const [emergencies, setEmergencies] = useState<Emergency[]>([
    {
      id: '1',
      type: 'medical',
      severity: 'major',
      location: 'Lobby',
      status: 'resolved',
      reportedAt: '09:30',
      incidentCommander: 'Security Manager',
      description: 'Guest reported chest pain. Paramedics called and guest transported to hospital.'
    }
  ]);

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case 'fire':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'flood':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'power':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'security':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'evacuation':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'natural-disaster':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Flame size={28} />
            Emergency Coordination
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Emergency command center for crisis management</p>
        </div>
        <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2">
          <AlertTriangle size={18} />
          Report Emergency
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-rose-600" />
            <span className="text-xs font-mono uppercase text-rose-700 dark:text-rose-400 font-bold">Fire</span>
          </div>
          <button className="w-full py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm">
            Report Fire
          </button>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={18} className="text-red-600" />
            <span className="text-xs font-mono uppercase text-red-700 dark:text-red-400 font-bold">Medical</span>
          </div>
          <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
            Report Medical
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-blue-600" />
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-bold">Security</span>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Report Security
          </button>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-orange-600" />
            <span className="text-xs font-mono uppercase text-orange-700 dark:text-orange-400 font-bold">Evacuation</span>
          </div>
          <button className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
            Initiate Evacuation
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Active Emergencies</h3>
        {emergencies.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No active emergencies
          </div>
        ) : (
          <div className="space-y-3">
            {emergencies.map(emergency => (
              <div key={emergency.id} className={`p-4 rounded-lg border ${getEmergencyColor(emergency.type)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{emergency.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/50">{emergency.severity}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/50">{emergency.status}</span>
                    </div>
                    <p className="text-sm mt-1">{emergency.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {emergency.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Radio size={12} />
                        {emergency.incidentCommander}
                      </span>
                      <span>{emergency.reportedAt}</span>
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

export default EmergencyCoordination;