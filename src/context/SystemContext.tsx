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
import { validateFeeComponentsMatch } from '../utils/billing';

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
    id: string;
    name: string;
    email: string;
    role: string;
    roleDescription?: string;
    avatar?: string;
    lastLogin: string;
    department?: string;
    employeeId?: string;
    mobileNumber?: string;
    username?: string;
    status?: string;
  };
  setUserProfile: (profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string; mobileNumber: string; username: string }>) => void;
  updatePassword: (old: string, newP: string) => Promise<boolean>;
  syncUserProfile: (profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => void;
  
  currentSystemDate: string;
  setCurrentSystemDate: (date: string) => void;

  isSystemLoading: boolean;
  refreshData: () => Promise<void>;

  pendingAdminChanges: PendingAdminChange[];
  submitAdminChange: (change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => void;
  executeAdminChangeDirectly: (change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => void;
  approveAdminChange: (id: string) => void;
  declineAdminChange: (id: string) => void;
  submitGlobalSettingsChange: (title: string, description: string, changeType: AdminChangeType, settings: Partial<GlobalHotelSettings>) => void;

  // Settings version tracking (Step 2.5)
  settingsVersion: number | null;
  settingsChecksum: string | null;
  isSettingsStale: boolean;

  // Multi-property support (Step 6.1)
  currentPropertyId: string | null;
  setCurrentPropertyId: (id: string | null) => void;
  properties: PropertyInfo[];
  organizations: OrganizationInfo[];
}

export interface PropertyInfo {
  id: string;
  organization_id: string | null;
  property_name: string;
  property_code: string | null;
  property_type: string | null;
  currency_code: string;
  is_active: boolean;
}

export interface OrganizationInfo {
  id: string;
  org_name: string;
  org_code: string | null;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platformView, setPlatformView] = useState<'erp' | 'direct' | 'mobile'>('erp');
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(() => localStorage.getItem('erp_property_id'));
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
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
  const [settingsVersion, setSettingsVersion] = useState<number | null>(null);
  const [settingsChecksum, setSettingsChecksum] = useState<string | null>(null);
  const [isSettingsStale, setIsSettingsStale] = useState(false);
  
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
    id: '',
    name: '',
    email: '',
    role: '',
    roleDescription: '',
    avatar: '',
    lastLogin: '',
    department: '',
    employeeId: '',
    mobileNumber: '',
    username: '',
    status: ''
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

  const refreshData = useCallback(async () => {
    let active = true;
    setIsSystemLoading(true);
    await Promise.all([
      fetch('/api/settings', { credentials: 'include' }).then(async r => {
        if (active && r.ok) {
          const data = await r.json();
          const dbSettings = data.settings;
          const newVersion = Number(r.headers.get('X-Settings-Version')) || null;
          const newChecksum = r.headers.get('X-Settings-Checksum') || null;

          // Check if settings are stale (Step 2.5)
          if (settingsVersion !== null && newVersion !== null && newVersion > settingsVersion) {
            setIsSettingsStale(true);
            addNotification('Settings have been updated by another user. Please refresh your browser.', 'warning', 'System');
          } else if (settingsChecksum !== null && newChecksum !== null && newChecksum !== settingsChecksum) {
            setIsSettingsStale(true);
            addNotification('Settings checksum changed. Data may be out of sync.', 'warning', 'System');
          } else {
            setIsSettingsStale(false);
          }

          setSettingsVersion(newVersion);
          setSettingsChecksum(newChecksum);

          if (dbSettings) {
            // Validate fee components match between frontend and backend
            if (dbSettings.feeComponents && globalHotelSettings.feeComponents) {
              const validation = validateFeeComponentsMatch(
                globalHotelSettings.feeComponents,
                dbSettings.feeComponents
              );
              if (!validation.valid) {
                console.warn('Fee components mismatch detected between frontend and backend:', validation.mismatches);
                // Auto-sync to backend to prevent discrepancies
                setGlobalHotelSettings(prev => ({ ...prev, ...dbSettings }));
              } else {
                setGlobalHotelSettings(prev => ({ ...prev, ...dbSettings }));
              }
            } else {
              setGlobalHotelSettings(prev => ({ ...prev, ...dbSettings }));
            }
          }
        }
      }).catch(console.error),
      supabaseService.fetchSystemUsers().then(dbUsers => {
        if (active && dbUsers && dbUsers.length > 0) {
          setSystemUsers(dbUsers);
        }
      }).catch(console.error),
      // Step 3.5: Fetch roles from API (server is single source of truth)
      fetch('/api/admin/roles', { credentials: 'include' })
        .then(r => {
          if (r.ok) return r.json();
          return { roles: [] };
        })
        .then((data: { roles: any[] }) => {
          if (active && data.roles && data.roles.length > 0) {
            setCustomRoles(data.roles);
          }
        }).catch(console.error),
      fetch('/api/audit/events?limit=500', { credentials: 'include' })
        .then(r => {
          if (r.ok) return r.json();
          if (r.status === 401) return [];
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
      fetch('/api/properties', { credentials: 'include' })
        .then(r => {
          if (r.ok) return r.json();
          return { properties: [], organizations: [] };
        })
        .then((data: { properties: PropertyInfo[]; organizations: OrganizationInfo[] }) => {
          if (active) {
            if (data.properties && data.properties.length > 0) {
              setProperties(data.properties);
              if (!currentPropertyId && data.properties.length > 0) {
                const firstId = data.properties[0].id;
                localStorage.setItem('erp_property_id', firstId);
                setCurrentPropertyId(firstId);
              }
            }
            if (data.organizations && data.organizations.length > 0) {
              setOrganizations(data.organizations);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch properties:', err);
        }),
    ]).finally(() => {
      if (active) setIsSystemLoading(false);
    });
  }, []);

  // Load admin data from Supabase on mount with loading tracking
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const refreshPendingAdminChanges = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/pending-changes', { credentials: 'include' });
      if (r.ok) {
        const data: PendingAdminChange[] = await r.json();
        if (Array.isArray(data)) setPendingAdminChanges(data);
      } else if (r.status === 401) {
        setPendingAdminChanges([]);
      } else {
        console.warn(`Pending changes fetch returned status ${r.status}`);
      }
    } catch (err) {
      console.warn('Failed to fetch pending changes:', err);
    }
  }, []);

  // Load pending admin changes from DB on mount
  useEffect(() => {
    refreshPendingAdminChanges();
  }, [refreshPendingAdminChanges]);

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
    // Step 3.5: Use API endpoint instead of direct Supabase
    fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newRole)
    }).catch(console.error);
  }, []);

  const updateCustomRole = useCallback((id: string, updates: Partial<CustomRole>) => {
    setCustomRoles(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      const updated = next.find(r => r.id === id);
      if (updated) {
        // Step 3.5: Use API endpoint instead of direct Supabase
        fetch(`/api/admin/roles/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updated)
        }).catch(console.error);
      }
      return next;
    });
  }, []);

  const deleteCustomRole = useCallback((id: string) => {
    setCustomRoles(prev => prev.filter(r => r.id !== id));
    // Step 3.5: Use API endpoint instead of direct Supabase
    fetch(`/api/admin/roles/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).catch(console.error);
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
        console.warn(`Pending changes fetch returned status ${r.status}`);
        return [];
      })
      .then((data: PendingAdminChange[]) => {
        if (Array.isArray(data)) setPendingAdminChanges(data);
      })
      .catch((err) => {
        console.warn('Failed to fetch pending changes:', err);
      });
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
      fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(newRole) }).catch(console.error);
    } else if (operation === 'updateCustomRole') {
      setCustomRoles(r => r.map(role => role.id === args[0] ? { ...role, ...args[1] } : role));
      fetch(`/api/admin/roles/${args[0]}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(args[0]) }).catch(console.error);
    } else if (operation === 'deleteCustomRole') {
      setCustomRoles(r => r.filter(role => role.id !== args[0]));
      fetch(`/api/admin/roles/${args[0]}`, { method: 'DELETE', credentials: 'include' }).catch(console.error);
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
          fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(newRole) }).catch(console.error);
        } else if (operation === 'updateCustomRole') {
          setCustomRoles(r => r.map(role => role.id === args[0] ? { ...role, ...args[1] } : role));
          fetch(`/api/admin/roles/${args[0]}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: args[0], ...args[1] }) }).catch(console.error);
        } else if (operation === 'deleteCustomRole') {
          setCustomRoles(r => r.filter(role => role.id !== args[0]));
          fetch(`/api/admin/roles/${args[0]}`, { method: 'DELETE', credentials: 'include' }).catch(console.error);
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

  const updateProfile = useCallback((data: Partial<{ name: string; email: string; avatar: string; mobileNumber: string; username: string }>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  }, []);

  const setUserProfileFull = useCallback((profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => {
    setUserProfile(profile);
  }, []);

  const syncUserProfile = useCallback((profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => {
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

  const handleSetCurrentPropertyId = (id: string | null) => {
    if (id) localStorage.setItem('erp_property_id', id);
    else localStorage.removeItem('erp_property_id');
    setCurrentPropertyId(id);
  };

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
    isSystemLoading, refreshData,
    pendingAdminChanges, submitAdminChange, executeAdminChangeDirectly, approveAdminChange, declineAdminChange,
    submitGlobalSettingsChange,
    settingsVersion, settingsChecksum, isSettingsStale,
    currentPropertyId, setCurrentPropertyId: handleSetCurrentPropertyId, properties, organizations
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};
