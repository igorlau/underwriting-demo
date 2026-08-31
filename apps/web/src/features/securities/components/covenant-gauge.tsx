import type { Covenant } from '@uw/types';
import { useEffect, useState } from 'react';
import {
  covenantAxis,
  covenantCushion,
  covenantThresholdLabel,
  covenantTone,
  formatCovenantValue,
} from '@/features/securities/lib/covenant';
import { CovenantStatusPill } from '@/shared/components/indicators';
import { cn } from '@/shared/lib/utils';

const TONE_FILL = {
  positive: 'bg-accent',
  warning: 'bg-caution',
  danger: 'bg-risk',
} as const;

const TONE_TEXT = {
  positive: 'text-accent',
  warning: 'text-caution',
  danger: 'text-risk',
} as const;

/**
 * Covenant headroom on a value axis running from zero, with the covenant marked
 * on it and the breaching region shaded on the side that fails the test — to
 * the right of a maximum, to the left of a minimum. The current value therefore
 * sits left of a ceiling and right of a floor, as it would on paper.
 *
 * On a minimum test the fill covers the shaded region while the credit is
 * compliant; the shading only becomes visible if the value falls through the
 * floor, which is exactly when it needs to be seen.
 */
export function CovenantGauge({ covenant }: { covenant: Covenant }) {
  const tone = covenantTone(covenant);
  const { headroomLabel, cushionLabel } = covenantCushion(covenant);
  const { thresholdPercent, currentPercent, breachFrom, breachTo } = covenantAxis(covenant);

  // Fill grows from zero on mount so the eye lands on where it stops.
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(currentPercent));
    return () => cancelAnimationFrame(id);
  }, [currentPercent]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">{covenant.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-3">{covenant.testFrequency}</p>
        </div>
        <CovenantStatusPill status={covenant.status} />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <div className="label">Current</div>
          <div className="tnum mt-1 text-[34px] font-semibold leading-none tracking-[-0.03em]">
            {formatCovenantValue(covenant, covenant.current)}
          </div>
        </div>
        <div className="text-right">
          <div className="label">Headroom</div>
          <div
            className={cn(
              'tnum mt-1 text-[34px] font-semibold leading-none tracking-[-0.03em]',
              TONE_TEXT[tone],
            )}
          >
            {headroomLabel.split(' ')[0]}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {/*
          Decorative: the current value, the covenant and the cushion are all
          stated in text around this meter, so the graphic adds no information
          a screen reader would miss.
        */}
        <div className="relative h-2.5 w-full rounded-full bg-surface-2" aria-hidden="true">
          {/* Values on this side of the covenant fail the test. */}
          <div
            className="absolute inset-y-0 bg-risk-soft"
            style={{ left: `${breachFrom}%`, width: `${breachTo - breachFrom}%` }}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out',
              TONE_FILL[tone],
            )}
            style={{ width: `${fill}%` }}
          />
          {/* The covenant itself, drawn last so it reads over the fill. */}
          <div
            className="absolute inset-y-[-5px] w-0.5 -translate-x-1/2 rounded-full bg-ink"
            style={{ left: `${thresholdPercent}%` }}
          />
        </div>

        <div className="relative mt-2.5 h-4 text-[13px]">
          <span className="absolute left-0 text-ink-3">0</span>
          <span
            className="tnum absolute -translate-x-1/2 whitespace-nowrap font-medium text-ink"
            style={{ left: `${thresholdPercent}%` }}
          >
            {covenantThresholdLabel(covenant)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed">{cushionLabel}</p>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{covenant.description}</p>
    </div>
  );
}
