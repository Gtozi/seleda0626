/**
 * Inventory Consumption Module
 * Tracks and manages spa product consumption during service delivery
 */

import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingDown,
  AlertTriangle,
  Calendar,
  MoreVertical,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface ConsumptionRecord {
  id: string;
  productName: string;
  category: 'Massage Oils' | 'Towels' | 'Robes' | 'Beauty Products' | 'Consumables' | 'Cleaning Supplies';
  quantity: number;
  unit: string;
  appointmentId: string;
  treatment: string;
  therapist: string;
  date: string;
  cost: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'Massage Oils' | 'Towels' | 'Robes' | 'Beauty Products' | 'Consumables' | 'Cleaning Supplies';
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  monthlyConsumption: number;
  lastRestock: string;
}

const InventoryConsumptionModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consumption' | 'inventory'>('consumption');

  const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([
    {
      id: 'CON-001',
      productName: 'Lavender Massage Oil',
      category: 'Massage Oils',
      quantity: 30,
      unit: 'ml',
      appointmentId: 'APT-001',
      treatment: 'Swedish Massage',
      therapist: 'Emily Chen',
      date: '2026-07-31',
      cost: 6.60
    },
    {
      id: 'CON-002',
      productName: 'Massage Towel',
      category: 'Towels',
      quantity: 2,
      unit: 'pcs',
      appointmentId: 'APT-001',
      treatment: 'Swedish Massage',
      therapist: 'Emily Chen',
      date: '2026-07-31',
      cost: 1.00
    },
    {
      id: 'CON-003',
      productName: 'Hydrating Facial Serum',
      category: 'Beauty Products',
      quantity: 15,
      unit: 'ml',
      appointmentId: 'APT-003',
      treatment: 'Hydrating Facial',
      therapist: 'Lisa Park',
      date: '2026-07-31',
      cost: 12.00
    },
    {
      id: 'CON-004',
      productName: 'Disposable Robe',
      category: 'Robes',
      quantity: 1,
      unit: 'pcs',
      appointmentId: 'APT-002',
      treatment: 'Deep Tissue Massage',
      therapist: 'David Miller',
      date: '2026-07-31',
      cost: 3.50
    },
    {
      id: 'CON-005',
      productName: 'Essential Oil Blend',
      category: 'Massage Oils',
      quantity: 25,
      unit: 'ml',
      appointmentId: 'APT-002',
      treatment: 'Deep Tissue Massage',
      therapist: 'David Miller',
      date: '2026-07-31',
      cost: 5.50
    }
  ]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 'INV-001',
      name: 'Lavender Massage Oil',
      category: 'Massage Oils',
      currentStock: 2400,
      minStock: 1000,
      unit: 'ml',
      costPerUnit: 0.22,
      monthlyConsumption: 1200,
      lastRestock: '2026-07-15'
    },
    {
      id: 'INV-002',
      name: 'Massage Towels',
      category: 'Towels',
      currentStock: 45,
      minStock: 20,
      unit: 'pcs',
      costPerUnit: 0.50,
      monthlyConsumption: 80,
      lastRestock: '2026-07-20'
    },
    {
      id: 'INV-003',
      name: 'Spa Robes',
      category: 'Robes',
      currentStock: 18,
      minStock: 10,
      unit: 'pcs',
      costPerUnit: 3.50,
      monthlyConsumption: 45,
      lastRestock: '2026-07-18'
    },
    {
      id: 'INV-004',
      name: 'Hydrating Facial Serum',
      category: 'Beauty Products',
      currentStock: 450,
      minStock: 200,
      unit: 'ml',
      costPerUnit: 0.80,
      monthlyConsumption: 600,
      lastRestock: '2026-07-10'
    },
    {
      id: 'INV-005',
      name: 'Cleaning Solution',
      category: 'Cleaning Supplies',
      currentStock: 8,
      minStock: 15,
      unit: 'L',
      costPerUnit: 12.00,
      monthlyConsumption: 25,
      lastRestock: '2026-07-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Massage Oils', 'Towels', 'Robes', 'Beauty Products', 'Consumables', 'Cleaning Supplies'];

  const getCategoryColor = (category: string) => {
    const colors = {
      'Massage Oils': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Towels': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Robes': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Beauty Products': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Consumables': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
      'Cleaning Supplies': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredConsumption = consumptionRecords.filter(record => {
    const matchesSearch = record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || record.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Consumption</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track product usage and manage spa inventory
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <RefreshCw size={16} />
          Sync Inventory
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('consumption')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'consumption'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Consumption Records
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'inventory'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Inventory Status
        </button>
      </div>

      {/* Consumption Records Tab */}
      {activeTab === 'consumption' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredConsumption.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{record.productName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{record.appointmentId}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(record.category)}`}>
                        {record.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-900 dark:text-white">
                      {record.quantity} {record.unit}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {record.treatment}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {record.therapist}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">
                      ${record.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Status Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.id}</p>
                    </div>
                  </div>
                  {item.currentStock <= item.minStock && (
                    <AlertTriangle size={18} className="text-amber-500" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`text-center p-2 rounded-lg ${item.currentStock <= item.minStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50 dark:bg-slate-900/20'}`}>
                    <div className={`font-semibold ${item.currentStock <= item.minStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.currentStock}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Current Stock</div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.minStock}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Min Stock</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <TrendingDown size={14} />
                    <span>{item.monthlyConsumption} {item.unit}/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>Last restock: {new Date(item.lastRestock).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ${item.costPerUnit}/{item.unit}
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryConsumptionModule;