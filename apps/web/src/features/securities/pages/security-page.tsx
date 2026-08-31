import { useDeal } from '@/features/deals/pages/deal-layout';
import { CovenantGauge } from '@/features/securities/components/covenant-gauge';
import { Metric, MetricRow } from '@/shared/components/metric';
import { CardSkeleton, ErrorState, PrototypeScopeState } from '@/shared/components/states';
import { useAsync } from '@/shared/hooks/use-async';
import { formatPercent, formatUsdCompact } from '@/shared/lib/format';
import { underwritingService } from '@/shared/services/underwriting';
import { Card, SectionHeading } from '@/shared/ui/card';

/** The proposed structure: what we are lending on, and what protects us. */
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
      <div className="space-y-6">
        <CardSkeleton rows={2} />
        <CardSkeleton rows={6} />
      </div>
    );
  }
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (!security) return <PrototypeScopeState borrowerName={deal.borrowerName} area="Security" />;

  return (
    <div className="rise space-y-9">
      <section>
        <SectionHeading title={security.name} meta={security.lien} />
        <Card className="px-7 py-7">
          <MetricRow>
            <Metric label="Principal" value={formatUsdCompact(security.principal)} emphasis />
            <Metric
              label="Spread"
              value={`${security.benchmark} + ${formatPercent(security.spread)}`}
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
        </Card>
      </section>

      <section>
        <SectionHeading
          title="Covenant headroom"
          meta={`${security.covenants.length} financial covenants, at close`}
        />
        <Card className="grid grid-cols-1 divide-y divide-line overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {security.covenants.map((covenant) => (
            <CovenantGauge key={covenant.id} covenant={covenant} />
          ))}
        </Card>
      </section>
    </div>
  );
}
