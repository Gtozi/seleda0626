/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from '../Shared/ModalSystem';

interface BanquetEvent {
  id: string;
  name: string;
  type: 'Wedding' | 'Corporate' | 'Conference' | 'Birthday' | 'Other';
  date: string;
  time: string;
  venue: string;
  guests: number;
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  totalQuote: number;
  contactPerson: string;
  contactPhone: string;
}

interface BEOSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BanquetEvent | null;
}

interface ForecastRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BanquetEvent | null;
}

export function BEOSheetModal({ isOpen, onClose, event }: BEOSheetModalProps) {
  const { addNotification } = useERP();

  if (!isOpen || !event) return null;

  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      title="BEO Function Sheet"
      subtitle={`${event.name} • ${event.date}`}
      icon={<ClipboardList size={20} className="text-indigo-600" />}
      variant="form"
      size="lg"
      showFooter={true}
      footer={
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onClose();
              addNotification('BEO Function Sheet saved successfully', 'success', 'Banquets');
            }}
            className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20"
          >
            Save BEO
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/30">
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Event Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Venue:</span>
              <span className="font-bold ml-2">{event.venue}</span>
            </div>
            <div>
              <span className="text-slate-500">Guests:</span>
              <span className="font-bold ml-2">{event.guests}</span>
            </div>
            <div>
              <span className="text-slate-500">Time:</span>
              <span className="font-bold ml-2">{event.time}</span>
            </div>
            <div>
              <span className="text-slate-500">Contact:</span>
              <span className="font-bold ml-2">{event.contactPerson}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Function Requirements</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              <span className="text-xs text-slate-700 dark:text-slate-300">Audio/Visual Equipment Setup</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-xs text-slate-700 dark:text-slate-300">Special Lighting Requirements</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              <span className="text-xs text-slate-700 dark:text-slate-300">Stage/Platform Setup</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-xs text-slate-700 dark:text-slate-300">Decorations/Floral Arrangements</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Service Notes</h4>
          <textarea
            placeholder="Enter special instructions, dietary requirements, or other notes..."
            className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 h-24"
          />
        </div>
      </div>
    </ModalSystem>
  );
}

export function ForecastRequisitionModal({ isOpen, onClose, event }: ForecastRequisitionModalProps) {
  const { formatAmount, addNotification } = useERP();

  if (!isOpen || !event) return null;

  const forecastedItems = [
    { item: 'Premium Beef Fillet', qty: 24, unit: 'kg', cost: 450 },
    { item: 'Fresh Salmon', qty: 18, unit: 'kg', cost: 320 },
    { item: 'Vegetable Medley', qty: 15, unit: 'kg', cost: 120 },
    { item: 'Fine Dining Wine', qty: 36, unit: 'bottles', cost: 720 },
    { item: 'Sparkling Water', qty: 120, unit: 'bottles', cost: 180 },
  ];

  const totalCost = forecastedItems.reduce((acc, item) => acc + item.cost, 0);

  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      title="Forecasted Requisition"
      subtitle={`${event.name} • ${event.date}`}
      icon={<TrendingUp size={20} className="text-amber-600" />}
      variant="form"
      size="lg"
      showFooter={true}
      footer={
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onClose();
              addNotification('Forecasted requisition submitted successfully', 'success', 'Banquets');
            }}
            className="flex-[2] py-3 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-600/20"
          >
            Submit Requisition
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/30 flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-400">Generate forecasted ingredient requirements based on menu and guest count. Submit requisition 7 days before event.</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Forecasted Requirements</h4>
          <div className="space-y-2">
            {forecastedItems.map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{req.item}</p>
                  <p className="text-[10px] text-slate-500">{req.qty} {req.unit}</p>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{formatAmount(req.cost)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Total Estimated Cost</span>
            <span className="text-lg font-black text-indigo-600">{formatAmount(totalCost)}</span>
          </div>
        </div>
      </div>
    </ModalSystem>
  );
}
