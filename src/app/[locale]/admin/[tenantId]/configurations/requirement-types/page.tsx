import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import RequirementTypesPageClient from '@/components/common/requirement-type/requirement-types-page-client';

interface RequirementTypesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function RequirementTypesPage({ params }: RequirementTypesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.REQUIREMENT_TYPE.DELETE]);

  return <RequirementTypesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
