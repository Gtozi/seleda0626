
import React, { useState } from 'react';
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
  Thermometer
} from 'lucide-react';
import { Asset, AssetStatus } from '../../types/engineering';

const AssetManagement: React.FC = () => {
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
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <Clipboard size={16} />
              Export Register
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
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
    </div>
  );
};

export default AssetManagement;
