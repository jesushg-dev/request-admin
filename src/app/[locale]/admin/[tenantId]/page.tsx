import dynamic from 'next/dynamic';
import { getDashboardAssignmentTrends, getDashboardRequestCounts, getDashboardRequestTrends } from '@/actions/dashboard';
import { Calendar, Clock, FileWarningIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { ScrollArea } from '@/components/ui/scroll-area';

const StatCard = dynamic(() => import('@/components/stat-card'));
const RequestTrends = dynamic(() => import('@/components/common/dashboard/request-trends'));
const SlaCompliance = dynamic(() => import('@/components/common/dashboard/sla-compliance'));
const ResolutionTime = dynamic(() => import('@/components/common/dashboard/resolution-time'));
const AssignmentTrends = dynamic(() => import('@/components/common/dashboard/assignment-trends'));
const AssignmentDashboard = dynamic(() => import('@/components/common/dashboard/assignment-dashboard'));
const PriorityDistribution = dynamic(() => import('@/components/common/dashboard/priority-distribution'));
const RequestStatusDistribution = dynamic(() => import('@/components/common/dashboard/request-status-distribution'));

interface DashboardPageProps {
  params: Promise<{
    locale: string;
    tenantId: string;
  }>;
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.dashboard');
  const timeRange = /*searchParams.timeRange ||*/ '90d';

  const trends = await getDashboardRequestTrends(tenantId);
  const assignmentTrends = await getDashboardAssignmentTrends(tenantId, timeRange);

  const { totalRequests, openRequests, overdueRequests, avgResolutionTime } = await getDashboardRequestCounts(tenantId);
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t('totalRequests')} value={totalRequests} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title={t('openRequests')} value={openRequests} icon={<Clock className="h-5 w-5" />} />
          <StatCard title={t('overdue')} value={overdueRequests} icon={<FileWarningIcon className="h-5 w-5" />} />
          <StatCard title={t('avgResolutionTime')} value={`${avgResolutionTime}h`} icon={<Clock className="h-5 w-5" />} />
        </div>
        <AssignmentTrends initialData={assignmentTrends} initialRange={timeRange} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SlaCompliance />
          <RequestStatusDistribution />
          <PriorityDistribution />
        </div>
        <AssignmentDashboard />
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <ResolutionTime />
          <RequestTrends trends={trends} />
        </div>
      </div>
    </ScrollArea>
  );
};

export default DashboardPage;
