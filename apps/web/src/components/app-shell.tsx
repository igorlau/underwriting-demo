import type * as React from 'react';
import { Link } from 'react-router-dom';

/**
 * Application chrome. A single slim bar — the workspace itself carries the
 * navigation, so the shell stays out of the way.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/deals" className="flex items-center gap-2.5 rounded-sm">
            <span
              className="flex size-6 items-center justify-center rounded-sm bg-primary text-[10px] font-semibold tracking-[0.02em] text-primary-foreground"
              aria-hidden="true"
            >
              MC
            </span>
            <span className="text-[13px] font-semibold tracking-[-0.01em]">
              Meridian Credit Partners
            </span>
          </Link>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="label-micro">Underwriting Workspace</span>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Private Credit — Origination
            </span>
            <span
              className="flex size-6 items-center justify-center rounded-full border border-border-strong bg-surface-sunken text-[10px] font-medium"
              title="M. Reyes"
            >
              MR
            </span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

/** Shared max-width container so every screen aligns to the same grid. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-[1400px] px-6 ${className ?? ''}`}>{children}</div>;
}
