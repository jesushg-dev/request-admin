import React, { FC } from 'react';
import { getAssignmentHierarchyAndLevelsByTenantId, getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getStatusesAsOptions } from '@/actions/request';
import { STATUS } from '@/constants/requests';
import { type Locale } from 'next-intl';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { locale, tenantId } = await params;

  const priorities = await getPrioritiesAsOptions(tenantId);
  const statuses = await getStatusesAsOptions(tenantId, [STATUS.DRAFT, STATUS.REVIEW]);
  const requestHierarchy = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);
  const assignmentHierarchy = await getAssignmentHierarchyAndLevelsByTenantId(locale, tenantId);

  return (
    <RequestFormStepper tenantId={tenantId} statusesOptions={statuses} prioritiesOptions={priorities} requestLevelTypes={requestHierarchy.levels} assignmentLevelTypes={assignmentHierarchy.levels} />
  );
};

export default NewPage;
