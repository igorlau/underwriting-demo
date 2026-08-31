import type { DiligenceItem, Finding, Risk } from '@uw/types';
import { CircleDot, Link2 } from 'lucide-react';
import { useState } from 'react';
import { EvidenceChip } from '@/components/evidence';
import { DiligenceStatusPill, SeverityMeter } from '@/components/indicators';
import { RiskItem } from '@/components/risk-item';
import { CardSkeleton, ErrorState, PrototypeScopeState } from '@/components/states';
import { Card, CardBody, SectionHeading } from '@/components/ui/card';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

/**
 * Diligence workspace. Findings and the risk register sit on one screen because
 * they are read together — a finding matters once you know which risk it feeds.
 */
export function DiligencePage() {
  const deal = useDeal();
  const {
    status,
    data: items,
    error,
    reload,
  } = useAsync(() => underwritingService.getDiligence(deal.id), [deal.id]);
  const [selected, setSelected] = useState(0);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={4} />
      </div>
    );
  }
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (items.length === 0)
    return <PrototypeScopeState borrowerName={deal.borrowerName} area="Due diligence" />;

  const active = items[Math.min(selected, items.length - 1)];
  const allFindings = items.flatMap((item) => item.findings);
  const mitigantCount = deal.risks.reduce((n, r) => n + r.mitigants.length, 0);

  return (
    <div className="rise space-y-9">
      <section>
        <SectionHeading
          title="Workstreams"
          meta={`${allFindings.length} findings across ${items.length} workstreams`}
        />

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <WorkstreamTab
              key={item.id}
              item={item}
              selected={index === selected}
              onSelect={() => setSelected(index)}
            />
          ))}
        </div>

        <Card>
          <WorkstreamDetail item={active} risks={deal.risks} />
        </Card>
      </section>

      <section>
        <SectionHeading
          title="Risk register"
          meta={`${deal.risks.length} risks · ${mitigantCount} mitigants`}
        />
        <Card className="overflow-hidden">
          {deal.risks.map((risk, index) => (
            <RiskItem key={risk.id} risk={risk} findings={allFindings} defaultOpen={index === 0} />
          ))}
        </Card>
      </section>
    </div>
  );
}

function WorkstreamTab({
  item,
  selected,
  onSelect,
}: {
  item: DiligenceItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'rounded-xl border px-4 py-3.5 text-left transition-all',
        selected
          ? 'border-ink bg-surface shadow-card'
          : 'border-line bg-surface/60 hover:border-line-strong hover:bg-surface',
      )}
    >
      <div className={cn('text-[15px]', selected ? 'font-semibold' : 'font-medium text-ink-2')}>
        {item.label}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <DiligenceStatusPill status={item.status} />
        <span className="text-[13px] text-ink-3">
          {item.findings.length} {item.findings.length === 1 ? 'finding' : 'findings'}
        </span>
      </div>
    </button>
  );
}

function WorkstreamDetail({ item, risks }: { item: DiligenceItem; risks: Risk[] }) {
  return (
    <CardBody className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <p className="max-w-3xl text-[15px] leading-relaxed">{item.summary}</p>
        <div className="shrink-0 text-right text-[13px] text-ink-3">
          <div className="text-ink-2">{item.provider}</div>
          <div className="mt-0.5">
            {item.owner}
            <span className="mx-1.5">·</span>
            {formatDate(item.updatedAt)}
          </div>
        </div>
      </div>

      {item.openItems.length > 0 ? (
        <div className="rounded-xl bg-caution-soft px-5 py-4">
          <div className="text-[14px] font-semibold text-caution">
            {item.openItems.length} open items blocking sign-off
          </div>
          <ul className="mt-2.5 space-y-2">
            {item.openItems.map((openItem) => (
              <li key={openItem} className="flex items-start gap-2.5 text-[14px] leading-relaxed">
                <CircleDot
                  className="mt-1 size-3.5 shrink-0 text-caution"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                {openItem}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <div className="label mb-3">Findings</div>
        <ul className="space-y-5">
          {item.findings.map((finding) => (
            <li key={finding.id}>
              <FindingRow finding={finding} risks={risks} />
            </li>
          ))}
        </ul>
      </div>
    </CardBody>
  );
}

function FindingRow({ finding, risks }: { finding: Finding; risks: Risk[] }) {
  const linkedRisks = risks.filter((r) => finding.linkedRiskIds.includes(r.id));
  return (
    <div className="flex items-start gap-3">
      <SeverityMeter severity={finding.severity} className="mt-1.5" />
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-semibold leading-snug">{finding.title}</h4>
        <p className="mt-1.5 max-w-3xl text-[14.5px] leading-relaxed text-ink-2">
          {finding.detail}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <EvidenceChip source={finding.evidence} />
          {linkedRisks.map((risk) => (
            <span key={risk.id} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
              <Link2 className="size-3.5" aria-hidden="true" />
              Feeds risk: <span className="text-ink-2">{risk.title}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
