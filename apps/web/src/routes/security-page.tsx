import { Lock } from 'lucide-react';
import { CovenantGauge } from '@/components/covenant-gauge';
import { Metric, MetricRow } from '@/components/metric';
import { ErrorState, PanelSkeleton, PrototypeScopeState } from '@/components/states';
import { Panel, PanelBody, PanelHeader, TermList, TermRow } from '@/components/ui/panel';
import { useAsync } from '@/hooks/use-async';
import { formatPercent, formatUsdCompact, formatUsdExact } from '@/lib/format';
import { underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

/** The proposed structure: what we are lending on and what protects us. */
export function SecurityPage() {
  const deal = useDeal();
  const {
    status,
    data: security,
    error,
    reload,
  } = useAsync(() => underwritingService.getSecurity(deal.id), [deal.id]);

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <PanelSkeleton rows={2} />
        <PanelSkeleton rows={6} />
      </div>
    );
  }
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (!security) return <PrototypeScopeState borrowerName={deal.borrowerName} area="Security" />;

  const pricing = `${security.benchmark} + ${formatPercent(security.spread)}`;

  return (
    <div className="space-y-4">
      <Panel className="overflow-hidden">
        <PanelHeader title={security.name} meta={security.lien} />
        <MetricRow>
          <Metric label="Principal" value={formatUsdCompact(security.principal)} emphasis />
          <Metric
            label="Pricing"
            value={pricing}
            hint={`${formatPercent(security.floor, 2)} floor`}
          />
          <Metric
            label="Maturity"
            value={`${security.maturityYears} yrs`}
            hint="bullet at maturity"
          />
          <Metric
            label="Amortisation"
            value={formatPercent(security.amortization, 0)}
            hint="per annum, quarterly"
          />
          <Metric label="Lien" value={security.lien} hint="all-asset security" />
        </MetricRow>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Covenants"
            meta={`${security.covenants.length} financial covenants`}
            action={<span className="label-micro">Headroom at close</span>}
          />
          <div className="divide-y divide-border">
            {security.covenants.map((covenant) => (
              <CovenantGauge key={covenant.id} covenant={covenant} />
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Terms" />
            <PanelBody>
              <TermList>
                <TermRow label="Principal" value={formatUsdExact(security.principal)} emphasis />
                <TermRow label="Instrument" value={security.instrument} />
                <TermRow label="Ranking" value={`${security.lien}, senior secured`} />
                <TermRow label="Benchmark" value={security.benchmark} />
                <TermRow label="Spread" value={formatPercent(security.spread)} />
                <TermRow label="Floor" value={formatPercent(security.floor, 2)} />
                <TermRow label="OID" value={(100 - security.oid * 100).toFixed(1)} />
                <TermRow label="Tenor" value={`${security.maturityYears} years`} />
                <TermRow
                  label="Amortisation"
                  value={`${formatPercent(security.amortization, 0)} p.a.`}
                />
                <TermRow label="Call protection" value={security.callProtection} />
              </TermList>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Collateral & guarantees" />
            <PanelBody>
              <ul className="space-y-2">
                {security.collateral.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Lock
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className="text-[13px] leading-relaxed text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-border pt-3">
                <div className="label-micro mb-1.5">Guarantors</div>
                <p className="text-[13px] leading-relaxed text-foreground/90">
                  {security.guarantors}
                </p>
              </div>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
