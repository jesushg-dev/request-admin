import { ExecutionFlowValues } from '@/services/schemas/execution-flow';
import { Prisma } from '@zenstackhq/runtime/models';

// Default select for Requests
export const RequestDefaultArgs = Prisma.validator<Prisma.RequestDefaultArgs>()({
  include: {
    requestAssignments: {
      where: { isActive: true },
      include: {
        status: true,
        priority: true,
        area: true,
        requestCategory: true,
        assignmentCategory: true,
      },
    },
  },
});

// Type for Requests with selected fields
export type RequestType = Prisma.RequestGetPayload<typeof RequestDefaultArgs>;

export type ExecutionLogType = {
  id: string;
  nodeId: string;
  eventType: string;
  details: string;
  outcome: string;
  timestamp: Date;
};

export type RequestDetailsType = {
  guides: {
    id: string;
    name: string;
    description?: string | null;
    fileType: string;
    fileUrl: string;
    version: string;
    updatedAt: Date | null;
  }[];
  submissions: {
    count: number;
    total: number;
  };
  requirements: {
    count: number;
    total: number;
  };
  sla?: {
    resolutionTime: number;
    timeRemaining: number;
    progress: number;
  };
  satisfactionSurvey?: {
    rating: number;
    feedback: string | null;
    submittedAt: Date;
  };
  channel?: {
    id: string;
    name: string;
    createdAt: Date;
  };
  dataroom?: {
    id: string;
    name: string;
    createdAt: Date;
  };
  requester?: {
    name: string;
    email: string;
  };
  assignedUsers: {
    user: {
      value: string | number;
      label: string;
    };
    isCoordinator: boolean;
  }[];
  relatedAssignmentCount: number;
  relatedRequestCount: number;
  executionFlow?: {
    executionId: string;
    diagram: ExecutionFlowValues;
    logs: ExecutionLogType[];
  };
};

type StatusChangeMetadata = {
  type: 'STATUS_CHANGE';
  requiredReason: boolean;
  comments?: string;
};

type PriorityChangeMetadata = {
  type: 'PRIORITY_CHANGE';
  reason: string;
  notify: boolean;
};

type AssignmentChangeMetadata = {
  type: 'ASSIGNMENT_CHANGE';
  comments?: string;
  users: {
    userId: string;
    isCoordinator: boolean;
  }[];
};

type AssignmentAreaChangeMetadata = {
  type: 'ASSIGNMENT_AREA_CHANGE';
  reason: string;
  notify: string;
};

export type RequestMetadata = StatusChangeMetadata | PriorityChangeMetadata | AssignmentChangeMetadata | AssignmentAreaChangeMetadata;
