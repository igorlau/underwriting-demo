import { CircleAlert, Construction } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-sm bg-muted', className)} />;
}

/** Placeholder that preserves the shape of the panel it is standing in for. */
export function PanelSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('rounded-md border border-border bg-surface', className)}>
      <div className="border-b border-border px-4 py-2.5">
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            key={i}
            className={cn('h-3.5', i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-2/3')}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="rounded-md border border-border bg-surface px-4 py-8 text-center">
      <CircleAlert className="mx-auto size-5 text-danger" aria-hidden="true" />
      <p className="mt-2 text-[13px] font-medium">Could not load this view</p>
      <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">{error.message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Construction,
}: {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  icon?: typeof Construction;
}) {
  return (
    <div className="rounded-md border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
      <Icon
        className="mx-auto size-5 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <p className="mt-2.5 text-[13px] font-semibold">{title}</p>
      <div className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
        {description}
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/**
 * Used where a deal exists in the pipeline but was intentionally not developed.
 * Stating the scope explicitly is clearer than an ambiguous empty screen.
 */
export function PrototypeScopeState({
  borrowerName,
  area,
}: {
  borrowerName: string;
  area: string;
}) {
  return (
    <EmptyState
      title={`${area} is not populated for ${borrowerName}`}
      description={
        <>
          This prototype develops <strong className="font-medium text-foreground">ACME Inc.</strong>{' '}
          end to end. {borrowerName} carries pipeline and credit overview data only, so the
          remaining workstreams are intentionally empty rather than filled with placeholder content.
        </>
      }
    />
  );
}
