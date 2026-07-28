import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Search,
  Star,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Organization {
  id: string;
  org_name: string;
  org_code: string;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  organization_id: string;
  property_name: string;
  property_code: string;
  property_type: string;
  star_rating: number;
  address: any;
  timezone: string;
  currency_code: string;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PropertyHierarchy {
  id: string;
  parent_property_id: string;
  child_property_id: string;
  relationship_type: string;
  is_active: boolean;
}

export default function OrganizationHierarchyManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [hierarchy, setHierarchy] = useState<PropertyHierarchy[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'organizations' | 'properties' | 'hierarchy'>('organizations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [orgFormData, setOrgFormData] = useState({
    org_name: '',
    org_code: '',
    description: '',
    contact_email: '',
    contact_phone: ''
  });
  const [propertyFormData, setPropertyFormData] = useState({
    property_name: '',
    property_code: '',
    property_type: 'hotel',
    star_rating: 3,
    timezone: 'Africa/Addis_Ababa',
    currency_code: 'ETB',
    contact_email: '',
    contact_phone: ''
  });

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
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

  const fetchHierarchy = async () => {
    try {
      const res = await fetch('/api/admin/property-hierarchy');
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      }
    } catch (error) {
      console.error('Failed to fetch hierarchy:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrganizations(), fetchProperties(), fetchHierarchy()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateOrg = async () => {
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgFormData)
      });
      if (res.ok) {
        setShowOrgModal(false);
        setOrgFormData({
          org_name: '',
          org_code: '',
          description: '',
          contact_email: '',
          contact_phone: ''
        });
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handleUpdateOrg = async () => {
    if (!editingOrg) return;
    try {
      const res = await fetch(`/api/admin/organizations/${editingOrg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgFormData)
      });
      if (res.ok) {
        setShowOrgModal(false);
        setEditingOrg(null);
        setOrgFormData({
          org_name: '',
          org_code: '',
          description: '',
          contact_email: '',
          contact_phone: ''
        });
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchOrganizations();
        fetchProperties();
      }
    } catch (error) {
      console.error('Failed to delete organization:', error);
    }
  };

  const handleCreateProperty = async () => {
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...propertyFormData, organization_id: selectedOrg?.id })
      });
      if (res.ok) {
        setShowPropertyModal(false);
        setPropertyFormData({
          property_name: '',
          property_code: '',
          property_type: 'hotel',
          star_rating: 3,
          timezone: 'Africa/Addis_Ababa',
          currency_code: 'ETB',
          contact_email: '',
          contact_phone: ''
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  const openOrgModal = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setOrgFormData({
        org_name: org.org_name,
        org_code: org.org_code,
        description: org.description || '',
        contact_email: org.contact_email || '',
        contact_phone: org.contact_phone || ''
      });
    } else {
      setEditingOrg(null);
      setOrgFormData({
        org_name: '',
        org_code: '',
        description: '',
        contact_email: '',
        contact_phone: ''
      });
    }
    setShowOrgModal(true);
  };

  const openPropertyModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setPropertyFormData({
        property_name: property.property_name,
        property_code: property.property_code,
        property_type: property.property_type,
        star_rating: property.star_rating,
        timezone: property.timezone,
        currency_code: property.currency_code,
        contact_email: property.contact_email || '',
        contact_phone: property.contact_phone || ''
      });
    } else {
      setEditingProperty(null);
      setPropertyFormData({
        property_name: '',
        property_code: '',
        property_type: 'hotel',
        star_rating: 3,
        timezone: 'Africa/Addis_Ababa',
        currency_code: 'ETB',
        contact_email: '',
        contact_phone: ''
      });
    }
    setShowPropertyModal(true);
  };

  const getOrgProperties = (orgId: string) => {
    return properties.filter(p => p.organization_id === orgId);
  };

  const filteredOrgs = organizations.filter(org =>
    org.org_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.org_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organization Hierarchy</h2>
          <p className="text-sm text-slate-500">Manage multi-property organization structure</p>
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
              <p className="text-xs text-slate-500 font-medium">Hierarchy Relations</p>
              <p className="text-2xl font-bold text-slate-900">{hierarchy.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('organizations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'organizations'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organizations
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'properties'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'hierarchy'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          Hierarchy
        </button>
      </div>

      {/* Search */}
      {(activeTab === 'organizations' || activeTab === 'properties') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'organizations' ? 'Search organizations...' : 'Search properties...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Organizations</h3>
            <button
              onClick={() => openOrgModal()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              New Organization
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : filteredOrgs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No organizations found</p>
              </div>
            ) : (
              filteredOrgs.map(org => {
                const orgProperties = getOrgProperties(org.id);
                return (
                  <div key={org.id} className="p-6 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${org.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900">{org.org_name}</h4>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                              {org.org_code}
                            </span>
                            {!org.is_active && (
                              <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-3">{org.description || 'No description'}</p>
                          <div className="flex gap-4 text-xs mb-3">
                            {org.contact_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-slate-600">{org.contact_email}</span>
                              </div>
                            )}
                            {org.contact_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span className="text-slate-600">{org.contact_phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="text-slate-600">{orgProperties.length} Properties</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedOrg(org);
                            setActiveTab('properties');
                          }}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                          title="View Properties"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openOrgModal(org)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrg(org.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              Properties {selectedOrg && `(${selectedOrg.org_name})`}
            </h3>
            {selectedOrg && (
              <button
                onClick={() => openPropertyModal()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                New Property
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No properties found</p>
              </div>
            ) : (
              properties
                .filter(p => !selectedOrg || p.organization_id === selectedOrg.id)
                .map(property => {
                  const org = organizations.find(o => o.id === property.organization_id);
                  return (
                    <div key={property.id} className="p-6 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${property.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900">{property.property_name}</h4>
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                                {property.property_code}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(property.star_rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              {!property.is_active && (
                                <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{org?.org_code} • {property.property_type}</p>
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span className="text-slate-600">{property.timezone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-600">{property.currency_code}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => openPropertyModal(property)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Property hierarchy relationships will be displayed here.</p>
        </div>
      )}

      {/* Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingOrg ? 'Edit Organization' : 'New Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgFormData.org_name}
                  onChange={(e) => setOrgFormData({ ...orgFormData, org_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g., SELEDA Hotels"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Organization Code
                </label>
                <input
                  type="text"
                  value={orgFormData.org_code}
                  onChange={(e) => setOrgFormData({ ...orgFormData, org_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                  placeholder="e.g., SELEDA"
                  disabled={!!editingOrg}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={orgFormData.description}
                  onChange={(e) => setOrgFormData({ ...orgFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="Describe this organization..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={orgFormData.contact_email}
                    onChange={(e) => setOrgFormData({ ...orgFormData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={orgFormData.contact_phone}
                    onChange={(e) => setOrgFormData({ ...orgFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOrgModal(false);
                  setEditingOrg(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={editingOrg ? handleUpdateOrg : handleCreateOrg}
                disabled={!orgFormData.org_name || !orgFormData.org_code}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {editingOrg ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingProperty ? 'Edit Property' : 'New Property'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  value={propertyFormData.property_name}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, property_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g., SELEDA Main Hotel"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Property Code
                </label>
                <input
                  type="text"
                  value={propertyFormData.property_code}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, property_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                  placeholder="e.g., MAIN"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={propertyFormData.property_type}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, property_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="motel">Motel</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Star Rating
                  </label>
                  <select
                    value={propertyFormData.star_rating}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, star_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Timezone
                  </label>
                  <select
                    value={propertyFormData.timezone}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={propertyFormData.currency_code}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, currency_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  setEditingProperty(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProperty}
                disabled={!propertyFormData.property_name || !propertyFormData.property_code}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
