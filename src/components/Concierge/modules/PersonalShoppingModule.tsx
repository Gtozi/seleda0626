/**
 * Personal Shopping Module
 * Assist guests with luxury shopping, souvenirs, and custom orders
 */

import { ShoppingBag } from 'lucide-react';

interface PersonalShoppingModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

const PersonalShoppingModule: React.FC<PersonalShoppingModuleProps> = ({ onViewGuestProfile }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Personal Shopping</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-slate-500 dark:text-slate-400">Personal shopping interface</p>
      </div>
    </div>
  );
};

export default PersonalShoppingModule;