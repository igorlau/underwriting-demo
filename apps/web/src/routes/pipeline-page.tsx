import type { Deal } from '@uw/types';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/app-shell';
import { SeverityBadge } from '@/components/indicators';
import { Metric, MetricRow } from '@/components/metric';
import { StageProgress } from '@/components/stage-progress';
import { CardSkeleton, ErrorState } from '@/components/states';
import { Card, SectionHeading } from '@/components/ui/card';
import { useAsync } from '@/hooks/use-async';
import { formatRelativeDays, formatUsdCompact } from '@/lib/format';
import { underwritingService } from '@/services/underwriting';

export function PipelinePage() {
  const { status, data: deals, error, reload } = useAsync(() => underwritingService.getDeals(), []);

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold tracking-[-0.03em]">Deal pipeline</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">
          Private credit opportunities in underwriting. Open a deal to work it.
        </p>
      </header>

      {status === 'loading' ? (
        <div className="space-y-6">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={6} />
        </div>
      ) : status === 'error' ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div className="rise">
          <Card className="px-7 py-6">
            <PipelineSummary deals={deals} />
          </Card>

          <div className="mt-9">
            <SectionHeading title="Active deals" meta={`${deals.length} in underwriting`} />
            <Card className="overflow-hidden">
              <ul>
                {deals.map((deal) => (
                  <li key={deal.id} className="border-b border-line last:border-b-0">
                    <DealRow deal={deal} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <p className="mt-5 text-[13px] text-ink-3">
            Seeded prototype data. ACME Inc. is developed end to end through IC memo.
          </p>
        </div>
      )}
    </Container>
  );
}

function PipelineSummary({ deals }: { deals: Deal[] }) {
  const commitments = deals.reduce((sum, d) => sum + d.amount, 0);
  const attention = deals.filter((d) => d.attentionFlag).length;
  const highRisk = deals.filter((d) => d.riskLevel === 'high').length;

  return (
    <MetricRow className="lg:grid-cols-4">
      <Metric label="Active deals" value={deals.length} hint="in underwriting" />
      <Metric
        label="Proposed commitments"
        value={formatUsdCompact(commitments)}
        hint="aggregate facility size"
      />
      <Metric label="High risk" value={highRisk} hint="at high risk rating" />
      <Metric label="Needs attention" value={attention} hint="with open items" />
    </MetricRow>
  );
}

function DealRow({ deal }: { deal: Deal }) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      className="group grid grid-cols-1 items-center gap-x-6 gap-y-5 px-7 py-5 transition-colors hover:bg-surface-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.95fr)_104px_minmax(250px,1.45fr)_80px]"
    >
      <div className="min-w-0">
        <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em]">
          {deal.borrowerName}
        </h3>
        <p className="mt-0.5 truncate text-[13px] text-ink-3">
          {deal.sector}
          <span className="mx-1.5">·</span>
          {deal.sponsor}
        </p>
        {deal.attentionFlag ? (
          <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-caution-soft py-1 pr-3 pl-2.5 text-[13px] text-caution">
            <TriangleAlert className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            <span className="truncate">{deal.attentionFlag}</span>
          </p>
        ) : null}
      </div>

      <div>
        <div className="tnum text-[17px] font-semibold tracking-[-0.02em]">
          {formatUsdCompact(deal.amount)}
        </div>
        <div className="mt-0.5 text-[13px] text-ink-2">{deal.transactionType}</div>
      </div>

      <div>
        <SeverityBadge severity={deal.riskLevel} label="risk level" />
      </div>

      <div className="lg:px-2">
        <StageProgress stage={deal.stage} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="text-[13px] text-ink-3">{formatRelativeDays(deal.updatedAt)}</span>
        <ChevronRight
          className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
