/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useGuest } from '../../context/GuestContext';
import { useGroup } from '../../context/GroupContext';
import { useModalReturn } from '../../context/ModalReturnContext';
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
  Calendar, Mail, Phone, Bookmark, User, Printer, PenTool, ClipboardList, Download, Car
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import PreRegistrationPanel from './PreRegistrationPanel';

interface CRMModuleProps {
  initialGuestData?: { name?: string; email?: string; phone?: string; resId?: string; rm?: string; date?: string; isGroup?: boolean; groupId?: string; groupName?: string; contactName?: string; roomCount?: number; pendingCheckIn?: boolean };
  onClearInitialData?: () => void;
  viewGuestId?: string;
  onClearViewGuestId?: () => void;
  viewGroupId?: string;
  onClearViewGroupId?: () => void;
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

export default function CRMModule({ initialGuestData, onClearInitialData, viewGuestId, onClearViewGuestId, viewGroupId, onClearViewGroupId, onOnboardSuccess, onGroupOnboardSuccess }: CRMModuleProps) {
  const { push, pop } = useModalReturn();
  const {
    guests, guestsLoading, guestsError, addGuest, updateGuest, updateGuestData, findMatchingGuest, setGuestBillingRouting,
    groupBookings, addGroupBooking, updateGroupBookingStatus,
    corporateAccounts, addCorporateAccount, updateCorporateAccount,
    reservations, updateReservation, checkInReservation,
    globalHotelSettings
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
  const [crmTab, setCrmTab] = useState<'individual' | 'groups' | 'corporate' | 'preregistration'>('individual');

  // Pre-Registration state
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [preRegFilter, setPreRegFilter] = useState<'all' | 'pending' | 'reviewed' | 'imported' | 'rejected'>('all');
  const [selectedPreReg, setSelectedPreReg] = useState<any | null>(null);
  const [preRegImporting, setPreRegImporting] = useState(false);

  const fetchPreRegistrations = async () => {
    setPreRegLoading(true);
    try {
      const params = preRegFilter !== 'all' ? `?status=${preRegFilter}` : '';
      const res = await fetch(`/api/pre-registrations${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPreRegistrations(data.preRegistrations || []);
      }
    } catch {
      // ignore
    } finally {
      setPreRegLoading(false);
    }
  };

  useEffect(() => {
    if (crmTab === 'preregistration') {
      fetchPreRegistrations();
    }
  }, [crmTab, preRegFilter]);

  const handleImportPreReg = async (id: string) => {
    setPreRegImporting(true);
    try {
      const res = await fetch(`/api/pre-registrations/${id}/import`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      await fetchPreRegistrations();
      setSelectedPreReg(null);
    } catch (e: any) {
      alert(e.message || 'Import failed');
    } finally {
      setPreRegImporting(false);
    }
  };

  const handleReviewPreReg = async (id: string, status: string, notes?: string) => {
    try {
      await fetch(`/api/pre-registrations/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, review_notes: notes || '' }),
      });
      fetchPreRegistrations();
    } catch {
      // ignore
    }
  };

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
  const [loyaltyHistoryGuestId, setLoyaltyHistoryGuestId] = useState<string | null>(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  
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
  const [pendingCheckIn, setPendingCheckIn] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showGroupCheckInForm, setShowGroupCheckInForm] = useState(false);
  const [groupCheckInData, setGroupCheckInData] = useState<{ groupName: string; contactName: string; contactEmail: string; contactPhone: string; groupId: string; roomCount: number; checkInDate: string } | null>(null);

  const idScannerRef = useRef<HTMLInputElement>(null);
  const existingGuestIdScannerRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [idUploaded, setIdUploaded] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
      fetchGuestGroupRelationships(activeGuest?.id);
      getGuestGroupSummary(activeGuest?.id).then(setGuestGroupSummary);
    }
  }, [showGuestDetail, activeGuest, fetchGuestGroupRelationships, getGuestGroupSummary]);

  // Sync edits
  useEffect(() => {
    if (activeGuest) {
      setEditGName(activeGuest?.name);
      setEditGEmail(activeGuest?.email);
      setEditGPhone(activeGuest?.phone || '');
      setEditGNationality(activeGuest?.nationality || '');
      setEditGTin(activeGuest?.tin || '');
      setEditGVatNo(activeGuest?.vatNo || '');
      setEditGVatDate(activeGuest?.vatDate || '');
      setEditGPassport(activeGuest?.passportNumber || '');
      setEditGDob(activeGuest?.dateOfBirth || '');
      setEditParentGroupId(activeGuest?.parentGroupId || '');
      setEditParentCorporateId(activeGuest?.parentCorporateId || '');
      setEditIsPrimaryContact(activeGuest?.isPrimaryContact || false);
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
          push({ id: 'crm-group-checkin', name: 'CRM Group Check-In', restore: () => {} });
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
        // Set pending check-in flag to show check-in button in guest profile
        if (initialGuestData.pendingCheckIn) {
          setPendingCheckIn(true);
          // Open guest detail modal for check-in flow
          setShowGuestDetail(true);
        }
      } else {
        // Auto-create guest profile if missing
        const lastName = initialGuestData.name?.split(' ').pop() || initialGuestData.name || '';
        const newGuestId = addGuest({
          name: initialGuestData.name || '',
          lastName: lastName,
          email: initialGuestData.email || '',
          phone: initialGuestData.phone || '',
          status: 'Regular',
          loyaltyPoints: 0,
          specialRequests: '',
          notes: `Auto-created during check-in for reservation: ${initialGuestData.resId || 'N/A'}`,
          history: [],
          totalSpend: 0,
          nationality: undefined,
          tin: undefined,
          vatNo: undefined,
          vatDate: undefined,
          passportNumber: undefined,
          dateOfBirth: undefined,
          parentGroupId: initialGuestData.groupId || undefined,
          isPrimaryContact: false
        });
        
        setSelectedGuestId(newGuestId);
        setCrmTab('individual');
        if (initialGuestData.resId) {
          setPendingCheckInResData({ resId: initialGuestData.resId, rm: initialGuestData.rm || 'TBD', date: initialGuestData.date || toISODate() });
        }
        setIsEditingProfile(true);
        // Set pending check-in flag to show check-in button in guest profile
        if (initialGuestData.pendingCheckIn) {
          setPendingCheckIn(true);
          // Open guest detail modal for check-in flow
          setShowGuestDetail(true);
        }
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

  // Auto-open group guests modal when navigated from another module
  useEffect(() => {
    if (viewGroupId) {
      const group = groupBookings.find(g => g.id === viewGroupId);
      if (group) {
        setSelectedGroupForView(group);
        setCrmTab('groups');
        setShowGroupGuests(true);
      }
      onClearViewGroupId?.();
    }
  }, [viewGroupId, onClearViewGroupId, groupBookings]);

  // Fetch loyalty transaction history
  const fetchLoyaltyHistory = async (guestId: string) => {
    setLoyaltyLoading(true);
    try {
      const res = await fetch(`/api/loyalty/transactions/${guestId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLoyaltyTransactions(data.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoyaltyLoading(false);
    }
  };

  useEffect(() => {
    if (loyaltyHistoryGuestId) {
      fetchLoyaltyHistory(loyaltyHistoryGuestId);
    } else {
      setLoyaltyTransactions([]);
    }
  }, [loyaltyHistoryGuestId]);

  const handleIDScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // Store for later upload when guest is created
        // We'll save this in a ref or state to upload after guest creation
        console.log('ID Document ready for upload:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExistingGuestIDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        if (!activeGuest) return;
        
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/guests/${activeGuest?.id}/id-card`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              docType: 'Passport',
              docNumber: activeGuest?.passportNumber || 'N/A',
              expiryDate: activeGuest?.dateOfBirth || '2025-12-31',
              issueDate: null,
              issuingCountry: activeGuest?.nationality || 'ET',
              frontImageBase64: base64.split(',')[1], // Remove data URL prefix
              backImageBase64: null
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('ID card uploaded successfully:', data);
            setIdUploaded(true);
            // Refresh guest data to show updated ID card
            updateGuestData(activeGuest?.id, {
              identificationDoc: data.identificationDoc
            });
          } else {
            console.error('Failed to upload ID card');
            alert('Failed to upload ID card. Please try again.');
          }
        } catch (error) {
          console.error('Error uploading ID card:', error);
          alert('Failed to upload ID card. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature canvas handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
        setSignatureData(canvas.toDataURL());
      }
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
      }
    }
  };
  const handleCloseGuestDetail = () => {
    setShowGuestDetail(false);
    const target = pop();
    target?.restore();
  };
  const handleCloseGroupGuests = () => {
    setShowGroupGuests(false);
    const target = pop();
    target?.restore();
  };
  const handleVerifyAndCompleteCheckIn = async () => {
    if (!pendingCheckInResData || !activeGuest) return;

    // Perform the actual check-in
    await checkInReservation(pendingCheckInResData.resId, pendingCheckInResData.rm);

    // Update guest profile with ID document info
    updateGuestData(activeGuest?.id, {
      idDocuments: [
        {
          type: 'Passport',
          number: activeGuest?.passportNumber || 'N/A',
          uploadedAt: new Date().toISOString(),
          isUploaded: true
        }
      ]
    });

    // Generate and show check-in form
    setShowCheckInForm(true);

    // Reset state
    setPendingCheckInResData(null);
    setPendingCheckIn(false);
    setIsEditingProfile(false);
    setIdUploaded(false);
  };

  const handleGroupCheckIn = async () => {
    if (!activeGuest || !activeGuest?.parentGroupId) return;
    let group = groupBookings.find(g => g.id === activeGuest?.parentGroupId);

    // Auto-create group profile if it doesn't exist
    if (!group) {
      await addGroupBooking({
        groupName: activeGuest?.parentGroupId,
        contactName: activeGuest?.name,
        contactEmail: activeGuest?.email,
        contactPhone: activeGuest?.phone || '',
        roomTypeNeeded: 'Double',
        roomCount: 1,
        checkInDate: toISODate(),
        checkOutDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        discountPercent: 0,
        status: 'Confirmed'
      });
      group = groupBookings.find(g => g.id === activeGuest?.parentGroupId) || {
        id: activeGuest?.parentGroupId,
        groupName: activeGuest?.parentGroupId,
        contactName: activeGuest?.name,
        contactEmail: activeGuest?.email,
        contactPhone: activeGuest?.phone || '',
        roomTypeNeeded: 'Double',
        roomCount: 1,
        checkInDate: toISODate(),
        checkOutDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        discountPercent: 0,
        status: 'Confirmed'
      };
    }

    // Check in all reservations with the same group ID
    const groupReservations = reservations.filter(r => r.bookingGroupId === activeGuest?.parentGroupId && r.status === 'Confirmed' && r.roomNumber);
    for (const groupRes of groupReservations) {
      // Guest profiles should already exist from booking - just verify they exist
      const guest = guests.find(g =>
        g.email.toLowerCase() === groupRes.guestEmail.toLowerCase() &&
        g.name.toLowerCase() === groupRes.guestName.toLowerCase() &&
        g.parentGroupId === activeGuest?.parentGroupId
      );
      let guestId: string | undefined = guest?.id;
      if (!guestId) {
        // Create guest profile if it was missing
        guestId = addGuest({
          name: groupRes.guestName,
          lastName: groupRes.guestName.split(' ').pop() || groupRes.guestName,
          email: groupRes.guestEmail,
          phone: groupRes.guestPhone || '',
          status: groupRes.guestStatus || 'Regular',
          loyaltyPoints: 0,
          specialRequests: '',
          notes: `Auto-created from group booking: ${activeGuest?.parentGroupId} - Reservation: ${groupRes.id}`,
          history: [],
          totalSpend: 0,
          parentGroupId: activeGuest?.parentGroupId,
          isPrimaryContact: groupRes.guestName === activeGuest?.name,
          nationality: undefined,
          tin: groupRes.guestTin,
          vatNo: groupRes.guestVatNo,
          vatDate: groupRes.guestVatDate,
          passportNumber: undefined,
          dateOfBirth: undefined
        });
      }

      // Persist guestId before check-in so the trigger links the correct guest
      if (guestId) {
        updateReservation(groupRes.id, { guestId });
      }

      await checkInReservation(groupRes.id, groupRes.roomNumber!);
    }

    // Show group check-in form instead of calling onGroupOnboardSuccess directly
    setGroupCheckInData({
      groupName: group.groupName,
      contactName: group.contactName,
      contactEmail: group.contactEmail,
      contactPhone: group.contactPhone || '',
      groupId: group.id,
      roomCount: groupReservations.length,
      checkInDate: group.checkInDate
    });
    setShowGroupCheckInForm(true);
  };

  // Filtering
  const uniqueNationalities = useMemo(() => Array.from(new Set(guests.map(g => g.nationality || 'Undetermined'))).filter(Boolean), [guests]);

  const filteredGuests = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    return guests.filter(g => {
      // Search across every guest parameter — any field that contains the query matches.
      const matchesSearch = !q || [
        g.id,
        g.name,
        g.lastName,
        g.email,
        g.phone,
        g.nationality,
        g.passportNumber,
        g.tin,
        g.vatNo,
        g.vatDate,
        g.dateOfBirth,
        g.status,
        g.specialRequests,
        g.notes,
        g.preferences?.roomTypePreference,
        g.preferences?.pillowPreference,
        g.preferences?.dietaryRestrictions,
        g.preferences?.languagePreference,
        g.identificationDoc?.type,
        g.identificationDoc?.number,
        g.identificationDoc?.issuingCountry,
        g.parentGroupId,
        g.parentCorporateId,
      ].some(field => (field ?? '').toString().trim().toLowerCase().includes(q));
      const matchesStatus = selectedStatus === 'all' || g.status === selectedStatus;
      const matchesNationality = selectedNationality === 'all' || (g.nationality || 'Undetermined').toLowerCase() === selectedNationality.toLowerCase();
      return matchesSearch && matchesStatus && matchesNationality;
    });
  }, [guests, searchVal, selectedStatus, selectedNationality]);

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
    const updatedGuest = {
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
    };
    updateGuest(updatedGuest);

    // Keep denormalized guest fields on linked reservations in sync
    reservations.forEach(res => {
      const matchesById = res.guestId === updatedGuest.id;
      const matchesByFallback = !res.guestId && res.guestName === activeGuest?.name && res.guestEmail === activeGuest?.email;
      if (matchesById || matchesByFallback) {
        updateReservation(res.id, {
          guestName: updatedGuest.name,
          guestEmail: updatedGuest.email,
          guestPhone: updatedGuest.phone,
          guestStatus: updatedGuest.status,
          guestTin: updatedGuest.tin,
          guestVatNo: updatedGuest.vatNo,
          guestVatDate: updatedGuest.vatDate,
          guestId: updatedGuest.id
        });
      }
    });

    setIsEditingProfile(false);
  };

  const handleAddNoteToGuest = () => {
    if (!activeGuest || !newNote) return;
    updateGuest({ ...activeGuest, notes: (activeGuest?.notes ? activeGuest?.notes + '\n' : '') + `[${toISODate()}] ${newNote}` });
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
    
    const relationship = await linkGuestToGroup(activeGuest?.id, selectedGroupForLink, {
      relationshipType: 'GroupReservation',
      isPrimaryContact: false,
    });
    
    if (relationship) {
      setShowLinkToGroup(false);
      setSelectedGroupForLink('');
      // Refresh the summary
      const summary = await getGuestGroupSummary(activeGuest?.id);
      setGuestGroupSummary(summary);
    }
  };

  const handleUnlinkFromGroup = async (groupId: string) => {
    if (!activeGuest) return;
    
    const success = await unlinkGuestFromGroup(activeGuest?.id, groupId, 'Manual unlink by user');
    
    if (success) {
      // Refresh the summary
      const summary = await getGuestGroupSummary(activeGuest?.id);
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
        <button
          onClick={() => setCrmTab('preregistration')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 hover:bg-slate-50 transition-all duration-200 ${crmTab === 'preregistration' ? 'border-b-indigo-600 text-indigo-700 font-semibold bg-indigo-50/50' : 'border-b-transparent hover:text-slate-700'}`}
        >
          <ClipboardList size={14} /> Pre-Registration
          {preRegistrations.filter(p => p.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold">{preRegistrations.filter(p => p.status === 'pending').length}</span>
          )}
        </button>
      </div>

      {/* INDIVIDUAL PROFILES TAB */}
      {crmTab === 'individual' && (
        <>
      {/* 📊 CRM SEGMENTATION & DEMOGRAPHICS DIAGRAM PANEL */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-2xl border border-slate-700/50 space-y-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
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
              <span className="text-xl font-bold font-sans text-indigo-400">{vipPercentage}% Share</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Section 1: Guest Tiers breakdown (5 columns) */}
          <div className="lg:col-span-5 space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
                <Award size={14} className="text-indigo-400" /> Account Tier Distributions
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
                placeholder="Search by name, email, phone, passport, TIN, nationality..."
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
          {guestsLoading && guests.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-xs text-slate-400 font-mono italic bg-slate-50 rounded-xl border border-slate-100">
              Loading guest profiles...
            </div>
          ) : guestsError && guests.length === 0 ? (
            <div className="col-span-3 p-8 text-center bg-rose-50 rounded-xl border border-rose-200">
              <AlertTriangle size={20} className="mx-auto text-rose-400 mb-2" />
              <p className="text-xs text-rose-700 font-sans font-semibold">Failed to load guests</p>
              <p className="text-[10px] text-rose-500 font-mono mt-1">{guestsError}</p>
            </div>
          ) : filteredGuests.length === 0 ? (
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
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${g.status === 'VIP' ? 'bg-indigo-100 text-indigo-700' : g.status === 'Loyalty Member' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {g.status.replace(' Member', '')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400 font-mono block">Email</span><span className="font-semibold text-slate-700 truncate">{g.email}</span></div>
                  <div><span className="text-slate-400 font-mono block">Phone</span><span className="font-semibold text-slate-700">{g.phone || 'N/A'}</span></div>
                  {g.nationality && (
                    <div><span className="text-slate-400 font-mono block">Nationality</span><span className="font-semibold text-slate-700">{g.nationality}</span></div>
                  )}
                  {g.passportNumber && (
                    <div><span className="text-slate-400 font-mono block">Passport</span><span className="font-semibold text-slate-700 truncate">{g.passportNumber}</span></div>
                  )}
                  <div className="col-span-2">
                    <button
                      onClick={() => setLoyaltyHistoryGuestId(loyaltyHistoryGuestId === g.id ? null : g.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/50 hover:shadow-sm transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Award size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Loyalty Points</span>
                      </span>
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{g.loyaltyPoints.toLocaleString()} pts</span>
                    </button>
                    {loyaltyHistoryGuestId === g.id && (
                      <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 max-h-40 overflow-y-auto">
                        {loyaltyLoading ? (
                          <div className="text-[10px] text-slate-400 text-center py-2">Loading...</div>
                        ) : loyaltyTransactions.length === 0 ? (
                          <div className="text-[10px] text-slate-400 text-center py-2">No transactions yet</div>
                        ) : (
                          <div className="space-y-1">
                            {loyaltyTransactions.slice(0, 10).map((tx: any) => (
                              <div key={tx.id} className="flex items-center justify-between text-[10px] font-mono py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${tx.transaction_type === 'accrual' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : tx.transaction_type === 'redemption' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                    {tx.transaction_type}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{tx.description || '-'}</span>
                                </div>
                                <span className={`font-bold ${tx.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {tx.points > 0 ? '+' : ''}{tx.points}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {g.parentGroupId && (
                    <div className="col-span-2"><span className="text-slate-400 font-mono block">Group</span><span className="font-semibold text-slate-700">{g.parentGroupId}</span></div>
                  )}
                  {g.parentCorporateId && (
                    <div className="col-span-2"><span className="text-slate-400 font-mono block">Corporate</span><span className="font-semibold text-slate-700">{corporateAccounts.find(c => c.id === g.parentCorporateId)?.companyName || g.parentCorporateId}</span></div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setSelectedGuestId(g.id); setShowGuestDetail(true); push({ id: 'crm-guest-detail', name: 'CRM Guest Detail', restore: () => {} }); }} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><User size={12} /> View Profile</button>
                  <button onClick={() => openFolioRouting('guest', g.id)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><Receipt size={12} /> Folio Routing</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>

      {/* CREATE NEW GUEST PROFILE SLIDEOVER MODAL */}
      <ModalSystem
        isOpen={showAddGuest}
        onClose={() => { setShowAddGuest(false); resetNewGuestForm(); }}
        title="Onboard Premium CRM Profile"
        variant="form"
        size="sm"
        showFooter={false}
      >
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
      </ModalSystem>
        </>
      )}

      {/* PROFILE MATCH MODAL */}
      <ModalSystem
        isOpen={showProfileMatch && !!matchCandidate}
        onClose={() => setShowProfileMatch(false)}
        title="Potential Duplicate Profile"
        icon={<AlertTriangle size={20} className="text-amber-500" />}
        variant="info"
        size="sm"
        showFooter={true}
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setShowProfileMatch(false); handleAddNewGuest(); }} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200">Create New Anyway</button>
            <button onClick={() => { if (matchCandidate) { setSelectedGuestId(matchCandidate.id); setShowProfileMatch(false); setShowAddGuest(false); resetNewGuestForm(); } }} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-semibold rounded-lg transition-all duration-200 shadow-md shadow-indigo-200">Use Existing Profile</button>
          </div>
        }
      >
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-xs text-slate-700 font-sans">A matching profile was found based on:</p>
              <ul className="text-xs text-slate-600 font-sans list-disc list-inside space-y-1">
                <li>Passport number (exact match), or</li>
                <li>Last name AND email match, or</li>
                <li>Full name (exact match)</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">{matchCandidate?.name?.split(' ').map(n => n[0]).join('') || '?'}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{matchCandidate?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{matchCandidate?.email || ''}</div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded border ${getLoyaltyBadge(matchCandidate?.status)}`}>{matchCandidate?.status || 'Guest'}</span>
                {matchCandidate?.nationality && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded">{matchCandidate.nationality}</span>}
              </div>
            </div>
      </ModalSystem>

      {/* FOLIO ROUTING MODAL */}
      <ModalSystem
        isOpen={showFolioRouting && !!folioRoutingTarget}
        onClose={() => setShowFolioRouting(false)}
        title="Configure Folio Routing"
        icon={<Receipt size={20} className="text-indigo-500" />}
        variant="form"
        size="md"
        showFooter={false}
      >
            <div className="">
              <p className="text-xs text-slate-600 font-sans mb-4">Configure billing routing for {folioRoutingTarget?.type === 'guest' ? 'this guest' : folioRoutingTarget?.type === 'group' ? 'all guests in this group' : 'all guests in this corporate account'}:</p>
              
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
      </ModalSystem>

      {/* GUEST DETAIL MODAL */}
      <ModalSystem
        isOpen={showGuestDetail && !!activeGuest}
        onClose={handleCloseGuestDetail}
        title={activeGuest?.name ?? ''}
        subtitle={`ID: ${activeGuest?.id ?? ''}`}
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="flex-1 overflow-y-auto">
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
                        <span className="font-medium text-slate-800">{activeGuest?.email || 'Not provided'}</span>
                      </div>
                      <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                        <Phone size={14} className="text-indigo-500" />
                        <span className="font-medium text-slate-800">{activeGuest?.phone || 'Not provided'}</span>
                      </div>
                      {activeGuest?.nationality && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Globe size={14} className="text-indigo-500" />
                          <span>Nationality: <strong className="font-bold text-slate-800">{activeGuest?.nationality}</strong></span>
                        </div>
                      )}
                      {activeGuest?.passportNumber && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <ShieldCheck size={14} className="text-indigo-500" />
                          <span className="font-mono font-semibold text-slate-800">Passport: {activeGuest?.passportNumber}</span>
                        </div>
                      )}
                      {activeGuest?.dateOfBirth && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Calendar size={14} className="text-indigo-500" />
                          <span className="font-mono font-semibold text-slate-800">DOB: {activeGuest?.dateOfBirth}</span>
                        </div>
                      )}
                      {activeGuest?.tin && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold border border-indigo-200">TIN</span>
                          <span className="font-mono font-semibold text-slate-800">{activeGuest?.tin}</span>
                        </div>
                      )}
                      {activeGuest?.vatNo && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold border border-indigo-200">VAT</span>
                          <span className="font-mono font-semibold text-slate-800">{activeGuest?.vatNo} {activeGuest?.vatDate && `(Reg. ${activeGuest?.vatDate})`}</span>
                        </div>
                      )}
                      {activeGuest?.parentGroupId && (
                        <div className="flex gap-2.5 items-center p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                          <Users2 size={14} className="text-indigo-600" />
                          <span className="font-mono font-semibold">Group: <strong className="text-slate-800">{activeGuest?.parentGroupId}</strong></span>
                          {activeGuest?.isPrimaryContact && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                      )}
                      {activeGuest?.parentCorporateId && (
                        <div className="flex gap-2.5 items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <Building2 size={14} className="text-emerald-600" />
                          <span className="font-mono font-semibold">Corporate: <strong className="text-slate-800">{corporateAccounts.find(c => c.id === activeGuest?.parentCorporateId)?.companyName || activeGuest?.parentCorporateId}</strong></span>
                          {activeGuest?.isPrimaryContact && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                      )}
                      <div className="flex gap-2.5 items-center p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <Wallet size={14} className="text-indigo-600" />
                        <span className="font-mono font-semibold text-slate-800">Total Spend: ${activeGuest?.totalSpend?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Document Display */}
                {activeGuest?.identificationDoc && activeGuest?.identificationDoc?.isUploaded ? (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <h4 className="text-xs font-mono uppercase text-emerald-700 tracking-wider font-bold">ID Document on File</h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-700 font-sans">
                      <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                        <span className="font-mono text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase font-bold border border-emerald-200">
                          {activeGuest?.identificationDoc?.type}
                        </span>
                        <span className="font-mono font-semibold text-slate-800">{activeGuest?.identificationDoc?.number}</span>
                      </div>
                      {activeGuest?.identificationDoc?.expiryDate && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Calendar size={14} className="text-emerald-600" />
                          <span className="font-mono font-semibold text-slate-800">Expires: {activeGuest?.identificationDoc?.expiryDate}</span>
                        </div>
                      )}
                      {activeGuest?.identificationDoc?.issuingCountry && (
                        <div className="flex gap-2.5 items-center p-2 bg-white rounded-lg">
                          <Globe size={14} className="text-emerald-600" />
                          <span className="font-mono font-semibold text-slate-800">Issuing Country: {activeGuest?.identificationDoc?.issuingCountry}</span>
                        </div>
                      )}
                      {/* ID Card Images */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {activeGuest?.identificationDoc?.frontImageUrl && (
                          <div className="relative group">
                            <img 
                              src={activeGuest?.identificationDoc?.frontImageUrl} 
                              alt="ID Card Front" 
                              className="w-full h-32 object-cover rounded-lg border border-emerald-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(activeGuest?.identificationDoc?.frontImageUrl, '_blank')}
                            />
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">Front</div>
                          </div>
                        )}
                        {activeGuest?.identificationDoc?.backImageUrl && (
                          <div className="relative group">
                            <img 
                              src={activeGuest?.identificationDoc?.backImageUrl} 
                              alt="ID Card Back" 
                              className="w-full h-32 object-cover rounded-lg border border-emerald-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(activeGuest?.identificationDoc?.backImageUrl, '_blank')}
                            />
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">Back</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-2xs text-emerald-600 mt-2">
                        <CheckCircle2 size={10} className="fill-emerald-600" />
                        <span>Verified on {new Date(activeGuest?.identificationDoc?.uploadedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ID Document Upload */
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera size={14} className="text-amber-600" />
                      <h4 className="text-xs font-mono uppercase text-amber-700 tracking-wider font-bold">ID Document Required</h4>
                    </div>
                    <p className="text-2xs text-amber-600 font-sans mb-3">No ID document has been uploaded for this guest. Please upload a passport or national ID.</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={existingGuestIdScannerRef}
                      onChange={handleExistingGuestIDUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => existingGuestIdScannerRef.current?.click()}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Camera size={12} /> Upload ID Document
                    </button>
                  </div>
                )}

                {/* Check-In Button - Only shown when pending check-in */}
                {pendingCheckIn && pendingCheckInResData && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck size={14} className="text-emerald-600" />
                      <h4 className="text-xs font-mono uppercase text-emerald-700 tracking-wider font-bold">Complete Check-In</h4>
                    </div>
                    <div className="mb-3 space-y-1">
                      <p className="text-2xs text-emerald-700 font-sans">Reservation ID: {pendingCheckInResData.resId}</p>
                      <p className="text-2xs text-emerald-700 font-sans">Room: {pendingCheckInResData.rm}</p>
                      <p className="text-2xs text-emerald-700 font-sans">Check-in Date: {pendingCheckInResData.date}</p>
                    </div>
                    <button
                      onClick={handleVerifyAndCompleteCheckIn}
                      disabled={!idUploaded}
                      className={`w-full py-2.5 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm ${
                        idUploaded
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <UserCheck size={12} /> {idUploaded ? 'Complete Check-In' : 'Upload ID First'}
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
                  ) : activeGuest?.parentGroupId ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold">Linked Group</span>
                          {activeGuest?.isPrimaryContact && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                              <Star size={10} className="fill-amber-500" /> Primary Contact
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{activeGuest?.parentGroupId}</div>
                            <div className="text-2xs text-slate-500 font-mono mt-1">Tracked via guest profile parentGroupId</div>
                          </div>
                          <button
                            onClick={() => {
                              console.log('Navigate to group:', activeGuest?.parentGroupId);
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
                    <Bookmark size={12} className="text-indigo-500" />
                    Special Requests & Preferences
                  </h4>
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-orange-50 border border-indigo-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans italic shadow-sm">
                    "{activeGuest?.specialRequests || 'No special requests listed on file.'}"
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold flex items-center gap-1.5 mb-3">
                    <FileText size={12} className="text-indigo-500" />
                    Operational CRM Notes & Logs
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-2xs font-mono text-slate-600 h-32 overflow-y-auto whitespace-pre-line leading-normal shadow-inner">
                    {activeGuest?.notes || 'No current notes logged for checkout reviews.'}
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
                  <button onClick={() => openFolioRouting('guest', activeGuest?.id)} className="flex-1 px-3 py-2 bg-slate-100 font-sans hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><Receipt size={12} /> Folio Routing</button>
                  {activeGuest?.parentGroupId ? (
                    <button onClick={handleGroupCheckIn} className="flex-1 px-3 py-2 bg-emerald-50 font-sans hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><UserCheck size={12} /> Group Check-In</button>
                  ) : null}
                  {activeGuest?.parentGroupId || activeGuest?.parentCorporateId ? (
                    <button onClick={() => handleUnlinkGuest(activeGuest?.id)} className="flex-1 px-3 py-2 bg-rose-50 font-sans hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"><Unlink size={12} /> Unlink</button>
                  ) : (
                    <>
                      <select onChange={(e) => { if (e.target.value) { handleLinkGuestToGroup(activeGuest?.id, e.target.value); e.target.value = ''; } }} className="flex-1 px-3 py-2 bg-indigo-50 font-sans text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"><option value="">Link to Group</option>{groupBookings.map(gb => (<option key={gb.id} value={gb.id}>{gb.groupName}</option>))}</select>
                      <select onChange={(e) => { if (e.target.value) { handleLinkGuestToCorp(activeGuest?.id, e.target.value); e.target.value = ''; } }} className="flex-1 px-3 py-2 bg-emerald-50 font-sans text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"><option value="">Link to Corp</option>{corporateAccounts.map(c => (<option key={c.id} value={c.id}>{c.companyName}</option>))}</select>
                    </>
                  )}
                </div>
              </div>
            </div>
      </ModalSystem>

      {/* GROUP GUESTS VIEW MODAL */}
      <ModalSystem
        isOpen={showGroupGuests && !!selectedGroupForView}
        onClose={handleCloseGroupGuests}
        title={selectedGroupForView?.groupName ?? ''}
        subtitle={`Group Guests (${selectedGroupForView ? guests.filter(g => g.parentGroupId === selectedGroupForView?.id).length : 0})`}
        icon={<Users2 size={20} className="text-indigo-500" />}
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="flex-1 overflow-y-auto">
              {guests.filter(g => g.parentGroupId === selectedGroupForView?.id).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono italic bg-slate-50 rounded-xl border border-slate-100">
                  No guests linked to this group booking yet.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={async () => {
                        // Auto-create group profile if it doesn't exist
                        const existingGroup = groupBookings.find(g => g.id === selectedGroupForView?.id);
                        if (!existingGroup) {
                          await addGroupBooking({
                            groupName: selectedGroupForView?.groupName,
                            contactName: selectedGroupForView?.contactName,
                            contactEmail: selectedGroupForView?.contactEmail,
                            contactPhone: selectedGroupForView?.contactPhone || '',
                            roomTypeNeeded: 'Double',
                            roomCount: selectedGroupForView?.roomCount,
                            checkInDate: selectedGroupForView?.checkInDate,
                            checkOutDate: toISODate(new Date(new Date(selectedGroupForView?.checkInDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000)),
                            discountPercent: 0,
                            status: 'Confirmed'
                          });
                        }
                        
                        // Check in all reservations with the same group ID
                        const groupReservations = reservations.filter(r => r.bookingGroupId === selectedGroupForView?.id && r.status === 'Confirmed' && r.roomNumber);
                        for (const groupRes of groupReservations) {
                          // Auto-link guest to group profile (create if doesn't exist)
                          // Match by email, name, and parentGroupId to ensure unique guests per reservation
                          let guest = guests.find(g =>
                            g.email.toLowerCase() === groupRes.guestEmail.toLowerCase() &&
                            g.name.toLowerCase() === groupRes.guestName.toLowerCase() &&
                            g.parentGroupId === selectedGroupForView?.id
                          );
                          let guestId: string | undefined = guest?.id;
                          if (!guestId) {
                            // Create guest profile
                            guestId = addGuest({
                              name: groupRes.guestName,
                              lastName: groupRes.guestName.split(' ').pop() || groupRes.guestName,
                              email: groupRes.guestEmail,
                              phone: groupRes.guestPhone || '',
                              status: groupRes.guestStatus || 'Regular',
                              loyaltyPoints: 0,
                              specialRequests: '',
                              notes: `Auto-created from group booking: ${selectedGroupForView?.id} - Reservation: ${groupRes.id}`,
                              history: [],
                              totalSpend: 0,
                              parentGroupId: selectedGroupForView?.id,
                              isPrimaryContact: groupRes.guestName === selectedGroupForView?.contactName,
                              nationality: undefined,
                              tin: groupRes.guestTin,
                              vatNo: groupRes.guestVatNo,
                              vatDate: groupRes.guestVatDate,
                              passportNumber: undefined,
                              dateOfBirth: undefined
                            });
                          }

                          // Persist guestId before check-in so the trigger links the correct guest
                          if (guestId) {
                            updateReservation(groupRes.id, { guestId });
                          }

                          await checkInReservation(groupRes.id, groupRes.roomNumber!);
                        }
                        
                        onGroupOnboardSuccess?.({ 
                          groupName: selectedGroupForView?.groupName, 
                          contactName: selectedGroupForView?.contactName, 
                          contactEmail: selectedGroupForView?.contactEmail, 
                          contactPhone: selectedGroupForView?.contactPhone || '', 
                          groupId: selectedGroupForView?.id, 
                          roomCount: groupReservations.length, 
                          checkInDate: selectedGroupForView?.checkInDate 
                        });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-sans text-xs font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                    >
                      <UserCheck size={14} /> Check-In Entire Group
                    </button>
                  </div>
                  <div className="space-y-2">
                    {guests.filter(g => g.parentGroupId === selectedGroupForView?.id).map(guest => {
                      const roomingListEntry = selectedGroupForView?.roomingList?.find(rl => rl.guestId === guest.id);
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
                              onClick={() => {
                                setSelectedGuestId(guest.id);
                                setShowGroupGuests(false);
                                setShowGuestDetail(true);
                                if (selectedGroupForView) {
                                  const group = selectedGroupForView;
                                  push({
                                    id: `group-guests-${group.id}`,
                                    name: `Group Guests: ${group.groupName}`,
                                    restore: () => {
                                      setSelectedGroupForView(group);
                                      setShowGroupGuests(true);
                                    }
                                  });
                                }
                              }}
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
      </ModalSystem>

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
                    <button onClick={() => { setSelectedGroupForView(group); setShowGroupGuests(true); push({ id: 'crm-group-guests', name: 'CRM Group Guests', restore: () => {} }); }} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"><Users size={12} /> View Guests</button>
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
          <ModalSystem
            isOpen={showAddCorp}
            onClose={() => setShowAddCorp(false)}
            title="Establish Corporate Agreement"
            variant="form"
            size="sm"
            showFooter={false}
          >

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
          </ModalSystem>
        </div>
      )}

      {/* PRE-REGISTRATION TAB */}
      {crmTab === 'preregistration' && (
        <PreRegistrationPanel
          preRegistrations={preRegistrations}
          loading={preRegLoading}
          filter={preRegFilter}
          setFilter={setPreRegFilter}
          onImport={handleImportPreReg}
          onReview={handleReviewPreReg}
          importing={preRegImporting}
        />
      )}

      {/* LINK TO GROUP MODAL */}
      <ModalSystem
        isOpen={showLinkToGroup && !!activeGuest}
        onClose={() => setShowLinkToGroup(false)}
        title="Link Guest to Group"
        icon={<Link2 size={20} className="text-indigo-500" />}
        variant="form"
        size="md"
        showFooter={true}
        footer={
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
        }
      >
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500 font-mono">Guest</div>
                <div className="text-sm font-semibold text-slate-800">{activeGuest?.name}</div>
                <div className="text-2xs text-slate-400">{activeGuest?.email}</div>
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
      </ModalSystem>

      {/* CHECK-IN FORM MODAL */}
      <ModalSystem
        isOpen={showCheckInForm && !!activeGuest}
        onClose={() => { setShowCheckInForm(false); const target = pop(); target?.restore(); }}
        title={globalHotelSettings.checkin_form_hotel_name || 'SELEDA HOTEL'}
        subtitle={globalHotelSettings.checkin_form_title || 'Check-In Registration Form'}
        icon={<Building2 size={20} className="text-indigo-600" />}
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="p-6 space-y-6 print-area">
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 font-sans">Check-In Successful</h4>
                    <p className="text-xs text-emerald-600 font-sans">Guest has been successfully checked in to the hotel.</p>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-4 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" />
                  Guest Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Full Name</label>
                    <div className="text-sm font-semibold text-slate-800">{activeGuest?.name}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Email Address</label>
                    <div className="text-sm font-semibold text-slate-800 truncate">{activeGuest?.email}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Phone Number</label>
                    <div className="text-sm font-semibold text-slate-800">{activeGuest?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">ID Status</label>
                    <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Verified
                    </div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Guest Type</label>
                    <div className="text-sm font-semibold text-slate-800">{activeGuest?.status}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Nationality</label>
                    <div className="text-sm font-semibold text-slate-800">{activeGuest?.nationality || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Room Assignment */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-indigo-700 tracking-wider font-bold mb-4 flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-600" />
                  Room Assignment
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Room Number</label>
                    <div className="text-lg font-bold text-slate-800">{pendingCheckInResData?.rm || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Check-In Date</label>
                    <div className="text-sm font-bold text-slate-800">{pendingCheckInResData?.date || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Reservation ID</label>
                    <div className="text-sm font-bold text-slate-800">{pendingCheckInResData?.resId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" />
                  Terms & Conditions
                </h3>
                <div className="text-xs text-slate-600 space-y-2 font-sans whitespace-pre-line">
                  {globalHotelSettings.checkin_form_terms || '• Guest agrees to comply with all hotel rules and regulations.\n• Check-out time is 11:00 AM. Late check-out may incur additional charges.\n• The hotel is not responsible for lost or stolen items.\n• Payment for all charges is due upon check-out.\n• Cancellation policy applies as per reservation terms.'}
                </div>
              </div>

              {/* Signature Area */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-3 flex items-center gap-2">
                  <PenTool size={14} className="text-indigo-500" />
                  {globalHotelSettings.checkin_form_signature_label || 'Guest Signature'}
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 bg-slate-50">
                  <canvas
                    ref={signatureCanvasRef}
                    width={500}
                    height={150}
                    className="w-full bg-white rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-2xs text-slate-500 font-mono">{globalHotelSettings.checkin_form_signature_hint || 'Please sign above to confirm check-in'}</p>
                  <button
                    onClick={clearSignature}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all duration-200"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* Date and Staff */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <label className="text-2xs text-slate-500 font-mono block mb-1">Date</label>
                  <div className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <label className="text-2xs text-slate-500 font-mono block mb-1">Time</label>
                  <div className="text-sm font-semibold text-slate-800">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 no-print">
                <button
                  onClick={() => {
                    setShowCheckInForm(false);
                    const target = pop();
                    target?.restore();
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-sans text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <Printer size={16} /> Print Form
                </button>
              </div>
            </div>
      </ModalSystem>

      {/* GROUP CHECK-IN FORM MODAL */}
      <ModalSystem
        isOpen={showGroupCheckInForm && !!groupCheckInData}
        onClose={() => { setShowGroupCheckInForm(false); const target = pop(); target?.restore(); }}
        title={globalHotelSettings.checkin_form_hotel_name || 'SELEDA HOTEL'}
        subtitle="Group Check-In Registration Form"
        icon={<Users2 size={20} className="text-purple-600" />}
        variant="form"
        size="xl"
        showFooter={false}
      >
            <div className="p-6 space-y-6 print-area">
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 font-sans">Group Check-In Successful</h4>
                    <p className="text-xs text-emerald-600 font-sans">Group has been successfully checked in to the hotel.</p>
                  </div>
                </div>
              </div>

              {/* Group Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-4 flex items-center gap-2">
                  <Users2 size={14} className="text-purple-500" />
                  Group Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Group Name</label>
                    <div className="text-sm font-semibold text-slate-800">{groupCheckInData?.groupName}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Contact Person</label>
                    <div className="text-sm font-semibold text-slate-800">{groupCheckInData?.contactName}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Contact Email</label>
                    <div className="text-sm font-semibold text-slate-800 truncate">{groupCheckInData?.contactEmail}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Contact Phone</label>
                    <div className="text-sm font-semibold text-slate-800">{groupCheckInData?.contactPhone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Group Reservation ID</label>
                    <div className="text-sm font-semibold text-slate-800 font-mono">{groupCheckInData?.groupId || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 font-mono block mb-1">Check-In Date</label>
                    <div className="text-sm font-semibold text-slate-800">{groupCheckInData?.checkInDate}</div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-purple-500" />
                  Terms & Conditions
                </h3>
                <div className="text-xs text-slate-600 space-y-2 font-sans whitespace-pre-line">
                  {globalHotelSettings.group_checkin_form_terms || '• Group contact person agrees to comply with all hotel rules and regulations on behalf of all group members.\n• Check-out time is 11:00 AM. Late check-out may incur additional charges.\n• The hotel is not responsible for lost or stolen items.\n• Payment for all charges is due upon check-out.\n• Cancellation policy applies as per reservation terms.\n• Group leader is responsible for all charges incurred by group members.'}
                </div>
              </div>

              {/* Signature Area */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold mb-3 flex items-center gap-2">
                  <PenTool size={14} className="text-purple-500" />
                  {globalHotelSettings.group_checkin_form_signature_label || 'Group Leader Signature'}
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 bg-slate-50">
                  <canvas
                    ref={signatureCanvasRef}
                    width={500}
                    height={150}
                    className="w-full bg-white rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-2xs text-slate-500 font-mono">{globalHotelSettings.group_checkin_form_signature_hint || 'Please sign above to confirm group check-in'}</p>
                  <button
                    onClick={clearSignature}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all duration-200"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* Date and Staff */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <label className="text-2xs text-slate-500 font-mono block mb-1">Date</label>
                  <div className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <label className="text-2xs text-slate-500 font-mono block mb-1">Time</label>
                  <div className="text-sm font-semibold text-slate-800">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 no-print">
                <button
                  onClick={() => {
                    setShowGroupCheckInForm(false);
                    const target = pop();
                    target?.restore();
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-sans text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                  <Printer size={16} /> Print Form
                </button>
              </div>
            </div>
      </ModalSystem>

    </div>
  );
}
