import { DEAL_STAGE_LABELS, DEAL_STAGES, type DealStage } from '@uw/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The underwriting process rail: Deal → Securities → Due Diligence → IC Memo.
 * Completed stages carry a check, the current stage a filled ring, future
 * stages a hollow node — so the state is legible without relying on colour.
 */
export function StageProgress({
  stage,
  size = 'md',
  className,
}: {
  stage: DealStage;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const currentIndex = DEAL_STAGES.indexOf(stage);
  const node = size === 'sm' ? 'size-4' : 'size-5';
  const label = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <ol
      className={cn('flex items-start', className)}
      aria-label={`Underwriting progress — current stage ${DEAL_STAGE_LABELS[stage]}`}
    >
      {DEAL_STAGES.map((s, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={s}
            className={cn(
              'flex min-w-0 items-start',
              index === DEAL_STAGES.length - 1 ? '' : 'flex-1',
            )}
            aria-current={current ? 'step' : undefined}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full',
                  node,
                  done && 'bg-primary text-primary-foreground',
                  current && 'border-2 border-primary bg-surface',
                  !done && !current && 'border border-border-strong bg-surface',
                )}
              >
                {done ? (
                  <Check
                    className={size === 'sm' ? 'size-2.5' : 'size-3'}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                ) : current ? (
                  <span
                    className={cn('rounded-full bg-primary', size === 'sm' ? 'size-1.5' : 'size-2')}
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap font-medium tracking-[0.01em]',
                  label,
                  current
                    ? 'text-foreground'
                    : done
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/70',
                )}
              >
                {DEAL_STAGE_LABELS[s]}
              </span>
            </div>
            {index < DEAL_STAGES.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'mx-1.5 h-px flex-1 self-start',
                  size === 'sm' ? 'mt-2' : 'mt-2.5',
                  done ? 'bg-primary' : 'bg-border-strong',
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
