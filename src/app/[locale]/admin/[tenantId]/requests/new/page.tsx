import React, { FC } from 'react';
import { getPrioritiesAsOptions } from '@/actions/request';
import { type Locale } from 'next-intl';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  const priorities = await getPrioritiesAsOptions(tenantId);

  return <RequestFormStepper tenantId={tenantId} prioritiesOptions={priorities} />;
};

export default NewPage;
