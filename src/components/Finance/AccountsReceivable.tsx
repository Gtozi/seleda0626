import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Eye, Plus, Mail, Phone, MapPin, RefreshCw
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchCustomers, createCustomer, fetchFoliosWithAging, computeAgingSummary,
  type ArCustomer, type FolioWithAging, type AgingSummary,
} from '../../services/accountsReceivableService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AccountsReceivable = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'folios' | 'aging' | 'credit_notes' | 'collections'>('customers');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ArCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<ArCustomer[]>([]);
  const [folios, setFolios] = useState<FolioWithAging[]>([]);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '', contactEmail: '', contactPhone: '', address: '', taxId: '', creditLimit: 0, category: 'Corporate',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [custs, fol] = await Promise.all([fetchCustomers(), fetchFoliosWithAging()]);
      setCustomers(custs);
      setFolios(fol);
    } catch (err: any) {
      console.error('Error loading AR data:', err);
      setError(err.message || 'Failed to load accounts receivable data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateCustomer = async () => {
    try {
      await createCustomer({
        name: newCustomerForm.name, email: newCustomerForm.contactEmail, phone: newCustomerForm.contactPhone,
        address: newCustomerForm.address, tin: newCustomerForm.taxId,
        credit_limit: newCustomerForm.creditLimit, customer_type: newCustomerForm.category,
      } as any);
      setShowNewCustomer(false);
      setNewCustomerForm({ name: '', contactEmail: '', contactPhone: '', address: '', taxId: '', creditLimit: 0, category: 'Corporate' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create customer'); }
  };

  const agingSummary: AgingSummary = computeAgingSummary(folios);
  const unpaidFolios = folios.filter(f => f.balance > 0);

  const customerColumns: Column<ArCustomer>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (c) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</span>
          <span className="text-[9px] font-bold text-slate-400 font-mono">{c.id}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (c) => (
        <div className="flex flex-col gap-1">
          {c.email && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <Mail size={10} />
              {c.email}
            </div>
          )}
          {c.phone && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
              <Phone size={10} />
              {c.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'tin',
      label: 'TIN',
      render: (c) => <span className="text-[10px] font-bold text-slate-500 font-mono">{c.tin || '—'}</span>,
    },
    {
      key: 'credit_limit',
      label: 'Credit Limit',
      align: 'right',
      render: (c) => <span className="text-xs font-black text-slate-900 dark:text-white">{c.credit_limit ? `$${fmt(c.credit_limit)}` : '—'}</span>,
    },
    {
      key: 'current_balance',
      label: 'Balance',
      align: 'right',
      render: (c) => (
        <span className={`text-xs font-black ${(c.current_balance ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {c.current_balance ? `$${fmt(c.current_balance)}` : '$0.00'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      align: 'center',
      render: (c) => (
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
            c.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
          }`}>
            {c.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (c) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => setSelectedCustomer(c)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  const folioColumns: Column<FolioWithAging>[] = [
    {
      key: 'guest_name',
      label: 'Guest',
      render: (f) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.guest_name}</span>
          <span className="text-[9px] font-bold text-slate-400 font-mono">{f.id.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      key: 'room_number',
      label: 'Room',
      render: (f) => <span className="text-[10px] font-bold text-slate-500">{f.room_number || '—'}</span>,
    },
    {
      key: 'check_in_date',
      label: 'Check-In',
      align: 'center',
      render: (f) => <span className="text-[10px] font-bold text-slate-500">{f.check_in_date || '—'}</span>,
    },
    {
      key: 'total_charges',
      label: 'Charges',
      align: 'right',
      render: (f) => <span className="text-xs font-mono text-slate-900 dark:text-white">${fmt(f.total_charges)}</span>,
    },
    {
      key: 'total_payments',
      label: 'Paid',
      align: 'right',
      render: (f) => <span className="text-xs font-mono text-emerald-600">${fmt(f.total_payments)}</span>,
    },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (f) => (
        <span className={`text-xs font-black ${f.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
          ${fmt(f.balance)}
        </span>
      ),
    },
    {
      key: 'aging_bucket',
      label: 'Aging',
      align: 'center',
      render: (f) => {
        if (f.balance <= 0) return <span className="text-[9px] font-bold text-slate-400">—</span>;
        const colors: Record<string, string> = {
          '0-30': 'bg-emerald-50 text-emerald-600',
          '31-60': 'bg-amber-50 text-amber-600',
          '61-90': 'bg-orange-50 text-orange-600',
          '90+': 'bg-rose-50 text-rose-600',
        };
        return (
          <div className="flex justify-center">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[f.aging_bucket] || colors['0-30']}`}>
              {f.aging_bucket} ({f.days_outstanding}d)
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (f) => (
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
            f.status === 'Closed' ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {f.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 min-h-screen p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit shadow-sm hover:shadow-md transition-all duration-300">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('folios')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'folios' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Guest Folios
          </button>
          <button
            onClick={() => setActiveTab('aging')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'aging' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Aging Report
          </button>
          <button
            onClick={() => setActiveTab('credit_notes')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'credit_notes' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Credit/Debit Notes
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'collections' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Collections
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-50 hover:shadow-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all shadow-md">
            <Download size={16} />
            Export
          </button>
          {activeTab === 'customers' && (
            <button
              onClick={() => setShowNewCustomer(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all shadow-md"
            >
              <Plus size={16} />
              New Customer
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw size={20} className="animate-spin" />
            <span>Loading accounts receivable data...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Customer Management</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">B2B and corporate customer accounts</p>
              </div>
              <DataTable
                columns={customerColumns}
                data={customers}
                rowKey={(row) => row.id}
                sortable
                filterable
                filterPlaceholder="Search customers..."
                filterKeys={['name', 'id', 'email', 'tin', 'customer_type']}
                emptyMessage="No AR customers found. Click New Customer to create one."
              />
            </div>
          )}

          {activeTab === 'folios' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Guest Folios</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Guest billing and payment records</p>
              </div>
              <DataTable
                columns={folioColumns}
                data={folios}
                rowKey={(row) => row.id}
                sortable
                filterable
                filterPlaceholder="Search folios..."
                filterKeys={['guest_name', 'room_number', 'status', 'aging_bucket']}
                emptyMessage="No guest folios found."
              />
            </div>
          )}

          {activeTab === 'aging' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Aging Analysis</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Outstanding receivables by age bucket</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: '0-30 Days', value: agingSummary.bucket_0_30, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200' },
                  { label: '31-60 Days', value: agingSummary.bucket_31_60, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200' },
                  { label: '61-90 Days', value: agingSummary.bucket_61_90, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200' },
                  { label: '90+ Days', value: agingSummary.bucket_90_plus, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200' },
                  { label: 'Total Outstanding', value: agingSummary.total_outstanding, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200' },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-lg border border-slate-200 dark:border-slate-700 ${stat.bg} ${stat.border} shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 100}ms` }}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                    <h3 className={`text-2xl font-black ${stat.color}`}>${fmt(stat.value)}</h3>
                  </div>
                ))}
              </div>

              <DataTable
                columns={folioColumns}
                data={unpaidFolios}
                rowKey={(row) => row.id}
                sortable
                filterable
                filterPlaceholder="Search unpaid folios..."
                filterKeys={['guest_name', 'room_number', 'aging_bucket']}
                emptyMessage="No outstanding folio balances."
              />
            </div>
          )}

          {activeTab === 'credit_notes' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Credit and Debit Notes</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Invoice adjustments and corrections</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Credit Notes Issued', value: '12', count: 'This Month', color: 'text-emerald-500', icon: Download },
                  { label: 'Debit Notes Issued', value: '5', count: 'This Month', color: 'text-rose-500', icon: RefreshCw },
                  { label: 'Total Credits', value: '$8,450', count: 'Outstanding', color: 'text-blue-500', icon: Plus },
                  { label: 'Total Debits', value: '$3,200', count: 'Outstanding', color: 'text-amber-500', icon: Eye },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.count}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DataTable
                columns={[
                  {
                    key: 'id',
                    label: 'Note ID',
                    render: (n: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{n.id}</span>,
                  },
                  {
                    key: 'type',
                    label: 'Type',
                    render: (n: any) => (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${n.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {n.type}
                      </span>
                    ),
                  },
                  {
                    key: 'customer',
                    label: 'Customer',
                    render: (n: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{n.customer}</span>,
                  },
                  {
                    key: 'reason',
                    label: 'Reason',
                    render: (n: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{n.reason}</span>,
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (n: any) => (
                      <span className={`text-xs font-black ${n.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ${fmt(n.amount)}
                      </span>
                    ),
                  },
                  {
                    key: 'date',
                    label: 'Date',
                    render: (n: any) => <span className="text-xs font-bold text-slate-500">{n.date}</span>,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    align: 'center',
                    render: (n: any) => (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${n.status === 'Applied' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {n.status}
                      </span>
                    ),
                  },
                ]}
                data={[
                  { id: 'CN-2024-001', type: 'Credit', customer: 'TechCorp Group', reason: 'Overpayment Refund', amount: 2500, date: '2024-06-01', status: 'Applied' },
                  { id: 'CN-2024-002', type: 'Credit', customer: 'ABC Corporation', reason: 'Service Discount', amount: 1200, date: '2024-06-02', status: 'Pending' },
                  { id: 'DN-2024-001', type: 'Debit', customer: 'XYZ Travel', reason: 'Additional Charges', amount: 850, date: '2024-06-03', status: 'Applied' },
                  { id: 'CN-2024-003', type: 'Credit', customer: 'Hotel Guest', reason: 'Room Change Refund', amount: 450, date: '2024-06-04', status: 'Applied' },
                  { id: 'DN-2024-002', type: 'Debit', customer: 'Corporate Client', reason: 'Late Fee', amount: 200, date: '2024-06-05', status: 'Pending' },
                ]}
                rowKey={(n: any) => n.id}
                sortable
                filterable
                filterPlaceholder="Search notes..."
                filterKeys={['id', 'customer', 'reason', 'type']}
                emptyMessage="No credit or debit notes found."
              />
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Collections Management</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Accounts receivable collection activities</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Collections', value: '23', count: 'Accounts', color: 'text-amber-500', icon: Phone },
                  { label: 'Collected This Month', value: '$45,200', count: '78% Rate', color: 'text-emerald-500', icon: Download },
                  { label: 'Overdue Actions', value: '8', count: 'Escalated', color: 'text-rose-500', icon: RefreshCw },
                  { label: 'Promised Payments', value: '$12,500', count: '5 Pending', color: 'text-blue-500', icon: Plus },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{stat.count}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DataTable
                columns={[
                  {
                    key: 'customer',
                    label: 'Customer',
                    render: (c: any) => (
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{c.customer}</span>
                        <span className="text-[9px] font-bold text-slate-400">{c.folioId}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (c: any) => <span className="text-xs font-black text-slate-900 dark:text-white">${fmt(c.amount)}</span>,
                  },
                  {
                    key: 'daysOverdue',
                    label: 'Days Overdue',
                    align: 'center',
                    render: (c: any) => (
                      <span className={`text-xs font-black ${c.daysOverdue > 60 ? 'text-rose-600' : c.daysOverdue > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.daysOverdue}d
                      </span>
                    ),
                  },
                  {
                    key: 'lastContact',
                    label: 'Last Contact',
                    render: (c: any) => <span className="text-xs font-bold text-slate-500">{c.lastContact}</span>,
                  },
                  {
                    key: 'nextAction',
                    label: 'Next Action',
                    render: (c: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.nextAction}</span>,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    align: 'center',
                    render: (c: any) => (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        c.status === 'Promised' ? 'bg-blue-50 text-blue-600' :
                        c.status === 'Escalated' ? 'bg-rose-50 text-rose-600' :
                        c.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    align: 'center',
                    sortable: false,
                    render: (c: any) => (
                      <div className="flex justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Log Contact"><Phone size={14} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition" title="Send Reminder"><Mail size={14} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      </div>
                    ),
                  },
                ]}
                data={[
                  { customer: 'TechCorp Group', folioId: 'FOL-2024-089', amount: 8500, daysOverdue: 45, lastContact: '2024-06-01', nextAction: 'Follow-up Call', status: 'In Progress' },
                  { customer: 'ABC Corporation', folioId: 'FOL-2024-092', amount: 4200, daysOverdue: 15, lastContact: '2024-06-03', nextAction: 'Send Reminder', status: 'Promised' },
                  { customer: 'XYZ Travel', folioId: 'FOL-2024-078', amount: 12500, daysOverdue: 75, lastContact: '2024-05-28', nextAction: 'Escalate', status: 'Escalated' },
                  { customer: 'Hotel Guest', folioId: 'FOL-2024-095', amount: 1800, daysOverdue: 8, lastContact: '2024-06-05', nextAction: 'Send Invoice', status: 'In Progress' },
                  { customer: 'Corporate Client', folioId: 'FOL-2024-082', amount: 6700, daysOverdue: 32, lastContact: '2024-06-02', nextAction: 'Follow-up Call', status: 'In Progress' },
                ]}
                rowKey={(c: any) => c.folioId}
                sortable
                filterable
                filterPlaceholder="Search collections..."
                filterKeys={['customer', 'folioId', 'status']}
                emptyMessage="No active collections."
              />
            </div>
          )}
        </>
      )}

      <ModalSystem
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name}
        subtitle={`Customer ID: ${selectedCustomer?.id}`}
        variant="info"
        size="lg"
        showFooter={false}
      >
        {selectedCustomer && (
          <>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Email</span>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedCustomer.email || '—'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phone</span>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedCustomer.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Address</span>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedCustomer.address || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tax ID (TIN)</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{selectedCustomer.tin || '—'}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Customer Type</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{selectedCustomer.customer_type || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-indigo-50 dark:bg-indigo-500 border border-indigo-100 dark:border-indigo-500 rounded-lg p-4">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Credit Limit</span>
                  <span className="text-2xl font-black text-indigo-600">${selectedCustomer.credit_limit ? fmt(selectedCustomer.credit_limit) : '0.00'}</span>
                </div>
                <div className={`rounded-lg p-4 border ${(selectedCustomer.current_balance ?? 0) > 0 ? 'bg-amber-50 dark:bg-amber-500 border-amber-100 dark:border-amber-500' : 'bg-emerald-50 dark:bg-emerald-500 border-emerald-100 dark:border-emerald-500'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest block ${(selectedCustomer.current_balance ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>Current Balance</span>
                  <span className={`text-2xl font-black ${(selectedCustomer.current_balance ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>${selectedCustomer.current_balance ? fmt(selectedCustomer.current_balance) : '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-700">
              <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Close</button>
            </div>
          </>
        )}
      </ModalSystem>

      <ModalSystem
        isOpen={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        title="New Customer"
        subtitle="Create a new accounts receivable customer"
        variant="form"
        size="md"
        showFooter={false}
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Name</label>
              <input
                type="text"
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="TechCorp Group"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Type</label>
              <select
                value={newCustomerForm.category}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Corporate">Corporate</option>
                <option value="Tour Operator">Tour Operator</option>
                <option value="Travel Agency">Travel Agency</option>
                <option value="Government">Government</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                value={newCustomerForm.contactEmail}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="finance@company.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
              <input
                type="text"
                value={newCustomerForm.contactPhone}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+251 911 123 456"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">TIN</label>
              <input
                type="text"
                value={newCustomerForm.taxId}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, taxId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="TIN-000000000"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Credit Limit</label>
              <input
                type="number"
                value={newCustomerForm.creditLimit}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="500000"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Address</label>
            <input
              type="text"
              value={newCustomerForm.address}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Bole Subcity, Addis Ababa"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-700">
          <button onClick={() => setShowNewCustomer(false)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:shadow-md">Cancel</button>
          <button onClick={handleCreateCustomer} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Create Customer</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default AccountsReceivable;
