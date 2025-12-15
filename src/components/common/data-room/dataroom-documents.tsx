'use client';

import type React from 'react';
import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useDeleteDataroomFolder, useDeleteDocument, useFindManyDataroomFolder, useFindManyDocument } from '@/services/api/hooks';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  Eye,
  FileText,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  Grid3x3,
  Home,
  LinkIcon,
  List,
  MoreHorizontal,
  Pencil,
  PlayIcon,
  Plus,
  Scissors,
  Trash2,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { DataroomFolderDefaultArgs, DataroomFolderWithRelations, DocumentListArgs, DocumentListWithRelations, DocumentWithRelations } from '@/types/zenstackhq/document';
import { getFileIcon } from '@/lib/document-utils';
import useMessage from '@/lib/message';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageLightbox } from '@/components/common/documents/image-lightbox';
import { MediaLightbox } from '@/components/common/documents/media-lightbox';
import { useClipboard } from '@/components/hoc/clipboard-context';
import EmptyState from '@/components/shared/empty-state';
import { SearchDialog } from '@/components/shared/search-dialog';

import { DocumentDownloadButton } from '../documents/document-viewer';

type BreadCrumbType = { id: string | null; name: string };
type ViewMode = 'grid' | 'list';

interface DataroomDocumentsProps {
  dataroomId: string;
  tenantId: string;
  callbackUrl: string;
  currentFolderId?: string | null;
  onFolderChange?: (folderId: string | null) => void;
}

export function DataroomDocuments({ dataroomId, tenantId, callbackUrl, currentFolderId: externalCurrentFolderId, onFolderChange }: DataroomDocumentsProps) {
  const router = useRouter();
  const t = useTranslations('admin.dataroom.view');
  const message = useMessage();
  const { addToClipboard, handlePaste } = useClipboard();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: deleteFolder } = useDeleteDataroomFolder();

  const { data: documents = [], isLoading: isDocumentsLoading } = useFindManyDocument({
    ...DocumentListArgs,
    where: { tenantId, dataroomId },
  });

  const { data: folders = [], isLoading: isFoldersLoading } = useFindManyDataroomFolder({
    ...DataroomFolderDefaultArgs,
    where: { tenantId, dataroomId },
  });

  const [pending, startTransition] = useTransition();
  const [internalCurrentFolderId, setInternalCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; documentId?: string } | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; contentType: string; title: string; documentId?: string } | null>(null);
  const [mediaList, setMediaList] = useState<Array<{ url: string; contentType: string }>>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Use external state if provided, otherwise use internal state
  const currentFolderId = externalCurrentFolderId !== undefined ? externalCurrentFolderId : internalCurrentFolderId;
  const setCurrentFolderId = useCallback(
    (folderId: string | null) => {
      if (onFolderChange) {
        onFolderChange(folderId);
      } else {
        setInternalCurrentFolderId(folderId);
      }
    },
    [onFolderChange]
  );

  // Memoized helper functions
  const getCurrentFolders = useMemo(() => {
    return folders.filter((folder) => folder.parentId === currentFolderId);
  }, [folders, currentFolderId]);

  const getCurrentDocuments = useMemo(() => {
    return documents.filter((doc) => doc.folderId === currentFolderId);
  }, [documents, currentFolderId]);

  // Memoized: Combine folders and documents for unified display
  const allItems = useMemo(() => {
    const folderItems = getCurrentFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      type: 'folder' as const,
      data: folder,
      modifiedAt: folder.createdAt,
    }));

    const documentItems = getCurrentDocuments.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: 'document' as const,
      data: doc,
      modifiedAt: doc.createdAt,
      fileType: doc.type,
    }));

    const items = [...folderItems, ...documentItems];

    // Sort items
    return items.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'modified') {
        comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      } else if (sortBy === 'type') {
        if (a.type !== b.type) {
          comparison = a.type === 'folder' ? -1 : 1;
        } else {
          comparison = a.name.localeCompare(b.name);
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [getCurrentFolders, getCurrentDocuments, sortBy, sortOrder]);

  const breadcrumbs = useMemo(() => {
    if (currentFolderId === null) {
      return [{ id: null, name: t('breadcrumbs.root') }];
    }

    const breadcrumbsList: Array<BreadCrumbType> = [{ id: null, name: t('breadcrumbs.root') }];
    let currentFolder = folders.find((folder) => folder.id === currentFolderId);

    while (currentFolder) {
      breadcrumbsList.push({ id: currentFolder.id, name: currentFolder.name });
      currentFolder = folders.find((folder) => folder.id === currentFolder?.parentId);
    }

    return breadcrumbsList;
  }, [currentFolderId, folders, t]);

  // Memoized callbacks for document actions
  const handleDeleteDocument = useCallback(
    async (id: string) => {
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
    },
    [message, t, deleteDocument, startTransition]
  );

  // Folder actions
  const handleDeleteFolder = useCallback(
    async (id: string) => {
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
    },
    [message, t, deleteFolder, startTransition]
  );

  // Clipboard actions
  const handleCutDocument = useCallback(
    (doc: DocumentListWithRelations) => {
      addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'cut' });
      toast.success(t('clipboard.documentCut', { name: doc.name }));
    },
    [addToClipboard, t]
  );

  const handleCutFolder = useCallback(
    (folder: DataroomFolderWithRelations) => {
      addToClipboard({ id: folder.id, name: folder.name, type: 'folder', isFolder: true, action: 'cut' });
      toast.success(t('clipboard.folderCut', { name: folder.name }));
    },
    [addToClipboard, t]
  );

  const handleCopyDocument = useCallback(
    (doc: DocumentListWithRelations) => {
      addToClipboard({ id: doc.id, name: doc.name, type: doc.type, isFolder: false, action: 'copy' });
      toast.success(t('clipboard.documentCopied', { name: doc.name }));
    },
    [addToClipboard, t]
  );

  const navigateToFolder = useCallback(
    (folderId: string | null) => {
      setCurrentFolderId(folderId);
    },
    [setCurrentFolderId]
  );

  const handleSort = useCallback(
    (field: 'name' | 'modified' | 'type') => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
    },
    [sortBy, sortOrder]
  );

  // Helper function to check if a document is an image
  const isImage = useCallback((contentType: string | null | undefined) => {
    return contentType?.startsWith('image/') ?? false;
  }, []);

  // Helper function to check if a document is a video
  const isVideo = useCallback((contentType: string | null | undefined) => {
    return contentType?.startsWith('video/') ?? false;
  }, []);

  // Helper function to check if a document is an audio file
  const isAudio = useCallback((contentType: string | null | undefined) => {
    return contentType?.startsWith('audio/') ?? false;
  }, []);

  // Handle document click - open lightbox for images/videos/audio, navigate for others
  const handleDocumentClick = useCallback(
    (doc: DocumentListWithRelations) => {
      if (isImage(doc.contentType)) {
        setSelectedImage({ url: doc.file, title: doc.name, documentId: doc.id });
      } else if (isVideo(doc.contentType) || isAudio(doc.contentType)) {
        // Build list of all videos and audio for navigation
        const allMedia = allItems
          .filter((item) => {
            if (item.type !== 'document') return false;
            const docItem = item.data as DocumentListWithRelations;
            return docItem.contentType && (docItem.contentType.startsWith('video/') || docItem.contentType.startsWith('audio/'));
          })
          .map((item) => {
            const docItem = item.data as DocumentListWithRelations;
            return { url: docItem.file, contentType: docItem.contentType || '' };
          });
        const mediaIndex = allMedia.findIndex((m) => m.url === doc.file);
        setMediaList(allMedia);
        setCurrentMediaIndex(mediaIndex >= 0 ? mediaIndex : 0);
        setSelectedMedia({ url: doc.file, contentType: doc.contentType || '', title: doc.name, documentId: doc.id });
      } else {
        // Navigate to document viewer
        router.push(`/admin/${tenantId}/links-and-documents/documents/${doc.id}?documentId=${doc.id}&dataroomId=${dataroomId}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    },
    [isImage, isVideo, isAudio, router, tenantId, dataroomId, callbackUrl, allItems]
  );

  if (isFoldersLoading || isDocumentsLoading) {
    return (
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-6">
          <div className="h-[400px] w-full animate-pulse rounded bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ImageLightbox
        open={selectedImage !== null}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        title={selectedImage?.title}
        viewUrl={
          selectedImage?.documentId
            ? `/admin/${tenantId}/links-and-documents/documents/${selectedImage.documentId}?documentId=${selectedImage.documentId}&dataroomId=${dataroomId}&callbackUrl=${encodeURIComponent(callbackUrl)}`
            : undefined
        }
      />
      <MediaLightbox
        open={selectedMedia !== null && (isVideo(selectedMedia.contentType) || isAudio(selectedMedia.contentType))}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
        mediaUrl={selectedMedia?.url || ''}
        contentType={selectedMedia?.contentType || ''}
        title={selectedMedia?.title}
        viewUrl={
          selectedMedia?.documentId
            ? `/admin/${tenantId}/links-and-documents/documents/${selectedMedia.documentId}?documentId=${selectedMedia.documentId}&dataroomId=${dataroomId}&callbackUrl=${encodeURIComponent(callbackUrl)}`
            : undefined
        }
        mediaList={mediaList}
        currentIndex={currentMediaIndex}
        onNavigate={(index) => {
          if (mediaList[index]) {
            setCurrentMediaIndex(index);
            const item = allItems.find((item) => item.type === 'document' && (item.data as DocumentListWithRelations).file === mediaList[index]?.url);
            if (item && item.type === 'document') {
              const doc = item.data as DocumentListWithRelations;
              setSelectedMedia({ url: doc.file, contentType: doc.contentType || '', title: doc.name, documentId: doc.id });
            }
          }
        }}
      />
      <ContextMenu>
        <ContextMenuTrigger className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none bg-transparent">
            {/* Top Bar - Google Drive Style */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {/* Breadcrumbs */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium hover:bg-accent transition-colors" onClick={() => navigateToFolder(null)}>
                    <Home className="h-4 w-4 mr-1.5" />
                    {t('breadcrumbs.root')}
                  </Button>
                  {breadcrumbs.slice(1).map((breadcrumb, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-sm font-medium hover:bg-accent max-w-[200px] truncate transition-colors"
                        onClick={() => navigateToFolder(breadcrumb.id)}>
                        {breadcrumb.name}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <SearchDialog />
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent transition-colors" asChild title={t('actions.newFolder')}>
                    <Link
                      href={{
                        pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                        params: { tenantId },
                        query: { currentFolderId, dataroomId, callbackUrl },
                      }}>
                      <FolderPlus className="h-4 w-4" />
                      <span className="sr-only">{t('actions.newFolder')}</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent transition-colors" asChild title={t('actions.uploadDocuments')}>
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
              </div>

              {/* Filters and Sort Bar - Google Drive Style */}
              <div className="flex items-center justify-between px-4 py-2 bg-background/30">
                <div className="flex items-center gap-4">
                  {/* Current location dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors">
                        {breadcrumbs[breadcrumbs.length - 1].name}
                        <ChevronDown className="h-3 w-3 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigateToFolder(null)}>{t('breadcrumbs.root')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Filter buttons */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors">
                        {t('filters.type.label')}
                        <ChevronDown className="h-3 w-3 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSort('type')}>{t('filters.type.all')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('type')}>{t('filters.type.folders')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('type')}>{t('filters.type.documents')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors">
                        {t('filters.people.label')}
                        <ChevronDown className="h-3 w-3 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>{t('filters.people.all')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors">
                        {t('filters.modified.label')}
                        <ChevronDown className="h-3 w-3 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSort('modified')}>{t('filters.modified.anyTime')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('modified')}>{t('filters.modified.today')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('modified')}>{t('filters.modified.yesterday')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('modified')}>{t('filters.modified.last7Days')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('modified')}>{t('filters.modified.last30Days')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors">
                        {t('filters.source.label')}
                        <ChevronDown className="h-3 w-3 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>{t('filters.source.all')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort by Name */}
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-normal hover:bg-accent transition-colors" onClick={() => handleSort('name')}>
                    {t('filters.name')}
                    {sortBy === 'name' && <ArrowUpDown className={cn('h-3 w-3 ml-1.5 transition-transform', sortOrder === 'desc' && 'rotate-180')} />}
                  </Button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border-l pl-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-8 w-8 transition-colors', viewMode === 'list' && 'bg-accent')}
                    onClick={() => setViewMode('list')}
                    title={t('filters.viewMode.list')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-8 w-8 transition-colors', viewMode === 'grid' && 'bg-accent')}
                    onClick={() => setViewMode('grid')}
                    title={t('filters.viewMode.grid')}>
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <CardContent className="overflow-hidden flex-1 flex flex-col p-0">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6">
                  {allItems.length === 0 ? (
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
                            query: { currentFolderId, dataroomId, callbackUrl },
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
                  ) : viewMode === 'grid' ? (
                    // Grid View - Google Drive Style
                    <div className="grid grid-cols-[repeat(auto-fill,160px)] gap-3 sm:gap-4 max-w-full justify-start">
                      {allItems.map((item) =>
                        item.type === 'folder' ? (
                          <FolderGridItem
                            key={item.id}
                            item={item}
                            onNavigate={navigateToFolder}
                            onCut={handleCutFolder}
                            onDelete={handleDeleteFolder}
                            pending={pending}
                            tenantId={tenantId}
                            dataroomId={dataroomId}
                            translations={{
                              moreOptions: t('actions.moreOptions'),
                              rename: t('actions.rename'),
                              cut: t('actions.cut'),
                              delete: t('actions.delete'),
                              deleting: t('actions.deleting'),
                            }}
                          />
                        ) : (
                          <DocumentGridItem
                            key={item.id}
                            item={item}
                            onCut={handleCutDocument}
                            onCopy={handleCopyDocument}
                            onDelete={handleDeleteDocument}
                            onImageClick={handleDocumentClick}
                            pending={pending}
                            tenantId={tenantId}
                            dataroomId={dataroomId}
                            callbackUrl={callbackUrl}
                            translations={{
                              moreOptions: t('actions.moreOptions'),
                              view: t('actions.view'),
                              cut: t('actions.cut'),
                              copy: t('actions.copy'),
                              delete: t('actions.delete'),
                              deleting: t('actions.deleting'),
                            }}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    // List View - Google Drive Style
                    <div className="border rounded-lg divide-y divide-border bg-card overflow-hidden">
                      {allItems.map((item) => (
                        <ContextMenu key={item.id}>
                          <ContextMenuTrigger className="w-full">
                            <div
                              className={cn(
                                'group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3',
                                'hover:bg-accent/50 transition-colors',
                                'focus-within:bg-accent/50',
                                (item.type === 'folder' || item.type === 'document') && 'cursor-pointer',
                                'min-w-0 overflow-hidden'
                              )}
                              onClick={() => {
                                if (item.type === 'folder') {
                                  navigateToFolder(item.id);
                                } else if (item.type === 'document') {
                                  const doc = item.data as DocumentListWithRelations;
                                  handleDocumentClick(doc);
                                }
                              }}>
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                                  {item.type === 'folder' ? (
                                    <FolderOpen className="h-8 w-8 text-[#4285F4]" />
                                  ) : (
                                    (() => {
                                      if (item.type === 'document') {
                                        const doc = item.data as DocumentListWithRelations;
                                        const isImageFile = isImage(doc.contentType);
                                        const isVideoFile = isVideo(doc.contentType);
                                        const isAudioFile = isAudio(doc.contentType);
                                        if (isImageFile) {
                                          return (
                                            <div className="h-10 w-10 rounded overflow-hidden border border-border bg-muted flex-shrink-0">
                                              {/*eslint-disable-next-line @next/next/no-img-element*/}
                                              <img src={doc.file || '/placeholder.svg'} alt={doc.name} className="h-full w-full object-cover" loading="lazy" />
                                            </div>
                                          );
                                        }
                                        if (isVideoFile) {
                                          return (
                                            <div className="h-10 w-10 rounded overflow-hidden border border-border bg-muted flex-shrink-0 relative">
                                              {/*eslint-disable-next-line @next/next/no-img-element*/}
                                              <video
                                                src={doc.file}
                                                className="h-full w-full object-cover"
                                                preload="metadata"
                                                muted
                                                onLoadedMetadata={(e) => {
                                                  const video = e.currentTarget;
                                                  if (video.videoWidth > 0 && video.videoHeight > 0) {
                                                    video.currentTime = 1;
                                                  }
                                                }}>
                                                <source src={doc.file} type={doc.contentType || ''} />
                                              </video>
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <PlayIcon className="h-3 w-3 text-white drop-shadow-lg" />
                                              </div>
                                            </div>
                                          );
                                        }
                                        if (isAudioFile) {
                                          return (
                                            <div className="h-10 w-10 rounded overflow-hidden border border-border bg-muted flex-shrink-0 relative flex items-center justify-center">
                                              <PlayIcon className="h-5 w-5 text-white drop-shadow-lg" />
                                            </div>
                                          );
                                        }
                                        return getFileIcon(doc.type);
                                      }
                                      return null;
                                    })()
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors" title={item.name}>
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground truncate">{format(item.modifiedAt, 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {item.type === 'document' && (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                      <Link
                                        href={{
                                          pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
                                          query: { documentId: item.id, dataroomId, callbackUrl },
                                          params: { tenantId, slug: item.id },
                                        }}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">{t('actions.view')}</span>
                                      </Link>
                                    </Button>
                                    <DocumentDownloadButton fileUrl={(item.data as DocumentListWithRelations).file} title={`${item.name}.${item.fileType}`} />
                                  </>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">{t('actions.moreOptions')}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    {item.type === 'folder' ? (
                                      <>
                                        <DropdownMenuItem asChild>
                                          <Link
                                            href={{
                                              pathname: '/admin/[tenantId]/links-and-documents/folders/[slug]/edit',
                                              params: { tenantId, slug: item.id },
                                              query: { dataroomId },
                                            }}
                                            onClick={(e) => e.stopPropagation()}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            {t('actions.rename')}
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCutFolder(item.data as DataroomFolderWithRelations);
                                          }}>
                                          <Scissors className="mr-2 h-4 w-4" />
                                          {t('actions.cut')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          disabled={pending}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFolder(item.id);
                                          }}
                                          className="text-destructive focus:text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          {pending ? t('actions.deleting') : t('actions.delete')}
                                        </DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCutDocument(item.data as DocumentListWithRelations);
                                          }}>
                                          <Scissors className="mr-2 h-4 w-4" />
                                          {t('actions.cut')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyDocument(item.data as DocumentListWithRelations);
                                          }}>
                                          <Copy className="mr-2 h-4 w-4" />
                                          {t('actions.copy')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          disabled={pending}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDocument(item.id);
                                          }}
                                          className="text-destructive focus:text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          {pending ? t('actions.deleting') : t('actions.delete')}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </ContextMenuTrigger>
                        </ContextMenu>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => handlePaste(dataroomId, currentFolderId)}>
            <Clipboard className="mr-2 h-4 w-4" />
            {t('actions.paste')}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/links-and-documents/folders/new',
                params: { tenantId },
                query: { currentFolderId, dataroomId, callbackUrl },
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
    </>
  );
}

// Memoized components for better performance
const FolderGridItem = memo(
  ({
    item,
    onNavigate,
    onCut,
    onDelete,
    pending,
    tenantId,
    dataroomId,
    translations,
  }: {
    item: { id: string; name: string; data: DataroomFolderWithRelations };
    onNavigate: (id: string) => void;
    onCut: (folder: DataroomFolderWithRelations) => void;
    onDelete: (id: string) => void;
    pending: boolean;
    tenantId: string;
    dataroomId: string;
    translations: {
      moreOptions: string;
      rename: string;
      cut: string;
      delete: string;
      deleting: string;
    };
  }) => (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <div
          className={cn(
            'group relative flex flex-col items-center p-2 rounded-lg border border-transparent',
            'hover:border-border hover:bg-accent/50 hover:shadow-sm',
            'transition-all duration-200 cursor-pointer',
            'focus-within:border-border focus-within:bg-accent/50',
            'w-full max-w-full overflow-hidden'
          )}
          onClick={() => onNavigate(item.id)}>
          <div className="relative mb-1.5 w-full flex items-center justify-center h-[80px]">
            <FolderOpen className="h-10 w-10 text-[#4285F4] transition-transform group-hover:scale-105" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100', 'transition-opacity bg-background/95 backdrop-blur-sm shadow-sm hover:bg-accent rounded-full')}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{translations.moreOptions}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={{
                      pathname: '/admin/[tenantId]/links-and-documents/folders/[slug]/edit',
                      params: { tenantId, slug: item.id },
                      query: { dataroomId },
                    }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {translations.rename}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCut(item.data)}>
                  <Scissors className="mr-2 h-4 w-4" />
                  {translations.cut}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={pending} onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {pending ? translations.deleting : translations.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full text-center min-h-[1.5rem] max-w-full px-1">
            <p className="text-xs font-medium truncate w-full leading-tight" title={item.name}>
              {item.name}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
    </ContextMenu>
  )
);
FolderGridItem.displayName = 'FolderGridItem';

const DocumentGridItem = memo(
  ({
    item,
    onCut,
    onCopy,
    onDelete,
    onImageClick,
    pending,
    tenantId,
    dataroomId,
    callbackUrl,
    translations,
  }: {
    item: { id: string; name: string; fileType: string; data: DocumentListWithRelations };
    onCut: (doc: DocumentListWithRelations) => void;
    onCopy: (doc: DocumentListWithRelations) => void;
    onDelete: (id: string) => void;
    onImageClick: (doc: DocumentListWithRelations) => void;
    pending: boolean;
    tenantId: string;
    dataroomId: string;
    callbackUrl: string;
    translations: {
      moreOptions: string;
      view: string;
      cut: string;
      copy: string;
      delete: string;
      deleting: string;
    };
  }) => {
    const doc = item.data as DocumentListWithRelations;
    const isImageFile = doc.contentType?.startsWith('image/') ?? false;
    const isVideoFile = doc.contentType?.startsWith('video/') ?? false;
    const isAudioFile = doc.contentType?.startsWith('audio/') ?? false;

    return (
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <div
            className={cn(
              'group relative flex flex-col items-center p-2 rounded-lg border border-transparent',
              'hover:border-border hover:bg-accent/50 hover:shadow-sm',
              'transition-all duration-200 cursor-pointer',
              'focus-within:border-border focus-within:bg-accent/50',
              'w-full max-w-full overflow-hidden'
            )}
            onClick={() => onImageClick(doc)}>
            <div className="relative mb-1.5 w-full flex items-center justify-center h-[80px]">
              {isImageFile ? (
                <div className="h-[80px] w-[80px] rounded overflow-hidden border border-border bg-muted flex-shrink-0">
                  {/*eslint-disable-next-line @next/next/no-img-element*/}
                  <img src={doc.file || '/placeholder.svg'} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ) : isVideoFile ? (
                <div className="h-[80px] w-[80px] rounded overflow-hidden border border-border bg-muted flex-shrink-0 relative">
                  {/*eslint-disable-next-line @next/next/no-img-element*/}
                  <video
                    src={doc.file}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    onLoadedMetadata={(e) => {
                      // Try to capture a frame as thumbnail
                      const video = e.currentTarget;
                      if (video.videoWidth > 0 && video.videoHeight > 0) {
                        video.currentTime = 1; // Seek to 1 second for thumbnail
                      }
                    }}>
                    <source src={doc.file} type={doc.contentType || ''} />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayIcon className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : isAudioFile ? (
                <div className="h-[80px] w-[80px] rounded overflow-hidden border border-border bg-muted flex-shrink-0 relative flex items-center justify-center">
                  <PlayIcon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              ) : (
                <div className="h-[80px] w-[80px] flex items-center justify-center flex-shrink-0">
                  <div className="flex items-center justify-center w-full h-full">{getFileIcon(doc.type)}</div>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100', 'transition-opacity bg-background/90 backdrop-blur-sm shadow-sm hover:bg-accent')}>
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">{translations.moreOptions}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem asChild>
                    <Link
                      href={{
                        pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]',
                        query: { documentId: item.id, dataroomId, callbackUrl },
                        params: { tenantId, slug: item.id },
                      }}
                      onClick={(e) => e.stopPropagation()}>
                      <Eye className="mr-2 h-4 w-4" />
                      {translations.view}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCut(item.data);
                    }}>
                    <Scissors className="mr-2 h-4 w-4" />
                    {translations.cut}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(item.data);
                    }}>
                    <Copy className="mr-2 h-4 w-4" />
                    {translations.copy}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={pending}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {pending ? translations.deleting : translations.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-full text-center min-h-[1.5rem] max-w-full px-1">
              <p className="text-xs font-medium truncate w-full leading-tight" title={item.name}>
                {item.name}
              </p>
            </div>
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    );
  }
);
DocumentGridItem.displayName = 'DocumentGridItem';
