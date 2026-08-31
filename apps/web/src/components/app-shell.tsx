import type * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Application chrome. One slim bar that stays out of the way — the workspace
 * carries its own navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <Container className="flex h-14 items-center gap-3">
          <Link to="/deals" className="flex items-center gap-2.5">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-ink text-[12px] font-semibold text-white"
              aria-hidden="true"
            >
              M
            </span>
            <span className="text-[15px] font-semibold">Meridian Credit</span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[13px] text-ink-2 sm:inline">Private Credit</span>
            <span
              className="flex size-7 items-center justify-center rounded-full bg-surface-3 text-[12px] font-medium text-ink-2"
              title="M. Reyes"
            >
              MR
            </span>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}

/** Shared max-width container so every screen aligns to one grid. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('mx-auto w-full max-w-[1180px] px-6', className)}>{children}</div>;
}
