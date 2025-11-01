import { FC } from 'react';
import { type Locale } from 'next-intl';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { redirect } from '@/i18n/routing';
import { getAssignmentHierarchiesAndLevelsByTenantId } from '@/actions/hierarchy';
import { getModuleByTenantIdAndScope } from '@/actions/module';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { getUsersAsOptions } from '@/actions/user';

import AreaFormStepper from '@/components/common/area/area-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const auth = await getAuthContext(tenantId);
  const canCreate = auth.hasPermissions([PermissionActions.AREA.CREATE]);
  
  if (!canCreate) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } } });
  }

  // Fetch hierarchy data using Prisma
  const userOptions = await getUsersAsOptions(tenantId);
  const requirements = await getRequirementsAsOptions(tenantId);
  const modules = await getModuleByTenantIdAndScope(tenantId, 'area');
  const hierarchies = await getAssignmentHierarchiesAndLevelsByTenantId(locale, tenantId);

  return <AreaFormStepper tenantId={tenantId} assignmentHierarchies={hierarchies} requirements={requirements} userOptions={userOptions} moduleWithFeatures={modules} />;
};

export default NewPage;
