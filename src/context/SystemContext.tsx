/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Notification, SystemAuditLog, CustomRole, User, DispatchedEmail, GlobalHotelSettings, RoomTypeMetadata, PendingAdminChange, AdminChangeType
} from '../types/erp';
import { initialNotifications, initialRoomTypeMetadata } from './initialState';
import { toISODate } from '../utils/date';
import { supabaseService } from '../services/supabaseService';

export interface SystemContextType {
  platformView: 'erp' | 'direct' | 'mobile';
  setPlatformView: (view: 'erp' | 'direct' | 'mobile') => void;
  activeGuestPortalResId: string;
  setActiveGuestPortalResId: (id: string) => void;
  dispatchedEmails: DispatchedEmail[];
  addDispatchedEmail: (email: Omit<DispatchedEmail, 'id' | 'sentAt'>) => void;
  
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type'], department: Notification['department']) => void;
  markNotificationRead: (id: string) => void;
  clearNotification: (id: string) => void;
  
  auditLogs: string[];
  logAudit: (message: string) => void;
  structuredAuditLogs: SystemAuditLog[];
  addStructuredAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  
  customRoles: CustomRole[];
  addCustomRole: (role: Omit<CustomRole, 'id'>) => void;
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (id: string) => void;
  
  systemUsers: User[];
  addSystemUser: (user: Omit<User, 'id'>) => void;
  updateSystemUser: (id: string, updates: Partial<User>) => void;
  deleteSystemUser: (id: string) => void;
  
  globalHotelSettings: GlobalHotelSettings;
  updateGlobalHotelSettings: (settings: Partial<GlobalHotelSettings>) => void;
  roomTypeMetadata: RoomTypeMetadata[];
  updateRoomTypeMetadata: (type: RoomTypeMetadata['type'], updates: Partial<RoomTypeMetadata>) => void;
  
  currency: 'USD' | 'ETB';
  setCurrency: (currency: 'USD' | 'ETB') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  userProfile: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    lastLogin: string;
  };
  setUserProfile: (profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string }>) => void;
  updatePassword: (old: string, newP: string) => Promise<boolean>;
  syncUserProfile: (profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => void;
  
  currentSystemDate: string;
  setCurrentSystemDate: (date: string) => void;

  isSystemLoading: boolean;

  pendingAdminChanges: PendingAdminChange[];
  submitAdminChange: (change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => void;
  executeAdminChangeDirectly: (change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => void;
  approveAdminChange: (id: string) => void;
  declineAdminChange: (id: string) => void;
  submitGlobalSettingsChange: (title: string, description: string, changeType: AdminChangeType, settings: Partial<GlobalHotelSettings>) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platformView, setPlatformView] = useState<'erp' | 'direct' | 'mobile'>('erp');
  const [activeGuestPortalResId, setActiveGuestPortalResId] = useState<string>('');
  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    'System initialized successfully.',
  ]);
  const [structuredAuditLogs, setStructuredAuditLogs] = useState<SystemAuditLog[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('USD');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('erp-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'dark'; // Default to dark mode
  });
  const [currentSystemDate, setCurrentSystemDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSystemLoading, setIsSystemLoading] = useState(true);
  const [pendingAdminChanges, setPendingAdminChanges] = useState<PendingAdminChange[]>([]);
  
  const [globalHotelSettings, setGlobalHotelSettings] = useState<GlobalHotelSettings>({
    customHotelName: '',
    customHotelAddress: '',
    hotelTin: '',
    hotelVatNo: '',
    hotelVatDate: '',
    taxPercent: 0,
    serviceChargePercent: 0,
    exchangeRate: 1.0,
    feeComponents: [],
    invoiceBankDetails: '',
    cancellationGraceHours: 72,
    heroImageUrl: '',
    contactPhone: '',
    publicTagline: '',
    socialLinks: [],
    emailTemplates: [
      { id: 'booking_confirm', name: 'Booking Confirmation', subject: 'Your reservation is confirmed', body: 'Dear {{guestName}},\n\nThank you for choosing {{hotelName}}. Your reservation from {{checkInDate}} to {{checkOutDate}} is confirmed.\n\nWe look forward to welcoming you.\n\nBest regards,\n{{hotelName}} Team', enabled: true, variables: ['guestName', 'hotelName', 'checkInDate', 'checkOutDate'] },
      { id: 'pre_arrival', name: 'Pre-Arrival Email', subject: 'We look forward to welcoming you', body: 'Dear {{guestName}},\n\nYour stay at {{hotelName}} is approaching. Check-in is on {{checkInDate}}.\n\nIf you need anything before arrival, reply to this email.\n\nBest regards,\n{{hotelName}} Team', enabled: true, variables: ['guestName', 'hotelName', 'checkInDate'] },
      { id: 'low_inventory', name: 'Low Inventory Alert', subject: 'Inventory below reorder threshold', body: 'Attention {{department}},\n\nItem {{itemName}} (SKU: {{sku}}) has fallen below the reorder threshold. Current quantity: {{currentQty}}.\n\nPlease initiate a requisition.\n\n{{hotelName}} Operations', enabled: true, variables: ['department', 'itemName', 'sku', 'currentQty', 'hotelName'] },
      { id: 'checkout', name: 'Checkout Summary', subject: 'Thank you for staying with us', body: 'Dear {{guestName}},\n\nThank you for staying at {{hotelName}}. We hope you enjoyed your visit from {{checkInDate}} to {{checkOutDate}}.\n\nYour final folio total was {{totalAmount}}.\n\nWe hope to see you again soon.\n\nBest regards,\n{{hotelName}} Team', enabled: false, variables: ['guestName', 'hotelName', 'checkInDate', 'checkOutDate', 'totalAmount'] },
    ]
  });

  const [roomTypeMetadata, setRoomTypeMetadata] = useState<RoomTypeMetadata[]>(initialRoomTypeMetadata);

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    avatar: '',
    lastLogin: ''
  });

  const logAudit = useCallback((message: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setAuditLogs(prev => [`${timestamp} - ${message}`, ...prev]);
  }, []);

  const addNotification = useCallback((message: string, type: Notification['type'], department: Notification['department']) => {
    const newNotif: Notification = {
      id: `N-${Date.now()}`,
      time: new Date().toISOString(),
      message,
      type,
      department,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // ... (Implementing other methods similarly)
  const addDispatchedEmail = useCallback((emailData: Omit<DispatchedEmail, 'id' | 'sentAt'>) => {
    const newEmail: DispatchedEmail = {
      ...emailData,
      id: `EML-${Math.floor(1000 + Math.random() * 9000)}`,
      sentAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${toISODate()}`
    };
    setDispatchedEmails(prev => [newEmail, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Load admin data from Supabase on mount with loading tracking
  useEffect(() => {
    let active = true;
    setIsSystemLoading(true);
    Promise.all([
      supabaseService.fetchGlobalSettings().then(dbSettings => {
        if (active && dbSettings) {
          setGlobalHotelSettings(prev => ({ ...prev, ...dbSettings }));
        }
      }).catch(console.error),
      supabaseService.fetchSystemUsers().then(dbUsers => {
        if (active && dbUsers && dbUsers.length > 0) {
          setSystemUsers(dbUsers);
        }
      }).catch(console.error),
      supabaseService.fetchCustomRoles().then(dbRoles => {
        if (active && dbRoles && dbRoles.length > 0) {
          setCustomRoles(dbRoles);
        }
      }).catch(console.error),
      // Only fetch audit events if user is authenticated (requires auth)
      fetch('/api/audit/events?limit=500', { credentials: 'include' })
        .then(r => {
          if (r.ok) return r.json();
          // Handle any non-2xx status gracefully
          console.warn(`Audit events fetch returned status ${r.status}`);
          return [];
        })
        .then((data: SystemAuditLog[]) => {
          if (active && Array.isArray(data) && data.length > 0) {
            setStructuredAuditLogs(data);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch audit events:', err);
        }),
    ]).finally(() => {
      if (active) setIsSystemLoading(false);
    });
    return () => { active = false; };
  }, []);

  const addStructuredAuditLog = useCallback((log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SystemAuditLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setStructuredAuditLogs(prev => [newLog, ...prev]);
    supabaseService.insertAuditEvent(newLog).catch(console.error);
  }, []);

  const addCustomRole = useCallback((role: Omit<CustomRole, 'id'>) => {
    const newRole: CustomRole = { ...role, id: `ROLE-${Date.now()}` };
    setCustomRoles(prev => [...prev, newRole]);
    supabaseService.upsertCustomRole(newRole).catch(console.error);
  }, []);

  const updateCustomRole = useCallback((id: string, updates: Partial<CustomRole>) => {
    setCustomRoles(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      const updated = next.find(r => r.id === id);
      if (updated) {
        supabaseService.upsertCustomRole(updated).catch(console.error);
      }
      return next;
    });
  }, []);

  const deleteCustomRole = useCallback((id: string) => {
    setCustomRoles(prev => prev.filter(r => r.id !== id));
    supabaseService.deleteCustomRole(id).catch(console.error);
  }, []);

  const addSystemUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `U-${Date.now()}` };
    setSystemUsers(prev => [...prev, newUser]);
    return supabaseService.insertSystemUser(newUser);
  }, []);

  const updateSystemUser = useCallback((id: string, updates: Partial<User>) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    return supabaseService.updateSystemUser(id, updates);
  }, []);

  const deleteSystemUser = useCallback((id: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
    supabaseService.deleteSystemUser(id).catch(console.error);
  }, []);

  const updateGlobalHotelSettings = useCallback((settings: Partial<GlobalHotelSettings>) => {
    setGlobalHotelSettings(prev => {
      const next = { ...prev, ...settings };
      // Sync to Supabase in the background
      supabaseService.updateGlobalSettings(next).catch(console.error);
      return next;
    });
  }, []);

  // Load pending admin changes from DB on mount
  useEffect(() => {
    fetch('/api/admin/pending-changes', { credentials: 'include' })
      .then(r => {
        if (r.ok) return r.json();
        if (r.status === 401) return []; // Not authenticated, return empty array
        throw new Error(`Failed to fetch pending changes: ${r.status}`);
      })
      .then((data: PendingAdminChange[]) => {
        if (Array.isArray(data)) setPendingAdminChanges(data);
      })
      .catch(console.error);
  }, []);

  const submitAdminChange = useCallback((change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => {
    const newChange: PendingAdminChange = {
      ...change,
      id: `ADM-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setPendingAdminChanges(prev => [newChange, ...prev]);
    fetch('/api/admin/pending-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newChange)
    }).catch(console.error);
    addStructuredAuditLog({
      userId: userProfile?.id || 'system',
      userName: change.submittedBy || 'System Admin',
      device: 'Web Browser',
      ipAddress: '192.168.1.100',
      module: 'Governance',
      recordId: newChange.id,
      action: 'ADMIN_CHANGE_SUBMIT',
      details: `Submitted "${change.title}" (${change.changeType}) for executive approval. Change ID: ${newChange.id}.`
    });
  }, [addStructuredAuditLog, userProfile]);

  const executeAdminChangeDirectly = useCallback((change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => {
    const { operation, args } = change.payload as any;
    // Execute the operation directly without governance approval
    if (operation === 'addSystemUser') {
      const newUser: User = { ...args[0], id: `U-${Date.now()}` };
      setSystemUsers(u => [...u, newUser]);
      supabaseService.insertSystemUser(newUser).catch(console.error);
    } else if (operation === 'updateSystemUser') {
      setSystemUsers(u => u.map(usr => usr.id === args[0] ? { ...usr, ...args[1] } : usr));
      supabaseService.updateSystemUser(args[0], args[1]).catch(console.error);
    } else if (operation === 'deleteSystemUser') {
      setSystemUsers(u => u.filter(usr => usr.id !== args[0]));
      supabaseService.deleteSystemUser(args[0]).catch(console.error);
    } else if (operation === 'addCustomRole') {
      const newRole: CustomRole = { ...args[0], id: `ROLE-${Date.now()}` };
      setCustomRoles(r => [...r, newRole]);
      supabaseService.upsertCustomRole(newRole).catch(console.error);
    } else if (operation === 'updateCustomRole') {
      setCustomRoles(r => r.map(role => role.id === args[0] ? { ...role, ...args[1] } : role));
      supabaseService.upsertCustomRole(args[0]).catch(console.error);
    } else if (operation === 'deleteCustomRole') {
      setCustomRoles(r => r.filter(role => role.id !== args[0]));
      supabaseService.deleteCustomRole(args[0]).catch(console.error);
    } else if (operation === 'updateSecuritySettings') {
      // Handle security settings updates
      const settings = args[0];
      // Update global settings or other security-related state
      addStructuredAuditLog({
        userId: userProfile?.id || 'system',
        userName: change.submittedBy || 'System Admin',
        device: 'Web Browser',
        ipAddress: '192.168.1.100',
        module: 'Security',
        recordId: `SEC-${Date.now()}`,
        action: 'SECURITY_SETTINGS_UPDATE',
        details: `Security settings updated directly by executive: ${JSON.stringify(settings)}`
      });
    } else if (operation === 'deleteRoom') {
      // Handle room deletion - this would need to be integrated with ERP context
      addStructuredAuditLog({
        userId: userProfile?.id || 'system',
        userName: change.submittedBy || 'System Admin',
        device: 'Web Browser',
        ipAddress: '192.168.1.100',
        module: 'Property',
        recordId: `ROOM-${Date.now()}`,
        action: 'ROOM_DELETION',
        details: `Room ${args[0]} deleted directly by executive without governance approval`
      });
    }
  }, [addStructuredAuditLog, userProfile]);

  const approveAdminChange = useCallback((id: string) => {
    setPendingAdminChanges(prev => {
      const change = prev.find(c => c.id === id);
      if (change && change.status === 'Pending') {
        // Dispatch the operation based on serialized payload
        const { operation, args } = change.payload as any;
        if (operation === 'addSystemUser') {
          const newUser: User = { ...args[0], id: `U-${Date.now()}` };
          setSystemUsers(u => [...u, newUser]);
          supabaseService.insertSystemUser(newUser).catch(console.error);
        } else if (operation === 'updateSystemUser') {
          setSystemUsers(u => u.map(usr => usr.id === args[0] ? { ...usr, ...args[1] } : usr));
          supabaseService.updateSystemUser(args[0], args[1]).catch(console.error);
        } else if (operation === 'deleteSystemUser') {
          setSystemUsers(u => u.filter(usr => usr.id !== args[0]));
          supabaseService.deleteSystemUser(args[0]).catch(console.error);
        } else if (operation === 'addCustomRole') {
          const newRole: CustomRole = { ...args[0], id: `ROLE-${Date.now()}` };
          setCustomRoles(r => [...r, newRole]);
          supabaseService.upsertCustomRole(newRole).catch(console.error);
        } else if (operation === 'updateCustomRole') {
          setCustomRoles(r => r.map(role => role.id === args[0] ? { ...role, ...args[1] } : role));
          supabaseService.upsertCustomRole({ id: args[0], ...args[1] } as CustomRole).catch(console.error);
        } else if (operation === 'deleteCustomRole') {
          setCustomRoles(r => r.filter(role => role.id !== args[0]));
          supabaseService.deleteCustomRole(args[0]).catch(console.error);
        } else if (operation === 'updateGlobalHotelSettings') {
          setGlobalHotelSettings(s => {
            const next = { ...s, ...args[0] };
            supabaseService.updateGlobalSettings(next).catch(console.error);
            return next;
          });
        }
        // Persist status to DB
        fetch(`/api/admin/pending-changes/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'Approved' })
        }).catch(console.error);

        addStructuredAuditLog({
          userId: userProfile?.id || 'system',
          userName: userProfile?.name || 'Executive Admin',
          device: 'Web Browser',
          ipAddress: '192.168.1.100',
          module: 'Governance',
          recordId: id,
          action: 'ADMIN_CHANGE_APPROVED',
          details: `Approved admin change "${change.title}" (${change.changeType}). Change ID: ${id}.`
        });
      }
      return prev.map(c => c.id === id ? { ...c, status: 'Approved' as const } : c);
    });
  }, []);

  const declineAdminChange = useCallback((id: string) => {
    fetch(`/api/admin/pending-changes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'Declined' })
    }).catch(console.error);
    setPendingAdminChanges(prev => {
      const change = prev.find(c => c.id === id);
      if (change) {
        addStructuredAuditLog({
          userId: userProfile?.id || 'system',
          userName: userProfile?.name || 'Executive Admin',
          device: 'Web Browser',
          ipAddress: '192.168.1.100',
          module: 'Governance',
          recordId: id,
          action: 'ADMIN_CHANGE_DECLINED',
          details: `Declined admin change "${change.title}" (${change.changeType}). Change ID: ${id}.`
        });
      }
      return prev.map(c => c.id === id ? { ...c, status: 'Declined' as const } : c);
    });
  }, [addStructuredAuditLog, userProfile]);

  const submitGlobalSettingsChange = useCallback((title: string, description: string, changeType: AdminChangeType, settings: Partial<GlobalHotelSettings>) => {
    // Immediately apply the settings to global state
    updateGlobalHotelSettings(settings);
    
    // Also submit to pending changes for audit trail
    submitAdminChange({
      title,
      description,
      changeType,
      submittedBy: userProfile.name || 'System Admin',
      payload: { operation: 'updateGlobalHotelSettings', args: [settings] }
    });
  }, [submitAdminChange, userProfile, updateGlobalHotelSettings]);

  const updateRoomTypeMetadata = useCallback((type: RoomTypeMetadata['type'], updates: Partial<RoomTypeMetadata>) => {
    setRoomTypeMetadata(prev => prev.map(m => m.type === type ? { ...m, ...updates } : m));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      const isBookingRoute = window.location.pathname.includes('booking');
      if (theme === 'dark' && !isBookingRoute) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp-theme', theme);
    }
  }, [theme]);

  const updateProfile = useCallback((data: Partial<{ name: string; email: string; avatar: string }>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  }, []);

  const setUserProfileFull = useCallback((profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => {
    setUserProfile(profile);
  }, []);

  const syncUserProfile = useCallback((profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => {
    setUserProfile(profile);
  }, []);

  const updatePassword = useCallback(async (old: string, newP: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: old, newPassword: newP }),
      });
      const data = await response.json();
      return response.ok && data.success;
    } catch (e) {
      console.error('Password change failed:', e);
      return false;
    }
  }, []);

  const value = {
    platformView, setPlatformView,
    activeGuestPortalResId, setActiveGuestPortalResId,
    dispatchedEmails, addDispatchedEmail,
    notifications, addNotification, markNotificationRead, clearNotification,
    auditLogs, logAudit,
    structuredAuditLogs, addStructuredAuditLog,
    customRoles, addCustomRole, updateCustomRole, deleteCustomRole,
    systemUsers, addSystemUser, updateSystemUser, deleteSystemUser,
    globalHotelSettings, updateGlobalHotelSettings,
    roomTypeMetadata, updateRoomTypeMetadata,
    currency, setCurrency,
    theme, toggleTheme,
    userProfile, setUserProfile: setUserProfileFull, updateProfile, updatePassword, syncUserProfile,
    currentSystemDate, setCurrentSystemDate,
    isSystemLoading,
    pendingAdminChanges, submitAdminChange, executeAdminChangeDirectly, approveAdminChange, declineAdminChange,
    submitGlobalSettingsChange
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};
