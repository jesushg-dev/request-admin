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

  const role = await getRoleAsFormById(slug, tenantId);
  const modules = await getModulesWithFeatures(tenantId);
  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);

  return <RoleFormStepper initialValues={{ ...role, id: slug }} tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditRolePage;
