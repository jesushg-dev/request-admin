'use client';

import { MetricsCards } from './metrics-cards';
import { MonthlyTrendsChart } from './charts/monthly-trends-chart';
import { AreaDistributionChart } from './charts/area-distribution-chart';
import { StatusDistributionChart } from './charts/status-distribution-chart';
import { SLAComplianceChart } from './charts/sla-compliance-chart';
import type { OverviewData, MonthlyTrend, AreaDistribution, StatusDistribution, SLACompliance } from './types';

interface OverviewTabProps {
  overviewData: OverviewData | null;
  monthlyTrends: MonthlyTrend[];
  areaDistribution: AreaDistribution[];
  statusDistribution: StatusDistribution[];
  slaCompliance: SLACompliance[];
  loading: boolean;
}

export function OverviewTab({
  overviewData,
  monthlyTrends,
  areaDistribution,
  statusDistribution,
  slaCompliance,
  loading,
}: OverviewTabProps) {
  return (
    <>
      <MetricsCards
        totalRequests={overviewData?.totalRequests || 0}
        avgResolutionTime={overviewData?.avgResolutionTime || 0}
        openRequests={overviewData?.openRequests || 0}
        closedRequests={overviewData?.closedRequests || 0}
        overdueRequests={overviewData?.overdueRequests || 0}
        loading={loading}
      />

      {!loading && (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <MonthlyTrendsChart data={monthlyTrends} loading={loading} />
            <AreaDistributionChart data={areaDistribution} loading={loading} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StatusDistributionChart data={statusDistribution} loading={loading} />
            <SLAComplianceChart data={slaCompliance} loading={loading} />
          </div>
        </>
      )}
    </>
  );
}

