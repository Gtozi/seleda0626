/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  MapPin,
  Filter,
  XCircle,
  Send
} from 'lucide-react';

interface MaintenanceIssue {
  id: string;
  roomNumber: string;
  issueType: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  completedAt?: string;
  notes?: string;
}

const issueTypes = [
  'Plumbing', 'Electrical', 'HVAC', 'Furniture Damage', 
  'Lock Problems', 'Lighting', 'TV', 'Internet'
];

export default function MaintenanceCoordinationModule() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([
    { 
      id: 'MC-101', 
      roomNumber: '101', 
      issueType: 'Plumbing', 
      description: 'Sink drain is clogged, water not draining properly', 
      priority: 'High', 
      status: 'Assigned', 
      reportedBy: 'Staff A', 
      assignedTo: 'Engineering Team',
      reportedAt: '2026-05-30 09:15' 
    },
    { 
      id: 'MC-102', 
      roomNumber: '304', 
      issueType: 'Electrical', 
      description: 'Light fixture flickering, needs inspection', 
      priority: 'Medium', 
      status: 'In Progress', 
      reportedBy: 'Staff B', 
      assignedTo: 'Electrician A',
      reportedAt: '2026-05-30 08:30' 
    },
    { 
      id: 'MC-103', 
      roomNumber: '202', 
      issueType: 'HVAC', 
      description: 'Air conditioning not cooling properly', 
      priority: 'Critical', 
      status: 'Reported', 
      reportedBy: 'Guest Complaint', 
      assignedTo: undefined,
      reportedAt: '2026-05-30 09:00' 
    },
    { 
      id: 'MC-104', 
      roomNumber: '401', 
      issueType: 'Furniture Damage', 
      description: 'Chair leg broken, needs repair or replacement', 
      priority: 'Low', 
      status: 'Completed', 
      reportedBy: 'Staff C', 
      assignedTo: 'Maintenance Team',
      reportedAt: '2026-05-29 14:00',
      completedAt: '2026-05-30 08:00'
    },
  ]);

  const [filter, setFilter] = useState<'All' | 'Reported' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [newIssue, setNewIssue] = useState({
    roomNumber: '',
    issueType: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'All' || issue.status === filter;
    const matchesType = typeFilter === 'All' || issue.issueType === typeFilter;
    const matchesSearch = issue.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-indigo-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'text-purple-500';
      case 'Completed': return 'text-emerald-500';
      case 'In Progress': return 'text-indigo-500';
      case 'Assigned': return 'text-blue-500';
      case 'Reported': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const handleUpdateStatus = (issueId: string, newStatus: 'Reported' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified') => {
    setIssues(prev => prev.map(i => 
      i.id === issueId ? { 
        ...i, 
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : i.completedAt
      } : i
    ));
  };

  const handleAssignTo = (issueId: string, assignee: string) => {
    setIssues(prev => prev.map(i => 
      i.id === issueId ? { ...i, assignedTo: assignee, status: 'Assigned' } : i
    ));
  };

  const handleReportIssue = () => {
    if (!newIssue.roomNumber || !newIssue.issueType || !newIssue.description) return;

    const issue: MaintenanceIssue = {
      id: `MC-${Date.now()}`,
      roomNumber: newIssue.roomNumber,
      issueType: newIssue.issueType,
      description: newIssue.description,
      priority: newIssue.priority,
      status: 'Reported',
      reportedBy: 'Current User',
      reportedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setIssues(prev => [issue, ...prev]);
    setNewIssue({
      roomNumber: '',
      issueType: '',
      description: '',
      priority: 'Medium'
    });
    setIsReporting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Maintenance Coordination</h2>
          <p className="text-xs text-slate-500 font-mono italic">Report maintenance issues and track engineering work orders.</p>
        </div>
        <button 
          onClick={() => setIsReporting(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={14} /> Report Issue
        </button>
      </div>

      {isReporting ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Report Maintenance Issue</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Submit new maintenance request to Engineering</p>
            </div>
            <button 
              onClick={() => setIsReporting(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <XCircle size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Room Number</label>
                <input 
                  type="text"
                  value={newIssue.roomNumber}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Enter room number..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Issue Type</label>
                <select 
                  value={newIssue.issueType}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, issueType: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                >
                  <option value="">Select issue type...</option>
                  {issueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea 
                value={newIssue.description}
                onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as const).map(priority => (
                  <button
                    key={priority}
                    onClick={() => setNewIssue(prev => ({ ...prev, priority }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      newIssue.priority === priority
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsReporting(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportIssue}
                disabled={!newIssue.roomNumber || !newIssue.issueType || !newIssue.description}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={14} /> Submit to Engineering
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['All', 'Reported', 'Assigned', 'In Progress', 'Completed', 'Verified'] as const).map(f => (
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

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                {issueTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search room, description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{issue.id}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">Room {issue.roomNumber}</h3>
                  </div>
                  <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{issue.issueType}</div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{issue.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-black ${getStatusColor(issue.status)}`}>{issue.status}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} />
                      <span className="font-mono">{issue.reportedAt.split(' ')[1]}</span>
                    </div>
                  </div>

                  {issue.assignedTo && (
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <User size={10} />
                      <span>Assigned to: {issue.assignedTo}</span>
                    </div>
                  )}

                  {issue.status === 'Reported' && (
                    <button 
                      onClick={() => handleAssignTo(issue.id, 'Engineering Team')}
                      className="w-full py-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight"
                    >
                      Assign to Engineering
                    </button>
                  )}

                  {issue.status === 'Assigned' && (
                    <button 
                      onClick={() => handleUpdateStatus(issue.id, 'In Progress')}
                      className="w-full py-2 bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {issue.status === 'In Progress' && (
                    <button 
                      onClick={() => handleUpdateStatus(issue.id, 'Completed')}
                      className="w-full py-2 bg-emerald-50 dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={10} /> Mark Complete
                    </button>
                  )}

                  {issue.status === 'Completed' && (
                    <button 
                      onClick={() => handleUpdateStatus(issue.id, 'Verified')}
                      className="w-full py-2 bg-purple-50 dark:bg-purple-900 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5"
                    >
                      <Wrench size={10} /> Verify & Release Room
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
