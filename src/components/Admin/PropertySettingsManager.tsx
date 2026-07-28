import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  ChevronRight,
  Search,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info
} from 'lucide-react';

interface Property {
  id: string;
  property_name: string;
  property_code: string;
  organization_id: string;
}

interface Organization {
  id: string;
  org_name: string;
  org_code: string;
}

interface SettingDefinition {
  id: string;
  setting_key: string;
  setting_name: string;
  description: string;
  setting_type: string;
  default_value: any;
  category: string;
  scope_level: string;
}

interface PropertySetting {
  id: string;
  property_id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  is_encrypted: boolean;
  source: string;
}

export default function PropertySettingsManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [settingDefinitions, setSettingDefinitions] = useState<SettingDefinition[]>([]);
  const [propertySettings, setPropertySettings] = useState<PropertySetting[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        if (data.length > 0 && !selectedProperty) {
          setSelectedProperty(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

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

  const fetchSettingDefinitions = async () => {
    try {
      const res = await fetch('/api/admin/setting-definitions');
      if (res.ok) {
        const data = await res.json();
        setSettingDefinitions(data);
      }
    } catch (error) {
      console.error('Failed to fetch setting definitions:', error);
    }
  };

  const fetchPropertySettings = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/settings`);
      if (res.ok) {
        const data = await res.json();
        setPropertySettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch property settings:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProperties(),
        fetchOrganizations(),
        fetchSettingDefinitions()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertySettings(selectedProperty.id);
    }
  }, [selectedProperty]);

  const handleSettingChange = (settingKey: string, value: any) => {
    const updatedSettings = propertySettings.map(s =>
      s.setting_key === settingKey ? { ...s, setting_value: value } : s
    );
    setPropertySettings(updatedSettings);
    setUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/admin/properties/${selectedProperty.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertySettings)
      });
      if (res.ok) {
        setUnsavedChanges(false);
        fetchPropertySettings(selectedProperty.id);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetToDefault = async (settingKey: string) => {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/admin/properties/${selectedProperty.id}/settings/${settingKey}/reset`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchPropertySettings(selectedProperty.id);
      }
    } catch (error) {
      console.error('Failed to reset setting:', error);
    }
  };

  const getSettingValue = (settingKey: string) => {
    const setting = propertySettings.find(s => s.setting_key === settingKey);
    return setting?.setting_value;
  };

  const getSettingSource = (settingKey: string) => {
    const setting = propertySettings.find(s => s.setting_key === settingKey);
    return setting?.source || 'default';
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.org_name || '';
  };

  const categories = ['all', ...Array.from(new Set(settingDefinitions.map(s => s.category)))];

  const filteredSettings = settingDefinitions.filter(def => {
    const matchesCategory = selectedCategory === 'all' || def.category === selectedCategory;
    const matchesSearch = def.setting_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         def.setting_key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderSettingInput = (def: SettingDefinition, value: any, source: string) => {
    const isOverridden = source === 'property';
    
    switch (def.setting_type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleSettingChange(def.setting_key, e.target.checked)}
              className="sr-only peer"
              disabled={!selectedProperty}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(def.setting_key, parseFloat(e.target.value))}
            className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            disabled={!selectedProperty}
          />
        );
      case 'array':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
              handleSettingChange(def.setting_key, selected);
            }}
            className="w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-sm h-24"
            disabled={!selectedProperty}
          >
            {def.allowed_values?.map((v: string, i: number) => (
              <option key={i} value={v}>{v}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            onChange={(e) => {
              const parsed = def.setting_type === 'number' ? parseFloat(e.target.value) : e.target.value;
              handleSettingChange(def.setting_key, parsed);
            }}
            className="w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            disabled={!selectedProperty}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Property Settings</h2>
          <p className="text-sm text-slate-500">Manage property-level settings with inheritance from organization defaults</p>
        </div>
        {unsavedChanges && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Property Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
          Select Property
        </label>
        <div className="flex items-center gap-4">
          <select
            value={selectedProperty?.id || ''}
            onChange={(e) => {
              const prop = properties.find(p => p.id === e.target.value);
              setSelectedProperty(prop || null);
              setUnsavedChanges(false);
            }}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            disabled={loading}
          >
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.property_name} ({prop.property_code}) - {getOrgName(prop.organization_id)}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedProperty && fetchPropertySettings(selectedProperty.id)}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition"
            disabled={!selectedProperty}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading settings...</div>
        ) : !selectedProperty ? (
          <div className="p-8 text-center text-slate-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Select a property to view settings</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSettings.map(def => {
              const value = getSettingValue(def.setting_key);
              const source = getSettingSource(def.setting_key);
              const isOverridden = source === 'property';
              
              return (
                <div key={def.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${isOverridden ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        {isOverridden ? <Lock className="w-5 h-5 text-indigo-600" /> : <Unlock className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{def.setting_name}</h4>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                            {def.setting_key}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            source === 'property' ? 'bg-indigo-100 text-indigo-700' :
                            source === 'organization' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {source === 'property' ? 'Custom' : source === 'organization' ? 'Inherited' : 'Default'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{def.description}</p>
                        <div className="flex items-center gap-4">
                          {renderSettingInput(def, value, source)}
                          {isOverridden && (
                            <button
                              onClick={() => handleResetToDefault(def.setting_key)}
                              className="text-xs text-slate-600 hover:text-slate-900 underline"
                            >
                              Reset to default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setShowEncrypted(!showEncrypted)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                        title={showEncrypted ? 'Hide value' : 'Show value'}
                      >
                        {showEncrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">Setting Inheritance</h4>
          <p className="text-sm text-blue-700">
            Settings can be defined at the organization level (inherited by all properties) or overridden at the property level. 
            Property-level settings take precedence over organization defaults.
          </p>
        </div>
      </div>
    </div>
  );
}
