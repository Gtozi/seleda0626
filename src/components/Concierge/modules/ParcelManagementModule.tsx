/**
 * Parcel & Package Management Module
 * Track incoming packages, outgoing shipments, and guest deliveries
 */

import { Package } from 'lucide-react';

interface ParcelManagementModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

const ParcelManagementModule: React.FC<ParcelManagementModuleProps> = ({ onViewGuestProfile }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Parcel & Package Management</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-slate-500 dark:text-slate-400">Parcel management interface</p>
      </div>
    </div>
  );
};

export default ParcelManagementModule;