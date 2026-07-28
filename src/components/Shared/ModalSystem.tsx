import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Info, Loader2, AlertTriangle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModalVariant = 'confirm' | 'form' | 'info' | 'async';

export interface ModalSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
}

// ── Size Mapping ───────────────────────────────────────────────

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// ── Color Mapping ──────────────────────────────────────────────

const confirmColorMap: Record<string, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20',
  rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20',
  amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20',
  slate: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg',
};

// ── Variant Icons ──────────────────────────────────────────────

const variantIconMap: Record<ModalVariant, React.ReactNode> = {
  confirm: <AlertTriangle size={20} className="text-amber-600" />,
  form: <Info size={20} className="text-indigo-600" />,
  info: <Info size={20} className="text-slate-500" />,
  async: <Loader2 size={20} className="text-indigo-600 animate-spin" />,
};

// ── Modal System Component ─────────────────────────────────────

export function ModalSystem({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  subtitle,
  icon,
  variant = 'form',
  size = 'md',
  loading = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'indigo',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showFooter = true,
  children,
  footer,
  headerClassName = '',
  bodyClassName = '',
}: ModalSystemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && !loading) {
        onClose();
      }
    },
    [closeOnEscape, loading, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap - focus first focusable element on open
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const displayIcon = icon ?? variantIconMap[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ${sizeMap[size]} w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || displayIcon) && (
              <div className={`p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 ${headerClassName}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {displayIcon && (
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                      {displayIcon}
                    </div>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shrink-0 disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className={`overflow-y-auto flex-1 p-5 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {showFooter && (
              footer ? (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                  {footer}
                </div>
              ) : (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3 shrink-0">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-40"
                  >
                    {cancelLabel}
                  </button>
                  {onConfirm && (
                    <button
                      onClick={onConfirm}
                      disabled={loading}
                      className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition disabled:opacity-60 flex items-center gap-2 ${confirmColorMap[confirmColor]}`}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        confirmLabel
                      )}
                    </button>
                  )}
                </div>
              )
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Convenience Hooks ──────────────────────────────────────────

export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);
  return { isOpen, open, close, toggle, setIsOpen };
}

// ── Confirm Dialog (imperative-style helper) ───────────────────

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'rose' | 'amber' | 'indigo' | 'emerald' | 'slate';
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'rose',
  icon,
}: ConfirmDialogProps) {
  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      variant="confirm"
      size="sm"
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmColor={confirmColor}
      icon={icon}
    >
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {message}
      </p>
    </ModalSystem>
  );
}

// ── Info Dialog ────────────────────────────────────────────────

export interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: React.ReactNode;
  closeLabel?: string;
}

export function InfoDialog({
  isOpen,
  onClose,
  title,
  message,
  icon,
  closeLabel = 'OK',
}: InfoDialogProps) {
  return (
    <ModalSystem
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant="info"
      size="sm"
      showFooter={true}
      cancelLabel={closeLabel}
      confirmColor="slate"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>
      </div>
    </ModalSystem>
  );
}
