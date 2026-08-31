import type { DiligenceItem, Finding, Risk } from '@uw/types';
import { CircleDot, Link2 } from 'lucide-react';
import { useState } from 'react';
import { EvidenceChip } from '@/components/evidence';
import { DiligenceStatusPill, SeverityMeter } from '@/components/indicators';
import { RiskItem } from '@/components/risk-item';
import { ErrorState, PanelSkeleton, PrototypeScopeState } from '@/components/states';
import { Panel, PanelBody, PanelHeader } from '@/components/ui/panel';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

/**
 * Diligence workspace. Workstream findings and the risk register sit on one
 * screen because they are read together: a finding is only interesting once you
 * know which risk it feeds.
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
      <div className="space-y-4">
        <PanelSkeleton rows={5} />
        <PanelSkeleton rows={4} />
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
    <div className="space-y-4">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Diligence workstreams"
          meta={`${allFindings.length} findings across ${items.length} workstreams`}
        />

        <div className="grid grid-cols-2 divide-x divide-y divide-border border-b border-border lg:grid-cols-4 lg:divide-y-0">
          {items.map((item, index) => (
            <WorkstreamTab
              key={item.id}
              item={item}
              selected={index === selected}
              onSelect={() => setSelected(index)}
            />
          ))}
        </div>

        <WorkstreamDetail item={active} risks={deal.risks} />
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Risk register"
          meta={`${deal.risks.length} risks · ${mitigantCount} mitigants`}
          action={<span className="label-micro">Expand for evidence and mitigants</span>}
        />
        <div>
          {deal.risks.map((risk, index) => (
            <RiskItem key={risk.id} risk={risk} findings={allFindings} defaultOpen={index === 0} />
          ))}
        </div>
      </Panel>
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
        'relative px-4 py-3 text-left transition-colors',
        selected ? 'bg-surface' : 'bg-surface-sunken hover:bg-surface',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-x-0 top-0 h-0.5', selected ? 'bg-primary' : 'bg-transparent')}
      />
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-[13px]', selected ? 'font-semibold' : 'font-medium')}>
          {item.label}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DiligenceStatusPill status={item.status} />
        <span className="text-[11px] text-muted-foreground">
          {item.findings.length} {item.findings.length === 1 ? 'finding' : 'findings'}
        </span>
      </div>
    </button>
  );
}

function WorkstreamDetail({ item, risks }: { item: DiligenceItem; risks: Risk[] }) {
  return (
    <PanelBody className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0 max-w-3xl">
          <div className="label-micro mb-1.5">Workstream conclusion</div>
          <p className="text-[13px] leading-relaxed text-foreground/90">{item.summary}</p>
        </div>
        <dl className="shrink-0 space-y-1 text-right text-[11px] text-muted-foreground">
          <div>
            <dt className="sr-only">Provider</dt>
            <dd className="text-foreground/80">{item.provider}</dd>
          </div>
          <div>
            <dt className="sr-only">Owner</dt>
            <dd>
              Owner {item.owner}
              <span className="mx-1.5 text-border-strong">·</span>
              Updated {formatDate(item.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {item.openItems.length > 0 ? (
        <div className="rounded-sm border border-warning/25 bg-warning-surface px-3 py-2.5">
          <div className="label-micro mb-1.5 text-warning">
            Open items blocking sign-off ({item.openItems.length})
          </div>
          <ul className="space-y-1">
            {item.openItems.map((openItem) => (
              <li key={openItem} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <CircleDot
                  className="mt-1 size-3 shrink-0 text-warning"
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
        <div className="label-micro mb-2">Findings</div>
        <ul className="divide-y divide-border rounded-sm border border-border">
          {item.findings.map((finding) => (
            <li key={finding.id}>
              <FindingRow finding={finding} risks={risks} />
            </li>
          ))}
        </ul>
      </div>
    </PanelBody>
  );
}

function FindingRow({ finding, risks }: { finding: Finding; risks: Risk[] }) {
  const linkedRisks = risks.filter((r) => finding.linkedRiskIds.includes(r.id));
  return (
    <div className="px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <SeverityMeter severity={finding.severity} className="mt-1" />
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-semibold leading-snug">{finding.title}</h4>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-foreground/85">
            {finding.detail}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <EvidenceChip source={finding.evidence} />
            {linkedRisks.map((risk) => (
              <span
                key={risk.id}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <Link2 className="size-3" aria-hidden="true" />
                Feeds risk
                <span className="font-medium text-foreground/80">{risk.title}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
