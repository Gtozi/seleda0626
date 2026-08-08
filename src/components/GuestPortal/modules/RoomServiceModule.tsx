/**
 * Room Service Module
 * Browse menu, custom orders, dietary filters, order tracking, scheduled delivery
 */

import { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Truck,
  ChefHat,
  Leaf,
  Wheat
} from 'lucide-react';

interface RoomServiceModuleProps {
  reservationId?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Beverages';
  dietary: string[];
  image?: string;
  preparationTime: number;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'On the Way' | 'Delivered';
  orderTime: string;
  scheduledTime?: string;
}

const RoomServiceModule: React.FC<RoomServiceModuleProps> = ({
  reservationId
}) => {
  const [menuItems] = useState<MenuItem[]>([
    {
      id: 'M-001',
      name: 'Continental Breakfast',
      description: 'Fresh pastries, fruits, yogurt, coffee, and juice',
      price: 25.00,
      category: 'Breakfast',
      dietary: ['Vegetarian'],
      preparationTime: 15
    },
    {
      id: 'M-002',
      name: 'Ethiopian Platter',
      description: 'Assorted injera with traditional stews',
      price: 35.00,
      category: 'Lunch',
      dietary: ['Gluten-Free', 'Spicy'],
      preparationTime: 30
    },
    {
      id: 'M-003',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with vegetables',
      price: 45.00,
      category: 'Dinner',
      dietary: ['Gluten-Free', 'Healthy'],
      preparationTime: 25
    },
    {
      id: 'M-004',
      name: 'Caesar Salad',
      description: 'Classic Caesar with grilled chicken',
      price: 18.00,
      category: 'Lunch',
      dietary: ['Healthy'],
      preparationTime: 10
    },
    {
      id: 'M-005',
      name: 'Fruit Bowl',
      description: 'Seasonal fresh fruits',
      price: 12.00,
      category: 'Snacks',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      preparationTime: 5
    },
    {
      id: 'M-006',
      name: 'Fresh Juice',
      description: 'Orange, mango, or mixed fruit juice',
      price: 8.00,
      category: 'Beverages',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      preparationTime: 5
    }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      items: [],
      total: 45.00,
      status: 'Delivered',
      orderTime: '2026-07-31T12:30:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<string>('All');
  const [showCart, setShowCart] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
  const dietaryOptions = ['All', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Healthy', 'Spicy'];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesDietary = dietaryFilter === 'All' || item.dietary.includes(dietaryFilter);
    return matchesSearch && matchesCategory && matchesDietary;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Preparing': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'On the Way': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
      'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400'
    };
    return colors[status as keyof typeof colors] || colors['Pending'];
  };

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItem.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.menuItem.id === menuItemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      items: [...cart],
      total: cartTotal,
      status: 'Pending',
      orderTime: new Date().toISOString(),
      scheduledTime: scheduling ? scheduledTime : undefined
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowCart(false);
    setScheduling(false);
    setScheduledTime('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Service</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Order delicious meals to your room
          </p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <ShoppingCart size={18} />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
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
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {dietaryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
              <ChefHat size={48} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={12} />
                  <span>{item.preparationTime} min</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.dietary.map((diet) => (
                    <span
                      key={diet}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        diet === 'Vegetarian' || diet === 'Vegan'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : diet === 'Gluten-Free'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
                      }`}
                    >
                      {diet === 'Vegetarian' && <Leaf size={10} className="inline mr-1" />}
                      {diet === 'Gluten-Free' && <Wheat size={10} className="inline mr-1" />}
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Plus size={16} />
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Order #{order.id}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(order.orderTime).toLocaleString()}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {order.items.length} items
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  ${order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Order</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">{item.menuItem.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          ${item.menuItem.price.toFixed(2)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, -1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, 1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Scheduling */}
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="schedule"
                      checked={scheduling}
                      onChange={(e) => setScheduling(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <label htmlFor="schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Schedule Delivery
                </label>
                  </div>
                  {scheduling && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    <Truck size={18} />
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomServiceModule;
