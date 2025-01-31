import React from 'react';
import { db } from '@/server/db-server';

import { AssignmentHierarchyDefaultArgs, RequestHierarchyDefaultArgs } from '@/types/prisma/hierarchy';
import RequestFormStepper from '@/components/common/request/request-form-stepper';

const NewRequestPage: React.FC = async () => {
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

  return <RequestFormStepper requestLevelTypes={requestHierarchy.levels} assignmentLevelTypes={assignmentHierarchy.levels} />;
};

export default NewRequestPage;
