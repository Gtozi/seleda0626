import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Printer, Plus, Edit, Search, Filter, CheckCircle, AlertTriangle, Battery, Wifi } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'kiosk' | 'printer' | 'scanner' | 'iot';
  serialNumber: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  batteryLevel?: number;
  lastSeen: string;
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Front Desk Tablet 1', type: 'tablet', serialNumber: 'TAB-001', location: 'Front Desk', status: 'online', batteryLevel: 85, lastSeen: '2024-01-15 14:30' },
    { id: '2', name: 'Housekeeping Mobile 1', type: 'mobile', serialNumber: 'MOB-001', location: 'Housekeeping', status: 'online', batteryLevel: 72, lastSeen: '2024-01-15 14:28' },
    { id: '3', name: 'Reception Desktop 1', type: 'desktop', serialNumber: 'PC-001', location: 'Front Desk', status: 'online', lastSeen: '2024-01-15 14:30' },
    { id: '4', name: 'Guest Kiosk 1', type: 'kiosk', serialNumber: 'KSK-001', location: 'Lobby', status: 'online', lastSeen: '2024-01-15 14:25' },
    { id: '5', name: 'Receipt Printer 1', type: 'printer', serialNumber: 'PRN-001', location: 'Front Desk', status: 'online', lastSeen: '2024-01-15 14:20' },
    { id: '6', name: 'ID Scanner 1', type: 'scanner', serialNumber: 'SCN-001', location: 'Front Desk', status: 'offline', lastSeen: '2024-01-15 10:00' },
    { id: '7', name: 'IoT Room Sensor 1', type: 'iot', serialNumber: 'IOT-001', location: 'Room 101', status: 'online', batteryLevel: 45, lastSeen: '2024-01-15 14:30' },
    { id: '8', name: 'Kitchen Display 1', type: 'kiosk', serialNumber: 'KDS-001', location: 'Kitchen', status: 'maintenance', lastSeen: '2024-01-14 16:00' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || device.type === filterType;
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const deviceTypes = [
    { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'desktop', name: 'Desktop', icon: Monitor, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'kiosk', name: 'Kiosk', icon: Monitor, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'printer', name: 'Printer', icon: Printer, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'scanner', name: 'Scanner', icon: Printer, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'iot', name: 'IoT', icon: Wifi, color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'offline': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Device Management</h1>
          <p className="text-xs text-slate-400">Manage POS terminals, tablets, kiosks, mobile devices, key encoders, receipt printers, barcode scanners, and RFID devices</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Device
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: Smartphone, color: 'text-blue-600' },
          { label: 'Online', value: devices.filter(d => d.status === 'online').length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Offline', value: devices.filter(d => d.status === 'offline').length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'In Maintenance', value: devices.filter(d => d.status === 'maintenance').length, icon: Wifi, color: 'text-amber-600' },
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
              placeholder="Search devices..."
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
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Device Inventory</h3>
            <p className="text-xs text-slate-400">Hardware device management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const type = deviceTypes.find(t => t.id === device.type);
            const Icon = type?.icon || Smartphone;
            return (
              <div key={device.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{device.name}</h4>
                      <span className="text-xs text-slate-500">{device.serialNumber}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                    {type?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{device.location}</div>
                  </div>
                  {device.batteryLevel !== undefined && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <Battery size={12} />
                        Battery
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{device.batteryLevel}%</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Wifi size={12} />
                    Last seen: {device.lastSeen}
                  </div>
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

      {/* Device Types Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Device Types</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {deviceTypes.map((type) => (
            <div key={type.id} className={`p-3 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <type.icon size={20} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{devices.filter(d => d.type === type.id).length} active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;