import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { mockRequestAssignments, mockTeamMembers } from './mock-data';

export default function TeamMembers() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4">
        {mockRequestAssignments.map((assignment, index) => (
          <Card key={index} className="md:basis-1/2">
            <CardHeader>
              <div className="flex w-full flex-col items-center justify-between">
                <CardTitle className="text-sm">#{assignment.id}</CardTitle>
                <Badge variant={assignment.priority === 'High' ? 'destructive' : 'default'}>{assignment.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {mockTeamMembers
                    .filter((member) => member.id === assignment.userTenantId)
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">{member.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-xs">{member.role}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="text-sm">
                  <p>
                    <strong>SLA Deadline:</strong> {new Date(assignment.slaDeadline).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">{assignment.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
