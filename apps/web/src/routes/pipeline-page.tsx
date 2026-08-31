import type { Deal } from '@uw/types';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/app-shell';
import { SeverityBadge } from '@/components/indicators';
import { Metric, MetricRow } from '@/components/metric';
import { StageProgress } from '@/components/stage-progress';
import { ErrorState, PanelSkeleton } from '@/components/states';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { useAsync } from '@/hooks/use-async';
import { formatRelativeDays, formatUsdCompact } from '@/lib/format';
import { underwritingService } from '@/services/underwriting';

export function PipelinePage() {
  const { status, data: deals, error, reload } = useAsync(() => underwritingService.getDeals(), []);

  return (
    <Container className="py-7">
      <header className="mb-5">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em]">Deal Pipeline</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Active private credit opportunities in underwriting. Select a deal to open its workspace.
        </p>
      </header>

      {status === 'loading' ? (
        <div className="space-y-4">
          <PanelSkeleton rows={2} />
          <PanelSkeleton rows={6} />
        </div>
      ) : status === 'error' ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <PipelineSummary deals={deals} />
          <Panel className="mt-4 overflow-hidden">
            <PanelHeader
              title="Active deals"
              meta={`${deals.length} in underwriting`}
              action={<span className="label-micro">Updated 30 Aug 2026</span>}
            />
            <ul>
              {deals.map((deal) => (
                <li key={deal.id} className="border-b border-border last:border-b-0">
                  <DealRow deal={deal} />
                </li>
              ))}
            </ul>
          </Panel>

          <p className="mt-3 text-xs text-muted-foreground">
            Prototype using seeded data. ACME Inc. is developed end to end through IC memo; the
            remaining deals carry pipeline and credit overview data only.
          </p>
        </>
      )}
    </Container>
  );
}

function PipelineSummary({ deals }: { deals: Deal[] }) {
  const commitments = deals.reduce((sum, d) => sum + d.amount, 0);
  const attention = deals.filter((d) => d.attentionFlag).length;
  const highRisk = deals.filter((d) => d.riskLevel === 'high').length;
  const atIc = deals.filter((d) => d.stage === 'ic-memo').length;

  return (
    <Panel className="overflow-hidden">
      <MetricRow className="lg:grid-cols-4">
        <Metric label="Active deals" value={deals.length} hint="in underwriting" />
        <Metric
          label="Proposed commitments"
          value={formatUsdCompact(commitments)}
          hint="aggregate facility size"
        />
        <Metric
          label="High risk"
          value={highRisk}
          hint={highRisk === 1 ? 'deal at high risk rating' : 'deals at high risk rating'}
        />
        <Metric
          label="Requiring attention"
          value={attention}
          hint={atIc > 0 ? `${atIc} deal ready for committee` : 'open workstream items'}
        />
      </MetricRow>
    </Panel>
  );
}

function DealRow({ deal }: { deal: Deal }) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      className="group grid grid-cols-1 items-center gap-x-6 gap-y-4 px-4 py-4 transition-colors hover:bg-surface-sunken lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_112px_minmax(240px,1.4fr)_128px]"
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            {deal.borrowerName}
          </h3>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {deal.sector}
          <span className="mx-1.5 text-border-strong">·</span>
          {deal.sponsor}
        </p>
        {deal.attentionFlag ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-warning">
            <TriangleAlert className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            <span className="truncate">{deal.attentionFlag}</span>
          </p>
        ) : null}
      </div>

      <div>
        <div className="tnum text-[15px] font-medium tracking-[-0.01em]">
          {formatUsdCompact(deal.amount)}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{deal.transactionType}</div>
      </div>

      <div>
        <div className="label-micro mb-1">Risk</div>
        <SeverityBadge severity={deal.riskLevel} label="risk level" />
      </div>

      <div className="lg:px-2">
        <StageProgress stage={deal.stage} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{formatRelativeDays(deal.updatedAt)}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground/80">
            Lead {deal.leadInitials}
          </div>
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-border-strong transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
