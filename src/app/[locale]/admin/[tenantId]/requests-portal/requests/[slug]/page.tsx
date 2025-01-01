import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Comments from '@/components/common/request/detail/comments';
import ProjectActivities from '@/components/common/request/detail/request-activities';
import ProjectDetails from '@/components/common/request/detail/request-details';
import TaskProgress from '@/components/common/request/detail/requirement-progress';

import { activities, comments, projectDetails, tasks } from './mockData';

export default function CaseDetailPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <ProjectDetails details={projectDetails} />
            </div>
            <div className="col-span-3">
              <Comments comments={comments} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="activities">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <TaskProgress tasks={tasks} />
            </div>
            <div className="col-span-2">
              <ProjectActivities activities={activities} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
