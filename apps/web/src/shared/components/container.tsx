import type * as React from 'react';
import { cn } from '@/shared/lib/utils';

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
