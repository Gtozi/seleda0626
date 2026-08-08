/**
 * Lost & Found Module
 * Comprehensive tracking of lost and found items in hotel operations
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Camera,
  FileText,
  Shield
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import StatCard from '../StatCard';

interface LostFoundItem {
  id: string;
  item_name: string;
  item_description: string;
  item_category: string;
  item_color: string;
  item_brand: string;
  found_location: string;
  found_date: string;
  found_time: string;
  found_by?: string;
  guest_name: string;
  room_number: string;
  status: string;
  estimated_value: number;
  storage_location: string;
  photo_url: string;
  claimed_by: string;
  claimed_date: string;
  created_at: string;
}

type StatusFilter = 'All' | 'Found' | 'Claimed' | 'Donated' | 'Disposed' | 'Returned to Owner';

const LostFound = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    resolved: 0,
    totalValue: 0
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Accessories',
    'Documents',
    'Keys',
    'Luggage',
    'Toiletries',
    'Sports Equipment',
    'Children Items',
    'Other'
  ];

  const statusOptions = [
    { value: 'Found', label: 'Found', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'Claimed', label: 'Claimed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'Donated', label: 'Donated', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'Disposed', label: 'Disposed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'Returned to Owner', label: 'Returned to Owner', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
    { value: 'Transferred to Lost Property', label: 'Transferred', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  useEffect(() => {
    loadItems();
  }, [statusFilter]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('lost_found')
        .select('*')
        .order('found_date', { ascending: false })
        .order('found_time', { ascending: false });

      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setItems(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (items: LostFoundItem[]) => {
    setStats({
      total: items.length,
      active: items.filter(i => i.status === 'Found').length,
      claimed: items.filter(i => i.status === 'Claimed').length,
      resolved: items.filter(i => ['Donated', 'Disposed', 'Returned to Owner'].includes(i.status)).length,
      totalValue: items.reduce((sum, i) => sum + (i.estimated_value || 0), 0)
    });
  };

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.found_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const { error } = await supabase
        .from('lost_found')
        .insert({
          ...itemData,
          status: 'Found',
          found_date: new Date().toISOString().split('T')[0],
          found_time: new Date().toTimeString().split(' ')[0]
        });

      if (error) throw error;
      setShowAddModal(false);
      loadItems();
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'Claimed' || newStatus === 'Returned to Owner') {
        updateData.claimed_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('lost_found')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('lost_found')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lost & Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage lost and found items</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadItems}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={String(stats.total)} icon={Package} variant="primary" />
        <StatCard label="Active Items" value={String(stats.active)} icon={Search} variant="rooms" />
        <StatCard label="Claimed" value={String(stats.claimed)} icon={CheckCircle} variant="guests" />
        <StatCard label="Total Value" value={`$${stats.totalValue.toLocaleString()}`} icon={DollarSign} variant="revenue" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="All">All Status</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Item</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Found Location</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Found By</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Guest/Room</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Value</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.item_name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.item_name}</div>
                          {item.item_description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                              {item.item_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.item_category}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.found_location}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {item.found_by || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {item.guest_name && <div className="text-gray-900 dark:text-white">{item.guest_name}</div>}
                        {item.room_number && <div className="text-gray-500 dark:text-gray-400">Room {item.room_number}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.found_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {statusOptions.find(opt => opt.value === item.status)?.label || item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      ${item.estimated_value?.toLocaleString() || '0'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedItem(item); setShowModal(true); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedItem.item_name}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-6">
                {selectedItem.photo_url && (
                  <div className="col-span-2">
                    <img src={selectedItem.photo_url} alt={selectedItem.item_name} className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <div className="text-gray-900 dark:text-white">{selectedItem.item_category}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedItem.status)}`}>
                    {statusOptions.find(opt => opt.value === selectedItem.status)?.label || selectedItem.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Found Location</label>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <MapPin className="w-4 h-4" />
                    {selectedItem.found_location}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Found Date</label>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedItem.found_date).toLocaleDateString()} at {selectedItem.found_time}
                  </div>
                </div>

                {selectedItem.found_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Found By</label>
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                      <User className="w-4 h-4" />
                      {selectedItem.found_by}
                    </div>
                  </div>
                )}

                {selectedItem.guest_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guest</label>
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                      <User className="w-4 h-4" />
                      {selectedItem.guest_name}
                    </div>
                  </div>
                )}

                {selectedItem.room_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room</label>
                    <div className="text-gray-900 dark:text-white">{selectedItem.room_number}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Value</label>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <DollarSign className="w-4 h-4" />
                    {selectedItem.estimated_value?.toLocaleString() || '0'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Location</label>
                  <div className="text-gray-900 dark:text-white">{selectedItem.storage_location || 'Not specified'}</div>
                </div>

                {selectedItem.item_description && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <div className="text-gray-900 dark:text-white">{selectedItem.item_description}</div>
                  </div>
                )}

                {selectedItem.item_brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                    <div className="text-gray-900 dark:text-white">{selectedItem.item_brand}</div>
                  </div>
                )}

                {selectedItem.item_color && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                    <div className="text-gray-900 dark:text-white">{selectedItem.item_color}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Lost & Found Item</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form 
              id="add-item-form"
              onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddItem({
                item_name: formData.get('item_name'),
                item_description: formData.get('item_description'),
                item_category: formData.get('item_category'),
                item_color: formData.get('item_color'),
                item_brand: formData.get('item_brand'),
                found_location: formData.get('found_location'),
                found_by: formData.get('found_by'),
                guest_name: formData.get('guest_name'),
                room_number: formData.get('room_number'),
                estimated_value: parseFloat(formData.get('estimated_value') as string) || 0,
                storage_location: formData.get('storage_location')
              });
            }} className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name *</label>
                  <input
                    type="text"
                    name="item_name"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    name="item_category"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Found Location *</label>
                  <input
                    type="text"
                    name="found_location"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Found By</label>
                  <input
                    type="text"
                    name="found_by"
                    placeholder="Staff name who found the item"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    name="item_description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                  <input
                    type="text"
                    name="item_brand"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <input
                    type="text"
                    name="item_color"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guest Name</label>
                  <input
                    type="text"
                    name="guest_name"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Number</label>
                  <input
                    type="text"
                    name="room_number"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Value</label>
                  <input
                    type="number"
                    name="estimated_value"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Location</label>
                  <input
                    type="text"
                    name="storage_location"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-item-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;