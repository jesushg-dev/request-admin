'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Download, Edit, ExternalLink, File, FileText, LinkIcon, MoreHorizontal, Share2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DocumentReactionWidget } from '../document-reactions/document-reaction-widget';
import { DocumentAnalytics } from './document-analytics';
import { DocumentComments } from './document-comments';
import { DocumentMetadata } from './document-metadata';
import { DocumentSharedLinks } from './document-shared-links';
import { DocumentVersionHistory } from './document-version-history';

interface DocumentDetailProps {
  id: string;
}

export function DocumentDetail({ id }: DocumentDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedDataroomId, setSelectedDataroomId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Mock datarooms for the move dialog
  const mockDatarooms = [
    { id: '1', name: 'Series A Fundraising' },
    { id: '2', name: 'Q2 2023 Board Meeting' },
    { id: '3', name: 'Acquisition Due Diligence' },
  ];

  // Mock folders for the move dialog
  const mockFolders = [
    { id: '1', name: 'Financial Reports', path: '/Financial Reports' },
    { id: '2', name: 'Marketing', path: '/Marketing' },
    { id: '3', name: 'HR Documents', path: '/HR Documents' },
    { id: '4', name: '2023', path: '/Financial Reports/2023' },
    { id: '5', name: '2022', path: '/Financial Reports/2022' },
  ];

  useEffect(() => {
    // Simulate API call to fetch document details
    const fetchDocument = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock document data
        setDocument({
          id,
          name: 'Annual Report 2023',
          description: 'Financial report for the fiscal year 2023 containing detailed analysis of company performance.',
          file: 'annual-report-2023.pdf',
          url: 'https://example.com/documents/annual-report-2023.pdf',
          status: 2, // Published
          expirationDate: new Date('2024-12-31'),
          type: 'pdf',
          contentType: 'application/pdf',
          storageType: 'VERCEL_BLOB',
          size: 4.5, // MB
          numPages: 42,
          assistantEnabled: true,
          advancedExcelEnabled: false,
          downloadOnly: false,
          folderId: '1',
          folderPath: '/Financial Reports/2023',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15'),
          createdBy: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/placeholder.svg',
          },
          viewCount: 68,
          downloadCount: 23,
          versions: 3,
          links: 2,
          comments: 5,
        });
      } catch (error) {
        toast.error('Failed to fetch document details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="outline">Draft</Badge>;
      case 2:
        return <Badge variant="success">Published</Badge>;
      case 3:
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

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

  const handleMoveDocument = () => {
    // In a real application, you would call your API to move the document
    toast.success(`Document moved successfully${selectedDataroomId ? ' to dataroom' : ''}${selectedFolderId ? ' and folder' : ''}`);
    setIsMoveDialogOpen(false);
  };

  if (isLoading || !document) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>
          <div className="h-6 w-36 animate-pulse rounded bg-muted"></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-96 animate-pulse rounded bg-muted"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-10 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-10 w-10 animate-pulse rounded bg-muted"></div>
          </div>
        </div>

        <div className="h-12 w-full animate-pulse rounded bg-muted"></div>

        <div className="h-[600px] w-full animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

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
          <span className="ml-2 text-sm text-muted-foreground">{document.type.toUpperCase()}</span>
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
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Move Document
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <DocumentVersionHistory documentId={id} />
        </TabsContent>

        <TabsContent value="links">
          <DocumentSharedLinks documentId={id} />
        </TabsContent>

        <TabsContent value="comments">
          <DocumentComments documentId={id} />
        </TabsContent>

        <TabsContent value="analytics">
          <DocumentAnalytics documentId={id} document={document} />
        </TabsContent>

        <TabsContent value="reactions">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Reactions</CardTitle>
                <CardDescription>Track user reactions to this document</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentReactionWidget documentId={id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Move Document Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription>Select a dataroom and/or folder to move this document to.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataroom" className="text-right">
                Dataroom
              </Label>
              <Select onValueChange={(value) => setSelectedDataroomId(value || null)} defaultValue={document.dataroomId || 'none'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select dataroom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (No Dataroom)</SelectItem>
                  {mockDatarooms.map((dataroom) => (
                    <SelectItem key={dataroom.id} value={dataroom.id}>
                      {dataroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder" className="text-right">
                Folder
              </Label>
              <Select onValueChange={(value) => setSelectedFolderId(value || null)} defaultValue={document.folderId || 'root'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root (No Folder)</SelectItem>
                  {mockFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveDocument}>Move Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
