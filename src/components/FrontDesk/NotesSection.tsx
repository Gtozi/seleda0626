/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Tag } from 'lucide-react';

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export default function NotesSection({
  notes,
  onNotesChange,
}: NotesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-slate-900/20"
    >
      <label htmlFor="notes" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
          <Tag size={12} />
        </span>
        Notes / Concierge Instructions
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition resize-y"
        placeholder="e.g. Late check-in requested, high floor preferred, allergy information..."
      />
    </motion.div>
  );
}
