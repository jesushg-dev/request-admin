import Link from 'next/link';
import { Locale } from '@/i18n/routing';
import { db } from '@/server/db-server';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar, Download, Edit, ExternalLink, File, FileText, LinkIcon, MoreHorizontal, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { getFileIcon } from '@/lib/document-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentAnalytics } from '@/components/common/documents/document-analytics';
import { DocumentComments } from '@/components/common/documents/document-comments';
import { DocumentMetadata } from '@/components/common/documents/document-metadata';
import { DocumentReactionWidget } from '@/components/common/documents/document-reaction-widget';
import { DocumentSharedLinks } from '@/components/common/documents/document-shared-links';
import { DocumentVersionHistory } from '@/components/common/documents/document-version-history';

interface DocumentDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { locale, tenantId, slug } = await params;

  const document = await db.document.findUnique({
    where: { id: slug, tenantId },
    /* include: {
      createdBy: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },*/
  });

  if (!document) {
    return <div>Document not found</div>;
  }

  const createdBy = await db.
  const handleCreateLink = () => {
    // In a real application, you would call your API to create a shareable link
    toast.success('Shareable link has been created and copied to clipboard');
  };

  const handleDeleteDocument = () => {
    // In a real application, you would call your API to delete the document
    toast.success('Document deleted successfully');
    // Navigate back to documents list
    window.location.href = '/documents';
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to documents
          </Link>
        </Button>
        <div className="flex items-center">
          {getFileIcon(document.type)}
          <span className="ml-2 text-sm text-muted-foreground">{document.type ? document.type.toUpperCase() : ''}</span>
          <div className="flex items-center ml-4 space-x-2">
            <Badge variant={document.status === 2 ? 'success' : 'outline'}>{document.status === 1 ? 'Draft' : document.status === 2 ? 'Published' : 'Archived'}</Badge>
            {document.assistantEnabled && <Badge variant="outline">AI Enabled</Badge>}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{document.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">{document.description}</p>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>Created {format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <File className="mr-1 h-4 w-4" />
              <span>
                {document.size} MB • {document.numPages} pages
              </span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={document.createdBy.avatar} alt={document.createdBy.name} />
                <AvatarFallback>{document.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{document.createdBy.name}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={document.url} target="_blank" rel="noopener noreferrer" download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button onClick={handleCreateLink}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/documents/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Document
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Delete Document</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this document?</DialogTitle>
                    <DialogDescription>This action cannot be undone. This will permanently delete the document and all associated data.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteDocument}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="links">Shared Links</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reactions">Reactions</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="rounded-lg overflow-hidden border h-[600px] flex flex-col bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center">
              {getFileIcon(document.type)}
              <span className="ml-2 font-medium">{document.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Document Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">Previewing {document.name}</p>
              <Button variant="outline" asChild>
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata">
          <DocumentMetadata document={document} />
        </TabsContent>

        <TabsContent value="versions">
          <DocumentVersionHistory documentId={document.id} />
        </TabsContent>

        <TabsContent value="links">
          <DocumentSharedLinks documentId={document.id} />
        </TabsContent>

        <TabsContent value="comments">
          <DocumentComments documentId={document.id} />
        </TabsContent>

        <TabsContent value="analytics">
          <DocumentAnalytics documentId={document.id} document={document} />
        </TabsContent>

        <TabsContent value="reactions">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Reactions</CardTitle>
                <CardDescription>Track user reactions to this document</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentReactionWidget documentId={document.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
