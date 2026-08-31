import type * as React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * The one surface primitive. A soft white card on the warm canvas — no header
 * rails, no nested boxes. Structure comes from spacing and type weight.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn('rounded-xl border border-line bg-surface shadow-card', className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  meta,
  action,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex items-start justify-between gap-4 px-6 pt-5 pb-1', className)}>
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold">{title}</h2>
        {meta ? <p className="mt-0.5 text-[13px] text-ink-2">{meta}</p> : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </header>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

/** Section heading that sits on the canvas, above a card or a group of them. */
export function SectionHeading({
  title,
  meta,
  action,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-4', className)}>
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-[16px] font-semibold">{title}</h2>
        {meta ? <span className="text-[13px] text-ink-3">{meta}</span> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Label/value pairs for term sheets and summaries. */
export function TermList({ className, ...props }: React.HTMLAttributes<HTMLDListElement>) {
  return <dl className={cn('space-y-2.5', className)} {...props} />;
}

export function TermRow({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-[14px] text-ink-2">{label}</dt>
      <dd className="text-right">
        <span
          className={cn('tnum text-[14px]', emphasis ? 'text-[15px] font-semibold' : 'font-medium')}
        >
          {value}
        </span>
        {hint ? <span className="ml-2 text-[13px] text-ink-3">{hint}</span> : null}
      </dd>
    </div>
  );
}
