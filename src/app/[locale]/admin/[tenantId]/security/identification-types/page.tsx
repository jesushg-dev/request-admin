import { type Metadata } from 'next';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import IdentificationTypesPageClient from '@/components/common/identification-type/identification-types-page-client';

interface IdentificationTypesPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: IdentificationTypesPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.identificationTypes.title')} - ${t('brandName')}`,
    description: t('pages.identificationTypes.description'),
  };
}

export default async function IdentificationTypesPage({ params }: IdentificationTypesPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canView = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.VIEW]);

  if (!canView) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.IDENTIFICATION_TYPE.DELETE]);

  return <IdentificationTypesPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
