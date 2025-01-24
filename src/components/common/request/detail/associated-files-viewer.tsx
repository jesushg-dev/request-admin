'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Attachments } from './attachments';
import { ViewToggle } from './view-toggle';

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

export default function AssociatedFilesViewer({ guideDocuments, documents }: { guideDocuments: GuideDocument[]; documents: Document[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  return (
    <Tabs defaultValue="guideDocuments">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Associated Files</CardTitle>
            <div className="flex items-center gap-2">
              <TabsList className="h-8">
                <TabsTrigger value="document" className="h-7 text-xs">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="guide" className="h-7 text-xs">
                  Guides
                </TabsTrigger>
              </TabsList>

              <ViewToggle viewType={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="document">{viewMode === 'table' ? <GuideDocumentTableView guideDocuments={guideDocuments} /> : <Attachments type="document" />}</TabsContent>
          <TabsContent value="guide">{viewMode === 'table' ? <DocumentTableView documents={documents} /> : <Attachments type="guide" />}</TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}

function GuideDocumentTableView({ guideDocuments }: { guideDocuments: GuideDocument[] }) {
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
