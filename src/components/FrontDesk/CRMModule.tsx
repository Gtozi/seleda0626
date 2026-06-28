/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useGuest } from '../../context/GuestContext';
import { useGroup } from '../../context/GroupContext';
import { toISODate } from '../../utils/date';
import { Guest, GuestStatus, CorporateAccount, GroupBooking, FolioCharge, GuestGroupRelationship, GroupProfile } from '../../types/erp';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReChartsTooltip, PieChart, Pie, Cell
} from 'recharts';
import {
  Plus, Search, Award, History, FileText, X, Camera, Globe, TrendingUp,
  Users, Users2, Briefcase, Building2, FolderOpen, Star, Link2, Unlink,
  ArrowRightLeft, ShieldCheck, Wallet, CreditCard, Receipt, AlertTriangle,
  CheckCircle2, UserCheck, Edit3, Trash2, ListChecks, BadgeDollarSign, Banknote,
  Calendar, Mail, Phone, Bookmark, User
} from 'lucide-react';

interface CRMModuleProps {
  initialGuestData?: { name?: string; email?: string; phone?: string; resId?: string; rm?: string; date?: string; isGroup?: boolean; groupId?: string; groupName?: string; contactName?: string; roomCount?: number; };
  onClearInitialData?: () => void;
  viewGuestId?: string;
  onClearViewGuestId?: () => void;
  onOnboardSuccess?: (data: { guestName: string, guestEmail: string, guestPhone: string, reservationId: string, roomNumber: string, checkInDate: string }) => void;
  onGroupOnboardSuccess?: (data: { groupName: string, contactName: string, contactEmail: string, contactPhone: string, groupId: string, roomCount: number, checkInDate: string }) => void;
}

const DEFAULT_ROUTING_RULES: { name: string; applicableTo: 'Individual' | 'Group' | 'Corporate' | 'All'; rules: { chargeType: FolioCharge['type'] | 'All'; targetFolio: 'A' | 'B'; description: string }[] }[] = [
  { name: 'Individual Default', applicableTo: 'Individual', rules: [{ chargeType: 'All', targetFolio: 'A', description: 'All charges route to guest folio' }] },
  { name: 'Group Master Billing', applicableTo: 'Group', rules: [
      { chargeType: 'Room', targetFolio: 'B', description: 'Room charges to Group Master' },
      { chargeType: 'F&B', targetFolio: 'A', description: 'F&B to individual guest' },
      { chargeType: 'Extra', targetFolio: 'A', description: 'Extras to individual guest' },
      { chargeType: 'Minibar', targetFolio: 'A', description: 'Minibar to individual guest' },
      { chargeType: 'Laundry', targetFolio: 'A', description: 'Laundry to individual guest' },
      { chargeType: 'Tax', targetFolio: 'B', description: 'Tax to Group Master' },
      { chargeType: 'Other', targetFolio: 'A', description: 'Other to individual guest' },
    ]
  },
  { name: 'Corporate Split Billing', applicableTo: 'Corporate', rules: [
      { chargeType: 'Room', targetFolio: 'B', description: 'Room charges to Company Ledger' },
      { chargeType: 'Tax', targetFolio: 'B', description: 'Tax to Company Ledger' },
      { chargeType: 'F&B', targetFolio: 'A', description: 'F&B incidentals to guest' },
      { chargeType: 'Extra', targetFolio: 'A', description: 'Extras to guest' },
      { chargeType: 'Minibar', targetFolio: 'A', description: 'Minibar to guest' },
      { chargeType: 'Laundry', targetFolio: 'A', description: 'Laundry to guest' },
      { chargeType: 'Other', targetFolio: 'A', description: 'Other incidentals to guest' },
    ]
  },
];

export default function CRMModule({ initialGuestData, onClearInitialData, viewGuestId, onClearViewGuestId, onOnboardSuccess, onGroupOnboardSuccess }: CRMModuleProps) {
  const {
    guests, addGuest, updateGuest, updateGuestData, findMatchingGuest, setGuestBillingRouting,
    groupBookings, addGroupBooking, updateGroupBookingStatus,
    corporateAccounts, addCorporateAccount, updateCorporateAccount,
    reservations, updateReservation, checkInReservation
  } = useERP();
  
  const { 
    guestGroupRelationships, 
    fetchGuestGroupRelationships, 
    getGuestGroupSummary,
    linkGuestToGroup, 
    unlinkGuestFromGroup 
  } = useGuest();
  
  const { 
    groupProfiles, 
    fetchGroupProfiles,
    createGroupProfile,
    updateGroupProfile 
  } = useGroup();

  // Tabs
  const [crmTab, setCrmTab] = useState<'individual' | 'groups' | 'corporate'>('individual');

  // Search / Filter
  const [searchVal, setSearchVal] = useState('');
  const [groupSearchVal, setGroupSearchVal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedNationality, setSelectedNationality] = useState<string>('all');

  // Selection
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groupBookings[0]?.id || '');
  const [selectedCorpId, setSelectedCorpId] = useState<string>(corporateAccounts[0]?.id || '');

  // Profile Match Engine
  const [showProfileMatch, setShowProfileMatch] = useState(false);
  const [matchCandidate, setMatchCandidate] = useState<Guest | undefined>(undefined);

  // Modals
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddCorp, setShowAddCorp] = useState(false);
  const [showFolioRouting, setShowFolioRouting] = useState(false);
  const [folioRoutingTarget, setFolioRoutingTarget] = useState<{ type: 'guest' | 'group' | 'corp'; id: string } | null>(null);
  const [showGroupGuests, setShowGroupGuests] = useState(false);
  const [selectedGroupForView, setSelectedGroupForView] = useState<GroupBooking | null>(null);
  const [showGuestDetail, setShowGuestDetail] = useState(false);
  const [customRoutingRules, setCustomRoutingRules] = useState<Record<string, 'A' | 'B'>>({});
  const [isEditingCustomRouting, setIsEditingCustomRouting] = useState(false);
  
  // Group Relationships UI
  const [showLinkToGroup, setShowLinkToGroup] = useState(false);
  const [selectedGroupForLink, setSelectedGroupForLink] = useState<string>('');
  const [guestGroupSummary, setGuestGroupSummary] = useState<any>(null);

  // New Guest Form
  const [newGName, setNewGName] = useState('');
  const [newGLastName, setNewGLastName] = useState('');
  const [newGEmail, setNewGEmail] = useState('');
  const [newGPhone, setNewGPhone] = useState('');
  const [newGStatus, setNewGStatus] = useState<GuestStatus>('Regular');
  const [newGRequests, setNewGRequests] = useState('');
  const [newGNationality, setNewGNationality] = useState('');
  const [newGTin, setNewGTin] = useState('');
  const [newGVatNo, setNewGVatNo] = useState('');
  const [newGVatDate, setNewGVatDate] = useState('');
  const [newGPassport, setNewGPassport] = useState('');
  const [newGDob, setNewGDob] = useState('');
  const [newGParentGroupId, setNewGParentGroupId] = useState('');
  const [newGParentCorporateId, setNewGParentCorporateId] = useState('');
  const [newGIsPrimaryContact, setNewGIsPrimaryContact] = useState(false);

  // Edit Guest
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editGName, setEditGName] = useState('');
  const [editGEmail, setEditGEmail] = useState('');
  const [editGPhone, setEditGPhone] = useState('');
  const [editGNationality, setEditGNationality] = useState('');
  const [editGTin, setEditGTin] = useState('');
  const [editGVatNo, setEditGVatNo] = useState('');
  const [editGVatDate, setEditGVatDate] = useState('');
  const [editGPassport, setEditGPassport] = useState('');
  const [editGDob, setEditGDob] = useState('');
  const [editParentGroupId, setEditParentGroupId] = useState('');
  const [editParentCorporateId, setEditParentCorporateId] = useState('');
  const [editIsPrimaryContact, setEditIsPrimaryContact] = useState(false);

  // New Corp Form
  const [corpName, setCorpName] = useState('');
  const [corpContact, setCorpContact] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpPhone, setCorpPhone] = useState('');
  const [corpDiscount, setCorpDiscount] = useState(15);
  const [corpTaxId, setCorpTaxId] = useState('');
  const [corpBillingAddress, setCorpBillingAddress] = useState('');
  const [corpBillingCity, setCorpBillingCity] = useState('');
  const [corpBillingCountry, setCorpBillingCountry] = useState('');
  const [corpCreditLimit, setCorpCreditLimit] = useState(10000);
  const [corpPaymentTerms, setCorpPaymentTerms] = useState('Net 30');
  const [corpSuccess, setCorpSuccess] = useState('');

  // Notes
  const [newNote, setNewNote] = useState('');

  // Pending Check-In
  const [pendingCheckInResData, setPendingCheckInResData] = useState<{ resId: string; rm: string; date: string } | null>(null);
  const [pendingGroupCheckInData, setPendingGroupCheckInData] = useState<{ groupId: string; groupName: string; contactName: string; roomCount: number; date: string } | null>(null);

  const idScannerRef = useRef<HTMLInputElement>(null);
  const [idUploaded, setIdUploaded] = useState(false);

  // Active Selections
  const activeGuest = useMemo(() => guests.find(g => g.id === selectedGuestId), [guests, selectedGuestId]);
  const activeGroup = useMemo(() => groupBookings.find(g => g.id === selectedGroupId), [groupBookings, selectedGroupId]);
  const activeCorp = useMemo(() => corporateAccounts.find(c => c.id === selectedCorpId), [corporateAccounts, selectedCorpId]);

  // Fetch group profiles on mount
  useEffect(() => {
    fetchGroupProfiles();
  }, [fetchGroupProfiles]);

  // Fetch guest group relationships when guest detail is opened
  useEffect(() => {
    if (showGuestDetail && activeGuest) {
      fetchGuestGroupRelationships(activeGuest.id);
      getGuestGroupSummary(activeGuest.id).then(setGuestGroupSummary);
    }
  }, [showGuestDetail, activeGuest, fetchGuestGroupRelationships, getGuestGroupSummary]);

  // Sync edits
  useEffect(() => {
    if (activeGuest) {
      setEditGName(activeGuest.name);
      setEditGEmail(activeGuest.email);
      setEditGPhone(activeGuest.phone || '');
      setEditGNationality(activeGuest.nationality || '');
      setEditGTin(activeGuest.tin || '');
      setEditGVatNo(activeGuest.vatNo || '');
      setEditGVatDate(activeGuest.vatDate || '');
      setEditGPassport(activeGuest.passportNumber || '');
      setEditGDob(activeGuest.dateOfBirth || '');
      setEditParentGroupId(activeGuest.parentGroupId || '');
      setEditParentCorporateId(activeGuest.parentCorporateId || '');
      setEditIsPrimaryContact(activeGuest.isPrimaryContact || false);
      setIsEditingProfile(false);
    }
  }, [selectedGuestId]);

  // Auto-open from check-in flow - requires existing guest profile
  useEffect(() => {
    if (initialGuestData) {
      // For group check-ins, show the group profile directly
      if (initialGuestData.isGroup && initialGuestData.groupId) {
        const group = groupBookings.find(g => g.id === initialGuestData.groupId);
        if (group) {
          setSelectedGroupForView(group);
          setShowGroupGuests(true);
          setCrmTab('groups');
          onClearInitialData?.();
          return;
        }
      }

      let existingGuest = findMatchingGuest({ email: initialGuestData.email, name: initialGuestData.name });

      // For group bookings, also try to find guest by group ID
      if (!existingGuest && initialGuestData.isGroup && initialGuestData.groupId) {
        existingGuest = guests.find(g =>
          g.parentGroupId === initialGuestData.groupId &&
          g.email.toLowerCase() === initialGuestData.email.toLowerCase()
        );
      }

      if (existingGuest) {
        setSelectedGuestId(existingGuest.id);
        setCrmTab('individual');
        if (initialGuestData.resId) {
          setPendingCheckInResData({ resId: initialGuestData.resId, rm: initialGuestData.rm || 'TBD', date: initialGuestData.date || toISODate() });
        }
        setIsEditingProfile(true);
      } else {
        // Guest profile must be created during booking, not check-in
        alert(`No CRM profile found for ${initialGuestData.name}. Please create a guest profile during the booking process before check-in.`);
      }
      onClearInitialData?.();
    }
  }, [initialGuestData, onClearInitialData, findMatchingGuest, guests, groupBookings]);

  // Auto-open guest detail when navigated from reservation calendar/detail
  useEffect(() => {
    if (viewGuestId) {
      const guest = guests.find(g => g.id === viewGuestId);
      if (guest) {
        setSelectedGuestId(viewGuestId);
        setCrmTab('individual');
        setShowGuestDetail(true);
      }
      onClearViewGuestId?.();
    }
  }, [viewGuestId, onClearViewGuestId, guests]);

  const handleIDScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // In production: Upload to Supabase Storage and create database record
      // For now: Simulate ID document extraction with file metadata
      const documentData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };

      // Simulate OCR extraction
      setTimeout(() => {
        if (!newGName) setNewGName('');
        if (!newGEmail) setNewGEmail('');
        if (!newGPassport) setNewGPassport('');

        // Store document metadata in guest profile for now
        // In production: This would be stored in id_documents table
        console.log('ID Document uploaded:', documentData);
      }, 500);
    }
  };

  const handleExistingGuestIDUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) setIdUploaded(true); };
  const handleVerifyAndCompleteCheckIn = () => {
    if (!pendingCheckInResData || !activeGuest) return;
    onOnboardSuccess?.({ guestName: activeGuest.name, guestEmail: activeGuest.email, guestPhone: activeGuest.phone || '', reservationId: pendingCheckInResData.resId, roomNumber: pendingCheckInResData.rm, checkInDate: pendingCheckInResData.date });
    setPendingCheckInResData(null); setIsEditingProfile(false); setIdUploaded(false);
  };

  const handleGroupCheckIn = async () => {
    if (!activeGuest || !activeGuest.parentGroupId) return;
    let group = groupBookings.find(g => g.id === activeGuest.parentGroupId);

    // Auto-create group profile if it doesn't exist
    if (!group) {
      await addGroupBooking({
        groupName: activeGuest.parentGroupId,
        contactName: activeGuest.name,
        contactEmail: activeGuest.email,
        contactPhone: activeGuest.phone || '',
        roomTypeNeeded: 'Double',
        roomCount: 1,
        checkInDate: toISODate(),
        checkOutDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        discountPercent: 0,
        status: 'Confirmed'
      });
      group = groupBookings.find(g => g.id === activeGuest.parentGroupId) || {
        id: activeGuest.parentGroupId,
        groupName: activeGuest.parentGroupId,
        contactName: activeGuest.name,
        contactEmail: activeGuest.email,
        contactPhone: activeGuest.phone || '',
        roomTypeNeeded: 'Double',
        roomCount: 1,
        checkInDate: toISODate(),
        checkOutDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        discountPercent: 0,
        status: 'Confirmed'
      };
    }

    // Check in all reservations with the same group ID
    const groupReservations = reservations.filter(r => r.bookingGroupId === activeGuest.parentGroupId && r.status === 'Confirmed' && r.roomNumber);
    groupReservations.forEach(groupRes => {
      checkInReservation(groupRes.id, groupRes.roomNumber!);

      // Guest profiles should already exist from booking - just verify they exist
      const guest = guests.find(g =>
        g.email.toLowerCase() === groupRes.guestEmail.toLowerCase() &&
        g.name.toLowerCase() === groupRes.guestName.toLowerCase() &&
        g.parentGroupId === activeGuest.parentGroupId
      );
      if (!guest) {
        console.warn(`Guest profile not found for ${groupRes.guestName} - should have been created during booking`);
      }
    });

    onGroupOnboardSuccess?.({
      groupName: group.groupName,
      contactName: group.contactName,
      contactEmail: group.contactEmail,
      contactPhone: group.contactPhone || '',
      groupId: group.id,
      roomCount: groupReservations.length,
      checkInDate: group.checkInDate
    });
  };

  // Filtering
  const uniqueNationalities = useMemo(() => Array.from(new Set(guests.map(g => g.nationality || 'Undetermined'))).filter(Boolean), [guests]);

  const filteredGuests = useMemo(() => guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchVal.toLowerCase()) || g.email.toLowerCase().includes(searchVal.toLowerCase()) || (g.passportNumber || '').toLowerCase().includes(searchVal.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || g.status === selectedStatus;
    const matchesNationality = selectedNationality === 'all' || (g.nationality || 'Undetermined').toLowerCase() === selectedNationality.toLowerCase();
    return matchesSearch && matchesStatus && matchesNationality;
  }), [guests, searchVal, selectedStatus, selectedNationality]);

  const groupedGuests = useMemo(() => ({
    individual: filteredGuests.filter(g => !g.parentGroupId && !g.parentCorporateId),
    byGroup: filteredGuests.filter(g => g.parentGroupId).reduce((acc, guest) => {
      const gid = guest.parentGroupId!;
      if (!acc[gid]) acc[gid] = [];
      acc[gid].push(guest);
      return acc;
    }, {} as Record<string, Guest[]>),
    byCorporate: filteredGuests.filter(g => g.parentCorporateId).reduce((acc, guest) => {
      const cid = guest.parentCorporateId!;
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(guest);
      return acc;
    }, {} as Record<string, Guest[]>)
  }), [filteredGuests]);

  // Profile Match Engine
  const runProfileMatch = (name: string, email: string, passport?: string) => {
    const lastName = name.split(' ').pop() || name;
    const match = findMatchingGuest({ lastName, email, passportNumber: passport, name });
    if (match) { setMatchCandidate(match); setShowProfileMatch(true); return match; }
    return undefined;
  };

  const handlePreAddGuest = () => {
    if (!newGName || !newGEmail) return;
    const match = runProfileMatch(newGName, newGEmail, newGPassport || undefined);
    if (!match) handleAddNewGuest();
  };

  // Actions
  const handleAddNewGuest = () => {
    if (!newGName || !newGEmail) return;
    const gId = addGuest({
      name: newGName,
      lastName: newGLastName || newGName.split(' ').pop() || newGName,
      email: newGEmail,
      phone: newGPhone,
      status: newGStatus,
      loyaltyPoints: newGStatus === 'VIP' ? 1000 : newGStatus === 'Loyalty Member' ? 250 : 0,
      specialRequests: newGRequests,
      notes: 'Manually created in CRM Module panel',
      history: [],
      totalSpend: 0,
      nationality: newGNationality || 'Undetermined',
      tin: newGTin,
      vatNo: newGVatNo,
      vatDate: newGVatDate,
      passportNumber: newGPassport || undefined,
      dateOfBirth: newGDob || undefined,
      parentGroupId: newGParentGroupId || undefined,
      parentCorporateId: newGParentCorporateId || undefined,
      isPrimaryContact: newGIsPrimaryContact
    });
    setSelectedGuestId(gId);
    setShowAddGuest(false);
    resetNewGuestForm();
    if (pendingGroupCheckInData && onGroupOnboardSuccess) {
      onGroupOnboardSuccess({ groupName: pendingGroupCheckInData.groupName, contactName: pendingGroupCheckInData.contactName, contactEmail: newGEmail, contactPhone: newGPhone, groupId: pendingGroupCheckInData.groupId, roomCount: pendingGroupCheckInData.roomCount, checkInDate: pendingGroupCheckInData.date });
      setPendingGroupCheckInData(null);
    } else if (pendingCheckInResData && onOnboardSuccess) {
      onOnboardSuccess({ guestName: newGName, guestEmail: newGEmail, guestPhone: newGPhone, reservationId: pendingCheckInResData.resId, roomNumber: pendingCheckInResData.rm, checkInDate: pendingCheckInResData.date });
      setPendingCheckInResData(null);
    }
  };

  const resetNewGuestForm = () => {
    setNewGName(''); setNewGLastName(''); setNewGEmail(''); setNewGPhone(''); setNewGRequests('');
    setNewGNationality(''); setNewGTin(''); setNewGVatNo(''); setNewGVatDate('');
    setNewGPassport(''); setNewGDob(''); setNewGParentGroupId(''); setNewGParentCorporateId('');
    setNewGIsPrimaryContact(false); setNewGStatus('Regular');
  };

  const handleSaveProfileEdit = () => {
    if (!activeGuest) return;
    updateGuest({
      ...activeGuest,
      name: editGName,
      lastName: editGName.split(' ').pop() || editGName,
      email: editGEmail,
      phone: editGPhone,
      nationality: editGNationality,
      tin: editGTin,
      vatNo: editGVatNo,
      vatDate: editGVatDate,
      passportNumber: editGPassport || undefined,
      dateOfBirth: editGDob || undefined,
      parentGroupId: editParentGroupId || undefined,
      parentCorporateId: editParentCorporateId || undefined,
      isPrimaryContact: editIsPrimaryContact
    });
    setIsEditingProfile(false);
  };

  const handleAddNoteToGuest = () => {
    if (!activeGuest || !newNote) return;
    updateGuest({ ...activeGuest, notes: (activeGuest.notes ? activeGuest.notes + '\n' : '') + `[${toISODate()}] ${newNote}` });
    setNewNote('');
  };

  const handleCreateCorp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpName || !corpContact) return;
    addCorporateAccount({
      companyName: corpName,
      contactPerson: corpContact,
      contactEmail: corpEmail,
      contactPhone: corpPhone,
      discountPercent: corpDiscount,
      activeBookings: 0,
      unpaidBalance: 0,
      corporateTaxId: corpTaxId || undefined,
      billingAddress: corpBillingAddress || undefined,
      billingCity: corpBillingCity || undefined,
      billingCountry: corpBillingCountry || undefined,
      creditLimit: corpCreditLimit,
      lifetimeValue: 0,
      paymentTerms: corpPaymentTerms,
      isActive: true
    });
    setCorpSuccess(`Corporate account established for ${corpName}.`);
    setTimeout(() => setCorpSuccess(''), 4000);
    setShowAddCorp(false);
    resetCorpForm();
  };

  const resetCorpForm = () => {
    setCorpName(''); setCorpContact(''); setCorpEmail(''); setCorpPhone('');
    setCorpDiscount(15); setCorpTaxId(''); setCorpBillingAddress('');
    setCorpBillingCity(''); setCorpBillingCountry(''); setCorpCreditLimit(10000);
    setCorpPaymentTerms('Net 30');
  };

  const handleLinkGuestToGroup = (guestId: string, groupId: string) => {
    updateGuestData(guestId, { parentGroupId: groupId, parentCorporateId: undefined });
  };

  const handleLinkGuestToCorp = (guestId: string, corpId: string) => {
    updateGuestData(guestId, { parentCorporateId: corpId, parentGroupId: undefined });
  };

  const handleUnlinkGuest = (guestId: string) => {
    updateGuestData(guestId, { parentGroupId: undefined, parentCorporateId: undefined, isPrimaryContact: false });
  };

  // Group Relationship Handlers
  const handleLinkToGroup = async () => {
    if (!activeGuest || !selectedGroupForLink) return;
    
    const relationship = await linkGuestToGroup(activeGuest.id, selectedGroupForLink, {
      relationshipType: 'GroupReservation',
      isPrimaryContact: false,
    });
    
    if (relationship) {
      setShowLinkToGroup(false);
      setSelectedGroupForLink('');
      // Refresh the summary
      const summary = await getGuestGroupSummary(activeGuest.id);
      setGuestGroupSummary(summary);
    }
  };

  const handleUnlinkFromGroup = async (groupId: string) => {
    if (!activeGuest) return;
    
    const success = await unlinkGuestFromGroup(activeGuest.id, groupId, 'Manual unlink by user');
    
    if (success) {
      // Refresh the summary
      const summary = await getGuestGroupSummary(activeGuest.id);
      setGuestGroupSummary(summary);
    }
  };

  // Folio Routing
  const openFolioRouting = (type: 'guest' | 'group' | 'corp', id: string) => {
    setFolioRoutingTarget({ type, id });
    setIsEditingCustomRouting(false);
    setCustomRoutingRules({});
    setShowFolioRouting(true);
  };

  const applyFolioRouting = (ruleName: string) => {
    if (!folioRoutingTarget) return;
    const rule = DEFAULT_ROUTING_RULES.find(r => r.name === ruleName);
    if (!rule) return;
    if (folioRoutingTarget.type === 'guest') {
      setGuestBillingRouting(folioRoutingTarget.id, rule.name);
    } else if (folioRoutingTarget.type === 'group') {
      guests.filter(g => g.parentGroupId === folioRoutingTarget.id).forEach(g => setGuestBillingRouting(g.id, rule.name));
    } else if (folioRoutingTarget.type === 'corp') {
      guests.filter(g => g.parentCorporateId === folioRoutingTarget.id).forEach(g => setGuestBillingRouting(g.id, rule.name));
    }
    setShowFolioRouting(false);
  };

  const applyCustomRouting = () => {
    if (!folioRoutingTarget) return;
    const customRuleName = `Custom-${Date.now()}`;
    const customRule = {
      name: customRuleName,
      applicableTo: folioRoutingTarget.type === 'guest' ? 'Individual' : folioRoutingTarget.type === 'group' ? 'Group' : 'Corporate',
      rules: Object.entries(customRoutingRules).map(([chargeType, targetFolio]) => ({
        chargeType: chargeType as FolioCharge['type'],
        targetFolio,
        description: `${chargeType} → Folio ${targetFolio}`
      }))
    };
    
    if (folioRoutingTarget.type === 'guest') {
      setGuestBillingRouting(folioRoutingTarget.id, customRuleName);
    } else if (folioRoutingTarget.type === 'group') {
      guests.filter(g => g.parentGroupId === folioRoutingTarget.id).forEach(g => setGuestBillingRouting(g.id, customRuleName));
    } else if (folioRoutingTarget.type === 'corp') {
      guests.filter(g => g.parentCorporateId === folioRoutingTarget.id).forEach(g => setGuestBillingRouting(g.id, customRuleName));
    }
    setShowFolioRouting(false);
    setCustomRoutingRules({});
    setIsEditingCustomRouting(false);
  };

  const handleRoutingRuleChange = (chargeType: string, targetFolio: 'A' | 'B') => {
    setCustomRoutingRules(prev => ({ ...prev, [chargeType]: targetFolio }));
  };

  // Helpers
  const getLoyaltyBadge = (status: GuestStatus) => {
    switch (status) {
      case 'VIP': return 'bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-sm';
      case 'Loyalty Member': return 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const totalGuests = guests.length;
  const vipCount = guests.filter(g => g.status === 'VIP').length;
  const loyaltyCount = guests.filter(g => g.status === 'Loyalty Member').length;
  const regularCount = guests.filter(g => g.status === 'Regular').length;
  const vipPercentage = totalGuests > 0 ? Math.round((vipCount / totalGuests) * 100) : 0;

  const nationalityFrequencies: Record<string, number> = {};
  guests.forEach(g => { const n = g.nationality || 'Undetermined'; nationalityFrequencies[n] = (nationalityFrequencies[n] || 0) + 1; });
  const nationalityData = Object.entries(nationalityFrequencies).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const tierChartData = [{ name: 'VIP', value: vipCount, color: '#f59e0b' }, { name: 'Loyalty', value: loyaltyCount, color: '#6366f1' }, { name: 'Regular', value: regularCount, color: '#94a3b8' }];

  return (
    <div className="space-y-6" id="crm-module">

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-sans font-medium text-slate-500">
        <button
          onClick={() => setCrmTab('individual')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${crmTab === 'individual' ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50' : 'border-b-transparent hover:text-slate-700'}`}
        >
          <Users size={14} /> Individual Profiles
        </button>
        <button
          onClick={() => setCrmTab('groups')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${crmTab === 'groups' ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50' : 'border-b-transparent hover:text-slate-700'}`}
        >
          <Users2 size={14} /> Group Bookings
        </button>
        <button
          onClick={() => setCrmTab('corporate')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${crmTab === 'corporate' ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50' : 'border-b-transparent hover:text-slate-700'}`}
        >
          <Briefcase size={14} /> Corporate Accounts
        </button>
      </div>

      {/* INDIVIDUAL PROFILES TAB */}
      {crmTab === 'individual' && (
        <>
      {/* 📊 CRM SEGMENTATION & DEMOGRAPHICS DIAGRAM PANEL */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-700/50 space-y-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              <span>CRM Demographics & Account Tier Segmentations</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Live database distribution showing nationalities and loyalty tiers.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Total CRM Profiles</span>
              <span className="text-xl font-bold font-sans text-indigo-400">{totalGuests} Guests</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">VIP Concierge Ratio</span>
              <span className="text-xl font-bold font-sans text-amber-400">{vipPercentage}% Share</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Section 1: Guest Tiers breakdown (5 columns) */}
          <div className="lg:col-span-5 space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
                <Award size={14} className="text-amber-400" /> Account Tier Distributions
              </span>
              <span className="text-[10px] font-mono text-slate-400">{vipCount} VIP / {loyaltyCount} Loyalty</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Pie Chart element */}
              <div className="md:col-span-5 flex justify-center items-center h-28 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierChartData.filter(d => d.value > 0)}
                      innerRadius={28}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tierChartData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold leading-none text-slate-200">{totalGuests}</span>
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5">Total</span>
                </div>
              </div>

              {/* Styled tier bars as table metrics */}
              <div className="md:col-span-7 space-y-2">
                {tierChartData.map((t) => {
                  const pct = totalGuests > 0 ? Math.round((t.value / totalGuests) * 100) : 0;
                  return (
                    <div key={t.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1 font-bold text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: t.color }} />
                          {t.name}
                        </span>
                        <span className="text-slate-400 font-bold">{t.value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: t.color, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Guest Nationalities breakdown with a Bar Chart (7 columns) */}
          <div className="lg:col-span-7 space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
              <Globe size={14} className="text-indigo-400" /> Geographic Demographics Distribution (Top 5)
            </span>

            <div className="h-28 w-full">
              {nationalityData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono italic">
                  No nationality demographic profiles registered yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nationalityData.slice(0, 5)}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={9} 
                      allowDecimals={false} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <ReChartsTooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {nationalityData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#818cf8' : index === 2 ? '#a5b4fc' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* GUEST DIRECTORY LIST COLUMN (Spans Full Width) */}
      <div className="lg:col-span-3 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-800">Guest Directory</h3>
            <p className="text-xs text-slate-400 font-sans">Manage individual guest profiles with contact details and preferences.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search guests..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>
            <button
              onClick={() => setShowAddGuest(true)}
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-sans text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-indigo-200"
            >
              <Plus size={12} /> New Guest
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredGuests.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-xs text-slate-400 font-mono italic bg-slate-50 rounded-xl border border-slate-100">
              {searchVal || selectedStatus !== 'all' || selectedNationality !== 'all' ? 'No matching profiles found.' : 'No guest profiles registered yet.'}
            </div>
          ) : (
            filteredGuests.map(g => (
              <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {g.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{g.name}</h4>
                      <p className="text-3xs text-slate-400 font-mono">ID: {g.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${g.status === 'VIP' ? 'bg-amber-100 text-amber-700' : g.status === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {g.status.replace(' Member', '')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400 font-mono block">Email</span><span className="font-semibold text-slate-700 truncate">{g.email}</span></div>
                  <div><span className="text-slate-400 font-mono block">Phone</span><span className="font-semibold text-slate-700">{g.phone || 'N/A'}</span></div>
                  {g.nationality && (
                    <div><span className="text-slate-400 font-mono block">Nationality</span><span className="font-semibold text-slate-700">{g.nationality}</span></div>
                  )}
                  <div><span className="text-slate-400 font-mono block">Loyalty Points</span><span className="font-semibold text-slate-700">{g.loyaltyPoints} pts</span></div>
                  {g.parentGroupId && (
                    <div className="col-span-2"><span className="text-slate-400 font-mono block">Group</span><span className="font-semibold text-slate-700">{g.parentGroupId}</span></div>
                  )}
                  {g.parentCorporateId && (
                    <div className="col-span-2"><span className="text-slate-400 font-mono block">Corporate</span><span className="font-semibold text-slate-700">{corporateAccounts.find(c => c.id === g.parentCorporateId)?.companyName || g.parentCorporateId}</span></div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setSelectedGuestId(g.id); setShowGuestDetail(true); }} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><User size={12} /> View Profile</button>
                  <button onClick={() => openFolioRouting('guest', g.id)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><Receipt size={12} /> Folio Routing</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>

      {/* CREATE NEW GUEST PROFILE SLIDEOVER MODAL */}
      {showAddGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-semibold text-sm text-slate-800">Onboard Premium CRM Profile</h3>
              <button 
                onClick={() => {
                  setShowAddGuest(false);
                  resetNewGuestForm();
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hidden file input for ID scanning */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={idScannerRef}
              onChange={handleIDScanUpload}
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => idScannerRef.current?.click()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 font-sans font-semibold rounded-lg text-xs hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Camera size={14} />
              Scan Guest ID / Passport OCR
            </button>

            <form onSubmit={handleAddNewGuest} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newGName}
                  onChange={(e) => setNewGName(e.target.value)}
                  placeholder="Alexander Pope"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={newGEmail}
                  onChange={(e) => setNewGEmail(e.target.value)}
                  placeholder="alexander@pope.it"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newGPhone}
                    onChange={(e) => setNewGPhone(e.target.value)}
                    placeholder="+1 (555) 012"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Account Tier</label>
                  <select
                    value={newGStatus}
                    onChange={(e) => setNewGStatus(e.target.value as GuestStatus)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Regular">Regular Tier</option>
                    <option value="Loyalty Member">Loyalty Tier</option>
                    <option value="VIP">VIP Tier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Nationality</label>
                <input
                  type="text"
                  value={newGNationality}
                  onChange={(e) => setNewGNationality(e.target.value)}
                  placeholder="e.g. Local, Foreign"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">TIN Number</label>
                  <input
                    type="text"
                    value={newGTin}
                    onChange={(e) => setNewGTin(e.target.value)}
                    placeholder="e.g. CUST-TIN-8899"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">VAT Reg. No</label>
                  <input
                    type="text"
                    value={newGVatNo}
                    onChange={(e) => setNewGVatNo(e.target.value)}
                    placeholder="e.g. CUST-VAT-1122"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Date of VAT Registration</label>
                <input
                  type="date"
                  value={newGVatDate}
                  onChange={(e) => setNewGVatDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Passport / ID</label>
                  <input
                    type="text"
                    value={newGPassport}
                    onChange={(e) => setNewGPassport(e.target.value)}
                    placeholder="ID Number"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Date of Birth</label>
                  <input
                    type="date"
                    value={newGDob}
                    onChange={(e) => setNewGDob(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Group Booking ID</label>
                  <input
                    type="text"
                    value={newGParentGroupId}
                    onChange={(e) => setNewGParentGroupId(e.target.value)}
                    placeholder="e.g., GRP-1234"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Corporate Account</label>
                  <select
                    value={newGParentCorporateId}
                    onChange={(e) => setNewGParentCorporateId(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs"
                  >
                    <option value="">None</option>
                    {corporateAccounts.map(corp => (
                      <option key={corp.id} value={corp.id}>{corp.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newGIsPrimaryContact"
                  checked={newGIsPrimaryContact}
                  onChange={(e) => setNewGIsPrimaryContact(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="newGIsPrimaryContact" className="text-3xs font-mono uppercase text-slate-400 font-bold">Primary Contact</label>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Default Special Requests</label>
                <textarea
                  value={newGRequests}
                  onChange={(e) => setNewGRequests(e.target.value)}
                  rows={2}
                  placeholder="Pillows preference, tea selection..."
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-sans font-semibold rounded-lg text-xs hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200"
              >
                Onboard CRM Profile
              </button>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* PROFILE MATCH MODAL */}
      {showProfileMatch && matchCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-semibold text-sm text-slate-800 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Potential Duplicate Profile</h3>
              <button onClick={() => setShowProfileMatch(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"><X size={18} /></button>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-xs text-slate-700 font-sans">A matching profile was found based on:</p>
              <ul className="text-xs text-slate-600 font-sans list-disc list-inside space-y-1">
                <li>Last name or email address</li>
                <li>Passport number (if provided)</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">{matchCandidate.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{matchCandidate.name}</div>
                  <div className="text-xs text-slate-500">{matchCandidate.email}</div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded border ${getLoyaltyBadge(matchCandidate.status)}`}>{matchCandidate.status}</span>
                {matchCandidate.nationality && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded">{matchCandidate.nationality}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowProfileMatch(false); handleAddNewGuest(); }} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200">Create New Anyway</button>
              <button onClick={() => { setSelectedGuestId(matchCandidate.id); setShowProfileMatch(false); setShowAddGuest(false); resetNewGuestForm(); }} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold rounded-lg transition-all duration-200 shadow-md shadow-indigo-200">Use Existing Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* FOLIO ROUTING MODAL */}
      {showFolioRouting && folioRoutingTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 pb-4">
              <h3 className="font-sans font-semibold text-sm text-slate-800 flex items-center gap-2"><Receipt size={16} className="text-indigo-500" /> Configure Folio Routing</h3>
              <button onClick={() => setShowFolioRouting(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <p className="text-xs text-slate-600 font-sans mb-4">Configure billing routing for {folioRoutingTarget.type === 'guest' ? 'this guest' : folioRoutingTarget.type === 'group' ? 'all guests in this group' : 'all guests in this corporate account'}:</p>
              
              {!isEditingCustomRouting ? (
                <>
                  <div className="space-y-2 mb-4">
                    {DEFAULT_ROUTING_RULES.map(rule => (
                      <button key={rule.name} onClick={() => applyFolioRouting(rule.name)} className="w-full p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-all duration-200">
                        <div className="text-xs font-semibold text-slate-800">{rule.name}</div>
                        <div className="text-3xs text-slate-500 mt-1">{rule.rules.map(r => `${r.chargeType} → Folio ${r.targetFolio}`).join(', ')}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsEditingCustomRouting(true)}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 border border-indigo-200"
                  >
                    <Edit3 size={12} /> Create Custom Routing Rule
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">Charge Type</span>
                      <div className="flex gap-2">
                        <span className="text-2xs font-mono text-slate-500">Folio A (Guest)</span>
                        <span className="text-2xs font-mono text-slate-500">Folio B (Master)</span>
                      </div>
                    </div>
                    {(['Room', 'F&B', 'Extra', 'Minibar', 'Laundry', 'Tax', 'Other'] as const).map(chargeType => (
                      <div key={chargeType} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs font-medium text-slate-700">{chargeType}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRoutingRuleChange(chargeType, 'A')}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 ${
                              customRoutingRules[chargeType] === 'A' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleRoutingRuleChange(chargeType, 'B')}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 ${
                              customRoutingRules[chargeType] === 'B' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            B
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingCustomRouting(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyCustomRouting}
                      disabled={Object.keys(customRoutingRules).length === 0}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                    >
                      Apply Custom Rule
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GUEST DETAIL MODAL */}
      {showGuestDetail && activeGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-indigo-300/50 ring-4 ring-indigo-100">
                  {activeGuest.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-800">{activeGuest.name}</h3>
                  <p className="text-3xs text-slate-400 font-mono">ID: {activeGuest.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 font-mono text-3xs border rounded uppercase ${getLoyaltyBadge(activeGuest.status)}`}>
                      {activeGuest.status}
                    </span>
                    <span className="text-2xs text-slate-400 font-mono">{activeGuest.loyaltyPoints} pts</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowGuestDetail(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5">
                      <BadgeDollarSign size={12} className="text-indigo-500" />
                      Contact & Tax Info
                    </h4>
                    {isEditingProfile ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleSaveProfileEdit}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 font-sans hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg text-[10px] font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-200"
                        >
                          <CheckCircle2 size={10} /> Save
                        </button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1.5 bg-slate-100 font-sans hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] transition-all duration-200 flex items-center gap-1 cursor-pointer"
                        >
                          <X size={10} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3 py-1.5 bg-indigo-50 font-sans hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Edit3 size={10} /> Edit
                      </button>
                    )}
                  </div>
                  
                  {isEditingProfile ? (
                    <div className="space-y-2.5 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Full Name</label>
                        <input
                          type="text"
                          value={editGName}
                          onChange={(e) => setEditGName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Email Address</label>
                          <input
                            type="email"
                            value={editGEmail}
                            onChange={(e) => setEditGEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Mobile Phone</label>
                          <input
                            type="tel"
                            value={editGPhone}
                            onChange={(e) => setEditGPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Nationality</label>
                        <input
                          type="text"
                          value={editGNationality}
                          onChange={(e) => setEditGNationality(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">TIN Number</label>
                          <input
                            type="text"
                            value={editGTin}
                            onChange={(e) => setEditGTin(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">VAT Reg. No</label>
                          <input
                            type="text"
                            value={editGVatNo}
                            onChange={(e) => setEditGVatNo(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Date of VAT Reg.</label>
                        <input
                          type="date"
                          value={editGVatDate}
                          onChange={(e) => setEditGVatDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Passport / ID Number</label>
                        <input
                          type="text"
                          value={editGPassport}
                          onChange={(e) => setEditGPassport(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Date of Birth</label>
                        <input
                          type="date"
                          value={editGDob}
                          onChange={(e) => setEditGDob(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-600 font-sans">
                      <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                        <Mail size={14} className="text-indigo-500" />
                        <span className="font-medium text-slate-800">{activeGuest.email}</span>
                      </div>
                      <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                        <Phone size={14} className="text-indigo-500" />
                        <span className="font-medium text-slate-800">{activeGuest.phone || 'Not provided'}</span>
                      </div>
                      {activeGuest.nationality && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Globe size={14} className="text-indigo-500" />
                          <span>Nationality: <strong className="font-bold text-slate-800">{activeGuest.nationality}</strong></span>
                        </div>
                      )}
                      {activeGuest.passportNumber && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <ShieldCheck size={14} className="text-indigo-500" />
                          <span className="font-mono font-semibold text-slate-800">Passport: {activeGuest.passportNumber}</span>
                        </div>
                      )}
                      {activeGuest.dateOfBirth && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Calendar size={14} className="text-indigo-500" />
                          <span className="font-mono font-semibold text-slate-800">DOB: {activeGuest.dateOfBirth}</span>
                        </div>
                      )}
                      {activeGuest.tin && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold border border-indigo-200">TIN</span>
                          <span className="font-mono font-semibold text-slate-800">{activeGuest.tin}</span>
                        </div>
                      )}
                      {activeGuest.vatNo && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold border border-indigo-200">VAT</span>
                          <span className="font-mono font-semibold text-slate-800">{activeGuest.vatNo} {activeGuest.vatDate && `(Reg. ${activeGuest.vatDate})`}</span>
                        </div>
                      )}
                      {activeGuest.parentGroupId && (
                        <div className="flex gap-2.5 items-center p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                          <Users2 size={14} className="text-indigo-600" />
                          <span className="font-mono font-semibold">Group: <strong className="text-slate-800">{activeGuest.parentGroupId}</strong></span>
                          {activeGuest.isPrimaryContact && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                      )}
                      {activeGuest.parentCorporateId && (
                        <div className="flex gap-2.5 items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <Building2 size={14} className="text-emerald-600" />
                          <span className="font-mono font-semibold">Corporate: <strong className="text-slate-800">{corporateAccounts.find(c => c.id === activeGuest.parentCorporateId)?.companyName || activeGuest.parentCorporateId}</strong></span>
                          {activeGuest.isPrimaryContact && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                      )}
                      <div className="flex gap-2.5 items-center p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <Wallet size={14} className="text-indigo-600" />
                        <span className="font-mono font-semibold text-slate-800">Total Spend: ${activeGuest.totalSpend.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Document Upload */}
                {(!activeGuest.idDocuments || !activeGuest.idDocuments.some(d => d.isUploaded)) && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera size={14} className="text-amber-600" />
                      <h4 className="text-xs font-mono uppercase text-amber-700 tracking-wider font-bold">ID Document Required</h4>
                    </div>
                    <p className="text-2xs text-amber-600 font-sans mb-3">No ID document has been uploaded for this guest. Please upload a passport or national ID.</p>
                    <button
                      onClick={() => idScannerRef.current?.click()}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Camera size={12} /> Upload ID Document
                    </button>
                  </div>
                )}

                {/* Group Relationships */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5">
                      <Users2 size={12} className="text-indigo-500" />
                      Group Relationships
                    </h4>
                    <button
                      onClick={() => setShowLinkToGroup(true)}
                      className="px-3 py-1.5 bg-indigo-50 font-sans hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Link2 size={10} /> Link to Group
                    </button>
                  </div>
                  
                  {guestGroupSummary ? (
                    <div className="space-y-3">
                      {/* Current Group */}
                      {guestGroupSummary.currentGroup && (
                        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold">Current Group</span>
                            {guestGroupSummary.currentGroup.isPrimaryContact && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                                <Star size={10} className="fill-amber-500" /> Primary Contact
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{guestGroupSummary.currentGroup.groupName}</div>
                              <div className="text-2xs text-slate-500 font-mono mt-1">
                                Type: {guestGroupSummary.currentGroup.groupType} | Since: {guestGroupSummary.currentGroup.startDate}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Navigate to group profile (this would typically open the GroupProfileModule)
                                // For now, we'll just log it since navigation depends on the app structure
                                console.log('Navigate to group:', guestGroupSummary.currentGroup.groupId);
                              }}
                              className="p-2 bg-white hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                              title="View Group Profile"
                            >
                              <Users2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Historical Groups */}
                      {guestGroupSummary.previousGroups.length > 0 && (
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">Historical Groups</span>
                          <div className="space-y-2">
                            {guestGroupSummary.previousGroups.slice(0, 3).map((pg: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-semibold text-slate-700">{pg.groupName}</div>
                                  <div className="text-2xs text-slate-500 font-mono mt-0.5">
                                    {pg.startDate} → {pg.endDate} | {pg.totalStays} stays | ${pg.totalRevenue.toLocaleString()}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    console.log('Navigate to historical group:', pg.groupId);
                                  }}
                                  className="p-1.5 bg-white hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                                  title="View Group Profile"
                                >
                                  <Users2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-indigo-600">{guestGroupSummary.totalGroupStays}</div>
                          <div className="text-2xs text-slate-500 font-mono">Total Stays</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-emerald-600">${guestGroupSummary.totalGroupRevenue.toLocaleString()}</div>
                          <div className="text-2xs text-slate-500 font-mono">Revenue</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{guestGroupSummary.totalGroupRoomNights}</div>
                          <div className="text-2xs text-slate-500 font-mono">Room Nights</div>
                        </div>
                      </div>
                    </div>
                  ) : activeGuest.parentGroupId ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold">Linked Group</span>
                          {activeGuest.isPrimaryContact && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                              <Star size={10} className="fill-amber-500" /> Primary Contact
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{activeGuest.parentGroupId}</div>
                            <div className="text-2xs text-slate-500 font-mono mt-1">Tracked via guest profile parentGroupId</div>
                          </div>
                          <button
                            onClick={() => {
                              console.log('Navigate to group:', activeGuest.parentGroupId);
                            }}
                            className="p-2 bg-white hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                            title="View Group Profile"
                          >
                            <Users2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <Users2 size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-sans">No group relationships recorded</p>
                      <button
                        onClick={() => setShowLinkToGroup(true)}
                        className="mt-2 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-[10px] font-semibold transition-all duration-200"
                      >
                        Link to a Group
                      </button>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5 mb-3">
                    <Bookmark size={12} className="text-amber-500" />
                    Special Requests & Preferences
                  </h4>
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans italic shadow-sm">
                    "{activeGuest.specialRequests || 'No special requests listed on file.'}"
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5 mb-3">
                    <FileText size={12} className="text-indigo-500" />
                    Operational CRM Notes & Logs
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-2xs font-mono text-slate-600 h-32 overflow-y-auto whitespace-pre-line leading-normal shadow-inner">
                    {activeGuest.notes || 'No current notes logged for checkout reviews.'}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Type client update note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm text-xs"
                    />
                    <button
                      onClick={handleAddNoteToGuest}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-700 text-white font-sans rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md shadow-indigo-200 text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => openFolioRouting('guest', activeGuest.id)} className="flex-1 px-3 py-2 bg-slate-100 font-sans hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><Receipt size={12} /> Folio Routing</button>
                  {activeGuest.parentGroupId ? (
                    <button onClick={handleGroupCheckIn} className="flex-1 px-3 py-2 bg-emerald-50 font-sans hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><UserCheck size={12} /> Group Check-In</button>
                  ) : null}
                  {activeGuest.parentGroupId || activeGuest.parentCorporateId ? (
                    <button onClick={() => handleUnlinkGuest(activeGuest.id)} className="flex-1 px-3 py-2 bg-rose-50 font-sans hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><Unlink size={12} /> Unlink</button>
                  ) : (
                    <>
                      <select onChange={(e) => { if (e.target.value) { handleLinkGuestToGroup(activeGuest.id, e.target.value); e.target.value = ''; } }} className="flex-1 px-3 py-2 bg-indigo-50 font-sans text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"><option value="">Link to Group</option>{groupBookings.map(gb => (<option key={gb.id} value={gb.id}>{gb.groupName}</option>))}</select>
                      <select onChange={(e) => { if (e.target.value) { handleLinkGuestToCorp(activeGuest.id, e.target.value); e.target.value = ''; } }} className="flex-1 px-3 py-2 bg-emerald-50 font-sans text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"><option value="">Link to Corp</option>{corporateAccounts.map(c => (<option key={c.id} value={c.id}>{c.companyName}</option>))}</select>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GROUP GUESTS VIEW MODAL */}
      {showGroupGuests && selectedGroupForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md"><Users2 size={18} /></div>
                <div>
                  <h3 className="font-sans font-semibold text-sm text-slate-800">{selectedGroupForView.groupName}</h3>
                  <p className="text-3xs text-slate-400 font-mono">Group Guests ({guests.filter(g => g.parentGroupId === selectedGroupForView.id).length})</p>
                </div>
              </div>
              <button onClick={() => setShowGroupGuests(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              {guests.filter(g => g.parentGroupId === selectedGroupForView.id).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono italic bg-slate-50 rounded-xl border border-slate-100">
                  No guests linked to this group booking yet.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={async () => {
                        // Auto-create group profile if it doesn't exist
                        const existingGroup = groupBookings.find(g => g.id === selectedGroupForView.id);
                        if (!existingGroup) {
                          await addGroupBooking({
                            groupName: selectedGroupForView.groupName,
                            contactName: selectedGroupForView.contactName,
                            contactEmail: selectedGroupForView.contactEmail,
                            contactPhone: selectedGroupForView.contactPhone || '',
                            roomTypeNeeded: 'Double',
                            roomCount: selectedGroupForView.roomCount,
                            checkInDate: selectedGroupForView.checkInDate,
                            checkOutDate: toISODate(new Date(new Date(selectedGroupForView.checkInDate).getTime() + 7 * 24 * 60 * 60 * 1000)),
                            discountPercent: 0,
                            status: 'Confirmed'
                          });
                        }
                        
                        // Check in all reservations with the same group ID
                        const groupReservations = reservations.filter(r => r.bookingGroupId === selectedGroupForView.id && r.status === 'Confirmed' && r.roomNumber);
                        groupReservations.forEach(groupRes => {
                          checkInReservation(groupRes.id, groupRes.roomNumber!);
                          
                          // Auto-link guest to group profile (create if doesn't exist)
                          // Match by email, name, and parentGroupId to ensure unique guests per reservation
                          let guest = guests.find(g => 
                            g.email.toLowerCase() === groupRes.guestEmail.toLowerCase() && 
                            g.name.toLowerCase() === groupRes.guestName.toLowerCase() &&
                            g.parentGroupId === selectedGroupForView.id
                          );
                          if (!guest) {
                            // Create guest profile
                            guest = addGuest({
                              name: groupRes.guestName,
                              lastName: groupRes.guestName.split(' ').pop() || groupRes.guestName,
                              email: groupRes.guestEmail,
                              phone: groupRes.guestPhone || '',
                              status: groupRes.guestStatus || 'Regular',
                              loyaltyPoints: 0,
                              specialRequests: '',
                              notes: `Auto-created from group booking: ${selectedGroupForView.id} - Reservation: ${groupRes.id}`,
                              history: [],
                              totalSpend: 0,
                              parentGroupId: selectedGroupForView.id,
                              isPrimaryContact: groupRes.guestName === selectedGroupForView.contactName,
                              nationality: undefined,
                              tin: groupRes.guestTin,
                              vatNo: groupRes.guestVatNo,
                              vatDate: groupRes.guestVatDate,
                              passportNumber: undefined,
                              dateOfBirth: undefined
                            });
                          }
                        });
                        
                        onGroupOnboardSuccess?.({ 
                          groupName: selectedGroupForView.groupName, 
                          contactName: selectedGroupForView.contactName, 
                          contactEmail: selectedGroupForView.contactEmail, 
                          contactPhone: selectedGroupForView.contactPhone || '', 
                          groupId: selectedGroupForView.id, 
                          roomCount: groupReservations.length, 
                          checkInDate: selectedGroupForView.checkInDate 
                        });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-sans text-xs font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                    >
                      <UserCheck size={14} /> Check-In Entire Group
                    </button>
                  </div>
                  <div className="space-y-2">
                    {guests.filter(g => g.parentGroupId === selectedGroupForView.id).map(guest => {
                      const roomingListEntry = selectedGroupForView.roomingList?.find(rl => rl.guestId === guest.id);
                      const assignedRoomType = roomingListEntry?.roomType || guest.preferences?.roomTypePreference;
                      return (
                        <div key={guest.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">{guest.name.split(' ').map(n => n[0]).join('')}</div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">{guest.name}</div>
                                <div className="text-xs text-slate-500">{guest.email}</div>
                                {guest.phone && <div className="text-2xs text-slate-400 font-mono">{guest.phone}</div>}
                                {assignedRoomType && (
                                  <div className="text-2xs text-indigo-600 font-mono font-semibold mt-1">
                                    {assignedRoomType}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 font-mono text-3xs border rounded uppercase ${getLoyaltyBadge(guest.status)}`}>
                                {guest.status.replace(' Member', '')}
                              </span>
                              {guest.isPrimaryContact && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-2xs font-semibold">Primary</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                            <button
                              onClick={() => { setSelectedGuestId(guest.id); setShowGroupGuests(false); setShowGuestDetail(true); }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
                            >
                              <Edit3 size={12} /> View Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GROUP BOOKINGS TAB */}
      {crmTab === 'groups' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-800">Group Bookings</h3>
              <p className="text-xs text-slate-400 font-sans">Manage group reservations with parent-child folio relationships. Create group bookings through the Reservations module.</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search group bookings..."
                value={groupSearchVal}
                onChange={(e) => setGroupSearchVal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupBookings.filter(group => 
              group.groupName.toLowerCase().includes(groupSearchVal.toLowerCase()) ||
              group.contactName.toLowerCase().includes(groupSearchVal.toLowerCase()) ||
              group.contactEmail.toLowerCase().includes(groupSearchVal.toLowerCase())
            ).length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400 font-mono italic bg-slate-50 rounded-xl border border-slate-100">
                {groupSearchVal ? 'No matching group bookings found.' : 'No group bookings registered yet.'}
              </div>
            ) : (
              groupBookings.filter(group => 
                group.groupName.toLowerCase().includes(groupSearchVal.toLowerCase()) ||
                group.contactName.toLowerCase().includes(groupSearchVal.toLowerCase()) ||
                group.contactEmail.toLowerCase().includes(groupSearchVal.toLowerCase())
              ).map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md"><Users2 size={20} /></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{group.groupName}</h4>
                        <p className="text-3xs text-slate-400 font-mono">ID: {group.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${group.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{group.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400 font-mono block">Contact</span><span className="font-semibold text-slate-700">{group.contactName}</span></div>
                    <div><span className="text-slate-400 font-mono block">Email</span><span className="font-semibold text-slate-700">{group.contactEmail}</span></div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-mono block">Room Breakdown</span>
                      <div className="font-semibold text-slate-700">
                        {group.roomTypeBreakdown && group.roomTypeBreakdown.length > 0 ? (
                          (() => {
                            const types = group.roomTypeBreakdown.map(rt => rt.roomType);
                            const isMixed = new Set(types).size > 1;
                            if (isMixed) {
                              return `Mixed (${group.roomTypeBreakdown.map(rt => `${rt.roomType}: ${rt.count}`).join(', ')})`;
                            }
                            return group.roomTypeBreakdown.map(rt => `${rt.roomType}: ${rt.count}`).join(', ');
                          })()
                        ) : (
                          `${group.roomTypeNeeded}: ${group.roomCount}`
                        )}
                      </div>
                    </div>
                    <div><span className="text-slate-400 font-mono block">Discount</span><span className="font-semibold text-slate-700">{group.discountPercent}%</span></div>
                    <div><span className="text-slate-400 font-mono block">Check-In</span><span className="font-semibold text-slate-700">{group.checkInDate}</span></div>
                    <div className="col-span-2"><span className="text-slate-400 font-mono block">Check-Out</span><span className="font-semibold text-slate-700">{group.checkOutDate}</span></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => openFolioRouting('group', group.id)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><Receipt size={12} /> Folio Routing</button>
                    <button onClick={() => { setSelectedGroupForView(group); setShowGroupGuests(true); }} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><Users size={12} /> View Guests</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CORPORATE AGREEMENTS TAB */}
      {crmTab === 'corporate' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-sans font-semibold text-slate-800">Corporate Account Agreements</h3>
              <p className="text-xs text-slate-400 font-sans">Review contracted companies, registered balance sheets and discount indexes.</p>
            </div>
            
            <button
              onClick={() => setShowAddCorp(true)}
              className="px-4 py-2 bg-indigo-600 border border-indigo-700 text-white font-sans rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
            >
              <Plus size={14} /> Establish Corporate Account
            </button>
          </div>

          {corpSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs rounded-lg shadow-sm">
              {corpSuccess}
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-lg shadow-slate-200/50">
            <table className="w-full text-left text-xs text-slate-600 border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 font-mono text-slate-500 dark:text-slate-300 text-3xs uppercase">
                  <th className="py-2.5 px-4">Corporate Company Name</th>
                  <th className="py-2.5 px-4">Contact Info</th>
                  <th className="py-2.5 px-4 text-center">Discount Index</th>
                  <th className="py-2.5 px-4 text-center">Active Bookings</th>
                  <th className="py-2.5 px-4 text-right">Unpaid Balance Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 font-sans">
                {corporateAccounts.map(corp => (
                  <tr key={corp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors duration-150">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {corp.companyName}
                      <span className="block font-mono text-3xs text-slate-400">Account: {corp.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{corp.contactPerson}</div>
                      <div className="text-2xs font-mono text-slate-400">{corp.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                      {corp.discountPercent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                      {corp.activeBookings}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                      ${corp.unpaidBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CREATE NEW CORPORATE PARTNER AGREEMENT */}
          {showAddCorp && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-sans font-semibold text-sm text-slate-800">Establish Corporate Agreement</h3>
                  <button 
                    onClick={() => setShowAddCorp(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCorp} className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Company Legal Name</label>
                    <input
                      type="text"
                      required
                      value={corpName}
                      onChange={(e) => setCorpName(e.target.value)}
                      placeholder="Tesla Motors, Apple Inc."
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Primary Account Rep Name</label>
                    <input
                      type="text"
                      required
                      value={corpContact}
                      onChange={(e) => setCorpContact(e.target.value)}
                      placeholder="Steve Jobs"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Representative Email Address</label>
                    <input
                      type="email"
                      required
                      value={corpEmail}
                      onChange={(e) => setCorpEmail(e.target.value)}
                      placeholder="s.jobs@apple.com"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Contact Phone</label>
                    <input
                      type="tel"
                      value={corpPhone}
                      onChange={(e) => setCorpPhone(e.target.value)}
                      placeholder="+1 (555) 012-4411"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Discount Rate (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="35"
                        required
                        value={corpDiscount}
                        onChange={(e) => setCorpDiscount(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Credit Limit</label>
                      <input
                        type="number"
                        min="0"
                        value={corpCreditLimit}
                        onChange={(e) => setCorpCreditLimit(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Corporate Tax ID</label>
                    <input
                      type="text"
                      value={corpTaxId}
                      onChange={(e) => setCorpTaxId(e.target.value)}
                      placeholder="Company Tax ID"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Billing Address</label>
                    <input
                      type="text"
                      value={corpBillingAddress}
                      onChange={(e) => setCorpBillingAddress(e.target.value)}
                      placeholder="Street address"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-3xs font-mono uppercase text-slate-400 font-bold">City</label>
                      <input
                        type="text"
                        value={corpBillingCity}
                        onChange={(e) => setCorpBillingCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Country</label>
                      <input
                        type="text"
                        value={corpBillingCountry}
                        onChange={(e) => setCorpBillingCountry(e.target.value)}
                        placeholder="Country"
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-mono uppercase text-slate-400 font-bold">Payment Terms</label>
                    <select
                      value={corpPaymentTerms}
                      onChange={(e) => setCorpPaymentTerms(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Net 30">Net 30</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 7">Net 7</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-sans font-semibold rounded-lg text-xs hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200"
                  >
                    Establish Contracted Agreement
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LINK TO GROUP MODAL */}
      {showLinkToGroup && activeGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-semibold text-sm text-slate-800 flex items-center gap-2">
                <Link2 size={16} className="text-indigo-500" />
                Link Guest to Group
              </h3>
              <button onClick={() => setShowLinkToGroup(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500 font-mono">Guest</div>
                <div className="text-sm font-semibold text-slate-800">{activeGuest.name}</div>
                <div className="text-2xs text-slate-400">{activeGuest.email}</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-3xs font-mono uppercase text-slate-400 font-bold block">Select Group</label>
                <select
                  value={selectedGroupForLink}
                  onChange={(e) => setSelectedGroupForLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-xs"
                >
                  <option value="">-- Select a group --</option>
                  {groupProfiles.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.code}) - {group.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLinkToGroup(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkToGroup}
                disabled={!selectedGroupForLink}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-sans text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Link2 size={12} /> Link to Group
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
