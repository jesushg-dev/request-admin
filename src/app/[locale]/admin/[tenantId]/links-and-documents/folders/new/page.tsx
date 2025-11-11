import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface NewPageProps {
  params: Promise<{ tenantId: string; locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.folderNew.title')} - ${t('brandName')}`,
    description: t('pages.folderNew.description'),
  };
}

const NewPage: FC<NewPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId } = await params;

  // Folders are part of data rooms, so we need DATA_ROOM.EDIT permission
  const auth = await getAuthContext(tenantId);
  const canEditDataRooms = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);
  
  if (!canEditDataRooms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  const t = await getTranslations('admin.folder.create');
  const { currentFolderId, dataroomId, callbackUrl } = await folderReferencesLoader(searchParams);

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm locale={locale} tenantId={tenantId} callbackUrl={callbackUrl} folders={[]} currentFolderId={currentFolderId} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default NewPage;
