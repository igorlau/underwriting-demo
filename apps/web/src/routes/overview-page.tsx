import type { DiligenceCategorySummary } from '@uw/types';
import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiligenceStatusPill, Trend } from '@/components/indicators';
import { Metric, MetricRow } from '@/components/metric';
import { RiskItem } from '@/components/risk-item';
import { Panel, PanelBody, PanelHeader, TermList, TermRow } from '@/components/ui/panel';
import { useAsync } from '@/hooks/use-async';
import {
  formatDate,
  formatMultiple,
  formatPercent,
  formatUsdCompact,
  formatUsdExact,
} from '@/lib/format';
import { underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

/**
 * The credit picture in one screen: what we are lending, on what numbers, what
 * could go wrong, and how far diligence has got. Detail lives one click away.
 */
export function OverviewPage() {
  const deal = useDeal();
  const { financials: fin, transaction: tx, borrower } = deal;
  // Read memo state at the source rather than caching it on the deal, so the
  // row cannot go stale after a memo is generated in the next tab along.
  const memo = useAsync(() => underwritingService.getMemo(deal.id), [deal.id]);

  return (
    <div className="space-y-4">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Financial snapshot"
          meta={fin.periodLabel}
          action={<span className="label-micro">Adjusted for QoE findings</span>}
        />
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
              <Trend current={fin.ebitda} prior={fin.priorYear?.ebitda} format={formatUsdCompact} />
            }
          />
          <Metric
            label="Net debt"
            value={formatUsdCompact(fin.netDebt)}
            hint="pro forma for close"
          />
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
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Transaction"
              meta={`Target close ${formatDate(tx.closeTargetDate)}`}
            />
            <PanelBody>
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
              <div className="mt-3 border-t border-border pt-3">
                <div className="label-micro mb-1.5">Use of proceeds</div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{tx.useOfProceeds}</p>
              </div>
            </PanelBody>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              title="Key risks"
              meta={`${deal.risks.length} identified`}
              action={
                <Link
                  to="diligence"
                  className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-primary hover:underline"
                >
                  Risk detail
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              }
            />
            <div>
              {deal.risks.map((risk, index) => (
                <RiskItem key={risk.id} risk={risk} defaultOpen={index === 0} />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Diligence status"
              action={
                <Link
                  to="diligence"
                  className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-primary hover:underline"
                >
                  Open
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="divide-y divide-border">
              {deal.diligenceSummary.map((item) => (
                <DiligenceSummaryRow key={item.category} item={item} />
              ))}
            </ul>
            <div className="border-t border-border bg-surface-sunken px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px]">
                  <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  IC memo
                </span>
                <Link
                  to="memo"
                  className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-primary hover:underline"
                >
                  {memo.status === 'success' && memo.data ? 'View memo' : 'Not generated'}
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Borrower" />
            <PanelBody>
              <p className="text-[13px] leading-relaxed text-foreground/90">
                {borrower.description}
              </p>
              <TermList className="mt-3 border-t border-border pt-1">
                <TermRow label="Headquarters" value={borrower.headquarters} />
                <TermRow label="Founded" value={borrower.founded} />
                <TermRow label="Employees" value={borrower.employees.toLocaleString('en-US')} />
                <TermRow label="Sector" value={borrower.sector} />
              </TermList>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DiligenceSummaryRow({ item }: { item: DiligenceCategorySummary }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium">{item.label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {item.findingCount > 0
            ? `${item.findingCount} ${item.findingCount === 1 ? 'finding' : 'findings'}`
            : 'No findings recorded'}
          {item.openItemCount > 0 ? (
            <>
              <span className="mx-1.5 text-border-strong">·</span>
              <span className="text-warning">{item.openItemCount} open</span>
            </>
          ) : null}
        </div>
      </div>
      <DiligenceStatusPill status={item.status} />
    </li>
  );
}
