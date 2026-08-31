import type { ICMemo, ICMemoSection, MemoInputSummary } from '@uw/types';
import {
  ArrowLeft,
  Check,
  CircleCheck,
  FileText,
  PenLine,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EvidenceChip } from '@/components/evidence';
import { SeverityMeter } from '@/components/indicators';
import { ErrorState, PanelSkeleton, PrototypeScopeState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Panel, PanelBody, PanelHeader } from '@/components/ui/panel';
import { useAsync } from '@/hooks/use-async';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type MemoGenerationProgress, underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

/**
 * IC memo. The AI drafts a decision-ready artifact from the underwriting
 * record; the deal team reviews, edits and owns it. Generation is deliberately
 * legible — the inputs are shown before it runs and cited after.
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
    return <PanelSkeleton rows={6} />;
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
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="text-[13px] font-semibold">IC Memorandum</h2>
              <span className="inline-flex items-center gap-1 rounded-sm border border-info/25 bg-info-surface px-1.5 py-0.5 text-[11px] font-medium text-info">
                <Sparkles className="size-3" aria-hidden="true" />
                AI-drafted
              </span>
              <span className="tnum text-[11px] text-muted-foreground">
                Version {shown.version}
                <span className="mx-1.5 text-border-strong">·</span>
                {formatDateTime(shown.generatedAt)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Synthesised from {shown.inputs.length} underwriting inputs. Reviewed and owned by the
              deal team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
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
                <Button variant="outline" size="sm" onClick={() => navigate(`/deals/${deal.id}`)}>
                  <ArrowLeft aria-hidden="true" />
                  Back to Underwriting
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <p className="border-t border-border bg-warning-surface px-4 py-2 text-xs text-warning">
            Editing narrative sections. Changes are held locally in this prototype and are not
            persisted.
          </p>
        ) : null}
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Memo sections" className="hidden lg:block">
          <div className="sticky top-[76px]">
            <div className="label-micro mb-2">Contents</div>
            <ol className="space-y-0.5">
              {shown.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2 rounded-sm py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="tnum text-muted-foreground/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel className="flex flex-col justify-center px-8 py-10 text-center">
        <FileText
          className="mx-auto size-6 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h2 className="mt-3 text-[15px] font-semibold">IC Memo not yet generated</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          No investment committee memorandum has been drafted for {borrowerName}. Generating one
          composes the completed underwriting record into a decision-ready document for review.
        </p>
        <div className="mt-5">
          <Button size="lg" onClick={onGenerate}>
            <Sparkles aria-hidden="true" />
            Generate IC Memo
          </Button>
        </div>
        <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
          The draft is prepared for the deal team to review, edit and own. It does not constitute an
          approval.
        </p>
      </Panel>

      <Panel>
        <PanelHeader title="The memo will be based on" meta={`${inputs.length} inputs`} />
        <PanelBody className="py-2">
          <ul className="divide-y divide-border">
            {inputs.map((input) => (
              <li key={input.id} className="flex items-start gap-2.5 py-2.5">
                <CircleCheck
                  className="mt-0.5 size-3.5 shrink-0 text-positive"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">{input.label}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {input.detail}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </PanelBody>
      </Panel>
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
  const total = GENERATION_STEPS.length;
  const percent = Math.round(((activeIndex + 1) / total) * 100);

  return (
    <Panel className="mx-auto max-w-2xl">
      <PanelHeader title={`Drafting IC memorandum — ${borrowerName}`} meta={`${percent}%`} />
      <PanelBody className="py-5">
        <div className="h-1 w-full overflow-hidden rounded-sm bg-muted" role="presentation">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ol className="mt-5 space-y-2.5" aria-live="polite">
          {GENERATION_STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={step} className="flex items-center gap-2.5">
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {done ? (
                    <Check className="size-3.5 text-positive" strokeWidth={3} aria-hidden="true" />
                  ) : active ? (
                    <span
                      className="size-2 animate-pulse rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="size-1.5 rounded-full bg-border-strong" aria-hidden="true" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-[13px]',
                    done
                      ? 'text-muted-foreground'
                      : active
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground/60',
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </PanelBody>
    </Panel>
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
    <article className="rounded-md border border-border bg-surface">
      <header className="border-b border-border px-8 py-7">
        <div className="label-micro text-danger">
          Confidential — For investment committee use only
        </div>
        <h1 className="mt-2.5 font-serif text-[24px] font-semibold leading-tight tracking-[-0.01em]">
          {memo.title}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Prepared by {memo.preparedBy}
          <span className="mx-1.5 text-border-strong">·</span>
          {formatDateTime(memo.generatedAt)}
          <span className="mx-1.5 text-border-strong">·</span>
          Version {memo.version}
        </p>

        <div className="mt-5 rounded-sm border border-border bg-surface-sunken px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="label-micro">Recommendation</span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-positive/25 bg-positive-surface px-2 py-0.5 text-xs font-semibold text-positive">
              <CircleCheck className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
              Approve with conditions
            </span>
            <span className="tnum text-xs text-muted-foreground">
              {memo.conditions.length} conditions precedent
            </span>
          </div>
          <p className="mt-2 font-serif text-[14px] leading-relaxed text-foreground/90">
            {memo.recommendationSummary}
          </p>
        </div>
      </header>

      <div className="divide-y divide-border">
        {memo.sections.map((section, index) => (
          <MemoSectionBlock
            key={section.id}
            section={section}
            index={index}
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
  index,
  editing,
  onEditParagraph,
}: {
  section: ICMemoSection;
  index: number;
  editing: boolean;
  onEditParagraph: (sectionId: string, paragraphIndex: number, value: string) => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-36 px-8 py-6">
      <h2 className="flex items-baseline gap-2.5 text-[13px] font-semibold tracking-[0.01em]">
        <span className="tnum text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
        {section.title}
      </h2>

      <div className="mt-3 max-w-[74ch] space-y-3">
        {section.body.map((paragraph, paragraphIndex) =>
          editing ? (
            <textarea
              // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is stable while editing
              key={paragraphIndex}
              value={paragraph}
              onChange={(event) => onEditParagraph(section.id, paragraphIndex, event.target.value)}
              rows={Math.max(3, Math.ceil(paragraph.length / 95))}
              className="w-full resize-y rounded-sm border border-border-strong bg-surface-sunken px-2.5 py-2 font-serif text-[14px] leading-relaxed focus:bg-surface"
            />
          ) : (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: static rendered prose
              key={paragraphIndex}
              className="font-serif text-[14.5px] leading-[1.7] text-foreground/90"
            >
              {paragraph}
            </p>
          ),
        )}
      </div>

      {section.terms ? (
        <dl className="mt-4 max-w-2xl divide-y divide-border rounded-sm border border-border">
          {section.terms.map((term) => (
            <div key={term.label} className="flex items-baseline justify-between gap-6 px-3 py-1.5">
              <dt className="text-xs text-muted-foreground">{term.label}</dt>
              <dd className="tnum text-right text-[13px] font-medium">{term.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.bullets ? (
        <ul className="mt-4 max-w-[74ch] space-y-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5">
              <span
                className="mt-[9px] size-1 shrink-0 rounded-full bg-muted-foreground"
                aria-hidden="true"
              />
              <span className="font-serif text-[14.5px] leading-[1.7] text-foreground/90">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.riskBlocks ? (
        <div className="mt-4 max-w-[74ch] divide-y divide-border rounded-sm border border-border">
          {section.riskBlocks.map((block) => (
            <div key={block.title} className="px-3.5 py-3">
              <div className="flex items-center gap-2">
                <SeverityMeter severity={block.severity} />
                <h3 className="text-[13px] font-semibold">{block.title}</h3>
              </div>
              <p className="mt-1.5 font-serif text-[14px] leading-[1.65] text-foreground/90">
                {block.body}
              </p>
              <p className="mt-2 border-l-2 border-positive/40 pl-2.5 font-serif text-[14px] leading-[1.65] text-foreground/80">
                <span className="label-micro mr-1.5 not-italic text-positive">Mitigants</span>
                {block.mitigant}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {section.sources.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="label-micro mr-1">Sources</span>
          {section.sources.map((source) => (
            <EvidenceChip key={source.id} source={source} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
