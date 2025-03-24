'use client';

import { Link } from '@/i18n/routing';
import { format } from 'date-fns';
import { Edit, Eye, LinkIcon } from 'lucide-react';

import { DocumentWithRelations } from '@/types/prisma/document';
import { formatBytes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentMetadataProps {
  tenantId: string;
  document: DocumentWithRelations;
}

export function DocumentMetadata({ tenantId, document }: DocumentMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Document Details</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
                  params: { tenantId, slug: document.id },
                }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Name:</dt>
              <dd>{document.name}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Description:</dt>
              <dd>{document.description}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd>
                <Badge variant={document.status === 'ACTIVE' ? 'success' : 'outline'}>{document.status}</Badge>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">File Type:</dt>
              <dd className="uppercase">{document.type}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Size:</dt>
              <dd>{formatBytes(document.versions[0].fileSize ?? 0)} MB</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Pages:</dt>
              <dd>{document.numPages}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Folder:</dt>
              <dd>{document.folder?.path}</dd>
            </div>
            {document.expirationDate && (
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-muted-foreground">Expires:</dt>
                <dd>{format(document.expirationDate, 'MMM d, yyyy')}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Created By:</dt>
              <dd>{document.createdBy}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Created Date:</dt>
              <dd>{format(document.createdAt, 'MMM d, yyyy')}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Last Modified:</dt>
              <dd>{document.updatedAt ? format(document.updatedAt, 'MMM d, yyyy') : 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Storage Type:</dt>
              <dd>{document.storageType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Content Type:</dt>
              <dd>{document.contentType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">File URL:</dt>
              <dd className="truncate flex items-center gap-3">
                <LinkIcon className="h-3 w-3" />
                <a href={document.file} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  <span className="truncate mr-1">{document.file}</span>
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">Total Views:</dt>
              <dd className="flex items-center">
                <Eye className="mr-1 h-3 w-3 text-muted-foreground" />
                {document._count.views}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Features & Settings</CardTitle>
          <CardDescription>Special features enabled for this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex flex-col p-4 border rounded-lg ${document.assistantEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.assistantEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.assistantEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">AI Assistant</h3>
              </div>
              <p className="text-sm text-muted-foreground">AI can analyze and extract data from this document</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.advancedExcelEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.advancedExcelEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.advancedExcelEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">Advanced Excel</h3>
              </div>
              <p className="text-sm text-muted-foreground">Advanced Excel processing features</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.downloadOnly ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.downloadOnly ? 'success' : 'outline'} className="mb-2">
                  {document.downloadOnly ? 'Enabled' : 'Disabled'}
                </Badge>
                <h3 className="font-medium text-base">Download Only</h3>
              </div>
              <p className="text-sm text-muted-foreground">Document can only be downloaded, not viewed in browser</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
