import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import AgreementsPageClient from '@/components/common/agreements/agreements-page-client';

interface AgreementsPageProps {
  params: Promise<{
    locale: Locale;
    tenantId: string;
  }>;
}

export async function generateMetadata(props: AgreementsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.agreements.title')} - ${t('brandName')}`,
    description: t('pages.agreements.description'),
  };
}

export default async function AgreementsPage({ params }: AgreementsPageProps) {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canViewAgreements = auth.hasPermissions([PermissionActions.AGREEMENT.VIEW]);
  
  if (!canViewAgreements) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } });
  }

  const canCreate = auth.hasPermissions([PermissionActions.AGREEMENT.CREATE]);
  const canEdit = auth.hasPermissions([PermissionActions.AGREEMENT.EDIT]);
  const canDelete = auth.hasPermissions([PermissionActions.AGREEMENT.DELETE]);

  return <AgreementsPageClient canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />;
}
