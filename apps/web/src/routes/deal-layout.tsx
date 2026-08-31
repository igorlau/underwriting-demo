import type { DealDetail } from '@uw/types';
import { ChevronLeft } from 'lucide-react';
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
 * Deal workspace frame: identity and stage stay pinned while the user moves
 * between the underwriting views, so context is never lost on navigation.
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
      <Container className="py-7">
        <BackLink />
        <div className="mt-4">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </Container>
    );
  }

  return (
    <>
      <div className="border-b border-border bg-surface">
        <Container>
          <div className="pt-4 pb-0">
            <BackLink />

            {status === 'loading' ? (
              <div className="mt-3 space-y-2 pb-5">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-3.5 w-96" />
              </div>
            ) : (
              <div className="mt-2.5 flex flex-wrap items-start justify-between gap-x-10 gap-y-4 pb-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-[20px] font-semibold tracking-[-0.02em]">
                      {deal.borrowerName}
                    </h1>
                    <SeverityBadge severity={deal.riskLevel} label="risk level" />
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    <span className="tnum font-medium text-foreground">
                      {formatUsdCompact(deal.amount)}
                    </span>
                    <span className="mx-1.5 text-border-strong">·</span>
                    {deal.transactionType}
                    <span className="mx-1.5 text-border-strong">·</span>
                    {deal.transaction.maturityYears}-year
                    <span className="mx-1.5 text-border-strong">·</span>
                    {deal.sponsor}
                  </p>
                </div>

                <div className="w-full max-w-[420px]">
                  <div className="label-micro mb-2">Underwriting progress</div>
                  <StageProgress stage={deal.stage} />
                </div>
              </div>
            )}

            <nav aria-label="Deal workspace" className="-mb-px flex gap-1">
              {TABS.map((tab) => (
                <NavLink
                  key={tab.label}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    cn(
                      'border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
                    )
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </Container>
      </div>

      <Container className="py-6">
        {status === 'loading' ? null : <Outlet context={deal satisfies DealDetail} />}
      </Container>
    </>
  );
}

function BackLink() {
  return (
    <Link
      to="/deals"
      className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-3.5" aria-hidden="true" />
      Deal Pipeline
    </Link>
  );
}

/** Typed access to the deal loaded by the workspace frame. */
export function useDeal(): DealDetail {
  return useOutletContext<DealDetail>();
}
