import type { CovenantStatus, DiligenceStatus, Severity } from '@uw/types';
import { Check, Circle, Clock, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Status vocabulary. Every indicator pairs colour with a glyph or a shape and a
 * written label, so meaning survives greyscale and colour vision deficiency.
 */

const SEVERITY_LABEL: Record<Severity, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const SEVERITY_TEXT: Record<Severity, string> = {
  low: 'text-accent',
  medium: 'text-caution',
  high: 'text-risk',
};

const SEVERITY_CHIP: Record<Severity, string> = {
  low: 'bg-accent-soft text-accent',
  medium: 'bg-caution-soft text-caution',
  high: 'bg-risk-soft text-risk',
};

/** Three-bar meter: one bar low, two medium, three high. Reads without colour. */
export function SeverityMeter({
  severity,
  className,
  onInk = false,
}: {
  severity: Severity;
  className?: string;
  onInk?: boolean;
}) {
  const filled = severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
  return (
    <span
      className={cn(
        'inline-flex items-end gap-[2.5px]',
        onInk ? 'text-current' : SEVERITY_TEXT[severity],
        className,
      )}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] rounded-full',
            i === 0 ? 'h-[6px]' : i === 1 ? 'h-[9px]' : 'h-[12px]',
            i < filled ? 'bg-current' : onInk ? 'bg-white/25' : 'bg-line-strong',
          )}
        />
      ))}
    </span>
  );
}

const SEVERITY_CHIP_ON_INK: Record<Severity, string> = {
  low: 'bg-white/10 text-accent-on-ink',
  medium: 'bg-white/10 text-caution-on-ink',
  high: 'bg-white/10 text-risk-on-ink',
};

export function SeverityBadge({
  severity,
  className,
  label = 'severity',
  tone = 'light',
}: {
  severity: Severity;
  className?: string;
  label?: string;
  /** `dark` is used on the ink deal header, where hues are lightened. */
  tone?: 'light' | 'dark';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium',
        tone === 'dark' ? SEVERITY_CHIP_ON_INK[severity] : SEVERITY_CHIP[severity],
        className,
      )}
    >
      <SeverityMeter severity={severity} onInk={tone === 'dark'} />
      {SEVERITY_LABEL[severity]}
      <span className="sr-only">{label}</span>
    </span>
  );
}

const PILL =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium whitespace-nowrap';

const DILIGENCE_META: Record<DiligenceStatus, { label: string; icon: typeof Check; tone: string }> =
  {
    complete: { label: 'Complete', icon: Check, tone: 'bg-accent-soft text-accent' },
    'in-review': { label: 'In review', icon: Clock, tone: 'bg-caution-soft text-caution' },
    'not-started': { label: 'Not started', icon: Circle, tone: 'bg-surface-2 text-ink-2' },
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
    <span className={cn(PILL, meta.tone, className)}>
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const COVENANT_META: Record<CovenantStatus, { label: string; icon: typeof Check; tone: string }> = {
  'within-limit': { label: 'Within limit', icon: Check, tone: 'bg-accent-soft text-accent' },
  tight: { label: 'Limited headroom', icon: TriangleAlert, tone: 'bg-caution-soft text-caution' },
  breached: { label: 'Breached', icon: TriangleAlert, tone: 'bg-risk-soft text-risk' },
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
    <span className={cn(PILL, meta.tone, className)}>
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Neutral chip for counts, sectors and other non-status metadata. */
export function MetaChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(PILL, 'bg-surface-2 text-ink-2', className)}>{children}</span>;
}

/** Period-over-period movement, coloured by whether the move is favourable. */
export function Trend({
  current,
  prior,
  lowerIsBetter = false,
  format,
}: {
  current: number;
  prior?: number;
  /** Set where a lower number is the better outcome, e.g. leverage. */
  lowerIsBetter?: boolean;
  format: (value: number) => string;
}) {
  if (prior === undefined) return null;
  const delta = current - prior;
  if (Math.abs(delta) < 1e-9) {
    return <span className="text-[13px] text-ink-3">No change</span>;
  }
  const favourable = lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <span
      className={cn('tnum inline-flex items-baseline gap-1 text-[13px]', {
        'text-accent': favourable,
        'text-risk': !favourable,
      })}
    >
      <span aria-hidden="true">{delta > 0 ? '↑' : '↓'}</span>
      {format(Math.abs(delta))}
      <span className="text-ink-3">vs. last year</span>
    </span>
  );
}
