import { CovenantGauge } from '@/components/covenant-gauge';
import { Metric, MetricRow } from '@/components/metric';
import { CardSkeleton, ErrorState, PrototypeScopeState } from '@/components/states';
import { Card, SectionHeading } from '@/components/ui/card';
import { useAsync } from '@/hooks/use-async';
import { formatPercent, formatUsdCompact } from '@/lib/format';
import { underwritingService } from '@/services/underwriting';
import { useDeal } from './deal-layout';

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
