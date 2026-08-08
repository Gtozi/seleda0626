/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Toast Notification Component
 * Provides consistent toast notifications across the application
 */

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }> = {
  success: {
    icon: <CheckCircle2 size={20} className="text-emerald-600" />,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    icon: <XCircle size={20} className="text-red-600" />,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-900 dark:text-red-100',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: <AlertCircle size={20} className="text-amber-600" />,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-900 dark:text-amber-100',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  info: {
    icon: <Info size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-900 dark:text-blue-100',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
};

export function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = toastConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} max-w-md`}
    >
      <div className="shrink-0">{config.icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }: { 
  toasts: Array<{ id: string; type: ToastType; message: string }>;
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: string; type: ToastType; message: string }>>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);
  const warning = useCallback((message: string) => addToast('warning', message), [addToast]);
  const info = useCallback((message: string) => addToast('info', message), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />,
  };
}