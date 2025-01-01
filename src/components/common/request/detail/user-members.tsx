import { PlusIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Area, User } from '@/app/[locale]/admin/[tenantId]/requests-portal/requests/[slug]/mockData';

interface TeamMembersProps {
  members: User[];
  areas: Area[];
  assignment: {
    type: string;
    userId: string | null;
    areaId: string | null;
  };
}

export default function TeamMembers({ members, areas, assignment }: TeamMembersProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Assigned to</h3>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.map((member) => (
            <Avatar key={member.id} className="border-2 border-background">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="assignmentType" className="text-right">
                  Type
                </label>
                <Select defaultValue={assignment.type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="assignee" className="text-right">
                  Assignee
                </label>
                <Select defaultValue={assignment.userId || assignment.areaId || ''}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignment.type === 'User'
                      ? members.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      : areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Save changes</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
