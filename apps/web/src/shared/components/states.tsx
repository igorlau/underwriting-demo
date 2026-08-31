import { CircleAlert, LayersIcon } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}

/** Placeholder that keeps the shape of the card it stands in for. */
export function CardSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <Card className={cn('px-6 py-6', className)}>
      <Skeleton className="h-4 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            key={i}
            className={cn('h-4', i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-2/3')}
          />
        ))}
      </div>
    </Card>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card className="px-6 py-12 text-center">
      <CircleAlert className="mx-auto size-6 text-risk" strokeWidth={1.75} aria-hidden="true" />
      <p className="mt-3 text-[15px] font-semibold">This view could not load</p>
      <p className="mx-auto mt-1 max-w-md text-[14px] text-ink-2">{error.message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = LayersIcon,
}: {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  icon?: typeof LayersIcon;
}) {
  return (
    <Card className="px-6 py-14 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-surface-2">
        <Icon className="size-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <p className="mt-4 text-[16px] font-semibold">{title}</p>
      <div className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-2">
        {description}
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

/**
 * Used where a deal exists in the pipeline but was intentionally not developed.
 * Stating the scope is clearer than an ambiguous empty screen.
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
      title={`No ${area.toLowerCase()} recorded for ${borrowerName}`}
      description={
        <>
          This prototype develops <span className="font-medium text-ink">ACME Inc.</span> end to
          end. {borrowerName} carries pipeline and overview data only, so the remaining workstreams
          are left empty rather than filled with placeholder content.
        </>
      }
    />
  );
}
