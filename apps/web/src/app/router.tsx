import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '@/app/not-found-page';
import { DealLayout } from '@/features/deals/pages/deal-layout';
import { OverviewPage } from '@/features/deals/pages/overview-page';
import { PipelinePage } from '@/features/deals/pages/pipeline-page';
import { DiligencePage } from '@/features/diligence/pages/diligence-page';
import { MemoPage } from '@/features/ic-memo/pages/memo-page';
import { SecurityPage } from '@/features/securities/pages/security-page';

/**
 * Route table. The deal workspace is a layout route, so the four underwriting
 * views nest inside it and share the loaded deal.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/deals" replace />} />
      <Route path="/deals" element={<PipelinePage />} />
      <Route path="/deals/:dealId" element={<DealLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="diligence" element={<DiligencePage />} />
        <Route path="memo" element={<MemoPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
