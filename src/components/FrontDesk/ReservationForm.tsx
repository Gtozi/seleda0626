/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, AlertCircle, X, User, Calendar, Receipt, Package as PackageIcon, ShoppingBag } from 'lucide-react';
import { reservationSchema, ReservationFormData } from '../../schemas/reservationSchema';
import {
  RoomType,
  Package,
  GuestService,
  Reservation,
  CorporateAccount,
  Room,
  RoomTypeDetail,
  GlobalHotelSettings
} from '../../types/erp';
import { calculateNights } from '../../utils/billing';
import { computeFees } from '../../utils/pricing';
import { toISODate } from '../../utils/date';
import BookingTypeSelector from './BookingTypeSelector';
import GuestProfileSection from './GuestProfileSection';
import StayTimelineSection from './StayTimelineSection';
import TaxComplianceSection from './TaxComplianceSection';
import AddOnsSection from './AddOnsSection';
import TariffSummarySection from './TariffSummarySection';
import DepositSection from './DepositSection';
import RoomSelectionSection from './RoomSelectionSection';
import RoomSelectionCart from './RoomSelectionCart';

interface ReservationFormProps {
  initialData: Partial<ReservationFormData> | null;
  onSubmit: (data: ReservationFormData) => void;
  onCancel: () => void;
  packages: Package[];
  guestServices: GuestService[];
  corporateAccounts: CorporateAccount[];
  rooms: Room[];
  roomTypes: RoomTypeDetail[];
  currency: string;
  formatAmount: (amount: number) => string;
  getYieldMultiplier: () => number;
  getSeasonalMultiplier: (date: string) => number;
  getDailyRateForType: (type: RoomType, ratePlanId?: string, promoCode?: string) => number;
  currentSystemDate: string;
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string) => { available: number };
  globalHotelSettings?: GlobalHotelSettings;
}

export default function ReservationForm({
  initialData,
  onSubmit,
  onCancel,
  packages,
  guestServices,
  corporateAccounts,
  rooms,
  roomTypes,
  currency,
  formatAmount,
  getYieldMultiplier,
  getSeasonalMultiplier,
  getDailyRateForType,
  currentSystemDate,
  getTypeAvailability,
  globalHotelSettings,
}: ReservationFormProps) {
  // Get base rate for room type from actual rooms
  const getBaseRate = (roomType: string) => {
    const roomOfType = rooms.find(r => r.type === roomType);
    return roomOfType?.rate || 150;
  };

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    mode: 'onChange',
    defaultValues: initialData ? {
      guestName: initialData.guestName,
      guestEmail: initialData.guestEmail,
      guestPhone: initialData.guestPhone || '',
      roomType: initialData.roomType || 'Double',
      checkInDate: initialData.checkInDate,
      checkOutDate: initialData.checkOutDate,
      adults: initialData.adults,
      children: initialData.children,
      channel: initialData.channel,
      specialRequests: initialData.specialRequests || '',
      depositAmount: initialData.depositAmount || 0,
      isDepositPaid: initialData.isDepositPaid || false,
      ratePlanId: initialData.ratePlanId || 'RP-STD',
      packageIds: initialData.packageIds || [],
      guestServiceIds: initialData.guestServiceIds || [],
      additionalGuestIds: initialData.additionalGuestIds || [],
      guestNationality: initialData.guestNationality || '',
      guestTin: initialData.guestTin || '',
      guestVatNo: initialData.guestVatNo || '',
      guestVatDate: initialData.guestVatDate || '',
      bookingType: initialData.bookingType || 'Individual',
      bookingGroupId: initialData.bookingGroupId || '',
      groupName: initialData.groupName || '',
      numberOfRooms: initialData.numberOfRooms || 1,
      corporateAccountId: initialData.corporateAccountId || '',
      operatorId: initialData.operatorId || '',
      voucherCode: initialData.voucherCode || '',
      voucherDiscount: initialData.voucherDiscount || 0,
      roomSelections: initialData.roomSelections || [],
    } : {
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomType: 'Double',
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      channel: 'Walk-In',
      specialRequests: '',
      depositAmount: 0,
      isDepositPaid: false,
      ratePlanId: 'RP-STD',
      packageIds: [],
      guestServiceIds: [],
      additionalGuestIds: [],
      guestNationality: '',
      guestTin: '',
      guestVatNo: '',
      guestVatDate: '',
      bookingType: 'Individual',
      bookingGroupId: '',
      groupName: '',
      numberOfRooms: 1,
      corporateAccountId: '',
      operatorId: '',
      voucherCode: '',
      voucherDiscount: 0,
      roomSelections: [],
    },
  });

  const formData = useWatch({ control });

  // Reset form when initialData changes (handles modal reuse without unmount)
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        roomType: 'Double',
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        children: 0,
        channel: 'Walk-In',
        specialRequests: '',
        depositAmount: 0,
        isDepositPaid: false,
        ratePlanId: 'RP-STD',
        packageIds: [],
        guestServiceIds: [],
        additionalGuestIds: [],
        guestNationality: '',
        guestTin: '',
        guestVatNo: '',
        guestVatDate: '',
        bookingType: 'Individual',
        bookingGroupId: '',
        groupName: '',
        numberOfRooms: 1,
        corporateAccountId: '',
        operatorId: '',
        voucherCode: '',
        voucherDiscount: 0,
        roomSelections: [],
      });
    }
    setCurrentStep('stay');
    setTouchedSteps(new Set());
  }, [initialData, reset]);

  const setFieldValue = useCallback((field: keyof ReservationFormData, value: any) => {
    setValue(field, value, { shouldValidate: true });
  }, [setValue]);

  const [tourOperators, setTourOperators] = useState<any[]>([]);
  const [voucherError, setVoucherError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Load tour operators for B2B group bookings
  useEffect(() => {
    const loadTourOperators = async () => {
      try {
        const res = await fetch('/api/b2b/operators');
        if (res.ok) {
          const data = await res.json();
          setTourOperators(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load tour operators:', e);
      }
    };
    loadTourOperators();
  }, []);

  const applyVoucher = async () => {
    const code = (formData.voucherCode || '').trim();
    if (!code) return;
    setApplyingVoucher(true);
    setVoucherError('');
    try {
      const res = await fetch('/api/b2b/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucher_no: code }),
      });
      if (!res.ok) {
        const err = await res.json();
        setVoucherError(err.error || 'Invalid voucher');
        setFieldValue('voucherDiscount', 0);
      } else {
        const data = await res.json();
        const discount = data.discount_amount || data.net_value || 0;
        setFieldValue('voucherDiscount', Number(discount) || 0);
        setVoucherError('');
      }
    } catch (e) {
      setVoucherError('Failed to apply voucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const prevRoomCountRef = useRef<number | null>(null);

  // Auto-detect booking type from total room count
  useEffect(() => {
    const roomSelections = formData.roomSelections || [];
    const totalRooms = roomSelections.length > 0
      ? roomSelections.reduce((sum, rs) => sum + (rs.count || 0), 0)
      : 1;

    if (prevRoomCountRef.current === totalRooms) return;
    prevRoomCountRef.current = totalRooms;

    const currentType = formData.bookingType || 'Individual';
    if (currentType === 'Corporate') return;

    const newType = totalRooms > 1 ? 'Group' : 'Individual';
    if (newType !== currentType) {
      setFieldValue('bookingType', newType);
      if (newType === 'Individual') {
        setFieldValue('groupName', '');
        setFieldValue('bookingGroupId', '');
        setFieldValue('corporateAccountId', '');
      }
    }

    setFieldValue('numberOfRooms', totalRooms);
  }, [formData.roomSelections, formData.bookingType, setFieldValue]);

  const calculateTotal = () => {
    const { checkInDate, checkOutDate, roomSelections, roomType, ratePlanId, promoCode, packageIds, guestServiceIds } = formData;
    if (!checkInDate || !checkOutDate) return { nights: 0, roomTotal: 0, packageTotal: 0, serviceTotal: 0, grandTotal: 0 };

    const nights = calculateNights(checkInDate, checkOutDate);
    const start = new Date(checkInDate);

    // Sum across all selected room types and quantities
    const selections = roomSelections && roomSelections.length > 0
      ? roomSelections
      : [{ roomType: roomType || 'Double', count: 1 }];

    let roomTotal = 0;
    const roomBreakdown: Array<{ roomType: string; count: number; subtotal: number }> = [];
    for (const selection of selections) {
      const type = selection.roomType || roomType || 'Double';
      const count = selection.count || 1;
      const dailyBase = getDailyRateForType(type as RoomType, ratePlanId || 'RP-STD', promoCode);
      let typeNightlyTotal = 0;
      for (let i = 0; i < nights; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const multi = getSeasonalMultiplier(toISODate(d));
        typeNightlyTotal += dailyBase * multi * getYieldMultiplier();
      }
      const typeTotal = Math.round(typeNightlyTotal * count);
      roomTotal += typeTotal;
      roomBreakdown.push({ roomType: type, count, subtotal: typeTotal });
    }
    roomTotal = Math.round(roomTotal);

    let packageTotal = 0;
    packageIds?.forEach(id => {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        packageTotal += pkg.chargeFrequency === 'daily' ? pkg.price * nights : pkg.price;
      }
    });

    let serviceTotal = 0;
    guestServiceIds?.forEach(id => {
      const svc = guestServices.find(s => s.id === id);
      if (svc) serviceTotal += svc.price;
    });

    const subtotal = roomTotal + packageTotal + serviceTotal;
    const fees = globalHotelSettings
      ? computeFees(subtotal, globalHotelSettings.feeComponents, globalHotelSettings.taxPercent, globalHotelSettings.serviceChargePercent)
      : { tax: 0, serviceCharge: 0, additionalFees: 0 };
    const grandTotal = Math.round(subtotal + fees.serviceCharge + fees.additionalFees + fees.tax);

    return {
      nights,
      roomTotal,
      packageTotal: Math.round(packageTotal),
      serviceTotal: Math.round(serviceTotal),
      tax: Math.round(fees.tax),
      serviceCharge: Math.round(fees.serviceCharge),
      additionalFees: Math.round(fees.additionalFees),
      grandTotal,
      roomBreakdown,
    };
  };

  // Auto-populate checkout to +1 day when checkin is set and checkout is empty
  useEffect(() => {
    if (formData.checkInDate && !formData.checkOutDate) {
      const d = new Date(formData.checkInDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      setFieldValue('checkOutDate', toISODate(d));
    }
  }, [formData.checkInDate, formData.checkOutDate, setFieldValue]);

  const totals = calculateTotal();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Multi-step wizard state
  type Step = 'guest' | 'stay' | 'selection' | 'addons' | 'summary';
  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: 'stay', label: 'Stay & Rooms', icon: Calendar },
    { id: 'selection', label: 'Selection', icon: ShoppingBag },
    { id: 'guest', label: 'Guest', icon: User },
    { id: 'addons', label: 'Add-ons', icon: PackageIcon },
    { id: 'summary', label: 'Summary', icon: Receipt },
  ];
  const [currentStep, setCurrentStep] = useState<Step>('stay');
  const [touchedSteps, setTouchedSteps] = useState<Set<Step>>(new Set());
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const stepFields: Record<Step, (keyof ReservationFormData)[]> = {
    guest: ['guestName', 'guestEmail', 'groupName', 'channel', 'bookingType'],
    stay: ['checkInDate', 'checkOutDate', 'adults', 'roomType', 'roomSelections'],
    selection: ['roomSelections'],
    addons: [],
    summary: [],
  };

  const stepHasErrors = (step: Step) => {
    return stepFields[step].some(field => !!errors[field]);
  };

  const handleNext = async () => {
    setTouchedSteps(prev => new Set([...prev, currentStep]));
    const fields = stepFields[currentStep];
    const ok = fields.length === 0 ? true : await trigger(fields);
    if (ok && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const errorMessages = Object.entries(errors)
    .filter(([, err]) => err?.message)
    .map(([field, err]) => ({
      field,
      message: typeof err?.message === 'string' ? err.message : 'Invalid value',
    }));

  const handleDiscardClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  // Step-specific error messages
  const currentStepErrors = currentStep === 'summary'
    ? errorMessages
    : errorMessages.filter(err => stepFields[currentStep].includes(err.field as keyof ReservationFormData));
  const showStepErrors = currentStepErrors.length > 0 && touchedSteps.has(currentStep);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < currentStepIndex;
          const hasError = stepHasErrors(step.id) && touchedSteps.has(step.id);
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (idx <= currentStepIndex || touchedSteps.has(step.id)) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={idx > currentStepIndex && !touchedSteps.has(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : hasError
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-stone-50 text-stone-500 border-transparent hover:bg-stone-100'
                } ${idx > currentStepIndex && !touchedSteps.has(step.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-amber-200 text-amber-700'
                    : isCompleted
                    ? 'bg-emerald-200 text-emerald-700'
                    : hasError
                    ? 'bg-rose-200 text-rose-700'
                    : 'bg-stone-200 text-stone-500'
                }`}>
                  <step.icon size={12} />
                </span>
                {step.label}
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${idx < currentStepIndex ? 'bg-emerald-300' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step-specific error summary */}
      {showStepErrors && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono flex items-start gap-2.5 shadow-sm">
            <span className="p-1 bg-rose-500 rounded-full text-white shrink-0 mt-0.5">
              <AlertCircle size={12} className="stroke-[3]" />
            </span>
            <div className="space-y-1">
              <span className="font-bold">Please correct the following before continuing:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {currentStepErrors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {currentStep === 'guest' && (
          <div className="space-y-4">
            <BookingTypeSelector
              bookingType={formData.bookingType}
              corporateAccounts={corporateAccounts}
              bookingGroupId={formData.bookingGroupId}
              corporateAccountId={formData.corporateAccountId}
              onBookingTypeChange={(value) => setFieldValue('bookingType', value)}
              onBookingGroupIdChange={(value) => setFieldValue('bookingGroupId', value)}
              onCorporateAccountIdChange={(value) => setFieldValue('corporateAccountId', value)}
            />

            <GuestProfileSection
              bookingType={formData.bookingType}
              guestName={formData.guestName}
              guestEmail={formData.guestEmail}
              guestPhone={formData.guestPhone}
              guestNationality={formData.guestNationality}
              groupName={formData.groupName}
              specialRequests={formData.specialRequests}
              channel={formData.channel}
              cancellationGraceHours={globalHotelSettings?.cancellationGraceHours}
              cancellationPenaltyPercent={globalHotelSettings?.cancellationPenaltyPercent}
              tourOperators={tourOperators}
              operatorId={formData.operatorId}
              voucherCode={formData.voucherCode}
              voucherDiscount={formData.voucherDiscount}
              voucherError={voucherError}
              applyingVoucher={applyingVoucher}
              formatAmount={formatAmount}
              onGuestNameChange={(value) => setFieldValue('guestName', value)}
              onGuestEmailChange={(value) => setFieldValue('guestEmail', value)}
              onGuestPhoneChange={(value) => setFieldValue('guestPhone', value)}
              onGuestNationalityChange={(value) => setFieldValue('guestNationality', value)}
              onGroupNameChange={(value) => setFieldValue('groupName', value)}
              onSpecialRequestsChange={(value) => setFieldValue('specialRequests', value)}
              onChannelChange={(value) => setFieldValue('channel', value)}
              onOperatorIdChange={(value) => setFieldValue('operatorId', value)}
              onVoucherCodeChange={(value) => setFieldValue('voucherCode', value)}
              onApplyVoucher={applyVoucher}
              onClearVoucher={() => {
                setFieldValue('voucherCode', '');
                setFieldValue('voucherDiscount', 0);
                setVoucherError('');
              }}
              errors={{
                guestName: errors.guestName?.message,
                guestEmail: errors.guestEmail?.message,
                groupName: errors.groupName?.message,
              }}
            />

            <TaxComplianceSection
              guestTin={formData.guestTin}
              guestVatNo={formData.guestVatNo}
              guestVatDate={formData.guestVatDate}
              onGuestTinChange={(value) => setFieldValue('guestTin', value)}
              onGuestVatNoChange={(value) => setFieldValue('guestVatNo', value)}
              onGuestVatDateChange={(value) => setFieldValue('guestVatDate', value)}
              currentSystemDate={currentSystemDate}
            />
          </div>
        )}

        {currentStep === 'stay' && (
          <div className="space-y-4">
            <StayTimelineSection
              checkInDate={formData.checkInDate}
              checkOutDate={formData.checkOutDate}
              adults={formData.adults}
              children={formData.children}
              onCheckInDateChange={(value) => setFieldValue('checkInDate', value)}
              onCheckOutDateChange={(value) => setFieldValue('checkOutDate', value)}
              onAdultsChange={(value) => setFieldValue('adults', value)}
              onChildrenChange={(value) => setFieldValue('children', value)}
              currentSystemDate={currentSystemDate}
              errors={{
                checkOutDate: errors.checkOutDate?.message,
                adults: errors.adults?.message,
              }}
            />

            <RoomSelectionSection
              roomType={formData.roomType || 'Double'}
              roomSelections={formData.roomSelections || []}
              checkInDate={formData.checkInDate}
              checkOutDate={formData.checkOutDate}
              currentSystemDate={currentSystemDate}
              rooms={rooms}
              roomTypes={roomTypes}
              getTypeAvailability={getTypeAvailability}
              onRoomTypeChange={(value) => setFieldValue('roomType', value)}
              onRoomSelectionsChange={(value) => setFieldValue('roomSelections', value as Array<{ roomType: RoomType; count: number; roomNumbers?: string[]; roomNights?: string[][] }>)}
              nights={totals.nights}
              formatAmount={formatAmount}
              errors={{
                roomType: errors.roomType?.message,
                roomSelections: errors.roomSelections?.message,
              }}
            />
          </div>
        )}

        {currentStep === 'selection' && (
          <RoomSelectionCart
            roomSelections={formData.roomSelections || []}
            roomTypes={roomTypes}
            rooms={rooms}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            currentSystemDate={currentSystemDate}
            nights={totals.nights}
            formatAmount={formatAmount}
            getTypeAvailability={getTypeAvailability}
            onChange={(value) => setFieldValue('roomSelections', value as Array<{ roomType: RoomType; count: number; roomNumbers?: string[]; roomNights?: string[][] }>)}
          />
        )}

        {currentStep === 'addons' && (
          <AddOnsSection
            packageIds={formData.packageIds || []}
            guestServiceIds={formData.guestServiceIds || []}
            packages={packages}
            guestServices={guestServices}
            onPackageIdsChange={(value) => setFieldValue('packageIds', value)}
            onGuestServiceIdsChange={(value) => setFieldValue('guestServiceIds', value)}
            formatAmount={formatAmount}
          />
        )}

        {currentStep === 'summary' && (
          <div className="space-y-4">
            <TariffSummarySection
              nights={totals.nights}
              roomTotal={totals.roomTotal}
              packageTotal={totals.packageTotal}
              serviceTotal={totals.serviceTotal}
              tax={totals.tax}
              serviceCharge={totals.serviceCharge}
              additionalFees={totals.additionalFees}
              grandTotal={Math.max(0, totals.grandTotal - (formData.voucherDiscount || 0))}
              voucherDiscount={formData.voucherDiscount || 0}
              formatAmount={formatAmount}
              roomBreakdown={totals.roomBreakdown}
              packageIds={formData.packageIds || []}
              guestServiceIds={formData.guestServiceIds || []}
              packages={packages}
              guestServices={guestServices}
              checkInDate={formData.checkInDate}
              checkOutDate={formData.checkOutDate}
            />

            <DepositSection
              depositAmount={formData.depositAmount || 0}
              isDepositPaid={formData.isDepositPaid || false}
              currency={currency}
              formatAmount={formatAmount}
              onDepositAmountChange={(value) => setFieldValue('depositAmount', value)}
              onDepositPaidChange={(value) => setFieldValue('isDepositPaid', value)}
            />
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
        className="flex justify-between items-center gap-3 pt-5 border-t border-stone-200/60 dark:border-stone-700"
      >
        <div className="relative">
          {showDiscardConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-white dark:bg-stone-900/30 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg dark:shadow-stone-900/20 z-10"
            >
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-medium mb-2">Unsaved changes will be lost. Discard anyway?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-bold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDiscardConfirm(false); onCancel(); }}
                  className="flex-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}
          <button
            type="button"
            onClick={handleDiscardClick}
            className="px-6 py-2.5 bg-white dark:bg-stone-900/30 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-sans font-bold text-xs rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-200 hover:shadow-sm dark:hover:shadow-stone-900/20 active:scale-[0.98]"
          >
            Discard Changes
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 bg-white dark:bg-stone-900/30 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-sans font-bold text-xs rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-200 hover:shadow-sm dark:hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Back
            </button>
          )}
          {currentStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-sans font-bold text-xs rounded-xl hover:shadow-lg active:scale-[0.98] shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              title={!isValid ? 'Fix validation errors before submitting' : undefined}
              className="px-8 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-sans font-bold text-xs rounded-xl hover:shadow-lg active:scale-[0.98] shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:shadow-sm"
            >
              {isSubmitting ? 'Synchronizing...' : initialData?.id ? 'Commit Updates to PMS' : 'Finalize Reservation'}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </form>
  );
}