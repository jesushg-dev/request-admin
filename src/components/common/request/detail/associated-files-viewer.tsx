'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Associated Files</h1>
        <Button onClick={toggleViewMode} variant="outline">
          {viewMode === 'table' ? <LayoutGrid className="mr-2 h-4 w-4" /> : <List className="mr-2 h-4 w-4" />}
          {viewMode === 'table' ? 'Card View' : 'Table View'}
        </Button>
      </div>
      <Tabs defaultValue="guideDocuments">
        <TabsList>
          <TabsTrigger value="guideDocuments">Guide Documents</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="guideDocuments">
          {viewMode === 'table' ? <GuideDocumentTableView guideDocuments={guideDocuments} /> : <GuideDocumentCardView guideDocuments={guideDocuments} />}
        </TabsContent>
        <TabsContent value="documents">{viewMode === 'table' ? <DocumentTableView documents={documents} /> : <DocumentCardView documents={documents} />}</TabsContent>
      </Tabs>
    </div>
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

function GuideDocumentCardView({ guideDocuments }: { guideDocuments: GuideDocument[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {guideDocuments.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle>{doc.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Category:</strong> {doc.requestCategoryName}
            </p>
            <p>
              <strong>Version:</strong> {doc.version}
            </p>
            <p>
              <strong>Status:</strong> {doc.status}
            </p>
            <p>
              <strong>Expiration Date:</strong> {doc.expirationDate || 'N/A'}
            </p>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View Document
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
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

function DocumentCardView({ documents }: { documents: Document[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle>{doc.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Request:</strong> {doc.requestName}
            </p>
            <p>
              <strong>Status:</strong> {doc.status}
            </p>
            <p>
              <strong>Expiration Date:</strong> {doc.expirationDate || 'N/A'}
            </p>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View Document
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
