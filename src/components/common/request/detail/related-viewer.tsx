'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { RelatedIncidentModal } from './related-modal';
import { ViewToggle } from './view-toggle';

type Request = {
  id: string;
  title: string;
};

export const mockRequests: Request[] = [
  { id: 'request-1', title: 'Network Issue' },
  { id: 'request-2', title: 'Software Bug' },
  { id: 'request-3', title: 'Hardware Failure' },
  { id: 'request-4', title: 'Access Problem' },
];

interface RelatedViewerProps {
  currentRequestId: string;
}

export function RelatedViewer({ currentRequestId }: RelatedViewerProps) {
  const [viewType, setViewType] = useState<'table' | 'card'>('table');
  const relatedIncidents = mockRequests.filter((request) => request.id !== currentRequestId).slice(0, 3);

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-secondary/50">
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {relatedIncidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell>{incident.id}</TableCell>
            <TableCell>{incident.title}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {relatedIncidents.map((incident) => (
        <Card key={incident.id} className="bg-secondary/10">
          <CardHeader>
            <CardTitle>{incident.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>ID:</strong> {incident.id}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Related Incidents</CardTitle>
          <div className="flex items-center gap-2">
            <RelatedIncidentModal currentRequestId={currentRequestId} />
            <ViewToggle viewType={viewType} onViewChange={setViewType} />
          </div>
        </div>
      </CardHeader>
      <CardContent>{viewType === 'table' ? renderTableView() : renderCardView()}</CardContent>
    </Card>
  );
}
