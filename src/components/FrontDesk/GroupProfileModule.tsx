/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useGroup } from '../../context/GroupContext';
import { useGuest } from '../../context/GuestContext';
import { useERP } from '../../context/ERPContext';
import { GroupProfile, GroupProfileType, GroupProfileStatus, GuestGroupRelationship, GroupBooking } from '../../types/erp';
import {
  Users, Users2, Building2, Briefcase, Calendar, Wallet, TrendingUp,
  Edit3, Plus, X, Search, Star, Link2, Unlink, BadgeDollarSign, FileText,
  Settings, ShieldCheck, CreditCard, MapPin, Phone, Mail, Globe, AlertTriangle
} from 'lucide-react';

interface GroupProfileModuleProps {
  initialGroupId?: string;
  onClose?: () => void;
}

export default function GroupProfileModule({ initialGroupId, onClose }: GroupProfileModuleProps) {
  const {
    groupProfiles,
    fetchGroupProfiles,
    fetchGroupProfileById,
    createGroupProfile,
    updateGroupProfile,
    deleteGroupProfile,
    updateGroupAnalytics,
    searchGroupProfiles,
  } = useGroup();

  const { groupBookings } = useERP();
  
  const {
    guests,
    getGuestsByGroup,
    fetchGuestGroupRelationships,
    linkGuestToGroup,
    unlinkGuestFromGroup,
  } = useGuest();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkGuestModal, setShowLinkGuestModal] = useState(false);
  const [selectedGuestForLink, setSelectedGuestForLink] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<GroupProfile>>({
    code: '',
    name: '',
    type: 'GroupReservation',
    status: 'Active',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    organizationName: '',
    creditLimit: 0,
    discountPercent: 0,
    paymentTerms: 'Net 30',
  });

  // Merge Supabase group_profiles with local groupBookings as fallback
  const displayGroups = useMemo<GroupProfile[]>(() => {
    const adaptedBookings: GroupProfile[] = groupBookings.map((gb: GroupBooking): GroupProfile => ({
      id: gb.id,
      code: gb.id,
      name: gb.groupName,
      type: 'GroupReservation',
      status: gb.status === 'Completed' ? 'Archived' : 'Active',
      contactName: gb.contactName,
      contactEmail: gb.contactEmail,
      contactPhone: gb.contactPhone,
      organizationName: gb.organizerCompany || gb.groupName,
      discountPercent: gb.discountPercent,
      creditLimit: gb.creditLimit || 0,
      currentBalance: 0,
      paymentTerms: 'Net 30',
      contractStartDate: gb.checkInDate,
      contractEndDate: gb.checkOutDate,
      totalRevenue: 0,
      totalRoomNights: 0,
      totalStays: 0,
      averageDailyRate: 0,
      lifetimeValue: 0,
    }));
    // Dedupe: Supabase group_profiles take priority over adapted groupBookings
    const profileIds = new Set(groupProfiles.map(g => g.id));
    const uniqueBookings = adaptedBookings.filter(gb => !profileIds.has(gb.id));
    return [...groupProfiles, ...uniqueBookings];
  }, [groupProfiles, groupBookings]);

  const activeGroup = useMemo(() => 
    displayGroups.find(g => g.id === selectedGroupId), 
    [displayGroups, selectedGroupId]
  );

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return displayGroups;
    const query = searchQuery.toLowerCase();
    return displayGroups.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.code.toLowerCase().includes(query) ||
      g.organizationName?.toLowerCase().includes(query)
    );
  }, [displayGroups, searchQuery]);

  // Fetch groups on mount
  useEffect(() => {
    fetchGroupProfiles();
  }, [fetchGroupProfiles]);

  // Set initial group if provided
  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  const handleCreateGroup = async () => {
    const validation = validateFormData(formData);
    if (!validation.valid) {
      alert(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const newGroup = await createGroupProfile(formData as Omit<GroupProfile, 'id' | 'createdAt' | 'updatedAt'>);
    if (newGroup) {
      setShowCreateModal(false);
      resetFormData();
      setSelectedGroupId(newGroup.id);
    }
  };

  const handleUpdateGroup = async () => {
    if (!activeGroup) return;
    
    const validation = validateFormData(formData);
    if (!validation.valid) {
      alert(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const updated = await updateGroupProfile(activeGroup.id, formData);
    if (updated) {
      setShowEditModal(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    
    if (confirm(`Are you sure you want to delete the group profile "${activeGroup.name}"? This action cannot be undone.`)) {
      const success = await deleteGroupProfile(activeGroup.id);
      if (success) {
        setSelectedGroupId('');
        onClose?.();
      }
    }
  };

  const handleLinkGuest = async () => {
    if (!activeGroup || !selectedGuestForLink) return;
    
    const relationship = await linkGuestToGroup(selectedGuestForLink, activeGroup.id, {
      relationshipType: activeGroup.type,
      isPrimaryContact: false,
    });
    
    if (relationship) {
      setShowLinkGuestModal(false);
      setSelectedGuestForLink('');
    }
  };

  const validateFormData = (data: Partial<GroupProfile>) => {
    const errors: string[] = [];
    
    if (!data.code || data.code.trim().length === 0) {
      errors.push('Group code is required');
    }
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Group name is required');
    }
    if (!data.type) {
      errors.push('Group type is required');
    }
    if (data.creditLimit !== undefined && data.creditLimit < 0) {
      errors.push('Credit limit cannot be negative');
    }
    if (data.discountPercent !== undefined && (data.discountPercent < 0 || data.discountPercent > 100)) {
      errors.push('Discount percent must be between 0 and 100');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const resetFormData = () => {
    setFormData({
      code: '',
      name: '',
      type: 'GroupReservation',
      status: 'Active',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      organizationName: '',
      creditLimit: 0,
      discountPercent: 0,
      paymentTerms: 'Net 30',
    });
  };

  const getGroupTypeIcon = (type: GroupProfileType) => {
    switch (type) {
      case 'CorporateAccount': return <Building2 size={16} />;
      case 'TravelAgent': return <Briefcase size={16} />;
      case 'TourOperator': return <Globe size={16} />;
      case 'Conference': return <Users size={16} />;
      case 'Event': return <Calendar size={16} />;
      default: return <Users2 size={16} />;
    }
  };

  const getGroupTypeColor = (type: GroupProfileType) => {
    switch (type) {
      case 'CorporateAccount': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'TravelAgent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TourOperator': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Conference': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Event': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const getStatusColor = (status: GroupProfileStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Suspended': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Blacklisted': return 'bg-red-100 text-red-700 border-red-200';
      case 'Archived': return 'bg-slate-200 text-slate-500 border-slate-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar - Group List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Group Profiles</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No group profiles found
            </div>
          ) : (
            filteredGroups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedGroupId === group.id
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getGroupTypeIcon(group.type)}
                    <span className="text-xs font-semibold text-slate-800">{group.name}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(group.status)}`}>
                    {group.status}
                  </span>
                </div>
                <div className="text-2xs text-slate-500 font-mono">{group.code}</div>
                {group.organizationName && (
                  <div className="text-2xs text-slate-400 mt-1 truncate">{group.organizationName}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Group Details */}
      <div className="flex-1 overflow-y-auto">
        {activeGroup ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {activeGroup.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{activeGroup.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getGroupTypeColor(activeGroup.type)}`}>
                      {activeGroup.type}
                    </span>
                    <span className="text-2xs text-slate-400 font-mono">{activeGroup.code}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(activeGroup);
                    setShowEditModal(true);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <X size={14} /> Delete
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="text-indigo-500" size={16} />
                  <span className="text-2xs text-slate-500 font-mono uppercase">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">${(activeGroup.totalRevenue || 0).toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-emerald-500" size={16} />
                  <span className="text-2xs text-slate-500 font-mono uppercase">Room Nights</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{activeGroup.totalRoomNights || 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-purple-500" size={16} />
                  <span className="text-2xs text-slate-500 font-mono uppercase">Total Stays</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{activeGroup.totalStays || 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-amber-500" size={16} />
                  <span className="text-2xs text-slate-500 font-mono uppercase">ADR</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">${(activeGroup.averageDailyRate || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {activeGroup.contactName && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-slate-600">Contact: <strong className="text-slate-800">{activeGroup.contactName}</strong></span>
                  </div>
                )}
                {activeGroup.contactEmail && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-slate-600 truncate">{activeGroup.contactEmail}</span>
                  </div>
                )}
                {activeGroup.contactPhone && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-slate-600">{activeGroup.contactPhone}</span>
                  </div>
                )}
                {activeGroup.organizationName && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-slate-600">Organization: <strong className="text-slate-800">{activeGroup.organizationName}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" />
                Billing Information
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-mono block mb-1">Credit Limit</span>
                  <span className="font-semibold text-slate-800">${(activeGroup.creditLimit || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono block mb-1">Current Balance</span>
                  <span className="font-semibold text-slate-800">${(activeGroup.currentBalance || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono block mb-1">Payment Terms</span>
                  <span className="font-semibold text-slate-800">{activeGroup.paymentTerms || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono block mb-1">Discount</span>
                  <span className="font-semibold text-slate-800">{activeGroup.discountPercent || 0}%</span>
                </div>
                {activeGroup.contractStartDate && (
                  <div>
                    <span className="text-slate-400 font-mono block mb-1">Contract Start</span>
                    <span className="font-semibold text-slate-800">{activeGroup.contractStartDate}</span>
                  </div>
                )}
                {activeGroup.contractEndDate && (
                  <div>
                    <span className="text-slate-400 font-mono block mb-1">Contract End</span>
                    <span className="font-semibold text-slate-800">{activeGroup.contractEndDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Guests */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                Linked Guests
              </h3>
              {(() => {
                const linkedGuests = getGuestsByGroup(activeGroup.id);
                if (linkedGuests.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <Users2 size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-sans">No guests linked to this group yet.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {linkedGuests.map(guest => (
                      <div key={guest.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
                            {guest.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800">{guest.name}</div>
                            <div className="text-2xs text-slate-500 font-mono">{guest.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {guest.isPrimaryContact && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-2xs font-semibold">Primary</span>
                          )}
                          <span className={`px-2 py-0.5 font-mono text-2xs border rounded uppercase ${
                            guest.status === 'VIP' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                            guest.status === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-950 border-indigo-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {guest.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLinkGuestModal(true)}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <Link2 size={16} /> Link Guest
              </button>
              <button
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users2 size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-slate-600 mb-2">No Group Selected</h3>
              <p className="text-xs text-slate-400 mb-4">Select a group profile from the sidebar or create a new one</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
              >
                Create New Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-800">Create Group Profile</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Group Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CORP-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Group Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as GroupProfileType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="GroupReservation">Group Reservation</option>
                    <option value="CorporateAccount">Corporate Account</option>
                    <option value="TravelAgent">Travel Agent</option>
                    <option value="TourOperator">Tour Operator</option>
                    <option value="Conference">Conference</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Organization Name</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g., Acme Inc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Discount %</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-800">Edit Group Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Group Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as GroupProfileStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blacklisted">Blacklisted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs font-mono uppercase text-slate-400 font-bold">Discount %</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
