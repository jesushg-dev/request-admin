'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import { useCountDocumentVersion, useFindManyDocumentVersion, useUpdateManyDocumentVersion } from '@/services/api/hooks';
import { format } from 'date-fns';
import { CheckCircle, Clock, Download, Eye, FileText, Layers, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { downloadFile, getFileIcon } from '@/lib/document-utils';
import { formatBytes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { EmptyCard } from '@/components/uploader/empty-card';

interface DocumentVersionHistoryProps {
  documentId: string;
  documentName: string;
}

export function DocumentVersionHistory({ documentId, documentName }: DocumentVersionHistoryProps) {
  const t = useTranslations('admin.document.view.versionHistory');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: versions = [], isLoading } = useFindManyDocumentVersion({
    where: { documentId },
    orderBy: { versionNumber: 'desc' },
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
  });

  const { data: totalCount = 0 } = useCountDocumentVersion({
    where: { documentId },
  });

  const [pending, startTransition] = useTransition();

  const { mutateAsync } = useUpdateManyDocumentVersion();

  const handleRestoreVersion = (versionId: string) => {
    startTransition(() => {
      mutateAsync({ where: { documentId }, data: { isPrimary: false } });
      mutateAsync({ where: { id: versionId }, data: { isPrimary: true } });
      toast.success(t('toast.restore_success'));
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex animate-pulse gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-3 w-1/2 rounded bg-muted"></div>
              <div className="h-3 w-1/3 rounded bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      {versions?.length === 0 ? (
        <EmptyCard title={t('empty_state.title')} description={t('empty_state.description')} />
      ) : (
        <>
          <div className="flex-1 space-y-4">
            {versions.map((version) => (
              <div key={version.id} className={`flex gap-4 p-4 border rounded-lg ${version.isPrimary ? 'bg-muted/50 border-primary/20' : ''}`}>
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-muted/50">{getFileIcon(version.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('version_number', { number: version.versionNumber })}</span>
                    {version.isPrimary && (
                      <Badge variant="success" className="ml-2">
                        {t('badges.current')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-xs text-muted-foreground gap-2">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{format(version.createdAt, t('datetime_format'))}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <FileText className="mr-1 h-3 w-3" />
                      <span>
                        {formatBytes(version.fileSize || 0)} {t('fileInfo.mb')}
                      </span>
                    </div>
                    {version.numPages && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <Layers className="mr-1 h-3 w-3" />
                          <span>{t('pages', { count: version.numPages })}</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center">
                      <span>{t('created_by', { user: version.createdBy ?? t('n_a') })}</span>
                    </div>
                    {version.hasPages && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                          <span>{t('processed_status')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Button variant="outline" size="icon" title={t('actions.view')} asChild>
                    <a href={version.file} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title={t('actions.download')}
                    onClick={() => downloadFile(version.file, `${documentName} - ${t('versionLabel')} ${version.versionNumber}.${version.type}`)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('dropdown.actions')}</DropdownMenuLabel>
                      {!version.isPrimary && (
                        <DropdownMenuItem disabled={pending} onClick={() => handleRestoreVersion(version.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {t('dropdown.restore')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('dropdown.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          {totalCount > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalItems={totalCount}
              pageSizeOptions={[5, 10, 20, 50]}
              className="mt-4 border-t pt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
