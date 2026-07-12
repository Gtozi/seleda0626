/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Tag } from 'lucide-react';

interface NotesSectionProps {
  specialRequests: string;
  onSpecialRequestsChange: (value: string) => void;
}

export default function NotesSection({
  specialRequests,
  onSpecialRequestsChange,
}: NotesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-xl shadow-stone-900/5"
    >
      <label htmlFor="specialRequests" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-stone-100 text-stone-500">
          <Tag size={12} />
        </span>
        Special requests
      </label>
      <textarea
        id="specialRequests"
        value={specialRequests}
        onChange={(e) => onSpecialRequestsChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
        placeholder="e.g. Late check-in requested, high floor preferred, allergy information..."
      />
    </motion.div>
  );
}
