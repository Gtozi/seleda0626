/**
 * Front Office Check-Out Module
 * Settlement and folio closure
 *
 * Fully DB-integrated: fetches checked-in reservations + their folios from
 * Supabase via checkOutService, supports search/filter, per-step checklist
 * toggling, settlement/refund payments, guest feedback, folio closure,
 * invoice printing/download, and check-out completion.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LogOut,
  FileText,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  RefreshCw,
  Filter,
  Receipt,
  MessageSquare,
  Download,
  Star,
  BedDouble,
  Calendar,
  X,
  Search,
  Loader2,
  AlertCircle,
  Users,
  UserCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  getPendingCheckOuts,
  searchCheckOuts,
  updateCheckOutStep,
  getFolioDetails,
  processSettlement,
  processRefund,
  submitGuestFeedback,
  getRecentFeedback,
  closeFolio,
  completeCheckOut,
  toggleLateCheckOut,
  getReservationForInvoice,
  printInvoice,
  printGroupInvoice,
  downloadInvoiceCsv,
  type CheckOutRequest,
  type FolioDetails,
} from '../../../services/checkOutService';
import { supabase } from '../../../lib/supabase';

type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_payment';

interface FeedbackEntry {
  id: string;
  guest_name: string;
  rating: number;
  comment: string | null;
  feedback_date: string;
  reservation_id: string | null;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_payment', label: 'Mobile Payment' },
];

interface CheckOutProps {
  onNavigateToFolio?: (reservationId: string) => void;
}

const CheckOut = ({ onNavigateToFolio }: CheckOutProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedReservationId = searchParams.get('reservationId') || undefined;
  const [checkOuts, setCheckOuts] = useState<CheckOutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modals
  const [invoiceModalCheckOut, setInvoiceModalCheckOut] = useState<CheckOutRequest | null>(null);
  const [folioDetails, setFolioDetails] = useState<FolioDetails | null>(null);
  const [folioLoading, setFolioLoading] = useState(false);

  const [settlementCheckOut, setSettlementCheckOut] = useState<CheckOutRequest | null>(null);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('credit_card');
  const [settlementReference, setSettlementReference] = useState('');

  const [refundCheckOut, setRefundCheckOut] = useState<CheckOutRequest | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('credit_card');
  const [refundReference, setRefundReference] = useState('');

  const [feedbackCheckOut, setFeedbackCheckOut] = useState<CheckOutRequest | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [feedbackListLoading, setFeedbackListLoading] = useState(false);

  // Group check-out state
  const selectedGroupId = searchParams.get('groupId') || undefined;
  const selectedGroupName = searchParams.get('groupName') || undefined;
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [groupCheckOuts, setGroupCheckOuts] = useState<CheckOutRequest[]>([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const [groupActionLoading, setGroupActionLoading] = useState(false);

  // Fetch check-outs from database
  const fetchCheckOuts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: CheckOutRequest[];
      if (searchTerm.trim()) {
        data = await searchCheckOuts(searchTerm.trim());
      } else {
        data = await getPendingCheckOuts();
      }

      // If a specific reservation is selected (e.g. navigated from Front Desk), filter for it
      if (selectedReservationId) {
        data = data.filter((co) => co.reservationId === selectedReservationId);
      }

      if (statusFilter !== 'all') {
        data = data.filter((co) => co.status === statusFilter);
      }

      setCheckOuts(data);
    } catch (err) {
      console.error('Error fetching check-outs:', err);
      setError('Failed to load check-outs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, selectedReservationId]);

  useEffect(() => {
    fetchCheckOuts();
  }, [fetchCheckOuts, refreshTrigger]);

  // Fetch group bookings with checked-in reservations (eligible for group check-out)
  useEffect(() => {
    const fetchGroupCheckOuts = async () => {
      try {
        // Fetch group bookings that are checked in
        const { data: groups, error: groupsError } = await supabase
          .from('group_bookings')
          .select('*')
          .in('status', ['CheckedIn', 'Confirmed']);
        if (groupsError) throw groupsError;

        // Fetch checked-in reservations linked to groups
        const { data: groupRes, error: resError } = await supabase
          .from('reservations')
          .select(`
            id, guest_name, guest_email, guest_phone, room_type, room_number,
            check_in_date, check_out_date, status, total_amount, deposit_amount,
            late_check_out_requested, group_booking_id, booking_group_id, notes,
            adults, children
          `)
          .in('status', ['CheckedIn', 'CheckedOut']);
        if (resError) throw resError;

        setGroupBookings(groups || []);

        // Build CheckOutRequest for each group member (reuse the service's build logic via getPendingCheckOuts)
        // We filter the already-fetched checkOuts by group membership
        const groupCheckOutList = (groupRes || []).map((res: any) => {
          const matching = checkOuts.find((co) => co.reservationId === res.id);
          if (matching) return matching;
          // Fallback: construct a minimal CheckOutRequest
          return {
            id: `CO-${res.id}`,
            guestName: res.guest_name,
            reservationId: res.id,
            roomNumber: res.room_number || 'Unassigned',
            roomType: res.room_type,
            checkInDate: res.check_in_date,
            checkOutDate: res.check_out_date,
            checkOutTime: '11:00',
            nights: Math.max(1, Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24))),
            status: res.status === 'CheckedOut' ? 'completed' as const : 'pending' as const,
            folioId: null,
            folioBalance: 0,
            balance: Math.max(0, Number(res.total_amount || 0) - Number(res.deposit_amount || 0)),
            lateCheckoutRequested: Boolean(res.late_check_out_requested),
            invoiceReviewed: false,
            settlementProcessed: false,
            refundProcessed: false,
            feedbackCollected: false,
            folioClosed: false,
            groupBookingId: res.group_booking_id || null,
            bookingGroupId: res.booking_group_id || null,
          } as CheckOutRequest;
        });
        setGroupCheckOuts(groupCheckOutList);

        // Auto-expand the group selected via URL param
        if (selectedGroupId) {
          setExpandedGroupIds((prev) => new Set(prev).add(selectedGroupId));
        }
      } catch (error) {
        console.error('Error fetching group check-outs:', error);
      }
    };
    fetchGroupCheckOuts();
  }, [refreshTrigger, selectedGroupId, checkOuts]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const checkOutSteps = [
    { id: 'invoice', label: 'Invoice Review', icon: FileText, description: 'Review folio charges' },
    { id: 'settlement', label: 'Settlement', icon: CreditCard, description: 'Process payment' },
    { id: 'refund', label: 'Refund Processing', icon: DollarSign, description: 'Handle refunds' },
    { id: 'feedback', label: 'Feedback Collection', icon: MessageSquare, description: 'Guest feedback' },
    { id: 'folio', label: 'Folio Closure', icon: Receipt, description: 'Close folio' },
  ] as const;

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleSearch = (value: string) => setSearchTerm(value);

  // Local optimistic update helper for a single check-out field
  const updateLocalStep = (reservationId: string, step: keyof CheckOutRequest, value: unknown) => {
    setCheckOuts((prev) =>
      prev.map((co) =>
        co.reservationId === reservationId ? { ...co, [step]: value } : co
      )
    );
  };

  // Toggle a checklist step
  const handleStepToggle = async (checkOut: CheckOutRequest, step: keyof CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    const newValue = !checkOut[step];
    const success = await updateCheckOutStep(checkOut.reservationId, step as any, newValue);
    if (success) {
      updateLocalStep(checkOut.reservationId, step, newValue as boolean);
    } else {
      alert('Failed to update step. Please try again.');
    }
    setBusyId(null);
  };

  // ── Invoice Review ──────────────────────────────────────────────────────
  const handleReviewInvoice = async (checkOut: CheckOutRequest) => {
    setInvoiceModalCheckOut(checkOut);
    setFolioLoading(true);
    setFolioDetails(null);
    try {
      const details = await getFolioDetails(checkOut.reservationId);
      setFolioDetails(details);
      // Mark invoice reviewed step if not already
      if (!checkOut.invoiceReviewed) {
        const ok = await updateCheckOutStep(checkOut.reservationId, 'invoiceReviewed', true);
        if (ok) updateLocalStep(checkOut.reservationId, 'invoiceReviewed', true);
      }
    } catch (err) {
      console.error('Error loading folio details:', err);
      alert('Failed to load folio details.');
    } finally {
      setFolioLoading(false);
    }
  };

  // ── Settlement ──────────────────────────────────────────────────────────
  const openSettlementModal = (checkOut: CheckOutRequest) => {
    // If there's an open folio, navigate to folio-billing instead of opening modal
    if (checkOut.folioId && onNavigateToFolio) {
      onNavigateToFolio(checkOut.reservationId);
      return;
    }
    // Fallback to existing modal behavior
    setSettlementCheckOut(checkOut);
    setSettlementAmount(checkOut.balance > 0 ? checkOut.balance : 0);
    setSettlementMethod('credit_card');
    setSettlementReference('');
  };

  const handleProcessSettlement = async () => {
    if (!settlementCheckOut) return;
    if (settlementAmount <= 0) {
      alert('Settlement amount must be greater than zero.');
      return;
    }
    setBusyId(settlementCheckOut.reservationId);
    const ok = await processSettlement(
      settlementCheckOut.reservationId,
      settlementAmount,
      settlementMethod,
      settlementReference
    );
    if (ok) {
      const stepOk = await updateCheckOutStep(settlementCheckOut.reservationId, 'settlementProcessed', true);
      if (stepOk) {
        updateLocalStep(settlementCheckOut.reservationId, 'settlementProcessed', true);
        updateLocalStep(settlementCheckOut.reservationId, 'balance', Math.max(0, settlementCheckOut.balance - settlementAmount));
      }
      setSettlementCheckOut(null);
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert('Failed to process settlement. Please try again.');
    }
    setBusyId(null);
  };

  // ── Refund ──────────────────────────────────────────────────────────────
  const openRefundModal = (checkOut: CheckOutRequest) => {
    setRefundCheckOut(checkOut);
    setRefundAmount(0);
    setRefundMethod('credit_card');
    setRefundReference('');
  };

  const handleProcessRefund = async () => {
    if (!refundCheckOut) return;
    if (refundAmount <= 0) {
      alert('Refund amount must be greater than zero.');
      return;
    }
    setBusyId(refundCheckOut.reservationId);
    const ok = await processRefund(
      refundCheckOut.reservationId,
      refundAmount,
      refundMethod,
      refundReference
    );
    if (ok) {
      const stepOk = await updateCheckOutStep(refundCheckOut.reservationId, 'refundProcessed', true);
      if (stepOk) updateLocalStep(refundCheckOut.reservationId, 'refundProcessed', true);
      setRefundCheckOut(null);
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert('Failed to process refund. Please try again.');
    }
    setBusyId(null);
  };

  // ── Feedback ────────────────────────────────────────────────────────────
  const openFeedbackModal = (checkOut: CheckOutRequest) => {
    setFeedbackCheckOut(checkOut);
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackCheckOut) return;
    if (feedbackRating < 1 || feedbackRating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }
    setBusyId(feedbackCheckOut.reservationId);
    const ok = await submitGuestFeedback(
      feedbackCheckOut.reservationId,
      feedbackCheckOut.guestName,
      feedbackRating,
      feedbackComment
    );
    if (ok) {
      const stepOk = await updateCheckOutStep(feedbackCheckOut.reservationId, 'feedbackCollected', true);
      if (stepOk) updateLocalStep(feedbackCheckOut.reservationId, 'feedbackCollected', true);
      setFeedbackCheckOut(null);
    } else {
      alert('Failed to submit feedback. Please try again.');
    }
    setBusyId(null);
  };

  // ── Folio Closure ───────────────────────────────────────────────────────
  const handleCloseFolio = async (checkOut: CheckOutRequest) => {
    if (!checkOut.folioId) {
      alert('No folio exists for this reservation. Nothing to close.');
      return;
    }
    if (!checkOut.invoiceReviewed || !checkOut.settlementProcessed) {
      alert('Please complete invoice review and settlement before closing the folio.');
      return;
    }
    if (!confirm('Close this folio? This action finalizes the guest account.')) return;
    setBusyId(checkOut.reservationId);
    const ok = await closeFolio(checkOut.reservationId);
    if (ok) {
      const stepOk = await updateCheckOutStep(checkOut.reservationId, 'folioClosed', true);
      if (stepOk) updateLocalStep(checkOut.reservationId, 'folioClosed', true);
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert('Failed to close folio. Please try again.');
    }
    setBusyId(null);
  };

  // ── Complete Check-Out ──────────────────────────────────────────────────
  const handleCompleteCheckOut = async (checkOut: CheckOutRequest) => {
    const allDone =
      checkOut.invoiceReviewed &&
      checkOut.settlementProcessed &&
      checkOut.refundProcessed &&
      checkOut.feedbackCollected &&
      checkOut.folioClosed;
    if (!allDone) {
      alert('All check-out steps must be completed before finishing.');
      return;
    }
    if (!confirm(`Complete check-out for ${checkOut.guestName}? This will mark the reservation as checked out.`)) return;
    setBusyId(checkOut.reservationId);
    const ok = await completeCheckOut(checkOut.reservationId);
    if (ok) {
      setCheckOuts((prev) =>
        prev.map((co) =>
          co.reservationId === checkOut.reservationId ? { ...co, status: 'completed' } : co
        )
      );
      alert('Check-out completed successfully!');
    } else {
      alert('Failed to complete check-out. Please try again.');
    }
    setBusyId(null);
  };

  // ── Express Check-Out (zero balance) ────────────────────────────────────
  const handleExpressCheckOut = async (checkOut: CheckOutRequest) => {
    if (checkOut.balance > 0) {
      alert('Express check-out is only available for guests with a zero balance.');
      return;
    }
    if (!confirm(`Process express check-out for ${checkOut.guestName}?`)) return;
    setBusyId(checkOut.reservationId);
    // Mark all required steps
    const steps: (keyof CheckOutRequest)[] = [
      'invoiceReviewed',
      'settlementProcessed',
      'refundProcessed',
      'feedbackCollected',
      'folioClosed',
    ];
    for (const step of steps) {
      if (!(checkOut as any)[step]) {
        await updateCheckOutStep(checkOut.reservationId, step as any, true);
        updateLocalStep(checkOut.reservationId, step, true);
      }
    }
    if (checkOut.folioId) {
      await closeFolio(checkOut.reservationId);
    }
    const ok = await completeCheckOut(checkOut.reservationId);
    if (ok) {
      setCheckOuts((prev) =>
        prev.map((co) =>
          co.reservationId === checkOut.reservationId ? { ...co, status: 'completed' } : co
        )
      );
      alert('Express check-out completed successfully!');
    } else {
      alert('Failed to complete express check-out.');
    }
    setBusyId(null);
  };

  // ── Late Check-Out ──────────────────────────────────────────────────────
  const handleToggleLateCheckOut = async (checkOut: CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    const newValue = !checkOut.lateCheckoutRequested;
    const ok = await toggleLateCheckOut(checkOut.reservationId, newValue);
    if (ok) {
      updateLocalStep(checkOut.reservationId, 'lateCheckoutRequested', newValue);
    } else {
      alert('Failed to update late check-out request.');
    }
    setBusyId(null);
  };

  // ── Print / Download ────────────────────────────────────────────────────
  const handlePrintInvoice = async (checkOut: CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    try {
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(checkOut.reservationId),
        getFolioDetails(checkOut.reservationId),
      ]);
      if (reservation) {
        printInvoice(reservation, details);
      } else {
        alert('Failed to load reservation details for printing');
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadInvoice = async (checkOut: CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    try {
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(checkOut.reservationId),
        getFolioDetails(checkOut.reservationId),
      ]);
      if (reservation) {
        downloadInvoiceCsv(reservation, details);
      } else {
        alert('Failed to load reservation details for download');
      }
    } finally {
      setBusyId(null);
    }
  };

  // ── Feedback list (Quick Action) ────────────────────────────────────────
  const handleViewFeedback = async () => {
    setShowFeedbackList(true);
    setFeedbackListLoading(true);
    try {
      const list = await getRecentFeedback(10);
      setFeedbackList(list as FeedbackEntry[]);
    } finally {
      setFeedbackListLoading(false);
    }
  };

  // ── Group check-out handlers ─────────────────────────────────────────────
  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Update a group member's step locally
  const updateGroupMemberLocal = (reservationId: string, step: keyof CheckOutRequest, value: unknown) => {
    setGroupCheckOuts((prev) =>
      prev.map((co) =>
        co.reservationId === reservationId ? { ...co, [step]: value } : co
      )
    );
  };

  // Toggle a checklist step for a group member
  const handleGroupMemberStepToggle = async (checkOut: CheckOutRequest, step: keyof CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    const newValue = !checkOut[step];
    const success = await updateCheckOutStep(checkOut.reservationId, step as any, newValue);
    if (success) {
      updateGroupMemberLocal(checkOut.reservationId, step, newValue);
    } else {
      alert('Failed to update step. Please try again.');
    }
    setBusyId(null);
  };

  // Review invoice for a group member
  const handleGroupMemberReviewInvoice = async (checkOut: CheckOutRequest) => {
    setInvoiceModalCheckOut(checkOut);
    setFolioLoading(true);
    setFolioDetails(null);
    try {
      const details = await getFolioDetails(checkOut.reservationId);
      setFolioDetails(details);
      if (!checkOut.invoiceReviewed) {
        const ok = await updateCheckOutStep(checkOut.reservationId, 'invoiceReviewed', true);
        if (ok) updateGroupMemberLocal(checkOut.reservationId, 'invoiceReviewed', true);
      }
    } catch (err) {
      console.error('Error loading folio details:', err);
      alert('Failed to load folio details.');
    } finally {
      setFolioLoading(false);
    }
  };

  // Settlement for a group member (opens same modal)
  const handleGroupMemberSettlement = (checkOut: CheckOutRequest) => {
    openSettlementModal(checkOut);
  };

  // Complete check-out for a single group member
  const handleGroupMemberCompleteCheckOut = async (checkOut: CheckOutRequest) => {
    const allDone =
      checkOut.invoiceReviewed &&
      checkOut.settlementProcessed &&
      checkOut.refundProcessed &&
      checkOut.feedbackCollected &&
      checkOut.folioClosed;
    if (!allDone) {
      alert('All check-out steps must be completed before finishing.');
      return;
    }
    if (!confirm(`Complete check-out for ${checkOut.guestName}?`)) return;
    setBusyId(checkOut.reservationId);
    const ok = await completeCheckOut(checkOut.reservationId);
    if (ok) {
      updateGroupMemberLocal(checkOut.reservationId, 'status', 'completed');
      alert('Check-out completed successfully!');
    } else {
      alert('Failed to complete check-out. Please try again.');
    }
    setBusyId(null);
  };

  // Express check-out for a single group member
  const handleGroupMemberExpressCheckOut = async (checkOut: CheckOutRequest) => {
    if (checkOut.balance > 0) {
      alert('Express check-out is only available for guests with a zero balance.');
      return;
    }
    if (!confirm(`Process express check-out for ${checkOut.guestName}?`)) return;
    setBusyId(checkOut.reservationId);
    const steps: (keyof CheckOutRequest)[] = ['invoiceReviewed', 'settlementProcessed', 'refundProcessed', 'feedbackCollected', 'folioClosed'];
    for (const step of steps) {
      if (!(checkOut as any)[step]) {
        await updateCheckOutStep(checkOut.reservationId, step as any, true);
        updateGroupMemberLocal(checkOut.reservationId, step, true);
      }
    }
    if (checkOut.folioId) {
      await closeFolio(checkOut.reservationId);
    }
    const ok = await completeCheckOut(checkOut.reservationId);
    if (ok) {
      updateGroupMemberLocal(checkOut.reservationId, 'status', 'completed');
      alert('Express check-out completed successfully!');
    } else {
      alert('Failed to complete express check-out.');
    }
    setBusyId(null);
  };

  // Print invoice for a single group member
  const handleGroupMemberPrintInvoice = async (checkOut: CheckOutRequest) => {
    setBusyId(checkOut.reservationId);
    try {
      const [reservation, details] = await Promise.all([
        getReservationForInvoice(checkOut.reservationId),
        getFolioDetails(checkOut.reservationId),
      ]);
      if (reservation) {
        printInvoice(reservation, details);
      } else {
        alert('Failed to load reservation details for printing');
      }
    } finally {
      setBusyId(null);
    }
  };

  // ── Group-level batch handlers ───────────────────────────────────────────

  // Close folios for all group members
  const handleGroupCloseFoliosAll = async (groupMembers: CheckOutRequest[]) => {
    setGroupActionLoading(true);
    for (const co of groupMembers) {
      if (!co.folioClosed && co.folioId) {
        const ok = await closeFolio(co.reservationId);
        if (ok) {
          await updateCheckOutStep(co.reservationId, 'folioClosed', true);
          updateGroupMemberLocal(co.reservationId, 'folioClosed', true);
        }
      }
    }
    setGroupActionLoading(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Complete check-out for all group members
  const handleGroupCompleteCheckOutAll = async (group: any, groupMembers: CheckOutRequest[]) => {
    const eligible = groupMembers.filter((co) =>
      co.invoiceReviewed && co.settlementProcessed && co.refundProcessed && co.feedbackCollected && co.folioClosed
    );
    if (eligible.length === 0) {
      alert('No members have completed all check-out steps yet.');
      return;
    }
    if (!confirm(`Complete check-out for all ${eligible.length} eligible member(s) in group "${group.group_name || group.name || group.id}"?`)) return;
    setGroupActionLoading(true);
    let successCount = 0;
    for (const co of eligible) {
      const ok = await completeCheckOut(co.reservationId);
      if (ok) {
        updateGroupMemberLocal(co.reservationId, 'status', 'completed');
        successCount++;
      }
    }
    // Update group booking status
    if (successCount > 0 && group.id) {
      await supabase.from('group_bookings').update({ status: 'Completed' }).eq('id', group.id);
    }
    setGroupActionLoading(false);
    setRefreshTrigger((prev) => prev + 1);
    alert(`Group check-out: ${successCount} of ${eligible.length} completed.`);
  };

  // Print group invoice (primary contact + per-member folio summary)
  const handlePrintGroupInvoice = async (group: any, groupMembers: CheckOutRequest[]) => {
    setGroupActionLoading(true);
    try {
      // Fetch folio details for each member
      const memberFolios: { reservationId: string; details: FolioDetails }[] = [];
      for (const co of groupMembers) {
        const details = await getFolioDetails(co.reservationId);
        memberFolios.push({ reservationId: co.reservationId, details });
      }
      // Build a members array with reservation data for the invoice
      const membersData = groupMembers.map((co) => ({
        id: co.reservationId,
        guest_name: co.guestName,
        guest_email: '',
        guest_phone: '',
        room_type: co.roomType,
        room_number: co.roomNumber,
        check_in_date: co.checkInDate,
        check_out_date: co.checkOutDate,
        adults: 1,
        children: 0,
        total_amount: co.folioBalance,
      }));
      printGroupInvoice(group, membersData, memberFolios);
    } finally {
      setGroupActionLoading(false);
    }
  };

  const checklistItems: {
    key: keyof CheckOutRequest;
    label: string;
    description: string;
    icon: typeof FileText;
  }[] = [
    { key: 'invoiceReviewed', label: 'Invoice Reviewed', description: 'Review folio charges', icon: FileText },
    { key: 'settlementProcessed', label: 'Settlement Processed', description: 'Payment settlement', icon: CreditCard },
    { key: 'refundProcessed', label: 'Refund Processed', description: 'Handle refunds', icon: DollarSign },
    { key: 'feedbackCollected', label: 'Feedback Collected', description: 'Guest feedback', icon: MessageSquare },
    { key: 'folioClosed', label: 'Folio Closed', description: 'Close folio', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Check-Out</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Settlement and folio closure</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFilterPanel((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilterPanel || statusFilter !== 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {(['all', 'pending', 'in-progress', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check-Out Process Steps (static guide) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Check-Out Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {checkOutSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{step.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{step.description}</div>
                <div className="mt-2 text-xs font-medium text-gray-400">Step {index + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Check-Outs (includes group bookings as expandable rows) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending Check-Outs</h2>
            {selectedReservationId && (
              <span className="ml-1 text-xs font-normal text-blue-600 dark:text-blue-400">
                (filtered by selected reservation)
              </span>
            )}
            {selectedGroupName && (
              <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {selectedGroupName}
              </span>
            )}
            {groupBookings.filter((g) => {
              const members = groupCheckOuts.filter((r) => r.groupBookingId === g.id || r.bookingGroupId === g.id);
              return members.length > 0;
            }).length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {groupBookings.filter((g) => {
                  const members = groupCheckOuts.filter((r) => r.groupBookingId === g.id || r.bookingGroupId === g.id);
                  return members.length > 0;
                }).length} group(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by guest or reservation ID..."
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading check-outs...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8 mb-3" />
            <p>{error}</p>
            <button onClick={handleRefresh} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Retry
            </button>
          </div>
        ) : checkOuts.length === 0 && (groupBookings.length === 0 || groupCheckOuts.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <LogOut className="w-8 h-8 mb-3" />
            <p>No check-outs found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
          </div>
        ) : (
          <>
          {/* ── Group check-outs (expandable/collapsible rows with per-member check-out) ── */}
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {groupBookings.map((group) => {
              const groupMembers = groupCheckOuts.filter(
                (r) => r.groupBookingId === group.id || r.bookingGroupId === group.id
              );
              if (groupMembers.length === 0) return null;
              const isExpanded = expandedGroupIds.has(group.id);
              const groupName = group.group_name || group.name || group.id;
              const allInvoice = groupMembers.every((m) => m.invoiceReviewed);
              const allSettlement = groupMembers.every((m) => m.settlementProcessed);
              const allFolio = groupMembers.every((m) => m.folioClosed);
              const allComplete = groupMembers.every((m) => m.status === 'completed');
              const totalBalance = groupMembers.reduce((s, m) => s + m.balance, 0);

              return (
                <div key={`group-${group.id}`} className="p-4 bg-purple-50/30 dark:bg-purple-900/10">
                  {/* Group header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleGroupExpand(group.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{groupName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {group.contact_name || '—'} · {groupMembers.length} room{groupMembers.length !== 1 ? 's' : ''} · Total balance: ${totalBalance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintGroupInvoice(group, groupMembers)}
                        disabled={groupActionLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                        title="Print group invoice with primary contact and guest folio summary"
                      >
                        <Printer className="w-4 h-4" />
                        Print Group Invoice
                      </button>
                      <button
                        onClick={() => handleGroupCompleteCheckOutAll(group, groupMembers)}
                        disabled={groupActionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out All
                      </button>
                    </div>
                  </div>

                  {/* Expanded: primary contact + group-level actions + per-member rows */}
                  {isExpanded && (
                    <div className="mt-4 ml-10 space-y-4">
                      {/* Primary Contact Info Card */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                          <UserCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">Primary Contact Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Contact Name</div>
                            <div className="font-medium text-gray-900 dark:text-white">{group.contact_name || groupMembers[0]?.guestName || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                            <div className="font-medium text-gray-900 dark:text-white">{group.contact_email || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                            <div className="font-medium text-gray-900 dark:text-white">{group.contact_phone || 'N/A'}</div>
                          </div>
                          {group.contact_company && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Company</div>
                              <div className="font-medium text-gray-900 dark:text-white">{group.contact_company}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Check-Out Date</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {groupMembers[0]?.checkOutDate ? new Date(groupMembers[0].checkOutDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Balance</div>
                            <div className="font-medium text-gray-900 dark:text-white">${totalBalance.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Group-Level Checklist Summary + Batch Actions */}
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Group Check-Out Process (applies to all {groupMembers.length} members)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${allInvoice ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                            <FileText className={`w-4 h-4 ${allInvoice ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">Invoice</div>
                              <div className="text-gray-500 dark:text-gray-400">{allInvoice ? 'All reviewed' : 'Pending'}</div>
                            </div>
                            {allInvoice && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${allSettlement ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                            <CreditCard className={`w-4 h-4 ${allSettlement ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">Settlement</div>
                              <div className="text-gray-500 dark:text-gray-400">{allSettlement ? 'All settled' : 'Pending'}</div>
                            </div>
                            {allSettlement && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${allFolio ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                            <Receipt className={`w-4 h-4 ${allFolio ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">Folios</div>
                              <div className="text-gray-500 dark:text-gray-400">{allFolio ? 'All closed' : 'Pending'}</div>
                            </div>
                            {allFolio && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${allComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                            <LogOut className={`w-4 h-4 ${allComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">Checked Out</div>
                              <div className="text-gray-500 dark:text-gray-400">{allComplete ? 'All done' : 'Pending'}</div>
                            </div>
                            {allComplete && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                          </div>
                        </div>
                        {/* Group-level batch action buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleGroupCloseFoliosAll(groupMembers)}
                            disabled={groupActionLoading || allFolio}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                              allFolio
                                ? 'bg-green-600 text-white'
                                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            {allFolio ? 'All Folios Closed' : 'Close All Folios'}
                          </button>
                          <button
                            onClick={() => handlePrintGroupInvoice(group, groupMembers)}
                            disabled={groupActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Group Invoice
                          </button>
                          <button
                            onClick={() => handleGroupCompleteCheckOutAll(group, groupMembers)}
                            disabled={groupActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Complete Group Check-Out
                          </button>
                        </div>
                      </div>

                      {/* Per-member check-out rows */}
                      <div className="space-y-3">
                        {groupMembers.map((memberCO) => {
                          const isBusy = busyId === memberCO.reservationId;
                          const memberAllDone =
                            memberCO.invoiceReviewed &&
                            memberCO.settlementProcessed &&
                            memberCO.refundProcessed &&
                            memberCO.feedbackCollected &&
                            memberCO.folioClosed;
                          return (
                            <div key={memberCO.id} className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                              {/* Member info header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{memberCO.guestName}</h4>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[memberCO.status]}`}>
                                      {memberCO.status.replace('-', ' ')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {memberCO.roomType}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Room: {memberCO.roomNumber}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {memberCO.nights} nights</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-bold ${memberCO.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ${memberCO.balance.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                                </div>
                              </div>

                              {/* Check-Out Checklist (clickable, same 5 steps) */}
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                                {checklistItems.map((item) => {
                                  const Icon = item.icon;
                                  const done = Boolean((memberCO as any)[item.key]);
                                  return (
                                    <button
                                      key={item.key}
                                      onClick={() => handleGroupMemberStepToggle(memberCO, item.key)}
                                      disabled={isBusy}
                                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors disabled:opacity-50 ${
                                        done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <Icon className={`w-4 h-4 ${done ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 dark:text-white">{item.label}</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.description}</div>
                                      </div>
                                      {done && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Action Buttons (same as individual check-out) */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleGroupMemberReviewInvoice(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    Review Invoice
                                  </button>
                                  <button
                                    onClick={() => handleGroupMemberSettlement(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Settlement
                                  </button>
                                  <button
                                    onClick={() => openRefundModal(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Refund
                                  </button>
                                  <button
                                    onClick={() => openFeedbackModal(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Feedback
                                  </button>
                                  <button
                                    onClick={() => handleCloseFolio(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    Close Folio
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleGroupMemberPrintInvoice(memberCO)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    Print
                                  </button>
                                  <button
                                    onClick={() => handleGroupMemberExpressCheckOut(memberCO)}
                                    disabled={isBusy || memberCO.balance > 0}
                                    title={memberCO.balance > 0 ? 'Only available for zero-balance guests' : 'Express check-out'}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs disabled:opacity-50"
                                  >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Express
                                  </button>
                                  {memberAllDone && (
                                    <button
                                      onClick={() => handleGroupMemberCompleteCheckOut(memberCO)}
                                      disabled={isBusy}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium disabled:opacity-50"
                                    >
                                      <LogOut className="w-3.5 h-3.5" />
                                      Complete Check-Out
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Individual pending check-outs (excluding group members) ── */}
            {checkOuts
              .filter((co) => !co.groupBookingId && !co.bookingGroupId)
              .map((checkOut) => {
              const isBusy = busyId === checkOut.reservationId;
              const allDone =
                checkOut.invoiceReviewed &&
                checkOut.settlementProcessed &&
                checkOut.refundProcessed &&
                checkOut.feedbackCollected &&
                checkOut.folioClosed;
              return (
                <div key={checkOut.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{checkOut.guestName}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[checkOut.status]}`}>
                          {checkOut.status.replace('-', ' ')}
                        </span>
                        {checkOut.lateCheckoutRequested && (
                          <button
                            onClick={() => handleToggleLateCheckOut(checkOut)}
                            disabled={isBusy}
                            title="Click to cancel late check-out request"
                            className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-sm font-medium rounded-full flex items-center gap-1 hover:bg-orange-200 dark:hover:bg-orange-900/50 disabled:opacity-50"
                          >
                            <Clock className="w-3 h-3" />
                            Late Check-Out
                          </button>
                        )}
                        {!checkOut.lateCheckoutRequested && (
                          <button
                            onClick={() => handleToggleLateCheckOut(checkOut)}
                            disabled={isBusy}
                            title="Request late check-out"
                            className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 text-sm font-medium rounded-full flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50"
                          >
                            <Clock className="w-3 h-3" />
                            Request Late
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Reservation:</span>
                          <span className="text-gray-900 dark:text-white">{checkOut.reservationId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Room:</span>
                          <span className="text-gray-900 dark:text-white">{checkOut.roomNumber} ({checkOut.roomType})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Stay:</span>
                          <span className="text-gray-900 dark:text-white">{checkOut.nights} nights</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Check-Out:</span>
                          <span className="text-gray-900 dark:text-white">{checkOut.checkOutTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${checkOut.folioBalance.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {checkOut.folioId ? 'Folio Balance' : 'Estimated Balance'}
                      </div>
                      {checkOut.lateCheckoutFee ? (
                        <div className="text-sm text-orange-600 dark:text-orange-400">+${checkOut.lateCheckoutFee} late fee</div>
                      ) : null}
                    </div>
                  </div>

                  {/* Check-Out Checklist (clickable) */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Check-Out Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {checklistItems.map((item) => {
                        const Icon = item.icon;
                        const done = Boolean((checkOut as any)[item.key]);
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleStepToggle(checkOut, item.key)}
                            disabled={isBusy}
                            className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors disabled:opacity-50 ${
                              done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${done ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                            </div>
                            {done && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleReviewInvoice(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        Review Invoice
                      </button>
                      <button
                        onClick={() => openSettlementModal(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        Process Settlement
                      </button>
                      <button
                        onClick={() => openRefundModal(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <DollarSign className="w-4 h-4" />
                        Process Refund
                      </button>
                      <button
                        onClick={() => openFeedbackModal(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Collect Feedback
                      </button>
                      <button
                        onClick={() => handleCloseFolio(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <Receipt className="w-4 h-4" />
                        Close Folio
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handlePrintInvoice(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(checkOut)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleExpressCheckOut(checkOut)}
                        disabled={isBusy || checkOut.balance > 0}
                        title={checkOut.balance > 0 ? 'Only available for zero-balance guests' : 'Express check-out'}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Express
                      </button>
                      {allDone && (
                        <button
                          onClick={() => handleCompleteCheckOut(checkOut)}
                          disabled={isBusy}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Complete Check-Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            </>
          )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Express Check-Out</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Quick check-out for guests with zero balance. Use the "Express" button on any zero-balance guest.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {checkOuts.filter((c) => c.balance <= 0).length} eligible guest(s)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Late Check-Out</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Toggle late check-out requests per guest using the badge on each card.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {checkOuts.filter((c) => c.lateCheckoutRequested).length} request(s) active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Guest Feedback</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Collect and review guest feedback</p>
          <button
            onClick={handleViewFeedback}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            View Feedback
          </button>
        </div>
      </div>

      {/* ── Invoice Review Modal ─────────────────────────────────────────── */}
      {invoiceModalCheckOut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Invoice Review — {invoiceModalCheckOut.guestName}
              </h3>
              <button onClick={() => setInvoiceModalCheckOut(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {folioLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading folio...
                </div>
              ) : folioDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Reservation:</span> <span className="font-medium text-gray-900 dark:text-white">{invoiceModalCheckOut.reservationId}</span></div>
                    <div><span className="text-gray-500">Room:</span> <span className="font-medium text-gray-900 dark:text-white">{invoiceModalCheckOut.roomNumber} ({invoiceModalCheckOut.roomType})</span></div>
                    <div><span className="text-gray-500">Folio ID:</span> <span className="font-medium text-gray-900 dark:text-white">{folioDetails.folio?.id || 'No folio'}</span></div>
                    <div><span className="text-gray-500">Folio Status:</span> <span className="font-medium text-gray-900 dark:text-white">{folioDetails.folio?.status || 'N/A'}</span></div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Charges</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folioDetails.charges.length === 0 ? (
                          <tr><td colSpan={3} className="py-4 text-center text-gray-500">No charges</td></tr>
                        ) : (
                          folioDetails.charges.map((c: any) => (
                            <tr key={c.id} className="border-b border-gray-100 dark:border-slate-700">
                              <td className="py-2">{c.transaction_date ? new Date(c.transaction_date).toLocaleDateString() : ''}</td>
                              <td className="py-2">{c.description}</td>
                              <td className="py-2 text-right">${Number(c.amount).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Payments</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Method</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folioDetails.payments.length === 0 ? (
                          <tr><td colSpan={3} className="py-4 text-center text-gray-500">No payments</td></tr>
                        ) : (
                          folioDetails.payments.map((p: any) => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-slate-700">
                              <td className="py-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                              <td className="py-2">{p.payment_method}{p.is_refund ? ' (Refund)' : ''}</td>
                              <td className="py-2 text-right">${Number(p.amount).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Balance Due</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">${folioDetails.balance.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setInvoiceModalCheckOut(null)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (invoiceModalCheckOut) handlePrintInvoice(invoiceModalCheckOut);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No folio details available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Settlement Modal ─────────────────────────────────────────────── */}
      {settlementCheckOut && (
        <Modal title="Process Settlement" onClose={() => setSettlementCheckOut(null)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Guest: <span className="font-medium text-gray-900 dark:text-white">{settlementCheckOut.guestName}</span>
              <br />Current Balance: <span className="font-medium text-gray-900 dark:text-white">${settlementCheckOut.balance.toFixed(2)}</span>
            </div>
            <Field label="Amount">
              <input type="number" min={0} step="0.01" value={settlementAmount} onChange={(e) => setSettlementAmount(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Payment Method">
              <select value={settlementMethod} onChange={(e) => setSettlementMethod(e.target.value as PaymentMethod)} className={inputCls}>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Reference (optional)">
              <input type="text" value={settlementReference} onChange={(e) => setSettlementReference(e.target.value)} className={inputCls} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSettlementCheckOut(null)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
              <button onClick={handleProcessSettlement} disabled={busyId === settlementCheckOut.reservationId} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {busyId === settlementCheckOut.reservationId ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Refund Modal ─────────────────────────────────────────────────── */}
      {refundCheckOut && (
        <Modal title="Process Refund" onClose={() => setRefundCheckOut(null)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Guest: <span className="font-medium text-gray-900 dark:text-white">{refundCheckOut.guestName}</span>
            </div>
            <Field label="Refund Amount">
              <input type="number" min={0} step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Refund Method">
              <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value as PaymentMethod)} className={inputCls}>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Reference (optional)">
              <input type="text" value={refundReference} onChange={(e) => setRefundReference(e.target.value)} className={inputCls} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRefundCheckOut(null)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
              <button onClick={handleProcessRefund} disabled={busyId === refundCheckOut.reservationId} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {busyId === refundCheckOut.reservationId ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Feedback Modal ───────────────────────────────────────────────── */}
      {feedbackCheckOut && (
        <Modal title="Collect Guest Feedback" onClose={() => setFeedbackCheckOut(null)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Guest: <span className="font-medium text-gray-900 dark:text-white">{feedbackCheckOut.guestName}</span>
            </div>
            <Field label="Rating">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setFeedbackRating(n)} type="button">
                    <Star className={`w-7 h-7 ${n <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Comment">
              <textarea rows={4} value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} className={inputCls} placeholder="Guest comments..." />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setFeedbackCheckOut(null)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
              <button onClick={handleSubmitFeedback} disabled={busyId === feedbackCheckOut.reservationId} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {busyId === feedbackCheckOut.reservationId ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Feedback List Modal ──────────────────────────────────────────── */}
      {showFeedbackList && (
        <Modal title="Recent Guest Feedback" onClose={() => setShowFeedbackList(false)}>
          {feedbackListLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
            </div>
          ) : feedbackList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No feedback collected yet.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{fb.guest_name}</span>
                    <span className="text-xs text-gray-500">{fb.feedback_date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-4 h-4 ${n <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                  {fb.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{fb.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

// ── Small reusable UI helpers ──────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default CheckOut;
