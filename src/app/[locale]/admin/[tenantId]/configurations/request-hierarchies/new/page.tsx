import { FC } from 'react';
import { upsertRequestHierarchy } from '@/actions/hierarchy';
import { type Locale } from 'next-intl';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface CreateRequestHierarchyPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const CreateRequestHierarchyPage: FC<CreateRequestHierarchyPageProps> = async ({ params }) => {
  const { tenantId, locale } = await params;

  return <HierarchyFormStepper tenantId={tenantId} locale={locale} upsertAction={upsertRequestHierarchy} />;
};

export default CreateRequestHierarchyPage;
