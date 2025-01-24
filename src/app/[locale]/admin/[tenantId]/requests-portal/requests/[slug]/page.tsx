import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentHistory } from '@/components/common/request/detail/assignments-viewer';
import AssociatedFilesViewer from '@/components/common/request/detail/associated-files-viewer';
import Comments from '@/components/common/request/detail/comments';
import { RelatedViewer } from '@/components/common/request/detail/related-viewer';
import ProjectActivities from '@/components/common/request/detail/request-activities';
import ProjectDetails from '@/components/common/request/detail/request-details';
import TaskProgress from '@/components/common/request/detail/requirement-progress';
import FormSubmissionsViewer from '@/components/common/request/detail/submissions-viewer';

import { activities, documents, guideDocuments, submissions, tasks } from './mockData';

export default async function CaseDetailPage({ params }: { params: Promise<{ tenantId: string; slug: string }> }) {
  const { tenantId, slug } = await params;
  const session = await auth();
  const channel = await db.channel.findFirst({ where: { id: slug } });

  if (!session) return null;

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel minSize={30} defaultSize={30}>
        <div className="flex h-full flex-1 overflow-hidden p-4">
          <ProjectDetails tenantId={tenantId} slug={slug} />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={30} defaultSize={70}>
        <div className="h-full p-4">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="flex gap-2">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="requirements">
              <TaskProgress tasks={tasks} />
            </TabsContent>
            <TabsContent value="chat">
              <Comments slug={slug} currentUserId={session.user.id} channel={channel} tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="files">
              <AssociatedFilesViewer guideDocuments={guideDocuments} documents={documents} />
            </TabsContent>
            <TabsContent value="submissions">
              <FormSubmissionsViewer submissions={submissions} />
            </TabsContent>
            <TabsContent value="assignments">
              <AssignmentHistory />
            </TabsContent>
            <TabsContent value="related">
              <RelatedViewer currentRequestId="request-2" />
            </TabsContent>
            <TabsContent value="history">
              <ProjectActivities activities={activities} />
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
