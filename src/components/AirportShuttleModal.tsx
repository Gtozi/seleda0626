import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plane, Plus, Minus } from 'lucide-react';

export interface AirportShuttleLeg {
  quantity: number;
  flightNumber: string;
  flightTime: string;
  scheduledDate: string;
  scheduledTime: string;
}

export interface AirportShuttleDetails {
  pickup: AirportShuttleLeg;
  dropOff: AirportShuttleLeg;
  notes: string;
}

interface AirportShuttleModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: AirportShuttleDetails;
  onChange: (details: AirportShuttleDetails) => void;
  checkIn: string;
  checkOut: string;
}

export default function AirportShuttleModal({
  isOpen,
  onClose,
  details,
  onChange,
  checkIn,
  checkOut
}: AirportShuttleModalProps) {
  const updateLeg = (leg: 'pickup' | 'dropOff', field: keyof AirportShuttleLeg, value: string | number) => {
    onChange({
      ...details,
      [leg]: { ...details[leg], [field]: value }
    });
  };

  const ShuttleLegCard = ({
    type,
    leg,
    label,
    defaultDate
  }: {
    type: 'pickup' | 'dropOff';
    leg: AirportShuttleLeg;
    label: string;
    defaultDate: string;
  }) => (
    <div
      className={`p-4 rounded-xl border transition-all ${
        leg.quantity > 0 ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-stone-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane size={16} className={type === 'pickup' ? 'text-emerald-500' : 'text-amber-500'} />
          <span className="text-sm font-semibold text-stone-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateLeg(type, 'quantity', Math.max(0, leg.quantity - 1))}
            disabled={leg.quantity === 0}
            className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 transition"
          >
            <Minus size={13} />
          </button>
          <span className="w-5 text-center text-sm font-semibold text-stone-900">{leg.quantity}</span>
          <button
            type="button"
            onClick={() => updateLeg(type, 'quantity', Math.min(10, leg.quantity + 1))}
            className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
      {leg.quantity > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Flight Number</label>
              <input
                type="text"
                value={leg.flightNumber}
                onChange={e => updateLeg(type, 'flightNumber', e.target.value)}
                placeholder="e.g. ET302"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Flight Time</label>
              <input
                type="time"
                value={leg.flightTime}
                onChange={e => updateLeg(type, 'flightTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transfer Date</label>
              <input
                type="date"
                value={leg.scheduledDate || defaultDate}
                min={checkIn}
                max={checkOut}
                onChange={e => updateLeg(type, 'scheduledDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transfer Time</label>
              <input
                type="time"
                value={leg.scheduledTime}
                onChange={e => updateLeg(type, 'scheduledTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Plane size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Airport Shuttle</h2>
                  <p className="text-xs text-stone-500">Set quantity and details for each direction</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShuttleLegCard type="pickup" leg={details.pickup} label="Airport Pickup" defaultDate={checkIn} />
                <ShuttleLegCard type="dropOff" leg={details.dropOff} label="Airport Drop-off" defaultDate={checkOut} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Notes</label>
                <textarea
                  value={details.notes}
                  onChange={e => onChange({ ...details, notes: e.target.value })}
                  rows={3}
                  placeholder="Terminal, number of bags, special requests, etc."
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
