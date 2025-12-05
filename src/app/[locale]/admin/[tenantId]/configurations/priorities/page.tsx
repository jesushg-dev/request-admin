import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import PrioritiesPageClient from '@/components/common/priority/priorities-page-client';

interface PrioritiesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: PrioritiesPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.priorities.title')} - ${t('brandName')}`,
    description: t('pages.priorities.description'),
  };
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
