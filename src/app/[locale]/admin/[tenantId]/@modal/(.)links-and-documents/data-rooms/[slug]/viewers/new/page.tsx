import { FC } from 'react';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DataroomViewerGroupForm } from '@/components/common/data-room/dataroom-viewer-group-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface DataroomViewerGroupNewPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const DataroomViewerGroupNewPage: FC<DataroomViewerGroupNewPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  // Managing viewers is part of editing a data room
  const auth = await getAuthContext(tenantId);
  const canEditDataRooms = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);

  if (!canEditDataRooms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug } } });
  }

  const t = await getTranslations('admin.dataroom.viewerGroup');

  return (
    <PageDialogWrapper title={t('new.title')} description={t('new.subtitle')}>
      <DataroomViewerGroupForm dataroomId={slug} tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default DataroomViewerGroupNewPage;
