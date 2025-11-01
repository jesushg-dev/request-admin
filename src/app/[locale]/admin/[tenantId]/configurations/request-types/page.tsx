import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import RequestTypesPageClient from '@/components/common/request-type/request-types-page-client';

interface RequestTypesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function RequestTypesPage({ params }: RequestTypesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.REQUEST_TYPE.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_TYPE.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.REQUEST_TYPE.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.REQUEST_TYPE.DELETE]);

  return <RequestTypesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
