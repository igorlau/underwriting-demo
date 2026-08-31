/**
 * Presentation-only formatters. Domain values stay raw (absolute USD, decimal
 * rates, plain multiples) so that a future API contract does not have to carry
 * pre-formatted strings.
 */

/** $100M / $12.5M / $940k — the shorthand a deal team actually reads. */
export function formatUsdCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${trim(value / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `$${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `$${trim(value / 1_000)}k`;
  return `$${value.toFixed(0)}`;
}

export function formatUsdExact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** 5.0x */
export function formatMultiple(value: number, digits = 1): string {
  return `${value.toFixed(digits)}x`;
}

/** 0.06 -> 6.00% */
export function formatPercent(value: number, digits = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Signed multiple, used for covenant headroom. */
export function formatSignedMultiple(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(digits)}x`;
}

/** 21 Aug 2026 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

/** 21 Aug 2026, 14:32 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** "3 days ago" — relative freshness for pipeline rows. */
export function formatRelativeDays(iso: string, now = new Date()): string {
  const days = Math.round((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
}
