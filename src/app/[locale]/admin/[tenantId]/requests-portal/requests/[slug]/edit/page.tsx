import React, { FC } from 'react';
import { getAssignmentHierarchyAndLevelsByTenantId, getRequestHierarchyAndLevelsByTenantId } from '@/actions/hierarchy';
import { getPrioritiesAsOptions, getRequestById, getStatusesAsOptions } from '@/actions/request';
import { STATUS } from '@/constants/requests';

import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface EditPageProps {
  params: Promise<{ locale: string; tenantId: string; slug: string }>;
}

const EditPage: FC<EditPageProps> = async ({ params }) => {
  const { locale, tenantId, slug } = await params;

  const priorities = await getPrioritiesAsOptions(tenantId);
  const statuses = await getStatusesAsOptions(tenantId, [STATUS.DRAFT, STATUS.REVIEW]);
  const requestHierarchy = await getRequestHierarchyAndLevelsByTenantId(locale, tenantId);
  const assignmentHierarchy = await getAssignmentHierarchyAndLevelsByTenantId(locale, tenantId);
  const defaultValues = await getRequestById(tenantId, slug);

  return (
    <RequestFormStepper
      tenantId={tenantId}
      defaultValues={defaultValues}
      statusesOptions={statuses}
      prioritiesOptions={priorities}
      requestLevelTypes={requestHierarchy.levels}
      assignmentLevelTypes={assignmentHierarchy.levels}
    />
  );
};

export default EditPage;
