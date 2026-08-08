import React, { useState } from 'react';
import { 
  Briefcase,
  Building2,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Car,
  Plus,
  Eye,
  Edit,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock
} from 'lucide-react';

const CorporateTransportation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const contracts = [
    {
      id: 'CC-001',
      company: 'Acme Corporation',
      contact: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1 555-0101',
      type: 'Executive Transfer',
      status: 'Active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      monthlyVolume: 50,
      rateType: 'Fixed Rate',
      standardRate: 85.00,
      billingCycle: 'Monthly',
      creditLimit: 10000.00,
      currentBalance: 2450.00
    },
    {
      id: 'CC-002',
      company: 'Tech Solutions Inc',
      contact: 'Sarah Johnson',
      email: 'sarah.j@techsolutions.com',
      phone: '+1 555-0102',
      type: 'Business Meetings',
      status: 'Active',
      startDate: '2026-03-01',
      endDate: '2026-12-31',
      monthlyVolume: 30,
      rateType: 'Distance-Based',
      standardRate: 2.50,
      billingCycle: 'Monthly',
      creditLimit: 5000.00,
      currentBalance: 1250.00
    },
    {
      id: 'CC-003',
      company: 'Global Partners LLC',
      contact: 'Michael Brown',
      email: 'm.brown@globalpartners.com',
      phone: '+1 555-0103',
      type: 'Airport Transfers',
      status: 'Active',
      startDate: '2026-02-15',
      endDate: '2026-12-31',
      monthlyVolume: 75,
      rateType: 'Package Rate',
      standardRate: 65.00,
      billingCycle: 'Monthly',
      creditLimit: 15000.00,
      currentBalance: 3875.00
    },
    {
      id: 'CC-004',
      company: 'StartUp Ventures',
      contact: 'Emily Davis',
      email: 'emily@startupventures.com',
      phone: '+1 555-0104',
      type: 'Executive Transfer',
      status: 'Pending',
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      monthlyVolume: 20,
      rateType: 'Fixed Rate',
      standardRate: 75.00,
      billingCycle: 'Monthly',
      creditLimit: 3000.00,
      currentBalance: 0.00
    },
  ];

  const trips = [
    {
      id: 'CT-001',
      contractId: 'CC-001',
      company: 'Acme Corporation',
      guest: 'Executive Team',
      type: 'Executive Transfer',
      pickup: 'Hotel VIP Entrance',
      destination: 'Wall Street',
      scheduled: '2026-07-30 15:00',
      vehicle: 'VH-012',
      driver: 'Sarah L.',
      passengers: 3,
      status: 'Confirmed',
      amount: 85.00,
      billedTo: 'Corporate Account'
    },
    {
      id: 'CT-002',
      contractId: 'CC-002',
      company: 'Tech Solutions Inc',
      guest: 'Development Team',
      type: 'Business Meeting',
      pickup: 'Hotel Main Entrance',
      destination: 'Silicon Alley',
      scheduled: '2026-07-30 16:30',
      vehicle: 'VH-008',
      driver: 'Mike T.',
      passengers: 5,
      status: 'In Progress',
      amount: 45.00,
      billedTo: 'Corporate Account'
    },
    {
      id: 'CT-003',
      contractId: 'CC-003',
      company: 'Global Partners LLC',
      guest: 'VIP Client',
      type: 'Airport Transfer',
      pickup: 'JFK Airport - Terminal 4',
      destination: 'Hotel VIP Entrance',
      scheduled: '2026-07-30 14:00',
      vehicle: 'VH-003',
      driver: 'John D.',
      passengers: 1,
      status: 'Completed',
      amount: 65.00,
      billedTo: 'Corporate Account'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Confirmed': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Corporate Transportation</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Corporate contracts and business transportation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Contracts</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monthly Revenue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">$7,575</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Trips This Month</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">145</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Approval</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
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
                placeholder="Search by company, contact, or ID..."
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
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corporate Contracts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Corporate Contracts</h3>
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{contract.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{contract.company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{contract.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">${contract.standardRate.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{contract.rateType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    {contract.contact}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {contract.billingCycle}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Car className="w-4 h-4" />
                    {contract.monthlyVolume}/month
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    Limit: ${contract.creditLimit.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Balance: </span>
                    <span className="font-medium text-slate-900 dark:text-white">${contract.currentBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      <FileText className="w-3 h-3" />
                      Invoice
                    </button>
                    <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Corporate Trips */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Corporate Trips</h3>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{trip.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{trip.company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.guest} - {trip.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">${trip.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.billedTo}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.pickup}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.scheduled.split(' ')[1]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {trip.vehicle}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trip.passengers} passengers
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateTransportation;