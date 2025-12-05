import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequestsPageClient from '@/components/common/request/requests-page-client';

interface RequestsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: RequestsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requests.title')} - ${t('brandName')}`,
    description: t('pages.requests.description'),
  };
}

export default async function RequestsPage({ params }: RequestsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.VIEW]);

  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.CREATE]);
  const canAssign = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER]);

  return <RequestsPageClient canCreate={canCreate} canAssign={canAssign} />;
}
