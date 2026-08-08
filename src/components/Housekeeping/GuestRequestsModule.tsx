/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  MapPin,
  Filter,
  XCircle,
  Bell
} from 'lucide-react';

interface GuestRequest {
  id: string;
  roomNumber: string;
  guestName?: string;
  requestType: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
  requestedAt: string;
  completedAt?: string;
}

const requestTypes = [
  'Extra Towels', 'Extra Pillows', 'Extra Blanket', 'Baby Cot',
  'Iron & Iron Board', 'Laundry Pickup', 'Cleaning Request',
  'Turndown Request', 'Special Amenities'
];

export default function GuestRequestsModule() {
  const [requests, setRequests] = useState<GuestRequest[]>([
    { 
      id: 'GR-101', 
      roomNumber: '101', 
      guestName: 'John Smith', 
      requestType: 'Extra Towels', 
      description: 'Guest requests 2 additional bath towels', 
      priority: 'Medium', 
      status: 'Pending', 
      assignedTo: undefined, 
      requestedAt: '2026-05-30 09:15' 
    },
    { 
      id: 'GR-102', 
      roomNumber: '304', 
      guestName: 'Sarah Johnson', 
      requestType: 'Turndown Request', 
      description: 'Guest requests evening turndown service at 7 PM', 
      priority: 'High', 
      status: 'In Progress', 
      assignedTo: 'Staff A', 
      requestedAt: '2026-05-30 08:30' 
    },
    { 
      id: 'GR-103', 
      roomNumber: '202', 
      guestName: 'Michael Brown', 
      requestType: 'Baby Cot', 
      description: 'Guest needs baby cot for infant', 
      priority: 'Critical', 
      status: 'Pending', 
      assignedTo: undefined, 
      requestedAt: '2026-05-30 09:00' 
    },
    { 
      id: 'GR-104', 
      roomNumber: '401', 
      guestName: 'Emily Davis', 
      requestType: 'Laundry Pickup', 
      description: 'Guest has laundry ready for pickup', 
      priority: 'Medium', 
      status: 'Completed', 
      assignedTo: 'Staff B', 
      requestedAt: '2026-05-30 07:45',
      completedAt: '2026-05-30 08:15'
    },
  ]);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newRequest, setNewRequest] = useState({
    roomNumber: '',
    guestName: '',
    requestType: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'All' || request.status === filter;
    const matchesType = typeFilter === 'All' || request.requestType === typeFilter;
    const matchesSearch = request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          request.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'Completed': return 'text-emerald-500';
      case 'In Progress': return 'text-indigo-500';
      case 'Pending': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const handleUpdateStatus = (requestId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { 
        ...r, 
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : r.completedAt
      } : r
    ));
  };

  const handleAssignStaff = (requestId: string, staffName: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, assignedTo: staffName } : r
    ));
  };

  const handleCreateRequest = () => {
    if (!newRequest.roomNumber || !newRequest.requestType || !newRequest.description) return;

    const request: GuestRequest = {
      id: `GR-${Date.now()}`,
      roomNumber: newRequest.roomNumber,
      guestName: newRequest.guestName || undefined,
      requestType: newRequest.requestType,
      description: newRequest.description,
      priority: newRequest.priority,
      status: 'Pending',
      requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({
      roomNumber: '',
      guestName: '',
      requestType: '',
      description: '',
      priority: 'Medium'
    });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Guest Requests</h2>
          <p className="text-xs text-slate-500 font-mono italic">Manage guest housekeeping requests and special service requests.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={14} /> New Request
        </button>
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Create Guest Request</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Record new guest housekeeping request</p>
            </div>
            <button 
              onClick={() => setIsCreating(false)}
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
                  value={newRequest.roomNumber}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Enter room number..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Guest Name (Optional)</label>
                <input 
                  type="text"
                  value={newRequest.guestName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, guestName: e.target.value }))}
                  placeholder="Guest name..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Request Type</label>
              <select 
                value={newRequest.requestType}
                onChange={(e) => setNewRequest(prev => ({ ...prev, requestType: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="">Select request type...</option>
                {requestTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea 
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the request..."
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
                    onClick={() => setNewRequest(prev => ({ ...prev, priority }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      newRequest.priority === priority
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
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateRequest}
                disabled={!newRequest.roomNumber || !newRequest.requestType || !newRequest.description}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Bell size={14} /> Create Request
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(f => (
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
                {requestTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search room, guest, description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map(request => (
              <div key={request.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{request.id}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">Room {request.roomNumber}</h3>
                  </div>
                  {request.guestName && (
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <p className="text-[11px] text-slate-500 font-bold">{request.guestName}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{request.requestType}</div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{request.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-black ${getStatusColor(request.status)}`}>{request.status}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} />
                      <span className="font-mono">{request.requestedAt.split(' ')[1]}</span>
                    </div>
                  </div>

                  {request.status !== 'Completed' && (
                    <div className="flex gap-2">
                      {request.status === 'Pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'In Progress')}
                          className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight"
                        >
                          Start
                        </button>
                      )}
                      {request.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'Completed')}
                          className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={10} /> Complete
                        </button>
                      )}
                    </div>
                  )}

                  {request.completedAt && (
                    <div className="text-[9px] text-slate-400 font-mono">
                      Completed: {request.completedAt}
                    </div>
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
