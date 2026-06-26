
import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Fuel, 
  Battery, 
  Sun, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  Gauge,
  Thermometer,
  Calendar,
  CloudLightning,
  ChevronRight,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

const UtilitiesManagement: React.FC = () => {
  const [activePlant, setActivePlant] = useState<'overall' | 'generator' | 'water' | 'electricity'>('overall');

  const consumptionData = [
    { day: 'Mon', electricity: 420, water: 1200, fuel: 45 },
    { day: 'Tue', electricity: 450, water: 1100, fuel: 42 },
    { day: 'Wed', electricity: 480, water: 1300, fuel: 50 },
    { day: 'Thu', electricity: 510, water: 1450, fuel: 55 },
    { day: 'Fri', electricity: 490, water: 1250, fuel: 48 },
    { day: 'Sat', electricity: 460, water: 1150, fuel: 40 },
    { day: 'Sun', electricity: 440, water: 1050, fuel: 38 },
  ];

  const generatorStats = [
    { label: 'Running Hours', value: '42.5h', icon: Clock },
    { label: 'Last Service', value: '8 days ago', icon: Calendar },
    { label: 'Fuel Level', value: '82%', icon: Fuel },
    { label: 'Battery Health', value: '98%', icon: Battery },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Utilities & Plant Operations</h2>
           <p className="text-xs text-slate-400 font-medium">Real-time resource tracking and plant management</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">
              <Calendar size={14} />
              Readings Log
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest transition shadow-md shadow-indigo-200 dark:shadow-none">
              <CloudLightning size={14} />
              Forecasting
           </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {[
          { id: 'overall', label: 'Overall Consumption', icon: Activity },
          { id: 'electricity', label: 'Electricity Grid', icon: Zap },
          { id: 'generator', label: 'Backup Power', icon: Fuel },
          { id: 'water', label: 'Water Systems', icon: Droplets },
        ].map((plant) => (
          <button
            key={plant.id}
            onClick={() => setActivePlant(plant.id as any)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest flex items-center gap-2 ${
              activePlant === plant.id 
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <plant.icon size={12} />
            {plant.label}
          </button>
        ))}
      </div>

      {activePlant === 'overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { label: 'Electricity Usage', value: '48.2 MWh', trend: '+2.4%', icon: Zap, color: 'indigo' },
                   { label: 'Water Usage', value: '1,420 m³', trend: '-1.8%', icon: Droplets, color: 'blue' },
                   { label: 'Fuel Consumed', value: '450 L', trend: '+0.5%', icon: Fuel, color: 'amber' },
                 ].map((u, i) => (
                   <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-${u.color}-500`}>
                            <u.icon size={18} />
                         </div>
                         <div className={`flex items-center gap-1 text-[10px] font-black ${u.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {u.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {u.trend}
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{u.label} (MTD)</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{u.value}</span>
                   </div>
                 ))}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Consumption Trends</h3>
                       <p className="text-[10px] text-slate-400">Weekly comparison of main resources</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span className="text-[8px] font-black text-slate-400 uppercase">Electricity</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[8px] font-black text-slate-400 uppercase">Water</span>
                       </div>
                    </div>
                 </div>
                 <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={consumptionData}>
                          <defs>
                             <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={10} />
                          <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={10} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="electricity" stroke="#6366f1" fillOpacity={1} fill="url(#colorElec)" strokeWidth={3} />
                          <Area type="monotone" dataKey="water" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={3} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
                 <div>
                    <h3 className="text-sm font-sans font-extrabold leading-tight">Abnormal Usage Detection</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">AI-powered leak & draw drift</p>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3">
                       <CheckCircle2 size={16} className="text-emerald-400" />
                       <div className="flex-1">
                          <span className="block text-[10px] font-black uppercase tracking-tight">Main Grid Inflow</span>
                          <p className="text-[10px] text-white/70 mt-0.5">Voltage stable. Harmonic distortion within range (0.2%).</p>
                       </div>
                    </div>
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3">
                       <AlertTriangle size={16} className="text-rose-400" />
                       <div className="flex-1">
                          <span className="block text-[10px] font-black uppercase tracking-tight text-rose-400">Flow Alert: Sector C</span>
                          <p className="text-[10px] text-white/70 mt-0.5">Sudden 15% spike in water flow detected in the gardens area.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 text-center">
                 <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Utility Cost Forecast</h3>
                 <div className="py-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Projected Monthly Spend</span>
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">$14,580</span>
                    <p className="text-[10px] text-rose-500 font-bold mt-2">+5.2% vs Budget</p>
                 </div>
                 <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">
                    Audit Cost Centers
                 </button>
              </div>
           </div>
        </div>
      )}

      {activePlant === 'generator' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
               <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full border-8 border-emerald-500 border-t-emerald-200 flex items-center justify-center mb-6 relative">
                     <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-md shadow-emerald-200" />
                     <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">ON</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ECO Mode</span>
                     </div>
                  </div>
                  <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white">Main Generator (G-01)</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-1">
                     <Zap size={14} /> Available & Ready
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-10">
                     {generatorStats.map((s, i) => (
                        <div key={i} className="space-y-1 text-left">
                           <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                              <s.icon size={12} />
                              <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                           </div>
                           <span className="text-base font-black text-slate-800 dark:text-slate-200 block leading-tight">{s.value}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fuel History (Liters)</h4>
                     <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={consumptionData.slice(-5)}>
                              <Bar dataKey="fuel" fill="#6366f1" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Events</h4>
                     <div className="space-y-3">
                        {[
                          { time: '02:30 AM', event: 'Cold Start Success', color: 'text-emerald-500' },
                          { time: 'Yesterday', event: 'Weekly Load Test Passed', color: 'text-blue-500' },
                          { time: '2 Days ago', event: 'Refueled (200L)', color: 'text-indigo-500' },
                        ].map((e, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-50 dark:border-slate-850 last:border-0">
                             <span className="text-slate-400 font-medium">{e.time}</span>
                             <span className={`font-bold ${e.color}`}>{e.event}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
               <div className="bg-indigo-600 text-white p-6 rounded-3xl space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest">Service Controls</h4>
                  <div className="space-y-3">
                     <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between group transition">
                        <span className="text-[10px] font-black uppercase tracking-widest">Manual Start</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                     </button>
                     <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between group transition">
                        <span className="text-[10px] font-black uppercase tracking-widest">Fuel Log Entry</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                     </button>
                     <button className="w-full bg-rose-500/80 hover:bg-rose-600 p-4 rounded-2xl flex items-center justify-between group transition">
                        <span className="text-[10px] font-black uppercase tracking-widest">Emergency Stop</span>
                        <AlertTriangle size={16} />
                     </button>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tech Specs</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500">Output</span>
                        <span className="text-[10px] font-mono text-slate-900 dark:text-white font-black">500 kVA</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500">Engine Type</span>
                        <span className="text-[10px] font-mono text-slate-900 dark:text-white font-black">V12 Turbo</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500">Control Unit</span>
                        <span className="text-[10px] font-mono text-slate-900 dark:text-white font-black">Deep Sea 8610</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default UtilitiesManagement;
