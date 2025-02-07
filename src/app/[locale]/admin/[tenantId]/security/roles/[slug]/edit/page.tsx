import { FC } from 'react';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getModulesWithFeatures, getRoleAsFormById } from '@/actions/role';
import { getUsersAsOptions } from '@/actions/user';

import RoleFormStepper from '@/components/common/role/role-form-stepper';

interface EditRolePageProps {
  params: Promise<{ locale: string; slug: string; tenantId: string }>;
}

const EditRolePage: FC<EditRolePageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const userOptions = await getUsersAsOptions(tenantId);
  const modules = await getModulesWithFeatures(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const initialValues = await getRoleAsFormById(slug, tenantId);

  return <RoleFormStepper initialValues={initialValues} tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditRolePage;
