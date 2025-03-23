import { FC } from 'react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<SearchParams>;
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.folder.create');
  const { currentFolderId, dataroomId } = await folderReferencesLoader(searchParams);

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm tenantId={tenantId} folders={[]} currentFolderId={currentFolderId} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default NewPage;
