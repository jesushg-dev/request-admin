import { FC } from 'react';
import { getRequestHierarchyAndLevelsById, upsertRequestHierarchy } from '@/actions/hierarchy';
import { type Locale } from 'next-intl';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface UpdateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequestHierarchyPage: FC<UpdateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const defaultValues = await getRequestHierarchyAndLevelsById(tenantId, slug);
  const isInUse = defaultValues.categoriesCount > 0;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <HierarchyFormStepper defaultValues={defaultValues} isInUse={isInUse} tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />
    </div>
  );
};

export default UpdateRequestHierarchyPage;
