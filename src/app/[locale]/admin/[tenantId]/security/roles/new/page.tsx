import { FC } from 'react';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getModulesWithFeatures } from '@/actions/role';
import { getUsersAsOptions } from '@/actions/user';

import RoleFormStepper from '@/components/common/role/role-form-stepper';

interface NewRolePageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewRolePage: FC<NewRolePageProps> = async ({ params }) => {
  const { tenantId } = await params;

  const modules = await getModulesWithFeatures(tenantId);
  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);

  return <RoleFormStepper tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default NewRolePage;
