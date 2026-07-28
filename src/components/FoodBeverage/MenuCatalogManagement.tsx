/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Utensils,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Clock,
  DollarSign,
  Tag,
  Layers,
  QrCode
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface MenuItem {
  id: string;
  outlet_id: string;
  name: string;
  category: string;
  selling_price: number;
  tax_code: string | null;
  is_active: boolean;
  pos_button_group: string | null;
  meal_periods: string[] | null;
  is_fixed_menu: boolean;
  created_at: string;
  updated_at: string;
}

export default function MenuCatalogManagement() {
  const { formatAmount, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'items' | 'modifiers' | 'availability' | 'digital'>('items');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    selling_price: 0,
    tax_code: '',
    is_active: true,
    pos_button_group: '',
    is_fixed_menu: false
  });

  const tabs = [
    { id: 'items', label: 'Menu Items', icon: Utensils },
    { id: 'modifiers', label: 'Modifiers', icon: Layers },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'digital', label: 'Digital Menu', icon: QrCode },
  ];

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fb/menu-items');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data.data || data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      addNotification('Failed to load menu items', 'warning', 'F&B');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      selling_price: 0,
      tax_code: '',
      is_active: true,
      pos_button_group: '',
      is_fixed_menu: false
    });
    setShowModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      selling_price: item.selling_price,
      tax_code: item.tax_code || '',
      is_active: item.is_active,
      pos_button_group: item.pos_button_group || '',
      is_fixed_menu: item.is_fixed_menu
    });
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const url = editingItem 
        ? `/api/fb/menu-items/${editingItem.id}`
        : '/api/fb/menu-items';
      
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save menu item');

      addNotification(editingItem ? 'Menu item updated successfully' : 'Menu item created successfully', 'success', 'F&B');
      setShowModal(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      addNotification('Failed to save menu item', 'warning', 'F&B');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const response = await fetch(`/api/fb/menu-items/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete menu item');

      addNotification('Menu item deleted successfully', 'success', 'F&B');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      addNotification('Failed to delete menu item', 'warning', 'F&B');
    }
  };

  const activeItems = menuItems.filter(i => i.is_active).length;
  const totalItems = menuItems.length;
  const avgPrice = menuItems.length > 0 ? menuItems.reduce((sum, i) => sum + i.selling_price, 0) / menuItems.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Menu & Catalog Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Single source of truth for all menus</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMenuItems} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button onClick={handleCreateItem} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Items" value={String(totalItems)} icon={Utensils} color="indigo" />
        <KPICard label="Active Items" value={String(activeItems)} icon={BookOpen} color="green" />
        <KPICard label="Categories" value="8" icon={Layers} color="amber" />
        <KPICard label="Avg Price" value={formatAmount(avgPrice)} icon={DollarSign} color="purple" />
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
        {activeTab === 'items' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading menu items...</div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Utensils className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No menu items found</p>
                <p className="text-xs mt-1">Click "Add Item" to create your first menu item</p>
              </div>
            ) : (
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} • {formatAmount(item.selling_price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                        <button onClick={() => handleEditItem(item)} className="p-1 text-slate-400 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-slate-400 hover:text-red-600">
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

        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Modifier Groups module</p>
              <p className="text-xs mt-1">Manage cooking preferences, portions, sides, sauces, and add-ons</p>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Availability Rules module</p>
              <p className="text-xs mt-1">Configure time-based, seasonal, and outlet-specific availability</p>
            </div>
          </div>
        )}

        {activeTab === 'digital' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <QrCode className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Digital Menu module</p>
              <p className="text-xs mt-1">QR menus, multi-language support, nutrition facts, and dietary labels</p>
            </div>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Code</label>
                <input
                  type="text"
                  value={formData.tax_code}
                  onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">POS Button Group</label>
                <input
                  type="text"
                  value={formData.pos_button_group}
                  onChange={(e) => setFormData({ ...formData, pos_button_group: e.target.value })}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFixedMenu"
                  checked={formData.is_fixed_menu}
                  onChange={(e) => setFormData({ ...formData, is_fixed_menu: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="isFixedMenu" className="text-sm text-slate-700 dark:text-slate-300">Fixed Menu</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveItem}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
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
