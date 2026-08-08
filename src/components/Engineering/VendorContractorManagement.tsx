import React, { useState } from 'react';
import {
  Building2, User, Phone, Mail, FileText, Star, CheckCircle2,
  AlertTriangle, Search, Filter, Plus, Calendar, Clock, MoreVertical,
  DollarSign, Award, ShieldCheck
} from 'lucide-react';

interface Vendor {
  id: string;
  code: string;
  name: string;
  type: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevators' | 'Fire Safety' | 'Landscaping' | 'Cleaning' | 'IT Services' | 'General Contractor';
  contact: {
    person: string;
    phone: string;
    email: string;
  };
  services: string[];
  rating: number;
  contractStatus: 'Active' | 'Expiring' | 'Expired' | 'Pending';
  contractStart: string;
  contractEnd: string;
  performanceScore: number;
  lastServiceDate?: string;
  notes?: string;
}

interface ServiceRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  description: string;
  status: 'Requested' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  requestedDate: string;
  scheduledDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  priority: 'Emergency' | 'High' | 'Normal' | 'Low';
}

const VendorContractorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'VC-001',
      code: 'VND-HVAC-01',
      name: 'CoolTech HVAC Services',
      type: 'HVAC',
      contact: {
        person: 'Michael Chen',
        phone: '+251 911 123 4567',
        email: 'michael@cooltech.et',
      },
      services: ['HVAC Maintenance', 'Chiller Repair', 'AC Installation', 'Duct Cleaning'],
      rating: 4.5,
      contractStatus: 'Active',
      contractStart: '2024-01-15',
      contractEnd: '2027-01-15',
      performanceScore: 92,
      lastServiceDate: '2026-07-20',
    },
    {
      id: 'VC-002',
      code: 'VND-ELEC-01',
      name: 'PowerGrid Electrical',
      type: 'Electrical',
      contact: {
        person: 'Sarah Johnson',
        phone: '+251 911 234 5678',
        email: 'sarah@powergrid.et',
      },
      services: ['Electrical Maintenance', 'Panel Installation', 'Generator Service', 'Lighting'],
      rating: 4.8,
      contractStatus: 'Active',
      contractStart: '2023-06-01',
      contractEnd: '2026-06-01',
      performanceScore: 95,
      lastServiceDate: '2026-07-25',
    },
    {
      id: 'VC-003',
      code: 'VND-ELEV-01',
      name: 'ElevatorPro Ethiopia',
      type: 'Elevators',
      contact: {
        person: 'David Tekle',
        phone: '+251 911 345 6789',
        email: 'david@elevatorpro.et',
      },
      services: ['Elevator Maintenance', 'Modernization', 'Inspection', 'Emergency Repair'],
      rating: 4.2,
      contractStatus: 'Expiring',
      contractStart: '2023-08-01',
      contractEnd: '2026-08-01',
      performanceScore: 88,
      lastServiceDate: '2026-06-15',
    },
    {
      id: 'VC-004',
      code: 'VND-FIRE-01',
      name: 'SafeGuard Fire Systems',
      type: 'Fire Safety',
      contact: {
        person: 'James Wilson',
        phone: '+251 911 456 7890',
        email: 'james@safeguard.et',
      },
      services: ['Fire Alarm Maintenance', 'Extinguisher Service', 'Sprinkler System', 'Inspection'],
      rating: 4.7,
      contractStatus: 'Active',
      contractStart: '2024-02-01',
      contractEnd: '2027-02-01',
      performanceScore: 94,
      lastServiceDate: '2026-07-10',
    },
  ]);

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: 'SR-001',
      vendorId: 'VC-001',
      vendorName: 'CoolTech HVAC Services',
      serviceType: 'Chiller Repair',
      description: 'Annual chiller maintenance and inspection',
      status: 'Scheduled',
      requestedDate: '2026-07-25',
      scheduledDate: '2026-08-05',
      estimatedCost: 2500,
      priority: 'Normal',
    },
    {
      id: 'SR-002',
      vendorId: 'VC-002',
      vendorName: 'PowerGrid Electrical',
      serviceType: 'Generator Service',
      description: 'Quarterly generator inspection and load testing',
      status: 'In Progress',
      requestedDate: '2026-07-28',
      scheduledDate: '2026-07-29',
      estimatedCost: 800,
      priority: 'High',
    },
    {
      id: 'SR-003',
      vendorId: 'VC-004',
      vendorName: 'SafeGuard Fire Systems',
      serviceType: 'Fire Alarm Maintenance',
      description: 'Monthly fire alarm system check and testing',
      status: 'Completed',
      requestedDate: '2026-07-10',
      scheduledDate: '2026-07-15',
      estimatedCost: 450,
      actualCost: 420,
      priority: 'Normal',
    },
  ]);

  const [activeType, setActiveType] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const types = ['All', 'HVAC', 'Electrical', 'Plumbing', 'Elevators', 'Fire Safety', 'Landscaping', 'Cleaning', 'IT Services', 'General Contractor'];
  const statuses = ['All', 'Active', 'Expiring', 'Expired', 'Pending'];

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Expiring': return 'bg-amber-500';
      case 'Expired': return 'bg-rose-500';
      case 'Pending': return 'bg-slate-500';
      default: return 'bg-slate-400';
    }
  };

  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Expiring': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Expired': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Pending': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    if (activeType !== 'All' && vendor.type !== activeType) return false;
    if (activeStatus !== 'All' && vendor.contractStatus !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Vendor & Contractor Management</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">External service providers, contracts, and performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeType === type
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeStatus === status
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Building2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{vendors.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Vendors</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{vendors.filter(v => v.contractStatus === 'Active').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Contracts</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{vendors.filter(v => v.contractStatus === 'Expiring').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiring Soon</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500">
              <Star size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {(vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1)}
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vendors List */}
        <div className="lg:col-span-8 space-y-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{vendor.code}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getContractStatusBadge(vendor.contractStatus)}`}>
                      {vendor.contractStatus}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                      {vendor.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{vendor.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{vendor.rating.toFixed(1)}</span>
                      <span className="text-[10px] font-bold text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-slate-500">{vendor.contact.person}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Contract Start</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{vendor.contractStart}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Contract End</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{vendor.contractEnd}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Performance</span>
                      <span className="text-[10px] font-bold text-emerald-600">{vendor.performanceScore}%</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Last Service</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{vendor.lastServiceDate || '—'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vendor.services.slice(0, 3).map((service, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-bold text-slate-600 dark:text-slate-400">
                        {service}
                      </span>
                    ))}
                    {vendor.services.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-bold text-slate-600 dark:text-slate-400">
                        +{vendor.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition" title="Request Service">
                      <Plus size={16} />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition" title="View Contract">
                      <FileText size={16} />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition" title="More">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Service Requests */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Vendor operations</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <Plus size={16} className="text-blue-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Request Service</span>
                  <span className="text-[8px] text-slate-400 font-medium">Create service request</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <FileText size={16} className="text-emerald-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">View Contracts</span>
                  <span className="text-[8px] text-slate-400 font-medium">Contract management</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <Award size={16} className="text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Performance Review</span>
                  <span className="text-[8px] text-slate-400 font-medium">Vendor ratings</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Recent Service Requests</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Latest requests</p>
            </div>

            <div className="space-y-3">
              {serviceRequests.slice(0, 4).map((request) => (
                <div key={request.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${getRequestStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-[9px] font-black text-slate-400">{request.requestedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{request.serviceType}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">{request.vendorName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorContractorManagement;
