import React, { useState } from 'react';
import { 
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Star,
  FileText,
  Phone
} from 'lucide-react';

const ContractorTaxiManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const contractors = [
    {
      id: 'CTR-001',
      name: 'City Cab Co',
      type: 'Taxi Company',
      contact: 'John Smith',
      phone: '+1 555-0101',
      email: 'john@citycab.com',
      status: 'Active',
      contractStart: '2026-01-01',
      contractEnd: '2026-12-31',
      rateStructure: 'Per Mile',
      baseRate: 3.50,
      perMileRate: 2.75,
      performance: 4.5,
      totalTrips: 1250,
      onTimeRate: 92,
      rating: 4.2
    },
    {
      id: 'CTR-002',
      name: 'Elite Chauffeur Services',
      type: 'Chauffeur Service',
      contact: 'Sarah Johnson',
      phone: '+1 555-0102',
      email: 'sarah@elitechauffeur.com',
      status: 'Active',
      contractStart: '2026-03-01',
      contractEnd: '2026-12-31',
      rateStructure: 'Hourly',
      baseRate: 85.00,
      perMileRate: 0,
      performance: 4.8,
      totalTrips: 380,
      onTimeRate: 98,
      rating: 4.7
    },
    {
      id: 'CTR-003',
      name: 'Metro Bus Lines',
      type: 'Bus Operator',
      contact: 'Michael Brown',
      phone: '+1 555-0103',
      email: 'michael@metrobus.com',
      status: 'Active',
      contractStart: '2026-02-15',
      contractEnd: '2026-12-31',
      rateStructure: 'Per Trip',
      baseRate: 250.00,
      perMileRate: 0,
      performance: 4.3,
      totalTrips: 85,
      onTimeRate: 95,
      rating: 4.1
    },
    {
      id: 'CTR-004',
      name: 'Tour Operators Inc',
      type: 'Tour Operator',
      contact: 'Emily Davis',
      phone: '+1 555-0104',
      email: 'emily@tourop.com',
      status: 'Pending',
      contractStart: '2026-08-01',
      contractEnd: '2026-12-31',
      rateStructure: 'Package',
      baseRate: 180.00,
      perMileRate: 0,
      performance: 0,
      totalTrips: 0,
      onTimeRate: 0,
      rating: 0
    },
  ];

  const recentTrips = [
    { id: 'CT-001', contractor: 'CTR-001', date: '2026-07-30', destination: 'Times Square', amount: 25.00, status: 'Completed' },
    { id: 'CT-002', contractor: 'CTR-002', date: '2026-07-30', destination: 'Private Airport', amount: 170.00, status: 'Completed' },
    { id: 'CT-003', contractor: 'CTR-001', date: '2026-07-29', destination: 'JFK Airport', amount: 45.00, status: 'Completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Inactive': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
      />
    ));
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contractor & Taxi Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">External transportation partners and contractors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Contractor
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Contractors</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{contractors.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg On-Time Rate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">95%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">4.3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Approval</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{contractors.filter(c => c.status === 'Pending').length}</p>
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
                placeholder="Search by name, contact, or ID..."
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
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contractors */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contractors</h3>
          <div className="space-y-4">
            {filteredContractors.map((contractor) => (
              <div key={contractor.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{contractor.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contractor.status)}`}>
                        {contractor.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{contractor.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{contractor.type}</p>
                  </div>
                  <div className="flex gap-1">
                    {getRatingStars(contractor.rating)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    {contractor.contact}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4" />
                    {contractor.rateStructure}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {contractor.onTimeRate}% on-time
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Star className="w-4 h-4" />
                    {contractor.totalTrips} trips
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Base Rate: </span>
                    <span className="font-medium text-slate-900 dark:text-white">${contractor.baseRate.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                      <Eye className="w-4 h-4" />
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

        {/* Recent Trips */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Contractor Trips</h3>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{trip.id}</span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{trip.contractor}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">${trip.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Destination: {trip.destination}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorTaxiManagement;