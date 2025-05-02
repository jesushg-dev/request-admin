import { Prisma } from '@prisma/client';

// Default select for RequestWorkflows
export const RequestWorkflowDefaultArgs = Prisma.validator<Prisma.RequestWorkflowDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    isDefault: true,
    notifyChanges: true,
    requireComments: true,
    requestWorkflowStatus: {
      select: {
        id: true,
        positionX: true,
        positionY: true,
        name: true,
        description: true,
        color: true,
        type: true,
      },
    },
    requestWorkflowTransition: {
      select: {
        id: true,
        fromStatusId: true,
        toStatusId: true,
        name: true,
        description: true,
        requiresApproval: true,
        requiresJustification: true,
      },
    },
  },
});

// Type for RequestWorkflows with selected fields
export type RequestWorkflowType = Prisma.RequestWorkflowGetPayload<typeof RequestWorkflowDefaultArgs>;
export type RequestWorkflowStatusType = RequestWorkflowType['requestWorkflowStatus'][number];
export type RequestWorkflowTransitionType = RequestWorkflowType['requestWorkflowTransition'][number];
