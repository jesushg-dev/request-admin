import { FC } from 'react';
import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { getDocumentMetadataFormData } from '@/actions/document';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getDb } from '@/server/db-client';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import DocumentMetadataForm from '@/components/common/documents/document-metadata-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export async function generateMetadata(props: EditPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const db = await getDb();
  const document = await db.document.findUnique({
    where: { id: slug, tenantId },
    select: { name: true },
  });
  const documentName = document?.name || `Documento #${slug}`;

  return {
    title: `${documentName} - ${t('pages.documentEdit.title')} - ${t('brandName')}`,
    description: t('pages.documentEdit.description'),
  };
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

  const sanitizedInitialValues = {
    ...initialValues,
    name: initialValues.name ?? '',
    description: initialValues.description ?? '',
    status: initialValues.status ?? 'DRAFT',
  };

  return (
    <PageCardWrapper title={t('title')} description={t('description')}>
      <DocumentMetadataForm tenantId={tenantId} initialValues={sanitizedInitialValues} />
    </PageCardWrapper>
  );
};

export default EditPage;
