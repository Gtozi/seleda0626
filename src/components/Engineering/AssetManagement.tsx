
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Search,
  Filter,
  MapPin,
  Calendar,
  ShieldCheck,
  Activity,
  MoreVertical,
  Plus,
  ArrowUpRight,
  Clipboard,
  History,
  FileText,
  Heart,
  Droplets,
  Zap,
  Thermometer,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { Asset, AssetStatus } from '../../types/engineering';
import { ModalSystem } from '../Shared/ModalSystem';
import { fetchAssets, createAsset, updateAsset, deleteAsset, type Asset as DBAsset } from '../../services/engineeringService';

const AssetManagement: React.FC = () => {
  const [dbAssets, setDbAssets] = useState<DBAsset[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    assetCode: '', assetName: '', assetCategory: 'HVAC', location: '',
    purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: 0,
    salvageValue: 0, usefulLifeYears: 10, serialNumber: '', manufacturer: '',
    warrantyStart: '', warrantyEnd: '', warrantyProvider: '', criticality: 'Medium',
  });

  const loadDbAssets = useCallback(async () => {
    setDbLoading(true);
    try { setDbAssets(await fetchAssets()); }
    catch (err) { console.error('Failed to load assets:', err); }
    finally { setDbLoading(false); }
  }, []);

  useEffect(() => { loadDbAssets(); }, [loadDbAssets]);

  const handleAddAsset = async () => {
    try {
      await createAsset(addForm);
      setShowAddModal(false);
      setAddForm({ assetCode: '', assetName: '', assetCategory: 'HVAC', location: '', purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: 0, salvageValue: 0, usefulLifeYears: 10, serialNumber: '', manufacturer: '', warrantyStart: '', warrantyEnd: '', warrantyProvider: '', criticality: 'Medium' });
      loadDbAssets();
    } catch (err: any) { console.error('Failed to create asset:', err); }
  };

  const handleDeleteAsset = async (id: string) => {
    try { await deleteAsset(id); loadDbAssets(); }
    catch (err: any) { console.error('Failed to delete asset:', err); }
  };

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'A-001',
      code: 'GEN-01',
      name: 'Backup Generator 500kVA',
      category: 'Power Systems',
      location: 'Plant Room 1',
      purchaseDate: '2022-03-15',
      supplier: 'Cummins Power',
      warrantyExpiry: '2026-03-15',
      cost: 45000,
      expectedLifeYears: 15,
      status: 'Operational',
      healthScore: 88,
      lastPMDate: '2026-05-10',
      nextPMDate: '2026-06-10',
    },
    {
      id: 'A-002',
      code: 'AC-LOBBY-01',
      name: 'Central Chiller Unit',
      category: 'HVAC',
      location: 'Rooftop South',
      purchaseDate: '2023-01-20',
      supplier: 'Daikin Industries',
      warrantyExpiry: '2028-01-20',
      cost: 28000,
      expectedLifeYears: 10,
      status: 'Under Maintenance',
      healthScore: 62,
      lastPMDate: '2026-02-15',
      nextPMDate: '2026-05-30',
    },
    {
      id: 'A-003',
      code: 'PUMP-W-01',
      name: 'Main Water Booster Pump',
      category: 'Water Systems',
      location: 'Pump House',
      purchaseDate: '2024-06-05',
      supplier: 'Grundfos',
      warrantyExpiry: '2027-06-05',
      cost: 12000,
      expectedLifeYears: 12,
      status: 'Operational',
      healthScore: 94,
      lastPMDate: '2026-05-20',
      nextPMDate: '2026-08-20',
    },
    {
      id: 'A-004',
      code: 'EV-A',
      name: 'Service Elevator Alpha',
      category: 'Vertical Transport',
      location: 'Back of House',
      purchaseDate: '2022-11-10',
      supplier: 'Otis Worldwide',
      warrantyExpiry: '2032-11-10',
      cost: 65000,
      expectedLifeYears: 25,
      status: 'Operational',
      healthScore: 85,
      lastPMDate: '2026-04-25',
      nextPMDate: '2026-05-25',
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Power Systems', 'HVAC', 'Water Systems', 'Vertical Transport', 'Kitchen Equipment'];

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500';
      case 'Under Maintenance': return 'bg-amber-500';
      case 'Out of Service': return 'bg-rose-500';
      case 'Retired': return 'bg-slate-500';
      case 'Replaced': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Engineering Asset Register</h2>
           <p className="text-xs text-slate-400 font-medium">Monitoring {assets.length} critical lodge infrastructure assets</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={loadDbAssets} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <RefreshCw size={16} className={dbLoading ? 'animate-spin' : ''} />
              Refresh
           </button>
           <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <Plus size={16} />
              Add Asset
           </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeCategory === cat 
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {assets.map((asset) => (
            <div key={asset.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                     {asset.category === 'Power Systems' && <Zap size={20} />}
                     {asset.category === 'HVAC' && <Thermometer size={20} />}
                     {asset.category === 'Water Systems' && <Droplets size={20} />}
                     {asset.category === 'Vertical Transport' && <Box size={20} />}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{asset.status}</span>
                  </div>
               </div>

               <div className="space-y-1 mb-6">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{asset.code}</span>
                  <h3 className="font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{asset.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                     <MapPin size={10} className="text-indigo-500" />
                     {asset.location}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-2">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Health Score</span>
                        <span className={`block text-lg font-black ${getHealthColor(asset.healthScore)}`}>{asset.healthScore}%</span>
                     </div>
                     <Heart size={14} className={getHealthColor(asset.healthScore)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Last PM</span>
                        <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{asset.lastPMDate || '-'}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Next PM</span>
                        <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">{asset.nextPMDate || '-'}</span>
                     </div>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-3 gap-2">
                  <button className="p-2 flex flex-col items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition group/btn" title="Maintenance History">
                     <History size={14} className="text-slate-400 group-hover/btn:text-indigo-500" />
                     <span className="text-[8px] font-black text-slate-400 uppercase">History</span>
                  </button>
                  <button className="p-2 flex flex-col items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition group/btn" title="Documents">
                     <FileText size={14} className="text-slate-400 group-hover/btn:text-indigo-500" />
                     <span className="text-[8px] font-black text-slate-400 uppercase">Docs</span>
                  </button>
                  <button className="p-2 flex flex-col items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition group/btn" title="Create Work Order">
                     <ArrowUpRight size={14} className="text-slate-400 group-hover/btn:text-indigo-500" />
                     <span className="text-[8px] font-black text-slate-400 uppercase">Service</span>
                  </button>
               </div>
            </div>
         ))}
      </div>
      {/* DB Assets Section */}
      {dbAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" /> DB Asset Register ({dbAssets.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dbAssets.map((asset) => {
              const isUnderWarranty = asset.warranty_end && new Date(asset.warranty_end) > new Date();
              const dep = asset.accumulated_depreciation || 0;
              const nbv = asset.net_book_value || 0;
              return (
                <div key={asset.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <Box size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${asset.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>{asset.status}</span>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="p-1 text-slate-300 hover:text-rose-600 transition"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{asset.asset_code || '—'}</span>
                    <h3 className="font-sans font-extrabold text-slate-900 dark:text-white leading-tight text-sm">{asset.asset_name || 'Unnamed'}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <MapPin size={10} className="text-indigo-500" /> {asset.location || '—'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Category</span><span className="font-bold text-slate-700 dark:text-slate-300">{asset.asset_category || '—'}</span></div>
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Criticality</span><span className={`font-black ${asset.criticality === 'High' ? 'text-rose-600' : asset.criticality === 'Medium' ? 'text-amber-600' : 'text-slate-400'}`}>{asset.criticality}</span></div>
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Purchase Cost</span><span className="font-bold text-slate-700 dark:text-slate-300">${Number(asset.purchase_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span></div>
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Net Book Value</span><span className="font-bold text-slate-700 dark:text-slate-300">${Number(nbv).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span></div>
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Acc. Dep.</span><span className="font-bold text-slate-700 dark:text-slate-300">${Number(dep).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span></div>
                    <div><span className="text-slate-400 font-black uppercase tracking-tight block">Useful Life</span><span className="font-bold text-slate-700 dark:text-slate-300">{asset.useful_life_years || '—'} yrs</span></div>
                  </div>
                  {asset.warranty_end && (
                    <div className={`mt-3 p-2 rounded-xl flex items-center gap-2 ${isUnderWarranty ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
                      <ShieldCheck size={12} className={isUnderWarranty ? 'text-emerald-500' : 'text-rose-500'} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isUnderWarranty ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isUnderWarranty ? 'Warranty Active' : 'Warranty Expired'} · {asset.warranty_end}
                      </span>
                    </div>
                  )}
                  {asset.manufacturer && (
                    <div className="mt-2 text-[9px] font-bold text-slate-400">Mfr: {asset.manufacturer}{asset.serial_number ? ` · S/N: ${asset.serial_number}` : ''}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Asset" subtitle="Register a new fixed asset with warranty and depreciation" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Asset Code</label>
              <input value={addForm.assetCode} onChange={e => setAddForm({ ...addForm, assetCode: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., GEN-02" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Asset Name</label>
              <input value={addForm.assetName} onChange={e => setAddForm({ ...addForm, assetName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Backup Generator 250kVA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Category</label>
              <select value={addForm.assetCategory} onChange={e => setAddForm({ ...addForm, assetCategory: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Power Systems</option><option>HVAC</option><option>Water Systems</option><option>Vertical Transport</option><option>Kitchen Equipment</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Location</label>
              <input value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Plant Room 2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Purchase Date</label>
              <input type="date" value={addForm.purchaseDate} onChange={e => setAddForm({ ...addForm, purchaseDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Purchase Cost</label>
              <input type="number" value={addForm.purchaseCost} onChange={e => setAddForm({ ...addForm, purchaseCost: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Useful Life (yrs)</label>
              <input type="number" value={addForm.usefulLifeYears} onChange={e => setAddForm({ ...addForm, usefulLifeYears: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Manufacturer</label>
              <input value={addForm.manufacturer} onChange={e => setAddForm({ ...addForm, manufacturer: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Cummins" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Serial Number</label>
              <input value={addForm.serialNumber} onChange={e => setAddForm({ ...addForm, serialNumber: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Warranty Start</label>
              <input type="date" value={addForm.warrantyStart} onChange={e => setAddForm({ ...addForm, warrantyStart: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Warranty End</label>
              <input type="date" value={addForm.warrantyEnd} onChange={e => setAddForm({ ...addForm, warrantyEnd: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Criticality</label>
              <select value={addForm.criticality} onChange={e => setAddForm({ ...addForm, criticality: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAddAsset} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Add Asset</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default AssetManagement;
