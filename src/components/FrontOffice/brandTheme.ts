/**
 * Front Office Brand Theme
 * ──────────────────────────────────────────────────────────────────────────
 * Single source of truth for the Front Office portal's visual language.
 *
 * Built on the app-wide "Earthy Luxury" palette (see src/index.css) and the
 * Operations domain accent (terracotta). Every Front Office module should
 * import from here instead of hard-coding Tailwind color names, so the whole
 * portal stays visually consistent and theme-aware (light/dark).
 *
 * Design principles:
 *  - ONE primary accent (terracotta / operations) across the whole portal.
 *  - Semantic states (success/warning/danger/info) for status, not random hues.
 *  - Neutral surfaces come from the earthy luxury tokens (cream/sand/charcoal).
 *  - Cards share one radius, one border, one shadow, one hover treatment.
 */

// ── Surface & text classes (earthy luxury neutrals) ───────────────────────
export const surface = {
  /** Primary card / panel background. */
  card: 'bg-white dark:bg-slate-800',
  /** Subtle inset / secondary surface (table headers, sub-panels). */
  inset: 'bg-slate-50 dark:bg-slate-900/40',
  /** Page-level background is owned by ErpLayout; this is for inner sections. */
  section: 'bg-white dark:bg-slate-800',
  /** Hover treatment for interactive cards / list rows. */
  hover: 'hover:bg-slate-50 dark:hover:bg-slate-700/60',
} as const;

export const text = {
  primary: 'text-gray-900 dark:text-white',
  secondary: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-500',
  accent: 'text-[var(--color-accent-operations)] dark:text-[var(--color-accent-operations)]',
} as const;

export const border = {
  default: 'border-gray-200 dark:border-slate-700',
  strong: 'border-gray-300 dark:border-slate-600',
  accent: 'border-[var(--color-accent-operations)]',
} as const;

// ── Card style (the ONE card style for the whole portal) ──────────────────
export const card = {
  /** Base card: consistent radius, border, shadow, surface. */
  base: [
    'bg-white dark:bg-slate-800',
    'rounded-2xl',
    'border border-gray-200 dark:border-slate-700',
    'card-shadow',
    'smooth-transition',
  ].join(' '),
  /** Card with hover lift (use for interactive / clickable cards). */
  interactive: [
    'bg-white dark:bg-slate-800',
    'rounded-2xl',
    'border border-gray-200 dark:border-slate-700',
    'card-shadow hover:card-shadow-hover',
    'smooth-transition hover:-translate-y-0.5',
  ].join(' '),
  /** Padding presets. */
  pad: 'p-6',
  padSm: 'p-4',
  padLg: 'p-8',
} as const;

// ── Primary button (operations accent) ────────────────────────────────────
export const button = {
  primary: [
    'inline-flex items-center justify-center gap-2',
    'px-4 py-2 rounded-xl',
    'bg-[var(--color-accent-operations)] text-white',
    'hover:bg-[var(--color-accent-operations-hover)]',
    'font-medium text-sm',
    'smooth-transition focus-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  secondary: [
    'inline-flex items-center justify-center gap-2',
    'px-4 py-2 rounded-xl',
    'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200',
    'border border-gray-200 dark:border-slate-700',
    'hover:bg-slate-50 dark:hover:bg-slate-700',
    'font-medium text-sm',
    'smooth-transition focus-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'inline-flex items-center justify-center gap-2',
    'px-3 py-1.5 rounded-lg',
    'text-gray-600 dark:text-gray-300',
    'hover:bg-slate-100 dark:hover:bg-slate-700',
    'text-sm font-medium smooth-transition',
  ].join(' '),
} as const;

// ── Semantic status (used for badges, alerts, KPI deltas) ─────────────────
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

export const statusTone: Record<StatusTone, {
  /** Solid badge (icon + text on accent fill). */
  badge: string;
  /** Soft tinted badge (light bg + colored text). */
  soft: string;
  /** Text-only color. */
  text: string;
  /** Left border accent (for alert rows). */
  border: string;
  /** Dot indicator. */
  dot: string;
}> = {
  success: {
    badge: 'bg-[var(--color-success)] text-white',
    soft: 'bg-[var(--color-success)]/10 text-[var(--color-success)] dark:text-[var(--color-success)]',
    text: 'text-[var(--color-success)]',
    border: 'border-l-[var(--color-success)]',
    dot: 'bg-[var(--color-success)]',
  },
  warning: {
    badge: 'bg-[var(--color-warning)] text-white',
    soft: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] dark:text-[var(--color-warning)]',
    text: 'text-[var(--color-warning)]',
    border: 'border-l-[var(--color-warning)]',
    dot: 'bg-[var(--color-warning)]',
  },
  danger: {
    badge: 'bg-[var(--color-danger)] text-white',
    soft: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] dark:text-[var(--color-danger)]',
    text: 'text-[var(--color-danger)]',
    border: 'border-l-[var(--color-danger)]',
    dot: 'bg-[var(--color-danger)]',
  },
  info: {
    badge: 'bg-[var(--color-info)] text-white',
    soft: 'bg-[var(--color-info)]/10 text-[var(--color-info)] dark:text-[var(--color-info)]',
    text: 'text-[var(--color-info)]',
    border: 'border-l-[var(--color-info)]',
    dot: 'bg-[var(--color-info)]',
  },
  neutral: {
    badge: 'bg-gray-500 text-white',
    soft: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-l-gray-400',
    dot: 'bg-gray-400',
  },
  accent: {
    badge: 'bg-[var(--color-accent-operations)] text-white',
    soft: 'bg-[var(--color-accent-operations)]/10 text-[var(--color-accent-operations)]',
    text: 'text-[var(--color-accent-operations)]',
    border: 'border-l-[var(--color-accent-operations)]',
    dot: 'bg-[var(--color-accent-operations)]',
  },
} as const;

// ── KPI accent map ─────────────────────────────────────────────────────────
// Instead of a rainbow of Tailwind colors, KPIs use the operations accent
// plus the semantic tones. This keeps the dashboard cohesive while still
// letting each metric carry a subtle identity.
export type KpiTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const kpiTone: Record<KpiTone, {
  /** Icon chip background + icon color. */
  chip: string;
  /** Accent bar / top border. */
  bar: string;
}> = {
  accent: {
    chip: 'bg-[var(--color-accent-operations)]/10 text-[var(--color-accent-operations)]',
    bar: 'bg-[var(--color-accent-operations)]',
  },
  success: {
    chip: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    bar: 'bg-[var(--color-success)]',
  },
  warning: {
    chip: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    bar: 'bg-[var(--color-warning)]',
  },
  danger: {
    chip: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
    bar: 'bg-[var(--color-danger)]',
  },
  info: {
    chip: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
    bar: 'bg-[var(--color-info)]',
  },
  neutral: {
    chip: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300',
    bar: 'bg-gray-400',
  },
} as const;

// ── Layout helpers ─────────────────────────────────────────────────────────
export const layout = {
  /** Standard vertical rhythm between top-level sections. */
  sectionStack: 'space-y-6',
  /** Standard KPI grid (responsive). */
  kpiGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  /** Standard action grid. */
  actionGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
} as const;

// ── Animation ──────────────────────────────────────────────────────────────
export const animation = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-[fade-in-up_0.4s_ease-out]',
} as const;

// ── Page header (consistent across all modules) ───────────────────────────
export const pageTitle = 'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight';
export const pageSubtitle = 'text-sm text-gray-600 dark:text-gray-400 mt-1';
export const sectionTitle = 'text-lg font-bold text-gray-900 dark:text-white';

// ── Gradient presets (used by stat tiles & avatars) ───────────────────────
// Rich gradient backgrounds that pair with `text-white` content. Built from
// the earthy luxury CSS variables so they stay on-theme in light/dark mode.
export const FO_STAT_GRADIENTS = {
  /** Primary / occupancy — terracotta (operations accent). */
  primary: 'bg-gradient-to-br from-[var(--color-accent-operations)] to-[var(--color-accent-operations-hover)]',
  /** Rooms / inventory — sage (guest accent). */
  rooms: 'bg-gradient-to-br from-[var(--color-accent-guest)] to-[var(--color-accent-guest-hover)]',
  /** Alerts / danger — terracotta-red. */
  alert: 'bg-gradient-to-br from-[var(--color-danger)] to-[var(--color-danger-hover)]',
  /** Revenue — brass (finance accent). */
  revenue: 'bg-gradient-to-br from-[var(--color-accent-finance)] to-[var(--color-accent-finance-hover)]',
  /** Guests / loyalty — sage-green mix. */
  guests: 'bg-gradient-to-br from-[var(--color-accent-guest)] to-[var(--color-success)]',
} as const;

/** Guest avatar gradient — warm terracotta → brass. */
export const FO_AVATAR_GRADIENT = 'bg-gradient-to-br from-[var(--color-accent-operations)] to-[var(--color-accent-finance)]';
