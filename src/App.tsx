/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useERP } from './context/ERPContext';
import { AppProviders } from './context/AppProviders';
import BookingPage from './components/BookingPage';
import LoginPage from './components/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import CheckInPrintModal from './components/FrontDesk/CheckInPrintModal';
import GroupCheckInPrintModal from './components/FrontDesk/GroupCheckInPrintModal';
import { CORE_ADMIN_MODULES } from './components/Admin/adminModules';
import GuestMobilePortal from './components/GuestMobilePortal';
import GuestPortal from './components/GuestPortal/GuestPortal';
import PublicPortal from './components/PublicPortal/PublicPortal';
import POSPortal from './components/POS/POSPortal';
import POSLoginPage from './components/POS/POSLoginPage';
import KitchenDisplayModule from './components/FoodBeverage/KitchenDisplayModule';
import KDSInstanceManagement from './components/FoodBeverage/KDSInstanceManagement';
import { SideNavigation } from './components/Shared/SideNavigation';
import { ErpLayout, ErpIndexRedirect } from './components/Shared/ErpLayout';
import { DepartmentRoute } from './components/Shared/DepartmentRoute';
import { DepartmentSwitcher } from './components/Shared/DepartmentSwitcher';
import { DEPARTMENT_BY_KEY, DEPARTMENT_BY_SEGMENT, getDefaultErpPath, type DepartmentKey } from './config/departments';
import { User } from './types/erp';
import { supabase } from './lib/supabase';
import { logout, verifySession } from './lib/auth';
import {
  LogOut,
  Users,
  Calendar,
  Lock,
  Settings,
  Moon,
  Sun,
  LayoutDashboard,
  FileBarChart,
  AlertCircle,
  Grid3x3,
  DoorOpen,
  Home,
  BedDouble,
  Crown,
  Key,
  Shield,
  FileText,
  MessageSquare,
  CreditCard,
  Car,
  Utensils,
  Wrench,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Building2,
  ClipboardList,
  ClipboardCheck,
  Receipt,
  Wallet,
  PiggyBank,
  Banknote,
  Scale,
  Target,
  Boxes,
  Building,
  Landmark,
  Gavel,
  FolderOpen,
  CheckSquare,
  BarChart3,
  PieChart,
  BookOpen,
  Brain,
  Compass,
  Eye,
  Activity,
  Leaf,
  Trophy,
  LineChart,
  Database,
  SlidersHorizontal,
  Moon as MoonIcon,
  Bell as BellIcon,
  SprayCan,
  Brush,
  Search,
  Truck,
  Wine,
  ChefHat,
  Store,
  HandPlatter,
  PartyPopper,
  Mail,
  Tag,
  Calculator,
  Layers,
  Network,
  Briefcase,
  IdCard,
  UserPlus,
  UserCheck,
  CalendarDays,
  Clock,
  CalendarOff,
  Gift,
  GraduationCap,
  HeartPulse,
  Handshake,
  FolderArchive,
  Workflow,
  Fingerprint,
  Cctv,
  Footprints,
  Siren,
  Flame,
  AlertTriangle,
  LifeBuoy,
  HardHat,
  ShieldCheck,
  KeySquare,
  Route as RouteIcon,
  MapPin,
  Gauge,
  Fuel,
  HardDrive,
  HardDriveDownload,
  Plane,
  Bus,
  Star,
  Command,
  CheckCircle2,
  ArrowRightLeft,
  Heart,
  Award,
  Ticket,
  Megaphone,
  ListChecks,
  FileCheck,
  Sparkles,
  Droplets,
  Scissors,
  Dumbbell,
  ShoppingBag,
  type LucideIcon
} from 'lucide-react';

function POSLoginRoute({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  return <POSLoginPage onLoginSuccess={onLoginSuccess} />;
}

function LoginRoute({ onLoginSuccess }: { onLoginSuccess: (user: User, forcePasswordChange?: boolean) => void }) {
  return <LoginPage onLoginSuccess={onLoginSuccess} />;
}

function MasterHotelERP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    notifications, 
    markNotificationRead, 
    clearNotification, 
    currentSystemDate, 
    stats,
    currency,
    setCurrency,
    formatAmount,
    theme,
    toggleTheme,
    globalHotelSettings,
    refreshAllData,
    currentPropertyId,
    setCurrentPropertyId,
    properties
  } = useERP();

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // POS Authentication state
  const [posUser, setPosUser] = useState<any>(null);
  const [, setPosSessionChecked] = useState(false);

  // Active department + tab — derived from the URL (Phase 3 route-driven navigation)
  const erpPathMatch = React.useMemo(() => {
    const match = location.pathname.match(/^\/erp\/([^/]+)(?:\/([^/]+))?/);
    if (!match) return null;
    const dept = DEPARTMENT_BY_SEGMENT[match[1]];
    if (!dept) return null;
    return { dept, tabId: match[2] || dept.defaultTab };
  }, [location.pathname]);

  const activeDept: DepartmentKey = erpPathMatch?.dept.key ?? 'frontoffice';
  const activeTab = erpPathMatch?.tabId ?? 'dashboard';

  // Accent class for the active department — applied to the side nav so its
  // active items / avatar adopt the same accent color as the portal content.
  // Only departments whose portal wraps content in an `accent-*` class need an
  // entry here; others fall back to the default indigo scheme.
  const DEPT_ACCENT_CLASS: Partial<Record<DepartmentKey, string>> = {
    frontoffice: 'accent-operations',
  };
  const activeAccentClass = DEPT_ACCENT_CLASS[activeDept] ?? '';

  // Side navigation collapsed state
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Auto-hide header - only visible on mouse hover at top of screen
  const [headerVisible, setHeaderVisible] = useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      // Hide when scrolled down, only show via mouse hover
      if (window.scrollY > 10) {
        setHeaderVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { systemUsers, syncUserProfile } = useERP();

  React.useEffect(() => {
    let active = true;
    verifySession().then(user => {
      if (!active) return;
      if (user) {
        setCurrentUser(user);
        // Sync userProfile with actual authentication data
        syncUserProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleDescription: user.roleDescription,
          avatar: user.avatarInitials,
          lastLogin: user.lastLogin || new Date().toISOString(),
          department: user.department,
          employeeId: user.employeeId,
          mobileNumber: user.mobileNumber,
          username: user.username,
          status: user.status,
        });
        // Phase 3: department is now URL-driven — no setActiveDept needed.
        // If the user is on /erp (index), ErpIndexRedirect will redirect to
        // their default department based on their role.
      }
      setSessionChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);
  // Sync currentUser permissions and active state in real time
  React.useEffect(() => {
    if (currentUser) {
      const liveUser = systemUsers.find(u => u.id === currentUser.id);
      if (liveUser) {
        if (liveUser.status === 'Inactive' || liveUser.status === 'Pending') {
          setCurrentUser(null);
          return;
        }
        // Check if role-relevant fields changed — if so, re-enrich via verifySession
        const roleChanged = liveUser.role !== currentUser.role ||
          liveUser.customRoleId !== currentUser.customRoleId ||
          liveUser.status !== currentUser.status;
        if (roleChanged) {
          // Re-verify session to get fresh enriched permissions
          verifySession().then(enriched => {
            if (enriched) setCurrentUser(enriched);
          });
          return;
        }
        // Otherwise, merge liveUser fields but preserve enriched fields
        if (JSON.stringify(liveUser) !== JSON.stringify(currentUser)) {
          setCurrentUser({
            ...liveUser,
            allowedTabs: currentUser.allowedTabs,
            allowedSettings: currentUser.allowedSettings,
            moduleAccess: currentUser.moduleAccess,
          });
        }
      }
    }
  }, [systemUsers, currentUser]);

  // Auto-refresh ERP data after 30 seconds of inactivity
  React.useEffect(() => {
    if (!currentUser) return;
    const INACTIVITY_MS = 30000;
    let lastActivity = Date.now();
    let refreshing = false;

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const updateLastActivity = () => { lastActivity = Date.now(); };
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity, { passive: true });
    });

    const intervalId = window.setInterval(() => {
      if (refreshing) return;
      if (Date.now() - lastActivity >= INACTIVITY_MS) {
        refreshing = true;
        refreshAllData().finally(() => {
          lastActivity = Date.now();
          refreshing = false;
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
    };
  }, [currentUser, refreshAllData]);

  const handleLoginSuccess = (user: User, forcePasswordChange?: boolean) => {
    setCurrentUser(user);
    syncUserProfile({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleDescription: user.roleDescription,
      avatar: user.avatarInitials,
      lastLogin: user.lastLogin || new Date().toISOString(),
      department: user.department,
      employeeId: user.employeeId,
      mobileNumber: user.mobileNumber,
      username: user.username,
      status: user.status,
    });

    if (forcePasswordChange) {
      setMustChangePassword(true);
      navigate('/erp'); // Navigate to trigger the forced password screen
      return;
    }

    // Phase 3: navigate to the user's default department (URL-driven)
    navigate(getDefaultErpPath(user));

    // Re-fetch all ERP data now that the user is authenticated.
    // Sub-contexts fired their initial refreshData() on mount while
    // unauthenticated, so those calls returned 401 and left state empty.
    refreshAllData();
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  const handlePOSLoginSuccess = (user: any) => {
    setPosUser(user);
    setPosSessionChecked(true);
  };

  const handlePOSLogout = async () => {
    await supabase.auth.signOut();
    setPosUser(null);
    navigate('/pos/login');
  };

  // Phase 3: *Dir state removed — tab is now derived from the URL (activeTab)

  // Notification panel toggle on ERP
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Check In Print Modal
  const [printGuestForm, setPrintGuestForm] = useState<{guestName: string, guestEmail: string, guestPhone: string, reservationId: string, roomNumber: string, checkInDate: string} | null>(null);
  const [printGroupForm, setPrintGroupForm] = useState<{groupName: string, contactName: string, contactEmail: string, contactPhone: string, groupId: string, roomCount: number, checkInDate: string} | null>(null);

  const getUnreadNotifCount = () => notifications.filter(n => !n.read).length;

  // Helper: check if current user has read access to a sub-module
  const hasModuleAccess = (modId: string): boolean => {
    if (!currentUser?.moduleAccess || Object.keys(currentUser.moduleAccess).length === 0) return true;
    const access = currentUser.moduleAccess[modId];
    if (access === undefined) return true;
    return typeof access === 'boolean' ? access : access?.read === true;
  };

  // Phase 3: deptSubModuleMap, access-control useEffects, isModuleDisabled,
  // and admin module-toggle useEffect removed — all access control is now
  // handled by DepartmentRoute at the route level.

  // Platform controls: a department portal can be disabled web-app-wide from
  // System Admin > Platform Controls. Admin and account settings are never gated.
  const moduleToggles = globalHotelSettings.moduleToggles || {};

  // Compute sub-navigation items for the active department
  const subNavItems: { id: string; label: string; modId: string }[] = React.useMemo(() => {
    const subNavConfig: Record<string, { id: string; label: string; modId: string; icon?: LucideIcon }[]> = {
      frontoffice: [
        { id: 'dashboard', label: 'Dashboard', modId: 'fo_dashboard', icon: LayoutDashboard },
        { id: 'reservations', label: 'Reservations', modId: 'fo_reservations', icon: Calendar },
        { id: 'availability-inventory', label: 'Availability', modId: 'fo_availability', icon: Grid3x3 },
        { id: 'front-desk-operations', label: 'Front Desk Ops', modId: 'fo_front_desk_ops', icon: DoorOpen },
        { id: 'room-assignment', label: 'Room Assignment', modId: 'fo_room_assignment', icon: BedDouble },
        { id: 'guest-profiles', label: 'Guest Profiles', modId: 'fo_guest_profiles', icon: Users },
        { id: 'group-profiles-management', label: 'Group Profiles', modId: 'fo_group_profiles', icon: Users },
        { id: 'check-in', label: 'Check-In', modId: 'fo_check_in', icon: Key },
        { id: 'check-out', label: 'Check-Out', modId: 'fo_check_out', icon: CreditCard },
        { id: 'folio-billing', label: 'Folio & Billing', modId: 'fo_folio', icon: FileText },
        { id: 'night-audit', label: 'Night Audit', modId: 'fo_night_audit', icon: MoonIcon },
        { id: 'keys-access', label: 'Keys & Access', modId: 'fo_keys_access', icon: KeySquare },
        { id: 'concierge-portal', label: 'Concierge Portal', modId: 'fo_concierge_portal', icon: Crown },
        { id: 'guest-requests', label: 'Guest Requests', modId: 'fo_guest_requests', icon: BellIcon },
        { id: 'lost-found', label: 'Lost & Found', modId: 'fo_lost_found', icon: Search },
        { id: 'communication-center', label: 'Comms', modId: 'fo_communication', icon: MessageSquare },
        { id: 'reports', label: 'Reports', modId: 'fo_reports', icon: FileBarChart },
        { id: 'configuration', label: 'Config', modId: 'fo_configuration', icon: Settings },
      ],
      housekeeping: [
        { id: 'dashboard', label: 'Command Center', modId: 'hk_dashboard', icon: LayoutDashboard },
        { id: 'rooms', label: 'Room Board', modId: 'hk_rooms', icon: BedDouble },
        { id: 'tasks', label: 'Task Management', modId: 'hk_tasks', icon: ClipboardList },
        { id: 'public-area', label: 'Public Areas', modId: 'hk_public_area', icon: SprayCan },
        { id: 'inspections', label: 'Inspections', modId: 'hk_inspections', icon: ClipboardCheck },
        { id: 'supervisor', label: 'Supervisor', modId: 'hk_supervisor', icon: Eye },
        { id: 'minibar', label: 'Minibar', modId: 'hk_minibar', icon: Wine },
        { id: 'guest-requests', label: 'Guest Requests', modId: 'hk_guest_requests', icon: BellIcon },
        { id: 'deep-cleaning', label: 'Deep Clean', modId: 'hk_deep_cleaning', icon: Brush },
        { id: 'preventive-cleaning', label: 'Preventive', modId: 'hk_preventive', icon: SprayCan },
        { id: 'maintenance', label: 'Maintenance', modId: 'hk_maintenance', icon: Wrench },
        { id: 'communication', label: 'Communication', modId: 'hk_communication', icon: MessageSquare },
        { id: 'configuration', label: 'Configuration', modId: 'hk_configuration', icon: Settings },
        { id: 'laundry', label: 'Laundry & Valet', modId: 'hk_laundry', icon: HandPlatter },
        { id: 'inventory', label: 'Supplies & Linen', modId: 'hk_inventory', icon: Package },
        { id: 'amenities', label: 'Guest Amenities', modId: 'hk_amenities', icon: Gift },
        { id: 'lostfound', label: 'Lost & Found', modId: 'hk_lostfound', icon: Search },
        { id: 'staff', label: 'Team', modId: 'hk_staff', icon: Users },
        { id: 'reports', label: 'Intelligence', modId: 'hk_reports', icon: BarChart3 },
        { id: 'standard-reports', label: 'Standard Reports', modId: 'hk_standard_reports', icon: FileBarChart },
      ],
      'f&b': [
        { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'fb_executive_dashboard', icon: LayoutDashboard },
        { id: 'outlet-management', label: 'Outlets', modId: 'fb_outlet_management', icon: Store },
        { id: 'menu-catalog', label: 'Menu & Catalog', modId: 'fb_menu_catalog', icon: BookOpen },
        { id: 'recipe-production', label: 'Recipe & Production', modId: 'fb_recipe_production', icon: ChefHat },
        { id: 'inventory-cost', label: 'Inventory & Cost', modId: 'fb_inventory_cost', icon: Package },
        { id: 'beverage-management', label: 'Beverage', modId: 'fb_beverage_management', icon: Wine },
        { id: 'purchasing-suppliers', label: 'Purchasing', modId: 'fb_purchasing_suppliers', icon: ShoppingCart },
        { id: 'banquet-catering', label: 'Banquets', modId: 'fb_banquet_catering', icon: PartyPopper },
        { id: 'room-service', label: 'Room Service', modId: 'fb_room_service', icon: HandPlatter },
        { id: 'guest-crm', label: 'Guest CRM', modId: 'fb_guest_crm', icon: Users },
        { id: 'promotions-pricing', label: 'Promotions', modId: 'fb_promotions_pricing', icon: Tag },
        { id: 'financial-control', label: 'Financial Control', modId: 'fb_financial_control', icon: Calculator },
        { id: 'operations-compliance', label: 'Operations', modId: 'fb_operations_compliance', icon: ClipboardCheck },
        { id: 'reporting-bi', label: 'Reporting & BI', modId: 'fb_reporting_bi', icon: BarChart3 },
        { id: 'integrations', label: 'Integrations', modId: 'fb_integrations', icon: Network },
      ],
      maintenance: [
        { id: 'dashboard', label: 'Dashboard', modId: 'eng_dashboard', icon: LayoutDashboard },
        { id: 'work-requests', label: 'Work Requests', modId: 'eng_work_requests', icon: ClipboardList },
        { id: 'workorders', label: 'Work Orders', modId: 'eng_workorders', icon: Wrench },
        { id: 'corrective-maintenance', label: 'Corrective Maint.', modId: 'eng_corrective_maintenance', icon: Wrench },
        { id: 'pm', label: 'Preventive Maint.', modId: 'eng_pm', icon: Calendar },
        { id: 'predictive-maintenance', label: 'Predictive Maint.', modId: 'eng_predictive_maintenance', icon: Activity },
        { id: 'equipment-registry', label: 'Equipment Registry', modId: 'eng_equipment_registry', icon: HardDrive },
        { id: 'building-maintenance', label: 'Building Maint.', modId: 'eng_building_maintenance', icon: Building },
        { id: 'energy-management', label: 'Energy Management', modId: 'eng_energy_management', icon: Gauge },
        { id: 'spare-parts', label: 'Spare Parts', modId: 'eng_spare_parts', icon: Package },
        { id: 'vendor-contractor', label: 'Vendors & Contractors', modId: 'eng_vendor_contractor', icon: Briefcase },
        { id: 'inspections', label: 'Inspections', modId: 'eng_inspections', icon: ClipboardCheck },
        { id: 'calibration', label: 'Calibration', modId: 'eng_calibration', icon: SlidersHorizontal },
        { id: 'projects-renovations', label: 'Projects & Renovations', modId: 'eng_projects', icon: HardHat },
        { id: 'communication', label: 'Communication', modId: 'eng_communication', icon: MessageSquare },
        { id: 'configuration', label: 'Configuration', modId: 'eng_configuration', icon: Settings },
        { id: 'assets', label: 'Asset Register', modId: 'eng_assets', icon: Boxes },
        { id: 'rooms', label: 'Guest Rooms', modId: 'eng_rooms', icon: BedDouble },
        { id: 'utilities', label: 'Utilities & Plant', modId: 'eng_utilities', icon: Activity },
        { id: 'inventory', label: 'Spare Parts & Tools', modId: 'eng_inventory', icon: Package },
        { id: 'staff', label: 'Technicians', modId: 'eng_staff', icon: Users },
        { id: 'compliance', label: 'Safety & Compliance', modId: 'eng_compliance', icon: ShieldCheck },
        { id: 'reports', label: 'Reports', modId: 'eng_reports', icon: FileBarChart },
        { id: 'standard-reports', label: 'Standard Reports', modId: 'eng_standard_reports', icon: FileBarChart },
      ],
      inventory: [
        { id: 'dashboard', label: 'Dashboard', modId: 'inv_dashboard', icon: LayoutDashboard },
        { id: 'items', label: 'Item Master', modId: 'inv_items', icon: Package },
        { id: 'stores', label: 'Stores & Transfers', modId: 'inv_stores', icon: Building },
        { id: 'requisition', label: 'Requisitions', modId: 'inv_requisitions', icon: ClipboardList },
        { id: 'receiving', label: 'Goods Receiving', modId: 'inv_receiving', icon: HardDriveDownload },
        { id: 'count', label: 'Stock Counting', modId: 'inv_count', icon: ClipboardCheck },
        { id: 'suppliers', label: 'Suppliers', modId: 'inv_suppliers', icon: Briefcase },
        { id: 'standard-reports', label: 'Standard Reports', modId: 'inv_standard_reports', icon: FileBarChart },
        { id: 'reports', label: 'Reports', modId: 'inv_reports', icon: BarChart3 },
      ],
      finance: [
        { id: 'dashboard', label: 'Executive Dashboard', modId: 'fin_dashboard', icon: LayoutDashboard },
        { id: 'gl', label: 'General Ledger', modId: 'fin_gl', icon: BookOpen },
        { id: 'coa', label: 'Chart of Accounts', modId: 'fin_coa', icon: FolderOpen },
        { id: 'ar', label: 'Accounts Receivable', modId: 'fin_ar', icon: Receipt },
        { id: 'ap', label: 'Accounts Payable', modId: 'fin_ap', icon: Receipt },
        { id: 'cash_bank', label: 'Cash & Bank', modId: 'fin_cash_bank', icon: Wallet },
        { id: 'treasury', label: 'Treasury', modId: 'fin_treasury', icon: Landmark },
        { id: 'revenue', label: 'Revenue', modId: 'fin_revenue', icon: TrendingUp },
        { id: 'expense', label: 'Expense', modId: 'fin_expense', icon: Banknote },
        { id: 'cost_center', label: 'Cost Center', modId: 'fin_cost_center', icon: Target },
        { id: 'budgeting', label: 'Budgeting', modId: 'fin_budgeting', icon: PiggyBank },
        { id: 'fixed_assets', label: 'Fixed Assets', modId: 'fin_fixed_assets', icon: Boxes },
        { id: 'inventory', label: 'Inventory', modId: 'fin_inventory', icon: Package },
        { id: 'intercompany', label: 'Intercompany', modId: 'fin_intercompany', icon: Network },
        { id: 'tax', label: 'Tax', modId: 'fin_tax', icon: Scale },
        { id: 'financial_close', label: 'Financial Close', modId: 'fin_financial_close', icon: Lock },
        { id: 'consolidation', label: 'Consolidation', modId: 'fin_consolidation', icon: Layers },
        { id: 'audit_compliance', label: 'Audit', modId: 'fin_audit_compliance', icon: Gavel },
        { id: 'documents', label: 'Documents', modId: 'fin_documents', icon: FileText },
        { id: 'approval', label: 'Approvals', modId: 'fin_approval', icon: CheckSquare },
        { id: 'bi', label: 'Business Intel', modId: 'fin_bi', icon: BarChart3 },
        { id: 'reports', label: 'Reports', modId: 'fin_reports', icon: FileBarChart },
        { id: 'config', label: 'Configuration', modId: 'fin_config', icon: Settings },
      ],
      hr: [
        { id: 'dashboard', label: 'Executive Dashboard', modId: 'hr_dashboard', icon: LayoutDashboard },
        { id: 'organization', label: 'Organization Management', modId: 'hr_organization', icon: Building2 },
        { id: 'employees', label: 'Employee Management', modId: 'hr_employees', icon: Users },
        { id: 'recruitment', label: 'Recruitment', modId: 'hr_recruitment', icon: UserPlus },
        { id: 'ats', label: 'Applicant Tracking (ATS)', modId: 'hr_ats', icon: ClipboardList },
        { id: 'onboarding', label: 'Onboarding', modId: 'hr_onboarding', icon: UserCheck },
        { id: 'ess', label: 'Employee Self-Service', modId: 'hr_ess', icon: IdCard },
        { id: 'mss', label: 'Manager Self-Service', modId: 'hr_mss', icon: Briefcase },
        { id: 'attendance', label: 'Attendance Management', modId: 'hr_attendance', icon: Calendar },
        { id: 'shifts', label: 'Shift & Rostering', modId: 'hr_shifts', icon: CalendarDays },
        { id: 'leave', label: 'Leave Management', modId: 'hr_leave', icon: CalendarOff },
        { id: 'overtime', label: 'Time & Overtime', modId: 'hr_overtime', icon: Clock },
        { id: 'payroll', label: 'Payroll Management', modId: 'hr_payroll', icon: Banknote },
        { id: 'compensation', label: 'Compensation & Benefits', modId: 'hr_compensation', icon: Gift },
        { id: 'performance', label: 'Performance Management', modId: 'hr_performance', icon: Target },
        { id: 'learning', label: 'Learning & Development', modId: 'hr_learning', icon: GraduationCap },
        { id: 'training', label: 'Training Management', modId: 'hr_training', icon: BookOpen },
        { id: 'career', label: 'Career & Succession', modId: 'hr_career', icon: TrendingUp },
        { id: 'health', label: 'Health & Safety', modId: 'hr_health', icon: HeartPulse },
        { id: 'relations', label: 'Employee Relations', modId: 'hr_relations', icon: Handshake },
        { id: 'documents', label: 'Document Management', modId: 'hr_documents', icon: FolderArchive },
        { id: 'workflow', label: 'Workflow & Approvals', modId: 'hr_workflow', icon: Workflow },
        { id: 'analytics', label: 'Reports & Analytics', modId: 'hr_analytics', icon: BarChart3 },
        { id: 'configuration', label: 'Configuration', modId: 'hr_configuration', icon: Settings },
      ],
      security: [
        { id: 'dashboard', label: 'Executive Dashboard', modId: 'sec_dashboard', icon: LayoutDashboard },
        { id: 'soc', label: 'Security Operations Center', modId: 'sec_soc', icon: Shield },
        { id: 'incidents', label: 'Incident Management', modId: 'sec_incidents', icon: AlertTriangle },
        { id: 'investigations', label: 'Investigations', modId: 'sec_investigations', icon: Search },
        { id: 'visitors', label: 'Visitor Management', modId: 'sec_visitors', icon: Users },
        { id: 'access-control', label: 'Access Control', modId: 'sec_access', icon: Lock },
        { id: 'keys', label: 'Key & Keycard Management', modId: 'sec_keys', icon: Key },
        { id: 'cctv', label: 'CCTV Management', modId: 'sec_cctv', icon: Cctv },
        { id: 'patrols', label: 'Patrol Management', modId: 'sec_patrols', icon: Footprints },
        { id: 'lost-found', label: 'Lost & Found Oversight', modId: 'sec_lostfound', icon: Search },
        { id: 'emergency', label: 'Emergency Management', modId: 'sec_emergency', icon: Siren },
        { id: 'fire-safety', label: 'Fire & Life Safety', modId: 'sec_firesafety', icon: Flame },
        { id: 'risk', label: 'Risk Management', modId: 'sec_risk', icon: AlertCircle },
        { id: 'business-continuity', label: 'Business Continuity', modId: 'sec_businesscontinuity', icon: LifeBuoy },
        { id: 'crisis', label: 'Crisis Management', modId: 'sec_crisis', icon: AlertTriangle },
        { id: 'health-safety', label: 'Health & Safety Coordination', modId: 'sec_healthsafety', icon: HeartPulse },
        { id: 'compliance', label: 'Compliance Management', modId: 'sec_compliance', icon: ShieldCheck },
        { id: 'asset-protection', label: 'Asset Protection', modId: 'sec_assetprotection', icon: Shield },
        { id: 'fraud-prevention', label: 'Fraud Prevention', modId: 'sec_fraudprevention', icon: Fingerprint },
        { id: 'evidence', label: 'Evidence Management', modId: 'sec_evidence', icon: FolderArchive },
        { id: 'communication', label: 'Communication Center', modId: 'sec_communication', icon: MessageSquare },
        { id: 'reports', label: 'Reports', modId: 'sec_reports', icon: FileBarChart },
        { id: 'configuration', label: 'Configuration', modId: 'sec_configuration', icon: Settings },
      ],
      transportation: [
        { id: 'dashboard', label: 'Dashboard', modId: 'trans_dashboard', icon: LayoutDashboard },
        { id: 'requests', label: 'Requests', modId: 'trans_requests', icon: ClipboardList },
        { id: 'dispatch', label: 'Dispatch Center', modId: 'trans_dispatch', icon: Truck },
        { id: 'trips', label: 'Trip Management', modId: 'trans_trips', icon: RouteIcon },
        { id: 'airport', label: 'Airport Transfers', modId: 'trans_airport', icon: Plane },
        { id: 'shuttle', label: 'Shuttle Management', modId: 'trans_shuttle', icon: Bus },
        { id: 'guest', label: 'Guest Transportation', modId: 'trans_guest', icon: Users },
        { id: 'corporate', label: 'Corporate Transportation', modId: 'trans_corporate', icon: Briefcase },
        { id: 'staff', label: 'Staff Transportation', modId: 'trans_staff', icon: Users },
        { id: 'fleet', label: 'Fleet Management', modId: 'trans_fleet', icon: Car },
        { id: 'vehicles', label: 'Vehicle Registry', modId: 'trans_vehicles', icon: Car },
        { id: 'drivers', label: 'Driver Management', modId: 'trans_drivers', icon: IdCard },
        { id: 'routes', label: 'Route Management', modId: 'trans_routes', icon: MapPin },
        { id: 'scheduling', label: 'Scheduling & Dispatch', modId: 'trans_scheduling', icon: Calendar },
        { id: 'gps', label: 'GPS Tracking', modId: 'trans_gps', icon: MapPin },
        { id: 'fuel', label: 'Fuel Management', modId: 'trans_fuel', icon: Fuel },
        { id: 'maintenance', label: 'Vehicle Maintenance', modId: 'trans_maintenance', icon: Wrench },
        { id: 'contractors', label: 'Contractors', modId: 'trans_contractors', icon: Briefcase },
        { id: 'billing', label: 'Billing & Charges', modId: 'trans_billing', icon: Receipt },
        { id: 'communication', label: 'Communication Center', modId: 'trans_communication', icon: MessageSquare },
        { id: 'reports', label: 'Reports', modId: 'trans_reports', icon: FileBarChart },
        { id: 'configuration', label: 'Configuration', modId: 'trans_configuration', icon: Settings },
      ],
      procurement: [
        { id: 'dashboard', label: 'Procurement Dashboard', modId: 'proc_dashboard', icon: LayoutDashboard },
        { id: 'requisitions', label: 'Requisitions', modId: 'proc_requisitions', icon: ClipboardList },
        { id: 'orders', label: 'Purchase Orders', modId: 'proc_orders', icon: FileText },
        { id: 'suppliers', label: 'Suppliers', modId: 'proc_suppliers', icon: Briefcase },
        { id: 'rfq', label: 'RFQ Management', modId: 'proc_rfq', icon: FileText },
        { id: 'receiving', label: 'Goods Receiving', modId: 'proc_receiving', icon: HardDriveDownload },
        { id: 'contracts', label: 'Contracts', modId: 'proc_contracts', icon: FileText },
        { id: 'budget', label: 'Budget Control', modId: 'proc_budget', icon: PiggyBank },
        { id: 'invoices', label: 'Supplier Invoices', modId: 'proc_invoices', icon: Receipt },
        { id: 'approvals', label: 'Approval Center', modId: 'proc_approvals', icon: CheckSquare },
        { id: 'reports', label: 'Reports', modId: 'proc_reports', icon: FileBarChart },
        { id: 'standard-reports', label: 'Standard Reports', modId: 'proc_standard_reports', icon: FileBarChart },
      ],
      sales: [
        { id: 'dashboard', label: 'Dashboard', modId: 'sales_dashboard', icon: LayoutDashboard },
        { id: 'crm', label: 'CRM', modId: 'sales_crm', icon: Users },
        { id: 'guest-profiles', label: 'Guest Profiles', modId: 'sales_guest_profiles', icon: Users },
        { id: 'corporate-accounts', label: 'Corporate Accounts', modId: 'sales_corporate_accounts', icon: Briefcase },
        { id: 'travel-agents', label: 'Travel Agents', modId: 'sales_travel_agents', icon: Briefcase },
        { id: 'leads', label: 'Leads', modId: 'sales_leads', icon: TrendingUp },
        { id: 'opportunities', label: 'Opportunities', modId: 'sales_opportunities', icon: Target },
        { id: 'proposals', label: 'Proposals', modId: 'sales_proposals', icon: FileText },
        { id: 'contracts', label: 'Contracts', modId: 'sales_contracts', icon: FileText },
        { id: 'sales-activities', label: 'Activities', modId: 'sales_activities', icon: Calendar },
        { id: 'account-management', label: 'Account Mgmt', modId: 'sales_account_management', icon: Users },
        { id: 'campaigns', label: 'Campaigns', modId: 'sales_campaigns', icon: Tag },
        { id: 'email-marketing', label: 'Email', modId: 'sales_email_marketing', icon: Mail },
        { id: 'sms-messaging', label: 'SMS', modId: 'sales_sms_messaging', icon: MessageSquare },
        { id: 'loyalty', label: 'Loyalty', modId: 'sales_loyalty', icon: Gift },
        { id: 'promotions', label: 'Promotions', modId: 'sales_promotions', icon: Tag },
        { id: 'gift-cards', label: 'Gift Cards', modId: 'sales_gift_cards', icon: Gift },
        { id: 'reputation', label: 'Reputation', modId: 'sales_reputation', icon: Star },
        { id: 'guest-feedback', label: 'Feedback', modId: 'sales_guest_feedback', icon: MessageSquare },
        { id: 'segmentation', label: 'Segmentation', modId: 'sales_segmentation', icon: PieChart },
        { id: 'business-intelligence', label: 'BI', modId: 'sales_business_intelligence', icon: BarChart3 },
        { id: 'communication', label: 'Communication', modId: 'sales_communication', icon: MessageSquare },
        { id: 'reports', label: 'Reports', modId: 'sales_reports', icon: FileBarChart },
        { id: 'configuration', label: 'Configuration', modId: 'sales_configuration', icon: Settings },
      ],
      concierge: [
        { id: 'dashboard', label: 'Executive Dashboard', modId: 'concierge_dashboard', icon: LayoutDashboard },
        { id: 'service-center', label: 'Guest Service Center', modId: 'concierge_service_center', icon: Users },
        { id: 'guest-profiles', label: 'Guest Profiles', modId: 'concierge_guest_profiles', icon: Users },
        { id: 'guest-requests', label: 'Guest Requests', modId: 'concierge_guest_requests', icon: BellIcon },
        { id: 'concierge-desk', label: 'Concierge Desk', modId: 'concierge_desk', icon: MapPin },
        { id: 'experience-booking', label: 'Experience Booking', modId: 'concierge_experience_booking', icon: Star },
        { id: 'restaurant-reservations', label: 'Restaurant Reservations', modId: 'concierge_restaurant_reservations', icon: Utensils },
        { id: 'transportation', label: 'Transportation', modId: 'concierge_transportation', icon: Car },
        { id: 'tour-management', label: 'Tour Management', modId: 'concierge_tour_management', icon: MapPin },
        { id: 'ticketing', label: 'Ticketing Services', modId: 'concierge_ticketing', icon: Ticket },
      ],
      'spa-wellness': [
        { id: 'dashboard', label: 'Executive Dashboard', modId: 'spa_dashboard', icon: LayoutDashboard },
        { id: 'appointments', label: 'Appointment Management', modId: 'spa_appointments', icon: Calendar },
        { id: 'treatment-catalog', label: 'Treatment Catalog', modId: 'spa_treatment_catalog', icon: Sparkles },
        { id: 'therapists', label: 'Therapist Management', modId: 'spa_therapists', icon: Users },
        { id: 'treatment-rooms', label: 'Treatment Rooms', modId: 'spa_treatment_rooms', icon: Home },
        { id: 'guest-wellness-profiles', label: 'Guest Wellness Profiles', modId: 'spa_guest_wellness_profiles', icon: Heart },
        { id: 'wellness-programs', label: 'Wellness Programs', modId: 'spa_wellness_programs', icon: Target },
        { id: 'memberships', label: 'Membership Management', modId: 'spa_memberships', icon: Award },
        { id: 'fitness-center', label: 'Fitness Center', modId: 'spa_fitness_center', icon: Dumbbell },
        { id: 'beauty-salon', label: 'Beauty Salon', modId: 'spa_beauty_salon', icon: Scissors },
        { id: 'thermal-hydro', label: 'Thermal & Hydro', modId: 'spa_thermal_hydro', icon: Droplets },
        { id: 'wellness-packages', label: 'Wellness Packages', modId: 'spa_wellness_packages', icon: Gift },
        { id: 'retail-shop', label: 'Retail Shop', modId: 'spa_retail_shop', icon: ShoppingBag },
        { id: 'inventory-consumption', label: 'Inventory Consumption', modId: 'spa_inventory_consumption', icon: Package },
        { id: 'gift-cards', label: 'Gift Cards & Vouchers', modId: 'spa_gift_cards', icon: CreditCard },
        { id: 'billing-payments', label: 'Billing & Payments', modId: 'spa_billing_payments', icon: DollarSign },
        { id: 'communication', label: 'Communication Center', modId: 'spa_communication', icon: MessageSquare },
        { id: 'reports', label: 'Reports', modId: 'spa_reports', icon: BarChart3 },
        { id: 'configuration', label: 'Configuration', modId: 'spa_configuration', icon: Settings },
        { id: 'luggage-services', label: 'Luggage Services', modId: 'concierge_luggage_services', icon: Package },
        { id: 'parcel-management', label: 'Parcel Management', modId: 'concierge_parcel_management', icon: Package },
        { id: 'vip-services', label: 'VIP & Butler Services', modId: 'concierge_vip_services', icon: Crown },
        { id: 'personal-shopping', label: 'Personal Shopping', modId: 'concierge_personal_shopping', icon: ShoppingBag },
        { id: 'local-recommendations', label: 'Local Recommendations', modId: 'concierge_local_recommendations', icon: MapPin },
        { id: 'itinerary-planner', label: 'Itinerary Planner', modId: 'concierge_itinerary_planner', icon: Calendar },
        { id: 'wake-up-reminder', label: 'Wake-up & Reminder', modId: 'concierge_wake_up_reminder', icon: Clock },
        { id: 'guest-communication', label: 'Guest Communication', modId: 'concierge_guest_communication', icon: MessageSquare },
        { id: 'vendor-management', label: 'Vendor Management', modId: 'concierge_vendor_management', icon: Building2 },
        { id: 'billing-charges', label: 'Billing & Charges', modId: 'concierge_billing_charges', icon: DollarSign },
        { id: 'reports', label: 'Reports', modId: 'concierge_reports', icon: FileBarChart },
        { id: 'configuration', label: 'Configuration', modId: 'concierge_configuration', icon: Settings },
      ],
    };

    // Executive and Operations share the same sub-nav
    const execOpsSubNav = [
      { id: 'executive-dashboard', label: 'Executive Dashboard', modId: activeDept === 'executive' ? 'exec_executive_dashboard' : 'ops_executive_dashboard', icon: LayoutDashboard },
      { id: 'enterprise-kpi-center', label: 'Enterprise KPI Center', modId: activeDept === 'executive' ? 'exec_enterprise_kpi_center' : 'ops_enterprise_kpi_center', icon: Target },
      { id: 'operational-intelligence', label: 'Operational Intelligence', modId: activeDept === 'executive' ? 'exec_operational_intelligence' : 'ops_operational_intelligence', icon: Activity },
      { id: 'financial-intelligence', label: 'Financial Intelligence', modId: activeDept === 'executive' ? 'exec_financial_intelligence' : 'ops_financial_intelligence', icon: DollarSign },
      { id: 'revenue-intelligence', label: 'Revenue Intelligence', modId: activeDept === 'executive' ? 'exec_revenue_intelligence' : 'ops_revenue_intelligence', icon: TrendingUp },
      { id: 'guest-intelligence', label: 'Guest Intelligence', modId: activeDept === 'executive' ? 'exec_guest_intelligence' : 'ops_guest_intelligence', icon: Users },
      { id: 'sales-marketing-intelligence', label: 'Sales & Marketing', modId: activeDept === 'executive' ? 'exec_sales_marketing_intelligence' : 'ops_sales_marketing_intelligence', icon: TrendingUp },
      { id: 'food-beverage-intelligence', label: 'F&B Intelligence', modId: activeDept === 'executive' ? 'exec_food_beverage_intelligence' : 'ops_food_beverage_intelligence', icon: Utensils },
      { id: 'housekeeping-intelligence', label: 'Housekeeping', modId: activeDept === 'executive' ? 'exec_housekeeping_intelligence' : 'ops_housekeeping_intelligence', icon: BedDouble },
      { id: 'engineering-intelligence', label: 'Engineering', modId: activeDept === 'executive' ? 'exec_engineering_intelligence' : 'ops_engineering_intelligence', icon: Wrench },
      { id: 'human-capital-intelligence', label: 'Human Capital', modId: activeDept === 'executive' ? 'exec_human_capital_intelligence' : 'ops_human_capital_intelligence', icon: Users },
      { id: 'procurement-intelligence', label: 'Procurement', modId: activeDept === 'executive' ? 'exec_procurement_intelligence' : 'ops_procurement_intelligence', icon: ShoppingCart },
      { id: 'inventory-intelligence', label: 'Inventory', modId: activeDept === 'executive' ? 'exec_inventory_intelligence' : 'ops_inventory_intelligence', icon: Package },
      { id: 'security-intelligence', label: 'Security', modId: activeDept === 'executive' ? 'exec_security_intelligence' : 'ops_security_intelligence', icon: Shield },
      { id: 'sustainability-intelligence', label: 'Sustainability', modId: activeDept === 'executive' ? 'exec_sustainability_intelligence' : 'ops_sustainability_intelligence', icon: Leaf },
      { id: 'benchmarking', label: 'Benchmarking', modId: activeDept === 'executive' ? 'exec_benchmarking' : 'ops_benchmarking', icon: Trophy },
      { id: 'forecasting', label: 'Forecasting', modId: activeDept === 'executive' ? 'exec_forecasting' : 'ops_forecasting', icon: LineChart },
      { id: 'ai-decision-support', label: 'AI Decision Support', modId: activeDept === 'executive' ? 'exec_ai_decision_support' : 'ops_ai_decision_support', icon: Brain },
      { id: 'strategic-planning', label: 'Strategic Planning', modId: activeDept === 'executive' ? 'exec_strategic_planning' : 'ops_strategic_planning', icon: Compass },
      { id: 'alerts-exceptions', label: 'Alerts & Exceptions', modId: activeDept === 'executive' ? 'exec_alerts_exceptions' : 'ops_alerts_exceptions', icon: AlertCircle },
      { id: 'reports-center', label: 'Reports Center', modId: activeDept === 'executive' ? 'exec_reports_center' : 'ops_reports_center', icon: FileBarChart },
      { id: 'enterprise-data-explorer', label: 'Data Explorer', modId: activeDept === 'executive' ? 'exec_enterprise_data_explorer' : 'ops_enterprise_data_explorer', icon: Database },
      { id: 'configuration', label: 'Configuration', modId: activeDept === 'executive' ? 'exec_configuration' : 'ops_configuration', icon: Settings },
    ];
    subNavConfig.executive = execOpsSubNav;

    // Hotel Operations Portal has its own navigation structure
    const operationsSubNav = [
      { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'ops_executive_dashboard', icon: LayoutDashboard },
      { id: 'command-center', label: 'Operations Command Center', modId: 'ops_command_center', icon: Command },
      { id: 'daily-briefing', label: 'Daily Briefing', modId: 'ops_daily_briefing', icon: FileText },
      { id: 'morning-meeting', label: 'Morning Meeting', modId: 'ops_morning_meeting', icon: Users },
      { id: 'approvals', label: 'Manager Approvals', modId: 'ops_approvals', icon: CheckCircle2 },
      { id: 'cross-department-tasks', label: 'Cross-Department Tasks', modId: 'ops_cross_department_tasks', icon: ArrowRightLeft },
      { id: 'duty-manager', label: 'Duty Manager Workspace', modId: 'ops_duty_manager', icon: Briefcase },
      { id: 'calendar', label: 'Operational Calendar', modId: 'ops_calendar', icon: Calendar },
      { id: 'vip-management', label: 'VIP Guest Management', modId: 'ops_vip_management', icon: Star },
      { id: 'guest-recovery', label: 'Guest Recovery', modId: 'ops_guest_recovery', icon: Heart },
      { id: 'service-quality', label: 'Service Quality', modId: 'ops_service_quality', icon: Award },
      { id: 'room-operations', label: 'Room Operations', modId: 'ops_room_operations', icon: BedDouble },
      { id: 'occupancy-forecast', label: 'Occupancy & Forecast', modId: 'ops_occupancy_forecast', icon: TrendingUp },
      { id: 'event-coordination', label: 'Event & Group Coordination', modId: 'ops_event_coordination', icon: Ticket },
      { id: 'emergency', label: 'Emergency Coordination', modId: 'ops_emergency', icon: Flame },
      { id: 'communication', label: 'Communication Center', modId: 'ops_communication', icon: Megaphone },
      { id: 'escalations', label: 'Escalation Center', modId: 'ops_escalations', icon: AlertTriangle },
      { id: 'sop-compliance', label: 'SOP & Compliance', modId: 'ops_sop_compliance', icon: ListChecks },
      { id: 'executive-checklists', label: 'Executive Checklists', modId: 'ops_executive_checklists', icon: CheckSquare },
      { id: 'flash-reports', label: 'Daily Flash Reports', modId: 'ops_flash_reports', icon: FileBarChart },
      { id: 'reports', label: 'Reports', modId: 'ops_reports', icon: FileCheck },
      { id: 'configuration', label: 'Configuration', modId: 'ops_configuration', icon: Settings },
    ];
    subNavConfig.operations = operationsSubNav;

    // Admin sub-nav from CORE_ADMIN_MODULES
    subNavConfig.admin = CORE_ADMIN_MODULES
      .filter(m => moduleToggles[m.toggleKey] !== false)
      .map(m => ({ id: m.id, label: m.label, modId: m.id }));

    const items = subNavConfig[activeDept] || [];
    return items.filter(item => !item.modId || hasModuleAccess(item.modId));
  }, [activeDept, currentUser, moduleToggles]);

  // Phase 3: activeSubItem is now derived directly from the URL
  const activeSubItem = activeTab;

  // Phase 3: handleSubItemClick navigates to the new URL instead of setting state
  const handleSubItemClick = (id: string) => {
    const dept = DEPARTMENT_BY_KEY[activeDept];
    if (dept) navigate(`/erp/${dept.urlSegment}/${id}`);
  };

  return (
    <div data-route={location.pathname} className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 selection:bg-amber-400 selection:text-slate-900 ${location.pathname === '/public-portal' ? '' : 'flex'}`} id="erp-master-view">
      
      {/* SIDE NAVIGATION - Hidden for public booking, login, and guest pages */}
      {location.pathname !== '/booking' && location.pathname !== '/public-portal' && location.pathname !== '/login' && location.pathname !== '/guest' && location.pathname !== '/guest-portal' && (
        <SideNavigation
          activeDept={activeDept}
          activeDeptLabel={DEPARTMENT_BY_KEY[activeDept]?.label ?? activeDept}
          currentUser={currentUser}
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed(!navCollapsed)}
          subItems={subNavItems}
          activeSubItem={activeSubItem}
          onSubItemClick={handleSubItemClick}
          notifications={notifications}
          unreadNotifCount={getUnreadNotifCount()}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
          onMarkNotificationRead={markNotificationRead}
          onClearNotification={clearNotification}
          accentClass={activeAccentClass}
        />
      )}

      {/* GLOBAL HEADER - Full width, only visible on mouse hover. Hidden for public booking, login, and guest pages */}
      {location.pathname !== '/booking' && location.pathname !== '/public-portal' && location.pathname !== '/login' && location.pathname !== '/guest' && location.pathname !== '/guest-portal' && (
        <>
          {/* Hover trigger zone at top of screen */}
          <div
            className="fixed top-0 left-0 right-0 h-3 z-50"
            onMouseEnter={() => setHeaderVisible(true)}
          />
          <header
            onMouseEnter={() => setHeaderVisible(true)}
            onMouseLeave={() => setHeaderVisible(false)}
            className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-3 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
          >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-extrabold font-sans shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300">S</div>
            <div>
              <span className="font-sans font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block">HOTEL ERP</span>
              <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest leading-none block font-semibold">Live sync operational portal</span>
            </div>
          </div>

          {/* Global info controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer smooth-transition"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-[10px] font-mono font-bold tracking-tight shadow-sm">
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg transition-all duration-200 smooth-transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                USD
              </button>
              <button 
                onClick={() => setCurrency('ETB')}
                className={`px-3 py-1 rounded-lg transition-all duration-200 smooth-transition ${currency === 'ETB' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                ETB
              </button>
            </div>
            
            <div className="text-right text-xs text-slate-600 dark:text-slate-400 font-sans hidden md:block leading-tight">
              <div>Operating Date: <strong className="text-indigo-600 font-mono">{currentSystemDate}</strong></div>
              <div className="text-[11px] text-slate-500 dark:text-slate-500 font-mono">Occ: {stats.occupancyRate}% | Rev: <span className="text-emerald-600">{formatAmount(stats.totalRevenue)}</span></div>
            </div>

            {/* Department Switcher — Phase 4 */}
            {currentUser && location.pathname.startsWith('/erp') && (
              <DepartmentSwitcher
                currentUser={currentUser}
                activeSegment={erpPathMatch?.dept.urlSegment}
                moduleToggles={moduleToggles}
                hasModuleAccess={hasModuleAccess}
              />
            )}

            {/* Property Switcher */}
            {properties.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:block">Property</label>
                <select
                  value={currentPropertyId || ''}
                  onChange={(e) => setCurrentPropertyId(e.target.value || null)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.property_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Logout */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer smooth-transition"
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </header>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* RENDER CHOSEN COMPONENT PORTALS */}
        <Routes>
          <Route 
            path="/login" 
            element={
              !sessionChecked ? (
                <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Verifying secure session...</div>
              ) : (
                <LoginRoute onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/public-portal" element={<PublicPortal />} />
          <Route path="/guest-portal" element={<GuestMobilePortal />} />
          <Route path="/guest" element={<GuestPortal />} />
          <Route 
            path="/pos/login" 
            element={<POSLoginRoute onLoginSuccess={handlePOSLoginSuccess} />}
          />
          <Route 
            path="/pos" 
            element={
              !posUser ? (
                <Navigate to="/pos/login" replace />
              ) : (
                <POSPortal user={posUser} onLogout={handlePOSLogout} />
              )
            }
          />
          {/* Phase 3: nested route-driven ERP navigation */}
          <Route path="/erp" element={
            <ErpLayout
              sessionChecked={sessionChecked}
              currentUser={currentUser}
              mustChangePassword={mustChangePassword}
              onPasswordChanged={() => setMustChangePassword(false)}
            />
          }>
            <Route index element={<ErpIndexRedirect currentUser={currentUser} />} />
            <Route path=":department" element={
              <DepartmentRoute
                currentUser={currentUser}
                moduleToggles={moduleToggles}
                hasModuleAccess={hasModuleAccess}
              />
            } />
            <Route path=":department/:tab" element={
              <DepartmentRoute
                currentUser={currentUser}
                moduleToggles={moduleToggles}
                hasModuleAccess={hasModuleAccess}
              />
            } />
            <Route path="*" element={<ErpIndexRedirect currentUser={currentUser} />} />
          </Route>
          <Route path="/" element={<Navigate to="/public-portal" replace />} />
          {/* Standalone KDS Display — accessible at /kds */}
          <Route
            path="/kds"
            element={
              !sessionChecked ? (
                <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Verifying secure session...</div>
              ) : !currentUser ? (
                <Navigate to="/login?redirect=/kds" replace />
              ) : (
                <div className="min-h-screen bg-slate-950">
                  <KitchenDisplayModule />
                </div>
              )
            }
          />
          {/* KDS Management — accessible at /kds-management */}
          <Route
            path="/kds-management"
            element={
              !sessionChecked ? (
                <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Verifying secure session...</div>
              ) : !currentUser ? (
                <Navigate to="/login?redirect=/kds-management" replace />
              ) : (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                  <KDSInstanceManagement />
                </div>
              )
            }
          />
        </Routes>

        {printGuestForm && (
          <CheckInPrintModal data={printGuestForm} onClose={() => setPrintGuestForm(null)} />
        )}

        {printGroupForm && (
          <GroupCheckInPrintModal data={printGroupForm} onClose={() => setPrintGroupForm(null)} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => console.error('App Error:', error, errorInfo)}>
      <AppProviders>
        <MasterHotelERP />
      </AppProviders>
    </ErrorBoundary>
  );
}

