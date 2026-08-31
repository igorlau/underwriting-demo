import type * as React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * A figure in the credit snapshot. Set large enough to be read across a desk,
 * with the label above it — no boxes, no dividers, just rhythm.
 */
export function Metric({
  label,
  value,
  hint,
  trend,
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: React.ReactNode;
  /** Marks the two or three figures that drive the credit decision. */
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="label">{label}</div>
      <div
        className={cn(
          'tnum mt-1 font-semibold leading-none tracking-[-0.03em]',
          emphasis ? 'text-[34px]' : 'text-[28px]',
          emphasis && 'text-ink',
        )}
      >
        {value}
      </div>
      {hint || trend ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {trend}
          {hint ? <span className="text-[13px] text-ink-3">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Evenly spaced row of figures. Wraps to two columns on narrow screens. */
export function MetricRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-5', className)}
      {...props}
    />
  );
}
