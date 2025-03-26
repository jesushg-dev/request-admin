import { getAssignmentHierarchyAndLevelsByTenantId, getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest } from '@/actions/request';
import { getCurrentUserTenant } from '@/actions/user';
import { getPathname } from '@/i18n/routing';
import { type Locale } from 'next-intl';

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

  const request = await getRequestById(tenantId, slug);
  const currentUser = await getCurrentUserTenant(tenantId);
  const priorities = await getPrioritiesAsOptions(tenantId);
  const requestDetails = await getRequestDetailsByRequest(tenantId, request);
  const requestHierarchy = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);
  const assignmentHierarchy = await getAssignmentHierarchyAndLevelsByTenantId(locale, tenantId);
  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/requests-portal/requests/[slug]', params: { tenantId, slug } } });

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel minSize={30} defaultSize={30}>
        <div className="flex h-full flex-1 overflow-hidden p-4">
          <ProjectDetails
            tenantId={tenantId}
            slug={slug}
            request={request}
            requestDetails={requestDetails}
            priorities={priorities}
            requestLevelTypes={requestHierarchy.levels}
            assignmentLevelTypes={assignmentHierarchy.levels}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={30} defaultSize={70}>
        <div className="h-full p-4 overflow-hidden">
          <Tabs defaultValue="requirements" className="w-full h-full overflow-hidden flex flex-col">
            <TabsList className="flex gap-2">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
                  <EmptyState title="No documents found" description="Please check back later or contact support if you need immediate assistance." />
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
