import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { getDocumentMetadataFormData } from '@/actions/document';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import DocumentMetadataForm from '@/components/common/documents/document-metadata-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.DOCUMENT_MANAGEMENT.EDIT]);

  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug } } });
  }

  const t = await getTranslations('admin.document.metaform');

  const initialValues = await getDocumentMetadataFormData(slug, tenantId);

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
  }

  return (
    <PageDialogWrapper title={t('title')} description={t('subtitle')}>
      <DocumentMetadataForm tenantId={tenantId} initialValues={initialValues} />
    </PageDialogWrapper>
  );
};

export default EditPage;
