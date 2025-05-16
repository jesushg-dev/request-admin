import { BookUserIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Hint } from '@/components/hint';

import { mockRequestAssignments, mockTeamMembers } from './mock-data';

export default function UserMembers() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {mockRequestAssignments.map((assignment, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex w-full items-center justify-between">
              <MemberCard name="John Doe" role="Software Engineer" />
              <div className="flex flex-col items-end justify-center">
                <CardTitle className="text-sm">#{assignment.id}</CardTitle>
                <Badge variant={assignment.priority === 'High' ? 'destructive' : 'default'}>{assignment.priority}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="text-sm">
                <p>
                  <strong>SLA Deadline:</strong> {new Date(assignment.slaDeadline).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">{assignment.comment}</p>
              </div>
              <div className="flex items-center gap-2">
                <ViewAllMembers />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const ViewAllMembers = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Hint label="View all members">
            <BookUserIcon className="h-4 w-4" />
          </Hint>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
        </DialogHeader>
        {mockTeamMembers.map((member) => (
          <MemberCard key={member.id} name={member.name} role={member.role} />
        ))}
      </DialogContent>
    </Dialog>
  );
};

const MemberCard = ({ name, role }: { name: string; role: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">{name.charAt(0)}</div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{role}</p>
      </div>
    </div>
  );
};
