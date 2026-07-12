/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Bed, X, Minus, Plus, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { Room, RoomTypeDetail } from '../../types/erp';

interface RoomSelection {
  roomType?: string;
  count?: number;
  roomNumbers?: string[];
  roomNights?: string[][];
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
        className={`${buttonSize} rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition`}
      >
        <Minus size={iconSize} />
      </button>
      <span className={`text-center font-semibold text-stone-900 ${size === 'sm' ? 'w-4 text-xs' : 'w-6 text-sm'}`}>{value}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
        disabled={value >= max}
        className={`${buttonSize} rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition`}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
};

interface RoomSelectionCartProps {
  roomSelections: RoomSelection[];
  roomTypes: RoomTypeDetail[];
  rooms: Room[];
  checkInDate?: string;
  checkOutDate?: string;
  currentSystemDate: string;
  nights: number;
  formatAmount: (amount: number) => string;
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string) => { available: number };
  onChange: (selections: RoomSelection[]) => void;
}

export default function RoomSelectionCart({
  roomSelections,
  roomTypes,
  rooms,
  checkInDate,
  checkOutDate,
  currentSystemDate,
  nights,
  formatAmount,
  getTypeAvailability,
  onChange,
}: RoomSelectionCartProps) {
  const effectiveCheckIn = checkInDate || currentSystemDate;
  const effectiveCheckOut = checkOutDate || (() => {
    const d = new Date(currentSystemDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const getBaseRate = (type: string) => {
    const roomOfType = rooms.find(r => r.type === type);
    return roomOfType?.rate || roomTypes.find(rt => rt.name === type || rt.id === type)?.basePrice || 0;
  };

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
      onChange(currentSelections.filter(s => s.roomType !== type));
      return;
    }

    const existingIndex = currentSelections.findIndex(s => s.roomType === type);
    if (existingIndex >= 0) {
      const existing = currentSelections[existingIndex];
      onChange(
        currentSelections.map((s, i) =>
          i === existingIndex
            ? { ...s, count: quantity, roomNights: normalizeRoomNights(s.roomNights, quantity) }
            : s
        )
      );
    } else {
      onChange([...currentSelections, { roomType: type, count: quantity, roomNumbers: [], roomNights: normalizeRoomNights([], quantity) }]);
    }
  };

  const handleRemoveSelection = (type: string) => {
    handleSetQuantity(type, 0);
  };

  const handleToggleRoomNight = (type: string, nightIndex: number, roomNumber: string) => {
    const newSelections = roomSelections.map((s) => {
      if (s.roomType !== type) return s;
      const count = s.count || 1;
      const currentNights = normalizeRoomNights(s.roomNights, count);
      const currentRow = (currentNights[nightIndex] || []).filter(r => r !== '');
      const isSelected = currentRow.includes(roomNumber);

      let newRow: string[];
      if (isSelected) {
        newRow = currentRow.filter(r => r !== roomNumber);
      } else if (currentRow.length < count) {
        newRow = [...currentRow, roomNumber];
      } else {
        return s;
      }

      while (newRow.length < count) newRow.push('');

      const newNights = currentNights.map((row, i) =>
        i === nightIndex ? newRow : row
      );
      return { ...s, roomNights: newNights };
    });
    onChange(newSelections);
  };

  const handleClearRoomNight = (type: string, nightIndex: number) => {
    const newSelections = roomSelections.map((s) => {
      if (s.roomType !== type) return s;
      const count = s.count || 1;
      const currentNights = normalizeRoomNights(s.roomNights, count);
      const newNights = currentNights.map((row, i) =>
        i === nightIndex ? Array(count).fill('') : row
      );
      return { ...s, roomNights: newNights };
    });
    onChange(newSelections);
  };

  React.useEffect(() => {
    const normalized = roomSelections.map((s) => ({
      ...s,
      roomNights: normalizeRoomNights(s.roomNights, s.count || 1),
    }));
    if (JSON.stringify(normalized) !== JSON.stringify(roomSelections)) {
      onChange(normalized);
    }
  }, [nights, onChange, roomSelections.length]);

  const roomTotalEstimate = roomSelections.reduce((sum, s) => {
    const rate = s.roomType ? getBaseRate(s.roomType) : 0;
    return sum + rate * nights * (s.count || 1);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden"
    >
      <div className="p-5 border-b border-stone-100 bg-stone-50/50">
        <h3 className="font-semibold text-stone-900 flex items-center gap-2">
          <ShoppingBag size={18} className="text-amber-500" /> Your Selection
        </h3>
        {checkInDate && checkOutDate && (
          <p className="text-xs text-stone-500 mt-1">
            {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {nights} Night{nights !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {roomSelections.length === 0 ? (
          <div className="text-center py-8">
            <Bed size={32} className="mx-auto text-stone-300 mb-2" />
            <p className="text-sm text-stone-500 font-medium">No rooms selected yet</p>
            <p className="text-xs text-stone-400 mt-1">Select a room to see your estimate</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rooms</h4>
              {roomSelections.map(selection => {
                const rt = roomTypes.find(r => r.name === selection.roomType || r.id === selection.roomType);
                const rate = selection.roomType ? getBaseRate(selection.roomType) : 0;
                const quantity = selection.count || 1;
                const lineTotal = rate * nights * quantity;

                return (
                  <div key={selection.roomType} className="space-y-2 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-stone-900">{rt?.name || selection.roomType}</p>
                        <p className="text-xs text-stone-500">{quantity} room{quantity > 1 ? 's' : ''} × {formatAmount(rate)} / night</p>
                      </div>
                      <span className="font-semibold text-stone-900 shrink-0">{formatAmount(lineTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        value={quantity}
                        min={1}
                        max={selection.roomType ? getTypeAvailability(selection.roomType, effectiveCheckIn, effectiveCheckOut).available : 0}
                        onChange={(value) => selection.roomType && handleSetQuantity(selection.roomType, value)}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSelection(selection.roomType || '')}
                        className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {selection.roomType && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Assign rooms per night</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {Array.from({ length: nights }).map((_, nightIndex) => {
                            const date = new Date((checkInDate || currentSystemDate) + 'T00:00:00');
                            date.setDate(date.getDate() + nightIndex);
                            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const currentRoomNights = normalizeRoomNights(selection.roomNights, selection.count || 1);
                            const selectedRooms = (currentRoomNights[nightIndex] || []).filter(r => r !== '');
                            const typeRooms = rooms.filter(r => r.type === selection.roomType);
                            const count = selection.count || 1;
                            const isAuto = selectedRooms.length === 0;
                            return (
                              <div key={nightIndex} className="flex items-center gap-2 p-2 rounded-xl border border-stone-100 bg-stone-50/30">
                                <span className="text-[10px] font-bold text-stone-500 w-12 shrink-0">{dateStr}</span>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium">
                                      {selectedRooms.length}/{count}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => selection.roomType && handleClearRoomNight(selection.roomType, nightIndex)}
                                      className={`text-left flex items-center justify-between gap-1 px-2 py-1.5 text-xs rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-amber-400 ${isAuto ? 'bg-amber-50 border-amber-400 text-amber-800 font-medium' : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-stone-50'}`}
                                    >
                                      <span>Auto</span>
                                      {isAuto && <Check size={12} className="text-amber-600" />}
                                    </button>
                                    {typeRooms.map(r => {
                                      const isSelected = selectedRooms.includes(r.number);
                                      return (
                                        <button
                                          key={r.number}
                                          type="button"
                                          onClick={() => selection.roomType && handleToggleRoomNight(selection.roomType, nightIndex, r.number)}
                                          className={`text-center flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-amber-400 ${isSelected ? 'bg-amber-50 border-amber-400 text-amber-800 font-medium' : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-stone-50'}`}
                                        >
                                          <span>{r.number}</span>
                                          {isSelected && <Check size={12} className="text-amber-600" />}
                                        </button>
                                      );
                                    })}
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
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
              <div>
                <p className="text-sm font-bold text-stone-900">Room Estimate</p>
                <p className="text-[10px] text-stone-500">Taxes & add-ons in summary</p>
              </div>
              <span className="text-2xl font-black text-amber-600">{formatAmount(roomTotalEstimate)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3 text-xs text-stone-500">
        <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
        <span>Specific room assignment is optional · system will auto-assign</span>
      </div>
    </motion.div>
  );
}
