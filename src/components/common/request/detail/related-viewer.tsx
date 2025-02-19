'use client';

import { useState } from 'react';
import { useFindManyRelatedIncident } from '@/services/api/hooks';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/shared/empty-state';

import ErrorRetryFallback from '../../error-retry-fallback';
import { RelatedIncidentModal } from './related-modal';
import { ViewToggle } from './view-toggle';

interface RelatedViewerProps {
  tenantId: string;
  requestId: string;
}

export function RelatedViewer({ tenantId, requestId }: RelatedViewerProps) {
  const [viewType, setViewType] = useState<'table' | 'card'>('table');
  const { data, isLoading, isError, error, refetch } = useFindManyRelatedIncident({
    select: { id: true, request: { select: { id: true, issueSubject: true } } },
    where: { tenantId, requestId },
  });

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Related Incidents</CardTitle>
          <div className="flex items-center gap-2">
            <RelatedIncidentModal currentRequestId={requestId} />
            <ViewToggle viewType={viewType} onViewChange={setViewType} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">
        {!data || data.length === 0 ? <EmptyState title="No related incidents" /> : viewType === 'table' ? <RenderTableView data={data} /> : <RenderCardView data={data} />}
      </CardContent>
    </Card>
  );
}

interface RenderViewProps {
  data: { id: string; request: { id: string; issueSubject: string | null } }[];
}

const RenderTableView = ({ data }: RenderViewProps) => (
  <Table>
    <TableHeader>
      <TableRow className="bg-secondary/50">
        <TableHead>ID</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Issue Subject</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((incident) => (
        <TableRow key={incident.id}>
          <TableCell>{incident.id}</TableCell>
          <TableCell>{incident.request.id}</TableCell>
          <TableCell>{incident.request.issueSubject}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const RenderCardView = ({ data }: RenderViewProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {data.map((incident) => (
      <Card key={incident.id} className="bg-secondary/10">
        <CardHeader>
          <CardTitle>{incident.request.issueSubject}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>ID:</strong> {incident.id}
          </p>
          <p>
            <strong>Request ID:</strong> {incident.request.id}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
