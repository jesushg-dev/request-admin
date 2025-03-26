'use client';

import { FC } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useViewToggle, ViewToggle } from '@/components/custom-ui/view-toggle';
import EmptyState from '@/components/shared/empty-state';

import { Attachments } from './attachments';

const VIEW_QUERY_KEY = 'associated-files-view';

export interface GuideDocument {
  id: string;
  name: string;
  url: string | null;
  status: number;
  expirationDate: string | null;
  version: number;
  requestCategoryId: string;
  requestCategoryName: string;
}

export interface Document {
  id: string;
  name: string;
  url: string | null;
  status: number;
  expirationDate: string | null;
  requestId: string;
  requestName: string;
}

interface AssociatedFilesViewerProps {
  tenantId: string;
  documents: Document[];
}

const AssociatedFilesViewer: FC<AssociatedFilesViewerProps> = ({ documents, tenantId }) => {
  const [viewMode] = useViewToggle(VIEW_QUERY_KEY);

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Associated Files</CardTitle>
          <div className="flex items-center gap-2">
            <ViewToggle queryKey={VIEW_QUERY_KEY} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">{viewMode === 'table' ? <DocumentTableView documents={documents} /> : <Attachments type="guide" />}</CardContent>
    </Card>
  );
};

function GuideDocumentTableView({ guideDocuments }: { guideDocuments: GuideDocument[] }) {
  if (!guideDocuments.length) return <EmptyState title="No guide documents found" description="Please check back later or contact support if you need immediate assistance." />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expiration Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guideDocuments.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.name}</TableCell>
            <TableCell>{doc.requestCategoryName}</TableCell>
            <TableCell>{doc.version}</TableCell>
            <TableCell>{doc.status}</TableCell>
            <TableCell>{doc.expirationDate || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DocumentTableView({ documents }: { documents: Document[] }) {
  if (!documents.length) return <EmptyState title="No documents found" description="Please check back later or contact support if you need immediate assistance." />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Request</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expiration Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.name}</TableCell>
            <TableCell>{doc.requestName}</TableCell>
            <TableCell>{doc.status}</TableCell>
            <TableCell>{doc.expirationDate || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default AssociatedFilesViewer;
