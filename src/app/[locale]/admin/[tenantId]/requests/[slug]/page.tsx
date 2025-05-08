import { getAuthContext } from '@/actions/authorization';
import { getAssignmentHierarchyAndLevelsByCategoryId, getRequestHierarchyAndLevelsByCategoryId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest } from '@/actions/request';
import { getCurrentUserTenant } from '@/actions/user';
import { getWorkflowWithTransitions } from '@/actions/workflow';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataroomDocuments } from '@/components/common/data-room/dataroom-documents';
import AssignmentHistory from '@/components/common/request/detail/assignments-viewer';
import GuidesViewer from '@/components/common/request/detail/guides-viewer';
import Messages from '@/components/common/request/detail/messages';
import RequestActivities from '@/components/common/request/detail/request-activities';
import RequestDetails from '@/components/common/request/detail/request-details';
import RequirementProgress from '@/components/common/request/detail/requirement-progress';
import FormSubmissionsViewer from '@/components/common/request/detail/submissions-viewer';
import EmptyState from '@/components/shared/empty-state';

interface CaseDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { locale, tenantId, slug } = await params;
  const { hasAreaPermissions, hasPermissions } = await getAuthContext(tenantId);
  const t = await getTranslations('admin.request.view');

  // --- Request Data Fetching ---
  const request = await getRequestById(tenantId, slug);

  // --- Authorization Checks ---
  const hasGlobalViewPermission = hasPermissions([PermissionActions.REQUEST_MANAGEMENT.VIEW]);

  const hasScopedViewAccess = hasAreaPermissions(request.areaId.value, [
    PermissionActions.REQUEST_MANAGEMENT.SCOPED_VIEW,
    PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT,
    PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
  ]);

  if (!hasGlobalViewPermission && !hasScopedViewAccess) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests', params: { tenantId } } });
  }

  // --- Data Preparation ---
  const [requestDetails, currentUser, priorities, workflow, requestHierarchy, assignmentHierarchy] = await Promise.all([
    getRequestDetailsByRequest(tenantId, request),
    getCurrentUserTenant(tenantId),
    getPrioritiesAsOptions(tenantId),
    getWorkflowWithTransitions(tenantId, request.requestCategory.slice(-1)[0].value),
    getRequestHierarchyAndLevelsByCategoryId(locale, tenantId, request.requestCategory.slice(-1)[0].value),
    getAssignmentHierarchyAndLevelsByCategoryId(locale, tenantId, request.assignmentCategory.slice(-1)[0].value),
  ]);

  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug } } });

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel minSize={30} defaultSize={70}>
        <div className="h-full p-4 overflow-hidden">
          <Tabs defaultValue="execution" className="w-full h-full overflow-hidden flex flex-col">
            {/* Main Tabs */}
            <TabsList className="flex gap-2 h-8 w-full">
              <TabsTrigger className="h-7 text-xs" value="execution">
                {t('tabs.main.execution')}
              </TabsTrigger>
              <TabsTrigger className="h-7 text-xs" value="comments">
                {t('tabs.main.comments')}
              </TabsTrigger>
              <TabsTrigger className="h-7 text-xs" value="reference">
                {t('tabs.main.reference')}
              </TabsTrigger>
            </TabsList>

            {/* Execution Tab Content */}
            <TabsContent value="execution" className="flex-1 flex flex-col overflow-hidden">
              {/* Nested Tabs for Execution */}
              <Tabs defaultValue="requirements" className="w-full h-full overflow-hidden flex flex-col">
                <TabsList className="flex gap-2 h-8 w-full">
                  <TabsTrigger className="h-7 text-xs" value="requirements">
                    {t('tabs.execution.requirements')}
                  </TabsTrigger>
                  <TabsTrigger className="h-7 text-xs" value="executionModel">
                    {t('tabs.execution.executionModel')}
                  </TabsTrigger>
                  <TabsTrigger className="h-7 text-xs" value="guides">
                    {t('tabs.execution.guides')}
                  </TabsTrigger>
                  <TabsTrigger className="h-7 text-xs" value="submissions">
                    {t('tabs.execution.submissions')}
                  </TabsTrigger>
                  <TabsTrigger className="h-7 text-xs" value="attachments">
                    {t('tabs.execution.attachments')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" className="flex-1 flex flex-col overflow-hidden">
                  <RequirementProgress tenantId={tenantId} requestId={slug} />
                </TabsContent>

                <TabsContent value="executionModel" className="flex-1 flex flex-col overflow-hidden">
                  {/* <ExecutionModelViewer tenantId={tenantId} requestId={slug} /> */}
                </TabsContent>

                <TabsContent value="guides" className="flex-1 flex flex-col overflow-hidden">
                  <GuidesViewer guides={requestDetails.guides} />
                </TabsContent>

                <TabsContent value="submissions" className="flex-1 flex flex-col overflow-hidden">
                  <FormSubmissionsViewer tenantId={tenantId} requestId={slug} />
                </TabsContent>

                <TabsContent value="attachments" className="flex-1 flex flex-col overflow-hidden">
                  {requestDetails.dataroom?.id ? (
                    <DataroomDocuments dataroomId={requestDetails.dataroom?.id} tenantId={tenantId} callbackUrl={callbackUrl} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <EmptyState title={t('no_documents_found')} description={t('contact_support')} />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Comments Tab Content */}
            <TabsContent value="comments" className="flex-1 flex flex-col overflow-hidden">
              <Messages currentUserTenantId={currentUser.userTenantId} channel={requestDetails.channel} tenantId={tenantId} />
            </TabsContent>

            {/* Reference Tab Content */}
            <TabsContent value="reference" className="flex-1 flex flex-col overflow-hidden">
              {/* Nested Tabs for Reference */}
              <Tabs defaultValue="assignments" className="w-full h-full overflow-hidden flex flex-col">
                <TabsList className="flex gap-2 h-8 w-full">
                  <TabsTrigger className="h-7 text-xs" value="assignments">
                    {t('tabs.reference.assignments')}
                  </TabsTrigger>
                  <TabsTrigger className="h-7 text-xs" value="history">
                    {t('tabs.reference.history')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="flex-1 flex flex-col overflow-hidden">
                  <AssignmentHistory tenantId={tenantId} requestId={slug} />
                </TabsContent>

                <TabsContent value="history" className="flex-1 flex flex-col overflow-hidden">
                  <RequestActivities requestId={slug} tenantId={tenantId} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={30} defaultSize={30}>
        <div className="flex h-full flex-1 overflow-hidden p-4">
          <RequestDetails
            tenantId={tenantId}
            slug={slug}
            request={request}
            workflow={workflow}
            priorities={priorities}
            requestDetails={requestDetails}
            requestLevelTypes={requestHierarchy.levels}
            assignmentLevelTypes={assignmentHierarchy.levels}
            enableStatusChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS])}
            enablePriorityChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY])}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
