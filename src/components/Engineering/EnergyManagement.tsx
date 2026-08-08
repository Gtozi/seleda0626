import React, { useState } from 'react';
import {
  Zap, TrendingUp, BarChart3, Leaf, Gauge, Activity,
  Search, Filter, Plus, Calendar, Download, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Thermometer,
  Droplets, Flame, Sun, Wind, DollarSign
} from 'lucide-react';

interface EnergyMetric {
  id: string;
  date: string;
  electricity: number;
  water: number;
  gas: number;
  diesel: number;
  solar: number;
  totalCost: number;
  carbonFootprint: number;
}

interface EquipmentEfficiency {
  id: string;
  equipmentName: string;
  category: string;
  currentEfficiency: number;
  targetEfficiency: number;
  status: 'Optimal' | 'Warning' | 'Critical';
  lastMeasured: string;
}

interface EnergyProject {
  id: string;
  name: string;
  type: 'LED Upgrade' | 'HVAC Optimization' | 'Solar Installation' | 'Insulation' | 'Variable Speed Drives';
  status: 'Planned' | 'In Progress' | 'Completed';
  estimatedSavings: number;
  actualSavings?: number;
  investment: number;
  roi: number;
  completionDate?: string;
}

const EnergyManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<EnergyMetric[]>([
    {
      id: 'EM-001',
      date: '2026-07-29',
      electricity: 1250,
      water: 450,
      gas: 320,
      diesel: 150,
      solar: 280,
      totalCost: 2450,
      carbonFootprint: 1.8,
    },
    {
      id: 'EM-002',
      date: '2026-07-28',
      electricity: 1180,
      water: 420,
      gas: 300,
      diesel: 140,
      solar: 260,
      totalCost: 2300,
      carbonFootprint: 1.7,
    },
    {
      id: 'EM-003',
      date: '2026-07-27',
      electricity: 1320,
      water: 480,
      gas: 340,
      diesel: 160,
      solar: 290,
      totalCost: 2590,
      carbonFootprint: 1.9,
    },
  ]);

  const [equipmentEfficiency, setEquipmentEfficiency] = useState<EquipmentEfficiency[]>([
    {
      id: 'EE-001',
      equipmentName: 'Central Chiller Unit',
      category: 'HVAC',
      currentEfficiency: 78,
      targetEfficiency: 85,
      status: 'Warning',
      lastMeasured: '2026-07-28',
    },
    {
      id: 'EE-002',
      equipmentName: 'Backup Generator',
      category: 'Power Systems',
      currentEfficiency: 92,
      targetEfficiency: 90,
      status: 'Optimal',
      lastMeasured: '2026-07-29',
    },
    {
      id: 'EE-003',
      equipmentName: 'Water Booster Pumps',
      category: 'Water Systems',
      currentEfficiency: 65,
      targetEfficiency: 80,
      status: 'Critical',
      lastMeasured: '2026-07-27',
    },
    {
      id: 'EE-004',
      equipmentName: 'Steam Boiler 02',
      category: 'HVAC',
      currentEfficiency: 88,
      targetEfficiency: 85,
      status: 'Optimal',
      lastMeasured: '2026-07-28',
    },
  ]);

  const [projects, setProjects] = useState<EnergyProject[]>([
    {
      id: 'EP-001',
      name: 'LED Lighting Upgrade - Guest Rooms',
      type: 'LED Upgrade',
      status: 'Completed',
      estimatedSavings: 15000,
      actualSavings: 16500,
      investment: 45000,
      roi: 36.7,
      completionDate: '2026-06-15',
    },
    {
      id: 'EP-002',
      name: 'HVAC VSD Installation',
      type: 'Variable Speed Drives',
      status: 'In Progress',
      estimatedSavings: 22000,
      investment: 65000,
      roi: 33.8,
    },
    {
      id: 'EP-003',
      name: 'Solar Panel Array - Rooftop',
      type: 'Solar Installation',
      status: 'Planned',
      estimatedSavings: 35000,
      investment: 120000,
      roi: 29.2,
    },
    {
      id: 'EP-004',
      name: 'Building Insulation Upgrade',
      type: 'Insulation',
      status: 'Planned',
      estimatedSavings: 18000,
      investment: 55000,
      roi: 32.7,
    },
  ]);

  const getEfficiencyColor = (status: string) => {
    switch (status) {
      case 'Optimal': return 'text-emerald-500';
      case 'Warning': return 'text-amber-500';
      case 'Critical': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const getEfficiencyBg = (status: string) => {
    switch (status) {
      case 'Optimal': return 'bg-emerald-50 dark:bg-emerald-500/10';
      case 'Warning': return 'bg-amber-50 dark:bg-amber-500/10';
      case 'Critical': return 'bg-rose-50 dark:bg-rose-500/10';
      default: return 'bg-slate-50 dark:bg-slate-800';
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Energy Management</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Energy dashboard, peak demand monitoring, equipment efficiency & sustainability</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export Report
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Energy Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Zap size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics[0].electricity} kWh</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Electricity</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <Droplets size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics[0].water} L</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Water</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <Leaf size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics[0].carbonFootprint} t</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carbon Footprint</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500">
              <DollarSign size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">${metrics[0].totalCost}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Cost</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Equipment Efficiency */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Equipment Efficiency</h3>
                <p className="text-[10px] text-slate-400">Real-time performance monitoring</p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-3">
              {equipmentEfficiency.map((eq) => (
                <div key={eq.id} className={`p-4 rounded-2xl ${getEfficiencyBg(eq.status)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{eq.equipmentName}</span>
                      <span className="text-[10px] font-bold text-slate-500 ml-2">{eq.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${getEfficiencyColor(eq.status)}`}>{eq.currentEfficiency}%</span>
                      {eq.status === 'Optimal' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {eq.status === 'Warning' && <AlertTriangle size={16} className="text-amber-500" />}
                      {eq.status === 'Critical' && <AlertTriangle size={16} className="text-rose-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1">
                        <span>Current</span>
                        <span>Target: {eq.targetEfficiency}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            eq.status === 'Optimal' ? 'bg-emerald-500' : eq.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${eq.currentEfficiency}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400">{eq.lastMeasured}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Energy Saving Projects</h3>
                <p className="text-[10px] text-slate-400">Capital projects and ROI tracking</p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{project.name}</span>
                        <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-tight ${getProjectStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{project.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tight">ROI</span>
                      <span className="text-lg font-black text-emerald-600">{project.roi}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tight">Investment</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${project.investment.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tight">Est. Savings</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${project.estimatedSavings.toLocaleString()}/yr</span>
                    </div>
                    {project.actualSavings && (
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tight">Actual Savings</span>
                        <span className="text-[10px] font-bold text-emerald-600">${project.actualSavings.toLocaleString()}/yr</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Sustainability KPIs</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Environmental impact</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Carbon Reduction</span>
                  <span className="block text-xl font-black">-12%</span>
                </div>
                <ArrowDownRight size={16} className="text-emerald-400" />
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Energy Intensity</span>
                  <span className="block text-xl font-black">245 kWh/m²</span>
                </div>
                <ArrowUpRight size={16} className="text-amber-400" />
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Renewable %</span>
                  <span className="block text-xl font-black">18%</span>
                </div>
                <Sun size={16} className="text-amber-400" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Water Intensity</span>
                  <span className="block text-xl font-black">85 L/guest</span>
                </div>
                <ArrowDownRight size={16} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Peak Demand Alert</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Load monitoring</p>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">High Demand Period</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Peak demand reached 450 kW at 14:30. Consider shifting non-critical loads to off-peak hours.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Current Load</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">380 kW</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Peak Today</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">450 kW</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Contract Limit</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">500 kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyManagement;
