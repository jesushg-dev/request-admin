import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequestHierarchiesPageClient from '@/components/common/hierarchy/request-hierarchies-page-client';

interface RequestHierarchiesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: RequestHierarchiesPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requestHierarchies.title')} - ${t('brandName')}`,
    description: t('pages.requestHierarchies.description'),
  };
}

export default async function RequestHierarchiesPage({ params }: RequestHierarchiesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.VIEW]);

  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.DELETE]);

  return <RequestHierarchiesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
