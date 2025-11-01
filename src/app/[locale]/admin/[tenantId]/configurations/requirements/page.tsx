import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import RequirementsPageClient from '@/components/common/requirement/requirements-page-client';

interface RequirementsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function RequirementsPage({ params }: RequirementsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.REQUIREMENT.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.REQUIREMENT.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.REQUIREMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.REQUIREMENT.DELETE]);

  return <RequirementsPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
