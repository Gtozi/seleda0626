import React, { useState } from 'react';
import {
  Search, Filter, Plus, QrCode, Barcode, FileText, ShieldCheck,
  MapPin, Calendar, Box, Zap, Droplets, Thermometer, Factory,
  ArrowUpDown, Utensils, Car, Coffee, Sparkles, MoreVertical,
  Download, Upload, Camera, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface Equipment {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  qrCode: string;
  barcode: string;
  location: string;
  specifications: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    capacity?: string;
    powerRating?: string;
    dimensions?: string;
    weight?: string;
  };
  warranty: {
    startDate: string;
    endDate: string;
    provider: string;
    type: string;
  };
  documentation: {
    manual?: string;
    schematics?: string;
    certificates?: string[];
  };
  registrationDate: string;
  status: 'Active' | 'Under Maintenance' | 'Retired' | 'Warranty Expired';
  lastInspection?: string;
  nextInspection?: string;
}

const EquipmentRegistry: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'EQ-001',
      assetCode: 'GEN-01',
      name: 'Backup Generator 500kVA',
      category: 'Power Systems',
      qrCode: 'QR-GEN-001',
      barcode: 'BC-GEN-001',
      location: 'Plant Room 1',
      specifications: {
        manufacturer: 'Cummins Power',
        model: 'C500D5',
        serialNumber: 'CUM-2022-GEN-001',
        capacity: '500 kVA',
        powerRating: '400V, 720A',
        dimensions: '3.5m x 1.8m x 2.2m',
        weight: '4500 kg',
      },
      warranty: {
        startDate: '2022-03-15',
        endDate: '2027-03-15',
        provider: 'Cummins Power Systems',
        type: 'Comprehensive',
      },
      documentation: {
        manual: 'manual_gen_001.pdf',
        schematics: 'schematics_gen_001.pdf',
        certificates: ['iso_9001.pdf', 'ce_cert.pdf'],
      },
      registrationDate: '2022-03-15',
      status: 'Active',
      lastInspection: '2026-06-15',
      nextInspection: '2026-09-15',
    },
    {
      id: 'EQ-002',
      assetCode: 'AC-LOBBY-01',
      name: 'Central Chiller Unit',
      category: 'HVAC',
      qrCode: 'QR-AC-001',
      barcode: 'BC-AC-001',
      location: 'Rooftop South',
      specifications: {
        manufacturer: 'Daikin Industries',
        model: 'VRV IV',
        serialNumber: 'DAI-2023-AC-001',
        capacity: '1200 kW',
        powerRating: '380V, 3-phase',
        dimensions: '2.8m x 1.5m x 1.8m',
        weight: '1200 kg',
      },
      warranty: {
        startDate: '2023-01-20',
        endDate: '2028-01-20',
        provider: 'Daikin Middle East',
        type: 'Parts & Labor',
      },
      documentation: {
        manual: 'manual_ac_001.pdf',
        schematics: 'schematics_ac_001.pdf',
        certificates: ['energy_star.pdf'],
      },
      registrationDate: '2023-01-20',
      status: 'Under Maintenance',
      lastInspection: '2026-05-20',
      nextInspection: '2026-08-20',
    },
    {
      id: 'EQ-003',
      assetCode: 'EV-A',
      name: 'Service Elevator Alpha',
      category: 'Vertical Transport',
      qrCode: 'QR-EV-A',
      barcode: 'BC-EV-A',
      location: 'Back of House',
      specifications: {
        manufacturer: 'Otis Worldwide',
        model: 'Gen2',
        serialNumber: 'OTI-2022-EV-A',
        capacity: '1000 kg',
        powerRating: '15 kW',
        dimensions: '2.1m x 1.5m x 2.4m',
        weight: '2500 kg',
      },
      warranty: {
        startDate: '2022-11-10',
        endDate: '2032-11-10',
        provider: 'Otis Ethiopia',
        type: 'Extended 10-Year',
      },
      documentation: {
        manual: 'manual_ev_a.pdf',
        schematics: 'schematics_ev_a.pdf',
        certificates: ['safety_cert.pdf', 'iso_9001.pdf'],
      },
      registrationDate: '2022-11-10',
      status: 'Active',
      lastInspection: '2026-06-10',
      nextInspection: '2026-09-10',
    },
    {
      id: 'EQ-004',
      assetCode: 'BOILER-02',
      name: 'Steam Boiler 02',
      category: 'HVAC',
      qrCode: 'QR-BOILER-02',
      barcode: 'BC-BOILER-02',
      location: 'Boiler Room',
      specifications: {
        manufacturer: 'Bosch',
        model: 'Uni 3000 T',
        serialNumber: 'BOS-2021-BOILER-02',
        capacity: '2000 kg/h',
        powerRating: '1500 kW',
        dimensions: '3.2m x 2.0m x 2.5m',
        weight: '3800 kg',
      },
      warranty: {
        startDate: '2021-08-01',
        endDate: '2024-08-01',
        provider: 'Bosch Thermotechnology',
        type: 'Standard',
      },
      documentation: {
        manual: 'manual_boiler_02.pdf',
        schematics: 'schematics_boiler_02.pdf',
        certificates: ['pressure_vessel.pdf', 'iso_9001.pdf'],
      },
      registrationDate: '2021-08-01',
      status: 'Warranty Expired',
      lastInspection: '2026-05-01',
      nextInspection: '2026-08-01',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const categories = ['All', 'Power Systems', 'HVAC', 'Water Systems', 'Vertical Transport', 'Kitchen Equipment', 'Laundry Equipment', 'IT Equipment'];
  const statuses = ['All', 'Active', 'Under Maintenance', 'Retired', 'Warranty Expired'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Power Systems': return Zap;
      case 'HVAC': return Thermometer;
      case 'Water Systems': return Droplets;
      case 'Vertical Transport': return ArrowUpDown;
      case 'Kitchen Equipment': return Utensils;
      case 'Laundry Equipment': return Car;
      case 'IT Equipment': return Factory;
      default: return Box;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Under Maintenance': return 'bg-amber-500';
      case 'Retired': return 'bg-slate-500';
      case 'Warranty Expired': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const isWarrantyValid = (warranty: Equipment['warranty']) => {
    return new Date(warranty.endDate) > new Date();
  };

  const filteredEquipment = equipment.filter(eq => {
    if (activeCategory !== 'All' && eq.category !== activeCategory) return false;
    if (activeStatus !== 'All' && eq.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Equipment Registry</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Asset registration, QR/barcode labeling, specifications & documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            Register Equipment
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category);
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter flex items-center gap-1.5 ${
                activeCategory === category
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {category}
            </button>
          );
        })}
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
              <Box size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{equipment.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Equipment</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <QrCode size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{equipment.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">QR Labels Generated</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <ShieldCheck size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{equipment.filter(e => isWarrantyValid(e.warranty)).length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Under Warranty</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{equipment.filter(e => !isWarrantyValid(e.warranty)).length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Warranty Expired</span>
        </div>
      </div>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredEquipment.map((eq) => {
            const CategoryIcon = getCategoryIcon(eq.category);
            const warrantyValid = isWarrantyValid(eq.warranty);
            return (
              <div
                key={eq.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{eq.assetCode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getStatusColor(eq.status)} text-white`}>
                        {eq.status}
                      </span>
                      {warrantyValid ? (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-1">
                          <ShieldCheck size={8} />
                          Warranty Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-1">
                          <AlertTriangle size={8} />
                          Warranty Expired
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{eq.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <CategoryIcon size={10} className="text-indigo-500" />
                          {eq.category}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin size={10} className="text-indigo-500" />
                          {eq.location}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Manufacturer</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{eq.specifications.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Model</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{eq.specifications.model}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Serial No.</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{eq.specifications.serialNumber}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Capacity</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{eq.specifications.capacity || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                        <QrCode size={14} className="text-indigo-500" />
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tight">QR Code</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{eq.qrCode}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                        <Barcode size={14} className="text-purple-500" />
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tight">Barcode</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">{eq.barcode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tight">Warranty</span>
                        <span className={`text-[10px] font-bold ${warrantyValid ? 'text-emerald-600' : 'text-rose-600'} block`}>
                          {eq.warranty.endDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tight">Next Inspection</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{eq.nextInspection || '—'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition" title="View Documentation">
                        <FileText size={16} />
                      </button>
                      <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition" title="Print QR Code">
                        <Download size={16} />
                      </button>
                      <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition" title="More Options">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Label & documentation</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <QrCode size={16} className="text-indigo-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Generate QR Labels</span>
                  <span className="text-[8px] text-slate-400 font-medium">Batch print equipment labels</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <Camera size={16} className="text-emerald-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Scan Equipment</span>
                  <span className="text-[8px] text-slate-400 font-medium">Mobile asset identification</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition">
                <Upload size={16} className="text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-white block">Upload Documents</span>
                  <span className="text-[8px] text-slate-400 font-medium">Manuals, certificates, specs</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Warranty Status</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Coverage overview</p>
            </div>

            <div className="space-y-3">
              {equipment.slice(0, 4).map((eq, i) => {
                const valid = isWarrantyValid(eq.warranty);
                return (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      {valid ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-rose-500" />}
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{eq.assetCode}</span>
                    </div>
                    <span className={`text-[9px] font-black ${valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {eq.warranty.endDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentRegistry;
