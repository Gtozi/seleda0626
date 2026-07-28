/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Utensils,
  RefreshCw,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface Outlet {
  id: string;
  name: string;
  type: 'Restaurant' | 'Bar' | 'RoomService' | 'Banquet' | 'Minibar';
  operating_hours: any;
  revenue_center_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function OutletManagement() {
  const { formatAmount, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'outlets' | 'configuration'>('outlets');
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Restaurant' as 'Restaurant' | 'Bar' | 'RoomService' | 'Banquet' | 'Minibar',
    revenue_center_code: '',
    is_active: true
  });

  const tabs = [
    { id: 'outlets', label: 'Outlets', icon: Building2 },
    { id: 'configuration', label: 'Configuration', icon: Settings },
  ];

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fb/outlets');
      if (!response.ok) throw new Error('Failed to fetch outlets');
      const data = await response.json();
      setOutlets(data.data || data || []);
    } catch (error) {
      console.error('Error fetching outlets:', error);
      addNotification('Failed to load outlets', 'warning', 'F&B');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleCreateOutlet = () => {
    setEditingOutlet(null);
    setFormData({
      name: '',
      type: 'Restaurant',
      revenue_center_code: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditOutlet = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      type: outlet.type,
      revenue_center_code: outlet.revenue_center_code || '',
      is_active: outlet.is_active
    });
    setShowModal(true);
  };

  const handleSaveOutlet = async () => {
    try {
      const url = editingOutlet 
        ? `/api/fb/outlets/${editingOutlet.id}`
        : '/api/fb/outlets';
      
      const method = editingOutlet ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save outlet');

      addNotification(editingOutlet ? 'Outlet updated successfully' : 'Outlet created successfully', 'success', 'F&B');
      setShowModal(false);
      fetchOutlets();
    } catch (error) {
      console.error('Error saving outlet:', error);
      addNotification('Failed to save outlet', 'warning', 'F&B');
    }
  };

  const handleDeleteOutlet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this outlet?')) return;
    
    try {
      const response = await fetch(`/api/fb/outlets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete outlet');

      addNotification('Outlet deleted successfully', 'success', 'F&B');
      fetchOutlets();
    } catch (error) {
      console.error('Error deleting outlet:', error);
      addNotification('Failed to delete outlet', 'warning', 'F&B');
    }
  };

  const activeOutlets = outlets.filter(o => o.is_active).length;
  const totalOutlets = outlets.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Outlet Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure and manage F&B outlets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOutlets} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button onClick={handleCreateOutlet} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Outlet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Outlets" value={String(totalOutlets)} icon={Building2} color="indigo" />
        <KPICard label="Active Outlets" value={String(activeOutlets)} icon={Clock} color="green" />
        <KPICard label="Outlet Types" value="5" icon={Utensils} color="amber" />
        <KPICard label="Configured" value="8" icon={Settings} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'outlets' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading outlets...</div>
            ) : outlets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No outlets found</p>
                <p className="text-xs mt-1">Click "Add Outlet" to create your first outlet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outlets.map((outlet) => (
                  <div key={outlet.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{outlet.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{outlet.type} • {outlet.revenue_center_code || 'No revenue center'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          outlet.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>{outlet.is_active ? 'Active' : 'Inactive'}</span>
                        <button onClick={() => handleEditOutlet(outlet)} className="p-1 text-slate-400 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteOutlet(outlet.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Settings className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Outlet Configuration module</p>
              <p className="text-xs mt-1">Configure revenue centers, cost centers, operating hours, and more</p>
            </div>
          </div>
        )}
      </div>

      {/* Outlet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingOutlet ? 'Edit Outlet' : 'New Outlet'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Outlet Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Outlet Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Bar">Bar</option>
                  <option value="RoomService">Room Service</option>
                  <option value="Banquet">Banquet</option>
                  <option value="Minibar">Minibar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Revenue Center Code</label>
                <input
                  type="text"
                  value={formData.revenue_center_code}
                  onChange={(e) => setFormData({ ...formData, revenue_center_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveOutlet}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingOutlet ? 'Update Outlet' : 'Create Outlet'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function KPICard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
