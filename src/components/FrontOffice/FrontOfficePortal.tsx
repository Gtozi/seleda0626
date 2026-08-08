/**
 * Unified Front Office Portal (Property Management System - PMS)
 * Version: 1.0
 * 
 * The operational hub responsible for the complete guest journey, from reservation 
 * through post-stay follow-up. Centralizes guest-facing operations while integrating 
 * seamlessly with other ERP portals.
 */

import {
  LayoutDashboard,
  Calendar,
  DoorOpen,
  BedDouble,
  Users,
  Key,
  CreditCard,
  FileText,
  Moon,
  Bell,
  Car,
  Package,
  MessageSquare,
  Headphones,
  Settings,
  BarChart3,
  Shield,
  Star,
  Search,
  Award,
  Layers,
  Grid3x3,
  TrendingUp,
  Globe,
  Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Dashboard from './modules/Dashboard';
import Reservations from './modules/Reservations';
import AvailabilityInventory from './modules/AvailabilityInventory';
import FrontDeskOperations from './modules/FrontDeskOperations';
import RoomAssignment from './modules/RoomAssignment';
import GuestProfiles from './modules/GuestProfiles';
import CheckIn from './modules/CheckIn';
import CheckOut from './modules/CheckOut';
import FolioBilling from './modules/FolioBilling';
import Reports from './modules/Reports';
import StayManagement from './modules/StayManagement';
import NightAudit from './modules/NightAudit';
import KeysAccess from './modules/KeysAccess';
import GuestRequests from './modules/GuestRequests';
import CommunicationCenter from './modules/CommunicationCenter';
import PackagesAddons from './modules/PackagesAddons';
import OTAInterface from './modules/OTAInterface';
import RevenueControls from './modules/RevenueControls';
import Configuration from './modules/Configuration';
import Concierge from './modules/Concierge';
import BellDesk from './modules/BellDesk';
import Transportation from './modules/Transportation';
import LostFound from './modules/LostFound';
import Loyalty from './modules/Loyalty';
import GroupProfilesManagement from './modules/GroupProfilesManagement';
import ConciergePortal from '../Concierge/ConciergePortal';

type PortalModule = 
  | 'dashboard'
  | 'reservations'
  | 'availability-inventory'
  | 'front-desk-operations'
  | 'room-assignment'
  | 'guest-profiles'
  | 'group-profiles-management'
  | 'stay-management'
  | 'check-in'
  | 'check-out'
  | 'folio-billing'
  | 'night-audit'
  | 'keys-access'
  | 'concierge'
  | 'concierge-portal'
  | 'bell-desk'
  | 'transportation'
  | 'guest-requests'
  | 'lost-found'
  | 'communication-center'
  | 'packages-addons'
  | 'loyalty'
  | 'ota-interface'
  | 'revenue-controls'
  | 'reports'
  | 'configuration';

interface ModuleConfig {
  id: PortalModule;
  label: string;
  icon: any;
  description: string;
  category: 'core' | 'operational' | 'guest' | 'financial' | 'admin';
  priority: 'high' | 'medium' | 'low';
}

const MODULES: ModuleConfig[] = [
  // Core Modules
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Operational KPIs & alerts', category: 'core', priority: 'high' },
  { id: 'reservations', label: 'Reservations', icon: Calendar, description: 'Reservation management', category: 'core', priority: 'high' },
  { id: 'availability-inventory', label: 'Availability & Inventory', icon: Grid3x3, description: 'Room inventory & availability', category: 'core', priority: 'high' },
  { id: 'front-desk-operations', label: 'Front Desk Operations', icon: DoorOpen, description: 'Arrival & departure management', category: 'core', priority: 'high' },
  { id: 'room-assignment', label: 'Room Assignment', icon: BedDouble, description: 'Auto & manual room assignment', category: 'core', priority: 'high' },
  
  // Guest Management
  { id: 'guest-profiles', label: 'Guest Profiles', icon: Users, description: 'Guest information & history', category: 'guest', priority: 'high' },
  { id: 'group-profiles-management', label: 'Group Profiles', icon: Users, description: 'Group & corporate accounts', category: 'guest', priority: 'medium' },
  { id: 'stay-management', label: 'Stay Management', icon: Layers, description: 'Room moves, extensions, etc.', category: 'guest', priority: 'medium' },
  { id: 'check-in', label: 'Check-In', icon: Key, description: 'Registration & key management', category: 'guest', priority: 'high' },
  { id: 'check-out', label: 'Check-Out', icon: CreditCard, description: 'Settlement & folio closure', category: 'guest', priority: 'high' },
  
  // Financial
  { id: 'folio-billing', label: 'Folio & Billing', icon: FileText, description: 'Charge posting & folio management', category: 'financial', priority: 'high' },
  { id: 'night-audit', label: 'Night Audit', icon: Moon, description: 'Automated audit tasks', category: 'financial', priority: 'medium' },
  
  // Operational
  { id: 'keys-access', label: 'Keys & Access', icon: Shield, description: 'Key encoding & access control', category: 'operational', priority: 'medium' },
  { id: 'concierge', label: 'Concierge', icon: Headphones, description: 'Tour booking & guest services', category: 'operational', priority: 'low' },
  { id: 'concierge-portal', label: 'Concierge Portal', icon: Crown, description: 'Full concierge services portal', category: 'operational', priority: 'high' },
  { id: 'bell-desk', label: 'Bell Desk', icon: Package, description: 'Luggage handling & storage', category: 'operational', priority: 'low' },
  { id: 'transportation', label: 'Transportation', icon: Car, description: 'Airport transfers & shuttle', category: 'operational', priority: 'low' },
  { id: 'guest-requests', label: 'Guest Requests', icon: Bell, description: 'Service requests tracking', category: 'operational', priority: 'medium' },
  { id: 'lost-found', label: 'Lost & Found', icon: Search, description: 'Item registration & return', category: 'operational', priority: 'low' },
  
  // Communication & Marketing
  { id: 'communication-center', label: 'Communication Center', icon: MessageSquare, description: 'Messaging & notifications', category: 'guest', priority: 'medium' },
  { id: 'packages-addons', label: 'Packages & Add-ons', icon: Star, description: 'Experience packages', category: 'guest', priority: 'medium' },
  { id: 'loyalty', label: 'Loyalty Interface', icon: Award, description: 'Membership & rewards', category: 'guest', priority: 'low' },
  { id: 'ota-interface', label: 'OTA Interface', icon: Globe, description: 'Channel management', category: 'admin', priority: 'medium' },
  
  // Admin & Reports
  { id: 'revenue-controls', label: 'Revenue Controls', icon: TrendingUp, description: 'Dynamic pricing & restrictions', category: 'admin', priority: 'medium' },
  { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Daily, financial & operational reports', category: 'admin', priority: 'high' },
  { id: 'configuration', label: 'Configuration', icon: Settings, description: 'Hotel & front office setup', category: 'admin', priority: 'medium' },
];

const FrontOfficePortal = ({ activeTab, onTabChange }: { activeTab: string; onTabChange?: (tab: string) => void }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conciergePortalTab, setConciergePortalTab] = useState<string>('dashboard');

  // Read URL parameters for deep-linking (module switch)
  useEffect(() => {
    const module = searchParams.get('module');
    if (module) {
      onTabChange?.(module);
    }
  }, [searchParams, onTabChange]);

  // Navigate directly to a guest profile via URL — every profile is its own link
  const handleViewGuestProfile = (guestId: string) => {
    onTabChange?.('guest-profiles');
    navigate(`/erp/frontoffice/guest-profiles?guestId=${encodeURIComponent(guestId)}`);
  };

  const handleViewGroupProfile = (groupId: string) => {
    onTabChange?.('guest-profiles');
    navigate(`/erp/frontoffice/guest-profiles?groupId=${encodeURIComponent(groupId)}`);
  };

  // Cross-module navigation: CheckIn / CheckOut with a specific reservation
  const handleNavigateToCheckIn = (resId?: string) => {
    onTabChange?.('check-in');
    const url = resId
      ? `/erp/frontoffice/check-in?reservationId=${encodeURIComponent(resId)}`
      : '/erp/frontoffice/check-in';
    navigate(url);
  };

  // Cross-module navigation: CheckIn with a specific group (group check-in flow)
  const handleNavigateToGroupCheckIn = (groupId: string, groupName: string) => {
    onTabChange?.('check-in');
    const url = `/erp/frontoffice/check-in?groupId=${encodeURIComponent(groupId)}&groupName=${encodeURIComponent(groupName)}`;
    navigate(url);
  };

  const handleNavigateToCheckOut = (resId?: string) => {
    onTabChange?.('check-out');
    const url = resId
      ? `/erp/frontoffice/check-out?reservationId=${encodeURIComponent(resId)}`
      : '/erp/frontoffice/check-out';
    navigate(url);
  };

  // Cross-module navigation: CheckOut with a specific group (group check-out flow)
  const handleNavigateToGroupCheckOut = (groupId: string, groupName: string) => {
    onTabChange?.('check-out');
    const url = `/erp/frontoffice/check-out?groupId=${encodeURIComponent(groupId)}&groupName=${encodeURIComponent(groupName)}`;
    navigate(url);
  };

  // Cross-module navigation: Folio & Billing with a specific reservation
  const handleNavigateToFolio = (resId: string) => {
    onTabChange?.('folio-billing');
    navigate(`/erp/frontoffice/folio-billing?reservationId=${encodeURIComponent(resId)}`);
  };

  const handleTabChangeInternal = (tab: string) => {
    onTabChange?.(tab);
  };

  return (
    <div
      className={[
        'accent-operations',
        activeTab === 'concierge-portal' ? '' : 'space-y-6 animate-fade-in',
      ].filter(Boolean).join(' ')}
      id="front-office-portal"
    >
      {activeTab === 'concierge-portal' ? (
        <ConciergePortal
          activeTab={conciergePortalTab as any}
          onTabChange={setConciergePortalTab}
        />
      ) : (
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && <Dashboard onTabChange={handleTabChangeInternal} />}
          {activeTab === 'reservations' && <Reservations
          onNavigateToCheckIn={(resId) => handleNavigateToCheckIn(resId)}
          onNavigateToCheckOut={(resId) => handleNavigateToCheckOut(resId)}
          onNavigateToGroupCheckIn={(groupId, groupName) => handleNavigateToGroupCheckIn(groupId, groupName)}
          onNavigateToGroupCheckOut={(groupId, groupName) => handleNavigateToGroupCheckOut(groupId, groupName)}
          onViewGuestProfile={handleViewGuestProfile}
          onViewGroupProfile={handleViewGroupProfile}
        />}
        {activeTab === 'availability-inventory' && <AvailabilityInventory />}
        {activeTab === 'front-desk-operations' && (
          <FrontDeskOperations
            onNavigateToCheckIn={(resId) => handleNavigateToCheckIn(resId)}
            onNavigateToCheckOut={(resId) => handleNavigateToCheckOut(resId)}
          />
        )}
        {activeTab === 'room-assignment' && <RoomAssignment />}
        {activeTab === 'guest-profiles' && <GuestProfiles />}
        {activeTab === 'group-profiles-management' && <GroupProfilesManagement />}
        {activeTab === 'stay-management' && <StayManagement />}
        {activeTab === 'check-in' && <CheckIn />}
        {activeTab === 'check-out' && <CheckOut onNavigateToFolio={handleNavigateToFolio} />}
        {activeTab === 'folio-billing' && <FolioBilling />}
        {activeTab === 'night-audit' && <NightAudit />}
        {activeTab === 'keys-access' && <KeysAccess />}
        {activeTab === 'concierge' && <Concierge />}
        {activeTab === 'bell-desk' && <BellDesk />}
        {activeTab === 'transportation' && <Transportation />}
        {activeTab === 'guest-requests' && <GuestRequests />}
        {activeTab === 'lost-found' && <LostFound />}
        {activeTab === 'communication-center' && <CommunicationCenter />}
        {activeTab === 'packages-addons' && <PackagesAddons />}
        {activeTab === 'loyalty' && <Loyalty />}
        {activeTab === 'ota-interface' && <OTAInterface />}
        {activeTab === 'revenue-controls' && <RevenueControls />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'configuration' && <Configuration />}
      </div>
      )}
    </div>
  );
};

export default FrontOfficePortal;
export { MODULES, type PortalModule, type ModuleConfig };

