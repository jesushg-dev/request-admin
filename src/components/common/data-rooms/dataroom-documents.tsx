'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useFindManyDataroomFolder, useFindManyDocument } from '@/services/api/hooks';
import { CustomField } from '@prisma/client';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clipboard, Copy, Download, Eye, FileText, FolderClosed, FolderPlus, LinkIcon, MoreHorizontal, Pencil, Plus, Scissors, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/shared/empty-state';

interface DataroomDocumentsProps {
  tenantId: string;
  dataroomId: string;
  callbackUrl: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
  size: number;
  createdAt: Date;
  status: number;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  documentCount: number;
}

interface ClipboardItem {
  id: string;
  name: string;
  type: string;
  isFolder: boolean;
  action: 'cut' | 'copy';
}

interface Link {
  id: string;
  name: string;
  url: string;
  documentId?: string;
  dataroomId?: string;
  linkType: 'DOCUMENT_LINK' | 'DATAROOM_LINK';
  expiresAt?: Date;
  password?: string;
  emailProtected: boolean;
  emailAuthenticated: boolean;
  allowDownload: boolean;
  enableNotification: boolean;
  enableFeedback: boolean;
  enableQuestion: boolean;
  enableScreenshotProtection: boolean;
  enableWatermark: boolean;
  enableAgreement: boolean;
  agreementId?: string;
  customFields: CustomField[]; // Añadir esta propiedad
}

export function DataroomDocuments({ dataroomId, tenantId, callbackUrl }: DataroomDocumentsProps) {
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isClipboardExpanded, setIsClipboardExpanded] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('preview');

  const { data: documents = [], isLoading: isDocumentsLoading } = useFindManyDocument({
    where: { tenantId, dataroomId },
  });

  const { data: folders = [], isLoading: isFoldersLoading } = useFindManyDataroomFolder({
    where: { tenantId, dataroomId },
  });

  const getCurrentFolders = () => {
    return folders.filter((folder) => folder.parentId === currentFolderId);
  };

  const getCurrentDocuments = () => {
    const docs = documents.filter((doc) => doc.folderId === currentFolderId);
    if (searchQuery) {
      return docs.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return docs;
  };

  const getBreadcrumbs = () => {
    if (currentFolderId === null) {
      return [{ id: null, name: 'Root' }];
    }

    const breadcrumbs = [{ id: null, name: 'Root' }];
    let currentFolder = folders.find((folder) => folder.id === currentFolderId);

    while (currentFolder) {
      breadcrumbs.push({ id: currentFolder.id, name: currentFolder.name });
      currentFolder = folders.find((folder) => folder.id === currentFolder?.parentId);
    }

    return breadcrumbs.reverse();
  };

  const handleRenameFolder = () => {
    if (!renameFolderName.trim() || !renameFolderId) {
      toast.error('Folder name cannot be empty');
      return;
    }

    // Find the folder to rename
    const folderToRename = folders.find((f) => f.id === renameFolderId);
    if (!folderToRename) {
      toast.error('Folder not found');
      return;
    }

    // Calculate new path
    setIsRenameFolderDialogOpen(false);
    setRenameFolderId(null);
    setRenameFolderName('');
    toast.success('Folder renamed successfully');
  };

  const handleDeleteDocument = (id: string) => {
    toast.success('Document removed from dataroom');
  };

  const handleDeleteFolder = (id: string) => {
    // Find all subfolders recursively
    const findSubfolders = (folderId: string): string[] => {
      const directSubfolders = folders.filter((f) => f.parentId === folderId).map((f) => f.id);
      return [...directSubfolders, ...directSubfolders.flatMap((subId) => findSubfolders(subId))];
    };

    const subfolderIds = findSubfolders(id);
    const allFolderIds = [id, ...subfolderIds];

    // In a real application, you would call your API to delete the folder and its subfolders
    setFolders((prev) => prev.filter((folder) => !allFolderIds.includes(folder.id)));

    toast.success('Folder and subfolders deleted successfully');
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const getFileIcon = (type: string | null) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-6 w-6 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="h-6 w-6 text-orange-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

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

  const handleViewDocument = (doc: Document) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
    setActivePreviewTab('preview');
  };

  const openRenameDialog = (folder: Folder) => {
    setRenameFolderId(folder.id);
    setRenameFolderName(folder.name);
    setIsRenameFolderDialogOpen(true);
  };

  // Cut/Copy/Paste functionality
  const handleCutDocument = (doc: Document) => {
    setClipboard([
      ...clipboard.filter((item) => !(item.isFolder === false && item.id === doc.id)),
      {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        isFolder: false,
        action: 'cut',
      },
    ]);
    toast.success(`Document "${doc.name}" ready to move`);
  };

  const handleCutFolder = (folder: Folder) => {
    setClipboard([
      ...clipboard.filter((item) => !(item.isFolder === true && item.id === folder.id)),
      {
        id: folder.id,
        name: folder.name,
        type: 'folder',
        isFolder: true,
        action: 'cut',
      },
    ]);
    toast.success(`Folder "${folder.name}" ready to move`);
  };

  const handleCopyDocument = (doc: Document) => {
    setClipboard([
      ...clipboard.filter((item) => !(item.isFolder === false && item.id === doc.id)),
      {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        isFolder: false,
        action: 'copy',
      },
    ]);
    toast.success(`Document "${doc.name}" copied to clipboard`);
  };

  const handlePaste = () => {
    if (clipboard.length === 0) {
      toast.error('Nothing to paste');
      return;
    }

    // Handle documents
    const docItems = clipboard.filter((item) => !item.isFolder);
    if (docItems.length > 0) {
      const updatedDocs = [...documents];

      docItems.forEach((item) => {
        const docIndex = updatedDocs.findIndex((d) => d.id === item.id);
        if (docIndex !== -1) {
          if (item.action === 'cut') {
            // Move document
            updatedDocs[docIndex] = {
              ...updatedDocs[docIndex],
              folderId: currentFolderId,
            };
          } else {
            // Copy document
            const originalDoc = updatedDocs[docIndex];
            const newDoc = {
              ...originalDoc,
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: `${originalDoc.name.split('.')[0]} (Copy).${originalDoc.name.split('.').pop()}`,
              folderId: currentFolderId,
              createdAt: new Date(),
            };
            updatedDocs.push(newDoc);
          }
        }
      });
    }

    // Handle folders
    const folderItems = clipboard.filter((item) => item.isFolder);
    if (folderItems.length > 0) {
      const updatedFolders = [...folders];

      folderItems.forEach((item) => {
        const folderIndex = updatedFolders.findIndex((f) => f.id === item.id);
        if (folderIndex !== -1 && item.action === 'cut') {
          // Can't paste a folder into itself or its children
          const targetFolder = updatedFolders[folderIndex];
          const targetPath = targetFolder.path;

          // Check if current folder is a child of the target folder
          if (currentFolderId) {
            const currentFolder = folders.find((f) => f.id === currentFolderId);
            if (currentFolder && (currentFolder.id === targetFolder.id || currentFolder.path.startsWith(targetPath + '/'))) {
              toast.error(`Cannot move a folder into itself or its subfolder`);
              return;
            }
          }

          // Move folder
          const oldParentPath = targetFolder.path.substring(0, targetFolder.path.lastIndexOf('/'));
          const newParentPath = currentFolderId ? folders.find((f) => f.id === currentFolderId)?.path || '' : '';

          const newPath = newParentPath ? `${newParentPath}/${targetFolder.name}` : `/${targetFolder.name}`;

          // Update the folder and all its children
          updatedFolders.forEach((folder, idx) => {
            if (folder.id === targetFolder.id) {
              updatedFolders[idx] = {
                ...folder,
                parentId: currentFolderId,
                path: newPath,
              };
            } else if (folder.path.startsWith(targetPath + '/')) {
              // Update child folder paths
              const relativePath = folder.path.substring(targetPath.length);
              updatedFolders[idx] = {
                ...folder,
                path: newPath + relativePath,
              };
            }
          });
        }
      });

      setFolders(updatedFolders);
    }

    // Clear clipboard for cut items, keep copy items
    setClipboard(clipboard.filter((item) => item.action === 'copy'));
    toast.success('Items pasted successfully');
  };

  const handleClearClipboard = () => {
    setClipboard([]);
  };

  const handleContainerContextMenu = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  if (isFoldersLoading || isDocumentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={containerRef} onContextMenu={handleContainerContextMenu}>
      {/* Rename Folder Dialog */}
      <Dialog open={isRenameFolderDialogOpen} onOpenChange={setIsRenameFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for this folder.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rename-folder-name" className="text-right">
                Name
              </Label>
              <Input id="rename-folder-name" value={renameFolderName} onChange={(e) => setRenameFolderName(e.target.value)} className="col-span-3" placeholder="Enter folder name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>Rename Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <Card>
            <CardHeader className="flex w-full flex-row justify-between items-center">
              <div className="flex gap-4 flex-col items-center">
                <CardTitle className="flex gap-2">
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <span className="mx-1">/</span>}
                      <Button variant="link" className="p-0 h-auto font-medium" onClick={() => navigateToFolder(breadcrumb.id)}>
                        {breadcrumb.name}
                      </Button>
                    </div>
                  ))}
                </CardTitle>
                <CardDescription>{currentFolderId ? `Folder: ${folders.find((f) => f.id === currentFolderId)?.name}` : 'Root folder'}</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" asChild>
                  <Link className="flex items-center" href={{ pathname: '/admin/[tenantId]/links-and-documents/folders/new', params: { tenantId }, query: { currentFolderId, dataroomId } }}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Folder
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    className="flex items-center"
                    href={{
                      params: { tenantId },
                      pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
                      query: { folderId: currentFolderId, dataroomId: dataroomId, dataroomName: '', callbackUrl },
                    }}>
                    <Plus className="mr-2 h-4 w-4" /> Upload documents
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {getCurrentFolders().length === 0 && getCurrentDocuments().length === 0 ? (
                <EmptyState
                  icons={[FileText, LinkIcon, FolderClosed]}
                  title="This folder is empty"
                  description="Add folders and documents to organize your files better"
                  actions={[
                    {
                      icon: FolderPlus,
                      label: 'New Folder',
                      href: { pathname: '/admin/[tenantId]/links-and-documents/folders/new', params: { tenantId }, query: { currentFolderId, dataroomId } },
                    },
                    {
                      icon: Plus,
                      label: 'Upload documents',
                      href: {
                        params: { tenantId },
                        pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
                        query: { folderId: currentFolderId, dataroomId, dataroomName: '', callbackUrl },
                      },
                    },
                  ]}
                />
              ) : (
                <div className="space-y-4">
                  {getCurrentFolders().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Folders</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {getCurrentFolders().map((folder) => (
                          <ContextMenu key={folder.id}>
                            <ContextMenuTrigger>
                              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => navigateToFolder(folder.id)}>
                                  <FolderPlus className="h-6 w-6 text-blue-500" />
                                  <div>
                                    <span className="font-medium">{folder.name}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openRenameDialog(folder)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCutFolder(folder)}>
                                      <Scissors className="mr-2 h-4 w-4" />
                                      Cut
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => navigateToFolder(folder.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Open
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => openRenameDialog(folder)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleCutFolder(folder)}>
                                <Scissors className="mr-2 h-4 w-4" />
                                Cut
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    </div>
                  )}

                  {getCurrentDocuments().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Documents</h3>
                      <div className="divide-y divide-border">
                        {getCurrentDocuments().map((doc) => (
                          <ContextMenu key={doc.id}>
                            <ContextMenuTrigger>
                              <div className="flex items-center justify-between py-3 px-2 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center space-x-3 flex-1">
                                  {getFileIcon(doc.type)}
                                  <div>
                                    <p className="font-medium hover:underline cursor-pointer" onClick={() => handleViewDocument(doc)}>
                                      {doc.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {doc.size} MB • {format(doc.createdAt, 'MMM d, yyyy')}
                                      </span>
                                      {getStatusBadge(doc.status)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link
                                      href={{
                                        pathname: '/admin/[tenantId]/links-and-documents/links/new',
                                        query: { documentId: doc.id, dataroomId, dataroomName: '', callbackUrl },
                                        params: { tenantId },
                                      }}>
                                      <LinkIcon className="h-4 w-4" />
                                      <span className="sr-only">Create Link</span>
                                    </Link>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleCutDocument(doc)}>
                                        <Scissors className="mr-2 h-4 w-4" />
                                        Cut
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleCopyDocument(doc)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteDocument(doc.id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => handleViewDocument(doc)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </ContextMenuItem>
                              <ContextMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </ContextMenuItem>

                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => handleCutDocument(doc)}>
                                <Scissors className="mr-2 h-4 w-4" />
                                Cut
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleCopyDocument(doc)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => handleDeleteDocument(doc.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {clipboard.length > 0 && (
            <>
              <ContextMenuItem onClick={handlePaste}>
                <Clipboard className="mr-2 h-4 w-4" />
                Paste {clipboard.length} item{clipboard.length !== 1 ? 's' : ''}
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem asChild>
            <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/folders/new', params: { tenantId }, query: { currentFolderId, dataroomId } }}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Link>
          </ContextMenuItem>
          <ContextMenuItem asChild>
            <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/documents/upload', params: { tenantId }, query: { folderId: currentFolderId, dataroomId, dataroomName: '', callbackUrl } }}>
              <Plus className="mr-2 h-4 w-4" />
              Upload documents
            </Link>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center">
              {previewDocument && getFileIcon(previewDocument.type)}
              <span className="ml-2">{previewDocument?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {previewDocument && (
                <div className="flex items-center justify-between">
                  <span>
                    {previewDocument.size} MB • Created {format(previewDocument.createdAt, 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center">{getStatusBadge(previewDocument.status)}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab} className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-hidden">
              {previewDocument && (
                <div className="h-full">
                  {previewDocument.type === 'pdf' ? (
                    <div className="flex items-center justify-center h-full bg-muted/20">
                      <iframe src={`/api/preview/${previewDocument.id}?type=pdf`} className="w-full h-full" title={previewDocument.name} />
                    </div>
                  ) : previewDocument.type === 'xlsx' || previewDocument.type === 'xls' ? (
                    <div className="flex items-center justify-center h-full bg-muted/20 p-4">
                      <div className="w-full h-full bg-white overflow-auto p-4 rounded border">
                        <div className="text-center text-muted-foreground mb-4">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>Excel Spreadsheet Preview</p>
                        </div>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="border p-2">A</th>
                              <th className="border p-2">B</th>
                              <th className="border p-2">C</th>
                              <th className="border p-2">D</th>
                              <th className="border p-2">E</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                              <tr key={row} className={row % 2 === 0 ? 'bg-muted/20' : ''}>
                                {[1, 2, 3, 4, 5].map((col) => (
                                  <td key={col} className="border p-2 text-center">
                                    {row === 1 && col === 1 ? previewDocument.name.split('.')[0] : `Cell ${String.fromCharCode(64 + col)}${row}`}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : previewDocument.type === 'docx' || previewDocument.type === 'doc' ? (
                    <div className="flex items-center justify-center h-full bg-muted/20 p-4">
                      <div className="w-full h-full bg-white overflow-auto p-8 rounded border">
                        <div className="max-w-3xl mx-auto">
                          <h1 className="text-2xl font-bold mb-4">{previewDocument.name.split('.')[0]}</h1>
                          <p className="mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut
                            eleifend nibh porttitor.
                          </p>
                          <p className="mb-4">
                            Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
                            Praesent id metus massa, ut blandit odio.
                          </p>
                          <h2 className="text-xl font-bold mb-2 mt-6">Document Section</h2>
                          <p className="mb-4">
                            Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis
                            tellus mollis orci, sed rhoncus sapien nunc eget odio.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : previewDocument.type === 'pptx' || previewDocument.type === 'ppt' ? (
                    <div className="flex items-center justify-center h-full bg-muted/20 p-4">
                      <div className="w-full max-w-3xl h-full bg-white overflow-auto rounded border flex flex-col">
                        <div className="bg-orange-500 text-white p-8 text-center">
                          <h1 className="text-3xl font-bold">{previewDocument.name.split('.')[0]}</h1>
                          <p className="mt-4">Presentation Preview</p>
                        </div>
                        <div className="flex-1 p-8 flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                            <p className="text-xl mb-2">Slide Content</p>
                            <ul className="text-left list-disc pl-6 mt-4">
                              <li className="mb-2">Key point one about the presentation</li>
                              <li className="mb-2">Important information to highlight</li>
                              <li className="mb-2">Supporting data and analysis</li>
                              <li className="mb-2">Conclusion and next steps</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">Preview not available</p>
                        <p className="text-sm text-muted-foreground mb-4">This file type ({previewDocument.type.toUpperCase()}) cannot be previewed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="p-6 overflow-auto">
              {previewDocument && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Document Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Name:</dt>
                            <dd>{previewDocument.name}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Type:</dt>
                            <dd>{previewDocument.type.toUpperCase()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Size:</dt>
                            <dd>{previewDocument.size} MB</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Created:</dt>
                            <dd>{format(previewDocument.createdAt, 'MMM d, yyyy')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Status:</dt>
                            <dd>{getStatusBadge(previewDocument.status)}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Location</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Dataroom:</dt>
                            <dd>Series A Fundraising</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium text-muted-foreground">Folder:</dt>
                            <dd>{previewDocument.folderId ? folders.find((f) => f.id === previewDocument.folderId)?.path || 'Unknown' : 'Root'}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t">
            <div className="flex gap-2 w-full justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create Link
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clipboard bar */}
      {clipboard.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-md z-50">
          <Collapsible open={isClipboardExpanded} onOpenChange={setIsClipboardExpanded}>
            <div className="p-2 flex items-center justify-between">
              <div className="flex items-center">
                <Clipboard className="h-5 w-5 mr-2" />
                <span>
                  {clipboard.length} item{clipboard.length !== 1 ? 's' : ''} in clipboard ({clipboard.filter((i) => i.action === 'cut').length} to move,{' '}
                  {clipboard.filter((i) => i.action === 'copy').length} to copy)
                </span>
              </div>
              <div className="flex gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isClipboardExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    {isClipboardExpanded ? 'Hide Details' : 'Show Details'}
                  </Button>
                </CollapsibleTrigger>
                <Button size="sm" onClick={handlePaste}>
                  Paste Here
                </Button>
                <Button size="sm" variant="outline" onClick={handleClearClipboard}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <CollapsibleContent>
              <div className="px-4 pb-4 max-h-48 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Clipboard Contents</div>
                <div className="space-y-1">
                  {clipboard.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        {item.isFolder ? <FolderPlus className="h-4 w-4 text-blue-500 mr-2" /> : getFileIcon(item.type)}
                        <span className="ml-2">{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={item.action === 'cut' ? 'outline' : 'secondary'} className="mr-2">
                          {item.action === 'cut' ? 'Move' : 'Copy'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setClipboard(clipboard.filter((i) => !(i.id === item.id && i.isFolder === item.isFolder)));
                          }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
