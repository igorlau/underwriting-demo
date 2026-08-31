import type { CovenantStatus, DiligenceStatus, Severity } from '@uw/types';
import { Check, CircleDashed, Clock3, Minus, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Status vocabulary for the workspace. Every indicator pairs colour with a
 * glyph and a written label, so meaning survives greyscale printing and colour
 * vision deficiency.
 */

const SEVERITY_LABEL: Record<Severity, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const SEVERITY_TONE: Record<Severity, string> = {
  low: 'text-positive',
  medium: 'text-warning',
  high: 'text-danger',
};

/** Three-bar meter: 1 bar low, 2 medium, 3 high. Reads without colour. */
export function SeverityMeter({ severity, className }: { severity: Severity; className?: string }) {
  const filled = severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
  return (
    <span
      className={cn('inline-flex items-end gap-[2px]', SEVERITY_TONE[severity], className)}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] rounded-[1px]',
            i === 0 ? 'h-[5px]' : i === 1 ? 'h-[8px]' : 'h-[11px]',
            i < filled ? 'bg-current' : 'bg-border-strong',
          )}
        />
      ))}
    </span>
  );
}

export function SeverityBadge({
  severity,
  className,
  label = 'severity',
}: {
  severity: Severity;
  className?: string;
  /** Word appended for screen readers, e.g. "High risk". */
  label?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <SeverityMeter severity={severity} />
      <span className={cn('text-xs font-medium', SEVERITY_TONE[severity])}>
        {SEVERITY_LABEL[severity]}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

const DILIGENCE_META: Record<
  DiligenceStatus,
  { label: string; icon: typeof Check; tone: string; surface: string }
> = {
  complete: {
    label: 'Complete',
    icon: Check,
    tone: 'text-positive',
    surface: 'bg-positive-surface border-positive/20',
  },
  'in-review': {
    label: 'In Review',
    icon: Clock3,
    tone: 'text-warning',
    surface: 'bg-warning-surface border-warning/25',
  },
  'not-started': {
    label: 'Not Started',
    icon: CircleDashed,
    tone: 'text-muted-foreground',
    surface: 'bg-muted border-border',
  },
};

export function DiligenceStatusPill({
  status,
  className,
}: {
  status: DiligenceStatus;
  className?: string;
}) {
  const meta = DILIGENCE_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium',
        meta.surface,
        meta.tone,
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const COVENANT_META: Record<
  CovenantStatus,
  { label: string; icon: typeof Check; tone: string; surface: string }
> = {
  'within-limit': {
    label: 'Within limit',
    icon: Check,
    tone: 'text-positive',
    surface: 'bg-positive-surface border-positive/20',
  },
  tight: {
    label: 'Limited headroom',
    icon: TriangleAlert,
    tone: 'text-warning',
    surface: 'bg-warning-surface border-warning/25',
  },
  breached: {
    label: 'Breached',
    icon: TriangleAlert,
    tone: 'text-danger',
    surface: 'bg-danger-surface border-danger/25',
  },
};

export function CovenantStatusPill({
  status,
  className,
}: {
  status: CovenantStatus;
  className?: string;
}) {
  const meta = COVENANT_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium',
        meta.surface,
        meta.tone,
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Neutral chip for counts, sectors, sponsors and other non-status metadata. */
export function MetaChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 text-[11px] text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small directional marker for period-over-period movement. */
export function Trend({
  current,
  prior,
  /** Set when a lower number is the better outcome (e.g. leverage). */
  lowerIsBetter = false,
  format,
}: {
  current: number;
  prior?: number;
  lowerIsBetter?: boolean;
  format: (value: number) => string;
}) {
  if (prior === undefined) return null;
  const delta = current - prior;
  if (Math.abs(delta) < 1e-9) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        flat
      </span>
    );
  }
  const favourable = lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <span
      className={cn(
        'tnum inline-flex items-center gap-0.5 text-[11px]',
        favourable ? 'text-positive' : 'text-danger',
      )}
    >
      <span aria-hidden="true">{delta > 0 ? '▲' : '▼'}</span>
      {format(Math.abs(delta))}
      <span className="text-muted-foreground">YoY</span>
    </span>
  );
}
