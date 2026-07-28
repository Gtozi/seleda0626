import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  PackageCheck,
  PackageX,
  FileSearch,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModalSystem } from '../Shared/ModalSystem';

const GoodsReceiving = () => {
  const [showModal, setShowModal] = useState(false);
  const [expandedGrn, setExpandedGrn] = useState<string | null>(null);
  const [grns, setGrns] = useState([
    { 
      id: 'GRN-2024-402', 
      po: 'PO-2024-86', 
      supplier: 'Global Energy Corp', 
      date: '2024-05-30', 
      qtyExpected: 1, 
      qtyReceived: 1, 
      status: 'Verified', 
      match: 'Perfect',
      items: [
        { name: 'Heavy Duty Diesel Generator', qtyExpected: 1, qtyReceived: 1 }
      ]
    },
    { 
      id: 'GRN-2024-401', 
      po: 'PO-2024-87', 
      supplier: 'Luxury Linen Services', 
      date: '2024-05-28', 
      qtyExpected: 50, 
      qtyReceived: 42, 
      status: 'Partial Receipt', 
      match: 'Discrepancy',
      items: [
        { name: 'Premium King Bedsheets', qtyExpected: 30, qtyReceived: 25 },
        { name: 'Luxury Bath Towels', qtyExpected: 20, qtyReceived: 17 }
      ]
    },
    { 
      id: 'GRN-2024-400', 
      po: 'PO-2024-82', 
      supplier: 'Premium Beverage Co.', 
      date: '2024-05-25', 
      qtyExpected: 12, 
      qtyReceived: 12, 
      status: 'Inspection Pending', 
      match: 'Match',
      items: [
        { name: 'Organic Apple Juice (Crates)', qtyExpected: 12, qtyReceived: 12 }
      ]
    },
  ]);

  const [form, setForm] = useState({
    po: 'PO-2024-88',
    supplier: 'Luxury Linen Services',
    status: 'Verified',
    match: 'Perfect'
  });

  const [formItems, setFormItems] = useState([
    { name: 'Premium Guest Pillows', qtyExpected: 50, qtyReceived: 50 }
  ]);

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      { name: '', qtyExpected: 10, qtyReceived: 10 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const updated = [...formItems];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setFormItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `GRN-2024-${403 + grns.length - 3}`;
    const totalExpected = formItems.reduce((acc, item) => acc + (Number(item.qtyExpected) || 0), 0);
    const totalReceived = formItems.reduce((acc, item) => acc + (Number(item.qtyReceived) || 0), 0);

    setGrns([
      {
        id: nextId,
        po: form.po,
        supplier: form.supplier,
        date: new Date().toISOString().substring(0, 10),
        qtyExpected: totalExpected,
        qtyReceived: totalReceived,
        status: form.status,
        match: form.match,
        items: formItems.map(item => ({
          name: item.name,
          qtyExpected: Number(item.qtyExpected),
          qtyReceived: Number(item.qtyReceived)
        }))
      },
      ...grns
    ]);
    setShowModal(false);
    setForm({
      po: `PO-2024-${Math.floor(89 + Math.random() * 20)}`,
      supplier: 'Luxury Linen Services',
      status: 'Verified',
      match: 'Perfect'
    });
    setFormItems([
      { name: 'Premium Guest Pillows', qtyExpected: 50, qtyReceived: 50 }
    ]);
  };

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Deliveries Today', value: '14', sub: '8 processed, 6 pending', icon: Truck, color: 'text-indigo-600' },
          { label: 'Variance Rate', value: '2.4%', sub: 'Rejected qty this month', icon: AlertTriangle, color: 'text-rose-600' },
          { label: 'Sync Status', value: '100%', sub: 'Integrated with Inventory', icon: PackageCheck, color: 'text-emerald-600' },
          { label: 'Inspection Queue', value: '3 Items', sub: 'F&B Quality checks', icon: FileSearch, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">Goods Receipt Note (GRN) Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Validation of physical deliveries against procurement bindings</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setShowModal(true)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2"
              >
                 <PackageCheck size={14} />
                 New Receipt
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GRN ID / PO Link</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantities</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Validation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {grns.map((grn, i) => (
              <React.Fragment key={i}>
                <tr 
                  onClick={() => setExpandedGrn(expandedGrn === grn.id ? null : grn.id)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{grn.id}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">PO: {grn.po}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{grn.supplier}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{grn.date}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{grn.qtyReceived} / {grn.qtyExpected}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Received / Expected</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                           grn.match === 'Perfect' ? 'bg-emerald-50 text-emerald-600' : 
                           grn.match === 'Match' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                           {grn.match}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{grn.status}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                     <div className="flex justify-end gap-2">
                         <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Match with Invoice">
                            <Scale size={14} />
                         </button>
                         <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                            <MoreVertical size={14} />
                         </button>
                     </div>
                  </td>
                </tr>
                {expandedGrn === grn.id && grn.items && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-slate-50/40 dark:bg-slate-950/20 border-t border-b border-indigo-50/20">
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-2">Verified Items ({grn.items.length})</span>
                        <div className="space-y-1.5">
                          {grn.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/60 text-xs text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.name || "Untitled Item"}</span>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] font-mono mt-1 sm:mt-0">
                                <span className="text-slate-400">Expected: <strong className="text-slate-700 dark:text-slate-300">{item.qtyExpected}</strong></span>
                                <span className="text-slate-400">Received: <strong className={`font-black ${item.qtyReceived < item.qtyExpected ? "text-rose-500" : "text-emerald-500"}`}>{item.qtyReceived}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ModalSystem
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register Procurement Receipt"
        subtitle="Physical Audit Protocol"
        icon={<PackageCheck size={20} className="text-indigo-600" />}
        variant="form"
        size="lg"
        showFooter={false}
      >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Purchase Order Link</label>
                    <input 
                      required
                      type="text" 
                      value={form.po}
                      onChange={e => setForm({...form, po: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                      placeholder="PO-2024-XX"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplier Name</label>
                    <select 
                      value={form.supplier}
                      onChange={e => setForm({...form, supplier: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                      <option>Global Energy Corp</option>
                      <option>Luxury Linen Services</option>
                      <option>Premium Beverage Co.</option>
                      <option>Metro Food Wholesalers</option>
                      <option>Universal Tech Systems</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Match Audit</label>
                    <select 
                      value={form.match}
                      onChange={e => setForm({...form, match: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                      <option>Perfect</option>
                      <option>Match</option>
                      <option>Discrepancy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Receipt Status</label>
                    <select 
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                      <option>Verified</option>
                      <option>Partial Receipt</option>
                      <option>Inspection Pending</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 my-2 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Physical Goods verification ({formItems.length} items)</h4>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold py-1 px-3 rounded-full flex items-center gap-1 text-[9px] uppercase tracking-wider transition-all"
                    >
                      <Plus size={12} />
                      Add Item Row
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {formItems.map((item, index) => (
                      <div key={index} className="p-4 bg-slate-50/60 dark:bg-slate-950/65 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative space-y-3">
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Item #{index + 1}</div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Item Description</label>
                            <input 
                              required
                              type="text" 
                              value={item.name}
                              onChange={e => handleItemChange(index, 'name', e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-100"
                              placeholder="e.g. Premium Guest Pillows, Cotton Towels"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expected Qty</label>
                            <input 
                              required
                              type="number" 
                              value={item.qtyExpected || ''}
                              onChange={e => handleItemChange(index, 'qtyExpected', Number(e.target.value))}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-slate-800 dark:text-slate-100"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Received Qty</label>
                            <input 
                              required
                              type="number" 
                              value={item.qtyReceived || ''}
                              onChange={e => handleItemChange(index, 'qtyReceived', Number(e.target.value))}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-slate-800 dark:text-slate-100"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Checked Items Quantity</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      Expected: {formItems.reduce((acc, item) => acc + (Number(item.qtyExpected) || 0), 0)} / Received: {formItems.reduce((acc, item) => acc + (Number(item.qtyReceived) || 0), 0)}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-650/20 flex items-center justify-center gap-2 mt-4"
                >
                  Register Validated Procurement Receipt
                </button>
              </form>
      </ModalSystem>
    </div>
  );
};

export default GoodsReceiving;
