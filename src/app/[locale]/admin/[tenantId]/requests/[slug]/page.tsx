import { getAuthContext } from '@/actions/authorization';
import { getAssignmentHierarchyAndLevelsByCategoryId, getRequestHierarchyAndLevelsByCategoryId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest } from '@/actions/request';
import { getWorkflowWithTransitions } from '@/actions/workflow';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataroomDocuments } from '@/components/common/data-room/dataroom-documents';
import RequestDetails from '@/components/common/request/detail/request-details';
import AssignmentHistory from '@/components/common/request/viewer/assignments-viewer';
import GuidesViewer from '@/components/common/request/viewer/guides-viewer';
import Messages from '@/components/common/request/viewer/messages';
import RequestActivities from '@/components/common/request/viewer/request-activities';
import RequirementProgress from '@/components/common/request/viewer/requirement-progress';
import FormSubmissionsViewer from '@/components/common/request/viewer/submissions-viewer';
import ExecutionView from '@/components/process-flow/execution/execution-view';
import EmptyState from '@/components/shared/empty-state';

interface CaseDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { locale, tenantId, slug } = await params;
  const { isAdmin, hasAreaPermissions, hasPermissions } = await getAuthContext(tenantId);
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
  const [requestDetails, priorities, workflow, requestHierarchy, assignmentHierarchy] = await Promise.all([
    getRequestDetailsByRequest(tenantId, request),
    getPrioritiesAsOptions(tenantId),
    getWorkflowWithTransitions(tenantId, request.requestCategory.slice(-1)[0].value),
    getRequestHierarchyAndLevelsByCategoryId(locale, tenantId, request.requestCategory.slice(-1)[0].value),
    getAssignmentHierarchyAndLevelsByCategoryId(locale, tenantId, request.assignmentCategory.slice(-1)[0].value),
  ]);

  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug } } });

  return (
    <ResizablePanelGroup direction="horizontal" className="!flex-col md:!flex-row gap-4">
      <ResizablePanel minSize={30} defaultSize={70} className="!basis-auto md:!basis-0">
        <div className="h-full p-4 overflow-hidden">
          <Tabs defaultValue="requirements" className="w-full h-full overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <TabsList className="flex gap-2 h-8 w-full">
                <TabsTrigger className="h-7 text-xs" value="requirements">
                  {t('tabs.requirements')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="executionModel">
                  {t('tabs.executionModel')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="guides">
                  {t('tabs.guides')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="submissions">
                  {t('tabs.submissions')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="attachments">
                  {t('tabs.attachments')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="comments">
                  {t('tabs.comments')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="assignments">
                  {t('tabs.assignments')}
                </TabsTrigger>
                <TabsTrigger className="h-7 text-xs" value="history">
                  {t('tabs.history')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="requirements" className="flex-1 flex flex-col overflow-hidden">
              <RequirementProgress tenantId={tenantId} requestId={slug} />
            </TabsContent>

            <TabsContent value="executionModel" className="flex-1 flex flex-col overflow-hidden">
              <ExecutionView processFlow={requestDetails.executionFlow?.diagram} tenantId={tenantId} executionId={requestDetails.executionFlow?.executionId ?? ''} locale={locale} />
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

            <TabsContent value="comments" className="flex-1 flex flex-col overflow-hidden">
              <Messages channel={requestDetails.channel} tenantId={tenantId} />
            </TabsContent>

            <TabsContent value="assignments" className="flex-1 flex flex-col overflow-hidden">
              <AssignmentHistory tenantId={tenantId} requestId={slug} />
            </TabsContent>

            <TabsContent value="history" className="flex-1 flex flex-col overflow-hidden">
              <RequestActivities requestId={slug} tenantId={tenantId} />
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel minSize={30} defaultSize={30} className="!basis-auto md:!basis-0">
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
            enableStatusChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS]) || isAdmin}
            enablePriorityChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY]) || isAdmin}
            enableAssignmentChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER]) || isAdmin}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
