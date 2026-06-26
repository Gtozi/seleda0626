
import React, { useState } from 'react';
import {
  Users2,
  Search,
  Plus,
  Star,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Tag,
  X,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Supplier } from '../../types/inventory';
import { useERP } from '../../context/ERPContext';

const SupplierModule: React.FC = () => {
  const { suppliers, addSupplier } = useERP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showVendorDetail, setShowVendorDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Supplier | null>(null);
  const [showCommHub, setShowCommHub] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [form, setForm] = useState<Omit<Supplier, 'id'>>({
    code: '', name: '', contactPerson: '', phone: '', email: '', status: 'Active', rating: 4.0
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    addSupplier(form);
    setShowAddModal(false);
    setForm({ code: '', name: '', contactPerson: '', phone: '', email: '', status: 'Active', rating: 4.0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Supplier Management</h2>
           <p className="text-xs text-slate-400 font-medium">Tracking {suppliers.length} qualified vendors and delivery performance</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowPerformanceModal(true)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <BarChart2 size={16} />
              Performance Matrix
           </button>
           <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
              <Plus size={16} />
              Onboard Vendor
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex items-center gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Supplier Name, Code, or Contact..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-2.5 pl-9 text-xs outline-none"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {suppliers.filter(v =>
                 !supplierSearch ||
                 v.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                 v.code.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                 v.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase())
               ).map((vendor) => (
                  <div key={vendor.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs flex justify-between group hover:border-emerald-300 transition-all cursor-pointer">
                     <div className="flex gap-4">
                        <div className="relative">
                           <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                              {vendor.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                              vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                           }`} />
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{vendor.name}</h4>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{vendor.code}</span>
                           </div>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">{vendor.contactPerson}</span>
                           <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                 <Star size={10} className="text-amber-500 fill-amber-500" />
                                 {vendor.rating} Performance
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-between items-end">
                        <button
                          onClick={() => { setSelectedVendor(vendor); setShowVendorDetail(true); }}
                          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-300 group-hover:text-slate-600 transition"
                        >
                           <Eye size={16} />
                        </button>
                        <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
               <h3 className="text-sm font-sans font-extrabold flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" /> Vendor KPIs
               </h3>
               
               <div className="space-y-5">
                  {[
                    { label: 'On-Time Delivery', val: 94.2, color: 'text-emerald-400', sub: 'Target: 95%' },
                    { label: 'Quality Score', val: 98.4, color: 'text-blue-400', sub: 'Last 10 GRNs' },
                    { label: 'Avg Lead Time', val: '2.5d', color: 'text-indigo-400', sub: 'Standard: 3d' },
                  ].map((k, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{k.label}</span>
                          <span className={`text-xl font-black ${k.color}`}>{k.val}{typeof k.val === 'number' ? '%' : ''}</span>
                       </div>
                       <div className="flex justify-between items-center text-[8px] font-bold text-white/30 uppercase tracking-tight italic">
                          <span>{k.sub}</span>
                          <div className="flex gap-0.5">
                             {[1, 2, 3, 4].map(idx => <div key={idx} className={`w-1 h-3 rounded-sm ${idx < 4 ? 'bg-emerald-500' : 'bg-white/10'}`} />)}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Recent Vendor Interactions</h3>
               <div className="space-y-4">
                  {[
                    { vendor: 'Global Foods Ltd', msg: 'Price escalation on Dairy lines (+4%) notified for next cycle.', time: 'Today', icon: Tag, color: 'text-amber-500' },
                    { vendor: 'Luxe Supplies', msg: 'New eco-friendly amenity range brochure delivered.', time: 'Yesterday', icon: Truck, color: 'text-indigo-500' },
                  ].map((n, i) => (
                    <div key={i} className="flex gap-3">
                       <div className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-850 flex flex-shrink-0 items-center justify-center ${n.color}`}>
                          <n.icon size={14} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{n.vendor}</span>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{n.msg}</p>
                          <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">{n.time}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <button
                 onClick={() => setShowCommHub(true)}
                 className="w-full mt-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 transition py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-3xs"
               >
                  Vendor Communication Hub
               </button>
            </div>
         </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">Onboard Vendor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="SUP-006" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="Vendor name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Contact Person</label>
                  <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" placeholder="vendor@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Supplier['status'] })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Rating</label>
                  <input type="number" min={1} max={5} step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Matrix Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <BarChart2 size={16} className="text-emerald-500" /> Vendor Performance Matrix
              </h3>
              <button onClick={() => setShowPerformanceModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'On-Time Delivery', val: 94.2, target: 95, color: 'bg-emerald-500' },
                { label: 'Quality Score', val: 98.4, target: 98, color: 'bg-blue-500' },
                { label: 'Lead Time Compliance', val: 87, target: 90, color: 'bg-indigo-500' },
                { label: 'Invoice Accuracy', val: 99.1, target: 99, color: 'bg-amber-500' },
              ].map((k, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{k.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${k.color} rounded-full`} style={{ width: `${Math.min(100, k.val)}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                    <span>Target: {k.target}%</span>
                    <span className={k.val >= k.target ? 'text-emerald-500' : 'text-amber-500'}>{k.val >= k.target ? 'On Target' : 'Below Target'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPerformanceModal(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {showVendorDetail && selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight">Vendor Profile</h3>
              <button onClick={() => setShowVendorDetail(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">
                {selectedVendor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedVendor.name}</h4>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedVendor.code}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-1">
                  <Star size={10} className="fill-amber-500" />
                  {selectedVendor.rating} Rating
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedVendor.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedVendor.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedVendor.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                  selectedVendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>{selectedVendor.status}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowVendorDetail(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Hub Modal */}
      {showCommHub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-sans font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-500" /> Vendor Communication Hub
              </h3>
              <button onClick={() => setShowCommHub(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[
                { vendor: 'Global Foods Ltd', subject: 'Q3 Price Adjustment Notice', body: 'Please be advised that dairy product prices will increase by 4% effective next quarter due to supply chain pressures.', date: 'Today, 09:15', type: 'in' },
                { vendor: 'Luxe Hospitality Supplies', subject: 'New Eco-Friendly Range', body: 'We have delivered the new amenity range brochure. Samples available upon request.', date: 'Yesterday, 16:30', type: 'in' },
                { vendor: 'Inventory Dept', subject: 'Re: PO-5024 Delivery Window', body: 'Confirmed receiving dock availability between 14:00-15:00 today. Please have DN ready.', date: 'Today, 08:00', type: 'out' },
                { vendor: 'Ethiopian Coffee Exporters', subject: 'Shipment Delay Alert', body: 'Due to customs clearance backlog, the green coffee shipment is delayed by 2 business days.', date: 'Jun 12, 11:20', type: 'in' },
              ].map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl border ${
                  msg.type === 'out'
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 ml-8'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 mr-8'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.vendor}</span>
                    <span className="text-[8px] font-bold text-slate-400">{msg.date}</span>
                  </div>
                  <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{msg.subject}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{msg.body}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCommHub(false)} className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierModule;
