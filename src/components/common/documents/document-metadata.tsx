'use client';

import { Link } from '@/i18n/routing';
import { format } from 'date-fns';
import { Edit, Eye, LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DocumentWithRelations } from '@/types/zenstackhq/document';
import { formatBytes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentMetadataProps {
  tenantId: string;
  document: DocumentWithRelations;
}

export function DocumentMetadata({ tenantId, document }: DocumentMetadataProps) {
  const t = useTranslations('admin.document.view.metadata');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('document_details')}</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
                  params: { tenantId, slug: document.id },
                }}>
                <Edit className="mr-2 h-4 w-4" />
                {t('edit')}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.name')}:</dt>
              <dd>{document.name}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.description')}:</dt>
              <dd>{document.description}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.status')}:</dt>
              <dd>
                <Badge variant={document.status === 'ACTIVE' ? 'success' : 'outline'}>{document.status}</Badge>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.file_type')}:</dt>
              <dd className="uppercase">{document.type}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.size')}:</dt>
              <dd>
                {formatBytes(document.versions[0]?.fileSize ?? 0)} {t('file_info.mb')}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.pages')}:</dt>
              <dd>{document.numPages}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.folder')}:</dt>
              <dd>{document.folder?.path}</dd>
            </div>
            {document.expirationDate && (
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-muted-foreground">{t('metadata.expires')}:</dt>
                <dd>{format(document.expirationDate, 'MMM d, yyyy')}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('file_information')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.created_by')}:</dt>
              <dd>{document.createdBy}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.created_date')}:</dt>
              <dd>{format(document.createdAt, 'MMM d, yyyy')}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.last_modified')}:</dt>
              <dd>{document.updatedAt ? format(document.updatedAt, 'MMM d, yyyy') : t('common.na')}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.storage_type')}:</dt>
              <dd>{document.storageType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.content_type')}:</dt>
              <dd>{document.contentType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.file_url')}:</dt>
              <dd className="truncate flex items-center gap-3">
                <LinkIcon className="h-3 w-3" />
                <a href={document.file} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  <span className="truncate mr-1">{document.file}</span>
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <dt className="font-medium text-muted-foreground">{t('metadata.total_views')}:</dt>
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
          <CardTitle>{t('features.features_settings')}</CardTitle>
          <CardDescription>{t('features.features_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex flex-col p-4 border rounded-lg ${document.assistantEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.assistantEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.assistantEnabled ? t('badges.enabled') : t('badges.disabled')}
                </Badge>
                <h3 className="font-medium text-base">{t('features.ai_assistant')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('features.ai_description')}</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.advancedExcelEnabled ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.advancedExcelEnabled ? 'success' : 'outline'} className="mb-2">
                  {document.advancedExcelEnabled ? t('badges.enabled') : t('badges.disabled')}
                </Badge>
                <h3 className="font-medium text-base">{t('features.advanced_excel')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('features.excel_description')}</p>
            </div>

            <div
              className={`flex flex-col p-4 border rounded-lg ${document.downloadOnly ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 'border-gray-200 dark:border-gray-800'}`}>
              <div className="mb-3">
                <Badge variant={document.downloadOnly ? 'success' : 'outline'} className="mb-2">
                  {document.downloadOnly ? t('badges.enabled') : t('badges.disabled')}
                </Badge>
                <h3 className="font-medium text-base">{t('features.download_only')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('features.download_description')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
