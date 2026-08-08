/**
 * Front Office shared UI primitives.
 *
 * A small set of composable building blocks that give every Front Office
 * module a consistent look:
 *  - PageHeader   — the title + subtitle + actions row at the top of a module.
 *  - Card         — the base card (radius, border, shadow) from brandTheme.
 *  - SectionCard  — a Card with a titled header and body, for grouped content.
 *  - QuickActionButton — a consistent action tile for dashboard quick actions.
 *  - Badge        — a semantic status pill (success/warning/danger/info/neutral).
 *
 * Import these instead of re-deriving classes per module.
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  card,
  button,
  statusTone,
  type StatusTone,
  pageTitle,
  pageSubtitle,
  sectionTitle,
} from './brandTheme';

// ── PageHeader ─────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions (buttons, refresh, last-updated, etc.). */
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, icon: Icon, className = '' }: PageHeaderProps) => (
  <div className={['flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3', className].join(' ')}>
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="shrink-0 p-2.5 rounded-xl bg-[var(--color-accent-operations)]/10 text-[var(--color-accent-operations)]">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className={pageTitle}>{title}</h1>
        {subtitle && <p className={pageSubtitle}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
  </div>
);

// ── Card ───────────────────────────────────────────────────────────────────

export interface CardProps {
  children: ReactNode;
  /** Hover-lift treatment for clickable cards. */
  interactive?: boolean;
  /** Inner padding preset. */
  pad?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  onClick?: () => void;
}

const padMap = { sm: card.padSm, md: card.pad, lg: card.padLg, none: '' } as const;

export const Card = ({ children, interactive = false, pad = 'md', className = '', onClick }: CardProps) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={[
        onClick || interactive ? card.interactive : card.base,
        padMap[pad],
        onClick ? 'cursor-pointer text-left w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Component>
  );
};

// ── SectionCard ────────────────────────────────────────────────────────────

export interface SectionCardProps {
  title?: string;
  icon?: LucideIcon;
  /** Right-aligned header actions (e.g. "View All", collapse toggle). */
  actions?: ReactNode;
  /** Optional tone for the title icon chip. */
  tone?: StatusTone;
  children: ReactNode;
  /** Body padding preset. */
  pad?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  /** Override the body class (e.g. to remove divide-y). */
  bodyClassName?: string;
}

export const SectionCard = ({
  title,
  icon: Icon,
  actions,
  tone = 'neutral',
  children,
  pad = 'none',
  className = '',
  bodyClassName = '',
}: SectionCardProps) => {
  const toneStyles = statusTone[tone];
  const hasHeader = title || Icon || actions;
  return (
    <div className={[card.base, 'overflow-hidden', className].join(' ')}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className={`shrink-0 p-2 rounded-lg ${toneStyles.soft}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            {title && <h2 className={sectionTitle}>{title}</h2>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={[padMap[pad], bodyClassName].filter(Boolean).join(' ')}>{children}</div>
    </div>
  );
};

// ── QuickActionButton ──────────────────────────────────────────────────────

export interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Tone for the icon chip. */
  tone?: StatusTone;
  description?: string;
}

export const QuickActionButton = ({
  label,
  icon: Icon,
  onClick,
  tone = 'neutral',
  description,
}: QuickActionButtonProps) => {
  const toneStyles = statusTone[tone];
  return (
    <button onClick={onClick} className={[card.interactive, 'p-4 text-left w-full'].join(' ')}>
      <div className="flex items-center gap-3">
        <div className={`shrink-0 p-2.5 rounded-xl ${toneStyles.soft}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────

export interface BadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  /** Soft tinted pill (default) vs. solid fill. */
  variant?: 'soft' | 'solid';
  icon?: LucideIcon;
  className?: string;
}

export const Badge = ({
  children,
  tone = 'neutral',
  variant = 'soft',
  icon: Icon,
  className = '',
}: BadgeProps) => {
  const toneStyles = statusTone[tone];
  const look = variant === 'solid' ? toneStyles.badge : toneStyles.soft;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        look,
        className,
      ].join(' ')}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};

// ── Re-export button styles for convenience ────────────────────────────────
export { button as buttonStyles };
