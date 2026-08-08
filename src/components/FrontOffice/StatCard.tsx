/**
 * StatCard — the single, consistent KPI card for the Front Office portal.
 *
 * Replaces the per-module hand-rolled KPI cards. Every StatCard shares:
 *  - One card style (radius, border, shadow, hover) from `brandTheme.card`.
 *  - A thin top accent bar in the chosen tone.
 *  - An icon chip with a soft tinted background.
 *  - An optional delta indicator (up/down) using semantic success/danger tones.
 *
 * Two equivalent APIs are supported so existing modules keep working while
 * the portal migrates to the modern, consistent look:
 *  - New:      <StatCard title="ADR" value="$120" tone="success" icon={DollarSign} change={3.2} />
 *  - Legacy:   <StatCard label="ADR" value="$120" variant="revenue" icon={DollarSign} />
 *
 * `label` is an alias for `title`. `variant` maps to a semantic `tone`:
 *   primary → accent, rooms → info, alert → danger, revenue → success,
 *   guests → neutral.
 *
 * Both APIs render the SAME modern card — there is no longer a separate
 * gradient style, so the whole portal stays visually consistent.
 */

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { card, kpiTone, type KpiTone } from './brandTheme';

/** Legacy gradient variant keys used by existing modules. */
export type StatVariant = 'primary' | 'rooms' | 'alert' | 'revenue' | 'guests';

/** Map legacy `variant` → modern semantic `tone`. */
const VARIANT_TO_TONE: Record<StatVariant, KpiTone> = {
  primary: 'accent',
  rooms: 'info',
  alert: 'danger',
  revenue: 'success',
  guests: 'neutral',
};

export interface StatCardProps {
  /** Card title. `label` is accepted as a legacy alias. */
  title?: string;
  /** Legacy alias for `title`. */
  label?: string;
  value: string | number;
  icon: LucideIcon;
  /** Modern semantic tone. Defaults to the operations accent. */
  tone?: KpiTone;
  /** Legacy visual variant — mapped to a `tone` internally. */
  variant?: StatVariant;
  /** Percent change vs. previous period. Positive = green up, negative = red down. */
  change?: number;
  /** Optional helper text shown under the value (e.g. "vs yesterday"). */
  changeLabel?: string;
  /** Optional small caption rendered under the value. */
  caption?: string;
  /** Make the card hover-lift (use when the card is clickable). */
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard = ({
  title,
  label,
  value,
  icon: Icon,
  tone,
  variant,
  change,
  changeLabel = 'vs yesterday',
  caption,
  interactive = false,
  onClick,
  className = '',
}: StatCardProps) => {
  // Resolve the display title (title takes precedence, label is the legacy alias).
  const displayTitle = title ?? label;
  // Resolve tone: explicit tone wins, else map from legacy variant, else default accent.
  const resolvedTone: KpiTone = tone ?? (variant ? VARIANT_TO_TONE[variant] : 'accent');
  const toneStyles = kpiTone[resolvedTone];
  const hasChange = typeof change === 'number';
  const isUp = hasChange && (change as number) >= 0;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={[
        interactive || onClick ? card.interactive : card.base,
        'relative overflow-hidden text-left w-full',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${toneStyles.bar}`} />

      <div className={card.pad}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {displayTitle}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 tabular-nums">
              {value}
            </p>
            {caption && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{caption}</p>
            )}
            {hasChange && (
              <div
                className={[
                  'flex items-center gap-1 mt-2 text-xs font-medium',
                  isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                ].join(' ')}
              >
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span className="tabular-nums">{Math.abs(change as number)}%</span>
                <span className="text-gray-500 dark:text-gray-500 font-normal">{changeLabel}</span>
              </div>
            )}
          </div>

          {/* Icon chip */}
          <div className={`shrink-0 p-2.5 rounded-xl ${toneStyles.chip}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Component>
  );
};

export default StatCard;
