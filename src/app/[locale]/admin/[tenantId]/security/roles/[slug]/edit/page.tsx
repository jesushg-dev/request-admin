import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getRoleAsFormById } from '@/actions/role';
import { getUsersAsOptions } from '@/actions/user';

import RoleFormStepper from '@/components/common/role/role-form-stepper';

interface EditRolePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const EditRolePage: FC<EditRolePageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.ROLE_MANAGEMENT.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } } });
  }

  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const initialValues = await getRoleAsFormById([slug], tenantId);
  
  if (!initialValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } } });
  }

  const modules = await getModuleByTenantIdAndScope(tenantId, 'global');

  return <RoleFormStepper initialValues={initialValues} tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditRolePage;
