import { FC } from 'react';
import { type Locale } from 'next-intl';

import WorkflowFormStepper from '@/components/common/workflow/workflow-stepper.tsx';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  return <WorkflowFormStepper tenantId={tenantId} />;
};

export default NewPage;
