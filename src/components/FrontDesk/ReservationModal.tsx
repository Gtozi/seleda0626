/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Calendar, Tag, Grid3x3 } from 'lucide-react';
import { Reservation } from '../../types/erp';
import ReservationForm from './ReservationForm';
import ModernCalendar from './ModernCalendar';
import { ReservationFormData } from '../../schemas/reservationSchema';
import { RoomType, RatePlan, Package, CorporateAccount, Room } from '../../types/erp';

interface ReservationModalProps {
  isOpen: boolean;
  editingReservation: Reservation | null;
  prefillData?: ReservationFormData | null;
  successMsg: string;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  ratePlans: RatePlan[];
  packages: Package[];
  corporateAccounts: CorporateAccount[];
  rooms: Room[];
  reservations: Reservation[];
  currency: string;
  formatAmount: (amount: number) => string;
  getYieldMultiplier: () => number;
  getSeasonalMultiplier: (date: string) => number;
  getDailyRateForType: (type: RoomType, ratePlanId?: string, promoCode?: string) => number;
  currentSystemDate: string;
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string) => { available: number };
  onReservationClick?: (reservation: Reservation) => void;
}

export default function ReservationModal({
  isOpen,
  editingReservation,
  prefillData,
  successMsg,
  onClose,
  onSubmit,
  ratePlans,
  packages,
  corporateAccounts,
  rooms,
  reservations,
  currency,
  formatAmount,
  getYieldMultiplier,
  getSeasonalMultiplier,
  getDailyRateForType,
  currentSystemDate,
  getTypeAvailability,
  onReservationClick,
}: ReservationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'outlook' | 'rates'>('form');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(new Date(currentSystemDate));

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="bg-gradient-to-br from-white to-slate-50/30 rounded-3xl border border-slate-200/80 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 px-6 py-5 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
              <div className="min-w-0">
                <h3
                  id="reservation-modal-title"
                  className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2.5"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 shadow-sm">
                    <Sparkles size={14} />
                  </span>
                  {title}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5 truncate">
                  {subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 ml-4 p-2 hover:bg-slate-200/80 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40 hover:shadow-sm"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="shrink-0 px-6 py-3 border-b border-slate-200/60 bg-white flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'form'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Sparkles size={14} />
                Booking Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outlook')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'outlook'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Calendar size={14} />
                Room Outlook
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rates')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'rates'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Tag size={14} />
                Rate Plans
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-white to-slate-50/20">
              <AnimatePresence mode="wait">
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="shrink-0 px-6 pt-4 overflow-hidden"
                  >
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono flex items-center gap-2.5 shadow-sm">
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
                  {activeTab === 'form' && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ReservationForm
                initialData={
                  editingReservation
                    ? {
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
                        notes: editingReservation.notes,
                        depositAmount: editingReservation.depositAmount,
                        isDepositPaid: editingReservation.isDepositPaid,
                        ratePlanId: editingReservation.ratePlanId,
                        packageIds: editingReservation.packageIds,
                        additionalGuestIds: editingReservation.additionalGuestIds,
                        guestTin: editingReservation.guestTin,
                        guestVatNo: editingReservation.guestVatNo,
                        guestVatDate: editingReservation.guestVatDate,
                        bookingType: editingReservation.isGroup ? 'Group' : editingReservation.corporateAccountId ? 'Corporate' : 'Individual',
                        bookingGroupId: editingReservation.bookingGroupId,
                        groupName: undefined,
                        corporateAccountId: editingReservation.corporateAccountId,
                        roomSelections: editingReservation.roomNumber ? [{ roomType: editingReservation.roomType, count: 1, roomNumbers: [editingReservation.roomNumber] }] : [],
                      }
                    : prefillData || null
                }
                onSubmit={onSubmit}
                onCancel={onClose}
                ratePlans={ratePlans}
                packages={packages}
                corporateAccounts={corporateAccounts}
                rooms={rooms}
                currency={currency}
                formatAmount={formatAmount}
                getYieldMultiplier={getYieldMultiplier}
                getSeasonalMultiplier={getSeasonalMultiplier}
                getDailyRateForType={getDailyRateForType}
                currentSystemDate={currentSystemDate}
                      getTypeAvailability={getTypeAvailability}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'outlook' && (
                    <motion.div
                      key="outlook"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ModernCalendar
                        rooms={rooms}
                        reservations={reservations}
                        currentSystemDate={currentSystemDate}
                        onReservationClick={onReservationClick || (() => {})}
                        selectedDate={calendarSelectedDate}
                        onSelectedDateChange={setCalendarSelectedDate}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'rates' && (
                    <motion.div
                      key="rates"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600">
                            <Tag size={14} />
                          </span>
                          Available Rate Plans
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ratePlans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`p-4 rounded-xl border transition-all ${
                                plan.active
                                  ? 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
                                  : 'bg-slate-50 border-slate-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="text-xs font-bold text-slate-900">{plan.name}</h5>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    plan.active
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {plan.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mb-2">{plan.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-600">
                                  {plan.baseModifier > 1 ? '+' : ''}{((plan.baseModifier - 1) * 100).toFixed(0)}%
                                </span>
                                <span className="text-[10px] text-slate-400">rate modifier</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {ratePlans.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            No rate plans configured. Contact administrator to set up rate plans.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
