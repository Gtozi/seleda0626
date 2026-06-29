import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ScrollText } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: string;
  hotelName?: string;
}

export default function TermsAndConditionsModal({ isOpen, onClose, terms, hotelName }: TermsAndConditionsModalProps) {
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ScrollText size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Terms & Conditions</h2>
                  <p className="text-xs text-stone-500">{hotelName || 'Hotel'} Booking Policy</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm prose-stone max-w-none">
                {terms ? (
                  <div className="whitespace-pre-line text-stone-700 leading-relaxed">
                    {terms}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ScrollText size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500">No terms and conditions have been set yet.</p>
                    <p className="text-xs text-stone-400 mt-2">Please contact the hotel for more information.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
