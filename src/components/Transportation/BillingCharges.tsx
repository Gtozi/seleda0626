import React, { useState } from 'react';
import { 
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  FileText,
  CreditCard,
  Building2,
  User,
  Calendar
} from 'lucide-react';

const BillingCharges: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const charges = [
    {
      id: 'BL-001',
      tripId: 'TR-001',
      guest: 'John Smith',
      room: '302',
      type: 'Airport Pickup',
      billingType: 'Guest Folio',
      amount: 85.00,
      status: 'Posted',
      date: '2026-07-30',
      paymentMethod: 'Room Charge',
      reference: 'FOLIO-302-001'
    },
    {
      id: 'BL-002',
      tripId: 'TR-003',
      guest: 'Corporate Event',
      room: 'N/A',
      type: 'Conference Shuttle',
      billingType: 'Event Master Account',
      amount: 150.00,
      status: 'Pending',
      date: '2026-07-30',
      paymentMethod: 'Corporate Account',
      reference: 'EVT-2026-07-001'
    },
    {
      id: 'BL-003',
      tripId: 'TR-006',
      guest: 'VIP Guest',
      room: 'Penthouse',
      type: 'VIP Transport',
      billingType: 'Corporate Account',
      amount: 350.00,
      status: 'Posted',
      date: '2026-07-30',
      paymentMethod: 'Corporate Credit',
      reference: 'CORP-ACME-001'
    },
    {
      id: 'BL-004',
      tripId: 'TR-002',
      guest: 'Sarah Johnson',
      room: '415',
      type: 'City Transfer',
      billingType: 'Guest Folio',
      amount: 45.00,
      status: 'Pending',
      date: '2026-07-30',
      paymentMethod: 'Room Charge',
      reference: 'FOLIO-415-002'
    },
    {
      id: 'BL-005',
      tripId: 'SPT-001',
      guest: 'Staff Transportation',
      room: 'N/A',
      type: 'Staff Shuttle',
      billingType: 'Internal Cost Center',
      amount: 0.00,
      status: 'Posted',
      date: '2026-07-30',
      paymentMethod: 'Internal Transfer',
      reference: 'HR-STAFF-001'
    },
    {
      id: 'BL-006',
      tripId: 'TR-005',
      guest: 'Emily Davis',
      room: '228',
      type: 'Sightseeing Tour',
      billingType: 'Guest Folio',
      amount: 200.00,
      status: 'Pending',
      date: '2026-07-30',
      paymentMethod: 'Credit Card',
      reference: 'CC-****4242'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Failed': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'Refunded': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getBillingIcon = (billingType: string) => {
    switch (billingType) {
      case 'Guest Folio': return <User className="w-4 h-4" />;
      case 'Corporate Account': return <Building2 className="w-4 h-4" />;
      case 'Event Master Account': return <FileText className="w-4 h-4" />;
      case 'Internal Cost Center': return <Building2 className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const filteredCharges = charges.filter(charge => {
    const matchesSearch = charge.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charge.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charge.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || charge.status === statusFilter;
    const matchesType = typeFilter === 'all' || charge.billingType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = charges.reduce((sum, c) => sum + c.amount, 0);
  const postedRevenue = charges.filter(c => c.status === 'Posted').reduce((sum, c) => sum + c.amount, 0);
  const pendingRevenue = charges.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Charges</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Trip billing, charges, and payment processing</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            Manual Charge
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Posted</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${postedRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${pendingRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Guest Folio</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{charges.filter(c => c.billingType === 'Guest Folio').length}</p>
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
                placeholder="Search by guest, room, or ID..."
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
            <option value="Posted">Posted</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Billing Types</option>
            <option value="Guest Folio">Guest Folio</option>
            <option value="Corporate Account">Corporate Account</option>
            <option value="Event Master Account">Event Master Account</option>
            <option value="Internal Cost Center">Internal Cost Center</option>
          </select>
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Charge ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billing Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredCharges.map((charge) => (
                <tr key={charge.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{charge.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{charge.guest}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Room {charge.room}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{charge.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                        {getBillingIcon(charge.billingType)}
                      </div>
                      <span className="text-sm text-slate-900 dark:text-white">{charge.billingType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">${charge.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{charge.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{charge.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(charge.status)}`}>
                      {charge.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingCharges;