import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import LinksPageClient from '@/components/common/shared-links/links-page-client';

interface LinksPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export default async function LinksPage({ params }: LinksPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewLinks = auth.hasPermissions([PermissionActions.SHARED_LINK.VIEW]);
  
  if (!canViewLinks) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.SHARED_LINK.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.SHARED_LINK.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.SHARED_LINK.DELETE]);

  return <LinksPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
