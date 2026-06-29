/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ERPProvider, useERP } from './context/ERPContext';
import { GuestProvider } from './context/GuestContext';
import { GroupProvider } from './context/GroupContext';
import FrontDeskPortal from './components/FrontDesk/FrontDeskPortal';
import BookingPage from './components/BookingPage';
import LoginPage from './components/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import AccountSettingsModule from './components/Settings/AccountSettingsModule';
import CheckInPrintModal from './components/FrontDesk/CheckInPrintModal';
import GroupCheckInPrintModal from './components/FrontDesk/GroupCheckInPrintModal';
import HousekeepingPortal from './components/Housekeeping/HousekeepingPortal';
import FoodBeveragePortal from './components/FoodBeverage/FoodBeveragePortal';
import EngineeringPortal from './components/Engineering/EngineeringPortal';
import InventoryPortal from './components/Inventory/InventoryPortal';
import FinancePortal from './components/Finance/FinancePortal';
import HumanResourcesPortal from './components/HumanResources/HumanResourcesPortal';
import ExecutivePortal from './components/Executive/ExecutivePortal';
import SystemAdminPortal from './components/Executive/SystemAdminPortal';
import AdminPortal from './components/Admin/AdminPortal';
import { CORE_ADMIN_MODULES } from './components/Admin/adminModules';
import ProcurementPortal from './components/Procurement/ProcurementPortal';
import { User } from './types/erp';
import { logout, verifySession } from './lib/auth';
import { canAccessTab } from './lib/permissions';
import {
  Map,
  Plus,
  Bell,
  LogOut,
  Users,
  Menu,
  Calendar,
  Coins,
  Activity,
  X,
  Sparkles,
  CheckCircle,
  ShieldAlert,
  Shield,
  Lock,
  Settings,
  VolumeX,
  Play,
  Volume2,
  Moon,
  Sun,
  Package,
  ShoppingCart
} from 'lucide-react';

function LoginRoute({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  return <LoginPage onLoginSuccess={onLoginSuccess} />;
}

function MasterHotelERP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    rooms,
    setRoomStatus,
    notifications, 
    markNotificationRead, 
    clearNotification, 
    currentSystemDate, 
    simulationActive, 
    setSimulationActive,
    triggerLiveSyncSimulation,
    stats,
    guests,
    currency,
    setCurrency,
    formatAmount,
    theme,
    toggleTheme,
    globalHotelSettings
  } = useERP();

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ERP Sidebar/Page department selector (First front office completes requested screens)
  const [activeDept, setActiveDept] = useState<'frontoffice' | 'housekeeping' | 'f&b' | 'maintenance' | 'inventory' | 'finance' | 'hr' | 'executive' | 'admin' | 'procurement' | 'settings'>('frontoffice');

  const { systemUsers, syncUserProfile } = useERP();

  React.useEffect(() => {
    let active = true;
    verifySession().then(user => {
      if (!active) return;
      if (user) {
        setCurrentUser(user);
        // Sync userProfile with actual authentication data
        syncUserProfile({
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatarInitials,
          lastLogin: new Date().toISOString()
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
        if (JSON.stringify(liveUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(liveUser);
        }
      }
    }
  }, [systemUsers, currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    
    // Set initial department based on user's allowed access
    // Default to first allowed tab, or frontoffice if not specified
    const initialDept = user.allowedTabs && user.allowedTabs.length > 0 
      ? user.allowedTabs[0] 
      : 'frontoffice';
    setActiveDept(initialDept);
    
    // Navigate to ERP after successful login
    navigate('/erp');
  };

  const handleDeptChange = (dept: typeof activeDept) => {
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

  // Department sub-screen toggles
  const [hkDir, setHkDir] = useState('dashboard');
  const [fbDir, setFbDir] = useState('dashboard');
  const [engDir, setEngDir] = useState('dashboard');
  const [invDir, setInvDir] = useState('dashboard');
  const [finDir, setFinDir] = useState('dashboard');
  const [hrDir, setHrDir] = useState('dashboard');
  const [execDir, setExecDir] = useState('dashboard');
  const [adminDir, setAdminDir] = useState('user_security');
  const [procDir, setProcDir] = useState('dashboard');

  // Notification panel toggle on ERP
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Check In Print Modal
  const [printGuestForm, setPrintGuestForm] = useState<{guestName: string, guestEmail: string, guestPhone: string, reservationId: string, roomNumber: string, checkInDate: string} | null>(null);
  const [printGroupForm, setPrintGroupForm] = useState<{groupName: string, contactName: string, contactEmail: string, contactPhone: string, groupId: string, roomCount: number, checkInDate: string} | null>(null);

  const getUnreadNotifCount = () => notifications.filter(n => !n.read).length;

  const fbOutlets = (globalHotelSettings.posOutlets || []).filter(o =>
    !o.toLowerCase().includes('gift') &&
    !o.toLowerCase().includes('boutique') &&
    !o.toLowerCase().includes('spa') &&
    !o.toLowerCase().includes('reception')
  );

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
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 text-slate-900 py-3 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-30 shadow-lg">
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
        <Route 
          path="/erp/*" 
          element={
            !sessionChecked ? (
              <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Verifying secure session...</div>
            ) : !currentUser ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden lg:h-[calc(100vh-57px)]">
                {/* Top Department & Utility Bar (Horizontal replacement for sidebar) */}

                {/* MAIN OFFICE INTERFACE SCROLLABLE GRID */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 smooth-transition">
                {/* Active Department Title Bar */}
                <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs w-full transition-colors duration-300 smooth-transition">
                  <div>
                    <h2 className="text-base font-sans font-extrabold text-slate-900 dark:text-white leading-tight">
                      {activeDept === 'frontoffice' && 'Front Office Operations Desk'}
                      {activeDept === 'housekeeping' && 'Housekeeping Matrix Management'}
                      {activeDept === 'f&b' && 'Food & Beverage Orders Sync'}
                      {activeDept === 'maintenance' && 'Maintenance & Engineering Repair Lines'}
                      {activeDept === 'executive' && 'Executive Business Office'}
                      {activeDept === 'admin' && 'System Administration & Governance'}
                      {activeDept === 'inventory' && 'Inventory Control & Supply Chain'}
                      {activeDept === 'finance' && 'Enterprise Financial Audit & Ledger Sync'}
                      {activeDept === 'hr' && 'Human Capital Management & Workforce Flow'}
                      {activeDept === 'procurement' && 'Strategic Sourcing & Procurement Control'}
                      {activeDept === 'settings' && 'Administrator Global Account Settings'}
                    </h2>
                    <div className="text-slate-500 text-[10px] flex items-center gap-1 font-mono uppercase tracking-wider">
                      <span>Grand Hotel</span> / <span className="text-indigo-600 font-bold">{activeDept}</span>
                    </div>
                  </div>

                  {/* Housekeeping sub-navigation triggers */}
                  {activeDept === 'housekeeping' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="hk-sub-menu">
                      <button onClick={() => setHkDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Command Center</button>
                      <button onClick={() => setHkDir('rooms')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'rooms' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Room Board</button>
                      <button onClick={() => setHkDir('tasks')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'tasks' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Task Management</button>
                      <button onClick={() => setHkDir('laundry')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'laundry' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Laundry & Valet</button>
                      <button onClick={() => setHkDir('inventory')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'inventory' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Supplies & Linen</button>
                      <button onClick={() => setHkDir('amenities')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'amenities' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Guest Amenities</button>
                      <button onClick={() => setHkDir('lostfound')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'lostfound' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Lost & Found</button>
                      <button onClick={() => setHkDir('staff')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'staff' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Team</button>
                      <button onClick={() => setHkDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hkDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Intelligence</button>
                    </div>
                  )}

                  {/* F&B sub-navigation triggers */}
                  {activeDept === 'f&b' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="fb-sub-menu">
                      <button onClick={() => setFbDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Dashboard</button>
                      {fbOutlets.map(outlet => (
                        <button key={`pos_${outlet}`} onClick={() => setFbDir(`pos_${outlet}`)} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === `pos_${outlet}` ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>{outlet}</button>
                      ))}
                      <button onClick={() => setFbDir('bar_store')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'bar_store' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Bar Store</button>
                      <button onClick={() => setFbDir('inventory')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'inventory' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Restaurant Store</button>
                      <button onClick={() => setFbDir('meals')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'meals' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>In-House Meals</button>
                      <button onClick={() => setFbDir('kds')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'kds' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Kitchen/KDS</button>
                      <button onClick={() => setFbDir('menu')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'menu' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Menu Mgmt</button>
                      <button onClick={() => setFbDir('banquets')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'banquets' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Banquets</button>
                      <button onClick={() => setFbDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${fbDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Reports</button>
                    </div>
                  )}

                  {/* Engineering sub-navigation triggers */}
                  {activeDept === 'maintenance' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="eng-sub-menu">
                      <button onClick={() => setEngDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Dashboard</button>
                      <button onClick={() => setEngDir('workorders')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'workorders' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Work Orders</button>
                      <button onClick={() => setEngDir('pm')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'pm' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Preventive Main.</button>
                      <button onClick={() => setEngDir('assets')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'assets' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Asset Register</button>
                      <button onClick={() => setEngDir('rooms')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'rooms' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Guest Rooms</button>
                      <button onClick={() => setEngDir('utilities')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'utilities' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Utilities & Plant</button>
                      <button onClick={() => setEngDir('inventory')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'inventory' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Spare Parts & Tools</button>
                      <button onClick={() => setEngDir('staff')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'staff' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Technicians</button>
                      <button onClick={() => setEngDir('compliance')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'compliance' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Safety & Compliance</button>
                      <button onClick={() => setEngDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${engDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Reports</button>
                    </div>
                  )}

                  {/* Inventory sub-navigation triggers */}
                  {activeDept === 'inventory' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="inv-sub-menu">
                      <button onClick={() => setInvDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Dashboard</button>
                      <button onClick={() => setInvDir('items')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'items' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Item Master</button>
                      <button onClick={() => setInvDir('stores')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'stores' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Stores & Transfers</button>
                      <button onClick={() => setInvDir('requisitions')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'requisitions' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Requisitions</button>
                      <button onClick={() => setInvDir('receiving')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'receiving' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Goods Receiving</button>
                      <button onClick={() => setInvDir('count')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'count' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Stock Counting</button>
                      <button onClick={() => setInvDir('suppliers')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'suppliers' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Suppliers</button>
                      <button onClick={() => setInvDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${invDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Reports</button>
                    </div>
                  )}

                  {/* Finance sub-navigation triggers */}
                  {activeDept === 'finance' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="fin-sub-menu">
                      <button onClick={() => setFinDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Executive Dashboard</button>
                      <button onClick={() => setFinDir('sales')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'sales' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Sales & Receipts</button>
                      <button onClick={() => setFinDir('gl')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'gl' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>General Ledger</button>
                      <button onClick={() => setFinDir('expenses')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'expenses' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Expense Management</button>
                      <button onClick={() => setFinDir('ap')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'ap' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Accounts Payable</button>
                      <button onClick={() => setFinDir('ar')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'ar' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Accounts Receivable</button>
                      <button onClick={() => setFinDir('cash')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'cash' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Cash & Bank</button>
                      <button onClick={() => setFinDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Financial Reports</button>
                      <button onClick={() => setFinDir('budget')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'budget' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Budgeting & Analysis</button>
                      <button onClick={() => setFinDir('assets')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${finDir === 'assets' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Fixed Assets</button>
                    </div>
                  )}

                  {/* HR sub-navigation triggers */}
                  {activeDept === 'hr' && (
                    <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="hr-sub-menu">
                      <button onClick={() => setHrDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>HR Analytics</button>
                      <button onClick={() => setHrDir('employees')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'employees' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Employee Master</button>
                      <button onClick={() => setHrDir('attendance')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'attendance' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Attendance & Roster</button>
                      <button onClick={() => setHrDir('payroll')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'payroll' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Payroll Management</button>
                      <button onClick={() => setHrDir('leave')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'leave' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Leave & Absences</button>
                      <button onClick={() => setHrDir('performance')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'performance' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Performance (KPIs)</button>
                      <button onClick={() => setHrDir('training')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'training' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Learning & Dev</button>
                      <button onClick={() => setHrDir('recruitment')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'recruitment' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Recruitment Flow</button>
                      <button onClick={() => setHrDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${hrDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Reports</button>
                    </div>
                  )}

                  {/* Executive sub-navigation triggers - grouped */}
                  {activeDept === 'executive' && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="exec-sub-menu">
                        <button onClick={() => setExecDir('dashboard')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Overview</button>
                        <button onClick={() => setExecDir('operations')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${['operations', 'approvals'].includes(execDir) ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Operations</button>
                        <button onClick={() => setExecDir('finance')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${['finance', 'planning'].includes(execDir) ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Financial</button>
                        <button onClick={() => setExecDir('business_admin')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === 'business_admin' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Business Admin</button>
                        <button onClick={() => setExecDir('property_config')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === 'property_config' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Room Inventory</button>
                        <button onClick={() => setExecDir('pricing_revenue')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === 'pricing_revenue' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Pricing & Revenue</button>
                        <button onClick={() => setExecDir('analytics')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${['analytics', 'outlet_performance'].includes(execDir) ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Analytics</button>
                        <button onClick={() => setExecDir('risk')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${['risk', 'owner'].includes(execDir) ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Strategic</button>
                        <button onClick={() => setExecDir('governance')} className={`px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === 'governance' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Governance</button>
                      </div>
                      {(() => {
                        const execSubTabs: Record<string, { id: string; label: string }[]> = {
                          operations: [
                            { id: 'operations', label: 'Operations' },
                            { id: 'approvals', label: 'Approvals' },
                          ],
                          financial: [
                            { id: 'finance', label: 'Finance' },
                            { id: 'planning', label: 'Planning' },
                          ],
                          analytics: [
                            { id: 'analytics', label: 'Analytics' },
                            { id: 'outlet_performance', label: 'Outlet Performance' },
                          ],
                          strategic: [
                            { id: 'risk', label: 'Risk' },
                            { id: 'owner', label: 'Owner' },
                          ],
                        };
                        const activeGroup = Object.keys(execSubTabs).find(g => execSubTabs[g].some(t => t.id === execDir));
                        if (!activeGroup) return null;
                        return (
                          <div className="flex bg-white p-0.5 border border-slate-200 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow" id="exec-sub-tabs">
                            {execSubTabs[activeGroup].map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => setExecDir(tab.id)}
                                className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition whitespace-nowrap ${execDir === tab.id ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-slate-50 text-[11px]'}`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
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
                      <button onClick={() => setProcDir('dashboard')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Procurement Dashboard</button>
                      <button onClick={() => setProcDir('requisitions')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'requisitions' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Requisitions</button>
                      <button onClick={() => setProcDir('orders')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'orders' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Purchase Orders</button>
                      <button onClick={() => setProcDir('suppliers')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'suppliers' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Suppliers</button>
                      <button onClick={() => setProcDir('rfq')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'rfq' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>RFQ Management</button>
                      <button onClick={() => setProcDir('receiving')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'receiving' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Goods Receiving</button>
                      <button onClick={() => setProcDir('contracts')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'contracts' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Contracts</button>
                      <button onClick={() => setProcDir('budget')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'budget' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Budget Control</button>
                      <button onClick={() => setProcDir('invoices')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'invoices' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Supplier Invoices</button>
                      <button onClick={() => setProcDir('approvals')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'approvals' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Approval Center</button>
                      <button onClick={() => setProcDir('reports')} className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition ${procDir === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]' : 'text-slate-600 hover:text-slate-900 bg-white text-[11px]'}`}>Reports</button>
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

                  {/* EXECUTIVE BUSINESS PERFORMANCE ANALYTICS */}
                  {activeDept === 'executive' && (
                    <>
                      {(currentUser?.role === 'general_manager' || currentUser?.role === 'executive' || currentUser?.role === 'gm' || currentUser?.role === 'owner') && <ExecutivePortal activeModule={execDir} />}
                    </>
                  )}

                  {/* SYSTEM ADMINISTRATION & GOVERNANCE PORTAL */}
                  {activeDept === 'admin' && (
                    <AdminPortal activeModule={adminDir} />
                  )}

                  {/* PROCUREMENT & STRATEGIC SOURCING PORTAL */}
                  {activeDept === 'procurement' && (
                    <ProcurementPortal activeModule={procDir} />
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
      <ERPProvider>
        <GuestProvider>
          <GroupProvider>
            <MasterHotelERP />
          </GroupProvider>
        </GuestProvider>
      </ERPProvider>
    </ErrorBoundary>
  );
}

