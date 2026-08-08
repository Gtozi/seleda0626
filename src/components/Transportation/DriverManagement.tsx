import React, { useState } from 'react';
import { 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Car,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Award,
  FileText
} from 'lucide-react';

const DriverManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const drivers = [
    {
      id: 'DRV-001',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP-001',
      licenseNumber: 'DL-12345678',
      licenseCategory: 'Class C',
      licenseExpiry: '2027-03-15',
      certifications: ['Defensive Driving', 'First Aid', 'Customer Service'],
      medicalCertificate: '2026-12-31',
      employmentStatus: 'Active',
      assignedVehicle: 'VH-003',
      shift: 'Morning',
      phone: '+1 555-0101',
      email: 'john.doe@hotel.com',
      hireDate: '2022-01-15',
      performance: 95,
      incidents: 0,
      totalTrips: 1250
    },
    {
      id: 'DRV-002',
      firstName: 'Elena',
      lastName: 'Rodriguez',
      employeeId: 'EMP-002',
      licenseNumber: 'DL-23456789',
      licenseCategory: 'Class C',
      licenseExpiry: '2026-11-30',
      certifications: ['Defensive Driving', 'VIP Service'],
      medicalCertificate: '2026-10-15',
      employmentStatus: 'Active',
      assignedVehicle: 'VH-001',
      shift: 'Morning',
      phone: '+1 555-0102',
      email: 'elena.rodriguez@hotel.com',
      hireDate: '2021-06-20',
      performance: 98,
      incidents: 0,
      totalTrips: 1580
    },
    {
      id: 'DRV-003',
      firstName: 'Carlos',
      lastName: 'Martinez',
      employeeId: 'EMP-003',
      licenseNumber: 'DL-34567890',
      licenseCategory: 'Class B',
      licenseExpiry: '2027-06-20',
      certifications: ['Defensive Driving', 'First Aid', 'Heavy Vehicle'],
      medicalCertificate: '2027-01-31',
      employmentStatus: 'Active',
      assignedVehicle: 'VH-004',
      shift: 'Afternoon',
      phone: '+1 555-0103',
      email: 'carlos.martinez@hotel.com',
      hireDate: '2020-03-10',
      performance: 92,
      incidents: 1,
      totalTrips: 2100
    },
    {
      id: 'DRV-004',
      firstName: 'Sarah',
      lastName: 'Lee',
      employeeId: 'EMP-004',
      licenseNumber: 'DL-45678901',
      licenseCategory: 'Class C',
      licenseExpiry: '2026-08-15',
      certifications: ['Defensive Driving', 'VIP Service', 'First Aid'],
      medicalCertificate: '2026-09-30',
      employmentStatus: 'Active',
      assignedVehicle: 'VH-012',
      shift: 'Flexible',
      phone: '+1 555-0104',
      email: 'sarah.lee@hotel.com',
      hireDate: '2023-02-28',
      performance: 96,
      incidents: 0,
      totalTrips: 680
    },
    {
      id: 'DRV-005',
      firstName: 'Michael',
      lastName: 'Thompson',
      employeeId: 'EMP-005',
      licenseNumber: 'DL-56789012',
      licenseCategory: 'Class C',
      licenseExpiry: '2027-01-10',
      certifications: ['Defensive Driving'],
      medicalCertificate: '2026-11-15',
      employmentStatus: 'On Leave',
      assignedVehicle: null,
      shift: 'N/A',
      phone: '+1 555-0105',
      email: 'michael.thompson@hotel.com',
      hireDate: '2022-08-15',
      performance: 88,
      incidents: 2,
      totalTrips: 920
    },
    {
      id: 'DRV-006',
      firstName: 'James',
      lastName: 'Robinson',
      employeeId: 'EMP-006',
      licenseNumber: 'DL-67890123',
      licenseCategory: 'Class B',
      licenseExpiry: '2026-09-30',
      certifications: ['Defensive Driving', 'Heavy Vehicle'],
      medicalCertificate: '2026-08-20',
      employmentStatus: 'Active',
      assignedVehicle: 'VH-030',
      shift: 'Morning',
      phone: '+1 555-0106',
      email: 'james.robinson@hotel.com',
      hireDate: '2019-11-05',
      performance: 90,
      incidents: 1,
      totalTrips: 2850
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'On Leave': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Suspended': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'Inactive': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
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

  const getPerformanceColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500';
    if (score >= 85) return 'bg-blue-500';
    if (score >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.employmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Driver Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Driver profiles, scheduling, and performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Drivers</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{drivers.length}</p>
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
              <p className="text-xl font-bold text-slate-900 dark:text-white">{drivers.filter(d => d.employmentStatus === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">License Expiring</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Performance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(drivers.reduce((sum, d) => sum + d.performance, 0) / drivers.length)}%</p>
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
                placeholder="Search by name, ID, or license..."
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
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredDrivers.map((driver) => {
                const licenseStatus = getExpiryStatus(driver.licenseExpiry);
                const LicenseIcon = licenseStatus.icon;
                
                return (
                  <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{driver.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{driver.firstName} {driver.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{driver.employeeId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{driver.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LicenseIcon className={`w-4 h-4 ${licenseStatus.color}`} />
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">{driver.licenseNumber}</p>
                          <p className={`text-xs ${licenseStatus.color}`}>{driver.licenseCategory} • {licenseStatus.text}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.assignedVehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-white">{driver.assignedVehicle}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{driver.shift}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 w-16">
                          <div 
                            className={`h-2 rounded-full ${getPerformanceColor(driver.performance)}`}
                            style={{ width: `${driver.performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{driver.performance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{driver.totalTrips.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.employmentStatus)}`}>
                        {driver.employmentStatus}
                      </span>
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

export default DriverManagement;