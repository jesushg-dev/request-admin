import { Suspense } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { getCurrentUserTenant } from '@/actions/user';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { PlusCircle } from 'lucide-react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { SearchParams } from 'nuqs/server';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardMetricsServer, { DashboardMetricsFallback } from '@/components/common/dashboard/dashboard-metrics-server';
import DashboardStats, { DashboardStatsFallback } from '@/components/common/dashboard/dashboard-stats';
import QuickStatsCardsServer, { QuickStatsFallback } from '@/components/common/dashboard/quick-stats-cards-server';
import RecentRequests, { RecentRequestsFallback } from '@/components/common/dashboard/recent-requests';
import SLADashboardServer, { SLADashboardFallback } from '@/components/common/dashboard/sla-dashboard-server';
import { SLAFilters } from '@/components/common/dashboard/sla-filters';
import WorkflowSelectorServer from '@/components/common/dashboard/workflow-selector-server';
import { PermissionButton } from '@/components/shared/permission-button';

import DashboardPermissionDenied from './dashboard-permission-denied';
import { dashboardSearchParamsCache } from './dashboard-search-params';

type DashboardPageProps = {
  params: Promise<{ locale: Locale; tenantId: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { tenantId, locale } = await params;
  const auth = await getAuthContext(tenantId);

  const canViewDashboard = auth.hasPermissions([PermissionActions.DASHBOARD.VIEW]);
  if (!canViewDashboard) {
    return <DashboardPermissionDenied />;
  }

  // Parse search params server-side
  await dashboardSearchParamsCache.parse(searchParams);
  const selectedWorkflow = dashboardSearchParamsCache.get('workflow');

  const canCreateRequests = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.CREATE]);
  const canViewRequests = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.VIEW]);
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.page' });
  const userTenant = await getCurrentUserTenant(tenantId);
  const db = await getDb();
  const tenant = await db.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboardTitle')}</h1>
            <p className="text-muted-foreground">{t('welcome', { user: userTenant.displayUserName, tenant: tenant?.name ?? '' })}</p>
          </div>
          <PermissionButton hasPermission={canCreateRequests} href={{ pathname: '/admin/[tenantId]/requests/new', params: { tenantId } }} className="w-full md:w-auto">
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
              <Suspense fallback={<DashboardMetricsFallback />}>
                <div className="mt-8">
                  <DashboardMetricsServer tenantId={tenantId} workflowId={null} locale={locale} />
                </div>
              </Suspense>

              <Suspense fallback={<DashboardStatsFallback />}>
                <div className="mt-8">
                  <DashboardStats tenantId={tenantId} workflowId={null} />
                </div>
              </Suspense>

              <Suspense fallback={<QuickStatsFallback />}>
                <div className="mt-8">
                  <QuickStatsCardsServer tenantId={tenantId} workflowId={null} locale={locale} />
                </div>
              </Suspense>

              {canViewRequests && (
                <Suspense fallback={<RecentRequestsFallback />}>
                  <div className="mt-8">
                    <h2 className="text-xl font-bold">{t('recentRequests.title')}</h2>
                    <div className="mt-4">
                      <RecentRequests tenantId={tenantId} />
                    </div>
                  </div>
                </Suspense>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="h-full overflow-y-auto">
              <div className="mt-8">
                <WorkflowSelectorServer tenantId={tenantId} selectedWorkflow={selectedWorkflow} locale={locale} />
              </div>

              <Suspense fallback={<DashboardMetricsFallback />}>
                <div className="mt-8">
                  <DashboardMetricsServer tenantId={tenantId} workflowId={selectedWorkflow} locale={locale} />
                </div>
              </Suspense>

              <Suspense fallback={<DashboardStatsFallback />}>
                <div className="mt-8">
                  <DashboardStats tenantId={tenantId} workflowId={selectedWorkflow} />
                </div>
              </Suspense>

              {canViewRequests && (
                <Suspense fallback={<RecentRequestsFallback />}>
                  <div className="mt-8">
                    <h2 className="text-xl font-bold">{selectedWorkflow ? t('recentRequests.titleWithWorkflow', { workflow: selectedWorkflow }) : t('recentRequests.title')}</h2>
                    <div className="mt-4">
                      <RecentRequests tenantId={tenantId} workflowFilter={selectedWorkflow} />
                    </div>
                  </div>
                </Suspense>
              )}
            </TabsContent>

            <TabsContent value="sla" className="h-full overflow-y-auto">
              <div className="mt-6">
                <SLAFilters tenantId={tenantId} />
              </div>
              <div className="mt-8">
                <Suspense fallback={<SLADashboardFallback />}>
                  <SLADashboardServer tenantId={tenantId} locale={locale} />
                </Suspense>
              </div>{' '}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
