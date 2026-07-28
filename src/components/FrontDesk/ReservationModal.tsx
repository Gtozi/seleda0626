/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check } from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { Reservation } from '../../types/erp';
import ReservationForm from './ReservationForm';
import { ReservationFormData } from '../../schemas/reservationSchema';
import { RoomType, Package, GuestService, CorporateAccount, Room, RoomTypeDetail, GlobalHotelSettings } from '../../types/erp';

interface ReservationModalProps {
  isOpen: boolean;
  editingReservation: Reservation | null;
  prefillData?: ReservationFormData | null;
  successMsg: string;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  packages: Package[];
  guestServices: GuestService[];
  corporateAccounts: CorporateAccount[];
  editingGroupName?: string;
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

export default function ReservationModal({
  isOpen,
  editingReservation,
  prefillData,
  successMsg,
  onClose,
  onSubmit,
  packages,
  guestServices,
  corporateAccounts,
  editingGroupName,
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
}: ReservationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const title = editingReservation
    ? `Modify Reservation ${editingReservation.id}`
    : 'Create Booking';

  const subtitle = editingReservation
    ? `Updating details for ${editingReservation.guestName}. All changes will be audited in system logs.`
    : 'Fill guest details, select rooms and finalize the tariff.';

  const initialData = useMemo<Partial<ReservationFormData> | null>(() => {
    if (!editingReservation) return prefillData || null;
    const groupName = editingReservation.isGroup ? editingGroupName || undefined : undefined;
    return {
      id: editingReservation.id,
      guestName: editingReservation.guestName,
      guestEmail: editingReservation.guestEmail,
      guestPhone: editingReservation.guestPhone,
      roomType: editingReservation.roomType,
      checkInDate: editingReservation.checkInDate,
      checkOutDate: editingReservation.checkOutDate,
      adults: editingReservation.adults,
      children: editingReservation.children,
      channel: editingReservation.channel,
      depositAmount: editingReservation.depositAmount,
      isDepositPaid: editingReservation.isDepositPaid,
      ratePlanId: editingReservation.ratePlanId,
      packageIds: editingReservation.packageIds,
      guestServiceIds: editingReservation.guestServiceIds,
      additionalGuestIds: editingReservation.additionalGuestIds,
      guestNationality: editingReservation.guestNationality,
      guestTin: editingReservation.guestTin,
      guestVatNo: editingReservation.guestVatNo,
      guestVatDate: editingReservation.guestVatDate,
      specialRequests: editingReservation.notes,
      bookingType: editingReservation.isGroup ? 'Group' : editingReservation.corporateAccountId ? 'Corporate' : 'Individual',
      bookingGroupId: editingReservation.bookingGroupId,
      groupName,
      corporateAccountId: editingReservation.corporateAccountId,
      operatorId: editingReservation.operatorId || editingReservation.operator_id,
      voucherCode: editingReservation.voucherCode,
      voucherDiscount: editingReservation.voucherDiscount,
      roomSelections: editingReservation.roomNumber
        ? [{ roomType: editingReservation.roomType, count: 1, roomNumbers: [editingReservation.roomNumber], roomNights: editingReservation.roomNights || [] }]
        : [],
    };
  }, [editingReservation, prefillData, editingGroupName]);

  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<Sparkles size={20} className="text-amber-600" />}
      variant="form"
      size="xl"
      showFooter={false}
    >
            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-white dark:from-stone-900/30 to-stone-50/20 dark:to-stone-900/20">
              <AnimatePresence mode="wait">
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="shrink-0 px-6 pt-4 overflow-hidden"
                  >
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2.5 shadow-sm">
                      <span className="p-1 bg-emerald-500 rounded-full text-white shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                      <div>
                        <span className="font-bold">Transaction Success:</span>{' '}
                        {successMsg}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReservationForm
                      initialData={initialData}
                      onSubmit={onSubmit}
                      onCancel={onClose}
                      packages={packages}
                      guestServices={guestServices}
                      corporateAccounts={corporateAccounts}
                      rooms={rooms}
                      roomTypes={roomTypes}
                      currency={currency}
                      formatAmount={formatAmount}
                      getYieldMultiplier={getYieldMultiplier}
                      getSeasonalMultiplier={getSeasonalMultiplier}
                      getDailyRateForType={getDailyRateForType}
                      currentSystemDate={currentSystemDate}
                      getTypeAvailability={getTypeAvailability}
                      globalHotelSettings={globalHotelSettings}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
    </ModalSystem>
  );
}
