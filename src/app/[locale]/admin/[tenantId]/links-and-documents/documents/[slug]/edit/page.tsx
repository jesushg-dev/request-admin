import { FC } from 'react';
import { Locale, redirect } from '@/i18n/routing';
import { db } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import DocumentMetadataForm from '@/components/common/documents/document-metadata-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;
  const t = await getTranslations('admin.document.metaform');

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
