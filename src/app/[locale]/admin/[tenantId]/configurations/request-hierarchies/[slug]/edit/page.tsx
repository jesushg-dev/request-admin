import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getRequestHierarchyAndLevelsById, upsertRequestHierarchy } from '@/actions/hierarchy';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface UpdateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequestHierarchyPage: FC<UpdateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.REQUEST_HIERARCHY.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  const defaultValues = await getRequestHierarchyAndLevelsById(tenantId, slug);
  
  if (!defaultValues) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  const isInUse = defaultValues.categoriesCount > 0;

  return <HierarchyFormStepper defaultValues={defaultValues} isInUse={isInUse} tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />;
};

export default UpdateRequestHierarchyPage;
