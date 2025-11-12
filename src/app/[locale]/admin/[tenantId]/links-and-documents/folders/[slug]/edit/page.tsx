import { type Metadata } from 'next';
import { FC } from 'react';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { folderReferencesLoader } from '@/lib/document';
import { FolderForm } from '@/components/common/data-room/folder-form';
import { PageCardWrapper } from '@/components/shared/page-container';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string; slug: string }> }): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const db = await getDb();
  const folder = await db.dataroomFolder.findUnique({
    where: { id: slug, tenantId },
    select: { name: true },
  });
  const folderName = folder?.name || `Carpeta #${slug}`;

  return {
    title: `${folderName} - Editar Carpeta - ${t('brandName')}`,
    description: 'Editar los detalles de la carpeta',
  };
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

  const db = await getDb();
  const initialValues = await db.dataroomFolder.findFirst({
    select: { id: true, name: true, dataroomId: true },
    where: { id: slug, dataroomId, tenantId },
  });

  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } } });
  }

  return (
    <PageCardWrapper title={t('title')} description={t('subtitle')}>
      <FolderForm locale={locale} tenantId={tenantId} folders={[]} currentFolderId={slug} dataroomId={dataroomId} />
    </PageCardWrapper>
  );
};

export default EditPage;
