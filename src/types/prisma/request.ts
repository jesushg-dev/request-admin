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
