import { FC } from 'react';
import { getAreaByTenandIdAndAreaId } from '@/actions/area';
import { getAssignmentHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getUsersAsOptions } from '@/actions/user';

import AreaFormStepper from '@/components/common/area/area-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: string; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  // Fetch hierarchy data using Prisma
  const { hierarchy, levels } = await getAssignmentHierarchyAndLevelsByTenantId(locale, tenantId);

  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const area = await getAreaByTenandIdAndAreaId(tenantId, slug);
  const modules = await getModuleByTenantIdAndScope(tenantId, 'area');
  console.log('🚀 ~ constEditPage:FC<EditPageProps>= ~ modules:', modules);

  return (
    <AreaFormStepper tenantId={tenantId} defaultValues={area} hierarchyId={hierarchy.id} assignmentLevels={levels} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />
  );
};

export default EditPage;
