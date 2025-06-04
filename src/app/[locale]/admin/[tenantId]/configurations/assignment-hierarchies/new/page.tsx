import { FC } from 'react';
import { upsertAssignmentHierarchy } from '@/actions/hierarchy';
import { type Locale } from 'next-intl';

import { HierarchyFormStepper } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface CreateAssignmentHierarchyPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const CreateAssignmentHierarchyPage: FC<CreateAssignmentHierarchyPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  return <HierarchyFormStepper tenantId={tenantId} locale={locale} upsertAction={upsertAssignmentHierarchy} />;
};

export default CreateAssignmentHierarchyPage;
