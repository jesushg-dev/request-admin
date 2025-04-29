import { getAuthContext } from '@/actions/authorization';
import { getAssignmentHierarchiesAndLevelsByTenantId, getRequestHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest, getStatusesAsOptions } from '@/actions/request';
import { getCurrentUserTenant } from '@/actions/user';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataroomDocuments } from '@/components/common/data-room/dataroom-documents';
import AssignmentHistory from '@/components/common/request/detail/assignments-viewer';
import AssociatedFilesViewer from '@/components/common/request/detail/associated-files-viewer';
import Messages from '@/components/common/request/detail/messages';
import RelatedViewer from '@/components/common/request/detail/related-viewer';
import RequestActivities from '@/components/common/request/detail/request-activities';
import ProjectDetails from '@/components/common/request/detail/request-details';
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
  const [requestDetails, currentUser, priorities, statuses, requestHierarchy, assignmentHierarchy] = await Promise.all([
    getRequestDetailsByRequest(tenantId, request),
    getCurrentUserTenant(tenantId),
    getPrioritiesAsOptions(tenantId),
    getStatusesAsOptions(tenantId),
    getRequestHierarchiesAndLevelsByTenantId(locale, tenantId),
    getAssignmentHierarchiesAndLevelsByTenantId(locale, tenantId),
  ]);

  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug } } });

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel minSize={30} defaultSize={30}>
        <div className="flex h-full flex-1 overflow-hidden p-4">
          <ProjectDetails
            tenantId={tenantId}
            slug={slug}
            request={request}
            statuses={statuses}
            priorities={priorities}
            requestDetails={requestDetails}
            requestLevelTypes={requestHierarchy.levels}
            assignmentLevelTypes={assignmentHierarchy.levels}
            enableStatusChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS])}
            enablePriorityChange={hasAreaPermissions(request.areaId.value, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY])}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={30} defaultSize={70}>
        <div className="h-full p-4 overflow-hidden">
          <Tabs defaultValue="requirements" className="w-full h-full overflow-hidden flex flex-col">
            <TabsList className="flex gap-2">
              <TabsTrigger value="requirements">{t('tabs.requirements')}</TabsTrigger>
              <TabsTrigger value="assignments">{t('tabs.assignments')}</TabsTrigger>
              <TabsTrigger value="chat">{t('tabs.chat')}</TabsTrigger>
              <TabsTrigger value="submissions">{t('tabs.submissions')}</TabsTrigger>
              <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
              <TabsTrigger value="attachments">{t('tabs.attachments')}</TabsTrigger>
              <TabsTrigger value="related">{t('tabs.related')}</TabsTrigger>
              <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
            </TabsList>
            <TabsContent value="requirements" className="flex-1 flex flex-col overflow-hidden">
              <RequirementProgress tenantId={tenantId} requestId={slug} />
            </TabsContent>
            <TabsContent value="assignments" className="flex-1 flex flex-col overflow-hidden">
              <AssignmentHistory tenantId={tenantId} requestId={slug} />
            </TabsContent>
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <Messages currentUserTenantId={currentUser.userTenantId} channel={requestDetails.channel} tenantId={tenantId} />
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
            <TabsContent value="guides" className="flex-1 flex flex-col overflow-hidden">
              <AssociatedFilesViewer tenantId={tenantId} documents={[]} />
            </TabsContent>
            <TabsContent value="related" className="flex-1 flex flex-col overflow-hidden">
              <RelatedViewer requestId={slug} tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="history" className="flex-1 flex flex-col overflow-hidden">
              <RequestActivities requestId={slug} tenantId={tenantId} />
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
