import type { Covenant } from '@uw/types';
import { formatMultiple, formatPercent, formatUsdCompact } from './format';

/**
 * Fraction of the covenant "distance" already consumed, on a scale where 1.0 is
 * the covenant level itself. Deliberately uniform across maximum and minimum
 * covenants so a fuller bar always means less protection, whichever direction
 * the test runs in.
 */
export function covenantUtilisation(covenant: Covenant): number {
  const ratio =
    covenant.direction === 'maximum'
      ? covenant.current / covenant.threshold
      : covenant.threshold / covenant.current;
  return Math.max(0, Math.min(ratio, 1.25));
}

/**
 * Plain-language cushion. For the financial-ratio covenants this is the EBITDA
 * decline that would take the credit to the covenant level — the number a
 * non-specialist reader can actually act on.
 */
export function covenantCushion(covenant: Covenant): {
  headroomLabel: string;
  cushionLabel: string;
} {
  if (covenant.unit === 'usd') {
    return {
      headroomLabel: `${formatUsdCompact(covenant.headroom)} unused`,
      cushionLabel: `${formatUsdCompact(covenant.headroom)} of unused capacity against the ${formatUsdCompact(covenant.threshold)} limit.`,
    };
  }

  const decline = 1 - covenantUtilisation(covenant);
  return {
    headroomLabel: `${formatMultiple(covenant.headroom)} headroom`,
    cushionLabel: `EBITDA could fall ${formatPercent(decline, 1)} before this covenant is breached.`,
  };
}

/** Tone for the utilisation bar. Always accompanied by a labelled status pill. */
export function covenantTone(covenant: Covenant): 'positive' | 'warning' | 'danger' {
  const utilisation = covenantUtilisation(covenant);
  if (covenant.status === 'breached' || utilisation >= 1) return 'danger';
  if (covenant.status === 'tight' || utilisation >= 0.93) return 'warning';
  return 'positive';
}

export function formatCovenantValue(covenant: Covenant, value: number): string {
  if (covenant.unit === 'usd') return formatUsdCompact(value);
  if (covenant.unit === '%') return formatPercent(value, 1);
  return formatMultiple(value, 2);
}
