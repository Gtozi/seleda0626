/**
 * Banquet & Events Portal
 * Centralized platform for managing the complete lifecycle of meetings, conferences, weddings, banquets, exhibitions, social functions, and other events
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Building2,
  ClipboardList,
  FileText,
  Heart,
  Users,
  Coffee,
  Utensils,
  Package,
  CheckSquare,
  CheckCircle2,
  Network,
  Clock,
  User,
  QrCode,
  Armchair,
  Monitor,
  Truck,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  RefreshCw,
  Bell,
  Plus,
  AlertTriangle,
  TrendingUp,
  Activity,
  Star,
  ChevronRight,
  Edit,
  PiggyBank
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

type BanquetEventsView = 
  | 'dashboard'
  | 'calendar'
  | 'booking'
  | 'function-space'
  | 'planning'
  | 'beo'
  | 'wedding'
  | 'conference'
  | 'meeting'
  | 'social'
  | 'accommodation'
  | 'menu'
  | 'beverage'
  | 'resources'
  | 'tasks'
  | 'coordination'
  | 'timeline'
  | 'guests'
  | 'registration'
  | 'seating'
  | 'equipment'
  | 'vendors'
  | 'transportation'
  | 'billing'
  | 'communication'
  | 'reports'
  | 'configuration';

type EventStatus = 'Tentative' | 'Confirmed' | 'Planning' | 'InProgress' | 'Completed' | 'Cancelled';
type EventType = 'Wedding' | 'Conference' | 'Seminar' | 'Meeting' | 'GalaDinner' | 'Birthday' | 'Anniversary' | 'Graduation' | 'ReligiousEvent' | 'Exhibition' | 'CocktailReception' | 'ProductLaunch' | 'CorporateEvent';
type VenueType = 'Ballroom' | 'ConferenceRoom' | 'MeetingRoom' | 'OutdoorGarden' | 'Poolside' | 'Rooftop' | 'Restaurant' | 'VIPLounge' | 'ExhibitionHall';
type BEOStatus = 'Draft' | 'Review' | 'Approved' | 'Distributed' | 'Revised' | 'Final' | 'Completed';
type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Overdue';
type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';

interface Event {
  eventId: string;
  eventName: string;
  eventType: EventType;
  clientId: string;
  clientName: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  venueIds: string[];
  expectedAttendance: number;
  status: EventStatus;
  estimatedRevenue: number;
  actualRevenue: number | null;
  depositAmount: number;
  depositPaid: boolean;
  finalBalance: number;
  finalPaid: boolean;
  packageId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  venueId: string;
  venueName: string;
  venueType: VenueType;
  capacity: number;
  area: number;
  floor: string;
  features: string[];
  layouts: string[];
  hourlyRate: number;
  dailyRate: number;
  isActive: boolean;
}

interface BEO {
  beoId: string;
  eventId: string;
  eventName: string;
  clientName: string;
  eventDate: string;
  venueIds: string[];
  setupTime: string;
  eventStartTime: string;
  eventEndTime: string;
  breakdownTime: string;
  status: BEOStatus;
  menuItems: string[];
  beverageItems: string[];
  equipment: string[];
  staffing: { role: string; count: number }[];
  specialRequests: string[];
  vipInformation: string[];
  distributedTo: string[];
  distributedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  taskId: string;
  eventId: string;
  eventName: string;
  title: string;
  description: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
  completedAt: string | null;
}

interface Alert {
  alertId: string;
  type: 'DepositDue' | 'ContractPending' | 'MenuApprovalPending' | 'RoomSetupDelay' | 'EquipmentShortage' | 'VendorDelay' | 'VIPEvent' | 'LastMinuteChange';
  eventId: string;
  eventName: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  isRead: boolean;
  createdAt: string;
}

interface DepartmentReadiness {
  department: string;
  eventId: string;
  eventName: string;
  status: 'NotStarted' | 'InProgress' | 'Ready' | 'Blocked';
  completedTasks: number;
  totalTasks: number;
  notes: string;
  updatedAt: string;
}

interface KPIData {
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  confirmedBookings: number;
  tentativeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingDeposits: number;
  beoCompletion: number;
  taskCompletion: number;
  departmentReadiness: number;
}

interface BanquetEventsPortalProps {
  activeTab?: BanquetEventsView;
  onTabChange?: (tab: BanquetEventsView) => void;
}

const BanquetEventsPortal: React.FC<BanquetEventsPortalProps> = ({ activeTab, onTabChange }) => {
  const { addNotification: addERPNotification } = useERP();
  // Phase 4: prefer activeTab (URL-driven), fall back to internal state
  const [internalActiveView, setInternalActiveView] = useState<BanquetEventsView>('dashboard');
  const activeView = activeTab ?? internalActiveView;
  const setActiveView = (view: BanquetEventsView) => {
    if (onTabChange) onTabChange(view);
    else setInternalActiveView(view);
  };
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [beos, setBEOs] = useState<BEO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    eventsToday: 0,
    eventsThisWeek: 0,
    eventsThisMonth: 0,
    confirmedBookings: 0,
    tentativeBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    pendingDeposits: 0,
    beoCompletion: 0,
    taskCompletion: 0,
    departmentReadiness: 0
  });
  const [loading, setLoading] = useState(false);

  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    addERPNotification(message, type, 'Executive');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, venuesRes, beosRes, tasksRes, alertsRes, kpiRes] = await Promise.all([
        fetch('/api/banquet-events/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        }),
        fetch('/api/banquet-events/venues', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        }),
        fetch('/api/banquet-events/beos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        }),
        fetch('/api/banquet-events/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        }),
        fetch('/api/banquet-events/alerts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        }),
        fetch('/api/banquet-events/kpis', {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
        })
      ]);

      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (venuesRes.ok) setVenues(await venuesRes.json());
      if (beosRes.ok) setBEOs(await beosRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (kpiRes.ok) setKpiData(await kpiRes.json());
    } catch (error) {
      console.error('Failed to fetch banquet events data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Approved':
      case 'Ready':
      case 'Completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50';
      case 'Tentative':
      case 'Draft':
      case 'NotStarted':
      case 'Pending':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50';
      case 'Planning':
      case 'Review':
      case 'InProgress':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'InProgress':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'Cancelled':
      case 'Blocked':
      case 'Overdue':
        return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Urgent': return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50';
      case 'High': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50';
      case 'Normal': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'Wedding': return <Heart className="w-4 h-4" />;
      case 'Conference': return <Users className="w-4 h-4" />;
      case 'Meeting': return <ClipboardList className="w-4 h-4" />;
      case 'GalaDinner': return <Utensils className="w-4 h-4" />;
      case 'Birthday': return <Star className="w-4 h-4" />;
      case 'Exhibition': return <Building2 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard' as BanquetEventsView, label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as BanquetEventsView, label: 'Event Calendar', icon: Calendar },
    { id: 'booking' as BanquetEventsView, label: 'Event Booking', icon: Plus },
    { id: 'function-space' as BanquetEventsView, label: 'Function Space', icon: Building2 },
    { id: 'planning' as BanquetEventsView, label: 'Event Planning', icon: ClipboardList },
    { id: 'beo' as BanquetEventsView, label: 'BEO', icon: FileText, badge: beos.filter(b => b.status === 'Draft' || b.status === 'Review').length },
    { id: 'wedding' as BanquetEventsView, label: 'Weddings', icon: Heart },
    { id: 'conference' as BanquetEventsView, label: 'Conferences', icon: Users },
    { id: 'meeting' as BanquetEventsView, label: 'Meetings', icon: ClipboardList },
    { id: 'social' as BanquetEventsView, label: 'Social Events', icon: Star },
    { id: 'accommodation' as BanquetEventsView, label: 'Group Accommodation', icon: Building2 },
    { id: 'menu' as BanquetEventsView, label: 'Menu Planning', icon: Utensils },
    { id: 'beverage' as BanquetEventsView, label: 'Beverage Planning', icon: Coffee },
    { id: 'resources' as BanquetEventsView, label: 'Resources', icon: Package },
    { id: 'tasks' as BanquetEventsView, label: 'Tasks', icon: CheckSquare, badge: tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue').length },
    { id: 'coordination' as BanquetEventsView, label: 'Department Coordination', icon: Network },
    { id: 'timeline' as BanquetEventsView, label: 'Event Timeline', icon: Clock },
    { id: 'guests' as BanquetEventsView, label: 'Guests & Attendees', icon: User },
    { id: 'registration' as BanquetEventsView, label: 'Registration', icon: QrCode },
    { id: 'seating' as BanquetEventsView, label: 'Seating', icon: Armchair },
    { id: 'equipment' as BanquetEventsView, label: 'Equipment', icon: Monitor },
    { id: 'vendors' as BanquetEventsView, label: 'Vendors', icon: Truck },
    { id: 'transportation' as BanquetEventsView, label: 'Transportation', icon: Truck },
    { id: 'billing' as BanquetEventsView, label: 'Billing & Deposits', icon: DollarSign },
    { id: 'communication' as BanquetEventsView, label: 'Communication', icon: MessageSquare },
    { id: 'reports' as BanquetEventsView, label: 'Reports', icon: BarChart3 },
    { id: 'configuration' as BanquetEventsView, label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="banquet-events-portal-module">
      {/* Header — hidden when embedded in UnifiedPortal */}
      {!embedded && (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Banquet & Events</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Banquet & Events Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchKPIs();
              fetchEvents();
              fetchVenues();
              fetchBEOs();
              fetchTasks();
              fetchAlerts();
              fetchDepartmentReadiness();
              addNotification('Data refreshed', 'success', 'Banquet & Events');
            }}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="relative px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-800">
            <Bell size={14} />
            {alerts.filter(a => !a.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {alerts.filter(a => !a.isRead).length}
              </span>
            )}
          </button>
        </div>
      </div>
      )}

      {/* View Selector — hidden when hideNav is set by UnifiedPortal */}
      {!hideNav && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeView === item.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Content Views */}
      <div>
        {activeView === 'dashboard' && (
          <ExecutiveDashboardView
            kpiData={kpiData}
            alerts={alerts}
            eventsToday={events.filter((e: Event) => {
              const today = new Date().toISOString().split('T')[0];
              return e.startDate <= today && e.endDate >= today;
            })}
            upcomingEvents={events.filter((e: Event) => e.startDate > new Date().toISOString().split('T')[0]).slice(0, 5)}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            getEventTypeIcon={getEventTypeIcon}
          />
        )}

        {activeView === 'calendar' && (
          <EventCalendarView
            events={events}
            venues={venues}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            getEventTypeIcon={getEventTypeIcon}
          />
        )}

        {activeView === 'booking' && (
          <EventBookingView
            venues={venues}
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'function-space' && (
          <FunctionSpaceView
            venues={venues}
            events={events}
            loading={loading}
            onRefresh={fetchData}
            addNotification={addNotification}
          />
        )}

        {activeView === 'planning' && (
          <EventPlanningView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'beo' && (
          <BEOView
            beos={beos}
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'wedding' && (
          <WeddingManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'conference' && (
          <ConferenceManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'meeting' && (
          <MeetingManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'social' && (
          <SocialEventsView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'accommodation' && (
          <GroupAccommodationView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'menu' && (
          <MenuPlanningView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'beverage' && (
          <BeveragePlanningView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'resources' && (
          <ResourceManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'tasks' && (
          <TaskManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'departments' && (
          <DepartmentCoordinationView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'timeline' && (
          <EventTimelineView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'guests' && (
          <GuestManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'registration' && <RegistrationManagementView />}

        {activeView === 'seating' && <SeatingManagementView />}

        {activeView === 'equipment' && (
          <EquipmentManagementView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'vendors' && (
          <VendorCoordinationView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'transportation' && <TransportationCoordinationView />}

        {activeView === 'billing' && (
          <BillingDepositsView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            addNotification={addNotification}
          />
        )}

        {activeView === 'communication' && (
          <CommunicationCenterView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}

        {activeView === 'configuration' && (
          <ConfigurationView
            events={events}
            loading={loading}
            onRefresh={fetchData}
            getStatusColor={getStatusColor}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
};

// Executive Dashboard View
const ExecutiveDashboardView = ({ kpiData, alerts, eventsToday, upcomingEvents, loading, onRefresh, getStatusColor, getEventTypeIcon }: any) => (
  <div className="space-y-6">
    {/* Event KPIs */}
    <div>
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Event KPIs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard title="Events Today" value={kpiData.eventsToday} icon={Calendar} color="purple" />
        <KPICard title="Upcoming Events" value={kpiData.upcomingEvents} icon={CalendarDays} color="blue" />
        <KPICard title="Active Planning" value={kpiData.activePlanningEvents} icon={ClipboardList} color="amber" />
        <KPICard title="Event Revenue" value={`$${kpiData.eventRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <KPICard title="Profitability" value={`${kpiData.eventProfitability}%`} icon={TrendingUp} color="emerald" />
        <KPICard title="Confirmed" value={kpiData.confirmedEvents} icon={CheckSquare} color="emerald" />
        <KPICard title="Tentative" value={kpiData.tentativeEvents} icon={Clock} color="blue" />
        <KPICard title="Cancelled" value={kpiData.cancelledEvents} icon={XCircle} color="rose" />
        <KPICard title="Space Utilization" value={`${kpiData.functionSpaceUtilization}%`} icon={Building2} color="indigo" />
        <KPICard title="Avg Event Value" value={`$${kpiData.averageEventValue.toLocaleString()}`} icon={Activity} color="cyan" />
      </div>
    </div>

    {/* Operational KPIs */}
    <div>
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Operational KPIs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard title="BEO Completion" value={`${kpiData.beoCompletion}%`} icon={FileText} color="purple" />
        <KPICard title="Dept Readiness" value={`${kpiData.departmentReadinessScore}%`} icon={Network} color="blue" />
        <KPICard title="Outstanding Tasks" value={kpiData.outstandingTasks} icon={CheckSquare} color="amber" />
        <KPICard title="Vendor Confirmations" value={kpiData.vendorConfirmations} icon={Truck} color="emerald" />
        <KPICard title="Equipment Available" value={`${kpiData.equipmentAvailability}%`} icon={Monitor} color="cyan" />
        <KPICard title="Staffing Status" value={`${kpiData.staffingStatus}%`} icon={Users} color="indigo" />
      </div>
    </div>

    {/* Today's Events and Alerts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Events</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{eventsToday.length} events</span>
        </div>
        {eventsToday.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No events scheduled today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsToday.map((event: any) => (
              <div key={event.eventId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  {getEventTypeIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{event.eventName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{event.clientName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(event.startDate).toLocaleDateString()} - {event.expectedAttendance} guests</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alerts</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{alerts.filter(a => !a.isRead).length} unread</span>
        </div>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 6).map((alert: any) => (
              <div key={alert.alertId} className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${!alert.isRead ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.severity === 'Critical' ? 'bg-rose-100 dark:bg-rose-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                  <AlertTriangle size={18} className={alert.severity === 'Critical' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{alert.eventName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{alert.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Upcoming Events */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Events</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Next 5 events</span>
      </div>
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming events</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Event</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event: any) => (
                <tr key={event.eventId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.eventType)}
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{event.eventType}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{event.clientName}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{new Date(event.startDate).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{event.expectedAttendance}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white">${event.estimatedRevenue.toLocaleString()}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

const KPICard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
        <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
  </div>
);

// Event Calendar View
const EventCalendarView = ({ events, venues, loading, onRefresh, getStatusColor, getEventTypeIcon }: any) => {
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly' | 'timeline' | 'function-space' | 'department'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | EventType>('all');

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter((e: Event) => e.eventType === filterType);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter((e: Event) => {
      const eventStart = new Date(e.startDate).toISOString().split('T')[0];
      const eventEnd = new Date(e.endDate).toISOString().split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const daysInMonth = getDaysInMonth(selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly', 'timeline', 'function-space', 'department'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition capitalize ${
                  calendarView === view
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {view.replace('-', ' ')}
              </button>
            ))}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | EventType)}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg border-0 text-slate-900 dark:text-white"
          >
            <option value="all">All Event Types</option>
            <option value="Wedding">Weddings</option>
            <option value="Conference">Conferences</option>
            <option value="Meeting">Meetings</option>
            <option value="GalaDinner">Gala Dinners</option>
            <option value="Birthday">Birthdays</option>
            <option value="Anniversary">Anniversaries</option>
            <option value="Exhibition">Exhibitions</option>
            <option value="CorporateEvent">Corporate Events</option>
          </select>
        </div>
      </div>

      {/* Monthly Calendar View */}
      {calendarView === 'monthly' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />;
              }
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`aspect-square p-2 rounded-xl border transition cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 ${
                    isToday
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.eventId}
                        className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate bg-white dark:bg-slate-700 px-1 py-0.5 rounded"
                      >
                        {event.eventName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {calendarView === 'weekly' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly view implementation coming soon</p>
        </div>
      )}

      {/* Daily View */}
      {calendarView === 'daily' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {getEventsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event: any) => (
                <div key={event.eventId} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    {getEventTypeIcon(event.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{event.eventName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{event.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{event.expectedAttendance} guests</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {calendarView === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">Timeline view implementation coming soon</p>
        </div>
      )}

      {/* Function Space View */}
      {calendarView === 'function-space' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Function Space Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue: any) => (
              <div key={venue.venueId} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{venue.venueName}</h4>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${venue.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {venue.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{venue.venueType}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Capacity: {venue.capacity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department View */}
      {calendarView === 'department' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">Department view implementation coming soon</p>
        </div>
      )}
    </div>
  );
};

// Event Booking View
const EventBookingView = ({ venues, events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventType: '' as EventType,
    eventName: '',
    clientId: '',
    clientName: '',
    organizerName: '',
    startDate: '',
    endDate: '',
    venueIds: [] as string[],
    expectedAttendance: '',
    packageId: '',
    notes: '',
    estimatedRevenue: '',
    depositAmount: ''
  });

  const eventTypes: EventType[] = [
    'Wedding', 'Conference', 'Seminar', 'Meeting', 'GalaDinner', 
    'Birthday', 'Anniversary', 'Graduation', 'ReligiousEvent', 
    'Exhibition', 'CocktailReception', 'ProductLaunch', 'CorporateEvent'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...formData, expectedAttendance: parseInt(formData.expectedAttendance), estimatedRevenue: parseFloat(formData.estimatedRevenue), depositAmount: parseFloat(formData.depositAmount), status: 'Tentative', depositPaid: false, finalBalance: parseFloat(formData.estimatedRevenue) - parseFloat(formData.depositAmount), finalPaid: false })
      });
      if (response.ok) {
        addNotification('Event booked successfully', 'success');
        setShowForm(false);
        setFormData({ ...initialFormData });
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to book event:', error);
      addNotification('Failed to book event', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Event Booking</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Plus size={14} />
          {showForm ? 'Cancel' : 'New Event Booking'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, eventType: type })}
                    className={`p-3 rounded-xl text-xs font-bold border transition ${
                      formData.eventType === type
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event Name</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Organizer Name</label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Client ID</label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Venue Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Function Spaces</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {venues.map((venue: any) => (
                  <label
                    key={venue.venueId}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.venueIds.includes(venue.venueId)
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.venueIds.includes(venue.venueId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, venueIds: [...formData.venueIds, venue.venueId] });
                        } else {
                          setFormData({ ...formData, venueIds: formData.venueIds.filter(id => id !== venue.venueId) });
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{venue.venueName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{venue.venueType}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Cap: {venue.capacity}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Attendance and Financials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Expected Attendance</label>
                <input
                  type="number"
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Estimated Revenue</label>
                <input
                  type="number"
                  value={formData.estimatedRevenue}
                  onChange={(e) => setFormData({ ...formData, estimatedRevenue: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Deposit Amount</label>
                <input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Package */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Package (Optional)</label>
              <input
                type="text"
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter package ID or name"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Special requests, dietary requirements, etc."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                Create Event Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Calendar size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Create a New Event Booking</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Book weddings, conferences, meetings, and other events</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Plus size={14} className="inline mr-2" />
            Start Booking
          </button>
        </div>
      )}
    </div>
  );
};

// Function Space Management View
const FunctionSpaceView = ({ venues, events, loading, onRefresh, addNotification }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    venueName: '',
    venueType: 'Ballroom' as VenueType,
    capacity: '',
    area: '',
    floor: '',
    features: '',
    layouts: '',
    hourlyRate: '',
    dailyRate: '',
    isActive: true
  });

  const venueTypes: VenueType[] = [
    'Ballroom', 'ConferenceRoom', 'MeetingRoom', 'OutdoorGarden', 
    'Poolside', 'Rooftop', 'Restaurant', 'VIPLounge', 'ExhibitionHall'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/venues', {
        method: selectedVenue ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...formData, capacity: parseInt(formData.capacity), area: parseInt(formData.area), hourlyRate: parseFloat(formData.hourlyRate), dailyRate: parseFloat(formData.dailyRate), features: formData.features.split(',').map(f => f.trim()), layouts: formData.layouts.split(',').map(l => l.trim()), venueId: selectedVenue?.venueId })
      });
      if (response.ok) {
        addNotification(selectedVenue ? 'Venue updated successfully' : 'Venue created successfully', 'success');
        setShowForm(false);
        setSelectedVenue(null);
        setFormData(initialVenueFormData);
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save venue:', error);
      addNotification('Failed to save venue', 'warning');
    }
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData({
      venueName: venue.venueName,
      venueType: venue.venueType,
      capacity: venue.capacity.toString(),
      area: venue.area.toString(),
      floor: venue.floor,
      features: venue.features.join(', '),
      layouts: venue.layouts.join(', '),
      hourlyRate: venue.hourlyRate.toString(),
      dailyRate: venue.dailyRate.toString(),
      isActive: venue.isActive
    });
    setShowForm(true);
  };

  const getVenueEvents = (venueId: string) => {
    return events.filter(e => e.venueIds.includes(venueId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Function Space Management</h3>
        <button
          onClick={() => {
            setSelectedVenue(null);
            setFormData({
              venueName: '',
              venueType: 'Ballroom',
              capacity: '',
              area: '',
              floor: '',
              features: '',
              layouts: '',
              hourlyRate: '',
              dailyRate: '',
              isActive: true
            });
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Plus size={14} />
          {showForm ? 'Cancel' : 'Add Venue'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Venue Type</label>
                <select
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value as VenueType })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {venueTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/([A-Z])/g, ' $1').trim()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Floor</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Hourly Rate</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Daily Rate</label>
                <input
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Features (comma-separated)</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Projector, Sound System, Stage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Layouts (comma-separated)</label>
              <input
                type="text"
                value={formData.layouts}
                onChange={(e) => setFormData({ ...formData, layouts: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Theater, Classroom, Banquet"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                {selectedVenue ? 'Update Venue' : 'Create Venue'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue: any) => {
          const venueEvents = getVenueEvents(venue.venueId);
          return (
            <div key={venue.venueId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{venue.venueName}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{venue.venueType}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${venue.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {venue.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Capacity</span>
                  <span className="text-slate-900 dark:text-white font-bold">{venue.capacity}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Area</span>
                  <span className="text-slate-900 dark:text-white font-bold">{venue.area} sq ft</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Floor</span>
                  <span className="text-slate-900 dark:text-white font-bold">{venue.floor}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Hourly Rate</span>
                  <span className="text-slate-900 dark:text-white font-bold">${venue.hourlyRate}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Daily Rate</span>
                  <span className="text-slate-900 dark:text-white font-bold">${venue.dailyRate}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Features</p>
                <div className="flex flex-wrap gap-1">
                  {venue.features.slice(0, 3).map((feature: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-600 dark:text-slate-400 rounded">
                      {feature}
                    </span>
                  ))}
                  {venue.features.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-600 dark:text-slate-400 rounded">
                      +{venue.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Upcoming Events</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">{venueEvents.length} events scheduled</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(venue)}
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 transition flex items-center justify-center gap-1"
                >
                  <Edit size={12} />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EventPlanningView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    eventId: '',
    taskName: '',
    startTime: '',
    endTime: '',
    assignedTo: '',
    department: '',
    notes: ''
  });
  const [checklistForm, setChecklistForm] = useState({
    eventId: '',
    itemName: '',
    category: '',
    dueDate: '',
    assignedTo: ''
  });

  const planningEvents = events.filter((e: Event) => e.status === 'Planning' || e.status === 'Tentative');

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(scheduleForm)
      });
      if (response.ok) {
        addNotification('Schedule item added successfully', 'success');
        setShowScheduleForm(false);
        setScheduleForm({ eventId: '', taskName: '', startTime: '', endTime: '', assignedTo: '', department: '', notes: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add schedule item', 'warning');
    }
  };

  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(checklistForm)
      });
      if (response.ok) {
        addNotification('Checklist item added successfully', 'success');
        setChecklistForm({ eventId: '', itemName: '', category: '', dueDate: '', assignedTo: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add checklist item', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Event Planning</h3>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Plus size={14} />
          {showScheduleForm ? 'Cancel' : 'Add Schedule Item'}
        </button>
      </div>

      {showScheduleForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={scheduleForm.eventId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {planningEvents.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Task Name</label>
                <input
                  type="text"
                  value={scheduleForm.taskName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, taskName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={scheduleForm.assignedTo}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                <select
                  value={scheduleForm.department}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="F&B">Food & Beverage</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Security">Security</option>
                  <option value="Front Office">Front Office</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Schedule Item
            </button>
          </form>
        </div>
      )}

      {/* Events in Planning */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Events in Planning</h4>
        {planningEvents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No events in planning stage</p>
        ) : (
          <div className="space-y-3">
            {planningEvents.map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{event.startDate} - {event.endDate}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-lg font-bold text-purple-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guests</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-lg font-bold text-emerald-600">{Math.round((event.estimatedRevenue || 0) / 1000)}k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-lg font-bold text-amber-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days Left</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Planning Checklist Template */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm venue availability and booking',
            'Finalize menu selection with client',
            'Arrange audiovisual equipment',
            'Coordinate with F&B for service requirements',
            'Confirm staffing requirements',
            'Setup payment schedule',
            'Review special requests',
            'Finalize transportation arrangements',
            'Confirm accommodation for VIPs',
            'Prepare emergency contingency plan'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Banquet Event Orders (BEO) View
const BEOView = ({ beos, events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedBEO, setSelectedBEO] = useState<BEO | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | BEOStatus>('all');
  const [formData, setFormData] = useState({
    eventId: '',
    setupTime: '',
    eventStartTime: '',
    eventEndTime: '',
    breakdownTime: '',
    menuItems: '',
    beverageItems: '',
    equipment: '',
    staffing: '',
    specialRequests: '',
    vipInformation: ''
  });

  const filteredBEOs = filterStatus === 'all' 
    ? beos 
    : beos.filter((b: BEO) => b.status === filterStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/beos', {
        method: selectedBEO ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}`
        },
        body: JSON.stringify({
          ...formData,
          menuItems: formData.menuItems.split('\n').filter(i => i.trim()),
          beverageItems: formData.beverageItems.split('\n').filter(i => i.trim()),
          equipment: formData.equipment.split('\n').filter(i => i.trim()),
          specialRequests: formData.specialRequests.split('\n').filter(i => i.trim()),
          vipInformation: formData.vipInformation.split('\n').filter(i => i.trim()),
          staffing: formData.staffing.split('\n').map(s => {
            const [role, count] = s.split(':');
            return { role: role?.trim() || '', count: parseInt(count?.trim() || '0') };
          }),
          status: 'Draft' as BEOStatus,
          beoId: selectedBEO?.beoId
        })
      });
      if (response.ok) {
        addNotification(selectedBEO ? 'BEO updated successfully' : 'BEO created successfully', 'success');
        setShowForm(false);
        setSelectedBEO(null);
        setFormData({
          eventId: '',
          setupTime: '',
          eventStartTime: '',
          eventEndTime: '',
          breakdownTime: '',
          menuItems: '',
          beverageItems: '',
          equipment: '',
          staffing: '',
          specialRequests: '',
          vipInformation: ''
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save BEO:', error);
      addNotification('Failed to save BEO', 'warning');
    }
  };

  const handleEdit = (beo: BEO) => {
    setSelectedBEO(beo);
    setFormData({
      eventId: beo.eventId,
      setupTime: beo.setupTime,
      eventStartTime: beo.eventStartTime,
      eventEndTime: beo.eventEndTime,
      breakdownTime: beo.breakdownTime,
      menuItems: beo.menuItems.join('\n'),
      beverageItems: beo.beverageItems.join('\n'),
      equipment: beo.equipment.join('\n'),
      staffing: beo.staffing.map(s => `${s.role}: ${s.count}`).join('\n'),
      specialRequests: beo.specialRequests.join('\n'),
      vipInformation: beo.vipInformation.join('\n')
    });
    setShowForm(true);
  };

  const updateBEOStatus = async (beoId: string, newStatus: BEOStatus) => {
    try {
      const response = await fetch(`/api/banquet-events/beos/${beoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        addNotification(`BEO status updated to ${newStatus}`, 'success');
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update BEO status:', error);
      addNotification('Failed to update BEO status', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Banquet Event Orders (BEO)</h3>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | BEOStatus)}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg border-0 text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
            <option value="Approved">Approved</option>
            <option value="Distributed">Distributed</option>
            <option value="Revised">Revised</option>
            <option value="Final">Final</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            onClick={() => {
              setSelectedBEO(null);
              setFormData({
                eventId: '',
                setupTime: '',
                eventStartTime: '',
                eventEndTime: '',
                breakdownTime: '',
                menuItems: '',
                beverageItems: '',
                equipment: '',
                staffing: '',
                specialRequests: '',
                vipInformation: ''
              });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Plus size={14} />
            {showForm ? 'Cancel' : 'New BEO'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
              <select
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Event</option>
                {events.map((event: any) => (
                  <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Setup Time</label>
                <input
                  type="datetime-local"
                  value={formData.setupTime}
                  onChange={(e) => setFormData({ ...formData, setupTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event Start</label>
                <input
                  type="datetime-local"
                  value={formData.eventStartTime}
                  onChange={(e) => setFormData({ ...formData, eventStartTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event End</label>
                <input
                  type="datetime-local"
                  value={formData.eventEndTime}
                  onChange={(e) => setFormData({ ...formData, eventEndTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Breakdown Time</label>
                <input
                  type="datetime-local"
                  value={formData.breakdownTime}
                  onChange={(e) => setFormData({ ...formData, breakdownTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Menu Items (one per line)</label>
                <textarea
                  value={formData.menuItems}
                  onChange={(e) => setFormData({ ...formData, menuItems: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Appetizer: Bruschetta&#10;Main: Grilled Salmon&#10;Dessert: Tiramisu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Beverage Items (one per line)</label>
                <textarea
                  value={formData.beverageItems}
                  onChange={(e) => setFormData({ ...formData, beverageItems: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Red Wine (50 bottles)&#10;White Wine (30 bottles)&#10;Sparkling Water (100 bottles)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipment (one per line)</label>
              <textarea
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Projector x2&#10;Sound System&#10;Microphones x10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Staffing (role: count, one per line)</label>
              <textarea
                value={formData.staffing}
                onChange={(e) => setFormData({ ...formData, staffing: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Waiters: 10&#10;Bartenders: 3&#10;Chefs: 5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests (one per line)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Gluten-free options needed&#10;Vegetarian menu for 5 guests"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">VIP Information (one per line)</label>
                <textarea
                  value={formData.vipInformation}
                  onChange={(e) => setFormData({ ...formData, vipInformation: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="VIP Guest: John Doe - Table 1&#10;VIP Guest: Jane Smith - Table 2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                {selectedBEO ? 'Update BEO' : 'Create BEO'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBEOs.map((beo: any) => (
          <div key={beo.beoId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{beo.eventName}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{beo.clientName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(beo.eventDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(beo.status)}`}>
                {beo.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Setup</p>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{new Date(beo.setupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Event Start</p>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{new Date(beo.eventStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Event End</p>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{new Date(beo.eventEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Breakdown</p>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{new Date(beo.breakdownTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Summary</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-[9px] text-purple-700 dark:text-purple-400 rounded">
                  {beo.menuItems.length} menu items
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-[9px] text-blue-700 dark:text-blue-400 rounded">
                  {beo.beverageItems.length} beverage items
                </span>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-[9px] text-amber-700 dark:text-amber-400 rounded">
                  {beo.equipment.length} equipment
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-[9px] text-emerald-700 dark:text-emerald-400 rounded">
                  {beo.staffing.length} staff roles
                </span>
              </div>
            </div>

            {beo.distributedAt && (
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Distributed: {new Date(beo.distributedAt).toLocaleString()}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(beo)}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 transition flex items-center justify-center gap-1"
              >
                <Edit size={12} />
                Edit
              </button>
              {beo.status === 'Draft' && (
                <button
                  onClick={() => updateBEOStatus(beo.beoId, 'Review')}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-xl text-[10px] font-bold text-blue-700 dark:text-blue-400 transition"
                >
                  Submit for Review
                </button>
              )}
              {beo.status === 'Review' && (
                <button
                  onClick={() => updateBEOStatus(beo.beoId, 'Approved')}
                  className="flex-1 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/20 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-400 transition"
                >
                  Approve
                </button>
              )}
              {beo.status === 'Approved' && (
                <button
                  onClick={() => updateBEOStatus(beo.beoId, 'Distributed')}
                  className="flex-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 rounded-xl text-[10px] font-bold text-purple-700 dark:text-purple-400 transition"
                >
                  Distribute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeddingManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedWedding, setSelectedWedding] = useState<Event | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [weddingDetails, setWeddingDetails] = useState({
    eventId: '',
    brideName: '',
    groomName: '',
    ceremonyLocation: '',
    receptionLocation: '',
    guestCount: '',
    budget: '',
    theme: '',
    colorScheme: '',
    specialRequests: ''
  });

  const weddingEvents = events.filter((e: Event) => e.eventType === 'Wedding');

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/wedding-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...weddingDetails, guestCount: parseInt(weddingDetails.guestCount), budget: parseFloat(weddingDetails.budget) })
      });
      if (response.ok) {
        addNotification('Wedding details saved successfully', 'success');
        setShowDetailsForm(false);
        setWeddingDetails({ eventId: '', brideName: '', groomName: '', ceremonyLocation: '', receptionLocation: '', guestCount: '', budget: '', theme: '', colorScheme: '', specialRequests: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to save wedding details', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wedding Management</h3>
        <button
          onClick={() => setShowDetailsForm(!showDetailsForm)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Heart size={14} />
          {showDetailsForm ? 'Cancel' : 'Add Wedding Details'}
        </button>
      </div>

      {showDetailsForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={weddingDetails.eventId}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Wedding Event</option>
                  {weddingEvents.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Bride Name</label>
                <input
                  type="text"
                  value={weddingDetails.brideName}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, brideName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Groom Name</label>
                <input
                  type="text"
                  value={weddingDetails.groomName}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, groomName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Ceremony Location</label>
                <input
                  type="text"
                  value={weddingDetails.ceremonyLocation}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, ceremonyLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Reception Location</label>
                <input
                  type="text"
                  value={weddingDetails.receptionLocation}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, receptionLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Guest Count</label>
                <input
                  type="number"
                  value={weddingDetails.guestCount}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, guestCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Budget</label>
                <input
                  type="number"
                  value={weddingDetails.budget}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, budget: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                <input
                  type="text"
                  value={weddingDetails.theme}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, theme: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Color Scheme</label>
                <input
                  type="text"
                  value={weddingDetails.colorScheme}
                  onChange={(e) => setWeddingDetails({ ...weddingDetails, colorScheme: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
              <textarea
                value={weddingDetails.specialRequests}
                onChange={(e) => setWeddingDetails({ ...weddingDetails, specialRequests: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition"
            >
              Save Wedding Details
            </button>
          </form>
        </div>
      )}

      {/* Wedding Events List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Upcoming Weddings</h4>
        {weddingEvents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No wedding events scheduled</p>
        ) : (
          <div className="space-y-3">
            {weddingEvents.map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{event.startDate} • {event.venueIds?.join(', ') || 'TBD'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-700">
                    <p className="text-lg font-bold text-pink-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guests</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-700">
                    <p className="text-lg font-bold text-rose-600">{Math.round((event.estimatedRevenue || 0) / 1000)}k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-700">
                    <p className="text-lg font-bold text-purple-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wedding Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Wedding Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm ceremony and reception venues',
            'Finalize guest list and send invitations',
            'Arrange catering and menu selection',
            'Book photographer and videographer',
            'Arrange floral arrangements and decorations',
            'Coordinate music and entertainment',
            'Arrange transportation for bridal party',
            'Confirm accommodation for guests',
            'Finalize wedding cake selection',
            'Rehearsal dinner arrangements',
            'Marriage license and legal requirements',
            'Wedding party attire coordination'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-pink-300 text-pink-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConferenceManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedConference, setSelectedConference] = useState<Event | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    eventId: '',
    sessionTitle: '',
    speaker: '',
    startTime: '',
    endTime: '',
    room: '',
    capacity: '',
    equipment: ''
  });

  const conferenceEvents = events.filter((e: Event) => e.eventType === 'Conference');

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/conference-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...sessionForm, capacity: parseInt(sessionForm.capacity) })
      });
      if (response.ok) {
        addNotification('Conference session added successfully', 'success');
        setShowSessionForm(false);
        setSessionForm({ eventId: '', sessionTitle: '', speaker: '', startTime: '', endTime: '', room: '', capacity: '', equipment: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add conference session', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conference Management</h3>
        <button
          onClick={() => setShowSessionForm(!showSessionForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Users size={14} />
          {showSessionForm ? 'Cancel' : 'Add Session'}
        </button>
      </div>

      {showSessionForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleSessionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Conference</label>
                <select
                  value={sessionForm.eventId}
                  onChange={(e) => setSessionForm({ ...sessionForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Conference</option>
                  {conferenceEvents.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Session Title</label>
                <input
                  type="text"
                  value={sessionForm.sessionTitle}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Speaker</label>
                <input
                  type="text"
                  value={sessionForm.speaker}
                  onChange={(e) => setSessionForm({ ...sessionForm, speaker: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Room</label>
                <input
                  type="text"
                  value={sessionForm.room}
                  onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={sessionForm.capacity}
                  onChange={(e) => setSessionForm({ ...sessionForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipment Needed</label>
              <textarea
                value={sessionForm.equipment}
                onChange={(e) => setSessionForm({ ...sessionForm, equipment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Session
            </button>
          </form>
        </div>
      )}

      {/* Conference Events List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Upcoming Conferences</h4>
        {conferenceEvents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No conference events scheduled</p>
        ) : (
          <div className="space-y-3">
            {conferenceEvents.map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{event.startDate} - {event.endDate} • {event.venueIds?.join(', ') || 'TBD'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700">
                    <p className="text-lg font-bold text-blue-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attendees</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700">
                    <p className="text-lg font-bold text-indigo-600">{Math.round((event.estimatedRevenue || 0) / 1000)}k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700">
                    <p className="text-lg font-bold text-cyan-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conference Planning Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Conference Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm conference rooms and breakout spaces',
            'Arrange audiovisual equipment and tech support',
            'Coordinate catering for coffee breaks and meals',
            'Setup registration desk and name badges',
            'Arrange speaker accommodations and transportation',
            'Prepare conference materials and handouts',
            'Setup Wi-Fi and internet access',
            'Coordinate security and access control',
            'Arrange parking and transportation for attendees',
            'Setup signage and wayfinding',
            'Confirm emergency procedures',
            'Prepare attendee evaluation forms'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-blue-300 text-blue-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MeetingManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Event | null>(null);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [agendaForm, setAgendaForm] = useState({
    eventId: '',
    agendaItem: '',
    duration: '',
    presenter: '',
    timeSlot: ''
  });

  const meetingEvents = events.filter((e: Event) => e.eventType === 'Meeting');

  const handleAgendaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/meeting-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...agendaForm, duration: parseInt(agendaForm.duration) })
      });
      if (response.ok) {
        addNotification('Agenda item added successfully', 'success');
        setShowAgendaForm(false);
        setAgendaForm({ eventId: '', agendaItem: '', duration: '', presenter: '', timeSlot: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add agenda item', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Meeting Management</h3>
        <button
          onClick={() => setShowAgendaForm(!showAgendaForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <ClipboardList size={14} />
          {showAgendaForm ? 'Cancel' : 'Add Agenda Item'}
        </button>
      </div>

      {showAgendaForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleAgendaSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Meeting</label>
                <select
                  value={agendaForm.eventId}
                  onChange={(e) => setAgendaForm({ ...agendaForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Meeting</option>
                  {meetingEvents.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Agenda Item</label>
                <input
                  type="text"
                  value={agendaForm.agendaItem}
                  onChange={(e) => setAgendaForm({ ...agendaForm, agendaItem: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={agendaForm.duration}
                  onChange={(e) => setAgendaForm({ ...agendaForm, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Presenter</label>
                <input
                  type="text"
                  value={agendaForm.presenter}
                  onChange={(e) => setAgendaForm({ ...agendaForm, presenter: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Time Slot</label>
                <input
                  type="time"
                  value={agendaForm.timeSlot}
                  onChange={(e) => setAgendaForm({ ...agendaForm, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Agenda Item
            </button>
          </form>
        </div>
      )}

      {/* Meeting Events List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Scheduled Meetings</h4>
        {meetingEvents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No meeting events scheduled</p>
        ) : (
          <div className="space-y-3">
            {meetingEvents.map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{event.startDate} • {event.venueIds?.join(', ') || 'TBD'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700">
                    <p className="text-lg font-bold text-emerald-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attendees</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700">
                    <p className="text-lg font-bold text-teal-600">{Math.round((event.estimatedRevenue || 0) / 1000)}k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700">
                    <p className="text-lg font-bold text-green-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Preparation Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Meeting Preparation Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm meeting room booking',
            'Arrange seating configuration',
            'Setup audiovisual equipment',
            'Prepare meeting materials and handouts',
            'Arrange refreshments and catering',
            'Setup projector and presentation equipment',
            'Test Wi-Fi and internet connectivity',
            'Prepare name badges or tent cards',
            'Arrange parking for attendees',
            'Confirm temperature and lighting',
            'Setup registration desk if needed',
            'Prepare minutes template'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-emerald-300 text-emerald-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SocialEventsView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [socialDetails, setSocialDetails] = useState({
    eventId: '',
    eventType: '',
    honoreeName: '',
    age: '',
    theme: '',
    specialRequirements: '',
    dietaryRestrictions: ''
  });

  const socialEventTypes = ['Birthday', 'Anniversary', 'Graduation', 'ReligiousEvent'];
  const socialEvents = events.filter((e: Event) => socialEventTypes.includes(e.eventType));

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/social-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...socialDetails, age: parseInt(socialDetails.age) })
      });
      if (response.ok) {
        addNotification('Social event details saved successfully', 'success');
        setShowDetailsForm(false);
        setSocialDetails({ eventId: '', eventType: '', honoreeName: '', age: '', theme: '', specialRequirements: '', dietaryRestrictions: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to save social event details', 'warning');
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Birthday': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Anniversary': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      'Graduation': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'ReligiousEvent': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    };
    return colors[type] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social Events</h3>
        <button
          onClick={() => setShowDetailsForm(!showDetailsForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <PartyPopper size={14} />
          {showDetailsForm ? 'Cancel' : 'Add Event Details'}
        </button>
      </div>

      {showDetailsForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={socialDetails.eventId}
                  onChange={(e) => setSocialDetails({ ...socialDetails, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {socialEvents.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event Type</label>
                <select
                  value={socialDetails.eventType}
                  onChange={(e) => setSocialDetails({ ...socialDetails, eventType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Graduation">Graduation</option>
                  <option value="ReligiousEvent">Religious Event</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Honoree Name</label>
                <input
                  type="text"
                  value={socialDetails.honoreeName}
                  onChange={(e) => setSocialDetails({ ...socialDetails, honoreeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Age/Years</label>
                <input
                  type="number"
                  value={socialDetails.age}
                  onChange={(e) => setSocialDetails({ ...socialDetails, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                <input
                  type="text"
                  value={socialDetails.theme}
                  onChange={(e) => setSocialDetails({ ...socialDetails, theme: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requirements</label>
              <textarea
                value={socialDetails.specialRequirements}
                onChange={(e) => setSocialDetails({ ...socialDetails, specialRequirements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary Restrictions</label>
              <textarea
                value={socialDetails.dietaryRestrictions}
                onChange={(e) => setSocialDetails({ ...socialDetails, dietaryRestrictions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
            >
              Save Event Details
            </button>
          </form>
        </div>
      )}

      {/* Social Events List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Upcoming Social Events</h4>
        {socialEvents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No social events scheduled</p>
        ) : (
          <div className="space-y-3">
            {socialEvents.map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-purple-600" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{event.startDate} • {event.venueIds?.join(', ') || 'TBD'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700">
                    <p className="text-lg font-bold text-purple-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guests</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700">
                    <p className="text-lg font-bold text-pink-600">{Math.round((event.estimatedRevenue || 0) / 1000)}k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700">
                    <p className="text-lg font-bold text-violet-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Event Planning Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Social Event Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm venue and decorations',
            'Arrange catering and menu selection',
            'Order cake or special desserts',
            'Arrange entertainment or music',
            'Setup photo area or backdrop',
            'Prepare guest book or memory items',
            'Arrange party favors or gifts',
            'Coordinate with photographer',
            'Setup lighting and ambiance',
            'Prepare seating arrangements',
            'Confirm special dietary requirements',
            'Plan for cleanup and breakdown'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-purple-300 text-purple-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GroupAccommodationView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [roomBlockForm, setRoomBlockForm] = useState({
    eventId: '',
    roomType: '',
    roomCount: '',
    checkInDate: '',
    checkOutDate: '',
    ratePerRoom: '',
    specialRequests: ''
  });

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/room-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...roomBlockForm, roomCount: parseInt(roomBlockForm.roomCount), ratePerRoom: parseFloat(roomBlockForm.ratePerRoom) })
      });
      if (response.ok) {
        addNotification('Room block created successfully', 'success');
        setShowBlockForm(false);
        setRoomBlockForm({ eventId: '', roomType: '', roomCount: '', checkInDate: '', checkOutDate: '', ratePerRoom: '', specialRequests: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to create room block', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Group Accommodation</h3>
        <button
          onClick={() => setShowBlockForm(!showBlockForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Bed size={14} />
          {showBlockForm ? 'Cancel' : 'Create Room Block'}
        </button>
      </div>

      {showBlockForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleBlockSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={roomBlockForm.eventId}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Room Type</label>
                <select
                  value={roomBlockForm.roomType}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, roomType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="Standard">Standard Room</option>
                  <option value="Deluxe">Deluxe Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Executive">Executive Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Number of Rooms</label>
                <input
                  type="number"
                  value={roomBlockForm.roomCount}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, roomCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Rate Per Room</label>
                <input
                  type="number"
                  value={roomBlockForm.ratePerRoom}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, ratePerRoom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={roomBlockForm.checkInDate}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, checkInDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={roomBlockForm.checkOutDate}
                  onChange={(e) => setRoomBlockForm({ ...roomBlockForm, checkOutDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
              <textarea
                value={roomBlockForm.specialRequests}
                onChange={(e) => setRoomBlockForm({ ...roomBlockForm, specialRequests: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
            >
              Create Room Block
            </button>
          </form>
        </div>
      )}

      {/* Events with Room Blocks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Events Requiring Accommodation</h4>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No events requiring accommodation</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event: Event) => (
              <div
                key={event.eventId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-indigo-600" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</h5>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{event.startDate} - {event.endDate}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700">
                    <p className="text-lg font-bold text-indigo-600">{event.expectedAttendance || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attendees</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700">
                    <p className="text-lg font-bold text-violet-600">{Math.ceil((event.expectedAttendance || 0) / 2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Est. Rooms</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700">
                    <p className="text-lg font-bold text-purple-600">{Math.floor((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accommodation Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Accommodation Coordination Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm room block requirements with event organizer',
            'Check room availability for event dates',
            'Negotiate group rates and terms',
            'Create room block reservations',
            'Setup special room requests for VIPs',
            'Coordinate early check-in/late check-out',
            'Arrange room key distribution',
            'Prepare welcome packets for guests',
            'Coordinate housekeeping schedules',
            'Setup group billing arrangements',
            'Confirm room block release dates',
            'Prepare guest room lists'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-indigo-300 text-indigo-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MenuPlanningView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuForm, setMenuForm] = useState({
    eventId: '',
    menuType: '',
    courseType: '',
    dishName: '',
    dietary: '',
    quantity: '',
    specialNotes: ''
  });

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...menuForm, quantity: parseInt(menuForm.quantity) })
      });
      if (response.ok) {
        addNotification('Menu item added successfully', 'success');
        setShowMenuForm(false);
        setMenuForm({ eventId: '', menuType: '', courseType: '', dishName: '', dietary: '', quantity: '', specialNotes: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add menu item', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Menu Planning</h3>
        <button
          onClick={() => setShowMenuForm(!showMenuForm)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Utensils size={14} />
          {showMenuForm ? 'Cancel' : 'Add Menu Item'}
        </button>
      </div>

      {showMenuForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={menuForm.eventId}
                  onChange={(e) => setMenuForm({ ...menuForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Menu Type</label>
                <select
                  value={menuForm.menuType}
                  onChange={(e) => setMenuForm({ ...menuForm, menuType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Buffet">Buffet</option>
                  <option value="Plated">Plated Service</option>
                  <option value="Cocktail">Cocktail Reception</option>
                  <option value="Tea">High Tea</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Course Type</label>
                <select
                  value={menuForm.courseType}
                  onChange={(e) => setMenuForm({ ...menuForm, courseType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Course</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Soup">Soup</option>
                  <option value="Salad">Salad</option>
                  <option value="Main">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dish Name</label>
                <input
                  type="text"
                  value={menuForm.dishName}
                  onChange={(e) => setMenuForm({ ...menuForm, dishName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary</label>
                <select
                  value={menuForm.dietary}
                  onChange={(e) => setMenuForm({ ...menuForm, dietary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Dietary</option>
                  <option value="Regular">Regular</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="GlutenFree">Gluten-Free</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={menuForm.quantity}
                  onChange={(e) => setMenuForm({ ...menuForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Notes</label>
              <textarea
                value={menuForm.specialNotes}
                onChange={(e) => setMenuForm({ ...menuForm, specialNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Menu Item
            </button>
          </form>
        </div>
      )}

      {/* Menu Categories */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Appetizers', icon: '🥗', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Main Courses', icon: '🍖', color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' },
          { name: 'Desserts', icon: '🍰', color: 'from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20' },
          { name: 'Beverages', icon: '🍷', color: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' }
        ].map((category) => (
          <div key={category.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${category.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{category.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{category.name}</h5>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click to manage {category.name.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Menu Planning Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Menu Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm menu preferences with client',
            'Review dietary restrictions and allergies',
            'Finalize menu selections and quantities',
            'Coordinate with kitchen on preparation',
            'Arrange plating and presentation',
            'Confirm serving staff requirements',
            'Setup buffet stations or service areas',
            'Coordinate timing of courses',
            'Arrange special dietary meals',
            'Confirm beverage service',
            'Setup tasting session if required',
            'Finalize menu costs and pricing'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-orange-300 text-orange-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BeveragePlanningView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showBeverageForm, setShowBeverageForm] = useState(false);
  const [beverageForm, setBeverageForm] = useState({
    eventId: '',
    beverageType: '',
    category: '',
    name: '',
    quantity: '',
    serviceType: '',
    specialNotes: ''
  });

  const handleBeverageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/beverages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...beverageForm, quantity: parseInt(beverageForm.quantity) })
      });
      if (response.ok) {
        addNotification('Beverage added successfully', 'success');
        setShowBeverageForm(false);
        setBeverageForm({ eventId: '', beverageType: '', category: '', name: '', quantity: '', serviceType: '', specialNotes: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add beverage', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Beverage Planning</h3>
        <button
          onClick={() => setShowBeverageForm(!showBeverageForm)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Wine size={14} />
          {showBeverageForm ? 'Cancel' : 'Add Beverage'}
        </button>
      </div>

      {showBeverageForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleBeverageSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={beverageForm.eventId}
                  onChange={(e) => setBeverageForm({ ...beverageForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Beverage Type</label>
                <select
                  value={beverageForm.beverageType}
                  onChange={(e) => setBeverageForm({ ...beverageForm, beverageType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Alcoholic">Alcoholic</option>
                  <option value="NonAlcoholic">Non-Alcoholic</option>
                  <option value="Mixed">Mixed Drinks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select
                  value={beverageForm.category}
                  onChange={(e) => setBeverageForm({ ...beverageForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Wine">Wine</option>
                  <option value="Beer">Beer</option>
                  <option value="Spirits">Spirits</option>
                  <option value="Cocktails">Cocktails</option>
                  <option value="SoftDrinks">Soft Drinks</option>
                  <option value="Juice">Juice</option>
                  <option value="Water">Water</option>
                  <option value="Coffee">Coffee/Tea</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={beverageForm.name}
                  onChange={(e) => setBeverageForm({ ...beverageForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={beverageForm.quantity}
                  onChange={(e) => setBeverageForm({ ...beverageForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Service Type</label>
                <select
                  value={beverageForm.serviceType}
                  onChange={(e) => setBeverageForm({ ...beverageForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Service</option>
                  <option value="Bar">Full Bar Service</option>
                  <option value="Package">Package Service</option>
                  <option value="SelfServe">Self-Serve</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Notes</label>
              <textarea
                value={beverageForm.specialNotes}
                onChange={(e) => setBeverageForm({ ...beverageForm, specialNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Beverage
            </button>
          </form>
        </div>
      )}

      {/* Beverage Categories */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Wines', icon: '🍷', color: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20' },
          { name: 'Beers', icon: '🍺', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'Cocktails', icon: '🍸', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
          { name: 'Non-Alcoholic', icon: '🥤', color: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20' }
        ].map((category) => (
          <div key={category.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${category.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{category.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{category.name}</h5>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click to manage {category.name.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Beverage Planning Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Beverage Planning Checklist</h4>
        <div className="space-y-2">
          {[
            'Confirm beverage preferences with client',
            'Determine bar service type (full bar vs package)',
            'Select wine and beer selections',
            'Arrange signature cocktails if desired',
            'Coordinate non-alcoholic options',
            'Confirm bar staffing requirements',
            'Arrange glassware and bar equipment',
            'Setup bar stations and service areas',
            'Coordinate ice and garnish supplies',
            'Arrange responsible alcohol service training',
            'Confirm beverage costs and pricing',
            'Setup beverage service timeline'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResourceManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    eventId: '',
    resourceType: '',
    resourceName: '',
    quantity: '',
    allocatedTo: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...resourceForm, quantity: parseInt(resourceForm.quantity) })
      });
      if (response.ok) {
        addNotification('Resource allocated successfully', 'success');
        setShowResourceForm(false);
        setResourceForm({ eventId: '', resourceType: '', resourceName: '', quantity: '', allocatedTo: '', startDate: '', endDate: '', notes: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to allocate resource', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resource Management</h3>
        <button
          onClick={() => setShowResourceForm(!showResourceForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Package size={14} />
          {showResourceForm ? 'Cancel' : 'Allocate Resource'}
        </button>
      </div>

      {showResourceForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleResourceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={resourceForm.eventId}
                  onChange={(e) => setResourceForm({ ...resourceForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Resource Type</label>
                <select
                  value={resourceForm.resourceType}
                  onChange={(e) => setResourceForm({ ...resourceForm, resourceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Linens">Linens</option>
                  <option value="Decorations">Decorations</option>
                  <option value="Staff">Staff</option>
                  <option value="Vehicles">Vehicles</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Resource Name</label>
                <input
                  type="text"
                  value={resourceForm.resourceName}
                  onChange={(e) => setResourceForm({ ...resourceForm, resourceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={resourceForm.quantity}
                  onChange={(e) => setResourceForm({ ...resourceForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Allocated To</label>
                <input
                  type="text"
                  value={resourceForm.allocatedTo}
                  onChange={(e) => setResourceForm({ ...resourceForm, allocatedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={resourceForm.startDate}
                  onChange={(e) => setResourceForm({ ...resourceForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={resourceForm.endDate}
                  onChange={(e) => setResourceForm({ ...resourceForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={resourceForm.notes}
                onChange={(e) => setResourceForm({ ...resourceForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
            >
              Allocate Resource
            </button>
          </form>
        </div>
      )}

      {/* Resource Categories */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'Equipment', icon: '🎤', count: 12, color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
          { name: 'Furniture', icon: '🪑', count: 45, color: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' },
          { name: 'Linens', icon: '🛏️', count: 80, color: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
          { name: 'Decorations', icon: '🎨', count: 25, color: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20' },
          { name: 'Staff', icon: '👥', count: 30, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Vehicles', icon: '🚗', count: 8, color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' }
        ].map((category) => (
          <div key={category.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${category.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{category.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{category.name}</h5>
            </div>
            <p className="text-lg font-bold text-teal-600">{category.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
          </div>
        ))}
      </div>

      {/* Resource Management Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Resource Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Review resource requirements for each event',
            'Check resource availability and conflicts',
            'Allocate resources to events based on priority',
            'Track resource usage and returns',
            'Schedule equipment maintenance',
            'Coordinate linen cleaning and replacement',
            'Manage furniture inventory',
            'Track staff assignments and schedules',
            'Monitor vehicle availability and maintenance',
            'Update resource inventory regularly',
            'Report damaged or missing resources',
            'Plan for backup resources'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-teal-300 text-teal-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TaskManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    eventId: '',
    taskName: '',
    assignedTo: '',
    priority: '',
    dueDate: '',
    status: 'Pending',
    description: ''
  });

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(taskForm)
      });
      if (response.ok) {
        addNotification('Task created successfully', 'success');
        setShowTaskForm(false);
        setTaskForm({ eventId: '', taskName: '', assignedTo: '', priority: '', dueDate: '', status: 'Pending', description: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to create task', 'warning');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'Low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Management</h3>
        <button
          onClick={() => setShowTaskForm(!showTaskForm)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <CheckSquare size={14} />
          {showTaskForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showTaskForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={taskForm.eventId}
                  onChange={(e) => setTaskForm({ ...taskForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Task Name</label>
                <input
                  type="text"
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
            >
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Task Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Tasks', count: 24, color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' },
          { name: 'Pending', count: 8, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'In Progress', count: 10, color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
          { name: 'Completed', count: 6, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-sky-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Sample Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Tasks</h4>
        <div className="space-y-3">
          {[
            { task: 'Confirm venue setup', assigned: 'John D.', priority: 'High', due: '2024-01-15', status: 'Pending' },
            { task: 'Arrange catering tasting', assigned: 'Sarah M.', priority: 'Medium', due: '2024-01-16', status: 'InProgress' },
            { task: 'Send invitations', assigned: 'Mike R.', priority: 'High', due: '2024-01-14', status: 'Completed' }
          ].map((task, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{task.task}</h5>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Assigned: {task.assigned}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Due: {task.due}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Management Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Task Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Create task list for each event',
            'Assign tasks to appropriate staff',
            'Set priorities and deadlines',
            'Track task progress regularly',
            'Follow up on overdue tasks',
            'Update task status as work progresses',
            'Notify assignees of new tasks',
            'Review completed tasks for quality',
            'Archive completed tasks',
            'Generate task reports',
            'Identify bottlenecks and delays',
            'Adjust task assignments as needed'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-300 text-sky-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DepartmentCoordinationView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showCoordForm, setShowCoordForm] = useState(false);
  const [coordForm, setCoordForm] = useState({
    eventId: '',
    department: '',
    contactPerson: '',
    requirements: '',
    deadline: '',
    status: 'Pending'
  });

  const handleCoordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/department-coordination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(coordForm)
      });
      if (response.ok) {
        addNotification('Department coordination request sent', 'success');
        setShowCoordForm(false);
        setCoordForm({ eventId: '', department: '', contactPerson: '', requirements: '', deadline: '', status: 'Pending' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to send coordination request', 'warning');
    }
  };

  const departments = [
    { name: 'Front Office', icon: '🏨', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'Housekeeping', icon: '🧹', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Kitchen', icon: '👨‍🍳', color: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
    { name: 'Maintenance', icon: '🔧', color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' },
    { name: 'Security', icon: '🛡️', color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' },
    { name: 'IT Support', icon: '💻', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Coordination</h3>
        <button
          onClick={() => setShowCoordForm(!showCoordForm)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Users size={14} />
          {showCoordForm ? 'Cancel' : 'Request Coordination'}
        </button>
      </div>

      {showCoordForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleCoordSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={coordForm.eventId}
                  onChange={(e) => setCoordForm({ ...coordForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                <select
                  value={coordForm.department}
                  onChange={(e) => setCoordForm({ ...coordForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={coordForm.contactPerson}
                  onChange={(e) => setCoordForm({ ...coordForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Deadline</label>
                <input
                  type="date"
                  value={coordForm.deadline}
                  onChange={(e) => setCoordForm({ ...coordForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Requirements</label>
              <textarea
                value={coordForm.requirements}
                onChange={(e) => setCoordForm({ ...coordForm, requirements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"
            >
              Send Coordination Request
            </button>
          </form>
        </div>
      )}

      {/* Department Status */}
      <div className="grid grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${dept.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{dept.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{dept.name}</h5>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Coordination Requests */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Coordination Requests</h4>
        <div className="space-y-3">
          {[
            { dept: 'Kitchen', event: 'Wedding Reception', contact: 'Chef Maria', deadline: '2024-01-15', status: 'Pending' },
            { dept: 'Housekeeping', event: 'Conference Setup', contact: 'Supervisor John', deadline: '2024-01-14', status: 'InProgress' },
            { dept: 'Front Office', event: 'Corporate Meeting', contact: 'Manager Sarah', deadline: '2024-01-13', status: 'Completed' }
          ].map((req, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{req.dept}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Event: {req.event}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Contact: {req.contact}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Due: {req.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coordination Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Department Coordination Checklist</h4>
        <div className="space-y-2">
          {[
            'Identify all departments involved in event',
            'Send coordination requests early',
            'Schedule coordination meetings',
            'Document department requirements',
            'Follow up on pending requests',
            'Track department response times',
            'Escalate unresolved issues',
            'Confirm department commitments',
            'Maintain communication logs',
            'Review coordination outcomes',
            'Update department contact information',
            'Plan for backup resources'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-violet-300 text-violet-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventTimelineView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    eventId: '',
    milestoneName: '',
    scheduledTime: '',
    description: '',
    responsible: '',
    status: 'Pending'
  });

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/timeline-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(milestoneForm)
      });
      if (response.ok) {
        addNotification('Milestone added successfully', 'success');
        setShowMilestoneForm(false);
        setMilestoneForm({ eventId: '', milestoneName: '', scheduledTime: '', description: '', responsible: '', status: 'Pending' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add milestone', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Event Timeline</h3>
        <button
          onClick={() => setShowMilestoneForm(!showMilestoneForm)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Clock size={14} />
          {showMilestoneForm ? 'Cancel' : 'Add Milestone'}
        </button>
      </div>

      {showMilestoneForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleMilestoneSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={milestoneForm.eventId}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Milestone Name</label>
                <input
                  type="text"
                  value={milestoneForm.milestoneName}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, milestoneName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={milestoneForm.scheduledTime}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Responsible</label>
                <input
                  type="text"
                  value={milestoneForm.responsible}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, responsible: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Milestone
            </button>
          </form>
        </div>
      )}

      {/* Timeline View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Event Timeline - Wedding Reception</h4>
        <div className="space-y-4">
          {[
            { time: '08:00', milestone: 'Venue Setup', status: 'Completed', responsible: 'Setup Team' },
            { time: '10:00', milestone: 'Catering Arrives', status: 'Completed', responsible: 'Kitchen' },
            { time: '12:00', milestone: 'Decorations Complete', status: 'InProgress', responsible: 'Decor Team' },
            { time: '14:00', milestone: 'Sound Check', status: 'Pending', responsible: 'AV Team' },
            { time: '16:00', milestone: 'Guest Arrival', status: 'Pending', responsible: 'Front Office' },
            { time: '18:00', milestone: 'Ceremony Begins', status: 'Pending', responsible: 'Coordinator' }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : item.status === 'InProgress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                {index < 5 && <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700"></div>}
              </div>
              <div className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.milestone}</h5>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.responsible}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Timeline Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Create detailed event timeline',
            'Set realistic milestone deadlines',
            'Assign responsible parties for each milestone',
            'Share timeline with all stakeholders',
            'Track milestone completion in real-time',
            'Adjust timeline for delays or changes',
            'Communicate timeline updates promptly',
            'Monitor critical path items',
            'Prepare contingency plans',
            'Document timeline deviations',
            'Review timeline post-event',
            'Update timeline templates for future events'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-rose-300 text-rose-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GuestManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, setGuestForm] = useState({
    eventId: '',
    guestName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    specialRequirements: '',
    rsvpStatus: 'Pending'
  });

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(guestForm)
      });
      if (response.ok) {
        addNotification('Guest added successfully', 'success');
        setShowGuestForm(false);
        setGuestForm({ eventId: '', guestName: '', email: '', phone: '', dietaryRestrictions: '', specialRequirements: '', rsvpStatus: 'Pending' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add guest', 'warning');
    }
  };

  const getRSVPColor = (status: string) => {
    const colors: Record<string, string> = {
      'Confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'Declined': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Guest & Attendee Management</h3>
        <button
          onClick={() => setShowGuestForm(!showGuestForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <UserPlus size={14} />
          {showGuestForm ? 'Cancel' : 'Add Guest'}
        </button>
      </div>

      {showGuestForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={guestForm.eventId}
                  onChange={(e) => setGuestForm({ ...guestForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Guest Name</label>
                <input
                  type="text"
                  value={guestForm.guestName}
                  onChange={(e) => setGuestForm({ ...guestForm, guestName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">RSVP Status</label>
                <select
                  value={guestForm.rsvpStatus}
                  onChange={(e) => setGuestForm({ ...guestForm, rsvpStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary Restrictions</label>
              <textarea
                value={guestForm.dietaryRestrictions}
                onChange={(e) => setGuestForm({ ...guestForm, dietaryRestrictions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requirements</label>
              <textarea
                value={guestForm.specialRequirements}
                onChange={(e) => setGuestForm({ ...guestForm, specialRequirements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Guest
            </button>
          </form>
        </div>
      )}

      {/* Guest Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Guests', count: 150, color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' },
          { name: 'Confirmed', count: 98, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Pending', count: 42, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'Declined', count: 10, color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-emerald-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Guest List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Guests</h4>
        <div className="space-y-3">
          {[
            { name: 'John Smith', email: 'john@email.com', rsvp: 'Confirmed', dietary: 'Vegetarian' },
            { name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'Confirmed', dietary: 'None' },
            { name: 'Mike Davis', email: 'mike@email.com', rsvp: 'Pending', dietary: 'Gluten-Free' }
          ].map((guest, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{guest.name}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getRSVPColor(guest.rsvp)}`}>
                  {guest.rsvp}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{guest.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dietary: {guest.dietary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Management Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Guest Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Create guest list for each event',
            'Send invitations to all guests',
            'Track RSVP responses',
            'Collect dietary restrictions',
            'Record special requirements',
            'Send reminder notifications',
            'Update guest counts regularly',
            'Prepare name badges or seating cards',
            'Coordinate with catering for dietary needs',
            'Handle special guest accommodations',
            'Send thank you notes post-event',
            'Maintain guest database for future events'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-emerald-300 text-emerald-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RegistrationManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    eventId: '',
    attendeeName: '',
    email: '',
    phone: '',
    organization: '',
    registrationType: 'Standard',
    paymentStatus: 'Unpaid'
  });

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(registrationForm)
      });
      if (response.ok) {
        addNotification('Registration added successfully', 'success');
        setShowRegistrationForm(false);
        setRegistrationForm({ eventId: '', attendeeName: '', email: '', phone: '', organization: '', registrationType: 'Standard', paymentStatus: 'Unpaid' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add registration', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registration Management</h3>
        <button
          onClick={() => setShowRegistrationForm(!showRegistrationForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <ClipboardList size={14} />
          {showRegistrationForm ? 'Cancel' : 'Add Registration'}
        </button>
      </div>

      {showRegistrationForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleRegistrationSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={registrationForm.eventId}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Attendee Name</label>
                <input
                  type="text"
                  value={registrationForm.attendeeName}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, attendeeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Organization</label>
                <input
                  type="text"
                  value={registrationForm.organization}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Registration Type</label>
                <select
                  value={registrationForm.registrationType}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, registrationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="EarlyBird">Early Bird</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Registration
            </button>
          </form>
        </div>
      )}

      {/* Registration Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Registrations', count: 320, color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' },
          { name: 'Paid', count: 285, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Pending', count: 35, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'VIP', count: 45, color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-teal-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Registrations</h4>
        <div className="space-y-3">
          {[
            { name: 'Alice Johnson', email: 'alice@company.com', type: 'VIP', status: 'Paid' },
            { name: 'Bob Smith', email: 'bob@company.com', type: 'Standard', status: 'Pending' },
            { name: 'Carol Davis', email: 'carol@company.com', type: 'EarlyBird', status: 'Paid' }
          ].map((reg, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-teal-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{reg.name}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(reg.status)}`}>
                  {reg.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{reg.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{reg.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Registration Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Set up registration forms for each event',
            'Configure registration types and pricing',
            'Enable online registration portal',
            'Process registration payments',
            'Send confirmation emails',
            'Track registration status',
            'Manage waitlists',
            'Handle registration cancellations',
            'Generate registration reports',
            'Coordinate with event planning',
            'Prepare attendee badges',
            'Finalize attendee lists'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-teal-300 text-teal-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SeatingManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showSeatingForm, setShowSeatingForm] = useState(false);
  const [seatingForm, setSeatingForm] = useState({
    eventId: '',
    tableName: '',
    tableType: 'Round',
    capacity: '',
    location: '',
    specialRequests: '',
    assignedTo: ''
  });

  const handleSeatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...seatingForm, capacity: parseInt(seatingForm.capacity) })
      });
      if (response.ok) {
        addNotification('Seating arrangement added successfully', 'success');
        setShowSeatingForm(false);
        setSeatingForm({ eventId: '', tableName: '', tableType: 'Round', capacity: '', location: '', specialRequests: '', assignedTo: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add seating arrangement', 'warning');
    }
  };

  const tableTypes = [
    { name: 'Round', icon: '⭕', color: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20' },
    { name: 'Rectangular', icon: '▭', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'U-Shape', icon: '⊔', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Classroom', icon: '▤', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
    { name: 'Theater', icon: '▤', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    { name: 'Cocktail', icon: '🍸', color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seating Management</h3>
        <button
          onClick={() => setShowSeatingForm(!showSeatingForm)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Armchair size={14} />
          {showSeatingForm ? 'Cancel' : 'Add Table'}
        </button>
      </div>

      {showSeatingForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleSeatingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={seatingForm.eventId}
                  onChange={(e) => setSeatingForm({ ...seatingForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Table Name</label>
                <input
                  type="text"
                  value={seatingForm.tableName}
                  onChange={(e) => setSeatingForm({ ...seatingForm, tableName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Table Type</label>
                <select
                  value={seatingForm.tableType}
                  onChange={(e) => setSeatingForm({ ...seatingForm, tableType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  {tableTypes.map((type) => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={seatingForm.capacity}
                  onChange={(e) => setSeatingForm({ ...seatingForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={seatingForm.location}
                  onChange={(e) => setSeatingForm({ ...seatingForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={seatingForm.assignedTo}
                  onChange={(e) => setSeatingForm({ ...seatingForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
              <textarea
                value={seatingForm.specialRequests}
                onChange={(e) => setSeatingForm({ ...seatingForm, specialRequests: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Table
            </button>
          </form>
        </div>
      )}

      {/* Table Types */}
      <div className="grid grid-cols-3 gap-4">
        {tableTypes.map((type) => (
          <div key={type.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${type.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</h5>
            </div>
            <p className="text-lg font-bold text-rose-600">8</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tables</p>
          </div>
        ))}
      </div>

      {/* Seating Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Tables', count: 48, color: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20' },
          { name: 'Total Seats', count: 320, color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
          { name: 'VIP Tables', count: 6, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'Reserved', count: 12, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-rose-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Tables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Tables</h4>
        <div className="space-y-3">
          {[
            { name: 'Table 1', type: 'Round', capacity: 8, location: 'Main Hall', assigned: 'VIP Guests' },
            { name: 'Table 2', type: 'Round', capacity: 10, location: 'Main Hall', assigned: 'Corporate' },
            { name: 'Table 3', type: 'Rectangular', capacity: 12, location: 'Terrace', assigned: 'Family' }
          ].map((table, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-rose-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{table.name}</h5>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  {table.type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{table.location} - {table.capacity} seats</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{table.assigned}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seating Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Seating Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Create seating plan for each event',
            'Assign tables to guest groups',
            'Mark VIP and special tables',
            'Consider accessibility requirements',
            'Coordinate with catering for table service',
            'Prepare seating charts',
            'Print table cards and name tags',
            'Confirm table assignments with guests',
            'Handle special seating requests',
            'Monitor seating capacity',
            'Adjust seating as needed',
            'Finalize seating arrangements before event'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-rose-300 text-rose-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EquipmentManagementView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    eventId: '',
    equipmentName: '',
    equipmentType: '',
    quantity: '',
    specifications: '',
    assignedTo: '',
    status: 'Available'
  });

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...equipmentForm, quantity: parseInt(equipmentForm.quantity) })
      });
      if (response.ok) {
        addNotification('Equipment added successfully', 'success');
        setShowEquipmentForm(false);
        setEquipmentForm({ eventId: '', equipmentName: '', equipmentType: '', quantity: '', specifications: '', assignedTo: '', status: 'Available' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add equipment', 'warning');
    }
  };

  const equipmentTypes = [
    { name: 'Audio Visual', icon: '🎤', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'Lighting', icon: '💡', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
    { name: 'Staging', icon: '🎭', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    { name: 'Furniture', icon: '🪑', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Kitchen', icon: '👨‍🍳', color: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20' },
    { name: 'Decor', icon: '🎨', color: 'from-pink-50 to-fuchsia-50 dark:from-pink-900/20 dark:to-fuchsia-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Equipment Management</h3>
        <button
          onClick={() => setShowEquipmentForm(!showEquipmentForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Settings size={14} />
          {showEquipmentForm ? 'Cancel' : 'Add Equipment'}
        </button>
      </div>

      {showEquipmentForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleEquipmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={equipmentForm.eventId}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipment Name</label>
                <input
                  type="text"
                  value={equipmentForm.equipmentName}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipment Type</label>
                <select
                  value={equipmentForm.equipmentType}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map((type) => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={equipmentForm.quantity}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={equipmentForm.assignedTo}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={equipmentForm.status}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Available">Available</option>
                  <option value="InUse">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Specifications</label>
              <textarea
                value={equipmentForm.specifications}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, specifications: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Equipment
            </button>
          </form>
        </div>
      )}

      {/* Equipment Types */}
      <div className="grid grid-cols-3 gap-4">
        {equipmentTypes.map((type) => (
          <div key={type.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${type.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</h5>
            </div>
            <p className="text-lg font-bold text-indigo-600">12</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Items</p>
          </div>
        ))}
      </div>

      {/* Equipment List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Equipment</h4>
        <div className="space-y-3">
          {[
            { name: 'PA System', type: 'Audio Visual', quantity: 2, status: 'Available', assigned: 'AV Team' },
            { name: 'Projector Screen', type: 'Audio Visual', quantity: 4, status: 'InUse', assigned: 'Conference Hall' },
            { name: 'Stage Lights', type: 'Lighting', quantity: 8, status: 'Maintenance', assigned: 'Tech Dept' }
          ].map((item, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.type} x{item.quantity}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.assigned}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Management Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Equipment Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Catalog all equipment inventory',
            'Track equipment location and status',
            'Schedule regular maintenance',
            'Test equipment before events',
            'Assign equipment to events',
            'Monitor equipment usage',
            'Report damaged equipment',
            'Coordinate repairs and replacements',
            'Update equipment specifications',
            'Maintain equipment calibration records',
            'Plan for backup equipment',
            'Train staff on equipment operation'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-indigo-300 text-indigo-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VendorCoordinationView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    eventId: '',
    vendorName: '',
    vendorType: '',
    contactPerson: '',
    phone: '',
    email: '',
    services: '',
    contractValue: '',
    status: 'Pending'
  });

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...vendorForm, contractValue: parseFloat(vendorForm.contractValue) })
      });
      if (response.ok) {
        addNotification('Vendor added successfully', 'success');
        setShowVendorForm(false);
        setVendorForm({ eventId: '', vendorName: '', vendorType: '', contactPerson: '', phone: '', email: '', services: '', contractValue: '', status: 'Pending' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add vendor', 'warning');
    }
  };

  const vendorTypes = [
    { name: 'Catering', icon: '🍽️', color: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
    { name: 'Florist', icon: '💐', color: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20' },
    { name: 'Photography', icon: '📸', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    { name: 'Entertainment', icon: '🎵', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'Decor', icon: '🎨', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Transportation', icon: '🚗', color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Coordination</h3>
        <button
          onClick={() => setShowVendorForm(!showVendorForm)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Building2 size={14} />
          {showVendorForm ? 'Cancel' : 'Add Vendor'}
        </button>
      </div>

      {showVendorForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleVendorSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={vendorForm.eventId}
                  onChange={(e) => setVendorForm({ ...vendorForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Vendor Name</label>
                <input
                  type="text"
                  value={vendorForm.vendorName}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Vendor Type</label>
                <select
                  value={vendorForm.vendorType}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  {vendorTypes.map((type) => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={vendorForm.contactPerson}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Contract Value</label>
                <input
                  type="number"
                  value={vendorForm.contractValue}
                  onChange={(e) => setVendorForm({ ...vendorForm, contractValue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={vendorForm.status}
                  onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Services</label>
              <textarea
                value={vendorForm.services}
                onChange={(e) => setVendorForm({ ...vendorForm, services: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Vendor
            </button>
          </form>
        </div>
      )}

      {/* Vendor Types */}
      <div className="grid grid-cols-3 gap-4">
        {vendorTypes.map((type) => (
          <div key={type.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${type.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</h5>
            </div>
            <p className="text-lg font-bold text-orange-600">5</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Vendors</p>
          </div>
        ))}
      </div>

      {/* Vendor List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Vendors</h4>
        <div className="space-y-3">
          {[
            { name: 'Gourmet Catering', type: 'Catering', contact: 'Chef John', value: 5000, status: 'Confirmed' },
            { name: 'Bloom Florist', type: 'Florist', contact: 'Sarah Rose', value: 1200, status: 'Pending' },
            { name: 'PhotoPro Studio', type: 'Photography', contact: 'Mike Lens', value: 2500, status: 'Confirmed' }
          ].map((vendor, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{vendor.name}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{vendor.type} - {vendor.contact}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">${vendor.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Coordination Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Vendor Coordination Checklist</h4>
        <div className="space-y-2">
          {[
            'Identify required vendors for each event',
            'Request and review vendor proposals',
            'Negotiate contracts and pricing',
            'Confirm vendor availability',
            'Sign vendor agreements',
            'Communicate event requirements clearly',
            'Track vendor deliverables',
            'Monitor vendor performance',
            'Process vendor payments on time',
            'Maintain vendor relationships',
            'Evaluate vendor quality post-event',
            'Update vendor database regularly'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-orange-300 text-orange-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransportationCoordinationView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [transportForm, setTransportForm] = useState({
    eventId: '',
    guestName: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    vehicleType: 'Sedan',
    passengerCount: '',
    specialRequests: '',
    driverName: '',
    contactNumber: ''
  });

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/transportation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify({ ...transportForm, passengerCount: parseInt(transportForm.passengerCount) })
      });
      if (response.ok) {
        addNotification('Transportation added successfully', 'success');
        setShowTransportForm(false);
        setTransportForm({ eventId: '', guestName: '', pickupLocation: '', dropoffLocation: '', pickupTime: '', vehicleType: 'Sedan', passengerCount: '', specialRequests: '', driverName: '', contactNumber: '' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to add transportation', 'warning');
    }
  };

  const vehicleTypes = [
    { name: 'Sedan', icon: '🚗', capacity: 4, color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'SUV', icon: '🚙', capacity: 6, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Van', icon: '🚐', capacity: 12, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
    { name: 'Bus', icon: '🚌', capacity: 30, color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    { name: 'Luxury', icon: '🏎️', capacity: 3, color: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20' },
    { name: 'Shuttle', icon: '🚕', capacity: 8, color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transportation Coordination</h3>
        <button
          onClick={() => setShowTransportForm(!showTransportForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Car size={14} />
          {showTransportForm ? 'Cancel' : 'Add Transport'}
        </button>
      </div>

      {showTransportForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleTransportSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={transportForm.eventId}
                  onChange={(e) => setTransportForm({ ...transportForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Guest Name</label>
                <input
                  type="text"
                  value={transportForm.guestName}
                  onChange={(e) => setTransportForm({ ...transportForm, guestName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pickup Location</label>
                <input
                  type="text"
                  value={transportForm.pickupLocation}
                  onChange={(e) => setTransportForm({ ...transportForm, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dropoff Location</label>
                <input
                  type="text"
                  value={transportForm.dropoffLocation}
                  onChange={(e) => setTransportForm({ ...transportForm, dropoffLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pickup Time</label>
                <input
                  type="datetime-local"
                  value={transportForm.pickupTime}
                  onChange={(e) => setTransportForm({ ...transportForm, pickupTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Vehicle Type</label>
                <select
                  value={transportForm.vehicleType}
                  onChange={(e) => setTransportForm({ ...transportForm, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Passenger Count</label>
                <input
                  type="number"
                  value={transportForm.passengerCount}
                  onChange={(e) => setTransportForm({ ...transportForm, passengerCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={transportForm.driverName}
                  onChange={(e) => setTransportForm({ ...transportForm, driverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={transportForm.contactNumber}
                  onChange={(e) => setTransportForm({ ...transportForm, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
              <textarea
                value={transportForm.specialRequests}
                onChange={(e) => setTransportForm({ ...transportForm, specialRequests: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
            >
              Add Transport
            </button>
          </form>
        </div>
      )}

      {/* Vehicle Types */}
      <div className="grid grid-cols-3 gap-4">
        {vehicleTypes.map((type) => (
          <div key={type.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${type.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</h5>
            </div>
            <p className="text-lg font-bold text-indigo-600">{type.capacity}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Passengers</p>
          </div>
        ))}
      </div>

      {/* Transportation Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Trips', count: 85, color: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20' },
          { name: 'Scheduled', count: 68, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'In Progress', count: 12, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'Completed', count: 5, color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-indigo-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Transports */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Transports</h4>
        <div className="space-y-3">
          {[
            { guest: 'Alice Johnson', pickup: 'Airport', dropoff: 'Hotel', time: '2025-01-15 14:00', vehicle: 'Sedan', status: 'Scheduled' },
            { guest: 'Bob Smith', pickup: 'Hotel', dropoff: 'Conference Center', time: '2025-01-15 09:00', vehicle: 'Van', status: 'In Progress' },
            { guest: 'Carol Davis', pickup: 'Hotel', dropoff: 'Airport', time: '2025-01-15 18:00', vehicle: 'Luxury', status: 'Completed' }
          ].map((transport, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{transport.guest}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(transport.status)}`}>
                  {transport.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{transport.pickup} → {transport.dropoff}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{transport.vehicle} • {transport.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transportation Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Transportation Coordination Checklist</h4>
        <div className="space-y-2">
          {[
            'Collect guest arrival and departure information',
            'Coordinate with transportation providers',
            'Assign appropriate vehicles based on group size',
            'Schedule pickup and dropoff times',
            'Confirm driver assignments',
            'Provide driver contact information to guests',
            'Track transportation status in real-time',
            'Handle special transportation requests',
            'Coordinate with airport transfers',
            'Manage shuttle services for events',
            'Monitor vehicle availability',
            'Ensure timely arrivals and departures'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-indigo-300 text-indigo-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CommunicationCenterView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({
    eventId: '',
    recipient: '',
    recipientType: 'Guest',
    subject: '',
    message: '',
    communicationType: 'Email',
    priority: 'Normal'
  });

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(messageForm)
      });
      if (response.ok) {
        addNotification('Message sent successfully', 'success');
        setShowMessageForm(false);
        setMessageForm({ eventId: '', recipient: '', recipientType: 'Guest', subject: '', message: '', communicationType: 'Email', priority: 'Normal' });
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to send message', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communication Center</h3>
        <button
          onClick={() => setShowMessageForm(!showMessageForm)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <MessageSquare size={14} />
          {showMessageForm ? 'Cancel' : 'Send Message'}
        </button>
      </div>

      {showMessageForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
                <select
                  value={messageForm.eventId}
                  onChange={(e) => setMessageForm({ ...messageForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map((event: Event) => (
                    <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Recipient Type</label>
                <select
                  value={messageForm.recipientType}
                  onChange={(e) => setMessageForm({ ...messageForm, recipientType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="Guest">Guest</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Staff">Staff</option>
                  <option value="All">All Attendees</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Recipient</label>
                <input
                  type="text"
                  value={messageForm.recipient}
                  onChange={(e) => setMessageForm({ ...messageForm, recipient: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Communication Type</label>
                <select
                  value={messageForm.communicationType}
                  onChange={(e) => setMessageForm({ ...messageForm, communicationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="In-App">In-App</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
              <input
                type="text"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
              <textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Messages', count: 156, color: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20' },
          { name: 'Sent', count: 142, color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Pending', count: 8, color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
          { name: 'Failed', count: 6, color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-sky-600">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Messages</h4>
        <div className="space-y-3">
          {[
            { recipient: 'Alice Johnson', type: 'Email', subject: 'Event Confirmation', time: '2025-01-15 10:30', status: 'Sent' },
            { recipient: 'Bob Smith', type: 'SMS', subject: 'Reminder', time: '2025-01-15 09:15', status: 'Sent' },
            { recipient: 'Carol Davis', type: 'WhatsApp', subject: 'Schedule Update', time: '2025-01-15 08:00', status: 'Pending' }
          ].map((msg, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{msg.recipient}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(msg.status)}`}>
                  {msg.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{msg.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{msg.type} • {msg.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Communication Checklist</h4>
        <div className="space-y-2">
          {[
            'Send event confirmations to guests',
            'Coordinate with vendors via email',
            'Send reminders to attendees',
            'Handle guest inquiries promptly',
            'Maintain communication logs',
            'Schedule follow-up messages',
            'Track message delivery status',
            'Handle failed communications',
            'Update contact information',
            'Send event updates and changes',
            'Coordinate with departments',
            'Archive communications after events'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-sky-300 text-sky-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReportsView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { name: 'Event Summary', icon: '📊', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
    { name: 'Revenue Report', icon: '💰', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
    { name: 'Occupancy Analysis', icon: '📈', color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    { name: 'Vendor Performance', icon: '⭐', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' },
    { name: 'Resource Utilization', icon: '📦', color: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20' },
    { name: 'Guest Feedback', icon: '💬', color: 'from-pink-50 to-fuchsia-50 dark:from-pink-900/20 dark:to-fuchsia-900/20' }
  ];

  const handleGenerateReport = () => {
    addNotification(`Generating ${selectedReport} report...`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reports & Analytics</h3>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <div
            key={type.name}
            onClick={() => setSelectedReport(type.name)}
            className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${type.color} cursor-pointer hover:scale-105 transition ${selectedReport === type.name ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Report Filters</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedReport}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Total Events', value: 45, color: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20' },
          { name: 'Total Revenue', value: '$125K', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Avg. Occupancy', value: '78%', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
          { name: 'Guest Satisfaction', value: '4.5/5', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-blue-600">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Recent Reports</h4>
        <div className="space-y-3">
          {[
            { name: 'Monthly Revenue - January', date: '2024-01-31', type: 'Revenue Report', status: 'Completed' },
            { name: 'Event Summary - Q1', date: '2024-03-31', type: 'Event Summary', status: 'Completed' },
            { name: 'Vendor Performance - March', date: '2024-03-31', type: 'Vendor Performance', status: 'Completed' }
          ].map((report, index) => (
            <div key={index} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{report.name}</h5>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{report.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{report.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Reports Management Checklist</h4>
        <div className="space-y-2">
          {[
            'Generate daily event summary reports',
            'Create weekly revenue analysis',
            'Monitor monthly occupancy trends',
            'Track vendor performance metrics',
            'Analyze guest feedback patterns',
            'Review resource utilization rates',
            'Compare year-over-year performance',
            'Identify revenue opportunities',
            'Report on cost variances',
            'Maintain report archive',
            'Schedule automated report generation',
            'Share reports with stakeholders'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-blue-300 text-blue-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConfigurationView = ({ events, loading, onRefresh, getStatusColor, addNotification }: any) => {
  const [activeTab, setActiveTab] = useState('general');
  const [configForm, setConfigForm] = useState({
    hotelName: '',
    defaultCurrency: 'USD',
    timezone: 'UTC',
    language: 'en',
    bookingLeadTime: '7',
    cancellationPolicy: '24 hours',
    depositRequired: 'true',
    depositPercentage: '20'
  });

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` },
        body: JSON.stringify(configForm)
      });
      if (response.ok) {
        addNotification('Configuration saved successfully', 'success');
        onRefresh();
      }
    } catch (error) {
      addNotification('Failed to save configuration', 'warning');
    }
  };

  const configTabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'booking', name: 'Booking', icon: '📅' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Configuration</h3>
      </div>

      {/* Configuration Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {configTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">General Settings</h4>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Hotel Name</label>
                <input
                  type="text"
                  value={configForm.hotelName}
                  onChange={(e) => setConfigForm({ ...configForm, hotelName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Default Currency</label>
                <select
                  value={configForm.defaultCurrency}
                  onChange={(e) => setConfigForm({ ...configForm, defaultCurrency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="ETB">ETB</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                <select
                  value={configForm.timezone}
                  onChange={(e) => setConfigForm({ ...configForm, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="EAT">EAT (East Africa)</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                <select
                  value={configForm.language}
                  onChange={(e) => setConfigForm({ ...configForm, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Booking Settings */}
      {activeTab === 'booking' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Booking Settings</h4>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Booking Lead Time (days)</label>
                <input
                  type="number"
                  value={configForm.bookingLeadTime}
                  onChange={(e) => setConfigForm({ ...configForm, bookingLeadTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Cancellation Policy</label>
                <select
                  value={configForm.cancellationPolicy}
                  onChange={(e) => setConfigForm({ ...configForm, cancellationPolicy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="24 hours">24 hours</option>
                  <option value="48 hours">48 hours</option>
                  <option value="72 hours">72 hours</option>
                  <option value="7 days">7 days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Deposit Required</label>
                <select
                  value={configForm.depositRequired}
                  onChange={(e) => setConfigForm({ ...configForm, depositRequired: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Deposit Percentage (%)</label>
                <input
                  type="number"
                  value={configForm.depositPercentage}
                  onChange={(e) => setConfigForm({ ...configForm, depositPercentage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Configuration Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Active Settings', value: '12', color: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20' },
          { name: 'Integrations', value: '5', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
          { name: 'Active Users', value: '8', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
          { name: 'Last Updated', value: 'Today', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' }
        ].map((stat) => (
          <div key={stat.name} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r ${stat.color}`}>
            <p className="text-lg font-bold text-violet-600">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Configuration Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Configuration Checklist</h4>
        <div className="space-y-2">
          {[
            'Set hotel name and contact information',
            'Configure default currency and timezone',
            'Define booking policies and lead times',
            'Set up deposit requirements',
            'Configure notification preferences',
            'Manage user roles and permissions',
            'Set up third-party integrations',
            'Configure security settings',
            'Set up backup and recovery',
            'Configure reporting parameters',
            'Review and update regularly',
            'Document configuration changes'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition">
              <input type="checkbox" className="w-4 h-4 rounded border-violet-300 text-violet-600" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BillingDepositsView = ({ events, loading, onRefresh, addNotification }: any) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    eventId: '',
    amount: '',
    paymentMethod: 'CreditCard' as 'CreditCard' | 'BankTransfer' | 'Cash' | 'Check',
    referenceNumber: '',
    notes: ''
  });

  const totalRevenue = events.reduce((sum: number, e: Event) => sum + (e.estimatedRevenue || 0), 0);
  const totalDeposits = events.reduce((sum: number, e: Event) => sum + (e.depositAmount || 0), 0);
  const totalCollected = events.reduce((sum: number, e: Event) => sum + (e.depositPaid ? e.depositAmount : 0), 0);
  const totalOutstanding = events.reduce((sum: number, e: Event) => sum + (e.finalBalance || 0), 0);
  const totalFinalPaid = events.reduce((sum: number, e: Event) => sum + (e.finalPaid ? e.finalBalance : 0), 0);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/banquet-events/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}`
        },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount)
        })
      });
      if (response.ok) {
        addNotification('Payment recorded successfully', 'success');
        setShowPaymentForm(false);
        setPaymentForm({
          eventId: '',
          amount: '',
          paymentMethod: 'CreditCard',
          referenceNumber: '',
          notes: ''
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      addNotification('Failed to record payment', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <KPICard title="Total Deposits" value={`$${totalDeposits.toLocaleString()}`} icon={PiggyBank} color="blue" />
        <KPICard title="Collected" value={`$${totalCollected.toLocaleString()}`} icon={CheckCircle2} color="emerald" />
        <KPICard title="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} icon={AlertTriangle} color="amber" />
        <KPICard title="Final Paid" value={`$${totalFinalPaid.toLocaleString()}`} icon={TrendingUp} color="purple" />
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Event Billing & Deposits</h3>
        <button
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          <Plus size={14} />
          {showPaymentForm ? 'Cancel' : 'Record Payment'}
        </button>
      </div>

      {showPaymentForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Event</label>
              <select
                value={paymentForm.eventId}
                onChange={(e) => setPaymentForm({ ...paymentForm, eventId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Event</option>
                {events.map((event: any) => (
                  <option key={event.eventId} value={event.eventId}>{event.eventName} - ${event.estimatedRevenue?.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="CreditCard">Credit Card</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Reference Number</label>
              <input
                type="text"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Billing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Event</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Deposit</th>
                <th className="pb-3">Deposit Status</th>
                <th className="pb-3">Balance</th>
                <th className="pb-3">Final Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any) => (
                <tr key={event.eventId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{event.eventName}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{event.clientName}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{new Date(event.startDate).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white">${event.estimatedRevenue?.toLocaleString()}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">${event.depositAmount?.toLocaleString()}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${event.depositPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {event.depositPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">${event.finalBalance?.toLocaleString()}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${event.finalPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {event.finalPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setPaymentForm({ ...paymentForm, eventId: event.eventId });
                        setShowPaymentForm(true);
                      }}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-400 transition"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BanquetEventsPortal;
