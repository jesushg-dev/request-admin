import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import UsersPageClient from '@/components/common/user/users-page-client';

interface UsersPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.DELETE]);

  return <UsersPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
