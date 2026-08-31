import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { DealLayout } from '@/routes/deal-layout';
import { DiligencePage } from '@/routes/diligence-page';
import { MemoPage } from '@/routes/memo-page';
import { NotFoundPage } from '@/routes/not-found-page';
import { OverviewPage } from '@/routes/overview-page';
import { PipelinePage } from '@/routes/pipeline-page';
import { SecurityPage } from '@/routes/security-page';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
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
      </AppShell>
    </BrowserRouter>
  );
}
