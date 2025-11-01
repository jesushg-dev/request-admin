import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import DataRoomsPageClient from '@/components/common/data-room/data-rooms-page-client';

interface DataRoomsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function DataRoomsPage({ params }: DataRoomsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewDataRooms = auth.hasPermissions([PermissionActions.DATA_ROOM.VIEW]);
  
  if (!canViewDataRooms) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.DATA_ROOM.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.DATA_ROOM.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.DATA_ROOM.DELETE]);

  return <DataRoomsPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
