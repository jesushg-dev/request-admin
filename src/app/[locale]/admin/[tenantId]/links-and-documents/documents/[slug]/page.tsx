import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, Link, redirect } from '@/i18n/routing';
import { getDb } from '@/server/db-client';
import { format } from 'date-fns';
import { Calendar, ExternalLink, File, LinkIcon } from 'lucide-react';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DocumentDefaultArgs } from '@/types/zenstackhq/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentActionsDropdown } from '@/components/common/documents/document-actions-dropdown';
import { DocumentAnalytics } from '@/components/common/documents/document-analytics';
import { DocumentMetadata } from '@/components/common/documents/document-metadata';
import { DocumentSharedLinks } from '@/components/common/documents/document-shared-links';
import { DocumentVersionHistory } from '@/components/common/documents/document-version-history';
import DocumentViewer, { DocumentDownloadButton } from '@/components/common/documents/document-viewer';
import { DocumentComments } from '@/components/common/documents/document-comments';
import { DocumentReactionWidget } from '@/components/common/documents/document-reaction-widget';

interface DocumentDetailPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewDocuments = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.VIEW]);

  if (!canViewDocuments) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
  }

  const canEdit = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.DELETE]);

  const t = await getTranslations({ locale, namespace: 'admin.document.view' });
  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug } } });

  const db = await getDb();
  const document = await db.document.findUnique({
    ...DocumentDefaultArgs,
    where: { id: slug, tenantId },
  });

  if (!document) {
    return <div>{t('documentNotFound')}</div>;
  }

  return (
    <div className="flex flex-1 p-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="w-full flex flex-row justify-between items-start">
          <div className="flex flex-col gap-2">
            <CardTitle>{document.name}</CardTitle>
            <div className="flex gap-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <File className="mr-1 h-4 w-4" />
                <span>{document.versions?.[0]?.fileSize ? `${(document.versions[0].fileSize / (1024 * 1024)).toFixed(2)} ${t('fileInfo.mb')}` : t('fileInfo.na')}</span>
              </div>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{t('created', { date: format(new Date(document.createdAt), 'MMM d, yyyy') })}</span>
              </div>
              {document.createdBy && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <span>{document.createdBy}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <DocumentDownloadButton fileUrl={document.file} title={`${document.name}.${document.type}`} />
              <Button variant="ghost" asChild size="icon">
                <Link
                  href={{
                    pathname: '/admin/[tenantId]/links-and-documents/links/new',
                    query: { documentId: document.id, callbackUrl },
                    params: { tenantId },
                  }}>
                  <LinkIcon className="h-4 w-4" />
                  <span className="sr-only">{t('actions.share')}</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild size="icon">
                <a href={document.file} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">{t('actions.open_new_tab')}</span>
                </a>
              </Button>
              <DocumentActionsDropdown documentId={document.id} tenantId={tenantId} canEdit={canEdit} canDelete={canDelete} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 overflow-hidden">
          <Tabs defaultValue="preview" className="overflow-hidden w-full flex flex-col flex-1 gap-2">
            <TabsList>
              <TabsTrigger value="preview">{t('tabs.preview')}</TabsTrigger>
              <TabsTrigger value="metadata">{t('tabs.metadata')}</TabsTrigger>
              <TabsTrigger value="versions">{t('tabs.versions')}</TabsTrigger>
              <TabsTrigger value="links">{t('tabs.links')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('tabs.analytics')}</TabsTrigger>
              <TabsTrigger value="comments">{t('tabs.comments')}</TabsTrigger>
              <TabsTrigger value="reactions">{t('tabs.reactions')}</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 rounded-lg overflow-y-auto justify-center items-center border flex flex-col bg-white dark:bg-gray-900">
              <DocumentViewer fileUrl={document.file} contentType={document.contentType} />
            </TabsContent>

            <TabsContent value="metadata" className="flex-1 overflow-y-auto">
              <DocumentMetadata document={document} tenantId={tenantId} />
            </TabsContent>

            <TabsContent value="versions">
              <DocumentVersionHistory documentId={document.id} documentName={document.name} />
            </TabsContent>

            <TabsContent value="links">
              <DocumentSharedLinks documentId={document.id} />
            </TabsContent>

            <TabsContent value="analytics">
              <DocumentAnalytics documentId={document.id} document={document} />
            </TabsContent>

            <TabsContent value="comments">
              <DocumentComments documentId={document.id} />
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
        </CardContent>
      </Card>
    </div>
  );
}
