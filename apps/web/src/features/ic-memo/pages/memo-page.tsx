import type { ICMemo, ICMemoSection, MemoInputSummary } from '@uw/types';
import { ArrowLeft, Check, CircleCheck, PenLine, RefreshCw, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeal } from '@/features/deals/pages/deal-layout';
import { EvidenceChip } from '@/shared/components/evidence';
import { SeverityMeter } from '@/shared/components/indicators';
import { CardSkeleton, ErrorState, PrototypeScopeState } from '@/shared/components/states';
import { useAsync } from '@/shared/hooks/use-async';
import { formatDateTime } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { type MemoGenerationProgress, underwritingService } from '@/shared/services/underwriting';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

/**
 * IC memo. The AI drafts a decision-ready artifact from the underwriting
 * record; the deal team reviews, edits and owns it. Generation is deliberately
 * legible — inputs shown before it runs, sources cited after.
 */
export function MemoPage() {
  const deal = useDeal();
  const navigate = useNavigate();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const existing = useAsync(() => underwritingService.getMemo(deal.id), [deal.id]);
  const inputs = useAsync(() => underwritingService.getMemoInputs(deal.id), [deal.id]);

  const [memo, setMemo] = useState<ICMemo | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<MemoGenerationProgress | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ICMemo | null>(null);

  useEffect(() => {
    if (existing.status === 'success') setMemo(existing.data);
  }, [existing.status, existing.data]);

  const generate = useCallback(async () => {
    setGenerating(true);
    setEditing(false);
    setProgress({ index: 0, total: 5, label: 'Preparing underwriting record' });
    try {
      const next = await underwritingService.generateMemo(deal.id, {
        onProgress: (p) => {
          if (mounted.current) setProgress(p);
        },
      });
      if (mounted.current) setMemo(next);
    } finally {
      if (mounted.current) {
        setGenerating(false);
        setProgress(null);
      }
    }
  }, [deal.id]);

  if (existing.status === 'loading' || inputs.status === 'loading') {
    return <CardSkeleton rows={6} />;
  }
  if (existing.status === 'error')
    return <ErrorState error={existing.error} onRetry={existing.reload} />;
  if (inputs.status === 'success' && inputs.data === null && !memo) {
    return <PrototypeScopeState borrowerName={deal.borrowerName} area="IC memo" />;
  }

  if (generating) return <GeneratingState progress={progress} borrowerName={deal.borrowerName} />;

  if (!memo) {
    return (
      <NotGeneratedState
        borrowerName={deal.borrowerName}
        inputs={inputs.status === 'success' ? (inputs.data ?? []) : []}
        onGenerate={generate}
      />
    );
  }

  const shown = editing && draft ? draft : memo;

  return (
    <div className="rise space-y-6">
      <Card className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h2 className="text-[15px] font-semibold">IC memorandum</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[13px] font-medium text-accent">
                <Sparkles className="size-3.5" aria-hidden="true" />
                AI-drafted
              </span>
            </div>
            <p className="tnum mt-1 text-[13px] text-ink-3">
              Version {shown.version}
              <span className="mx-1.5">·</span>
              {formatDateTime(shown.generatedAt)}
              <span className="mx-1.5">·</span>
              from {shown.inputs.length} underwriting inputs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setDraft(null);
                  }}
                >
                  <X aria-hidden="true" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (draft) setMemo(draft);
                    setEditing(false);
                    setDraft(null);
                  }}
                >
                  <Check aria-hidden="true" />
                  Save edits
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(structuredClone(memo));
                    setEditing(true);
                  }}
                >
                  <PenLine aria-hidden="true" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={generate}>
                  <RefreshCw aria-hidden="true" />
                  Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/deals/${deal.id}`)}>
                  <ArrowLeft aria-hidden="true" />
                  Back to Underwriting
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <p className="mt-4 rounded-lg bg-caution-soft px-4 py-2.5 text-[13px] text-caution">
            Editing narrative sections. Changes stay in this browser — the prototype does not
            persist them.
          </p>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[172px_minmax(0,1fr)]">
        <nav aria-label="Memo sections" className="hidden lg:block">
          <div className="sticky top-[104px]">
            <div className="label mb-3">Contents</div>
            <ol className="space-y-1.5">
              {shown.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
                  >
                    <span className="tnum text-ink-3">{index + 1}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <MemoDocument
          memo={shown}
          editing={editing}
          onEditParagraph={(sectionId, paragraphIndex, value) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    sections: current.sections.map((section) =>
                      section.id === sectionId
                        ? {
                            ...section,
                            body: section.body.map((p, i) => (i === paragraphIndex ? value : p)),
                          }
                        : section,
                    ),
                  }
                : current,
            )
          }
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-generation
// ---------------------------------------------------------------------------

function NotGeneratedState({
  borrowerName,
  inputs,
  onGenerate,
}: {
  borrowerName: string;
  inputs: MemoInputSummary[];
  onGenerate: () => void;
}) {
  return (
    <div className="rise mx-auto max-w-3xl">
      <Card className="px-8 py-10 text-center sm:px-12">
        <h2 className="text-[24px] font-semibold tracking-[-0.025em]">IC memo not yet generated</h2>
        <p className="mx-auto mt-2.5 max-w-lg text-[15px] leading-relaxed text-ink-2">
          Draft an investment committee memorandum for {borrowerName} from the completed
          underwriting record. You review, edit and own the result.
        </p>

        <div className="mt-7">
          <Button size="lg" onClick={onGenerate}>
            <Sparkles aria-hidden="true" />
            Generate IC Memo
          </Button>
        </div>

        <div className="mt-9 border-t border-line pt-7 text-left">
          <div className="label mb-4 text-center">The memo will be based on</div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {inputs.map((input) => (
              <li key={input.id} className="flex items-start gap-2.5">
                <CircleCheck
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="text-[14.5px] font-medium">{input.label}</div>
                  <div className="mt-0.5 text-[13px] leading-relaxed text-ink-3">
                    {input.detail}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

const GENERATION_STEPS = [
  'Reading deal structure and security terms',
  'Consolidating LTM financials and covenant headroom',
  'Synthesising diligence findings across four workstreams',
  'Assessing key risks against proposed mitigants',
  'Drafting memorandum sections',
];

function GeneratingState({
  progress,
  borrowerName,
}: {
  progress: MemoGenerationProgress | null;
  borrowerName: string;
}) {
  const activeIndex = progress?.index ?? 0;
  const percent = Math.round(((activeIndex + 1) / GENERATION_STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="px-8 py-9 sm:px-10">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
          Drafting IC memorandum — {borrowerName}
        </h2>
        <p className="tnum mt-1 text-[14px] text-ink-2">{percent}% complete</p>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ol className="mt-7 space-y-3.5" aria-live="polite">
          {GENERATION_STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {done ? (
                    <Check className="size-4 text-accent" strokeWidth={3} aria-hidden="true" />
                  ) : active ? (
                    <span
                      className="size-2.5 animate-pulse rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="size-1.5 rounded-full bg-line-strong" aria-hidden="true" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-[14.5px]',
                    done ? 'text-ink-2' : active ? 'font-medium text-ink' : 'text-ink-3',
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

function MemoDocument({
  memo,
  editing,
  onEditParagraph,
}: {
  memo: ICMemo;
  editing: boolean;
  onEditParagraph: (sectionId: string, paragraphIndex: number, value: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <header className="border-b border-line px-8 pt-10 pb-8 sm:px-12">
        <p className="text-[13px] font-medium text-risk">
          Confidential — for investment committee use only
        </p>
        <h1 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-[-0.02em]">
          {memo.title}
        </h1>
        <p className="mt-2.5 text-[13px] text-ink-3">
          Prepared by {memo.preparedBy}
          <span className="mx-1.5">·</span>
          {formatDateTime(memo.generatedAt)}
        </p>

        <div className="mt-7 rounded-xl bg-accent-soft px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent">
              <CircleCheck className="size-4.5" strokeWidth={2.25} aria-hidden="true" />
              Approve with conditions
            </span>
            <span className="tnum text-[13px] text-accent/80">
              {memo.conditions.length} conditions precedent
            </span>
          </div>
          <p className="mt-2.5 font-serif text-[16px] leading-relaxed">
            {memo.recommendationSummary}
          </p>
        </div>
      </header>

      <div className="divide-y divide-line">
        {memo.sections.map((section) => (
          <MemoSectionBlock
            key={section.id}
            section={section}
            editing={editing}
            onEditParagraph={onEditParagraph}
          />
        ))}
      </div>
    </article>
  );
}

function MemoSectionBlock({
  section,
  editing,
  onEditParagraph,
}: {
  section: ICMemoSection;
  editing: boolean;
  onEditParagraph: (sectionId: string, paragraphIndex: number, value: string) => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-32 px-8 py-9 sm:px-12">
      <h2 className="text-[17px] font-semibold">{section.title}</h2>

      <div className="mt-4 max-w-[70ch] space-y-4">
        {section.body.map((paragraph, paragraphIndex) =>
          editing ? (
            <textarea
              // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is stable while editing
              key={paragraphIndex}
              value={paragraph}
              onChange={(event) => onEditParagraph(section.id, paragraphIndex, event.target.value)}
              rows={Math.max(3, Math.ceil(paragraph.length / 88))}
              className="w-full resize-y rounded-lg border border-line-strong bg-surface-2 px-4 py-3 font-serif text-[16px] leading-relaxed focus:bg-surface"
            />
          ) : (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: static rendered prose
              key={paragraphIndex}
              className="font-serif text-[16px] leading-[1.75]"
            >
              {paragraph}
            </p>
          ),
        )}
      </div>

      {section.terms ? (
        <dl className="mt-6 max-w-xl space-y-2.5 border-l-2 border-line pl-5">
          {section.terms.map((term) => (
            <div key={term.label} className="flex items-baseline justify-between gap-6">
              <dt className="text-[14px] text-ink-2">{term.label}</dt>
              <dd className="tnum text-right text-[14px] font-medium">{term.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.bullets ? (
        <ul className="mt-5 max-w-[70ch] space-y-3">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span
                className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="font-serif text-[16px] leading-[1.75]">{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.riskBlocks ? (
        <div className="mt-5 max-w-[70ch] space-y-5">
          {section.riskBlocks.map((block) => (
            <div key={block.title} className="rounded-xl bg-surface-2 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <SeverityMeter severity={block.severity} />
                <h3 className="text-[15px] font-semibold">{block.title}</h3>
              </div>
              <p className="mt-2 font-serif text-[15.5px] leading-[1.7]">{block.body}</p>
              <p className="mt-3 border-l-2 border-accent pl-4 font-serif text-[15.5px] leading-[1.7] text-ink-2">
                <span className="font-sans text-[13px] font-medium text-accent">Mitigants. </span>
                {block.mitigant}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {section.sources.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Sources</span>
          {section.sources.map((source) => (
            <EvidenceChip key={source.id} source={source} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
