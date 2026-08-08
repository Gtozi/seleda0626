import React, { useState } from 'react';
import { ShoppingCart, Plus, Edit, Search, Filter, CheckCircle, AlertTriangle, DollarSign, Printer, Monitor } from 'lucide-react';

interface POSOutlet {
  id: string;
  name: string;
  location: string;
  type: 'restaurant' | 'bar' | 'cafe' | 'retail' | 'spa' | 'room_service';
  registers: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastSync: string;
}

interface POSRegister {
  id: string;
  name: string;
  outletId: string;
  terminalId: string;
  cashDrawer: string;
  fiscalPrinter: string;
  status: 'online' | 'offline';
}

const POSManagement: React.FC = () => {
  const [outlets, setOutlets] = useState<POSOutlet[]>([
    { id: '1', name: 'Main Restaurant', location: 'Ground Floor', type: 'restaurant', registers: 4, status: 'active', lastSync: '2024-01-15 14:30' },
    { id: '2', name: 'Lobby Bar', location: 'Lobby', type: 'bar', registers: 2, status: 'active', lastSync: '2024-01-15 14:28' },
    { id: '3', name: 'Poolside Cafe', location: 'Pool Area', type: 'cafe', registers: 1, status: 'active', lastSync: '2024-01-15 14:25' },
    { id: '4', name: 'Gift Shop', location: 'Lobby', type: 'retail', registers: 1, status: 'active', lastSync: '2024-01-15 14:20' },
    { id: '5', name: 'Spa Reception', location: 'Spa Floor', type: 'spa', registers: 1, status: 'maintenance', lastSync: '2024-01-14 16:00' },
    { id: '6', name: 'Room Service', location: 'Kitchen', type: 'room_service', registers: 2, status: 'active', lastSync: '2024-01-15 14:15' },
  ]);

  const [registers] = useState<POSRegister[]>([
    { id: '1', name: 'Register 1', outletId: '1', terminalId: 'TERM-001', cashDrawer: 'CD-001', fiscalPrinter: 'FP-001', status: 'online' },
    { id: '2', name: 'Register 2', outletId: '1', terminalId: 'TERM-002', cashDrawer: 'CD-002', fiscalPrinter: 'FP-002', status: 'online' },
    { id: '3', name: 'Register 3', outletId: '1', terminalId: 'TERM-003', cashDrawer: 'CD-003', fiscalPrinter: 'FP-003', status: 'offline' },
    { id: '4', name: 'Register 4', outletId: '1', terminalId: 'TERM-004', cashDrawer: 'CD-004', fiscalPrinter: 'FP-004', status: 'online' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || outlet.type === filterType;
    const matchesStatus = filterStatus === 'all' || outlet.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const outletTypes = [
    { id: 'restaurant', name: 'Restaurant', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'bar', name: 'Bar', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'cafe', name: 'Cafe', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'retail', name: 'Retail', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'spa', name: 'Spa', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'room_service', name: 'Room Service', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'online': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'offline': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">POS Management</h1>
          <p className="text-xs text-slate-400">Configure outlets, registers, cash drawers, fiscal printers, receipt layouts, and payment types</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Outlet
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Outlets', value: outlets.length, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Total Registers', value: registers.length, icon: Monitor, color: 'text-emerald-600' },
          { label: 'Active', value: outlets.filter(o => o.status === 'active').length, icon: CheckCircle, color: 'text-purple-600' },
          { label: 'In Maintenance', value: outlets.filter(o => o.status === 'maintenance').length, icon: AlertTriangle, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search outlets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {outletTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* POS Outlets Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">POS Outlets</h3>
            <p className="text-xs text-slate-400">Point of sale setup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlets.map((outlet) => {
            const type = outletTypes.find(t => t.id === outlet.type);
            return (
              <div key={outlet.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{outlet.name}</h4>
                      <span className="text-xs text-slate-500">{outlet.location}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(outlet.status)}`}>
                    {outlet.status}
                  </span>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                    {type?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Monitor size={12} />
                      Registers
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{outlet.registers}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <DollarSign size={12} />
                      Daily Sales
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">$12,450</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">Last sync: {outlet.lastSync}</div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POS Configuration Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">POS Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Outlets', icon: ShoppingCart, color: 'text-blue-600' },
            { name: 'Registers', icon: Monitor, color: 'text-purple-600' },
            { name: 'Cash Drawers', icon: DollarSign, color: 'text-emerald-600' },
            { name: 'Fiscal Printers', icon: Printer, color: 'text-amber-600' },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-900 ${feature.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default POSManagement;