/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Store,
  Plus,
  Trash2,
  Users,
  Search,
  X,
  Utensils,
  Beer,
  Package,
  Sparkles,
  Coffee,
  MapPin,
  Settings,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Save,
  Shield,
  Clock,
  DollarSign,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PermissionChecklist, POS_PERMISSION_CATEGORIES } from '../Shared/PermissionChecklist';

interface POSOutlet {
  id: string;
  name: string;
  outlet_type: string;
  code: string;
  description?: string;
  location?: string;
  is_active: boolean;
  store_location: string;
  default_tax_rate: number;
  default_service_charge: number;
  operating_hours: any;
  // Outlet Registry framework fields
  inventory_mode?: 'recipe' | 'sku';
  charge_modes?: string[];
  tax_profile_id?: string;
  gl_mapping_id?: string;
  requires_guest_link?: boolean;
  shift_reconciliation_required?: boolean;
  outlet_status?: 'active' | 'inactive' | 'suspended';
  outlet_category?: 'FoodBeverage' | 'Retail' | 'Service' | 'Wellness' | 'Other';
  requires_kds?: boolean;
}

interface OutletRole {
  id: string;
  user_id: string;
  outlet_id: string;
  role: string;
  is_primary: boolean;
  permissions?: Record<string, string[]>;
  user?: any;
}

export default function POSOutletManagement() {
  const { systemUsers, addNotification } = useERP();
  const [outlets, setOutlets] = useState<POSOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('outlets'); // outlets, tax-profiles, gl-mappings, terminals

  // Outlet Registry framework data
  const [taxProfiles, setTaxProfiles] = useState<any[]>([]);
  const [glMappings, setGlMappings] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [showTaxProfileModal, setShowTaxProfileModal] = useState(false);
  const [showGLMappingModal, setShowGLMappingModal] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<POSOutlet | null>(null);

  // Shift reconciliation state
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftFilterOutlet, setShiftFilterOutlet] = useState<string>('all');
  const [closingShift, setClosingShift] = useState<any | null>(null);
  const [closeShiftData, setCloseShiftData] = useState({ counted_cash: '', reconciliation_notes: '' });
  const [shiftSummary, setShiftSummary] = useState<any | null>(null);

  // Tax profile form state
  const [taxProfileForm, setTaxProfileForm] = useState({
    name: '',
    description: '',
    vat_rate: 15,
    service_charge_rate: 10,
    is_vat_exempt: false,
    is_service_charge_exempt: false,
  });
  const [editingTaxProfileId, setEditingTaxProfileId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    outlet_type: 'restaurant',
    code: '',
    description: '',
    location: '',
    store_location: 'Main Store',
    default_tax_rate: 15,
    default_service_charge: 10,
    // Outlet Registry framework fields
    inventory_mode: 'sku' as 'recipe' | 'sku',
    charge_modes: ['cash', 'card', 'room_folio', 'mobile_money'],
    tax_profile_id: '',
    gl_mapping_id: '',
    requires_guest_link: false,
    shift_reconciliation_required: true,
    outlet_status: 'active' as 'active' | 'inactive' | 'suspended',
    outlet_category: 'Other' as 'FoodBeverage' | 'Retail' | 'Service' | 'Wellness' | 'Other',
    requires_kds: false
  });

  // Role assignment state
  const [outletRoles, setOutletRoles] = useState<OutletRole[]>([]);
  const [roleFormData, setRoleFormData] = useState<{
    user_id: string;
    role: string;
    is_primary: boolean;
    permissions: Record<string, string[]>;
  }>({
    user_id: '',
    role: 'cashier',
    is_primary: false,
    permissions: {},
  });

  // Edit state for existing roles
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    role: string;
    is_primary: boolean;
    permissions: Record<string, string[]>;
  }>({ role: '', is_primary: false, permissions: {} });
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  useEffect(() => {
    fetchOutlets();
    fetchTaxProfiles();
    fetchGLMappings();
    fetchTerminals();
  }, []);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (shiftFilterOutlet !== 'all') params.set('outlet_id', shiftFilterOutlet);
      const response = await fetch(`/api/pos/shifts?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts || []);
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'shifts') fetchShifts();
  }, [activeTab, shiftFilterOutlet]);

  const fetchTaxProfiles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pos/tax-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTaxProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch tax profiles:', error);
    }
  };

  const fetchGLMappings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pos/gl-mappings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGlMappings(data.mappings || []);
      }
    } catch (error) {
      console.error('Failed to fetch GL mappings:', error);
    }
  };

  const fetchTerminals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pos/terminals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTerminals(data.terminals || []);
      }
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
    }
  };

  const handleEditOutlet = (outlet: POSOutlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      outlet_type: outlet.outlet_type,
      code: outlet.code,
      description: outlet.description || '',
      location: outlet.location || '',
      store_location: outlet.store_location,
      default_tax_rate: outlet.default_tax_rate,
      default_service_charge: outlet.default_service_charge,
      inventory_mode: outlet.inventory_mode || 'sku',
      charge_modes: outlet.charge_modes || ['cash', 'card', 'room_folio', 'mobile_money'],
      tax_profile_id: outlet.tax_profile_id || '',
      gl_mapping_id: outlet.gl_mapping_id || '',
      requires_guest_link: outlet.requires_guest_link || false,
      shift_reconciliation_required: outlet.shift_reconciliation_required !== undefined ? outlet.shift_reconciliation_required : true,
      outlet_status: outlet.outlet_status || 'active',
      outlet_category: outlet.outlet_category || 'Other',
      requires_kds: outlet.requires_kds || false
    });
    setShowModal(true);
  };

  const handleUpdateOutlet = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingOutlet) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pos/outlets/${editingOutlet.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        addNotification('POS outlet updated successfully', 'success', 'F&B');
        setShowModal(false);
        setEditingOutlet(null);
        fetchOutlets();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to update outlet', 'warning', 'F&B');
      }
    } catch (error) {
      console.error('Failed to update outlet:', error);
      addNotification('Failed to update outlet', 'warning', 'F&B');
    }
  };

  // Helper function to get permissions for a POS role
  const getRolePermissions = (role: string): Record<string, string[]> => {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      manager: {
        pos_orders: ['read', 'create', 'update', 'delete', 'refund', 'void'],
        pos_menu: ['read', 'create', 'update', 'delete'],
        pos_inventory: ['read', 'create', 'update', 'delete'],
        pos_reports: ['read', 'export'],
        pos_settings: ['read', 'update'],
        pos_cash_management: ['read', 'create', 'update']
      },
      supervisor: {
        pos_orders: ['read', 'create', 'update', 'refund'],
        pos_menu: ['read', 'update'],
        pos_inventory: ['read', 'update'],
        pos_reports: ['read'],
        pos_settings: [],
        pos_cash_management: ['read', 'create', 'update']
      },
      cashier: {
        pos_orders: ['read', 'create', 'update'],
        pos_menu: ['read'],
        pos_inventory: [],
        pos_reports: [],
        pos_settings: [],
        pos_cash_management: ['read', 'create']
      },
      server: {
        pos_orders: ['read', 'create', 'update'],
        pos_menu: ['read'],
        pos_inventory: [],
        pos_reports: [],
        pos_settings: [],
        pos_cash_management: []
      },
      bartender: {
        pos_orders: ['read', 'create', 'update'],
        pos_menu: ['read'],
        pos_inventory: [],
        pos_reports: [],
        pos_settings: [],
        pos_cash_management: ['read']
      },
      staff: {
        pos_orders: ['read'],
        pos_menu: ['read'],
        pos_inventory: [],
        pos_reports: [],
        pos_settings: [],
        pos_cash_management: []
      }
    };

    return rolePermissions[role] || {};
  };

  const fetchOutlets = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pos/outlets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOutlets(data.outlets || []);
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      addNotification('Failed to load POS outlets', 'warning', 'F&B');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutletRoles = async (outletId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pos/outlets/${outletId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOutletRoles(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch outlet roles:', error);
    }
  };

  const handleCreateOutlet = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pos/outlets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        addNotification('POS outlet created successfully', 'success', 'F&B');
        setShowModal(false);
        setFormData({
          name: '',
          outlet_type: 'restaurant',
          code: '',
          description: '',
          location: '',
          store_location: 'Main Store',
          default_tax_rate: 15,
          default_service_charge: 10,
          inventory_mode: 'sku',
          charge_modes: ['cash', 'card', 'room_folio', 'mobile_money'],
          tax_profile_id: '',
          gl_mapping_id: '',
          requires_guest_link: false,
          shift_reconciliation_required: true,
          outlet_status: 'active',
          outlet_category: 'Other',
          requires_kds: false
        });
        fetchOutlets();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to create outlet', 'warning', 'F&B');
      }
    } catch (error) {
      console.error('Failed to create outlet:', error);
      addNotification('Failed to create outlet', 'warning', 'F&B');
    }
  };

  const handleAssignRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pos/outlets/${selectedOutlet.id}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleFormData)
      });

      if (response.ok) {
        addNotification('User assigned to outlet successfully', 'success', 'F&B');
        setRoleFormData({ user_id: '', role: 'cashier', is_primary: false, permissions: getRolePermissions('cashier') });
        fetchOutletRoles(selectedOutlet.id);
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to assign role', 'warning', 'F&B');
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      addNotification('Failed to assign role', 'warning', 'F&B');
    }
  };

  const handleUpdateRole = async (roleId: string) => {
    if (!selectedOutlet) return;

    setSavingRoleId(roleId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pos/outlets/${selectedOutlet.id}/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        addNotification('Role updated successfully', 'success', 'F&B');
        setEditingRoleId(null);
        fetchOutletRoles(selectedOutlet.id);
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to update role', 'warning', 'F&B');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      addNotification('Failed to update role', 'warning', 'F&B');
    } finally {
      setSavingRoleId(null);
    }
  };

  const startEditRole = (role: OutletRole) => {
    if (editingRoleId === role.id) {
      setEditingRoleId(null);
      return;
    }
    setEditingRoleId(role.id);
    setEditFormData({
      role: role.role,
      is_primary: role.is_primary,
      permissions: role.permissions && Object.keys(role.permissions).length > 0
        ? { ...role.permissions }
        : getRolePermissions(role.role),
    });
  };

  const handleNewPermissionToggle = (category: string, action: string, checked: boolean) => {
    setRoleFormData(prev => {
      const perms = { ...prev.permissions };
      if (!perms[category]) perms[category] = [];
      if (checked) {
        if (!perms[category].includes(action)) perms[category].push(action);
      } else {
        perms[category] = perms[category].filter(a => a !== action);
      }
      return { ...prev, permissions: perms };
    });
  };

  const handleEditPermissionToggle = (category: string, action: string, checked: boolean) => {
    setEditFormData(prev => {
      const perms = { ...prev.permissions };
      if (!perms[category]) perms[category] = [];
      if (checked) {
        if (!perms[category].includes(action)) perms[category].push(action);
      } else {
        perms[category] = perms[category].filter(a => a !== action);
      }
      return { ...prev, permissions: perms };
    });
  };

  const handleNewRoleChange = (newRole: string) => {
    setRoleFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: getRolePermissions(newRole),
    }));
  };

  const handleEditRoleChange = (newRole: string) => {
    setEditFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: getRolePermissions(newRole),
    }));
  };

  const handleRemoveRole = async (userId: string) => {
    if (!selectedOutlet) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pos/outlets/${selectedOutlet.id}/roles/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        addNotification('User removed from outlet', 'success', 'F&B');
        fetchOutletRoles(selectedOutlet.id);
      }
    } catch (error) {
      console.error('Failed to remove role:', error);
      addNotification('Failed to remove role', 'warning', 'F&B');
    }
  };

  const handleOpenRoleModal = (outlet: POSOutlet) => {
    setSelectedOutlet(outlet);
    fetchOutletRoles(outlet.id);
    setShowRoleModal(true);
  };

  const getOutletIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return Utensils;
      case 'bar':
      case 'pool_bar': return Beer;
      case 'gift_shop': return Package;
      case 'spa': return Sparkles;
      case 'cafe': return Coffee;
      default: return Store;
    }
  };

  const getOutletTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant': return 'Restaurant';
      case 'bar': return 'Bar';
      case 'pool_bar': return 'Pool Bar';
      case 'gift_shop': return 'Gift Shop';
      case 'spa': return 'Spa';
      case 'cafe': return 'Café';
      case 'reception': return 'Reception';
      case 'room_service': return 'Room Service';
      default: return 'Other';
    }
  };

  const filteredOutlets = outlets.filter((outlet: POSOutlet) => {
    const matchSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        outlet.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || outlet.outlet_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">POS Outlet Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage POS outlets and assign user roles
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Add Outlet
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { id: 'outlets', label: 'Outlets', icon: Store },
          { id: 'tax-profiles', label: 'Tax Profiles', icon: Shield },
          { id: 'gl-mappings', label: 'GL Mappings', icon: Settings },
          { id: 'terminals', label: 'Terminals', icon: Coffee },
          { id: 'shifts', label: 'Shifts', icon: Clock },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters — only show on outlets tab */}
      {activeTab === 'outlets' && (
      <>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search outlets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="pool_bar">Pool Bar</option>
          <option value="gift_shop">Gift Shop</option>
          <option value="spa">Spa</option>
          <option value="cafe">Café</option>
        </select>
      </div>

      {/* Outlets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlets.map((outlet) => {
            const Icon = getOutletIcon(outlet.outlet_type);
            return (
              <div
                key={outlet.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {outlet.name}
                      </h4>
                      <p className="text-xs text-slate-500">{getOutletTypeLabel(outlet.outlet_type)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    outlet.is_active 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {outlet.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{outlet.code}</span>
                    {outlet.location && (
                      <>
                        <span>•</span>
                        <MapPin size={12} />
                        <span>{outlet.location}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Tax: {outlet.default_tax_rate}%</span>
                    <span>•</span>
                    <span>Service: {outlet.default_service_charge}%</span>
                  </div>
                  {/* Registry Framework Fields */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      outlet.inventory_mode === 'recipe'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {outlet.inventory_mode === 'recipe' ? 'Recipe-based' : 'SKU-based'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      outlet.outlet_status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : outlet.outlet_status === 'suspended'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {outlet.outlet_status || 'active'}
                    </span>
                    {outlet.requires_guest_link && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        Guest Link
                      </span>
                    )}
                    {outlet.shift_reconciliation_required && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        Shift Recon
                      </span>
                    )}
                    {outlet.requires_kds && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                        KDS
                      </span>
                    )}
                    {outlet.outlet_category && outlet.outlet_category !== 'Other' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        {outlet.outlet_category}
                      </span>
                    )}
                  </div>
                  {/* Charge Modes */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {(outlet.charge_modes || ['cash']).map((mode: string) => (
                      <span key={mode} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[10px] font-medium">
                        {mode.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenRoleModal(outlet)}
                    className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Users size={12} />
                    Manage Roles
                  </button>
                  <button
                    onClick={() => handleEditOutlet(outlet)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Settings size={12} />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}

          {filteredOutlets.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No POS Outlets Found
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating your first POS outlet'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add Outlet
                </button>
              )}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* Tax Profiles Tab */}
      {activeTab === 'tax-profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tax Profiles</h3>
            <button
              onClick={() => setShowTaxProfileModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus size={14} />
              Add Tax Profile
            </button>
          </div>
          {taxProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No tax profiles configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxProfiles.map((profile: any) => (
                <div key={profile.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{profile.name}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingTaxProfileId(profile.id);
                          setTaxProfileForm({
                            name: profile.name || '',
                            description: profile.description || '',
                            vat_rate: profile.vat_rate || 0,
                            service_charge_rate: profile.service_charge_rate || 0,
                            is_vat_exempt: profile.is_vat_exempt || false,
                            is_service_charge_exempt: profile.is_service_charge_exempt || false,
                          });
                          setShowTaxProfileModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('auth_token');
                            const res = await fetch(`/api/pos/tax-profiles/${profile.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` },
                            });
                            if (res.ok) {
                              addNotification('Tax profile deleted', 'info', 'F&B');
                              fetchTaxProfiles();
                            } else {
                              addNotification('Failed to delete tax profile', 'warning', 'F&B');
                            }
                          } catch (err) {
                            addNotification('Failed to delete tax profile', 'warning', 'F&B');
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {profile.description && (
                    <p className="text-xs text-slate-400 mb-2">{profile.description}</p>
                  )}
                  <div className="space-y-1 text-xs text-slate-500">
                    <p>VAT Rate: <span className="font-bold text-slate-700 dark:text-slate-300">{profile.vat_rate}%</span></p>
                    <p>Service Charge: <span className="font-bold text-slate-700 dark:text-slate-300">{profile.service_charge_rate}%</span></p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {profile.is_vat_exempt && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full text-[9px] font-bold uppercase">VAT Exempt</span>
                    )}
                    {profile.is_service_charge_exempt && (
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[9px] font-bold uppercase">SC Exempt</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GL Mappings Tab */}
      {activeTab === 'gl-mappings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GL Mappings</h3>
            <button
              onClick={() => setShowGLMappingModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus size={14} />
              Add GL Mapping
            </button>
          </div>
          {glMappings.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No GL mappings configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glMappings.map((mapping: any) => (
                <div key={mapping.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{mapping.name}</h4>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p>Sales Account: {mapping.sales_account || '—'}</p>
                    <p>Tax Account: {mapping.tax_account || '—'}</p>
                    <p>Cash Account: {mapping.cash_account || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Terminals Tab */}
      {activeTab === 'terminals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">POS Terminals</h3>
            <button
              onClick={() => setShowTerminalModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus size={14} />
              Add Terminal
            </button>
          </div>
          {terminals.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No POS terminals configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminals.map((terminal: any) => (
                <div key={terminal.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{terminal.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      terminal.is_active
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {terminal.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p>Code: <span className="font-mono">{terminal.code}</span></p>
                    <p>Outlet: {terminal.outlet_id || 'Unassigned'}</p>
                    <p>Hardware ID: {terminal.hardware_id || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tax Profile Modal */}
      {showTaxProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingTaxProfileId ? 'Edit Tax Profile' : 'Add Tax Profile'}</h3>
              <button onClick={() => { setShowTaxProfileModal(false); setEditingTaxProfileId(null); setTaxProfileForm({ name: '', description: '', vat_rate: 15, service_charge_rate: 10, is_vat_exempt: false, is_service_charge_exempt: false }); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const token = localStorage.getItem('auth_token');
                const url = editingTaxProfileId ? `/api/pos/tax-profiles/${editingTaxProfileId}` : '/api/pos/tax-profiles';
                const method = editingTaxProfileId ? 'PUT' : 'POST';
                const res = await fetch(url, {
                  method,
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify(taxProfileForm),
                });
                if (res.ok) {
                  addNotification(editingTaxProfileId ? 'Tax profile updated' : 'Tax profile created', 'success', 'F&B');
                  setShowTaxProfileModal(false);
                  setEditingTaxProfileId(null);
                  setTaxProfileForm({ name: '', description: '', vat_rate: 15, service_charge_rate: 10, is_vat_exempt: false, is_service_charge_exempt: false });
                  fetchTaxProfiles();
                } else {
                  const err = await res.json();
                  addNotification(err.error || 'Failed to save tax profile', 'warning', 'F&B');
                }
              } catch (err) {
                addNotification('Failed to save tax profile', 'warning', 'F&B');
              }
            }} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Name *</label>
                <input type="text" required value={taxProfileForm.name} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" placeholder="e.g., Standard VAT" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                <input type="text" value={taxProfileForm.description} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" placeholder="e.g., Standard ERCA VAT 15%" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">VAT Rate (%)</label>
                  <input type="number" step="0.01" min="0" max="100" value={taxProfileForm.vat_rate} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, vat_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Service Charge (%)</label>
                  <input type="number" step="0.01" min="0" max="100" value={taxProfileForm.service_charge_rate} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, service_charge_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={taxProfileForm.is_vat_exempt} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, is_vat_exempt: e.target.checked })} className="rounded" />
                  VAT Exempt
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={taxProfileForm.is_service_charge_exempt} onChange={(e) => setTaxProfileForm({ ...taxProfileForm, is_service_charge_exempt: e.target.checked })} className="rounded" />
                  Service Charge Exempt
                </label>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm">
                {editingTaxProfileId ? 'Update' : 'Create'} Tax Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GL Mapping Modal Placeholder */}
      {showGLMappingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add GL Mapping</h3>
              <button onClick={() => setShowGLMappingModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">GL mapping form will be available in the next phase.</p>
            <button onClick={() => setShowGLMappingModal(false)} className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Terminal Modal Placeholder */}
      {showTerminalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add POS Terminal</h3>
              <button onClick={() => setShowTerminalModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Terminal registration form will be available in the next phase.</p>
            <button onClick={() => setShowTerminalModal(false)} className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Shifts Tab */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Reconciliation</h3>
            <select
              value={shiftFilterOutlet}
              onChange={(e) => setShiftFilterOutlet(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Outlets</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          {shifts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No shifts recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Shifts opened from POS terminals will appear here for reconciliation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift) => {
                const outlet = outlets.find((o) => o.id === shift.outlet_id);
                const variance = shift.counted_cash !== null && shift.expected_cash !== null
                  ? Number(shift.counted_cash) - Number(shift.expected_cash)
                  : null;
                return (
                  <div key={shift.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + (
                          shift.status === 'open' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          shift.status === 'closed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                        )}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {outlet?.name || 'Unknown Outlet'} — Shift #{shift.shift_number}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Cashier: {shift.cashier_name} | Opened: {new Date(shift.opened_at).toLocaleString()}
                            {shift.closed_at && ' | Closed: ' + new Date(shift.closed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ' + (
                        shift.status === 'open' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                        shift.status === 'closed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                      )}>
                        {shift.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Opening Float</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Number(shift.opening_float).toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Total Sales</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Number(shift.total_sales || 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Cash Sales</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Number(shift.total_cash_sales || 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Expected Cash</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{Number(shift.expected_cash || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {variance !== null && (
                      <div className={'mt-2 flex items-center gap-2 text-xs font-bold ' + (
                        Math.abs(variance) < 0.01 ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {Math.abs(variance) < 0.01 ? <Receipt size={12} /> : <AlertTriangle size={12} />}
                        Cash Variance: {variance >= 0 ? '+' : ''}{variance.toFixed(2)}
                      </div>
                    )}

                    {shift.status === 'open' && (
                      <button
                        onClick={() => {
                          setClosingShift(shift);
                          setCloseShiftData({ counted_cash: '', reconciliation_notes: '' });
                          setShiftSummary(null);
                        }}
                        className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign size={14} /> Close & Reconcile Shift
                      </button>
                    )}

                    {shift.reconciliation_notes && (
                      <p className="mt-2 text-xs text-slate-500 italic">Notes: {shift.reconciliation_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Close Shift Modal */}
      {closingShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Close & Reconcile Shift</h3>
              <button onClick={() => setClosingShift(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
            </div>
            {shiftSummary && (
              <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Transactions:</span><span className="font-bold text-slate-900 dark:text-white">{shiftSummary.transaction_count}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Sales:</span><span className="font-bold text-slate-900 dark:text-white">{Number(shiftSummary.total_sales).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cash Sales:</span><span className="font-bold text-slate-900 dark:text-white">{Number(shiftSummary.cash_sales).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Card Sales:</span><span className="font-bold text-slate-900 dark:text-white">{Number(shiftSummary.card_sales).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile Sales:</span><span className="font-bold text-slate-900 dark:text-white">{Number(shiftSummary.mobile_sales).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Room Charges:</span><span className="font-bold text-slate-900 dark:text-white">{Number(shiftSummary.room_charges).toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="text-slate-500 font-bold">Expected Cash:</span><span className="font-bold text-indigo-600">{Number(shiftSummary.expected_cash).toFixed(2)}</span></div>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Counted Cash *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={closeShiftData.counted_cash}
                  onChange={(e) => setCloseShiftData({ ...closeShiftData, counted_cash: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reconciliation Notes</label>
                <textarea
                  value={closeShiftData.reconciliation_notes}
                  onChange={(e) => setCloseShiftData({ ...closeShiftData, reconciliation_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Any notes about discrepancies..."
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const res = await fetch(`/api/pos/shifts/${closingShift.id}/close`, {
                      method: 'PUT',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        counted_cash: parseFloat(closeShiftData.counted_cash) || 0,
                        reconciliation_notes: closeShiftData.reconciliation_notes,
                      }),
                    });
                    if (res.ok) {
                      addNotification('Shift closed and reconciled successfully', 'success', 'F&B');
                      setClosingShift(null);
                      fetchShifts();
                    } else {
                      const err = await res.json();
                      addNotification(err.error || 'Failed to close shift', 'warning', 'F&B');
                    }
                  } catch (err) {
                    addNotification('Failed to close shift', 'warning', 'F&B');
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm"
              >
                Close Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingOutlet ? 'Edit POS Outlet' : 'Add POS Outlet'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingOutlet ? handleUpdateOutlet : handleCreateOutlet} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  placeholder="e.g., Main Restaurant"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Outlet Type *
                </label>
                <select
                  required
                  value={formData.outlet_type}
                  onChange={(e) => setFormData({ ...formData, outlet_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="bar">Bar</option>
                  <option value="pool_bar">Pool Bar</option>
                  <option value="gift_shop">Gift Shop</option>
                  <option value="spa">Spa</option>
                  <option value="cafe">Café</option>
                  <option value="reception">Reception</option>
                  <option value="room_service">Room Service</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Outlet Category *
                </label>
                <select
                  required
                  value={formData.outlet_category}
                  onChange={(e) => setFormData({ ...formData, outlet_category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="FoodBeverage">Food &amp; Beverage</option>
                  <option value="Retail">Retail</option>
                  <option value="Service">Service</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Outlet Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g., REST-MAIN"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  rows={2}
                  placeholder="Brief description of the outlet"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  placeholder="e.g., Ground Floor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.default_tax_rate}
                    onChange={(e) => setFormData({ ...formData, default_tax_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.default_service_charge}
                    onChange={(e) => setFormData({ ...formData, default_service_charge: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Outlet Registry Framework Fields */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Settings size={16} />
                  Outlet Registry Framework
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Inventory Mode
                    </label>
                    <select
                      value={formData.inventory_mode}
                      onChange={(e) => setFormData({ ...formData, inventory_mode: e.target.value as 'recipe' | 'sku' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    >
                      <option value="sku">SKU-based (Direct Stock)</option>
                      <option value="recipe">Recipe-based (BOM Deduction)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Status
                    </label>
                    <select
                      value={formData.outlet_status}
                      onChange={(e) => setFormData({ ...formData, outlet_status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Tax Profile
                  </label>
                  <select
                    value={formData.tax_profile_id}
                    onChange={(e) => setFormData({ ...formData, tax_profile_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select tax profile...</option>
                    {taxProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (VAT: {p.vat_rate}%, Service: {p.service_charge_rate}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    GL Mapping
                  </label>
                  <select
                    value={formData.gl_mapping_id}
                    onChange={(e) => setFormData({ ...formData, gl_mapping_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select GL mapping...</option>
                    {glMappings.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Revenue: {m.revenue_account_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Charge Modes
                    </label>
                    <div className="space-y-2">
                      {['cash', 'card', 'room_folio', 'mobile_money'].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.charge_modes.includes(mode)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, charge_modes: [...formData.charge_modes, mode] });
                              } else {
                                setFormData({ ...formData, charge_modes: formData.charge_modes.filter(m => m !== mode) });
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300 capitalize">
                            {mode.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_guest_link}
                        onChange={(e) => setFormData({ ...formData, requires_guest_link: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        Requires Guest Link
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shift_reconciliation_required}
                        onChange={(e) => setFormData({ ...formData, shift_reconciliation_required: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        Shift Reconciliation
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_kds}
                        onChange={(e) => setFormData({ ...formData, requires_kds: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        Requires KDS (Kitchen Display)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Create Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && selectedOutlet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Manage Roles - {selectedOutlet.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedOutlet.code}</p>
              </div>
              <button
                onClick={() => { setShowRoleModal(false); setEditingRoleId(null); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Current Users */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Assigned Users ({outletRoles.length})
                </h4>
                <div className="space-y-2">
                  {outletRoles.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No users assigned to this outlet
                    </div>
                  ) : (
                    outletRoles.map((role) => {
                      const isEditing = editingRoleId === role.id;
                      const permCount = role.permissions
                        ? Object.values(role.permissions).reduce((sum, actions) => sum + (actions?.length || 0), 0)
                        : Object.values(getRolePermissions(role.role)).reduce((sum, actions) => sum + (actions?.length || 0), 0);

                      return (
                        <div
                          key={role.id}
                          className={`bg-slate-50 dark:bg-slate-900 rounded-xl border transition-all ${
                            isEditing ? 'border-indigo-400 shadow-sm' : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                  {role.user?.name?.charAt(0).toUpperCase() || role.user?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {role.user?.name || role.user?.email || 'Unknown User'}
                                </p>
                                {role.user?.email && role.user?.name && (
                                  <p className="text-xs text-slate-500 truncate">{role.user.email}</p>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase">
                                    {role.role}
                                  </span>
                                  {role.is_primary && (
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full font-bold">
                                      Primary
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                    <Shield size={10} /> {permCount} perms
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => startEditRole(role)}
                                className={`p-2 rounded-lg transition-all ${
                                  isEditing
                                    ? 'bg-indigo-600 text-white'
                                    : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                }`}
                                title="Edit permissions"
                              >
                                {isEditing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <button
                                onClick={() => handleRemoveRole(role.user_id)}
                                className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-all"
                                title="Remove user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Role
                                  </label>
                                  <select
                                    value={editFormData.role}
                                    onChange={(e) => handleEditRoleChange(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                  >
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="server">Server</option>
                                    <option value="bartender">Bartender</option>
                                    <option value="staff">Staff</option>
                                  </select>
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 cursor-pointer pb-1.5">
                                    <input
                                      type="checkbox"
                                      checked={editFormData.is_primary}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Set as Primary</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Permissions
                                  </label>
                                  <span className="text-[10px] text-slate-400">
                                    {Object.values(editFormData.permissions).reduce((s, a) => s + (a?.length || 0), 0)} active
                                  </span>
                                </div>
                                <PermissionChecklist
                                  permissions={editFormData.permissions}
                                  onChange={handleEditPermissionToggle}
                                  categories={POS_PERMISSION_CATEGORIES}
                                  maxHeight="max-h-52"
                                />
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => setEditingRoleId(null)}
                                  className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(role.id)}
                                  disabled={savingRoleId === role.id}
                                  className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  {savingRoleId === role.id ? (
                                    <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Saving...</>
                                  ) : (
                                    <><Save size={12} /> Save Changes</>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Assign User Form */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserPlus size={16} />
                  Assign New User
                </h4>
                <form onSubmit={handleAssignRole} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        User *
                      </label>
                      <select
                        required
                        value={roleFormData.user_id}
                        onChange={(e) => setRoleFormData(prev => ({ ...prev, user_id: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="">Select a user...</option>
                        {systemUsers
                          .filter(u => u.authUserId)
                          .map((user) => (
                            <option key={user.id} value={user.authUserId}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Role *
                      </label>
                      <select
                        required
                        value={roleFormData.role}
                        onChange={(e) => handleNewRoleChange(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="manager">Manager</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="cashier">Cashier</option>
                        <option value="server">Server</option>
                        <option value="bartender">Bartender</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleFormData.is_primary}
                        onChange={(e) => setRoleFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">Set as Primary</span>
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Permissions (pre-filled from role, customize as needed)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {Object.values(roleFormData.permissions).reduce((s, a) => s + (a?.length || 0), 0)} active
                      </span>
                    </div>
                    <PermissionChecklist
                      permissions={roleFormData.permissions}
                      onChange={handleNewPermissionToggle}
                      categories={POS_PERMISSION_CATEGORIES}
                      maxHeight="max-h-52"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={14} />
                    Assign User
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
