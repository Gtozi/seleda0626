/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useERP } from './context/ERPContext';
import { AppProviders } from './context/AppProviders';
import FrontDeskPortal from './components/FrontDesk/FrontDeskPortal';
import BookingPage from './components/BookingPage';
import LoginPage from './components/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import AccountSettingsModule from './components/Settings/AccountSettingsModule';
import CheckInPrintModal from './components/FrontDesk/CheckInPrintModal';
import GroupCheckInPrintModal from './components/FrontDesk/GroupCheckInPrintModal';
import HousekeepingPortal, { type HKTab } from './components/Housekeeping/HousekeepingPortal';
import FoodBeveragePortal from './components/FoodBeverage/FoodBeveragePortal';
import EngineeringPortal from './components/Engineering/EngineeringPortal';
import InventoryPortal from './components/Inventory/InventoryPortal';
import FinancePortal from './components/Finance/FinancePortal';
import HumanResourcesPortal from './components/HumanResources/HumanResourcesPortal';
import AdminPortal from './components/Admin/AdminPortal';
import UnifiedPortal from './components/Admin/UnifiedPortal';
import { CORE_ADMIN_MODULES } from './components/Admin/adminModules';
import ProcurementPortal from './components/Procurement/ProcurementPortal';
import SalesPortal from './components/Sales/SalesPortal';
import GuestMobilePortal from './components/GuestMobilePortal';
import POSPortal from './components/POS/POSPortal';
import POSLoginPage from './components/POS/POSLoginPage';
import KitchenDisplayModule from './components/FoodBeverage/KitchenDisplayModule';
import KDSInstanceManagement from './components/FoodBeverage/KDSInstanceManagement';
import { User } from './types/erp';
import { supabase } from './lib/supabase';
import { logout, verifySession } from './lib/auth';
import { canAccessTab } from './lib/permissions';
import {
  Bell,
  LogOut,
  Users,
  Calendar,
  Coins,
  Activity,
  X,
  Sparkles,
  ShieldAlert,
  Lock,
  Settings,
  Moon,
  Sun,
  Package,
  LayoutDashboard,
  FileBarChart,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { changePassword } from './lib/auth';

function POSLoginRoute({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  return <POSLoginPage onLoginSuccess={onLoginSuccess} />;
}

function LoginRoute({ onLoginSuccess }: { onLoginSuccess: (user: User, forcePasswordChange?: boolean) => void }) {
  return <LoginPage onLoginSuccess={onLoginSuccess} />;
}

function ForcedPasswordChangeScreen({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await changePassword('', newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to change password');
      return;
    }

    onSuccess();
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-[calc(100vh-57px)]">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Password Change Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome, {user.name}. You must set a new password before continuing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-2.5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters with mixed case, digits, and special chars"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Changing...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
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

  // ERP Sidebar/Page department selector (First front office completes requested screens)
  const [activeDept, setActiveDept] = useState<'frontoffice' | 'housekeeping' | 'f&b' | 'maintenance' | 'inventory' | 'finance' | 'hr' | 'executive' | 'admin' | 'procurement' | 'operations' | 'sales' | 'settings'>('frontoffice');

  // Auto-hide top nav — hidden by default, revealed on mouse hover at top of screen
  const [navVisible, setNavVisible] = useState(false);

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
        // Set initial department based on user's allowed access
        const initialDept = user.allowedTabs && user.allowedTabs.length > 0 
          ? user.allowedTabs[0] 
          : 'frontoffice';
        setActiveDept(initialDept);
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
    
    // Set initial department based on user's allowed access
    // Default to first allowed tab, or frontoffice if not specified
    const initialDept = user.allowedTabs && user.allowedTabs.length > 0 
      ? user.allowedTabs[0] 
      : 'frontoffice';
    setActiveDept(initialDept);
    
    // Navigate to ERP after successful login
    navigate('/erp');

    // Re-fetch all ERP data now that the user is authenticated.
    // Sub-contexts fired their initial refreshData() on mount while
    // unauthenticated, so those calls returned 401 and left state empty.
    refreshAllData();
  };

  const handleDeptChange = (dept: typeof activeDept) => {
    // 'settings' is handled separately as a modal, not a department
    // Check if user has access to the requested department
    if (!canAccessTab(currentUser, dept)) {
      console.warn(`Access denied: User does not have permission to access ${dept}`);
      return;
    }
    setActiveDept(dept);
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

  // Department sub-screen toggles
  const [hkDir, setHkDir] = useState<HKTab>('dashboard');
  const [fbDir, setFbDir] = useState('executive-dashboard');
  const [engDir, setEngDir] = useState('dashboard');
  const [invDir, setInvDir] = useState('dashboard');
  const [finDir, setFinDir] = useState('dashboard');
  const [hrDir, setHrDir] = useState('dashboard');
  const [adminDir, setAdminDir] = useState('user_security');
  const [procDir, setProcDir] = useState('dashboard');
  const [frontDir, setFrontDir] = useState<'dashboard' | 'reservations' | 'folio' | 'crm' | 'reports' | 'giftshop' | 'inventory' | 'standard-reports'>('dashboard');

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

  // Sub-module ID mappings per department (subNavId → module_access key)
  const deptSubModuleMap: Record<string, Record<string, string>> = {
    frontoffice: { 'dashboard': 'fo_dashboard', 'reservations': 'fo_reservations', 'folio': 'fo_folio', 'crm': 'fo_crm', 'reports': 'fo_reports', 'inventory': 'fo_inventory', 'standard-reports': 'fo_standard_reports' },
    housekeeping: { 'dashboard': 'hk_dashboard', 'rooms': 'hk_rooms', 'tasks': 'hk_tasks', 'laundry': 'hk_laundry', 'inventory': 'hk_inventory', 'amenities': 'hk_amenities', 'lostfound': 'hk_lostfound', 'staff': 'hk_staff', 'reports': 'hk_reports', 'standard-reports': 'hk_standard_reports' },
    'f&b': { 'executive-dashboard': 'fb_executive_dashboard', 'outlet-management': 'fb_outlet_management', 'menu-catalog': 'fb_menu_catalog', 'recipe-production': 'fb_recipe_production', 'inventory-cost': 'fb_inventory_cost', 'beverage-management': 'fb_beverage_management', 'purchasing-suppliers': 'fb_purchasing_suppliers', 'banquet-catering': 'fb_banquet_catering', 'room-service': 'fb_room_service', 'guest-crm': 'fb_guest_crm', 'promotions-pricing': 'fb_promotions_pricing', 'financial-control': 'fb_financial_control', 'operations-compliance': 'fb_operations_compliance', 'reporting-bi': 'fb_reporting_bi', 'integrations': 'fb_integrations' },
    maintenance: { 'dashboard': 'eng_dashboard', 'workorders': 'eng_workorders', 'pm': 'eng_pm', 'assets': 'eng_assets', 'rooms': 'eng_rooms', 'utilities': 'eng_utilities', 'inventory': 'eng_inventory', 'staff': 'eng_staff', 'compliance': 'eng_compliance', 'reports': 'eng_reports', 'standard-reports': 'eng_standard_reports' },
    inventory: { 'dashboard': 'inv_dashboard', 'items': 'inv_items', 'stores': 'inv_stores', 'requisitions': 'inv_requisitions', 'receiving': 'inv_receiving', 'count': 'inv_count', 'suppliers': 'inv_suppliers', 'standard-reports': 'inv_standard_reports', 'reports': 'inv_reports' },
    finance: { 'dashboard': 'fin_dashboard', 'gl': 'fin_gl', 'sales': 'fin_sales', 'ap': 'fin_ap', 'ar': 'fin_ar', 'bank_recon': 'fin_bank_recon', 'reports': 'fin_reports', 'trial_balance': 'fin_trial_balance', 'financial_statements': 'fin_statements', 'budget': 'fin_budget', 'tax_compliance': 'fin_tax', 'erca_vat': 'fin_erca_vat', 'standard-reports': 'fin_standard_reports', 'period_close': 'fin_period_close', 'assets': 'fin_assets' },
    hr: { 'dashboard': 'hr_dashboard', 'employees': 'hr_employees', 'attendance': 'hr_attendance', 'payroll': 'hr_payroll', 'leave': 'hr_leave', 'performance': 'hr_performance', 'training': 'hr_training', 'recruitment': 'hr_recruitment', 'reports': 'hr_reports', 'standard-reports': 'hr_standard_reports' },
    procurement: { 'dashboard': 'proc_dashboard', 'requisitions': 'proc_requisitions', 'orders': 'proc_orders', 'suppliers': 'proc_suppliers', 'rfq': 'proc_rfq', 'receiving': 'proc_receiving', 'contracts': 'proc_contracts', 'budget': 'proc_budget', 'invoices': 'proc_invoices', 'approvals': 'proc_approvals', 'reports': 'proc_reports', 'standard-reports': 'proc_standard_reports' },
  };

  // Reset sub-dir if current sub-tab is not accessible per moduleAccess
  React.useEffect(() => {
    if (!currentUser?.moduleAccess || Object.keys(currentUser.moduleAccess).length === 0) return;
    const subMap = deptSubModuleMap[activeDept];
    if (!subMap) return;
    const dirSetters: Record<string, [string, (v: any) => void]> = {
      frontoffice: [frontDir, setFrontDir],
      housekeeping: [hkDir, setHkDir],
      'f&b': [fbDir, setFbDir],
      maintenance: [engDir, setEngDir],
      inventory: [invDir, setInvDir],
      finance: [finDir, setFinDir],
      hr: [hrDir, setHrDir],
      procurement: [procDir, setProcDir],
    };
    const entry = dirSetters[activeDept];
    if (!entry) return;
    const [currentDir, setter] = entry;
    const modId = subMap[currentDir];
    if (modId && !hasModuleAccess(modId)) {
      const firstAccessible = Object.entries(subMap).find(([, mid]) => hasModuleAccess(mid));
      if (firstAccessible) setter(firstAccessible[0] as any);
    }
  }, [currentUser, activeDept]);

  // Platform controls: a department portal can be disabled web-app-wide from
  // System Admin > Platform Controls. Admin and account settings are never gated.
  const moduleToggles = globalHotelSettings.moduleToggles || {};

  // Auto-switch admin tab if the currently selected module is toggled off
  React.useEffect(() => {
    if (activeDept !== 'admin') return;
    const visibleAdminModules = CORE_ADMIN_MODULES.filter(m => moduleToggles[m.toggleKey] !== false);
    if (visibleAdminModules.length === 0) return;
    const currentVisible = visibleAdminModules.some(m => m.id === adminDir);
    if (!currentVisible) {
      setAdminDir(visibleAdminModules[0].id);
    }
  }, [activeDept, moduleToggles, adminDir]);

  const isModuleDisabled =
    activeDept !== 'admin' &&
    activeDept !== 'settings' &&
    moduleToggles[activeDept] === false;

  return (
    <div data-route={location.pathname} className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 selection:bg-amber-400 selection:text-slate-900" id="erp-master-view">
      
      {/* GLOBAL MASTER HEADER (Allows switching between Platform Views dynamically!) - Hidden for public booking page */}
      {location.pathname !== '/booking' && (
      <>
        {/* Hover zone — invisible strip at top of screen to reveal nav */}
        <div
          className="fixed top-0 left-0 right-0 h-3 z-40"
          onMouseEnter={() => setNavVisible(true)}
        />
        <nav
          onMouseEnter={() => setNavVisible(true)}
          onMouseLeave={() => setNavVisible(false)}
          className={`bg-white/95 backdrop-blur-xl border-b border-slate-200 text-slate-900 py-3 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fixed top-0 left-0 right-0 z-30 shadow-lg transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-extrabold font-sans shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300">S</div>
          <div>
            <span className="font-sans font-extrabold text-sm tracking-tight text-slate-900 block">HOTEL ERP</span>
            <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest leading-none block font-semibold">Live sync operational portal</span>
          </div>
        </div>


        {/* Global info controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 cursor-pointer smooth-transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-[10px] font-mono font-bold tracking-tight shadow-sm">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg transition-all duration-200 smooth-transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              USD
            </button>
            <button 
              onClick={() => setCurrency('ETB')}
              className={`px-3 py-1 rounded-lg transition-all duration-200 smooth-transition ${currency === 'ETB' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              ETB
            </button>
          </div>
          
          <div className="text-right text-xs text-slate-600 font-sans hidden md:block leading-tight">
            <div>Operating Date: <strong className="text-indigo-600 font-mono">{currentSystemDate}</strong></div>
            <div className="text-[11px] text-slate-500 font-mono">Occ: {stats.occupancyRate}% | Rev: <span className="text-emerald-600">{formatAmount(stats.totalRevenue)}</span></div>
          </div>

          {/* Property Switcher */}
          {properties.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hidden sm:block">Property</label>
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

          {/* User credentials & Logout */}
          {currentUser && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2 text-xs">
                <button 
                  onClick={() => handleDeptChange('settings')}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs relative border transition transition-all cursor-pointer ${
                    activeDept === 'settings' 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  }`}
                  title="Account Settings"
                >
                  {currentUser.avatarInitials}
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-slate-950 rounded-full"></span>
                </button>
                <div className="hidden lg:block text-left">
                  <span className="text-slate-900 font-semibold block leading-tight text-[11px]">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block leading-none font-semibold">{currentUser.roleDescription || currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-700 transition-all cursor-pointer smooth-transition"
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </nav>
      </>
      )}

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
        <Route path="/guest-portal" element={<GuestMobilePortal />} />
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
        <Route 
          path="/erp/*" 
          element={
            !sessionChecked ? (
              <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Verifying secure session...</div>
            ) : !currentUser ? (
              <Navigate to="/login" replace />
            ) : mustChangePassword ? (
              <ForcedPasswordChangeScreen 
                user={currentUser} 
                onSuccess={() => {
                  setMustChangePassword(false);
                  const initialDept = currentUser.allowedTabs && currentUser.allowedTabs.length > 0 
                    ? currentUser.allowedTabs[0] 
                    : 'frontoffice';
                  setActiveDept(initialDept);
                  navigate('/erp');
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden lg:h-[calc(100vh-57px)]">
                {/* MAIN OFFICE INTERFACE SCROLLABLE GRID */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 smooth-transition">
                {/* Active Department Title Bar */}
                <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs w-full transition-colors duration-300 smooth-transition">
                  <div>
                    <h2 className="text-base font-sans font-extrabold text-slate-900 dark:text-white leading-tight">
                      {activeDept === 'frontoffice' && 'Front Office'}
                      {activeDept === 'housekeeping' && 'Housekeeping'}
                      {activeDept === 'f&b' && 'Food & Beverage'}
                      {activeDept === 'maintenance' && 'Engineering'}
                      {activeDept === 'sales' && 'Sales'}
                      {activeDept === 'executive' && 'Executive & Operations'}
                      {activeDept === 'admin' && 'Admin'}
                      {activeDept === 'inventory' && 'Inventory'}
                      {activeDept === 'finance' && 'Finance'}
                      {activeDept === 'hr' && 'Human Resources'}
                      {activeDept === 'procurement' && 'Procurement'}
                      {activeDept === 'operations' && 'Operations & Executive'}
                      {activeDept === 'settings' && 'Account Settings'}
                    </h2>
                    <div className="text-slate-500 text-[10px] flex items-center gap-1 font-mono uppercase tracking-wider">
                      <span>Gheralta</span> / <span className="text-indigo-600 font-bold">{activeDept}</span>
                    </div>
                  </div>

                  {/* Front Office sub-navigation triggers */}
                  {activeDept === 'frontoffice' && (
                    <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl self-center text-xs font-sans font-medium select-none gap-1 transition-colors duration-300 card-shadow" id="front-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, modId: 'fo_dashboard' },
                        { id: 'reservations', label: 'Reservations', icon: Calendar, modId: 'fo_reservations' },
                        { id: 'folio', label: 'Folio', icon: Coins, modId: 'fo_folio' },
                        { id: 'crm', label: 'CRM Board', icon: Users, modId: 'fo_crm' },
                        { id: 'reports', label: 'Reports & Audit', icon: FileBarChart, modId: 'fo_reports' },
                        { id: 'inventory', label: 'Office Inventory', icon: Package, modId: 'fo_inventory' },
                        { id: 'standard-reports', label: 'Standard Reports', icon: FileBarChart, modId: 'fo_standard_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setFrontDir(tab.id as typeof frontDir)}
                            className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition flex items-center gap-1.5 ${
                              frontDir === tab.id
                                ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 text-[11px]'
                            }`}
                          >
                            <Icon size={13} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Housekeeping sub-navigation triggers */}
                  {activeDept === 'housekeeping' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="hk-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Command Center', modId: 'hk_dashboard' },
                        { id: 'rooms', label: 'Room Board', modId: 'hk_rooms' },
                        { id: 'tasks', label: 'Task Management', modId: 'hk_tasks' },
                        { id: 'laundry', label: 'Laundry & Valet', modId: 'hk_laundry' },
                        { id: 'inventory', label: 'Supplies & Linen', modId: 'hk_inventory' },
                        { id: 'amenities', label: 'Guest Amenities', modId: 'hk_amenities' },
                        { id: 'lostfound', label: 'Lost & Found', modId: 'hk_lostfound' },
                        { id: 'staff', label: 'Team', modId: 'hk_staff' },
                        { id: 'reports', label: 'Intelligence', modId: 'hk_reports' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'hk_standard_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setHkDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* F&B sub-navigation triggers */}
                  {activeDept === 'f&b' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="fb-sub-menu">
                      {([
                        { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'fb_executive_dashboard' },
                        { id: 'outlet-management', label: 'Outlets', modId: 'fb_outlet_management' },
                        { id: 'menu-catalog', label: 'Menu & Catalog', modId: 'fb_menu_catalog' },
                        { id: 'recipe-production', label: 'Recipe & Production', modId: 'fb_recipe_production' },
                        { id: 'inventory-cost', label: 'Inventory & Cost', modId: 'fb_inventory_cost' },
                        { id: 'beverage-management', label: 'Beverage', modId: 'fb_beverage_management' },
                        { id: 'purchasing-suppliers', label: 'Purchasing', modId: 'fb_purchasing_suppliers' },
                        { id: 'banquet-catering', label: 'Banquets', modId: 'fb_banquet_catering' },
                        { id: 'room-service', label: 'Room Service', modId: 'fb_room_service' },
                        { id: 'guest-crm', label: 'Guest CRM', modId: 'fb_guest_crm' },
                        { id: 'promotions-pricing', label: 'Promotions', modId: 'fb_promotions_pricing' },
                        { id: 'financial-control', label: 'Financial Control', modId: 'fb_financial_control' },
                        { id: 'operations-compliance', label: 'Operations', modId: 'fb_operations_compliance' },
                        { id: 'reporting-bi', label: 'Reporting & BI', modId: 'fb_reporting_bi' },
                        { id: 'integrations', label: 'Integrations', modId: 'fb_integrations' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setFbDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* Engineering sub-navigation triggers */}
                  {activeDept === 'maintenance' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="eng-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Dashboard', modId: 'eng_dashboard' },
                        { id: 'workorders', label: 'Work Orders', modId: 'eng_workorders' },
                        { id: 'pm', label: 'Preventive Main.', modId: 'eng_pm' },
                        { id: 'assets', label: 'Asset Register', modId: 'eng_assets' },
                        { id: 'rooms', label: 'Guest Rooms', modId: 'eng_rooms' },
                        { id: 'utilities', label: 'Utilities & Plant', modId: 'eng_utilities' },
                        { id: 'inventory', label: 'Spare Parts & Tools', modId: 'eng_inventory' },
                        { id: 'staff', label: 'Technicians', modId: 'eng_staff' },
                        { id: 'compliance', label: 'Safety & Compliance', modId: 'eng_compliance' },
                        { id: 'reports', label: 'Reports', modId: 'eng_reports' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'eng_standard_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setEngDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* Inventory sub-navigation triggers */}
                  {activeDept === 'inventory' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="inv-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Dashboard', modId: 'inv_dashboard' },
                        { id: 'items', label: 'Item Master', modId: 'inv_items' },
                        { id: 'stores', label: 'Stores & Transfers', modId: 'inv_stores' },
                        { id: 'requisitions', label: 'Requisitions', modId: 'inv_requisitions' },
                        { id: 'receiving', label: 'Goods Receiving', modId: 'inv_receiving' },
                        { id: 'count', label: 'Stock Counting', modId: 'inv_count' },
                        { id: 'suppliers', label: 'Suppliers', modId: 'inv_suppliers' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'inv_standard_reports' },
                        { id: 'reports', label: 'Reports', modId: 'inv_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setInvDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* Finance sub-navigation triggers */}
                  {activeDept === 'finance' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="fin-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Dashboard', modId: 'fin_dashboard' },
                        { id: 'gl', label: 'General Ledger', modId: 'fin_gl' },
                        { id: 'sales', label: 'Sales Detail', modId: 'fin_sales' },
                        { id: 'ap', label: 'Accounts Payable', modId: 'fin_ap' },
                        { id: 'ar', label: 'Accounts Receivable', modId: 'fin_ar' },
                        { id: 'bank_recon', label: 'Bank Reconciliation', modId: 'fin_bank_recon' },
                        { id: 'reports', label: 'Financial Reports', modId: 'fin_reports' },
                        { id: 'trial_balance', label: 'Trial Balance', modId: 'fin_trial_balance' },
                        { id: 'financial_statements', label: 'Financial Statements', modId: 'fin_statements' },
                        { id: 'budget', label: 'Budget vs Actual', modId: 'fin_budget' },
                        { id: 'tax_compliance', label: 'Tax Compliance', modId: 'fin_tax' },
                        { id: 'erca_vat', label: 'ERCA VAT Export', modId: 'fin_erca_vat' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'fin_standard_reports' },
                        { id: 'period_close', label: 'Period Close', modId: 'fin_period_close' },
                        { id: 'assets', label: 'Fixed Assets', modId: 'fin_assets' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setFinDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* HR sub-navigation triggers */}
                  {activeDept === 'hr' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="hr-sub-menu">
                      {([
                        { id: 'dashboard', label: 'HR Analytics', modId: 'hr_dashboard' },
                        { id: 'employees', label: 'Employee Master', modId: 'hr_employees' },
                        { id: 'attendance', label: 'Attendance & Roster', modId: 'hr_attendance' },
                        { id: 'payroll', label: 'Payroll Management', modId: 'hr_payroll' },
                        { id: 'leave', label: 'Leave & Absences', modId: 'hr_leave' },
                        { id: 'performance', label: 'Performance (KPIs)', modId: 'hr_performance' },
                        { id: 'training', label: 'Learning & Dev', modId: 'hr_training' },
                        { id: 'recruitment', label: 'Recruitment Flow', modId: 'hr_recruitment' },
                        { id: 'reports', label: 'Reports', modId: 'hr_reports' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'hr_standard_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setHrDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* Admin sub-navigation triggers */}
                  {activeDept === 'admin' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="admin-sub-menu">
                      {CORE_ADMIN_MODULES.filter(m => moduleToggles[m.toggleKey] !== false).map(m => (
                        <button
                          key={m.id}
                          onClick={() => setAdminDir(m.id)}
                          className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${adminDir === m.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Procurement sub-navigation triggers */}
                  {activeDept === 'procurement' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="proc-sub-menu">
                      {([
                        { id: 'dashboard', label: 'Procurement Dashboard', modId: 'proc_dashboard' },
                        { id: 'requisitions', label: 'Requisitions', modId: 'proc_requisitions' },
                        { id: 'orders', label: 'Purchase Orders', modId: 'proc_orders' },
                        { id: 'suppliers', label: 'Suppliers', modId: 'proc_suppliers' },
                        { id: 'rfq', label: 'RFQ Management', modId: 'proc_rfq' },
                        { id: 'receiving', label: 'Goods Receiving', modId: 'proc_receiving' },
                        { id: 'contracts', label: 'Contracts', modId: 'proc_contracts' },
                        { id: 'budget', label: 'Budget Control', modId: 'proc_budget' },
                        { id: 'invoices', label: 'Supplier Invoices', modId: 'proc_invoices' },
                        { id: 'approvals', label: 'Approval Center', modId: 'proc_approvals' },
                        { id: 'reports', label: 'Reports', modId: 'proc_reports' },
                        { id: 'standard-reports', label: 'Standard Reports', modId: 'proc_standard_reports' },
                      ] as const).filter((tab) => hasModuleAccess(tab.modId)).map((tab) => (
                        <button key={tab.id} onClick={() => setProcDir(tab.id as any)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{tab.label}</button>
                      ))}
                    </div>
                  )}

                  {/* Floating Alert widget */}
                  <div className="flex gap-2 items-center self-end sm:self-center relative">
                    <button
                      id="notif-bell-toggle-btn"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center justify-center text-slate-600 gap-1.5 relative cursor-pointer"
                    >
                      <Bell size={13} className={getUnreadNotifCount() > 0 ? 'animate-bounce text-amber-500' : ''} />
                      <span className="text-3xs font-mono font-bold uppercase tracking-wider">Operational Alerts</span>
                      {getUnreadNotifCount() > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-sans font-bold text-[9px]">
                          {getUnreadNotifCount()}
                        </span>
                      )}
                    </button>

                    {/* Notifications overlay block */}
                    {showNotifications && (
                      <div className="absolute top-11 right-0 bg-white border border-slate-100 shadow-xl rounded-2xl w-80 z-40 p-4 space-y-3 animate-slide-in text-slate-600" id="alerts-ledger-panel">
                        <div className="flex justify-between items-center border-b border-b-slate-100 pb-1.5 text-xs text-slate-800 font-bold">
                          <span>Real-time Alerts Queue ({getUnreadNotifCount()})</span>
                          <button 
                            onClick={() => setShowNotifications(false)}
                            className="p-0.5 hover:bg-slate-55 rounded text-slate-400"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-2xs font-mono text-slate-400 font-bold">
                              All department task alerts resolved. Queue empty.
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                onClick={() => markNotificationRead(n.id)}
                                className={`p-2.5 border rounded-lg transition text-3xs flex flex-col justify-between space-y-1 hover:border-slate-350 cursor-pointer ${
                                  !n.read ? 'bg-indigo-50/20 border-indigo-200 text-indigo-950 font-semibold' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className={`px-1 rounded text-4xs font-mono font-bold uppercase ${
                                    n.department === 'Housekeeping' ? 'bg-emerald-100 text-emerald-800' :
                                    n.department === 'F&B' ? 'bg-amber-100 text-amber-800' :
                                    n.department === 'Maintenance' ? 'bg-rose-100 text-rose-800' :
                                    'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {n.department}
                                  </span>
                                  <span className="text-slate-400 text-4xs font-mono">
                                    {new Date(n.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="leading-tight">{n.message}</p>
                                <div className="flex justify-end gap-1.5 pt-1 text-4xs font-mono">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(n.id);
                                    }}
                                    className="text-rose-500 hover:underline"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </header>


                {/* Render targeted department portal screen content */}
                <div className="p-6 flex-1 min-h-0">

                  {globalHotelSettings.maintenanceMode && (
                    <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                      <ShieldAlert size={18} className="shrink-0 text-amber-500" />
                      <p className="text-xs font-bold leading-relaxed">
                        {globalHotelSettings.maintenanceMessage || 'The system is undergoing scheduled maintenance. Some features may be temporarily unavailable.'}
                      </p>
                    </div>
                  )}

                  {isModuleDisabled ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Lock size={28} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white tracking-tight">Module Unavailable</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-sm">This department portal has been disabled by an administrator via Platform Controls. Please contact System Administration for access.</p>
                    </div>
                  ) : (
                  <>
                  {activeDept === 'frontoffice' && (
                    <FrontDeskPortal
                      currentUser={currentUser}
                      onPrintGuest={(data) => setPrintGuestForm(data)}
                      onPrintGroup={(data) => setPrintGroupForm(data)}
                      activeTab={frontDir}
                      onTabChange={setFrontDir}
                    />
                  )}

                  {/* HOUSEKEEPING PORTAL */}
                  {activeDept === 'housekeeping' && (
                    <HousekeepingPortal activeTab={hkDir} />
                  )}

                  {/* FOOD & BEVERAGE COMPORT */}
                  {activeDept === 'f&b' && (
                    <FoodBeveragePortal activeTab={fbDir} />
                  )}

                  {/* ENGINEERING & MAINTENANCE PORTAL */}
                  {activeDept === 'maintenance' && (
                    <EngineeringPortal activeTab={engDir} />
                  )}

                  {/* SALES & EVENTS PORTAL */}
                  {activeDept === 'sales' && (
                    <SalesPortal activeTab={'pipeline'} />
                  )}

                  {/* INVENTORY & WAREHOUSE PORTAL */}
                  {activeDept === 'inventory' && (
                    <InventoryPortal activeTab={invDir} />
                  )}

                  {/* FINANCE & ACCOUNTING PORTAL */}
                  {activeDept === 'finance' && (
                    <FinancePortal activeModule={finDir} />
                  )}

                  {/* HUMAN RESOURCES & WORKFORCE PORTAL */}
                  {activeDept === 'hr' && (
                    <HumanResourcesPortal activeModule={hrDir} />
                  )}

                  {/* UNIFIED EXECUTIVE & OPERATIONS PORTAL */}
                  {activeDept === 'executive' && (
                    <UnifiedPortal initialMode="executive" />
                  )}

                  {/* SYSTEM ADMINISTRATION & GOVERNANCE PORTAL */}
                  {activeDept === 'admin' && (
                    <AdminPortal activeModule={adminDir} />
                  )}

                  {/* PROCUREMENT & STRATEGIC SOURCING PORTAL */}
                  {activeDept === 'procurement' && (
                    <ProcurementPortal activeModule={procDir} />
                  )}

                  {/* OPERATIONS — now merged into Unified Portal */}
                  {activeDept === 'operations' && (
                    <UnifiedPortal initialMode="operations" />
                  )}

                  {/* ACCOUNT SETTINGS */}
                  {activeDept === 'settings' && (
                    <AccountSettingsModule />
                  )}
                  </>
                  )}

                </div>
              </main>
            </div>
            )
          }
        />
        <Route path="/" element={<Navigate to="/booking" replace />} />
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

