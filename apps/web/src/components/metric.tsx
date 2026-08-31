import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A single figure in the credit snapshot. Values are set in tabular numerals at
 * a size that lets the row be scanned in one pass.
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
  /** Marks the metrics that drive the credit decision. */
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('px-4 py-3', className)}>
      <div className="label-micro">{label}</div>
      <div
        className={cn(
          'tnum mt-1.5 font-medium tracking-[-0.015em]',
          emphasis ? 'text-[22px] leading-7' : 'text-[19px] leading-7',
        )}
      >
        {value}
      </div>
      {hint || trend ? (
        <div className="mt-0.5 flex items-center gap-2">
          {trend}
          {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Hairline-divided row of metrics. Collapses to two columns on narrow screens. */
export function MetricRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0',
        className,
      )}
      {...props}
    />
  );
}
