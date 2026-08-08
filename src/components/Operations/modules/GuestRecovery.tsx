/**
 * Guest Recovery
 * Manage service recovery cases
 */

import React, { useState, useEffect } from 'react';
import {
  Heart,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText
} from 'lucide-react';

interface RecoveryCase {
  id: string;
  guestName: string;
  roomNumber: string;
  complaint: string;
  category: string;
  status: 'logged' | 'investigating' | 'compensation-pending' | 'corrective-action' | 'follow-up' | 'guest-confirmation' | 'closed';
  priority: 'low' | 'medium' | 'high';
  loggedAt: string;
  assignedTo?: string;
  compensationAmount?: number;
  correctiveAction?: string;
  followUpDate?: string;
}

const GuestRecovery: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'logged' | 'investigating' | 'compensation-pending' | 'corrective-action' | 'follow-up' | 'guest-confirmation' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [cases, setCases] = useState<RecoveryCase[]>([]);

  const mockCases: RecoveryCase[] = [
    {
      id: '1',
      guestName: 'Mr. Johnson',
      roomNumber: '305',
      complaint: 'Water leak in bathroom caused damage to personal belongings',
      category: 'Maintenance',
      status: 'corrective-action',
      priority: 'high',
      loggedAt: '2026-07-31 09:30',
      assignedTo: 'Guest Relations Manager',
      compensationAmount: 150,
      correctiveAction: 'Room moved, belongings cleaned, plumbing repaired'
    },
    {
      id: '2',
      guestName: 'Ms. Williams',
      roomNumber: '412',
      complaint: 'Noise from construction work prevented sleep',
      category: 'Facilities',
      status: 'compensation-pending',
      priority: 'medium',
      loggedAt: '2026-07-31 11:15',
      assignedTo: 'Front Office Manager',
      compensationAmount: 75
    },
    {
      id: '3',
      guestName: 'Dr. Brown',
      roomNumber: '218',
      complaint: 'Room service delivered cold meal',
      category: 'F&B',
      status: 'investigating',
      priority: 'low',
      loggedAt: '2026-07-31 07:45',
      assignedTo: 'F&B Manager'
    },
    {
      id: '4',
      guestName: 'Mr. Davis',
      roomNumber: '501',
      complaint: 'AC not working properly throughout stay',
      category: 'Maintenance',
      status: 'follow-up',
      priority: 'high',
      loggedAt: '2026-07-30 14:00',
      assignedTo: 'Engineering Manager',
      compensationAmount: 200,
      correctiveAction: 'AC repaired, partial refund processed',
      followUpDate: '2026-08-02'
    }
  ];

  useEffect(() => {
    setCases(mockCases);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesFilter = selectedFilter === 'all' || c.status === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'follow-up':
      case 'guest-confirmation':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'compensation-pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'investigating':
      case 'corrective-action':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'logged':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Heart size={28} />
            Guest Recovery
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage service recovery cases</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          New Case
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="logged">Logged</option>
          <option value="investigating">Investigating</option>
          <option value="compensation-pending">Compensation Pending</option>
          <option value="corrective-action">Corrective Action</option>
          <option value="follow-up">Follow Up</option>
          <option value="guest-confirmation">Guest Confirmation</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filteredCases.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedCase?.id === c.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{c.guestName}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Room {c.roomNumber}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{c.complaint}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                    <span>{c.category}</span>
                    <span>•</span>
                    <span>{c.loggedAt}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          {selectedCase ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Case Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-500 font-bold">{selectedCase.category}</span>
                  <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{selectedCase.complaint}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Guest</span>
                    <span className="text-slate-900 dark:text-white">{selectedCase.guestName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Room</span>
                    <span className="text-slate-900 dark:text-white">{selectedCase.roomNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className={`px-2 py-0.5 rounded border text-xs ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status}
                    </span>
                  </div>
                  {selectedCase.assignedTo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Assigned to</span>
                      <span className="text-slate-900 dark:text-white">{selectedCase.assignedTo}</span>
                    </div>
                  )}
                  {selectedCase.compensationAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Compensation</span>
                      <span className="text-slate-900 dark:text-white">${selectedCase.compensationAmount}</span>
                    </div>
                  )}
                </div>
                {selectedCase.correctiveAction && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">{selectedCase.correctiveAction}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center sticky top-6">
              <Heart size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestRecovery;