/**
 * External Vendor Management Module
 * Manage tour operators, restaurants, taxi companies, and service providers
 */

import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Star, Plus, RefreshCw, Search, Edit, Trash2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  status: string;
  withholding_rate?: number;
  balance?: number;
  created_at: string;
}

const VendorManagementModule: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    category: 'Operations',
    status: 'Active',
    withholding_rate: 0
  });

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      params.append('status', 'Active');
      
      const response = await fetch(`/api/concierge/vendors?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [filterCategory]);

  // Create new vendor
  const handleCreateVendor = async () => {
    try {
      const response = await fetch('/api/concierge/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewVendor({
          name: '',
          contact_name: '',
          email: '',
          phone: '',
          address: '',
          category: 'Operations',
          status: 'Active',
          withholding_rate: 0
        });
        fetchVendors();
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(q) ||
      vendor.contact_name?.toLowerCase().includes(q) ||
      vendor.email?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Inactive': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
      'Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    };
    return colors[status] || colors['Active'];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">External Vendor Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage tour operators, restaurants, taxi companies, and service providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchVendors}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          >
            <option value="">All Categories</option>
            <option value="Operations">Operations</option>
            <option value="Transportation">Transportation</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Tours">Tours</option>
            <option value="Medical">Medical</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>
      </div>

      {/* Add Vendor Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Vendor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={newVendor.contact_name}
                onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newVendor.category}
                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Operations">Operations</option>
                <option value="Transportation">Transportation</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Tours">Tours</option>
                <option value="Medical">Medical</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={newVendor.status}
                onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Hold">Hold</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter address"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateVendor}
              disabled={!newVendor.name}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Add Vendor
            </button>
          </div>
        </div>
      )}

      {/* Vendors List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading vendors...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No vendors found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{vendor.name}</div>
                        {vendor.address && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{vendor.address}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {vendor.contact_name && (
                        <div className="text-sm text-slate-700 dark:text-slate-300">{vendor.contact_name}</div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {vendor.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {vendor.email}
                          </span>
                        )}
                        {vendor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {vendor.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {vendor.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    ${vendor.balance?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                        <Edit size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded transition">
                        <Trash2 size={16} className="text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorManagementModule;