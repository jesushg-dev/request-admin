'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardMetricsClient from '@/components/common/dashboard/dashboard-metrics-client';
import DashboardStats from '@/components/common/dashboard/dashboard-stats';
import QuickStatsCards from '@/components/common/dashboard/quick-stats-cards';
import RecentRequests from '@/components/common/dashboard/recent-requests';
import { SLADashboard } from '@/components/common/dashboard/sla-dashboard';
import { SLAFilters, SLAFilterValues } from '@/components/common/dashboard/sla-filters';
import { WorkflowSelector } from '@/components/common/dashboard/workflow-selector';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { useAuthorization, PERMISSION } from '@/hooks/use-authorization';
import { useTranslations } from 'next-intl';
import { PermissionEmptyState } from '@/components/shared/permission-empty-state';
import { PermissionButton } from '@/components/shared/permission-button';

export default function Home() {
  const { tenantId, userTenant, currentTenant } = useTenantContext();
  const { hasPermission } = useAuthorization(tenantId);
  const t = useTranslations('admin.dashboard.page');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [slaFilters, setSlaFilters] = useState<SLAFilterValues | null>(null);
  
  // Permission checks
  const canViewDashboard = hasPermission(PERMISSION.DASHBOARD.VIEW);
  const canCreateRequests = hasPermission(PERMISSION.REQUEST_MANAGEMENT.CREATE);
  const canViewRequests = hasPermission(PERMISSION.REQUEST_MANAGEMENT.VIEW);
  
  // If user doesn't have dashboard view permission, show empty state
  if (!canViewDashboard) {
    return (
      <ScrollArea className="flex-grow min-h-0">
        <div className="container py-6 flex flex-col h-full">
          <PermissionEmptyState />
        </div>
      </ScrollArea>
    );
  }

  const handleSearch = (filters: SLAFilterValues): void => {
    setSlaFilters(filters);
    console.log('Searching with filters:', filters);
    toast.info(t('searchApplied.title'), {
      description: t('searchApplied.description'),
    });
  };

  const handleWorkflowChange = (workflowId: string | null): void => {
    setSelectedWorkflow(workflowId);
    console.log('Selected workflow:', workflowId);

    if (workflowId) {
      toast.success(t('workflowSelected.title'), {
        description: t('workflowSelected.description', { workflowId }),
      });
    }
  };

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboardTitle')}</h1>
            <p className="text-muted-foreground">{t('welcome', { user: userTenant.displayUserName, tenant: currentTenant ? currentTenant.name : '' })}</p>
          </div>
          <PermissionButton
            hasPermission={canCreateRequests}
            href={{ pathname: '/admin/[tenantId]/requests/new', params: { tenantId } }}
            className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('newRequest')}
          </PermissionButton>
        </div>

        <div className="mt-8 flex flex-col flex-grow min-h-0">
          <Tabs defaultValue="general" className="flex flex-col flex-grow min-h-0">
            <TabsList>
              <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
              <TabsTrigger value="workflow">{t('tabs.workflow')}</TabsTrigger>
              <TabsTrigger value="sla">{t('tabs.sla')}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="h-full overflow-y-auto">
              <div className="mt-8">
                <DashboardMetricsClient tenantId={tenantId} workflowId={null} />
              </div>

              <div className="mt-8">
                <DashboardStats tenantId={tenantId} workflowId={null} />
              </div>

              <div className="mt-8">
                <QuickStatsCards tenantId={tenantId} workflowId={null} />
              </div>

              {canViewRequests && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold">{t('recentRequests.title')}</h2>
                  <div className="mt-4">
                    <RecentRequests tenantId={tenantId} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="h-full overflow-y-auto">
              <div className="mt-8">
                <WorkflowSelector tenantId={tenantId} selectedWorkflow={selectedWorkflow} onWorkflowChange={handleWorkflowChange} />
              </div>

              <div className="mt-8">
                <DashboardMetricsClient tenantId={tenantId} workflowId={selectedWorkflow} />
              </div>

              <div className="mt-8">
                <DashboardStats tenantId={tenantId} workflowId={selectedWorkflow} />
              </div>

              {canViewRequests && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold">{selectedWorkflow ? t('recentRequests.titleWithWorkflow', { workflow: selectedWorkflow }) : t('recentRequests.title')}</h2>
                  <div className="mt-4">
                    <RecentRequests tenantId={tenantId} workflowFilter={selectedWorkflow} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sla" className="h-full overflow-y-auto">
              <div className="mt-6">
                <SLAFilters tenantId={tenantId} onSearch={handleSearch} />
              </div>

              <div className="mt-8">
                <SLADashboard tenantId={tenantId} filters={slaFilters} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
