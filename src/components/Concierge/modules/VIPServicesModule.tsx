/**
 * VIP & Butler Services Module
 * Manage VIP arrival preparation, personalized welcome, butler requests
 */

import { Crown } from 'lucide-react';

interface VIPServicesModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

const VIPServicesModule: React.FC<VIPServicesModuleProps> = ({ onViewGuestProfile }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">VIP & Butler Services</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-slate-500 dark:text-slate-400">VIP services interface</p>
      </div>
    </div>
  );
};

export default VIPServicesModule;