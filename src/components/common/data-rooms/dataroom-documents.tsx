'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { useDeleteDataroomFolder, useDeleteDocument, useFindManyDataroomFolder, useFindManyDocument } from '@/services/api/hooks';
import { format } from 'date-fns';
import { ChevronRight, Clipboard, Copy, Download, Eye, FileText, FolderClosed, FolderPlus, Home, LinkIcon, MoreHorizontal, Pencil, Plus, Scissors, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { DataroomFolderDefaultArgs, DataroomFolderWithRelations, DocumentDefaultArgs, DocumentWithRelations } from '@/types/prisma/document';
import { getFileIcon } from '@/lib/document-utils';
import useMessage from '@/lib/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClipboard } from '@/components/hoc/clipboard-context';
import EmptyState from '@/components/shared/empty-state';
import { SearchDialog } from '@/components/shared/search-dialog';

type BreadCrumbType = { id: string | null; name: string };

interface DataroomDocumentsProps {
  dataroomId: string;
  tenantId: string;
  callbackUrl: string;
}

export function DataroomDocuments({ dataroomId, tenantId, callbackUrl }: DataroomDocumentsProps) {
  const t = useTranslations('admin.dataroom.view');
  const message = useMessage();
  const { addToClipboard, handlePaste } = useClipboard();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: deleteFolder } = useDeleteDataroomFolder();

  const { data: documents = [], isLoading: isDocumentsLoading } = useFindManyDocument({
    ...DocumentDefaultArgs,
    where: { tenantId, dataroomId },
  });

  const { data: folders = [], isLoading: isFoldersLoading } = useFindManyDataroomFolder({
    ...DataroomFolderDefaultArgs,
    where: { tenantId, dataroomId },
  });

  const [pending, startTransition] = useTransition();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Helper functions
  const getCurrentFolders = () => folders.filter((folder) => folder.parentId === currentFolderId);
  const getCurrentDocuments = () => documents.filter((doc) => doc.folderId === currentFolderId);

  const getBreadcrumbs = () => {
    if (currentFolderId === null) {
      return [{ id: null, name: t('breadcrumbs.root') }];
    }

    const breadcrumbs: Array<BreadCrumbType> = [{ id: null, name: t('breadcrumbs.root') }];
    let currentFolder = folders.find((folder) => folder.id === currentFolderId);

    while (currentFolder) {
      breadcrumbs.push({ id: currentFolder.id, name: currentFolder.name });
      currentFolder = folders.find((folder) => folder.id === currentFolder?.parentId);
    }

    return breadcrumbs;
  };

  // Document actions
  const handleDeleteDocument = async (id: string) => {
    const isConfirmed = await message.confirm(t('deleteDocument.confirmMessage'), {
      title: t('deleteDocument.title'),
      confirmText: t('deleteDocument.confirmText'),
      cancelText: t('deleteDocument.cancelText'),
    });

    if (!isConfirmed) return;

    startTransition(() => {
      toast.promise(deleteDocument({ where: { id } }), {
        loading: t('deleteDocument.loading'),
        success: t('deleteDocument.success'),
        error: (err) => t('deleteDocument.error', { error: err.message }),
      });
    });
  };

  // Folder actions
  const handleDeleteFolder = async (id: string) => {
    const isConfirmed = await message.confirm(t('deleteFolder.confirmMessage'), {
      title: t('deleteFolder.title'),
      confirmText: t('deleteFolder.confirmText'),
      cancelText: t('deleteFolder.cancelText'),
    });
    if (!isConfirmed) return;

    startTransition(() => {
      toast.promise(deleteFolder({ where: { id } }), {
        loading: t('deleteFolder.loading'),
        success: t('deleteFolder.success'),
        error: (err) => t('deleteFolder.error', { error: err.message }),
      });
    });
  };

  // Clipboard actions
  const handleCutDocument = (doc: DocumentWithRelations) => {
    addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'cut' });
    toast.success(t('clipboard.documentCut', { name: doc.name }));
  };

  const handleCutFolder = (folder: DataroomFolderWithRelations) => {
    addToClipboard({ id: folder.id, name: folder.name, type: 'folder', isFolder: true, action: 'cut' });
    toast.success(t('clipboard.folderCut', { name: folder.name }));
  };

  const handleCopyDocument = (doc: DocumentWithRelations) => {
    addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'copy' });
    toast.success(t('clipboard.documentCopied', { name: doc.name }));
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
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
      <ContextMenuTrigger className="w-full flex flex-col pb-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-sm mt-1">
              <Button variant="link" className="p-0 h-auto font-medium cursor-pointer" onClick={() => navigateToFolder(null)}>
                <Home className="h-3.5 w-3.5 mr-1" />
                {t('breadcrumbs.root')}
              </Button>
              {breadcrumbs.slice(1).map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground" />
                  <Button variant="link" className="p-0 h-auto font-medium cursor-pointer" onClick={() => navigateToFolder(breadcrumb.id)}>
                    {breadcrumb.name}
                  </Button>
                </div>
              ))}
            </CardTitle>
            <div className="flex gap-2">
              <SearchDialog />
              <Button variant="ghost" size="icon" asChild title={t('actions.newFolder')}>
                <Link
                  href={{
                    pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                    params: { tenantId },
                    query: { currentFolderId, dataroomId },
                  }}>
                  <FolderPlus className="h-4 w-4" />
                  <span className="sr-only">{t('actions.newFolder')}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild title={t('actions.uploadDocuments')}>
                <Link
                  href={{
                    params: { tenantId },
                    pathname: '/admin/[tenantId]/links-and-documents/documents/upload',
                    query: { folderId: currentFolderId, dataroomId, callbackUrl },
                  }}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">{t('actions.uploadDocuments')}</span>
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {getCurrentFolders().length === 0 && getCurrentDocuments().length === 0 ? (
              <EmptyState
                icons={[FileText, LinkIcon, FolderClosed]}
                title={t('emptyState.title')}
                description={t('emptyState.description')}
                actions={[
                  {
                    icon: FolderPlus,
                    label: t('actions.newFolder'),
                    href: {
                      pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                      params: { tenantId },
                      query: { currentFolderId, dataroomId },
                    },
                  },
                  {
                    icon: Plus,
                    label: t('actions.uploadDocuments'),
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
                    <h3 className="text-sm font-medium mb-2">{t('sections.folders')}</h3>
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
                                    {folder._count.documents} {t('sections.documents', { count: folder._count.documents })}
                                  </p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">{t('actions.moreOptions')}</span>
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
                                      {t('actions.rename')}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCutFolder(folder)}>
                                    <Scissors className="mr-2 h-4 w-4" />
                                    {t('actions.cut')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled={pending} onClick={() => handleDeleteFolder(folder.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {pending ? t('actions.deleting') : t('actions.delete')}
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
                    <h3 className="text-sm font-medium mb-2">{t('sections.documents')}</h3>
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
                                      {doc.versions?.[0].fileSize ? (doc.versions[0].fileSize / (1024 * 1024)).toFixed(2) : 'N/A'} MB • {format(doc.createdAt, 'MMM d, yyyy')}
                                    </span>
                                    <Badge className="text-xs" variant="outline">
                                      {doc.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link
                                    href={{
                                      pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
                                      query: { documentId: doc.id, dataroomId, callbackUrl },
                                      params: { tenantId, slug: doc.id },
                                    }}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">{t('actions.view')}</span>
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">{t('actions.download')}</span>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link
                                    href={{
                                      pathname: '/admin/[tenantId]/links-and-documents/links/new',
                                      query: { documentId: doc.id, dataroomId, callbackUrl },
                                      params: { tenantId },
                                    }}>
                                    <LinkIcon className="h-4 w-4" />
                                    <span className="sr-only">{t('actions.createLink')}</span>
                                  </Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">{t('actions.moreOptions')}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleCutDocument(doc)}>
                                      <Scissors className="mr-2 h-4 w-4" />
                                      {t('actions.cut')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCopyDocument(doc)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      {t('actions.copy')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={pending} onClick={() => handleDeleteDocument(doc.id)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {pending ? t('actions.deleting') : t('actions.delete')}
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
          {t('actions.paste')}
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
            {t('actions.newFolder')}
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
            {t('actions.uploadDocuments')}
          </Link>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
