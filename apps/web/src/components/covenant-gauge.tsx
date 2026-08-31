import type { Covenant } from '@uw/types';
import {
  covenantCushion,
  covenantTone,
  covenantUtilisation,
  formatCovenantValue,
} from '@/lib/covenant';
import { cn } from '@/lib/utils';
import { CovenantStatusPill } from './indicators';

const TONE_FILL = {
  positive: 'bg-positive',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

/**
 * Covenant headroom, rendered as distance consumed towards the covenant level.
 * The covenant line sits at the same place on every bar, so two covenants can
 * be compared at a glance regardless of whether the test is a maximum or a
 * minimum.
 */
export function CovenantGauge({ covenant }: { covenant: Covenant }) {
  const utilisation = covenantUtilisation(covenant);
  const tone = covenantTone(covenant);
  const { headroomLabel, cushionLabel } = covenantCushion(covenant);
  // The covenant line sits at 88% of the track, leaving room for an overshoot.
  const linePosition = 88;
  const fillWidth = Math.min(utilisation * linePosition, 100);

  return (
    <div className="px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold">{covenant.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{covenant.testFrequency}</p>
        </div>
        <CovenantStatusPill status={covenant.status} />
      </div>

      <div className="mt-3.5 flex items-end gap-6">
        <div>
          <div className="label-micro">Current</div>
          <div className="tnum mt-0.5 text-[20px] font-medium leading-6 tracking-[-0.015em]">
            {formatCovenantValue(covenant, covenant.current)}
          </div>
        </div>
        <div>
          <div className="label-micro">
            {covenant.direction === 'maximum' ? 'Maximum' : 'Minimum'}
          </div>
          <div className="tnum mt-0.5 text-[20px] font-medium leading-6 tracking-[-0.015em] text-muted-foreground">
            {formatCovenantValue(covenant, covenant.threshold)}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="label-micro">Headroom</div>
          <div
            className={cn(
              'tnum mt-0.5 text-[20px] font-medium leading-6 tracking-[-0.015em]',
              tone === 'positive'
                ? 'text-positive'
                : tone === 'warning'
                  ? 'text-warning'
                  : 'text-danger',
            )}
          >
            {headroomLabel.split(' ')[0]}
          </div>
        </div>
      </div>

      <div className="mt-3">
        {/*
          Decorative: the current level, the covenant level, the headroom and
          the cushion are all stated in text around this bar, so the graphic
          carries no information of its own.
        */}
        <div className="relative h-2.5 w-full rounded-sm bg-muted" aria-hidden="true">
          <div
            className={cn('absolute inset-y-0 left-0 rounded-l-sm', TONE_FILL[tone])}
            style={{ width: `${fillWidth}%` }}
          />
          {/* The covenant line. Hatched region beyond it is the breach zone. */}
          <div
            className="absolute inset-y-[-3px] w-px bg-foreground"
            style={{ left: `${linePosition}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 rounded-r-sm bg-[repeating-linear-gradient(135deg,var(--color-border-strong)_0_3px,transparent_3px_6px)]"
            style={{ left: `${linePosition}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4">
          <p className="text-xs text-muted-foreground">{cushionLabel}</p>
          <span className="label-micro shrink-0">
            {covenant.direction === 'maximum' ? 'Covenant limit' : 'Covenant floor'}
          </span>
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-2.5 text-xs leading-relaxed text-muted-foreground">
        {covenant.description}
      </p>

      {covenant.schedule ? (
        <div className="mt-2.5">
          <div className="label-micro mb-1.5">Step-down schedule</div>
          <div className="flex flex-wrap gap-1.5">
            {covenant.schedule.map((step) => (
              <span
                key={step.period}
                className="tnum inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 text-[11px]"
              >
                <span className="text-muted-foreground">{step.period}</span>
                <span className="font-medium">{formatCovenantValue(covenant, step.threshold)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
