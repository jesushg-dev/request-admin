import React, { FC } from 'react';
import { db } from '@/server/db-server';

import { AssignmentHierarchyDefaultArgs, RequestHierarchyDefaultArgs } from '@/types/prisma/hierarchy';
import RequestFormStepper from '@/components/common/request/request-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  const requestHierarchy = await db.requestHierarchy.findFirst({
    select: RequestHierarchyDefaultArgs.select,
    orderBy: { name: 'asc' },
  });

  const assignmentHierarchy = await db.assignmentHierarchy.findFirst({
    select: AssignmentHierarchyDefaultArgs.select,
    orderBy: { name: 'asc' },
  });

  if (!requestHierarchy || !assignmentHierarchy) {
    return null;
  }

  return <RequestFormStepper tenantId={tenantId} requestLevelTypes={requestHierarchy.levels} assignmentLevelTypes={assignmentHierarchy.levels} />;
};

export default NewPage;
