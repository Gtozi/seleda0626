/**
 * Front Office Check-In Module
 * Registration and key management
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Key,
  UserCheck,
  FileText,
  CreditCard,
  Shield,
  Scan,
  Pen,
  CheckCircle2,
  Clock,
  BedDouble,
  DollarSign,
  Printer,
  RefreshCw,
  Filter,
  Users,
  UserCircle,
  X,
  Upload,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  getPendingCheckIns,
  searchCheckIns,
  updateCheckInStep,
  completeCheckIn,
  processDeposit,
  getCheckInStatus,
  getReservationForRegistration,
  printRegistrationCard,
  printGroupRegistrationCard,
  uploadIdDocument,
  updateGuestIdCard,
  getGuestIdCard,
  type CheckInRequest,
  type CheckInStep
} from '../../../services/checkInService';
import { supabase } from '../../../lib/supabase';

// Add type for the completeCheckIn return value
interface CheckInResult {
  success: boolean;
  folioId?: string;
}
import { DollarSign } from 'lucide-react';

type CheckInStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

// Determine whether a guest's ID document should count as "already on file" —
// either an uploaded image or a filled-in document number/type is enough to recognize it.
const isIdOnFile = (idCardData: any): boolean => {
  if (!idCardData) return false;
  return Boolean(
    idCardData.isUploaded ||
    idCardData.number ||
    idCardData.frontImageUrl ||
    idCardData.backImageUrl
  );
};

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const selectedReservationId = searchParams.get('reservationId') || undefined;
  const selectedGroupId = searchParams.get('groupId') || undefined;
  const selectedGroupName = searchParams.get('groupName') || undefined;
  const [checkIns, setCheckIns] = useState<CheckInRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInRequest | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('Passport');
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuingCountry, setIssuingCountry] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [existingIdOnFile, setExistingIdOnFile] = useState(false);

  // Group check-in state
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [groupReservations, setGroupReservations] = useState<any[]>([]);
  const [groupCheckInLoading, setGroupCheckInLoading] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  // Per-member check-in step status (same steps as individual check-in)
  const [groupMemberSteps, setGroupMemberSteps] = useState<Record<string, CheckInStep>>({});

  // Fetch check-ins from database
  useEffect(() => {
    const fetchCheckIns = async () => {
      setLoading(true);
      try {
        let data;
        if (searchTerm) {
          data = await searchCheckIns(searchTerm);
        } else {
          data = await getPendingCheckIns();
        }
        
        // If a specific reservation is selected, filter for it
        if (selectedReservationId) {
          data = data.filter(checkIn => checkIn.reservationId === selectedReservationId);
        }
        
        // Load check-in step status for each reservation
        const checkInsWithStatus = await Promise.all(
          data.map(async (checkIn) => {
            const status = await getCheckInStatus(checkIn.reservationId);
            if (status) {
              // If identity not yet verified, check if the guest profile
              // already has an ID document on file — if so, auto-recognize
              // and mark identity as verified so the scan button turns green.
              let autoVerified = status.identityVerified;
              if (!autoVerified) {
                try {
                  const { data: reservation } = await supabase
                    .from('reservations')
                    .select('guest_id')
                    .eq('id', checkIn.reservationId)
                    .maybeSingle();
                  if (reservation?.guest_id) {
                    const idCardData = await getGuestIdCard(reservation.guest_id);
                    if (isIdOnFile(idCardData)) {
                      autoVerified = true;
                      // Persist the auto-verification so it sticks across refreshes
                      await updateCheckInStep(checkIn.reservationId, 'identityVerified' as any, true);
                    }
                  }
                } catch {
                  // Ignore — fall back to stored status
                }
              }
              return {
                ...checkIn,
                identityVerified: autoVerified,
                registrationSigned: status.registrationSigned,
                depositCollected: status.depositCollected,
                paymentAuthorized: status.paymentAuthorized,
                keyEncoded: status.keyEncoded,
              };
            }
            return checkIn;
          })
        );
        
        setCheckIns(checkInsWithStatus);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, [refreshTrigger, searchTerm, selectedReservationId]);

  // Fetch group bookings with confirmed reservations (eligible for group check-in)
  useEffect(() => {
    const fetchGroupBookings = async () => {
      if (!supabase) return;
      try {
        // Fetch group bookings that are not yet checked in / completed
        const { data: groups, error: groupsError } = await supabase
          .from('group_bookings')
          .select('*')
          .in('status', ['Confirmed', 'Pending']);
        if (groupsError) throw groupsError;

        // Fetch confirmed reservations linked to groups
        const { data: groupRes, error: resError } = await supabase
          .from('reservations')
          .select('id, guest_id, guest_name, guest_email, guest_phone, room_type, room_number, status, group_booking_id, booking_group_id, check_in_date, check_out_date, adults, children, total_amount, deposit_amount, is_deposit_paid, payment_status')
          .eq('status', 'Confirmed');
        if (resError) throw resError;

        setGroupBookings(groups || []);
        setGroupReservations(groupRes || []);

        // Load check-in step status for each group member (same as individual check-ins)
        const stepsMap: Record<string, CheckInStep> = {};
        await Promise.all(
          (groupRes || []).map(async (res: any) => {
            const status = await getCheckInStatus(res.id);
            if (status) {
              // Auto-recognize ID from guest profile — mark identity verified if ID on file
              let autoVerified = status.identityVerified;
              if (!autoVerified && res.guest_id) {
                try {
                  const idCardData = await getGuestIdCard(res.guest_id);
                  if (isIdOnFile(idCardData)) {
                    autoVerified = true;
                    await updateCheckInStep(res.id, 'identityVerified' as any, true);
                  }
                } catch {
                  // Ignore — fall back to stored status
                }
              }
              stepsMap[res.id] = { ...status, identityVerified: autoVerified };
            } else {
              // No stored status — check guest profile for existing ID
              let autoVerified = false;
              if (res.guest_id) {
                try {
                  const idCardData = await getGuestIdCard(res.guest_id);
                  if (isIdOnFile(idCardData)) {
                    autoVerified = true;
                    await updateCheckInStep(res.id, 'identityVerified' as any, true);
                  }
                } catch {
                  // Ignore
                }
              }
              stepsMap[res.id] = {
                identityVerified: autoVerified,
                registrationSigned: false,
                depositCollected: res.is_deposit_paid || false,
                paymentAuthorized: res.payment_status === 'Paid',
                keyEncoded: false,
              };
            }
          })
        );
        setGroupMemberSteps(stepsMap);

        // Auto-expand the group selected via URL param
        if (selectedGroupId) {
          setExpandedGroupIds(prev => new Set(prev).add(selectedGroupId));
        }
      } catch (error) {
        console.error('Error fetching group bookings for check-in:', error);
      }
    };
    fetchGroupBookings();
  }, [refreshTrigger, selectedGroupId]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const checkInSteps = [
    { id: 'identity', label: 'Identity Verification', icon: Shield, description: 'Verify passport/ID', required: true },
    { id: 'registration', label: 'Registration Card', icon: FileText, description: 'Digital signature', required: true },
    { id: 'deposit', label: 'Deposit Collection', icon: DollarSign, description: 'Security deposit', required: false },
    { id: 'payment', label: 'Payment Authorization', icon: CreditCard, description: 'Payment method', required: false },
    { id: 'key', label: 'Key Encoding', icon: Key, description: 'Room key card', required: true },
  ];

  // Handler functions
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStepToggle = async (reservationId: string, step: keyof CheckInRequest) => {
    const stepKey = step as keyof any;
    const checkIn = checkIns.find(ci => ci.reservationId === reservationId);
    if (!checkIn) return;

    const newValue = !checkIn[stepKey];
    const success = await updateCheckInStep(reservationId, stepKey as any, newValue);
    
    if (success) {
      setCheckIns(prev => prev.map(ci => 
        ci.reservationId === reservationId 
          ? { ...ci, [stepKey]: newValue }
          : ci
      ));
    }
  };

  const handleScanDocument = async (reservationId: string) => {
    await handleStepToggle(reservationId, 'identityVerified');
  };

  const handleSignRegistration = async (reservationId: string) => {
    await handleStepToggle(reservationId, 'registrationSigned');
  };

  const handleProcessPayment = async (reservationId: string) => {
    const checkIn = checkIns.find(ci => ci.reservationId === reservationId);
    if (!checkIn) return;

    // Process deposit if balance exists
    if (checkIn.balance > 0) {
      const success = await processDeposit(reservationId, checkIn.balance, 'credit_card');
      if (success) {
        await handleStepToggle(reservationId, 'depositCollected');
        await handleStepToggle(reservationId, 'paymentAuthorized');
      }
    } else {
      // If no balance, just mark as authorized (optional step)
      await handleStepToggle(reservationId, 'paymentAuthorized');
    }
  };

  const handleSkipPayment = async (reservationId: string) => {
    // Skip payment authorization (optional step)
    // Just mark as completed without actual payment processing
    await handleStepToggle(reservationId, 'paymentAuthorized');
  };

  const handleSkipDeposit = async (reservationId: string) => {
    // Skip deposit collection (optional step)
    // Just mark as completed without actual deposit processing
    await handleStepToggle(reservationId, 'depositCollected');
  };

  const handleEncodeKey = async (reservationId: string) => {
    await handleStepToggle(reservationId, 'keyEncoded');
  };

  const handleCompleteCheckIn = async (reservationId: string, roomNumber: string) => {
    const result = await completeCheckIn(reservationId, roomNumber);
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
      if (result.folioId) {
        alert(`Check-in completed successfully! Folio created: ${result.folioId}`);
      } else {
        alert('Check-in completed successfully!');
      }
    } else {
      alert('Check-in failed. Please try again.');
    }
  };

  // Group check-in: check in all confirmed reservations for a group
  // Follows the same process as individual check-in: calls completeCheckIn() which
  // calls POST /api/reservations/:id/check-in to create folios and post room charges.
  const handleGroupCheckIn = async (groupId: string, groupName: string) => {
    if (!supabase) return;
    const groupRes = groupReservations.filter(
      r => r.group_booking_id === groupId || r.booking_group_id === groupId
    );
    if (groupRes.length === 0) {
      alert('No confirmed reservations found for this group.');
      return;
    }
    const confirmMsg = window.confirm(`Check in all ${groupRes.length} confirmed reservation(s) for group "${groupName}"?\n\nThis will create folios and post room charges for each reservation, same as individual check-in.`);
    if (!confirmMsg) return;
    setGroupCheckInLoading(true);
    try {
      // Fetch fresh room data for auto-assignment
      const { data: freshRooms } = await supabase
        .from('rooms')
        .select('id, number, type, status, rate')
        .order('number');

      // Fetch all active reservations to determine occupied rooms
      const { data: activeRes } = await supabase
        .from('reservations')
        .select('id, room_number, status, room_type')
        .in('status', ['Confirmed', 'CheckedIn']);

      const occupiedRooms = new Set(
        (activeRes || []).filter((r: any) => r.room_number).map((r: any) => r.room_number)
      );
      const assignedInThisBatch = new Set<string>();
      let successCount = 0;
      const errors: string[] = [];

      for (const res of groupRes) {
        // Determine room number: use existing assignment or auto-assign
        let roomNumber = res.room_number;

        if (!roomNumber || roomNumber === 'Unassigned') {
          // Auto-assign: find an available room of the matching type
          const matchType = res.room_type;
          const candidates = (freshRooms || []).filter((r: any) =>
            r.type === matchType &&
            r.status !== 'Out of Order' &&
            !occupiedRooms.has(r.number) &&
            !assignedInThisBatch.has(r.number)
          );

          const best = candidates.find((r: any) => r.status === 'Vacant Clean') || candidates[0];
          if (best) {
            roomNumber = best.number;
            assignedInThisBatch.add(roomNumber);
            occupiedRooms.add(roomNumber);
          }
        }

        if (!roomNumber || roomNumber === 'Unassigned') {
          errors.push(`${res.guest_name}: no available room`);
          continue;
        }

        // Use the same completeCheckIn function as individual check-in
        // This calls POST /api/reservations/:id/check-in which creates folios and posts room charges
        const result = await completeCheckIn(res.id, roomNumber);
        if (result.success) {
          successCount++;
        } else {
          errors.push(`${res.guest_name}: check-in API failed`);
        }
      }

      // Update group booking status
      if (successCount > 0) {
        await supabase.from('group_bookings').update({ status: 'CheckedIn' }).eq('id', groupId);
      }

      setRefreshTrigger(prev => prev + 1);

      if (errors.length > 0) {
        alert(`Group check-in: ${successCount} of ${groupRes.length} succeeded.\n\nFailed:\n${errors.join('\n')}`);
      } else {
        alert(`Group check-in complete: all ${successCount} reservation(s) checked in. Folios created and room charges posted.`);
      }
    } catch (err) {
      console.error('Group check-in failed:', err);
      alert('Failed to check in group. Please try again.');
    } finally {
      setGroupCheckInLoading(false);
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Toggle a check-in step for a group member (same process as individual check-in)
  const handleGroupMemberStepToggle = async (reservationId: string, step: keyof CheckInStep) => {
    const current = groupMemberSteps[reservationId];
    if (!current) return;
    const newValue = !current[step];
    const success = await updateCheckInStep(reservationId, step as any, newValue);
    if (success) {
      setGroupMemberSteps(prev => ({
        ...prev,
        [reservationId]: { ...prev[reservationId], [step]: newValue },
      }));
    }
  };

  // Scan document for a group member (opens the same document upload modal)
  const handleGroupMemberScanDocument = (res: any) => {
    const checkInReq: CheckInRequest = {
      id: `CI-${res.id}`,
      guestName: res.guest_name,
      reservationId: res.id,
      roomNumber: res.room_number || 'Unassigned',
      roomType: res.room_type,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      nights: 1,
      adults: res.adults || 1,
      children: res.children || 0,
      status: 'pending',
      identityVerified: groupMemberSteps[res.id]?.identityVerified || false,
      registrationSigned: groupMemberSteps[res.id]?.registrationSigned || false,
      depositCollected: groupMemberSteps[res.id]?.depositCollected || false,
      paymentAuthorized: groupMemberSteps[res.id]?.paymentAuthorized || false,
      keyEncoded: groupMemberSteps[res.id]?.keyEncoded || false,
      balance: (res.total_amount || 0) - (res.deposit_amount || 0),
    };
    handleOpenDocumentModal(checkInReq);
  };

  // Process payment for a group member (same as individual check-in)
  const handleGroupMemberProcessPayment = async (reservationId: string, balance: number) => {
    if (balance > 0) {
      const success = await processDeposit(reservationId, balance, 'credit_card');
      if (success) {
        await handleGroupMemberStepToggle(reservationId, 'depositCollected');
        await handleGroupMemberStepToggle(reservationId, 'paymentAuthorized');
      }
    } else {
      await handleGroupMemberStepToggle(reservationId, 'paymentAuthorized');
    }
  };

  // Complete check-in for a single group member (same as individual completeCheckIn)
  const handleGroupMemberCompleteCheckIn = async (reservationId: string, roomNumber: string) => {
    const result = await completeCheckIn(reservationId, roomNumber);
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
      alert(`Check-in completed successfully for reservation ${reservationId}!${result.folioId ? `\nFolio created: ${result.folioId}` : ''}`);
    } else {
      alert('Check-in failed. Please try again.');
    }
  };

  // ── Group-level batch handlers (apply a step to ALL members at once) ──

  // Sign registration for all group members
  const handleGroupSignAll = async (groupRes: any[]) => {
    for (const res of groupRes) {
      const steps = groupMemberSteps[res.id];
      if (steps && !steps.registrationSigned) {
        await handleGroupMemberStepToggle(res.id, 'registrationSigned');
      }
    }
  };

  // Process payment for all group members (sum of balances)
  const handleGroupProcessPaymentAll = async (groupRes: any[]) => {
    for (const res of groupRes) {
      const steps = groupMemberSteps[res.id];
      if (steps && !steps.paymentAuthorized) {
        const balance = (res.total_amount || 0) - (res.deposit_amount || 0);
        await handleGroupMemberProcessPayment(res.id, balance);
      }
    }
  };

  // Encode keys for all group members
  const handleGroupEncodeKeysAll = async (groupRes: any[]) => {
    for (const res of groupRes) {
      const steps = groupMemberSteps[res.id];
      if (steps && !steps.keyEncoded) {
        await handleGroupMemberStepToggle(res.id, 'keyEncoded');
      }
    }
  };

  // Skip payment authorization for all group members
  const handleGroupSkipPaymentAll = async (groupRes: any[]) => {
    for (const res of groupRes) {
      const steps = groupMemberSteps[res.id];
      if (steps && !steps.paymentAuthorized) {
        await handleGroupMemberStepToggle(res.id, 'paymentAuthorized');
      }
    }
  };

  // Skip deposit collection for all group members
  const handleGroupSkipDepositAll = async (groupRes: any[]) => {
    for (const res of groupRes) {
      const steps = groupMemberSteps[res.id];
      if (steps && !steps.depositCollected) {
        await handleGroupMemberStepToggle(res.id, 'depositCollected');
      }
    }
  };

  // Print group registration card (primary contact + full guest list)
  const handlePrintGroupRegistration = (group: any, groupRes: any[]) => {
    printGroupRegistrationCard(group, groupRes);
  };

  const handlePrintRegistration = async (reservationId: string) => {
    const reservation = await getReservationForRegistration(reservationId);
    if (reservation) {
      printRegistrationCard(reservation);
    } else {
      alert('Failed to load reservation details for printing');
    }
  };

  const handleOpenDocumentModal = (checkIn: CheckInRequest) => {
    setSelectedCheckIn(checkIn);
    setShowDocumentModal(true);
    // Load existing ID card data if available
    loadExistingIdCard(checkIn.reservationId);
  };

  const loadExistingIdCard = async (reservationId: string) => {
    try {
      // Reset recognition flag before loading
      setExistingIdOnFile(false);
      // Get guest ID from reservation
      const { data: reservation } = await supabase
        .from('reservations')
        .select('guest_id')
        .eq('id', reservationId)
        .maybeSingle();

      if (reservation?.guest_id) {
        const idCardData = await getGuestIdCard(reservation.guest_id);
        if (isIdOnFile(idCardData)) {
          setDocType(idCardData.type || 'Passport');
          setDocNumber(idCardData.number || '');
          setExpiryDate(idCardData.expiryDate || '');
          setIssueDate(idCardData.issueDate || '');
          setIssuingCountry(idCardData.issuingCountry || '');
          setFrontPreview(idCardData.frontImageUrl || null);
          setBackPreview(idCardData.backImageUrl || null);
          // Recognize that an ID is already on file in the guest profile
          setExistingIdOnFile(true);

          // Auto-mark identity as verified since the ID is already on file.
          // Only set to true (don't toggle off if already verified).
          const checkIn = checkIns.find(ci => ci.reservationId === reservationId);
          if (checkIn && !checkIn.identityVerified) {
            const success = await updateCheckInStep(reservationId, 'identityVerified' as any, true);
            if (success) {
              setCheckIns(prev => prev.map(ci =>
                ci.reservationId === reservationId
                  ? { ...ci, identityVerified: true }
                  : ci
              ));
            }
          }
        } else {
          // No existing ID on file — reset form
          setDocType('Passport');
          setDocNumber('');
          setExpiryDate('');
          setIssueDate('');
          setIssuingCountry('');
          setFrontPreview(null);
          setBackPreview(null);
        }
      } else {
        // No guest linked yet — reset form
        setDocType('Passport');
        setDocNumber('');
        setExpiryDate('');
        setIssueDate('');
        setIssuingCountry('');
        setFrontPreview(null);
        setBackPreview(null);
      }
    } catch (error) {
      console.error('Error loading existing ID card:', error);
      // Reset form if there's an error (guest might not exist yet)
      setDocType('Passport');
      setDocNumber('');
      setExpiryDate('');
      setIssueDate('');
      setIssuingCountry('');
      setFrontPreview(null);
      setBackPreview(null);
      setExistingIdOnFile(false);
    }
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedCheckIn) return;

    setUploading(true);
    try {
      // Get guest ID from reservation
      const { data: reservation } = await supabase
        .from('reservations')
        .select('guest_id, guest_name, guest_email, guest_phone')
        .eq('id', selectedCheckIn.reservationId)
        .maybeSingle();

      if (!reservation) {
        alert('Reservation not found');
        return;
      }

      let guestId = reservation.guest_id;

      // Create guest record if it doesn't exist
      if (!guestId) {
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            id: `G-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: reservation.guest_name,
            email: reservation.guest_email,
            phone: reservation.guest_phone,
            identification_doc: {} as any
          })
          .select('id')
          .single();

        if (guestError) throw guestError;
        guestId = newGuest.id;

        // Update reservation with guest ID
        await supabase
          .from('reservations')
          .update({ guest_id: guestId })
          .eq('id', selectedCheckIn.reservationId);
      }

      let frontImageUrl = frontPreview;
      let backImageUrl = backPreview;

      // Upload front image if new file selected
      if (frontFile) {
        const uploadedUrl = await uploadIdDocument(frontFile, guestId, 'front');
        if (uploadedUrl) {
          frontImageUrl = uploadedUrl;
        }
      }

      // Upload back image if new file selected
      if (backFile) {
        const uploadedUrl = await uploadIdDocument(backFile, guestId, 'back');
        if (uploadedUrl) {
          backImageUrl = uploadedUrl;
        }
      }

      // Update guest ID card information
      const success = await updateGuestIdCard(
        guestId,
        docType,
        docNumber,
        expiryDate,
        issueDate,
        issuingCountry,
        frontImageUrl,
        backImageUrl
      );

      if (success) {
        // Mark identity as verified
        await handleStepToggle(selectedCheckIn.reservationId, 'identityVerified');
        setShowDocumentModal(false);
        alert('ID document uploaded and verified successfully');
      } else {
        alert('Failed to update ID card information');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Check-In</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Registration and key management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Check-In Process Steps */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Check-In Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {checkInSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{step.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{step.description}</div>
                <div className="mt-2 text-xs font-medium text-gray-400">
                  Step {index + 1} {step.required ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optional)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Check-Ins (includes group bookings as expandable rows) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending Check-Ins</h2>
            {selectedGroupName && (
              <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {selectedGroupName}
              </span>
            )}
            {groupBookings.filter(g => {
              const res = groupReservations.filter(r => r.group_booking_id === g.id || r.booking_group_id === g.id);
              return res.length > 0;
            }).length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {groupBookings.filter(g => {
                  const res = groupReservations.filter(r => r.group_booking_id === g.id || r.booking_group_id === g.id);
                  return res.length > 0;
                }).length} group(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading check-ins...
            </div>
          ) : checkIns.length === 0 && (groupBookings.length === 0 || groupReservations.length === 0) ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No pending check-ins found
            </div>
          ) : (
            <>
              {/* ── Group bookings (expandable/collapsible rows with per-member check-in) ── */}
              {groupBookings.map(group => {
                const groupRes = groupReservations.filter(
                  r => r.group_booking_id === group.id || r.booking_group_id === group.id
                );
                if (groupRes.length === 0) return null;
                const isExpanded = expandedGroupIds.has(group.id);
                const groupName = group.group_name || group.name || group.id;
                // Compute group-level step completion (same required steps as individual check-in)
                const groupAllIdentity = groupRes.every((r: any) => groupMemberSteps[r.id]?.identityVerified);
                const groupAllRegistration = groupRes.every((r: any) => groupMemberSteps[r.id]?.registrationSigned);
                const groupAllKey = groupRes.every((r: any) => groupMemberSteps[r.id]?.keyEncoded);
                const groupAllComplete = groupAllIdentity && groupAllRegistration && groupAllKey;
                return (
                  <div key={`group-${group.id}`} className="p-4 bg-purple-50/30 dark:bg-purple-900/10">
                    {/* Group header row (expandable/collapsible) */}
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
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {groupName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {group.contact_name || '—'} · {groupRes.length} room{groupRes.length !== 1 ? 's' : ''} pending
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintGroupRegistration(group, groupRes)}
                          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                          title="Print group registration card with primary contact and guest list"
                        >
                          <Printer className="w-4 h-4" />
                          Print Group Registration
                        </button>
                        <button
                          onClick={() => handleGroupCheckIn(group.id, groupName)}
                          disabled={groupCheckInLoading || !groupAllComplete}
                          title={
                            !groupAllComplete
                              ? 'All members must complete required steps (Scan Document, Sign Registration, Encode Key) before check-in'
                              : 'Check in all members — all required steps completed'
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            groupAllComplete
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          {groupAllComplete ? `Check In All (${groupRes.length})` : `Check In All — ${groupRes.filter((r: any) => groupMemberSteps[r.id]?.identityVerified && groupMemberSteps[r.id]?.registrationSigned && groupMemberSteps[r.id]?.keyEncoded).length}/${groupRes.length} ready`}
                        </button>
                      </div>
                    </div>

                    {/* Expanded: primary contact info + group-level actions + per-member check-in */}
                    {isExpanded && (
                      <div className="mt-4 ml-10 space-y-4">
                        {/* ── Primary Contact Info Card ── */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-3">
                            <UserCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">Primary Contact Information</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Contact Name</div>
                              <div className="font-medium text-gray-900 dark:text-white">{group.contact_name || groupRes[0]?.guest_name || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                              <div className="font-medium text-gray-900 dark:text-white">{group.contact_email || groupRes[0]?.guest_email || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                              <div className="font-medium text-gray-900 dark:text-white">{group.contact_phone || groupRes[0]?.guest_phone || 'N/A'}</div>
                            </div>
                            {group.contact_company && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Company</div>
                                <div className="font-medium text-gray-900 dark:text-white">{group.contact_company}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Check-In / Check-Out</div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {groupRes[0]?.check_in_date ? new Date(groupRes[0].check_in_date).toLocaleDateString() : 'N/A'} → {groupRes[0]?.check_out_date ? new Date(groupRes[0].check_out_date).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                ${groupRes.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Group-Level Checklist Summary + Batch Actions ── */}
                        {(() => {
                          const allIdentity = groupRes.every((r: any) => groupMemberSteps[r.id]?.identityVerified);
                          const allRegistration = groupRes.every((r: any) => groupMemberSteps[r.id]?.registrationSigned);
                          const allDeposit = groupRes.every((r: any) => groupMemberSteps[r.id]?.depositCollected);
                          const allPayment = groupRes.every((r: any) => groupMemberSteps[r.id]?.paymentAuthorized);
                          const allKey = groupRes.every((r: any) => groupMemberSteps[r.id]?.keyEncoded);
                          const allComplete = allIdentity && allRegistration && allKey;

                          return (
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Group Check-In Process (applies to all {groupRes.length} members)</h4>
                            </div>
                            {/* Group checklist summary */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${allIdentity ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                                <Shield className={`w-4 h-4 ${allIdentity ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">Identity</div>
                                  <div className="text-gray-500 dark:text-gray-400">{allIdentity ? 'All verified' : 'Per member'}</div>
                                </div>
                                {allIdentity && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${allRegistration ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                                <Pen className={`w-4 h-4 ${allRegistration ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">Registration</div>
                                  <div className="text-gray-500 dark:text-gray-400">{allRegistration ? 'All signed' : 'Pending'}</div>
                                </div>
                                {allRegistration && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${allDeposit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                                <DollarSign className={`w-4 h-4 ${allDeposit ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">Deposit</div>
                                  <div className="text-gray-500 dark:text-gray-400">{allDeposit ? 'All collected' : 'Pending'}</div>
                                </div>
                                {allDeposit && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${allPayment ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                                <CreditCard className={`w-4 h-4 ${allPayment ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">Payment</div>
                                  <div className="text-gray-500 dark:text-gray-400">{allPayment ? 'All authorized' : 'Pending'}</div>
                                </div>
                                {allPayment && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${allKey ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-900/50'}`}>
                                <Key className={`w-4 h-4 ${allKey ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">Keys</div>
                                  <div className="text-gray-500 dark:text-gray-400">{allKey ? 'All encoded' : 'Pending'}</div>
                                </div>
                                {allKey && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />}
                              </div>
                            </div>
                            {/* Group-level batch action buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleGroupSignAll(groupRes)}
                                disabled={allRegistration}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                                  allRegistration
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Pen className="w-3.5 h-3.5" />
                                {allRegistration ? 'All Signed' : 'Sign All Registrations'}
                              </button>
                              <button
                                onClick={() => handleGroupProcessPaymentAll(groupRes)}
                                disabled={allPayment}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                                  allPayment
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                {allPayment ? 'All Authorized' : 'Process All Payments'}
                              </button>
                              {!allPayment && (
                                <button
                                  onClick={() => handleGroupSkipPaymentAll(groupRes)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Skip All Payments
                                </button>
                              )}
                              {!allDeposit && (
                                <button
                                  onClick={() => handleGroupSkipDepositAll(groupRes)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xs"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  Skip All Deposits
                                </button>
                              )}
                              <button
                                onClick={() => handleGroupEncodeKeysAll(groupRes)}
                                disabled={allKey}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                                  allKey
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Key className="w-3.5 h-3.5" />
                                {allKey ? 'All Encoded' : 'Encode All Keys'}
                              </button>
                              <button
                                onClick={() => handlePrintGroupRegistration(group, groupRes)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Print Registration
                              </button>
                              {allComplete && (
                                <button
                                  onClick={() => handleGroupCheckIn(group.id, groupName)}
                                  disabled={groupCheckInLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Complete Group Check-In
                                </button>
                              )}
                            </div>
                          </div>
                          );
                        })()}

                        {/* ── Per-member check-in rows ── */}
                        <div className="space-y-3">
                        {groupRes.map(res => {
                          const steps = groupMemberSteps[res.id] || {
                            identityVerified: false,
                            registrationSigned: false,
                            depositCollected: false,
                            paymentAuthorized: false,
                            keyEncoded: false,
                          };
                          const balance = (res.total_amount || 0) - (res.deposit_amount || 0);
                          const roomNumber = res.room_number || 'Unassigned';
                          const allRequiredDone = steps.identityVerified && steps.registrationSigned && steps.keyEncoded;

                          return (
                            <div key={res.id} className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                              {/* Member info header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{res.guest_name}</h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{res.id}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <BedDouble className="w-3.5 h-3.5" /> {res.room_type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Key className="w-3.5 h-3.5" /> Room: {roomNumber}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" /> {res.adults || 1} adults, {res.children || 0} children
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ${balance > 0 ? balance.toFixed(2) : '0.00'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                                </div>
                              </div>

                              {/* Check-In Checklist (same 5 steps as individual) */}
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${steps.identityVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                  <Shield className={`w-4 h-4 ${steps.identityVerified ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Identity</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Passport/ID *</div>
                                  </div>
                                  {steps.identityVerified && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${steps.registrationSigned ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                  <Pen className={`w-4 h-4 ${steps.registrationSigned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Registration</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Signature *</div>
                                  </div>
                                  {steps.registrationSigned && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${steps.depositCollected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                  <DollarSign className={`w-4 h-4 ${steps.depositCollected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Deposit</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Optional</div>
                                  </div>
                                  {steps.depositCollected && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${steps.paymentAuthorized ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                  <CreditCard className={`w-4 h-4 ${steps.paymentAuthorized ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Payment</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Optional</div>
                                  </div>
                                  {steps.paymentAuthorized && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${steps.keyEncoded ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                                  <Key className={`w-4 h-4 ${steps.keyEncoded ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Key</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Room key *</div>
                                  </div>
                                  {steps.keyEncoded && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />}
                                </div>
                              </div>

                              {/* Action Buttons (same as individual check-in) */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleGroupMemberScanDocument(res)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                                      steps.identityVerified
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    <Scan className="w-3.5 h-3.5" />
                                    {steps.identityVerified ? 'Verified' : 'Scan Document'}
                                  </button>
                                  <button
                                    onClick={() => handleGroupMemberStepToggle(res.id, 'registrationSigned')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                                      steps.registrationSigned
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <Pen className="w-3.5 h-3.5" />
                                    {steps.registrationSigned ? 'Signed' : 'Sign Registration'}
                                  </button>
                                  <button
                                    onClick={() => handleGroupMemberProcessPayment(res.id, balance)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                                      steps.paymentAuthorized
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    {steps.paymentAuthorized ? 'Authorized' : 'Process Payment'}
                                  </button>
                                  {!steps.paymentAuthorized && (
                                    <button
                                      onClick={() => handleGroupMemberStepToggle(res.id, 'paymentAuthorized')}
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xs"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      Skip Payment
                                    </button>
                                  )}
                                  {!steps.depositCollected && (
                                    <button
                                      onClick={() => handleGroupMemberStepToggle(res.id, 'depositCollected')}
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xs"
                                    >
                                      <DollarSign className="w-3.5 h-3.5" />
                                      Skip Deposit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleGroupMemberStepToggle(res.id, 'keyEncoded')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                                      steps.keyEncoded
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                    {steps.keyEncoded ? 'Encoded' : 'Encode Key'}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePrintRegistration(res.id)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    Print
                                  </button>
                                  {allRequiredDone && (
                                    <button
                                      onClick={() => handleGroupMemberCompleteCheckIn(res.id, roomNumber === 'Unassigned' ? '' : roomNumber)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      Complete Check-In
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

              {/* ── Individual pending check-ins (excluding group members) ── */}
              {checkIns
                .filter(ci => !ci.groupBookingId && !ci.bookingGroupId)
                .map((checkIn) => (
              <div key={checkIn.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{checkIn.guestName}</h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[checkIn.status]}`}>
                        {checkIn.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Reservation:</span>
                        <span className="text-gray-900 dark:text-white">{checkIn.reservationId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Room:</span>
                        <span className="text-gray-900 dark:text-white">{checkIn.roomNumber} ({checkIn.roomType})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Check-In:</span>
                        <span className="text-gray-900 dark:text-white">{checkIn.checkInTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Guests:</span>
                        <span className="text-gray-900 dark:text-white">{checkIn.adults} adults, {checkIn.children} children</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${checkIn.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${checkIn.balance}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                  </div>
                </div>

                {/* Check-In Checklist */}
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Check-In Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkIn.identityVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                      <Shield className={`w-5 h-5 ${checkIn.identityVerified ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Identity Verified</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Passport/ID scan *</div>
                      </div>
                      {checkIn.identityVerified && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                    </div>

                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkIn.registrationSigned ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                      <Pen className={`w-5 h-5 ${checkIn.registrationSigned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Registration Signed</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Digital signature *</div>
                      </div>
                      {checkIn.registrationSigned && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                    </div>

                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkIn.depositCollected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                      <DollarSign className={`w-5 h-5 ${checkIn.depositCollected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Deposit Collected</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Security deposit (optional)</div>
                      </div>
                      {checkIn.depositCollected && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                    </div>

                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkIn.paymentAuthorized ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                      <CreditCard className={`w-5 h-5 ${checkIn.paymentAuthorized ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Payment Authorized</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Payment method (optional)</div>
                      </div>
                      {checkIn.paymentAuthorized && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                    </div>

                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkIn.keyEncoded ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'}`}>
                      <Key className={`w-5 h-5 ${checkIn.keyEncoded ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Key Encoded</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Room key card *</div>
                      </div>
                      {checkIn.keyEncoded && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenDocumentModal(checkIn)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        checkIn.identityVerified 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Scan className="w-4 h-4" />
                      {checkIn.identityVerified ? 'Document Verified' : 'Scan Document'}
                    </button>
                    <button 
                      onClick={() => handleSignRegistration(checkIn.reservationId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        checkIn.registrationSigned 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Pen className="w-4 h-4" />
                      {checkIn.registrationSigned ? 'Registration Signed' : 'Sign Registration'}
                    </button>
                    <button 
                      onClick={() => handleProcessPayment(checkIn.reservationId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        checkIn.paymentAuthorized 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {checkIn.paymentAuthorized ? 'Payment Authorized' : 'Process Payment'}
                    </button>
                    {!checkIn.paymentAuthorized && (
                      <button 
                        onClick={() => handleSkipPayment(checkIn.reservationId)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        Skip Payment
                      </button>
                    )}
                    {!checkIn.depositCollected && (
                      <button 
                        onClick={() => handleSkipDeposit(checkIn.reservationId)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm"
                      >
                        <DollarSign className="w-4 h-4" />
                        Skip Deposit
                      </button>
                    )}
                    <button 
                      onClick={() => handleEncodeKey(checkIn.reservationId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        checkIn.keyEncoded 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      {checkIn.keyEncoded ? 'Key Encoded' : 'Encode Key'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePrintRegistration(checkIn.reservationId)}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print Registration
                    </button>
                    {checkIn.identityVerified && checkIn.registrationSigned && checkIn.keyEncoded && (
                      <button 
                        onClick={() => handleCompleteCheckIn(checkIn.reservationId, checkIn.roomNumber)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        Complete Check-In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          }
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Passport Scanner</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Quickly scan and verify guest identity documents</p>
          <button 
            onClick={async () => {
              if (selectedReservationId) {
                await handleScanDocument(selectedReservationId);
              } else if (checkIns.length > 0) {
                await handleScanDocument(checkIns[0].reservationId);
              } else {
                alert('Please select a reservation from the list above to scan documents');
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Open Scanner
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Key Encoder</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Encode room key cards for guest access</p>
          <button 
            onClick={async () => {
              if (selectedReservationId) {
                await handleEncodeKey(selectedReservationId);
              } else if (checkIns.length > 0) {
                await handleEncodeKey(checkIns[0].reservationId);
              } else {
                alert('Please select a reservation from the list above to encode keys');
              }
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Open Encoder
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Printer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Registration Card</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Print registration cards for guest signature</p>
          <button 
            onClick={async () => {
              if (selectedReservationId) {
                await handlePrintRegistration(selectedReservationId);
              } else if (checkIns.length > 0) {
                // If no specific reservation selected, print the first one
                await handlePrintRegistration(checkIns[0].reservationId);
              } else {
                alert('Please select a reservation from the list above to print its registration card');
              }
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Print Card
          </button>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && selectedCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload ID Document - {selectedCheckIn.guestName}
              </h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Recognition banner: ID already on file in guest profile */}
              {existingIdOnFile && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      ID document already on file — identity verified
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                      This guest's ID was recognized from their profile
                      {docNumber && <> (#{docNumber})</>}. Identity verification has been automatically marked as complete. Review the details below and upload new images only if you need to replace the existing ones.
                    </p>
                  </div>
                </div>
              )}

              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Drivers License">Driver's License</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document number"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Date (Optional)
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Issuing Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issuing Country (Optional)
                </label>
                <input
                  type="text"
                  value={issuingCountry}
                  onChange={(e) => setIssuingCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., US, UK, CA"
                />
              </div>

              {/* Document Images */}
              <div className="grid grid-cols-2 gap-4">
                {/* Front Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Front of Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
                    {frontPreview ? (
                      <div className="relative">
                        <img
                          src={frontPreview}
                          alt="Front of ID"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={() => {
                            setFrontPreview(null);
                            setFrontFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-700">Choose file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFrontFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Back of Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
                    {backPreview ? (
                      <div className="relative">
                        <img
                          src={backPreview}
                          alt="Back of ID"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={() => {
                            setBackPreview(null);
                            setBackFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-700">Choose file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={uploading || !docNumber || !expiryDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;