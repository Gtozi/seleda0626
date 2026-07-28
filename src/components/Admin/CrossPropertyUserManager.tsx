import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  ChevronRight,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';
import { PermissionChecklist, PERMISSION_CATEGORIES } from '../Shared/PermissionChecklist';

interface Organization {
  id: string;
  org_name: string;
  org_code: string;
}

interface Property {
  id: string;
  property_name: string;
  property_code: string;
  organization_id: string;
}

interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  is_global: boolean;
  user_email?: string;
  user_name?: string;
}

interface PropertyUser {
  id: string;
  property_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  permissions: any;
  user_email?: string;
  user_name?: string;
}

export default function CrossPropertyUserManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([]);
  const [propertyUsers, setPropertyUsers] = useState<PropertyUser[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'org-users' | 'property-users'>('org-users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    user_email: '',
    role: 'member',
    is_global: false,
    permissions: {}
  });

  // Helper function to get permissions for cross-property roles
  const getRolePermissions = (role: string): Record<string, string[]> => {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      admin: {
        users: ['read', 'create', 'update', 'delete'],
        roles: ['read', 'create', 'update', 'delete'],
        bookings: ['read', 'create', 'update', 'delete', 'check_in', 'check_out'],
        rooms: ['read', 'create', 'update', 'delete'],
        guests: ['read', 'create', 'update', 'delete'],
        reports: ['read', 'export'],
        billing: ['read', 'create', 'update', 'refund'],
        inventory: ['read', 'create', 'update', 'delete'],
        settings: ['read', 'update'],
        audit: ['read']
      },
      manager: {
        users: ['read', 'create', 'update'],
        roles: ['read'],
        bookings: ['read', 'create', 'update', 'check_in', 'check_out'],
        rooms: ['read', 'update'],
        guests: ['read', 'create', 'update'],
        reports: ['read'],
        billing: ['read', 'create', 'update'],
        inventory: ['read', 'create', 'update'],
        settings: ['read'],
        audit: ['read']
      },
      member: {
        users: ['read'],
        roles: [],
        bookings: ['read', 'create'],
        rooms: ['read'],
        guests: ['read'],
        reports: [],
        billing: [],
        inventory: [],
        settings: [],
        audit: []
      },
      viewer: {
        users: ['read'],
        roles: [],
        bookings: ['read'],
        rooms: ['read'],
        guests: ['read'],
        reports: ['read'],
        billing: ['read'],
        inventory: ['read'],
        settings: [],
        audit: []
      }
    };

    return rolePermissions[role] || {};
  };

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
        if (data.length > 0 && !selectedOrg) {
          setSelectedOrg(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const fetchOrgUsers = async (orgId: string) => {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/users`);
      if (res.ok) {
        const data = await res.json();
        setOrgUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch org users:', error);
    }
  };

  const fetchPropertyUsers = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/users`);
      if (res.ok) {
        const data = await res.json();
        setPropertyUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch property users:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrganizations(), fetchProperties()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrgUsers(selectedOrg.id);
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyUsers(selectedProperty.id);
    }
  }, [selectedProperty]);

  const handleAssignOrgUser = async () => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/admin/organizations/${selectedOrg.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignFormData)
      });
      if (res.ok) {
        setShowAssignModal(false);
        setAssignFormData({
          user_email: '',
          role: 'member',
          is_global: false,
          permissions: {}
        });
        fetchOrgUsers(selectedOrg.id);
      }
    } catch (error) {
      console.error('Failed to assign org user:', error);
    }
  };

  const handleAssignPropertyUser = async () => {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/admin/properties/${selectedProperty.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignFormData)
      });
      if (res.ok) {
        setShowAssignModal(false);
        setAssignFormData({
          user_email: '',
          role: 'member',
          is_global: false,
          permissions: {}
        });
        fetchPropertyUsers(selectedProperty.id);
      }
    } catch (error) {
      console.error('Failed to assign property user:', error);
    }
  };

  const handleRemoveOrgUser = async (userId: string) => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/admin/organizations/${selectedOrg.id}/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchOrgUsers(selectedOrg.id);
      }
    } catch (error) {
      console.error('Failed to remove org user:', error);
    }
  };

  const handleRemovePropertyUser = async (userId: string) => {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/admin/properties/${selectedProperty.id}/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPropertyUsers(selectedProperty.id);
      }
    } catch (error) {
      console.error('Failed to remove property user:', error);
    }
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.org_name || '';
  };

  const getPropertyName = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    return prop?.property_name || '';
  };

  const filteredOrgUsers = orgUsers.filter(u =>
    (u.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPropertyUsers = propertyUsers.filter(u =>
    (u.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cross-Property User Management</h2>
          <p className="text-sm text-slate-500">Manage user access across organizations and properties</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Organizations</p>
              <p className="text-2xl font-bold text-slate-900">{organizations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Properties</p>
              <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{orgUsers.length + propertyUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('org-users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'org-users'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organization Users
        </button>
        <button
          onClick={() => setActiveTab('property-users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'property-users'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Property Users
        </button>
      </div>

      {/* Organization Selector for Org Users */}
      {activeTab === 'org-users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Select Organization
          </label>
          <select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value);
              setSelectedOrg(org || null);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            disabled={loading}
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.org_name} ({org.org_code})</option>
            ))}
          </select>
        </div>
      )}

      {/* Property Selector for Property Users */}
      {activeTab === 'property-users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Select Property
          </label>
          <select
            value={selectedProperty?.id || ''}
            onChange={(e) => {
              const prop = properties.find(p => p.id === e.target.value);
              setSelectedProperty(prop || null);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            disabled={loading}
          >
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.property_name} ({prop.property_code}) - {getOrgName(prop.organization_id)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Organization Users List */}
      {activeTab === 'org-users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              Organization Users {selectedOrg && `(${selectedOrg.org_name})`}
            </h3>
            {selectedOrg && (
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  setAssignFormData({
                    user_email: '',
                    role: 'member',
                    is_global: false,
                    permissions: {}
                  });
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                Assign User
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : !selectedOrg ? (
              <div className="p-8 text-center text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Select an organization to view users</p>
              </div>
            ) : filteredOrgUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No users assigned to this organization</p>
              </div>
            ) : (
              filteredOrgUsers.map(user => (
                <div key={user.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{user.user_name || 'Unknown User'}</h4>
                          {user.is_global && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Global Access
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{user.user_email || 'No email'}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className="text-slate-600">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOrgUser(user.user_id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Property Users List */}
      {activeTab === 'property-users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              Property Users {selectedProperty && `(${selectedProperty.property_name})`}
            </h3>
            {selectedProperty && (
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  setAssignFormData({
                    user_email: '',
                    role: 'member',
                    is_global: false,
                    permissions: {}
                  });
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                Assign User
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : !selectedProperty ? (
              <div className="p-8 text-center text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Select a property to view users</p>
              </div>
            ) : filteredPropertyUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No users assigned to this property</p>
              </div>
            ) : (
              filteredPropertyUsers.map(user => (
                <div key={user.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${user.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{user.user_name || 'Unknown User'}</h4>
                          {!user.is_active && (
                            <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{user.user_email || 'No email'}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className="text-slate-600">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePropertyUser(user.user_id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Assign User to {activeTab === 'org-users' ? 'Organization' : 'Property'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={assignFormData.user_email}
                  onChange={(e) => setAssignFormData({ ...assignFormData, user_email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role
                </label>
                <select
                  value={assignFormData.role}
                  onChange={(e) => setAssignFormData({ ...assignFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Role Permissions
                </label>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <PermissionChecklist
                    permissions={getRolePermissions(assignFormData.role)}
                    onChange={() => {}}
                    categories={PERMISSION_CATEGORIES}
                  />
                </div>
              </div>

              {activeTab === 'org-users' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-global"
                    checked={assignFormData.is_global}
                    onChange={(e) => setAssignFormData({ ...assignFormData, is_global: e.target.checked })}
                    className="w-4 h-4 border-slate-300 rounded"
                  />
                  <label htmlFor="is-global" className="text-sm text-slate-700">
                    Global Access (access to all properties in organization)
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignFormData({
                    user_email: '',
                    role: 'member',
                    is_global: false,
                    permissions: {}
                  });
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'org-users' ? handleAssignOrgUser : handleAssignPropertyUser}
                disabled={!assignFormData.user_email}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
