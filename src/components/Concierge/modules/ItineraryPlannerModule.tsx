/**
 * Itinerary Planner Module
 * Create personalized guest itineraries
 */

import { Calendar } from 'lucide-react';

interface ItineraryPlannerModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

const ItineraryPlannerModule: React.FC<ItineraryPlannerModuleProps> = ({ onViewGuestProfile }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Itinerary Planner</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-slate-500 dark:text-slate-400">Itinerary planning interface</p>
      </div>
    </div>
  );
};

export default ItineraryPlannerModule;