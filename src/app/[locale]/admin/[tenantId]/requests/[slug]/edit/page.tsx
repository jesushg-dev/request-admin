import React, { FC } from 'react';
import { getPrioritiesAsOptions, getRequestById } from '@/actions/request';
import { type Locale } from 'next-intl';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: Locale; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const priorities = await getPrioritiesAsOptions(tenantId);
  const defaultValues = await getRequestById(tenantId, slug);

  return <RequestFormStepper tenantId={tenantId} defaultValues={defaultValues} prioritiesOptions={priorities} />;
};

export default EditPage;
