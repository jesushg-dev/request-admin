import { FC } from 'react';
import { redirect } from '@/i18n/routing';
import { db } from '@/server/db-client';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId, slug } = await params;
  const t = await getTranslations('admin.folder.create');
  const { dataroomId } = await folderReferencesLoader(searchParams);

  const initialValues = db.dataroomFolder.findFirst({
    select: { id: true, name: true },
    where: { id: slug, dataroomId, tenantId },
  });

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug } } });
  }

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm tenantId={tenantId} folders={[]} currentFolderId={slug} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default NewPage;
