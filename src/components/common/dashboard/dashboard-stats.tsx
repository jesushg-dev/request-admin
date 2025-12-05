import { getWorkflowStatsByMonth } from '@/actions/dashboard';

import DashboardStatsChart from './dashboard-stats-chart';

interface DashboardStatsProps {
  tenantId: string;
  workflowId?: string | null;
}

export function DashboardStatsFallback() {
  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default async function DashboardStats({ tenantId, workflowId }: DashboardStatsProps) {
  const { data, workflows } = await getWorkflowStatsByMonth(tenantId, 6, workflowId);

  return <DashboardStatsChart chartData={data} workflows={workflows} />;
}
