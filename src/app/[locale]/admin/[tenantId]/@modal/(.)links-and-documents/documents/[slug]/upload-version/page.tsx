import { type FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { getDocumentType } from '@/actions/document';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, redirect } from '@/i18n/routing';
import { getDb } from '@/server/db-client';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DocumentUpload } from '@/components/common/documents/document-upload';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface UploadVersionPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const UploadVersionPage: FC<UploadVersionPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug } } });
  }

  const t = await getTranslations('admin.document.view');
  const db = await getDb();
  const document = await db.document.findUnique({
    where: { id: slug, tenantId },
    select: { id: true, name: true },
  });

  if (!document) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
  }

  const documentType = await getDocumentType(slug, tenantId);
  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug } } });

  return (
    <PageDialogWrapper
      title={t('dropdown.uploadNewVersion')}
      description={t('upload_version_description_with_name', { name: document.name, type: documentType?.toUpperCase() || '', defaultValue: `Upload a new version of ${document.name}` })}>
      <DocumentUpload locale={locale} tenantId={tenantId} documentId={document.id} callbackUrl={callbackUrl} expectedFileType={documentType} />
    </PageDialogWrapper>
  );
};

export default UploadVersionPage;

