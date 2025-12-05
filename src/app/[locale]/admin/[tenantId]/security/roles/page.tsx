import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RolesPageClient from '@/components/common/role/roles-page-client';

interface RolesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: RolesPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.securityRoles.title')} - ${t('brandName')}`,
    description: t('pages.securityRoles.description'),
  };
}

export default async function RolesPage({ params }: RolesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.ROLE_MANAGEMENT.VIEW]);

  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.ROLE_MANAGEMENT.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.ROLE_MANAGEMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.ROLE_MANAGEMENT.DELETE]);

  return <RolesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
