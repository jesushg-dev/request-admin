import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import AreasPageClient from '@/components/common/area/areas-page-client';

interface AreasPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: AreasPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.areas.title')} - ${t('brandName')}`,
    description: t('pages.areas.description'),
  };
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewAreas = auth.hasPermissions([PermissionActions.AREA.VIEW]);

  if (!canViewAreas) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.AREA.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.AREA.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.AREA.DELETE]);

  return <AreasPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
