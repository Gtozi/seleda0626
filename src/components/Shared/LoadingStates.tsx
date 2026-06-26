/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Loading States and Skeleton Components
 * Provides consistent loading UX across the application
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

/**
 * Base skeleton component
 */
export const Skeleton = ({ 
  className = '', 
  variant = 'default' 
}: { 
  className?: string;
  variant?: 'default' | 'circular' | 'text';
}) => {
  const baseClasses = 'animate-pulse bg-slate-200';
  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Loading..."
    />
  );
};

/**
 * Card skeleton
 */
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

/**
 * Table row skeleton
 */
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-slate-100">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Reservation list skeleton
 */
export const ReservationListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-start gap-4">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Guest list skeleton
 */
export const GuestListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

/**
 * Dashboard metrics skeleton
 */
export const MetricsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton variant="circular" className="h-12 w-12" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Form skeleton
 */
export const FormSkeleton = ({ fields = 5 }: { fields?: number }) => (
  <div className="space-y-4">
    {[...Array(fields)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// ============================================================================
// LOADING SPINNERS
// ============================================================================

/**
 * Inline spinner
 */
export const Spinner = ({ 
  size = 20, 
  className = '' 
}: { 
  size?: number; 
  className?: string;
}) => (
  <Loader2 
    size={size} 
    className={`animate-spin ${className}`}
    aria-label="Loading"
  />
);

/**
 * Full page loader
 */
export const FullPageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center space-y-4">
      <Spinner size={48} className="text-slate-900 mx-auto" />
      <p className="text-sm text-slate-600 font-medium">{message}</p>
    </div>
  </div>
);

/**
 * Overlay loader
 */
export const OverlayLoader = ({ 
  message = 'Processing...',
  isVisible = true 
}: { 
  message?: string;
  isVisible?: boolean;
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <Spinner size={40} className="text-slate-900 mx-auto" />
          <p className="text-sm text-slate-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Button with loading state
 */
export const LoadingButton = ({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
}) => {
  const variantClasses = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm
        transition-colors duration-200
        disabled:cursor-not-allowed disabled:opacity-60
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {isLoading && <Spinner size={16} />}
      {children}
    </button>
  );
};

/**
 * Content loader with retry
 */
export const ContentLoader = ({
  isLoading,
  error,
  onRetry,
  children,
  skeleton,
}: {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}) => {
  if (isLoading) {
    return <>{skeleton || <CardSkeleton />}</>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-sm text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
};

/**
 * Lazy load wrapper with suspense fallback
 */
export const LazyLoadWrapper = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <React.Suspense fallback={fallback || <FullPageLoader />}>
    {children}
  </React.Suspense>
);

/**
 * Progress bar
 */
export const ProgressBar = ({ 
  progress, 
  className = '' 
}: { 
  progress: number; 
  className?: string;
}) => (
  <div className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
    <div
      className="bg-slate-900 h-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);

/**
 * Indeterminate progress bar
 */
export const IndeterminateProgress = ({ className = '' }: { className?: string }) => (
  <div className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
    <div className="bg-slate-900 h-full animate-indeterminate-progress" />
  </div>
);

// Add to your tailwind.config.js:
// animation: {
//   'indeterminate-progress': 'indeterminate-progress 1.5s ease-in-out infinite',
// },
// keyframes: {
//   'indeterminate-progress': {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(400%)' },
//   },
// },
