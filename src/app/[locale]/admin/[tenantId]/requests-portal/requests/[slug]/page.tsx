import { getAssignmentHierarchyAndLevelsByTenantId, getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest } from '@/actions/request';
import { auth } from '@/server/auth';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentHistory from '@/components/common/request/detail/assignments-viewer';
import AssociatedFilesViewer from '@/components/common/request/detail/associated-files-viewer';
import Comments from '@/components/common/request/detail/comments';
import { RelatedViewer } from '@/components/common/request/detail/related-viewer';
import RequestActivities from '@/components/common/request/detail/request-activities';
import ProjectDetails from '@/components/common/request/detail/request-details';
import RequirementProgress from '@/components/common/request/detail/requirement-progress';
import FormSubmissionsViewer from '@/components/common/request/detail/submissions-viewer';

import { activities, documents, guideDocuments } from './mockData';

export default async function CaseDetailPage({ params }: { params: Promise<{ locale: string; tenantId: string; slug: string }> }) {
  const { locale, tenantId, slug } = await params;

  const session = await auth();
  if (!session) return null;

  const request = await getRequestById(tenantId, slug);
  const requestDetails = await getRequestDetailsByRequest(tenantId, request);
  const priorities = await getPrioritiesAsOptions(tenantId);
  const requestHierarchy = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);
  const assignmentHierarchy = await getAssignmentHierarchyAndLevelsByTenantId(locale, tenantId);

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
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="requirements" className="flex-1 flex flex-col">
              <RequirementProgress tenantId={tenantId} requirementCompliances={request.requirementCompliances} />
            </TabsContent>
            <TabsContent value="assignments" className="flex-1 flex flex-col">
              <AssignmentHistory tenantId={tenantId} requestId={slug} />
            </TabsContent>
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <Comments slug={slug} currentUserId={session.user.id} channel={requestDetails.channel} tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="submissions" className="flex-1 flex flex-col">
              <FormSubmissionsViewer submissions={request.submissions} />
            </TabsContent>
            <TabsContent value="files" className="flex-1 flex flex-col">
              <AssociatedFilesViewer guideDocuments={guideDocuments} documents={documents} />
            </TabsContent>
            <TabsContent value="related" className="flex-1 flex flex-col">
              <RelatedViewer requestId={slug} tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="history" className="flex-1 flex flex-col">
              <RequestActivities activities={activities} />
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
