import { type Metadata } from 'next';
import { FC } from 'react';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
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

  const db = await getDb();
  const initialValues = await db.document.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      expirationDate: true,
      assistantEnabled: true,
      advancedExcelEnabled: true,
      downloadOnly: true,
    },
    where: { id: slug, tenantId },
  });

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('title')} description={t('description')}>
      <DocumentMetadataForm tenantId={tenantId} initialValues={initialValues} />
    </PageCardWrapper>
  );
};

export default EditPage;
