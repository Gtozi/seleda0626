import React, { useState } from 'react';
import { 
  Car,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const VehicleRegistry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const vehicles = [
    {
      id: 'VH-001',
      vehicleNumber: 'VH-001',
      registrationNumber: 'ABC-1234',
      vin: '1HGBH41JXMN109186',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Silver',
      category: 'Sedan',
      capacity: 4,
      fuelType: 'Gasoline',
      insuranceProvider: 'Allstate Insurance',
      insurancePolicy: 'POL-123456',
      insuranceExpiry: '2026-12-31',
      registrationExpiry: '2026-11-30',
      status: 'Active',
      purchaseDate: '2023-01-15',
      purchasePrice: 28000,
      currentValue: 24500
    },
    {
      id: 'VH-002',
      vehicleNumber: 'VH-002',
      registrationNumber: 'DEF-5678',
      vin: '2T1BURHE1JC123456',
      make: 'Ford',
      model: 'Explorer',
      year: 2022,
      color: 'Black',
      category: 'SUV',
      capacity: 7,
      fuelType: 'Gasoline',
      insuranceProvider: 'Geico',
      insurancePolicy: 'POL-234567',
      insuranceExpiry: '2026-10-15',
      registrationExpiry: '2026-09-30',
      status: 'Active',
      purchaseDate: '2022-03-20',
      purchasePrice: 42000,
      currentValue: 36500
    },
    {
      id: 'VH-003',
      vehicleNumber: 'VH-003',
      registrationNumber: 'GHI-9012',
      vin: '1HGCM82633A123456',
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      color: 'White',
      category: 'Sedan',
      capacity: 5,
      fuelType: 'Hybrid',
      insuranceProvider: 'Allstate Insurance',
      insurancePolicy: 'POL-345678',
      insuranceExpiry: '2027-01-31',
      registrationExpiry: '2026-12-15',
      status: 'Active',
      purchaseDate: '2023-05-10',
      purchasePrice: 32000,
      currentValue: 28500
    },
    {
      id: 'VH-004',
      vehicleNumber: 'VH-004',
      registrationNumber: 'JKL-3456',
      vin: 'WD0WFDBJ5HA123456',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2021,
      color: 'White',
      category: 'Van',
      capacity: 12,
      fuelType: 'Diesel',
      insuranceProvider: 'Progressive',
      insurancePolicy: 'POL-456789',
      insuranceExpiry: '2026-08-20',
      registrationExpiry: '2026-07-31',
      status: 'Active',
      purchaseDate: '2021-07-25',
      purchasePrice: 45000,
      currentValue: 32000
    },
    {
      id: 'VH-005',
      vehicleNumber: 'VH-005',
      registrationNumber: 'MNO-7890',
      vin: 'WBA7402C5LA123456',
      make: 'BMW',
      model: '7 Series',
      year: 2024,
      color: 'Black',
      category: 'Luxury',
      capacity: 4,
      fuelType: 'Gasoline',
      insuranceProvider: 'Chubb',
      insurancePolicy: 'POL-567890',
      insuranceExpiry: '2027-03-15',
      registrationExpiry: '2027-02-28',
      status: 'Maintenance',
      purchaseDate: '2024-01-20',
      purchasePrice: 95000,
      currentValue: 88000
    },
    {
      id: 'VH-006',
      vehicleNumber: 'VH-006',
      registrationNumber: 'PQR-2345',
      vin: '5YJ3E1EA1JF123456',
      make: 'Tesla',
      model: 'Model S',
      year: 2023,
      color: 'Red',
      category: 'Electric',
      capacity: 5,
      fuelType: 'Electric',
      insuranceProvider: 'Tesla Insurance',
      insurancePolicy: 'POL-678901',
      insuranceExpiry: '2027-06-30',
      registrationExpiry: '2027-05-15',
      status: 'Active',
      purchaseDate: '2023-08-15',
      purchasePrice: 89000,
      currentValue: 75000
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Retired': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'Sold': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { color: 'text-rose-600 dark:text-rose-400', icon: AlertTriangle, text: 'Expired' };
    if (daysUntilExpiry <= 30) return { color: 'text-amber-600 dark:text-amber-400', icon: AlertTriangle, text: `${daysUntilExpiry} days` };
    return { color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, text: `${daysUntilExpiry} days` };
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vehicle Registry</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Complete vehicle information and documentation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Vehicles</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{vehicles.filter(v => v.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Docs Expiring</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fleet Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${vehicles.reduce((sum, v) => sum + v.currentValue, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by vehicle number, registration, make, model, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Insurance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVehicles.map((vehicle) => {
                const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
                const registrationStatus = getExpiryStatus(vehicle.registrationExpiry);
                const InsuranceIcon = insuranceStatus.icon;
                const RegistrationIcon = registrationStatus.icon;
                
                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{vehicle.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{vehicle.make} {vehicle.model}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.year} • {vehicle.color} • {vehicle.fuelType}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">VIN: {vehicle.vin}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{vehicle.registrationNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{vehicle.category} ({vehicle.capacity} seats)</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <InsuranceIcon className={`w-4 h-4 ${insuranceStatus.color}`} />
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.insuranceProvider}</p>
                          <p className={`text-xs ${insuranceStatus.color}`}>{insuranceStatus.text}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RegistrationIcon className={`w-4 h-4 ${registrationStatus.color}`} />
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.registrationExpiry}</p>
                          <p className={`text-xs ${registrationStatus.color}`}>{registrationStatus.text}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      ${vehicle.currentValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistry;