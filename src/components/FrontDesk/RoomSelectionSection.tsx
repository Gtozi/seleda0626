/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Layers, Clock, DoorOpen, BedDouble, CheckCircle2, Circle, Tag, X } from 'lucide-react';
import { Room, RoomType } from '../../types/erp';

interface RoomSelection {
  roomType?: string;
  count?: number;
  roomNumbers?: string[];
}

interface RoomSelectionSectionProps {
  roomType: string;
  roomSelections: RoomSelection[];
  checkInDate?: string;
  checkOutDate?: string;
  currentSystemDate: string;
  uniqueRoomTypes: string[];
  rooms: Room[];
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string) => { available: number };
  onRoomTypeChange: (type: string) => void;
  onRoomSelectionsChange: (selections: RoomSelection[]) => void;
  nights: number;
  errors?: {
    roomType?: string;
    roomSelections?: string;
  };
}

export default function RoomSelectionSection({
  roomType,
  roomSelections,
  checkInDate,
  checkOutDate,
  currentSystemDate,
  uniqueRoomTypes,
  rooms,
  getTypeAvailability,
  onRoomTypeChange,
  onRoomSelectionsChange,
  nights,
  errors,
}: RoomSelectionSectionProps) {
  const countInputRef = useRef<HTMLInputElement>(null);

  const effectiveCheckIn = checkInDate || currentSystemDate;
  const effectiveCheckOut = checkOutDate || (() => {
    const d = new Date(currentSystemDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const handleAddRoomType = () => {
    const count = parseInt(countInputRef.current?.value || '1');
    const availability = getTypeAvailability(roomType, effectiveCheckIn, effectiveCheckOut);
    const availableCount = availability.available;
    const currentSelections = roomSelections || [];
    const existingSelection = currentSelections.find(s => s.roomType === roomType);
    const currentlySelected = existingSelection?.count || 0;

    if (currentlySelected + count > availableCount) {
      alert(`Only ${availableCount} ${roomType} room(s) available. You have already selected ${currentlySelected}.`);
      return;
    }

    const existingIndex = currentSelections.findIndex(s => s.roomType === roomType);
    let newSelections: RoomSelection[];
    if (existingIndex >= 0) {
      newSelections = currentSelections.map((s, i) =>
        i === existingIndex ? { ...s, count: (s.count || 0) + count } : s
      );
    } else {
      newSelections = [...currentSelections, { roomType, count, roomNumbers: [] }];
    }
    onRoomSelectionsChange(newSelections);
    if (countInputRef.current) {
      countInputRef.current.value = '1';
    }
  };

  const handleDirectRoomSelect = (room: Room) => {
    if (room.status !== 'Vacant Clean' && room.status !== 'Vacant Dirty') return;

    const currentSelections = roomSelections || [];
    const existingIndex = currentSelections.findIndex(s => s.roomType === room.type);

    if (existingIndex >= 0) {
      const existing = currentSelections[existingIndex];
      const alreadySelected = existing.roomNumbers?.includes(room.number);
      if (alreadySelected) return;

      const newSelections = currentSelections.map((s, i) =>
        i === existingIndex
          ? { ...s, count: (s.count || 0) + 1, roomNumbers: [...(s.roomNumbers || []), room.number] }
          : s
      );
      onRoomSelectionsChange(newSelections);
    } else {
      onRoomSelectionsChange([
        ...currentSelections,
        { roomType: room.type, count: 1, roomNumbers: [room.number] },
      ]);
    }
  };

  const handleRemoveSelection = (idx: number) => {
    const newSelections = roomSelections.filter((_, i) => i !== idx);
    onRoomSelectionsChange(newSelections);
  };

  const handleToggleRoomNumber = (selectionIdx: number, roomNumber: string, checked: boolean) => {
    const newSelections = roomSelections.map((s, i) => {
      if (i !== selectionIdx) return s;
      const newRoomNumbers = checked
        ? [...(s.roomNumbers || []), roomNumber]
        : (s.roomNumbers || []).filter(n => n !== roomNumber);
      return { ...s, roomNumbers: newRoomNumbers };
    });
    onRoomSelectionsChange(newSelections);
  };

  const availability = getTypeAvailability(roomType, effectiveCheckIn, effectiveCheckOut);
  const availableRooms = rooms.filter(r =>
    r.type === roomType && (r.status === 'Vacant Clean' || r.status === 'Vacant Dirty')
  );
  const availableCount = availability.available;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
      className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm"
    >
      <h4 className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
          <Layers size={12} />
        </span>
        Rooms Outlook Timeline
      </h4>
      
      {/* Stay Period Visual */}
      {checkInDate && checkOutDate && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 rounded-xl p-4 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Stay Period</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Check-In</div>
              <div className="text-sm font-bold text-slate-800">{new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div className="flex-1 mx-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 w-full rounded-full" />
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Check-Out</div>
              <div className="text-sm font-bold text-slate-800">{new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[11px] font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200/80 inline-block">
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2">
            <DoorOpen size={10} className="text-amber-500" />
            Add Room Type
          </label>
          <div className="flex gap-2">
            <select
              value={roomType}
              onChange={(e) => onRoomTypeChange(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all duration-200 shadow-sm appearance-none"
            >
              {uniqueRoomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              defaultValue="1"
              ref={countInputRef}
              placeholder="Qty"
              className="w-20 px-3 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all duration-200 shadow-sm"
            />
            <button
              type="button"
              onClick={handleAddRoomType}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Add
            </button>
          </div>
          {errors?.roomType && (
            <p className="text-[10px] text-rose-500 mt-1" role="alert">{errors.roomType}</p>
          )}
        </div>

        {roomType && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <BedDouble size={10} />
                Vacant {roomType} Rooms
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{availableCount}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {availableRooms.map(r => {
                const isSelected = roomSelections?.some(s =>
                  s.roomType === r.type && s.roomNumbers?.includes(r.number)
                );
                return (
                  <button
                    key={r.number}
                    type="button"
                    onClick={() => handleDirectRoomSelect(r)}
                    disabled={isSelected}
                    className={`text-left flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 shadow-sm cursor-default'
                        : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isSelected ? <CheckCircle2 size={14} /> : <DoorOpen size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">Room {r.number}</span>
                      <span className="text-[10px] text-slate-400">{r.status}</span>
                    </div>
                  </button>
                );
              })}
              {availableCount === 0 && (
                <div className="col-span-2 text-[10px] text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                  No vacant rooms for this type
                </div>
              )}
            </div>
          </div>
        )}

        {errors?.roomSelections && (
          <p className="text-[10px] text-rose-500" role="alert">{errors.roomSelections}</p>
        )}

        {roomSelections && roomSelections.length > 0 && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <CheckCircle2 size={10} />
              Selected Rooms
            </label>
            <div className="space-y-3">
              {roomSelections.map((selection, idx) => (
                <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-600">
                        <BedDouble size={12} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-700">{selection.count || 1}x {selection.roomType || 'Unknown'}</span>
                        <div className="text-[10px] text-slate-500">Select specific rooms (optional)</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelection(idx)}
                      className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                    {rooms
                      .filter(r => r.type === (selection.roomType || ''))
                      .slice(0, selection.count || 1)
                      .map(r => (
                        <label key={r.number} className="relative group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selection.roomNumbers?.includes(r.number)}
                            onChange={(e) => handleToggleRoomNumber(idx, r.number, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                            selection.roomNumbers?.includes(r.number)
                              ? 'bg-amber-50 border-amber-300 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-amber-200'
                          }`}>
                            <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition ${
                              selection.roomNumbers?.includes(r.number)
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                            }`}>
                              {selection.roomNumbers?.includes(r.number) ? <CheckCircle2 size={12} /> : <Circle size={10} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-700">Room {r.number}</span>
                              <span className="text-[10px] text-slate-400">{r.status}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    {rooms.filter(r => r.type === (selection.roomType || '') && (r.status === 'Vacant Clean' || r.status === 'Vacant Dirty')).length === 0 && (
                      <div className="col-span-2 text-[10px] text-slate-400 italic p-3 text-center bg-white rounded-xl border border-slate-100">
                        No vacant rooms for this type
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-600 shrink-0 mt-0.5">
            <Tag size={10} />
          </div>
          <div className="text-[10px] text-blue-700 leading-relaxed">
            <span className="font-bold">Tip:</span> Select room types and quantities. Specific room assignment is optional—the system will auto-assign based on availability.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
