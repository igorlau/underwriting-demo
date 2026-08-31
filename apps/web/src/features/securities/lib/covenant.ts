import type { Covenant } from '@uw/types';
import { formatMultiple, formatPercent } from '@/shared/lib/format';

/**
 * Covenant maths.
 *
 * The meter is a value axis running from zero, with the covenant marked on it
 * and the breach zone shaded on whichever side fails the test: to the right of
 * a maximum, to the left of a minimum. So 5.00x sits left of its 5.50x ceiling
 * and 2.10x sits right of its 2.00x floor, which is how each reads on paper.
 */

/** Where the covenant sits on the track, leaving room to show a breach. */
const MARKER_POSITION = 0.75;

export interface CovenantAxis {
  /** Value at the right-hand end of the track. */
  axisMax: number;
  /** Position of the covenant, as a percentage of track width. */
  thresholdPercent: number;
  /** Position of the current value, as a percentage of track width. */
  currentPercent: number;
  /** Extent of the breaching region, as percentages of track width. */
  breachFrom: number;
  breachTo: number;
}

/**
 * Scales the axis so the covenant sits three quarters along, widening it if the
 * current value would otherwise run off the end.
 */
export function covenantAxis(covenant: Covenant): CovenantAxis {
  const axisMax = Math.max(covenant.threshold / MARKER_POSITION, covenant.current * 1.08);
  const thresholdPercent = (covenant.threshold / axisMax) * 100;
  const currentPercent = Math.max(0, Math.min((covenant.current / axisMax) * 100, 100));

  return {
    axisMax,
    thresholdPercent,
    currentPercent,
    breachFrom: covenant.direction === 'maximum' ? thresholdPercent : 0,
    breachTo: covenant.direction === 'maximum' ? 100 : thresholdPercent,
  };
}

/** The covenant marker's caption, in the test's own direction. */
export function covenantThresholdLabel(covenant: Covenant): string {
  const value = formatCovenantValue(covenant, covenant.threshold);
  return covenant.direction === 'maximum' ? `Max ${value}` : `Min ${value}`;
}

/**
 * Fraction of the way from a pristine credit to the covenant level. Retained
 * because it is the cleanest input to the tone thresholds.
 */
export function covenantUtilisation(covenant: Covenant): number {
  const ratio =
    covenant.direction === 'maximum'
      ? covenant.current / covenant.threshold
      : covenant.threshold / covenant.current;
  return Math.max(0, Math.min(ratio, 1.25));
}

/** The EBITDA decline that would take the credit to the covenant level. */
export function covenantCushionFraction(covenant: Covenant): number {
  return Math.max(0, 1 - covenantUtilisation(covenant));
}

/** The plain-language cushion, for the sentence beneath the meter. */
export function covenantCushion(covenant: Covenant): {
  headroomLabel: string;
  cushionLabel: string;
} {
  return {
    headroomLabel: `${formatMultiple(covenant.headroom)} headroom`,
    cushionLabel: `EBITDA could fall ${formatPercent(covenantCushionFraction(covenant), 1)} before this covenant is breached.`,
  };
}

/** Tone for the meter. Always accompanied by a labelled status pill. */
export function covenantTone(covenant: Covenant): 'positive' | 'warning' | 'danger' {
  if (covenant.status === 'breached') return 'danger';
  const cushion = covenantCushionFraction(covenant);
  if (cushion <= 0.03) return 'danger';
  if (covenant.status === 'tight' || cushion <= 0.07) return 'warning';
  return 'positive';
}

export function formatCovenantValue(covenant: Covenant, value: number): string {
  if (covenant.unit === '%') return formatPercent(value, 1);
  return formatMultiple(value, 2);
}
