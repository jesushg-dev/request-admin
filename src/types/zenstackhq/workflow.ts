import { STATUS } from '@/constants/requests';
import { Prisma } from '@zenstackhq/runtime/models';

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
      orderBy: { createdAt: 'asc' }, // Order for consistency
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
export type RequestWorkflowType = Omit<Prisma.RequestWorkflowGetPayload<typeof RequestWorkflowDefaultArgs>, 'requestWorkflowStatus'> & {
  requestWorkflowStatus: Array<
    Omit<Prisma.RequestWorkflowGetPayload<typeof RequestWorkflowDefaultArgs>['requestWorkflowStatus'][number], 'type'> & {
      type: (typeof STATUS)[keyof typeof STATUS];
    }
  >;
};

export type RequestWorkflowStatusType = RequestWorkflowType['requestWorkflowStatus'][number];

export type RequestWorkflowTransitionType = RequestWorkflowType['requestWorkflowTransition'][number];
