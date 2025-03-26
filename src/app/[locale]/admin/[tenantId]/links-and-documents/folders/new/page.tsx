import { FC } from 'react';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string; locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId } = await params;
  const t = await getTranslations('admin.folder.create');
  const { currentFolderId, dataroomId, callbackUrl } = await folderReferencesLoader(searchParams);

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm locale={locale} tenantId={tenantId} callbackUrl={callbackUrl} folders={[]} currentFolderId={currentFolderId} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default NewPage;
