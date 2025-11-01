import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import PrioritiesPageClient from '@/components/common/priority/priorities-page-client';

interface PrioritiesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function PrioritiesPage({ params }: PrioritiesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.PRIORITY.VIEW]);
  
  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.PRIORITY.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.PRIORITY.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.PRIORITY.DELETE]);

  return <PrioritiesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
