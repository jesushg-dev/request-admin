'use server';

import { db } from '@/server/db-client';

import { RequestWorkflowDefaultArgs, type RequestWorkflowType } from '@/types/prisma/workflow';

// Main function to get the workflow
export const getWorkflowWithTransitions = async (tenantId: string, requestCategoryId: string): Promise<RequestWorkflowType> => {
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
  return await db.requestWorkflowStatus.findFirstOrThrow({
    ...RequestWorkflowDefaultArgs.select.requestWorkflowStatus,
    where: {
      tenantId,
      type: 'initial',
      workflow: {
        tenantId,
        requestCategory: {
          some: { id: requestCategoryId },
        },
      },
    },
  });
};
