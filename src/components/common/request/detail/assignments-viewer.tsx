'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AreaAssignmentModal } from './area-assignment-modal';
import { UserAssignmentModal } from './user-assignment-modal';
import TeamMembers from './user-members';
import { ViewToggle } from './view-toggle';

export const mockAssignmentHistory = [
  {
    id: 'assign-1',
    type: 'User',
    from: 'Unassigned',
    to: 'John Doe',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slaStart: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 19 * 60 * 60 * 1000),
    slaEnd: null,
  },
  {
    id: 'assign-2',
    type: 'Area',
    from: 'IT Support',
    to: 'HR',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slaStart: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    slaEnd: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export const mockCategories = {
  requestCategories: [
    { id: 'req-cat-1', name: 'Technical Issue' },
    { id: 'req-cat-2', name: 'Service Request' },
    { id: 'req-cat-3', name: 'Incident' },
  ],
  assignmentCategories: [
    { id: 'assign-cat-1', name: 'First Level Support' },
    { id: 'assign-cat-2', name: 'Second Level Support' },
    { id: 'assign-cat-3', name: 'Specialist' },
  ],
};
export function AssignmentHistory() {
  const [viewType, setViewType] = useState<'table' | 'card'>('table');
  const [visibility, setVisibility] = useState<FieldVisibility>({
    basic: true,
    sla: true,
    categories: true,
    documents: true,
    comments: true,
  });

  const userAssignments = mockAssignmentHistory.filter((a) => a.type === 'User');
  const areaAssignments = mockAssignmentHistory.filter((a) => a.type === 'Area');

  const renderTableView = (assignments: typeof mockAssignmentHistory) => (
    <Table>
      <TableHeader>
        <TableRow>
          {visibility.basic && (
            <>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
            </>
          )}
          {visibility.categories && (
            <>
              <TableHead>Request Category</TableHead>
              <TableHead>Assignment Category</TableHead>
            </>
          )}
          {visibility.sla && (
            <>
              <TableHead>SLA Start</TableHead>
              <TableHead>SLA Deadline</TableHead>
              <TableHead>SLA End</TableHead>
              <TableHead>Time Taken</TableHead>
              <TableHead>Remaining SLA</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const timeTaken = assignment.slaEnd
            ? Math.round((assignment.slaEnd.getTime() - assignment.slaStart.getTime()) / (1000 * 60 * 60))
            : Math.round((new Date().getTime() - assignment.slaStart.getTime()) / (1000 * 60 * 60));

          const remainingSLA = assignment.slaEnd ? 0 : Math.round((assignment.slaDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60));

          return (
            <TableRow key={assignment.id}>
              {visibility.basic && (
                <>
                  <TableCell>{assignment.from}</TableCell>
                  <TableCell>{assignment.to}</TableCell>
                  <TableCell>{assignment.date.toLocaleString()}</TableCell>
                </>
              )}
              {visibility.categories && (
                <>
                  <TableCell>{mockCategories.requestCategories.find((c) => c.id === 'req-cat-1')?.name}</TableCell>
                  <TableCell>{mockCategories.assignmentCategories.find((c) => c.id === 'assign-cat-1')?.name}</TableCell>
                </>
              )}
              {visibility.sla && (
                <>
                  <TableCell>{assignment.slaStart.toLocaleString()}</TableCell>
                  <TableCell>{assignment.slaDeadline.toLocaleString()}</TableCell>
                  <TableCell>{assignment.slaEnd ? assignment.slaEnd.toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{timeTaken} hours</TableCell>
                  <TableCell>{remainingSLA} hours</TableCell>
                </>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderCardView = (assignments: typeof mockAssignmentHistory) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => {
        const timeTaken = assignment.slaEnd
          ? Math.round((assignment.slaEnd.getTime() - assignment.slaStart.getTime()) / (1000 * 60 * 60))
          : Math.round((new Date().getTime() - assignment.slaStart.getTime()) / (1000 * 60 * 60));

        const remainingSLA = assignment.slaEnd ? 0 : Math.round((assignment.slaDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60));

        return (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visibility.basic && (
                <>
                  <p>
                    <strong>From:</strong> {assignment.from}
                  </p>
                  <p>
                    <strong>To:</strong> {assignment.to}
                  </p>
                  <p>
                    <strong>Date:</strong> {assignment.date.toLocaleString()}
                  </p>
                </>
              )}
              {visibility.categories && (
                <>
                  <p>
                    <strong>Request Category:</strong> {mockCategories.requestCategories.find((c) => c.id === 'req-cat-1')?.name}
                  </p>
                  <p>
                    <strong>Assignment Category:</strong> {mockCategories.assignmentCategories.find((c) => c.id === 'assign-cat-1')?.name}
                  </p>
                </>
              )}
              {visibility.sla && (
                <>
                  <p>
                    <strong>SLA Start:</strong> {assignment.slaStart.toLocaleString()}
                  </p>
                  <p>
                    <strong>SLA Deadline:</strong> {assignment.slaDeadline.toLocaleString()}
                  </p>
                  <p>
                    <strong>SLA End:</strong> {assignment.slaEnd ? assignment.slaEnd.toLocaleString() : 'N/A'}
                  </p>
                  <p>
                    <strong>Time Taken:</strong> {timeTaken} hours
                  </p>
                  <p>
                    <strong>Remaining SLA:</strong> {remainingSLA} hours
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Tabs defaultValue="user">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Assignments</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <FieldVisibilitySettings visibility={visibility} onChange={setVisibility} />
              <AreaAssignmentModal onComplete={console.log} />
              <UserAssignmentModal onComplete={console.log} />
              <TabsList className="h-8">
                <TabsTrigger value="user" className="h-7 text-xs">
                  User
                </TabsTrigger>
                <TabsTrigger value="area" className="h-7 text-xs">
                  Area
                </TabsTrigger>
              </TabsList>
              <ViewToggle viewType={viewType} onViewChange={setViewType} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="user">{viewType === 'table' ? renderTableView(userAssignments) : <TeamMembers />}</TabsContent>
          <TabsContent value="area">{viewType === 'table' ? renderTableView(areaAssignments) : renderCardView(areaAssignments)}</TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}

export interface FieldVisibility {
  basic: boolean;
  sla: boolean;
  categories: boolean;
  documents: boolean;
  comments: boolean;
}

interface FieldVisibilitySettingsProps {
  visibility: FieldVisibility;
  onChange: (visibility: FieldVisibility) => void;
}

export function FieldVisibilitySettings({ visibility, onChange }: FieldVisibilitySettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Visible Fields
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuCheckboxItem checked={visibility.basic} onCheckedChange={(checked) => onChange({ ...visibility, basic: checked })}>
          Basic Information
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={visibility.sla} onCheckedChange={(checked) => onChange({ ...visibility, sla: checked })}>
          SLA Times
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={visibility.categories} onCheckedChange={(checked) => onChange({ ...visibility, categories: checked })}>
          Categories
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={visibility.documents} onCheckedChange={(checked) => onChange({ ...visibility, documents: checked })}>
          Documents
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={visibility.comments} onCheckedChange={(checked) => onChange({ ...visibility, comments: checked })}>
          Comments
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
