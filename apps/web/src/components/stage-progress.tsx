import { DEAL_STAGE_LABELS, DEAL_STAGE_SHORT_LABELS, DEAL_STAGES, type DealStage } from '@uw/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The underwriting process rail: Deal → Securities → Due Diligence → IC Memo.
 * Completed stages carry a check, the current stage a filled ring, future
 * stages a hollow node — legible without relying on colour.
 *
 * Laid out as four equal grid columns with the connectors drawn between node
 * centres, so label width can never push the rail out of shape. Labels centre
 * under their node and wrap rather than collide when space is tight.
 */
export function StageProgress({
  stage,
  size = 'md',
  tone = 'light',
  className,
}: {
  stage: DealStage;
  size?: 'sm' | 'md';
  /** `dark` is used on the ink deal header. */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const currentIndex = DEAL_STAGES.indexOf(stage);
  const dark = tone === 'dark';
  const compact = size === 'sm';

  const nodeSize = compact ? 18 : 22;
  // Keeps the connector clear of the node it starts from.
  const inset = nodeSize / 2 + 6;
  const labels = compact ? DEAL_STAGE_SHORT_LABELS : DEAL_STAGE_LABELS;

  return (
    <ol
      className={cn('grid grid-cols-4', className)}
      aria-label={`Underwriting progress — current stage ${DEAL_STAGE_LABELS[stage]}`}
    >
      {DEAL_STAGES.map((s, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const last = index === DEAL_STAGES.length - 1;

        return (
          <li
            key={s}
            className="relative flex flex-col items-center gap-2"
            aria-current={current ? 'step' : undefined}
          >
            {!last ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute h-0.5 rounded-full',
                  done
                    ? dark
                      ? 'bg-accent-on-ink'
                      : 'bg-accent'
                    : dark
                      ? 'bg-on-ink-line'
                      : 'bg-line-strong',
                )}
                style={{
                  top: nodeSize / 2 - 1,
                  left: `calc(50% + ${inset}px)`,
                  // Columns are equal width, so -50% lands on the next node's centre.
                  right: `calc(-50% + ${inset}px)`,
                }}
              />
            ) : null}

            <span
              style={{ width: nodeSize, height: nodeSize }}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full transition-colors',
                done && (dark ? 'bg-accent-on-ink text-ink' : 'bg-accent text-white'),
                current && (dark ? 'bg-white' : 'bg-surface ring-2 ring-accent'),
                !done &&
                  !current &&
                  (dark
                    ? 'border border-on-ink-line bg-ink'
                    : 'border border-line-strong bg-surface'),
              )}
            >
              {done ? (
                <Check
                  className={compact ? 'size-3' : 'size-3.5'}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              ) : current ? (
                <span
                  className={cn(
                    'rounded-full',
                    dark ? 'bg-ink' : 'bg-accent',
                    compact ? 'size-1.5' : 'size-2',
                  )}
                />
              ) : null}
            </span>

            <span
              className={cn(
                'px-0.5 text-center leading-tight',
                compact ? 'text-[11px]' : 'text-[13px]',
                current
                  ? cn('font-semibold', dark ? 'text-on-ink' : 'text-ink')
                  : done
                    ? dark
                      ? 'text-on-ink-2'
                      : 'text-ink-2'
                    : dark
                      ? 'text-on-ink-2/60'
                      : 'text-ink-3',
              )}
            >
              {labels[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
