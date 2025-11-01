'use server';

import { WorkflowStatusType } from '@/constants/workflow';
import { getDb } from '@/server/db-client';

import { RequestWorkflowDefaultArgs, type RequestWorkflowType } from '@/types/zenstackhq/workflow';

// Main function to get the workflow
export const getWorkflowWithTransitions = async (tenantId: string, requestCategoryId: string): Promise<RequestWorkflowType> => {
  const db = await getDb();
  const requestWorkflow = await db.requestWorkflow.findFirst({
    ...RequestWorkflowDefaultArgs,
    where: {
      tenantId,
      requestCategory: {
        some: { id: requestCategoryId },
      },
      isActive: true, // Only active workflows
    },
  });

  if (!requestWorkflow) {
    throw new Error('Workflow not found, ensure the selected request category has an active workflow.');
  }

  return requestWorkflow as RequestWorkflowType;
};

export const getInitialStatusFromDatabase = async (tenantId: string, requestCategoryId: string) => {
  const db = await getDb();
  return await db.requestWorkflowStatus.findFirstOrThrow({
    ...RequestWorkflowDefaultArgs.select.requestWorkflowStatus,
    where: {
      tenantId,
      type: WorkflowStatusType.INITIAL,
      workflow: {
        tenantId,
        requestCategory: {
          some: { id: requestCategoryId },
        },
      },
    },
  });
};
