'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { useDeleteDataroomFolder, useDeleteDocument, useFindManyDataroomFolder, useFindManyDocument } from '@/services/api/hooks';
import { format } from 'date-fns';
import { ChevronRight, Clipboard, Copy, Download, Eye, FileText, FolderClosed, FolderPlus, Home, LinkIcon, MoreHorizontal, Pencil, Plus, Scissors, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import useMessage from '@/lib/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClipboard } from '@/components/hoc/clipboard-context';
import EmptyState from '@/components/shared/empty-state';

type Document = { id: string; name: string; type: string; folderId: string | null; createdAt: Date; size: number; status: string };
type Folder = { id: string; name: string; parentId: string | null; documentCount: number; path: string };

interface DataroomDocumentsProps {
  dataroomId: string;
  tenantId: string;
  callbackUrl: string;
}

export function DataroomDocuments({ dataroomId, tenantId, callbackUrl }: DataroomDocumentsProps) {
  const message = useMessage();
  const { addToClipboard, handlePaste } = useClipboard();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: deleteFolder } = useDeleteDataroomFolder();

  const { data: documents = [], isLoading: isDocumentsLoading } = useFindManyDocument({ where: { tenantId, dataroomId } });
  const { data: folders = [], isLoading: isFoldersLoading } = useFindManyDataroomFolder({ where: { tenantId, dataroomId } });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Helper functions
  const getCurrentFolders = () => folders.filter((folder) => folder.parentId === currentFolderId);
  const getCurrentDocuments = () => {
    const docs = documents.filter((doc) => doc.folderId === currentFolderId);
    return searchQuery ? docs.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase())) : docs;
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

    return breadcrumbs;
  };

  // Document actions
  const handleDeleteDocument = (id: string) => {
    const isConfirmed = message.confirm('Are you sure you want to delete this document? This action cannot be undone.', {
      title: 'Delete Document',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!isConfirmed) return;

    startTransition(() => {
      toast.promise(deleteDocument({ where: { id } }), {
        loading: 'Deleting document...',
        success: 'Document deleted successfully',
        error: (err) => `Error deleting document: ${err.message}`,
      });
    });
  };

  // Folder actions
  const handleDeleteFolder = (id: string) => {
    const isConfirmed = message.confirm('Are you sure you want to delete this folder? This action cannot be undone.', {
      title: 'Delete Folder',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    startTransition(() => {
      toast.promise(deleteFolder({ where: { id } }), {
        loading: 'Deleting folder...',
        success: 'Folder deleted successfully',
        error: (err) => `Error deleting folder: ${err.message}`,
      });
    });
  };

  // Clipboard actions
  const handleCutDocument = (doc: Document) => {
    addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'cut' });
    toast.success(`Document "${doc.name}" ready to move`);
  };

  const handleCutFolder = (folder: Folder) => {
    addToClipboard({ id: folder.id, name: folder.name, type: 'folder', isFolder: true, action: 'cut' });
    toast.success(`Folder "${folder.name}" ready to move`);
  };

  const handleCopyDocument = (doc: Document) => {
    addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'copy' });
    toast.success(`Document "${doc.name}" copied to clipboard`);
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  // UI helpers
  const getFileIcon = (type: string) => {
    const iconMap: { [key: string]: React.JSX.Element } = {
      'application/pdf': <FileText className="h-6 w-6 text-red-500" />,
      'text/plain': <FileText className="h-6 w-6 text-gray-500" />,
      default: <FileText className="h-6 w-6 text-blue-500" />,
    };
    return iconMap[type] || iconMap.default;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      uploaded: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return <Badge className={`text-xs ${statusMap[status]}`}>{status}</Badge>;
  };

  const breadcrumbs = getBreadcrumbs();

  if (isFoldersLoading || isDocumentsLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="h-6 w-36 animate-pulse rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full animate-pulse rounded bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-sm mt-1">
              <Button variant="link" className="p-0 h-auto font-medium" onClick={() => navigateToFolder(null)}>
                <Home className="h-3.5 w-3.5 mr-1" />
                Root
              </Button>
              {breadcrumbs.slice(1).map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground" />
                  <Button variant="link" className="p-0 h-auto font-medium" onClick={() => navigateToFolder(breadcrumb.id)}>
                    {breadcrumb.name}
                  </Button>
                </div>
              ))}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild title="New Folder">
                <Link
                  href={{
                    pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                    params: { tenantId },
                    query: { currentFolderId, dataroomId },
                  }}>
                  <FolderPlus className="h-4 w-4" />
                  <span className="sr-only">New Folder</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild title="Upload documents">
                <Link
                  href={{
                    params: { tenantId },
                    pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
                    query: { folderId: currentFolderId, dataroomId, callbackUrl },
                  }}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Upload documents</span>
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
                    href: {
                      pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                      params: { tenantId },
                      query: { currentFolderId, dataroomId },
                    },
                  },
                  {
                    icon: Plus,
                    label: 'Upload documents',
                    href: {
                      params: { tenantId },
                      pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
                      query: { folderId: currentFolderId, dataroomId, callbackUrl },
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
                              <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => setCurrentFolderId(folder.id)}>
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
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={{
                                        pathname: '/admin/[tenantId]/links-and-documents/folders/[slug]/edit',
                                        params: { tenantId, slug: folder.id },
                                        query: { dataroomId },
                                      }}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Rename
                                    </Link>
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
                                  <p className="font-medium hover:underline cursor-pointer">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {doc.size} MB • {format(doc.createdAt, 'MMM d, yyyy')}
                                    </span>
                                    {getStatusBadge(doc.status)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
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
                                      query: { documentId: doc.id, dataroomId, callbackUrl },
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
        <ContextMenuItem onClick={() => handlePaste(currentFolderId)}>
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <Link
            href={{
              pathname: '/admin/[tenantId]/links-and-documents/folders/new',
              params: { tenantId },
              query: { currentFolderId, dataroomId },
            }}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Link>
        </ContextMenuItem>
        <ContextMenuItem asChild>
          <Link
            href={{
              pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
              params: { tenantId },
              query: { folderId: currentFolderId, dataroomId, callbackUrl },
            }}>
            <Plus className="mr-2 h-4 w-4" />
            Upload documents
          </Link>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
