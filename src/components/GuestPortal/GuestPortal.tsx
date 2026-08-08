/**
 * Unified Guest Portal
 * Main component integrating all guest portal modules
 */

import { useState } from 'react';
import {
  Home,
  User,
  Calendar,
  LogIn,
  Key,
  Bed,
  UtensilsCrossed,
  ChefHat,
  ConciergeBell,
  Car,
  Wrench,
  Sparkles,
  Building,
  Award,
  CreditCard,
  Receipt,
  MessageSquare,
  Bell,
  Star,
  HelpCircle,
  Settings,
  Menu,
  X
} from 'lucide-react';

// Import all modules
import HomeDashboardModule from './modules/HomeDashboardModule';
import ProfilePreferencesModule from './modules/ProfilePreferencesModule';
import ReservationsModule from './modules/ReservationsModule';
import DigitalCheckinModule from './modules/DigitalCheckinModule';
import DigitalRoomKeyModule from './modules/DigitalRoomKeyModule';
import MyStayModule from './modules/MyStayModule';
import RoomServiceModule from './modules/RoomServiceModule';
import RestaurantReservationsModule from './modules/RestaurantReservationsModule';
import SpaWellnessModule from './modules/SpaWellnessModule';
import ConciergeServicesModule from './modules/ConciergeServicesModule';
import TransportationModule from './modules/TransportationModule';
import HousekeepingRequestsModule from './modules/HousekeepingRequestsModule';
import MaintenanceRequestsModule from './modules/MaintenanceRequestsModule';
import EventActivityBookingModule from './modules/EventActivityBookingModule';
import MeetingBanquetServicesModule from './modules/MeetingBanquetServicesModule';
import LoyaltyProgramModule from './modules/LoyaltyProgramModule';
import WalletPaymentsModule from './modules/WalletPaymentsModule';
import BillingFolioModule from './modules/BillingFolioModule';
import MessagingCenterModule from './modules/MessagingCenterModule';
import NotificationsModule from './modules/NotificationsModule';
import FeedbackReviewsModule from './modules/FeedbackReviewsModule';
import HelpCenterModule from './modules/HelpCenterModule';
import SettingsModule from './modules/SettingsModule';

interface GuestPortalProps {
  reservationId?: string;
  guestId?: string;
}

type ModuleType = 
  | 'dashboard'
  | 'profile'
  | 'reservations'
  | 'checkin'
  | 'digitalKey'
  | 'myStay'
  | 'roomService'
  | 'restaurant'
  | 'spa'
  | 'concierge'
  | 'transportation'
  | 'housekeeping'
  | 'maintenance'
  | 'events'
  | 'meetings'
  | 'loyalty'
  | 'wallet'
  | 'billing'
  | 'messaging'
  | 'notifications'
  | 'feedback'
  | 'help'
  | 'settings';

const GuestPortal: React.FC<GuestPortalProps> = ({
  reservationId,
  guestId
}) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard' as ModuleType, label: 'Home', icon: <Home size={20} /> },
    { id: 'profile' as ModuleType, label: 'Profile', icon: <User size={20} /> },
    { id: 'reservations' as ModuleType, label: 'Reservations', icon: <Calendar size={20} /> },
    { id: 'checkin' as ModuleType, label: 'Check-in', icon: <LogIn size={20} /> },
    { id: 'digitalKey' as ModuleType, label: 'Digital Key', icon: <Key size={20} /> },
    { id: 'myStay' as ModuleType, label: 'My Stay', icon: <Bed size={20} /> },
    { id: 'roomService' as ModuleType, label: 'Room Service', icon: <UtensilsCrossed size={20} /> },
    { id: 'restaurant' as ModuleType, label: 'Restaurant', icon: <ChefHat size={20} /> },
    { id: 'spa' as ModuleType, label: 'Spa & Wellness', icon: <Sparkles size={20} /> },
    { id: 'concierge' as ModuleType, label: 'Concierge', icon: <ConciergeBell size={20} /> },
    { id: 'transportation' as ModuleType, label: 'Transportation', icon: <Car size={20} /> },
    { id: 'housekeeping' as ModuleType, label: 'Housekeeping', icon: <Bed size={20} /> },
    { id: 'maintenance' as ModuleType, label: 'Maintenance', icon: <Wrench size={20} /> },
    { id: 'events' as ModuleType, label: 'Events', icon: <Star size={20} /> },
    { id: 'meetings' as ModuleType, label: 'Meetings', icon: <Building size={20} /> },
    { id: 'loyalty' as ModuleType, label: 'Loyalty', icon: <Award size={20} /> },
    { id: 'wallet' as ModuleType, label: 'Wallet', icon: <CreditCard size={20} /> },
    { id: 'billing' as ModuleType, label: 'Billing', icon: <Receipt size={20} /> },
    { id: 'messaging' as ModuleType, label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'notifications' as ModuleType, label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'feedback' as ModuleType, label: 'Feedback', icon: <Star size={20} /> },
    { id: 'help' as ModuleType, label: 'Help', icon: <HelpCircle size={20} /> },
    { id: 'settings' as ModuleType, label: 'Settings', icon: <Settings size={20} /> }
  ];

  const renderModule = () => {
    const commonProps = { reservationId, guestId };

    switch (activeModule) {
      case 'dashboard':
        return <HomeDashboardModule {...commonProps} onViewModule={setActiveModule} />;
      case 'profile':
        return <ProfilePreferencesModule {...commonProps} />;
      case 'reservations':
        return <ReservationsModule {...commonProps} />;
      case 'checkin':
        return <DigitalCheckinModule {...commonProps} />;
      case 'digitalKey':
        return <DigitalRoomKeyModule {...commonProps} />;
      case 'myStay':
        return <MyStayModule {...commonProps} />;
      case 'roomService':
        return <RoomServiceModule {...commonProps} />;
      case 'restaurant':
        return <RestaurantReservationsModule {...commonProps} />;
      case 'spa':
        return <SpaWellnessModule {...commonProps} />;
      case 'concierge':
        return <ConciergeServicesModule {...commonProps} />;
      case 'transportation':
        return <TransportationModule {...commonProps} />;
      case 'housekeeping':
        return <HousekeepingRequestsModule {...commonProps} />;
      case 'maintenance':
        return <MaintenanceRequestsModule {...commonProps} />;
      case 'events':
        return <EventActivityBookingModule {...commonProps} />;
      case 'meetings':
        return <MeetingBanquetServicesModule {...commonProps} />;
      case 'loyalty':
        return <LoyaltyProgramModule {...commonProps} />;
      case 'wallet':
        return <WalletPaymentsModule {...commonProps} />;
      case 'billing':
        return <BillingFolioModule {...commonProps} />;
      case 'messaging':
        return <MessagingCenterModule {...commonProps} />;
      case 'notifications':
        return <NotificationsModule {...commonProps} />;
      case 'feedback':
        return <FeedbackReviewsModule {...commonProps} />;
      case 'help':
        return <HelpCenterModule {...commonProps} />;
      case 'settings':
        return <SettingsModule {...commonProps} />;
      default:
        return <HomeDashboardModule {...commonProps} onViewModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Guest Portal</h1>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Guest Portal</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">SELEDA Grand Hotel</p>
          </div>

          <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveModule(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      activeModule === item.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-0">
          <div className="min-h-screen">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuestPortal;
