import { type FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { getDocumentType } from '@/actions/document';
import { PermissionActions } from '@/constants/permissions';
import { getPathname, redirect } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DocumentUpload } from '@/components/common/documents/document-upload';
import { PageCardWrapper } from '@/components/shared/page-container';

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
  const documentType = await getDocumentType(slug, tenantId);

  if (!documentType) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
  }

  const callbackUrl = getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug } } });

  return (
    <PageCardWrapper
      title={t('dropdown.uploadNewVersion')}
      description={t('upload_version_description', { type: documentType.toUpperCase(), defaultValue: `Upload a new version. File type must be ${documentType.toUpperCase()}.` })}>
      <DocumentUpload locale={locale} tenantId={tenantId} documentId={slug} callbackUrl={callbackUrl} expectedFileType={documentType} />
    </PageCardWrapper>
  );
};

export default UploadVersionPage;
