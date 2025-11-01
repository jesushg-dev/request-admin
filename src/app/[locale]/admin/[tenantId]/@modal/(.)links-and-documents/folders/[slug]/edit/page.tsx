import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { db } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}

const EditPage: FC<EditPageProps> = async ({ params, searchParams }) => {
  const { locale, tenantId, slug } = await params;

  // Folders are part of data rooms, so we need DATA_ROOM.EDIT permission
  const auth = await getAuthContext(tenantId);
  const canEditDataRooms = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);
  
  if (!canEditDataRooms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  const t = await getTranslations('admin.folder.create');
  const { dataroomId } = await folderReferencesLoader(searchParams);

  const initialValues = await db.dataroomFolder.findFirst({
    select: { id: true, name: true },
    where: { id: slug, dataroomId, tenantId },
  });

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  return (
    <PageDialogWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm tenantId={tenantId} folders={[]} locale={locale} currentFolderId={slug} dataroomId={dataroomId} />
    </PageDialogWrapper>
  );
};

export default EditPage;
