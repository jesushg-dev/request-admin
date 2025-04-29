import { FC } from 'react';
import { upsertRequestHierarchy } from '@/actions/hierarchy';
import { type Locale } from 'next-intl';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface CreateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const CreateRequestHierarchyPage: FC<CreateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, locale } = await params;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <HierarchyFormStepper tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />
    </div>
  );
};

export default CreateRequestHierarchyPage;
