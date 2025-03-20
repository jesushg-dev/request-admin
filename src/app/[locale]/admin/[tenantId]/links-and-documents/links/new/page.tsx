import { FC } from 'react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { LinkForm } from '@/components/common/data-room/link-form';
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
    <PageCardWrapper title="Crear Enlace Compartido" description="Te permite crear enlaces compartidos a documentos con usuarios externos.">
      <LinkForm tenantId={tenantId} currentFolderId={currentFolderId} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default NewPage;
