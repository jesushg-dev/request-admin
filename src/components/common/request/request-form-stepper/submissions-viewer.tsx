'use client';

import { useState } from 'react';
import { useFindManyForm } from '@/services/api/hooks';
import { InboxIcon, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useViewToggle, ViewToggle } from '@/components/custom-ui/view-toggle';
import EmptyState from '@/components/shared/empty-state';

const VIEW_QUERY_KEY = 'submissions-view';

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

export default function FormSubmissionsViewer({ submissions }: { submissions?: Record<string, Record<string, string | number | boolean>> }) {
  const { data, isLoading } = useFindManyForm({
    select: { id: true, name: true, content: true },
    where: { id: { in: Object.keys(submissions || {}) } },
  });

  const [viewMode] = useViewToggle(VIEW_QUERY_KEY);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    formName: true,
    submittedAt: false, // Hidden by default
    content: true,
  });

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const formSubmissions: FormSubmission[] =
    data?.map((form) => {
      const elements = JSON.parse(form.content || '[]') as { id: string; extraAttributes: { label: string } }[];

      const submissionContent: Record<string, string> = Object.entries(submissions?.[form.id] || {}).reduce(
        (acc, [key, value]) => {
          const element = elements.find((element) => element.id === key);
          if (element && element.extraAttributes.label) {
            acc[element.extraAttributes.label] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return {
        id: form.id,
        formName: form.name,
        submittedAt: Date().toString(),
        content: submissionContent,
      };
    }) || [];

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Submissions</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
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
            <ViewToggle queryKey={VIEW_QUERY_KEY} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-32 h-6" />
          </div>
        ) : !formSubmissions.length ? (
          <EmptyState title="No submissions available" icons={[InboxIcon]} description="No form submissions have been made yet." />
        ) : viewMode === 'table' ? (
          <TableView submissions={formSubmissions} columnVisibility={columnVisibility} />
        ) : (
          <CardView submissions={formSubmissions} columnVisibility={columnVisibility} />
        )}
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
                        <span className="font-semibold">{key}:</span> {value}
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
                    <span className="font-semibold">{key}:</span> {value}
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
