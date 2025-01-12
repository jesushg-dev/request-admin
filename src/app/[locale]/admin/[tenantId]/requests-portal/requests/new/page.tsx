import React from 'react';
import { db } from '@/server/db-server';



import { AssignmentHierarchyDefaultArgs, RequestHierarchyDefaultArgs } from '@/types/prisma/hierarchy';
import CombinedRequestFormStepper from '@/components/common/request/request-form-stepper/combined-request-form-stepper';
import SeparateRequestFormStepper from '@/components/common/request/request-form-stepper/separate-request-form-stepper';





const NewRequestPage: React.FC = async () => {
  const requestHierarchy = await db.requestHierarchy.findFirst({
    select: RequestHierarchyDefaultArgs.select,
  });

  const assignmentHierarchy = await db.assignmentHierarchy.findFirst({
    select: AssignmentHierarchyDefaultArgs.select,
  });

  if (!requestHierarchy || !assignmentHierarchy) {
    return null;
  }

  const shouldSeparateSteps = requestHierarchy.levels.length + assignmentHierarchy.levels.length > 4;

  return shouldSeparateSteps ? (
    <SeparateRequestFormStepper requestLevelTypes={requestHierarchy.levels} assignmentLevelTypes={assignmentHierarchy.levels} />
  ) : (
    <CombinedRequestFormStepper requestLevelTypes={requestHierarchy.levels} assignmentLevelTypes={assignmentHierarchy.levels} />
  );
};

export default NewRequestPage;