/**
 * Hotel Operations Portal (HOP)
 * The operational command center of the hotel
 * Provides real-time visibility into every department, coordinates cross-functional activities,
 * manages operational approvals, oversees service quality, and enables hotel leadership to make timely operational decisions
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  Users,
  ArrowRightLeft,
  LogOut,
  StickyNote,
  RefreshCw,
  Bell,
  Calendar,
  Clock,
  User,
  Bed,
  Utensils,
  Wrench,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FileText,
  Settings,
  LogIn,
  Star,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Activity,
  ShoppingCart,
  DollarSign,
  Grid3x3,
  FileBarChart,
  Download,
  MailOpen,
  Archive,
  CalendarDays,
  CircleDot,
  TrendingDown,
  BarChart3,
  PiggyBank,
  Percent,
  Save,
  Eye,
  Briefcase,
  ClipboardList,
  Target,
  Award,
  Heart,
  Radio,
  Megaphone,
  Flame,
  LifeBuoy,
  CheckSquare,
  ListChecks,
  FileCheck,
  Zap,
  Layers,
  Network,
  Globe,
  Navigation,
  Command,
  Ticket,
  Car,
  Plane,
  Train,
  type LucideIcon
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { SideNavigation, type SubNavItem } from '../Shared/SideNavigation';

// Import all modules
import ExecutiveOperationsDashboard from './modules/ExecutiveOperationsDashboard';
import OperationsCommandCenter from './modules/OperationsCommandCenter';
import DailyBriefing from './modules/DailyBriefing';
import MorningMeetingDashboard from './modules/MorningMeetingDashboard';
import ManagerApprovalCenter from './modules/ManagerApprovalCenter';
import CrossDepartmentTaskCenter from './modules/CrossDepartmentTaskCenter';
import DutyManagerWorkspace from './modules/DutyManagerWorkspace';
import OperationalCalendar from './modules/OperationalCalendar';
import VIPGuestManagement from './modules/VIPGuestManagement';
import GuestRecovery from './modules/GuestRecovery';
import ServiceQualityManagement from './modules/ServiceQualityManagement';
import RoomOperationsOverview from './modules/RoomOperationsOverview';
import OccupancyForecastMonitor from './modules/OccupancyForecastMonitor';
import EventGroupCoordination from './modules/EventGroupCoordination';
import EmergencyCoordination from './modules/EmergencyCoordination';
import OperationalCommunicationCenter from './modules/OperationalCommunicationCenter';
import EscalationCenter from './modules/EscalationCenter';
import SOPComplianceMonitoring from './modules/SOPComplianceMonitoring';
import ExecutiveChecklists from './modules/ExecutiveChecklists';
import DailyFlashReports from './modules/DailyFlashReports';
import Reports from './modules/Reports';
import Configuration from './modules/Configuration';

type OperationsView = 
  | 'executive-dashboard'
  | 'command-center'
  | 'daily-briefing'
  | 'morning-meeting'
  | 'approvals'
  | 'cross-department-tasks'
  | 'duty-manager'
  | 'calendar'
  | 'vip-management'
  | 'guest-recovery'
  | 'service-quality'
  | 'room-operations'
  | 'occupancy-forecast'
  | 'event-coordination'
  | 'emergency'
  | 'communication'
  | 'escalations'
  | 'sop-compliance'
  | 'executive-checklists'
  | 'flash-reports'
  | 'reports'
  | 'configuration';

interface HotelOperationsPortalProps {
  embedded?: boolean;
  forcedView?: OperationsView;
  activeTab?: OperationsView;
  onTabChange?: (tab: OperationsView) => void;
  hideNav?: boolean;
}

const HotelOperationsPortal: React.FC<HotelOperationsPortalProps> = ({
  embedded = false,
  forcedView,
  activeTab,
  onTabChange,
  hideNav = false
}) => {
  const { currentUser, addNotification } = useERP();
  // Phase 4: prefer activeTab (URL-driven) over forcedView, fall back to default
  const [internalActiveView, setInternalActiveView] = useState<OperationsView>(forcedView || 'executive-dashboard');
  const activeView = activeTab ?? internalActiveView;
  const setActiveView = (view: OperationsView) => {
    if (onTabChange) onTabChange(view);
    else setInternalActiveView(view);
  };
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Navigation items for all modules
  const navigationItems: SubNavItem[] = [
    { id: 'executive-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'command-center', label: 'Operations Command Center', icon: Command },
    { id: 'daily-briefing', label: 'Daily Briefing', icon: FileText },
    { id: 'morning-meeting', label: 'Morning Meeting', icon: Users },
    { id: 'approvals', label: 'Manager Approvals', icon: CheckCircle2 },
    { id: 'cross-department-tasks', label: 'Cross-Department Tasks', icon: ArrowRightLeft },
    { id: 'duty-manager', label: 'Duty Manager Workspace', icon: Briefcase },
    { id: 'calendar', label: 'Operational Calendar', icon: Calendar },
    { id: 'vip-management', label: 'VIP Guest Management', icon: Star },
    { id: 'guest-recovery', label: 'Guest Recovery', icon: Heart },
    { id: 'service-quality', label: 'Service Quality', icon: Award },
    { id: 'room-operations', label: 'Room Operations', icon: Bed },
    { id: 'occupancy-forecast', label: 'Occupancy & Forecast', icon: TrendingUp },
    { id: 'event-coordination', label: 'Event & Group Coordination', icon: Ticket },
    { id: 'emergency', label: 'Emergency Coordination', icon: Flame },
    { id: 'communication', label: 'Communication Center', icon: Megaphone },
    { id: 'escalations', label: 'Escalation Center', icon: AlertTriangle },
    { id: 'sop-compliance', label: 'SOP & Compliance', icon: ListChecks },
    { id: 'executive-checklists', label: 'Executive Checklists', icon: CheckSquare },
    { id: 'flash-reports', label: 'Daily Flash Reports', icon: FileBarChart },
    { id: 'reports', label: 'Reports', icon: FileCheck },
    { id: 'configuration', label: 'Configuration', icon: Settings },
  ];

  // Handle view changes
  const handleViewChange = (viewId: string) => {
    setActiveView(viewId as OperationsView);
  };

  // Render active module
  const renderActiveModule = () => {
    switch (activeView) {
      case 'executive-dashboard':
        return <ExecutiveOperationsDashboard />;
      case 'command-center':
        return <OperationsCommandCenter />;
      case 'daily-briefing':
        return <DailyBriefing />;
      case 'morning-meeting':
        return <MorningMeetingDashboard />;
      case 'approvals':
        return <ManagerApprovalCenter />;
      case 'cross-department-tasks':
        return <CrossDepartmentTaskCenter />;
      case 'duty-manager':
        return <DutyManagerWorkspace />;
      case 'calendar':
        return <OperationalCalendar />;
      case 'vip-management':
        return <VIPGuestManagement />;
      case 'guest-recovery':
        return <GuestRecovery />;
      case 'service-quality':
        return <ServiceQualityManagement />;
      case 'room-operations':
        return <RoomOperationsOverview />;
      case 'occupancy-forecast':
        return <OccupancyForecastMonitor />;
      case 'event-coordination':
        return <EventGroupCoordination />;
      case 'emergency':
        return <EmergencyCoordination />;
      case 'communication':
        return <OperationalCommunicationCenter />;
      case 'escalations':
        return <EscalationCenter />;
      case 'sop-compliance':
        return <SOPComplianceMonitoring />;
      case 'executive-checklists':
        return <ExecutiveChecklists />;
      case 'flash-reports':
        return <DailyFlashReports />;
      case 'reports':
        return <Reports />;
      case 'configuration':
        return <Configuration />;
      default:
        return <ExecutiveOperationsDashboard />;
    }
  };

  // If embedded, just render the module without navigation
  if (embedded) {
    return (
      <div className="w-full h-full">
        {renderActiveModule()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Side Navigation */}
      {!hideNav && (
        <SideNavigation
          activeDept="operations"
          activeDeptLabel="Hotel Operations Portal"
          currentUser={currentUser || null}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          subItems={navigationItems}
          activeSubItem={activeView}
          onSubItemClick={handleViewChange}
          notifications={notifications}
          unreadNotifCount={unreadCount}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
          onMarkNotificationRead={(id) => {
            setNotifications(prev => 
              prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          }}
          onClearNotification={(id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
};

export default HotelOperationsPortal;