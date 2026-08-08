/**
 * Retail Shop Module
 * Manages spa retail products, inventory, POS integration, and promotions
 */

import { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  MoreVertical,
  AlertTriangle,
  Tag
} from 'lucide-react';

interface RetailProduct {
  id: string;
  name: string;
  category: 'Skincare' | 'Haircare' | 'Massage Oils' | 'Supplements' | 'Wellness Products' | 'Gift Items';
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  description: string;
  brand: string;
  isActive: boolean;
  soldThisMonth: number;
}

const RetailShopModule: React.FC = () => {
  const [products, setProducts] = useState<RetailProduct[]>([
    {
      id: 'RTL-001',
      name: 'Lavender Massage Oil',
      category: 'Massage Oils',
      sku: 'SKU-LAV-001',
      price: 45,
      cost: 22,
      stock: 24,
      minStock: 10,
      description: 'Premium lavender essential oil blend for relaxation',
      brand: 'Spa Essentials',
      isActive: true,
      soldThisMonth: 18
    },
    {
      id: 'RTL-002',
      name: 'Hydrating Face Serum',
      category: 'Skincare',
      sku: 'SKU-HYD-002',
      price: 85,
      cost: 40,
      stock: 8,
      minStock: 15,
      description: 'Intensive hydration serum with hyaluronic acid',
      brand: 'Glow Beauty',
      isActive: true,
      soldThisMonth: 32
    },
    {
      id: 'RTL-003',
      name: 'Deep Conditioning Hair Mask',
      category: 'Haircare',
      sku: 'SKU-HAI-003',
      price: 38,
      cost: 18,
      stock: 15,
      minStock: 8,
      description: 'Repairing hair mask for damaged hair',
      brand: 'Hair Care Pro',
      isActive: true,
      soldThisMonth: 12
    },
    {
      id: 'RTL-004',
      name: 'Vitamin C Supplement',
      category: 'Supplements',
      sku: 'SKU-SUP-004',
      price: 35,
      cost: 15,
      stock: 50,
      minStock: 20,
      description: 'Immune support vitamin C complex',
      brand: 'Wellness Plus',
      isActive: true,
      soldThisMonth: 45
    },
    {
      id: 'RTL-005',
      name: 'Aromatherapy Candle Set',
      category: 'Gift Items',
      sku: 'SKU-GFT-005',
      price: 55,
      cost: 25,
      stock: 12,
      minStock: 5,
      description: 'Set of 3 soy wax aromatherapy candles',
      brand: 'Zen Scents',
      isActive: true,
      soldThisMonth: 8
    },
    {
      id: 'RTL-006',
      name: 'Epsom Salt Bath Soak',
      category: 'Wellness Products',
      sku: 'SKU-WEL-006',
      price: 28,
      cost: 12,
      stock: 30,
      minStock: 15,
      description: 'Muscle relaxation epsom salt blend',
      brand: 'Spa Essentials',
      isActive: true,
      soldThisMonth: 22
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  const categories = ['All', 'Skincare', 'Haircare', 'Massage Oils', 'Supplements', 'Wellness Products', 'Gift Items'];

  const getCategoryColor = (category: string) => {
    const colors = {
      'Skincare': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Haircare': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Massage Oils': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Supplements': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
      'Wellness Products': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
      'Gift Items': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'All' ||
                         (stockFilter === 'Low Stock' && product.stock <= product.minStock) ||
                         (stockFilter === 'In Stock' && product.stock > product.minStock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleToggleActive = (productId: string) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, isActive: !product.isActive } : product
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Retail Shop</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spa retail products, inventory, and promotions
          </p>
        </div>
        <button
          onClick={() => setShowNewProductModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
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
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low Stock">Low Stock</option>
            <option value="In Stock">In Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {product.isActive ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(product.category)}`}>
                {product.category}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${product.price}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Price</div>
              </div>
              <div className={`text-center p-2 rounded-lg ${product.stock <= product.minStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50 dark:bg-slate-900/20'}`}>
                <div className={`font-semibold ${product.stock <= product.minStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {product.stock}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Stock</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Tag size={14} />
                <span>{product.brand}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp size={14} />
                <span>{product.soldThisMonth} sold this month</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              {product.stock <= product.minStock && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <AlertTriangle size={12} />
                  <span>Low Stock</span>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Product Modal Placeholder */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Retail Product</h2>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Product creation form would be implemented here with product details, category, pricing, and inventory configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewProductModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailShopModule;