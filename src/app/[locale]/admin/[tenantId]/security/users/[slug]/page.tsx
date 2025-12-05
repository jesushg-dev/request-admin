import { type FC } from 'react';
import { type Metadata } from 'next';
import { getAreasWithRolesAsOptionsByTenantId } from '@/actions/area';
import { getAuthContext } from '@/actions/authorization';
import { getIdentityTypesAsOptions, getRolesAsOptions, getUserFormValuesByUserTenantId } from '@/actions/user';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import UserTenantScopedForm from '@/components/common/user/user-tenant-scoped-form';

interface EditUserPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

export async function generateMetadata(props: EditUserPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  const userData = await getUserFormValuesByUserTenantId(tenantId, slug);
  const userName = `${userData.user.firstName} ${userData.user.lastName}`;

  return {
    title: `${userName} - ${t('pages.userDetail.title')} - ${t('brandName')}`,
    description: t('pages.userDetail.description'),
  };
}

const EditUserPage: FC<EditUserPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.EDIT]);
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/users', params: { tenantId } } });
  }

  const [roles, areas, identificationTypes, defaultValues] = await Promise.all([
    getRolesAsOptions(tenantId),
    getAreasWithRolesAsOptionsByTenantId(tenantId),
    getIdentityTypesAsOptions(tenantId),
    getUserFormValuesByUserTenantId(tenantId, slug),
  ]);

  return <UserTenantScopedForm tenantId={tenantId} identificationTypes={identificationTypes} roles={roles} areas={areas} defaultValues={defaultValues} />;
};

export default EditUserPage;
