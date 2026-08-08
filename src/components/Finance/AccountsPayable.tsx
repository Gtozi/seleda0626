import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Eye,
  FileText,
  DollarSign,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Percent,
  ShieldCheck,
  Send
} from 'lucide-react';
import {
  fetchVendors,
  fetchBills,
  fetchPayments,
  payBill,
  createVendor,
  createBill,
  type Vendor,
  type Bill,
  type Payment,
} from '../../services/accountsPayableService';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const AccountsPayable = () => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'bills' | 'payments' | 'matching' | 'scheduling'>('vendors');
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewBill, setShowNewBill] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newVendorForm, setNewVendorForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    withholdingRate: 2,
    category: 'Operations',
  });

  const [newBillForm, setNewBillForm] = useState({
    vendorId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    category: '',
    amount: 0,
    taxAmount: 0,
    withholdingAmount: 0,
    lines: [] as Array<{ description: string; quantity: number; rate: number; total: number }>,
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, b, p] = await Promise.all([
        fetchVendors(),
        fetchBills(),
        fetchPayments(),
      ]);
      setVendors(v);
      setBills(b);
      setPayments(p);
    } catch (err: any) {
      console.error('Error loading AP data:', err);
      setError(err.message || 'Failed to load accounts payable data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayBill = async (bill: Bill) => {
    try {
      await payBill(bill.id, {
        amount: bill.amountDue,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        reference: `PAY-${Date.now()}`,
      });
      await loadData();
      setSelectedBill(null);
    } catch (err: any) {
      console.error('Failed to pay bill:', err);
      setError(err.message || 'Failed to record payment');
    }
  };

  const handleCreateVendor = async () => {
    if (!newVendorForm.name) {
      setError('Vendor name is required');
      return;
    }
    try {
      await createVendor(newVendorForm);
      await loadData();
      setShowNewVendor(false);
      setNewVendorForm({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        withholdingRate: 2,
        category: 'Operations',
      });
    } catch (err: any) {
      console.error('Failed to create vendor:', err);
      setError(err.message || 'Failed to create vendor');
    }
  };

  const handleCreateBill = async () => {
    if (!newBillForm.vendorId || !newBillForm.invoiceNumber || !newBillForm.invoiceDate || !newBillForm.dueDate) {
      setError('Vendor, invoice number, invoice date and due date are required');
      return;
    }
    try {
      await createBill(newBillForm);
      await loadData();
      setShowNewBill(false);
      setNewBillForm({
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        category: '',
        amount: 0,
        taxAmount: 0,
        withholdingAmount: 0,
        lines: [],
      });
    } catch (err: any) {
      console.error('Failed to create bill:', err);
      setError(err.message || 'Failed to create bill');
    }
  };

  const totalPayables = vendors.reduce((sum, v) => sum + v.balance, 0);
  const criticalDue = bills.filter(b => b.status === 'Overdue').reduce((sum, b) => sum + b.netPayable, 0);
  const activeVendorCount = vendors.filter(v => v.status === 'Active').length;

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 min-h-screen p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-lg w-fit shadow-sm hover:shadow-md transition-all duration-300">
          <button 
            onClick={() => setActiveTab('vendors')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'vendors' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Vendors
          </button>
          <button 
            onClick={() => setActiveTab('bills')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'bills' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Bills
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Payments
          </button>
          <button 
            onClick={() => setActiveTab('matching')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'matching' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            3-Way Match
          </button>
          <button 
            onClick={() => setActiveTab('scheduling')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'scheduling' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Scheduling
          </button>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all shadow-md">
              <Download size={16} />
              Export
           </button>
           {activeTab === 'vendors' && (
             <button 
               onClick={() => setShowNewVendor(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all shadow-md"
             >
                <Plus size={16} />
                New Vendor
             </button>
           )}
           {activeTab === 'bills' && (
             <button 
               onClick={() => setShowNewBill(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 text-xs transition-all shadow-md"
             >
                <Plus size={16} />
                New Bill
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payables', value: `$${totalPayables.toLocaleString()}`, sub: 'Outstanding balance', icon: ArrowDownRight, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
          { label: 'Critical Due', value: `$${criticalDue.toLocaleString()}`, sub: 'Overdue bills', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
          { label: 'Active Vendors', value: `${activeVendorCount} Active`, sub: 'Registered suppliers', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
          { label: 'Pending Bills', value: `${bills.filter(b => b.status === 'Pending').length} Bills`, sub: 'Awaiting payment', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 ${stat.border}`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`p-3 w-fit rounded-lg ${stat.bg} ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Vendor Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Supplier and vendor account management</p>
          </div>
          <DataTable
            columns={[
              {
                key: 'name', label: 'Vendor Entity',
                render: (v: Vendor) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{v.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">{v.id}</span>
                  </div>
                ),
              },
              {
                key: 'contact', label: 'Contact',
                render: (v: Vendor) => (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Mail size={10} />
                      {v.contact}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <Phone size={10} />
                      {v.phone}
                    </div>
                  </div>
                ),
              },
              {
                key: 'taxId', label: 'TIN',
                render: (v: Vendor) => <span className="text-[10px] font-bold text-slate-500 font-mono">{v.taxId}</span>,
              },
              {
                key: 'withholdingRate', label: 'Withholding', align: 'center',
                render: (v: Vendor) => (
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black uppercase">
                    {v.withholdingRate}%
                  </span>
                ),
              },
              {
                key: 'balance', label: 'Balance', align: 'right',
                render: (v: Vendor) => <span className="text-xs font-black text-slate-900 dark:text-white">${v.balance.toLocaleString()}</span>,
              },
              {
                key: 'status', label: 'Status', align: 'center',
                render: (v: Vendor) => (
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      v.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ),
              },
              {
                key: 'actions', label: 'Actions', align: 'center', sortable: false,
                render: (v: Vendor) => (
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setSelectedVendor(v)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                ),
              },
            ] as Column<Vendor>[]}
            data={vendors}
            rowKey={(v) => v.id}
            sortable
            filterable
            filterPlaceholder="Search vendors..."
            filterKeys={['name', 'id', 'contact', 'taxId', 'status']}
            containerClassName="rounded-lg"
          />
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bills Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vendor invoices and payable items</p>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'Bill #', render: (b: Bill) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tight">{b.id}</span> },
              { key: 'vendorName', label: 'Vendor', render: (b: Bill) => (
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.vendorName}</span>
                  <span className="text-[9px] font-bold text-slate-400">{b.category}</span>
                </div>
              ) },
              { key: 'invoiceNumber', label: 'Invoice #', render: (b: Bill) => <span className="text-[10px] font-bold text-slate-500 font-mono">{b.invoiceNumber}</span> },
              { key: 'dueDate', label: 'Due Date', align: 'center' as const, render: (b: Bill) => <span className="text-[10px] font-bold text-slate-500">{b.dueDate}</span> },
              { key: 'amount', label: 'Gross', align: 'right' as const, render: (b: Bill) => <span className="text-xs font-black text-slate-900 dark:text-white">${b.amount.toLocaleString()}</span> },
              { key: 'withholdingAmount', label: 'Withholding', align: 'right' as const, render: (b: Bill) => <span className="text-xs font-black text-amber-600">${b.withholdingAmount.toLocaleString()}</span> },
              { key: 'netPayable', label: 'Net Payable', align: 'right' as const, render: (b: Bill) => <span className="text-xs font-black text-emerald-600">${b.netPayable.toLocaleString()}</span> },
              { key: 'status', label: 'Status', align: 'center' as const, render: (b: Bill) => (
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${b.status === 'Overdue' ? 'bg-rose-50 text-rose-600' : b.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{b.status}</span>
                </div>
              ) },
              { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false, render: (b: Bill) => (
                <div className="flex justify-center gap-1">
                  <button onClick={() => setSelectedBill(b)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><MoreVertical size={14} /></button>
                </div>
              ) },
            ] as Column<Bill>[]}
            data={bills}
            rowKey={(b) => b.id}
            sortable
            filterable
            filterPlaceholder="Search bills..."
            filterKeys={['id', 'vendorName', 'invoiceNumber', 'status']}
            containerClassName="rounded-lg"
          />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Payments Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vendor payment history and disbursements</p>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'Payment #', render: (p: Payment) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tight">{p.id}</span> },
              { key: 'vendorName', label: 'Vendor', render: (p: Payment) => <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.vendorName}</span> },
              { key: 'paymentDate', label: 'Payment Date', align: 'center' as const, render: (p: Payment) => <span className="text-[10px] font-bold text-slate-500">{p.paymentDate}</span> },
              { key: 'paymentMethod', label: 'Method', render: (p: Payment) => <span className="text-[10px] font-bold text-slate-500">{p.paymentMethod}</span> },
              { key: 'reference', label: 'Reference', render: (p: Payment) => <span className="text-[10px] font-bold text-slate-500 font-mono">{p.reference}</span> },
              { key: 'amount', label: 'Amount', align: 'right' as const, render: (p: Payment) => <span className="text-xs font-black text-slate-900 dark:text-white">${p.amount.toLocaleString()}</span> },
              { key: 'status', label: 'Status', align: 'center' as const, render: (p: Payment) => (
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                </div>
              ) },
            ] as Column<Payment>[]}
            data={payments}
            rowKey={(p) => p.id}
            sortable
            filterable
            filterPlaceholder="Search payments..."
            filterKeys={['id', 'vendorName', 'paymentMethod', 'reference', 'status']}
            containerClassName="rounded-lg"
          />
        </div>
      )}

      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Three-Way Matching</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PO, GRN, and invoice reconciliation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending Matches', value: '12', count: 'Awaiting Review', color: 'text-amber-500', icon: AlertCircle },
              { label: 'Matched Today', value: '8', count: 'Approved', color: 'text-emerald-500', icon: CheckCircle2 },
              { label: 'Discrepancies', value: '3', count: 'Need Attention', color: 'text-rose-500', icon: ShieldCheck },
              { label: 'Total Value', value: '$45,200', count: 'In Process', color: 'text-blue-500', icon: DollarSign },
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
                key: 'poNumber',
                label: 'PO #',
                render: (m: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{m.poNumber}</span>,
              },
              {
                key: 'vendor',
                label: 'Vendor',
                render: (m: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{m.vendor}</span>,
              },
              {
                key: 'invoiceMatch',
                label: 'Invoice',
                align: 'center',
                render: (m: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${m.invoiceMatch === 'Matched' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {m.invoiceMatch}
                  </span>
                ),
              },
              {
                key: 'receiptMatch',
                label: 'Receipt',
                align: 'center',
                render: (m: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${m.receiptMatch === 'Matched' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {m.receiptMatch}
                  </span>
                ),
              },
              {
                key: 'poAmount',
                label: 'PO Amount',
                align: 'right',
                render: (m: any) => <span className="text-xs font-black text-slate-900 dark:text-white">${m.poAmount.toLocaleString()}</span>,
              },
              {
                key: 'invoiceAmount',
                label: 'Invoice Amount',
                align: 'right',
                render: (m: any) => <span className="text-xs font-black text-slate-600 dark:text-slate-400">${m.invoiceAmount.toLocaleString()}</span>,
              },
              {
                key: 'variance',
                label: 'Variance',
                align: 'right',
                render: (m: any) => (
                  <span className={`text-xs font-black ${Math.abs(m.variance) < 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.variance > 0 ? '+' : ''}{m.variance.toLocaleString()}%
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (m: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    m.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                    m.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {m.status}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                sortable: false,
                render: (m: any) => (
                  <div className="flex justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View Details"><Eye size={14} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Approve"><CheckCircle2 size={14} /></button>
                  </div>
                ),
              },
            ]}
            data={[
              { poNumber: 'PO-2024-089', vendor: 'Apex Cleaning Supplies', invoiceMatch: 'Matched', receiptMatch: 'Matched', poAmount: 5000, invoiceAmount: 5000, variance: 0, status: 'Approved' },
              { poNumber: 'PO-2024-092', vendor: 'Food Provisions Ltd', invoiceMatch: 'Matched', receiptMatch: 'Pending', poAmount: 8500, invoiceAmount: 8425, variance: -0.88, status: 'Pending' },
              { poNumber: 'PO-2024-078', vendor: 'Maintenance Services', invoiceMatch: 'Pending', receiptMatch: 'Matched', poAmount: 3200, invoiceAmount: 3500, variance: 9.38, status: 'Discrepancy' },
              { poNumber: 'PO-2024-095', vendor: 'Office Supplies Co', invoiceMatch: 'Matched', receiptMatch: 'Matched', poAmount: 1200, invoiceAmount: 1200, variance: 0, status: 'Approved' },
              { poNumber: 'PO-2024-082', vendor: 'Tech Equipment Inc', invoiceMatch: 'Matched', receiptMatch: 'Pending', poAmount: 15000, invoiceAmount: 14850, variance: -1, status: 'Pending' },
            ]}
            rowKey={(m: any) => m.poNumber}
            sortable
            filterable
            filterPlaceholder="Search matches..."
            filterKeys={['poNumber', 'vendor', 'status']}
            emptyMessage="No three-way matches found."
          />
        </div>
      )}

      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Payment Scheduling</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Automated payment scheduling and approval</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Scheduled Payments', value: '15', count: 'This Week', color: 'text-blue-500', icon: Calendar },
              { label: 'Total Scheduled', value: '$78,500', count: 'Upcoming', color: 'text-emerald-500', icon: DollarSign },
              { label: 'Overdue Scheduled', value: '3', count: 'Missed', color: 'text-rose-500', icon: AlertCircle },
              { label: 'Auto-Pay Enabled', value: '8', count: 'Vendors', color: 'text-indigo-500', icon: ShieldCheck },
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
                key: 'vendor',
                label: 'Vendor',
                render: (s: any) => <span className="text-xs font-bold text-slate-900 dark:text-white">{s.vendor}</span>,
              },
              {
                key: 'billNumber',
                label: 'Bill #',
                render: (s: any) => <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{s.billNumber}</span>,
              },
              {
                key: 'scheduledDate',
                label: 'Scheduled Date',
                render: (s: any) => <span className="text-xs font-bold text-slate-500">{s.scheduledDate}</span>,
              },
              {
                key: 'amount',
                label: 'Amount',
                align: 'right',
                render: (s: any) => <span className="text-xs font-black text-slate-900 dark:text-white">${s.amount.toLocaleString()}</span>,
              },
              {
                key: 'paymentMethod',
                label: 'Payment Method',
                render: (s: any) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.paymentMethod}</span>,
              },
              {
                key: 'frequency',
                label: 'Frequency',
                align: 'center',
                render: (s: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    s.frequency === 'One-time' ? 'bg-slate-50 text-slate-600' :
                    s.frequency === 'Weekly' ? 'bg-blue-50 text-blue-600' :
                    s.frequency === 'Monthly' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {s.frequency}
                  </span>
                ),
              },
              {
                key: 'autoPay',
                label: 'Auto-Pay',
                align: 'center',
                render: (s: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${s.autoPay ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                    {s.autoPay ? 'Enabled' : 'Disabled'}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (s: any) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    s.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                    s.status === 'Processed' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {s.status}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                sortable: false,
                render: (s: any) => (
                  <div className="flex justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Edit Schedule"><Calendar size={14} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Process Now"><Send size={14} /></button>
                  </div>
                ),
              },
            ]}
            data={[
              { vendor: 'Apex Cleaning Supplies', billNumber: 'BILL-2024-089', scheduledDate: '2024-06-10', amount: 5000, paymentMethod: 'Bank Transfer', frequency: 'Monthly', autoPay: true, status: 'Pending' },
              { vendor: 'Food Provisions Ltd', billNumber: 'BILL-2024-092', scheduledDate: '2024-06-12', amount: 8500, paymentMethod: 'Bank Transfer', frequency: 'Weekly', autoPay: true, status: 'Pending' },
              { vendor: 'Maintenance Services', billNumber: 'BILL-2024-078', scheduledDate: '2024-06-08', amount: 3200, paymentMethod: 'Check', frequency: 'One-time', autoPay: false, status: 'Overdue' },
              { vendor: 'Office Supplies Co', billNumber: 'BILL-2024-095', scheduledDate: '2024-06-15', amount: 1200, paymentMethod: 'Bank Transfer', frequency: 'Monthly', autoPay: true, status: 'Pending' },
              { vendor: 'Tech Equipment Inc', billNumber: 'BILL-2024-082', scheduledDate: '2024-06-20', amount: 15000, paymentMethod: 'Wire', frequency: 'Quarterly', autoPay: false, status: 'Pending' },
            ]}
            rowKey={(s: any) => s.billNumber}
            sortable
            filterable
            filterPlaceholder="Search schedules..."
            filterKeys={['vendor', 'billNumber', 'status']}
            emptyMessage="No scheduled payments found."
          />
        </div>
      )}

      <ModalSystem
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={selectedVendor?.name ?? ''}
        subtitle={`Vendor ID: ${selectedVendor?.id ?? ''}`}
        variant="info"
        size="xl"
        showFooter={false}
      >
            {selectedVendor && (
              <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Email</span>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedVendor?.contact || '-'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phone</span>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedVendor?.phone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Address</span>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedVendor?.address || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tax ID (TIN)</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{selectedVendor?.taxId || '-'}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Withholding Rate</span>
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-amber-600" />
                    <span className="text-xs font-black text-amber-600">{selectedVendor?.withholdingRate ?? 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Outstanding Balance</span>
                    <span className="text-2xl font-black text-indigo-600">${(selectedVendor?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedVendor?.category || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-700/20">
              <button 
                onClick={() => setSelectedVendor(null)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Close
              </button>
            </div>
      </ModalSystem>

      <ModalSystem
        isOpen={showNewVendor}
        onClose={() => setShowNewVendor(false)}
        title="New Vendor"
        subtitle="Register a new supplier"
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Vendor Name *</label>
                  <input
                    type="text"
                    value={newVendorForm.name}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Name</label>
                  <input
                    type="text"
                    value={newVendorForm.contactName}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contact person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email</label>
                  <input
                    type="email"
                    value={newVendorForm.email}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phone</label>
                  <input
                    type="text"
                    value={newVendorForm.phone}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+251 911 234 567"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Address</label>
                <input
                  type="text"
                  value={newVendorForm.address}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Street, City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tax ID (TIN)</label>
                  <input
                    type="text"
                    value={newVendorForm.taxId}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, taxId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="TIN-123456789"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Withholding Rate (%)</label>
                  <input
                    type="number"
                    value={newVendorForm.withholdingRate}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, withholdingRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                <select
                  value={newVendorForm.category}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Operations">Operations</option>
                  <option value="F&B">F&B</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-700/20">
              <button
                onClick={() => setShowNewVendor(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVendor}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Create Vendor
              </button>
            </div>
      </ModalSystem>

      <ModalSystem
        isOpen={showNewBill}
        onClose={() => setShowNewBill(false)}
        title="New Bill"
        subtitle="Record a vendor invoice"
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Vendor *</label>
                <select
                  value={newBillForm.vendorId}
                  onChange={(e) => setNewBillForm({ ...newBillForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Invoice Number *</label>
                  <input
                    type="text"
                    value={newBillForm.invoiceNumber}
                    onChange={(e) => setNewBillForm({ ...newBillForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="INV-2024-001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                  <input
                    type="text"
                    value={newBillForm.category}
                    onChange={(e) => setNewBillForm({ ...newBillForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Operations"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Invoice Date *</label>
                  <input
                    type="date"
                    value={newBillForm.invoiceDate}
                    onChange={(e) => setNewBillForm({ ...newBillForm, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Due Date *</label>
                  <input
                    type="date"
                    value={newBillForm.dueDate}
                    onChange={(e) => setNewBillForm({ ...newBillForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Gross Amount</label>
                  <input
                    type="number"
                    value={newBillForm.amount}
                    onChange={(e) => setNewBillForm({ ...newBillForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">VAT Amount</label>
                  <input
                    type="number"
                    value={newBillForm.taxAmount}
                    onChange={(e) => setNewBillForm({ ...newBillForm, taxAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Withholding</label>
                  <input
                    type="number"
                    value={newBillForm.withholdingAmount}
                    onChange={(e) => setNewBillForm({ ...newBillForm, withholdingAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-700/20">
              <button
                onClick={() => setShowNewBill(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBill}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Create Bill
              </button>
            </div>
      </ModalSystem>

      <ModalSystem
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        title={selectedBill?.id ?? ''}
        subtitle={`Invoice: ${selectedBill?.invoiceNumber ?? ''}`}
        variant="info"
        size="xl"
        showFooter={false}
      >
            <div className="p-6 space-y-6 overflow-y-auto print-area">
              {selectedBill && (
              <>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Vendor</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedBill.vendorName || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Invoice Date</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedBill.invoiceDate || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Due Date</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedBill.dueDate || '-'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Bill Lines</h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-700/20">
                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedBill.lines?.map((line: any, idx: number) => (
                        <tr key={idx} className="text-[10px]">
                          <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{line.description}</td>
                          <td className="px-4 py-2 text-center text-slate-500">{line.quantity}</td>
                          <td className="px-4 py-2 text-right text-slate-500 font-mono">${line.rate.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-white font-mono">${line.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-6 border border-slate-100 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                    <span>Gross Amount</span>
                    <span className="font-mono text-slate-900 dark:text-white">${(selectedBill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                    <span>VAT (15%)</span>
                    <span className="font-mono text-slate-900 dark:text-white">${(selectedBill.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-amber-600 uppercase">
                    <span>Withholding Tax ({selectedBill.amount ? (selectedBill.withholdingAmount / selectedBill.amount * 100).toFixed(1) : 0}%)</span>
                    <span className="font-mono">-${(selectedBill.withholdingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                  <div className="flex justify-between items-center font-black uppercase">
                    <span className="text-xs text-slate-900 dark:text-white">Net Payable</span>
                    <span className="text-xl text-emerald-600 font-mono">${(selectedBill.netPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>

            {selectedBill && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-700/20 no-print">
              <div className="flex gap-2">
                {(selectedBill.status === 'Pending' || selectedBill.status === 'Overdue' || selectedBill.status === 'Partially Paid') && (selectedBill.amountDue || 0) > 0 && (
                  <button
                    onClick={() => handlePayBill(selectedBill)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <ShieldCheck size={14} /> Pay Bill
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <Download size={14} /> Print
                </button>
                <button 
                  onClick={() => setSelectedBill(null)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
            )}
      </ModalSystem>
    </div>
  );
};

export default AccountsPayable;
