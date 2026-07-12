import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ScrollText, ShieldAlert, Clock, Percent, AlertCircle, Sparkles } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: string;
  hotelName?: string;
  policySections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  cancellationGraceHours?: number;
  cancellationPenaltyPercent?: number;
}

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
  terms,
  hotelName,
  policySections = [],
  cancellationGraceHours = 24,
  cancellationPenaltyPercent = 50,
}: TermsAndConditionsModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'policies' | 'cancellation'>('terms');

  const hasPolicies = policySections && policySections.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ScrollText size={20} className="text-amber-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 tracking-tight">Policies & Guidelines</h2>
                  <p className="text-xs text-stone-500 font-medium">{hotelName || 'Hotel'} Booking & Reservation Rules</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs if policies are present */}
            {hasPolicies && (
              <div className="flex border-b border-stone-100 px-6 bg-white shrink-0">
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition mr-6 flex items-center gap-1.5 ${
                    activeTab === 'terms'
                      ? 'border-amber-500 text-amber-800 font-black'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  <ScrollText size={14} /> General Terms
                </button>
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition mr-6 flex items-center gap-1.5 ${
                    activeTab === 'policies'
                      ? 'border-amber-500 text-amber-800 font-black'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  <Sparkles size={14} /> Hotel Rules ({policySections.length})
                </button>
                <button
                  onClick={() => setActiveTab('cancellation')}
                  className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'cancellation'
                      ? 'border-amber-500 text-amber-800 font-black'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  <Clock size={14} /> Cancellation Policy
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 max-h-[55vh]">
              {/* Tab 1: General Terms */}
              {(!hasPolicies || activeTab === 'terms') && (
                <div className="prose prose-sm prose-stone max-w-none">
                  {terms ? (
                    <div className="whitespace-pre-line text-stone-700 leading-relaxed text-sm">
                      {terms}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ScrollText size={48} className="mx-auto text-stone-300 mb-4 animate-pulse" />
                      <p className="text-stone-650 font-semibold">General Stay Terms & Conditions</p>
                      <p className="text-xs text-stone-400 mt-2 max-w-md mx-auto">
                        Standard rules govern check-in timelines, payment verification, and safety. Please contact reception if you have special questions or requests.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Hotel Rules / Policy Sections */}
              {hasPolicies && activeTab === 'policies' && (
                <div className="space-y-6">
                  {policySections.map((section, index) => (
                    <div
                      key={section.id || index}
                      className="p-5 bg-stone-50/70 border border-stone-200/60 rounded-2xl shadow-sm"
                    >
                      <h3 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-2 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Cancellation Rules */}
              {hasPolicies && activeTab === 'cancellation' && (
                <div className="space-y-6">
                  {/* Cancellation Hero Card */}
                  <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col md:flex-row gap-5 items-center">
                    <div className="w-14 h-14 bg-amber-100/80 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldAlert size={28} className="text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base tracking-tight">Flexible and Transparent Bookings</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        We value your plans. If your arrangements change, please review the automated cancellation limits and grace periods configured for this property below.
                      </p>
                    </div>
                  </div>

                  {/* Operational Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 border border-stone-150 rounded-2xl flex items-start gap-4 hover:border-amber-200 transition">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-850 text-xs uppercase tracking-wider font-mono">Cancellation Grace Limit</h4>
                        <p className="text-2xl font-black text-stone-900 mt-1">{cancellationGraceHours} Hours</p>
                        <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                          Cancel or modify free of penalty prior to {cancellationGraceHours} hours before check-in.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 border border-stone-150 rounded-2xl flex items-start gap-4 hover:border-amber-200 transition">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                        <Percent size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-850 text-xs uppercase tracking-wider font-mono">Late Cancellation Charge</h4>
                        <p className="text-2xl font-black text-stone-900 mt-1">{cancellationPenaltyPercent}%</p>
                        <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                          Late cancellations or no-shows are subject to a standard penalty fee equivalent to {cancellationPenaltyPercent}% of the deposit or standard night fare.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Standard guidelines */}
                  <div className="p-4 bg-stone-50 rounded-xl flex gap-2.5 border border-stone-200/50">
                    <AlertCircle size={16} className="text-stone-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-500 leading-normal">
                      For group bookings or waitlisted reservations, special rules apply. Please consult the Waitlist Protocol section or reach out directly via {hotelName || 'our hotel concierge'}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4 shrink-0">
              <span className="text-[10px] text-stone-400 font-mono font-medium flex items-center gap-1">
                <ShieldAlert size={12} /> Compliant Administrative Policy
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-stone-900 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition active:scale-95 duration-100 shadow-sm"
              >
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
