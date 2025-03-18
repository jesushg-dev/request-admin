import { FC } from 'react';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getRoleAsFormById } from '@/actions/role';
import { getUsersAsOptions } from '@/actions/user';
import { type Locale } from 'next-intl';

import RoleFormStepper from '@/components/common/role/role-form-stepper';

interface EditRolePageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const EditRolePage: FC<EditRolePageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const initialValues = await getRoleAsFormById([slug], tenantId);
  const modules = await getModuleByTenantIdAndScope(tenantId, 'global');

  return <RoleFormStepper initialValues={initialValues} tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditRolePage;
