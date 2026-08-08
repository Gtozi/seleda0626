/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bed, Minus, Plus, Users, Ruler, CheckCircle2, ChevronDown } from 'lucide-react';
import { Room, RoomTypeDetail } from '../../types/erp';

interface RoomSelection {
  roomType?: string;
  count?: number;
  roomNumbers?: string[];
  roomNights?: string[][];
}

interface RoomSelectionSectionProps {
  roomType: string;
  roomSelections: RoomSelection[];
  checkInDate?: string;
  checkOutDate?: string;
  currentSystemDate: string;
  rooms: Room[];
  roomTypes: RoomTypeDetail[];
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string) => { available: number };
  onRoomTypeChange: (type: string) => void;
  onRoomSelectionsChange: (selections: RoomSelection[]) => void;
  nights: number;
  formatAmount: (amount: number) => string;
  errors?: {
    roomType?: string;
    roomSelections?: string;
  };
}

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, min = 0, max = Infinity, onChange, size = 'md' }) => {
  const buttonSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 12 : 14;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
        disabled={value <= min}
        className={`${buttonSize} rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition`}
      >
        <Minus size={iconSize} />
      </button>
      <span className={`text-center font-semibold text-slate-900 ${size === 'sm' ? 'w-4 text-xs' : 'w-6 text-sm'}`}>{value}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
        disabled={value >= max}
        className={`${buttonSize} rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition`}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
};

export default function RoomSelectionSection({
  roomType,
  roomSelections,
  checkInDate,
  checkOutDate,
  currentSystemDate,
  rooms,
  roomTypes,
  getTypeAvailability,
  onRoomTypeChange,
  onRoomSelectionsChange,
  nights,
  formatAmount,
  errors,
}: RoomSelectionSectionProps) {
  const [expandedRoom, setExpandedRoom] = React.useState<string | null>(null);
  const effectiveCheckIn = checkInDate || currentSystemDate;
  const effectiveCheckOut = checkOutDate || (() => {
    const d = new Date(currentSystemDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const getQuantity = (type: string) =>
    roomSelections.find(s => s.roomType === type)?.count || 0;

  const normalizeRoomNights = (existing: string[][] | undefined, count: number): string[][] => {
    if (nights <= 0 || count <= 0) return [];
    const rows: string[][] = [];
    for (let i = 0; i < nights; i++) {
      const existingRow = existing?.[i] || [];
      const row: string[] = [];
      for (let j = 0; j < count; j++) {
        row.push(existingRow[j] || '');
      }
      rows.push(row);
    }
    return rows;
  };

  const handleSetQuantity = (type: string, quantity: number) => {
    const availability = getTypeAvailability(type, effectiveCheckIn, effectiveCheckOut);
    const max = availability.available;
    const currentSelections = roomSelections || [];

    if (quantity > max) {
      alert(`Only ${max} ${type} room(s) available.`);
      quantity = max;
    }

    if (quantity <= 0) {
      onRoomSelectionsChange(currentSelections.filter(s => s.roomType !== type));
      return;
    }

    const existingIndex = currentSelections.findIndex(s => s.roomType === type);
    if (existingIndex >= 0) {
      onRoomSelectionsChange(
        currentSelections.map((s, i) =>
          i === existingIndex ? { ...s, count: quantity, roomNights: normalizeRoomNights(s.roomNights, quantity) } : s
        )
      );
    } else {
      onRoomSelectionsChange([...currentSelections, { roomType: type, count: quantity, roomNumbers: [], roomNights: normalizeRoomNights([], quantity) }]);
    }

    if (type !== roomType) {
      onRoomTypeChange(type);
    }
  };

  const getBaseRate = (type: string) => {
    const roomOfType = rooms.find(r => r.type === type);
    return roomOfType?.rate || roomTypes.find(rt => rt.name === type || rt.id === type)?.basePrice || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Bed size={18} className="text-indigo-500" /> Select your room
        </h2>
        <span className="text-xs text-slate-500 font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
      </div>

      {roomTypes.filter(rt => rt.isActive).length === 0 ? (
        <div className="text-center py-14 bg-white border border-slate-200 rounded-xl">
          <Bed size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No rooms available for the selected dates.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your dates or contact the hotel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {roomTypes.filter(rt => rt.isActive).map((rt, index) => {
              const quantity = getQuantity(rt.name);
              const available = getTypeAvailability(rt.name, effectiveCheckIn, effectiveCheckOut).available;
              const soldOut = available === 0;
              const rate = getBaseRate(rt.name);
              const isExpanded = expandedRoom === rt.id;

              return (
                <motion.div
                  key={rt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group border rounded-xl transition-all overflow-hidden ${
                    quantity > 0
                      ? 'border-indigo-400 ring-1 ring-indigo-400 bg-indigo-50/30'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  } ${soldOut ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRoom(isExpanded ? null : rt.id)}>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">{rt.name}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          available > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {available} available
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{formatAmount(rate)} / night</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {rt.maxOccupancy > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <Users size={10} /> {rt.maxOccupancy} pax
                          </span>
                        )}
                        {rt.bedConfiguration && (
                          <span className="text-[10px] text-slate-400">{rt.bedConfiguration}</span>
                        )}
                        {rt.roomSizeSqm > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <Ruler size={10} /> {rt.roomSizeSqm}m²
                          </span>
                        )}
                      </div>
                    </div>
                    <QuantityStepper
                      value={quantity}
                      min={0}
                      max={available}
                      onChange={(value) => handleSetQuantity(rt.name, value)}
                      size="sm"
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2">
                          {rt.description && (
                            <p className="text-xs text-slate-500 leading-relaxed">{rt.description}</p>
                          )}
                          {rt.amenities && rt.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {rt.amenities.slice(0, 8).map((amenity, i) => (
                                <span key={i} className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] text-slate-500">
                                  <CheckCircle2 size={9} className="text-emerald-400" /> {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {errors?.roomType && (
        <p className="text-[10px] text-rose-500" role="alert">{errors.roomType}</p>
      )}
      {errors?.roomSelections && (
        <p className="text-[10px] text-rose-500" role="alert">{errors.roomSelections}</p>
      )}
    </motion.div>
  );
}
