import { FC } from 'react';
import { getAreaByTenantIdAndAreaId } from '@/actions/area';
import { getAssignmentHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getUsersAsOptions } from '@/actions/user';
import { type Locale } from 'next-intl';

import AreaFormStepper from '@/components/common/area/area-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  // Fetch hierarchy data using Prisma
  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const area = await getAreaByTenantIdAndAreaId(tenantId, slug);
  const modules = await getModuleByTenantIdAndScope(tenantId, 'area');
  const hierarchies = await getAssignmentHierarchiesAndLevelsByTenantId(locale, tenantId);

  return <AreaFormStepper tenantId={tenantId} defaultValues={area} assignmentHierarchies={hierarchies} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default EditPage;
