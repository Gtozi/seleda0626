/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Unified Concierge Portal — guest services, personal assistance, local experiences, 
 * transportation coordination, activity planning, and personalized guest engagement
 */

import { useState } from 'react';
import { useModalReturn } from '../../context/ModalReturnContext';
import { 
  LayoutDashboard, 
  Headphones, 
  Users, 
  Bell, 
  Calendar, 
  Utensils, 
  Car, 
  Map, 
  Ticket, 
  Package, 
  Crown, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Building, 
  CreditCard, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ConciergeDashboardModule from './modules/ConciergeDashboardModule';
import GuestServiceCenterModule from './modules/GuestServiceCenterModule';
import GuestProfilesModule from './modules/GuestProfilesModule';
import GuestRequestsModule from './modules/GuestRequestsModule';
import ConciergeDeskModule from './modules/ConciergeDeskModule';
import ExperienceBookingModule from './modules/ExperienceBookingModule';
import RestaurantReservationsModule from './modules/RestaurantReservationsModule';
import TransportationModule from './modules/TransportationModule';
import TourManagementModule from './modules/TourManagementModule';
import TicketingModule from './modules/TicketingModule';
import LuggageServicesModule from './modules/LuggageServicesModule';
import ParcelManagementModule from './modules/ParcelManagementModule';
import VIPServicesModule from './modules/VIPServicesModule';
import PersonalShoppingModule from './modules/PersonalShoppingModule';
import LocalRecommendationsModule from './modules/LocalRecommendationsModule';
import ItineraryPlannerModule from './modules/ItineraryPlannerModule';
import WakeUpReminderModule from './modules/WakeUpReminderModule';
import GuestCommunicationModule from './modules/GuestCommunicationModule';
import VendorManagementModule from './modules/VendorManagementModule';
import BillingChargesModule from './modules/BillingChargesModule';
import ConciergeReportsModule from './modules/ConciergeReportsModule';
import ConfigurationModule from './modules/ConfigurationModule';

type ConciergeTab = 
  | 'dashboard'
  | 'service-center'
  | 'guest-profiles'
  | 'guest-requests'
  | 'concierge-desk'
  | 'experience-booking'
  | 'restaurant-reservations'
  | 'transportation'
  | 'tour-management'
  | 'ticketing'
  | 'luggage-services'
  | 'parcel-management'
  | 'vip-services'
  | 'personal-shopping'
  | 'local-recommendations'
  | 'itinerary-planner'
  | 'wake-up-reminder'
  | 'guest-communication'
  | 'vendor-management'
  | 'billing-charges'
  | 'reports'
  | 'configuration';

// Custom scrollbar styles
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
`;

const CONCIERGE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'service-center', label: 'Service Center', icon: Headphones },
  { id: 'guest-profiles', label: 'Guest Profiles', icon: Users },
  { id: 'guest-requests', label: 'Guest Requests', icon: Bell },
  { id: 'concierge-desk', label: 'Concierge Desk', icon: Headphones },
  { id: 'experience-booking', label: 'Experiences', icon: Calendar },
  { id: 'restaurant-reservations', label: 'Restaurants', icon: Utensils },
  { id: 'transportation', label: 'Transportation', icon: Car },
  { id: 'tour-management', label: 'Tours', icon: Map },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket },
  { id: 'luggage-services', label: 'Luggage', icon: Package },
  { id: 'parcel-management', label: 'Parcels', icon: Package },
  { id: 'vip-services', label: 'VIP Services', icon: Crown },
  { id: 'personal-shopping', label: 'Personal Shopping', icon: ShoppingBag },
  { id: 'local-recommendations', label: 'Local Recommendations', icon: MapPin },
  { id: 'itinerary-planner', label: 'Itinerary Planner', icon: Clock },
  { id: 'wake-up-reminder', label: 'Wake Up Calls', icon: Bell },
  { id: 'guest-communication', label: 'Communication', icon: MessageSquare },
  { id: 'vendor-management', label: 'Vendors', icon: Building },
  { id: 'billing-charges', label: 'Billing', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'configuration', label: 'Configuration', icon: Settings },
];

export default function ConciergePortal({
  currentUser,
  activeTab: externalActiveTab,
  onTabChange
}: {
  currentUser?: any;
  activeTab?: ConciergeTab;
  onTabChange?: (tab: ConciergeTab) => void;
}) {
  const [internalActiveTab, setInternalActiveTab] = useState<ConciergeTab>('dashboard');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: ConciergeTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalActiveTab(tab);
  };

  // Internal routing state
  const [selectedGuestId, setSelectedGuestId] = useState<string | undefined>(undefined);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);
  const { push } = useModalReturn();

  const handleViewGuestProfile = (guestId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `concierge-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setSelectedGuestId(guestId);
    setActiveTab('guest-profiles');
  };

  const handleViewRequest = (requestId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `concierge-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setSelectedRequestId(requestId);
    setActiveTab('guest-requests');
  };

  return (
    <>
      <style>{customScrollbarStyles}</style>
      <div className="flex h-screen overflow-hidden">
      {/* Concierge Portal Side Navigation */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden ${
        navCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header with collapse toggle */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          {!navCollapsed && (
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate flex-1">Concierge Portal</h3>
          )}
          <button
            onClick={() => setNavCollapsed(!navCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex-shrink-0"
            title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {navCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar min-h-0">
          <ul className="space-y-1 px-2">
            {CONCIERGE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={navCollapsed ? tab.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!navCollapsed && (
                      <span className="font-medium text-sm truncate">{tab.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Module content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {activeTab === 'dashboard' && (
          <ConciergeDashboardModule
            onViewGuestProfile={handleViewGuestProfile}
            onViewRequest={handleViewRequest}
          />
        )}

        {activeTab === 'service-center' && (
          <GuestServiceCenterModule
            onViewGuestProfile={handleViewGuestProfile}
            onViewRequest={handleViewRequest}
          />
        )}

        {activeTab === 'guest-profiles' && (
          <GuestProfilesModule
            selectedGuestId={selectedGuestId}
            onClearSelectedGuestId={() => setSelectedGuestId(undefined)}
          />
        )}

        {activeTab === 'guest-requests' && (
          <GuestRequestsModule
            selectedRequestId={selectedRequestId}
            onClearSelectedRequestId={() => setSelectedRequestId(undefined)}
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'concierge-desk' && (
          <ConciergeDeskModule
            onViewGuestProfile={handleViewGuestProfile}
            onCreateRequest={handleViewRequest}
          />
        )}

        {activeTab === 'experience-booking' && (
          <ExperienceBookingModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'restaurant-reservations' && (
          <RestaurantReservationsModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'transportation' && (
          <TransportationModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'tour-management' && (
          <TourManagementModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'ticketing' && (
          <TicketingModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'luggage-services' && (
          <LuggageServicesModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'parcel-management' && (
          <ParcelManagementModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'vip-services' && (
          <VIPServicesModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'personal-shopping' && (
          <PersonalShoppingModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'local-recommendations' && (
          <LocalRecommendationsModule />
        )}

        {activeTab === 'itinerary-planner' && (
          <ItineraryPlannerModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'wake-up-reminder' && (
          <WakeUpReminderModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'guest-communication' && (
          <GuestCommunicationModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'vendor-management' && (
          <VendorManagementModule />
        )}

        {activeTab === 'billing-charges' && (
          <BillingChargesModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'reports' && (
          <ConciergeReportsModule />
        )}

        {activeTab === 'configuration' && (
          <ConfigurationModule />
        )}
      </div>
      </div>
    </>
  );
}