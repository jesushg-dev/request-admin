import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { mockRequests } from '../mockData';
import { RelatedIncidentModal } from './related-modal';
import { ViewToggle } from './ViewToggle';

interface RelatedIncidentsListProps {
  currentRequestId: string;
}

export function RelatedIncidentsList({ currentRequestId }: RelatedIncidentsListProps) {
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
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <RelatedIncidentModal currentRequestId={currentRequestId} />
        <ViewToggle viewType={viewType} onViewChange={setViewType} />
      </div>
      {viewType === 'table' ? renderTableView() : renderCardView()}
    </div>
  );
}
