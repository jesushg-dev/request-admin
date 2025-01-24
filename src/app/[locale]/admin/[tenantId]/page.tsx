import { Calendar, Clock, FileWarningIcon } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { AssignmentDashboard } from '@/components/common/dashboard/assignment-dashboard';
import { AssignmentTrends } from '@/components/common/dashboard/assignment-trends';
import { PriorityDistribution } from '@/components/common/dashboard/priority-distribution';
import { RequestStatusDistribution } from '@/components/common/dashboard/request-status-distribution';
import { RequestTrends } from '@/components/common/dashboard/request-trends';
import { ResolutionTime } from '@/components/common/dashboard/resolution-time';
import { SlaCompliance } from '@/components/common/dashboard/sla-compliance';
import { StatCard } from '@/components/stat-card';

const DashboardPage = () => {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Requests" value="50" icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Open Requests" value="18" icon={<Clock className="h-5 w-5" />} />
          <StatCard title="Overdue" value="4" icon={<FileWarningIcon className="h-5 w-5" />} />
          <StatCard title="Avg. Resolution Time" value="344h" icon={<Clock className="h-5 w-5" />} />
        </div>
        <AssignmentTrends />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SlaCompliance />
          <RequestStatusDistribution />
          <PriorityDistribution />
        </div>
        <AssignmentDashboard />
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <ResolutionTime />
          <RequestTrends />
        </div>
      </div>
    </ScrollArea>
  );
};

export default DashboardPage;
