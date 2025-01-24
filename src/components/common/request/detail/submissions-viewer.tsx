'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ViewToggle } from './view-toggle';

type ColumnVisibility = {
  formName: boolean;
  submittedAt: boolean;
  content: boolean;
};

export interface FormSubmission {
  id: string;
  formName: string;
  submittedAt: string;
  content: Record<string, string>;
}

export default function FormSubmissionsViewer({ submissions }: { submissions: FormSubmission[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    formName: true,
    submittedAt: false, // Hidden by default
    content: true,
  });

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Submissions</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={columnVisibility.formName} onCheckedChange={() => toggleColumnVisibility('formName')}>
                  Form Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.submittedAt} onCheckedChange={() => toggleColumnVisibility('submittedAt')}>
                  Submitted At
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.content} onCheckedChange={() => toggleColumnVisibility('content')}>
                  Content
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ViewToggle viewType={viewMode} onViewChange={setViewMode} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? <TableView submissions={submissions} columnVisibility={columnVisibility} /> : <CardView submissions={submissions} columnVisibility={columnVisibility} />}
      </CardContent>
    </Card>
  );
}

function TableView({ submissions, columnVisibility }: { submissions: FormSubmission[]; columnVisibility: ColumnVisibility }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnVisibility.formName && <TableHead>Form Name</TableHead>}
          {columnVisibility.submittedAt && <TableHead>Submitted At</TableHead>}
          {columnVisibility.content && <TableHead>Content</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            {columnVisibility.formName && <TableCell className="font-medium">{submission.formName}</TableCell>}
            {columnVisibility.submittedAt && <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>}
            {columnVisibility.content && (
              <TableCell>
                <Card>
                  <CardContent className="p-4">
                    {Object.entries(submission.content).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="font-semibold">{formatFieldName(key)}:</span> {value}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CardView({ submissions, columnVisibility }: { submissions: FormSubmission[]; columnVisibility: ColumnVisibility }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader>{columnVisibility.formName && <CardTitle>{submission.formName}</CardTitle>}</CardHeader>
          <CardContent>
            {columnVisibility.submittedAt && <p className="mb-2 text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>}
            {columnVisibility.content && (
              <div className="space-y-2">
                {Object.entries(submission.content).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold">{formatFieldName(key)}:</span> {value}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatFieldName(fieldName: string): string {
  const words = fieldName.split(/(?=[A-Z])/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
