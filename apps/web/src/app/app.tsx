import { AppShell } from '@/app/layout/app-shell';
import { Providers } from '@/app/providers';
import { AppRoutes } from '@/app/router';

export function App() {
  return (
    <Providers>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </Providers>
  );
}
