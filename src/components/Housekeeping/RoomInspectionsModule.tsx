/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  Calendar,
  Filter,
  MapPin,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface InspectionItem {
  category: string;
  item: string;
  status: 'Pass' | 'Fail' | 'N/A';
  notes?: string;
}

interface RoomInspection {
  id: string;
  roomNumber: string;
  inspector: string;
  inspectionDate: string;
  status: 'Pass' | 'Fail' | 'Rework Required';
  checklist: InspectionItem[];
  overallScore: number;
  notes?: string;
}

const inspectionCategories = [
  'Bed Quality', 'Bathroom', 'Floors', 'Windows', 'Furniture',
  'Lighting', 'Air Conditioning', 'Television', 'Internet', 'Amenities',
  'Safety Equipment', 'Overall Presentation'
];

const defaultChecklist: InspectionItem[] = [
  { category: 'Bed Quality', item: 'Bed sheets clean and wrinkle-free', status: 'N/A' },
  { category: 'Bed Quality', item: 'Pillows properly fluffed and arranged', status: 'N/A' },
  { category: 'Bathroom', item: 'Toilet, sink, and shower sanitized', status: 'N/A' },
  { category: 'Bathroom', item: 'Towels replaced and neatly arranged', status: 'N/A' },
  { category: 'Bathroom', item: 'Mirror streak-free and clean', status: 'N/A' },
  { category: 'Floors', item: 'Carpet vacuumed or floors mopped', status: 'N/A' },
  { category: 'Windows', item: 'Glass clean and streak-free', status: 'N/A' },
  { category: 'Furniture', item: 'Dusted and arranged properly', status: 'N/A' },
  { category: 'Lighting', item: 'All lights working and clean', status: 'N/A' },
  { category: 'Air Conditioning', item: 'Temperature set correctly', status: 'N/A' },
  { category: 'Television', item: 'Remote present and TV working', status: 'N/A' },
  { category: 'Internet', item: 'WiFi signal strong', status: 'N/A' },
  { category: 'Amenities', item: 'Soap, shampoo, and amenities stocked', status: 'N/A' },
  { category: 'Safety Equipment', item: 'Fire extinguisher present', status: 'N/A' },
  { category: 'Safety Equipment', item: 'Emergency exit clear', status: 'N/A' },
  { category: 'Overall Presentation', item: 'Room odor fresh and pleasant', status: 'N/A' },
];

export default function RoomInspectionsModule() {
  const [inspections, setInspections] = useState<RoomInspection[]>([
    { 
      id: 'INS-101', 
      roomNumber: '101', 
      inspector: 'Supervisor A', 
      inspectionDate: '2026-05-30', 
      status: 'Pass', 
      checklist: defaultChecklist.map(i => ({ ...i, status: 'Pass' as const })),
      overallScore: 100 
    },
    { 
      id: 'INS-102', 
      roomNumber: '304', 
      inspector: 'Supervisor B', 
      inspectionDate: '2026-05-30', 
      status: 'Rework Required', 
      checklist: defaultChecklist.map(i => ({ ...i, status: i.category === 'Bathroom' ? 'Fail' : 'Pass' as const })),
      overallScore: 85,
      notes: 'Bathroom mirror has streaks, needs re-cleaning'
    },
  ]);

  const [filter, setFilter] = useState<'All' | 'Pass' | 'Fail' | 'Rework Required'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<RoomInspection | null>(null);

  const filteredInspections = inspections.filter(inspection => {
    const matchesFilter = filter === 'All' || inspection.status === filter;
    const matchesSearch = inspection.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'bg-emerald-500 text-white';
      case 'Fail': return 'bg-red-500 text-white';
      case 'Rework Required': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'Fail': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'N/A': return 'text-slate-400 bg-slate-50 dark:bg-slate-800';
      default: return 'text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  const handleUpdateItemStatus = (index: number, newStatus: 'Pass' | 'Fail' | 'N/A') => {
    if (!selectedInspection) return;
    const updatedChecklist = [...selectedInspection.checklist];
    updatedChecklist[index] = { ...updatedChecklist[index], status: newStatus };
    
    const passCount = updatedChecklist.filter(i => i.status === 'Pass').length;
    const newScore = Math.round((passCount / updatedChecklist.length) * 100);
    const calculatedStatus = newScore >= 90 ? 'Pass' : newScore >= 70 ? 'Rework Required' : 'Fail';
    
    setSelectedInspection({
      ...selectedInspection,
      checklist: updatedChecklist,
      overallScore: newScore,
      status: calculatedStatus as any
    });
  };

  const handleSaveInspection = () => {
    if (!selectedInspection) return;
    setInspections(prev => prev.map(i => 
      i.id === selectedInspection.id ? selectedInspection : i
    ));
    setSelectedInspection(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Room Inspections</h2>
          <p className="text-xs text-slate-500 font-mono italic">Quality assurance inspections for room cleanliness and standards.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
          <Plus size={14} /> New Inspection
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {(['All', 'Pass', 'Fail', 'Rework Required'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filter === f 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search room number, inspector..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>
        </div>
      </div>

      {!selectedInspection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInspections.map(inspection => (
            <div key={inspection.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xl group hover:border-indigo-400 transition-all cursor-pointer" onClick={() => setSelectedInspection(inspection)}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getStatusColor(inspection.status)}`}>
                  {inspection.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{inspection.id}</span>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-indigo-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">Room {inspection.roomNumber}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-slate-400" />
                  <p className="text-[11px] text-slate-500 font-bold">{inspection.inspector}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold uppercase">Overall Score</span>
                  <span className={`font-black ${inspection.overallScore >= 90 ? 'text-emerald-500' : inspection.overallScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                    {inspection.overallScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${inspection.overallScore >= 90 ? 'bg-emerald-500' : inspection.overallScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${inspection.overallScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold">{inspection.inspectionDate}</span>
                </div>
                {inspection.notes && (
                  <p className="text-[9px] text-slate-500 mt-2 italic">{inspection.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Inspection: Room {selectedInspection.roomNumber}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">{selectedInspection.id} • Inspector: {selectedInspection.inspector}</p>
            </div>
            <button 
              onClick={() => setSelectedInspection(null)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <XCircle size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            {selectedInspection.checklist.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.item}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateItemStatus(index, 'Pass')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${item.status === 'Pass' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500'}`}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleUpdateItemStatus(index, 'Fail')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${item.status === 'Fail' ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-red-500'}`}
                  >
                    Fail
                  </button>
                  <button
                    onClick={() => handleUpdateItemStatus(index, 'N/A')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${item.status === 'N/A' ? 'bg-slate-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-500'}`}
                  >
                    N/A
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-[8px] text-slate-400 uppercase font-mono font-black block">Score</span>
                <span className={`text-2xl font-black ${selectedInspection.overallScore >= 90 ? 'text-emerald-500' : selectedInspection.overallScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                  {selectedInspection.overallScore}%
                </span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${getStatusColor(selectedInspection.status)}`}>
                {selectedInspection.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveInspection}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Save Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
