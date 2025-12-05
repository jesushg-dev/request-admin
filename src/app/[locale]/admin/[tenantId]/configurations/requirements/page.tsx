import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import RequirementsPageClient from '@/components/common/requirement/requirements-page-client';

interface RequirementsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: RequirementsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.requirements.title')} - ${t('brandName')}`,
    description: t('pages.requirements.description'),
  };
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
