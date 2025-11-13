'use client';

import { useQueryStates } from 'nuqs';

import { SLADashboard } from '@/components/common/dashboard/sla-dashboard';
import { SLAFilters } from '@/components/common/dashboard/sla-filters';
import { dashboardSearchParamsParsers } from './dashboard-search-params';

interface DashboardSLATabClientProps {
  tenantId: string;
}

export default function DashboardSLATabClient({ tenantId }: DashboardSLATabClientProps) {
  const [{ slaStatus, slaPercentage, slaTimeRange, slaWorkflowType }] = useQueryStates(dashboardSearchParamsParsers);

  return (
    <>
      <div className="mt-6">
        <SLAFilters tenantId={tenantId} />
      </div>

      <div className="mt-8">
        <SLADashboard
          tenantId={tenantId}
          filters={
            slaStatus || slaPercentage.length > 0 || slaTimeRange || slaWorkflowType
              ? {
                  slaStatus: slaStatus ?? 'all',
                  slaPercentage: slaPercentage ?? [0, 100],
                  slaTimeRange: slaTimeRange ?? 'all',
                  workflowType: slaWorkflowType ?? 'all',
                }
              : null
          }
        />
      </div>
    </>
  );
}

