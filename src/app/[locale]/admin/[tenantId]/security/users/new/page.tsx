import { type Metadata } from 'next';
import { type FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getAreasWithRolesAsOptionsByTenantId } from '@/actions/area';
import { getIdentityTypesAsOptions, getRolesAsOptions } from '@/actions/user';
import { getTranslations } from 'next-intl/server';

import UserTenantScopedForm from '@/components/common/user/user-tenant-scoped-form';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: NewPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.userNew.title')} - ${t('brandName')}`,
    description: t('pages.userNew.description'),
  };
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/users', params: { tenantId } } });
  }

  const roles = await getRolesAsOptions(tenantId);
  const areas = await getAreasWithRolesAsOptionsByTenantId(tenantId);
  const identificationTypes = await getIdentityTypesAsOptions(tenantId);
  
  return <UserTenantScopedForm tenantId={tenantId} identificationTypes={identificationTypes} roles={roles} areas={areas} />;
};

export default NewPage;
