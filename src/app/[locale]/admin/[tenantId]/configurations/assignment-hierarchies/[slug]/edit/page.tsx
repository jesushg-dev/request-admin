import { FC } from 'react';
import { getAssignmentHierarchyAndLevelsById, upsertAssignmentHierarchy } from '@/actions/hierarchy';
import { type Locale } from 'next-intl';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface UpdateAssignmentHierarchyPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateAssignmentHierarchyPage: FC<UpdateAssignmentHierarchyPageProps> = async ({ params }) => {
  const { tenantId, locale, slug } = await params;

  const defaultValues = await getAssignmentHierarchyAndLevelsById(tenantId, slug);
  const isInUse = defaultValues.categoriesCount > 0;

  return <HierarchyFormStepper defaultValues={defaultValues} locale={locale} isInUse={isInUse} tenantId={tenantId} upsertAction={upsertAssignmentHierarchy} />;
};

export default UpdateAssignmentHierarchyPage;
