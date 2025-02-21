import { FC } from 'react';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getUsersAsOptions } from '@/actions/user';

import RoleFormStepper from '@/components/common/role/role-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const modules = await getModuleByTenantIdAndScope(tenantId, 'global');

  return <RoleFormStepper tenantId={tenantId} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default NewPage;
