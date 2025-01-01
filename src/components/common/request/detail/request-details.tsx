import { CalendarIcon, FlagIcon, FolderIcon, TagIcon, UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { areas, attachments, requestAssignment, teamMembers } from '@/app/[locale]/admin/[tenantId]/requests-portal/requests/[slug]/mockData';

import Attachments from './attachments';
import TeamMembers from './user-members';

interface ProjectDetailsProps {
  details: {
    id: string;
    clientName: string;
    issueSubject: string;
    description: string;
    priority: string;
    statusName: string;
    requestCategoryName: string;
    assignmentCategoryName: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function ProjectDetails({ details }: ProjectDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full justify-between">
          {details.issueSubject}
          <Button variant="outline" size="sm">
            Change Status
          </Button>
        </CardTitle>
        <CardDescription className="-mt-2">{details.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground"></p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm text-muted-foreground">{details.clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FlagIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Priority</p>
              <Select defaultValue={details.priority}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{new Date(details.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{details.statusName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Request Category</p>
              <p className="text-sm text-muted-foreground">{details.requestCategoryName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Assignment Category</p>
              <p className="text-sm text-muted-foreground">{details.assignmentCategoryName}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Change Request Category</Button>
          <Button variant="outline">Change Assignment Category</Button>
        </div>
        <TeamMembers members={teamMembers} areas={areas} assignment={requestAssignment} />
        <Attachments files={attachments} />
      </CardContent>
      <CardFooter>
        <Button>Edit Details</Button>
      </CardFooter>
    </Card>
  );
}
