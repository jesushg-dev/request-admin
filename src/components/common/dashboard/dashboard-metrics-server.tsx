import { getDashboardMetrics } from '@/actions/dashboard';
import { Locale } from 'next-intl';

import DashboardMetrics from './dashboard-metrics';

interface DashboardMetricsServerProps {
  tenantId: string;
  workflowId?: string | null;
  locale: Locale;
}

export function DashboardMetricsFallback() {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="hidden h-32 animate-pulse rounded-lg bg-muted md:block" />
      </div>
    </div>
  );
}

export default async function DashboardMetricsServer({ tenantId, workflowId, locale }: DashboardMetricsServerProps) {
  const metrics = await getDashboardMetrics(tenantId, workflowId);

  return <DashboardMetrics data={metrics} locale={locale} />;
}
