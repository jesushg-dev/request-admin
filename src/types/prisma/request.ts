import { Prisma } from '@prisma/client';

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

export type RequestDetailsType = {
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
};
