import type { DiligenceCategorySummary } from '@uw/types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiligenceStatusPill, Trend } from '@/shared/components/indicators';
import { Metric, MetricRow } from '@/shared/components/metric';
import { RiskItem } from '@/shared/components/risk-item';
import { useAsync } from '@/shared/hooks/use-async';
import {
  formatDate,
  formatMultiple,
  formatPercent,
  formatUsdCompact,
  formatUsdExact,
} from '@/shared/lib/format';
import { underwritingService } from '@/shared/services/underwriting';
import { Card, CardBody, SectionHeading, TermList, TermRow } from '@/shared/ui/card';
import { useDeal } from './deal-layout';

/**
 * The credit picture in one screen: what we are lending, on what numbers, what
 * could go wrong, and how far diligence has got. Detail is one click away.
 */
export function OverviewPage() {
  const deal = useDeal();
  const { financials: fin, transaction: tx, borrower } = deal;
  // Read memo state at the source rather than caching it on the deal, so the
  // row cannot go stale after a memo is generated in the next tab along.
  const memo = useAsync(() => underwritingService.getMemo(deal.id), [deal.id]);

  return (
    <div className="rise space-y-9">
      <section>
        <SectionHeading title="Financial snapshot" meta={fin.periodLabel} />
        <Card className="px-7 py-7">
          <MetricRow>
            <Metric
              label="Revenue"
              value={formatUsdCompact(fin.revenue)}
              trend={
                <Trend
                  current={fin.revenue}
                  prior={fin.priorYear?.revenue}
                  format={formatUsdCompact}
                />
              }
            />
            <Metric
              label="EBITDA"
              value={formatUsdCompact(fin.ebitda)}
              hint={`${formatPercent(fin.ebitdaMargin, 1)} margin`}
              trend={
                <Trend
                  current={fin.ebitda}
                  prior={fin.priorYear?.ebitda}
                  format={formatUsdCompact}
                />
              }
            />
            <Metric label="Net debt" value={formatUsdCompact(fin.netDebt)} hint="pro forma" />
            <Metric
              label="Net leverage"
              value={formatMultiple(fin.netLeverage)}
              emphasis
              trend={
                <Trend
                  current={fin.netLeverage}
                  prior={fin.priorYear?.netLeverage}
                  lowerIsBetter
                  format={(v) => formatMultiple(v)}
                />
              }
            />
            <Metric
              label="Interest coverage"
              value={formatMultiple(fin.interestCoverage)}
              emphasis
              hint="EBITDA / cash interest"
            />
          </MetricRow>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="space-y-9">
          <section>
            <SectionHeading
              title="Transaction"
              meta={`Target close ${formatDate(tx.closeTargetDate)}`}
            />
            <Card>
              <CardBody>
                <TermList>
                  <TermRow label="Borrower" value={borrower.legalName} />
                  <TermRow
                    label="Proposed facility"
                    value={formatUsdExact(tx.facilityAmount)}
                    emphasis
                  />
                  <TermRow label="Instrument" value={tx.instrument} />
                  <TermRow label="Maturity" value={`${tx.maturityYears} years from close`} />
                  <TermRow label="Sponsor" value={borrower.sponsor} />
                </TermList>
                <div className="mt-5 border-t border-line pt-4">
                  <div className="label mb-1.5">Use of proceeds</div>
                  <p className="text-[14.5px] leading-relaxed text-ink-2">{tx.useOfProceeds}</p>
                </div>
              </CardBody>
            </Card>
          </section>

          <section>
            <SectionHeading
              title="Key risks"
              meta={`${deal.risks.length} identified`}
              action={
                <Link
                  to="diligence"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
                >
                  Risk detail
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
            />
            <Card className="overflow-hidden">
              {deal.risks.map((risk, index) => (
                <RiskItem key={risk.id} risk={risk} defaultOpen={index === 0} />
              ))}
            </Card>
          </section>
        </div>

        <div className="space-y-9">
          <section>
            <SectionHeading title="Diligence" />
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {deal.diligenceSummary.map((item) => (
                  <DiligenceSummaryRow key={item.category} item={item} />
                ))}
              </ul>
              <Link
                to="memo"
                className="flex items-center justify-between gap-3 bg-surface-2 px-6 py-4 text-[14px] transition-colors hover:bg-surface-3"
              >
                <span className="font-medium">IC memo</span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
                  {memo.status === 'success' && memo.data ? 'View memo' : 'Not generated'}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </Card>
          </section>

          <section>
            <SectionHeading title="Borrower" />
            <Card>
              <CardBody>
                <p className="text-[14.5px] leading-relaxed text-ink-2">{borrower.description}</p>
                <div className="mt-5 border-t border-line pt-4">
                  <TermList>
                    <TermRow label="Headquarters" value={borrower.headquarters} />
                    <TermRow label="Founded" value={borrower.founded} />
                    <TermRow label="Employees" value={borrower.employees.toLocaleString('en-US')} />
                    <TermRow label="Sector" value={borrower.sector} />
                  </TermList>
                </div>
              </CardBody>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function DiligenceSummaryRow({ item }: { item: DiligenceCategorySummary }) {
  return (
    <li className="flex items-center justify-between gap-3 px-6 py-3.5">
      <div className="min-w-0">
        <div className="text-[14.5px] font-medium">{item.label}</div>
        <div className="mt-0.5 text-[13px] text-ink-3">
          {item.findingCount > 0
            ? `${item.findingCount} ${item.findingCount === 1 ? 'finding' : 'findings'}`
            : 'No findings'}
          {item.openItemCount > 0 ? (
            <>
              <span className="mx-1.5">·</span>
              <span className="text-caution">{item.openItemCount} open</span>
            </>
          ) : null}
        </div>
      </div>
      <DiligenceStatusPill status={item.status} />
    </li>
  );
}
