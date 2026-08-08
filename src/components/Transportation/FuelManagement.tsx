import React, { useState } from 'react';
import { 
  Fuel,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Car
} from 'lucide-react';

const FuelManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const fuelPurchases = [
    {
      id: 'FL-001',
      date: '2026-07-30',
      vehicle: 'VH-003',
      driver: 'John D.',
      station: 'Shell - Downtown',
      fuelType: 'Gasoline',
      gallons: 15.5,
      pricePerGallon: 3.85,
      totalCost: 59.68,
      odometer: 45280,
      fuelCard: 'FC-001',
      efficiency: 28.5
    },
    {
      id: 'FL-002',
      date: '2026-07-29',
      vehicle: 'VH-001',
      driver: 'Elena R.',
      station: 'BP - Midtown',
      fuelType: 'Gasoline',
      gallons: 12.3,
      pricePerGallon: 3.92,
      totalCost: 48.22,
      odometer: 45150,
      fuelCard: 'FC-002',
      efficiency: 32.1
    },
    {
      id: 'FL-003',
      date: '2026-07-29',
      vehicle: 'VH-006',
      driver: 'Sarah L.',
      station: 'Tesla Supercharger',
      fuelType: 'Electric',
      gallons: 0,
      pricePerGallon: 0.35,
      totalCost: 28.00,
      odometer: 28720,
      fuelCard: 'FC-003',
      efficiency: 4.2
    },
    {
      id: 'FL-004',
      date: '2026-07-28',
      vehicle: 'VH-004',
      driver: 'Carlos M.',
      station: 'Exxon - Highway',
      fuelType: 'Diesel',
      gallons: 25.0,
      pricePerGallon: 4.15,
      totalCost: 103.75,
      odometer: 89500,
      fuelCard: 'FC-004',
      efficiency: 18.3
    },
    {
      id: 'FL-005',
      date: '2026-07-28',
      vehicle: 'VH-002',
      driver: 'Mike T.',
      station: 'Shell - Airport',
      fuelType: 'Gasoline',
      gallons: 18.2,
      pricePerGallon: 3.98,
      totalCost: 72.44,
      odometer: 67800,
      fuelCard: 'FC-001',
      efficiency: 24.7
    },
  ];

  const fuelCards = [
    { id: 'FC-001', number: '****1234', type: 'Shell', status: 'Active', limit: 500.00, balance: 440.32 },
    { id: 'FC-002', number: '****5678', type: 'BP', status: 'Active', limit: 300.00, balance: 251.78 },
    { id: 'FC-003', number: '****9012', type: 'Tesla', status: 'Active', limit: 200.00, balance: 172.00 },
    { id: 'FC-004', number: '****3456', type: 'Exxon', status: 'Blocked', limit: 400.00, balance: 296.25 },
  ];

  const filteredPurchases = fuelPurchases.filter(purchase => {
    const matchesSearch = purchase.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalFuelCost = fuelPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const avgEfficiency = fuelPurchases.filter(p => p.fuelType !== 'Electric').reduce((sum, p) => sum + p.efficiency, 0) / fuelPurchases.filter(p => p.fuelType !== 'Electric').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fuel Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Fuel purchases, consumption tracking, and cost analysis</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Record Purchase
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Fuel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today's Cost</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${totalFuelCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Efficiency</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{avgEfficiency.toFixed(1)} MPG</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Cards</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fuelCards.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Blocked Cards</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fuelCards.filter(c => c.status === 'Blocked').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Purchases */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Purchases</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredPurchases.map((purchase) => (
              <div key={purchase.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{purchase.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{purchase.fuelType}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{purchase.vehicle} - {purchase.driver}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">${purchase.totalCost.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div>{purchase.station}</div>
                  <div>{purchase.gallons} gal @ ${purchase.pricePerGallon}/gal</div>
                  <div>{purchase.efficiency} {purchase.fuelType === 'Electric' ? 'mi/kWh' : 'MPG'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Fuel Cards</h3>
          <div className="space-y-3">
            {fuelCards.map((card) => (
              <div key={card.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{card.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        card.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{card.type} • {card.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">${card.balance.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">of ${card.limit.toFixed(2)}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${card.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${(card.balance / card.limit) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelManagement;