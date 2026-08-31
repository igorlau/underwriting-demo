import type { DealDetail } from '@uw/types';
import { ArrowLeft } from 'lucide-react';
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom';
import { Container } from '@/components/app-shell';
import { SeverityBadge } from '@/components/indicators';
import { StageProgress } from '@/components/stage-progress';
import { ErrorState, Skeleton } from '@/components/states';
import { useAsync } from '@/hooks/use-async';
import { formatUsdCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { underwritingService } from '@/services/underwriting';

const TABS = [
  { to: '.', label: 'Overview', end: true },
  { to: 'security', label: 'Security', end: false },
  { to: 'diligence', label: 'Due Diligence', end: false },
  { to: 'memo', label: 'IC Memo', end: false },
];

/**
 * Deal workspace frame. The ink header card marks the shift from browsing the
 * pipeline to working a single credit, and keeps identity and stage in view
 * while the user moves between the underwriting views.
 */
export function DealLayout() {
  const { dealId = '' } = useParams();
  const {
    status,
    data: deal,
    error,
    reload,
  } = useAsync(() => underwritingService.getDeal(dealId), [dealId]);

  if (status === 'error') {
    return (
      <Container className="py-8">
        <BackLink />
        <div className="mt-5">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="pt-6 pb-5">
        <BackLink />

        {status === 'loading' ? (
          <Skeleton className="mt-4 h-[168px] w-full rounded-2xl" />
        ) : (
          <div className="rise mt-4 rounded-2xl bg-ink px-7 py-6 text-on-ink shadow-ink">
            <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="text-[26px] font-semibold tracking-[-0.025em]">
                    {deal.borrowerName}
                  </h1>
                  <SeverityBadge severity={deal.riskLevel} label="risk level" tone="dark" />
                </div>
                <p className="mt-2 text-[14px] text-on-ink-2">
                  <span className="tnum font-medium text-on-ink">
                    {formatUsdCompact(deal.amount)}
                  </span>
                  <span className="mx-2 text-on-ink-line">·</span>
                  {deal.transactionType}
                  <span className="mx-2 text-on-ink-line">·</span>
                  {deal.transaction.maturityYears}-year
                  <span className="mx-2 text-on-ink-line">·</span>
                  {deal.sponsor}
                </p>
              </div>

              <div className="w-full max-w-[400px]">
                <StageProgress stage={deal.stage} tone="dark" />
              </div>
            </div>
          </div>
        )}
      </Container>

      <div className="sticky top-14 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
        <Container>
          <nav aria-label="Deal workspace" className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 py-3 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-ink-2 hover:text-ink',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </Container>
      </div>

      <Container className="py-8">
        {status === 'loading' ? null : <Outlet context={deal satisfies DealDetail} />}
      </Container>
    </>
  );
}

function BackLink() {
  return (
    <Link
      to="/deals"
      className="inline-flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-3.5" aria-hidden="true" />
      Deal Pipeline
    </Link>
  );
}

/** Typed access to the deal loaded by the workspace frame. */
export function useDeal(): DealDetail {
  return useOutletContext<DealDetail>();
}
