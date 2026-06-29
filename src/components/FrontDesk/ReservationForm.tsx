/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, AlertCircle, X } from 'lucide-react';
import { reservationSchema, ReservationFormData } from '../../schemas/reservationSchema';
import {
  RoomType,
  RatePlan,
  Package,
  Reservation,
  CorporateAccount,
  Room,
  RoomTypeDetail
} from '../../types/erp';
import { calculateNights } from '../../utils/billing';
import { toISODate } from '../../utils/date';
import BookingTypeSelector from './BookingTypeSelector';
import GuestProfileSection from './GuestProfileSection';
import StayTimelineSection from './StayTimelineSection';
import TaxComplianceSection from './TaxComplianceSection';
import RatePlanSection from './RatePlanSection';
import TariffSummarySection from './TariffSummarySection';
import NotesSection from './NotesSection';
import DepositSection from './DepositSection';
import RoomSelectionSection from './RoomSelectionSection';

interface ReservationFormProps {
  initialData: Partial<ReservationFormData> | null;
  onSubmit: (data: ReservationFormData) => void;
  onCancel: () => void;
  ratePlans: RatePlan[];
  packages: Package[];
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
}

export default function ReservationForm({
  initialData,
  onSubmit,
  onCancel,
  ratePlans,
  packages,
  corporateAccounts,
  rooms,
  roomTypes,
  currency,
  formatAmount,
  getYieldMultiplier,
  getSeasonalMultiplier,
  getDailyRateForType,
  currentSystemDate,
  getTypeAvailability
}: ReservationFormProps) {
  // Get unique room types from rooms
  const uniqueRoomTypes = Array.from(new Set(rooms.map(r => r.type))).sort() as string[];

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
      notes: initialData.notes || '',
      depositAmount: initialData.depositAmount || 0,
      isDepositPaid: initialData.isDepositPaid || false,
      ratePlanId: initialData.ratePlanId || 'RP-STD',
      packageIds: initialData.packageIds || [],
      additionalGuestIds: initialData.additionalGuestIds || [],
      guestTin: initialData.guestTin || '',
      guestVatNo: initialData.guestVatNo || '',
      guestVatDate: initialData.guestVatDate || '',
      bookingType: initialData.bookingType || 'Individual',
      bookingGroupId: initialData.bookingGroupId || '',
      groupName: initialData.groupName || '',
      numberOfRooms: initialData.numberOfRooms || 1,
      corporateAccountId: initialData.corporateAccountId || '',
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
      notes: '',
      depositAmount: 0,
      isDepositPaid: false,
      ratePlanId: 'RP-STD',
      packageIds: [],
      additionalGuestIds: [],
      guestTin: '',
      guestVatNo: '',
      guestVatDate: '',
      bookingType: 'Individual',
      bookingGroupId: '',
      groupName: '',
      numberOfRooms: 1,
      corporateAccountId: '',
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
        notes: '',
        depositAmount: 0,
        isDepositPaid: false,
        ratePlanId: 'RP-STD',
        packageIds: [],
        additionalGuestIds: [],
        guestTin: '',
        guestVatNo: '',
        guestVatDate: '',
        bookingType: 'Individual',
        bookingGroupId: '',
        groupName: '',
        numberOfRooms: 1,
        corporateAccountId: '',
        roomSelections: [],
      });
    }
  }, [initialData, reset]);

  const setFieldValue = useCallback((field: keyof ReservationFormData, value: any) => {
    setValue(field, value, { shouldValidate: true });
  }, [setValue]);

  const calculateTotal = () => {
    const { checkInDate, checkOutDate, roomSelections, roomType, ratePlanId, promoCode, packageIds } = formData;
    if (!checkInDate || !checkOutDate) return { nights: 0, roomTotal: 0, packageTotal: 0, grandTotal: 0 };

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
      const dailyBase = getDailyRateForType(type as RoomType, ratePlanId, promoCode);
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

    return {
      nights,
      roomTotal,
      packageTotal: Math.round(packageTotal),
      grandTotal: Math.round(roomTotal + packageTotal),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Validation Error Summary */}
      {errorMessages.length > 0 && (
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
              <span className="font-bold">Please correct the following before submitting:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {errorMessages.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Guest & Room info */}
        <div className="space-y-4">
          <BookingTypeSelector
            bookingType={formData.bookingType}
            corporateAccounts={corporateAccounts}
            groupName={formData.groupName}
            bookingGroupId={formData.bookingGroupId}
            corporateAccountId={formData.corporateAccountId}
            onBookingTypeChange={(value) => setFieldValue('bookingType', value)}
            onGroupNameChange={(value) => setFieldValue('groupName', value)}
            onBookingGroupIdChange={(value) => setFieldValue('bookingGroupId', value)}
            onCorporateAccountIdChange={(value) => setFieldValue('corporateAccountId', value)}
          />

          <GuestProfileSection
            guestName={formData.guestName}
            guestEmail={formData.guestEmail}
            guestPhone={formData.guestPhone}
            channel={formData.channel}
            onGuestNameChange={(value) => setFieldValue('guestName', value)}
            onGuestEmailChange={(value) => setFieldValue('guestEmail', value)}
            onGuestPhoneChange={(value) => setFieldValue('guestPhone', value)}
            onChannelChange={(value) => setFieldValue('channel', value)}
            errors={{
              guestName: errors.guestName?.message,
              guestEmail: errors.guestEmail?.message,
            }}
          />

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

          <TaxComplianceSection
            guestTin={formData.guestTin}
            guestVatNo={formData.guestVatNo}
            guestVatDate={formData.guestVatDate}
            onGuestTinChange={(value) => setFieldValue('guestTin', value)}
            onGuestVatNoChange={(value) => setFieldValue('guestVatNo', value)}
            onGuestVatDateChange={(value) => setFieldValue('guestVatDate', value)}
            currentSystemDate={currentSystemDate}
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

        {/* Right Side: Rates, Packages, Summary */}
        <div className="space-y-4">
          <RatePlanSection
            ratePlanId={formData.ratePlanId}
            promoCode={formData.promoCode}
            packageIds={formData.packageIds}
            ratePlans={ratePlans}
            packages={packages}
            onRatePlanChange={(value) => setFieldValue('ratePlanId', value)}
            onPromoCodeChange={(value) => setFieldValue('promoCode', value)}
            onPackageIdsChange={(value) => setFieldValue('packageIds', value)}
            formatAmount={formatAmount}
          />

          <RoomSelectionSection
            roomType={formData.roomType || 'Double'}
            roomSelections={formData.roomSelections || []}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            currentSystemDate={currentSystemDate}
            uniqueRoomTypes={uniqueRoomTypes}
            rooms={rooms}
            roomTypes={roomTypes}
            getTypeAvailability={getTypeAvailability}
            onRoomTypeChange={(value) => setFieldValue('roomType', value)}
            onRoomSelectionsChange={(value) => setFieldValue('roomSelections', value as Array<{ roomType: RoomType; count: number; roomNumbers?: string[] }>)}
            nights={totals.nights}
            errors={{
              roomType: errors.roomType?.message,
              roomSelections: errors.roomSelections?.message,
            }}
          />

          <TariffSummarySection
            nights={totals.nights}
            roomTotal={totals.roomTotal}
            packageTotal={totals.packageTotal}
            grandTotal={totals.grandTotal}
            formatAmount={formatAmount}
            roomBreakdown={totals.roomBreakdown}
          />
        </div>
      </div>

      <NotesSection
        notes={formData.notes}
        onNotesChange={(value) => setFieldValue('notes', value)}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35, ease: 'easeOut' }}
        className="flex justify-end gap-3 pt-5 border-t border-slate-200/60 dark:border-slate-700"
      >
        <div className="relative">
          {showDiscardConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/20 z-10"
            >
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-2">Unsaved changes will be lost. Discard anyway?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
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
            className="px-6 py-2.5 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-sm dark:hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            Discard Changes
          </button>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          title={!isValid ? 'Fix validation errors before submitting' : undefined}
          className="px-8 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 border border-slate-700 text-white font-sans font-bold text-xs rounded-xl hover:shadow-lg active:scale-[0.98] shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm"
        >
          {isSubmitting ? 'Synchronizing...' : initialData?.id ? 'Commit Updates to PMS' : 'Finalize Reservation'}
          <ArrowRight size={14} />
        </button>
      </motion.div>
    </form>
  );
}